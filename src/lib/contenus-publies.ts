import { getPayload } from 'payload';
import config from '@payload-config';
import { enParagraphes } from './publications';
import type { Actualite as ActualitePayload, Evenement as EvenementPayload, Offre as OffrePayload } from '@/payload-types';

/* ==========================================================================
   Lecture des contenus éditoriaux par le site public
   --------------------------------------------------------------------------
   Le site ne connaît pas Payload : il reçoit d'ici des objets simples, dans
   la forme qu'utilisaient déjà ses gabarits. Deux conséquences utiles :

   — les pages n'ont pas changé de contrat en passant du fichier à la base ;
   — le filtrage — seul ce qui est publié, seule une offre non échue — est
     écrit une fois, ici, et ne peut donc pas être oublié sur une page.

   Les pages concernées restent statiques : elles sont régénérées à la
   publication par `revalidatePath`, depuis l'action éditoriale. Un visiteur ne
   paie donc pas une requête de base pour lire une actualité (§19.5).
   ========================================================================== */

export type ActualitePubliee = {
  readonly slug: string;
  readonly titre: string;
  readonly categorie: string;
  readonly date: string;
  readonly chapo: string;
  readonly corps: readonly string[];
};

export type EvenementPublie = {
  readonly slug: string;
  readonly titre: string;
  readonly date: string | null;
  readonly lieu: string;
  readonly resume: string;
  readonly inscriptionRequise: boolean;
};

export type OffrePubliee = {
  readonly slug: string;
  readonly intitule: string;
  readonly structure: string;
  readonly lieu: string;
  readonly type: 'stage' | 'emploi' | 'alternance';
  readonly dateLimite: string;
  readonly description: readonly string[];
  readonly contact: string;
};

async function base() {
  return getPayload({ config });
}

/** Aujourd'hui, à minuit, dans le fuseau de l'établissement. */
function aujourdhui(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function actualitesPubliees(limite = 50): Promise<readonly ActualitePubliee[]> {
  const payload = await base();
  const { docs } = await payload.find({
    collection: 'actualites',
    where: { etat: { equals: 'publie' } },
    sort: '-date',
    limit: limite,
    depth: 0,
    overrideAccess: true,
  });

  return (docs as ActualitePayload[]).map((doc) => ({
    slug: doc.slug ?? String(doc.id),
    titre: doc.titre,
    categorie: doc.categorie,
    date: doc.date,
    chapo: doc.chapo,
    corps: enParagraphes(doc.corps),
  }));
}

export async function actualitePubliee(slug: string): Promise<ActualitePubliee | null> {
  const toutes = await actualitesPubliees(200);
  return toutes.find((actualite) => actualite.slug === slug) ?? null;
}

export async function evenementsPublies(limite = 50): Promise<readonly EvenementPublie[]> {
  const payload = await base();
  const { docs } = await payload.find({
    collection: 'evenements',
    where: { etat: { equals: 'publie' } },
    // Les événements sans date passent en tête : ce sont les annonces les plus
    // récentes, celles dont le jour n'est pas encore arrêté.
    sort: 'date',
    limit: limite,
    depth: 0,
    overrideAccess: true,
  });

  return (docs as EvenementPayload[]).map((doc) => ({
    slug: doc.slug ?? String(doc.id),
    titre: doc.titre,
    date: doc.date ?? null,
    lieu: doc.lieu,
    resume: doc.resume,
    inscriptionRequise: doc.inscriptionRequise === true,
  }));
}

/**
 * Offres visibles du public — CDC §8.5.
 *
 * « Une offre échue disparaît de la liste. » C'est la date limite qui la
 * retire, pas une intervention : personne n'a à penser à archiver une offre
 * un lundi matin.
 */
export async function offresOuvertes(limite = 50): Promise<readonly OffrePubliee[]> {
  const payload = await base();
  const { docs } = await payload.find({
    collection: 'offres',
    where: {
      and: [{ etat: { equals: 'publie' } }, { dateLimite: { greater_than_equal: aujourdhui() } }],
    },
    sort: 'dateLimite',
    limit: limite,
    depth: 0,
    overrideAccess: true,
  });

  return (docs as OffrePayload[]).map((doc) => ({
    slug: doc.slug ?? String(doc.id),
    intitule: doc.intitule,
    structure: doc.structure,
    lieu: doc.lieu,
    type: doc.type,
    dateLimite: doc.dateLimite,
    description: enParagraphes(doc.description),
    contact: doc.contact,
  }));
}
