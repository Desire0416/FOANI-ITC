'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getPayload } from 'payload';
import config from '@payload-config';
import { candidatConnecte, dossierCourant } from '@/lib/candidat';
import { empreinteDuFichier, empreinteSignature } from '@/payload/empreintes';
import { acheminerCode, emettreCode, verifierCode } from '@/payload/code-unique';
import { REGLEMENTS, VERSION_REGLEMENTS } from '@/content/reglements';
import { inscriptionEnvoyable } from '@/lib/etapes-inscription';
import {
  ETAPES_INSCRIPTION,
  inscriptionModifiable,
  type IdEtapeInscription,
} from '@/lib/etapes-inscription';
import type { Candidature } from '@/payload-types';

/* ==========================================================================
   Actions du dossier d'inscription — Note complémentaire §5.1, étape 4
   --------------------------------------------------------------------------
   Même discipline que les actions de la candidature : la session est relue
   sur le serveur, le dossier est relu et sa propriété vérifiée, et l'état est
   contrôlé avant toute écriture.

   Un contrôle de plus, propre à cette étape : le dossier d'inscription ne
   s'ouvre qu'après réservation de la place. Un candidat qui devinerait
   l'adresse avant d'avoir réglé ne doit pas pouvoir écrire — non par méfiance,
   mais parce que la chaîne (RG-41) interdit qu'une étape en saute une autre,
   et qu'un dossier rempli hors de son état devient impossible à situer pour
   l'agent qui le reprend.

   Sur ce qui est écrit tel quel : l'état civil est recopié depuis un acte, et
   c'est cette graphie qui sera imprimée. On ne normalise donc ni la casse, ni
   les apostrophes, ni les accents. Un « N'Guessan » saisi avec une apostrophe
   typographique reste tel quel : c'est ce qui figure sur la pièce, et c'est ce
   que le guichet destinataire comparera.
   ========================================================================== */

export type Etat = { readonly message: string | null; readonly champ?: string };

const RIEN: Etat = { message: null };

function texte(donnees: FormData, cle: string): string {
  return String(donnees.get(cle) ?? '').trim();
}

/** `null` plutôt que chaîne vide : une valeur absente doit se lire comme telle. */
function ouRien(donnees: FormData, cle: string): string | null {
  return texte(donnees, cle) || null;
}

type Acces =
  | { readonly ok: true; readonly candidat: { id: string }; readonly dossier: Candidature }
  | { readonly ok: false; readonly etat: Etat };

async function dossierOuvert(): Promise<Acces> {
  const candidat = await candidatConnecte();
  if (!candidat) return { ok: false, etat: { message: 'Votre session a expiré. Reconnectez-vous.' } };

  const dossier = await dossierCourant(candidat.id);
  if (!dossier) return { ok: false, etat: { message: 'Aucun dossier ouvert.' } };

  if (!inscriptionModifiable(dossier)) {
    return {
      ok: false,
      etat: {
        message:
          'Votre dossier d’inscription n’est pas ouvert à la saisie. Il l’est une fois votre place réservée, et jusqu’à son envoi à la scolarité.',
      },
    };
  }

  return { ok: true, candidat, dossier };
}

/**
 * Écrit, puis renvoie à l'étape suivante.
 *
 * L'enchaînement se fait ici plutôt que dans chaque écran : c'est la seule
 * façon d'être sûr qu'une étape ajoutée demain s'insère au bon endroit sans
 * qu'on ait à corriger cinq redirections.
 */
async function enregistrer(
  etape: IdEtapeInscription,
  donnees: Record<string, unknown>,
): Promise<Etat | never> {
  const acces = await dossierOuvert();
  if (!acces.ok) return acces.etat;

  const payload = await getPayload({ config });

  try {
    await payload.update({
      collection: 'candidatures',
      id: acces.dossier.id,
      data: donnees as never,
      overrideAccess: true,
      context: { auteurImpose: 'Candidat' },
    });
  } catch {
    return { message: 'L’enregistrement n’a pas abouti. Réessayez.' };
  }

  revalidatePath('/mon-dossier', 'layout');

  const rang = ETAPES_INSCRIPTION.findIndex((item) => item.id === etape);
  const suivante = ETAPES_INSCRIPTION[rang + 1];
  redirect(suivante ? suivante.href : '/mon-dossier/inscription');
}

