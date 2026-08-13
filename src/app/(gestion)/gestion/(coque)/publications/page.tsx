import type { Metadata } from 'next';
import Link from 'next/link';
import { IconArrowRight, IconCheck, IconClock, IconFile, IconQuote } from '@/components/brand/icons';
import { EnTetePage, Pastille, Tuile, Vide } from '@/components/gestion/ui';
import { exigerRole, socle } from '@/lib/session';
import { formatDate } from '@/lib/etats';
import {
  RUBRIQUES,
  etatEditorial,
  etatsDeLaVueEditoriale,
  rubrique as lireRubrique,
  VUES_EDITORIALES,
  type CleRubrique,
} from '@/lib/publications';
import { peutPublier } from '@/payload/publication';
import { cn } from '@/lib/utils';

export const metadata: Metadata = { title: 'Publications' };

const ROLES_EDITORIAUX = ['administrateur', 'editeur', 'redacteur', 'carrieres'] as const;

/** Le champ qui sert de titre, selon la rubrique. */
const TITRE: Record<CleRubrique, string> = {
  actualites: 'titre',
  evenements: 'titre',
  offres: 'intitule',
};

/**
 * Liste des contenus éditoriaux.
 *
 * L'écran est organisé autour d'une question : qu'est-ce qui attend quelqu'un ?
 * D'où les quatre compteurs en tête, et le filtre « À relire » mis en premier —
 * c'est l'état qui bloque une publication, et celui qu'un éditeur vient
 * chercher en arrivant.
 */
