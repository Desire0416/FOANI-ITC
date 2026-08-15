import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { IconArrowRight } from '@/components/brand/icons';
import { Carte, EnTetePage, Pastille } from '@/components/gestion/ui';
import { ArreterGrille, FormulaireGrille } from '@/components/gestion/grille-formulaire';
import { CYCLE_LABELS, getFormation, titreComplet } from '@/content/formations';
import { formatDate } from '@/lib/etats';
import { exigerRole, socle } from '@/lib/session';
import { echeancier, formaterMontant, total as sommer } from '@/payload/finances/montants';
import { libelleNature } from '@/payload/finances/natures';
import { ROLES_GRILLES } from '@/payload/roles';

type Params = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  return { title: `Grille ${id}` };
}

const TONS = { brouillon: 'or', arretee: 'vert', archivee: 'neutre' } as const;
const LIBELLES = { brouillon: 'Brouillon', arretee: 'Arrêtée', archivee: 'Archivée' } as const;

export default async function PageGrille({ params }: Params) {
  await exigerRole(ROLES_GRILLES);
  const { id } = await params;

  const payload = await socle();
  const brute = (await payload
    .findByID({ collection: 'grilles', id, depth: 1, overrideAccess: true })
    .catch(() => null)) as unknown as Record<string, unknown> | null;

  if (!brute) notFound();

  const etat = String(brute.etat ?? 'brouillon') as keyof typeof TONS;
  const modifiable = etat === 'brouillon';

  const brutes = (brute.lignes as
    | { nature?: string; libelle?: string; montant?: number; echeances?: { exigibleLe?: string }[] }[]
    | null) ?? [];

  const lignes = brutes.map((ligne) => ({
    nature: String(ligne.nature ?? ''),
    libelle: ligne.libelle ?? libelleNature(ligne.nature),
    montant: Number(ligne.montant ?? 0),
    dates: (ligne.echeances ?? [])
      .map((echeance) => (echeance.exigibleLe ? String(echeance.exigibleLe).slice(0, 10) : ''))
      .filter(Boolean),
  }));

  const total = sommer(lignes.map((ligne) => ligne.montant));

  const slug = brute.formation as string | null;
  const formation = slug ? getFormation(slug) : null;
  const nom = formation
    ? `${CYCLE_LABELS[formation.cycle]} — ${titreComplet(formation)}`
    : ((brute.intitule as string | null) ?? 'Sans intitulé');

  const auteur = brute.arreteePar as { nomComplet?: string; email?: string } | null;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/gestion/grilles"
          className="inline-flex items-center gap-2 text-[0.8125rem] font-semibold text-graphite-500 transition-colors hover:text-ink-700"
        >
          <IconArrowRight className="h-4 w-4 rotate-180" />
          Retour aux grilles
        </Link>
      </div>

      <EnTetePage
        surtitre={`${String(brute.anneeAcademique ?? '')} · version ${String(brute.version ?? 1)}`}
        titre={nom}
        resume={
          etat === 'arretee'
            ? `Arrêtée le ${brute.arreteeLe ? formatDate(String(brute.arreteeLe)) : '—'}${
                auteur ? ` par ${auteur.nomComplet ?? auteur.email}` : ''
              }. Elle ne se modifie plus.`
            : etat === 'archivee'
              ? 'Archivée. Elle n’est plus applicable ; les appels déjà émis n’en sont pas affectés.'
              : 'Brouillon. Elle n’engage personne tant qu’elle n’est pas arrêtée.'
        }
        actions={<Pastille ton={TONS[etat]}>{LIBELLES[etat]}</Pastille>}
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
        <FormulaireGrille id={id} lignes={lignes} modifiable={modifiable} />

        <div className="flex flex-col gap-5">
          <Carte titre="Ce que la formation coûte" mention={formaterMontant(total)}>
            {lignes.length === 0 ? (
              <p className="text-[0.875rem] text-graphite-500">Aucune ligne renseignée.</p>
            ) : (
              <dl className="flex flex-col">
                {lignes.map((ligne) => (
                  <div
                    key={ligne.nature}
                    className="flex flex-wrap items-baseline justify-between gap-x-4 border-b border-graphite-100 py-2.5 last:border-0"
                  >
                    <dt className="text-[0.875rem] text-graphite-600">{ligne.libelle}</dt>
                    <dd className="font-display text-[0.9375rem] text-ink-800 tabular-nums">
                      {formaterMontant(ligne.montant)}
                      {ligne.dates.length > 1 ? (
                        <span className="ml-1.5 text-[0.75rem] font-normal text-graphite-500">
                          en {ligne.dates.length} tranches
                        </span>
                      ) : null}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </Carte>

          {lignes.some((ligne) => ligne.dates.length > 0) ? (
            <Carte titre="L’échéancier">
              <ol className="flex flex-col">
                {lignes
                  .filter((ligne) => ligne.dates.length > 0)
                  .flatMap((ligne) =>
                    echeancier(ligne.montant, ligne.dates).map((echeance) => ({
                      ...echeance,
                      libelle: ligne.libelle,
                    })),
                  )
                  .sort((a, b) => a.exigibleLe.localeCompare(b.exigibleLe))
                  .map((echeance, rang) => (
                    <li
                      key={`${echeance.libelle}-${rang}`}
                      className="flex flex-wrap items-baseline justify-between gap-x-4 border-b border-graphite-100 py-2.5 last:border-0"
                    >
                      <span className="text-[0.875rem] text-graphite-600">
                        {formatDate(echeance.exigibleLe)}
                        <span className="ml-2 text-[0.75rem] text-graphite-400">
                          {echeance.libelle}
                        </span>
                      </span>
                      <span className="font-display text-[0.875rem] text-ink-800 tabular-nums">
                        {formaterMontant(echeance.montant)}
                      </span>
                    </li>
                  ))}
              </ol>
            </Carte>
          ) : null}

          <Carte titre={etat === 'brouillon' ? 'Arrêter cette grille' : 'Cycle de vie'}>
            <ArreterGrille id={id} etat={etat} />
          </Carte>
        </div>
      </div>
    </div>
  );
}
