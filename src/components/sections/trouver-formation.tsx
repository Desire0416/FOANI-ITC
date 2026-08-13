'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { IconArrowRight, IconCheck, IconClose } from '@/components/brand/icons';
import { LaurelWreath, StarMark } from '@/components/brand/marks';
import { cn } from '@/lib/utils';
import type { Cycle, Domaine } from '@/content/types';

/* ==========================================================================
   « Quelle formation pour vous ? » — §8.9, §9.2 et §9.4
   --------------------------------------------------------------------------
   La version précédente posait deux questions puis affichait un nombre : le
   visiteur ne voyait pas qu'il était en train de trier le catalogue. Trois
   corrections, toutes destinées à rendre l'action lisible sans effort :

   1. Un compteur part de trente et descend à chaque clic. On voit la liste
      se réduire, donc on comprend ce que l'on est en train de faire.
   2. Les formations retenues s'affichent tout de suite, sous les filtres.
      Le résultat n'est plus une promesse derrière un lien.
   3. Chaque réponse donnée reste visible sous forme de jeton, retirable d'un
      clic. On sait toujours où l'on en est, et comment revenir en arrière.

   Le §9.4 reste tenu : l'outil aide à explorer, il ne prononce pas une
   décision d'orientation.

   L'index reçu en propriété est volontairement réduit aux quatre champs
   nécessaires : le catalogue complet, avec ses programmes et ses débouchés,
   n'a rien à faire dans le navigateur d'un visiteur en 3G.
   ========================================================================== */

export type IndexFormation = {
  readonly slug: string;
  readonly titre: string;
  readonly cycle: Cycle;
  readonly domaines: readonly Domaine[];
};

type Profil = {
  readonly id: string;
  readonly libelle: string;
  readonly precision: string;
  readonly cycles: readonly Cycle[];
};

const PROFILS: readonly Profil[] = [
  {
    id: 'apres-bac',
    libelle: 'Je viens d’avoir le bac',
    precision: 'BTS en 2 ans ou Licence en 3 ans',
    cycles: ['bts', 'licence'],
  },
  {
    id: 'professionnel',
    libelle: 'Je travaille déjà',
    precision: 'Formations courtes, sans condition de diplôme',
    cycles: ['certificat'],
  },
  {
    id: 'projet',
    libelle: 'Je veux créer mon activité',
    precision: 'Formations techniques et modules courts',
    cycles: ['certificat', 'masterclass'],
  },
  {
    id: 'etudiant',
    libelle: 'Je suis déjà étudiant',
    precision: 'Modules courts pour compléter votre parcours',
    cycles: ['masterclass'],
  },
];

const DOMAINES: readonly { readonly id: Domaine; readonly libelle: string }[] = [
  { id: 'production-animale', libelle: 'Élevage' },
  { id: 'production-vegetale', libelle: 'Cultures' },
  { id: 'agroalimentaire', libelle: 'Transformation' },
  { id: 'agribusiness', libelle: 'Gestion et commerce' },
  { id: 'environnement', libelle: 'Environnement' },
  { id: 'technologie', libelle: 'Technologie' },
];

const ETIQUETTE_CYCLE: Record<Cycle, string> = {
  bts: 'BTS',
  licence: 'Licence',
  certificat: 'Certificat',
  masterclass: 'Module',
};

/** Nombre de formations montrées directement dans le bloc. Au-delà, le bouton
 *  renvoie au catalogue filtré plutôt que d'allonger la page d'accueil. */
const APERCU = 5;

