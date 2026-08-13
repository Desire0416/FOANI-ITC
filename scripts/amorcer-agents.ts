/* ==========================================================================
   Comptes de démonstration — un par rôle
   --------------------------------------------------------------------------
   Crée neuf comptes d'agents, un pour chacun des rôles du §5.2, afin que
   l'établissement puisse éprouver lui-même ce que chaque rôle voit et ce qu'il
   lui est interdit de faire.

   Chaque mot de passe est tiré au hasard et affiché **une seule fois**, à la
   création. Il n'est écrit nulle part : ni dans le dépôt, ni en base en clair.
   Notez-les au moment où ils s'affichent.

   Le script est idempotent : un compte déjà présent est laissé tel quel, et
   son mot de passe n'est pas réaffiché — il n'est plus connu de personne.

   Ces comptes sont des comptes d'essai. Avant l'ouverture au public, il faut
   les supprimer ou en changer les mots de passe depuis l'espace Agents.

   Usage :
     pnpm amorcer-agents
   ========================================================================== */

export {}; // fait de ce fichier un module ES, condition du `await` de haut niveau

const { getPayload } = await import('payload');
const { randomBytes } = await import('node:crypto');
const { default: config } = await import('../src/payload.config.js');
const { LIBELLES_ROLE, PERIMETRES_ROLE, ROLES } = await import('../src/payload/roles.js');

const payload = await getPayload({ config });

/** Mot de passe lisible et solide : trois groupes de six caractères. */
function motDePasse(): string {
  const alphabet = 'abcdefghijkmnopqrstuvwxyz23456789';
  const tirer = (n: number) =>
    Array.from(randomBytes(n))
      .map((octet) => alphabet[octet % alphabet.length])
      .join('');
  return `${tirer(6)}-${tirer(6)}-${tirer(6)}`;
}

/** Identité affichée dans le back-office, pour reconnaître le compte d'essai. */
const IDENTITES: Record<string, { nom: string; prenoms: string }> = {
  administrateur: { nom: 'ESSAI', prenoms: 'Administrateur' },
  editeur: { nom: 'ESSAI', prenoms: 'Éditeur' },
  redacteur: { nom: 'ESSAI', prenoms: 'Rédacteur' },
  admission: { nom: 'ESSAI', prenoms: 'Admissions' },
  scolarite: { nom: 'ESSAI', prenoms: 'Scolarité' },
  finances: { nom: 'ESSAI', prenoms: 'Finances' },
  consultation: { nom: 'ESSAI', prenoms: 'Consultation' },
  carrieres: { nom: 'ESSAI', prenoms: 'Carrières' },
  recherche: { nom: 'ESSAI', prenoms: 'Recherche' },
};

const crees: { role: string; email: string; motDePasse: string; libelle: string; perimetre: string }[] = [];
const existants: string[] = [];

for (const role of ROLES) {
  const email = `${role}@foani-itc.com`;

  const { totalDocs } = await payload.count({
    collection: 'utilisateurs',
    where: { email: { equals: email } },
    overrideAccess: true,
  });

  if (totalDocs > 0) {
    existants.push(email);
    continue;
  }

  const secret = motDePasse();
  const identite = IDENTITES[role] ?? { nom: 'ESSAI', prenoms: role };

  await payload.create({
    collection: 'utilisateurs',
    data: {
      email,
      password: secret,
      nom: identite.nom,
      prenoms: identite.prenoms,
      role,
      actif: true,
    } as never,
    overrideAccess: true,
  });

  crees.push({
    role,
    email,
    motDePasse: secret,
    libelle: LIBELLES_ROLE[role],
    perimetre: PERIMETRES_ROLE[role],
  });
}

console.log('');
console.log('='.repeat(78));
console.log('  COMPTES DE DÉMONSTRATION — FOANI-ITC');
console.log('  Connexion : /gestion/connexion');
console.log('='.repeat(78));

if (crees.length === 0) {
  console.log('\n  Aucun compte créé : ils existent tous déjà.');
} else {
  for (const compte of crees) {
    console.log('');
    console.log(`  ${compte.libelle}`);
    console.log(`    Adresse      : ${compte.email}`);
    console.log(`    Mot de passe : ${compte.motDePasse}`);
    console.log(`    Périmètre    : ${compte.perimetre}`);
  }
}

if (existants.length > 0) {
  console.log('');
  console.log(`  Déjà présents (mots de passe inchangés) : ${existants.join(', ')}`);
}

console.log('');
console.log('-'.repeat(78));
console.log('  Notez ces mots de passe : ils ne seront plus affichés.');
console.log('  Comptes d’essai — à supprimer ou à changer avant l’ouverture au public.');
console.log('-'.repeat(78));
console.log('');

process.exit(0);
