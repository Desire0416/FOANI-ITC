'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { IconArrowRight, IconArrowUpRight, IconCheck, IconClock } from '@/components/brand/icons';
import { LeafSprig } from '@/components/brand/marks';
import { cn } from '@/lib/utils';
import type { Cycle, Domaine } from '@/content/types';

/* ==========================================================================
   Catalogue rapide — §8.9 « Aperçu des formations »
   --------------------------------------------------------------------------
   Trente formations affichées à plat, c'est une liste qu'on ne lit pas. Le
   bloc les range donc en trois niveaux qui se resserrent l'un après l'autre :

     1. Le type d'engagement — un diplôme, ou une formation courte.
     2. Le niveau exact      — BTS, Licence, Certificat, Masterclass.
     3. Le domaine           — élevage, cultures, transformation, gestion…

   Chaque niveau porte le nombre de formations qu'il contient : le visiteur
   voit la liste fondre à mesure qu'il descend, et sait toujours combien il
   lui reste à regarder. Trois clics au maximum pour atteindre une fiche.

   Le premier niveau est présélectionné sur « un diplôme » : le bloc n'est
   jamais vide au chargement, et le public le plus nombreux — les bacheliers —
   trouve sa réponse sans avoir rien à faire.
   ========================================================================== */

/**
 * Index allégé — six champs par formation. Le catalogue complet, avec ses
 * programmes, ses débouchés et ses questions fréquentes, n'a rien à faire
 * dans le navigateur d'un visiteur en 3G (§18.2, priorité au téléphone).
 */
export type EntreeApercu = {
  readonly slug: string;
  readonly titre: string;
  readonly cycle: Cycle;
  readonly domaines: readonly Domaine[];
  readonly resume: string;
  /** Durée lisible, ou `null` tant que l'établissement ne l'a pas arrêtée. */
  readonly duree: string | null;
};

type IdFamille = 'diplome' | 'court';

type Famille = {
  readonly id: IdFamille;
  readonly libelle: string;
  readonly precision: string;
  readonly cycles: readonly Cycle[];
};

const FAMILLES: readonly Famille[] = [
  {
    id: 'diplome',
    libelle: 'Je veux un diplôme',
    precision: 'Après le bac, en 2 ou 3 ans',
    cycles: ['bts', 'licence'],
  },
  {
    id: 'court',
    libelle: 'Je veux me former rapidement',
    precision: 'Sans condition de diplôme, même si vous travaillez',
    cycles: ['certificat', 'masterclass'],
  },
];

/** Mêmes tons que la carte du catalogue : une formation se reconnaît partout
 *  à la même couleur de pastille. */
const TON_CYCLE: Record<Cycle, string> = {
  bts: 'bg-ink-800 text-paper',
  licence: 'bg-ink-700 text-paper',
  certificat: 'bg-gold-100 text-gold-700',
  masterclass: 'bg-ink-50 text-ink-700',
};

const NIVEAUX: Record<Cycle, { readonly libelle: string; readonly precision: string }> = {
  bts: { libelle: 'BTS', precision: '2 ans, examen d’État' },
  licence: { libelle: 'Licence', precision: '3 ans, rentrée 2026' },
  certificat: { libelle: 'Certificat', precision: 'Métier pratique' },
  masterclass: { libelle: 'Masterclass', precision: 'Module de quelques jours' },
};

const DOMAINES: readonly { readonly id: Domaine; readonly libelle: string }[] = [
  { id: 'production-animale', libelle: 'Élevage' },
  { id: 'production-vegetale', libelle: 'Cultures' },
  { id: 'agroalimentaire', libelle: 'Transformation' },
  { id: 'agribusiness', libelle: 'Gestion et commerce' },
  { id: 'environnement', libelle: 'Environnement' },
  { id: 'technologie', libelle: 'Technologie' },
  { id: 'transversal', libelle: 'Transversal' },
];

/** Fiches montrées dans le bloc. Au-delà, on renvoie au catalogue filtré
 *  plutôt que d'allonger la page d'accueil. */
