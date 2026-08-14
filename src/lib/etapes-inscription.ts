import type { Candidature } from '@/payload-types';

/* ==========================================================================
   Les étapes du dossier d'inscription — Note complémentaire §5.1, étape 4
   --------------------------------------------------------------------------
   Un second rail, distinct de celui de la candidature. Ce n'est pas une
   duplication : les deux dossiers ne recueillent pas la même chose, ne
   s'ouvrent pas au même moment, et ne se modifient pas dans les mêmes états.
   Un rail unique de douze étapes, dont six éteintes pendant des semaines,
   serait illisible.

   Comme pour la candidature, aucune étape n'est verrouillée : on ne force pas
   l'ordre à quelqu'un qui n'a pas la pièce sous la main au moment où il
   commence. Ce qui manque est dit, à chaque écran.
   ========================================================================== */

export type IdEtapeInscription = 'etat-civil' | 'filiation' | 'residence' | 'urgence' | 'photo';

export type EtapeInscription = {
  readonly id: IdEtapeInscription;
  readonly numero: number;
  readonly libelle: string;
  readonly resume: string;
  readonly href: string;
};

export const ETAPES_INSCRIPTION: readonly EtapeInscription[] = [
  {
    id: 'etat-civil',
    numero: 1,
    libelle: 'Votre état civil',
    resume: 'Tel qu’il figure sur votre acte de naissance.',
    href: '/mon-dossier/inscription/etat-civil',
  },
  {
    id: 'filiation',
    numero: 2,
    libelle: 'Votre filiation',
    resume: 'Vos parents, et la personne qui répond de vous.',
    href: '/mon-dossier/inscription/filiation',
  },
  {
    id: 'residence',
    numero: 3,
    libelle: 'Où vous vivrez',
    resume: 'Votre logement pendant l’année, et celui de vos parents.',
    href: '/mon-dossier/inscription/residence',
  },
  {
    id: 'urgence',
    numero: 4,
    libelle: 'Qui prévenir',
    resume: 'La personne à joindre en cas d’urgence.',
    href: '/mon-dossier/inscription/urgence',
  },
  {
    id: 'photo',
    numero: 5,
    libelle: 'Votre photographie',
    resume: 'Le portrait qui figurera sur votre carte étudiant.',
    href: '/mon-dossier/inscription/photo',
  },
];

/* --------------------------------------------------------------------------
   Ce qui manque
   -------------------------------------------------------------------------- */

function vide(valeur: unknown): boolean {
  return valeur === null || valeur === undefined || String(valeur).trim() === '';
}

/**
 * Les manques d'une étape, nommés comme le candidat les lit à l'écran.
 *
 * La référence de l'acte de naissance n'y figure pas, délibérément : exiger
 * un numéro d'extrait comme condition de validation écarterait les étudiants
 * dont l'état civil n'est pas constitué — ceux, précisément, que la
 * dématérialisation devrait cesser de renvoyer au guichet. La nature de la
 * pièce, elle, est demandée, parce qu'elle dit à la scolarité quel document
 * attendre, jugement supplétif compris.
 */
export function manquesInscription(
  etape: IdEtapeInscription,
  dossier: Candidature,
): readonly string[] {
  const d = dossier as unknown as Record<string, unknown>;
  const absents: string[] = [];

  if (etape === 'etat-civil') {
    if (vide(d.sexe)) absents.push('votre sexe');
    if (vide(d.nomActe)) absents.push('votre nom tel qu’il figure sur l’acte');
    if (vide(d.prenomsActe)) absents.push('vos prénoms complets');
    if (vide(d.paysNaissance)) absents.push('votre pays de naissance');
    if (vide(d.lieuNaissanceActe)) absents.push('votre lieu de naissance');
    if (vide(d.natureActe)) absents.push('la nature de votre pièce d’état civil');
    if (vide(d.situationMatrimoniale)) absents.push('votre situation matrimoniale');
    if (vide(d.naturePieceIdentite)) absents.push('la nature de votre pièce d’identité');
    if (vide(d.numeroPieceIdentite)) absents.push('le numéro de votre pièce d’identité');
  }

  if (etape === 'filiation') {
    if (vide(d.pereNom) || vide(d.pereSituation)) absents.push('votre père');
    if (vide(d.mereNom) || vide(d.mereSituation)) absents.push('votre mère');
  }

  if (etape === 'residence') {
    if (vide(d.residenceVille)) absents.push('votre ville de résidence');
    if (vide(d.residenceQuartier)) absents.push('votre quartier');
    if (vide(d.hebergement)) absents.push('votre mode d’hébergement');
    if (vide(d.demandeLogement)) absents.push('votre réponse sur le logement universitaire');
    if (vide(d.parentsVille)) absents.push('la résidence de vos parents');
  }

  if (etape === 'urgence') {
    if (vide(d.urgenceNom)) absents.push('le nom de la personne à prévenir');
    if (vide(d.urgenceLien)) absents.push('son lien avec vous');
    if (vide(d.urgenceTelephone)) absents.push('son téléphone');
    if (vide(d.urgenceVille) || vide(d.urgenceQuartier)) absents.push('où elle habite');
  }

  if (etape === 'photo') {
    if (vide(d.photo)) absents.push('votre photographie d’identité');
    else if (vide(d.photoConsentieLe)) absents.push('votre accord pour l’impression sur la carte');
  }

  return absents;
}

export function etapeInscriptionFaite(
  etape: IdEtapeInscription,
  dossier: Candidature,
): boolean {
  return manquesInscription(etape, dossier).length === 0;
}

export function manquesDuDossierInscription(
  dossier: Candidature,
): readonly { readonly etape: EtapeInscription; readonly absents: readonly string[] }[] {
  return ETAPES_INSCRIPTION.map((etape) => ({
    etape,
    absents: manquesInscription(etape.id, dossier),
  })).filter((ligne) => ligne.absents.length > 0);
}

export function inscriptionEnvoyable(dossier: Candidature): boolean {
  return manquesDuDossierInscription(dossier).length === 0;
}

export function etapeInscriptionAReprendre(dossier: Candidature): EtapeInscription {
  const premiere = ETAPES_INSCRIPTION.find((etape) => !etapeInscriptionFaite(etape.id, dossier));
  return premiere ?? ETAPES_INSCRIPTION[ETAPES_INSCRIPTION.length - 1]!;
}

/**
 * États dans lesquels le dossier d'inscription est ouvert à la saisie.
 *
 * « La place est alors réservée et le dossier d'inscription s'ouvre » (§5.1,
 * étape 3). Il se referme lorsqu'il part à la scolarité, et se rouvre si
 * celle-ci demande une pièce complémentaire — « sans rejeter le dossier »
 * (§5.1, étape 7), ce qui est exactement la transition inverse de la chaîne.
 */
export const ETATS_INSCRIPTION_OUVERTS = ['place-reservee'] as const;

export function inscriptionModifiable(dossier: Candidature): boolean {
  return (ETATS_INSCRIPTION_OUVERTS as readonly string[]).includes(dossier.etat);
}
