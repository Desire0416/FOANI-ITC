import type { Metadata } from 'next';
import Link from 'next/link';
import { retirerPiece } from '@/app/(candidat)/mon-dossier/actions';
import { IconCheck, IconFile } from '@/components/brand/icons';
import { CadreEtape } from '@/components/candidat/cadre-etape';
import { BoutonAction } from '@/components/candidat/formulaire';
import { Alerte, Carte } from '@/components/candidat/ui';
import { ZoneDepot } from '@/components/candidat/zone-depot';
import { exigerDossier } from '@/lib/candidat';
import { dossierModifiable } from '@/lib/etapes-dossier';
import { cn } from '@/lib/utils';
import type { Piece } from '@/payload-types';

export const metadata: Metadata = { title: 'Vos documents' };

const NATURES = [
  { valeur: 'identite', libelle: 'Pièce d’identité' },
  { valeur: 'releve', libelle: 'Relevé de notes' },
  { valeur: 'diplome', libelle: 'Diplôme ou attestation de réussite' },
  { valeur: 'photo', libelle: 'Photographie d’identité' },
  { valeur: 'autre', libelle: 'Autre document' },
];

const LIBELLE_NATURE = new Map(NATURES.map((nature) => [nature.valeur, nature.libelle]));

function poids(octets: number | null | undefined): string {
  if (!octets) return '';
  const mo = octets / (1024 * 1024);
  if (mo >= 1) return `${mo.toFixed(1)} Mo`;
  const ko = octets / 1024;
  return ko >= 1 ? `${Math.round(ko)} Ko` : 'moins de 1 Ko';
}

export default async function EtapePieces() {
  const { dossier } = await exigerDossier();

  const lignes = dossier.pieces ?? [];
  const ouvert = dossierModifiable(dossier);
  const rejetees = lignes.filter((ligne) => ligne.etatPiece === 'rejetee');

  return (
    <CadreEtape
      dossier={dossier}
      etape="pieces"
      chapo="Photographiez vos documents avec votre téléphone, ou déposez un PDF. Le site vérifie le format et allège automatiquement les images."
    >
      <div className="flex flex-col gap-6">
        {rejetees.length > 0 ? (
          <Alerte ton="attention" titre="Des documents doivent être refaits">
            Le motif est indiqué en face de chacun. Retirez-les et déposez une nouvelle version.
          </Alerte>
        ) : null}

        {/* ------------------------------------------------ Ce qui est déjà là */}
        <Carte
          titre={lignes.length > 0 ? `Vos documents (${lignes.length})` : 'Vos documents'}
          aide={
            lignes.length > 0
              ? undefined
              : 'Aucun document déposé pour l’instant. Commencez par votre pièce d’identité.'
          }
        >
          {lignes.length > 0 ? (
            <ul className="flex flex-col gap-3">
              {lignes.map((ligne, rang) => {
                const piece = (typeof ligne.fichier === 'object' ? ligne.fichier : null) as Piece | null;
                const rejetee = ligne.etatPiece === 'rejetee';
                const acceptee = ligne.etatPiece === 'acceptee';

                return (
                  <li
                    key={ligne.id ?? rang}
                    className={cn(
                      'flex flex-wrap items-center gap-x-4 gap-y-3 rounded-xl border p-4',
                      rejetee
                        ? 'border-state-danger/25 bg-state-danger/[0.04]'
                        : 'border-graphite-200 bg-paper',
                    )}
                  >
                    <span
                      className={cn(
                        'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                        acceptee ? 'bg-[#e8f4ee] text-[#0f7a4d]' : 'bg-ink-50 text-ink-700',
                      )}
                    >
                      {acceptee ? <IconCheck className="h-5 w-5" /> : <IconFile className="h-5 w-5" />}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block text-[0.9375rem] font-semibold text-ink-800">
                        {LIBELLE_NATURE.get(piece?.nature ?? 'autre') ?? 'Document'}
                      </span>
                      <span className="mt-0.5 block truncate text-[0.8125rem] text-graphite-500">
                        {piece?.filename ?? 'Document déposé'}
                        {piece?.filesize ? ` — ${poids(piece.filesize)}` : ''}
                      </span>
                      {rejetee && ligne.motif ? (
                        <span className="mt-1.5 block text-[0.8125rem] leading-snug font-medium text-state-danger">
                          Refusé : {ligne.motif}
                        </span>
                      ) : null}
                    </span>

                    <span className="flex items-center gap-3">
                      <span
                        className={cn(
                          'pastille',
                          acceptee
                            ? 'bg-[#e8f4ee] text-[#0f7a4d]'
                            : rejetee
                              ? 'bg-[#fbeaec] text-state-danger'
                              : 'bg-graphite-100 text-graphite-600',
                        )}
                      >
                        {acceptee ? 'Acceptée' : rejetee ? 'À refaire' : 'En attente d’examen'}
                      </span>

                      {ouvert && !acceptee ? (
                        <BoutonAction
                          action={retirerPiece}
                          champs={{ rang: String(rang) }}
                          libelle="Retirer"
                          libelleAttente="Retrait…"
                          variante="discret"
                          confirmation="Retirer ce document de votre dossier ?"
                        />
                      ) : null}
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </Carte>

        {/* -------------------------------------------------- Nouveau dépôt */}
        {ouvert ? (
          <Carte titre="Ajouter un document">
            <ZoneDepot />
          </Carte>
        ) : null}

        {/* ------------------------------------------------------- Réserve */}
        <Alerte>
          La liste exacte des pièces demandées pour votre formation est arrêtée par le service des
          admissions et n’est pas encore publiée. Déposez au minimum votre pièce d’identité et vos
          relevés&nbsp;: si un document manque, nous vous le demanderons, et vous pourrez le déposer
          sans refaire votre dossier.
        </Alerte>

        {ouvert ? (
          <div className="flex flex-wrap items-center gap-3 border-t border-graphite-100 pt-6">
            <Link href="/mon-dossier/frais" className="bouton bouton--principal">
              Continuer
            </Link>
            <Link href="/mon-dossier/scolarite" className="bouton bouton--discret">
              Étape précédente
            </Link>
          </div>
        ) : null}
      </div>
    </CadreEtape>
  );
}
