'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { IconCheck, IconInfo } from '@/components/brand/icons';
import { validerInscription } from '@/payload/actions/candidatures';
import { cn } from '@/lib/utils';

/* ==========================================================================
   La validation d'inscription — Note complémentaire §5.1, étape 7
   --------------------------------------------------------------------------
   « Le service Scolarité contrôle la complétude du dossier, la cohérence de
   l'identité et la présence des engagements signés, puis valide. Le numéro
   étudiant est attribué et l'inscription créée. »

   Les trois conditions sont affichées avant le bouton, cochées ou non. Un
   agent qui valide doit voir sur quoi il s'engage — et si l'une manque, il
   voit laquelle plutôt qu'un bouton grisé sans explication.

   « En cas de doute, la scolarité demande une pièce complémentaire sans
   rejeter le dossier. » Ce geste-là existe déjà dans la chaîne : il rend la
   main au candidat sans effacer ce qu'il a fait.
   ========================================================================== */

export function ValiderInscription({
  id,
  conditions,
  numeroExistant,
  autorise,
}: {
  id: string;
  conditions: readonly { readonly libelle: string; readonly remplie: boolean }[];
  numeroExistant: string | null;
  autorise: boolean;
}) {
  const router = useRouter();
  const [retour, setRetour] = useState<{ ok: boolean; message: string } | null>(null);
  const [enCours, demarrer] = useTransition();

  const pret = conditions.every((condition) => condition.remplie);

  return (
    <div className="flex flex-col gap-4">
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

      <ul className="flex flex-col gap-2">
        {conditions.map((condition) => (
          <li
            key={condition.libelle}
            className={cn(
              'flex items-start gap-2.5 text-[0.875rem] leading-snug',
              condition.remplie ? 'text-graphite-600' : 'text-state-danger',
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full',
                condition.remplie ? 'bg-state-success text-paper' : 'bg-state-danger/15',
              )}
            >
              {condition.remplie ? <IconCheck className="h-2.5 w-2.5" /> : null}
            </span>
            {condition.libelle}
          </li>
        ))}
      </ul>

      {numeroExistant ? (
        <p className="rounded-xl border border-ink-100 bg-ink-50 px-4 py-3 text-[0.875rem] text-ink-800">
          Numéro étudiant attribué&nbsp;:{' '}
          <strong className="font-display text-[1.0625rem] tabular-nums">{numeroExistant}</strong>
        </p>
      ) : null}

      {autorise && !numeroExistant ? (
        <button
          type="button"
          disabled={!pret || enCours}
          onClick={() =>
            demarrer(async () => {
              const resultat = await validerInscription(id);
              setRetour(resultat);
              if (resultat.ok) router.refresh();
            })
          }
          className={cn('bouton bouton--or w-fit', !pret && 'opacity-60')}
        >
          <IconCheck className="h-4 w-4" />
          {enCours ? 'Validation…' : 'Prononcer l’inscription'}
        </button>
      ) : null}

      {!autorise ? (
        <p className="text-[0.8125rem] leading-relaxed text-graphite-500">
          La validation d’une inscription relève du service de la scolarité.
        </p>
      ) : null}
    </div>
  );
}
