'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  IconArrowUpRight,
  IconBriefcase,
  IconChevronRight,
  IconFile,
  IconGraduation,
  IconQuote,
  IconTarget,
  IconTeacher,
  IconUsers,
} from '@/components/brand/icons';
import { LIBELLES_ROLE, type Role } from '@/payload/roles';
import { cn } from '@/lib/utils';

/* ==========================================================================
   Barre latérale du back-office
   --------------------------------------------------------------------------
   Les entrées sont déclarées, pas dérivées : les espaces du dispositif sont
   fixes, et une liste écrite se lit mieux qu'une liste calculée.

   Chaque entrée porte les rôles qui y ont accès. C'est un confort d'affichage,
   pas une sécurité : le contrôle réel se fait à chaque page, côté serveur
   (`exigerRole`), et une entrée masquée reste refusée si l'on force l'adresse.
   ========================================================================== */

type Entree = {
  readonly libelle: string;
  readonly href: string;
  readonly icone: typeof IconFile;
  readonly roles: readonly Role[] | 'tous';
};

type Groupe = { readonly titre: string | null; readonly entrees: readonly Entree[] };

const TOUS = 'tous' as const;

export const GROUPES: readonly Groupe[] = [
  {
    titre: null,
    entrees: [{ libelle: 'Tableau de bord', href: '/gestion', icone: IconTarget, roles: TOUS }],
  },
  {
    titre: 'Admission',
    entrees: [
      {
        libelle: 'Candidatures',
        href: '/gestion/candidatures',
        icone: IconFile,
        roles: ['administrateur', 'admission', 'scolarite', 'finances', 'consultation'],
      },
      {
        libelle: 'Comptes candidats',
        href: '/gestion/comptes',
        icone: IconUsers,
        roles: ['administrateur', 'admission', 'scolarite'],
      },
      {
        libelle: 'Pièces justificatives',
        href: '/gestion/pieces',
        icone: IconBriefcase,
        roles: ['administrateur', 'admission', 'scolarite'],
      },
    ],
  },
  {
    titre: 'Scolarité',
    entrees: [
      {
        libelle: 'Personnes',
        href: '/gestion/personnes',
        icone: IconGraduation,
        roles: ['administrateur', 'admission', 'scolarite', 'finances', 'consultation'],
      },
    ],
  },
  {
    titre: 'Éditorial',
    entrees: [
      {
        libelle: 'Publications',
        href: '/gestion/publications',
        icone: IconQuote,
        roles: ['administrateur', 'editeur', 'redacteur', 'carrieres'],
      },
    ],
  },
  {
    titre: 'Administration',
    entrees: [
      { libelle: 'Agents', href: '/gestion/agents', icone: IconTeacher, roles: ['administrateur'] },
    ],
  },
];