/* ------------------------------------------------------------- État civil */

export async function enregistrerEtatCivil(_precedent: Etat, donnees: FormData): Promise<Etat> {
  const nom = texte(donnees, 'nomActe');
  const prenoms = texte(donnees, 'prenomsActe');

  if (!nom || !prenoms) {
    return {
      message: 'Recopiez votre nom et vos prénoms exactement comme ils figurent sur votre acte.',
      champ: 'nomActe',
    };
  }

  /* On refuse les chiffres, pas les apostrophes : les patronymes ivoiriens en
     comportent couramment — N'Guessan, N'Dri —, de même que des tirets et des
     accents. Un contrôle trop strict rejette de vrais noms. */
  if (/\d/.test(nom) || /\d/.test(prenoms)) {
    return { message: 'Un nom ne comporte pas de chiffre. Vérifiez votre saisie.', champ: 'nomActe' };
  }

  const second = texte(donnees, 'telephoneSecond');
  if (second && second.replace(/\D/g, '').length === 8) {
    return {
      message:
        'Ce numéro est à l’ancien format à huit chiffres. Les numéros ivoiriens en comptent dix depuis 2021.',
      champ: 'telephoneSecond',
    };
  }

  return enregistrer('etat-civil', {
    sexe: ouRien(donnees, 'sexe'),
    nomActe: nom,
    prenomsActe: prenoms,
    prenomUsuel: ouRien(donnees, 'prenomUsuel'),
    paysNaissance: ouRien(donnees, 'paysNaissance'),
    lieuNaissanceActe: ouRien(donnees, 'lieuNaissanceActe'),
    natureActe: ouRien(donnees, 'natureActe'),
    numeroActe: ouRien(donnees, 'numeroActe'),
    dateActe: texte(donnees, 'dateActe') ? new Date(texte(donnees, 'dateActe')).toISOString() : null,
    centreActe: ouRien(donnees, 'centreActe'),
    situationMatrimoniale: ouRien(donnees, 'situationMatrimoniale'),
    naturePieceIdentite: ouRien(donnees, 'naturePieceIdentite'),
    numeroPieceIdentite: ouRien(donnees, 'numeroPieceIdentite'),
    telephoneSecond: second || null,
    numeroCmu: ouRien(donnees, 'numeroCmu'),
  });
}

/* --------------------------------------------------------------- Filiation */

export async function enregistrerFiliation(_precedent: Etat, donnees: FormData): Promise<Etat> {
  return enregistrer('filiation', {
    pereNom: ouRien(donnees, 'pereNom'),
    pereSituation: ouRien(donnees, 'pereSituation'),
    mereNom: ouRien(donnees, 'mereNom'),
    mereSituation: ouRien(donnees, 'mereSituation'),
    repondantNom: ouRien(donnees, 'repondantNom'),
    repondantLien: ouRien(donnees, 'repondantLien'),
    repondantTelephone: ouRien(donnees, 'repondantTelephone'),
  });
}

/* --------------------------------------------------------------- Résidence */

export async function enregistrerResidence(_precedent: Etat, donnees: FormData): Promise<Etat> {
  return enregistrer('residence', {
    residenceVille: ouRien(donnees, 'residenceVille'),
    residenceQuartier: ouRien(donnees, 'residenceQuartier'),
    residenceRepere: ouRien(donnees, 'residenceRepere'),
    hebergement: ouRien(donnees, 'hebergement'),
    demandeLogement: ouRien(donnees, 'demandeLogement'),
    parentsVille: ouRien(donnees, 'parentsVille'),
    parentsPays: ouRien(donnees, 'parentsPays'),
  });
}

/* ------------------------------------------------------- Personne à prévenir */

export async function enregistrerUrgence(_precedent: Etat, donnees: FormData): Promise<Etat> {
  return enregistrer('urgence', {
    urgenceNom: ouRien(donnees, 'urgenceNom'),
    urgenceLien: ouRien(donnees, 'urgenceLien'),
    urgenceTelephone: ouRien(donnees, 'urgenceTelephone'),
    urgenceTelephoneSecond: ouRien(donnees, 'urgenceTelephoneSecond'),
    urgenceVille: ouRien(donnees, 'urgenceVille'),
    urgenceQuartier: ouRien(donnees, 'urgenceQuartier'),
  });
}

