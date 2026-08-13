import type { Actualite, Evenement, Membre, OffreExpertise, QuestionReponse } from './types';

/* ==========================================================================
   Contenus institutionnels
   Tout ce qui suit relève de la parole de l'établissement. Les propositions
   rédactionnelles sont marquées `a-valider` ; l'annuaire des personnes reste
   volontairement anonyme tant que la direction n'a pas transmis les noms,
   fonctions et biographies (§8.3 : « fiche individuelle comportant fonction,
   discipline, domaines d'expertise, biographie courte »).
   ========================================================================== */

/* --------------------------------------------------------------------------
   Vision, mission et valeurs — texte officiel de l'établissement
   -------------------------------------------------------------------------- */

export const VISION = {
  titre: 'Notre vision',
  texte: [
    "Être une institution de référence en Afrique de l'Ouest dans le domaine de l'agropastoral et de l'agroalimentaire, en contribuant à faire de la Côte d'Ivoire un pôle d'excellence pour la formation des entrepreneurs agricoles en Afrique.",
    "FOANI International Training College ambitionne d'offrir à ses étudiants toutes les compétences et aptitudes nécessaires à la réussite de leur parcours académique, personnel et professionnel, dans un environnement rigoureux, inclusif et à forte dimension humaine.",
    "L'établissement s'engage à promouvoir l'égalité des chances, à garantir un climat d'apprentissage sain et sécurisé, et à protéger l'ensemble de sa communauté contre toute forme de violence physique, psychologique ou morale.",
  ],
  statut: 'verifie',
} as const;

export const MISSION = {
  titre: 'Notre mission',
  texte:
    "Former, avec exigence et qualité, des entrepreneurs agricoles africains compétents, responsables et innovants, capables de répondre efficacement aux problématiques agricoles du continent africain.",
  statut: 'verifie',
} as const;

/**
 * Les quatre valeurs sont celles de l'établissement, dans ses propres mots.
 * Le commentaire qui suit chacune est une proposition rédactionnelle : il
 * découle du texte de la vision, mais il n'en fait pas partie — d'où le
 * `statut` distinct.
 */
export const VALEURS = [
  {
    titre: 'Excellence',
    corps:
      "Une exigence tenue à chaque étape, du geste sur la parcelle à la soutenance devant le jury.",
  },
  {
    titre: 'Innovation',
    corps:
      "Drones, capteurs, culture hors-sol : les outils d'aujourd'hui, mis au service d'une agriculture qui nourrit.",
  },
  {
    titre: 'Passion',
    corps:
      "On n'entre pas dans l'agriculture par défaut. Nos formateurs transmettent d'abord le goût du métier.",
  },
  {
    titre: 'Solidarité',
    corps:
      "Un environnement inclusif et à forte dimension humaine, où chacun est protégé et où personne n'avance seul.",
  },
] as const;

export const VALEURS_STATUT = 'a-valider';

export const MOT_DIRECTION = {
  auteur: 'Aïcha Ouattara épouse Coulibaly',
  fonction: 'Directrice générale de FOANI International Training College',
  texte: [
    "La Côte d'Ivoire est une puissance agricole dont la formation n'a pas encore la dimension. Nous produisons du cacao, de l'hévéa, de l'anacarde et des vivriers en quantité, mais nous formons trop peu de techniciens capables de conduire ces productions au niveau où le marché les attend.",
    "FOANI International Training College a été créé pour cela : une université intégralement dédiée à l'agriculture, installée au milieu des exploitations plutôt qu'à distance d'elles, où l'on apprend le métier là où il se pratique.",
    "À la rentrée du 5 octobre 2026, nous ouvrons le cycle Licence en première année, aux côtés du BTS dont le diplôme est délivré par examen d'État. C'est une étape, pas un aboutissement.",
  ],
  statut: 'a-valider',
} as const;

export const AGREMENTS = [
  {
    intitule: "Agrément couvrant l'ouverture du cycle Licence",
    detail: "L'établissement dispose d'un agrément couvrant l'ouverture du cycle Licence.",
    reference: null,
    statut: 'verifie',
  },
  {
    intitule: 'Agrément au titre de la formation professionnelle',
    detail:
      "L'activité de cabinet — expertise et formation continue — s'exerce sous agrément au titre de la formation professionnelle.",
    reference: null,
    statut: 'a-valider',
  },
] as const;

