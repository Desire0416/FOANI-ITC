'use client';

import { useSearchParams } from 'next/navigation';
import { useMemo, useState, type ReactNode } from 'react';
import { IconClose, IconSearch } from '@/components/brand/icons';
import { LeafSprig } from '@/components/brand/marks';
import { cn, normalize } from '@/lib/utils';
import type { Cycle, Domaine } from '@/content/types';

/* ==========================================================================
   Catalogue filtrable — §9.4
   --------------------------------------------------------------------------
   Les cartes sont rendues par le serveur et transmises telles quelles dans
   `carte`. Le navigateur ne reçoit donc pas le catalogue en JSON pour le
   re-rendre : il reçoit du balisage déjà fait, et ce composant se contente
   de décider ce qui reste affiché. Sur une connexion mobile dégradée, la
   différence est nette — et les moteurs de recherche voient les trente
   formations, filtre ou pas.
   ========================================================================== */

export type EntreeCatalogue = {
  readonly slug: string;
  readonly titre: string;
  readonly resume: string;
  readonly cycle: Cycle;
  readonly domaines: readonly Domaine[];
  readonly carte: ReactNode;
};

const CYCLES: readonly { readonly id: Cycle; readonly libelle: string }[] = [
  { id: 'bts', libelle: 'BTS' },
  { id: 'licence', libelle: 'Licence' },
  { id: 'certificat', libelle: 'Certificats' },
  { id: 'masterclass', libelle: 'Masterclass' },
];

const DOMAINES: readonly { readonly id: Domaine; readonly libelle: string }[] = [
  { id: 'production-animale', libelle: 'Production animale' },
  { id: 'production-vegetale', libelle: 'Production végétale' },
  { id: 'agroalimentaire', libelle: 'Agroalimentaire' },
  { id: 'agribusiness', libelle: 'Agribusiness' },
  { id: 'environnement', libelle: 'Environnement' },
  { id: 'technologie', libelle: 'Technologie' },
  { id: 'transversal', libelle: 'Transversal' },
];

/** Ne retient d'une liste d'URL que les valeurs réellement connues du catalogue. */
function lire<T extends string>(brut: string | null, connues: readonly T[]): readonly T[] {
  if (!brut) return [];
  return brut.split(',').filter((valeur): valeur is T => connues.includes(valeur as T));
}

