import type { Cycle, Domaine, Formation, Modalite, Statut } from './types';

/* ==========================================================================
   Catalogue de l'offre — Annexe A du CDC
   --------------------------------------------------------------------------
   Les intitulés sont repris mot pour mot de l'annexe : ce sont des
   dénominations de diplôme, elles ne se reformulent pas.

   Ce qui est établi par le CDC :
     — BTS sur deux ans, sanctionné par un examen d'État (§6.2)
     — Licence sur trois ans, ouverture en première année (§6.2)
     — Agrément couvrant l'ouverture du cycle Licence (§2.1)
   Ce qui ne l'est pas, et reste donc `null` ou `a-fournir` :
     — durées des formations courtes, tarifs, conditions d'admission,
       calendrier des sessions (Annexe A, « Informations manquantes »).

   Les objectifs, compétences et débouchés sont des propositions
   rédactionnelles (`a-valider`) : elles rendent le site démontrable et
   servent de base de travail à l'établissement, qui reste propriétaire
   éditorial de sa parole (CDC §8, §26).
   ========================================================================== */

const LIEU = 'Campus de FOANI-ITC, Agnibilékrou';
const LANGUE = 'Français';

const BASE = {
  lieu: LIEU,
  langue: LANGUE,
  echeancier: null,
  responsable: null,
} as const;

/** Fabrique commune aux formations courtes, dont la fiche est plus légère. */
function courte(input: {
  slug: string;
  intitule: string;
  cycle: Extract<Cycle, 'certificat' | 'masterclass'>;
  domaines: readonly Domaine[];
  resume: string;
  objectifs: readonly string[];
  competences: readonly string[];
  debouches: readonly string[];
  modalite?: Modalite;
  niveauRequis?: string;
  niveauRequisStatut?: Statut;
}): Formation {
  return {
    ...BASE,
    slug: input.slug,
    intitule: input.intitule,
    cycle: input.cycle,
    domaines: input.domaines,
    diplome:
      input.cycle === 'certificat'
        ? "Certificat d'initiation ou de perfectionnement"
        : 'Attestation de participation',
    dureeMois: null,
    dureeStatut: 'a-fournir',
    niveauRequis: input.niveauRequis ?? 'Ouvert sans condition de diplôme',
    niveauRequisStatut: input.niveauRequisStatut ?? 'a-valider',
    resume: input.resume,
    objectifs: input.objectifs,
    competences: input.competences,
    programme: null,
    debouches: input.debouches,
    poursuites: ['Passerelle possible vers un cursus diplômant de FOANI-ITC.'],
    modalite: input.modalite ?? 'terrain',
    fraisXof: null,
    agrementRef: null,
    faq: [],
    statut: 'a-valider',
  };
}

/* --------------------------------------------------------------------------
   Brevet de Technicien Supérieur — deux ans, examen d'État
   -------------------------------------------------------------------------- */

