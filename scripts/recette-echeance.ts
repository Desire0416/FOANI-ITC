/* ==========================================================================
   Recette : fabriquer une offre expirée
   --------------------------------------------------------------------------
   Éprouve la règle RG-45 sans attendre quinze jours. Place le dossier indiqué
   en « Admis » avec une date limite déjà passée, pour vérifier qu'il remonte
   bien dans les échéances du poste Admission et qu'il bascule en désistement.

   Usage :
     DOSSIER=D000002 pnpm recette-echeance
   ========================================================================== */

export {};

const { getPayload } = await import('payload');
const { default: config } = await import('../src/payload.config.js');

const reference = process.env.DOSSIER;
if (!reference) {
  console.error('DOSSIER est requis. Exemple : DOSSIER=D000002 pnpm recette-echeance');
  process.exit(1);
}

const payload = await getPayload({ config });

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

/* En deux temps, et c'est instructif : le crochet de la collection pose
   lui-même la date limite au moment où l'offre est faite, et écrase donc
   celle qu'on lui donnerait dans la même écriture. C'est exactement ce qu'on
   veut — une échéance ne se choisit pas depuis l'extérieur. On recule donc la
   date par une seconde écriture, qui ne touche pas à l'état. */
await payload.update({
  collection: 'candidatures',
  id: dossier.id,
  data: { etat: 'admis', decisionSens: 'admis' } as never,
  overrideAccess: true,
  context: { auteurImpose: 'Recette' },
});

const hier = new Date();
hier.setDate(hier.getDate() - 1);

await payload.update({
  collection: 'candidatures',
  id: dossier.id,
  data: { limiteAcceptation: hier.toISOString() } as never,
  overrideAccess: true,
});

console.log(`Dossier ${reference} placé en « Admis », délai expiré depuis le ${hier.toLocaleDateString('fr-FR')}.`);
process.exit(0);
