import Link from 'next/link';
import { IconArrowUpRight, IconClock } from '@/components/brand/icons';
import { LeafSprig } from '@/components/brand/marks';
import { Pill } from '@/components/ui/primitives';
import { CYCLE_LABELS, DOMAINE_LABELS, dureeLisible, titreComplet } from '@/content/formations';
import type { Formation } from '@/content/types';
import { cn } from '@/lib/utils';

/* ==========================================================================
   Carte de formation
   Un seul objet visuel pour tout le site : catalogue, page d'accueil, pages
   de rubrique, résultats de recherche. Une même formation se reconnaît
   partout à la même carte.
   ========================================================================== */

const TON_CYCLE = {
  bts: 'bg-ink-800 text-paper',
  licence: 'bg-ink-700 text-paper',
  certificat: 'bg-gold-100 text-gold-700',
  masterclass: 'bg-ink-50 text-ink-700',
} as const;

export function FormationCard({ formation, className }: { formation: Formation; className?: string }) {
  const duree = dureeLisible(formation);
  const premierDomaine = formation.domaines[0];

  return (
    <article
      className={cn(
        'group/carte relative flex h-full flex-col overflow-hidden rounded-card-lg border border-graphite-100 bg-paper',
        'transition-[transform,box-shadow,border-color] duration-500 ease-[var(--ease-arc)]',
        'hover:[transform:translateY(-0.25rem)] hover:border-ink-100 hover:shadow-lift',
        className,
      )}
    >
      {/* L'arc, à sa plus petite échelle : un quart de cercle en haut à droite
          qui se colore au survol. Même signe, même geste que dans le hero. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-16 h-32 w-32 rounded-pill bg-gold-50 transition-transform duration-700 ease-[var(--ease-arc)] group-hover/carte:[transform:scale(1.5)]"
      />

      <div className="relative flex flex-1 flex-col p-6">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              'rounded-pill px-3 py-1 text-[0.6875rem] font-bold uppercase tracking-[0.1em]',
              TON_CYCLE[formation.cycle],
            )}
          >
            {CYCLE_LABELS[formation.cycle]}
          </span>
          {premierDomaine ? <Pill tone="outline">{DOMAINE_LABELS[premierDomaine]}</Pill> : null}
        </div>

        <h3 className="mt-4 text-[1.25rem] leading-snug text-ink-800">
          <Link href={`/formations/${formation.slug}`} className="after:absolute after:inset-0">
            {titreComplet(formation)}
          </Link>
        </h3>

        <p className="mt-3 flex-1 text-[0.9375rem] leading-relaxed text-graphite-500">{formation.resume}</p>

        <div className="mt-6 flex items-center justify-between gap-4 border-t border-graphite-100 pt-4">
          <span className="flex items-center gap-2 text-[0.8125rem] text-graphite-500">
            {duree ? (
              <>
                <IconClock className="h-4 w-4 text-gold-500" />
                {duree}
              </>
            ) : (
              <>
                <LeafSprig className="h-3.5 w-3.5 text-gold-500" />
                Durée à confirmer
              </>
            )}
          </span>
          <span className="flex items-center gap-1.5 text-[0.8125rem] font-semibold text-ink-700">
            Consulter
            <IconArrowUpRight className="h-4 w-4 transition-transform duration-300 ease-[var(--ease-arc)] group-hover/carte:[transform:translate(0.125rem,-0.125rem)]" />
          </span>
        </div>
      </div>
    </article>
  );
}
