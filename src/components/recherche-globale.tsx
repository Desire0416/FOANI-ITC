'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { IconArrowUpRight, IconClose, IconSearch } from '@/components/brand/icons';
import { LeafSprig } from '@/components/brand/marks';
import { LIBELLES_TYPE, type Resultat, type TypeResultat } from '@/lib/recherche-types';
import { cn, normalize } from '@/lib/utils';

/* ==========================================================================
   Recherche globale
   --------------------------------------------------------------------------
   Correspondance tolérante : la requête est normalisée — accents et
   ponctuation retirés —, découpée en mots, et chaque mot doit se retrouver
   dans la clé du document. « pisciculture », « Pisciculture » et
   « piciculture » ne se valent pas, mais un préfixe suffit : saisir
   « avicul » trouve la fiche.

   Les intitulés officiels des diplômes ne sont jamais réécrits (§19.4) :
   c'est la requête qui s'assouplit, pas le contenu.
   ========================================================================== */

const TYPES: readonly TypeResultat[] = ['formation', 'ressource', 'page', 'actualite', 'evenement', 'expertise'];

const TONS: Record<TypeResultat, string> = {
  formation: 'bg-ink-800 text-paper',
  ressource: 'bg-gold-100 text-gold-700',
  page: 'bg-ink-50 text-ink-700',
  actualite: 'bg-ink-100 text-ink-800',
  evenement: 'bg-gold-50 text-gold-700',
  expertise: 'bg-graphite-100 text-graphite-700',
};