const BTS: readonly Formation[] = [
  {
    ...BASE,
    slug: 'bts-agriculture-tropicale-production-animale',
    intitule: 'Agriculture tropicale',
    option: 'Production animale',
    cycle: 'bts',
    domaines: ['production-animale'],
    diplome: "Brevet de Technicien Supérieur, sanctionné par un examen d'État",
    dureeMois: 24,
    dureeStatut: 'verifie',
    niveauRequis: 'Baccalauréat, toutes séries scientifiques et techniques',
    niveauRequisStatut: 'a-valider',
    resume:
      "Conduire un atelier d'élevage tropical, de la conception des bâtiments au suivi zootechnique et sanitaire du troupeau.",
    objectifs: [
      "Maîtriser la conduite technique des principales spéculations animales de la zone forestière ivoirienne.",
      "Assurer le suivi sanitaire et la prophylaxie d'un cheptel en respectant la réglementation vétérinaire.",
      "Formuler et rationner une alimentation à partir des ressources localement disponibles.",
      "Tenir les documents d'élevage et interpréter les indicateurs de performance d'un atelier.",
    ],
    competences: [
      "Conception et dimensionnement d'un bâtiment d'élevage",
      'Conduite de la reproduction et de la sélection',
      'Prophylaxie, vaccination et détection des affections courantes',
      'Formulation alimentaire et contrôle de la ration',
      'Suivi zootechnique, enregistrement et analyse des performances',
      "Gestion technico-économique d'un atelier de production",
    ],
    programme: [
      {
        annee: 'Première année',
        modules: [
          'Zootechnie générale et anatomie-physiologie animale',
          'Alimentation et nutrition animale',
          'Bâtiments, équipements et biosécurité',
          'Agrostologie et production fourragère',
          'Mathématiques appliquées, statistiques et informatique',
          'Français, anglais technique et communication professionnelle',
          "Stage d'immersion en exploitation",
        ],
      },
      {
        annee: 'Deuxième année',
        modules: [
          'Zootechnie spéciale : volailles, porcins, ruminants, espèces non conventionnelles',
          'Pathologie, prophylaxie et pharmacie vétérinaire',
          'Reproduction et amélioration génétique',
          "Gestion technico-économique de l'atelier",
          'Transformation et valorisation des produits animaux',
          'Entrepreneuriat agricole et montage de projet',
          'Stage professionnel et mémoire technique',
        ],
      },
    ],
    debouches: [
      "Technicien supérieur d'élevage en exploitation ou en coopérative",
      "Chef d'atelier avicole, porcin ou piscicole",
      "Conseiller technique en production animale auprès d'organisations professionnelles",
      "Technicien en firme d'aliments du bétail ou en distribution d'intrants vétérinaires",
      "Créateur et gérant d'une exploitation d'élevage",
    ],
    poursuites: [
      'Licence Production animale et soins vétérinaires de FOANI-ITC',
      "Licence professionnelle en agronomie ou en agrobusiness dans un établissement partenaire",
    ],
    modalite: 'terrain',
    fraisXof: null,
    agrementRef: null,
    faq: [
      {
        question: "Faut-il un baccalauréat scientifique pour candidater ?",
        reponse:
          "Les conditions d'admission par série de baccalauréat sont en cours de validation par la direction des études. Contactez le service des admissions pour connaître celles qui s'appliquent à votre situation.",
      },
      {
        question: 'La formation comporte-t-elle des stages ?',
        reponse:
          "Oui. Le cursus articule un stage d'immersion en fin de première année et un stage professionnel en deuxième année, donnant lieu à un mémoire technique soutenu devant jury.",
      },
    ],
    statut: 'a-valider',
  },
  {
    ...BASE,
    slug: 'bts-agriculture-tropicale-production-vegetale',
    intitule: 'Agriculture tropicale',
    option: 'Production végétale',
    cycle: 'bts',
    domaines: ['production-vegetale'],
    diplome: "Brevet de Technicien Supérieur, sanctionné par un examen d'État",
    dureeMois: 24,
    dureeStatut: 'verifie',
    niveauRequis: 'Baccalauréat, toutes séries scientifiques et techniques',
    niveauRequisStatut: 'a-valider',
    resume:
      "Conduire un itinéraire technique complet, des cultures pérennes de rente aux cultures vivrières et maraîchères.",
    objectifs: [
      "Maîtriser les itinéraires techniques des cultures pérennes et annuelles de la zone forestière.",
      'Diagnostiquer un état sanitaire de parcelle et arrêter une stratégie de protection raisonnée.',
      "Interpréter une analyse de sol et construire un plan de fertilisation.",
      "Organiser les opérations de récolte, de conditionnement et de mise en marché.",
    ],
    competences: [
      'Établissement et conduite de pépinières',
      'Itinéraires techniques du cacao, de l’hévéa, de l’anacarde et des vivriers',
      'Diagnostic phytosanitaire et protection intégrée',
      'Fertilisation raisonnée et gestion de la matière organique',
      'Mécanisation adaptée aux petites et moyennes exploitations',
      'Récolte, post-récolte et qualité des produits',
    ],
    programme: [
      {
        annee: 'Première année',
        modules: [
          'Agronomie générale, climatologie et pédologie',
          'Biologie végétale et physiologie de la production',
          'Techniques de pépinière et matériel végétal',
          'Fertilisation et amendements',
          'Mathématiques appliquées, statistiques et informatique',
          'Français, anglais technique et communication professionnelle',
          "Stage d'immersion en exploitation",
        ],
      },
      {
        annee: 'Deuxième année',
        modules: [
          'Cultures pérennes : cacao, hévéa, anacarde, palmier',
          'Cultures vivrières et maraîchères',
          'Protection des cultures et gestion intégrée des bioagresseurs',
          'Machinisme et équipements agricoles',
          'Post-récolte, conditionnement et qualité',
          'Entrepreneuriat agricole et montage de projet',
          'Stage professionnel et mémoire technique',
        ],
      },
    ],
    debouches: [
      "Technicien supérieur de production végétale en exploitation ou en plantation",
      'Encadreur technique en coopérative ou en organisation de producteurs',
      "Conseiller en protection des cultures et en intrants agricoles",
      "Technicien de programme de développement agricole",
      "Créateur et gérant d'une exploitation végétale",
    ],
    poursuites: [
      'Licence Production végétale et protection des cultures de FOANI-ITC',
      'Licence Fertilisation et gestion durable des sols de FOANI-ITC',
    ],
    modalite: 'terrain',
    fraisXof: null,
    agrementRef: null,
    faq: [
      {
        question: 'Les travaux pratiques se déroulent-ils sur des parcelles réelles ?',
        reponse:
          "La formation s'appuie sur les parcelles et unités de production du campus. Le détail des surfaces et des spéculations disponibles est en cours de description par l'établissement.",
      },
    ],
    statut: 'a-valider',
  },
  {
    ...BASE,
    slug: 'bts-industrie-agroalimentaire-production',
    intitule: 'Industrie agroalimentaire et chimique',
    option: 'Production',
    cycle: 'bts',
    domaines: ['agroalimentaire'],
    diplome: "Brevet de Technicien Supérieur, sanctionné par un examen d'État",
    dureeMois: 24,
    dureeStatut: 'verifie',
    niveauRequis: 'Baccalauréat scientifique ou technique',
    niveauRequisStatut: 'a-valider',
    resume:
      "Conduire une ligne de transformation agroalimentaire, de la réception de la matière première au produit conditionné.",
    objectifs: [
      "Conduire et régler les équipements d'une ligne de transformation.",
      "Appliquer les procédés de conservation adaptés à chaque matrice alimentaire.",
      "Mettre en œuvre les règles d'hygiène et de sécurité alimentaire en atelier.",
      "Participer à l'optimisation des rendements et à la réduction des pertes.",
    ],
    competences: [
      'Conduite de procédés thermiques, de séchage et de fermentation',
      'Réglage et maintenance de premier niveau des équipements',
      'Application des bonnes pratiques d’hygiène et de fabrication',
      'Traçabilité et enregistrement de production',
      'Conditionnement, emballage et étiquetage réglementaire',
      'Gestion des flux et des stocks en atelier',
    ],
    programme: [
      {
        annee: 'Première année',
        modules: [
          'Chimie générale et biochimie alimentaire',
          'Microbiologie alimentaire',
          'Opérations unitaires du génie des procédés',
          'Matières premières agricoles ivoiriennes',
          'Mathématiques, statistiques et informatique industrielle',
          'Français, anglais technique et communication professionnelle',
          "Stage d'immersion en atelier",
        ],
      },
      {
        annee: 'Deuxième année',
        modules: [
          'Procédés de transformation : cacao, anacarde, céréales, fruits et légumes',
          'Hygiène, sécurité alimentaire et méthode HACCP',
          'Maintenance industrielle et automatismes',
          'Conditionnement, emballage et logistique',
          'Gestion de production et amélioration continue',
          'Entrepreneuriat et montage d’unité de transformation',
          'Stage professionnel et mémoire technique',
        ],
      },
    ],
    debouches: [
      'Technicien de production en unité agroalimentaire',
      'Conducteur de ligne et chef d’équipe atelier',
      'Technicien de maintenance en industrie alimentaire',
      "Responsable d'une unité artisanale de transformation",
    ],
    poursuites: ["Licence Ingénierie de la transformation des aliments de FOANI-ITC"],
    modalite: 'presentiel',
    fraisXof: null,
    agrementRef: null,
    faq: [],
    statut: 'a-valider',
  },
  {
    ...BASE,
    slug: 'bts-industrie-agroalimentaire-controle',
    intitule: 'Industrie agroalimentaire et chimique',
    option: 'Contrôle',
    cycle: 'bts',
    domaines: ['agroalimentaire'],
    diplome: "Brevet de Technicien Supérieur, sanctionné par un examen d'État",
    dureeMois: 24,
    dureeStatut: 'verifie',
    niveauRequis: 'Baccalauréat scientifique ou technique',
    niveauRequisStatut: 'a-valider',
    resume:
      "Garantir la conformité d'un produit alimentaire par l'analyse de laboratoire et le contrôle qualité en ligne.",
    objectifs: [
      "Réaliser les analyses physico-chimiques et microbiologiques courantes d'un produit alimentaire.",
      "Interpréter un résultat d'analyse au regard d'une norme ou d'un cahier des charges.",
      'Participer à la mise en place et au suivi d’un système de management de la qualité.',
      'Documenter un contrôle et rédiger un rapport exploitable par la production.',
    ],
    competences: [
      'Prélèvement, échantillonnage et préparation d’échantillons',
      'Analyses physico-chimiques de laboratoire',
      'Analyses microbiologiques et lecture de résultats',
      'Application des référentiels qualité et de la méthode HACCP',
      'Métrologie et étalonnage des appareils de mesure',
      'Rédaction de rapports de contrôle et de non-conformité',
    ],
    programme: [
      {
        annee: 'Première année',
        modules: [
          'Chimie analytique et instrumentation',
          'Microbiologie générale et alimentaire',
          'Biochimie des constituants alimentaires',
          'Statistiques appliquées au contrôle qualité',
          'Français, anglais technique et communication professionnelle',
          "Stage d'immersion en laboratoire",
        ],
      },
      {
        annee: 'Deuxième année',
        modules: [
          'Analyses spécialisées par filière de produit',
          'Systèmes de management de la qualité et normes applicables',
          'Méthode HACCP et plans de maîtrise sanitaire',
          'Métrologie, validation de méthode et incertitudes',
          'Réglementation alimentaire et étiquetage',
          'Stage professionnel et mémoire technique',
        ],
      },
    ],
    debouches: [
      'Technicien de laboratoire de contrôle qualité',
      'Technicien qualité en unité agroalimentaire',
      'Agent de contrôle en organisme de certification ou d’inspection',
      'Technicien en laboratoire d’analyse agricole ou environnementale',
    ],
    poursuites: ["Licence Ingénierie de la transformation des aliments de FOANI-ITC"],
    modalite: 'presentiel',
    fraisXof: null,
    agrementRef: null,
    faq: [],
    statut: 'a-valider',
  },
];

