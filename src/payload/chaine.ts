import type { Role } from './roles';

/* ==========================================================================
   La chaîne de traitement d'un dossier — Note complémentaire, chapitre 3
   --------------------------------------------------------------------------
   « À chaque instant, un dossier est en attente d'une action précise,
   imputable à un service précis. Il change de propriétaire lorsque cette
   action est accomplie. Aucun service ne travaille sur "la liste des
   étudiants" en général : chacun travaille sur ce qui lui est adressé.
   C'est ce principe qui rend les postes de travail distincts, et non le seul
   jeu des permissions. » (§3.1)

   La phrase est une correction de ce qui existait ici : les rôles étaient
   décrits par des droits d'accès, ce qui les faisait tous se ressembler dès
   qu'ils partageaient un écran. La propriété du dossier, elle, n'appartient
   qu'à un service à la fois — et c'est elle qui remplit les files d'attente.

   Ce module décrit la chaîne une seule fois : l'état, son propriétaire,
   l'action qu'on y attend, ce qui vient ensuite, et le délai au-delà duquel
   un dossier immobile devient une alerte. Les files d'attente, l'écran
   d'instruction et les compteurs en découlent tous.

   Règles couvertes : RG-40 à RG-45.
   ========================================================================== */

/** Les six services de la note (§4), plus le candidat lui-même. */
export type Service =
  | 'candidat'
  | 'admission'
  | 'finances'
  | 'scolarite'
  | 'pedagogie'
  | 'direction';

export const LIBELLES_SERVICE: Record<Service, string> = {
  candidat: 'Le candidat',
  admission: 'Admission',
  finances: 'Finances',
  scolarite: 'Scolarité',
  pedagogie: 'Pédagogie',
  direction: 'Direction',
};

/**
 * Les états de la chaîne, dans l'ordre du §3.2.
 *
 * Six sont ajoutés par la note : la chaîne s'arrêtait à « Admis », laissant
 * le parcours s'interrompre au moment précis où il devient décisif pour
 * l'établissement — celui où un admis devient, ou non, un inscrit.
 */
export const ETATS_CHAINE = [
  'brouillon',
  'soumis',
  'instruction',
  'complement',
  'complet',
  'admis',
  'admis-condition',
  'offre-acceptee',
  'versement-annonce',
  'place-reservee',
  'inscription-a-valider',
  'inscrit',
  'acces-ouverts',
  'attente',
  'refuse',
  'desiste',
  'annule',
] as const;

export type EtatChaine = (typeof ETATS_CHAINE)[number];

export type EtapeChaine = {
  readonly cle: EtatChaine;
  readonly libelle: string;
  /** Le service à qui le dossier appartient tant qu'il est dans cet état. */
  readonly proprietaire: Service;
  /** Ce qu'on attend de lui. Vide pour un état terminal. */
  readonly attendu: string;
  /** Ce que devient le dossier une fois l'action accomplie. */
  readonly suite: string;
  /**
   * Jours au-delà desquels un dossier immobile remonte en alerte (RG-44).
   * `null` lorsque l'attente ne dépend pas de l'établissement, ou que l'état
   * est terminal.
   */
  readonly alerteApres: number | null;
  readonly terminal?: true;
};

