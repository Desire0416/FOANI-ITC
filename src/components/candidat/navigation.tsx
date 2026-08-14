'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  IconArrowUpRight,
  IconBriefcase,
  IconFile,
  IconGraduation,
  IconTarget,
  IconUsers,
} from '@/components/brand/icons';
import { CLASSES_PASTILLE, type TonPastille } from '@/lib/etats';
import { rubriqueDuChemin, type CleRubrique, type Rubrique } from '@/lib/espace-candidat';
import { cn } from '@/lib/utils';

/* ==========================================================================
   La navigation de l'espace personnel
   --------------------------------------------------------------------------
   Trois pièces, deux géométries. Une barre latérale à partir de 1024 px, une
   barre d'onglets fixée en bas en dessous, et une barre haute commune.

   Pourquoi pas le tiroir du back-office, qui existe déjà et qu'il aurait
   suffi de recopier. Trois raisons, toutes d'usage :

   1. Un agent ouvre douze écrans par jour et sait qu'un menu existe. Un
      candidat en ouvre trois en trois semaines : une navigation cachée
      derrière un bouton est, pour lui, une navigation qui n'existe pas.
   2. Un tiroir suppose un état, donc l'hydratation. Sur le réseau visé
      (§18.2), une navigation qui attend le lot de scripts est une navigation
      qui peut ne jamais arriver. Ces barres sont du HTML ; elles ne sont
      clientes que pour connaître le chemin courant.
   3. Le bouton d'ouverture du tiroir est en haut à gauche — hors de portée du
      pouce sur le téléphone tenu à une main qui est l'appareil visé.

   Aucune de ces trois raisons ne vaut pour un agent devant un écran fixe. Les
   deux espaces divergent donc ici, et se ressemblent partout ailleurs.
   ========================================================================== */

const ICONES: Record<CleRubrique, typeof IconFile> = {
  espace: IconTarget,
  candidature: IconFile,
  inscription: IconUsers,
  scolarite: IconGraduation,
  documents: IconBriefcase,
  paiements: IconTarget,
  compte: IconUsers,
};

/** Une rubrique est active sur son propre chemin et sur ceux qu'elle couvre. */
function estActive(rubrique: Rubrique, chemin: string): boolean {
  if (rubrique.cle === 'espace') return chemin === '/mon-dossier';
  if (chemin.startsWith(rubrique.href)) return true;
  return rubrique.actifSur.some((prefixe) => chemin.startsWith(prefixe));
}

/* -------------------------------------------------------- Barre latérale */

