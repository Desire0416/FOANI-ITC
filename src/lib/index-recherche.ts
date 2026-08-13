import { CYCLE_LABELS, FORMATIONS, titreComplet } from '@/content/formations';
import { EXPERTISES } from '@/content/institution';
import { actualitesPubliees, evenementsPublies } from '@/lib/contenus-publies';
import { LIBELLE_CATEGORIE } from '@/lib/publications';
import { RESSOURCES } from '@/content/ressources';
import { NAVIGATION, RECHERCHE_ACTIVE } from '@/content/site';
import { normalize } from '@/lib/utils';
import type { Resultat } from '@/lib/recherche-types';

export type { Resultat, TypeResultat } from '@/lib/recherche-types';
export { LIBELLES_TYPE } from '@/lib/recherche-types';

/* ==========================================================================
   Index de la recherche globale — §8.10 et §19.4
   --------------------------------------------------------------------------
   « Le moteur de recherche interne constitue un service du portail et non un
   simple champ décoratif. » L'index couvre donc les formations, les pages,
   les actualités, les événements, les ressources agricoles et l'offre
   d'expertise — et rien d'autre : aucun contenu d'espace privé n'y entre.

   L'index est construit à la compilation, à partir des mêmes sources que les
   pages. Il ne peut donc pas diverger de ce qui est publié.
   ========================================================================== */


function entree(
  brut: Omit<Resultat, 'cle'> & { readonly motsCles?: readonly string[] },
): Resultat {
  const { motsCles = [], ...reste } = brut;
  return {
    ...reste,
    cle: normalize([reste.titre, reste.resume, reste.categorie, ...motsCles].join(' ')),
  };
}

export async function construireIndex(): Promise<readonly Resultat[]> {
  const formations = FORMATIONS.map((formation) =>
    entree({
      id: `formation-${formation.slug}`,
      titre: titreComplet(formation),
      resume: formation.resume,
      url: `/formations/${formation.slug}`,
      type: 'formation',
      categorie: CYCLE_LABELS[formation.cycle],
      motsCles: [...formation.competences, ...formation.debouches, formation.diplome],
    }),
  );

  const ressources = RESSOURCES.map((ressource) =>
    entree({
      id: `ressource-${ressource.slug}`,
      titre: ressource.titre,
      resume: ressource.resume,
      url: `/ressources/${ressource.slug}`,
      type: 'ressource',
      categorie: ressource.filiere,
      motsCles: ressource.sections.map((section) => section.titre),
    }),
  );

  const actualites = (await actualitesPubliees(200)).map((actualite) =>
    entree({
      id: `actualite-${actualite.slug}`,
      titre: actualite.titre,
      resume: actualite.chapo,
      url: `/actualites/${actualite.slug}`,
      type: 'actualite',
      categorie: LIBELLE_CATEGORIE[actualite.categorie] ?? actualite.categorie,
    }),
  );

  const evenements = (await evenementsPublies(200)).map((evenement) =>
    entree({
      id: `evenement-${evenement.slug}`,
      titre: evenement.titre,
      resume: evenement.resume,
      url: '/evenements',
      type: 'evenement',
      categorie: evenement.lieu,
    }),
  );

  const expertises = EXPERTISES.map((offre) =>
    entree({
      id: `expertise-${offre.slug}`,
      titre: offre.intitule,
      resume: offre.resume,
      url: '/expertise#offres',
      type: 'expertise',
      categorie: offre.volet === 'vegetale' ? 'Production végétale' : 'Production animale',
      motsCles: offre.prestations,
    }),
  );

  // Les pages structurantes, tirées de la navigation : l'index suit
  // l'arborescence réelle plutôt qu'une liste tenue à la main en parallèle.
  const pages = NAVIGATION.flatMap((rubrique) => [
    entree({
      id: `page-${rubrique.href}`,
      titre: rubrique.libelle,
      resume: rubrique.resume,
      url: rubrique.href,
      type: 'page',
      categorie: 'Rubrique',
    }),
    ...rubrique.colonnes.flatMap((colonne) =>
      colonne.liens
        // Les ancres et les doublons de la rubrique elle-même n'apportent rien.
        .filter((lien) => !lien.href.includes('#') && lien.href !== rubrique.href)
        .map((lien) =>
          entree({
            id: `page-${lien.href}-${lien.libelle}`,
            titre: lien.libelle,
            resume: lien.description ?? rubrique.resume,
            url: lien.href,
            type: 'page',
            categorie: rubrique.libelle,
          }),
        ),
    ),
  ]);

  const dedoublonnees = new Map<string, Resultat>();
  for (const item of [...formations, ...ressources, ...actualites, ...evenements, ...expertises, ...pages]) {
    if (item.type === 'page' && dedoublonnees.has(item.url)) continue;
    dedoublonnees.set(item.type === 'page' ? item.url : item.id, item);
  }

  const index = [...dedoublonnees.values()];
  return RECHERCHE_ACTIVE ? index : index.filter((item) => !item.url.startsWith('/recherche-innovation'));
}
