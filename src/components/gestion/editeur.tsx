'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition, type ReactNode } from 'react';
import { IconCheck, IconInfo } from '@/components/brand/icons';
import { actionsPossibles, contenuModifiable, etatEditorial } from '@/lib/publications';
import {
  changerEtat,
  enregistrerContenu,
  type Retour,
  type Rubrique,
  type Transition,
} from '@/payload/actions/publications';
import { cn } from '@/lib/utils';

/* ==========================================================================
   Éditeur de contenu
   --------------------------------------------------------------------------
   Un seul formulaire pour les trois rubriques : les champs sont décrits par
   la page qui l'appelle, l'enregistrement et les transitions d'état sont
   traités ici.

   Deux gestes sont séparés à dessein : « Enregistrer » ne publie jamais, et
   « Mettre en ligne » n'enregistre pas la saisie en cours. Un éditeur qui
   clique pour publier ne doit pas envoyer par surprise une modification qu'il
   n'avait pas relue — c'est la raison du message qui apparaît lorsqu'il reste
   des changements non enregistrés.
   ========================================================================== */

export type ChampEditeur =
  | {
      readonly type: 'texte' | 'date' | 'zone';
      readonly nom: string;
      readonly etiquette: string;
      readonly valeur?: string | null;
      readonly aide?: string;
      readonly requis?: boolean;
      readonly lignes?: number;
      readonly largeur?: 'pleine' | 'moitie';
      readonly max?: number;
    }
  | {
      readonly type: 'liste';
      readonly nom: string;
      readonly etiquette: string;
      readonly valeur?: string | null;
      readonly aide?: string;
      readonly requis?: boolean;
      readonly largeur?: 'pleine' | 'moitie';
      readonly options: readonly { readonly valeur: string; readonly libelle: string }[];
    }
  | {
      readonly type: 'case';
      readonly nom: string;
      readonly etiquette: string;
      readonly coche?: boolean;
      readonly aide?: string;
    };

export function Editeur({
  rubrique,
  id,
  etat,
  champs,
  peutPublier,
  apercu,
}: {
  rubrique: Rubrique;
  id: string | null;
  etat: string;
  champs: readonly ChampEditeur[];
  peutPublier: boolean;
  apercu?: ReactNode;
}) {
  const router = useRouter();
  const [retour, setRetour] = useState<Retour | null>(null);
  const [modifie, setModifie] = useState(false);
  const [enCours, demarrer] = useTransition();

  const info = etatEditorial(etat);
  const actions = id ? actionsPossibles(etat, peutPublier) : [];
  // Le contrôle réel est dans l'action serveur ; celui-ci évite au rédacteur
  // de composer une modification qui sera refusée.
  const modifiable = contenuModifiable(etat, peutPublier);

  function enregistrer(evenement: React.FormEvent<HTMLFormElement>) {
    evenement.preventDefault();
    const donnees = new FormData(evenement.currentTarget);

    const contenu: Record<string, unknown> = {};
    for (const champ of champs) {
      if (champ.type === 'case') {
        contenu[champ.nom] = donnees.get(champ.nom) === 'on';
        continue;
      }
      const brut = String(donnees.get(champ.nom) ?? '').trim();
      contenu[champ.nom] = brut === '' ? null : brut;
    }

    demarrer(async () => {
      const resultat = await enregistrerContenu(rubrique, id, contenu);
      setRetour(resultat);
      if (resultat.ok) {
        setModifie(false);
        if (!id && resultat.id) router.replace(`/gestion/publications/${rubrique}/${resultat.id}`);
        else router.refresh();
      }
    });
  }

  function transiter(transition: Transition, confirmation?: string) {
    if (!id) return;
    if (confirmation && !window.confirm(confirmation)) return;
    demarrer(async () => {
      const resultat = await changerEtat(rubrique, id, transition);
      setRetour(resultat);
      if (resultat.ok) router.refresh();
    });
  }

  return (
    <form onSubmit={enregistrer} onChange={() => setModifie(true)} className="flex flex-col gap-6">
      {retour ? (
        <p
          role="status"
          className={cn(
            'flex gap-3 rounded-xl border p-4 text-[0.875rem] leading-relaxed font-medium',
            retour.ok
              ? 'border-[#0f7a4d]/25 bg-[#e8f4ee] text-[#0f7a4d]'
              : 'border-state-danger/25 bg-state-danger/[0.06] text-state-danger',
          )}
        >
          {retour.ok ? (
            <IconCheck aria-hidden="true" className="mt-0.5 h-[1.125rem] w-[1.125rem] shrink-0" />
          ) : (
            <IconInfo aria-hidden="true" className="mt-0.5 h-[1.125rem] w-[1.125rem] shrink-0" />
          )}
          {retour.message}
        </p>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)] lg:items-start">
        {/* ------------------------------------------------------- Les champs */}
        <section className="carte p-5 lg:p-6">
          {modifiable ? null : (
            <p className="mb-5 flex gap-3 rounded-xl border border-gold-200 bg-gold-50 p-4 text-[0.875rem] leading-relaxed text-gold-800">
              <IconInfo aria-hidden="true" className="mt-0.5 h-[1.125rem] w-[1.125rem] shrink-0" />
              Ce contenu est en ligne. Sa modification est réservée aux éditeurs : demandez son retrait
              du site pour le reprendre.
            </p>
          )}
          <fieldset disabled={!modifiable} className="min-w-0">
            <div className="grid gap-5 sm:grid-cols-2">
              {champs.map((champ) => (
                <Champ key={champ.nom} champ={champ} />
              ))}
            </div>
          </fieldset>
        </section>

        {/* --------------------------------------------------------- Le pilote */}
        <aside className="flex flex-col gap-4 lg:sticky lg:top-6">
          <section className="carte p-5">
            <p className="text-[0.8125rem] font-semibold text-graphite-700">État</p>
            <p className="mt-2 flex items-center gap-2">
              <span className="font-display text-[1.25rem] text-ink-800">{info.libelle}</span>
            </p>
            <p className="mt-1.5 text-[0.8125rem] leading-snug text-graphite-500">{info.sens}</p>

            {modifiable ? (
              <button
                type="submit"
                disabled={enCours}
                className="bouton bouton--principal mt-5 w-full"
              >
                {enCours ? 'Enregistrement…' : id ? 'Enregistrer' : 'Créer le brouillon'}
              </button>
            ) : null}

            {modifie && id ? (
              <p className="mt-3 text-[0.8125rem] leading-snug text-state-warning">
                Vous avez des modifications non enregistrées. Enregistrez-les avant de changer l’état.
              </p>
            ) : null}
          </section>

          {actions.length > 0 ? (
            <section className="carte p-5">
              <p className="text-[0.8125rem] font-semibold text-graphite-700">Ce que vous pouvez faire</p>
              <div className="mt-4 flex flex-col gap-2.5">
                {actions.map((action) => (
                  <div key={action.cle}>
                    <button
                      type="button"
                      disabled={enCours || modifie}
                      onClick={() => transiter(action.cle, action.confirmation)}
                      className={`bouton bouton--${action.variante} w-full`}
                    >
                      {action.libelle}
                    </button>
                    <p className="mt-1 text-[0.75rem] leading-snug text-graphite-500">{action.aide}</p>
                  </div>
                ))}
              </div>

              {!peutPublier ? (
                <p className="mt-4 border-t border-graphite-100 pt-3 text-[0.75rem] leading-snug text-graphite-500">
                  La mise en ligne est réservée aux éditeurs.
                </p>
              ) : null}
            </section>
          ) : null}

          {apercu}
        </aside>
      </div>
    </form>
  );
}