export const GOUVERNANCE = [
  { instance: 'Direction générale', role: "Orientation stratégique et représentation de l'établissement." },
  { instance: 'Direction des études', role: 'Offre de formation, programmes, corps enseignant et délibérations.' },
  { instance: 'Service de la scolarité', role: 'Inscriptions, dossiers étudiants, documents administratifs.' },
  { instance: 'Service des admissions', role: 'Instruction des candidatures et décisions d’admission.' },
  { instance: 'Direction du campus et des exploitations', role: 'Infrastructures, parcelles et unités de production.' },
  { instance: 'Cabinet d’expertise et formation continue', role: 'Prestations auprès des organisations et des entreprises.' },
] as const;

/* --------------------------------------------------------------------------
   Annuaire — §8.3
   -------------------------------------------------------------------------- */

export const EQUIPE: readonly Membre[] = [
  {
    slug: 'responsable-production-animale',
    nom: null,
    fonction: 'Responsable pédagogique — Production animale',
    discipline: 'Zootechnie',
    expertises: ['Conduite d’élevage', 'Alimentation animale', 'Prophylaxie'],
    biographie: null,
    statut: 'a-fournir',
  },
  {
    slug: 'responsable-production-vegetale',
    nom: null,
    fonction: 'Responsable pédagogique — Production végétale',
    discipline: 'Agronomie',
    expertises: ['Cultures pérennes', 'Protection des cultures', 'Itinéraires techniques'],
    biographie: null,
    statut: 'a-fournir',
  },
  {
    slug: 'responsable-agroalimentaire',
    nom: null,
    fonction: 'Responsable pédagogique — Industrie agroalimentaire',
    discipline: 'Génie des procédés',
    expertises: ['Procédés de transformation', 'Qualité et HACCP'],
    biographie: null,
    statut: 'a-fournir',
  },
  {
    slug: 'responsable-agribusiness',
    nom: null,
    fonction: 'Responsable pédagogique — Agribusiness',
    discipline: 'Économie rurale',
    expertises: ['Chaînes de valeur', 'Financement agricole', 'Gestion d’exploitation'],
    biographie: null,
    statut: 'a-fournir',
  },
  {
    slug: 'referent-carrieres',
    nom: null,
    fonction: 'Référent carrières et relations entreprises',
    discipline: 'Insertion professionnelle',
    expertises: ['Stages', 'Insertion', 'Relations entreprises'],
    biographie: null,
    statut: 'a-fournir',
  },
  {
    slug: 'referent-scolarite',
    nom: null,
    fonction: 'Responsable de la scolarité',
    discipline: 'Administration scolaire',
    expertises: ['Inscriptions', 'Dossiers étudiants', 'Documents administratifs'],
    biographie: null,
    statut: 'a-fournir',
  },
];

/* --------------------------------------------------------------------------
   Campus — §8.4
   -------------------------------------------------------------------------- */

export const CAMPUS_RUBRIQUES = [
  {
    id: 'hebergement',
    titre: 'Hébergement et restauration',
    corps:
      "L'établissement accueille des étudiants venus de l'ensemble du pays. Les conditions d'hébergement, la capacité disponible et l'organisation de la restauration sont en cours de description par la direction du campus.",
    statut: 'a-fournir',
  },
  {
    id: 'encadrement',
    titre: 'Encadrement et accompagnement',
    corps:
      "Chaque promotion dispose d'un référent pédagogique. L'accompagnement couvre le suivi des acquis, la préparation des stages et l'orientation en fin de cycle.",
    statut: 'a-valider',
  },
  {
    id: 'infrastructures',
    titre: 'Campus et infrastructures',
    corps:
      "Salles de cours, laboratoires, ateliers de transformation, parcelles et unités de production constituent le support quotidien de l'enseignement. L'inventaire détaillé et les photographies sont à fournir par l'établissement.",
    statut: 'a-fournir',
  },
  {
    id: 'production',
    titre: 'Parcelles et unités de production',
    corps:
      "Les surfaces cultivées et les ateliers d'élevage du campus servent de support aux travaux pratiques : les étudiants y travaillent sur des productions réelles, pas sur des parcelles de démonstration.",
    statut: 'a-fournir',
  },
  {
    id: 'associations',
    titre: 'Vie associative et activités',
    corps:
      "Les associations étudiantes, les activités sportives et culturelles sont recensées et présentées ici dès transmission par le service de la vie étudiante.",
    statut: 'a-fournir',
  },
  {
    id: 'services',
    titre: 'Services et informations pratiques',
    corps:
      "Accueil, assistance, santé et accompagnement social : les services effectivement offerts sont présentés ici, sans en annoncer aucun qui ne serait pas en place.",
    statut: 'a-fournir',
  },
] as const;

