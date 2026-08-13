import type { TonPastille } from './etats';

/* ==========================================================================
   Vocabulaire éditorial
   --------------------------------------------------------------------------
   Un seul endroit décrit les rubriques, les états et ce qu'ils autorisent.
   Les écrans de gestion, le rail de filtres et les boutons d'action y
   puisent : « À valider » se lit et se comporte partout pareil.
   ========================================================================== */

export type CleRubrique = 'actualites' | 'evenements' | 'offres';

export type Rubrique = {
  readonly cle: CleRubrique;
  readonly libelle: string;
  readonly singulier: string;
  readonly aide: string;
  /** Ce qu'un lecteur du site voit à la place, une fois publié. */
  readonly ou: string;
};

export const RUBRIQUES: readonly Rubrique[] = [
  {
    cle: 'actualites',
    libelle: 'Actualités',
    singulier: 'Actualité',
    aide: 'Ce que l’école annonce : ouvertures, campagnes, décisions.',
    ou: '/actualites',
  },
  {
    cle: 'evenements',
    libelle: 'Événements',
    singulier: 'Événement',
    aide: 'Rentrée, portes ouvertes, forums. La date peut rester à confirmer.',
    ou: '/evenements',
  },
  {
    cle: 'offres',
    libelle: 'Offres de stage et d’emploi',
    singulier: 'Offre',
    aide: 'Une offre échue disparaît d’elle-même du site, à sa date limite.',
    ou: '/carrieres',
  },
];

export function rubrique(cle: string | undefined): Rubrique {
  return RUBRIQUES.find((item) => item.cle === cle) ?? RUBRIQUES[0]!;
}

/* -------------------------------------------------------------------------- */

export type EtatEditorial = {
  readonly cle: string;
  readonly libelle: string;
  readonly ton: TonPastille;
  /** Ce que l'état veut dire pour l'agent qui lit la liste. */
  readonly sens: string;
};

export const ETATS_EDITORIAUX: readonly EtatEditorial[] = [
  {
    cle: 'brouillon',
    libelle: 'Brouillon',
    ton: 'neutre',
    sens: 'En cours d’écriture. Personne ne le voit hors de cet espace.',
  },
  {
    cle: 'a-valider',
    libelle: 'À valider',
    ton: 'or',
    sens: 'Le rédacteur a terminé. Un éditeur doit relire et mettre en ligne.',
  },
  { cle: 'publie', libelle: 'En ligne', ton: 'vert', sens: 'Visible du public.' },
  {
    cle: 'archive',
    libelle: 'Archivé',
    ton: 'neutre',
    sens: 'Retiré du site, conservé ici.',
  },
];

const PAR_CLE = new Map(ETATS_EDITORIAUX.map((etat) => [etat.cle, etat]));

export function etatEditorial(cle: string | undefined): EtatEditorial {
  return (
    PAR_CLE.get(cle ?? '') ?? { cle: cle ?? '—', libelle: cle ?? '—', ton: 'neutre', sens: '' }
  );
}

/** Filtres rapides de la liste. */
export const VUES_EDITORIALES = [
  { cle: 'tous', libelle: 'Tous', etats: null },
  { cle: 'a-valider', libelle: 'À relire', etats: ['a-valider'] },
  { cle: 'brouillon', libelle: 'Brouillons', etats: ['brouillon'] },
  { cle: 'publie', libelle: 'En ligne', etats: ['publie'] },
  { cle: 'archive', libelle: 'Archives', etats: ['archive'] },
] as const;

export function etatsDeLaVueEditoriale(cle: string | undefined): readonly string[] | null {
  return VUES_EDITORIALES.find((vue) => vue.cle === cle)?.etats ?? null;
}

/* --------------------------------------------------------------------------
   Ce que l'agent peut faire, selon l'état et son rôle
   -------------------------------------------------------------------------- */

export type ActionEditoriale = {
  readonly cle: 'soumettre' | 'reprendre' | 'publier' | 'depublier' | 'archiver';
  readonly libelle: string;
  readonly aide: string;
  readonly variante: 'principal' | 'or' | 'contour' | 'discret';
  readonly confirmation?: string;
};