/* ------------------------------------------------------------ Photographie */

const POIDS_PHOTO = 4 * 1024 * 1024;

/**
 * Dépose la photographie d'identité.
 *
 * Le consentement est horodaté à la seconde du dépôt, avec la photographie
 * elle-même : une base de traitement qui ne dit pas quand elle a été donnée
 * n'en est pas une. Redéposer une photographie redonne le consentement, ce
 * qui est cohérent — c'est un nouveau cliché.
 */
export async function deposerPhoto(_precedent: Etat, donnees: FormData): Promise<Etat> {
  const acces = await dossierOuvert();
  if (!acces.ok) return acces.etat;

  const fichier = donnees.get('photo');
  if (!(fichier instanceof File) || fichier.size === 0) {
    return { message: 'Choisissez ou prenez une photographie.', champ: 'photo' };
  }
  if (fichier.size > POIDS_PHOTO) {
    return { message: 'Cette image dépasse 4 Mo. Reprenez la photographie.', champ: 'photo' };
  }
  if (!fichier.type.startsWith('image/')) {
    return { message: 'Déposez une image, pas un document.', champ: 'photo' };
  }
  if (donnees.get('consentement') !== 'oui') {
    return {
      message: 'Cochez votre accord pour l’impression de la photographie sur votre carte.',
      champ: 'consentement',
    };
  }

  const payload = await getPayload({ config });
  const octets = Buffer.from(await fichier.arrayBuffer());

  try {
    const piece = await payload.create({
      collection: 'pieces',
      data: {
        nature: 'photo',
        deposePar: Number(acces.candidat.id),
        empreinte: empreinteDuFichier(octets),
      } as never,
      file: {
        data: octets,
        name: fichier.name,
        mimetype: fichier.type,
        size: fichier.size,
      },
      overrideAccess: true,
    });

    await payload.update({
      collection: 'candidatures',
      id: acces.dossier.id,
      data: { photo: piece.id, photoConsentieLe: new Date().toISOString() } as never,
      overrideAccess: true,
      context: { auteurImpose: 'Candidat' },
    });
  } catch {
    return { message: 'Le dépôt n’a pas abouti. Vérifiez votre connexion et réessayez.' };
  }

  revalidatePath('/mon-dossier', 'layout');
  return RIEN;
}

/* -------------------------------------------------- Vérification d'identité */

/** Les trois clichés de l'étape 5, et le champ du dossier que chacun remplit. */
const CLICHES = {
  recto: 'pieceRecto',
  verso: 'pieceVerso',
  selfie: 'pieceSelfie',
} as const;

export type Cliche = keyof typeof CLICHES;

/**
 * Dépose l'un des trois clichés de la pièce d'identité — §5.1, étape 5.
 *
 * « Le candidat photographie sa pièce d'identité recto et verso, puis se
 * photographie tenant cette pièce. »
 *
 * L'empreinte du fichier est calculée et conservée (§5.4) : c'est elle qui
 * permettra de repérer le même document déposé dans deux dossiers distincts.
 * Elle est prise sur les octets reçus, avant tout traitement d'image par
 * Payload, pour attester de ce que le candidat a effectivement envoyé.
 */
export async function deposerCliche(_precedent: Etat, donnees: FormData): Promise<Etat> {
  const acces = await dossierOuvert();
  if (!acces.ok) return acces.etat;

  const cliche = String(donnees.get('cliche') ?? '') as Cliche;
  if (!(cliche in CLICHES)) return { message: 'Cliché inconnu.' };

  const fichier = donnees.get('fichier');
  if (!(fichier instanceof File) || fichier.size === 0) {
    return { message: 'Choisissez ou prenez une photographie.', champ: 'fichier' };
  }
  if (fichier.size > POIDS_PHOTO) {
    return { message: 'Cette image dépasse 4 Mo. Reprenez la photographie.', champ: 'fichier' };
  }
  if (!fichier.type.startsWith('image/')) {
    return { message: 'Déposez une image, pas un document.', champ: 'fichier' };
  }

  const payload = await getPayload({ config });

  try {
    const octets = Buffer.from(await fichier.arrayBuffer());

    const piece = await payload.create({
      collection: 'pieces',
      data: {
        nature: 'identite',
        deposePar: Number(acces.candidat.id),
        empreinte: empreinteDuFichier(octets),
      } as never,
      file: {
        data: octets,
        name: fichier.name,
        mimetype: fichier.type,
        size: fichier.size,
      },
      overrideAccess: true,
    });

    await payload.update({
      collection: 'candidatures',
      id: acces.dossier.id,
      data: { [CLICHES[cliche]]: piece.id, identiteControle: 'attente' } as never,
      overrideAccess: true,
      context: { auteurImpose: 'Candidat' },
    });
  } catch {
    return { message: 'Le dépôt n’a pas abouti. Vérifiez votre connexion et réessayez.' };
  }

  revalidatePath('/mon-dossier', 'layout');
  return RIEN;
}

