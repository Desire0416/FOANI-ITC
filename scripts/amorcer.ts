/* ==========================================================================
   Amorçage du dispositif
   --------------------------------------------------------------------------
   Crée le premier compte administrateur à partir de variables
   d'environnement, jamais de valeurs écrites dans le dépôt.

   Le script est idempotent : relancé, il ne crée pas de doublon. Il fait
   partie des procédures d'exploitation remises à l'établissement (§21.4) —
   un correspondant technique doit pouvoir reconstituer un accès après une
   restauration sans dépendre du prestataire.

   Usage :
     ADMIN_EMAIL=… ADMIN_MOT_DE_PASSE=… pnpm amorcer

   La configuration est chargée par import dynamique : sous `payload run`, un
   import statique de `payload.config` interrompt le script sans message.
   ========================================================================== */

export {}; // fait de ce fichier un module ES, condition du `await` de haut niveau

const { getPayload } = await import('payload');
const { default: config } = await import('../src/payload.config.js');

const email = process.env.ADMIN_EMAIL;
const motDePasse = process.env.ADMIN_MOT_DE_PASSE;
const nom = process.env.ADMIN_NOM ?? 'Administrateur';
const prenoms = process.env.ADMIN_PRENOMS ?? 'FOANI-ITC';

if (!email || !motDePasse) {
  console.error(
    'ADMIN_EMAIL et ADMIN_MOT_DE_PASSE sont requis.\n' +
      'Exemple : ADMIN_EMAIL=scolarite@… ADMIN_MOT_DE_PASSE=… pnpm amorcer',
  );
  process.exit(1);
}

if (motDePasse.length < 12) {
  console.error('Le mot de passe doit compter au moins douze caractères.');
  process.exit(1);
}

const payload = await getPayload({ config });

const existants = await payload.find({
  collection: 'utilisateurs',
  where: { email: { equals: email } },
  limit: 1,
  overrideAccess: true,
});

if (existants.docs.length > 0) {
  console.log(`Le compte ${email} existe déjà. Rien à faire.`);
  process.exit(0);
}

await payload.create({
  collection: 'utilisateurs',
  data: { email, password: motDePasse, nom, prenoms, role: 'administrateur', actif: true },
  overrideAccess: true,
});

console.log(`Compte administrateur créé : ${email}`);
console.log('Connectez-vous sur /admin, puis créez les comptes des agents par rôle.');
process.exit(0);