/* --------------------------------------------------------------------------
   Licence — trois ans. Ouverture de la première année à la rentrée 2026.
   -------------------------------------------------------------------------- */

const AGREMENT_LICENCE = "Agrément couvrant l'ouverture du cycle Licence — référence à publier";

function licence(input: {
  slug: string;
  intitule: string;
  domaines: readonly Domaine[];
  resume: string;
  objectifs: readonly string[];
  competences: readonly string[];
  programme: readonly { annee: string; modules: readonly string[] }[];
  debouches: readonly string[];
  modalite?: Modalite;
}): Formation {
  return {
    ...BASE,
    slug: input.slug,
    intitule: input.intitule,
    cycle: 'licence',
    domaines: input.domaines,
    diplome: 'Licence',
    dureeMois: 36,
    dureeStatut: 'verifie',
    niveauRequis: 'Baccalauréat',
    niveauRequisStatut: 'a-valider',
    resume: input.resume,
    objectifs: input.objectifs,
    competences: input.competences,
    programme: input.programme,
    debouches: input.debouches,
    poursuites: [
      "Master, sous réserve de l'ouverture effective du cycle par l'établissement.",
      'Master en école ou université partenaire, en Côte d’Ivoire ou à l’international.',
    ],
    modalite: input.modalite ?? 'terrain',
    fraisXof: null,
    agrementRef: AGREMENT_LICENCE,
    faq: [
      {
        question: 'La première année de Licence ouvre-t-elle à la rentrée 2026 ?',
        reponse:
          "Oui. L'établissement dispose d'un agrément couvrant l'ouverture du cycle Licence et ouvre la première année aux bacheliers à la rentrée du 5 octobre 2026.",
      },
      {
        question: 'Puis-je intégrer directement la deuxième année après un BTS ?',
        reponse:
          "Les conditions d'admission par équivalence sont en cours de validation par la direction des études. Adressez votre demande au service des admissions : elle sera examinée dès que les règles seront publiées.",
      },
    ],
    statut: 'a-valider',
  };
}

