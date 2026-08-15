/* ==========================================================================
   Reposer les accès des agents
   --------------------------------------------------------------------------
   Régénère le mot de passe de chaque compte d'agent et l'affiche une fois.
   Aucun mot de passe n'est écrit ailleurs qu'à l'écran : ni dans un fichier,
   ni dans le dépôt, ni en base — Payload n'y conserve qu'une empreinte.

   Sert dans deux cas : un mot de passe égaré, et un mot de passe écrasé par
   une recette. Le second est arrivé, ce qui est précisément la raison pour
   laquelle ce script existe plutôt qu'une manipulation à la main.

   Usage :
     pnpm reposer-acces              tous les comptes d'agents
     ROLE=finances pnpm reposer-acces   un seul rôle
   ========================================================================== */

export {};

const { randomInt } = await import('node:crypto');
const { getPayload } = await import('payload');
const { default: config } = await import('../src/payload.config.js');

/**
 * Un mot de passe lisible à voix haute et transmissible par message.
 *
 * Trois groupes de quatre caractères, sans les caractères qu'on confond en
 * recopiant — ni I ni 1, ni O ni 0 — et un chiffre de fin. Il sera changé par
 * son titulaire ; il doit surtout arriver jusqu'à lui sans faute de frappe.
 */
const ALPHABET = 'ACDEFGHJKLMNPQRSTUVWXYZ';
const CHIFFRES = '23456789';

function motDePasse(): string {
  const groupe = () =>
    Array.from({ length: 4 }, () => ALPHABET[randomInt(0, ALPHABET.length)]).join('');
  const chiffres = Array.from({ length: 2 }, () => CHIFFRES[randomInt(0, CHIFFRES.length)]).join('');
  return `${groupe()}-${groupe()}-${chiffres}`;
}

const payload = await getPayload({ config });
const roleVoulu = process.env.ROLE;

const { docs } = await payload.find({
  collection: 'utilisateurs',
  where: roleVoulu ? { role: { equals: roleVoulu } } : {},
  limit: 100,
  depth: 0,
  sort: 'role',
  overrideAccess: true,
});

if (docs.length === 0) {
  console.error(roleVoulu ? `Aucun compte pour le rôle « ${roleVoulu} ».` : 'Aucun compte.');
  process.exit(1);
}

console.log('\nAccès reposés. Notez-les : ils ne seront plus affichés.\n');
console.log(`  ${'Adresse'.padEnd(34)} ${'Rôle'.padEnd(16)} Mot de passe`);
console.log(`  ${'-'.repeat(34)} ${'-'.repeat(16)} ${'-'.repeat(14)}`);

for (const doc of docs) {
  const brut = doc as unknown as Record<string, unknown>;
  const secret = motDePasse();

  await payload.update({
    collection: 'utilisateurs',
    id: doc.id,
    /* Le verrouillage est levé en même temps : un compte dont on repose le mot
       de passe après plusieurs essais manqués resterait sinon fermé, et le
       titulaire croirait le nouveau mot de passe faux. */
    data: { password: secret, loginAttempts: 0, lockUntil: null } as never,
    overrideAccess: true,
  });

  console.log(
    `  ${String(brut.email).padEnd(34)} ${String(brut.role ?? '').padEnd(16)} ${secret}`,
  );
}

console.log('\nConnexion : /gestion/connexion\n');
process.exit(0);
