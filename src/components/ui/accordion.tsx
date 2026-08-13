'use client';

import { useState, type ReactNode } from 'react';
import { IconChevronDown } from '@/components/brand/icons';
import { cn } from '@/lib/utils';

/**
 * Accordéon.
 *
 * Le contenu est présent dans le DOM même replié : il reste trouvable par la
 * recherche du navigateur et par les moteurs, et le repli n'est qu'un moyen
 * de tenir la page à une longueur lisible sur téléphone.
 */
export type ElementAccordeon = {
  readonly id: string;
  readonly titre: ReactNode;
  readonly contenu: ReactNode;
};

export function Accordion({
  elements,
  defautOuvert = 0,
  tone = 'paper',
}: {
  elements: readonly ElementAccordeon[];
  /** Index ouvert au chargement, ou `null` pour tout replier. */
  defautOuvert?: number | null;
  tone?: 'paper' | 'tint';
}) {
  const [ouvert, setOuvert] = useState<number | null>(defautOuvert);

  return (
    <div className="flex flex-col gap-3">
      {elements.map((element, index) => {
        const deploye = ouvert === index;
        return (
          <div
            key={element.id}
            className={cn(
              'overflow-hidden rounded-card-lg border transition-colors duration-300',
              deploye ? 'border-ink-100' : 'border-graphite-100',
              tone === 'tint' ? 'bg-paper-tint' : 'bg-paper',
            )}
          >
            <h3>
              <button
                type="button"
                aria-expanded={deploye}
                aria-controls={`panneau-${element.id}`}
                id={`titre-${element.id}`}
                onClick={() => setOuvert(deploye ? null : index)}
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
              >
                <span className="font-display text-[1.0625rem] font-semibold leading-snug text-ink-800">
                  {element.titre}
                </span>
                <span
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-pill transition-all duration-400 ease-[var(--ease-arc)]',
                    deploye ? '[transform:rotate(180deg)] bg-ink-800 text-paper' : 'bg-ink-50 text-ink-700',
                  )}
                >
                  <IconChevronDown className="h-4 w-4" />
                </span>
              </button>
            </h3>
            <div
              id={`panneau-${element.id}`}
              role="region"
              aria-labelledby={`titre-${element.id}`}
              className={cn(
                'grid transition-[grid-template-rows] duration-400 ease-[var(--ease-arc)]',
                deploye ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
              )}
            >
              <div className="overflow-hidden">
                <div className="px-6 pb-6 text-[0.9375rem] leading-relaxed text-graphite-600">
                  {element.contenu}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