const LICENCES: readonly Formation[] = [
  licence({
    slug: 'licence-production-animale-soins-veterinaires',
    intitule: 'Production animale et soins vétérinaires',
    domaines: ['production-animale'],
    resume:
      "Piloter des systèmes d'élevage performants et assurer le suivi sanitaire des cheptels en zone tropicale.",
    objectifs: [
      "Concevoir et piloter un système d'élevage adapté au contexte agroécologique ivoirien.",
      'Assurer la conduite sanitaire d’un cheptel et la prévention des maladies dominantes.',
      "Optimiser les performances zootechniques par l'alimentation, la génétique et la conduite.",
      "Encadrer une équipe et rendre compte des résultats technico-économiques d'un atelier.",
    ],
    competences: [
      'Diagnostic zootechnique et sanitaire d’un troupeau',
      'Conduite de la reproduction et schémas d’amélioration génétique',
      'Formulation alimentaire assistée et contrôle des rations',
      'Plan de prophylaxie et gestion de la pharmacie d’élevage',
      'Conception de bâtiments et maîtrise de la biosécurité',
      'Pilotage technico-économique et encadrement d’équipe',
    ],
    programme: [
      {
        annee: 'Première année',
        modules: [
          'Anatomie, physiologie et zootechnie générale',
          'Alimentation et nutrition animale',
          'Microbiologie et parasitologie',
          'Agrostologie et systèmes fourragers',
          'Statistiques, informatique et méthodologie',
          'Anglais scientifique et communication',
        ],
      },
      {
        annee: 'Deuxième année',
        modules: [
          'Zootechnie spéciale par espèce',
          'Pathologie animale et sémiologie',
          'Pharmacologie et prophylaxie',
          'Reproduction et génétique appliquée',
          'Biosécurité et gestion des bâtiments',
          'Stage technique en exploitation',
        ],
      },
      {
        annee: 'Troisième année',
        modules: [
          'Systèmes d’élevage et agroécologie',
          'Qualité et sécurité sanitaire des produits animaux',
          'Économie de l’élevage et gestion d’entreprise',
          'Réglementation vétérinaire et santé publique',
          'Projet professionnel et entrepreneuriat',
          'Stage de fin de cycle et mémoire',
        ],
      },
    ],
    debouches: [
      "Responsable d'exploitation d'élevage",
      'Conseiller technique en production animale',
      "Chargé d'appui-conseil en coopérative ou en projet de développement",
      'Technico-commercial en santé et nutrition animales',
      'Entrepreneur agricole en production animale',
    ],
  }),
  licence({
    slug: 'licence-production-vegetale-protection-cultures',
    intitule: 'Production végétale et protection des cultures',
    domaines: ['production-vegetale'],
    resume:
      "Concevoir des itinéraires techniques performants et maîtriser la protection intégrée des cultures tropicales.",
    objectifs: [
      "Concevoir un itinéraire technique adapté à une culture, un sol et un climat donnés.",
      'Identifier les bioagresseurs dominants et arrêter une stratégie de protection intégrée.',
      "Évaluer la performance d'un système de culture et proposer des voies d'amélioration.",
      'Conduire un essai agronomique et en restituer les résultats.',
    ],
    competences: [
      'Diagnostic agronomique de parcelle et d’exploitation',
      'Conception d’itinéraires techniques et de rotations',
      'Identification des ravageurs, maladies et adventices',
      'Protection intégrée et usage raisonné des produits phytosanitaires',
      'Expérimentation agronomique et analyse de données',
      'Conseil technique et vulgarisation auprès des producteurs',
    ],
    programme: [
      {
        annee: 'Première année',
        modules: [
          'Agronomie générale et pédologie',
          'Biologie et physiologie végétales',
          'Climatologie et bioclimatologie tropicale',
          'Fertilisation et amendements',
          'Statistiques, informatique et méthodologie',
          'Anglais scientifique et communication',
        ],
      },
      {
        annee: 'Deuxième année',
        modules: [
          'Cultures pérennes de rente',
          'Cultures vivrières et maraîchères',
          'Phytopathologie et entomologie agricole',
          'Malherbologie et gestion des adventices',
          'Machinisme et équipements',
          'Stage technique en exploitation',
        ],
      },
      {
        annee: 'Troisième année',
        modules: [
          'Protection intégrée et biocontrôle',
          'Systèmes de culture et agroécologie',
          'Expérimentation agronomique',
          'Post-récolte, qualité et mise en marché',
          'Économie de l’exploitation et entrepreneuriat',
          'Stage de fin de cycle et mémoire',
        ],
      },
    ],
    debouches: [
      'Responsable de production végétale en plantation',
      'Conseiller en protection des cultures',
      "Chargé d'expérimentation en station ou en firme phytosanitaire",
      'Encadreur technique en organisation de producteurs',
      'Entrepreneur agricole en production végétale',
    ],
  }),
  licence({
    slug: 'licence-fertilisation-gestion-durable-sols',
    intitule: 'Fertilisation et gestion durable des sols',
    domaines: ['production-vegetale', 'environnement'],
    resume:
      "Diagnostiquer l'état d'un sol, construire un plan de fertilisation et restaurer la fertilité sur le long terme.",
    objectifs: [
      "Caractériser un sol par l'observation de terrain et l'analyse de laboratoire.",
      'Construire un plan de fertilisation ajusté à la culture, au sol et à l’objectif de rendement.',
      'Concevoir des itinéraires de restauration de la fertilité des sols dégradés.',
      "Évaluer l'incidence environnementale des pratiques de fertilisation.",
    ],
    competences: [
      'Description de profil de sol et cartographie pédologique',
      'Prélèvement, analyse et interprétation de résultats de sol',
      'Calcul de doses et raisonnement de la fertilisation',
      'Gestion de la matière organique et compostage',
      'Techniques de lutte contre l’érosion et de conservation des sols',
      'Suivi d’indicateurs de qualité des sols',
    ],
    programme: [
      {
        annee: 'Première année',
        modules: [
          'Pédologie générale et géologie',
          'Chimie et biochimie des sols',
          'Agronomie générale',
          'Biologie des sols',
          'Statistiques, informatique et méthodologie',
          'Anglais scientifique et communication',
        ],
      },
      {
        annee: 'Deuxième année',
        modules: [
          'Fertilité et fertilisation des sols tropicaux',
          'Matière organique et amendements',
          'Cartographie des sols et systèmes d’information géographique',
          'Hydraulique agricole et gestion de l’eau',
          'Analyse de laboratoire appliquée',
          'Stage technique',
        ],
      },
      {
        annee: 'Troisième année',
        modules: [
          'Dégradation, érosion et restauration des sols',
          'Agriculture de conservation et agroécologie',
          'Bilans minéraux et modélisation simple',
          'Environnement, carbone et services écosystémiques',
          'Conseil en fertilisation et entrepreneuriat',
          'Stage de fin de cycle et mémoire',
        ],
      },
    ],
    debouches: [
      'Conseiller en fertilisation et en nutrition des cultures',
      "Technicien supérieur en laboratoire d'analyse de sols",
      "Chargé d'études en projet de gestion durable des terres",
      'Technico-commercial en intrants et amendements',
    ],
  }),
  licence({
    slug: 'licence-genie-environnement-finance-durable',
    intitule: "Génie de l'environnement et finance durable",
    domaines: ['environnement', 'agribusiness'],
    resume:
      "Concilier performance agricole, préservation des ressources et accès aux financements de la transition durable.",
    objectifs: [
      "Évaluer l'impact environnemental d'une activité agricole ou agro-industrielle.",
      'Concevoir des dispositifs de gestion des ressources et des effluents.',
      'Construire un dossier de financement adossé à des critères de durabilité.',
      'Assurer la conformité réglementaire environnementale d’une exploitation.',
    ],
    competences: [
      'Étude d’impact environnemental et plan de gestion',
      'Gestion de l’eau, des effluents et des déchets agricoles',
      'Bilan carbone simplifié et indicateurs de durabilité',
      'Montage de dossiers de financement vert et de certification',
      'Veille réglementaire environnementale',
      'Analyse financière de projet agricole',
    ],
    programme: [
      {
        annee: 'Première année',
        modules: [
          'Écologie générale et sciences de l’environnement',
          'Chimie de l’environnement',
          'Agronomie générale',
          'Économie générale et comptabilité',
          'Statistiques, informatique et méthodologie',
          'Anglais scientifique et communication',
        ],
      },
      {
        annee: 'Deuxième année',
        modules: [
          'Gestion de l’eau et des effluents',
          'Traitement et valorisation des déchets agricoles',
          'Énergies renouvelables en milieu rural',
          'Droit de l’environnement et réglementation',
          'Analyse financière et gestion de projet',
          'Stage technique',
        ],
      },
      {
        annee: 'Troisième année',
        modules: [
          'Études d’impact et plans de gestion environnementale',
          'Finance durable, mécanismes carbone et financements climat',
          'Certification et normes de durabilité des filières',
          'Économie des ressources naturelles',
          'Entrepreneuriat vert',
          'Stage de fin de cycle et mémoire',
        ],
      },
    ],
    debouches: [
      "Chargé d'études environnementales en bureau d'études",
      'Responsable qualité, sécurité et environnement en agro-industrie',
      'Chargé de projets durabilité en coopérative ou en filière certifiée',
      'Analyste de projets agricoles en institution de financement',
    ],
    modalite: 'presentiel',
  }),
  licence({
    slug: 'licence-technologie-agriculture-intelligente',
    intitule: 'Technologie et agriculture intelligente',
    domaines: ['technologie', 'production-vegetale'],
    resume:
      "Mettre les capteurs, les drones et les données au service de la décision agronomique.",
    objectifs: [
      "Déployer des capteurs et des outils d'acquisition de données en parcelle.",
      "Exploiter l'imagerie aérienne et satellitaire pour caractériser une culture.",
      'Traiter et interpréter des données agricoles pour éclairer une décision technique.',
      "Conduire un projet de numérisation d'une exploitation.",
    ],
    competences: [
      'Instrumentation de parcelle et réseaux de capteurs',
      'Pilotage de drone et acquisition d’images',
      'Systèmes d’information géographique et télédétection',
      'Traitement de données et tableaux de bord agronomiques',
      'Agriculture de précision et modulation des intrants',
      'Conduite de projet numérique agricole',
    ],
    programme: [
      {
        annee: 'Première année',
        modules: [
          'Agronomie générale',
          'Mathématiques appliquées et statistiques',
          'Informatique, bases de données et programmation appliquée',
          'Électronique et capteurs',
          'Physique appliquée à l’agriculture',
          'Anglais scientifique et communication',
        ],
      },
      {
        annee: 'Deuxième année',
        modules: [
          'Systèmes d’information géographique',
          'Télédétection et traitement d’images',
          'Pilotage de drone et réglementation aérienne',
          'Irrigation et automatisation',
          'Analyse de données agricoles',
          'Stage technique',
        ],
      },
      {
        annee: 'Troisième année',
        modules: [
          'Agriculture de précision',
          'Modélisation et aide à la décision',
          'Objets connectés et transmission de données en zone rurale',
          'Économie du numérique agricole',
          'Entrepreneuriat et innovation',
          'Stage de fin de cycle et mémoire',
        ],
      },
    ],
    debouches: [
      'Technicien en agriculture de précision',
      'Télépilote de drone agricole et analyste de données',
      "Chargé de projet numérique en coopérative ou en agro-industrie",
      "Technico-commercial en solutions numériques agricoles",
      'Entrepreneur en services numériques pour l’agriculture',
    ],
  }),
  licence({
    slug: 'licence-agribusiness-management-chaines-valeur',
    intitule: 'Agribusiness et management des chaînes de valeur',
    domaines: ['agribusiness'],
    resume:
      "Structurer, financer et piloter une activité agricole depuis la production jusqu'au marché.",
    objectifs: [
      "Analyser une chaîne de valeur agricole et en identifier les points de création de marge.",
      "Construire et défendre un plan d'affaires agricole devant un financeur.",
      "Piloter la gestion commerciale, financière et logistique d'une entreprise agricole.",
      'Structurer et accompagner une organisation de producteurs.',
    ],
    competences: [
      'Analyse de filière et de chaîne de valeur',
      'Comptabilité, gestion budgétaire et analyse financière',
      'Élaboration de plan d’affaires et recherche de financement',
      'Marketing agricole et négociation commerciale',
      'Logistique, approvisionnement et gestion des stocks',
      'Gouvernance des organisations de producteurs',
    ],
    programme: [
      {
        annee: 'Première année',
        modules: [
          'Économie générale et économie rurale',
          'Comptabilité générale',
          'Agronomie et systèmes de production',
          'Mathématiques financières et statistiques',
          'Informatique de gestion',
          'Anglais des affaires et communication',
        ],
      },
      {
        annee: 'Deuxième année',
        modules: [
          'Analyse de filières agricoles',
          'Gestion financière et contrôle de gestion',
          'Marketing et études de marché',
          'Droit des affaires et droit coopératif',
          'Logistique et commerce des produits agricoles',
          'Stage technique',
        ],
      },
      {
        annee: 'Troisième année',
        modules: [
          'Management des chaînes de valeur',
          'Financement de l’agriculture et microfinance',
          'Certification, qualité et accès aux marchés',
          'Stratégie d’entreprise agricole',
          'Création d’entreprise et incubation',
          'Stage de fin de cycle et mémoire',
        ],
      },
    ],
    debouches: [
      "Gestionnaire d'entreprise ou de coopérative agricole",
      'Chargé de filière en organisation professionnelle',
      'Chargé de clientèle agricole en institution financière',
      "Responsable achats ou commercial en agro-industrie",
      "Créateur d'entreprise agricole ou agroalimentaire",
    ],
    modalite: 'presentiel',
  }),
  licence({
    slug: 'licence-ingenierie-transformation-aliments',
    intitule: 'Ingénierie de la transformation des aliments',
    domaines: ['agroalimentaire'],
    resume:
      "Concevoir, conduire et améliorer des procédés de transformation adaptés aux productions ivoiriennes.",
    objectifs: [
      "Concevoir un procédé de transformation adapté à une matière première donnée.",
      "Dimensionner et organiser une unité de production alimentaire.",
      'Garantir la sécurité sanitaire et la qualité du produit fini.',
      "Conduire un projet d'innovation ou d'amélioration de procédé.",
    ],
    competences: [
      'Génie des procédés alimentaires et opérations unitaires',
      'Formulation et développement de produits',
      'Dimensionnement d’unité et implantation d’atelier',
      'Systèmes qualité, HACCP et normes applicables',
      'Analyse sensorielle et contrôle de la qualité',
      'Gestion de production et amélioration continue',
    ],
    programme: [
      {
        annee: 'Première année',
        modules: [
          'Chimie et biochimie alimentaire',
          'Microbiologie alimentaire',
          'Opérations unitaires',
          'Matières premières agricoles',
          'Mathématiques, statistiques et informatique',
          'Anglais scientifique et communication',
        ],
      },
      {
        annee: 'Deuxième année',
        modules: [
          'Procédés de conservation et de stabilisation',
          'Génie industriel alimentaire et équipements',
          'Hygiène, HACCP et plans de maîtrise sanitaire',
          'Emballage et conditionnement',
          'Analyse sensorielle',
          'Stage technique',
        ],
      },
      {
        annee: 'Troisième année',
        modules: [
          'Transformation par filière : cacao, anacarde, manioc, fruits',
          'Formulation et développement de nouveaux produits',
          'Dimensionnement et montage d’unité',
          'Management de la qualité et certification',
          'Entrepreneuriat agroalimentaire',
          'Stage de fin de cycle et mémoire',
        ],
      },
    ],
    debouches: [
      'Responsable de production en unité agroalimentaire',
      'Responsable qualité en industrie alimentaire',
      "Chargé de développement produit",
      "Créateur et gérant d'une unité de transformation",
    ],
    modalite: 'presentiel',
  }),
];

