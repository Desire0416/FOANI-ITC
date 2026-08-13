'use client';

import { useState, useTransition } from 'react';
import {
  IconCheck,
  IconClose,
  IconInfo,
  IconPoints,
  IconShield,
} from '@/components/brand/icons';
import { Pastille } from '@/components/gestion/ui';
import { basculerActivation, changerRole, reinitialiserMotDePasse } from '@/payload/actions/agents';
import { LIBELLES_ROLE, PERIMETRES_ROLE, ROLES, type Role } from '@/payload/roles';
import { cn } from '@/lib/utils';

/* ==========================================================================
   Ligne d'agent
   --------------------------------------------------------------------------
   Les actions courantes — couper un accès, changer un rôle — se font ici,
   sans ouvrir de formulaire. C'est ce que le §5.2 rend fréquent : les droits
   s'attribuent par rôle, donc le rôle change plus souvent que l'état civil.

   Chaque action passe par une action serveur qui revérifie l'auteur. Le menu
   déclenche ; il ne décide rien.
   ========================================================================== */

export type Agent = {
  readonly id: string;
  readonly nom: string;
  readonly email: string;
  readonly fonction: string | null;
  readonly role: Role;
  readonly actif: boolean;
  readonly initiales: string;
  readonly creeLe: string;
  readonly estSoi: boolean;
};

export function AgentLigne({ agent, peutAgir }: { agent: Agent; peutAgir: boolean }) {
  const [ouvert, setOuvert] = useState(false);
  const [retour, setRetour] = useState<{ ok: boolean; message: string } | null>(null);
  const [enCours, demarrer] = useTransition();

  const executer = (action: () => Promise<{ ok: boolean; message: string }>) => {
    setOuvert(false);
    demarrer(async () => setRetour(await action()));
  };

  return (
    <li className="border-b border-graphite-100 last:border-0">
      <div
        className={cn(
          'grid items-center gap-4 rounded-xl px-3 py-3.5 transition-colors hover:bg-paper-tint',
          'grid-cols-[minmax(0,1fr)_auto_auto] xl:grid-cols-[minmax(0,2.2fr)_minmax(0,1.3fr)_minmax(0,1.1fr)_auto_auto_2.75rem]',
        )}
      >
        <div className="flex min-w-0 items-center gap-3">
          <span
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[0.8125rem] font-bold',
              agent.actif
                ? 'bg-gradient-to-br from-ink-600 to-ink-900 text-paper'
                : 'bg-graphite-200 text-graphite-500',
            )}
            aria-hidden="true"
          >
            {agent.initiales}
          </span>
          <span className="flex min-w-0 flex-col">
            <span className="flex items-center gap-2">
              <span
                className={cn(
                  'truncate text-[0.9375rem] font-semibold',
                  agent.actif ? 'text-ink-800' : 'text-graphite-500',
                )}
              >
                {agent.nom}
              </span>
              {agent.estSoi ? (
                <span className="rounded-full bg-ink-50 px-2 py-px text-[0.625rem] font-bold uppercase tracking-[0.06em] text-ink-700">
                  vous
                </span>
              ) : null}
            </span>
            <span className="truncate text-[0.8125rem] text-graphite-400">{agent.email}</span>
          </span>
        </div>

        <span className="hidden truncate text-[0.8125rem] text-graphite-500 xl:block">
          {agent.fonction || '—'}
        </span>

        <span className="hidden xl:block" title={PERIMETRES_ROLE[agent.role]}>
          <Pastille ton="encre">
            <IconShield className="h-3.5 w-3.5" />
            {LIBELLES_ROLE[agent.role]}
          </Pastille>
        </span>

        <Pastille ton={agent.actif ? 'vert' : 'neutre'} point>
          {agent.actif ? 'Actif' : 'Désactivé'}
        </Pastille>

        <span className="hidden w-20 text-right text-[0.75rem] tabular-nums text-graphite-400 xl:block">
          {agent.creeLe}
        </span>

        <div className="relative justify-self-end">
          <button
            type="button"
            aria-expanded={ouvert}
            aria-label={`Actions sur le compte de ${agent.nom}`}
            disabled={enCours || !peutAgir}
            onClick={() => setOuvert((etat) => !etat)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-transparent text-graphite-500 transition-colors hover:border-graphite-200 hover:bg-paper hover:text-ink-700 disabled:opacity-40"
          >
            <IconPoints className="h-[1.125rem] w-[1.125rem]" />
          </button>

          {ouvert ? (
            <>
              <button
                type="button"
                aria-label="Fermer le menu"
                onClick={() => setOuvert(false)}
                className="fixed inset-0 z-40 cursor-default"
              />
              <div
                role="menu"
                className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-72 rounded-2xl border border-graphite-100 bg-paper p-2 shadow-float"
              >
                <p className="px-2.5 pb-1.5 pt-2 text-[0.625rem] font-bold uppercase tracking-[0.14em] text-graphite-400">
                  Compte
                </p>

                <button
                  type="button"
                  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-left text-[0.875rem] text-graphite-700 transition-colors hover:bg-ink-50 hover:text-ink-700"
                  onClick={() => executer(() => reinitialiserMotDePasse(agent.id))}
                >
                  <IconInfo className="h-4 w-4 shrink-0 text-graphite-400" />
                  Réinitialiser le mot de passe
                </button>

                <button
                  type="button"
                  disabled={agent.estSoi && agent.actif}
                  onClick={() => executer(() => basculerActivation(agent.id, !agent.actif))}
                  className={cn(
                    'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-left text-[0.875rem] transition-colors disabled:opacity-45',
                    agent.actif
                      ? 'text-graphite-700 hover:bg-[#fbeaec] hover:text-state-danger'
                      : 'text-graphite-700 hover:bg-ink-50 hover:text-ink-700',
                  )}
                >
                  {agent.actif ? (
                    <IconClose className="h-4 w-4 shrink-0 text-graphite-400" />
                  ) : (
                    <IconCheck className="h-4 w-4 shrink-0 text-graphite-400" />
                  )}
                  {agent.actif ? 'Désactiver le compte' : 'Réactiver le compte'}
                </button>

                <p className="px-2.5 pb-1.5 pt-3 text-[0.625rem] font-bold uppercase tracking-[0.14em] text-graphite-400">
                  Attribuer un rôle
                </p>
                <div className="flex flex-wrap gap-1.5 px-2.5 pb-2">
                  {ROLES.map((role) => (
                    <button
                      key={role}
                      type="button"
                      disabled={role === agent.role}
                      onClick={() => executer(() => changerRole(agent.id, role))}
                      className={cn(
                        'rounded-full border px-2.5 py-1 text-[0.75rem] transition-colors',
                        role === agent.role
                          ? 'cursor-default border-ink-800 bg-ink-800 text-paper'
                          : 'border-graphite-200 text-graphite-600 hover:border-ink-200 hover:bg-ink-50 hover:text-ink-700',
                      )}
                    >
                      {LIBELLES_ROLE[role]}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>

      {retour ? (
        <p
          role="status"
          className={cn(
            'mx-3 mb-3 flex items-start gap-3 rounded-xl px-4 py-3 text-[0.8125rem] leading-relaxed',
            retour.ok ? 'bg-[#e8f4ee] text-[#0f5c3c]' : 'bg-gold-50 text-gold-800',
          )}
        >
          {retour.message}
          <button
            type="button"
            onClick={() => setRetour(null)}
            aria-label="Masquer ce message"
            className="ml-auto shrink-0 opacity-70"
          >
            <IconClose className="h-3.5 w-3.5" />
          </button>
        </p>
      ) : null}
    </li>
  );
}
