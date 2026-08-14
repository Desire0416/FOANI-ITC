'use server';

import { revalidatePath } from 'next/cache';
import { getPayload } from 'payload';
import config from '@payload-config';
import { candidatConnecte, dossierCourant } from '@/lib/candidat';
import { acheminerCode, emettreCode, empreinteDe, verifierCode } from '@/payload/code-unique';
import { ETATS_OFFRE_EN_COURS, limiteDepassee } from '@/payload/chaine';
import type { Candidature } from '@/payload-types';

/* ==========================================================================
   L'offre d'admission, côté candidat — Note complémentaire §5.1
   --------------------------------------------------------------------------
   Étapes 2 et 3 du parcours : accepter l'offre, puis annoncer le versement
   qui réserve la place.

   Ces deux gestes remplacent la signature au guichet et le passage à la
   caisse. Ils doivent donc en avoir la valeur : l'acceptation est confirmée
   par un code à usage unique et horodatée (RG-49) ; le versement n'a aucun
   effet tant qu'un agent ne l'a pas constaté (RG-58).

   Le dispositif n'encaisse rien. Il enregistre une référence, que le service
   des finances rapproche de son relevé.
   ========================================================================== */

export type Etat = { readonly message: string | null; readonly ok?: true; readonly code?: string };

/**
 * La référence de règlement d'une personne — §6.6.
 *
 * « Chaque personne dispose d'une référence de règlement propre, dérivée de
 * son numéro de dossier ou de son numéro étudiant. » Elle est dérivée et non
 * stockée : une valeur calculée ne peut pas diverger de son dossier, et un
 * versement effectué par un parent depuis son propre téléphone reste
 * rattachable.
 */
export async function referenceReglement(reference: string | null | undefined): Promise<string> {
  return reference ? `FITC-${reference}` : '—';
}

/* -------------------------------------------------------------------------- */

async function offreEnCours(): Promise<
  { readonly ok: true; readonly id: string | number; readonly dossier: Candidature }
  | { readonly ok: false; readonly etat: Etat }
> {
  const candidat = await candidatConnecte();
  if (!candidat) return { ok: false, etat: { message: 'Votre session a expiré. Reconnectez-vous.' } };

  const dossier = await dossierCourant(candidat.id);
  if (!dossier) return { ok: false, etat: { message: 'Aucun dossier ouvert.' } };

  if (!(ETATS_OFFRE_EN_COURS as readonly string[]).includes(dossier.etat)) {
    return { ok: false, etat: { message: 'Votre dossier n’attend pas d’acceptation.' } };
  }

  if (limiteDepassee(dossier.limiteAcceptation)) {
    return {
      ok: false,
      etat: {
        message:
          'Le délai d’acceptation de votre offre est dépassé. Contactez le service des admissions.',
      },
    };
  }

  return { ok: true, id: dossier.id, dossier };
}

/* --------------------------------------------------- Étape 2 : accepter */

/** Émet un code et l'achemine. Le code n'est jamais enregistré en clair. */
export async function demanderCode(): Promise<Etat> {
  const acces = await offreEnCours();
  if (!acces.ok) return acces.etat;

  const { code, empreinte, expire } = emettreCode();
  const payload = await getPayload({ config });

  try {
    await payload.update({
      collection: 'candidatures',
      id: acces.id,
      data: { codeEmpreinte: empreinte, codeExpire: expire, codeEssais: 0 } as never,
      overrideAccess: true,
    });
  } catch {
    return { message: 'Le code n’a pas pu être préparé. Réessayez dans un instant.' };
  }

  const acheminement = await acheminerCode(code, acces.dossier.telephone ?? null);

  if (acheminement.envoye) {
    return { ok: true, message: `Un code à six chiffres vient de partir vers ${acheminement.par}.` };
  }

  /* On ne prétend pas avoir envoyé. Le candidat doit savoir qu'il lui faut
     passer par le service des admissions, qui peut accepter pour son compte
     (§5.5, mode assisté). */
  return {
    message: `${acheminement.raison} Appelez le service des admissions : il peut enregistrer votre acceptation pour vous.`,
    ...(acheminement.codeVisible ? { code: acheminement.codeVisible } : {}),
  };
}

