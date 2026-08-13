'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IconBell, IconSearch } from '@/components/brand/icons';
import { GROUPES } from './barre-laterale';

/**
 * Barre haute.
 *
 * Elle ne répète pas le titre de la page — celui-ci est dans le contenu, en
 * grand. Elle situe : dans quel espace on se trouve, et ce qui attend une
 * action.
 */
export function BarreHaute({ aInstruire }: { aInstruire: number }) {
  const chemin = usePathname();

  const entrees = GROUPES.flatMap((groupe) => groupe.entrees);
  const courante =
    entrees.find((entree) => entree.href !== '/gestion' && chemin.startsWith(entree.href)) ??
    entrees.find((entree) => entree.href === '/gestion');

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-graphite-100 bg-paper/85 px-5 backdrop-blur-md lg:px-8">
      <p className="ml-14 truncate text-[0.9375rem] font-semibold text-ink-800 lg:ml-0">
        {courante?.libelle ?? 'Back-office'}
      </p>

      <div className="ml-auto flex items-center gap-2">
        <Link
          href="/gestion/candidatures"
          aria-label="Rechercher un dossier"
          className="hidden h-10 w-10 items-center justify-center rounded-xl border border-graphite-200 text-graphite-500 transition-colors hover:border-ink-300 hover:bg-ink-50 hover:text-ink-700 sm:flex"
        >
          <IconSearch className="h-[1.125rem] w-[1.125rem]" />
        </Link>

        <Link
          href="/gestion/candidatures?etat=soumis"
          aria-label={
            aInstruire > 0
              ? `${aInstruire} dossier${aInstruire > 1 ? 's' : ''} à instruire`
              : 'Aucun dossier à instruire'
          }
          className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-graphite-200 text-graphite-500 transition-colors hover:border-ink-300 hover:bg-ink-50 hover:text-ink-700"
        >
          <IconBell className="h-[1.125rem] w-[1.125rem]" />
          {aInstruire > 0 ? (
            <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-gold-400 px-1 text-[0.6875rem] font-bold text-ink-900">
              {aInstruire > 99 ? '99+' : aInstruire}
            </span>
          ) : null}
        </Link>
      </div>
    </header>
  );
}
