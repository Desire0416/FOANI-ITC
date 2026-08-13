import Link from 'next/link';
import { IconCheck } from '@/components/brand/icons';
import { ETAPES, etapeFaite, type IdEtape } from '@/lib/etapes-dossier';
import { cn } from '@/lib/utils';
import type { Candidature } from '@/payload-types';

/* ==========================================================================
   Rail des six étapes
   --------------------------------------------------------------------------
   Le candidat doit voir en permanence où il en est et ce qu'il lui reste :
   c'est ce qui permet de s'arrêter et de revenir sans crainte de perdre sa
   saisie (§10.1, « le brouillon est enregistré automatiquement »).

   Aucune étape n'est verrouillée. Le CDC ne demande pas un tunnel, et forcer
   l'ordre coûterait cher à qui n'a pas ses documents sous la main au moment
   où il commence.
   ========================================================================== */

export function Rail({ dossier, courante }: { dossier: Candidature | null; courante: IdEtape }) {
  return (
    <nav aria-label="Étapes du dossier" className="rail min-w-0 overflow-x-auto lg:overflow-visible">
      <ol className="flex min-w-max gap-2 lg:min-w-0 lg:flex-col lg:gap-1">
        {ETAPES.map((etape) => {
          const active = etape.id === courante;
          const faite = dossier ? etapeFaite(etape.id, dossier) : false;

          return (
            <li key={etape.id} className="lg:w-full">
              <Link
                href={etape.href}
                aria-current={active ? 'step' : undefined}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors duration-200 lg:w-full',
                  active
                    ? 'bg-ink-700 text-paper'
                    : 'text-graphite-600 hover:bg-ink-50 hover:text-ink-700',
                )}
              >
                <span
                  className={cn(
                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-display text-[0.75rem]',
                    active
                      ? 'bg-gold-400 text-ink-900'
                      : faite
                        ? 'bg-state-success text-paper'
                        : 'bg-graphite-200 text-graphite-600',
                  )}
                >
                  {faite && !active ? <IconCheck className="h-3.5 w-3.5" /> : etape.numero}
                </span>

                <span className="min-w-0">
                  <span className="block text-[0.875rem] font-semibold whitespace-nowrap lg:whitespace-normal">
                    {etape.libelle}
                  </span>
                  <span
                    className={cn(
                      'hidden text-[0.75rem] leading-snug lg:block',
                      active ? 'text-ink-200' : 'text-graphite-500',
                    )}
                  >
                    {etape.resume}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