/* --------------------------------------------------------------------------
   Certificats d'initiation et de perfectionnement
   -------------------------------------------------------------------------- */

const CERTIFICATS: readonly Formation[] = [
  courte({
    slug: 'certificat-aviculture',
    intitule: 'Aviculture',
    cycle: 'certificat',
    domaines: ['production-animale'],
    resume: "Monter et conduire un atelier avicole rentable, du poussin d'un jour à la commercialisation.",
    objectifs: [
      "Concevoir un poulailler adapté à la taille de son projet et au climat local.",
      'Conduire une bande de chair ou de ponte en maîtrisant les paramètres d’élevage.',
      'Appliquer un programme de prophylaxie et reconnaître les affections courantes.',
      'Calculer son prix de revient et organiser sa commercialisation.',
    ],
    competences: [
      'Conception et équipement du bâtiment avicole',
      'Conduite de la bande et gestion de l’ambiance',
      'Alimentation et abreuvement',
      'Programme de vaccination et biosécurité',
      'Suivi des performances et gestion technico-économique',
    ],
    debouches: [
      'Création et conduite d’un atelier avicole',
      'Emploi de technicien ou d’ouvrier qualifié en ferme avicole',
    ],
  }),
  courte({
    slug: 'certificat-porciculture',
    intitule: 'Porciculture',
    cycle: 'certificat',
    domaines: ['production-animale'],
    resume: "Conduire un élevage porcin, de la reproduction à l'engraissement, dans des conditions sanitaires maîtrisées.",
    objectifs: [
      "Concevoir une porcherie fonctionnelle et respectueuse des règles de biosécurité.",
      'Conduire la reproduction, la maternité et l’engraissement.',
      'Rationner les animaux selon leur stade physiologique.',
      'Prévenir les pathologies dominantes de l’élevage porcin tropical.',
    ],
    competences: [
      'Conception et aménagement de la porcherie',
      'Conduite de la reproduction et de la maternité',
      'Alimentation par stade physiologique',
      'Hygiène, prophylaxie et gestion des effluents',
      'Suivi économique de l’atelier',
    ],
    debouches: ['Création et conduite d’un élevage porcin', 'Technicien en ferme porcine'],
  }),
  courte({
    slug: 'certificat-pisciculture',
    intitule: 'Pisciculture',
    cycle: 'certificat',
    domaines: ['production-animale'],
    resume: "Produire du poisson en étang ou en cage, du choix du site à la mise en marché.",
    objectifs: [
      "Choisir et aménager un site de production piscicole.",
      "Maîtriser la qualité de l'eau et les paramètres d'élevage.",
      'Conduire l’alevinage et le grossissement du tilapia et du silure.',
      'Organiser la récolte et la commercialisation du poisson.',
    ],
    competences: [
      'Choix de site et aménagement d’étangs ou de cages',
      'Gestion de la qualité de l’eau',
      'Alevinage, densité et conduite du grossissement',
      'Alimentation et suivi de croissance',
      'Récolte, conservation et mise en marché',
    ],
    debouches: ['Création et conduite d’une exploitation piscicole', 'Technicien en ferme aquacole'],
  }),
  courte({
    slug: 'certificat-cuniculture',
    intitule: 'Cuniculture',
    cycle: 'certificat',
    domaines: ['production-animale'],
    resume: "Élever le lapin en clapier, une production à cycle court accessible aux petites surfaces.",
    objectifs: [
      'Concevoir un clapier adapté au climat et à la taille du cheptel.',
      'Conduire la reproduction et l’engraissement des lapereaux.',
      'Prévenir les pathologies dominantes de la cuniculture tropicale.',
      'Valoriser la production et calculer sa rentabilité.',
    ],
    competences: [
      'Conception et équipement du clapier',
      'Conduite de la reproduction',
      'Alimentation et complémentation',
      'Hygiène et prophylaxie',
      'Gestion technico-économique',
    ],
    debouches: ['Création d’un atelier cunicole', 'Diversification d’une exploitation existante'],
  }),
  courte({
    slug: 'certificat-aulacodiculture',
    intitule: 'Aulacodiculture',
    cycle: 'certificat',
    domaines: ['production-animale'],
    resume: "Domestiquer et élever l'aulacode, une filière de viande de brousse à forte demande.",
    objectifs: [
      "Concevoir un élevage d'aulacodes conforme à la réglementation applicable.",
      'Conduire la reproduction et la constitution des colonies.',
      'Assurer l’alimentation à partir de ressources fourragères locales.',
      'Organiser la commercialisation de la production.',
    ],
    competences: [
      'Conception des loges et de l’élevage',
      'Constitution et conduite des colonies',
      'Alimentation fourragère et complémentation',
      'Hygiène et prophylaxie',
      'Commercialisation et réglementation',
    ],
    debouches: ['Création d’un élevage d’aulacodes', 'Diversification d’une exploitation'],
  }),
  courte({
    slug: 'certificat-ruminants',
    intitule: 'Élevage de gros et petits ruminants',
    cycle: 'certificat',
    domaines: ['production-animale'],
    resume: "Conduire un troupeau de bovins, d'ovins ou de caprins en zone tropicale humide.",
    objectifs: [
      'Concevoir un système d’élevage adapté aux ressources fourragères disponibles.',
      'Conduire l’alimentation, la reproduction et le suivi du troupeau.',
      'Appliquer un plan de prophylaxie et de déparasitage.',
      'Valoriser la production laitière ou bouchère.',
    ],
    competences: [
      'Gestion du pâturage et production fourragère',
      'Alimentation et complémentation minérale',
      'Conduite de la reproduction',
      'Prophylaxie, déparasitage et soins courants',
      'Gestion technico-économique du troupeau',
    ],
    debouches: ['Conduite d’un troupeau', 'Emploi de berger qualifié ou de technicien d’élevage'],
  }),
  courte({
    slug: 'certificat-apiculture',
    intitule: 'Apiculture',
    cycle: 'certificat',
    domaines: ['production-animale', 'environnement'],
    resume: "Installer un rucher et produire un miel de qualité marchande.",
    objectifs: [
      'Installer et peupler un rucher en respectant les règles de sécurité.',
      'Conduire les colonies au fil des saisons.',
      'Récolter et extraire le miel dans des conditions d’hygiène satisfaisantes.',
      'Valoriser les produits de la ruche et accéder au marché.',
    ],
    competences: [
      'Choix du site et installation du rucher',
      'Peuplement, transvasement et conduite des colonies',
      'Sanitaire du rucher',
      'Récolte, extraction et conditionnement',
      'Valorisation des produits de la ruche',
    ],
    debouches: ['Création d’une exploitation apicole', 'Activité complémentaire de revenu'],
  }),
  courte({
    slug: 'certificat-heliciculture',
    intitule: 'Héliciculture',
    cycle: 'certificat',
    domaines: ['production-animale'],
    resume: "Élever l'escargot géant africain, une production à faible investissement et à bonne valorisation.",
    objectifs: [
      'Aménager un escargotière adaptée au climat local.',
      'Conduire la reproduction et le grossissement.',
      'Maîtriser l’alimentation et l’hygiène de l’élevage.',
      'Organiser la récolte et la commercialisation.',
    ],
    competences: [
      'Aménagement de l’escargotière',
      'Conduite de la reproduction et de l’incubation',
      'Alimentation et croissance',
      'Hygiène et gestion des prédateurs',
      'Récolte et mise en marché',
    ],
    debouches: ['Création d’un élevage hélicicole', 'Activité complémentaire de revenu'],
  }),
  courte({
    slug: 'certificat-maraichage-durable',
    intitule: 'Techniques de maraîchage durable',
    cycle: 'certificat',
    domaines: ['production-vegetale'],
    resume: "Produire des légumes toute l'année en limitant les intrants de synthèse.",
    objectifs: [
      'Préparer et fertiliser un sol maraîcher durablement.',
      'Conduire une pépinière et réussir ses plantations.',
      'Gérer l’irrigation et les rotations culturales.',
      'Protéger les cultures avec des méthodes à faible impact.',
    ],
    competences: [
      'Préparation du sol et fertilisation organique',
      'Pépinière et repiquage',
      'Irrigation et gestion de l’eau',
      'Rotations, associations et couverture du sol',
      'Protection intégrée des cultures maraîchères',
      'Récolte, conditionnement et vente',
    ],
    debouches: ["Création d'une exploitation maraîchère", 'Emploi de chef de culture en périmètre maraîcher'],
  }),
  courte({
    slug: 'certificat-mais-manioc',
    intitule: 'Culture de maïs et de manioc à haut rendement',
    cycle: 'certificat',
    domaines: ['production-vegetale'],
    resume: "Augmenter durablement les rendements des deux cultures vivrières les plus répandues du pays.",
    objectifs: [
      'Choisir un matériel végétal adapté et de qualité.',
      'Conduire un itinéraire technique complet, du semis à la récolte.',
      'Raisonner la fertilisation et la gestion des adventices.',
      'Réduire les pertes après récolte.',
    ],
    competences: [
      'Choix variétal et préparation du matériel de plantation',
      'Densité, semis et bouturage',
      'Fertilisation et désherbage raisonnés',
      'Protection contre les ravageurs dominants',
      'Récolte, séchage et conservation',
    ],
    debouches: ['Amélioration du revenu d’une exploitation vivrière', 'Emploi de technicien de production'],
  }),
  courte({
    slug: 'certificat-banane-associations',
    intitule: 'Culture intégrée de la banane et association des cultures',
    cycle: 'certificat',
    domaines: ['production-vegetale'],
    resume: "Conduire une bananeraie plantain et l'associer à d'autres cultures pour sécuriser le revenu.",
    objectifs: [
      'Installer une bananeraie à partir de rejets ou de vitroplants sains.',
      'Conduire l’entretien, l’œilletonnage et la fertilisation.',
      'Concevoir des associations culturales cohérentes.',
      'Gérer les principaux bioagresseurs du bananier.',
    ],
    competences: [
      'Préparation du matériel de plantation et assainissement',
      'Installation et densité de plantation',
      'Entretien, œilletonnage et tuteurage',
      'Associations culturales et couverture du sol',
      'Gestion des charançons, nématodes et cercosporioses',
    ],
    debouches: ['Conduite d’une bananeraie', 'Diversification d’une exploitation vivrière'],
  }),
  courte({
    slug: 'certificat-agroecologie-agriculture-biologique',
    intitule: 'Agroécologie et agriculture biologique',
    cycle: 'certificat',
    domaines: ['production-vegetale', 'environnement'],
    resume: "Concevoir des systèmes de culture qui entretiennent la fertilité au lieu de la consommer.",
    objectifs: [
      'Comprendre les principes agroécologiques et leur application en zone tropicale.',
      'Produire et utiliser des fertilisants organiques sur l’exploitation.',
      'Mettre en œuvre des méthodes de protection sans produits de synthèse.',
      'Se repérer dans les exigences de la certification biologique.',
    ],
    competences: [
      'Diagnostic agroécologique d’une exploitation',
      'Compostage et production de biofertilisants',
      'Biopesticides et lutte biologique',
      'Associations, rotations et agroforesterie',
      'Exigences documentaires de la certification',
    ],
    debouches: ['Conversion d’une exploitation en agriculture biologique', 'Conseil en agroécologie'],
  }),
  courte({
    slug: 'certificat-myciculture',
    intitule: 'Myciculture — production de champignons comestibles',
    cycle: 'certificat',
    domaines: ['production-vegetale'],
    resume: "Produire des pleurotes sur substrat local, une culture à cycle très court et à faible emprise foncière.",
    objectifs: [
      'Préparer et pasteuriser un substrat à partir de résidus agricoles locaux.',
      'Ensemencer et conduire l’incubation.',
      'Maîtriser l’ambiance de la salle de fructification.',
      'Récolter, conditionner et commercialiser la production.',
    ],
    competences: [
      'Préparation et pasteurisation du substrat',
      'Ensemencement et gestion du blanc',
      'Conduite de l’incubation et de la fructification',
      'Hygiène et prévention des contaminations',
      'Récolte, conditionnement et vente',
    ],
    debouches: ['Création d’une unité de production de champignons', 'Activité de revenu en zone périurbaine'],
    modalite: 'presentiel',
  }),
  courte({
    slug: 'certificat-culture-hors-sol',
    intitule: 'Techniques de culture hors-sol',
    cycle: 'certificat',
    domaines: ['production-vegetale', 'technologie'],
    resume: "Cultiver sans sol, sur substrat ou en solution nutritive, pour produire en espace contraint.",
    objectifs: [
      'Choisir un système hors-sol adapté à son projet et à ses moyens.',
      'Préparer et piloter une solution nutritive.',
      'Conduire les cultures et suivre les paramètres du système.',
      'Prévenir les incidents propres à ces systèmes.',
    ],
    competences: [
      'Choix et montage du système hors-sol',
      'Préparation et contrôle de la solution nutritive',
      'Suivi du pH et de la conductivité',
      'Conduite des cultures et pilotage climatique',
      'Prévention des contaminations et des pannes',
    ],
    debouches: ['Création d’une unité de production hors-sol', 'Emploi de technicien en serre'],
    modalite: 'presentiel',
  }),
];

