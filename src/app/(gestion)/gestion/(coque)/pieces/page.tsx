import type { Metadata } from 'next';
import Link from 'next/link';
import {
  IconArrowRight,
  IconArrowUpRight,
  IconCheck,
  IconClock,
  IconClose,
  IconFile,
  IconShield,
} from '@/components/brand/icons';
import { EnTetePage, Pastille, Tuile, Vide } from '@/components/gestion/ui';
import { CYCLE_LABELS, getFormation, titreComplet } from '@/content/formations';
import { formatDate } from '@/lib/etats';
import { exigerRole, socle } from '@/lib/session';
import { ROLES_PIECES } from '@/payload/roles';
import { cn } from '@/lib/utils';

export const metadata: Metadata = { title: 'Pièces justificatives' };

const NATURES: Record<string, string> = {
  identite: 'Pièce d’identité',
  releve: 'Relevé de notes',
  diplome: 'Diplôme ou attestation',
  photo: 'Photographie d’identité',
  autre: 'Autre document',
};

const ETATS_PIECE = {
  attente: { libelle: 'En attente d’examen', ton: 'neutre', icone: IconClock },
  acceptee: { libelle: 'Acceptée', ton: 'vert', icone: IconCheck },
  rejetee: { libelle: 'À refaire', ton: 'rouge', icone: IconClose },
} as const;

type CleEtat = keyof typeof ETATS_PIECE;

const VUES = [
  { cle: 'toutes', libelle: 'Toutes' },
  { cle: 'attente', libelle: 'À examiner' },
  { cle: 'acceptee', libelle: 'Acceptées' },
  { cle: 'rejetee', libelle: 'À refaire' },
  { cle: 'identite', libelle: 'Pièces d’identité' },
] as const;

function poids(octets: unknown): string {
  if (typeof octets !== 'number' || octets === 0) return '—';
  const mega = octets / (1024 * 1024);
  return mega >= 1 ? `${mega.toFixed(1)} Mo` : `${Math.round(octets / 1024)} Ko`;
}

type Piece = {
  readonly id: string;
  readonly nom: string;
  readonly nature: string;
  readonly estIdentite: boolean;
  readonly taille: string;
  readonly etat: CleEtat;
  readonly motif: string | null;
  readonly consultations: number;
  readonly deposeLe: string;
};

type Dossier = {
  readonly cle: string;
  readonly reference: string | null;
  readonly candidat: string;
  readonly identifiant: string | null;
  readonly formation: string | null;
  readonly lien: string | null;
  readonly pieces: Piece[];
};

/**
 * Pièces justificatives — CDC §20.2 et §22.1.
 *
 * L'écran ne liste plus des fichiers : il liste des **dossiers**, et sous
 * chacun les pièces qui lui appartiennent. Une liste de noms de fichiers ne
 * dit rien — « WhatsApp Image 2026-08-12.jpeg » n'apprend à personne de qui
 * il s'agit, et un agent devait deviner en recoupant un numéro de téléphone.
 * Le rattachement est ce qui rend cette page utilisable.
 *
 * Les décisions sur une pièce — accepter, rejeter avec motif — restent à
 * l'écran d'instruction : on ne statue pas sur un document sans voir le
 * dossier qui le porte. Cette page mène donc au dossier, et permet d'ouvrir
 * chaque document ; c'est tout ce qu'elle prétend faire.
 */
