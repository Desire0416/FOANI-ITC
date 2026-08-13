'use client';

import { useActionState, useId, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { IconArrowRight, IconCheck, IconInfo } from '@/components/brand/icons';
import { LeafSprig } from '@/components/brand/marks';
import { envoyerDemande } from '@/app/(site)/actions/demande';
import type { EtatDemande, TypeDemande } from '@/app/(site)/actions/demande';
import { cn } from '@/lib/utils';

/** Un module « use server » ne peut exporter que des fonctions asynchrones :
 *  l'état initial vit donc côté client. */
const ETAT_INITIAL: EtatDemande = { statut: 'inerte' };

/* ==========================================================================
   Formulaire de demande
   --------------------------------------------------------------------------
   Un seul composant sert les cinq parcours entrants : information, brochure,
   devis, recrutement, contact. Les champs varient, la mécanique non —
   étiquettes explicites, erreurs rattachées au champ par `aria-describedby`,
   message de retour annoncé aux lecteurs d'écran (CDC §18.3).

   Les champs sont contrôlés, et ce n'est pas un détail : React réinitialise le
   formulaire à chaque soumission. Avec des champs non contrôlés, une simple
   erreur de validation effacerait tout ce qui vient d'être saisi. Le CDC
   l'interdit explicitement (§18.2 : « une saisie en cours n'est jamais perdue »),
   et sur un réseau où la soumission peut échouer, c'est le cas le plus fréquent,
   pas le cas limite.
   ========================================================================== */

type ChampNom = 'organisation' | 'nom' | 'contact' | 'message';

const CHAMPS: Record<TypeDemande, readonly ChampNom[]> = {
  information: ['nom', 'contact', 'message'],
  brochure: ['nom', 'contact'],
  devis: ['organisation', 'nom', 'contact', 'message'],
  recruteur: ['organisation', 'nom', 'contact', 'message'],
  contact: ['nom', 'contact', 'message'],
};

const ETIQUETTES: Record<ChampNom, { readonly libelle: string; readonly aide?: string }> = {
  organisation: { libelle: 'Organisation', aide: 'Coopérative, entreprise, groupement ou institution.' },
  nom: { libelle: 'Nom et prénoms' },
  contact: {
    libelle: 'Téléphone ou adresse électronique',
    aide: 'C’est par là que nous vous répondrons. Un numéro suffit.',
  },
  message: { libelle: 'Votre demande' },
};

export function FormulaireDemande({
  type,
  formation,
  origine,
  intitule,
  className,
}: {
  type: TypeDemande;
  /** Formation présélectionnée, transmise avec la demande (CDC §9.1). */
  formation?: string;
  origine?: string;
  intitule?: string;
  className?: string;
}) {
  const [etat, action] = useActionState<EtatDemande, FormData>(envoyerDemande, ETAT_INITIAL);
  const [valeurs, setValeurs] = useState<Partial<Record<ChampNom, string>>>({});
  const [consent, setConsent] = useState(false);
  const prefixe = useId();
  const champs = CHAMPS[type];

  const modifier = (champ: ChampNom) => (evenement: { target: { value: string } }) =>
    setValeurs((precedent) => ({ ...precedent, [champ]: evenement.target.value }));

  if (etat.statut === 'succes') {
    return (
      <div className={cn('rounded-card-lg border border-graphite-100 bg-paper-tint p-8 text-center', className)}>
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-pill bg-ink-800">
          <IconCheck className="h-6 w-6 text-gold-400" />
        </span>
        <p className="mt-6 font-display text-[1.375rem] text-ink-800">Demande enregistrée</p>
        <p className="mx-auto mt-3 max-w-md text-[0.9375rem] leading-relaxed text-graphite-500">{etat.message}</p>
      </div>
    );
  }

  return (
    <form action={action} className={cn('flex flex-col gap-5', className)} noValidate>
      <input type="hidden" name="type" value={type} />
      {formation ? <input type="hidden" name="formation" value={formation} /> : null}
      {origine ? <input type="hidden" name="origine" value={origine} /> : null}

      {/* Piège à robots — masqué visuellement et aux lecteurs d'écran. */}
      <div aria-hidden="true" className="hidden">
        <label htmlFor={`${prefixe}-site`}>Ne pas remplir</label>
        <input id={`${prefixe}-site`} type="text" name="site" tabIndex={-1} autoComplete="off" />
      </div>

      {intitule ? (
        <p className="flex items-start gap-2.5 rounded-card bg-ink-50 px-4 py-3 text-[0.875rem] leading-snug text-ink-800">
          <LeafSprig aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-gold-500" />
          <span>
            Votre demande porte sur&nbsp;: <strong className="font-semibold">{intitule}</strong>
          </span>
        </p>
      ) : null}

      {champs.map((champ) => {
        const id = `${prefixe}-${champ}`;
        const erreur = etat.erreurs?.[champ];
        const aideId = ETIQUETTES[champ].aide ? `${id}-aide` : undefined;
        const erreurId = erreur ? `${id}-erreur` : undefined;
        const decrit = [aideId, erreurId].filter(Boolean).join(' ') || undefined;

        return (
          <div key={champ} className="flex flex-col gap-1.5">
            <label htmlFor={id} className="text-[0.875rem] font-semibold text-ink-800">
              {ETIQUETTES[champ].libelle}
              <span aria-hidden="true" className="ml-1 text-gold-600">
                *
              </span>
            </label>
            {ETIQUETTES[champ].aide ? (
              <p id={aideId} className="text-[0.8125rem] text-graphite-500">
                {ETIQUETTES[champ].aide}
              </p>
            ) : null}

            {champ === 'message' ? (
              <textarea
                id={id}
                name={champ}
                rows={5}
                required
                value={valeurs[champ] ?? ''}
                onChange={modifier(champ)}
                aria-invalid={erreur ? true : undefined}
                aria-describedby={decrit}
                className={cn(
                  'rounded-card border bg-paper-tint px-4 py-3 text-[0.9375rem] text-ink-800 placeholder:text-graphite-500 focus:bg-paper focus:outline-none',
                  erreur ? 'border-state-danger' : 'border-graphite-200 focus:border-ink-300',
                )}
              />
            ) : (
              <input
                id={id}
                name={champ}
                type="text"
                required
                value={valeurs[champ] ?? ''}
                onChange={modifier(champ)}
                autoComplete={champ === 'nom' ? 'name' : champ === 'organisation' ? 'organization' : 'on'}
                aria-invalid={erreur ? true : undefined}
                aria-describedby={decrit}
                className={cn(
                  'h-13 rounded-pill border bg-paper-tint px-5 text-[0.9375rem] text-ink-800 placeholder:text-graphite-500 focus:bg-paper focus:outline-none',
                  erreur ? 'border-state-danger' : 'border-graphite-200 focus:border-ink-300',
                )}
              />
            )}

            {erreur ? (
              <p id={erreurId} className="text-[0.8125rem] font-medium text-state-danger">
                {erreur}
              </p>
            ) : null}
          </div>
        );
      })}

      {/* Consentement — §20.2, recueilli explicitement et jamais pré-coché. */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor={`${prefixe}-consentement`} className="flex items-start gap-3 text-[0.875rem] leading-snug text-graphite-600">
          <input
            id={`${prefixe}-consentement`}
            name="consentement"
            type="checkbox"
            checked={consent}
            onChange={(evenement) => setConsent(evenement.target.checked)}
            className="mt-0.5 h-5 w-5 shrink-0 rounded border-graphite-300 accent-[var(--color-ink-800)]"
            aria-describedby={etat.erreurs?.consentement ? `${prefixe}-consentement-erreur` : undefined}
          />
          <span>
            J’accepte que FOANI-ITC conserve ces informations pour traiter ma demande. Elles ne sont utilisées à
            aucune autre fin.
          </span>
        </label>
        {etat.erreurs?.consentement ? (
          <p id={`${prefixe}-consentement-erreur`} className="text-[0.8125rem] font-medium text-state-danger">
            {etat.erreurs.consentement}
          </p>
        ) : null}
      </div>

      <Soumettre />

      {etat.statut === 'erreur' || etat.statut === 'non-configure' ? (
        <p
          role="alert"
          className={cn(
            'flex items-start gap-2.5 rounded-card px-4 py-3 text-[0.875rem] leading-relaxed',
            etat.statut === 'non-configure'
              ? 'bg-gold-50 text-gold-800'
              : 'bg-state-danger/8 text-state-danger',
          )}
        >
          <IconInfo aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{etat.message}</span>
        </p>
      ) : null}
    </form>
  );
}

function Soumettre() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="group/envoi inline-flex h-13 items-center justify-center gap-2.5 rounded-pill bg-ink-800 px-6 text-[0.9375rem] font-semibold text-paper shadow-raise transition-all duration-300 ease-[var(--ease-arc)] hover:bg-ink-700 hover:shadow-lift disabled:opacity-60"
    >
      {pending ? 'Envoi en cours…' : 'Envoyer ma demande'}
      {pending ? null : (
        <IconArrowRight className="h-4 w-4 transition-transform duration-300 ease-[var(--ease-arc)] group-hover/envoi:[transform:translateX(3px)]" />
      )}
    </button>
  );
}
