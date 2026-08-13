import type { Metadata } from 'next';
import Link from 'next/link';
import {
  IconArrowRight,
  IconArrowUpRight,
  IconCheck,
  IconClock,
  IconFile,
  IconUsers,
} from '@/components/brand/icons';
import { Carte, EnTetePage, Pastille, Tuile, Vide } from '@/components/gestion/ui';
import { CYCLE_LABELS, getFormation, titreComplet } from '@/content/formations';
import { exigerAgent, socle } from '@/lib/session';

export const metadata: Metadata = { title: 'Tableau de bord' };

const LIBELLES_ETAT: Record<string, string> = {
  brouillon: 'Brouillon',
  soumis: 'Soumis',
  instruction: 'En instruction',
  complement: 'Complément demandé',
  complet: 'Complet',
  admis: 'Admis',
  'admis-condition': 'Admis sous condition',
  attente: 'Liste d’attente',
  refuse: 'Refusé',
  inscrit: 'Inscrit',
  desiste: 'Désisté',
};

const TONS_ETAT: Record<string, 'neutre' | 'encre' | 'or' | 'vert' | 'plein' | 'rouge'> = {
  soumis: 'encre',
  instruction: 'encre',
  complement: 'or',
  complet: 'vert',
  admis: 'plein',
  'admis-condition': 'plein',
  inscrit: 'plein',
  attente: 'neutre',
  refuse: 'rouge',
  desiste: 'rouge',
  brouillon: 'neutre',
};

function formatCourt(valeur: string | undefined): string {
  if (!valeur) return '—';
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    timeZone: 'Africa/Abidjan',
  }).format(new Date(valeur));
}

/**
 * Tableau de bord.
 *
 * Un chargé d'admission n'ouvre pas son espace pour choisir un menu : il
 * l'ouvre pour savoir combien de dossiers l'attendent. L'écran répond dans
 * cet ordre, et toutes les valeurs sont lues en base à l'affichage.
 */
