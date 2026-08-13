import { LaurelWreath, StarMark } from '@/components/brand/marks';
import { cn } from '@/lib/utils';

/**
 * Emplacement photographique en attente.
 *
 * Le CDC confie la production photographique à l'établissement (§7.3) et
 * interdit tout emprunt visuel à un autre établissement (§9.3). Plutôt que
 * de combler avec une banque d'images — ce qui reviendrait à illustrer FITC
 * avec une exploitation qui n'est pas la sienne —, l'emplacement s'assume :
 * il est traité comme une surface de marque, porte le sujet attendu, et se
 * remplace par une balise `next/image` sans toucher à la mise en page.
 */
export function MediaPlaceholder({
  sujet,
  className,
  ratio = 'aspect-[4/3]',
}: {
  sujet: string;
  className?: string;
  ratio?: string;
}) {
  return (
    <div
      role="img"
      aria-label={`Emplacement photographique : ${sujet}. Visuel à fournir par l'établissement.`}
      className={cn(
        'relative isolate flex flex-col justify-end overflow-hidden rounded-media bg-ink-800 p-6',
        ratio,
        className,
      )}
    >
      <LaurelWreath
        className="pointer-events-none absolute left-1/2 top-1/2 h-[130%] w-[130%] -translate-x-1/2 -translate-y-1/2 text-paper/[0.06]"
        leaves={13}
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-ink-950/70 to-transparent"
      />
      <div className="relative">
        <p className="inline-flex items-center gap-2 text-[0.625rem] font-bold uppercase tracking-[0.16em] text-gold-400">
          <StarMark className="h-2.5 w-2.5" />
          Visuel à fournir
        </p>
        <p className="mt-2 font-display text-[1.0625rem] leading-snug text-paper">{sujet}</p>
      </div>
    </div>
  );
}