const APERCU = 6;

export function CatalogueRapide({ index }: { index: readonly EntreeApercu[] }) {
  const [famille, setFamille] = useState<IdFamille>('diplome');
  const [cycle, setCycle] = useState<Cycle | null>(null);
  const [domaine, setDomaine] = useState<Domaine | null>(null);

  const familleActive = FAMILLES.find((item) => item.id === famille) ?? FAMILLES[0]!;

  /** Compte ce que donnerait une sélection, sans l'appliquer : c'est ce
   *  nombre, affiché sur chaque bouton, qui rend le filtre lisible. */
  const compter = useMemo(
    () =>
      (criteres: { famille?: Famille; cycle?: Cycle | null; domaine?: Domaine | null }) => {
        const f = criteres.famille ?? familleActive;
        const c = criteres.cycle !== undefined ? criteres.cycle : cycle;
        const d = criteres.domaine !== undefined ? criteres.domaine : domaine;
        return index.filter((entree) => {
          if (!f.cycles.includes(entree.cycle)) return false;
          if (c && entree.cycle !== c) return false;
          if (d && !entree.domaines.includes(d)) return false;
          return true;
        }).length;
      },
    [index, familleActive, cycle, domaine],
  );

  const resultats = useMemo(
    () =>
      index.filter((entree) => {
        if (!familleActive.cycles.includes(entree.cycle)) return false;
        if (cycle && entree.cycle !== cycle) return false;
        if (domaine && !entree.domaines.includes(domaine)) return false;
        return true;
      }),
    [index, familleActive, cycle, domaine],
  );

  const parametres = new URLSearchParams();
  parametres.set('cycle', cycle ?? familleActive.cycles.join(','));
  if (domaine) parametres.set('domaine', domaine);
  const lienCatalogue = `/formations?${parametres.toString()}#catalogue`;

  function choisirFamille(suivante: Famille) {
    setFamille(suivante.id);
    setCycle(null);
    setDomaine(null);
  }

  function choisirCycle(suivant: Cycle | null) {
    setCycle(suivant);
    // Un domaine devenu sans objet dans le nouveau niveau est retiré : mieux
    // vaut élargir tout seul que présenter une liste vide sans l'expliquer.
    if (domaine !== null && compter({ cycle: suivant }) === 0) setDomaine(null);
  }

  return (
    <div className="mt-10">
      {/* =============================================== Les trois niveaux */}
      <div className="reveal overflow-hidden rounded-card-lg border border-graphite-100 bg-paper-tint shadow-raise">
        <Niveau
          numero={1}
          question="Quel type de formation ?"
          fait
          premier
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {FAMILLES.map((option) => {
              const actif = option.id === famille;
              return (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={actif}
                  onClick={() => choisirFamille(option)}
                  className={cn(
                    'flex items-center gap-4 rounded-card border p-4 text-left transition-all duration-300 ease-[var(--ease-arc)]',
                    actif
                      ? 'border-ink-700 bg-ink-700 text-paper shadow-lift'
                      : 'border-graphite-200 bg-paper hover:border-ink-300 hover:shadow-raise',
                  )}
                >
                  <span
                    className={cn(
                      'flex h-11 w-11 shrink-0 items-center justify-center rounded-pill font-display text-[1.125rem] tabular-nums',
                      actif ? 'bg-gold-400 text-ink-900' : 'bg-ink-50 text-ink-700',
                    )}
                  >
                    {compter({ famille: option, cycle: null, domaine: null })}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[1rem] font-semibold">{option.libelle}</span>
                    <span
                      className={cn(
                        'mt-0.5 block text-[0.8125rem] leading-snug',
                        actif ? 'text-ink-200' : 'text-graphite-500',
                      )}
                    >
                      {option.precision}
                    </span>
                  </span>
                  {actif ? <IconCheck className="ml-auto h-5 w-5 shrink-0 text-gold-400" /> : null}
                </button>
              );
            })}
          </div>
        </Niveau>

        <Niveau numero={2} question="À quel niveau ?" fait={cycle !== null}>
          <div className="flex flex-wrap gap-2">
            <Jeton actif={cycle === null} onClick={() => choisirCycle(null)} compte={compter({ cycle: null })}>
              Tous les niveaux
            </Jeton>
            {familleActive.cycles.map((identifiant) => {
              const niveau = NIVEAUX[identifiant];
              const compte = compter({ cycle: identifiant });
              return (
                <Jeton
                  key={identifiant}
                  actif={cycle === identifiant}
                  onClick={() => choisirCycle(cycle === identifiant ? null : identifiant)}
                  compte={compte}
                  desactive={compte === 0}
                >
                  {niveau.libelle}
                  <span
                    className={cn(
                      'hidden font-normal sm:inline',
                      cycle === identifiant ? 'text-ink-200' : 'text-graphite-500',
                    )}
                  >
                    · {niveau.precision}
                  </span>
                </Jeton>
              );
            })}
          </div>
        </Niveau>

        <Niveau numero={3} question="Dans quel domaine ?" fait={domaine !== null} dernier>
          <div className="flex flex-wrap gap-2">
            <Jeton actif={domaine === null} onClick={() => setDomaine(null)} compte={compter({ domaine: null })}>
              Tous les domaines
            </Jeton>
            {DOMAINES.map((option) => {
              const compte = compter({ domaine: option.id });
              if (compte === 0) return null;
              return (
                <Jeton
                  key={option.id}
                  actif={domaine === option.id}
                  onClick={() => setDomaine(domaine === option.id ? null : option.id)}
                  compte={compte}
                >
                  {option.libelle}
                </Jeton>
              );
            })}
          </div>
        </Niveau>
      </div>

      {/* ==================================================== Le résultat */}
      <div className="mt-8">
        <div className="reveal flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
          <p className="flex items-center gap-2.5 text-[1rem] text-graphite-600" aria-live="polite">
            <LeafSprig className="h-4 w-4 shrink-0 text-gold-500" />
            <span>
              <strong className="font-display text-[1.375rem] text-ink-800 tabular-nums">
                {resultats.length}
              </strong>{' '}
              formation{resultats.length > 1 ? 's' : ''} correspond
              {resultats.length > 1 ? 'ent' : ''} à votre recherche
            </span>
          </p>
          {resultats.length > APERCU ? (
            <Link
              href={lienCatalogue}
              className="link-underline inline-block py-1 text-[0.875rem] font-semibold text-ink-700 hover:text-ink-600"
            >
              Voir les {resultats.length} formations
            </Link>
          ) : null}
        </div>

        {resultats.length === 0 ? (
          <p className="reveal mt-5 rounded-card-lg border border-dashed border-graphite-200 bg-paper px-5 py-8 text-center text-[0.9375rem] text-graphite-600">
            Aucune formation ne réunit ces critères. Revenez à l’étape 2 et choisissez « tous les
            niveaux »,
            ou{' '}
            <Link href="/contact" className="font-semibold text-ink-700 hover:text-ink-600">
              écrivez-nous
            </Link>
            .
          </p>
        ) : (
          <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {resultats.slice(0, APERCU).map((entree, rang) => (
              <li
                key={entree.slug}
                className="paraitre"
                style={{ ['--paraitre-delai' as string]: `${rang * 55}ms` }}
              >
                <Link
                  href={`/formations/${entree.slug}`}
                  className="group/fiche relative flex h-full flex-col overflow-hidden rounded-card-lg border border-graphite-100 bg-paper p-5 transition-[transform,box-shadow,border-color] duration-500 ease-[var(--ease-arc)] hover:[transform:translateY(-0.25rem)] hover:border-ink-100 hover:shadow-lift"
                >
                  {/* L'arc, à sa plus petite échelle — même geste que sur la
                      carte de formation du catalogue. */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-16 -top-16 h-32 w-32 rounded-pill bg-gold-50 transition-transform duration-700 ease-[var(--ease-arc)] group-hover/fiche:[transform:scale(1.5)]"
                  />
                  <span
                    className={cn(
                      'relative inline-flex w-fit items-center rounded-pill px-3 py-1 text-[0.6875rem] font-bold uppercase tracking-[0.1em]',
                      TON_CYCLE[entree.cycle],
                    )}
                  >
                    {NIVEAUX[entree.cycle].libelle}
                  </span>
                  <span className="relative mt-3 font-display text-[1.125rem] leading-snug text-ink-800">
                    {entree.titre}
                  </span>
                  <span className="relative mt-2 flex-1 text-[0.875rem] leading-relaxed text-graphite-500">
                    {entree.resume}
                  </span>
                  <span className="relative mt-5 flex items-center justify-between gap-3 border-t border-graphite-100 pt-4">
                    <span className="flex items-center gap-2 text-[0.8125rem] text-graphite-500">
                      {entree.duree ? (
                        <>
                          <IconClock className="h-4 w-4 shrink-0 text-gold-500" />
                          {entree.duree}
                        </>
                      ) : (
                        <>
                          <LeafSprig className="h-3.5 w-3.5 shrink-0 text-gold-500" />
                          Durée à confirmer
                        </>
                      )}
                    </span>
                    <span className="flex items-center gap-1.5 text-[0.8125rem] font-semibold text-ink-700">
                      Consulter
                      <IconArrowUpRight className="h-4 w-4 transition-transform duration-300 ease-[var(--ease-arc)] group-hover/fiche:[transform:translate(0.125rem,-0.125rem)]" />
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {resultats.length > 0 ? (
          <div className="reveal mt-8">
            <Link
              href={lienCatalogue}
              className="group/cta inline-flex h-12 items-center justify-center gap-2.5 rounded-pill border border-ink-700 px-6 text-[0.875rem] font-semibold text-ink-700 transition-all duration-300 ease-[var(--ease-arc)] hover:bg-ink-700 hover:text-paper"
            >
              {resultats.length > APERCU
                ? `Voir les ${resultats.length} formations en détail`
                : 'Ouvrir le catalogue complet'}
              <IconArrowRight className="h-4 w-4 transition-transform duration-300 ease-[var(--ease-arc)] group-hover/cta:[transform:translateX(3px)]" />
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function Niveau({
  numero,
  question,
  fait,
  premier = false,
  dernier = false,
  children,
}: {
  numero: number;
  question: string;
  fait: boolean;
  premier?: boolean;
  dernier?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        'p-5 sm:p-6',
        !premier && 'border-t border-graphite-100',
        dernier && 'bg-paper/60',
      )}
    >
      <div className="flex items-center gap-3">
        <span
          className={cn(
            'flex h-6 w-6 shrink-0 items-center justify-center rounded-pill font-display text-[0.75rem] transition-colors duration-300',
            fait ? 'bg-ink-700 text-paper' : 'bg-graphite-200 text-graphite-600',
          )}
        >
          {numero}
        </span>
        <h3 className="text-[0.9375rem] font-bold uppercase tracking-[0.1em] text-graphite-700">
          {question}
        </h3>
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function Jeton({
  actif,
  desactive = false,
  compte,
  onClick,
  children,
}: {
  actif: boolean;
  desactive?: boolean;
  compte: number;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={actif}
      disabled={desactive}
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-2 rounded-pill border px-4 py-2 text-[0.8125rem] font-semibold transition-all duration-300 ease-[var(--ease-arc)]',
        actif
          ? 'border-ink-700 bg-ink-700 text-paper shadow-raise'
          : desactive
            ? 'cursor-not-allowed border-graphite-100 bg-graphite-100 text-graphite-400'
            : 'border-graphite-200 bg-paper text-graphite-700 hover:border-ink-300 hover:text-ink-700',
      )}
    >
      {children}
      <span
        className={cn(
          'tabular-nums',
          actif ? 'text-gold-300' : desactive ? 'text-graphite-400' : 'text-graphite-500',
        )}
        aria-label={`${compte} formation${compte > 1 ? 's' : ''}`}
      >
        {compte}
      </span>
    </button>
  );
}
