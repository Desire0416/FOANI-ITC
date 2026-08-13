'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { IconArrowRight, IconInfo, IconMail, IconShield } from '@/components/brand/icons';
import { ouvrirSession, type EtatConnexion } from './actions';

const ETAT_INITIAL: EtatConnexion = { message: null };

/**
 * Formulaire d'accès.
 *
 * Champs contrôlés : React réinitialise le formulaire à chaque soumission, et
 * une erreur d'identifiants ne doit pas effacer l'adresse déjà saisie.
 */
export function FormulaireConnexion() {
  const [etat, action] = useActionState(ouvrirSession, ETAT_INITIAL);
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [visible, setVisible] = useState(false);

  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      <div>
        <label htmlFor="email" className="etiquette">
          Adresse électronique
        </label>
        <div className="relative">
          <IconMail
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 h-[1.125rem] w-[1.125rem] -translate-y-1/2 text-graphite-400"
          />
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(evenement) => setEmail(evenement.target.value)}
            placeholder="prenom.nom@foani-itc.ci"
            className="champ pl-11"
          />
        </div>
      </div>

      <div>
        <label htmlFor="motDePasse" className="etiquette">
          Mot de passe
        </label>
        <div className="relative">
          <IconShield
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 h-[1.125rem] w-[1.125rem] -translate-y-1/2 text-graphite-400"
          />
          <input
            id="motDePasse"
            name="motDePasse"
            type={visible ? 'text' : 'password'}
            autoComplete="current-password"
            required
            value={motDePasse}
            onChange={(evenement) => setMotDePasse(evenement.target.value)}
            placeholder="••••••••••••"
            className="champ pl-11 pr-24"
          />
          <button
            type="button"
            onClick={() => setVisible((etatPrecedent) => !etatPrecedent)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-3 py-1.5 text-[0.75rem] font-semibold text-graphite-500 transition-colors hover:bg-ink-50 hover:text-ink-700"
          >
            {visible ? 'Masquer' : 'Afficher'}
          </button>
        </div>
      </div>

      {etat.message ? (
        <p
          role="alert"
          className="flex items-start gap-2.5 rounded-xl bg-state-danger/8 px-4 py-3 text-[0.875rem] leading-relaxed text-state-danger"
        >
          <IconInfo aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
          {etat.message}
        </p>
      ) : null}

      <Soumettre />
    </form>
  );
}

function Soumettre() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending} className="bouton bouton--principal mt-1 h-12 w-full">
      {pending ? 'Vérification…' : 'Ouvrir ma session'}
      {pending ? null : <IconArrowRight className="h-4 w-4" />}
    </button>
  );
}