export default async function PagePieces({
  searchParams,
}: {
  searchParams: Promise<{ vue?: string }>;
}) {
  await exigerRole(ROLES_PIECES);
  const { vue = 'toutes' } = await searchParams;
  const payload = await socle();

  /* Les candidatures portent le rattachement : chaque dossier connaît ses
     pièces, leur état et le motif d'un refus. On part donc d'elles. */
  const candidatures = await payload
    .find({
      collection: 'candidatures',
      limit: 500,
      sort: '-updatedAt',
      depth: 2,
      overrideAccess: true,
    })
    .then((resultat) => resultat.docs as unknown as Record<string, unknown>[])
    .catch(() => [] as Record<string, unknown>[]);

  const rattachees = new Set<string>();
  const dossiers: Dossier[] = [];

  for (const brut of candidatures) {
    const lignes = (brut.pieces as Record<string, unknown>[] | null) ?? [];
    if (lignes.length === 0) continue;

    const formation = typeof brut.voeu1 === 'string' ? getFormation(brut.voeu1) : undefined;
    const compte = brut.candidat as Record<string, string> | null;

    const pieces: Piece[] = [];

    for (const ligne of lignes) {
      const fichier = ligne.fichier as Record<string, unknown> | number | null;
      if (fichier === null || typeof fichier !== 'object') continue;

      const id = String(fichier.id);
      rattachees.add(id);

      pieces.push({
        id,
        nom: String(fichier.filename ?? 'Document'),
        nature: NATURES[String(fichier.nature ?? 'autre')] ?? 'Document',
        estIdentite: fichier.nature === 'identite',
        taille: poids(fichier.filesize),
        etat: (String(ligne.etatPiece ?? 'attente') as CleEtat) in ETATS_PIECE
          ? (String(ligne.etatPiece ?? 'attente') as CleEtat)
          : 'attente',
        motif: typeof ligne.motif === 'string' && ligne.motif ? ligne.motif : null,
        consultations: Array.isArray(fichier.consultations) ? fichier.consultations.length : 0,
        deposeLe: formatDate(fichier.createdAt as string | undefined),
      });
    }

    if (pieces.length === 0) continue;

    dossiers.push({
      cle: `candidature-${brut.id}`,
      reference: typeof brut.reference === 'string' ? brut.reference : null,
      candidat: String(brut.nomCandidat || 'Candidat sans nom'),
      identifiant: compte?.username ?? compte?.email ?? null,
      formation: formation ? `${CYCLE_LABELS[formation.cycle]} — ${titreComplet(formation)}` : null,
      lien: `/gestion/candidatures/${brut.id}`,
      pieces,
    });
  }

  /* Un document peut exister sans dossier : déposé puis retiré du dossier par
     le candidat, ou versé par la scolarité lors d'une reprise. Il n'est jamais
     effacé (§10.3) — il ne doit donc pas non plus disparaître de cet écran. */
  const orphelines = await payload
    .find({ collection: 'pieces', limit: 200, sort: '-createdAt', depth: 1, overrideAccess: true })
    .then((resultat) => resultat.docs as unknown as Record<string, unknown>[])
    .catch(() => [] as Record<string, unknown>[]);

  const detachees: Piece[] = orphelines
    .filter((doc) => !rattachees.has(String(doc.id)))
    .map((doc) => ({
      id: String(doc.id),
      nom: String(doc.filename ?? 'Document'),
      nature: NATURES[String(doc.nature ?? 'autre')] ?? 'Document',
      estIdentite: doc.nature === 'identite',
      taille: poids(doc.filesize),
      etat: 'attente' as CleEtat,
      motif: null,
      consultations: Array.isArray(doc.consultations) ? doc.consultations.length : 0,
      deposeLe: formatDate(doc.createdAt as string | undefined),
    }));

  if (detachees.length > 0) {
    dossiers.push({
      cle: 'detachees',
      reference: null,
      candidat: 'Documents non rattachés à un dossier',
      identifiant: null,
      formation: null,
      lien: null,
      pieces: detachees,
    });
  }

  /* -------------------------------------------------------------- Filtre */
  const retenue = (piece: Piece) => {
    if (vue === 'identite') return piece.estIdentite;
    if (vue === 'toutes') return true;
    return piece.etat === vue;
  };

  const filtres = dossiers
    .map((dossier) => ({ ...dossier, pieces: dossier.pieces.filter(retenue) }))
    .filter((dossier) => dossier.pieces.length > 0);

  /* ------------------------------------------------------------ Compteurs */
  const toutes = dossiers.flatMap((dossier) => dossier.pieces);
  const compte = (cle: CleEtat) => toutes.filter((piece) => piece.etat === cle).length;

  return (
    <div className="flex flex-col gap-6">
      <EnTetePage
        surtitre="Admission"
        titre="Pièces justificatives"
        resume="Les documents déposés, rangés sous le dossier auquel ils appartiennent. Chaque ouverture est enregistrée, et l’accès est réservé aux rôles Admission et Scolarité."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Tuile
          etiquette="Documents déposés"
          valeur={toutes.length}
          detail={`Répartis sur ${filtres.length || dossiers.length} dossier${dossiers.length > 1 ? 's' : ''}`}
          icone={<IconFile />}
          ton="encre"
        />
        <Tuile
          etiquette="À examiner"
          valeur={compte('attente')}
          detail="En attente d’une décision"
          icone={<IconClock />}
          ton="or"
          href="/gestion/pieces?vue=attente"
        />
        <Tuile
          etiquette="À refaire"
          valeur={compte('rejetee')}
          detail="Refusées, en attente du candidat"
          icone={<IconClose />}
          ton="ambre"
          href="/gestion/pieces?vue=rejetee"
        />
        <Tuile
          etiquette="Pièces d’identité"
          valeur={toutes.filter((piece) => piece.estIdentite).length}
          detail="Accès restreint et journalisé"
          icone={<IconShield />}
          ton="vert"
          href="/gestion/pieces?vue=identite"
        />
      </div>

      {/* ------------------------------------------------------------ Filtres */}
      <nav aria-label="Filtrer les pièces" className="flex flex-wrap gap-2">
        {VUES.map((item) => (
          <Link
            key={item.cle}
            href={`/gestion/pieces?vue=${item.cle}`}
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

      {/* ------------------------------------------------------------- Liste */}
      {filtres.length === 0 ? (
        <Vide
          titre={vue === 'toutes' ? 'Aucune pièce déposée' : 'Aucune pièce dans cette vue'}
          corps={
            vue === 'toutes'
              ? 'Les documents déposés par les candidats depuis leur téléphone apparaîtront ici, rangés sous leur dossier.'
              : 'Essayez un autre filtre : les documents existent peut-être dans un autre état.'
          }
          action={vue === 'toutes' ? undefined : { libelle: 'Voir toutes les pièces', href: '/gestion/pieces' }}
        />
      ) : (
        <div className="flex flex-col gap-4">
          {filtres.map((dossier) => (
            <section key={dossier.cle} className="carte overflow-hidden">
              {/* ------------------------------------------------ Le dossier */}
              <header className="flex flex-wrap items-center gap-x-5 gap-y-3 border-b border-graphite-100 bg-paper-tint px-5 py-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ink-800 font-display text-[0.8125rem] text-gold-400">
                  {dossier.reference ? dossier.reference.slice(-3) : '—'}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block text-[1rem] font-semibold text-ink-800">{dossier.candidat}</span>
                  <span className="mt-0.5 block truncate text-[0.8125rem] text-graphite-500">
                    {[dossier.reference, dossier.identifiant, dossier.formation]
                      .filter(Boolean)
                      .join(' · ')}
                  </span>
                </span>

                <span className="text-[0.8125rem] text-graphite-500">
                  {dossier.pieces.length} document{dossier.pieces.length > 1 ? 's' : ''}
                </span>

                {dossier.lien ? (
                  <Link href={dossier.lien} className="bouton bouton--contour h-10 px-4 text-[0.8125rem]">
                    Ouvrir le dossier
                    <IconArrowRight className="h-4 w-4" />
                  </Link>
                ) : null}
              </header>

              {/* ------------------------------------------------ Les pièces */}
              <ul className="divide-y divide-graphite-100">
                {dossier.pieces.map((piece) => {
                  const etat = ETATS_PIECE[piece.etat];
                  const Icone = etat.icone;

                  return (
                    <li
                      key={piece.id}
                      className="flex flex-wrap items-center gap-x-5 gap-y-3 px-5 py-4 transition-colors hover:bg-paper-tint"
                    >
                      <span
                        className={cn(
                          'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                          piece.estIdentite ? 'bg-gold-100 text-gold-700' : 'bg-ink-50 text-ink-700',
                        )}
                      >
                        <IconFile className="h-[1.125rem] w-[1.125rem]" />
                      </span>

                      <span className="min-w-0 flex-1 basis-64">
                        <span className="block truncate text-[0.9375rem] font-semibold text-ink-800">
                          {piece.nom}
                        </span>
                        <span className="mt-0.5 block text-[0.75rem] text-graphite-500">
                          {piece.nature} · {piece.taille} · déposé le {piece.deposeLe}
                        </span>
                        {piece.motif ? (
                          <span className="mt-1.5 block text-[0.8125rem] leading-snug text-state-danger">
                            Motif du refus : {piece.motif}
                          </span>
                        ) : null}
                      </span>

                      {/* L'icône remplace la pastille de couleur : elle porte
                          l'état sans dépendre de la seule teinte (§18.3). */}
                      <Pastille ton={etat.ton}>
                        <Icone className="h-3.5 w-3.5" />
                        {etat.libelle}
                      </Pastille>

                      <span
                        className="w-28 text-right text-[0.75rem] text-graphite-500 tabular-nums"
                        title="Nombre d’ouvertures enregistrées"
                      >
                        {piece.consultations} consultation{piece.consultations > 1 ? 's' : ''}
                      </span>

                      {/* L'ouverture passe par une adresse qui journalise puis
                          redirige : le registre du §20.2 ne se contourne pas. */}
                      <a
                        href={`/gestion/pieces/${piece.id}/ouvrir`}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="bouton bouton--contour h-10 shrink-0 px-4 text-[0.8125rem]"
                      >
                        Ouvrir
                        <IconArrowUpRight className="h-4 w-4" />
                      </a>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}

      <p className="rounded-xl border-l-2 border-gold-400 bg-gold-50 px-4 py-3.5 text-[0.8125rem] leading-relaxed text-gold-800">
        Une pièce déposée n’est jamais effacée : elle est acceptée ou rejetée avec motif depuis
        l’écran du dossier, ce qui laisse une trace exploitable en cas de litige. Chaque ouverture
        d’un document est enregistrée, avec son auteur et sa date.
      </p>
    </div>
  );
}
