'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { IconArrowRight, IconCheck, IconClock, IconInfo, IconPhone } from '@/components/brand/icons';
import {
  accepterOffre,
  annoncerVersement,
  declinerOffre,
  demanderCode,
  type Etat,
} from '@/app/(candidat)/mon-dossier/offre';
import { cn } from '@/lib/utils';

/* ==========================================================================
   Accepter son offre, puis réserver sa place — Note complémentaire §5.1
   --------------------------------------------------------------------------
   Deux gestes qui remplacent la signature au guichet et le passage à la
   caisse. Ils sont donc traités avec le même sérieux : l'acceptation est
   confirmée par un code à usage unique et horodatée ; le versement n'a aucun
   effet tant qu'un agent ne l'a pas constaté.

   L'écran dit franchement où en est le candidat. « Votre offre est acceptée »
   ne veut pas dire « votre place est réservée » — et confondre les deux, à ce
   moment du parcours, serait la pire chose à faire.
   ========================================================================== */

function Message({ etat }: { etat: Etat | null }) {
  if (!etat?.message) return null;
  return (
    <p
      role={etat.ok ? 'status' : 'alert'}
      className={cn(
        'flex gap-3 rounded-2xl border p-4 text-[0.875rem] leading-relaxed',
        etat.ok
          ? 'border-state-success/25 bg-state-success/[0.06] font-medium text-state-success'
          : 'border-state-danger/25 bg-state-danger/[0.06] font-medium text-state-danger',
      )}
    >
      {etat.ok ? (
        <IconCheck aria-hidden="true" className="mt-0.5 h-[1.125rem] w-[1.125rem] shrink-0" />
      ) : (
        <IconInfo aria-hidden="true" className="mt-0.5 h-[1.125rem] w-[1.125rem] shrink-0" />
      )}
      {etat.message}
    </p>
  );
}

/* -------------------------------------------------------------------------- */

