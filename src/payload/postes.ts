import { LIBELLES_SERVICE, etatsDuService, type EtatChaine, type Service } from './chaine';
import type { Role } from './roles';

/* ==========================================================================
   Les postes de travail — Note complémentaire, chapitre 4
   --------------------------------------------------------------------------
   « Chaque rôle dispose d'un écran d'accueil qui n'est pas un menu, mais une
   liste de travail : ce qui est en attente de son action, classé par urgence.
   Quand la liste est vide, le poste n'a rien à traiter. » (§4.1)

   Deux mailles cohabitent, et c'est volontaire :

   — le **rôle** reste la maille des droits. Le §5.2 du cahier des charges en
     décrit neuf, et le cycle éditorial en dépend — un rédacteur soumet, un
     éditeur publie. Les remplacer par six postes ferait disparaître cette
     distinction, que le critère de recette §24.4 exige ;
   — le **poste** est la maille du travail. Un poste regroupe les rôles qui
     partagent une même file d'attente et un même métier.

   Chaque poste porte aussi ce à quoi il n'accède pas. La note l'énonce pour
   chacun, et c'est la moitié utile de la définition : sans elle, deux postes
   finissent par se ressembler dès qu'ils partagent un écran.
   ========================================================================== */

export type Poste = {
  readonly cle: Service;
  readonly libelle: string;
  /** Les rôles qui tiennent ce poste. */
  readonly roles: readonly Role[];
  /** En une phrase, ce que le poste fait. */
  readonly metier: string;
  /** Les états dont le poste est propriétaire : sa file d'attente (§3.1). */
  readonly file: readonly EtatChaine[];
  /** Ce que le poste peut faire lui-même (§4.2 à §4.7). */
  readonly actions: readonly string[];
  /** Ce qu'il consulte sans y agir. */
  readonly consultation: readonly string[];
  /** Ce à quoi il n'accède pas — la moitié utile de la définition. */
  readonly interdit: readonly string[];
};

export const POSTES: readonly Poste[] = [
  {
    cle: 'admission',
    libelle: 'Admission',
    roles: ['admission'],
    metier: 'Instruire les candidatures et prononcer les décisions d’admission.',
    file: etatsDuService('admission'),
    actions: [
      'Ouvrir un dossier, valider ou rejeter une pièce',
      'Demander un complément au candidat',
      'Enregistrer une décision individuelle ou par lot',
      'Gérer la liste d’attente',
    ],
    consultation: [
      'Statistiques de candidature par formation',
      'Taux de complétude et provenance géographique',
    ],
    interdit: [
      'Les versements de scolarité',
      'Les décisions académiques',
      'Les contenus du site',
      'Les dossiers des étudiants déjà inscrits',
    ],
  },
  {
    cle: 'finances',
    libelle: 'Finances',
    roles: ['finances'],
    metier: 'Rapprocher les versements et suivre les créances.',
    file: etatsDuService('finances'),
    actions: [
      'Rapprocher un versement annoncé du relevé',
      'Enregistrer un versement constaté et produire un reçu',
      'Déclencher une relance',
      'Clôturer la journée',
    ],
    consultation: [
      'Situation financière d’un étudiant',
      'Encaissements par formation et par période',
      'Taux de recouvrement',
    ],
    interdit: [
      'Les dossiers de candidature',
      'Les pièces d’identité',
      'Les décisions de jury',
      'La modification des grilles tarifaires',
    ],
  },
  {
    cle: 'scolarite',
    libelle: 'Scolarité',
    roles: ['scolarite'],
    metier: 'Valider les inscriptions et tenir le référentiel des étudiants.',
    file: etatsDuService('scolarite'),
    actions: [
      'Valider une inscription et attribuer le numéro étudiant',
      'Contrôler la conformité documentaire',
      'Délivrer un document officiel',
      'Enregistrer une décision de fin d’année',
    ],
    consultation: [
      'Effectifs par formation et par niveau',
      'Parcours individuels',
      'Situation financière, en lecture seule',
    ],
    interdit: [
      'La saisie des versements',
      'Les grilles tarifaires',
      'Les contenus du site',
    ],
  },
  {
    cle: 'pedagogie',
    libelle: 'Pédagogie',
    roles: ['pedagogie'],
    metier: 'Ouvrir les accès des inscrits et tenir les espaces de cours.',
    file: etatsDuService('pedagogie'),
    actions: [
      'Créer les comptes et les rattacher aux cours',
      'Ouvrir et structurer les espaces de cours',
      'Gérer les enseignants',
      'Relancer une synchronisation en échec',
    ],
    consultation: [
      'Activité sur la plateforme pédagogique',
      'Cours effectivement alimentés',
      'Connexions étudiantes',
    ],
    interdit: [
      'Les données financières',
      'Les pièces d’identité',
      'Les décisions d’admission',
    ],
  },
  {
    cle: 'direction',
    libelle: 'Direction',
    roles: ['administrateur'],
    metier: 'Arbitrer, contrôler, et tenir les comptes et les rôles.',
    file: [],
    actions: [
      'Définir les grilles tarifaires et les calendriers',
      'Arbitrer une levée de blocage',
      'Valider une annulation d’écriture',
      'Gérer les comptes des agents et leurs rôles',
    ],
    consultation: [
      'L’ensemble des états de synthèse',
      'Le détail d’un dossier sur demande, l’accès étant journalisé',
    ],
    interdit: ['Le travail de saisie courant : la direction arbitre, elle n’instruit pas'],
  },
];

/**
 * Le poste Communication est décrit à part.
 *
 * Il ne possède aucun état de la chaîne — sa file d'attente est faite de
 * contenus, pas de dossiers — et il regroupe trois rôles dont les droits
 * diffèrent : le rédacteur soumet, l'éditeur publie, le responsable carrières
 * ne touche qu'aux offres.
 */
export const POSTE_COMMUNICATION: Poste = {
  cle: 'direction',
  libelle: 'Communication',
  roles: ['editeur', 'redacteur', 'carrieres'],
  metier: 'Tenir les contenus du site : actualités, événements, offres.',
  file: [],
  actions: [
    'Créer et modifier les contenus',
    'Les soumettre à validation, ou les mettre en ligne',
    'Retirer ou archiver un contenu publié',
  ],
  consultation: ['Audience du site', 'Pages les plus consultées'],
  interdit: [
    'Toute donnée nominative de candidat, d’étudiant ou de versement',
  ],
};

const PAR_ROLE = new Map<Role, Poste>();
for (const poste of [...POSTES, POSTE_COMMUNICATION]) {
  for (const role of poste.roles) PAR_ROLE.set(role, poste);
}

/** Le poste que tient un agent, ou `null` si son rôle n'en tient aucun. */
export function posteDuRole(role: Role): Poste | null {
  return PAR_ROLE.get(role) ?? null;
}

/** Vrai lorsque le poste travaille sur des dossiers de la chaîne. */
export function tientUneFile(poste: Poste | null): boolean {
  return Boolean(poste && poste.file.length > 0);
}

export { LIBELLES_SERVICE };