/**
 * Les trois engagements reprennent, en langue de lecteur, la dernière phrase
 * du texte officiel de la vision : « promouvoir l'égalité des chances,
 * garantir un climat d'apprentissage sain et sécurisé, et protéger l'ensemble
 * de sa communauté contre toute forme de violence physique, psychologique ou
 * morale ». Ils sont donc établis, et non plus proposés.
 */
export const ENGAGEMENTS = [
  {
    titre: 'Égalité des chances',
    corps:
      "Nous recrutons sur le dossier et sur le projet, rien d'autre. L'établissement s'engage à promouvoir l'égalité des chances.",
  },
  {
    titre: 'Un climat sain et sécurisé',
    corps:
      "L'établissement s'engage à garantir un climat d'apprentissage sain et sécurisé à tous ceux qui étudient et travaillent ici.",
  },
  {
    titre: 'Protection de tous',
    corps:
      "Toute la communauté est protégée contre les violences physiques, psychologiques et morales. C'est un engagement écrit, pas une intention.",
  },
] as const;

/* --------------------------------------------------------------------------
   Actualités et événements — §8.7
   -------------------------------------------------------------------------- */

export const ACTUALITES: readonly Actualite[] = [
  {
    slug: 'ouverture-cycle-licence-rentree-2026',
    titre: 'Le cycle Licence ouvre en première année à la rentrée 2026',
    categorie: 'Institution',
    date: '2026-08-01',
    chapo:
      "FOANI-ITC ouvre la première année de Licence aux bacheliers. Le BTS, dont le diplôme est délivré par examen d'État, continue en parallèle.",
    corps: [
      "L'établissement dispose d'un agrément couvrant l'ouverture du cycle Licence. Sept parcours sont proposés en première année, de la production animale à l'agribusiness, en passant par la technologie et l'agriculture intelligente.",
      "Le cycle dure trois ans et s'adresse aux bacheliers. Il vient compléter le BTS, qui reste ouvert et se termine par un examen d'État.",
      "Les candidatures s'effectuent en ligne, depuis un téléphone, sans déplacement à Agnibilékrou. La rentrée est fixée au 5 octobre 2026.",
    ],
    statut: 'a-valider',
  },
  {
    slug: 'candidatures-en-ligne-ouvertes',
    titre: 'Les candidatures en ligne sont ouvertes',
    categorie: 'Admissions',
    date: '2026-08-10',
    chapo:
      "Le portail de candidature permet de déposer un dossier complet depuis un téléphone, pièces justificatives comprises.",
    corps: [
      "Le dépôt s'effectue en plusieurs étapes courtes, avec enregistrement automatique du brouillon : une candidature interrompue par une coupure de réseau se reprend là où elle s'est arrêtée.",
      "Les frais de dossier se règlent par paiement mobile vers un numéro officiel de l'établissement. Le candidat saisit la référence de la transaction, que l'administration rapproche de son relevé.",
      "Chaque changement d'état du dossier donne lieu à une notification par courriel et par message court.",
    ],
    statut: 'a-valider',
  },
  {
    slug: 'ressources-agricoles-premieres-fiches',
    titre: 'Les premières fiches techniques agricoles sont en ligne',
    categorie: 'Ressources',
    date: '2026-08-12',
    chapo:
      "Calendrier cultural du cacaoyer, démarrage d'un atelier avicole, qualité de l'eau en pisciculture : une rubrique technique ouverte à tous.",
    corps: [
      "Ces fiches s'adressent aux producteurs et porteurs de projet autant qu'aux étudiants. Elles seront enrichies au fil des campagnes.",
      "Chaque fiche renvoie vers la formation qui approfondit le sujet, du certificat court au cursus diplômant.",
    ],
    statut: 'a-valider',
  },
];

export const EVENEMENTS: readonly Evenement[] = [
  {
    slug: 'rentree-academique-2026',
    titre: 'Rentrée académique 2026',
    date: '2026-10-05',
    lieu: 'Campus de FOANI-ITC, Agnibilékrou',
    resume:
      "Accueil des nouvelles promotions de BTS et de la première promotion de Licence. Présentation des cursus, des équipes et du campus.",
    inscriptionRequise: false,
    statut: 'verifie',
  },
  {
    slug: 'journee-portes-ouvertes',
    titre: 'Journée portes ouvertes',
    date: null,
    lieu: 'Campus de FOANI-ITC, Agnibilékrou',
    resume:
      "Visite des parcelles, des ateliers et des laboratoires, rencontre avec les responsables pédagogiques et information sur les admissions. Date à confirmer par l'établissement.",
    inscriptionRequise: true,
    statut: 'a-fournir',
  },
];

