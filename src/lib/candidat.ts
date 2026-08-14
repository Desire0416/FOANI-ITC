import { headers as entetes } from 'next/headers';
import { cache } from 'react';
import { redirect } from 'next/navigation';
import { getPayload } from 'payload';
import config from '@payload-config';
import type { Candidature } from '@/payload-types';

/* ==========================================================================
   Session d'un candidat — CDC §10.1
   --------------------------------------------------------------------------
   Même principe que pour les agents : la vérification a lieu sur le serveur,
   à chaque page, avant que quoi que ce soit ne soit rendu. Un candidat ne
   consulte jamais que son propre dossier, et cette garantie ne repose pas sur
   les liens qu'on lui montre.

   Payload range les deux publics dans deux collections distinctes —
   `utilisateurs` pour l'établissement, `candidats` pour les postulants — mais
   n'émet qu'un seul témoin de session. Les deux espaces ne peuvent donc pas
   être ouverts en même temps dans un même navigateur ; en revanche, aucune
   confusion de droits n'est possible : chaque garde exige explicitement sa
   collection, et un agent connecté n'est pas un candidat.
   ========================================================================== */

export type Candidat = {
  readonly id: string;
  /** Identifiant de connexion : numéro de téléphone, ou adresse. */
  readonly identifiant: string;
  readonly courriel: string | null;
  readonly telephone: string | null;
};

/** Candidat connecté, ou `null`. Ne redirige pas. */
export async function candidatConnecte(): Promise<Candidat | null> {
  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers: await entetes() });

  if (!user || user.collection !== 'candidats') return null;

  const brut = user as unknown as Record<string, unknown>;

  return {
    id: String(brut.id),
    identifiant: String(brut.username ?? brut.email ?? ''),
    courriel: brut.email ? String(brut.email) : null,
    telephone: brut.telephone ? String(brut.telephone) : null,
  };
}

/** Candidat connecté, ou renvoi vers l'écran d'accès. */
export async function exigerCandidat(): Promise<Candidat> {
  const candidat = await candidatConnecte();
  if (!candidat) redirect('/mon-dossier/connexion');
  return candidat;
}

/**
 * Dossier du candidat, s'il en a un.
 *
 * Le CDC ne prévoit qu'une candidature par compte et par session d'entrée
 * (§10.1, un premier et un second vœu dans le même dossier). En cas de
 * pluralité — un dossier repris par la scolarité, par exemple —, on retient
 * le plus récent, qui est celui que le candidat est en train de remplir.
 *
 * Mémorisé le temps d'une requête. La coque lit le dossier pour composer la
 * navigation, la page le relit pour l'afficher : sans cette mémorisation,
 * chaque navigation coûterait deux fois la même interrogation de base. Sur le
 * réseau visé, c'est du temps que le candidat voit passer.
 */
export const dossierCourant = cache(async function dossierCourant(
  candidatId: string,
): Promise<Candidature | null> {
  const payload = await getPayload({ config });

  const { docs } = await payload.find({
    collection: 'candidatures',
    where: { candidat: { equals: candidatId } },
    sort: '-createdAt',
    limit: 1,
    depth: 1,
    overrideAccess: false,
    user: { id: Number(candidatId), collection: 'candidats' } as never,
  });

  return docs[0] ?? null;
});

/** Candidat connecté et son dossier. Le dossier peut ne pas exister encore. */
export async function sessionCandidat(): Promise<{
  readonly candidat: Candidat;
  readonly dossier: Candidature | null;
}> {
  const candidat = await exigerCandidat();
  return { candidat, dossier: await dossierCourant(candidat.id) };
}

/**
 * Candidat connecté disposant d'un dossier ouvert.
 * Sans dossier, on renvoie à l'accueil du portail, qui se charge de le créer.
 */
export async function exigerDossier(): Promise<{
  readonly candidat: Candidat;
  readonly dossier: Candidature;
}> {
  const { candidat, dossier } = await sessionCandidat();
  if (!dossier) redirect('/mon-dossier');
  return { candidat, dossier };
}

/** Instance Payload pour les lectures côté serveur du portail. */
export async function socleCandidat() {
  return getPayload({ config });
}