/* --------------------------------------------------------------------------
   Masterclass transversales
   -------------------------------------------------------------------------- */

const MASTERCLASS: readonly Formation[] = [
  courte({
    slug: 'masterclass-pilotage-drone',
    intitule: 'Pilotage de drone et traitement de données agricoles',
    cycle: 'masterclass',
    domaines: ['technologie'],
    resume: "Acquérir, traiter et interpréter des images aériennes pour décider en parcelle.",
    objectifs: [
      "Former les apprenants à l'utilisation des drones et à l'analyse des données aériennes pour améliorer la prise de décision en agriculture de précision.",
      'Préparer et exécuter un vol dans le respect de la réglementation aérienne.',
      'Planifier une mission de cartographie et acquérir des images exploitables.',
      'Traiter les images et produire des indices de végétation.',
      'Traduire une carte en décision agronomique.',
    ],
    competences: [
      'Réglementation et sécurité des vols',
      'Planification de mission et paramètres de vol',
      'Traitement photogrammétrique et orthomosaïque',
      'Indices de végétation et cartes de vigueur',
      'Restitution et aide à la décision',
    ],
    debouches: ['Prestation de services de cartographie agricole', 'Appui technique en agriculture de précision'],
    modalite: 'presentiel',
  }),
  courte({
    slug: 'masterclass-coeurs-de-metiers',
    intitule: 'Les cœurs de métiers en agriculture',
    cycle: 'masterclass',
    domaines: ['transversal'],
    resume: "Situer les métiers du secteur agricole et repérer celui qui correspond à son projet.",
    objectifs: [
      "Permettre aux apprenants de comprendre les métiers clés de l'agriculture et leurs exigences afin de mieux orienter leur parcours académique et professionnel.",
      'Identifier les grandes familles de métiers du secteur agricole ivoirien.',
      'Comprendre les compétences et les conditions d’exercice de chacune.',
      'Repérer les parcours de formation correspondants.',
      'Formuler un projet professionnel argumenté.',
    ],
    competences: [
      'Connaissance des filières et de leurs acteurs',
      'Lecture d’une fiche métier',
      'Repérage des parcours de formation',
      'Formulation d’un projet professionnel',
    ],
    debouches: ["Orientation vers une formation adaptée", "Construction d'un projet d'insertion"],
    modalite: 'presentiel',
  }),
  courte({
    slug: 'masterclass-projet-de-stage',
    intitule: 'Diagnostic de compétences et rédaction du projet de stage',
    cycle: 'masterclass',
    domaines: ['transversal'],
    resume: "Identifier ses acquis, cibler une structure d'accueil et rédiger un projet de stage qui aboutit.",
    objectifs: [
      "Accompagner les apprenants dans l'identification de leurs compétences et la structuration d'un projet de stage pertinent, cohérent avec leur formation et leurs objectifs professionnels.",
      'Réaliser un diagnostic de ses compétences acquises et à acquérir.',
      'Cibler des structures d’accueil pertinentes.',
      'Rédiger un projet de stage structuré et une lettre de candidature.',
      'Préparer l’entretien avec le maître de stage.',
    ],
    competences: [
      'Auto-diagnostic de compétences',
      'Ciblage et prospection de structures',
      'Rédaction de projet et de candidature',
      'Préparation d’entretien',
    ],
    debouches: ["Obtention d'un stage en entreprise", "Préparation à la recherche d'emploi"],
    modalite: 'presentiel',
  }),
  courte({
    slug: 'masterclass-entrepreneuriat',
    intitule: 'Entrepreneuriat et suivi de projet',
    cycle: 'masterclass',
    domaines: ['agribusiness', 'transversal'],
    resume: "Transformer une idée agricole en projet chiffré, finançable et suivi dans le temps.",
    objectifs: [
      "Développer l'esprit entrepreneurial et les capacités de création, de gestion et de pérennisation d'entreprises, notamment dans les secteurs agricole, agroalimentaire et environnemental.",
      'Formaliser une idée en modèle économique.',
      'Construire un plan d’affaires et un plan de trésorerie.',
      'Identifier les sources de financement accessibles.',
      'Mettre en place un suivi d’activité simple et régulier.',
    ],
    competences: [
      'Modèle économique et proposition de valeur',
      'Étude de marché appliquée',
      'Plan d’affaires et prévisionnel financier',
      'Recherche de financement',
      'Tableaux de bord et suivi d’activité',
    ],
    debouches: ["Création d'entreprise agricole", "Structuration d'une activité existante"],
    modalite: 'presentiel',
  }),
  courte({
    slug: 'masterclass-art-oratoire',
    intitule: 'Art oratoire',
    cycle: 'masterclass',
    domaines: ['transversal'],
    resume: "Défendre un projet, animer une réunion de producteurs, soutenir un mémoire avec assurance.",
    objectifs: [
      "Renforcer les capacités de communication orale des apprenants afin de leur permettre de s'exprimer avec clarté, aisance et impact dans des contextes académiques, professionnels et institutionnels.",
      'Structurer une prise de parole selon son objectif et son public.',
      'Travailler la voix, le regard et la posture.',
      'Gérer le trac et les questions difficiles.',
      'Soutenir un travail devant un jury.',
    ],
    competences: [
      'Structuration du discours',
      'Voix, posture et gestuelle',
      'Gestion du trac',
      'Animation de réunion et réponse aux objections',
    ],
    debouches: ['Soutenance de mémoire', 'Animation de groupements de producteurs', 'Entretiens professionnels'],
    modalite: 'presentiel',
  }),
];

