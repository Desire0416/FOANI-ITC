import type { Payload } from 'payload';
import { echeancier, total, type Echeance, type Montant } from './montants';
import { libelleNature, nature } from './natures';

/* ==========================================================================
   Lire une grille tarifaire — Note complémentaire §6.4
   --------------------------------------------------------------------------
   Ce module répond à une seule question, posée par plusieurs écrans : que
   coûte cette formation, cette année, et selon quel échéancier ?

   La grille applicable est la dernière VERSION ARRÊTÉE pour la formation et
   l'année demandées. Un brouillon n'est jamais applicable : il n'engage
   personne, et la direction doit pouvoir en préparer un sans que le site
   public l'affiche.

   Le montant de chaque tranche n'est pas stocké : il se déduit du montant de
   la ligne et du nombre d'échéances, par la répartition qui ne perd pas de
   francs. Stocker les deux, c'est se donner deux vérités à maintenir — et
   c'est celle qui n'est pas recalculée qui finit par mentir.
   ========================================================================== */

export type LigneTarif = {
  readonly nature: string;
  readonly libelle: string;
  readonly montant: Montant;
  readonly echeances: readonly Echeance[];
};

export type GrilleLue = {
  readonly id: string | number;
  readonly code: string;
  readonly version: number;
  readonly anneeAcademique: string;
  readonly formation: string | null;
  readonly intitule: string | null;
  readonly lignes: readonly LigneTarif[];
  readonly total: Montant;
  readonly arreteeLe: string | null;
};

type LigneBrute = {
  nature?: string | null;
  libelle?: string | null;
  montant?: number | null;
  echeances?: { exigibleLe?: string | null; intitule?: string | null }[] | null;
};

function lireLignes(brutes: readonly LigneBrute[]): readonly LigneTarif[] {
  return brutes.map((brute) => {
    const montant = Math.max(0, Math.round(Number(brute.montant ?? 0)));
    const dates = (brute.echeances ?? [])
      .map((echeance) => echeance.exigibleLe)
      .filter((date): date is string => Boolean(date));

    return {
      nature: brute.nature ?? 'autre',
      libelle: brute.libelle?.trim() || libelleNature(brute.nature),
      montant,
      /* Sans date d'échéance, le frais est dû en une fois : c'est le cas des
         frais de dossier et d'inscription, que le §6.3 rend exigibles à un
         instant précis plutôt qu'échelonnés. */
      echeances: dates.length > 0 ? echeancier(montant, dates) : [],
    };
  });
}

/**
 * La grille applicable à une formation, pour une année.
 *
 * `null` tant que l'établissement n'en a arrêté aucune. Les écrans le disent
 * alors franchement, plutôt que d'afficher un zéro — un tarif à zéro franc et
 * un tarif non publié ne sont pas la même chose.
 */
export async function grilleApplicable(
  payload: Payload,
  formation: string | null | undefined,
  anneeAcademique: string,
): Promise<GrilleLue | null> {
  const { docs } = await payload.find({
    collection: 'grilles',
    where: {
      and: [
        { etat: { equals: 'arretee' } },
        { anneeAcademique: { equals: anneeAcademique } },
        formation ? { formation: { equals: formation } } : { formation: { exists: false } },
      ],
    },
    sort: '-version',
    limit: 1,
    depth: 0,
    overrideAccess: true,
  });

  const brute = docs[0] as unknown as Record<string, unknown> | undefined;
  if (!brute) return null;

  const lignes = lireLignes((brute.lignes as LigneBrute[] | null) ?? []);

  return {
    id: brute.id as string | number,
    code: String(brute.code ?? ''),
    version: Number(brute.version ?? 1),
    anneeAcademique: String(brute.anneeAcademique ?? ''),
    formation: (brute.formation as string | null) ?? null,
    intitule: (brute.intitule as string | null) ?? null,
    lignes,
    total: total(lignes.map((ligne) => ligne.montant)),
    arreteeLe: (brute.arreteeLe as string | null) ?? null,
  };
}

/** Le montant d'une nature dans une grille, s'il y figure. */
export function montantDe(grille: GrilleLue | null, cle: string): Montant | null {
  if (!grille) return null;
  const ligne = grille.lignes.find((item) => item.nature === cle);
  return ligne ? ligne.montant : null;
}

/**
 * Ce qui réserve la place — §6.3.
 *
 * « Frais d'inscription : exigibles à l'acceptation de l'offre. Réservent la
 * place. » C'est le montant que porte la lettre d'admission, et celui que le
 * candidat doit régler pour que son dossier d'inscription s'ouvre.
 */
export function montantReservantLaPlace(grille: GrilleLue | null): Montant | null {
  return montantDe(grille, 'inscription');
}

/** Les frais dus à la soumission d'une candidature — §6.3. */
export function fraisDeDossier(grille: GrilleLue | null): Montant | null {
  return montantDe(grille, 'dossier');
}

/** Les lignes échelonnées, dans l'ordre des natures déclarées. */
export function lignesEchelonnees(grille: GrilleLue | null): readonly LigneTarif[] {
  if (!grille) return [];
  return grille.lignes.filter((ligne) => ligne.echeances.length > 0);
}

/** L'échéancier complet, toutes natures confondues, trié par date. */
export function echeancesDe(grille: GrilleLue | null): readonly (Echeance & { readonly nature: string; readonly libelle: string })[] {
  if (!grille) return [];
  return grille.lignes
    .flatMap((ligne) =>
      ligne.echeances.map((echeance) => ({
        ...echeance,
        nature: ligne.nature,
        libelle: ligne.libelle,
      })),
    )
    .sort((a, b) => a.exigibleLe.localeCompare(b.exigibleLe));
}

/** Le régime d'une nature, tel que la note le pose. */
export function regimeDe(cle: string): string | null {
  return nature(cle)?.regime ?? null;
}
