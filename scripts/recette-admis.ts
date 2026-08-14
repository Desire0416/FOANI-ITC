/* ==========================================================================
   Recette : un compte candidat admis, prêt à éprouver le parcours
   --------------------------------------------------------------------------
   Repose le mot de passe du candidat propriétaire du dossier indiqué et
   remet ce dossier en « Admis », date limite fraîche. Sert uniquement à
   éprouver les étapes 2 et 3 du chapitre 5 sans attendre une décision.

   Usage :
     DOSSIER=D000004 MOTDEPASSE=Recette2026! pnpm recette-admis
   ========================================================================== */

export {};

const { getPayload } = await import('payload');
const { default: config } = await import('../src/payload.config.js');

const reference = process.env.DOSSIER;
const motDePasse = process.env.MOTDEPASSE;
if (!reference || !motDePasse) {
  console.error('DOSSIER et MOTDEPASSE sont requis.');
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

const candidatId = typeof dossier.candidat === 'object' && dossier.candidat
  ? (dossier.candidat as { id: string | number }).id
  : dossier.candidat;

if (!candidatId) {
  console.error(`Le dossier ${reference} n'est rattaché à aucun compte.`);
  process.exit(1);
}

const candidat = await payload.update({
  collection: 'candidats',
  id: candidatId as string,
  data: { password: motDePasse } as never,
  overrideAccess: true,
});

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

console.log(`Compte : ${(candidat as { email?: string }).email}`);
console.log(`Dossier ${reference} : ${apres.etat}, limite ${apres.limiteAcceptation}`);
process.exit(0);
