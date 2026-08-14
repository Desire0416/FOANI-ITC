/* ==========================================================================
   Vocabulaire des états d'un dossier — CDC §10.3
   --------------------------------------------------------------------------
   Un seul endroit décrit les états, leur libellé et leur ton. Le tableau de
   bord, la liste et l'écran d'instruction y puisent : un dossier « Complément
   demandé » se lit de la même façon partout.
   ========================================================================== */

export type TonPastille = 'neutre' | 'encre' | 'or' | 'vert' | 'plein' | 'rouge';

export type EtatDossier = {
  readonly cle: string;
  readonly libelle: string;
  readonly ton: TonPastille;
  /** Ce que l'état signifie pour celui qui lit la liste. */
  readonly sens: string;
};

export const ETATS: readonly EtatDossier[] = [
  { cle: 'brouillon', libelle: 'Brouillon', ton: 'neutre', sens: 'Le candidat n’a pas encore soumis.' },
  { cle: 'soumis', libelle: 'Soumis', ton: 'encre', sens: 'Déposé, en attente d’examen.' },
  { cle: 'instruction', libelle: 'En instruction', ton: 'encre', sens: 'Examen en cours.' },
  { cle: 'complement', libelle: 'Complément demandé', ton: 'or', sens: 'La main est au candidat.' },
  { cle: 'complet', libelle: 'Complet', ton: 'vert', sens: 'Pièces validées, en attente de décision.' },
  { cle: 'admis', libelle: 'Admis', ton: 'plein', sens: 'Décision favorable enregistrée.' },
  { cle: 'admis-condition', libelle: 'Admis sous condition', ton: 'plein', sens: 'Conditions à lever.' },
  {
    cle: 'offre-acceptee',
    libelle: 'Offre acceptée',
    ton: 'encre',
    sens: 'Le candidat doit régler les frais réservant sa place.',
  },
  {
    cle: 'versement-annonce',
    libelle: 'Versement annoncé',
    ton: 'or',
    sens: 'À rapprocher du relevé par les finances.',
  },
  {
    cle: 'place-reservee',
    libelle: 'Place réservée',
    ton: 'vert',
    sens: 'La main est au candidat, qui remplit son dossier d’inscription.',
  },
  {
    cle: 'inscription-a-valider',
    libelle: 'Inscription à valider',
    ton: 'or',
    sens: 'À contrôler par la scolarité.',
  },
  { cle: 'attente', libelle: 'Liste d’attente', ton: 'neutre', sens: 'Décision différée.' },
  { cle: 'refuse', libelle: 'Refusé', ton: 'rouge', sens: 'Décision défavorable.' },
  { cle: 'inscrit', libelle: 'Inscrit', ton: 'plein', sens: 'Accès à ouvrir par la pédagogie.' },
  {
    cle: 'acces-ouverts',
    libelle: 'Accès ouverts',
    ton: 'plein',
    sens: 'Parcours d’admission achevé.',
  },
  { cle: 'desiste', libelle: 'Désisté', ton: 'rouge', sens: 'Le candidat a renoncé.' },
  {
    cle: 'annule',
    libelle: 'Annulé',
    ton: 'rouge',
    sens: 'Renoncement après réservation de la place.',
  },
];

const PAR_CLE = new Map(ETATS.map((etat) => [etat.cle, etat]));

export function etat(cle: string | undefined): EtatDossier {
  return (
    PAR_CLE.get(cle ?? '') ?? { cle: cle ?? '—', libelle: cle ?? '—', ton: 'neutre', sens: '' }
  );
}

/**
 * Rend lisible une ligne de journal.
 *
 * Le journal enregistre les états par leur clé — `offre-acceptee` — parce que
 * c'est une trace technique qui doit rester stable même si un libellé change.
 * Mais le candidat lit sa propre histoire : on lui rend les mots, pas les clés.
 * La substitution se fait à l'affichage, jamais à l'écriture.
 */
export function journalEnClair(action: string): string {
  return action.replace(/[a-z]+(?:-[a-z]+)+|[a-z]{4,}/g, (mot) => {
    const trouve = PAR_CLE.get(mot);
    return trouve ? trouve.libelle.toLocaleLowerCase('fr-FR') : mot;
  });
}

/** Habillage des pastilles, partagé par le back-office et le portail candidat. */
export const CLASSES_PASTILLE: Record<TonPastille, string> = {
  neutre: 'bg-graphite-100 text-graphite-600',
  encre: 'bg-ink-50 text-ink-700',
  or: 'bg-gold-50 text-gold-700',
  vert: 'bg-[#e8f4ee] text-[#0f7a4d]',
  plein: 'bg-ink-800 text-paper',
  rouge: 'bg-[#fbeaec] text-state-danger',
};

/* --------------------------------------------------------------------------
   Le même état, dit au candidat
   --------------------------------------------------------------------------
   `sens` ci-dessus s'adresse à un agent qui lit une liste de deux cents
   dossiers : « La main est au candidat » lui est utile. Au candidat lui-même,
   il faut dire ce qu'il doit faire, et sous quel délai il peut espérer une
   suite. D'où ce second vocabulaire, écrit à la deuxième personne.
   -------------------------------------------------------------------------- */

export type SensCandidat = {
  readonly titre: string;
  readonly corps: string;
  /** Vrai lorsque le dossier attend une action du candidat. */
  readonly aVous?: true;
};

