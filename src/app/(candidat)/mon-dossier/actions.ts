'use server';

import { cookies as temoins } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getPayload } from 'payload';
import config from '@payload-config';
import { FORMATIONS } from '@/content/formations';
import { candidatConnecte, dossierCourant } from '@/lib/candidat';
import { dossierEnvoyable, dossierModifiable } from '@/lib/etapes-dossier';
import type { Candidature } from '@/payload-types';

/* ==========================================================================
   Actions du portail de candidature — CDC §10
   --------------------------------------------------------------------------
   Toutes suivent la même discipline :

   1. la session est relue sur le serveur, jamais reçue du formulaire ;
   2. le dossier visé est relu et sa propriété vérifiée — un identifiant
      envoyé par le navigateur ne désigne rien tant qu'on ne l'a pas rattaché
      au compte connecté ;
   3. l'état du dossier est contrôlé : un dossier soumis n'est plus modifiable
      par le candidat, quel que soit le formulaire renvoyé (§10.3) ;
   4. l'écriture passe par Payload avec `overrideAccess: false`, de sorte que
      les règles de la collection s'appliquent une seconde fois.

   Les messages d'erreur ne renseignent jamais sur l'existence d'un compte.
   ========================================================================== */

export type Etat = { readonly message: string | null; readonly champ?: string };

const RIEN: Etat = { message: null };

function texte(donnees: FormData, cle: string): string {
  return String(donnees.get(cle) ?? '').trim();
}

/** Identité Payload d'un candidat, pour appliquer ses propres droits. */
function commeCandidat(id: string) {
  return { id: Number(id), collection: 'candidats' } as never;
}

async function poserTemoin(token: string) {
  const payload = await getPayload({ config });
  const boite = await temoins();
  boite.set({
    name: `${payload.config.cookiePrefix}-token`,
    value: token,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    // Une semaine : un dossier se remplit rarement d'une traite, souvent
    // depuis un téléphone partagé ou une connexion intermittente (§10.1).
    maxAge: 60 * 60 * 24 * 7,
  });
}

/* ==========================================================================
   1. Le compte
   ========================================================================== */

export async function creerCompte(_precedent: Etat, donnees: FormData): Promise<Etat> {
  const identifiant = texte(donnees, 'identifiant');
  const courriel = texte(donnees, 'courriel');
  const motDePasse = String(donnees.get('motDePasse') ?? '');
  const confirmation = String(donnees.get('confirmation') ?? '');

  if (!identifiant) {
    return { message: 'Indiquez votre numéro de téléphone.', champ: 'identifiant' };
  }
  if (motDePasse.length < 8) {
    return { message: 'Choisissez un mot de passe d’au moins 8 caractères.', champ: 'motDePasse' };
  }
  if (motDePasse !== confirmation) {
    return { message: 'Les deux mots de passe ne sont pas identiques.', champ: 'confirmation' };
  }

  const payload = await getPayload({ config });

  try {
    await payload.create({
      collection: 'candidats',
      data: {
        username: identifiant,
        ...(courriel ? { email: courriel } : {}),
        telephone: identifiant,
        password: motDePasse,
      },
      overrideAccess: true,
    });
  } catch {
    // Le message reste le même que le compte existe déjà ou que la création
    // ait échoué pour une autre raison : on ne confirme l'existence d'aucun
    // compte à qui essaie des numéros au hasard.
    return {
      message:
        'Ce compte n’a pas pu être créé. Si vous en avez déjà un, connectez-vous ; sinon, réessayez dans un instant.',
    };
  }

  try {
    const resultat = await payload.login({
      collection: 'candidats',
      data: { username: identifiant, password: motDePasse },
    });
    if (resultat.token) await poserTemoin(resultat.token);
  } catch {
    // Le compte existe : on renvoie vers la connexion plutôt que d'échouer.
    redirect('/mon-dossier/connexion');
  }

  redirect('/mon-dossier');
}

export async function ouvrirSession(_precedent: Etat, donnees: FormData): Promise<Etat> {
  const identifiant = texte(donnees, 'identifiant');
  const motDePasse = String(donnees.get('motDePasse') ?? '');

  if (!identifiant || !motDePasse) {
    return { message: 'Renseignez votre identifiant et votre mot de passe.' };
  }

  const payload = await getPayload({ config });

  try {
    const resultat = await payload.login({
      collection: 'candidats',
      data: { username: identifiant, password: motDePasse },
    });
    if (!resultat.token) return { message: 'Identifiants incorrects.' };
    await poserTemoin(resultat.token);
  } catch {
    return { message: 'Identifiants incorrects, ou trop de tentatives. Réessayez dans un moment.' };
  }

  redirect('/mon-dossier');
}

