import { IconCheck, IconClock, IconInfo } from '@/components/brand/icons';
import type { Controle, Rapport, Verdict } from '@/payload/biometrie/controles';
import { cn } from '@/lib/utils';

/* ==========================================================================
   Le rapport du contrôle automatique — Note complémentaire §5.4
   --------------------------------------------------------------------------
   Le même rapport est lu par deux personnes qui n'en attendent pas la même
   chose : le candidat veut savoir quoi refaire, l'agent veut savoir sur quoi
   il s'engage. D'où un composant unique et un paramètre — les chiffres sont
   montrés à l'agent, et tus au candidat.

   Pourquoi les taire au candidat : un score de similarité de 74 % ne lui
   apprend rien qu'il puisse corriger, et lui apprend en revanche exactement de
   combien il doit s'écarter pour passer. Le message lui dit quoi refaire ; le
   chiffre reste à l'agent, à qui il sert à décider.
   ========================================================================== */

const TONS: Record<Verdict, { readonly cadre: string; readonly pastille: string }> = {
  conforme: {
    cadre: 'border-state-success/25 bg-state-success/[0.05]',
    pastille: 'bg-state-success text-paper',
  },
  'a-verifier': {
    cadre: 'border-gold-200 bg-gold-50',
    pastille: 'bg-gold-400 text-ink-900',
  },
  refuse: {
    cadre: 'border-state-danger/25 bg-state-danger/[0.05]',
    pastille: 'bg-state-danger text-paper',
  },
  indisponible: {
    cadre: 'border-graphite-200 bg-paper-tint',
    pastille: 'bg-graphite-300 text-graphite-600',
  },
};

function Icone({ verdict }: { verdict: Verdict }) {
  if (verdict === 'conforme') return <IconCheck className="h-3 w-3" />;
  if (verdict === 'indisponible') return <IconClock className="h-3 w-3" />;
  return <IconInfo className="h-3 w-3" />;
}

export function RapportControle({
  rapport,
  avecScores = false,
}: {
  rapport: Rapport | null;
  /** Les chiffres ne sont montrés qu'à l'agent. */
  avecScores?: boolean;
}) {
  if (!rapport) return null;

  if (rapport.fournisseur === null) {
    return (
      <p className="rounded-xl border border-graphite-200 bg-paper-tint p-4 text-[0.8125rem] leading-relaxed text-graphite-600">
        Aucun service de reconnaissance n’est configuré&nbsp;: le contrôle repose entièrement sur
        l’agent. Tant qu’il en va ainsi, le dispositif ne vérifie ni les visages ni le contenu des
        pièces.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2.5">
      {rapport.controles.map((controle: Controle) => {
        const ton = TONS[controle.verdict];
        return (
          <div
            key={controle.cle}
            className={cn('flex items-start gap-3 rounded-xl border p-3.5', ton.cadre)}
          >
            <span
              aria-hidden="true"
              className={cn(
                'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full',
                ton.pastille,
              )}
            >
              <Icone verdict={controle.verdict} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="flex flex-wrap items-baseline gap-x-2.5 text-[0.875rem] font-semibold text-ink-800">
                {controle.libelle}
                {avecScores && typeof controle.score === 'number' ? (
                  <span className="font-display text-[0.8125rem] font-normal text-graphite-500 tabular-nums">
                    {controle.score}
                    {controle.cle.includes('portrait') || controle.cle === 'porteur' ? ' %' : ''}
                  </span>
                ) : null}
              </p>
              <p className="mt-0.5 text-[0.8125rem] leading-relaxed text-graphite-600">
                {controle.detail}
              </p>
            </div>
          </div>
        );
      })}

      {avecScores ? (
        <p className="text-[0.75rem] leading-relaxed text-graphite-400">
          Contrôle effectué par {rapport.fournisseur}, le{' '}
          {new Date(rapport.faitLe).toLocaleString('fr-FR')}. Ces chiffres éclairent votre décision,
          ils ne la remplacent pas.
        </p>
      ) : null}
    </div>
  );
}