/* --------------------------------------------------------------------------
   Expertise et formation continue — §6.4 et §8.5
   -------------------------------------------------------------------------- */

export const EXPERTISES: readonly OffreExpertise[] = [
  {
    slug: 'installation-rehabilitation-exploitations-vegetales',
    intitule: "Installation et réhabilitation d'exploitations agricoles végétales",
    volet: 'vegetale',
    resume:
      "Étude de site, choix des spéculations, conception du parcellaire et accompagnement de la mise en culture.",
    prestations: [
      'Diagnostic de site et étude de faisabilité',
      'Plan de masse et organisation du parcellaire',
      'Choix des spéculations et du matériel végétal',
      'Accompagnement de la première campagne',
    ],
  },
  {
    slug: 'gestion-integree-fertilite-sols',
    intitule: 'Gestion intégrée de la fertilité des sols',
    volet: 'vegetale',
    resume: "Analyse de sol, plan de fertilisation et itinéraire de restauration de la fertilité.",
    prestations: [
      'Prélèvement et interprétation d’analyses de sol',
      'Plan de fertilisation par parcelle et par culture',
      'Programme de restauration des sols dégradés',
      'Formation des équipes aux pratiques retenues',
    ],
  },
  {
    slug: 'appui-production-semences-plants',
    intitule: 'Appui à la production de semences et plants',
    volet: 'vegetale',
    resume: "Mise en place et conduite de pépinières et de parcelles de production de matériel végétal.",
    prestations: [
      'Conception et installation de pépinière',
      'Conduite technique de la production de plants',
      'Contrôle sanitaire du matériel végétal',
      'Organisation de la distribution aux producteurs',
    ],
  },
  {
    slug: 'suivi-technique-rendements',
    intitule: 'Suivi technique et amélioration des rendements',
    volet: 'vegetale',
    resume: "Diagnostic des écarts de rendement et mise en œuvre d'un plan d'amélioration mesurable.",
    prestations: [
      'Diagnostic agronomique de l’exploitation',
      'Identification des facteurs limitants',
      'Plan d’amélioration chiffré et calendrier',
      'Suivi de campagne et évaluation des résultats',
    ],
  },
  {
    slug: 'installation-organisation-elevages',
    intitule: "Installation et organisation d'exploitations d'élevage",
    volet: 'animale',
    resume: "Conception des bâtiments, dimensionnement du cheptel et organisation du travail.",
    prestations: [
      'Étude de site et conception des bâtiments',
      'Dimensionnement du cheptel et du plan de charge',
      'Organisation du travail et des circuits de biosécurité',
      'Accompagnement au démarrage',
    ],
  },
  {
    slug: 'sante-animale-prophylaxie',
    intitule: 'Appui technique à la santé animale et à la prophylaxie',
    volet: 'animale',
    resume: "Élaboration et conduite de programmes de prophylaxie, dont l'appui à la vaccination.",
    prestations: [
      'Diagnostic sanitaire du cheptel',
      'Programme de prophylaxie et calendrier de vaccination',
      'Appui aux campagnes de vaccination',
      'Formation des éleveurs aux gestes courants',
    ],
  },
  {
    slug: 'alimentation-nutrition-animale',
    intitule: "Appui à l'alimentation et à la nutrition animale",
    volet: 'animale',
    resume: "Formulation de rations à partir des ressources locales et contrôle de leur mise en œuvre.",
    prestations: [
      'Inventaire des ressources alimentaires disponibles',
      'Formulation de rations par stade physiologique',
      'Organisation de la fabrication à la ferme',
      'Contrôle des performances et ajustement',
    ],
  },
  {
    slug: 'suivi-zootechnique-performances',
    intitule: 'Suivi zootechnique et amélioration des performances',
    volet: 'animale',
    resume: "Mise en place des enregistrements, analyse des indicateurs et plan de progrès.",
    prestations: [
      'Mise en place du suivi et des enregistrements',
      'Analyse des indicateurs de performance',
      'Plan d’amélioration et objectifs chiffrés',
      'Évaluation périodique des résultats',
    ],
  },
  {
    slug: 'transformation-valorisation-produits-animaux',
    intitule: 'Appui à la transformation et à la valorisation des produits animaux',
    volet: 'animale',
    resume: "Conception d'ateliers de transformation et accompagnement de la mise en marché.",
    prestations: [
      'Étude de faisabilité de l’atelier',
      'Conception et équipement',
      'Procédés, hygiène et qualité',
      'Accompagnement à la commercialisation',
    ],
  },
];