export const FORMATIONS: readonly Formation[] = [...BTS, ...LICENCES, ...CERTIFICATS, ...MASTERCLASS];

/* --------------------------------------------------------------------------
   Accès
   -------------------------------------------------------------------------- */

export const CYCLE_LABELS: Record<Cycle, string> = {
  bts: 'BTS',
  licence: 'Licence',
  certificat: 'Certificat',
  masterclass: 'Masterclass',
};

export const CYCLE_DESCRIPTIONS: Record<Cycle, string> = {
  bts: "Deux ans après le baccalauréat, sanctionnés par un examen d'État.",
  licence: 'Trois ans après le baccalauréat. Première année ouverte à la rentrée 2026.',
  certificat: 'Formation qualifiante courte, ouverte aux professionnels et aux porteurs de projet.',
  masterclass: 'Module court et transversal, ouvert aux étudiants comme aux publics externes.',
};

export const DOMAINE_LABELS: Record<Domaine, string> = {
  'production-animale': 'Production animale',
  'production-vegetale': 'Production végétale',
  agroalimentaire: 'Agroalimentaire',
  agribusiness: 'Agribusiness',
  environnement: 'Environnement',
  technologie: 'Technologie',
  transversal: 'Transversal',
};

export const MODALITE_LABELS: Record<Modalite, string> = {
  presentiel: 'En présentiel',
  hybride: 'Hybride',
  terrain: 'Présentiel et terrain',
};

export function getFormation(slug: string): Formation | undefined {
  return FORMATIONS.find((formation) => formation.slug === slug);
}

export function formationsParCycle(cycle: Cycle): readonly Formation[] {
  return FORMATIONS.filter((formation) => formation.cycle === cycle);
}

/** Intitulé complet, option comprise. */
export function titreComplet(formation: Formation): string {
  return formation.option ? `${formation.intitule} — ${formation.option}` : formation.intitule;
}

export function dureeLisible(formation: Formation): string | null {
  if (formation.dureeMois === null) return null;
  const annees = formation.dureeMois / 12;
  return annees === 1 ? '1 an' : `${annees} ans`;
}