export async function fermerSession(): Promise<void> {
  const payload = await getPayload({ config });
  const boite = await temoins();
  boite.delete(`${payload.config.cookiePrefix}-token`);
  redirect('/mon-dossier/connexion');
}

/* ==========================================================================
   2. Le dossier
   ========================================================================== */

/**
 * Ouvre le dossier, une fois le premier vœu connu.
 *
 * Le dossier n'est pas créé à la connexion mais à la validation de l'étape 1 :
 * le premier vœu est obligatoire en base, et l'y poser d'office — fût-ce
 * provisoirement — ferait passer l'étape pour faite et sauterait le choix de
 * formation. Un dossier existe donc à partir du moment où il porte une
 * demande réelle.
 *
 * Le numéro de dossier est attribué ici et ne change plus : c'est la référence
 * que le candidat citera dans tous ses échanges (§10.4).
 */
async function creerDossier(
  candidatId: string,
  voeux: { voeu1: string; voeu2: string | null; anneeEntree: string },
): Promise<Candidature> {
  const candidat = await candidatConnecte();
  const payload = await getPayload({ config });

  return payload.create({
    collection: 'candidatures',
    data: {
      etat: 'brouillon',
      candidat: Number(candidatId),
      voeu1: voeux.voeu1,
      voeu2: voeux.voeu2,
      anneeEntree: voeux.anneeEntree,
      telephone: candidat?.telephone ?? null,
      courriel: candidat?.courriel ?? null,
    } as never,
    overrideAccess: true,
  });
}

/** Relit le dossier du candidat connecté et vérifie qu'il est encore ouvert. */
async function dossierModifiableDuCandidat(): Promise<
  { readonly ok: true; readonly candidat: { id: string }; readonly dossier: Candidature } | { readonly ok: false; readonly etat: Etat }
> {
  const candidat = await candidatConnecte();
  if (!candidat) return { ok: false, etat: { message: 'Votre session a expiré. Reconnectez-vous.' } };

  const dossier = await dossierCourant(candidat.id);
  if (!dossier) return { ok: false, etat: { message: 'Aucun dossier ouvert.' } };

  if (!dossierModifiable(dossier)) {
    return {
      ok: false,
      etat: {
        message:
          'Votre dossier est en cours d’instruction : il n’est plus modifiable. Suivez son avancement depuis votre espace.',
      },
    };
  }

  return { ok: true, candidat, dossier };
}

async function enregistrer(
  dossier: Candidature,
  candidatId: string,
  data: Record<string, unknown>,
): Promise<Etat> {
  const payload = await getPayload({ config });
  try {
    await payload.update({
      collection: 'candidatures',
      id: dossier.id,
      data: data as never,
      overrideAccess: false,
      user: commeCandidat(candidatId),
    });
  } catch {
    return { message: 'L’enregistrement n’a pas abouti. Réessayez.' };
  }
  revalidatePath('/mon-dossier', 'layout');
  return RIEN;
}

/* ------------------------------------------------------------- Étape 1 */

const SLUGS = new Set(FORMATIONS.map((formation) => formation.slug));

export async function enregistrerVoeux(_precedent: Etat, donnees: FormData): Promise<Etat> {
  const candidat = await candidatConnecte();
  if (!candidat) return { message: 'Votre session a expiré. Reconnectez-vous.' };

  const voeu1 = texte(donnees, 'voeu1');
  const voeu2 = texte(donnees, 'voeu2');

  if (!SLUGS.has(voeu1)) {
    return { message: 'Choisissez votre premier choix de formation.', champ: 'voeu1' };
  }
  if (voeu2 && !SLUGS.has(voeu2)) {
    return { message: 'Ce second choix n’existe pas au catalogue.', champ: 'voeu2' };
  }
  if (voeu2 && voeu2 === voeu1) {
    return { message: 'Le second choix doit être différent du premier.', champ: 'voeu2' };
  }

  const voeux = {
    voeu1,
    voeu2: voeu2 || null,
    anneeEntree: texte(donnees, 'anneeEntree') || '2026-2027',
  };

  const existant = await dossierCourant(candidat.id);

  // Première visite : c'est ce formulaire qui ouvre le dossier.
  if (!existant) {
    try {
      await creerDossier(candidat.id, voeux);
    } catch {
      return { message: 'Votre dossier n’a pas pu être ouvert. Réessayez dans un instant.' };
    }
    revalidatePath('/mon-dossier', 'layout');
    redirect('/mon-dossier/identite');
  }

  if (!dossierModifiable(existant)) {
    return {
      message:
        'Votre dossier est en cours d’instruction : il n’est plus modifiable. Suivez son avancement depuis votre espace.',
    };
  }

  const resultat = await enregistrer(existant, candidat.id, voeux);
  if (resultat.message) return resultat;

  redirect('/mon-dossier/identite');
}

