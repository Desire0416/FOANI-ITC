import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/utils';

/* ==========================================================================
   Bouton
   Deux règles tenues du contraste mesuré sur la charte :
   — l'or ne porte jamais de texte blanc (2,2:1). Il porte du bleu (11,2:1).
   — le bleu institutionnel ne porte jamais d'or clair en aplat de fond.
   ========================================================================== */

type Variant = 'gold' | 'ink' | 'outline' | 'ghost' | 'onDark';
type Size = 'sm' | 'md' | 'lg';

const base =
  'group/btn relative inline-flex select-none items-center justify-center gap-2.5 rounded-pill font-semibold ' +
  'transition-[transform,background-color,border-color,color,box-shadow] duration-300 ease-[var(--ease-arc)] ' +
  'active:[transform:translateY(1px)] disabled:pointer-events-none disabled:opacity-55';

const variants: Record<Variant, string> = {
  gold: 'bg-gold-300 text-ink-800 shadow-raise hover:bg-gold-400 hover:shadow-lift',
  ink: 'bg-ink-800 text-paper shadow-raise hover:bg-ink-700 hover:shadow-lift',
  outline:
    'border border-graphite-200 bg-paper text-ink-800 hover:border-ink-300 hover:bg-ink-50 hover:shadow-raise',
  ghost: 'text-ink-800 hover:bg-ink-50',
  onDark: 'border border-paper/30 bg-paper/5 text-paper hover:border-gold-400 hover:bg-paper/10',
};

const sizes: Record<Size, string> = {
  sm: 'h-10 px-4 text-[0.8125rem]',
  md: 'h-12 px-5 text-[0.875rem]',
  lg: 'h-14 px-7 text-[0.9375rem]',
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
  /** Icône affichée à gauche du libellé. */
  icon?: ReactNode;
  /** Icône affichée à droite ; elle avance de 3 px au survol. */
  trailing?: ReactNode;
};

function shell({ variant = 'ink', size = 'md', className }: Pick<CommonProps, 'variant' | 'size' | 'className'>) {
  return cn(base, variants[variant], sizes[size], className);
}

function inner({ icon, trailing, children }: Pick<CommonProps, 'icon' | 'trailing' | 'children'>) {
  return (
    <>
      {icon ? <span className="-ml-0.5 shrink-0 [&>svg]:h-[1.15em] [&>svg]:w-[1.15em]">{icon}</span> : null}
      <span>{children}</span>
      {trailing ? (
        <span className="-mr-0.5 shrink-0 transition-transform duration-300 ease-[var(--ease-arc)] group-hover/btn:[transform:translateX(3px)] [&>svg]:h-[1.05em] [&>svg]:w-[1.05em]">
          {trailing}
        </span>
      ) : null}
    </>
  );
}

export function ButtonLink({
  href,
  variant,
  size,
  className,
  icon,
  trailing,
  children,
  ...rest
}: CommonProps & Omit<ComponentProps<typeof Link>, 'className' | 'children'>) {
  return (
    <Link href={href} className={shell({ variant, size, className })} {...rest}>
      {inner({ icon, trailing, children })}
    </Link>
  );
}

export function Button({
  variant,
  size,
  className,
  icon,
  trailing,
  children,
  ...rest
}: CommonProps & Omit<ComponentProps<'button'>, 'className' | 'children'>) {
  return (
    <button className={shell({ variant, size, className })} {...rest}>
      {inner({ icon, trailing, children })}
    </button>
  );
}