export default async function PageTableauDeBord() {
  const agent = await exigerAgent();
  const payload = await socle();

  const compter = (where?: Record<string, unknown>) =>
    payload
      .count({ collection: 'candidatures', where: where as never, overrideAccess: true })
      .then((resultat) => resultat.totalDocs)
      .catch(() => 0);

  const [total, aInstruire, complements, admis, comptes, personnes] = await Promise.all([
    compter({ etat: { not_equals: 'brouillon' } }),
    compter({ etat: { in: ['soumis', 'instruction'] } }),
    compter({ etat: { equals: 'complement' } }),
    compter({ etat: { in: ['admis', 'admis-condition', 'inscrit'] } }),
    payload
      .count({ collection: 'candidats', overrideAccess: true })
      .then((r) => r.totalDocs)
      .catch(() => 0),
    payload
      .count({ collection: 'personnes', overrideAccess: true })
      .then((r) => r.totalDocs)
      .catch(() => 0),
  ]);

  const recentes = await payload
    .find({
      collection: 'candidatures',
      where: { etat: { not_equals: 'brouillon' } },
      sort: '-updatedAt',
      limit: 6,
      depth: 0,
      overrideAccess: true,
    })
    .catch(() => ({ docs: [] as unknown[] }));

  const heure = new Date().getHours();
  const salutation = heure < 12 ? 'Bonjour' : heure < 18 ? 'Bon après-midi' : 'Bonsoir';
  const pourcentage = (valeur: number) => (total > 0 ? `${Math.round((valeur / total) * 100)} %` : '—');

  return (
    <div className="flex flex-col gap-6">
      <EnTetePage
        surtitre="Vue d’ensemble"
        titre={`${salutation}${agent.prenoms ? `, ${agent.prenoms}` : ''}.`}
        resume={
          aInstruire > 0
            ? `${aInstruire} dossier${aInstruire > 1 ? 's' : ''} attend${aInstruire > 1 ? 'ent' : ''} votre instruction.`
            : 'Aucun dossier n’attend d’instruction pour le moment.'
        }
        actions={
          <Link href="/gestion/candidatures" className="bouton bouton--principal">
            Ouvrir les candidatures
            <IconArrowRight className="h-4 w-4" />
          </Link>
        }
      />

      {/* ------------------------------------------------------------ Tuiles */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Tuile
          etiquette="Dossiers reçus"
          valeur={total}
          detail="Hors brouillons"
          complement={`${comptes} compte${comptes > 1 ? 's' : ''}`}
          icone={<IconFile />}
          ton="encre"
          href="/gestion/candidatures"
        />
        <Tuile
          etiquette="À instruire"
          valeur={aInstruire}
          detail="Soumis ou en cours"
          complement={pourcentage(aInstruire)}
          icone={<IconClock />}
          ton="or"
          href="/gestion/candidatures?etat=soumis"
        />
        <Tuile
          etiquette="Compléments demandés"
          valeur={complements}
          detail="En attente du candidat"
          complement={pourcentage(complements)}
          icone={<IconArrowUpRight />}
          ton="ambre"
          href="/gestion/candidatures?etat=complement"
        />
        <Tuile
          etiquette="Admis"
          valeur={admis}
          detail="Décision favorable"
          complement={pourcentage(admis)}
          icone={<IconCheck />}
          ton="profond"
          href="/gestion/candidatures?etat=admis"
        />
      </div>

      {/* ------------------------------------------------- Derniers mouvements */}
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Carte titre="Derniers mouvements" lien={{ libelle: 'Tout voir', href: '/gestion/candidatures' }}>
          {recentes.docs.length === 0 ? (
            <Vide
              titre="Aucun dossier soumis"
              corps="Les candidatures déposées depuis le portail apparaîtront ici, du plus récemment modifié au plus ancien."
            />
          ) : (
            <ul className="-mx-2 flex flex-col">
              {recentes.docs.map((brut) => {
                const doc = brut as Record<string, string | undefined>;
                const formation = doc.voeu1 ? getFormation(doc.voeu1) : undefined;
                const etat = doc.etat ?? 'brouillon';
                return (
                  <li key={String(doc.id)}>
                    <Link
                      href={`/gestion/candidatures/${doc.id}`}
                      className="flex items-center gap-4 rounded-xl px-2 py-3 transition-colors hover:bg-ink-50"
                    >
                      <span className="w-20 shrink-0 font-display text-[0.8125rem] font-semibold tabular-nums text-ink-700">
                        {doc.reference ?? '—'}
                      </span>
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate text-[0.875rem] font-semibold text-ink-800">
                          {doc.nomCandidat || 'Sans nom'}
                        </span>
                        <span className="truncate text-[0.75rem] text-graphite-500">
                          {formation
                            ? `${CYCLE_LABELS[formation.cycle]} — ${titreComplet(formation)}`
                            : 'Formation non renseignée'}
                        </span>
                      </span>
                      <Pastille ton={TONS_ETAT[etat] ?? 'neutre'} point>
                        {LIBELLES_ETAT[etat] ?? etat}
                      </Pastille>
                      <span className="hidden w-16 shrink-0 text-right text-[0.75rem] text-graphite-400 sm:block">
                        {formatCourt(doc.updatedAt)}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Carte>

        <div className="flex flex-col gap-4">
          <Carte titre="Référentiel">
            <ul className="flex flex-col gap-3">
              <li className="flex items-center gap-3 rounded-xl border border-graphite-100 bg-paper-tint px-4 py-3.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink-800 text-gold-400">
                  <IconUsers className="h-[1.125rem] w-[1.125rem]" />
                </span>
                <span className="flex flex-1 flex-col">
                  <span className="text-[0.875rem] font-semibold text-ink-800">Personnes</span>
                  <span className="text-[0.75rem] text-graphite-500">Référentiel unique</span>
                </span>
                <span className="font-display text-[1.375rem] tabular-nums text-ink-700">{personnes}</span>
              </li>
              <li className="flex items-center gap-3 rounded-xl border border-graphite-100 bg-paper-tint px-4 py-3.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink-800 text-gold-400">
                  <IconFile className="h-[1.125rem] w-[1.125rem]" />
                </span>
                <span className="flex flex-1 flex-col">
                  <span className="text-[0.875rem] font-semibold text-ink-800">Comptes candidats</span>
                  <span className="text-[0.75rem] text-graphite-500">Créés depuis le portail</span>
                </span>
                <span className="font-display text-[1.375rem] tabular-nums text-ink-700">{comptes}</span>
              </li>
            </ul>
          </Carte>

          <Carte titre="Rappel de cadrage">
            <p className="text-[0.875rem] leading-relaxed text-graphite-600">
              Le dispositif n’encaisse aucun fonds. Il enregistre une référence de transaction que
              l’administration rapproche de son relevé.
            </p>
            <p className="mt-3 text-[0.875rem] leading-relaxed text-graphite-600">
              Un dossier n’est jamais supprimé : il change d’état, et chaque décision conserve son
              auteur et sa date.
            </p>
          </Carte>
        </div>
      </div>
    </div>
  );
}
