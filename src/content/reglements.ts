/* ==========================================================================
   Les textes que l'étudiant signe — Note complémentaire §5.1 étape 6, §7.3
   --------------------------------------------------------------------------
   « Le candidat prend connaissance du règlement de scolarité et de
   l'engagement financier, comportant l'échéancier qui lui est applicable. »

   AVERTISSEMENT, ET IL EST SÉRIEUX.

   Ces textes engagent juridiquement l'établissement et l'étudiant. Ils ne
   peuvent pas être rédigés par le prestataire : ils relèvent du conseil de
   l'établissement, qui doit les arrêter. Le §7.3 de la note le dit d'ailleurs
   sans détour — la valeur juridique de la signature électronique est « à faire
   confirmer par le conseil de l'établissement avant la mise en ligne ».

   Ce qui figure ici est donc un PROJET, porté à la version 0.1, destiné à
   éprouver le dispositif et à servir de point de départ à la rédaction. Il
   reprend ce que le cahier des charges et la note prescrivent, et rien de
   plus : aucune clause n'a été inventée.

   Deux conséquences pratiques, écrites ici pour qu'on ne les découvre pas
   trop tard :

   1. Chaque signature enregistre la VERSION du texte signé. Le jour où le
      conseil arrête le texte définitif, la version change, et les signatures
      recueillies sur la version 0.1 deviennent identifiables — il faudra les
      recueillir de nouveau. C'est prévu, ce n'est pas indolore.
   2. L'engagement financier ne porte aucun montant. L'établissement n'a
      communiqué aucune grille tarifaire ; un échéancier chiffré serait
      inventé, ce qui, dans un document que l'étudiant signe, serait la faute
      la plus grave que ce dispositif puisse commettre. Le texte renvoie donc
      à l'appel de frais, qui portera les montants une fois la grille arrêtée.
   ========================================================================== */

export const VERSION_REGLEMENTS = '0.1-projet';

/** Tant qu'il n'est pas `valide`, l'écran le dit au signataire. */
export const STATUT_REGLEMENTS: 'projet' | 'valide' = 'projet';

export type Reglement = {
  readonly cle: string;
  readonly titre: string;
  readonly chapo: string;
  readonly articles: readonly { readonly titre: string; readonly texte: string }[];
};

export const REGLEMENTS: readonly Reglement[] = [
  {
    cle: 'scolarite',
    titre: 'Règlement de scolarité',
    chapo:
      'Ce qui est attendu de vous pendant votre année, et ce que l’établissement s’engage à vous fournir.',
    articles: [
      {
        titre: 'Article 1 — Objet',
        texte:
          'Le présent règlement fixe les conditions dans lesquelles se déroule la scolarité au sein de FOANI International Training College. Il s’applique à toute personne inscrite, pour l’année universitaire au titre de laquelle l’inscription a été prononcée.',
      },
      {
        titre: 'Article 2 — Assiduité',
        texte:
          'La présence aux enseignements, aux travaux pratiques et aux évaluations est obligatoire. Toute absence est justifiée auprès du service de la scolarité. Les modalités de contrôle de l’assiduité et les conséquences d’absences répétées sont arrêtées par l’établissement et portées à la connaissance des étudiants en début d’année.',
      },
      {
        titre: 'Article 3 — Évaluations',
        texte:
          'Les modalités d’évaluation propres à chaque enseignement sont communiquées au plus tard au début de la période concernée. Toute fraude ou tentative de fraude lors d’une évaluation expose son auteur aux sanctions prévues par le règlement disciplinaire de l’établissement.',
      },
      {
        titre: 'Article 4 — Conformité documentaire',
        texte:
          'L’inscription est prononcée sur la base des pièces numériques déposées. La vérification des documents originaux suit un calendrier distinct et ne conditionne pas la validité immédiate de l’inscription. En cas de non-conformité constatée, l’accès aux enseignements et aux évaluations internes demeure ouvert ; sont en revanche suspendues l’inscription à l’examen d’État, la délivrance du diplôme et celle du relevé de parcours définitif, jusqu’à régularisation.',
      },
      {
        titre: 'Article 5 — Données personnelles',
        texte:
          'Les informations recueillies servent à établir l’inscription, à produire les documents officiels qui en découlent et à assurer le suivi de la scolarité. Elles sont accessibles aux seuls services de l’établissement dont le travail les concerne. Chaque consultation d’une pièce d’identité est enregistrée avec le nom de son auteur. L’étudiant dispose d’un droit d’accès et de rectification, qu’il exerce auprès du service de la scolarité.',
      },
      {
        titre: 'Article 6 — Discipline',
        texte:
          'Tout manquement au présent règlement, aux règles de sécurité applicables sur le campus et sur les parcelles d’application, ou au respect dû aux personnes, peut donner lieu à une procédure disciplinaire. Celle-ci est contradictoire : l’étudiant est entendu avant toute décision.',
      },
    ],
  },
  {
    cle: 'financier',
    titre: 'Engagement financier',
    chapo:
      'Ce que vous devez à l’établissement, quand, et ce qu’il advient si un règlement tarde.',
    articles: [
      {
        titre: 'Article 1 — Objet de l’engagement',
        texte:
          'En signant, vous vous engagez à régler les frais afférents à votre inscription pour l’année universitaire concernée, selon la grille tarifaire de l’établissement et l’échéancier qui vous est applicable.',
      },
      {
        titre: 'Article 2 — Montants et échéancier',
        texte:
          'Les montants dus, leur nature et la date d’exigibilité de chaque tranche vous sont notifiés par un appel de frais, numéroté, mis à votre disposition dans votre espace personnel et joint au présent engagement. Aucun montant ne figure au présent article : il est arrêté par l’établissement et porté par l’appel de frais, dont la date d’émission fait foi.',
      },
      {
        titre: 'Article 3 — Modalités de règlement',
        texte:
          'Les règlements s’effectuent par paiement mobile vers les numéros officiels de l’établissement, par virement bancaire, ou au guichet. Chaque règlement mentionne votre référence de règlement personnelle, faute de quoi il ne peut être rattaché à votre dossier. Un règlement peut être effectué par un tiers ; il vous est alors imputé par cette même référence.',
      },
      {
        titre: 'Article 4 — Constatation des versements',
        texte:
          'Un versement annoncé dans votre espace personnel n’a aucun effet tant qu’il n’a pas été constaté par le service des finances, qui le rapproche du relevé de l’établissement. Un reçu numéroté vous est délivré à chaque encaissement constaté.',
      },
      {
        titre: 'Article 5 — Retard de règlement',
        texte:
          'En cas d’échéance dépassée, des relances vous sont adressées. L’accès aux enseignements, à la plateforme pédagogique et aux évaluations internes demeure ouvert, de même que la consultation de votre situation financière et la délivrance de vos reçus. Sont en revanche suspendues la délivrance des autres documents officiels et la réinscription pour l’année suivante. Toute levée de suspension relève de la direction, est motivée et laisse une trace.',
      },
      {
        titre: 'Article 6 — Aménagements',
        texte:
          'Une réduction, un échéancier particulier ou une prise en charge par un tiers peuvent être accordés sur demande. L’aménagement est enregistré sur votre inscription, motivé, et validé par la direction.',
      },
    ],
  },
];

export function reglement(cle: string): Reglement | null {
  return REGLEMENTS.find((item) => item.cle === cle) ?? null;
}
