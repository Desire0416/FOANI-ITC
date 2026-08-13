'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { useActionState } from 'react';
import { IconArrowRight, IconInfo } from '@/components/brand/icons';
import type { Etat } from '@/app/(candidat)/mon-dossier/actions';

/* ==========================================================================
   Enveloppe de formulaire
   --------------------------------------------------------------------------
   Un seul composant client pour toutes les étapes : il porte l'état renvoyé
   par l'action serveur, le bouton d'envoi et son état d'attente. Les champs,
   eux, restent rendus par le serveur et passés en enfants — le navigateur ne
   reçoit donc pas le formulaire en JavaScript, seulement de quoi l'animer.

   Sans JavaScript, le `form action` reste une soumission classique : la page
   se recharge et l'action s'exécute. Le portail ne se bloque pas sur un lot de
   scripts qui n'arrive pas (§18.2).
   ========================================================================== */

type Props = {
  action: (precedent: Etat, donnees: FormData) => Promise<Etat>;
  children: ReactNode;
  envoi?: string;
  retour?: { readonly href: string; readonly libelle: string };
  /** Passe le formulaire en multipart, pour le dépôt de pièces. */
  fichiers?: boolean;
  /** Rendu à la place du bouton d'envoi lorsque l'étape n'attend rien. */
  complement?: ReactNode;
};

const DEPART: Etat = { message: null };

export function Formulaire({
  action,
  children,
  envoi = 'Enregistrer et continuer',
  retour,
  fichiers = false,
  complement,
}: Props) {
  const [etat, soumettre, enAttente] = useActionState(action, DEPART);

  return (
    <form
      action={soumettre}
      encType={fichiers ? 'multipart/form-data' : undefined}
      className="flex flex-col gap-6"
      noValidate
    >
      {etat.message ? (
        <p
          role="alert"
          className="flex gap-3 rounded-xl border border-state-danger/25 bg-state-danger/[0.06] p-4 text-[0.875rem] leading-relaxed font-medium text-state-danger"
        >
          <IconInfo aria-hidden="true" className="mt-0.5 h-[1.125rem] w-[1.125rem] shrink-0" />
          {etat.message}
        </p>
      ) : null}

      {children}

      <div className="flex flex-wrap items-center gap-3 border-t border-graphite-100 pt-6">
        <button type="submit" disabled={enAttente} className="bouton bouton--principal">
          {enAttente ? 'Enregistrement…' : envoi}
          {enAttente ? null : <IconArrowRight className="h-4 w-4" />}
        </button>

        {retour ? (
          <Link href={retour.href} className="bouton bouton--discret">
            {retour.libelle}
          </Link>
        ) : null}

        {complement}

        <p aria-live="polite" className="sr-only">
          {enAttente ? 'Enregistrement en cours' : ''}
        </p>
      </div>
    </form>
  );
}

/* -------------------------------------------------------------------------- */

/**
 * Formulaire réduit à un bouton : dépôt d'une action sans champ à saisir
 * (retrait d'une pièce, envoi définitif du dossier).
 */
export function BoutonAction({
  action,
  libelle,
  libelleAttente,
  variante = 'contour',
  champs,
  confirmation,
  className,
}: {
  action: (precedent: Etat, donnees: FormData) => Promise<Etat>;
  libelle: string;
  libelleAttente?: string;
  variante?: 'principal' | 'or' | 'contour' | 'discret';
  champs?: Record<string, string>;
  confirmation?: string;
  className?: string;
}) {
  const [etat, soumettre, enAttente] = useActionState(action, DEPART);

  return (
    <form
      action={soumettre}
      className={className}
      onSubmit={(evenement) => {
        if (confirmation && !window.confirm(confirmation)) evenement.preventDefault();
      }}
    >
      {Object.entries(champs ?? {}).map(([nom, valeur]) => (
        <input key={nom} type="hidden" name={nom} value={valeur} />
      ))}

      <button type="submit" disabled={enAttente} className={`bouton bouton--${variante}`}>
        {enAttente ? (libelleAttente ?? 'En cours…') : libelle}
      </button>

      {etat.message ? (
        <p role="alert" className="erreur">
          {etat.message}
        </p>
      ) : null}
    </form>
  );
}
