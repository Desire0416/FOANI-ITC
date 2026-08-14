import type { Metadata } from 'next';
import Link from 'next/link';
import { IconArrowUpRight, IconSearch } from '@/components/brand/icons';
import { Carte, EnTetePage, Pastille, Vide } from '@/components/gestion/ui';
import { CYCLE_LABELS, getFormation, titreComplet } from '@/content/formations';
import { etat as lireEtat, etatsDeLaVue, formatDate, VUES } from '@/lib/etats';
import { exigerRole, socle } from '@/lib/session';
import { cn } from '@/lib/utils';
import { ROLES_DOSSIERS } from '@/payload/roles';

export const metadata: Metadata = { title: 'Candidatures' };

type Parametres = { readonly vue?: string; readonly q?: string; readonly etat?: string };

/**
 * Liste des candidatures — CDC §10.3.
 *
 * « Liste des candidatures filtrable par formation, session, état, date et
 * complétude du dossier. » Les filtres sont dans l'adresse, pas dans un état
 * local : une vue se partage entre collègues par simple copie du lien, et le
 * retour arrière du navigateur fonctionne.
 */
export default async function PageCandidatures({
  searchParams,
}: {
  searchParams: Promise<Parametres>;
}) {
  // Un dossier porte le nom, la date de naissance et le telephone d'une
  // personne. Une session ne suffit pas : il faut un role qui en ait besoin
  // (§5.2). Les roles editoriaux et carrieres n'en font pas partie.
  await exigerRole(ROLES_DOSSIERS);
  const parametres = await searchParams;
  const payload = await socle();

  const vueCourante = parametres.vue ?? (parametres.etat ? 'tous' : 'tous');
  const etatsVue = parametres.etat ? [parametres.etat] : etatsDeLaVue(vueCourante);
  const recherche = parametres.q?.trim() ?? '';

  const conditions: Record<string, unknown>[] = [{ etat: { not_equals: 'brouillon' } }];
  if (etatsVue) conditions.push({ etat: { in: etatsVue } });
  if (recherche) {
    conditions.push({
      or: [
        { nomCandidat: { like: recherche } },
        { reference: { like: recherche } },
        { referenceTransaction: { like: recherche } },
      ],
    });
  }

  const resultat = await payload
    .find({
      collection: 'candidatures',
      where: { and: conditions } as never,
      sort: '-updatedAt',
      limit: 100,
      depth: 0,
      overrideAccess: true,
    })
    .catch(() => ({ docs: [] as unknown[], totalDocs: 0 }));

  // Compte par vue, pour que les onglets portent leur volume.
  const comptes = await Promise.all(
    VUES.map(async (vue) => {
      const filtres: Record<string, unknown>[] = [{ etat: { not_equals: 'brouillon' } }];
      if (vue.etats) filtres.push({ etat: { in: vue.etats } });
      const total = await payload
        .count({ collection: 'candidatures', where: { and: filtres } as never, overrideAccess: true })
        .then((r) => r.totalDocs)
        .catch(() => 0);
      return { cle: vue.cle, total };
    }),
  );

  return (
    <div className="flex flex-col gap-6">
      <EnTetePage
        surtitre="Admission"
        titre="Candidatures"
        resume="Les dossiers déposés depuis le portail. Un dossier n’est jamais supprimé : il change d’état, et chaque décision conserve son auteur et sa date."
      />

      {/* --------------------------------------------------------- Filtres */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          {VUES.map((vue) => {
            const actif = !parametres.etat && vueCourante === vue.cle;
            const total = comptes.find((compte) => compte.cle === vue.cle)?.total ?? 0;
            return (
              <Link
                key={vue.cle}
                href={vue.cle === 'tous' ? '/gestion/candidatures' : `/gestion/candidatures?vue=${vue.cle}`}
                className={cn(
                  'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[0.8125rem] font-semibold transition-colors',
                  actif
                    ? 'border-ink-800 bg-ink-800 text-paper'
                    : 'border-graphite-200 bg-paper text-graphite-600 hover:border-ink-300 hover:text-ink-700',
                )}
              >
                {vue.libelle}
                <span
                  className={cn(
                    'inline-grid h-5 min-w-5 place-items-center rounded-full px-1 text-[0.6875rem] font-bold',
                    actif ? 'bg-paper/20 text-paper' : 'bg-ink-50 text-ink-700',
                  )}
                >
                  {total}
                </span>
              </Link>
            );
          })}
        </div>

        <form action="/gestion/candidatures" className="relative max-w-xl" role="search">
          <IconSearch
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 h-[1.125rem] w-[1.125rem] -translate-y-1/2 text-graphite-400"
          />
          <label htmlFor="q" className="sr-only">
            Rechercher un dossier
          </label>
          <input
            id="q"
            name="q"
            type="search"
            defaultValue={recherche}
            placeholder="Numéro de dossier, nom du candidat, référence de transaction…"
            className="champ rounded-full pl-11"
          />
        </form>
      </div>

      {/* -------------------------------------------------------- Résultats */}
      {resultat.docs.length === 0 ? (
        <Vide
          titre={recherche ? 'Aucun dossier ne correspond' : 'Aucun dossier dans cette vue'}
          corps={
            recherche
              ? 'Vérifiez le numéro de dossier ou le nom saisi. La recherche porte aussi sur la référence de transaction.'
              : 'Les candidatures déposées depuis le portail apparaîtront ici, du plus récemment modifié au plus ancien.'
          }
          action={recherche ? { libelle: 'Effacer la recherche', href: '/gestion/candidatures' } : undefined}
        />
      ) : (
        <Carte className="p-2 lg:p-2.5">
          <div className="hidden grid-cols-[6.5rem_minmax(0,2fr)_minmax(0,1.6fr)_auto_auto_2.5rem] gap-4 border-b border-graphite-100 px-3 pb-3 pt-2 text-[0.625rem] font-bold uppercase tracking-[0.14em] text-graphite-400 lg:grid">
            <span>Dossier</span>
            <span>Candidat</span>
            <span>Premier vœu</span>
            <span>État</span>
            <span className="text-right">Modifié</span>
            <span />
          </div>

          <ul>
            {resultat.docs.map((brut) => {
              const doc = brut as Record<string, string | undefined>;
              const formation = doc.voeu1 ? getFormation(doc.voeu1) : undefined;
              const info = lireEtat(doc.etat);
              return (
                <li key={String(doc.id)} className="border-b border-graphite-100 last:border-0">
                  <Link
                    href={`/gestion/candidatures/${doc.id}`}
                    className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 rounded-xl px-3 py-3.5 transition-colors hover:bg-paper-tint lg:grid-cols-[6.5rem_minmax(0,2fr)_minmax(0,1.6fr)_auto_auto_2.5rem]"
                  >
                    <span className="hidden font-display text-[0.8125rem] font-semibold tabular-nums text-ink-700 lg:block">
                      {doc.reference ?? '—'}
                    </span>

                    <span className="flex min-w-0 flex-col">
                      <span className="truncate text-[0.9375rem] font-semibold text-ink-800">
                        {doc.nomCandidat || 'Sans nom'}
                      </span>
                      <span className="truncate text-[0.75rem] text-graphite-400">
                        {doc.reference ?? '—'} · {doc.telephone || doc.courriel || 'Contact non renseigné'}
                      </span>
                    </span>

                    <span className="hidden min-w-0 flex-col lg:flex">
                      <span className="truncate text-[0.875rem] text-graphite-600">
                        {formation ? titreComplet(formation) : 'Non renseigné'}
                      </span>
                      {formation ? (
                        <span className="text-[0.75rem] text-graphite-400">
                          {CYCLE_LABELS[formation.cycle]}
                        </span>
                      ) : null}
                    </span>

                    <Pastille ton={info.ton} point>
                      {info.libelle}
                    </Pastille>

                    <span className="hidden w-24 text-right text-[0.75rem] tabular-nums text-graphite-400 lg:block">
                      {formatDate(doc.updatedAt)}
                    </span>

                    <IconArrowUpRight className="hidden h-4 w-4 justify-self-end text-graphite-300 lg:block" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </Carte>
      )}
    </div>
  );
}