export const CHAINE: readonly EtapeChaine[] = [
  {
    cle: 'brouillon',
    libelle: 'Brouillon',
    proprietaire: 'candidat',
    attendu: 'Compléter son dossier.',
    suite: 'Soumission.',
    alerteApres: null,
  },
  {
    cle: 'soumis',
    libelle: 'Soumis',
    proprietaire: 'admission',
    attendu: 'Contrôler les pièces et la cohérence.',
    suite: 'Dossier déclaré complet, ou complément demandé.',
    alerteApres: 5,
  },
  {
    cle: 'instruction',
    libelle: 'En instruction',
    proprietaire: 'admission',
    attendu: 'Achever l’examen du dossier.',
    suite: 'Dossier déclaré complet, ou complément demandé.',
    alerteApres: 5,
  },
  {
    cle: 'complement',
    libelle: 'Complément demandé',
    proprietaire: 'candidat',
    attendu: 'Fournir la pièce manquante.',
    suite: 'Retour en instruction.',
    alerteApres: 15,
  },
  {
    cle: 'complet',
    libelle: 'Complet',
    proprietaire: 'admission',
    attendu: 'Enregistrer la décision.',
    suite: 'Décision notifiée.',
    alerteApres: 5,
  },
  {
    cle: 'admis',
    libelle: 'Admis',
    proprietaire: 'candidat',
    attendu: 'Accepter l’offre avant la date limite.',
    suite: 'Acceptation, ou expiration valant désistement.',
    // §7.1 : quinze jours recommandés, à confirmer par l'établissement.
    alerteApres: 15,
  },
  {
    cle: 'admis-condition',
    libelle: 'Admis sous condition',
    proprietaire: 'candidat',
    attendu: 'Lever les conditions, puis accepter l’offre.',
    suite: 'Acceptation, ou expiration valant désistement.',
    alerteApres: 15,
  },
  {
    cle: 'offre-acceptee',
    libelle: 'Offre acceptée',
    proprietaire: 'candidat',
    attendu: 'Régler les frais réservant la place.',
    suite: 'Versement effectué.',
    alerteApres: 10,
  },
  {
    cle: 'versement-annonce',
    libelle: 'Versement annoncé',
    proprietaire: 'finances',
    attendu: 'Rapprocher et constater le versement.',
    suite: 'Versement enregistré.',
    alerteApres: 2,
  },
  {
    cle: 'place-reservee',
    libelle: 'Place réservée',
    proprietaire: 'candidat',
    attendu: 'Compléter le dossier d’inscription et signer les engagements.',
    suite: 'Dossier d’inscription soumis.',
    alerteApres: 20,
  },
  {
    cle: 'inscription-a-valider',
    libelle: 'Inscription à valider',
    proprietaire: 'scolarite',
    attendu: 'Contrôler et valider l’inscription.',
    suite: 'Numéro étudiant attribué, inscription créée.',
    alerteApres: 3,
  },
  {
    cle: 'inscrit',
    libelle: 'Inscrit',
    proprietaire: 'pedagogie',
    attendu: 'Ouvrir les accès et rattacher aux cours.',
    suite: 'Identifiants transmis.',
    alerteApres: 3,
  },
  {
    cle: 'acces-ouverts',
    libelle: 'Accès ouverts',
    proprietaire: 'candidat',
    attendu: '',
    suite: 'Fin de la chaîne d’admission.',
    alerteApres: null,
    terminal: true,
  },

  /* ------------------------------------------------------- États terminaux
     §3.4 — un dossier n'y est jamais supprimé, il y est conservé. */
  {
    cle: 'attente',
    libelle: 'Liste d’attente',
    proprietaire: 'admission',
    attendu: 'Reprendre le dossier si une place se libère.',
    suite: 'Retour à la décision.',
    alerteApres: null,
  },
  {
    cle: 'refuse',
    libelle: 'Refusé',
    proprietaire: 'admission',
    attendu: '',
    suite: 'Décision défavorable, candidat notifié.',
    alerteApres: null,
    terminal: true,
  },
  {
    cle: 'desiste',
    libelle: 'Désisté',
    proprietaire: 'admission',
    attendu: '',
    suite: 'La place est rendue à la liste d’attente.',
    alerteApres: null,
    terminal: true,
  },
  {
    cle: 'annule',
    libelle: 'Annulé',
    proprietaire: 'finances',
    attendu: '',
    suite: 'Renoncement après réservation — traitement selon les conditions d’annulation.',
    alerteApres: null,
    terminal: true,
  },
];

const PAR_CLE = new Map(CHAINE.map((etape) => [etape.cle, etape]));

export function etape(cle: string | undefined): EtapeChaine | null {
  return PAR_CLE.get((cle ?? '') as EtatChaine) ?? null;
}

/** Le service à qui appartient un dossier, d'après son seul état (RG-40). */
export function proprietaire(cle: string | undefined): Service | null {
  return etape(cle)?.proprietaire ?? null;
}

/** Les états dont un service est propriétaire — c'est sa file d'attente. */
export function etatsDuService(service: Service): readonly EtatChaine[] {
  return CHAINE.filter((e) => e.proprietaire === service && !e.terminal).map((e) => e.cle);
}

