'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { IconArrowRight, IconCheck, IconInfo, IconPhone } from '@/components/brand/icons';
import {
  demanderCodeSignature,
  signerEngagements,
  type EtatSignature,
} from '@/app/(candidat)/mon-dossier/(coque)/inscription/actions';
import { cn } from '@/lib/utils';

/* ==========================================================================
   La signature électronique — Note complémentaire §5.1, étape 6
   --------------------------------------------------------------------------
   « Il signe électroniquement : case d'acceptation explicite, puis code à
   usage unique reçu sur son téléphone. »

   Deux gestes, et ils ne font pas double emploi. La case marque le
   consentement : elle dit que quelqu'un a lu et accepte. Le code atteste que
   ce quelqu'un est bien le titulaire du numéro déclaré. Une case seule se
   coche par mégarde ou par un tiers ; un code seul ne prouve pas qu'on a lu.

   Deux cases plutôt qu'une, d'ailleurs : avoir pris connaissance, et accepter.
   Ce ne sont pas les mêmes actes, et les confondre en une seule case affaiblit
   les deux.

   « Pour un candidat mineur, la signature est apposée par le représentant
   légal, sur son propre téléphone. » Le nom du signataire est donc saisi, et
   non déduit : c'est lui qui figurera sur l'engagement.
   ========================================================================== */

export function Signature({
  nomPropose,
  provisoire,
}: {
  nomPropose: string;
  /** Les textes ne sont pas encore arrêtés par le conseil de l'établissement. */
  provisoire: boolean;
}) {
  const router = useRouter();
  const [etat, setEtat] = useState<EtatSignature | null>(null);
  const [lu, setLu] = useState(false);
  const [accepte, setAccepte] = useState(false);
  const [signataire, setSignataire] = useState(nomPropose);
  const [code, setCode] = useState('');
  const [demande, setDemande] = useState(false);
  const [enCours, demarrer] = useTransition();

  const pret = lu && accepte && signataire.trim().length >= 3;

  return (
    <div className="flex flex-col gap-5">
      {provisoire ? (
        <p className="flex gap-3 rounded-2xl border border-gold-200 bg-gold-50 p-4 text-[0.875rem] leading-relaxed text-gold-800">
          <IconInfo aria-hidden="true" className="mt-0.5 h-[1.125rem] w-[1.125rem] shrink-0" />
          <span>
            <strong className="font-semibold">Ces textes sont un projet.</strong> Ils n’ont pas
            encore été arrêtés par le conseil de l’établissement. Votre signature enregistre la
            version que vous avez lue&nbsp;; si le texte définitif diffère, il vous sera soumis de
            nouveau.
          </span>
        </p>
      ) : null}

      {etat?.message ? (
        <p
          role={etat.ok ? 'status' : 'alert'}
          className={cn(
            'flex gap-3 rounded-2xl border p-4 text-[0.875rem] leading-relaxed font-medium',
            etat.ok
              ? 'border-state-success/25 bg-state-success/[0.06] text-state-success'
              : 'border-state-danger/25 bg-state-danger/[0.06] text-state-danger',
          )}
        >
          {etat.ok ? (
            <IconCheck aria-hidden="true" className="mt-0.5 h-[1.125rem] w-[1.125rem] shrink-0" />
          ) : (
            <IconInfo aria-hidden="true" className="mt-0.5 h-[1.125rem] w-[1.125rem] shrink-0" />
          )}
          {etat.message}
        </p>
      ) : null}

      {etat?.code ? (
        <p className="rounded-2xl border border-dashed border-graphite-300 bg-paper-tint px-4 py-3 text-[0.875rem] text-graphite-600">
          Mode de recette — code à saisir&nbsp;:{' '}
          <strong className="font-display text-[1.25rem] text-ink-800 tabular-nums">
            {etat.code}
          </strong>
        </p>
      ) : null}

      {/* -------------------------------------------------------- Les cases */}
      <div className="flex flex-col gap-3.5 rounded-2xl border border-graphite-200 bg-paper-tint p-5">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={lu}
            onChange={(evenement) => setLu(evenement.target.checked)}
            className="mt-0.5 h-5 w-5 shrink-0 rounded border-graphite-300 accent-ink-700"
          />
          <span className="text-[0.875rem] leading-relaxed text-ink-800">
            J’ai pris connaissance du règlement de scolarité et de l’engagement financier ci-dessus,
            dans leur intégralité.
          </span>
        </label>

        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={accepte}
            onChange={(evenement) => setAccepte(evenement.target.checked)}
            className="mt-0.5 h-5 w-5 shrink-0 rounded border-graphite-300 accent-ink-700"
          />
          <span className="text-[0.875rem] leading-relaxed text-ink-800">
            Je les accepte et m’engage à les respecter.
          </span>
        </label>

        <div className="mt-1.5 border-t border-graphite-200 pt-4">
          <label htmlFor="signataire" className="etiquette">
            Nom et prénoms du signataire
          </label>
          <input
            id="signataire"
            value={signataire}
            onChange={(evenement) => setSignataire(evenement.target.value)}
            className="champ max-w-md"
          />
          <p className="aide">
            Si vous êtes mineur, c’est votre représentant légal qui signe, depuis son propre
            téléphone&nbsp;: portez alors son nom, et faites-lui saisir le code.
          </p>
        </div>
      </div>

      {/* ---------------------------------------------------------- Le code */}
      {!demande ? (
        <button
          type="button"
          disabled={!pret || enCours}
          onClick={() =>
            demarrer(async () => {
              const retour = await demanderCodeSignature();
              setEtat(retour);
              if (retour.ok || retour.code) setDemande(true);
            })
          }
          className={cn('bouton bouton--principal w-fit', !pret && 'opacity-60')}
        >
          <IconPhone className="h-4 w-4" />
          {enCours ? 'Envoi…' : 'Recevoir mon code de signature'}
        </button>
      ) : (
        <form
          action={() =>
            demarrer(async () => {
              const donnees = new FormData();
              donnees.set('lu', lu ? 'oui' : 'non');
              donnees.set('accepte', accepte ? 'oui' : 'non');
              donnees.set('signataire', signataire.trim());
              donnees.set('code', code);
              const retour = await signerEngagements({ message: null }, donnees);
              setEtat(retour);
              if (retour.ok) router.refresh();
            })
          }
          className="flex flex-col gap-4"
        >
          <div>
            <label htmlFor="code-signature" className="etiquette">
              Le code à six chiffres reçu sur le téléphone du signataire
            </label>
            <input
              id="code-signature"
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
            <button
              type="submit"
              disabled={enCours || code.length < 6 || !pret}
              className="bouton bouton--or"
            >
              {enCours ? 'Vérification…' : 'Signer mes engagements'}
              <IconArrowRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              disabled={enCours}
              onClick={() => demarrer(async () => setEtat(await demanderCodeSignature()))}
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