export function AccepterOffre({ joursRestants }: { joursRestants: number | null }) {
  const router = useRouter();
  const [etat, setEtat] = useState<Etat | null>(null);
  const [code, setCode] = useState('');
  const [demande, setDemande] = useState(false);
  const [enCours, demarrer] = useTransition();

  const presse = joursRestants !== null && joursRestants <= 3;

  return (
    <div className="flex flex-col gap-5">
      {joursRestants !== null ? (
        <p
          className={cn(
            'flex items-center gap-2.5 rounded-2xl border px-4 py-3 text-[0.875rem] font-medium',
            presse
              ? 'border-state-danger/25 bg-state-danger/[0.06] text-state-danger'
              : 'border-gold-200 bg-gold-50 text-gold-800',
          )}
        >
          <IconClock aria-hidden="true" className="h-[1.125rem] w-[1.125rem] shrink-0" />
          {joursRestants <= 0
            ? 'Le délai d’acceptation est dépassé.'
            : `Il vous reste ${joursRestants} jour${joursRestants > 1 ? 's' : ''} pour accepter. Passé ce délai, votre place est rendue à un autre candidat.`}
        </p>
      ) : null}

      <Message etat={etat} />

      {/* Le code de recette n'apparaît que si l'établissement a explicitement
          posé la variable prévue à cet effet. Jamais en service. */}
      {etat?.code ? (
        <p className="rounded-2xl border border-graphite-300 border-dashed bg-paper-tint px-4 py-3 text-[0.875rem] text-graphite-600">
          Mode de recette — code à saisir :{' '}
          <strong className="font-display text-[1.25rem] text-ink-800 tabular-nums">
            {etat.code}
          </strong>
        </p>
      ) : null}

      {!demande ? (
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={enCours}
            onClick={() =>
              demarrer(async () => {
                const retour = await demanderCode();
                setEtat(retour);
                if (retour.ok || retour.code) setDemande(true);
              })
            }
            className="bouton bouton--principal"
          >
            <IconPhone className="h-4 w-4" />
            {enCours ? 'Envoi…' : 'Recevoir mon code et accepter'}
          </button>

          <button
            type="button"
            disabled={enCours}
            onClick={() => {
              if (!window.confirm('Décliner cette offre ? Votre place sera rendue à un autre candidat.')) return;
              demarrer(async () => {
                const retour = await declinerOffre({ message: null }, new FormData());
                setEtat(retour);
                if (retour.ok) router.refresh();
              });
            }}
            className="bouton bouton--discret"
          >
            Décliner l’offre
          </button>
        </div>
      ) : (
        <form
          action={() =>
            demarrer(async () => {
              const donnees = new FormData();
              donnees.set('code', code);
              const retour = await accepterOffre({ message: null }, donnees);
              setEtat(retour);
              if (retour.ok) router.refresh();
            })
          }
          className="flex flex-col gap-4"
        >
          <div>
            <label htmlFor="code-offre" className="etiquette">
              Le code à six chiffres reçu sur votre téléphone
            </label>
            <input
              id="code-offre"
              name="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={(evenement) => setCode(evenement.target.value.replace(/\D/g, ''))}
              className="champ max-w-48 text-center font-display text-[1.5rem] tracking-[0.3em] tabular-nums"
            />
            <p className="aide">Il est valable dix minutes.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button type="submit" disabled={enCours || code.length < 6} className="bouton bouton--or">
              {enCours ? 'Vérification…' : 'Confirmer mon acceptation'}
              <IconArrowRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              disabled={enCours}
              onClick={() => demarrer(async () => setEtat(await demanderCode()))}
              className="bouton bouton--discret"
            >
              Renvoyer un code
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */

const MODES = [
  { valeur: 'mobile', libelle: 'Paiement mobile' },
  { valeur: 'virement', libelle: 'Virement bancaire' },
  { valeur: 'guichet', libelle: 'Versement au guichet' },
];

export function AnnoncerVersement({ reference }: { reference: string }) {
  const router = useRouter();
  const [etat, setEtat] = useState<Etat | null>(null);
  const [enCours, demarrer] = useTransition();

  return (
    <div className="flex flex-col gap-5">
      <Message etat={etat} />

      {/* La référence de règlement est ce qui rend le rapprochement possible :
          sans elle, un versement fait par un parent depuis son propre téléphone
          devient impossible à rattacher (§6.6). */}
      <div className="rounded-2xl border border-ink-100 bg-ink-50 p-4">
        <p className="text-[0.8125rem] font-semibold text-ink-800">Votre référence de règlement</p>
        <p className="mt-1.5 font-display text-[1.5rem] text-ink-800 tabular-nums">{reference}</p>
        <p className="mt-2 text-[0.8125rem] leading-relaxed text-ink-800">
          Indiquez-la lors de votre paiement. C’est elle qui permet de rattacher le versement à
          votre dossier, même s’il est effectué par un proche depuis son propre téléphone.
        </p>
      </div>

      <form
        action={(donnees) =>
          demarrer(async () => {
            const retour = await annoncerVersement({ message: null }, donnees);
            setEtat(retour);
            if (retour.ok) router.refresh();
          })
        }
        className="flex flex-col gap-5"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="referenceTransaction" className="etiquette">
              Référence de votre transaction
            </label>
            <input
              id="referenceTransaction"
              name="referenceTransaction"
              required
              className="champ"
              placeholder="Le numéro figurant sur le message de confirmation"
            />
            <p className="aide">Celle que votre opérateur vous a envoyée après le paiement.</p>
          </div>

          <div>
            <label htmlFor="modeReglement" className="etiquette">
              Moyen utilisé
            </label>
            <select id="modeReglement" name="modeReglement" className="champ">
              {MODES.map((mode) => (
                <option key={mode.valeur} value={mode.valeur}>
                  {mode.libelle}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button type="submit" disabled={enCours} className="bouton bouton--principal w-fit">
          {enCours ? 'Enregistrement…' : 'Annoncer mon versement'}
          <IconArrowRight className="h-4 w-4" />
        </button>
      </form>

      <p className="text-[0.8125rem] leading-relaxed text-graphite-500">
        Ce site n’encaisse aucun fonds. Votre versement n’a d’effet qu’une fois constaté par le
        service des finances, qui le rapproche de son relevé. Ne communiquez jamais votre code
        secret d’opérateur.
      </p>
    </div>
  );
}
