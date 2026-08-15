import { createHash } from 'node:crypto';
import type { Payload } from 'payload';

/* ==========================================================================
   Empreintes de pièces — Note complémentaire §5.4
   --------------------------------------------------------------------------
   « La dématérialisation supprime le contrôle visuel de l'original. Elle doit
   être compensée par des contrôles que le traitement papier ne permettait
   pas. »

   Le premier de ces contrôles est le seul que le papier rendait impossible :
   savoir qu'un même document a été déposé dans deux dossiers distincts. Sur
   papier, deux agents différents, deux jours différents, ne pouvaient pas le
   rapprocher. Une empreinte le rend immédiat.

   Ce que ce rapprochement ne fait pas : décider. Deux frères produisent
   légitimement le même certificat de résidence ; un candidat redépose
   légitimement sa pièce après un rejet. Le dispositif signale, l'agent
   tranche — c'est la règle générale du §5.4, « tout écart est signalé à
   l'agent, sans blocage automatique ».

   Une empreinte porte aussi une seconde vertu, celle-là défensive : elle
   atteste que le fichier conservé est bien celui qui a été déposé. « Les
   pièces déposées sont conservées telles quelles, avec leur date de dépôt et
   leur empreinte, ce qui rend toute contestation ultérieure arbitrable. »
   ========================================================================== */

export function empreinteDuFichier(octets: Buffer): string {
  return createHash('sha256').update(octets).digest('hex');
}

export type Jumelle = {
  readonly pieceId: string | number;
  readonly dossierReference: string | null;
  readonly dossierId: string | number;
  readonly nom: string | null;
  readonly deposeLe: string | null;
};

/**
 * Les autres dossiers où figure exactement le même fichier.
 *
 * La recherche part de l'empreinte, remonte aux pièces qui la portent, puis
 * aux candidatures qui les citent — dans l'un des cinq champs de pièce du
 * dossier. Le dossier d'origine est exclu du résultat : se ressembler à
 * soi-même n'est pas un signalement.
 */
export async function dossiersPartageant(
  payload: Payload,
  empreinte: string,
  saufDossier: string | number,
): Promise<readonly Jumelle[]> {
  if (!empreinte) return [];

  const { docs: pieces } = await payload.find({
    collection: 'pieces',
    where: { empreinte: { equals: empreinte } },
    limit: 20,
    depth: 0,
    overrideAccess: true,
  });

  if (pieces.length === 0) return [];

  const identifiants = pieces.map((piece) => piece.id);

  const { docs: dossiers } = await payload.find({
    collection: 'candidatures',
    where: {
      and: [
        { id: { not_equals: saufDossier } },
        {
          or: [
            { photo: { in: identifiants } },
            { pieceRecto: { in: identifiants } },
            { pieceVerso: { in: identifiants } },
            { pieceSelfie: { in: identifiants } },
            { 'pieces.fichier': { in: identifiants } },
          ],
        },
      ],
    },
    limit: 10,
    depth: 0,
    overrideAccess: true,
  });

  return dossiers.map((dossier) => {
    const brut = dossier as unknown as Record<string, unknown>;
    return {
      pieceId: identifiants[0] ?? '',
      dossierId: dossier.id,
      dossierReference: (brut.reference as string | null) ?? null,
      nom: (brut.nomCandidat as string | null) ?? (brut.nom as string | null) ?? null,
      deposeLe: (brut.createdAt as string | null) ?? null,
    };
  });
}

/* --------------------------------------------------------------------------
   L'empreinte d'une signature — §5.1, étape 6
   -------------------------------------------------------------------------- */

/**
 * L'empreinte technique d'une signature.
 *
 * « Le dispositif conserve le document signé, la date, l'heure et l'empreinte
 * technique de la signature. »
 *
 * Elle porte sur quatre choses indissociables : le texte intégral tel qu'il a
 * été affiché, sa version, l'identité du signataire et l'horodatage. Changer
 * l'une quelconque change l'empreinte — ce qui est exactement ce qu'on attend
 * d'une signature.
 *
 * Le texte n'est pas recopié pour chaque étudiant : il est reconstituable
 * depuis sa version, et l'empreinte atteste qu'il n'a pas bougé entre
 * l'affichage et la signature. En conserver une copie par étudiant pèserait
 * sans rien prouver de plus.
 */
export function empreinteSignature(elements: {
  readonly version: string;
  readonly textes: readonly {
    readonly titre: string;
    readonly articles: readonly { readonly titre: string; readonly texte: string }[];
  }[];
  readonly signataire: string;
  readonly dossier: string;
  readonly horodatage: string;
}): string {
  const corps = elements.textes
    .map((document) =>
      [
        document.titre,
        ...document.articles.map((article) => `${article.titre}\n${article.texte}`),
      ].join('\n'),
    )
    .join('\n\n');

  return createHash('sha256')
    .update(
      [
        elements.version,
        corps,
        elements.signataire,
        elements.dossier,
        elements.horodatage,
      ].join('\u0000'),
    )
    .digest('hex');
}
