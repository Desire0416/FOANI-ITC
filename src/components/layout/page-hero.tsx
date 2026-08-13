import Link from 'next/link';
import type { ReactNode } from 'react';
import { IconChevronRight } from '@/components/brand/icons';
import { ArcTrace, LaurelWreath, StarMark } from '@/components/brand/marks';
import { Container } from '@/components/ui/primitives';
import { cn } from '@/lib/utils';

/* ==========================================================================
   Bandeau de rubrique
   --------------------------------------------------------------------------
   Le même arc qu'en page d'accueil, mais réduit à un tracé : sur une page
   intérieure, la courbe signe sans occuper la place. Le fil d'Ariane est
   requis sur les contenus profonds (CDC §8.10).
   ========================================================================== */

export type FilAriane = readonly { readonly libelle: string; readonly href?: string }[];

export function PageHero({
  eyebrow,
  titre,
  lead,
  fil,
  actions,
  aside,
  tone = 'ink',
}: {
  eyebrow?: string;
  titre: ReactNode;
  lead?: ReactNode;
  fil?: FilAriane;
  actions?: ReactNode;
  aside?: ReactNode;
  tone?: 'ink' | 'tint';
}) {
  const sombre = tone === 'ink';

  return (
    <section
      className={cn(
        'relative isolate overflow-hidden pb-14 pt-32 sm:pt-36 lg:pb-20 lg:pt-44',
        sombre ? 'bg-ink-900 text-ink-100' : 'bg-paper-tint',
      )}
    >
      <LaurelWreath
        className={cn(
          'pointer-events-none absolute -right-24 -top-16 h-[30rem] w-[30rem]',
          sombre ? 'text-paper/[0.045]' : 'text-ink-700/[0.045]',
        )}
        leaves={13}
      />
      {/* L'arc ne se déploie qu'à partir du moment où il reste de la place à
          droite du texte. Sur téléphone, il le traverserait. */}
      <ArcTrace
        className={cn(
          'absolute inset-y-0 right-0 hidden h-full w-2/5 sm:block',
          sombre ? 'text-gold-400/40' : 'text-gold-400/70',
        )}
        offset={0.02}
      />

      <Container className="relative">
        {fil ? <Ariane fil={fil} sombre={sombre} /> : null}

        <div className={cn('grid gap-10', aside ? 'lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:gap-16' : '')}>
          <div className="max-w-3xl">
            {eyebrow ? (
              <p
                className={cn(
                  'inline-flex items-center gap-2 text-[0.6875rem] font-bold uppercase tracking-[0.18em]',
                  sombre ? 'text-gold-400' : 'text-ink-700',
                )}
              >
                <StarMark className="h-2.5 w-2.5 text-gold-400" />
                {eyebrow}
              </p>
            ) : null}

            <h1
              className={cn(
                'mt-4 text-balance text-[2.5rem] leading-[1.03] sm:text-[3.25rem] lg:text-[4rem]',
                sombre && 'text-paper',
              )}
            >
              {titre}
            </h1>

            <span className="rule-gold mt-6" />

            {lead ? (
              <p
                className={cn(
                  'mt-6 max-w-2xl text-[1rem] leading-relaxed sm:text-[1.0625rem]',
                  sombre ? 'text-ink-200' : 'text-graphite-500',
                )}
              >
                {lead}
              </p>
            ) : null}

            {actions ? <div className="mt-9 flex flex-wrap gap-3">{actions}</div> : null}
          </div>

          {aside ? <div className="lg:pt-10">{aside}</div> : null}
        </div>
      </Container>
    </section>
  );
}

function Ariane({ fil, sombre }: { fil: FilAriane; sombre: boolean }) {
  return (
    <nav aria-label="Fil d’Ariane" className="mb-8">
      <ol className="flex flex-wrap items-center gap-1.5 text-[0.75rem]">
        <li>
          <Link
            href="/"
            className={cn(
              // Réserve verticale : la cible atteint les 24 px du WCAG 2.5.8
              // sans que le texte ne bouge.
              'inline-block py-1.5 transition-colors',
              sombre ? 'text-ink-300 hover:text-paper' : 'text-graphite-500 hover:text-ink-700',
            )}
          >
            Accueil
          </Link>
        </li>
        {fil.map((etape, index) => (
          <li key={`${etape.libelle}-${index}`} className="flex items-center gap-1.5">
            <IconChevronRight
              aria-hidden="true"
              className={cn('h-3 w-3', sombre ? 'text-ink-400' : 'text-graphite-300')}
            />
            {etape.href ? (
              <Link
                href={etape.href}
                className={cn(
                  'inline-block py-1.5 transition-colors',
                  sombre ? 'text-ink-300 hover:text-paper' : 'text-graphite-500 hover:text-ink-700',
                )}
              >
                {etape.libelle}
              </Link>
            ) : (
              <span aria-current="page" className={cn(sombre ? 'text-gold-400' : 'text-ink-700')}>
                {etape.libelle}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
