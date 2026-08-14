/* ==========================================================================
   Rôles internes — CDC §5.2
   --------------------------------------------------------------------------
   « Les droits sont attribués par rôle, jamais par personne, et un compte
   n'est jamais partagé entre plusieurs agents. »

   Le principe de moindre privilège (§5.2) est appliqué littéralement : chaque
   rôle reçoit exactement les droits nécessaires à sa fonction, et la colonne
   « ne peut pas » du CDC est traduite en refus explicites dans `acces.ts`.
   ========================================================================== */

export const ROLES = [
  'administrateur',
  'editeur',
  'redacteur',
  'admission',
  'scolarite',
  'finances',
  'consultation',
  'carrieres',
  'recherche',
] as const;

export type Role = (typeof ROLES)[number];

export const LIBELLES_ROLE: Record<Role, string> = {
  administrateur: 'Administrateur',
  editeur: 'Éditeur',
  redacteur: 'Rédacteur',
  admission: 'Chargé d’admission',
  scolarite: 'Scolarité',
  finances: 'Finances',
  consultation: 'Consultation',
  carrieres: 'Responsable carrières et partenariats',
  recherche: 'Référent recherche et innovation',
};

export const PERIMETRES_ROLE: Record<Role, string> = {
  administrateur: 'Configuration générale, comptes et rôles, accès à l’ensemble des espaces.',
  editeur: 'Création, modification et publication de tous les contenus du site.',
  redacteur: 'Rédaction et soumission de contenus, sans publication.',
  admission: 'Instruction des candidatures, demande de pièces, décision d’admission, export.',
  scolarite: 'Inscriptions, dossiers étudiants, documents administratifs, décisions académiques.',
  finances: 'Versements, grilles tarifaires, situations et relances.',
  consultation: 'Lecture des tableaux de bord et des états de synthèse.',
  carrieres: 'Offres de stage et d’emploi, relations entreprises, demandes entrantes.',
  recherche: 'Profils chercheurs, projets, publications et contenus scientifiques.',
};

/* ==========================================================================
   Ce que chaque rôle peut faire — la matrice, décrite une seule fois
   --------------------------------------------------------------------------
   Le §5.2 attribue à chaque rôle un périmètre, et une colonne « ne peut pas »
   qui compte autant que la première. Le traduire une seule fois, ici, est ce
   qui empêche deux rôles de finir par se ressembler : les gardes de page, les
   actions serveur et les entrées de menu lisent toutes ces mêmes listes.

   Une capacité par acte, et non un droit global par espace. C'est la
   différence entre « la scolarité travaille sur les candidatures » — qui ne
   veut rien dire — et « la scolarité lit un dossier mais ne prononce pas
   l'admission », qui est une règle applicable.

   Le principe de séparation : celui qui instruit n'encaisse pas, celui qui
   rapproche les versements ne décide pas de l'admission.
   ========================================================================== */

/**
 * Consulter les pièces déposées, dont les pièces d'identité.
 *
 * §20.2 : « Restreindre l'accès aux pièces d'identité aux seuls rôles
 * habilités, et journaliser les consultations. » Les finances en sont
 * exclues : un versement se rapproche sur une référence, pas sur une carte
 * d'identité.
 */
export const ROLES_PIECES: readonly Role[] = ['administrateur', 'admission', 'scolarite'];

/**
 * Lire un dossier de candidature.
 *
 * Plus large que l'instruction : la scolarité a besoin de reprendre un dossier
 * admis pour inscrire, les finances de retrouver le versement qui s'y rattache,
 * la consultation d'établir des états de synthèse. En revanche, les rôles
 * éditoriaux et carrières n'ont rien à y faire — un dossier porte le nom, la
 * date de naissance et le téléphone d'une personne.
 */
export const ROLES_DOSSIERS: readonly Role[] = [
  'administrateur',
  'admission',
  'scolarite',
  'finances',
  'consultation',
];

/**
 * Instruire : statuer sur une pièce, demander un complément, faire avancer
 * l'état d'un dossier. C'est le métier du service des admissions (§5.2).
 */
export const ROLES_INSTRUCTION: readonly Role[] = ['administrateur', 'admission'];

/**
 * Prononcer l'admission.
 *
 * Volontairement identique à l'instruction, et volontairement fermé à la
 * scolarité : le §5.2 lui confie les « décisions académiques » — passage de
 * niveau, redoublement — pas l'entrée dans l'établissement.
 */
export const ROLES_DECISION: readonly Role[] = ['administrateur', 'admission'];

/**
 * Rapprocher un versement du relevé de l'établissement.
 *
 * Réservé aux finances. Le §10.2 veut une vérification humaine ; la séparation
 * des pouvoirs veut qu'elle ne soit pas faite par celui qui décide de
 * l'admission. Le chargé d'admission voit donc l'état du versement sans
 * pouvoir le déclarer vérifié.
 */
