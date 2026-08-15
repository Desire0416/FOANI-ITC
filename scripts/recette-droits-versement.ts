/* ==========================================================================
   Recette : qui peut marquer un versement comme encaissé ?
   --------------------------------------------------------------------------
   `transactionVerifiee` est la seule case d'un dossier qui déplace de
   l'argent : la poser réserve une place et ouvre un dossier d'inscription.
   Le §4.8 la réserve au service des finances.

   L'action serveur `rapprocherTransaction` la gardait bien. L'API REST de
   Payload ne passe pas par elle : ce contrôle éprouve la voie directe, rôle
   par rôle, en remettant le drapeau à zéro avant chaque tentative — sans quoi
   on relit la valeur posée par l'essai précédent et tout paraît permis.

   Usage :
     DOSSIER=2 MOTS_DE_PASSE='role:mdp,role:mdp' pnpm recette-droits-versement
   ========================================================================== */

export {};

const { getPayload } = await import('payload');
const { default: config } = await import('../src/payload.config.js');

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
const dossier = process.env.DOSSIER ?? '2';

/** `role:motdepasse` séparés par des virgules. */
const couples = (process.env.MOTS_DE_PASSE ?? '')
  .split(',')
  .map((paire) => paire.trim())
  .filter(Boolean)
  .map((paire) => {
    const rang = paire.indexOf(':');
    return { role: paire.slice(0, rang), motDePasse: paire.slice(rang + 1) };
  });

if (couples.length === 0) {
  console.error('MOTS_DE_PASSE est requis : role:mdp,role:mdp');
  process.exit(1);
}

/** Les rôles qui ont le droit de rapprocher — le reste doit être refusé. */
const AUTORISES = new Set(['administrateur', 'finances']);

const payload = await getPayload({ config });

async function remettreAZero() {
  await payload.update({
    collection: 'candidatures',
    id: dossier,
    data: { transactionVerifiee: false } as never,
    overrideAccess: true,
  });
}

async function lire(): Promise<boolean> {
  const doc = (await payload.findByID({
    collection: 'candidatures',
    id: dossier,
    depth: 0,
    overrideAccess: true,
  })) as unknown as Record<string, unknown>;
  return Boolean(doc.transactionVerifiee);
}

let echecs = 0;

console.log(`\nDossier ${dossier} — qui peut poser « versement rapproché » ?\n`);

for (const { role, motDePasse } of couples) {
  await remettreAZero();

  const connexion = await fetch(`${BASE}/api/utilisateurs/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: `${role}@foani-itc.com`, password: motDePasse }),
  });

  if (!connexion.ok) {
    console.log(`  ${role.padEnd(16)} connexion refusée (${connexion.status})`);
    echecs += 1;
    continue;
  }

  const { token } = (await connexion.json()) as { token?: string };

  const ecriture = await fetch(`${BASE}/api/candidatures/${dossier}`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json', Authorization: `JWT ${token}` },
    body: JSON.stringify({ transactionVerifiee: true }),
  });

  /* La valeur est relue en base, avec dérogation : la réponse de l'API peut
     rendre 200 en ayant silencieusement écarté le champ. Seule la base dit ce
     qui s'est réellement écrit. */
  const pose = await lire();
  const attendu = AUTORISES.has(role);
  const correct = pose === attendu;
  if (!correct) echecs += 1;

  console.log(
    `  ${role.padEnd(16)} HTTP ${String(ecriture.status).padEnd(4)} drapeau ${pose ? 'posé ' : 'refusé'}  ${
      correct ? 'ok' : attendu ? 'ÉCHEC — devrait pouvoir' : 'ÉCHEC — ne devrait pas pouvoir'
    }`,
  );
}

await remettreAZero();

console.log(echecs === 0 ? '\nLes pouvoirs sont séparés.\n' : `\n${echecs} écart(s).\n`);
process.exit(echecs === 0 ? 0 : 1);