/* ------------------------------------------------------------- Étape 2 */

export async function enregistrerIdentite(_precedent: Etat, donnees: FormData): Promise<Etat> {
  const acces = await dossierModifiableDuCandidat();
  if (!acces.ok) return acces.etat;

  const nom = texte(donnees, 'nom');
  const prenoms = texte(donnees, 'prenoms');
  const telephone = texte(donnees, 'telephone');

  if (!nom) return { message: 'Indiquez votre nom.', champ: 'nom' };
  if (!prenoms) return { message: 'Indiquez vos prénoms.', champ: 'prenoms' };
  if (!telephone) return { message: 'Indiquez un numéro où vous joindre.', champ: 'telephone' };

  const dateNaissance = texte(donnees, 'dateNaissance');
  const courriel = texte(donnees, 'courriel');

  const resultat = await enregistrer(acces.dossier, acces.candidat.id, {
    nom,
    prenoms,
    dateNaissance: dateNaissance ? new Date(dateNaissance).toISOString() : null,
    lieuNaissance: texte(donnees, 'lieuNaissance') || null,
    nationalite: texte(donnees, 'nationalite') || null,
    telephone,
    courriel: courriel || null,
    contactNom: texte(donnees, 'contactNom') || null,
    contactLien: texte(donnees, 'contactLien') || null,
    contactTelephone: texte(donnees, 'contactTelephone') || null,
  });
  if (resultat.message) return resultat;

  redirect('/mon-dossier/scolarite');
}

/* ------------------------------------------------------------- Étape 3 */

const SITUATIONS = new Set(['reprise', 'salarie', 'hebergement']);

export async function enregistrerScolarite(_precedent: Etat, donnees: FormData): Promise<Etat> {
  const acces = await dossierModifiableDuCandidat();
  if (!acces.ok) return acces.etat;

  const situation = donnees
    .getAll('situation')
    .map((valeur) => String(valeur))
    .filter((valeur) => SITUATIONS.has(valeur));

  const resultat = await enregistrer(acces.dossier, acces.candidat.id, {
    serieBac: texte(donnees, 'serieBac') || null,
    anneeBac: texte(donnees, 'anneeBac') || null,
    mentionBac: texte(donnees, 'mentionBac') || null,
    etablissementOrigine: texte(donnees, 'etablissementOrigine') || null,
    situation,
  });
  if (resultat.message) return resultat;

  redirect('/mon-dossier/pieces');
}

/* ------------------------------------------------------------- Étape 4 */

const NATURES = new Set(['identite', 'releve', 'diplome', 'photo', 'autre']);
/** 8 Mo : au-delà, une photographie de téléphone n'apporte plus de lisibilité. */
const POIDS_MAXIMAL = 8 * 1024 * 1024;
const TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'application/pdf']);

export async function deposerPiece(_precedent: Etat, donnees: FormData): Promise<Etat> {
  const acces = await dossierModifiableDuCandidat();
  if (!acces.ok) return acces.etat;

  const fichier = donnees.get('fichier');
  if (!(fichier instanceof File) || fichier.size === 0) {
    return { message: 'Choisissez un fichier à déposer.', champ: 'fichier' };
  }
  if (fichier.size > POIDS_MAXIMAL) {
    return { message: 'Ce fichier dépasse 8 Mo. Reprenez la photo en qualité normale.', champ: 'fichier' };
  }
  if (!TYPES.has(fichier.type)) {
    return { message: 'Déposez une photo (JPG, PNG, WEBP, HEIC) ou un PDF.', champ: 'fichier' };
  }

  const nature = texte(donnees, 'nature');
  if (!NATURES.has(nature)) return { message: 'Indiquez la nature du document.', champ: 'nature' };

  const payload = await getPayload({ config });

  try {
    const piece = await payload.create({
      collection: 'pieces',
      data: { nature, deposePar: Number(acces.candidat.id) } as never,
      file: {
        data: Buffer.from(await fichier.arrayBuffer()),
        name: fichier.name,
        mimetype: fichier.type,
        size: fichier.size,
      },
      overrideAccess: true,
    });

    await payload.update({
      collection: 'candidatures',
      id: acces.dossier.id,
      data: {
        pieces: [
          ...(acces.dossier.pieces ?? []).map((ligne) => ({
            fichier: typeof ligne.fichier === 'object' ? ligne.fichier.id : ligne.fichier,
            etatPiece: ligne.etatPiece,
            motif: ligne.motif,
          })),
          { fichier: piece.id, etatPiece: 'attente' },
        ],
      } as never,
      overrideAccess: true,
    });
  } catch {
    return { message: 'Le dépôt n’a pas abouti. Vérifiez votre connexion et réessayez.' };
  }

  revalidatePath('/mon-dossier', 'layout');
  return RIEN;
}

