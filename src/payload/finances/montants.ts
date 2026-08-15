/* ==========================================================================
   Les montants et leur arithmétique — Note complémentaire §6.4
   --------------------------------------------------------------------------
   « La grille comporte le montant total, le nombre de tranches, ainsi que le
   montant et la date d'exigibilité de chacune. »

   LE FRANC CFA N'A PAS DE CENTIME. Le XOF s'exprime en unités entières : il
   n'existe pas de pièce de moins d'un franc, et la comptabilité ne connaît pas
   de décimale. Tous les montants du dispositif sont donc des ENTIERS de
   francs. Aucun nombre à virgule flottante n'approche un montant : 0,1 + 0,2
   ne vaut pas 0,3 en binaire, et une somme d'échéances qui ne retombe pas sur
   son total est un litige.

   RÉPARTIR SANS PERDRE NI CRÉER. Trois cent mille francs en sept tranches font
   42 857,14… — ce qui n'existe pas. Arrondir chaque tranche donne 42 857 × 7 =
   299 999 : il manque un franc, et la dernière quittance ne solde pas la
   créance. Arrondir au supérieur donne 42 858 × 7 = 300 006 : l'établissement
   réclame six francs de trop.

   La répartition retenue distribue le reste : les premières tranches portent
   un franc de plus, jusqu'à épuisement. La somme retombe exactement sur le
   total, par construction, et la première échéance est la plus chargée — ce
   qui est aussi la plus prudente des deux répartitions possibles.
   ========================================================================== */

/** Un montant est un entier de francs CFA. Jamais un flottant. */
export type Montant = number;

export const DEVISE = 'XOF';

/**
 * Répartit un total en `tranches` parts entières dont la somme vaut le total.
 *
 * Le reste de la division est distribué à raison d'un franc par tranche, en
 * commençant par la première. Pour 300 000 en 7 : quatre tranches de 42 858 et
 * trois de 42 857, dont la somme fait exactement 300 000.
 */
export function repartir(total: Montant, tranches: number): readonly Montant[] {
  if (!Number.isInteger(total) || total < 0) {
    throw new Error('Un montant est un entier de francs, positif ou nul.');
  }
  if (!Number.isInteger(tranches) || tranches < 1) {
    throw new Error('Le nombre de tranches est un entier d’au moins un.');
  }

  const base = Math.floor(total / tranches);
  const reste = total - base * tranches;

  return Array.from({ length: tranches }, (_, rang) => base + (rang < reste ? 1 : 0));
}

/**
 * Met un montant en toutes lettres de chiffres, à la française.
 *
 * L'espace employé est l'espace insécable étroit : c'est celui que la
 * typographie française met entre les groupes de trois chiffres, et il évite
 * qu'un montant se coupe en fin de ligne sur une quittance.
 */
export function formaterMontant(montant: Montant | null | undefined): string {
  if (montant === null || montant === undefined) return '—';
  return `${new Intl.NumberFormat('fr-FR').format(montant).replace(/ | | /g, ' ')} F CFA`;
}

/** La même chose, sans la devise : pour une colonne de tableau déjà titrée. */
export function formaterNombre(montant: Montant | null | undefined): string {
  if (montant === null || montant === undefined) return '—';
  return new Intl.NumberFormat('fr-FR').format(montant).replace(/ | | /g, ' ');
}

/**
 * Lit un montant saisi par un agent.
 *
 * Les espaces sont tolérés — un agent qui recopie « 300 000 » depuis une
 * délibération ne doit pas se voir refuser sa saisie.
 *
 * Le point et la virgule sont refusés, et c'est délibéré. « 300.000 » vaut
 * trois cent mille en typographie française et trois cents dans la plupart des
 * logiciels, dont les tableurs d'où l'agent recopie. Deviner lequel, c'est se
 * tromper d'un facteur mille une fois sur deux — sur une quittance. Refuser
 * coûte une frappe ; se tromper coûte un litige.
 */
export function lireMontant(saisie: string): { readonly ok: true; readonly montant: Montant } | { readonly ok: false; readonly message: string } {
  const brut = saisie.trim();
  if (!brut) return { ok: false, message: 'Indiquez un montant.' };

  if (/[.,]/.test(brut)) {
    return {
      ok: false,
      message:
        'N’employez ni point ni virgule : « 300.000 » se lit aussi bien trois cents que trois cent mille. Écrivez 300000, ou 300 000.',
    };
  }

  const chiffres = brut.replace(/\s/g, '');
  if (!/^\d+$/.test(chiffres)) {
    return { ok: false, message: 'Un montant ne comporte que des chiffres.' };
  }

  const montant = Number(chiffres);
  if (!Number.isSafeInteger(montant)) {
    return { ok: false, message: 'Ce montant est trop grand.' };
  }

  return { ok: true, montant };
}

/* --------------------------------------------------------------------------
   Les échéances
   -------------------------------------------------------------------------- */

export type Echeance = {
  readonly rang: number;
  readonly montant: Montant;
  /** Date d'exigibilité, au format ISO. */
  readonly exigibleLe: string;
};

/**
 * Construit un échéancier à partir d'un total, d'un nombre de tranches et de
 * dates d'exigibilité.
 *
 * Les dates sont fournies : elles relèvent du calendrier de l'établissement,
 * non d'un calcul. En déduire des mensualités automatiques supposerait de
 * connaître le rythme de l'année académique, que le dispositif n'a pas à
 * inventer.
 */
export function echeancier(
  total: Montant,
  dates: readonly string[],
): readonly Echeance[] {
  if (dates.length === 0) throw new Error('Un échéancier comporte au moins une date.');
  const parts = repartir(total, dates.length);
  return dates.map((exigibleLe, rang) => ({
    rang: rang + 1,
    montant: parts[rang]!,
    exigibleLe,
  }));
}

/** Total d'une suite de montants. Entier, par construction. */
export function total(montants: readonly Montant[]): Montant {
  return montants.reduce((somme, montant) => somme + montant, 0);
}

/* --------------------------------------------------------------------------
   L'ancienneté d'une créance — §6.9
   --------------------------------------------------------------------------
   « État des créances par ancienneté : répartition des sommes dues par tranche
   d'ancienneté — à échoir, échu depuis moins de trente jours, de trente à
   soixante, au-delà. »
   -------------------------------------------------------------------------- */

export type TrancheAnciennete = 'a-echoir' | 'moins-30' | '30-60' | 'plus-60';

export const LIBELLES_ANCIENNETE: Record<TrancheAnciennete, string> = {
  'a-echoir': 'À échoir',
  'moins-30': 'Échu depuis moins de 30 jours',
  '30-60': 'Échu depuis 30 à 60 jours',
  'plus-60': 'Échu depuis plus de 60 jours',
};

export function anciennete(exigibleLe: string, maintenant = new Date()): TrancheAnciennete {
  const jours = Math.floor(
    (maintenant.getTime() - new Date(exigibleLe).getTime()) / (24 * 60 * 60 * 1000),
  );
  if (jours < 0) return 'a-echoir';
  if (jours < 30) return 'moins-30';
  if (jours <= 60) return '30-60';
  return 'plus-60';
}
