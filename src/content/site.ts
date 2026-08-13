import type { ChiffreCle } from './types';

/* ==========================================================================
   Identité et paramètres du portail
   ========================================================================== */

export const ETABLISSEMENT = {
  nom: 'FOANI International Training College',
  sigle: 'FOANI-ITC',
  signature: 'Building Excellence',
  baseline: 'Cultiver la terre, c’est semer l’avenir.',
  positionnement: 'Université 100 % agricole',
  ville: 'Agnibilékrou',
  pays: 'République de Côte d’Ivoire',
  /** Rentrée 2026 — date fixe, établie au CDC §24.1. */
  rentree: '2026-10-05',
  fuseau: 'Africa/Abidjan',
} as const;

/**
 * §8.8 — La rubrique Recherche & Innovation n'est publiée que si
 * l'établissement fournit des contenus réels et vérifiables. Tant que ce
 * drapeau est à `false`, elle n'apparaît ni dans la navigation, ni dans le
 * plan du site, ni dans la page d'accueil : une rubrique Recherche vide
 * produit l'effet inverse de celui recherché.
 */
export const RECHERCHE_ACTIVE = false;

/* --------------------------------------------------------------------------
   Coordonnées
   Aucune n'est établie par le CDC. Elles sont donc marquées `a-fournir` et
   l'interface affiche une invitation à les compléter plutôt qu'un numéro
   inventé — un faux numéro sur un site d'établissement coûte des candidats.
   -------------------------------------------------------------------------- */

export const CONTACT = {
  adresse: {
    valeur: 'Agnibilékrou, District de la Comoé, Côte d’Ivoire',
    secours: 'Agnibilékrou, Côte d’Ivoire',
    statut: 'verifie',
  },
  /* `valeur` sert au lien `tel:` — sans espace, au format international.
     `affichage` est la forme lue par un humain. Les deux ne se confondent
     pas : un numéro composable et un numéro lisible ne s'écrivent pas de la
     même façon. */
  telephone: {
    valeur: '+2250719192044',
    affichage: '(+225) 07 19 19 20 44',
    secours: null,
    statut: 'verifie',
  },
  telephoneFixe: {
    valeur: '+2252735906726',
    affichage: '(+225) 27 35 90 67 26',
    secours: null,
    statut: 'verifie',
  },
  whatsapp: { valeur: null, secours: null, statut: 'a-fournir' },
  courriel: { valeur: 'info@foani-itc.com', secours: null, statut: 'verifie' },
  /* Adresses de service : l'établissement n'en a pas communiqué. On ne les
     invente pas — les demandes passent par l'adresse générale. */
  courrielAdmissions: { valeur: null, secours: null, statut: 'a-fournir' },
  courrielPresse: { valeur: null, secours: null, statut: 'a-fournir' },
  horaires: { valeur: null, secours: null, statut: 'a-fournir' },
} as const;

/**
 * §8.7 — aucun compte abandonné n'est affiché.
 *
 * `url` reste à `null` tant que l'adresse exacte de la page n'a pas été
 * transmise : le compte est alors cité, sans lien. Mieux vaut un nom qu'un
 * lien qui tombe sur une page inexistante.
 */
export const RESEAUX: readonly {
  readonly nom: string;
  readonly compte: string;
  readonly url: string | null;
}[] = [
  {
    nom: 'Facebook',
    compte: 'FOANI International Training College',
    url: null,
  },
];

/* --------------------------------------------------------------------------
   Navigation principale — §8.10
   Limitée aux entrées structurantes, et deux actions persistantes.
   -------------------------------------------------------------------------- */

export type LienNav = {
  readonly libelle: string;
  readonly href: string;
  readonly description?: string;
};

export type EntreeNav = {
  readonly libelle: string;
  /**
   * Libellé de la barre de navigation. Les intitulés du CDC §8.10 sont exacts
   * mais longs : au-delà de six entrées, « Entrepreneuriat & Carrières » pousse
   * la barre au repli sur un écran d'ordinateur portable. La forme courte tient
   * la barre, la forme longue titre le panneau — l'information n'est pas perdue.
   */
  readonly libelleCourt: string;
  readonly href: string;
  readonly resume: string;
  readonly colonnes: readonly {
    readonly titre: string;
    readonly liens: readonly LienNav[];
  }[];
};

