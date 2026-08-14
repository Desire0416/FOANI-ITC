import type { Metadata } from 'next';
import Link from 'next/link';
import { soumettreDossier } from '@/app/(candidat)/mon-dossier/actions';
import { CadreEtape } from '@/components/candidat/cadre-etape';
import { BoutonAction } from '@/components/candidat/formulaire';
import { Alerte, Carte, Ligne } from '@/components/candidat/ui';
import { CYCLE_LABELS, getFormation, titreComplet } from '@/content/formations';
import { exigerDossier } from '@/lib/candidat';
import { dossierEnvoyable, dossierModifiable, manquesDuDossier } from '@/lib/etapes-dossier';
import { formatDate } from '@/lib/etats';

export const metadata: Metadata = { title: 'Relire et envoyer' };

function nommer(slug: string | null | undefined): string | null {
  if (!slug) return null;
  const formation = getFormation(slug);
  if (!formation) return null;
  return `${CYCLE_LABELS[formation.cycle]} — ${titreComplet(formation)}`;
}

const SITUATIONS: Record<string, string> = {
  reprise: 'Reprise d’études',
  salarie: 'Activité salariée',
  hebergement: 'Besoin d’hébergement',
};

/**
 * Récapitulatif avant envoi — CDC §10.1.
 *
 * « Un récapitulatif complet est présenté avant l'envoi définitif. » Complet
 * veut dire deux choses : tout ce qui a été saisi, et tout ce qui manque. La
 * liste des manques est calculée par le serveur, la même fonction que celle
 * qui refusera l'envoi — l'écran ne peut donc pas annoncer un dossier prêt
 * que l'action rejetterait ensuite.
 */
