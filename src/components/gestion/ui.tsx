import Link from 'next/link';
import type { ReactNode } from 'react';
import { IconArrowRight } from '@/components/brand/icons';
import { cn } from '@/lib/utils';

/* ==========================================================================
   Pièces propres au back-office
   --------------------------------------------------------------------------
   L'en-tête de page, la tuile, l'état vide et la pastille ont quitté ce
   fichier pour `@/components/commun/ui` : l'espace du candidat s'en sert
   désormais aussi. Ils sont réexportés ici pour que les écrans de gestion
   continuent de les importer là où ils les ont toujours trouvés.

   Ne reste en propre que la carte, dont le candidat a sa propre version : la
   sienne porte un chapô d'aide, celle-ci un lien de renvoi. Les confondre
   ferait une carte à six propriétés dont chaque écran n'en emploie que deux.
   ========================================================================== */

export { EnTetePage, Tuile, Vide, Pastille } from '@/components/commun/ui';
export type { TonTuile } from '@/components/commun/ui';

export function Carte({
  titre,
  mention,
  lien,
  children,
  className,
}: {
  titre?: string;
  mention?: string;
  lien?: { readonly libelle: string; readonly href: string };
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('carte p-5 lg:p-6', className)}>
      {titre ? (
        <header className="mb-5 flex items-center justify-between gap-4">
          <h2 className="text-[1.125rem] leading-snug">{titre}</h2>
          {mention ? <span className="text-[0.75rem] text-graphite-400">{mention}</span> : null}
          {lien ? (
            <Link
              href={lien.href}
              className="group/lien inline-flex items-center gap-1.5 text-[0.8125rem] font-semibold text-ink-700 transition-colors hover:text-ink-600"
            >
              {lien.libelle}
              <IconArrowRight className="h-3.5 w-3.5 transition-transform duration-300 ease-[var(--ease-arc)] group-hover/lien:translate-x-0.5" />
            </Link>
          ) : null}
        </header>
      ) : null}
      {children}
    </section>
  );
}

