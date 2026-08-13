'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { IconArrowRight, IconChevronDown, IconClose, IconMenu, IconSearch } from '@/components/brand/icons';
import { LaurelWreath, LeafSprig } from '@/components/brand/marks';
import { ButtonLink } from '@/components/ui/button';
import { NAVIGATION, RECHERCHE_ACTIVE } from '@/content/site';
import { cn } from '@/lib/utils';

/* ==========================================================================
   En-tête
   --------------------------------------------------------------------------
   La maquette pose une carte blanche flottante plutôt qu'une barre collée au
   bord de l'écran. On la conserve : elle donne au portail son premier signe
   distinctif, et elle survit au défilement en se resserrant au lieu de
   changer de nature.

   Composant client — et c'est la seule raison : ouverture des panneaux,
   fermeture au clavier, état de défilement. Tout le contenu qu'il affiche
   provient du serveur.
   ========================================================================== */

const ENTREE_RECHERCHE = {
  libelle: 'Recherche & Innovation',
  href: '/recherche-innovation',
};

export function Header() {
  const pathname = usePathname();
  const [compact, setCompact] = useState(false);
  const [ouvert, setOuvert] = useState<string | null>(null);
  const [menuMobile, setMenuMobile] = useState(false);
  const fermeture = useRef<number | null>(null);
  const panneauId = useId();

  /* Défilement : une seule lecture par frame, jamais de calcul dans l'événement. */
  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        setCompact(window.scrollY > 12);
        frame = 0;
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  /* Toute navigation referme ce qui était ouvert. L'ajustement se fait pendant
     le rendu plutôt que dans un effet : le panneau ne doit pas rester visible
     le temps d'un rendu supplémentaire après le changement de page. */
  const [cheminApplique, setCheminApplique] = useState(pathname);
  if (cheminApplique !== pathname) {
    setCheminApplique(pathname);
    setOuvert(null);
    setMenuMobile(false);
  }

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setOuvert(null);
      setMenuMobile(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  /* Le menu mobile prend tout l'écran : le fond ne doit pas défiler dessous. */
  useEffect(() => {
    document.body.style.overflow = menuMobile ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuMobile]);

  const survol = useCallback((libelle: string | null) => {
    if (fermeture.current) window.clearTimeout(fermeture.current);
    if (libelle === null) {
      // Petit délai : le pointeur traverse un vide entre l'onglet et le panneau.
      fermeture.current = window.setTimeout(() => setOuvert(null), 140);
      return;
    }
    setOuvert(libelle);
  }, []);

  const estActif = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-[padding] duration-500 ease-[var(--ease-arc)]',
        compact ? 'pt-0 sm:pt-2' : 'pt-0 sm:pt-5',
      )}
      onMouseLeave={() => survol(null)}
    >
      {/* La carte flotte avec une marge plus courte que la gouttière du contenu :
          c'est ce que fait la maquette, et cela évite qu'elle paraisse rétrécie
          sur un très grand écran. */}
      <div className="w-full px-0 sm:px-[clamp(0.75rem,2vw,2.5rem)]">
        <div
          className={cn(
            'relative flex items-center gap-3 border-graphite-100 bg-paper/92 backdrop-blur-md',
            'transition-[padding,border-radius,box-shadow] duration-500 ease-[var(--ease-arc)]',
            'border-b sm:border',
            compact
              ? 'px-4 py-2.5 shadow-lift sm:rounded-card-lg sm:px-5'
              : 'px-4 py-3.5 shadow-raise sm:rounded-card-lg sm:px-5 xl:px-7',
          )}
        >
          {/* --- Marque ---------------------------------------------------- */}
          <Link
            href="/"
            className="group/logo relative shrink-0"
            aria-label={`${'FOANI International Training College'} — accueil`}
          >
            <Image
              src="/brand/logo-horizontal.png"
              alt="FOANI International Training College"
              width={2172}
              height={724}
              priority
              sizes="(max-width: 640px) 168px, 232px"
              className={cn(
                'w-auto transition-[height] duration-500 ease-[var(--ease-arc)]',
                compact ? 'h-9 sm:h-10' : 'h-10 lg:h-11 xl:h-12',
              )}
            />
          </Link>

          {/* --- Navigation ------------------------------------------------ */}
          <nav aria-label="Navigation principale" className="ml-auto hidden lg:block">
            <ul className="flex items-center gap-0.5">
              {NAVIGATION.map((entree) => {
                const actif = estActif(entree.href);
                const deploye = ouvert === entree.libelle;
                return (
                  <li key={entree.libelle} className="relative" onMouseEnter={() => survol(entree.libelle)}>
                    <div className="flex items-center">
                      <Link
                        href={entree.href}
                        className={cn(
                          'relative whitespace-nowrap rounded-pill py-2 pl-2.5 pr-0.5 text-[0.8125rem] font-semibold transition-colors duration-300 xl:pl-3 xl:pr-1',
                          actif ? 'text-ink-700' : 'text-graphite-700 hover:text-ink-700',
                        )}
                      >
                        {entree.libelleCourt}
                        <span
                          aria-hidden="true"
                          className={cn(
                            'absolute inset-x-2.5 -bottom-0.5 h-[2px] origin-left rounded-pill bg-gold-400 transition-transform duration-400 ease-[var(--ease-arc)]',
                            actif || deploye ? '[transform:scaleX(1)]' : '[transform:scaleX(0)]',
                          )}
                        />
                      </Link>
                      <button
                        type="button"
                        aria-expanded={deploye}
                        aria-controls={`${panneauId}-${entree.href}`}
                        aria-label={`Afficher les rubriques de ${entree.libelle}`}
                        onClick={() => setOuvert(deploye ? null : entree.libelle)}
                        className="mr-0.5 rounded-pill p-0.5 text-graphite-500 transition-colors hover:text-ink-700 xl:mr-1 xl:p-1"
                      >
                        <IconChevronDown
                          className={cn(
                            'h-3.5 w-3.5 transition-transform duration-400 ease-[var(--ease-arc)]',
                            deploye && '[transform:rotate(180deg)]',
                          )}
                        />
                      </button>
                    </div>
                  </li>
                );
              })}
              {RECHERCHE_ACTIVE ? (
                <li>
                  <Link
                    href={ENTREE_RECHERCHE.href}
                    className="rounded-pill px-3 py-2 text-[0.8125rem] font-semibold text-graphite-700 transition-colors hover:text-ink-700"
                  >
                    {ENTREE_RECHERCHE.libelle}
                  </Link>
                </li>
              ) : null}
            </ul>
          </nav>

          {/* --- Actions persistantes — §8.10 ------------------------------- */}
          <div className="ml-auto flex items-center gap-1.5 lg:ml-3">
            <Link
              href="/recherche"
              aria-label="Rechercher sur le site"
              className="hidden rounded-pill p-2.5 text-graphite-600 transition-colors duration-300 hover:bg-ink-50 hover:text-ink-700 xl:block"
            >
              <IconSearch className="h-[1.15rem] w-[1.15rem]" />
            </Link>
            <Link
              href="/espace-numerique"
              className="link-underline hidden rounded-sm px-2 py-1 text-[0.8125rem] font-semibold text-graphite-700 transition-colors hover:text-ink-700 xl:block"
            >
              Espace numérique
            </Link>
            {/* « Candidater » est l'une des deux actions persistantes du CDC
                (§8.10) : elle reste visible sur téléphone, où se fait
                l'essentiel des candidatures. */}
            <ButtonLink href="/candidature" variant="gold" size="sm" trailing={<IconArrowRight />}>
              Candidater
            </ButtonLink>
            <button
              type="button"
              onClick={() => setMenuMobile(true)}
              aria-label="Ouvrir le menu"
              aria-expanded={menuMobile}
              className="rounded-pill p-2.5 text-ink-800 transition-colors hover:bg-ink-50 lg:hidden"
            >
              <IconMenu className="h-6 w-6" />
            </button>
          </div>

          {/* --- Panneau de rubrique --------------------------------------- */}
          {NAVIGATION.map((entree) => (
            <MegaPanneau
              key={entree.libelle}
              id={`${panneauId}-${entree.href}`}
              entree={entree}
              ouvert={ouvert === entree.libelle}
            />
          ))}
        </div>
      </div>

      <MenuMobile ouvert={menuMobile} onFermer={() => setMenuMobile(false)} />
    </header>
  );
}

