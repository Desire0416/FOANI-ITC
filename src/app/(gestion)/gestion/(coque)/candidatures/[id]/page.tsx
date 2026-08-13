import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { IconArrowRight, IconClock } from '@/components/brand/icons';
import { Carte, Pastille } from '@/components/gestion/ui';
import {
  AvancementDossier,
  DecisionDossier,
  FraisDeDossier,
  PiecesDuDossier,
  type PieceAffichee,
} from '@/components/gestion/instruction';
import { CYCLE_LABELS, getFormation, titreComplet } from '@/content/formations';
import { etat as lireEtat, formatDate } from '@/lib/etats';
import { exigerAgent, socle } from '@/lib/session';
import { ROLES_CANDIDATURES } from '@/payload/roles';

type Params = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  return { title: `Dossier ${id}` };
}

const NATURES: Record<string, string> = {
  identite: 'Pièce d’identité',
  releve: 'Relevé de notes',
  diplome: 'Diplôme ou attestation',
  photo: 'Photographie d’identité',
  autre: 'Autre document',
};

const MODES: Record<string, string> = {
  mobile: 'Paiement mobile',
  guichet: 'Versement au guichet',
  virement: 'Virement',
};

/**
 * Écran d'instruction d'un dossier — CDC §10.3.
 *
 * Trois colonnes de lecture : le dossier tel que le candidat l'a rempli, les
 * pièces à statuer, et à droite les commandes — avancement, frais, décision.
 * L'agent ne quitte pas l'écran pour agir.
 */
