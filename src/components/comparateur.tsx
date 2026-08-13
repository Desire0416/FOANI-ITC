'use client';

import Link from 'next/link';
import { useState } from 'react';
import { IconArrowUpRight, IconClose } from '@/components/brand/icons';
import { cn } from '@/lib/utils';

/* ==========================================================================
   Comparateur — §9.4
   --------------------------------------------------------------------------
   Trois formations au maximum, sur les critères qui décident réellement :
   durée, niveau requis, diplôme, frais, débouchés, poursuites. Ce que
   l'établissement n'a pas encore arrêté s'affiche comme tel — une case vide
   dans un comparateur est une information, une case inventée est une faute.
   ========================================================================== */

export type EntreeComparaison = {
  readonly slug: string;
  readonly titre: string;
  readonly cycle: string;
  readonly diplome: string;
  readonly duree: string | null;
  readonly niveauRequis: string;
  readonly modalite: string;
  readonly frais: string | null;
  readonly debouches: readonly string[];
  readonly poursuites: readonly string[];
};

const LIGNES = [
  { cle: 'cycle', libelle: 'Type' },
  { cle: 'diplome', libelle: 'Diplôme délivré' },
  { cle: 'duree', libelle: 'Durée' },
  { cle: 'niveauRequis', libelle: 'Niveau requis' },
  { cle: 'modalite', libelle: 'Modalité' },
  { cle: 'frais', libelle: 'Frais de scolarité' },
] as const;

const MAX = 3;

export function Comparateur({ entrees }: { entrees: readonly EntreeComparaison[] }) {
  const [choisis, setChoisis] = useState<readonly string[]>([]);

  const selection = choisis
    .map((slug) => entrees.find((entree) => entree.slug === slug))
    .filter((entree): entree is EntreeComparaison => entree !== undefined);

  const ajouter = (slug: string) => {
    if (!slug || choisis.includes(slug) || choisis.length >= MAX) return;
    setChoisis((liste) => [...liste, slug]);
  };

  return (
    <div id="comparer">
      <div className="flex flex-col gap-4 rounded-card-lg border border-graphite-100 bg-paper p-5 sm:flex-row sm:items-center sm:p-6">
        <label htmlFor="comparateur-ajout" className="text-[0.9375rem] font-semibold text-ink-800">
          Ajouter une formation à comparer
        </label>
        <select
          id="comparateur-ajout"
          value=""
          disabled={choisis.length >= MAX}
          onChange={(event) => ajouter(event.target.value)}
          className="h-12 flex-1 rounded-pill border border-graphite-200 bg-paper-tint px-5 text-[0.9375rem] text-ink-800 focus:border-ink-300 focus:bg-paper focus:outline-none disabled:opacity-55"
        >
          <option value="">
            {choisis.length >= MAX ? `Maximum de ${MAX} formations atteint` : 'Choisir une formation…'}
          </option>
          {entrees
            .filter((entree) => !choisis.includes(entree.slug))
            .map((entree) => (
              <option key={entree.slug} value={entree.slug}>
                {entree.titre}
              </option>
            ))}
        </select>
      </div>

      {selection.length === 0 ? (
        <p className="mt-6 text-[0.9375rem] leading-relaxed text-graphite-500">
          Sélectionnez jusqu’à {MAX} formations pour les comparer côte à côte. La comparaison porte sur les
          critères de choix, pas sur l’organisation interne de l’établissement.
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[42rem] border-collapse text-left">
            <caption className="sr-only">Comparaison des formations sélectionnées</caption>
            <thead>
              <tr>
                <th scope="col" className="w-40 border-b border-graphite-100 pb-4 pr-4 align-bottom">
                  <span className="text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-graphite-600">
                    Critère
                  </span>
                </th>
                {selection.map((entree) => (
                  <th key={entree.slug} scope="col" className="border-b border-graphite-100 px-4 pb-4 align-bottom">
                    <div className="flex items-start justify-between gap-3">
                      <Link
                        href={`/formations/${entree.slug}`}
                        className="font-display text-[1.0625rem] leading-snug text-ink-800 hover:text-ink-700"
                      >
                        {entree.titre}
                      </Link>
                      <button
                        type="button"
                        onClick={() => setChoisis((liste) => liste.filter((slug) => slug !== entree.slug))}
                        aria-label={`Retirer ${entree.titre} de la comparaison`}
                        className="shrink-0 rounded-pill p-1.5 text-graphite-500 transition-colors hover:bg-ink-50 hover:text-ink-700"
                      >
                        <IconClose className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {LIGNES.map((ligne, index) => (
                <tr key={ligne.cle} className={cn(index % 2 === 1 && 'bg-paper-tint')}>
                  <th scope="row" className="py-3.5 pr-4 align-top text-[0.8125rem] font-semibold text-graphite-600">
                    {ligne.libelle}
                  </th>
                  {selection.map((entree) => {
                    const valeur = entree[ligne.cle];
                    return (
                      <td key={entree.slug} className="px-4 py-3.5 align-top text-[0.875rem] text-ink-800">
                        {valeur ?? <span className="text-graphite-500">Non publié à ce jour</span>}
                      </td>
                    );
                  })}
                </tr>
              ))}
              <tr>
                <th scope="row" className="py-3.5 pr-4 align-top text-[0.8125rem] font-semibold text-graphite-600">
                  Débouchés
                </th>
                {selection.map((entree) => (
                  <td key={entree.slug} className="px-4 py-3.5 align-top text-[0.875rem] text-ink-800">
                    <ul className="flex flex-col gap-1.5">
                      {entree.debouches.slice(0, 4).map((debouche) => (
                        <li key={debouche} className="leading-snug">
                          {debouche}
                        </li>
                      ))}
                    </ul>
                  </td>
                ))}
              </tr>
              <tr className="bg-paper-tint">
                <th scope="row" className="py-3.5 pr-4 align-top text-[0.8125rem] font-semibold text-graphite-600">
                  Poursuite d’études
                </th>
                {selection.map((entree) => (
                  <td key={entree.slug} className="px-4 py-3.5 align-top text-[0.875rem] text-ink-800">
                    <ul className="flex flex-col gap-1.5">
                      {entree.poursuites.map((poursuite) => (
                        <li key={poursuite} className="leading-snug">
                          {poursuite}
                        </li>
                      ))}
                    </ul>
                  </td>
                ))}
              </tr>
              <tr>
                <td />
                {selection.map((entree) => (
                  <td key={entree.slug} className="px-4 pt-5">
                    <Link
                      href={`/formations/${entree.slug}`}
                      className="inline-flex items-center gap-1.5 py-1 text-[0.875rem] font-semibold text-ink-700 hover:text-ink-600"
                    >
                      Voir la fiche
                      <IconArrowUpRight className="h-4 w-4" />
                    </Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