const CATALOGUE: Record<ActionEditoriale['cle'], ActionEditoriale> = {
  soumettre: {
    cle: 'soumettre',
    libelle: 'Soumettre à validation',
    aide: 'Un éditeur relira avant la mise en ligne.',
    variante: 'principal',
  },
  reprendre: {
    cle: 'reprendre',
    libelle: 'Reprendre la main',
    aide: 'Le contenu redevient un brouillon.',
    variante: 'contour',
  },
  publier: {
    cle: 'publier',
    libelle: 'Mettre en ligne',
    aide: 'Visible immédiatement du public.',
    variante: 'or',
    confirmation: 'Mettre ce contenu en ligne ? Il sera visible du public immédiatement.',
  },
  depublier: {
    cle: 'depublier',
    libelle: 'Retirer du site',
    aide: 'Le contenu repasse en brouillon.',
    variante: 'contour',
    confirmation: 'Retirer ce contenu du site public ?',
  },
  archiver: {
    cle: 'archiver',
    libelle: 'Archiver',
    aide: 'Conservé ici, retiré du site.',
    variante: 'discret',
    confirmation: 'Archiver ce contenu ?',
  },
};

/**
 * Actions proposées pour un état donné.
 *
 * L'écran n'affiche que ce qui est faisable — mais c'est l'action serveur qui
 * décide : masquer un bouton n'a jamais fermé une porte (§5.2).
 */
export function actionsPossibles(etat: string, peutPublier: boolean): readonly ActionEditoriale[] {
  const liste: ActionEditoriale['cle'][] = [];

  if (etat === 'brouillon') {
    liste.push(peutPublier ? 'publier' : 'soumettre');
    if (peutPublier) liste.push('soumettre');
  }
  if (etat === 'a-valider') {
    if (peutPublier) liste.push('publier');
    liste.push('reprendre');
  }
  // Retirer du site est un acte de publication à l'envers : il change ce que
  // le public voit. Il reste donc à l'éditeur, comme la mise en ligne.
  if (etat === 'publie' && peutPublier) liste.push('depublier');
  if (etat === 'archive' && peutPublier) liste.push('publier');
  if (etat !== 'archive' && peutPublier) liste.push('archiver');

  return liste.map((cle) => CATALOGUE[cle]);
}

/**
 * Un rédacteur écrit ce qui n'est pas encore en ligne.
 *
 * Modifier un texte déjà publié revient à publier : le public le lit dans la
 * seconde. Le CDC réserve la publication à l'éditeur — la retouche d'un
 * contenu en ligne lui revient donc aussi.
 */
export function contenuModifiable(etat: string, peutPublier: boolean): boolean {
  return peutPublier || etat !== 'publie';
}

/* --------------------------------------------------------------------------
   Libellés publics
   -------------------------------------------------------------------------- */

/** La base range les rubriques par clé ; le site les affiche en toutes lettres. */
export const LIBELLE_CATEGORIE: Record<string, string> = {
  etablissement: 'Vie de l’établissement',
  admissions: 'Admissions',
  formations: 'Formations',
  ressources: 'Ressources',
  partenariats: 'Partenariats',
};

export const LIBELLE_TYPE_OFFRE: Record<string, string> = {
  stage: 'Stage',
  emploi: 'Emploi',
  alternance: 'Alternance',
};

/* --------------------------------------------------------------------------
   Le corps des textes
   -------------------------------------------------------------------------- */

/**
 * Le corps est saisi en texte simple, un paragraphe par ligne vide.
 *
 * Ce découpage est la seule mise en forme que le rédacteur contrôle : la
 * charte reste au site. C'est aussi ce qui permet de rendre la page sans
 * embarquer de moteur de texte riche dans le navigateur du lecteur (§19.5).
 */
export function enParagraphes(texte: string | null | undefined): readonly string[] {
  if (!texte) return [];
  return texte
    .split(/\n\s*\n/)
    .map((bloc) => bloc.trim().replace(/\s*\n\s*/g, ' '))
    .filter(Boolean);
}
