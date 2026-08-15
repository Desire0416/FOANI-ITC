/* ==========================================================================
   État des comptes — diagnostic
   --------------------------------------------------------------------------
   Liste les comptes d'agents et de candidats, avec ce qui empêche une
   connexion : un verrouillage après trop d'essais, ou un compte absent.

   Payload verrouille un compte après un nombre d'essais manqués et le rouvre
   au bout d'un délai. Un mot de passe correct saisi pendant ce délai échoue
   quand même, sans que le message le dise — d'où ce relevé.

   Usage : pnpm etat-comptes
   ========================================================================== */

export {};

const { getPayload } = await import('payload');
const { default: config } = await import('../src/payload.config.js');

const payload = await getPayload({ config });

function verrou(brut: Record<string, unknown>): string {
  const jusqua = brut.lockUntil as string | null;
  const essais = (brut.loginAttempts as number | null) ?? 0;
  if (jusqua && new Date(jusqua).getTime() > Date.now()) {
    const minutes = Math.ceil((new Date(jusqua).getTime() - Date.now()) / 60000);
    return `VERROUILLÉ encore ${minutes} min (${essais} essais)`;
  }
  return essais > 0 ? `${essais} essai(s) manqué(s)` : 'ouvert';
}

console.log('=== Agents ===');
const agents = await payload.find({
  collection: 'utilisateurs',
  limit: 100,
  depth: 0,
  sort: 'role',
  overrideAccess: true,
});

for (const doc of agents.docs) {
  const brut = doc as unknown as Record<string, unknown>;
  console.log(
    `  ${String(brut.email).padEnd(34)} ${String(brut.role ?? '').padEnd(16)} ${verrou(brut)}`,
  );
}

console.log('\n=== Comptes candidats ===');
const candidats = await payload.find({
  collection: 'candidats',
  limit: 100,
  depth: 0,
  overrideAccess: true,
});

for (const doc of candidats.docs) {
  const brut = doc as unknown as Record<string, unknown>;
  console.log(
    `  ${String(brut.username ?? '').padEnd(20)} ${String(brut.email ?? '—').padEnd(34)} ${verrou(brut)}`,
  );
}

process.exit(0);