export default async function PageDossier({ params }: Params) {
  const agent = await exigerAgent();
  const { id } = await params;
  const payload = await socle();

  const dossier = (await payload
    .findByID({ collection: 'candidatures', id, depth: 1, overrideAccess: true })
    .catch(() => null)) as Record<string, unknown> | null;

  if (!dossier) notFound();

  const valeur = (cle: string): string | null => {
    const brut = dossier[cle];
    return typeof brut === 'string' && brut.length > 0 ? brut : null;
  };

  const info = lireEtat(valeur('etat') ?? undefined);
  const voeu1 = valeur('voeu1') ? getFormation(valeur('voeu1') as string) : undefined;
  const voeu2 = valeur('voeu2') ? getFormation(valeur('voeu2') as string) : undefined;
  const modifiable = ROLES_CANDIDATURES.includes(agent.role);

  const pieces: PieceAffichee[] = (
    (dossier.pieces as Record<string, unknown>[] | undefined) ?? []
  ).map((piece, index) => {
    const fichier = piece.fichier as Record<string, string> | string | null;
    const estObjet = fichier !== null && typeof fichier === 'object';
    return {
      index,
      nom: estObjet ? (fichier.filename ?? 'Document') : 'Document',
      nature: NATURES[String(piece.nature ?? 'autre')] ?? 'Document',
      url: estObjet ? (fichier.url ?? null) : null,
      etatPiece: (piece.etatPiece as 'attente' | 'acceptee' | 'rejetee') ?? 'attente',
      motif: typeof piece.motif === 'string' && piece.motif.length > 0 ? piece.motif : null,
    };
  });

  const journal = ((dossier.journal as Record<string, string>[] | undefined) ?? []).slice().reverse();
  const situations = (dossier.situation as string[] | undefined) ?? [];

  const identite = [
    ['Nom et prénoms', valeur('nomCandidat')],
    ['Date de naissance', dossier.dateNaissance ? formatDate(String(dossier.dateNaissance)) : null],
    ['Lieu de naissance', valeur('lieuNaissance')],
    ['Nationalité', valeur('nationalite')],
    ['Téléphone', valeur('telephone')],
    ['Adresse électronique', valeur('courriel')],
  ] as const;

  const parcours = [
    ['Série du baccalauréat', valeur('serieBac')],
    ['Année d’obtention', valeur('anneeBac')],
    ['Mention', valeur('mentionBac')],
    ['Établissement d’origine', valeur('etablissementOrigine')],
  ] as const;

  const contact = [
    ['Personne à contacter', valeur('contactNom')],
    ['Lien', valeur('contactLien')],
    ['Son téléphone', valeur('contactTelephone')],
  ] as const;

  return (
    <div className="flex flex-col gap-6">
      {/* ----------------------------------------------------------- Bandeau */}
      <div>
        <Link
          href="/gestion/candidatures"
          className="inline-flex items-center gap-2 text-[0.8125rem] font-semibold text-graphite-500 transition-colors hover:text-ink-700"
        >
          <IconArrowRight className="h-4 w-4 rotate-180" />
          Retour aux candidatures
        </Link>

        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-display text-[0.875rem] font-semibold tabular-nums text-ink-700">
              {valeur('reference') ?? '—'}
            </p>
            <h1 className="mt-1.5 text-[1.875rem] leading-tight lg:text-[2.25rem]">
              {valeur('nomCandidat') ?? 'Dossier sans nom'}
            </h1>
            <p className="mt-2 text-[0.9375rem] text-graphite-500">
              {voeu1 ? `${CYCLE_LABELS[voeu1.cycle]} — ${titreComplet(voeu1)}` : 'Formation non renseignée'}
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <Pastille ton={info.ton} point>
              {info.libelle}
            </Pastille>
            {info.sens ? <span className="text-[0.75rem] text-graphite-400">{info.sens}</span> : null}
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------------- Colonnes */}
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
        <div className="flex flex-col gap-5">
          <Carte titre="Le dossier">
            <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
              <Bloc titre="Identité" lignes={identite} />
              <Bloc titre="Parcours scolaire" lignes={parcours} />
              <Bloc titre="Personne à contacter" lignes={contact} />
              <div>
                <p className="mb-3 text-[0.625rem] font-bold uppercase tracking-[0.14em] text-graphite-400">
                  Vœux et situation
                </p>
                <dl className="flex flex-col divide-y divide-graphite-100">
                  <Ligne terme="Premier vœu" valeur={voeu1 ? titreComplet(voeu1) : null} />
                  <Ligne terme="Second vœu" valeur={voeu2 ? titreComplet(voeu2) : null} />
                  <Ligne terme="Année d’entrée" valeur={valeur('anneeEntree')} />
                </dl>
                {situations.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {situations.map((situation) => (
                      <Pastille key={situation} ton="or">
                        {situation === 'reprise'
                          ? 'Reprise d’études'
                          : situation === 'salarie'
                            ? 'Activité salariée'
                            : 'Besoin d’hébergement'}
                      </Pastille>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </Carte>

          <Carte
            titre="Pièces justificatives"
            mention={`${pieces.filter((piece) => piece.etatPiece === 'acceptee').length} / ${pieces.length} acceptées`}
          >
            <PiecesDuDossier id={id} pieces={pieces} modifiable={modifiable} />
          </Carte>

          <Carte titre="Journal du dossier">
            {journal.length === 0 ? (
              <p className="rounded-xl border border-dashed border-graphite-200 bg-paper-tint px-4 py-5 text-center text-[0.875rem] text-graphite-500">
                Aucun mouvement enregistré.
              </p>
            ) : (
              <ol className="flex flex-col">
                {journal.map((entree, index) => (
                  <li key={index} className="flex gap-4 border-b border-graphite-100 py-3 last:border-0">
                    <IconClock className="mt-0.5 h-4 w-4 shrink-0 text-gold-500" />
                    <span className="flex flex-1 flex-col">
                      <span className="text-[0.875rem] text-ink-800">{entree.action}</span>
                      <span className="text-[0.75rem] text-graphite-400">
                        {formatDate(entree.date, true)} · {entree.auteur}
                      </span>
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </Carte>
        </div>

        {/* ------------------------------------------------------ Commandes */}
        <div className="flex flex-col gap-5">
          <Carte titre="Avancement">
            <AvancementDossier id={id} etatCourant={valeur('etat') ?? ''} modifiable={modifiable} />
          </Carte>

          <Carte titre="Frais de dossier">
            <FraisDeDossier
              id={id}
              reference={valeur('referenceTransaction')}
              mode={valeur('modeReglement') ? (MODES[valeur('modeReglement') as string] ?? null) : null}
              verifiee={dossier.transactionVerifiee === true}
              modifiable={modifiable}
            />
          </Carte>

          <Carte titre="Décision d’admission">
            <DecisionDossier
              id={id}
              sensCourant={valeur('decisionSens')}
              modifiable={modifiable}
            />
            {valeur('decisionSens') ? (
              <p className="mt-4 border-t border-graphite-100 pt-4 text-[0.75rem] leading-relaxed text-graphite-500">
                Décision enregistrée le {formatDate(String(dossier.decisionDate ?? ''), true)}.
                {valeur('decisionConditions')
                  ? ` Conditions : ${valeur('decisionConditions')}`
                  : ''}
              </p>
            ) : null}
          </Carte>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function Bloc({
  titre,
  lignes,
}: {
  titre: string;
  lignes: readonly (readonly [string, string | null])[];
}) {
  return (
    <div>
      <p className="mb-3 text-[0.625rem] font-bold uppercase tracking-[0.14em] text-graphite-400">
        {titre}
      </p>
      <dl className="flex flex-col divide-y divide-graphite-100">
        {lignes.map(([terme, valeur]) => (
          <Ligne key={terme} terme={terme} valeur={valeur} />
        ))}
      </dl>
    </div>
  );
}

function Ligne({ terme, valeur }: { terme: string; valeur: string | null }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2.5">
      <dt className="shrink-0 text-[0.8125rem] text-graphite-500">{terme}</dt>
      <dd
        className={
          valeur ? 'text-right text-[0.875rem] text-ink-800' : 'text-right text-[0.875rem] text-graphite-300'
        }
      >
        {valeur ?? 'Non renseigné'}
      </dd>
    </div>
  );
}
