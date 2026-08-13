import Link from 'next/link';
import type { ReactNode } from 'react';
import { IconArrowRight } from '@/components/brand/icons';
import { LaurelWreath, LeafSprig, StarMark } from '@/components/brand/marks';
import { CLASSES_PASTILLE } from '@/lib/etats';
import { cn } from '@/lib/utils';

/* ==========================================================================
   Pièces communes du back-office
   --------------------------------------------------------------------------
   Un seul en-tête de page, une seule tuile, une seule carte : c'est ce qui
   fait qu'un écran de scolarité et un écran d'admission se ressemblent, et
   qu'un agent formé sur l'un sait lire l'autre.
   ========================================================================== */

export function EnTetePage({
  surtitre,
  titre,
  resume,
  actions,
}: {
  surtitre?: string;
  titre: string;
  resume?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        {surtitre ? (
          <p className="inline-flex items-center gap-2 text-[0.6875rem] font-bold uppercase tracking-[0.18em] text-ink-700">
            <StarMark className="h-2.5 w-2.5 text-gold-400" />
            {surtitre}
          </p>
        ) : null}
        <h1 className="mt-3 text-[1.875rem] leading-tight lg:text-[2.25rem]">{titre}</h1>
        {resume ? (
          <p className="mt-2.5 text-[0.9375rem] leading-relaxed text-graphite-500">{resume}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2.5">{actions}</div> : null}
    </div>
  );
}

/* --------------------------------------------------------------------------
   Tuile de chiffre
   --------------------------------------------------------------------------
   Quatre tons nettement distincts, mais aucun choisi pour l'effet : chacun
   porte un sens que l'agent lit sans réfléchir.

     encre   — un volume, sans jugement
     or      — quelque chose attend une action de sa part
     ambre   — quelque chose attend une action de quelqu'un d'autre
     vert    — une issue favorable

   Les deux dernières viennent des couleurs d'état de la charte (§18.1), pas
   d'une palette décorative. Les deux extrémités de chaque dégradé tiennent le
   texte blanc à 4,5:1 : une tuile n'est jamais illisible d'un côté.
   -------------------------------------------------------------------------- */

const TONS = {
  encre: 'bg-gradient-to-br from-ink-700 to-ink-900 text-paper',
  profond: 'bg-gradient-to-br from-ink-950 to-ink-700 text-paper',
  or: 'bg-gradient-to-br from-gold-300 to-gold-500 text-ink-900',
  ambre: 'bg-gradient-to-br from-state-warning to-state-warning-fonce text-paper',
  vert: 'bg-gradient-to-br from-state-success to-state-success-fonce text-paper',
  clair: 'border border-graphite-100 bg-paper text-ink-800',
} as const;

export type TonTuile = keyof typeof TONS;

export function Tuile({
  etiquette,
  valeur,
  detail,
  complement,
  icone,
  ton = 'clair',
  href,
}: {
  etiquette: string;
  valeur: ReactNode;
  detail?: string;
  complement?: string;
  icone: ReactNode;
  ton?: TonTuile;
  href?: string;
}) {
  const sombre = ton === 'encre' || ton === 'profond' || ton === 'ambre' || ton === 'vert';

  const contenu = (
    <>
      <div className="flex items-start justify-between gap-3">
        <span className={cn('text-[0.8125rem] font-semibold', sombre && 'text-paper/85')}>
          {etiquette}
        </span>
        <span
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-full [&>svg]:h-[1.125rem] [&>svg]:w-[1.125rem]',
            sombre ? 'bg-paper/15' : ton === 'clair' ? 'bg-ink-50 text-ink-700' : 'bg-ink-900/12',
          )}
        >
          {icone}
        </span>
      </div>

      <p className="mt-4 font-display text-[2.5rem] leading-none tabular-nums">{valeur}</p>

      {detail || complement ? (
        <div
          className={cn(
            'mt-5 flex items-center justify-between gap-3 border-t pt-3 text-[0.75rem]',
            sombre ? 'border-paper/15 text-paper/75' : 'border-current/12 opacity-75',
          )}
        >
          <span>{detail}</span>
          {complement ? <span className="font-semibold">{complement}</span> : null}
        </div>
      ) : null}
    </>
  );

  const classes = cn(
    'block rounded-2xl p-5 transition-[transform,box-shadow] duration-400 ease-[var(--ease-arc)]',
    TONS[ton],
    href && 'hover:-translate-y-1',
    ton !== 'clair' ? 'shadow-raise hover:shadow-lift' : 'hover:shadow-raise',
  );

  return href ? (
    <Link href={href} className={classes}>
      {contenu}
    </Link>
  ) : (
    <div className={classes}>{contenu}</div>
  );
}

/* -------------------------------------------------------------------------- */

export function Carte({
  titre,
  mention,
  lien,
  children,
  className,
}: {
  titre?: string;
  mention?: string;
  lien?: { readonly libelle: string; readonly href: string };
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('carte p-5 lg:p-6', className)}>
      {titre ? (
        <header className="mb-5 flex items-center justify-between gap-4">
          <h2 className="text-[1.125rem] leading-snug">{titre}</h2>
          {mention ? <span className="text-[0.75rem] text-graphite-400">{mention}</span> : null}
          {lien ? (
            <Link
              href={lien.href}
              className="group/lien inline-flex items-center gap-1.5 text-[0.8125rem] font-semibold text-ink-700 transition-colors hover:text-ink-600"
            >
              {lien.libelle}
              <IconArrowRight className="h-3.5 w-3.5 transition-transform duration-300 ease-[var(--ease-arc)] group-hover/lien:translate-x-0.5" />
            </Link>
          ) : null}
        </header>
      ) : null}
      {children}
    </section>
  );
}

/* --------------------------------------------------------------------------
   État vide
   §18.2 : « les écrans vides sont traités comme des moments d'orientation,
   avec une indication de ce qu'il convient de faire ».
   -------------------------------------------------------------------------- */

export function Vide({
  titre,
  corps,
  action,
}: {
  titre: string;
  corps: string;
  action?: { readonly libelle: string; readonly href: string };
}) {
  return (
    <div className="relative isolate overflow-hidden rounded-2xl border border-dashed border-graphite-200 bg-paper-tint px-6 py-12 text-center">
      <LaurelWreath
        className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 text-ink-700/[0.04]"
        leaves={11}
      />
      <LeafSprig aria-hidden="true" className="relative mx-auto h-7 w-7 text-gold-400" />
      <p className="relative mt-4 font-display text-[1.25rem] text-ink-800">{titre}</p>
      <p className="relative mx-auto mt-2 max-w-md text-[0.9375rem] leading-relaxed text-graphite-500">
        {corps}
      </p>
      {action ? (
        <Link href={action.href} className="bouton bouton--principal relative mt-6">
          {action.libelle}
          <IconArrowRight className="h-4 w-4" />
        </Link>
      ) : null}
    </div>
  );
}

/* --------------------------------------------------------------------------
   Pastille d'état
   -------------------------------------------------------------------------- */


export function Pastille({
  children,
  ton = 'neutre',
  point = false,
}: {
  children: ReactNode;
  ton?: keyof typeof CLASSES_PASTILLE;
  point?: boolean;
}) {
  return (
    <span className={cn('pastille', CLASSES_PASTILLE[ton])}>
      {point ? <span aria-hidden="true" className="pastille__point" /> : null}
      {children}
    </span>
  );
}