/* --------------------------------------------------------------------------
   Panneau de rubrique
   -------------------------------------------------------------------------- */

function MegaPanneau({
  id,
  entree,
  ouvert,
}: {
  id: string;
  entree: (typeof NAVIGATION)[number];
  ouvert: boolean;
}) {
  return (
    <div
      id={id}
      hidden={!ouvert}
      className={cn(
        'absolute inset-x-0 top-[calc(100%+0.65rem)] hidden origin-top lg:block',
        'rounded-card-lg border border-graphite-100 bg-paper shadow-float',
        'transition-[opacity,transform] duration-400 ease-[var(--ease-arc)]',
        ouvert
          ? 'pointer-events-auto opacity-100 [transform:translateY(0)]'
          : 'pointer-events-none opacity-0 [transform:translateY(-0.5rem)]',
      )}
    >
      <div className="grid grid-cols-[minmax(0,15rem)_1fr]">
        {/* Volet de gauche : la promesse de la rubrique, sur fond bleu. */}
        <div className="relative overflow-hidden rounded-l-card-lg bg-ink-800 p-7 text-paper">
          <LaurelWreath
            className="pointer-events-none absolute -bottom-14 -left-10 h-52 w-52 text-paper/[0.07]"
            leaves={9}
          />
          <p className="relative font-display text-[1.375rem] leading-tight text-paper">{entree.libelle}</p>
          <span className="rule-gold relative mt-3.5" />
          <p className="relative mt-3.5 text-[0.8125rem] leading-relaxed text-ink-100">{entree.resume}</p>
          <Link
            href={entree.href}
            className="relative mt-5 inline-flex items-center gap-1.5 text-[0.8125rem] font-semibold text-gold-400 transition-colors hover:text-gold-300"
          >
            Voir la rubrique
            <IconArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-x-8 gap-y-6 p-7">
          {entree.colonnes.map((colonne) => (
            <div key={colonne.titre}>
              <p className="mb-3 text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-graphite-600">
                {colonne.titre}
              </p>
              <ul className="flex flex-col gap-0.5">
                {colonne.liens.map((lien) => (
                  <li key={`${lien.href}-${lien.libelle}`}>
                    <Link
                      href={lien.href}
                      className="group/lien -mx-2 flex flex-col rounded-xl px-2 py-1.5 transition-colors duration-200 hover:bg-ink-50"
                    >
                      <span className="flex items-center gap-1.5 text-[0.875rem] font-semibold text-ink-800">
                        <LeafSprig className="h-0 w-0 shrink-0 text-gold-500 opacity-0 transition-all duration-300 ease-[var(--ease-arc)] group-hover/lien:h-3 group-hover/lien:w-3 group-hover/lien:opacity-100" />
                        {lien.libelle}
                      </span>
                      {lien.description ? (
                        <span className="text-[0.75rem] leading-snug text-graphite-500">{lien.description}</span>
                      ) : null}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------------------
   Menu mobile — c'est le parcours majoritaire (CDC §18.2)
   -------------------------------------------------------------------------- */

function MenuMobile({ ouvert, onFermer }: { ouvert: boolean; onFermer: () => void }) {
  const [section, setSection] = useState<string | null>(null);

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 lg:hidden',
        ouvert ? 'pointer-events-auto' : 'pointer-events-none',
      )}
      aria-hidden={!ouvert}
    >
      <button
        type="button"
        tabIndex={ouvert ? 0 : -1}
        aria-label="Fermer le menu"
        onClick={onFermer}
        className={cn(
          'absolute inset-0 bg-ink-950/45 backdrop-blur-sm transition-opacity duration-400',
          ouvert ? 'opacity-100' : 'opacity-0',
        )}
      />
      <div
        className={cn(
          'absolute inset-y-0 right-0 flex w-full max-w-[26rem] flex-col bg-paper shadow-float',
          'transition-transform duration-500 ease-[var(--ease-arc)]',
          ouvert ? '[transform:translateX(0)]' : '[transform:translateX(100%)]',
        )}
      >
        <div className="flex items-center justify-between border-b border-graphite-100 px-5 py-4">
          <Image
            src="/brand/logo-horizontal.png"
            alt=""
            width={2172}
            height={724}
            sizes="160px"
            className="h-9 w-auto"
          />
          <button
            type="button"
            onClick={onFermer}
            tabIndex={ouvert ? 0 : -1}
            aria-label="Fermer le menu"
            className="rounded-pill p-2.5 text-ink-800 transition-colors hover:bg-ink-50"
          >
            <IconClose className="h-6 w-6" />
          </button>
        </div>

        <nav aria-label="Navigation principale" className="flex-1 overflow-y-auto overscroll-contain px-5 py-5">
          <ul className="flex flex-col gap-1">
            {NAVIGATION.map((entree) => {
              const deploye = section === entree.libelle;
              return (
                <li key={entree.libelle} className="border-b border-graphite-100 pb-1 last:border-0">
                  <div className="flex items-center">
                    <Link
                      href={entree.href}
                      tabIndex={ouvert ? 0 : -1}
                      className="flex-1 py-3 font-display text-[1.0625rem] font-semibold text-ink-800"
                    >
                      {entree.libelle}
                    </Link>
                    <button
                      type="button"
                      tabIndex={ouvert ? 0 : -1}
                      aria-expanded={deploye}
                      aria-label={`Afficher les rubriques de ${entree.libelle}`}
                      onClick={() => setSection(deploye ? null : entree.libelle)}
                      className="rounded-pill p-2.5 text-graphite-500"
                    >
                      <IconChevronDown
                        className={cn(
                          'h-4 w-4 transition-transform duration-400 ease-[var(--ease-arc)]',
                          deploye && '[transform:rotate(180deg)]',
                        )}
                      />
                    </button>
                  </div>
                  <div
                    className={cn(
                      'grid transition-[grid-template-rows] duration-400 ease-[var(--ease-arc)]',
                      deploye ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
                    )}
                  >
                    <div className="overflow-hidden">
                      <ul className="flex flex-col gap-0.5 pb-3 pl-1">
                        {entree.colonnes.flatMap((colonne) =>
                          colonne.liens.map((lien) => (
                            <li key={`${colonne.titre}-${lien.href}-${lien.libelle}`}>
                              <Link
                                href={lien.href}
                                tabIndex={ouvert && deploye ? 0 : -1}
                                className="flex items-center gap-2.5 py-2 text-[0.9375rem] text-graphite-600"
                              >
                                <LeafSprig className="h-3 w-3 shrink-0 text-gold-500" />
                                {lien.libelle}
                              </Link>
                            </li>
                          )),
                        )}
                      </ul>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex flex-col gap-2.5 border-t border-graphite-100 px-5 py-5">
          <ButtonLink
            href="/candidature"
            variant="gold"
            size="md"
            trailing={<IconArrowRight />}
            className="w-full"
            tabIndex={ouvert ? 0 : -1}
          >
            Candidater
          </ButtonLink>
          <div className="grid grid-cols-2 gap-2.5">
            <ButtonLink href="/espace-numerique" variant="outline" size="md" tabIndex={ouvert ? 0 : -1}>
              Espace numérique
            </ButtonLink>
            <ButtonLink
              href="/recherche"
              variant="outline"
              size="md"
              icon={<IconSearch />}
              tabIndex={ouvert ? 0 : -1}
            >
              Rechercher
            </ButtonLink>
          </div>
        </div>
      </div>
    </div>
  );
}
