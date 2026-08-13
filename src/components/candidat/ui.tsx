import type { ReactNode } from 'react';
import Link from 'next/link';
import { IconCheck, IconInfo } from '@/components/brand/icons';
import { cn } from '@/lib/utils';

/* ==========================================================================
   Pièces d'interface du portail de candidature
   --------------------------------------------------------------------------
   Toutes rendues par le serveur. Le candidat remplit son dossier depuis un
   téléphone, souvent sur un réseau qui coupe : ce qui est à l'écran doit y
   être avant que le moindre script n'arrive (§18.2).
   ========================================================================== */

export function EnTeteEtape({
  numero,
  titre,
  chapo,
}: {
  numero: number;
  titre: string;
  chapo?: string;
}) {
  return (
    <header>
      <p className="text-[0.6875rem] font-bold tracking-[0.16em] text-ink-700 uppercase">
        Étape {numero} sur 6
      </p>
      <h1 className="mt-2 text-[1.75rem] leading-tight sm:text-[2.125rem]">{titre}</h1>
      {chapo ? (
        <p className="mt-3 max-w-2xl text-[0.9375rem] leading-relaxed text-graphite-600">{chapo}</p>
      ) : null}
    </header>
  );
}

/* -------------------------------------------------------------------------- */

/**
 * Champ de saisie.
 *
 * L'étiquette est toujours au-dessus, jamais dans le champ : un libellé qui
 * disparaît à la saisie laisse le candidat sans repère au moment de relire
 * (§18.3). Ce qui n'est pas obligatoire est écrit comme tel, plutôt que
 * signalé par une absence d'astérisque.
 */
export function Champ({
  nom,
  etiquette,
  type = 'text',
  valeur,
  aide,
  requis = false,
  facultatif = false,
  inputMode,
  autoComplete,
  placeholder,
  max,
  className,
}: {
  nom: string;
  etiquette: string;
  type?: string;
  valeur?: string | null;
  aide?: string;
  requis?: boolean;
  facultatif?: boolean;
  inputMode?: 'text' | 'tel' | 'email' | 'numeric';
  autoComplete?: string;
  placeholder?: string;
  max?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={nom} className="etiquette">
        {etiquette}
        {facultatif ? <span className="ml-1.5 font-normal text-graphite-500">(facultatif)</span> : null}
      </label>
      <input
        id={nom}
        name={nom}
        type={type}
        defaultValue={valeur ?? ''}
        required={requis}
        inputMode={inputMode}
        autoComplete={autoComplete}
        placeholder={placeholder}
        max={max}
        className="champ"
      />
      {aide ? <p className="aide">{aide}</p> : null}
    </div>
  );
}

export function Liste({
  nom,
  etiquette,
  valeur,
  options,
  aide,
  requis = false,
  facultatif = false,
  vide,
  className,
}: {
  nom: string;
  etiquette: string;
  valeur?: string | null;
  options: readonly { readonly valeur: string; readonly libelle: string }[];
  aide?: string;
  requis?: boolean;
  facultatif?: boolean;
  vide?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={nom} className="etiquette">
        {etiquette}
        {facultatif ? <span className="ml-1.5 font-normal text-graphite-500">(facultatif)</span> : null}
      </label>
      <div className="relative">
        <select id={nom} name={nom} defaultValue={valeur ?? ''} required={requis} className="champ">
          {vide ? <option value="">{vide}</option> : null}
          {options.map((option) => (
            <option key={option.valeur} value={option.valeur}>
              {option.libelle}
            </option>
          ))}
        </select>
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-graphite-500"
        >
          ▾
        </span>
      </div>
      {aide ? <p className="aide">{aide}</p> : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */

export function Carte({
  titre,
  aide,
  children,
  className,
}: {
  titre?: string;
  aide?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('carte p-5 sm:p-7', className)}>
      {titre ? <h2 className="text-[1.125rem] leading-snug">{titre}</h2> : null}
      {aide ? <p className="mt-1.5 text-[0.875rem] leading-relaxed text-graphite-500">{aide}</p> : null}
      <div className={titre || aide ? 'mt-6' : undefined}>{children}</div>
    </section>
  );
}

const TONS = {
  info: 'border-ink-100 bg-ink-50 text-ink-800',
  attention: 'border-gold-200 bg-gold-50 text-gold-800',
  erreur: 'border-state-danger/25 bg-state-danger/[0.06] text-state-danger',
  reussite: 'border-state-success/25 bg-state-success/[0.06] text-state-success',
} as const;

export function Alerte({
  ton = 'info',
  titre,
  children,
  className,
}: {
  ton?: keyof typeof TONS;
  titre?: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div
      role={ton === 'erreur' ? 'alert' : undefined}
      className={cn('flex gap-3 rounded-xl border p-4', TONS[ton], className)}
    >
      {ton === 'reussite' ? (
        <IconCheck aria-hidden="true" className="mt-0.5 h-[1.125rem] w-[1.125rem] shrink-0" />
      ) : (
        <IconInfo aria-hidden="true" className="mt-0.5 h-[1.125rem] w-[1.125rem] shrink-0" />
      )}
      <div className="min-w-0 text-[0.875rem] leading-relaxed">
        {titre ? <p className="font-semibold">{titre}</p> : null}
        {children ? <div className={titre ? 'mt-1' : undefined}>{children}</div> : null}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

/** Ligne d'un récapitulatif : intitulé à gauche, valeur à droite, lien de retouche. */
export function Ligne({
  intitule,
  valeur,
  href,
}: {
  intitule: string;
  valeur: ReactNode;
  href?: string;
}) {
  const absent = valeur === null || valeur === undefined || valeur === '';

  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-graphite-100 py-3 last:border-0">
      <dt className="text-[0.8125rem] text-graphite-500">{intitule}</dt>
      <dd
        className={cn(
          'text-[0.9375rem]',
          absent ? 'text-graphite-400 italic' : 'font-medium text-ink-800',
        )}
      >
        {absent ? 'Non renseigné' : valeur}
        {href ? (
          <Link href={href} className="ml-3 text-[0.8125rem] font-semibold text-ink-700 hover:text-ink-600">
            Modifier
          </Link>
        ) : null}
      </dd>
    </div>
  );
}