export default async function EtapeRecapitulatif() {
  const { dossier } = await exigerDossier();

  const absents = manquesDuDossier(dossier);
  const pret = dossierEnvoyable(dossier);
  const ouvert = dossierModifiable(dossier);
  const pieces = dossier.pieces ?? [];

  return (
    <CadreEtape
      sansContexte
      dossier={dossier}
      etape="recapitulatif"
      chapo="Relisez tout avant d’envoyer. Une fois le dossier envoyé, vous ne pourrez plus le modifier — sauf si nous vous demandons un complément."
    >
      <div className="flex flex-col gap-6">
        {absents.length > 0 ? (
          <Alerte ton="attention" titre="Votre dossier n’est pas encore complet">
            <ul className="mt-2 flex flex-col gap-1.5">
              {absents.map((ligne) => (
                <li key={ligne.etape.id}>
                  <Link href={ligne.etape.href} className="font-semibold underline">
                    {ligne.etape.libelle}
                  </Link>{' '}
                  — {ligne.absents.join(', ').toLowerCase()}
                </li>
              ))}
            </ul>
          </Alerte>
        ) : (
          <Alerte ton="reussite" titre="Votre dossier est complet">
            Vous pouvez l’envoyer au service des admissions.
          </Alerte>
        )}

        <Carte titre="La formation demandée">
          <dl>
            <Ligne intitule="Premier choix" valeur={nommer(dossier.voeu1)} href="/mon-dossier/formation" />
            <Ligne intitule="Second choix" valeur={nommer(dossier.voeu2)} />
            <Ligne intitule="Entrée souhaitée" valeur={dossier.anneeEntree} />
          </dl>
        </Carte>

        <Carte titre="Vous">
          <dl>
            <Ligne
              intitule="Nom et prénoms"
              valeur={[dossier.nom?.toUpperCase(), dossier.prenoms].filter(Boolean).join(' ')}
              href="/mon-dossier/identite"
            />
            <Ligne intitule="Date de naissance" valeur={dossier.dateNaissance ? formatDate(dossier.dateNaissance) : null} />
            <Ligne intitule="Lieu de naissance" valeur={dossier.lieuNaissance} />
            <Ligne intitule="Nationalité" valeur={dossier.nationalite} />
            <Ligne intitule="Téléphone" valeur={dossier.telephone} />
            <Ligne intitule="Adresse électronique" valeur={dossier.courriel} />
            <Ligne
              intitule="Personne à prévenir"
              valeur={
                dossier.contactNom
                  ? `${dossier.contactNom}${dossier.contactLien ? ` (${dossier.contactLien})` : ''}${dossier.contactTelephone ? ` — ${dossier.contactTelephone}` : ''}`
                  : null
              }
            />
          </dl>
        </Carte>

        <Carte titre="Votre parcours">
          <dl>
            <Ligne
              intitule="Baccalauréat"
              valeur={
                dossier.serieBac
                  ? [`Série ${dossier.serieBac}`, dossier.anneeBac, dossier.mentionBac]
                      .filter(Boolean)
                      .join(' — ')
                  : null
              }
              href="/mon-dossier/scolarite"
            />
            <Ligne intitule="Établissement d’origine" valeur={dossier.etablissementOrigine} />
            <Ligne
              intitule="Situation"
              valeur={
                (dossier.situation ?? []).length > 0
                  ? (dossier.situation ?? []).map((cle) => SITUATIONS[cle] ?? cle).join(', ')
                  : null
              }
            />
          </dl>
        </Carte>

        <Carte titre={`Vos documents (${pieces.length})`}>
          {pieces.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {pieces.map((ligne, rang) => {
                const piece = typeof ligne.fichier === 'object' ? ligne.fichier : null;
                return (
                  <li
                    key={ligne.id ?? rang}
                    className="flex items-center justify-between gap-4 border-b border-graphite-100 py-2.5 last:border-0"
                  >
                    <span className="min-w-0 truncate text-[0.9375rem] text-ink-800">
                      {piece?.filename ?? 'Document'}
                    </span>
                    <Link
                      href="/mon-dossier/pieces"
                      className="shrink-0 text-[0.8125rem] font-semibold text-ink-700 hover:text-ink-600"
                    >
                      Modifier
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-[0.9375rem] text-graphite-500">
              Aucun document déposé.{' '}
              <Link href="/mon-dossier/pieces" className="font-semibold text-ink-700 hover:text-ink-600">
                En ajouter
              </Link>
            </p>
          )}
        </Carte>

        <Carte titre="Frais de dossier">
          <dl>
            <Ligne
              intitule="Référence de la transaction"
              valeur={dossier.referenceTransaction}
              href="/mon-dossier/frais"
            />
            <Ligne
              intitule="Vérification par l’établissement"
              valeur={dossier.transactionVerifiee ? 'Référence retrouvée sur le relevé' : 'Pas encore vérifiée'}
            />
          </dl>
        </Carte>

        {/* ------------------------------------------------------------ Envoi */}
        {ouvert ? (
          <section className="carte overflow-hidden">
            <header className="border-b border-graphite-100 bg-paper-tint px-5 py-4">
              <h2 className="text-[1.0625rem] leading-snug">Envoyer mon dossier</h2>
            </header>
            <div className="p-5 sm:p-6">
            <p className="text-[0.9375rem] leading-relaxed text-graphite-600">
              Votre dossier partira au service des admissions. Vous ne pourrez plus le modifier, mais
              vous pourrez suivre son avancement à tout moment depuis cet espace.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              {pret ? (
                <BoutonAction
                  action={soumettreDossier}
                  libelle="Envoyer définitivement"
                  libelleAttente="Envoi en cours…"
                  variante="or"
                  confirmation="Envoyer votre dossier au service des admissions ? Vous ne pourrez plus le modifier."
                />
              ) : (
                <p className="text-[0.875rem] font-semibold text-graphite-500">
                  Complétez les éléments listés en haut de page pour pouvoir envoyer.
                </p>
              )}

              <Link href="/mon-dossier/frais" className="bouton bouton--discret">
                Étape précédente
              </Link>
            </div>
            </div>
          </section>
        ) : (
          <Alerte titre="Dossier déjà envoyé">
            <Link href="/mon-dossier" className="font-semibold underline">
              Suivre son avancement
            </Link>
          </Alerte>
        )}
      </div>
    </CadreEtape>
  );
}
