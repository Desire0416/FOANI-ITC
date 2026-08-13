import type { Metadata } from 'next';
import Link from 'next/link';
import { IconCheck, IconClock, IconFile } from '@/components/brand/icons';
import { Alerte, Carte, Ligne } from '@/components/candidat/ui';
import { CYCLE_LABELS, getFormation, titreComplet } from '@/content/formations';
import { exigerDossier } from '@/lib/candidat';
import { dossierModifiable, etapeDeReprise } from '@/lib/etapes-dossier';
import { CLASSES_PASTILLE, etat as lireEtat, formatDate, sensCandidat } from '@/lib/etats';
import { cn } from '@/lib/utils';

export const metadata: Metadata = { title: 'Suivre mon dossier' };

/* ==========================================================================
   Suivi du dossier — CDC §10.4
   --------------------------------------------------------------------------
   « Un numéro de dossier est délivré. Chaque changement d'état donne lieu à
   une notification. » Tant qu'aucun service d'envoi de messages n'est branché,
   la notification n'existe pas — cette page est donc le seul endroit où le
   candidat apprend où en est son dossier, et elle le dit franchement plutôt
   que de laisser croire qu'un message est parti.
   ========================================================================== */

function nommer(slug: string | null | undefined): string | null {
  if (!slug) return null;
  const formation = getFormation(slug);
  if (!formation) return null;
  return `${CYCLE_LABELS[formation.cycle]} — ${titreComplet(formation)}`;
}

export default async function SuiviDossier({
  searchParams,
}: {
  searchParams: Promise<{ envoye?: string }>;
}) {
  const { dossier } = await exigerDossier();
  const { envoye } = await searchParams;

  const etat = lireEtat(dossier.etat);
  const sens = sensCandidat(dossier.etat);
  const journal = [...(dossier.journal ?? [])].reverse();
  const rejetees = (dossier.pieces ?? []).filter((ligne) => ligne.etatPiece === 'rejetee');
  const ouvert = dossierModifiable(dossier);

  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-7 sm:px-8 sm:py-10">
      {envoye ? (
        <Alerte ton="reussite" titre="Votre dossier est parti" className="mb-6">
          Notez votre numéro de dossier&nbsp;: c’est lui qu’il faudra citer si vous nous appelez.
        </Alerte>
      ) : null}

      {/* ------------------------------------------------------------- État */}
      <section className="carte overflow-hidden">
        <div className="border-b border-graphite-100 bg-paper-tint p-5 sm:p-7">
          <div className="flex flex-wrap items-center gap-3">
            <span className={cn('pastille', CLASSES_PASTILLE[etat.ton])}>
              <span className="pastille__point" aria-hidden="true" />
              {etat.libelle}
            </span>
            {dossier.soumisLe ? (
              <span className="text-[0.8125rem] text-graphite-500">
                Envoyé le {formatDate(dossier.soumisLe)}
              </span>
            ) : null}
          </div>

          <h1 className="mt-4 text-[1.5rem] leading-tight sm:text-[1.875rem]">{sens.titre}</h1>
          <p className="mt-2 text-[0.9375rem] leading-relaxed text-graphite-600">{sens.corps}</p>

          {dossier.reference ? (
            <p className="mt-5 inline-flex items-center gap-2.5 rounded-xl border border-graphite-200 bg-paper px-4 py-2.5">
              <IconFile aria-hidden="true" className="h-4 w-4 shrink-0 text-ink-700" />
              <span className="text-[0.75rem] text-graphite-500">Votre numéro de dossier</span>
              <span className="font-display text-[1.125rem] text-ink-800 tabular-nums">
                {dossier.reference}
              </span>
            </p>
          ) : null}
        </div>

        {/* ------------------------------------------------ Ce qu'il faut faire */}
        {sens.aVous ? (
          <div className="p-5 sm:p-7">
            {rejetees.length > 0 ? (
              <>
                <h2 className="text-[1.0625rem]">Les documents à refaire</h2>
                <ul className="mt-4 flex flex-col gap-3">
                  {rejetees.map((ligne, rang) => (
                    <li
                      key={ligne.id ?? rang}
                      className="rounded-xl border border-state-danger/25 bg-state-danger/[0.04] p-4"
                    >
                      <p className="text-[0.9375rem] font-semibold text-ink-800">
                        {typeof ligne.fichier === 'object' ? ligne.fichier.filename : 'Document'}
                      </p>
                      {ligne.motif ? (
                        <p className="mt-1 text-[0.875rem] leading-snug text-state-danger">
                          {ligne.motif}
                        </p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </>
            ) : null}

            {dossier.decisionSens === 'admis-condition' && dossier.decisionConditions ? (
              <div className="rounded-xl border border-gold-200 bg-gold-50 p-4">
                <p className="text-[0.9375rem] font-semibold text-gold-800">Conditions à remplir</p>
                <p className="mt-1 text-[0.875rem] leading-relaxed whitespace-pre-line text-gold-800">
                  {dossier.decisionConditions}
                </p>
              </div>
            ) : null}

            {ouvert ? (
              <Link href={etapeDeReprise(dossier)} className="bouton bouton--principal mt-5">
                {rejetees.length > 0 ? 'Redéposer mes documents' : 'Reprendre mon dossier'}
              </Link>
            ) : null}
          </div>
        ) : null}
      </section>

      {/* -------------------------------------------------------- Le dossier */}
      <Carte titre="Ce que vous avez déposé" className="mt-6">
        <dl>
          <Ligne intitule="Premier choix" valeur={nommer(dossier.voeu1)} />
          <Ligne intitule="Second choix" valeur={nommer(dossier.voeu2)} />
          <Ligne
            intitule="Nom et prénoms"
            valeur={[dossier.nom?.toUpperCase(), dossier.prenoms].filter(Boolean).join(' ')}
          />
          <Ligne intitule="Téléphone" valeur={dossier.telephone} />
          <Ligne intitule="Documents déposés" valeur={String((dossier.pieces ?? []).length)} />
          <Ligne
            intitule="Frais de dossier"
            valeur={
              dossier.referenceTransaction
                ? dossier.transactionVerifiee
                  ? `${dossier.referenceTransaction} — vérifiée`
                  : `${dossier.referenceTransaction} — en attente de vérification`
                : null
            }
          />
        </dl>
      </Carte>

      {/* ------------------------------------------------------------ Journal */}
      {journal.length > 0 ? (
        <Carte titre="L’historique de votre dossier" className="mt-6">
          <ol className="flex flex-col">
            {journal.map((entree, rang) => (
              <li
                key={entree.id ?? rang}
                className="flex gap-4 border-b border-graphite-100 py-3 last:border-0"
              >
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink-50 text-ink-700">
                  {rang === 0 ? <IconClock className="h-4 w-4" /> : <IconCheck className="h-3.5 w-3.5" />}
                </span>
                <span className="min-w-0">
                  <span className="block text-[0.9375rem] text-ink-800">{entree.action}</span>
                  <span className="mt-0.5 block text-[0.8125rem] text-graphite-500">
                    {formatDate(entree.date, true)}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </Carte>
      ) : null}

      <Alerte className="mt-6">
        Nous vous préviendrons sur le contact indiqué dans votre dossier dès que son état changera.
        Vous pouvez aussi revenir sur cette page à tout moment.{' '}
        <Link href="/contact" className="font-semibold underline">
          Une question&nbsp;? Écrivez-nous.
        </Link>
      </Alerte>
    </div>
  );
}
