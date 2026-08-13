/* ==========================================================================
   Amorçage des contenus éditoriaux
   --------------------------------------------------------------------------
   Reprend dans la base les actualités et les événements qui vivaient jusqu'ici
   dans `src/content/institution.ts`, afin que le site ne se retrouve pas vide
   au moment où il cesse de lire le fichier.

   Le script est idempotent : il s'appuie sur l'adresse de page (`slug`), qui
   est unique. Relancé, il ne crée pas de doublon et ne réécrit pas un texte
   que l'établissement aurait modifié depuis.

   Usage :
     pnpm amorcer-editorial
   ========================================================================== */

export {}; // fait de ce fichier un module ES, condition du `await` de haut niveau

const { getPayload } = await import('payload');
const { default: config } = await import('../src/payload.config.js');
const { ACTUALITES, EVENEMENTS } = await import('../src/content/institution.js');

const payload = await getPayload({ config });

/** Vrai si un contenu portant cette adresse existe déjà. */
async function dejaLa(collection: 'actualites' | 'evenements', slug: string): Promise<boolean> {
  const { totalDocs } = await payload.count({
    collection,
    where: { slug: { equals: slug } },
    overrideAccess: true,
  });
  return totalDocs > 0;
}

let actualitesCreees = 0;

for (const actualite of ACTUALITES) {
  if (await dejaLa('actualites', actualite.slug)) continue;

  await payload.create({
    collection: 'actualites',
    data: {
      titre: actualite.titre,
      slug: actualite.slug,
      // Les catégories du fichier étaient des libellés ; la base range par clé.
      categorie: 'etablissement',
      date: actualite.date,
      chapo: actualite.chapo,
      // Le corps était un tableau de paragraphes : on le remet à plat, une
      // ligne vide entre deux, forme attendue par l'éditeur.
      corps: actualite.corps.join('\n\n'),
      etat: 'publie',
      publieLe: actualite.date,
    } as never,
    overrideAccess: true,
  });
  actualitesCreees += 1;
}

let evenementsCrees = 0;

for (const evenement of EVENEMENTS) {
  if (await dejaLa('evenements', evenement.slug)) continue;

  await payload.create({
    collection: 'evenements',
    data: {
      titre: evenement.titre,
      slug: evenement.slug,
      date: evenement.date,
      lieu: evenement.lieu,
      resume: evenement.resume,
      inscriptionRequise: evenement.inscriptionRequise,
      etat: 'publie',
      publieLe: new Date().toISOString(),
    } as never,
    overrideAccess: true,
  });
  evenementsCrees += 1;
}

console.log(`Actualités reprises : ${actualitesCreees} / ${ACTUALITES.length}`);
console.log(`Événements repris  : ${evenementsCrees} / ${EVENEMENTS.length}`);
console.log('Les contenus sont désormais modifiables depuis /gestion/publications.');
process.exit(0);
