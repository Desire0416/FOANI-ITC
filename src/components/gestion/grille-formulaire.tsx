'use client';

import { useActionState, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { IconArrowRight, IconCheck, IconInfo } from '@/components/brand/icons';
import {
  archiverGrille,
  arreterGrille,
  creerGrille,
  modifierGrille,
  type Retour,
} from '@/payload/actions/grilles';
import { NATURES } from '@/payload/finances/natures';
import { formaterMontant, repartir } from '@/payload/finances/montants';
import { cn } from '@/lib/utils';

/* ==========================================================================
   La saisie d'une grille tarifaire — Note complémentaire §6.4
   --------------------------------------------------------------------------
   Une ligne par nature de frais, et rien de plus. La direction remplit les
   montants qu'elle a arrêtés ; elle ne choisit pas quelles natures existent —
   elles sont fixées par le §6.3.

   Les dates d'échéance se saisissent une par ligne, en clair. C'est plus
   rapide à remplir que sept sélecteurs de date pour quelqu'un qui recopie un
   calendrier depuis une délibération, et cela se relit d'un coup d'œil.

   La répartition des tranches est montrée pendant la saisie, avant
   l'enregistrement : c'est le moment où l'on voit que trois cent mille en sept
   ne tombe pas rond, et que le dispositif s'en charge sans perdre de francs.
   ========================================================================== */

const DEPART: Retour = { ok: false, message: '' };

export type LigneSaisie = {
  readonly nature: string;
  readonly libelle: string;
  readonly montant: number;
  readonly dates: readonly string[];
};

export function FormulaireGrille({
  id,
  lignes,
  modifiable,
  entete,
}: {
  /** Absent pour une création. */
  id?: string;
  lignes: readonly LigneSaisie[];
  modifiable: boolean;
  /** Les champs d'identification, rendus par le serveur pour une création. */
  entete?: React.ReactNode;
}) {
  const action = id
    ? modifierGrille.bind(null, id)
    : (creerGrille as (precedent: Retour, donnees: FormData) => Promise<Retour>);
  const [etat, soumettre, enAttente] = useActionState(action, DEPART);

  /* L'aperçu de répartition est calculé pendant la frappe : il n'a pas besoin
     du serveur, et le voir tôt est tout l'intérêt. */
  const [apercu, setApercu] = useState<Record<string, { montant: number; dates: number }>>(() =>
    Object.fromEntries(
      lignes.map((ligne) => [ligne.nature, { montant: ligne.montant, dates: ligne.dates.length }]),
    ),
  );

  return (
    <form action={soumettre} className="flex flex-col gap-5">
      {etat.message ? (
        <p
          role={etat.ok ? 'status' : 'alert'}
          className={cn(
            'flex gap-3 rounded-xl border p-4 text-[0.875rem] leading-relaxed font-medium',
            etat.ok
              ? 'border-state-success/25 bg-state-success/[0.06] text-state-success'
              : 'border-state-danger/25 bg-state-danger/[0.06] text-state-danger',
          )}
        >
          <IconInfo aria-hidden="true" className="mt-0.5 h-[1.125rem] w-[1.125rem] shrink-0" />
          {etat.message}
        </p>
      ) : null}

      {entete}

      <fieldset disabled={!modifiable} className={cn(modifiable ? undefined : 'opacity-75')}>
        <div className="flex flex-col gap-4">
          {NATURES.map((nature) => {
            const existante = lignes.find((ligne) => ligne.nature === nature.cle);
            const vu = apercu[nature.cle];
            const parts =
              vu && vu.montant > 0 && vu.dates > 1 ? repartir(vu.montant, vu.dates) : null;

            return (
              <div key={nature.cle} className="carte p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h3 className="text-[0.9375rem] font-semibold text-ink-800">{nature.libelle}</h3>
                  <p className="text-[0.75rem] text-graphite-500">{nature.concerne}</p>
                </div>
                <p className="mt-1 text-[0.8125rem] leading-relaxed text-graphite-500">
                  {nature.regime}
                </p>

                <div className="mt-4 grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,10rem)]">
                  <div>
                    <label htmlFor={`libelle-${nature.cle}`} className="etiquette">
                      Libellé porté sur l’appel de frais
                    </label>
                    <input
                      id={`libelle-${nature.cle}`}
                      name={`libelle-${nature.cle}`}
                      defaultValue={existante?.libelle ?? nature.libelle}
                      className="champ"
                    />
                  </div>
                  <div>
                    <label htmlFor={`montant-${nature.cle}`} className="etiquette">
                      Montant
                    </label>
                    <input
                      id={`montant-${nature.cle}`}
                      name={`montant-${nature.cle}`}
                      inputMode="numeric"
                      defaultValue={existante ? String(existante.montant) : ''}
                      placeholder="—"
                      onChange={(evenement) =>
                        setApercu((precedent) => ({
                          ...precedent,
                          [nature.cle]: {
                            montant: Number(evenement.target.value.replace(/\s/g, '')) || 0,
                            dates: precedent[nature.cle]?.dates ?? 0,
                          },
                        }))
                      }
                      className="champ text-right tabular-nums"
                    />
                    <p className="aide">En francs CFA, sans point ni virgule.</p>
                  </div>
                </div>

                {nature.echelonnable ? (
                  <div className="mt-4">
                    <label htmlFor={`echeances-${nature.cle}`} className="etiquette">
                      Dates d’exigibilité
                    </label>
                    <textarea
                      id={`echeances-${nature.cle}`}
                      name={`echeances-${nature.cle}`}
                      rows={3}
                      defaultValue={existante?.dates.join('\n') ?? ''}
                      placeholder={'2026-10-05\n2027-01-05\n2027-04-05'}
                      onChange={(evenement) =>
                        setApercu((precedent) => ({
                          ...precedent,
                          [nature.cle]: {
                            montant: precedent[nature.cle]?.montant ?? 0,
                            dates: evenement.target.value.split(/[\n,;]+/).filter((d) => d.trim())
                              .length,
                          },
                        }))
                      }
                      className="champ min-h-24 py-2.5 font-display text-[0.875rem]"
                    />
                    <p className="aide">
                      Une par ligne, au format 2026-10-05. Laissé vide, le frais est dû en une fois.
                    </p>

                    {parts ? (
                      <p className="mt-2.5 rounded-xl border border-ink-100 bg-ink-50 px-3.5 py-2.5 text-[0.8125rem] leading-relaxed text-ink-800">
                        <strong className="font-semibold">
                          {parts.length} tranches
                        </strong>{' '}
                        — {parts.map((part) => formaterMontant(part).replace(' F CFA', '')).join(' + ')}
                        {' = '}
                        {formaterMontant(vu!.montant)}
                        {new Set(parts).size > 1 ? (
                          <span className="mt-1 block text-graphite-600">
                            Le montant ne se divise pas rond&nbsp;: le reste est réparti sur les
                            premières tranches, pour que la somme retombe exactement sur le total.
                          </span>
                        ) : null}
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>

        <div className="mt-5">
          <label htmlFor="motifVersion" className="etiquette">
            Motif de cette version
          </label>
          <textarea
            id="motifVersion"
            name="motifVersion"
            rows={2}
            className="champ min-h-20 py-2.5"
            placeholder="Révision des frais de scolarité décidée en conseil du…"
          />
          <p className="aide">Obligatoire dès la deuxième version : une évolution se justifie.</p>
        </div>

        {modifiable ? (
          <button type="submit" disabled={enAttente} className="bouton bouton--principal mt-5">
            {enAttente ? 'Enregistrement…' : id ? 'Enregistrer le brouillon' : 'Créer le brouillon'}
            <IconArrowRight className="h-4 w-4" />
          </button>
        ) : null}
      </fieldset>
    </form>
  );
}

/* -------------------------------------------------------------------------- */

export function ArreterGrille({ id, etat }: { id: string; etat: string }) {
  const router = useRouter();
  const [retour, setRetour] = useState<Retour | null>(null);
  const [enCours, demarrer] = useTransition();

  if (etat === 'archivee') {
    return (
      <p className="text-[0.875rem] text-graphite-500">
        Cette grille est archivée. Elle n’est plus applicable, et les appels déjà émis à partir
        d’elle n’en sont pas affectés.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {retour ? (
        <p
          role="status"
          className={cn(
            'flex gap-3 rounded-xl border p-4 text-[0.875rem] leading-relaxed font-medium',
            retour.ok
              ? 'border-state-success/25 bg-state-success/[0.06] text-state-success'
              : 'border-state-danger/25 bg-state-danger/[0.06] text-state-danger',
          )}
        >
          <IconInfo aria-hidden="true" className="mt-0.5 h-[1.125rem] w-[1.125rem] shrink-0" />
          {retour.message}
        </p>
      ) : null}

      {etat === 'brouillon' ? (
        <>
          <p className="text-[0.875rem] leading-relaxed text-graphite-600">
            Arrêter cette grille la rend opposable&nbsp;: elle s’affichera sur la fiche de
            formation, servira aux appels de frais, et sera jointe à l’engagement financier que
            l’étudiant signe. Elle ne se modifiera plus.
          </p>
          <button
            type="button"
            disabled={enCours}
            onClick={() => {
              if (
                !window.confirm(
                  'Arrêter cette grille ? Elle deviendra opposable et ne pourra plus être modifiée.',
                )
              )
                return;
              demarrer(async () => {
                const resultat = await arreterGrille(id);
                setRetour(resultat);
                if (resultat.ok) router.refresh();
              });
            }}
            className="bouton bouton--or w-fit"
          >
            <IconCheck className="h-4 w-4" />
            {enCours ? 'Enregistrement…' : 'Arrêter cette grille'}
          </button>
        </>
      ) : (
        <>
          <p className="text-[0.875rem] leading-relaxed text-graphite-600">
            Cette grille est arrêtée. Pour faire évoluer un tarif, créez une nouvelle version — les
            appels déjà émis à partir de celle-ci ne changent pas.
          </p>
          <button
            type="button"
            disabled={enCours}
            onClick={() => {
              if (!window.confirm('Archiver cette grille ? Elle cessera d’être applicable.')) return;
              demarrer(async () => {
                const resultat = await archiverGrille(id);
                setRetour(resultat);
                if (resultat.ok) router.refresh();
              });
            }}
            className="bouton bouton--discret w-fit"
          >
            Archiver
          </button>
        </>
      )}
    </div>
  );
}