/* --------------------------------------------------------------------------
   Questions fréquentes — admissions
   -------------------------------------------------------------------------- */

export const FAQ_ADMISSIONS: readonly QuestionReponse[] = [
  {
    question: 'Faut-il se déplacer à Agnibilékrou pour candidater ?',
    reponse:
      "Non. Tout se fait en ligne depuis votre téléphone : le compte, le dossier, les documents et le suivi.",
  },
  {
    question: 'Quand a lieu la rentrée ?',
    reponse: 'La rentrée académique est fixée au 5 octobre 2026.',
  },
  {
    question: 'Comment se règlent les frais de dossier ?',
    reponse:
      "Par paiement mobile, vers un numéro officiel de l'école. Vous recopiez ensuite la référence du transfert dans votre dossier. Nous la vérifions sur notre relevé, puis nous validons. Une référence déjà utilisée est refusée.",
  },
  {
    question: 'Quel est le montant des frais de scolarité ?',
    reponse:
      "Les montants sont en cours de validation par la direction. Écrivez-nous : nous vous envoyons les tarifs de la formation qui vous intéresse.",
  },
  {
    question: "Que se passe-t-il si le réseau coupe pendant ma candidature ?",
    reponse:
      "Rien n'est perdu. Votre dossier est enregistré à chaque étape. Vous reprenez où vous vous étiez arrêté, depuis le même téléphone ou un autre.",
  },
  {
    question: 'Puis-je candidater à deux formations ?',
    reponse:
      "Oui. Vous indiquez un premier choix et un second. Nous examinons le premier d'abord.",
  },
  {
    question: "Quelles pièces dois-je fournir ?",
    reponse:
      "La liste exacte vous est affichée avant le dépôt. Vous pouvez photographier vos documents avec votre téléphone : le site vérifie le format tout seul.",
  },
  {
    question: 'Je suis déjà étudiant à FOANI-ITC. Dois-je candidater à nouveau ?',
    reponse:
      "Non. Si vous êtes déjà étudiant ici, vous vous réinscrivez depuis votre espace étudiant, au niveau décidé par le jury.",
  },
];

export const ETAPES_CANDIDATURE = [
  {
    numero: '01',
    titre: 'Créez votre compte',
    corps: "Avec votre numéro de téléphone ou votre adresse électronique.",
  },
  {
    numero: '02',
    titre: 'Choisissez votre formation',
    corps: "Un premier choix, et un second si vous hésitez entre deux.",
  },
  {
    numero: '03',
    titre: 'Remplissez votre dossier',
    corps: "En plusieurs étapes courtes. Tout est enregistré au fur et à mesure : vous pouvez vous arrêter et reprendre plus tard.",
  },
  {
    numero: '04',
    titre: 'Ajoutez vos documents',
    corps: "Photographiez-les avec votre téléphone. Le site vérifie le format et allège les images.",
  },
  {
    numero: '05',
    titre: 'Relisez et envoyez',
    corps: "Un résumé complet vous est montré avant l'envoi définitif.",
  },
  {
    numero: '06',
    titre: 'Suivez votre dossier',
    corps: "Vous recevez un numéro de dossier. À chaque étape, nous vous prévenons par message.",
  },
] as const;

export const POURQUOI_FITC = [
  {
    titre: 'Apprentissage concret',
    corps: 'Sur le terrain et en laboratoire, dès la première année.',
    icone: 'sprout',
  },
  {
    titre: 'Encadrement expert',
    corps: 'Des enseignants qui viennent du métier, disponibles et à l’écoute.',
    icone: 'teacher',
  },
  {
    titre: 'Innovation agricole',
    corps: 'Drones, capteurs, culture hors-sol : les outils d’aujourd’hui.',
    icone: 'idea',
  },
  {
    titre: 'Insertion professionnelle',
    corps: 'Stages, contacts avec les entreprises, aide à la création d’activité.',
    icone: 'briefcase',
  },
] as const;
