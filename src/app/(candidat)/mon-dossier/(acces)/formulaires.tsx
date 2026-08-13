'use client';

import { useActionState } from 'react';
import { IconArrowRight, IconInfo } from '@/components/brand/icons';
import { creerCompte, ouvrirSession, type Etat } from '@/app/(candidat)/mon-dossier/actions';

/* ==========================================================================
   Formulaires d'accès
   --------------------------------------------------------------------------
   L'identifiant est le numéro de téléphone : c'est ce que le candidat retient
   et ce dont il dispose à coup sûr (§10.1). L'adresse électronique reste
   possible, mais facultative.
   ========================================================================== */

const DEPART: Etat = { message: null };

function Message({ etat }: { etat: Etat }) {
  if (!etat.message) return null;
  return (
    <p
      role="alert"
      className="flex gap-2.5 rounded-xl border border-state-danger/25 bg-state-danger/[0.06] p-3.5 text-[0.8125rem] leading-snug font-medium text-state-danger"
    >
      <IconInfo aria-hidden="true" className="mt-px h-4 w-4 shrink-0" />
      {etat.message}
    </p>
  );
}

/* -------------------------------------------------------------------------- */

export function FormulaireInscription() {
  const [etat, soumettre, enAttente] = useActionState(creerCompte, DEPART);

  return (
    <form action={soumettre} className="flex flex-col gap-4" noValidate>
      <Message etat={etat} />

      <div>
        <label htmlFor="identifiant" className="etiquette">
          Votre numéro de téléphone
        </label>
        <input
          id="identifiant"
          name="identifiant"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          required
          aria-invalid={etat.champ === 'identifiant' || undefined}
          placeholder="07 00 00 00 00"
          className="champ"
        />
        <p className="aide">C’est ce numéro qui vous servira à vous reconnecter.</p>
      </div>

      <div>
        <label htmlFor="courriel" className="etiquette">
          Votre adresse électronique <span className="font-normal text-graphite-500">(facultatif)</span>
        </label>
        <input
          id="courriel"
          name="courriel"
          type="email"
          inputMode="email"
          autoComplete="email"
          className="champ"
        />
      </div>

      <div>
        <label htmlFor="motDePasse" className="etiquette">
          Choisissez un mot de passe
        </label>
        <input
          id="motDePasse"
          name="motDePasse"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          aria-invalid={etat.champ === 'motDePasse' || undefined}
          className="champ"
        />
        <p className="aide">8 caractères au minimum.</p>
      </div>

      <div>
        <label htmlFor="confirmation" className="etiquette">
          Retapez-le
        </label>
        <input
          id="confirmation"
          name="confirmation"
          type="password"
          autoComplete="new-password"
          required
          aria-invalid={etat.champ === 'confirmation' || undefined}
          className="champ"
        />
      </div>

      <button type="submit" disabled={enAttente} className="bouton bouton--principal mt-1 w-full">
        {enAttente ? 'Création…' : 'Créer mon compte'}
        {enAttente ? null : <IconArrowRight className="h-4 w-4" />}
      </button>
    </form>
  );
}

/* -------------------------------------------------------------------------- */

export function FormulaireConnexionCandidat() {
  const [etat, soumettre, enAttente] = useActionState(ouvrirSession, DEPART);

  return (
    <form action={soumettre} className="flex flex-col gap-4" noValidate>
      <Message etat={etat} />

      <div>
        <label htmlFor="identifiant" className="etiquette">
          Votre numéro de téléphone
        </label>
        <input
          id="identifiant"
          name="identifiant"
          type="text"
          inputMode="tel"
          autoComplete="username"
          required
          className="champ"
        />
        <p className="aide">Ou l’adresse électronique que vous avez indiquée.</p>
      </div>

      <div>
        <label htmlFor="motDePasse" className="etiquette">
          Votre mot de passe
        </label>
        <input
          id="motDePasse"
          name="motDePasse"
          type="password"
          autoComplete="current-password"
          required
          className="champ"
        />
      </div>

      <button type="submit" disabled={enAttente} className="bouton bouton--principal mt-1 w-full">
        {enAttente ? 'Connexion…' : 'Ouvrir mon dossier'}
        {enAttente ? null : <IconArrowRight className="h-4 w-4" />}
      </button>
    </form>
  );
}
