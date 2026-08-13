import { getFormation } from '@/content/formations';
import type { Candidature } from '@/payload-types';

/* ==========================================================================
   Les étapes du dossier — CDC §10.1
   --------------------------------------------------------------------------
   Le parcours annoncé au public (« Créez votre compte, choisissez votre
   formation, remplissez votre dossier, ajoutez vos documents, relisez et
   envoyez, suivez votre dossier ») est décrit ici une seule fois. Le rail de
   navigation, la reprise de saisie et le récapitulatif en découlent tous : il
   ne peut donc pas y avoir de désaccord entre ce que le portail affiche et ce
   qu'il exige réellement.

   Deux principes de fond :

   — Rien n'est bloqué en écriture. Le candidat remplit dans l'ordre qu'il
     veut, s'arrête, revient. Seul l'envoi contrôle que le nécessaire est là.
   — Ce que l'établissement n'a pas arrêté n'est pas exigé. La liste des
     pièces attendues par cycle et le montant des frais de dossier ne sont pas
     publiés : le portail demande donc le minimum universellement nécessaire,
     et le dit.
   ========================================================================== */

export type IdEtape = 'formation' | 'identite' | 'scolarite' | 'pieces' | 'frais' | 'recapitulatif';

export type Etape = {
  readonly id: IdEtape;
  readonly numero: number;
  readonly libelle: string;
  readonly resume: string;
  readonly href: string;
  /** Une étape facultative n'empêche jamais l'envoi du dossier. */
  readonly facultative?: true;
};

export const ETAPES: readonly Etape[] = [
  {
    id: 'formation',
    numero: 1,
    libelle: 'Votre formation',
    resume: 'Le premier choix, et un second si vous hésitez.',
    href: '/mon-dossier/formation',
  },
  {
    id: 'identite',
    numero: 2,
    libelle: 'Vous',
    resume: 'Nom, date de naissance, contact.',
    href: '/mon-dossier/identite',
  },
  {
    id: 'scolarite',
    numero: 3,
    libelle: 'Votre parcours',
    resume: 'Baccalauréat et établissement d’origine.',
    href: '/mon-dossier/scolarite',
  },
  {
    id: 'pieces',
    numero: 4,
    libelle: 'Vos documents',
    resume: 'Photographiés depuis votre téléphone.',
    href: '/mon-dossier/pieces',
  },
  {
    id: 'frais',
    numero: 5,
    libelle: 'Frais de dossier',
    resume: 'À renseigner si vous avez déjà payé.',
    href: '/mon-dossier/frais',
    facultative: true,
  },
  {
    id: 'recapitulatif',
    numero: 6,
    libelle: 'Relire et envoyer',
    resume: 'Tout revoir avant l’envoi définitif.',
    href: '/mon-dossier/recapitulatif',
  },
];

/** Le baccalauréat n'est demandé que pour les cycles qui l'exigent. */
export function exigeBaccalaureat(dossier: Candidature): boolean {
  const formation = getFormation(dossier.voeu1);
  return formation?.cycle === 'bts' || formation?.cycle === 'licence';
}

function rempli(valeur: unknown): boolean {
  return typeof valeur === 'string' ? valeur.trim().length > 0 : valeur !== null && valeur !== undefined;
}

/**
 * Ce qui manque à une étape, en clair.
 *
 * La liste sert deux fois : à colorer le rail, et à écrire le récapitulatif.
 * Elle est rédigée en langage de candidat, pas en noms de champs — c'est elle
 * que le lecteur verra s'il tente d'envoyer un dossier incomplet.
 */
export function manques(etape: IdEtape, dossier: Candidature): readonly string[] {
  switch (etape) {
    case 'formation':
      return rempli(dossier.voeu1) ? [] : ['Le premier choix de formation'];

    case 'identite': {
      const absents: string[] = [];
      if (!rempli(dossier.nom)) absents.push('Votre nom');
      if (!rempli(dossier.prenoms)) absents.push('Vos prénoms');
      if (!rempli(dossier.dateNaissance)) absents.push('Votre date de naissance');
      if (!rempli(dossier.telephone)) absents.push('Votre numéro de téléphone');
      return absents;
    }

    case 'scolarite': {
      if (!exigeBaccalaureat(dossier)) return [];
      const absents: string[] = [];
      if (!rempli(dossier.serieBac)) absents.push('La série de votre baccalauréat');
      if (!rempli(dossier.anneeBac)) absents.push('L’année d’obtention du baccalauréat');
      return absents;
    }

    case 'pieces': {
      const deposees = dossier.pieces ?? [];
      if (deposees.length === 0) return ['Au moins une pièce justificative'];

      // Une pièce refusée compte comme absente : sans cela, un dossier revenu
      // en « complément demandé » se présenterait comme complet et pourrait
      // repartir inchangé, ce qui ferait tourner l'instruction en boucle.
      const refusees = deposees.filter((piece) => piece.etatPiece === 'rejetee').length;
      if (refusees > 0) {
        return [
          refusees === 1
            ? 'Un document a été refusé : il doit être redéposé'
            : `${refusees} documents ont été refusés : ils doivent être redéposés`,
        ];
      }
      return [];
    }

    case 'frais':
      return [];

    case 'recapitulatif':
      return [];
  }
}

/** Une étape est faite lorsqu'il n'y manque plus rien. */
export function etapeFaite(etape: IdEtape, dossier: Candidature): boolean {
  if (etape === 'recapitulatif') return false;
  if (etape === 'frais') return rempli(dossier.referenceTransaction);
  return manques(etape, dossier).length === 0;
}

/** Tout ce qui manque au dossier, étape par étape, pour l'envoi. */
export function manquesDuDossier(
  dossier: Candidature,
): readonly { readonly etape: Etape; readonly absents: readonly string[] }[] {
  return ETAPES.filter((etape) => !etape.facultative)
    .map((etape) => ({ etape, absents: manques(etape.id, dossier) }))
    .filter((ligne) => ligne.absents.length > 0);
}

export function dossierEnvoyable(dossier: Candidature): boolean {
  return manquesDuDossier(dossier).length === 0;
}

/** Première étape non faite : c'est là qu'on ramène le candidat qui revient. */
export function etapeAReprendre(dossier: Candidature): Etape {
  const premiere = ETAPES.find((etape) => !etape.facultative && !etapeFaite(etape.id, dossier));
  return premiere ?? ETAPES[ETAPES.length - 1]!;
}

/** États dans lesquels le candidat peut encore modifier son dossier (§10.3). */
export const ETATS_OUVERTS = ['brouillon', 'complement'] as const;

export function dossierModifiable(dossier: Candidature): boolean {
  return (ETATS_OUVERTS as readonly string[]).includes(dossier.etat);
}

/**
 * Là où ramener un candidat dont l'établissement attend un complément.
 *
 * Si des pièces ont été refusées, c'est à l'étape des documents qu'il faut
 * l'emmener — c'est là que sont les motifs et le bouton de dépôt. Sinon, au
 * premier élément incomplet.
 */
export function etapeDeReprise(dossier: Candidature): string {
  const refusees = (dossier.pieces ?? []).some((piece) => piece.etatPiece === 'rejetee');
  return refusees ? '/mon-dossier/pieces' : etapeAReprendre(dossier).href;
}
