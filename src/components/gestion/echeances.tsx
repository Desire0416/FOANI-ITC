'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import { IconArrowRight, IconClock, IconInfo } from '@/components/brand/icons';
import { constaterLesDesistements, type Balayage } from '@/payload/actions/echeances';
import { JOURS_ACCEPTATION } from '@/payload/chaine';

/* ==========================================================================
   Échéances et places libérées — RG-45 et §3.4
   --------------------------------------------------------------------------
   Deux informations que l'admission ne voyait pas, et qui coûtent des
   inscriptions :

   — des offres dont le délai est expiré. Tant qu'on ne les constate pas, elles
     gèlent une place jusqu'à la rentrée ;
   — des candidats en liste d'attente, à qui ces places pourraient revenir.
     « Sans ce mécanisme, les places non confirmées restent gelées jusqu'à la
     rentrée et l'établissement perd des inscriptions qu'il aurait pu
     réaliser. » (§3.4)

   Le bouton ne fait rien qu'une tâche planifiée ne ferait : il rend le
   balayage utilisable avant qu'elle ne soit branchée, et laisse à l'agent la
   possibilité de le déclencher quand il en a besoin.
   ========================================================================== */

export function Echeances({
  expirees,
  enAttente,
  liberees,
}: {
  /** Offres dont le délai d'acceptation est dépassé. */
  expirees: number;
  /** Dossiers en liste d'attente, susceptibles de remonter. */
  enAttente: number;
  /** Places libérées : désistements et annulations. */
  liberees: number;
}) {
  const [retour, setRetour] = useState<Balayage | null>(null);
  const [enCours, demarrer] = useTransition();

  if (expirees === 0 && enAttente === 0) return null;

  return (
    <section className="carte overflow-hidden">
      <header className="border-b border-graphite-100 bg-paper-tint px-5 py-4">
        <h2 className="text-[1.0625rem] leading-tight">Places et échéances</h2>
        <p className="mt-0.5 text-[0.8125rem] text-graphite-500">
          Une offre non confirmée gèle une place. Un candidat en attente peut la reprendre.
        </p>
      </header>

      <div className="flex flex-col gap-4 p-5 sm:p-6">
        {expirees > 0 ? (
          <div className="rounded-xl border border-gold-200 bg-gold-50 p-4">
            <p className="flex items-start gap-2.5 text-[0.9375rem] font-semibold text-gold-800">
              <IconClock aria-hidden="true" className="mt-0.5 h-[1.125rem] w-[1.125rem] shrink-0" />
              {expirees} offre{expirees > 1 ? 's' : ''} a{expirees > 1 ? 'ont' : ''} dépassé le délai
              de {JOURS_ACCEPTATION} jours
            </p>
            <p className="mt-1.5 pl-7 text-[0.8125rem] leading-relaxed text-gold-800">
              L’expiration vaut désistement : la place est rendue à la liste d’attente. Le motif et
              la date rejoignent l’historique de chaque dossier.
            </p>

            <button
              type="button"
              disabled={enCours}
              onClick={() =>
                demarrer(async () => setRetour(await constaterLesDesistements()))
              }
              className="bouton bouton--principal mt-4 ml-7 h-10 px-4 text-[0.8125rem]"
            >
              {enCours
                ? 'Constatation…'
                : `Constater ${expirees > 1 ? 'les désistements' : 'le désistement'}`}
            </button>
          </div>
        ) : null}

        {retour ? (
          <p
            role="status"
            className="flex items-start gap-2.5 rounded-xl border border-ink-100 bg-ink-50 p-3.5 text-[0.875rem] leading-relaxed text-ink-800"
          >
            <IconInfo aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
            {retour.message}
          </p>
        ) : null}

        {enAttente > 0 ? (
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3 rounded-xl border border-graphite-200 bg-paper p-4">
            <span className="min-w-0 flex-1">
              <span className="block text-[0.9375rem] font-semibold text-ink-800">
                {enAttente} dossier{enAttente > 1 ? 's' : ''} en liste d’attente
              </span>
              <span className="mt-0.5 block text-[0.8125rem] leading-snug text-graphite-500">
                {liberees > 0
                  ? `${liberees} place${liberees > 1 ? 's' : ''} libérée${liberees > 1 ? 's' : ''} par désistement ou annulation. Vous pouvez faire remonter un candidat.`
                  : 'Aucune place libérée pour l’instant.'}
              </span>
            </span>

            <Link
              href="/gestion/candidatures?vue=attente"
              className="bouton bouton--contour h-10 px-4 text-[0.8125rem]"
            >
              Voir la liste d’attente
              <IconArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}