/**
 * Un dossier est-il immobile depuis trop longtemps ? (RG-44)
 *
 * Le délai dépend de l'état : deux jours pour rapprocher un versement, quinze
 * pour qu'un admis se décide. Un même seuil pour tout ferait remonter en
 * alerte des dossiers qui attendent normalement.
 */
export function enAlerte(cle: string | undefined, depuis: string | null | undefined): boolean {
  const seuil = etape(cle)?.alerteApres;
  if (!seuil || !depuis) return false;
  const jours = (Date.now() - new Date(depuis).getTime()) / 86_400_000;
  return jours > seuil;
}

/** Jours écoulés depuis la dernière action, arrondis à l'entier inférieur. */
export function joursDepuis(depuis: string | null | undefined): number | null {
  if (!depuis) return null;
  return Math.floor((Date.now() - new Date(depuis).getTime()) / 86_400_000);
}

/* ==========================================================================
   Les transitions permises — RG-41 et RG-43
   --------------------------------------------------------------------------
   « Un dossier ne peut passer à l'état suivant que si l'action attendue de son
   service propriétaire a été accomplie. » (RG-41)
   « Un retour en arrière est possible mais toujours motivé, et demeure visible
   dans l'historique. » (RG-43)

   Deux règles que rien ne tenait jusqu'ici : l'action d'avancement acceptait
   n'importe quel état, y compris un saut d'étape ou un retour silencieux.
   Décrire les transitions permises est ce qui rend la chaîne étanche — et ce
   qui permet à chaque poste de n'afficher que les gestes qui lui reviennent.

   Ne figurent ici que les transitions faites par un agent. Celles qui
   reviennent au candidat — accepter son offre, annoncer son versement, déposer
   son dossier d'inscription — s'effectuent depuis son espace. Un agent peut
   néanmoins les accomplir pour son compte : le §5.5 prévoit ce mode assisté
   pour qui ne dispose pas d'un équipement adapté, et l'intervention est alors
   tracée comme telle.
   ========================================================================== */

export type Transition = {
  readonly vers: EtatChaine;
  readonly libelle: string;
  readonly aide: string;
  /** Le service habilité à l'accomplir. */
  readonly par: Service;
  /** Retour en arrière : exige un motif (RG-43). */
  readonly recule?: true;
  /** Geste normalement fait par le candidat, ici en mode assisté (§5.5). */
  readonly assiste?: true;
};