export const NAVIGATION: readonly EntreeNav[] = [
  {
    libelle: 'L’Université',
    libelleCourt: 'L’Université',
    href: '/universite',
    resume:
      'Qui nous sommes, nos agréments, nos équipes et notre campus à Agnibilékrou.',
    colonnes: [
      {
        titre: 'Présentation',
        liens: [
          { libelle: 'Notre histoire', href: '/universite', description: 'D’où vient l’école' },
          { libelle: 'Ce en quoi nous croyons', href: '/universite#vision' },
          { libelle: 'Mot de la directrice', href: '/universite#direction' },
          { libelle: 'Qui fait quoi dans l’école', href: '/universite#gouvernance' },
        ],
      },
      {
        titre: 'Nos références',
        liens: [
          { libelle: 'Nos agréments', href: '/universite#agrements' },
          { libelle: 'Nos résultats aux examens', href: '/universite#resultats' },
          { libelle: 'L’école en chiffres', href: '/universite#chiffres' },
        ],
      },
      {
        titre: 'Les équipes',
        liens: [
          { libelle: 'Équipe pédagogique', href: '/universite/equipe' },
          { libelle: 'Nos enseignants', href: '/universite/equipe' },
          { libelle: 'Campus et infrastructures', href: '/campus#infrastructures' },
        ],
      },
    ],
  },
  {
    libelle: 'Formations',
    libelleCourt: 'Formations',
    href: '/formations',
    resume:
      'BTS, Licence, formations courtes et formation sur mesure pour les entreprises.',
    colonnes: [
      {
        titre: 'Après le bac',
        liens: [
          { libelle: 'BTS — 2 ans', href: '/formations?cycle=bts', description: 'Diplôme d’État' },
          {
            libelle: 'Licence — 3 ans',
            href: '/formations?cycle=licence',
            description: '1re année ouverte en octobre 2026',
          },
        ],
      },
      {
        titre: 'Formations courtes',
        liens: [
          {
            libelle: 'Certificats',
            href: '/formations?cycle=certificat',
            description: 'Élevage et cultures, sans diplôme requis',
          },
          { libelle: 'Modules courts', href: '/formations?cycle=masterclass', description: 'Drone, entrepreneuriat, prise de parole' },
        ],
      },
      {
        titre: 'Trouver',
        liens: [
          { libelle: 'Toutes les formations', href: '/formations' },
          { libelle: 'Quelle formation pour moi', href: '/formations#trouver' },
          { libelle: 'Comparer deux formations', href: '/formations#comparer' },
          { libelle: 'Formation pour entreprises', href: '/expertise' },
        ],
      },
    ],
  },
  {
    libelle: 'Admissions',
    libelleCourt: 'Admissions',
    href: '/admissions',
    resume: 'Comment déposer votre dossier depuis votre téléphone, sans venir sur place.',
    colonnes: [
      {
        titre: 'Candidater',
        liens: [
          { libelle: 'Comment candidater', href: '/admissions#procedure' },
          { libelle: 'Qui peut s’inscrire', href: '/admissions#conditions' },
          { libelle: 'Les dates à retenir', href: '/admissions#calendrier' },
        ],
      },
      {
        titre: 'Le coût des études',
        liens: [
          { libelle: 'Frais de scolarité', href: '/admissions#frais' },
          { libelle: 'Comment payer', href: '/admissions#reglement' },
          { libelle: 'Aides au paiement', href: '/admissions#bourses' },
        ],
      },
      {
        titre: 'Aide',
        liens: [
          { libelle: 'Questions fréquentes', href: '/admissions#faq' },
          { libelle: 'Nous poser une question', href: '/contact' },
        ],
      },
    ],
  },
  {
    libelle: 'Entrepreneuriat & Carrières',
    libelleCourt: 'Carrières',
    href: '/carrieres',
    resume: 'Stages, emploi, création d’entreprise, et l’espace réservé aux recruteurs.',
    colonnes: [
      {
        titre: 'Étudiants',
        liens: [
          { libelle: 'Aide à la recherche de stage', href: '/carrieres#centre' },
          { libelle: 'Offres de stage et d’emploi', href: '/carrieres#offres' },
          { libelle: 'Créer son entreprise', href: '/carrieres#incubation' },
          { libelle: 'Nos anciens étudiants', href: '/carrieres#alumni' },
        ],
      },
      {
        titre: 'Vous recrutez',
        liens: [
          { libelle: 'Recruter un étudiant', href: '/carrieres#recruter' },
          { libelle: 'Proposer un stage', href: '/carrieres#recruter' },
          { libelle: 'Travailler avec nous', href: '/international#partenaires' },
        ],
      },
      {
        titre: 'Coopératives et entreprises',
        liens: [
          { libelle: 'Conseil sur votre exploitation', href: '/expertise' },
          { libelle: 'Former vos équipes', href: '/expertise#continue' },
          { libelle: 'Demander un devis', href: '/expertise#devis' },
        ],
      },
    ],
  },
  {
    libelle: 'Vie du campus',
    libelleCourt: 'Campus',
    href: '/campus',
    resume: 'Logement, restauration, encadrement et vie étudiante sur le campus.',
    colonnes: [
      {
        titre: 'Vivre sur place',
        liens: [
          { libelle: 'Logement et restauration', href: '/campus#hebergement' },
          { libelle: 'Comment vous êtes encadré', href: '/campus#encadrement' },
          { libelle: 'Vie associative', href: '/campus#associations' },
          { libelle: 'Services et informations pratiques', href: '/campus#services' },
        ],
      },
      {
        titre: 'Voir le campus',
        liens: [
          { libelle: 'Campus et infrastructures', href: '/campus#infrastructures' },
          { libelle: 'Nos parcelles et élevages', href: '/campus#production' },
          { libelle: 'Galerie', href: '/campus#galerie' },
        ],
      },
      {
        titre: 'Nos engagements',
        liens: [{ libelle: 'Nos engagements envers vous', href: '/campus#engagements' }],
      },
    ],
  },
  {
    libelle: 'Actualités & Événements',
    libelleCourt: 'Actualités',
    href: '/actualites',
    resume: 'Nos nouvelles, nos rendez-vous et nos fiches techniques gratuites.',
    colonnes: [
      {
        titre: 'Publications',
        liens: [
          { libelle: 'Actualités', href: '/actualites' },
          { libelle: 'Événements', href: '/evenements' },
          { libelle: 'Espace presse', href: '/presse' },
        ],
      },
      {
        titre: 'Ressources',
        liens: [
          {
            libelle: 'Fiches techniques',
            href: '/ressources',
            description: 'Conseils gratuits, par production',
          },
          { libelle: 'International et partenariats', href: '/international' },
        ],
      },
      {
        titre: 'Nous contacter',
        liens: [
          { libelle: 'Nous écrire', href: '/contact' },
          { libelle: 'Espace numérique', href: '/espace-numerique' },
        ],
      },
    ],
  },
];