export function RechercheGlobale({ index }: { index: readonly Resultat[] }) {
  const parametres = useSearchParams();
  const requeteUrl = parametres.get('q') ?? '';
  const [terme, setTerme] = useState(requeteUrl);
  const [type, setType] = useState<TypeResultat | null>(null);
  const [urlAppliquee, setUrlAppliquee] = useState(requeteUrl);
  const champ = useRef<HTMLInputElement>(null);

  /* Une recherche peut arriver depuis un lien (?q=aviculture). L'état se
     recale pendant le rendu, sans effet intermédiaire. */
  if (urlAppliquee !== requeteUrl) {
    setUrlAppliquee(requeteUrl);
    setTerme(requeteUrl);
  }

  /* Le focus, lui, est bien un effet : il touche le DOM, pas l'état. */
  useEffect(() => {
    champ.current?.focus();
  }, []);

  const resultats = useMemo(() => {
    const mots = normalize(terme).split(' ').filter((mot) => mot.length > 1);
    const filtres = type ? index.filter((item) => item.type === type) : index;
    if (mots.length === 0) return filtres;

    return filtres
      .map((item) => {
        let score = 0;
        for (const mot of mots) {
          if (!item.cle.includes(mot)) return null;
          // Un mot présent dans le titre pèse davantage qu'un mot du corps.
          score += normalize(item.titre).includes(mot) ? 3 : 1;
        }
        return { item, score };
      })
      .filter((entree): entree is { item: Resultat; score: number } => entree !== null)
      .sort((a, b) => b.score - a.score)
      .map((entree) => entree.item);
  }, [index, terme, type]);

  const aCherche = normalize(terme).length > 1;
  const compteParType = useMemo(() => {
    const mots = normalize(terme).split(' ').filter((mot) => mot.length > 1);
    const base = mots.length === 0 ? index : index.filter((item) => mots.every((mot) => item.cle.includes(mot)));
    return TYPES.reduce<Record<string, number>>((acc, cle) => {
      acc[cle] = base.filter((item) => item.type === cle).length;
      return acc;
    }, {});
  }, [index, terme]);

  return (
    <div>
      <div className="relative">
        <IconSearch
          aria-hidden="true"
          className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-graphite-500"
        />
        <label htmlFor="recherche-globale" className="sr-only">
          Rechercher sur le site
        </label>
        <input
          ref={champ}
          id="recherche-globale"
          type="search"
          value={terme}
          onChange={(event) => setTerme(event.target.value)}
          placeholder="Un métier, une production, un diplôme, un sujet…"
          className="h-16 w-full rounded-pill border border-graphite-200 bg-paper pl-14 pr-14 text-[1.0625rem] text-ink-800 shadow-raise placeholder:text-graphite-500 focus:border-ink-300 focus:outline-none"
        />
        {terme ? (
          <button
            type="button"
            onClick={() => setTerme('')}
            aria-label="Effacer la recherche"
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-pill p-2.5 text-graphite-500 transition-colors hover:bg-ink-50 hover:text-ink-700"
          >
            <IconClose className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      {/* ------------------------------------------------------- Filtres de type */}
      <div className="mt-6 flex flex-wrap gap-2">
        <FiltreType actif={type === null} onClick={() => setType(null)} compte={resultats.length}>
          Tout
        </FiltreType>
        {TYPES.map((cle) => (
          <FiltreType
            key={cle}
            actif={type === cle}
            onClick={() => setType(type === cle ? null : cle)}
            compte={compteParType[cle] ?? 0}
          >
            {LIBELLES_TYPE[cle]}
          </FiltreType>
        ))}
      </div>

      {/* ------------------------------------------------------------ Résultats */}
      <p aria-live="polite" className="mt-8 text-[0.9375rem] text-graphite-500">
        <span className="font-display text-[1.25rem] text-ink-800 tabular-nums">{resultats.length}</span>{' '}
        {resultats.length > 1 ? 'résultats' : 'résultat'}
        {aCherche ? (
          <>
            {' '}
            pour «&nbsp;<span className="font-semibold text-ink-800">{terme}</span>&nbsp;»
          </>
        ) : null}
      </p>

      {resultats.length === 0 ? (
        <div className="mt-8 rounded-card-lg border border-dashed border-graphite-200 bg-paper-tint px-6 py-14 text-center">
          <LeafSprig aria-hidden="true" className="mx-auto h-8 w-8 text-gold-400" />
          <p className="mt-4 font-display text-[1.25rem] text-ink-800">Rien ne correspond à cette recherche.</p>
          <p className="mx-auto mt-2 max-w-md text-[0.9375rem] leading-relaxed text-graphite-500">
            Essayez un terme plus général — une production, un métier, un diplôme. Si le sujet vous semble
            manquer, signalez-le&nbsp;: les recherches sans résultat orientent les contenus à produire.
          </p>
          <Link
            href="/contact?sujet=recherche"
            className="mt-6 inline-flex h-12 items-center justify-center rounded-pill bg-ink-800 px-6 text-[0.875rem] font-semibold text-paper transition-colors hover:bg-ink-700"
          >
            Signaler un contenu manquant
          </Link>
        </div>
      ) : (
        <ul className="mt-6 grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
          {resultats.slice(0, 40).map((resultat) => (
            <li key={resultat.id}>
              <Link
                href={resultat.url}
                className="group/res flex items-start justify-between gap-6 rounded-card-lg border border-graphite-100 bg-paper p-5 transition-[transform,border-color,box-shadow] duration-400 ease-[var(--ease-arc)] hover:[transform:translateY(-0.125rem)] hover:border-ink-100 hover:shadow-raise"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={cn(
                        'rounded-pill px-2.5 py-0.5 text-[0.6875rem] font-bold uppercase tracking-[0.1em]',
                        TONS[resultat.type],
                      )}
                    >
                      {LIBELLES_TYPE[resultat.type]}
                    </span>
                    <span className="text-[0.75rem] text-graphite-500">{resultat.categorie}</span>
                  </div>
                  <p className="mt-2.5 font-display text-[1.0625rem] leading-snug text-ink-800">{resultat.titre}</p>
                  <p className="mt-1.5 line-clamp-2 text-[0.875rem] leading-relaxed text-graphite-500">
                    {resultat.resume}
                  </p>
                </div>
                <IconArrowUpRight className="mt-1 h-5 w-5 shrink-0 text-gold-500 transition-transform duration-300 ease-[var(--ease-arc)] group-hover/res:[transform:translate(0.125rem,-0.125rem)]" />
              </Link>
            </li>
          ))}
        </ul>
      )}

      {resultats.length > 40 ? (
        <p className="mt-6 text-center text-[0.875rem] text-graphite-500">
          Seuls les 40 premiers résultats sont affichés. Affinez votre recherche pour en voir davantage.
        </p>
      ) : null}
    </div>
  );
}

function FiltreType({
  actif,
  onClick,
  compte,
  children,
}: {
  actif: boolean;
  onClick: () => void;
  compte: number;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={actif}
      onClick={onClick}
      disabled={compte === 0 && !actif}
      className={cn(
        'inline-flex items-center gap-2 rounded-pill border px-4 py-2 text-[0.8125rem] font-semibold transition-all duration-300 ease-[var(--ease-arc)] disabled:opacity-40',
        actif
          ? 'border-ink-800 bg-ink-800 text-paper'
          : 'border-graphite-200 bg-paper text-graphite-600 hover:border-ink-300 hover:text-ink-700',
      )}
    >
      {children}
      <span className={cn('text-[0.75rem] tabular-nums', actif ? 'text-gold-300' : 'text-graphite-500')}>
        {compte}
      </span>
    </button>
  );
}