export const SENS_CANDIDAT: Record<string, SensCandidat> = {
  brouillon: {
    titre: 'Votre dossier n’est pas encore envoyé',
    corps:
      'Vous pouvez le compléter, vous arrêter et le reprendre plus tard. Rien n’est transmis à l’établissement tant que vous ne l’avez pas envoyé.',
    aVous: true,
  },
  soumis: {
    titre: 'Votre dossier est bien arrivé',
    corps:
      'Le service des admissions va l’examiner. Vous n’avez rien à faire : nous revenons vers vous sur le contact indiqué dans votre dossier.',
  },
  instruction: {
    titre: 'Votre dossier est en cours d’examen',
    corps: 'Vos pièces sont en train d’être vérifiées une par une.',
  },
  complement: {
    titre: 'Il manque quelque chose à votre dossier',
    corps:
      'Une ou plusieurs pièces ont été refusées. Le motif est indiqué en face de chacune. Corrigez-les, puis renvoyez votre dossier.',
    aVous: true,
  },
  complet: {
    titre: 'Votre dossier est complet',
    corps: 'Toutes vos pièces sont validées. La décision d’admission vous sera communiquée.',
  },
  admis: {
    titre: 'Vous êtes admis',
    corps:
      'Il vous reste à accepter votre offre, puis à régler les frais qui réservent votre place. Tout se fait ici, sans vous déplacer.',
    aVous: true,
  },
  'admis-condition': {
    titre: 'Vous êtes admis, sous condition',
    corps:
      'Les conditions à remplir sont indiquées ci-dessous. Vous pouvez accepter votre offre dès maintenant.',
    aVous: true,
  },
  'offre-acceptee': {
    titre: 'Votre offre est acceptée',
    corps:
      'Votre place n’est pas encore réservée : elle le sera dès que votre versement aura été constaté par le service des finances.',
    aVous: true,
  },
  'versement-annonce': {
    titre: 'Votre versement est annoncé',
    corps:
      'Le service des finances va le rapprocher de son relevé. Vous n’avez rien à faire : nous vous prévenons dès que votre place est réservée.',
  },
  'place-reservee': {
    titre: 'Votre place est réservée',
    corps:
      'Il reste à compléter votre dossier d’inscription et à signer vos engagements. Ces étapes ouvrent prochainement dans cet espace.',
    aVous: true,
  },
  'inscription-a-valider': {
    titre: 'Votre inscription est en cours de validation',
    corps: 'Le service de la scolarité contrôle votre dossier et vos engagements signés.',
  },
  'acces-ouverts': {
    titre: 'Vos accès sont ouverts',
    corps:
      'Vos identifiants vous ont été transmis. Vos cours vous sont accessibles. Bienvenue à FOANI-ITC.',
  },
  annule: {
    titre: 'Votre inscription a été annulée',
    corps:
      'Contactez le service des admissions si vous souhaitez connaître les conditions de remboursement.',
  },
  attente: {
    titre: 'Vous êtes sur liste d’attente',
    corps: 'Votre dossier est retenu. Il sera réexaminé si une place se libère.',
  },
  refuse: {
    titre: 'Votre candidature n’a pas été retenue',
    corps:
      'Vous pouvez contacter le service des admissions pour en connaître les raisons, et vous renseigner sur nos autres formations.',
  },
  inscrit: {
    titre: 'Vous êtes inscrit',
    corps:
      'Votre numéro étudiant vous est attribué. Vos accès aux cours sont en cours d’ouverture.',
  },
  desiste: {
    titre: 'Vous vous êtes désisté',
    corps: 'Votre dossier est clos. Contactez les admissions si c’est une erreur.',
  },
};

export function sensCandidat(cle: string | undefined): SensCandidat {
  return (
    SENS_CANDIDAT[cle ?? ''] ?? {
      titre: 'Votre dossier',
      corps: 'Contactez le service des admissions pour connaître son état.',
    }
  );
}

/** Regroupements proposés en filtre rapide sur la liste. */
export const VUES = [
  { cle: 'tous', libelle: 'Tous', etats: null },
  { cle: 'instruire', libelle: 'À instruire', etats: ['soumis', 'instruction'] },
  { cle: 'complement', libelle: 'Compléments', etats: ['complement'] },
  { cle: 'complet', libelle: 'Complets', etats: ['complet'] },
  { cle: 'decides', libelle: 'Décidés', etats: ['admis', 'admis-condition', 'attente', 'refuse'] },
  { cle: 'inscrits', libelle: 'Inscrits', etats: ['inscrit'] },
] as const;

export type CleVue = (typeof VUES)[number]['cle'];

export function etatsDeLaVue(cle: string | undefined): readonly string[] | null {
  const vue = VUES.find((item) => item.cle === cle);
  return vue?.etats ?? null;
}

/** Décisions possibles à l'instruction — §10.3. */
export const DECISIONS = [
  { cle: 'admis', libelle: 'Admis', etat: 'admis' },
  { cle: 'admis-condition', libelle: 'Admis sous condition', etat: 'admis-condition' },
  { cle: 'attente', libelle: 'Liste d’attente', etat: 'attente' },
  { cle: 'refuse', libelle: 'Refusé', etat: 'refuse' },
] as const;

export function formatDate(valeur: string | null | undefined, avecHeure = false): string {
  if (!valeur) return '—';
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'Africa/Abidjan',
    ...(avecHeure ? { hour: '2-digit', minute: '2-digit' } : {}),
  }).format(new Date(valeur));
}
