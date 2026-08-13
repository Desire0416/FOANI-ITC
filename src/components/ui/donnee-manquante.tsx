import Link from 'next/link';
import { IconInfo } from '@/components/brand/icons';
import { cn } from '@/lib/utils';

/**
 * Donnée non encore arrêtée par l'établissement.
 *
 * Le CDC est ferme sur ce point (§9.1) : « un candidat qui ne trouve pas le
 * prix quitte le site ». Tant que la grille n'est pas publiée, le silence est
 * le pire choix — on dit donc explicitement que l'information existe, qu'elle
 * n'est pas encore publiée, et on donne le moyen de l'obtenir tout de suite.
 */
export function DonneeManquante({
  quoi,
  action = { libelle: 'Demander cette information', href: '/contact' },
  className,
}: {
  quoi: string;
  action?: { libelle: string; href: string } | null;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-card border border-dashed border-gold-200 bg-gold-50 p-5 sm:flex-row sm:items-center sm:justify-between',
        className,
      )}
    >
      <p className="flex items-start gap-3 text-[0.875rem] leading-relaxed text-gold-800">
        <IconInfo aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-gold-600" />
        <span>{quoi}</span>
      </p>
      {action ? (
        <Link
          href={action.href}
          className="inline-flex h-10 shrink-0 items-center justify-center rounded-pill bg-ink-800 px-5 text-[0.8125rem] font-semibold text-paper transition-colors hover:bg-ink-700"
        >
          {action.libelle}
        </Link>
      ) : null}
    </div>
  );
}
