import type { Metadata } from 'next';
import { IconBriefcase, IconFile, IconShield } from '@/components/brand/icons';
import { Carte, EnTetePage, Pastille, Tuile, Vide } from '@/components/gestion/ui';
import { formatDate } from '@/lib/etats';
import { exigerRole, socle } from '@/lib/session';
import { ROLES_PIECES } from '@/payload/roles';

export const metadata: Metadata = { title: 'Pièces justificatives' };

const NATURES: Record<string, string> = {
  identite: 'Pièce d’identité',
  releve: 'Relevé de notes',
  diplome: 'Diplôme ou attestation',
  photo: 'Photographie d’identité',
  autre: 'Autre document',
};

function poids(octets: number | null): string {
  if (!octets) return '—';
  const mega = octets / (1024 * 1024);
  return mega >= 1 ? `${mega.toFixed(1)} Mo` : `${Math.round(octets / 1024)} Ko`;
}

/**
 * Pièces justificatives — CDC §20.2 et §22.1.
 *
 * « Conserver les pièces sur un espace de stockage protégé, jamais accessible
 * par une adresse publique », et « restreindre l'accès aux pièces d'identité
 * aux seuls rôles habilités ». Cet écran n'est donc ouvert qu'aux rôles
 * Admission et Scolarité, et l'accès y est vérifié côté serveur.
 */
export default async function PagePieces() {
  await exigerRole(ROLES_PIECES);
  const payload = await socle();

  const resultat = await payload
    .find({ collection: 'pieces', limit: 100, sort: '-createdAt', depth: 1, overrideAccess: true })
    .catch(() => ({ docs: [] as unknown[], totalDocs: 0 }));

  const pieces = resultat.docs.map((brut) => {
    const doc = brut as Record<string, unknown>;
    const depose = doc.deposePar as Record<string, string> | string | null;
    return {
      id: String(doc.id),
      nom: String(doc.filename ?? 'Document'),
      nature: NATURES[String(doc.nature ?? 'autre')] ?? 'Document',
      estIdentite: doc.nature === 'identite',
      taille: poids(typeof doc.filesize === 'number' ? doc.filesize : null),
      url: typeof doc.url === 'string' ? doc.url : null,
      depose:
        depose !== null && typeof depose === 'object'
          ? (depose.username ?? depose.email ?? 'Candidat')
          : null,
      consultations: Array.isArray(doc.consultations) ? doc.consultations.length : 0,
      creeLe: formatDate(doc.createdAt as string | undefined),
    };
  });

  const identites = pieces.filter((piece) => piece.estIdentite).length;

  return (
    <div className="flex flex-col gap-6">
      <EnTetePage
        surtitre="Admission"
        titre="Pièces justificatives"
        resume="Documents déposés par les candidats. Ils ne sont jamais accessibles par une adresse publique, et l’accès aux pièces d’identité est réservé aux rôles Admission et Scolarité."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Tuile etiquette="Documents déposés" valeur={pieces.length} icone={<IconFile />} ton="encre" />
        <Tuile
          etiquette="Pièces d’identité"
          valeur={identites}
          detail="Accès restreint et journalisé"
          icone={<IconShield />}
          ton="clair"
        />
        <Tuile
          etiquette="Consultations"
          valeur={pieces.reduce((somme, piece) => somme + piece.consultations, 0)}
          detail="Accès enregistrés"
          icone={<IconBriefcase />}
          ton="clair"
        />
      </div>

      {pieces.length === 0 ? (
        <Vide
          titre="Aucune pièce déposée"
          corps="Les documents déposés par les candidats depuis leur téléphone apparaîtront ici. Le format est contrôlé et les images sont allégées automatiquement."
        />
      ) : (
        <Carte className="p-2 lg:p-2.5">
          <div className="hidden grid-cols-[minmax(0,2.2fr)_minmax(0,1.4fr)_auto_auto_auto] gap-4 border-b border-graphite-100 px-3 pb-3 pt-2 text-[0.625rem] font-bold uppercase tracking-[0.14em] text-graphite-400 lg:grid">
            <span>Document</span>
            <span>Déposé par</span>
            <span>Nature</span>
            <span>Consultations</span>
            <span className="text-right">Déposé</span>
          </div>

          <ul>
            {pieces.map((piece) => (
              <li key={piece.id} className="border-b border-graphite-100 last:border-0">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 rounded-xl px-3 py-3.5 transition-colors hover:bg-paper-tint lg:grid-cols-[minmax(0,2.2fr)_minmax(0,1.4fr)_auto_auto_auto]">
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ink-800 text-gold-400">
                      <IconFile className="h-[1.125rem] w-[1.125rem]" />
                    </span>
                    <span className="flex min-w-0 flex-col">
                      {piece.url ? (
                        <a
                          href={piece.url}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="truncate text-[0.9375rem] font-semibold text-ink-800 transition-colors hover:text-ink-700"
                        >
                          {piece.nom}
                        </a>
                      ) : (
                        <span className="truncate text-[0.9375rem] font-semibold text-ink-800">
                          {piece.nom}
                        </span>
                      )}
                      <span className="text-[0.75rem] text-graphite-400">{piece.taille}</span>
                    </span>
                  </span>

                  <span className="hidden truncate text-[0.875rem] text-graphite-600 lg:block">
                    {piece.depose ?? 'Déposé par l’établissement'}
                  </span>

                  <Pastille ton={piece.estIdentite ? 'or' : 'neutre'}>{piece.nature}</Pastille>

                  <span className="hidden w-24 text-center text-[0.8125rem] tabular-nums text-graphite-500 lg:block">
                    {piece.consultations}
                  </span>

                  <span className="hidden w-24 text-right text-[0.75rem] tabular-nums text-graphite-400 lg:block">
                    {piece.creeLe}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </Carte>
      )}

      <p className="rounded-xl border-l-2 border-gold-400 bg-gold-50 px-4 py-3.5 text-[0.8125rem] leading-relaxed text-gold-800">
        Une pièce déposée n’est jamais effacée : elle est acceptée ou rejetée avec motif, ce qui
        laisse une trace exploitable en cas de litige. Chaque ouverture d’un document est enregistrée.
      </p>
    </div>
  );
}
