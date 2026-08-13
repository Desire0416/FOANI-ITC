/* ==========================================================================
   Création d'un compte d'agent
   --------------------------------------------------------------------------
   Complète `amorcer.ts`, qui ne crée que le premier administrateur. Celui-ci
   crée ensuite les comptes de ses collègues, avec leur rôle.

   Le script fait partie des procédures d'exploitation (§21.4) : il permet de
   rouvrir un accès après une restauration, sans dépendre du prestataire.

   Usage :
     AGENT_EMAIL=… AGENT_MOT_DE_PASSE=… AGENT_ROLE=redacteur \
     AGENT_NOM=… AGENT_PRENOMS=… pnpm creer-agent

   Rôles acceptés : administrateur, editeur, redacteur, admission, scolarite,
   finances, consultation, carrieres, recherche.
   ========================================================================== */

export {}; // fait de ce fichier un module ES, condition du `await` de haut niveau

const { getPayload } = await import('payload');
const { default: config } = await import('../src/payload.config.js');
const { ROLES } = await import('../src/payload/roles.js');

const email = process.env.AGENT_EMAIL;
const motDePasse = process.env.AGENT_MOT_DE_PASSE;
const role = process.env.AGENT_ROLE;
const nom = process.env.AGENT_NOM ?? 'Agent';
const prenoms = process.env.AGENT_PRENOMS ?? 'FOANI-ITC';

if (!email || !motDePasse || !role) {
  console.error(
    'AGENT_EMAIL, AGENT_MOT_DE_PASSE et AGENT_ROLE sont requis.\n' +
      `Rôles acceptés : ${ROLES.join(', ')}`,
  );
  process.exit(1);
}

if (!(ROLES as readonly string[]).includes(role)) {
  console.error(`Rôle inconnu : ${role}.\nRôles acceptés : ${ROLES.join(', ')}`);
  process.exit(1);
}

if (motDePasse.length < 12) {
  console.error('Le mot de passe doit compter au moins douze caractères.');
  process.exit(1);
}

const payload = await getPayload({ config });

const { totalDocs } = await payload.count({
  collection: 'utilisateurs',
  where: { email: { equals: email } },
  overrideAccess: true,
});

if (totalDocs > 0) {
  console.log(`Le compte ${email} existe déjà. Rien à faire.`);
  process.exit(0);
}

await payload.create({
  collection: 'utilisateurs',
  data: { email, password: motDePasse, nom, prenoms, role, actif: true } as never,
  overrideAccess: true,
});

console.log(`Compte créé : ${email} — rôle ${role}.`);
process.exit(0);