export default async function PagePublications({
  searchParams,
}: {
  searchParams: Promise<{ rubrique?: string; vue?: string }>;
}) {
  const agent = await exigerRole([...ROLES_EDITORIAUX]);
  const { rubrique: demandee, vue = 'tous' } = await searchParams;

  const courante = lireRubrique(demandee);
  const payload = await socle();
  const etats = etatsDeLaVueEditoriale(vue);

  const { docs } = await payload.find({
    collection: courante.cle,
    where: etats ? { etat: { in: etats } } : {},
    sort: '-updatedAt',
    limit: 100,
    depth: 0,
    overrideAccess: true,
  });

  // Les compteurs portent sur la rubrique affichée, pas sur l'ensemble : c'est
  // le nombre d'actualités à relire qui intéresse, pas un total composite.
  const comptes = await Promise.all(
    VUES_EDITORIALES.filter((item) => item.etats).map(async (item) => {
      const { totalDocs } = await payload.count({
        collection: courante.cle,
        where: { etat: { in: item.etats! } },
        overrideAccess: true,
      });
      return [item.cle, totalDocs] as const;
    }),
  );
  const parVue = Object.fromEntries(comptes) as Record<string, number>;

  const publie = peutPublier(agent.role);

  return (
    <>
      <EnTetePage
        surtitre="Éditorial"
        titre="Publications"
        resume={
          publie
            ? 'Vous pouvez écrire, relire et mettre en ligne. Ce que vous publiez ici est visible du public immédiatement.'
            : 'Vous pouvez écrire et soumettre. Un éditeur relira avant la mise en ligne.'
        }
        actions={
          <Link href={`/gestion/publications/${courante.cle}/nouveau`} className="bouton bouton--principal">
            Rédiger : {courante.singulier.toLowerCase()}
          </Link>
        }
      />

      {/* ------------------------------------------------------- Les rubriques */}
      <nav aria-label="Rubriques" className="mt-7 flex flex-wrap gap-2">
        {RUBRIQUES.map((item) => (
          <Link
            key={item.cle}
            href={`/gestion/publications?rubrique=${item.cle}`}
            aria-current={item.cle === courante.cle ? 'page' : undefined}
            className={cn(
              'rounded-xl border px-4 py-2.5 text-[0.875rem] font-semibold transition-colors',
              item.cle === courante.cle
                ? 'border-ink-700 bg-ink-700 text-paper'
                : 'border-graphite-200 bg-paper text-graphite-700 hover:border-ink-300 hover:text-ink-700',
            )}
          >
            {item.libelle}
          </Link>
        ))}
      </nav>

      <p className="mt-3 text-[0.875rem] text-graphite-500">{courante.aide}</p>

      {/* --------------------------------------------------------- Compteurs */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Tuile
          ton="ambre"
          etiquette="À relire"
          valeur={parVue['a-valider'] ?? 0}
          detail="En attente d’un éditeur"
          icone={<IconClock className="h-5 w-5" />}
          href={`/gestion/publications?rubrique=${courante.cle}&vue=a-valider`}
        />
        <Tuile
          ton="clair"
          etiquette="Brouillons"
          valeur={parVue['brouillon'] ?? 0}
          detail="En cours d’écriture"
          icone={<IconFile className="h-5 w-5" />}
          href={`/gestion/publications?rubrique=${courante.cle}&vue=brouillon`}
        />
        <Tuile
          ton="profond"
          etiquette="En ligne"
          valeur={parVue['publie'] ?? 0}
          detail="Visibles du public"
          icone={<IconCheck className="h-5 w-5" />}
          href={`/gestion/publications?rubrique=${courante.cle}&vue=publie`}
        />
        <Tuile
          ton="clair"
          etiquette="Archivés"
          valeur={parVue['archive'] ?? 0}
          detail="Retirés du site"
          icone={<IconQuote className="h-5 w-5" />}
          href={`/gestion/publications?rubrique=${courante.cle}&vue=archive`}
        />
      </div>

      {/* ------------------------------------------------------------ Filtres */}
      <nav aria-label="Filtrer par état" className="mt-8 flex flex-wrap gap-2">
        {VUES_EDITORIALES.map((item) => (
          <Link
            key={item.cle}
            href={`/gestion/publications?rubrique=${courante.cle}&vue=${item.cle}`}
            aria-current={item.cle === vue ? 'page' : undefined}
            className={cn(
              'rounded-full border px-3.5 py-1.5 text-[0.8125rem] font-semibold transition-colors',
              item.cle === vue
                ? 'border-ink-800 bg-ink-800 text-paper'
                : 'border-graphite-200 bg-paper text-graphite-600 hover:border-ink-300 hover:text-ink-700',
            )}
          >
            {item.libelle}
          </Link>
        ))}
      </nav>

      {/* -------------------------------------------------------------- Liste */}
      {docs.length === 0 ? (
        <Vide
          titre="Rien ici pour l’instant"
          corps={
            vue === 'tous'
              ? `Aucun contenu dans « ${courante.libelle} ». Le bouton en haut à droite en crée un.`
              : 'Aucun contenu dans cet état. Essayez un autre filtre.'
          }
          action={{
            libelle: `Rédiger : ${courante.singulier.toLowerCase()}`,
            href: `/gestion/publications/${courante.cle}/nouveau`,
          }}
        />
      ) : (
        <ul className="mt-6 flex flex-col gap-2.5">
          {docs.map((doc) => {
            const contenu = doc as unknown as Record<string, unknown>;
            const etat = etatEditorial(String(contenu.etat));
            const titre = String(contenu[TITRE[courante.cle]] ?? 'Sans titre');

            return (
              <li key={String(contenu.id)}>
                <Link
                  href={`/gestion/publications/${courante.cle}/${contenu.id}`}
                  className="carte group/ligne flex flex-wrap items-center gap-x-5 gap-y-3 p-4 transition-colors hover:border-ink-100 sm:p-5"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ink-50 text-ink-700">
                    <IconQuote className="h-[1.125rem] w-[1.125rem]" />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block text-[0.9375rem] font-semibold text-ink-800">{titre}</span>
                    <span className="mt-0.5 block text-[0.8125rem] text-graphite-500">
                      {courante.cle === 'offres' && contenu.structure
                        ? `${contenu.structure} — clôture le ${formatDate(String(contenu.dateLimite))}`
                        : `Modifié le ${formatDate(String(contenu.updatedAt), true)}`}
                    </span>
                  </span>

                  <Pastille ton={etat.ton} point>
                    {etat.libelle}
                  </Pastille>

                  <IconArrowRight className="h-4 w-4 shrink-0 text-graphite-300 transition-transform duration-200 group-hover/ligne:translate-x-0.5 group-hover/ligne:text-ink-700" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