/** Retire un cliché, pour le reprendre. */
export async function retirerCliche(cliche: Cliche): Promise<Etat> {
  const acces = await dossierOuvert();
  if (!acces.ok) return acces.etat;
  if (!(cliche in CLICHES)) return { message: 'Cliché inconnu.' };

  const payload = await getPayload({ config });
  try {
    await payload.update({
      collection: 'candidatures',
      id: acces.dossier.id,
      data: { [CLICHES[cliche]]: null } as never,
      overrideAccess: true,
      context: { auteurImpose: 'Candidat' },
    });
  } catch {
    return { message: 'Le retrait n’a pas abouti. Réessayez.' };
  }

  revalidatePath('/mon-dossier', 'layout');
  return RIEN;
}

/* ------------------------------------- Signature des engagements (§5.1, ét. 6) */

export type EtatSignature = {
  readonly message: string | null;
  readonly ok?: true;
  readonly code?: string;
};

/**
 * Émet le code qui vaudra signature.
 *
 * « Il signe électroniquement : case d'acceptation explicite, puis code à
 * usage unique reçu sur son téléphone. » Les deux gestes comptent : la case
 * marque le consentement, le code atteste que celui qui consent est bien le
 * titulaire du numéro. L'un sans l'autre ne signe rien.
 */
