/* ==========================================================================
   Les natures de frais — Note complémentaire §6.3
   --------------------------------------------------------------------------
   « Le dispositif ne traite pas que la scolarité. Chaque nature de frais est
   administrable et porte son propre régime. »

   Cinq natures académiques, et un circuit à part.

   POURQUOI LE CIRCUIT CABINET EST SÉPARÉ ICI, ET NON PLUS TARD. La note est
   catégorique : « le circuit cabinet doit être distinct dès la conception ».
   La raison n'est pas administrative, elle est structurelle — le client n'est
   pas de même nature. Un étudiant est une personne physique inscrite ; une
   organisation cliente est une personne morale, qui reçoit une facture et non
   un appel de frais, dont le régime fiscal peut différer, et dont la dépense
   peut être prise en charge par un organisme financeur qui n'est ni l'un ni
   l'autre. « Prévoir un seul circuit qu'on adapterait ensuite conduit à tout
   reprendre. »

   CE QUE CE MODULE NE CONTIENT PAS : aucun montant. Les montants vivent dans
   les grilles tarifaires, qui sont versionnées et arrêtées par la direction.
   Une nature dit ce qu'est un frais et quand il devient exigible ; elle ne dit
   pas combien il coûte.
   ========================================================================== */

export type CleNature =
  | 'dossier'
  | 'inscription'
  | 'scolarite'
  | 'annexe'
  | 'session'
  | 'prestation';

/** Le circuit auquel appartient une nature. */
export type Circuit = 'academique' | 'cabinet';

/** Ce qui déclenche l'exigibilité. */
export type Exigibilite =
  | 'soumission'
  | 'acceptation'
  | 'echeancier'
  | 'ponctuel'
  | 'inscription-session'
  | 'commande';

export type Nature = {
  readonly cle: CleNature;
  readonly libelle: string;
  readonly concerne: string;
  readonly regime: string;
  readonly circuit: Circuit;
  readonly exigibilite: Exigibilite;
  /** Échelonnable en plusieurs tranches, ou dû en une fois. */
  readonly echelonnable: boolean;
  /**
   * Remboursable en cas d'abandon ou de refus.
   *
   * `false` n'est pas une commodité de gestion : le §6.3 pose que les frais de
   * dossier ne sont pas remboursables « y compris en cas de refus », et cette
   * règle doit être écrite là où elle est décidée, non répétée dans chaque
   * écran qui l'applique.
   */
  readonly remboursable: boolean;
};

export const NATURES: readonly Nature[] = [
  {
    cle: 'dossier',
    libelle: 'Frais de dossier',
    concerne: 'Candidats',
    regime: 'Exigibles à la soumission. Non remboursables, y compris en cas de refus.',
    circuit: 'academique',
    exigibilite: 'soumission',
    echelonnable: false,
    remboursable: false,
  },
  {
    cle: 'inscription',
    libelle: 'Frais d’inscription',
    concerne: 'Admis',
    regime: 'Exigibles à l’acceptation de l’offre. Réservent la place.',
    circuit: 'academique',
    exigibilite: 'acceptation',
    echelonnable: false,
    remboursable: false,
  },
  {
    cle: 'scolarite',
    libelle: 'Scolarité',
    concerne: 'Étudiants inscrits',
    regime: 'Échelonnée selon l’échéancier de la formation.',
    circuit: 'academique',
    exigibilite: 'echeancier',
    echelonnable: true,
    remboursable: true,
  },
  {
    cle: 'annexe',
    libelle: 'Frais annexes',
    concerne: 'Étudiants inscrits',
    regime:
      'Hébergement, restauration, frais d’examen, frais de stage, duplicata de documents. Ponctuels ou périodiques.',
    circuit: 'academique',
    exigibilite: 'ponctuel',
    echelonnable: true,
    remboursable: true,
  },
  {
    cle: 'session',
    libelle: 'Sessions courtes',
    concerne: 'Participants aux certificats et masterclass',
    regime:
      'Exigibles à l’inscription à la session. La personne n’est pas un étudiant, mais dispose d’un numéro et d’une référence de règlement.',
    circuit: 'academique',
    exigibilite: 'inscription-session',
    echelonnable: true,
    remboursable: true,
  },
  {
    cle: 'prestation',
    libelle: 'Prestations de cabinet',
    concerne: 'Organisations et entreprises',
    regime:
      'Circuit distinct : le client est une personne morale, la facturation peut relever d’un régime fiscal différent, et une prise en charge par un organisme financeur est possible.',
    circuit: 'cabinet',
    exigibilite: 'commande',
    echelonnable: true,
    remboursable: true,
  },
];

const PAR_CLE = new Map(NATURES.map((nature) => [nature.cle, nature]));

export function nature(cle: string | null | undefined): Nature | null {
  return PAR_CLE.get((cle ?? '') as CleNature) ?? null;
}

export function libelleNature(cle: string | null | undefined): string {
  return nature(cle)?.libelle ?? (cle ?? '—');
}

/** Les natures d'un circuit, dans l'ordre du parcours. */
export function naturesDu(circuit: Circuit): readonly Nature[] {
  return NATURES.filter((item) => item.circuit === circuit);
}

/** Les options d'un champ de sélection Payload. */
export const OPTIONS_NATURE = NATURES.map((item) => ({
  value: item.cle,
  label: item.libelle,
}));

/* --------------------------------------------------------------------------
   Les modes de règlement — §6.6
   --------------------------------------------------------------------------
   « Les modes admis sont le paiement mobile vers les numéros officiels de
   l'établissement, le virement bancaire, et le versement au guichet lorsque
   la personne est sur place. Dans tous les cas, la saisie dans le dispositif
   est le fait d'un agent : le dispositif n'encaisse rien. »
   -------------------------------------------------------------------------- */

export type CleMode = 'mobile' | 'virement' | 'guichet' | 'cheque';

export const MODES: readonly { readonly cle: CleMode; readonly libelle: string }[] = [
  { cle: 'mobile', libelle: 'Paiement mobile' },
  { cle: 'virement', libelle: 'Virement bancaire' },
  { cle: 'guichet', libelle: 'Versement au guichet' },
  { cle: 'cheque', libelle: 'Chèque' },
];

export function libelleMode(cle: string | null | undefined): string {
  return MODES.find((mode) => mode.cle === cle)?.libelle ?? (cle ?? '—');
}

export const OPTIONS_MODE = MODES.map((mode) => ({ value: mode.cle, label: mode.libelle }));