export async function accepterOffre(_precedent: Etat, donnees: FormData): Promise<Etat> {
  const acces = await offreEnCours();
  if (!acces.ok) return acces.etat;

  const saisi = String(donnees.get('code') ?? '').trim();
  if (!saisi) return { message: 'Saisissez le code reçu sur votre téléphone.' };

  const payload = await getPayload({ config });

  /* L'empreinte n'est pas lisible par les règles d'accès : on la relit avec
     `overrideAccess`, depuis le serveur, et elle ne quitte jamais celui-ci. */
  const brut = (await payload.findByID({
    collection: 'candidatures',
    id: acces.id,
    depth: 0,
    overrideAccess: true,
  })) as unknown as Record<string, unknown>;

  const verdict = verifierCode(saisi, {
    empreinte: brut.codeEmpreinte as string | null,
    expire: brut.codeExpire as string | null,
    essais: brut.codeEssais as number | null,
  });

  if (!verdict.ok) {
    // Chaque essai manqué est compté : un code ne se devine pas par insistance.
    await payload
      .update({
        collection: 'candidatures',
        id: acces.id,
        data: verdict.brule
          ? ({ codeEmpreinte: null, codeExpire: null, codeEssais: 0 } as never)
          : ({ codeEssais: ((brut.codeEssais as number | null) ?? 0) + 1 } as never),
        overrideAccess: true,
      })
      .catch(() => null);

    return { message: verdict.message };
  }

  try {
    await payload.update({
      collection: 'candidatures',
      id: acces.id,
      data: {
        etat: 'offre-acceptee',
        offreAccepteeLe: new Date().toISOString(),
        // Le code est brûlé : à usage unique, littéralement.
        codeEmpreinte: null,
        codeExpire: null,
        codeEssais: 0,
      } as never,
      overrideAccess: true,
      context: { auteurImpose: 'Candidat (code confirmé)' },
    });
  } catch {
    return { message: 'Votre acceptation n’a pas pu être enregistrée. Réessayez.' };
  }

  revalidatePath('/mon-dossier', 'layout');
  return { ok: true, message: 'Votre offre est acceptée. Il reste à régler les frais réservant votre place.' };
}

/** Refuser explicitement : la place est rendue sans attendre l'échéance. */
export async function declinerOffre(_precedent: Etat, _donnees: FormData): Promise<Etat> {
  const acces = await offreEnCours();
  if (!acces.ok) return acces.etat;

  const payload = await getPayload({ config });
  try {
    await payload.update({
      collection: 'candidatures',
      id: acces.id,
      data: { etat: 'desiste' } as never,
      overrideAccess: true,
      context: {
        auteurImpose: 'Candidat',
        motifTransition: 'Offre déclinée par le candidat. La place est libérée.',
      },
    });
  } catch {
    return { message: 'Votre réponse n’a pas pu être enregistrée.' };
  }

  revalidatePath('/mon-dossier', 'layout');
  return { ok: true, message: 'Votre réponse est enregistrée. Votre place est rendue.' };
}

/* ------------------------------------------- Étape 3 : annoncer le versement */

/**
 * Le candidat annonce son versement — RG-58.
 *
 * « Un versement annoncé n'a aucun effet tant qu'il n'a pas été constaté par
 * un agent. » L'annonce fait donc passer le dossier en « Versement annoncé »,
 * état dont le service des finances est propriétaire, et rien de plus.
 */
export async function annoncerVersement(_precedent: Etat, donnees: FormData): Promise<Etat> {
  const candidat = await candidatConnecte();
  if (!candidat) return { message: 'Votre session a expiré. Reconnectez-vous.' };

  const dossier = await dossierCourant(candidat.id);
  if (!dossier) return { message: 'Aucun dossier ouvert.' };

  if (dossier.etat !== 'offre-acceptee') {
    return { message: 'Votre dossier n’attend pas d’annonce de versement.' };
  }

  const reference = String(donnees.get('referenceTransaction') ?? '').trim();
  if (reference.length < 4) {
    return { message: 'Recopiez la référence que votre opérateur vous a envoyée.' };
  }

  const payload = await getPayload({ config });
  try {
    await payload.update({
      collection: 'candidatures',
      id: dossier.id,
      data: {
        referenceTransaction: reference,
        modeReglement: String(donnees.get('modeReglement') ?? 'mobile'),
        etat: 'versement-annonce',
      } as never,
      overrideAccess: true,
      context: { auteurImpose: 'Candidat' },
    });
  } catch {
    /* L'unicité de la référence est une contrainte de base (§10.2) : c'est
       elle qui départage deux personnes saisissant le même numéro. */
    return {
      message:
        'Cette référence est déjà enregistrée pour un autre dossier. Vérifiez le numéro sur le message de votre opérateur.',
    };
  }

  revalidatePath('/mon-dossier', 'layout');
  return {
    ok: true,
    message: 'Votre versement est annoncé. Le service des finances va le rapprocher de son relevé.',
  };
}

export { empreinteDe };