export async function demanderCodeSignature(): Promise<EtatSignature> {
  const acces = await dossierOuvert();
  if (!acces.ok) return acces.etat;

  const { code, empreinte, expire } = emettreCode();
  const payload = await getPayload({ config });

  try {
    await payload.update({
      collection: 'candidatures',
      id: acces.dossier.id,
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

  return {
    message: `${acheminement.raison} Appelez le service de la scolarité : il peut recueillir votre signature pour votre compte.`,
    ...(acheminement.codeVisible ? { code: acheminement.codeVisible } : {}),
  };
}

/**
 * Appose la signature — Note complémentaire §5.1, étape 6.
 *
 * « Le dispositif conserve le document signé, la date, l'heure et l'empreinte
 * technique de la signature. »
 *
 * L'empreinte porte sur le texte intégral tel qu'il a été affiché, sur
 * l'identité du signataire et sur l'horodatage. C'est ce qui rend la signature
 * opposable sans conserver une copie du texte pour chaque étudiant : le texte
 * est reconstituable depuis sa version, et l'empreinte prouve qu'il n'a pas
 * bougé entre l'affichage et la signature.
 *
 * « Pour un candidat mineur, la signature est apposée par le représentant
 * légal, sur son propre téléphone. » Le signataire est donc un champ, et non
 * une déduction : c'est lui qui figure sur l'engagement.
 */
export async function signerEngagements(
  _precedent: EtatSignature,
  donnees: FormData,
): Promise<EtatSignature> {
  const acces = await dossierOuvert();
  if (!acces.ok) return acces.etat;

  if (donnees.get('lu') !== 'oui' || donnees.get('accepte') !== 'oui') {
    return {
      message: 'Cochez les deux cases : avoir pris connaissance des textes, et les accepter.',
    };
  }

  const signataire = texte(donnees, 'signataire');
  if (signataire.length < 3) {
    return { message: 'Indiquez le nom et les prénoms du signataire.' };
  }

  const saisi = texte(donnees, 'code');
  if (!saisi) return { message: 'Saisissez le code reçu sur votre téléphone.' };

  const payload = await getPayload({ config });

  const brut = (await payload.findByID({
    collection: 'candidatures',
    id: acces.dossier.id,
    depth: 0,
    overrideAccess: true,
  })) as unknown as Record<string, unknown>;

  const verdict = verifierCode(saisi, {
    empreinte: brut.codeEmpreinte as string | null,
    expire: brut.codeExpire as string | null,
    essais: brut.codeEssais as number | null,
  });

  if (!verdict.ok) {
    await payload
      .update({
        collection: 'candidatures',
        id: acces.dossier.id,
        data: verdict.brule
          ? ({ codeEmpreinte: null, codeExpire: null, codeEssais: 0 } as never)
          : ({ codeEssais: ((brut.codeEssais as number | null) ?? 0) + 1 } as never),
        overrideAccess: true,
      })
      .catch(() => null);
    return { message: verdict.message };
  }

  const horodatage = new Date().toISOString();
  const empreinte = empreinteSignature({
    version: VERSION_REGLEMENTS,
    textes: REGLEMENTS,
    signataire,
    dossier: String(acces.dossier.reference ?? acces.dossier.id),
    horodatage,
  });

  try {
    await payload.update({
      collection: 'candidatures',
      id: acces.dossier.id,
      data: {
        engagementsSignesLe: horodatage,
        engagementsSignataire: signataire,
        engagementsVersion: VERSION_REGLEMENTS,
        engagementsEmpreinte: empreinte,
        codeEmpreinte: null,
        codeExpire: null,
        codeEssais: 0,
      } as never,
      overrideAccess: true,
      context: { auteurImpose: 'Candidat (signature confirmée)' },
    });
  } catch {
    return { message: 'Votre signature n’a pas pu être enregistrée. Réessayez.' };
  }

  revalidatePath('/mon-dossier', 'layout');
  return { ok: true, message: 'Vos engagements sont signés.' };
}

/* ------------------------------------- Envoi à la scolarité (§5.1, étape 7) */

/**
 * Soumet le dossier d'inscription au service de la scolarité.
 *
 * Rien ne part tant que les sept étapes ne sont pas accomplies et que
 * l'identité n'a pas été contrôlée. Ce dernier point n'est pas une précaution
 * de confort : le §4.8 exige « deux regards successifs sur un même dossier,
 * dont l'un porte spécifiquement sur les pièces », et laisser partir une
 * inscription sans contrôle d'identité reviendrait à n'en avoir qu'un.
 */
export async function soumettreInscription(_precedent: Etat, _donnees: FormData): Promise<Etat> {
  const acces = await dossierOuvert();
  if (!acces.ok) return acces.etat;

  if (!inscriptionEnvoyable(acces.dossier)) {
    return { message: 'Votre dossier n’est pas complet. Reprenez les étapes signalées.' };
  }

  const controle = (acces.dossier as unknown as Record<string, unknown>).identiteControle;
  if (controle !== 'conforme') {
    return {
      message:
        'Votre identité n’a pas encore été vérifiée par le service de la scolarité. Votre dossier partira dès que ce contrôle aura été fait.',
    };
  }

  const payload = await getPayload({ config });
  try {
    await payload.update({
      collection: 'candidatures',
      id: acces.dossier.id,
      data: {
        etat: 'inscription-a-valider',
        inscriptionCompleteeLe: new Date().toISOString(),
      } as never,
      overrideAccess: true,
      context: { auteurImpose: 'Candidat' },
    });
  } catch {
    return { message: 'L’envoi n’a pas abouti. Réessayez.' };
  }

  revalidatePath('/mon-dossier', 'layout');
  redirect('/mon-dossier?inscription=envoyee');
}

/** Retire la photographie, et avec elle le consentement qui la portait. */
export async function retirerPhoto(): Promise<Etat> {
  const acces = await dossierOuvert();
  if (!acces.ok) return acces.etat;

  const payload = await getPayload({ config });
  try {
    await payload.update({
      collection: 'candidatures',
      id: acces.dossier.id,
      data: { photo: null, photoConsentieLe: null } as never,
      overrideAccess: true,
      context: { auteurImpose: 'Candidat' },
    });
  } catch {
    return { message: 'Le retrait n’a pas abouti. Réessayez.' };
  }

  revalidatePath('/mon-dossier', 'layout');
  return RIEN;
}
