import type { Ressource } from './types';

/* ==========================================================================
   Ressources agricoles — §8.6 et §19.2
   --------------------------------------------------------------------------
   C'est l'atout de visibilité du dispositif, et non les pages institutionnelles
   sur lesquelles tous les établissements se ressemblent. Chaque thématique
   correspond à une recherche réellement effectuée par un professionnel du
   secteur, et chaque fiche renvoie vers la formation qui l'approfondit.

   La rubrique n'a pas besoin d'être complète à la mise en ligne : elle doit
   être alimentée régulièrement. Ce premier ensemble tient lieu d'amorce et
   de gabarit rédactionnel.
   ========================================================================== */

export const FILIERES = [
  'Cacao',
  'Hévéa',
  'Anacarde',
  'Cultures vivrières',
  'Aviculture',
  'Pisciculture',
] as const;

export const RESSOURCES: readonly Ressource[] = [
  {
    slug: 'calendrier-cultural-cacao-zone-forestiere',
    titre: 'Calendrier cultural du cacaoyer en zone forestière',
    filiere: 'Cacao',
    resume:
      "Les opérations mois par mois sur une cacaoyère en production, du recépage à la récolte de la campagne principale.",
    sections: [
      {
        titre: 'Ce que le calendrier organise',
        corps: [
          "Une cacaoyère ne se conduit pas au coup par coup. Les opérations d'entretien, de protection et de récolte s'enchaînent selon un rythme dicté par la pluviométrie et par le cycle de la plante. Un calendrier écrit, affiché et suivi vaut mieux qu'une intervention décidée le jour où le problème devient visible.",
          "Le calendrier ci-dessous décrit une année type en zone forestière. Il s'ajuste selon la pluviométrie locale, l'âge du verger et l'état sanitaire de la parcelle.",
        ],
      },
      {
        titre: 'Grande saison des pluies — mars à juillet',
        corps: [
          "Période d'entretien intensif. Désherbage manuel autour des pieds, taille d'entretien pour aérer la frondaison, élimination des gourmands et des branches mortes.",
          "C'est aussi la fenêtre de la fertilisation de fond, à positionner sur sol humide et après un désherbage soigné, faute de quoi les adventices captent une part de l'apport.",
          "La lutte contre la pourriture brune commence ici : récolte sanitaire régulière des cabosses atteintes, sorties de la parcelle et enfouies loin des pieds.",
        ],
      },
      {
        titre: 'Petite saison sèche — juillet à septembre',
        corps: [
          "Ralentissement des opérations d'entretien. Période favorable à l'ouverture des layons, à l'entretien du matériel et à la préparation des aires de fermentation et de séchage.",
          "Surveillance des mirides, dont les dégâts s'installent discrètement sur les jeunes rameaux avant d'être visibles sur la production.",
        ],
      },
      {
        titre: 'Petite saison des pluies et récolte principale — septembre à janvier',
        corps: [
          "Récolte de la campagne principale. Passage tous les quinze jours, cabosses coupées au sécateur ou à l'émondoir sans blesser le coussinet floral — un coussinet abîmé ne refleurira pas.",
          "Écabossage dans les quarante-huit heures, fermentation en caisses ou sous feuilles pendant six jours avec brassages réguliers, puis séchage lent sur claies.",
          "La qualité marchande se joue à ce stade, plus qu'à la parcelle : un séchage trop rapide ou une fermentation écourtée déclasse une récolte techniquement réussie.",
        ],
      },
    ],
    formationLiee: 'bts-agriculture-tropicale-production-vegetale',
    miseAJour: '2026-08-13',
    statut: 'a-valider',
  },
  {
    slug: 'demarrer-atelier-avicole-chair',
    titre: 'Démarrer un atelier avicole de chair : les sept décisions qui comptent',
    filiere: 'Aviculture',
    resume:
      "Emplacement, dimensionnement, équipement, démarrage, alimentation, prophylaxie et prix de revient : ce qu'il faut arrêter avant la première bande.",
    sections: [
      {
        titre: 'Avant le premier poussin',
        corps: [
          "La rentabilité d'un atelier avicole se décide avant l'arrivée des poussins. Une fois la bande installée, les marges de manœuvre sont faibles : on subit les choix de conception.",
          "Sept décisions structurent le résultat. Aucune n'est coûteuse à bien prendre ; toutes sont coûteuses à reprendre.",
        ],
      },
      {
        titre: '1. L’emplacement',
        corps: [
          "Terrain drainant, à l'écart des habitations et des autres élevages, orienté de façon à ce que les vents dominants traversent le bâtiment dans sa largeur. L'accès doit rester praticable en saison des pluies : un camion d'aliment qui ne passe pas, c'est une bande sous-alimentée.",
        ],
      },
      {
        titre: '2. Le dimensionnement',
        corps: [
          "La densité conditionne la mortalité et l'indice de consommation. Un bâtiment sous-dimensionné pour l'effectif visé coûte plus cher en pertes qu'il n'économise en construction. Dimensionner d'après l'effectif cible, jamais d'après le budget disponible.",
        ],
      },
      {
        titre: '3. Le démarrage',
        corps: [
          "Les dix premiers jours déterminent l'homogénéité du lot. Poussinière préchauffée avant l'arrivée, litière sèche et épaisse, eau à température ambiante, accès immédiat à l'aliment.",
          "Un poussin qui ne s'alimente pas dans les vingt-quatre heures ne rattrape jamais complètement son retard de croissance.",
        ],
      },
      {
        titre: '4. La prophylaxie',
        corps: [
          "Le programme de vaccination se cale sur les pathologies dominantes de la zone, pas sur un modèle générique. Il se prépare avec un vétérinaire avant la mise en place, et se respecte à la date près.",
          "La biosécurité produit plus de résultats que le traitement : pédiluve entretenu, visiteurs limités, vide sanitaire respecté entre deux bandes.",
        ],
      },
      {
        titre: '5. Le prix de revient',
        corps: [
          "L'aliment représente l'essentiel du coût de production. Un éleveur qui ne calcule pas son indice de consommation ne sait pas s'il gagne de l'argent.",
          "Tenir un cahier par bande — effectif, mortalité, aliment consommé, poids de vente — coûte quelques minutes par jour et transforme la conduite de l'atelier.",
        ],
      },
    ],
    formationLiee: 'certificat-aviculture',
    miseAJour: '2026-08-13',
    statut: 'a-valider',
  },
  {
    slug: 'qualite-eau-pisciculture-etang',
    titre: "Qualité de l'eau en pisciculture d'étang : les paramètres à surveiller",
    filiere: 'Pisciculture',
    resume:
      "Oxygène, température, pH et transparence : quatre mesures simples qui expliquent la plupart des accidents d'élevage.",
    sections: [
      {
        titre: 'Pourquoi ces quatre paramètres',
        corps: [
          "En pisciculture d'étang, la quasi-totalité des mortalités inexpliquées s'explique par la qualité de l'eau. Quatre mesures suffisent à anticiper la plupart des accidents, et aucune ne demande un équipement coûteux.",
        ],
      },
      {
        titre: 'Oxygène dissous',
        corps: [
          "Le paramètre le plus critique et le plus variable. Il chute en fin de nuit, quand le phytoplancton consomme sans produire. Les mortalités matinales sont presque toujours des asphyxies.",
          "Signe d'alerte sans appareil : des poissons qui happent l'air en surface au lever du jour. La réponse immédiate est le brassage — pompe, aération, apport d'eau neuve — et la réduction de l'alimentation.",
        ],
      },
      {
        titre: 'Transparence',
        corps: [
          "Elle renseigne sur la charge en plancton. Trop claire, l'eau est pauvre et la production plafonne ; trop trouble, le risque d'asphyxie nocturne monte.",
          "Une mesure suffit : le bras enfoncé jusqu'au coude doit laisser la main tout juste visible. Ce contrôle vaut un appareil pour la conduite courante.",
        ],
      },
      {
        titre: 'Température et pH',
        corps: [
          "La température commande l'appétit et la croissance ; l'alimentation se module en conséquence plutôt que d'être servie à quantité fixe.",
          "Le pH se contrôle au chaulage à la mise en eau. Un étang sur sol acide non chaulé produit durablement en dessous de son potentiel.",
        ],
      },
    ],
    formationLiee: 'certificat-pisciculture',
    miseAJour: '2026-08-13',
    statut: 'a-valider',
  },
  {
    slug: 'anacarde-recolte-qualite-noix',
    titre: 'Anacarde : récolte et post-récolte, là où se perd la qualité',
    filiere: 'Anacarde',
    resume:
      "Ramassage, séchage, tri et stockage : les opérations qui déterminent le rendement au décorticage et le prix payé au producteur.",
    sections: [
      {
        titre: 'La qualité se perd après l’arbre',
        corps: [
          "Le prix payé au producteur d'anacarde dépend du rendement au décorticage et du taux d'humidité. Ces deux indicateurs se dégradent après la récolte, pas sur l'arbre.",
          "Une parcelle bien conduite dont la post-récolte est négligée se vend au prix d'une parcelle médiocre.",
        ],
      },
      {
        titre: 'Ramassage',
        corps: [
          "Les noix se ramassent après chute naturelle, jamais cueillies sur l'arbre : une noix récoltée avant maturité donne une amande mal formée.",
          "Passages fréquents pendant la campagne. Une noix qui séjourne au sol s'humidifie, se tache et perd de la valeur.",
          "Séparer la pomme de la noix dès le ramassage : le jus qui fermente altère l'amande.",
        ],
      },
      {
        titre: 'Séchage',
        corps: [
          "Deux à trois jours de soleil sur aire propre, en couche mince, avec retournements. La noix est sèche lorsqu'elle sonne au secouement.",
          "Le séchage sur sol nu apporte terre et humidité : une bâche ou une aire cimentée se rentabilise en une campagne.",
        ],
      },
      {
        titre: 'Tri et stockage',
        corps: [
          "Éliminer les noix flottantes, percées, tachées ou immatures. Un lot homogène se négocie mieux qu'un lot mélangé au poids équivalent.",
          "Stockage en sacs de jute sur palettes, à l'abri de l'humidité et à distance des murs. Jamais de sacs plastiques fermés : ils condensent.",
        ],
      },
    ],
    formationLiee: 'bts-agriculture-tropicale-production-vegetale',
    miseAJour: '2026-08-13',
    statut: 'a-valider',
  },
  {
    slug: 'compost-ferme-fertilite-sols',
    titre: 'Produire son compost à la ferme pour restaurer la fertilité',
    filiere: 'Cultures vivrières',
    resume:
      "Matières, montage de l'andain, conduite du retournement et emploi au champ : le compostage comme levier de fertilité à coût maîtrisé.",
    sections: [
      {
        titre: 'Pourquoi composter',
        corps: [
          "La baisse de rendement observée sur beaucoup de parcelles vivrières tient moins à un manque d'engrais qu'à l'épuisement de la matière organique du sol. Un sol pauvre en matière organique retient mal l'eau et valorise mal les apports minéraux.",
          "Le compost ne remplace pas la fertilisation minérale : il la rend efficace.",
        ],
      },
      {
        titre: 'Les matières',
        corps: [
          "Alterner des matières riches en carbone — pailles, tiges de maïs, balles de riz, sciure — et des matières riches en azote : fumiers, déjections de volaille, résidus verts, drêches.",
          "L'équilibre approximatif est de trois volumes de matière sèche pour un volume de matière verte ou de fumier.",
        ],
      },
      {
        titre: 'Le montage et la conduite',
        corps: [
          "Andain d'environ un mètre cinquante de haut, monté par couches successives et humidifié à chaque couche. En dessous de cette hauteur, la montée en température est insuffisante.",
          "La température atteint son maximum en quelques jours. Retourner à trois semaines, puis à six semaines. Le compost est mûr lorsqu'il ne chauffe plus au retournement et que les matières d'origine ne sont plus identifiables.",
          "Couvrir en saison des pluies : un andain lessivé perd ses éléments solubles.",
        ],
      },
      {
        titre: 'L’emploi au champ',
        corps: [
          "Épandage avant le travail du sol et enfouissement superficiel. En poquet sur cultures de rente, l'effet est plus rapide mais l'amélioration du sol reste locale.",
          "Le compost agit sur plusieurs campagnes : son évaluation se fait sur trois ans, pas sur une saison.",
        ],
      },
    ],
    formationLiee: 'licence-fertilisation-gestion-durable-sols',
    miseAJour: '2026-08-13',
    statut: 'a-valider',
  },
  {
    slug: 'hevea-saignee-conduite',
    titre: 'Hévéa : conduire la saignée sans épuiser l’arbre',
    filiere: 'Hévéa',
    resume:
      "Ouverture du panneau, fréquence, profondeur et suivi de l'encoche : les règles qui préservent le potentiel de production sur la durée.",
    sections: [
      {
        titre: 'Un capital à ne pas entamer',
        corps: [
          "L'écorce d'un hévéa est un capital non renouvelable à l'échelle d'une carrière de saignée. Une conduite trop intensive augmente la production d'une campagne et la réduit pour dix.",
        ],
      },
      {
        titre: 'Ouverture',
        corps: [
          "L'ouverture se décide sur la circonférence du tronc mesurée à un mètre du sol, jamais sur l'âge de la plantation. Saigner un arbre trop jeune compromet définitivement sa croissance.",
          "Une parcelle s'ouvre lorsque la proportion d'arbres ayant atteint la circonférence requise est suffisante, pas dès les premiers arbres saignables.",
        ],
      },
      {
        titre: 'Conduite de l’encoche',
        corps: [
          "Profondeur de coupe régulière, à faible distance du bois sans jamais l'atteindre : une blessure du cambium détruit l'écorce régénérée de la carrière suivante.",
          "Consommation d'écorce maîtrisée par saignée. Un contrôle mensuel de la consommation en dit plus sur la qualité du travail que le tonnage collecté.",
        ],
      },
      {
        titre: 'Encoche sèche et repos',
        corps: [
          "L'encoche sèche traduit une sur-sollicitation. La réponse est la mise au repos, pas l'intensification de la stimulation.",
          "Tenir un relevé par arbre marqué permet de détecter la dérive avant qu'elle ne touche la parcelle entière.",
        ],
      },
    ],
    formationLiee: 'licence-production-vegetale-protection-cultures',
    miseAJour: '2026-08-13',
    statut: 'a-valider',
  },
];

export function getRessource(slug: string): Ressource | undefined {
  return RESSOURCES.find((ressource) => ressource.slug === slug);
}