export function Catalogue({ entrees }: { entrees: readonly EntreeCatalogue[] }) {
  const parametres = useSearchParams();
  const depuisUrl = `${parametres.get('cycle') ?? ''}|${parametres.get('domaine') ?? ''}`;

  const [cycles, setCycles] = useState<readonly Cycle[]>(() =>
    lire(parametres.get('cycle'), CYCLES.map((item) => item.id)),
  );
  const [domaines, setDomaines] = useState<readonly Domaine[]>(() =>
    lire(parametres.get('domaine'), DOMAINES.map((item) => item.id)),
  );
  const [terme, setTerme] = useState('');
  const [urlAppliquee, setUrlAppliquee] = useState(depuisUrl);

  /* Les liens du site arrivent avec un filtre déjà posé (?cycle=bts,licence).
     L'ajustement se fait pendant le rendu, pas dans un effet : c'est le
     motif recommandé par React pour recaler un état sur une entrée qui
     change, et il évite le rendu en cascade d'un `setState` différé. */
  if (urlAppliquee !== depuisUrl) {
    setUrlAppliquee(depuisUrl);
    setCycles(lire(parametres.get('cycle'), CYCLES.map((item) => item.id)));
    setDomaines(lire(parametres.get('domaine'), DOMAINES.map((item) => item.id)));
  }

  const termeNormalise = useMemo(() => normalize(terme), [terme]);

  const visibles = useMemo(() => {
    return entrees.filter((entree) => {
      if (cycles.length > 0 && !cycles.includes(entree.cycle)) return false;
      if (domaines.length > 0 && !entree.domaines.some((domaine) => domaines.includes(domaine))) return false;
      if (termeNormalise.length > 1) {
        const foin = normalize(`${entree.titre} ${entree.resume}`);
        if (!termeNormalise.split(' ').every((mot) => foin.includes(mot))) return false;
      }
      return true;
    });
  }, [entrees, cycles, domaines, termeNormalise]);

  const actif = cycles.length > 0 || domaines.length > 0 || terme.length > 0;

  const bascule = <T,>(liste: readonly T[], valeur: T): readonly T[] =>
    liste.includes(valeur) ? liste.filter((item) => item !== valeur) : [...liste, valeur];

  return (
    <div id="catalogue">
      {/* ----------------------------------------------------------- Filtres */}
      <div className="rounded-card-lg border border-graphite-100 bg-paper p-5 shadow-raise sm:p-6">
        <div className="flex flex-col gap-5">
          <div className="relative">
            <IconSearch
              aria-hidden="true"
              className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-graphite-500"
            />
            <label htmlFor="catalogue-recherche" className="sr-only">
              Rechercher une formation par intitulé ou par mot-clé
            </label>
            <input
              id="catalogue-recherche"
              type="search"
              value={terme}
              onChange={(event) => setTerme(event.target.value)}
              placeholder="Aviculture, agribusiness, transformation…"
              className="h-13 w-full rounded-pill border border-graphite-200 bg-paper-tint py-3.5 pl-12 pr-4 text-[0.9375rem] text-ink-800 placeholder:text-graphite-500 focus:border-ink-300 focus:bg-paper focus:outline-none"
            />
          </div>

          <GroupeFiltre titre="Type de formation">
            {CYCLES.map((option) => (
              <Chip
                key={option.id}
                actif={cycles.includes(option.id)}
                onClick={() => setCycles((liste) => bascule(liste, option.id))}
              >
                {option.libelle}
              </Chip>
            ))}
          </GroupeFiltre>

          <GroupeFiltre titre="Domaine">
            {DOMAINES.map((option) => (
              <Chip
                key={option.id}
                actif={domaines.includes(option.id)}
                onClick={() => setDomaines((liste) => bascule(liste, option.id))}
              >
                {option.libelle}
              </Chip>
            ))}
          </GroupeFiltre>
        </div>
      </div>

      {/* ---------------------------------------------------------- Résultats */}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <p aria-live="polite" className="text-[0.9375rem] text-graphite-600">
          <span className="font-display text-[1.25rem] text-ink-800 tabular-nums">{visibles.length}</span>{' '}
          {visibles.length > 1 ? 'formations' : 'formation'}
          {actif ? ' correspondent à votre sélection' : ' au catalogue'}
        </p>
        {actif ? (
          <button
            type="button"
            onClick={() => {
              setCycles([]);
              setDomaines([]);
              setTerme('');
            }}
            className="inline-flex items-center gap-1.5 rounded-pill border border-graphite-200 px-4 py-2 text-[0.8125rem] font-semibold text-graphite-600 transition-colors hover:border-ink-300 hover:text-ink-700"
          >
            <IconClose className="h-3.5 w-3.5" />
            Tout afficher
          </button>
        ) : null}
      </div>

      {visibles.length === 0 ? (
        <div className="mt-8 rounded-card-lg border border-dashed border-graphite-200 bg-paper-tint px-6 py-14 text-center">
          <LeafSprig className="mx-auto h-8 w-8 text-gold-400" />
          <p className="mt-4 font-display text-[1.25rem] text-ink-800">Aucune formation ne correspond.</p>
          <p className="mx-auto mt-2 max-w-md text-[0.9375rem] leading-relaxed text-graphite-500">
            Élargissez votre sélection, ou dites-nous ce que vous cherchez : un conseiller vous orientera vers la
            formation adaptée, ou vous signalera si nous ne la proposons pas.
          </p>
          <a
            href="/contact"
            className="mt-6 inline-flex h-12 items-center justify-center rounded-pill bg-ink-800 px-6 text-[0.875rem] font-semibold text-paper transition-colors hover:bg-ink-700"
          >
            Parler à un conseiller
          </a>
        </div>
      ) : (
        <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visibles.map((entree) => (
            <li key={entree.slug}>{entree.carte}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function GroupeFiltre({ titre, children }: { titre: string; children: ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-2.5 text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-graphite-600">
        {titre}
      </legend>
      <div className="flex flex-wrap gap-2">{children}</div>
    </fieldset>
  );
}

function Chip({
  actif,
  onClick,
  children,
}: {
  actif: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={actif}
      onClick={onClick}
      className={cn(
        'rounded-pill border px-4 py-2 text-[0.8125rem] font-semibold transition-all duration-300 ease-[var(--ease-arc)]',
        actif
          ? 'border-ink-800 bg-ink-800 text-paper shadow-raise'
          : 'border-graphite-200 bg-paper text-graphite-600 hover:border-ink-300 hover:text-ink-700',
      )}
    >
      {children}
    </button>
  );
}
