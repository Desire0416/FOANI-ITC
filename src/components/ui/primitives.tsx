import type { ReactNode } from 'react';
import { LeafSprig, StarMark } from '@/components/brand/marks';
import { cn } from '@/lib/utils';

/* ==========================================================================
   Primitives de mise en page
   ========================================================================== */

/**
 * Gouttière unique du portail.
 *
 * Le conteneur n'impose pas de largeur maximale : les pages occupent l'écran.
 * Ce qui reste borné, c'est la longueur des lignes de texte — au niveau des
 * blocs de lecture, pas de la mise en page. Une colonne de texte de 1600 px
 * est illisible ; une grille de cartes de 1600 px ne l'est pas.
 *
 * La gouttière suit la largeur de l'écran (`clamp`) au lieu de sauter par
 * paliers : la marge reste proportionnée du téléphone au très grand écran.
 */
export const GOUTTIERE = 'px-[clamp(1.25rem,4vw,4.5rem)]';

export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('w-full', GOUTTIERE, className)}>{children}</div>;
}

export function Section({
  children,
  className,
  id,
  tone = 'paper',
}: {
  children: ReactNode;
  className?: string;
  id?: string;
  tone?: 'paper' | 'tint' | 'ink' | 'warm';
}) {
  const tones = {
    paper: 'bg-paper',
    tint: 'bg-paper-tint',
    warm: 'bg-paper-warm',
    ink: 'bg-ink-900 text-ink-100',
  } as const;

  return (
    <section
      id={id}
      className={cn('relative py-section lg:py-section-lg', tones[tone], className)}
    >
      {children}
    </section>
  );
}

/* ==========================================================================
   Titraille
   L'étoile marque la rubrique, le filet or ouvre le titre. Deux signes,
   toujours les mêmes, à la même place — c'est ce qui rend une page
   reconnaissable sans qu'on ait à lire son en-tête.
   ========================================================================== */

export function Eyebrow({
  children,
  tone = 'ink',
  className,
}: {
  children: ReactNode;
  tone?: 'ink' | 'light';
  className?: string;
}) {
  return (
    <p
      className={cn(
        'inline-flex items-center gap-2 text-[0.6875rem] font-bold uppercase tracking-[0.18em]',
        tone === 'ink' ? 'text-ink-700' : 'text-gold-400',
        className,
      )}
    >
      <StarMark className="h-2.5 w-2.5 text-gold-400" />
      {children}
    </p>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  lead,
  align = 'left',
  tone = 'ink',
  className,
  as: Tag = 'h2',
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  lead?: ReactNode;
  align?: 'left' | 'center';
  tone?: 'ink' | 'light';
  className?: string;
  as?: 'h1' | 'h2' | 'h3';
}) {
  return (
    <div
      className={cn(
        'reveal flex max-w-2xl flex-col gap-4',
        align === 'center' && 'mx-auto items-center text-center',
        className,
      )}
    >
      {eyebrow ? <Eyebrow tone={tone}>{eyebrow}</Eyebrow> : null}
      <Tag
        className={cn(
          'text-balance text-[2.25rem] leading-[1.05] sm:text-[2.875rem] lg:text-[3.5rem]',
          tone === 'light' && 'text-paper',
        )}
      >
        {title}
      </Tag>
      <span className={cn('rule-gold', align === 'center' && 'mx-auto')} />
      {lead ? (
        <p className={cn('max-w-xl text-[1rem] leading-relaxed', tone === 'light' ? 'text-ink-100' : 'text-graphite-500')}>
          {lead}
        </p>
      ) : null}
    </div>
  );
}

/* ==========================================================================
   Surfaces
   ========================================================================== */

export function Card({
  children,
  className,
  interactive = false,
}: {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
}) {
  return (
    <div
      className={cn(
        'relative rounded-card-lg border border-graphite-100 bg-paper',
        interactive &&
          'group/card transition-[transform,box-shadow,border-color] duration-500 ease-[var(--ease-arc)] hover:[transform:translateY(-0.25rem)] hover:border-ink-100 hover:shadow-lift',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function Pill({
  children,
  tone = 'neutral',
  className,
}: {
  children: ReactNode;
  tone?: 'neutral' | 'ink' | 'gold' | 'outline' | 'light';
  className?: string;
}) {
  const tones = {
    neutral: 'bg-ink-50 text-ink-700',
    ink: 'bg-ink-800 text-paper',
    gold: 'bg-gold-100 text-gold-700',
    outline: 'border border-graphite-200 bg-paper text-graphite-600',
    light: 'border border-paper/25 bg-paper/10 text-paper',
  } as const;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-pill px-3 py-1 text-[0.75rem] font-semibold leading-5',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Puce de liste : la foliole du laurier, jamais un point générique. */
export function LeafList({ items, className }: { items: ReactNode[]; className?: string }) {
  return (
    <ul className={cn('flex flex-col gap-3', className)}>
      {items.map((item, index) => (
        <li key={index} className="flex gap-3">
          <LeafSprig className="mt-0.5 h-4 w-4 shrink-0 text-gold-500" />
          <span className="text-[0.9375rem] leading-relaxed text-graphite-600">{item}</span>
        </li>
      ))}
    </ul>
  );
}
