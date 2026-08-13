'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IconBell, IconSearch } from '@/components/brand/icons';
import { GROUPES } from './barre-laterale';

/**
 * Barre haute.
 *
 * Elle ne répète pas le titre de la page — celui-ci est dans le contenu, en
 * grand. Elle situe : dans quel espace on se trouve, ce qu'on peut chercher,
 * et ce qui attend une action.
 *
 * Le champ de recherche est un vrai formulaire, présent sur toutes les pages :
 * en campagne, un chargé d'admission cherche un dossier par son numéro ou par
 * un nom vingt fois par jour, et il ne devrait pas avoir à revenir d'abord sur
 * la liste pour le faire.
 */
export function BarreHaute({
  aInstruire,
  initiales,
  nomComplet,
  fonction,
}: {
  aInstruire: number;
  initiales: string;
  nomComplet: string;
  fonction: string;
}) {
  const chemin = usePathname();

  const entrees = GROUPES.flatMap((groupe) => groupe.entrees);
  const courante =
    entrees.find((entree) => entree.href !== '/gestion' && chemin.startsWith(entree.href)) ??
    entrees.find((entree) => entree.href === '/gestion');

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-graphite-100 bg-paper/85 px-5 backdrop-blur-md lg:gap-5 lg:px-8">
      <p className="ml-14 shrink-0 truncate text-[0.9375rem] font-semibold text-ink-800 lg:ml-0">
        {courante?.libelle ?? 'Back-office'}
      </p>

      {/* ------------------------------------------------------- Recherche */}
      <form action="/gestion/candidatures" className="relative ml-auto hidden max-w-sm flex-1 sm:block">
        <label htmlFor="recherche-haute" className="sr-only">
          Rechercher un dossier par numéro, par nom ou par référence de paiement
        </label>
        <IconSearch
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-3.5 h-[1.0625rem] w-[1.0625rem] -translate-y-1/2 text-graphite-400"
        />
        <input
          id="recherche-haute"
          name="q"
          type="search"
          placeholder="Numéro de dossier, nom…"
          className="h-10 w-full rounded-xl border border-graphite-200 bg-paper-tint pr-4 pl-11 text-[0.875rem] text-ink-800 transition-[border-color,background-color] outline-none placeholder:text-graphite-400 focus:border-ink-700 focus:bg-paper"
        />
      </form>

      <div className="ml-auto flex items-center gap-2 sm:ml-0">
        <Link
          href="/gestion/candidatures"
          aria-label="Rechercher un dossier"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-graphite-200 text-graphite-500 transition-colors hover:border-ink-300 hover:bg-ink-50 hover:text-ink-700 sm:hidden"
        >
          <IconSearch className="h-[1.125rem] w-[1.125rem]" />
        </Link>

        <Link
          href="/gestion/candidatures?vue=instruire"
          aria-label={
            aInstruire > 0
              ? `${aInstruire} dossier${aInstruire > 1 ? 's' : ''} à instruire`
              : 'Aucun dossier à instruire'
          }
          className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-graphite-200 text-graphite-500 transition-colors hover:border-ink-300 hover:bg-ink-50 hover:text-ink-700"
        >
          <IconBell className="h-[1.125rem] w-[1.125rem]" />
          {aInstruire > 0 ? (
            <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-gold-400 px-1 text-[0.6875rem] font-bold text-ink-900">
              {aInstruire > 99 ? '99+' : aInstruire}
            </span>
          ) : null}
        </Link>

        {/* Identité : lisible d'un coup d'œil, et surtout le rôle — c'est lui
            qui explique pourquoi tel écran est absent du menu. */}
        <span className="flex items-center gap-2.5 rounded-xl border border-graphite-200 bg-paper py-1.5 pr-3 pl-1.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-ink-800 text-[0.6875rem] font-bold text-gold-400">
            {initiales}
          </span>
          <span className="hidden flex-col leading-tight lg:flex">
            <span className="text-[0.8125rem] font-semibold text-ink-800">{nomComplet}</span>
            <span className="text-[0.6875rem] text-graphite-500">{fonction}</span>
          </span>
        </span>
      </div>
    </header>
  );
}