export function TrouverFormation({ index }: { index: readonly IndexFormation[] }) {
  const [profil, setProfil] = useState<Profil | null>(null);
  const [domaine, setDomaine] = useState<Domaine | null>(null);

  const resultats = useMemo(
    () =>
      index.filter((formation) => {
        if (profil && !profil.cycles.includes(formation.cycle)) return false;
        if (domaine && !formation.domaines.includes(domaine)) return false;
        return true;
      }),
    [index, profil, domaine],
  );

  const parametres = new URLSearchParams();
  if (profil) parametres.set('cycle', profil.cycles.join(','));
  if (domaine) parametres.set('domaine', domaine);
  const lien =
    parametres.size > 0 ? `/formations?${parametres.toString()}#catalogue` : '/formations#catalogue';

  const aRepondu = profil !== null || domaine !== null;
  const libelleDomaine = DOMAINES.find((item) => item.id === domaine)?.libelle;

  return (
    <section id="trouver" className="relative overflow-hidden bg-ink-900 py-section lg:py-section-lg">
      <LaurelWreath
        className="pointer-events-none absolute -bottom-40 -left-32 h-[34rem] w-[34rem] text-paper/[0.04]"
        leaves={13}
      />

      <div className="relative mx-auto w-full max-w-[80rem] px-5 sm:px-8 lg:px-10">
        {/* ------------------------------------------------------------ Titre */}
        <div className="reveal max-w-2xl">
          <p className="inline-flex items-center gap-2 text-[0.6875rem] font-bold uppercase tracking-[0.18em] text-gold-400">
            <StarMark className="h-2.5 w-2.5" />
            Orientation
          </p>
          <h2 className="mt-4 text-[2.25rem] leading-[1.05] text-paper sm:text-[2.875rem] lg:text-[3.5rem]">
            Vous ne savez pas par où commencer&nbsp;?
          </h2>
          <span className="rule-gold mt-5" />
          <p className="mt-5 text-[1rem] leading-relaxed text-ink-200">
            Dites-nous où vous en êtes, puis ce qui vous intéresse.{' '}
            <strong className="font-semibold text-paper">
              Nous retirons de la liste tout ce qui ne vous concerne pas
            </strong>{' '}
            — et nous vous montrons ce qui reste, juste en dessous.
          </p>
        </div>

        {/* -------------------------------------------- Compteur et sélection
            La barre la plus visible du bloc : le nombre bouge sous les doigts
            du visiteur, ce qui suffit à lui dire qu'il est en train de filtrer. */}
        <div className="reveal mt-9 flex flex-wrap items-center gap-x-6 gap-y-4 rounded-card-lg border border-paper/12 bg-paper/[0.06] px-5 py-4 sm:px-6">
          <p className="flex items-baseline gap-2.5 text-[0.9375rem] text-ink-100" aria-live="polite">
            <span className="font-display text-[2.25rem] leading-none text-gold-400 tabular-nums">
              {resultats.length}
            </span>
            <span>
              formation{resultats.length > 1 ? 's' : ''} sur {index.length}
              {aRepondu ? ' correspondent à vos réponses' : ' au catalogue'}
            </span>
          </p>

          {aRepondu ? (
            <ul className="flex flex-wrap items-center gap-2">
              {profil ? (
                <li>
                  <button
                    type="button"
                    onClick={() => setProfil(null)}
                    className="inline-flex items-center gap-1.5 rounded-pill bg-gold-400 px-3 py-1.5 text-[0.75rem] font-semibold text-ink-900 transition-colors hover:bg-gold-300"
                  >
                    {profil.libelle}
                    <IconClose className="h-3 w-3" />
                    <span className="sr-only">Retirer ce critère</span>
                  </button>
                </li>
              ) : null}
              {domaine ? (
                <li>
                  <button
                    type="button"
                    onClick={() => setDomaine(null)}
                    className="inline-flex items-center gap-1.5 rounded-pill bg-gold-400 px-3 py-1.5 text-[0.75rem] font-semibold text-ink-900 transition-colors hover:bg-gold-300"
                  >
                    {libelleDomaine}
                    <IconClose className="h-3 w-3" />
                    <span className="sr-only">Retirer ce critère</span>
                  </button>
                </li>
              ) : null}
              <li>
                <button
                  type="button"
                  onClick={() => {
                    setProfil(null);
                    setDomaine(null);
                  }}
                  className="rounded-pill border border-paper/25 px-3 py-1.5 text-[0.75rem] font-semibold text-ink-100 transition-colors hover:border-paper/50 hover:text-paper"
                >
                  Tout effacer
                </button>
              </li>
            </ul>
          ) : null}
        </div>

        {/* ----------------------------------------------------------- Étapes */}
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <Etape
            numero={1}
            titre={<>Votre situation</>}
            faite={profil !== null}
            active={profil === null}
          >
            <div className="grid gap-2.5 sm:grid-cols-2">
              {PROFILS.map((option) => {
                const actif = profil?.id === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    aria-pressed={actif}
                    onClick={() => setProfil(actif ? null : option)}
                    className={cn(
                      'rounded-card border p-4 text-left transition-all duration-300 ease-[var(--ease-arc)]',
                      actif
                        ? 'border-gold-400 bg-gold-400/12 shadow-raise'
                        : 'border-paper/15 bg-paper/[0.03] hover:border-paper/35 hover:bg-paper/[0.07]',
                    )}
                  >
                    <span className="flex items-start justify-between gap-2">
                      <span className="text-[0.9375rem] font-semibold text-paper">{option.libelle}</span>
                      {actif ? <IconCheck className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" /> : null}
                    </span>
                    <span className="mt-1 block text-[0.8125rem] leading-snug text-ink-300">
                      {option.precision}
                    </span>
                  </button>
                );
              })}
            </div>
          </Etape>

          <Etape
            numero={2}
            titre={<>Le domaine qui vous intéresse</>}
            faite={domaine !== null}
            active={profil !== null && domaine === null}
            note="Facultatif : passez cette étape si vous hésitez encore."
          >
            <div className="flex flex-wrap gap-2">
              {DOMAINES.map((option) => {
                const actif = domaine === option.id;
                /* Le nombre restant est affiché avant le clic : le visiteur voit
                   l'effet du filtre au lieu de le découvrir après coup. */
                const restant = index.filter(
                  (formation) =>
                    (!profil || profil.cycles.includes(formation.cycle)) &&
                    formation.domaines.includes(option.id),
                ).length;

                return (
                  <button
                    key={option.id}
                    type="button"
                    aria-pressed={actif}
                    disabled={restant === 0}
                    onClick={() => setDomaine(actif ? null : option.id)}
                    className={cn(
                      'inline-flex items-center gap-2 rounded-pill border px-4 py-2 text-[0.8125rem] font-semibold transition-all duration-300 ease-[var(--ease-arc)]',
                      actif
                        ? 'border-gold-400 bg-gold-400 text-ink-900'
                        : restant === 0
                          ? 'cursor-not-allowed border-paper/10 text-ink-400'
                          : 'border-paper/20 text-ink-100 hover:border-paper/40 hover:bg-paper/[0.07]',
                    )}
                  >
                    {option.libelle}
                    <span
                      className={cn('tabular-nums', actif ? 'text-ink-800' : 'text-ink-300')}
                      aria-label={`${restant} formation${restant > 1 ? 's' : ''}`}
                    >
                      {restant}
                    </span>
                  </button>
                );
              })}
            </div>
          </Etape>
        </div>

        {/* -------------------------------------------------- Résultat visible
            Annoncé, jamais imposé (§9.4) : on montre ce que l'on a trouvé, on
            ne dit pas au visiteur ce qu'il doit choisir. */}
        <div className="reveal mt-4 rounded-card-lg border border-paper/12 bg-paper/[0.06] p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <span
              className={cn(
                'flex h-7 w-7 shrink-0 items-center justify-center rounded-pill font-display text-[0.8125rem]',
                aRepondu ? 'bg-gold-400 text-ink-900' : 'bg-paper/15 text-paper',
              )}
            >
              3
            </span>
            <h3 className="text-[1.0625rem] font-semibold text-paper">
              {aRepondu ? 'Les formations qui restent' : 'Les trente formations du catalogue'}
            </h3>
          </div>

          {resultats.length === 0 ? (
            <p className="mt-4 rounded-card border border-dashed border-paper/20 px-4 py-6 text-center text-[0.9375rem] text-ink-200">
              Aucune formation ne réunit ces deux critères. Retirez le domaine ci-dessus, ou{' '}
              <Link href="/contact" className="font-semibold text-gold-400 hover:text-gold-300">
                écrivez-nous
              </Link>{' '}
              : nous vous orienterons.
            </p>
          ) : (
            <ul className="mt-4 flex flex-col gap-1">
              {resultats.slice(0, APERCU).map((formation, rang) => (
                <li
                  key={formation.slug}
                  className="paraitre"
                  style={{ ['--paraitre-delai' as string]: `${rang * 45}ms` }}
                >
                  <Link
                    href={`/formations/${formation.slug}`}
                    className="group/res flex items-center gap-3 rounded-card px-3 py-2.5 transition-colors hover:bg-paper/[0.08]"
                  >
                    <span className="shrink-0 rounded-pill bg-paper/12 px-2.5 py-1 text-[0.6875rem] font-bold uppercase tracking-[0.08em] text-gold-400">
                      {ETIQUETTE_CYCLE[formation.cycle]}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[0.9375rem] text-paper">
                      {formation.titre}
                    </span>
                    <IconArrowRight className="h-4 w-4 shrink-0 text-ink-300 transition-transform duration-300 ease-[var(--ease-arc)] group-hover/res:[transform:translateX(3px)] group-hover/res:text-gold-400" />
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {resultats.length > 0 ? (
            <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-paper/10 pt-5">
              <Link
                href={lien}
                className="group/cta inline-flex h-12 items-center justify-center gap-2.5 rounded-pill bg-gold-300 px-6 text-[0.875rem] font-semibold text-ink-800 shadow-raise transition-all duration-300 ease-[var(--ease-arc)] hover:bg-gold-400 hover:shadow-lift"
              >
                {resultats.length > APERCU
                  ? `Voir les ${resultats.length} formations`
                  : 'Voir le détail de ces formations'}
                <IconArrowRight className="h-4 w-4 transition-transform duration-300 ease-[var(--ease-arc)] group-hover/cta:[transform:translateX(3px)]" />
              </Link>
              <p className="text-[0.875rem] text-ink-300">
                Vous hésitez encore&nbsp;?{' '}
                <Link href="/contact" className="font-semibold text-gold-400 hover:text-gold-300">
                  Appelez-nous, nous vous conseillons.
                </Link>
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */

function Etape({
  numero,
  titre,
  faite,
  active,
  note,
  children,
}: {
  numero: number;
  titre: React.ReactNode;
  faite: boolean;
  active: boolean;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        'reveal rounded-card-lg border p-5 transition-colors duration-500 sm:p-6',
        active ? 'border-gold-400/40 bg-paper/[0.07]' : 'border-paper/12 bg-paper/[0.04]',
      )}
    >
      <div className="flex items-center gap-3">
        <span
          className={cn(
            'flex h-7 w-7 shrink-0 items-center justify-center rounded-pill font-display text-[0.8125rem]',
            faite ? 'bg-gold-400 text-ink-900' : 'bg-paper/15 text-paper',
          )}
        >
          {faite ? <IconCheck className="h-3.5 w-3.5" /> : numero}
        </span>
        <h3 className="text-[1.0625rem] font-semibold text-paper">{titre}</h3>
      </div>

      {note ? <p className="mt-1.5 pl-10 text-[0.8125rem] text-ink-300">{note}</p> : null}

      <div className="mt-4">{children}</div>
    </div>
  );
}
