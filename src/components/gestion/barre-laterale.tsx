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
      { libelle: 'Agents', href: '/gestion/agents', icone: IconTeacher, roles: TOUS },
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
          'fixed inset-y-0 left-0 z-50 flex w-laterale flex-col bg-ink-900 text-ink-100',
          'transition-transform duration-400 ease-[var(--ease-arc)] lg:translate-x-0',
          ouverte ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* ------------------------------------------------------------ Marque */}
        {/* Le logo porte du bleu marine et du gris : il ne se pose pas sur un
            fond bleu. On lui donne sa plaque blanche, comme sur un document
            officiel de l'établissement. */}
        <div className="px-4 pb-2 pt-5">
          <Link href="/gestion" className="block rounded-2xl bg-paper px-4 py-3.5">
            <Image
              src="/brand/logo-horizontal.png"
              alt="FOANI International Training College"
              width={2172}
              height={724}
              sizes="200px"
              priority
              className="h-9 w-auto"
            />
          </Link>
          <p className="mt-3 px-1 text-[0.625rem] font-bold uppercase tracking-[0.24em] text-gold-400">
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
                  <p className="px-3 pb-2 pt-5 text-[0.625rem] font-bold uppercase tracking-[0.18em] text-ink-400">
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
                              ? 'bg-paper/12 font-semibold text-paper'
                              : 'text-ink-200 hover:bg-paper/[0.07] hover:text-paper',
                          )}
                        >
                          {actif ? (
                            <span
                              aria-hidden="true"
                              className="absolute inset-y-2 left-0 w-[3px] rounded-full bg-gold-400"
                            />
                          ) : null}
                          <Icone
                            className={cn('h-[1.125rem] w-[1.125rem] shrink-0', actif && 'text-gold-400')}
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

          <div className="mt-5 border-t border-paper/10 pt-4">
            {/* Le portail public a sa propre racine de mise en page : Next
                bascule en navigation complète, ce qui est voulu. */}
            <Link
              href="/"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[0.875rem] text-ink-200 transition-colors hover:bg-paper/[0.07] hover:text-paper"
            >
              <IconArrowUpRight className="h-[1.125rem] w-[1.125rem] shrink-0" />
              Voir le portail public
            </Link>
          </div>
        </nav>

        {/* ------------------------------------------------------------ Agent */}
        <div className="border-t border-paper/10 p-4">
          <Link
            href="/gestion/agents"
            className="flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-paper/[0.07]"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-ink-600 to-ink-800 text-[0.8125rem] font-bold text-paper">
              {agent.initiales}
            </span>
            <span className="flex min-w-0 flex-col leading-tight">
              <span className="truncate text-[0.875rem] font-semibold text-paper">
                {agent.nomComplet}
              </span>
              <span className="truncate text-[0.75rem] text-ink-300">
                {LIBELLES_ROLE[agent.role]}
              </span>
            </span>
          </Link>

          <form action={deconnexion}>
            <button
              type="submit"
              className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[0.875rem] text-ink-300 transition-colors hover:bg-paper/[0.07] hover:text-paper"
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
