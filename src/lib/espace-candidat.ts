import { ETAPES, dossierModifiable, etapeDeReprise } from '@/lib/etapes-dossier';
import type { Candidature } from '@/payload-types';

/* ==========================================================================
   Les rubriques de l'espace personnel
   --------------------------------------------------------------------------
   L'espace n'est pas le même selon l'âge du dossier. Un candidat qui remplit
   sa candidature n'a pas de documents ; un étudiant inscrit ne revient pas
   corriger ses vœux. Montrer les deux à tout le monde produirait une
   navigation dont la moitié est morte — et un candidat qui a une fois cliqué
   sur une rubrique vide cesse de lire la navigation entière.

   La règle de la note (§3.1) le dit autrement : « à chaque instant, un dossier
   est en attente d'une action précise ». L'espace montre donc le parcours du
   moment, et un seul.

   Cinq rubriques au maximum, quelle que soit la phase. Ce n'est pas une
   coquetterie : c'est la condition pour qu'une barre d'onglets tienne sur un
   écran de 360 px sans replier quoi que ce soit dans un menu.
   ========================================================================== */

export type Phase = 'candidature' | 'admission' | 'inscription' | 'etudiant' | 'clos';

const PHASES: Record<Phase, readonly string[]> = {
  candidature: ['brouillon', 'soumis', 'instruction', 'complement', 'complet'],
  admission: ['admis', 'admis-condition', 'offre-acceptee', 'versement-annonce'],
  inscription: ['place-reservee', 'inscription-a-valider'],
  etudiant: ['inscrit', 'acces-ouverts'],
  clos: ['attente', 'refuse', 'desiste', 'annule'],
};

export function phaseDuDossier(dossier: Candidature | null): Phase {
  if (!dossier) return 'candidature';
  for (const [phase, etats] of Object.entries(PHASES)) {
    if (etats.includes(dossier.etat)) return phase as Phase;
  }
  return 'candidature';
}

/* --------------------------------------------------------------------------
   Les rubriques
   -------------------------------------------------------------------------- */

export type CleRubrique =
  | 'espace'
  | 'candidature'
  | 'inscription'
  | 'scolarite'
  | 'documents'
  | 'paiements'
  | 'compte';

export type Rubrique = {
  readonly cle: CleRubrique;
  readonly libelle: string;
  /** Le mot porté par l'onglet, sur téléphone. Il n'y a place que pour un. */
  readonly court: string;
  readonly href: string;
  /** Les chemins sur lesquels la rubrique s'allume, en plus de `href`. */
  readonly actifSur: readonly string[];
  readonly phases: readonly Phase[];
  /**
   * `false` tant que l'écran n'existe pas.
   *
   * Ces rubriques sont déclarées avant d'être construites, pour que leur place
   * dans l'ordre et leur libellé soient arrêtés une seule fois. Le jour où
   * l'écran arrive, on retire le drapeau — et rien d'autre ne bouge.
   */
  readonly ouverte: boolean;
};

const CHEMINS_ETAPES = ETAPES.map((etape) => etape.href);

export const RUBRIQUES: readonly Rubrique[] = [
  {
    cle: 'espace',
    libelle: 'Mon espace',
    court: 'Espace',
    href: '/mon-dossier',
    actifSur: [],
    phases: ['candidature', 'admission', 'inscription', 'etudiant', 'clos'],
    ouverte: true,
  },
  {
    cle: 'candidature',
    libelle: 'Ma candidature',
    court: 'Dossier',
    href: '/mon-dossier/recapitulatif',
    actifSur: CHEMINS_ETAPES,
    // Elle quitte la barre dès l'inscription : un candidat dont la place est
    // réservée ne revient pas corriger ses vœux. Elle reste atteignable depuis
    // l'accueil, où sa consultation a le statut qu'elle mérite — une relecture.
    phases: ['candidature', 'admission', 'clos'],
    ouverte: true,
  },
  {
    cle: 'inscription',
    libelle: 'Mon inscription',
    court: 'Inscription',
    href: '/mon-dossier/inscription',
    actifSur: [],
    phases: ['inscription'],
    ouverte: false,
  },
  {
    cle: 'scolarite',
    libelle: 'Ma scolarité',
    court: 'Scolarité',
    href: '/mon-dossier/ma-scolarite',
    actifSur: [],
    phases: ['etudiant'],
    ouverte: false,
  },
  {
    cle: 'documents',
    libelle: 'Mes documents',
    court: 'Documents',
    href: '/mon-dossier/documents',
    actifSur: ['/mon-dossier/lettre'],
    phases: ['admission', 'inscription', 'etudiant'],
    ouverte: true,
  },
  {
    cle: 'paiements',
    libelle: 'Mes paiements',
    court: 'Paiements',
    href: '/mon-dossier/paiements',
    actifSur: [],
    phases: ['admission', 'inscription', 'etudiant'],
    ouverte: true,
  },
  {
    cle: 'compte',
    libelle: 'Mon compte',
    court: 'Compte',
    href: '/mon-dossier/compte',
    actifSur: [],
    phases: ['candidature', 'admission', 'inscription', 'etudiant', 'clos'],
    ouverte: true,
  },
];

/**
 * Les rubriques ouvertes à ce dossier, dans l'ordre.
 *
 * `Ma candidature` mène là où le candidat s'est arrêté tant qu'il peut encore
 * écrire, et au récapitulatif ensuite. La reprise indolore du §5.5 est ainsi
 * portée par la navigation elle-même, sans redirection intermédiaire — ce qui,
 * sur un réseau lent, économise un aller-retour avant le premier pixel.
 */
export function rubriquesDe(dossier: Candidature | null): readonly Rubrique[] {
  const phase = phaseDuDossier(dossier);

  return RUBRIQUES.filter((rubrique) => rubrique.ouverte && rubrique.phases.includes(phase)).map(
    (rubrique) =>
      rubrique.cle === 'candidature' && dossier && dossierModifiable(dossier)
        ? { ...rubrique, href: etapeDeReprise(dossier) }
        : rubrique,
  );
}

/** La rubrique dont relève un chemin, pour le titre de la barre haute. */
export function rubriqueDuChemin(chemin: string): Rubrique | null {
  const exacte = RUBRIQUES.find(
    (rubrique) => rubrique.cle !== 'espace' && chemin.startsWith(rubrique.href),
  );
  if (exacte) return exacte;

  const parChemin = RUBRIQUES.find((rubrique) =>
    rubrique.actifSur.some((prefixe) => chemin.startsWith(prefixe)),
  );
  if (parChemin) return parChemin;

  return RUBRIQUES.find((rubrique) => rubrique.cle === 'espace') ?? null;
}