export function BarreLaterale({
  rubriques,
  deconnexion,
}: {
  rubriques: readonly Rubrique[];
  deconnexion: () => Promise<void>;
}) {
  const chemin = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-laterale flex-col border-r border-graphite-100 bg-paper lg:flex">
      <div className="px-5 pt-6 pb-3">
        <Link href="/mon-dossier" className="block">
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
          Mon espace
        </p>
      </div>

      {/* Pas de groupes titrés : cinq entrées ne se sous-divisent pas. Le
          back-office en a besoin pour douze ; ici ce serait du bruit. */}
      <nav aria-label="Navigation de mon espace" className="flex-1 overflow-y-auto px-3 pb-4">
        <ul className="flex flex-col gap-0.5">
          {rubriques.map((rubrique) => {
            const Icone = ICONES[rubrique.cle];
            const actif = estActive(rubrique, chemin);
            return (
              <li key={rubrique.cle}>
                <Link
                  href={rubrique.href}
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
                  {rubrique.libelle}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Les liens que portait le pied de coque disparu. Ils ne sont pas
            décoratifs : c'est ici que le candidat va chercher de l'aide. */}
        <div className="mt-5 flex flex-col gap-0.5 border-t border-graphite-100 pt-4">
          <Lien href="/admissions" libelle="Comment s’inscrire" />
          <Lien href="/contact" libelle="Nous écrire" />
          <Lien href="/" libelle="Site de l’école" />
        </div>
      </nav>

      <div className="border-t border-graphite-100 p-3">
        <form action={deconnexion}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[0.875rem] text-graphite-600 transition-colors hover:bg-state-danger/[0.07] hover:text-state-danger"
          >
            <IconArrowUpRight className="h-[1.125rem] w-[1.125rem] shrink-0 rotate-180" />
            Fermer ma session
          </button>
        </form>
      </div>
    </aside>
  );
}

function Lien({ href, libelle }: { href: string; libelle: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[0.875rem] text-graphite-600 transition-colors hover:bg-ink-50 hover:text-ink-700"
    >
      <IconArrowUpRight className="h-[1.125rem] w-[1.125rem] shrink-0" />
      {libelle}
    </Link>
  );
}

/* ------------------------------------------------------------ Barre basse */

export function BarreBasse({ rubriques }: { rubriques: readonly Rubrique[] }) {
  const chemin = usePathname();

  return (
    <nav
      aria-label="Navigation de mon espace"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-graphite-100 bg-paper pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <ul className="flex">
        {rubriques.map((rubrique) => {
          const Icone = ICONES[rubrique.cle];
          const actif = estActive(rubrique, chemin);
          return (
            <li key={rubrique.cle} className="flex-1">
              <Link
                href={rubrique.href}
                aria-current={actif ? 'page' : undefined}
                className="flex h-16 flex-col items-center justify-center gap-1 px-1"
              >
                <span
                  className={cn(
                    'flex h-7 w-12 items-center justify-center rounded-full transition-colors duration-200',
                    actif ? 'bg-ink-50 text-ink-700' : 'text-graphite-400',
                  )}
                >
                  <Icone className="h-[1.125rem] w-[1.125rem]" />
                </span>
                <span
                  className={cn(
                    'text-[0.625rem] font-semibold',
                    actif ? 'text-ink-700' : 'text-graphite-500',
                  )}
                >
                  {rubrique.court}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/* ------------------------------------------------------------ Barre haute */

export function BarreHaute({
  rubriques,
  reference,
  etatLibelle,
  etatTon,
}: {
  rubriques: readonly Rubrique[];
  reference: string | null;
  etatLibelle: string | null;
  etatTon: TonPastille;
}) {
  const chemin = usePathname();
  /* On cherche d'abord dans les rubriques visibles, puis dans toutes : une
     page atteinte hors de sa phase — par un lien, un favori, un retour en
     arrière — doit tout de même dire son nom, plutôt que se présenter comme
     l'accueil. */
  const courante =
    rubriques.find((rubrique) => estActive(rubrique, chemin)) ?? rubriqueDuChemin(chemin);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-graphite-100 bg-paper px-5 lg:gap-5 lg:px-8">
      {/* Sous 1024 px l'aside est absente : sans cela la marque disparaîtrait
          de l'espace entier, et le candidat ne saurait plus chez qui il est. */}
      <Link href="/mon-dossier" className="shrink-0 lg:hidden">
        <Image
          src="/brand/logo-horizontal.png"
          alt="FOANI International Training College"
          width={2172}
          height={724}
          sizes="160px"
          priority
          className="h-7 w-auto"
        />
      </Link>

      <p className="hidden shrink-0 truncate text-[0.9375rem] font-semibold text-ink-800 lg:block">
        {courante?.libelle ?? 'Mon espace'}
      </p>

      {/* Ni recherche, ni cloche, ni avatar : le candidat n'a rien à chercher
          et pas de file d'attente. Les deux seules informations qu'il cite au
          téléphone et cherche des yeux en revenant sont son numéro et son
          état — ce sont exactement celles-là. */}
      <div className="ml-auto flex min-w-0 items-center gap-2.5">
        {reference ? (
          <p className="hidden items-center gap-2 rounded-xl border border-graphite-200 bg-paper-tint px-3 py-1.5 sm:flex">
            <IconFile aria-hidden="true" className="h-4 w-4 shrink-0 text-ink-700" />
            <span className="text-[0.6875rem] text-graphite-500">
              Dossier
              <span className="ml-1.5 font-display text-[0.875rem] text-ink-800 tabular-nums">
                {reference}
              </span>
            </span>
          </p>
        ) : null}

        {etatLibelle ? (
          <p className={cn('pastille shrink-0', CLASSES_PASTILLE[etatTon])}>
            <span className="pastille__point" aria-hidden="true" />
            <span className="truncate">{etatLibelle}</span>
          </p>
        ) : null}
      </div>
    </header>
  );
}