/* -------------------------------------------------------------------------- */

function Champ({ champ }: { champ: ChampEditeur }) {
  const pleine = champ.type === 'case' || champ.type === 'zone' || champ.largeur !== 'moitie';
  const classe = pleine ? 'sm:col-span-2' : undefined;

  if (champ.type === 'case') {
    return (
      <div className={classe}>
        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-graphite-200 bg-paper px-4 py-3 transition-colors hover:border-ink-300">
          <input
            type="checkbox"
            name={champ.nom}
            defaultChecked={champ.coche}
            className="h-4.5 w-4.5 shrink-0 accent-[var(--color-ink-700)]"
          />
          <span className="text-[0.9375rem] text-ink-800">{champ.etiquette}</span>
        </label>
        {champ.aide ? <p className="aide">{champ.aide}</p> : null}
      </div>
    );
  }

  return (
    <div className={classe}>
      <label htmlFor={champ.nom} className="etiquette">
        {champ.etiquette}
        {champ.requis ? null : (
          <span className="ml-1.5 font-normal text-graphite-500">(facultatif)</span>
        )}
      </label>

      {champ.type === 'liste' ? (
        <select id={champ.nom} name={champ.nom} defaultValue={champ.valeur ?? ''} className="champ">
          {champ.options.map((option) => (
            <option key={option.valeur} value={option.valeur}>
              {option.libelle}
            </option>
          ))}
        </select>
      ) : champ.type === 'zone' ? (
        <textarea
          id={champ.nom}
          name={champ.nom}
          rows={champ.lignes ?? 6}
          maxLength={champ.max}
          defaultValue={champ.valeur ?? ''}
          className="champ"
        />
      ) : (
        <input
          id={champ.nom}
          name={champ.nom}
          type={champ.type === 'date' ? 'date' : 'text'}
          maxLength={champ.max}
          defaultValue={champ.valeur ?? ''}
          className="champ"
        />
      )}

      {champ.aide ? <p className="aide">{champ.aide}</p> : null}
    </div>
  );
}