export const ROLES_VERSEMENTS: readonly Role[] = ['administrateur', 'finances'];

/** Tenir le référentiel des personnes : inscriptions, dossiers étudiants. */
export const ROLES_PERSONNES: readonly Role[] = ['administrateur', 'scolarite'];

/** Le consulter, sans y écrire. */
export const ROLES_PERSONNES_LECTURE: readonly Role[] = [
  'administrateur',
  'scolarite',
  'admission',
  'finances',
  'consultation',
];

/** Les comptes créés par les candidats depuis le portail public. */
export const ROLES_COMPTES: readonly Role[] = ['administrateur', 'admission', 'scolarite'];

/**
 * Conservé pour les règles d'accès des collections Payload, qui raisonnent en
 * « qui touche à un dossier ». Les écrans, eux, utilisent les capacités
 * ci-dessus, plus fines.
 */
export const ROLES_CANDIDATURES: readonly Role[] = [
  'administrateur',
  'admission',
  'scolarite',
  'finances',
];

/* --------------------------------------------------------------------------
   Ce que le rôle permet, dit à celui qui le porte
   --------------------------------------------------------------------------
   Un agent doit pouvoir comprendre pourquoi un écran lui manque. La colonne
   « ne peut pas » du §5.2 est donc affichée, pas seulement appliquée.
   -------------------------------------------------------------------------- */

export type Perimetre = {
  readonly peut: readonly string[];
  readonly nePeutPas: readonly string[];
};

export const PERIMETRE_DETAILLE: Record<Role, Perimetre> = {
  administrateur: {
    peut: [
      'Accéder à l’ensemble des espaces du dispositif',
      'Créer les comptes des agents et changer leur rôle',
      'Instruire, décider, rapprocher les versements, publier',
    ],
    nePeutPas: ['Se retirer à lui-même le rôle d’administrateur, ni se désactiver'],
  },
  admission: {
    peut: [
      'Lire et instruire les dossiers de candidature',
      'Accepter ou rejeter chaque pièce, avec motif',
      'Demander un complément au candidat',
      'Prononcer l’admission, le refus ou la liste d’attente',
    ],
    nePeutPas: [
      'Déclarer un versement vérifié — cela revient aux finances',
      'Modifier le référentiel des personnes inscrites',
      'Publier un contenu sur le site',
    ],
  },
  scolarite: {
    peut: [
      'Lire les dossiers de candidature et leurs pièces',
      'Tenir le référentiel des personnes et des inscriptions',
      'Établir les documents administratifs',
    ],
    nePeutPas: [
      'Prononcer une admission — cela revient au service des admissions',
      'Statuer sur une pièce justificative',
      'Déclarer un versement vérifié',
    ],
  },
  finances: {
    peut: [
      'Rapprocher les références de versement du relevé de l’établissement',
      'Lire les dossiers pour retrouver un versement',
      'Consulter le référentiel des personnes',
    ],
    nePeutPas: [
      'Ouvrir les pièces d’identité des candidats',
      'Prononcer une admission ni statuer sur une pièce',
    ],
  },
  consultation: {
    peut: [
      'Lire les tableaux de bord et les états de synthèse',
      'Consulter les dossiers et le référentiel des personnes',
    ],
    nePeutPas: ['Modifier quoi que ce soit — cet accès est en lecture seule'],
  },
  editeur: {
    peut: [
      'Écrire, modifier et mettre en ligne actualités, événements et offres',
      'Retirer ou archiver un contenu publié',
      'Valider ce qu’un rédacteur a soumis',
    ],
    nePeutPas: ['Accéder aux dossiers de candidature ni aux pièces justificatives'],
  },
  redacteur: {
    peut: [
      'Écrire et modifier ses propres contenus',
      'Les soumettre à validation',
    ],
    nePeutPas: [
      'Mettre un contenu en ligne — un éditeur le valide',
      'Accéder aux dossiers de candidature ni aux pièces justificatives',
    ],
  },
  carrieres: {
    peut: [
      'Publier et retirer les offres de stage et d’emploi',
      'Suivre les demandes des entreprises',
    ],
    nePeutPas: [
      'Publier des actualités ou des événements',
      'Accéder aux dossiers de candidature',
    ],
  },
  recherche: {
    peut: ['Tenir les contenus scientifiques, dès que la rubrique sera ouverte'],
    nePeutPas: [
      'Rien d’autre pour l’instant : la rubrique Recherche & Innovation n’est pas activée',
      'Accéder aux dossiers de candidature',
    ],
  },
};
