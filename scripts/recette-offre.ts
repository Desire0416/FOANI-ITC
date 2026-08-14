/* ==========================================================================
   Recette : ouvrir une offre en cours
   --------------------------------------------------------------------------
   Place le dossier indiqué en « Admis » avec sa date limite normale, pour
   éprouver le parcours de l'admis : acceptation par code, puis annonce du
   versement. Sans DOSSIER, liste les dossiers et leur état.

   Usage :
     pnpm recette-offre
     DOSSIER=D000004 pnpm recette-offre
   ========================================================================== */

export {};

const { getPayload } = await import('payload');
const { default: config } = await import('../src/payload.config.js');

const payload = await getPayload({ config });
const reference = process.env.DOSSIER;

if (!reference) {
  const { docs } = await payload.find({
    collection: 'candidatures',
    limit: 50,
    depth: 0,
    sort: 'reference',
    overrideAccess: true,
  });
  for (const d of docs) {
    console.log(`${d.reference}	${d.etat}	${d.nom ?? ''} ${d.prenoms ?? ''}	${d.telephone ?? ''}`);
  }
  process.exit(0);
}

const { docs } = await payload.find({
  collection: 'candidatures',
  where: { reference: { equals: reference } },
  limit: 1,
  depth: 0,
  overrideAccess: true,
});

const dossier = docs[0];
if (!dossier) {
  console.error(`Dossier ${reference} introuvable.`);
  process.exit(1);
}

await payload.update({
  collection: 'candidatures',
  id: dossier.id,
  data: { etat: 'admis', decisionSens: 'admis' } as never,
  overrideAccess: true,
  context: { auteurImpose: 'Recette' },
});

const apres = await payload.findByID({
  collection: 'candidatures',
  id: dossier.id,
  depth: 0,
  overrideAccess: true,
});

console.log(`Dossier ${reference} placé en « ${apres.etat} ». Limite : ${apres.limiteAcceptation}`);
process.exit(0);