/**
 * Retire une pièce de la liste du dossier.
 *
 * Le fichier lui-même n'est pas effacé (§10.3 : rien n'est supprimé, ce qui
 * laisse une trace exploitable en cas de litige) ; il cesse simplement d'être
 * rattaché au dossier. Une pièce déjà examinée par l'établissement ne peut
 * plus être retirée.
 */
export async function retirerPiece(_precedent: Etat, donnees: FormData): Promise<Etat> {
  const acces = await dossierModifiableDuCandidat();
  if (!acces.ok) return acces.etat;

  const rang = Number(texte(donnees, 'rang'));
  const lignes = acces.dossier.pieces ?? [];
  const ligne = lignes[rang];

  if (!ligne) return { message: 'Cette pièce n’est plus dans votre dossier.' };
  if (ligne.etatPiece === 'acceptee') {
    return { message: 'Cette pièce a déjà été acceptée : elle ne peut plus être retirée.' };
  }

  const payload = await getPayload({ config });
  try {
    await payload.update({
      collection: 'candidatures',
      id: acces.dossier.id,
      data: {
        pieces: lignes
          .filter((_, index) => index !== rang)
          .map((restante) => ({
            fichier: typeof restante.fichier === 'object' ? restante.fichier.id : restante.fichier,
            etatPiece: restante.etatPiece,
            motif: restante.motif,
          })),
      } as never,
      overrideAccess: true,
    });
  } catch {
    return { message: 'Le retrait n’a pas abouti. Réessayez.' };
  }

  revalidatePath('/mon-dossier', 'layout');
  return RIEN;
}

/* ------------------------------------------------------------- Étape 5 */

const MODES = new Set(['mobile', 'guichet', 'virement']);

export async function enregistrerFrais(_precedent: Etat, donnees: FormData): Promise<Etat> {
  const acces = await dossierModifiableDuCandidat();
  if (!acces.ok) return acces.etat;

  const reference = texte(donnees, 'referenceTransaction');
  const mode = texte(donnees, 'modeReglement');

  if (!reference) {
    return { message: 'Recopiez la référence que votre opérateur vous a envoyée.', champ: 'referenceTransaction' };
  }

  const payload = await getPayload({ config });

  try {
    await payload.update({
      collection: 'candidatures',
      id: acces.dossier.id,
      data: {
        referenceTransaction: reference,
        modeReglement: MODES.has(mode) ? mode : 'mobile',
      } as never,
      overrideAccess: true,
    });
  } catch {
    // L'unicité de la référence est une contrainte de base (§10.2) : c'est
    // elle qui départage deux candidats saisissant le même numéro, et c'est
    // son rejet que l'on traduit ici.
    return {
      message:
        'Cette référence est déjà enregistrée pour un autre dossier. Vérifiez le numéro sur le message de votre opérateur.',
      champ: 'referenceTransaction',
    };
  }

  revalidatePath('/mon-dossier', 'layout');
  redirect('/mon-dossier/recapitulatif');
}

/* ------------------------------------------------------------- Étape 6 */

/**
 * Envoi définitif.
 *
 * Le passage de « brouillon » à « soumis » n'est pas laissé au candidat sur
 * le champ `etat` — la collection le lui interdit. Il est fait ici, après un
 * contrôle serveur de complétude qui ne fait pas confiance à ce que l'écran
 * précédent affichait.
 */
export async function soumettreDossier(_precedent: Etat, _donnees: FormData): Promise<Etat> {
  const acces = await dossierModifiableDuCandidat();
  if (!acces.ok) return acces.etat;

  if (!dossierEnvoyable(acces.dossier)) {
    return { message: 'Votre dossier est incomplet. Les éléments manquants sont listés ci-dessous.' };
  }

  const payload = await getPayload({ config });
  try {
    await payload.update({
      collection: 'candidatures',
      id: acces.dossier.id,
      data: { etat: 'soumis', soumisLe: new Date().toISOString() } as never,
      overrideAccess: true,
    });
  } catch {
    return { message: 'L’envoi n’a pas abouti. Réessayez dans un instant.' };
  }

  revalidatePath('/mon-dossier', 'layout');
  redirect('/mon-dossier/suivi?envoye=1');
}