export const TRANSITIONS: Partial<Record<EtatChaine, readonly Transition[]>> = {
  soumis: [
    {
      vers: 'instruction',
      libelle: 'Prendre en instruction',
      aide: 'Le dossier passe sous votre examen.',
      par: 'admission',
    },
    {
      vers: 'complement',
      libelle: 'Demander un complément',
      aide: 'La main repasse au candidat, qui peut modifier son dossier.',
      par: 'admission',
    },
    {
      vers: 'complet',
      libelle: 'Marquer complet',
      aide: 'Pièces validées, en attente de décision.',
      par: 'admission',
    },
  ],

  instruction: [
    {
      vers: 'complement',
      libelle: 'Demander un complément',
      aide: 'La main repasse au candidat.',
      par: 'admission',
    },
    {
      vers: 'complet',
      libelle: 'Marquer complet',
      aide: 'Pièces validées, en attente de décision.',
      par: 'admission',
    },
  ],

  complement: [
    {
      vers: 'instruction',
      libelle: 'Reprendre l’instruction',
      aide: 'Le candidat a fourni ce qui manquait.',
      par: 'admission',
    },
  ],

  complet: [
    {
      vers: 'instruction',
      libelle: 'Rouvrir l’instruction',
      aide: 'Revient sur la complétude déclarée.',
      par: 'admission',
      recule: true,
    },
  ],

  admis: [
    {
      vers: 'offre-acceptee',
      libelle: 'Enregistrer l’acceptation',
      aide: 'Pour un candidat qui accepte par téléphone ou au guichet.',
      par: 'admission',
      assiste: true,
    },
    {
      vers: 'desiste',
      libelle: 'Constater le désistement',
      aide: 'Refus explicite, ou délai d’acceptation expiré. La place est libérée.',
      par: 'admission',
    },
  ],

  'admis-condition': [
    {
      vers: 'offre-acceptee',
      libelle: 'Enregistrer l’acceptation',
      aide: 'Les conditions étant levées.',
      par: 'admission',
      assiste: true,
    },
    {
      vers: 'desiste',
      libelle: 'Constater le désistement',
      aide: 'Refus explicite, ou délai expiré.',
      par: 'admission',
    },
  ],

  attente: [
    {
      vers: 'complet',
      libelle: 'Reprendre le dossier',
      aide: 'Une place s’est libérée : le dossier retourne en décision.',
      par: 'admission',
    },
  ],

  'offre-acceptee': [
    {
      vers: 'place-reservee',
      libelle: 'Constater le versement',
      aide: 'Versement reçu au guichet, ou déjà rapproché du relevé.',
      par: 'finances',
    },
  ],

  'versement-annonce': [
    {
      vers: 'place-reservee',
      libelle: 'Constater le versement',
      aide: 'La référence concorde avec le relevé : la place est réservée.',
      par: 'finances',
    },
    {
      vers: 'offre-acceptee',
      libelle: 'Signaler un écart',
      aide: 'La référence ne concorde pas. Le candidat est invité à la corriger.',
      par: 'finances',
      recule: true,
    },
  ],

  'place-reservee': [
    {
      vers: 'inscription-a-valider',
      libelle: 'Transmettre à la scolarité',
      aide: 'Dossier d’inscription complété pour le compte du candidat.',
      par: 'scolarite',
      assiste: true,
    },
    {
      vers: 'annule',
      libelle: 'Enregistrer une annulation',
      aide: 'Renoncement après réservation, selon les conditions d’annulation.',
      par: 'finances',
    },
  ],

  'inscription-a-valider': [
    {
      vers: 'inscrit',
      libelle: 'Valider l’inscription',
      aide: 'Le numéro étudiant est attribué et l’inscription créée.',
      par: 'scolarite',
    },
    {
      vers: 'place-reservee',
      libelle: 'Demander une pièce complémentaire',
      aide: 'Sans rejeter le dossier : la main repasse au candidat.',
      par: 'scolarite',
      recule: true,
    },
  ],

  inscrit: [
    {
      vers: 'acces-ouverts',
      libelle: 'Ouvrir les accès',
      aide: 'Comptes créés, étudiant rattaché aux cours de sa formation.',
      par: 'pedagogie',
    },
  ],
};

/** La transition demandée existe-t-elle ? (RG-41 — pas de saut d'étape.) */
export function transition(de: string | undefined, vers: string): Transition | null {
  const permises = TRANSITIONS[(de ?? '') as EtatChaine] ?? [];
  return permises.find((item) => item.vers === vers) ?? null;
}

/** Les transitions qu'un service donné peut accomplir depuis cet état. */
export function transitionsDuService(
  de: string | undefined,
  service: Service | null,
): readonly Transition[] {
  if (!service) return [];
  return (TRANSITIONS[(de ?? '') as EtatChaine] ?? []).filter((item) => item.par === service);
}

/* --------------------------------------------------------------------------
   Quel rôle tient quel service
   --------------------------------------------------------------------------
   Les neuf rôles du §5.2 restent la maille des droits ; les six postes de la
   note sont la maille du travail. Un poste regroupe donc un ou plusieurs
   rôles, ce qui évite de casser les comptes existants tout en appliquant la
   nouvelle organisation.
   -------------------------------------------------------------------------- */

export const ROLES_DU_SERVICE: Record<Service, readonly Role[]> = {
  candidat: [],
  admission: ['admission'],
  finances: ['finances'],
  scolarite: ['scolarite'],
  pedagogie: ['pedagogie'],
  direction: ['administrateur'],
};

/** Le service que tient un agent, ou `null` s'il n'en tient aucun. */
export function serviceDuRole(role: Role): Service | null {
  const trouve = (Object.keys(ROLES_DU_SERVICE) as Service[]).find((service) =>
    ROLES_DU_SERVICE[service].includes(role),
  );
  return trouve ?? null;
}
