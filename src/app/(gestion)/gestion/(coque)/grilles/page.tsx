import type { Metadata } from 'next';
import Link from 'next/link';
import { IconArrowRight, IconCheck, IconClock, IconFile } from '@/components/brand/icons';
import { EnTetePage, Pastille, Vide } from '@/components/gestion/ui';
import { CYCLE_LABELS, getFormation, titreComplet } from '@/content/formations';
import { formatDate } from '@/lib/etats';
import { exigerRole, socle } from '@/lib/session';
import { formaterMontant } from '@/payload/finances/montants';
import { ROLES_GRILLES } from '@/payload/roles';

export const metadata: Metadata = { title: 'Grilles tarifaires' };

/* ==========================================================================
   Les grilles tarifaires — Note complémentaire §6.4
   --------------------------------------------------------------------------
   L'écran répond à une question : qu'a-t-on arrêté, et qu'est-ce qui attend
   d'être arrêté ? Les brouillons viennent donc en premier — ce sont eux qui
   demandent une décision.
   ========================================================================== */

const TONS = {
  brouillon: 'or',
  arretee: 'vert',
  archivee: 'neutre',
} as const;

const LIBELLES = {
  brouillon: 'Brouillon',
  arretee: 'Arrêtée',
  archivee: 'Archivée',
} as const;

function nommer(brute: Record<string, unknown>): string {
  const slug = brute.formation as string | null;
  if (slug) {
    const formation = getFormation(slug);
    if (formation) return `${CYCLE_LABELS[formation.cycle]} — ${titreComplet(formation)}`;
  }
  return (brute.intitule as string | null) ?? 'Sans intitulé';
}

export default async function PageGrilles() {
  await exigerRole(ROLES_GRILLES);
  const payload = await socle();

  const { docs } = await payload.find({
    collection: 'grilles',
    sort: ['etat', '-anneeAcademique', '-version'],
    limit: 200,
    depth: 0,
    overrideAccess: true,
  });

  const grilles = docs as unknown as Record<string, unknown>[];
  const brouillons = grilles.filter((grille) => grille.etat === 'brouillon');

  return (
    <div className="flex flex-col gap-6">
      <EnTetePage
        surtitre="Finances"
        titre="Grilles tarifaires"
        resume={
          brouillons.length > 0
            ? `${brouillons.length} brouillon${brouillons.length > 1 ? 's' : ''} attend${brouillons.length > 1 ? 'ent' : ''} d’être arrêté${brouillons.length > 1 ? 's' : ''}.`
            : 'Ce que coûte chaque formation, par année. Une grille arrêtée devient opposable et ne se modifie plus.'
        }
        actions={
          <Link href="/gestion/grilles/nouvelle" className="bouton bouton--principal">
            Nouvelle grille
            <IconArrowRight className="h-4 w-4" />
          </Link>
        }
      />

      {grilles.length === 0 ? (
        <Vide
          titre="Aucune grille"
          corps="Tant qu’aucun tarif n’est arrêté, la fiche de formation l’indique franchement au public, et aucun appel de frais ne peut être émis."
          action={{ libelle: 'Créer une première grille', href: '/gestion/grilles/nouvelle' }}
        />
      ) : (
        <section className="carte overflow-hidden">
          <ul className="flex flex-col">
            {grilles.map((grille) => {
              const etat = String(grille.etat ?? 'brouillon') as keyof typeof TONS;
              const lignes = (grille.lignes as { montant?: number }[] | null) ?? [];
              const total = lignes.reduce((somme, ligne) => somme + Number(ligne.montant ?? 0), 0);

              return (
                <li key={String(grille.id)} className="border-b border-graphite-100 last:border-0">
                  <Link
                    href={`/gestion/grilles/${grille.id}`}
                    className="flex flex-wrap items-center gap-x-5 gap-y-2 px-5 py-4 transition-colors hover:bg-paper-tint"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-ink-50 text-ink-700">
                      {etat === 'arretee' ? (
                        <IconCheck className="h-4 w-4" />
                      ) : etat === 'brouillon' ? (
                        <IconClock className="h-4 w-4" />
                      ) : (
                        <IconFile className="h-4 w-4" />
                      )}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block text-[0.9375rem] font-semibold text-ink-800">
                        {nommer(grille)}
                      </span>
                      <span className="mt-0.5 block text-[0.8125rem] text-graphite-500">
                        {String(grille.anneeAcademique ?? '')} · version {String(grille.version ?? 1)}
                        {grille.arreteeLe ? ` · arrêtée le ${formatDate(String(grille.arreteeLe))}` : ''}
                      </span>
                    </span>

                    <span className="font-display text-[0.9375rem] text-ink-800 tabular-nums">
                      {formaterMontant(total)}
                    </span>

                    <Pastille ton={TONS[etat]}>{LIBELLES[etat]}</Pastille>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