/* --------------------------------------------------------------------------
   Chiffres clés — §8.3 « datés et sourcés »
   Chaque valeur porte sa source. Aucune n'est arrondie pour l'effet.
   -------------------------------------------------------------------------- */

export const CHIFFRES_CLES: readonly ChiffreCle[] = [
  {
    valeur: '50+',
    libelle: 'ans d’expérience du groupe FOANI dans l’agriculture',
    source: 'Documentation institutionnelle, 2026',
    statut: 'verifie',
  },
  {
    valeur: '7',
    libelle: 'domaines couverts, de l’élevage à l’agribusiness',
    source: 'Catalogue de l’offre, août 2026',
    statut: 'verifie',
  },
  {
    valeur: '11',
    libelle: 'diplômes proposés, en BTS et en Licence',
    source: 'Catalogue de l’offre, août 2026',
    statut: 'verifie',
  },
  {
    valeur: '19',
    libelle: 'formations courtes ouvertes aux professionnels',
    source: 'Catalogue de l’offre, août 2026',
    statut: 'verifie',
  },
];

/* --------------------------------------------------------------------------
   Pied de page
   -------------------------------------------------------------------------- */

export const PIED_COLONNES: readonly { readonly titre: string; readonly liens: readonly LienNav[] }[] = [
  {
    titre: 'Venir étudier',
    liens: [
      { libelle: 'Toutes les formations', href: '/formations' },
      { libelle: 'Comment s’inscrire', href: '/admissions' },
      { libelle: 'Frais de scolarité', href: '/admissions#frais' },
      { libelle: 'Vie du campus', href: '/campus' },
      { libelle: 'Candidater', href: '/candidature' },
    ],
  },
  {
    titre: 'L’école',
    liens: [
      { libelle: 'L’Université', href: '/universite' },
      { libelle: 'Nos enseignants', href: '/universite/equipe' },
      { libelle: 'Nos partenaires', href: '/international' },
      { libelle: 'Actualités', href: '/actualites' },
      { libelle: 'Espace presse', href: '/presse' },
    ],
  },
  {
    titre: 'Pour les professionnels',
    liens: [
      { libelle: 'Conseil aux exploitations', href: '/expertise' },
      { libelle: 'Formation continue', href: '/expertise#continue' },
      { libelle: 'Recruter un étudiant', href: '/carrieres#recruter' },
      { libelle: 'Fiches techniques gratuites', href: '/ressources' },
      { libelle: 'Demander un devis', href: '/expertise#devis' },
    ],
  },
  {
    titre: 'Services',
    liens: [
      { libelle: 'Espace numérique', href: '/espace-numerique' },
      { libelle: 'Rechercher sur le site', href: '/recherche' },
      { libelle: 'Contact et accès', href: '/contact' },
      { libelle: 'Plan du site', href: '/plan-du-site' },
    ],
  },
];

export const PIED_LEGAL: readonly LienNav[] = [
  { libelle: 'Mentions légales', href: '/mentions-legales' },
  { libelle: 'Politique de confidentialité', href: '/confidentialite' },
  { libelle: 'Politique relative aux traceurs', href: '/traceurs' },
  { libelle: 'Accessibilité', href: '/accessibilite' },
];
