import { formaterMontant } from '@/payload/finances/montants';
import type { GrilleLue } from '@/payload/finances/grille';
import { echeancesDe } from '@/payload/finances/grille';
import { formatDate } from '@/lib/etats';

/* ==========================================================================
   Ce que coûte une formation, affiché — Note complémentaire §6.4
   --------------------------------------------------------------------------
   Le même tableau sert le site public et l'espace du candidat. Ce n'est pas
   une économie de code : c'est la garantie qu'un candidat lit exactement le
   même montant avant et après avoir déposé son dossier. Deux composants
   auraient fini par diverger, et un tarif qui change en cours de parcours est
   la première chose qu'on reproche à un établissement.

   Rien n'est affiché tant qu'aucune grille n'est arrêtée. Un tarif à zéro
   franc et un tarif non publié ne sont pas la même chose : le premier est une
   gratuité, le second un silence. Les écrans disent le silence.
   ========================================================================== */

export function Tarifs({
  grille,
  avecEcheancier = true,
}: {
  grille: GrilleLue | null;
  avecEcheancier?: boolean;
}) {
  if (!grille) return null;

  const echeances = avecEcheancier ? echeancesDe(grille) : [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="font-display text-[2.5rem] leading-none text-ink-800 tabular-nums">
          {formaterMontant(grille.total)}
        </p>
        <p className="mt-2 text-[0.8125rem] text-graphite-500">
          Pour l’année {grille.anneeAcademique}, toutes natures de frais confondues.
        </p>
      </div>

      <dl className="flex flex-col">
        {grille.lignes.map((ligne) => (
          <div
            key={ligne.nature}
            className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-graphite-100 py-3 last:border-0"
          >
            <dt className="text-[0.9375rem] text-graphite-600">
              {ligne.libelle}
              {ligne.echeances.length > 1 ? (
                <span className="ml-2 text-[0.8125rem] text-graphite-400">
                  en {ligne.echeances.length} tranches
                </span>
              ) : null}
            </dt>
            <dd className="font-display text-[1.0625rem] text-ink-800 tabular-nums">
              {formaterMontant(ligne.montant)}
            </dd>
          </div>
        ))}
      </dl>

      {echeances.length > 0 ? (
        <div>
          <p className="text-[0.75rem] font-bold tracking-[0.12em] text-graphite-500 uppercase">
            L’échéancier
          </p>
          <ol className="mt-3 flex flex-col">
            {echeances.map((echeance, rang) => (
              <li
                key={`${echeance.nature}-${rang}`}
                className="flex flex-wrap items-baseline justify-between gap-x-6 border-b border-graphite-100 py-2.5 last:border-0"
              >
                <span className="text-[0.875rem] text-graphite-600">
                  {formatDate(echeance.exigibleLe)}
                  <span className="ml-2 text-[0.75rem] text-graphite-400">{echeance.libelle}</span>
                </span>
                <span className="font-display text-[0.9375rem] text-ink-800 tabular-nums">
                  {formaterMontant(echeance.montant)}
                </span>
              </li>
            ))}
          </ol>
        </div>
      ) : null}

      <p className="text-[0.75rem] leading-relaxed text-graphite-400">
        Grille arrêtée{grille.arreteeLe ? ` le ${formatDate(grille.arreteeLe)}` : ''} — version{' '}
        {grille.version}. Une évolution de tarif donne lieu à une nouvelle version, et ne modifie pas
        les inscriptions déjà prononcées.
      </p>
    </div>
  );
}