export function BarreLaterale({
  agent,
  deconnexion,
}: {
  agent: { readonly nomComplet: string; readonly initiales: string; readonly role: Role };
  deconnexion: () => Promise<void>;
}) {
  const chemin = usePathname();
  const [ouverte, setOuverte] = useState(false);

  const estActif = (href: string) =>
    href === '/gestion' ? chemin === '/gestion' : chemin.startsWith(href);

  const autorise = (entree: Entree) =>
    entree.roles === TOUS || entree.roles.includes(agent.role);

  return (
    <>
      {/* Ouverture sur téléphone — la barre est un tiroir en dessous de lg. */}
      <button
        type="button"
        onClick={() => setOuverte(true)}
        className="fixed left-4 top-4 z-40 flex h-11 w-11 items-center justify-center rounded-xl border border-graphite-200 bg-paper text-ink-800 shadow-raise lg:hidden"
        aria-label="Ouvrir le menu"
      >
        <IconChevronRight className="h-5 w-5" />
      </button>

      {ouverte ? (
        <button
          type="button"
          aria-label="Fermer le menu"
          onClick={() => setOuverte(false)}
          className="fixed inset-0 z-40 bg-ink-950/50 backdrop-blur-sm lg:hidden"
        />
      ) : null}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-laterale flex-col border-r border-graphite-100 bg-paper',
          'transition-transform duration-400 ease-[var(--ease-arc)] lg:translate-x-0',
          ouverte ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* ------------------------------------------------------------ Marque */}
        {/* Sur fond clair, le logo se pose enfin tel quel. Il porte du bleu
            marine et du gris, et n'avait sa plaque blanche que pour survivre
            au fond bleu de l'ancienne barre. */}
        <div className="px-5 pt-6 pb-3">
          <Link href="/gestion" className="block">
            <Image
              src="/brand/logo-horizontal.png"
              alt="FOANI International Training College"
              width={2172}
              height={724}
              sizes="200px"
              priority
              className="h-10 w-auto"
            />
          </Link>
          <p className="mt-3 text-[0.625rem] font-bold tracking-[0.24em] text-ink-700 uppercase">
            Back-office
          </p>
        </div>

        {/* ------------------------------------------------------------- Menu */}
        <nav aria-label="Navigation du back-office" className="flex-1 overflow-y-auto px-3 pb-4">
          {GROUPES.map((groupe) => {
            const entrees = groupe.entrees.filter(autorise);
            if (entrees.length === 0) return null;

            return (
              <div key={groupe.titre ?? 'principal'} className="mb-1.5">
                {groupe.titre ? (
                  <p className="px-3 pt-5 pb-2 text-[0.625rem] font-bold tracking-[0.18em] text-graphite-500 uppercase">
                    {groupe.titre}
                  </p>
                ) : null}

                <ul className="flex flex-col gap-0.5">
                  {entrees.map((entree) => {
                    const Icone = entree.icone;
                    const actif = estActif(entree.href);
                    return (
                      <li key={entree.href}>
                        <Link
                          href={entree.href}
                          onClick={() => setOuverte(false)}
                          aria-current={actif ? 'page' : undefined}
                          className={cn(
                            'relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[0.875rem] transition-colors duration-200',
                            actif
                              ? 'bg-ink-50 font-semibold text-ink-700'
                              : 'text-graphite-600 hover:bg-ink-50 hover:text-ink-700',
                          )}
                        >
                          {actif ? (
                            <span
                              aria-hidden="true"
                              className="absolute inset-y-2 -left-2 w-[3px] rounded-full bg-gold-400"
                            />
                          ) : null}
                          <Icone
                            className={cn(
                              'h-[1.125rem] w-[1.125rem] shrink-0',
                              actif ? 'text-ink-700' : 'text-graphite-400',
                            )}
                          />
                          {entree.libelle}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}

          <div className="mt-5 border-t border-graphite-100 pt-4">
            {/* Le portail public a sa propre racine de mise en page : Next
                bascule en navigation complète, ce qui est voulu. */}
            <Link
              href="/"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[0.875rem] text-graphite-600 transition-colors hover:bg-ink-50 hover:text-ink-700"
            >
              <IconArrowUpRight className="h-[1.125rem] w-[1.125rem] shrink-0" />
              Voir le portail public
            </Link>
          </div>
        </nav>

        {/* ------------------------------------------------------------ Agent */}
        {/* L'identite figure aussi dans la barre haute, mais celle-ci se reduit
            aux initiales sur telephone : ce bloc reste la seule facon d'y lire
            son role en entier. Il ne mene nulle part, l'ecran des agents etant
            reserve a l'administrateur. */}
        <div className="border-t border-graphite-100 p-4">
          <div className="flex items-center gap-3 px-2 py-2">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-ink-600 to-ink-800 text-[0.8125rem] font-bold text-paper">
              {agent.initiales}
            </span>
            <span className="flex min-w-0 flex-col leading-tight">
              <span className="truncate text-[0.875rem] font-semibold text-ink-800">
                {agent.nomComplet}
              </span>
              <span className="truncate text-[0.75rem] text-graphite-500">
                {LIBELLES_ROLE[agent.role]}
              </span>
            </span>
          </div>

          <form action={deconnexion}>
            <button
              type="submit"
              className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[0.875rem] text-graphite-600 transition-colors hover:bg-state-danger/[0.07] hover:text-state-danger"
            >
              <IconArrowUpRight className="h-[1.125rem] w-[1.125rem] shrink-0 rotate-180" />
              Fermer ma session
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
