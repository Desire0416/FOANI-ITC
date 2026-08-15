/* ==========================================================================
   Recette de la grille tarifaire — Note complémentaire §6.4
   --------------------------------------------------------------------------
   Éprouve les quatre règles que la note pose sur une grille :

   — elle s'arrête, et son arrêt porte son auteur et sa date ;
   — arrêtée, elle n'est plus modifiable ;
   — une évolution donne lieu à une nouvelle version, motivée ;
   — la version applicable est la dernière arrêtée, jamais un brouillon.

   Et la règle d'arithmétique qui la sert : un montant échelonné se répartit
   sans perdre ni créer de francs.

   Usage : pnpm recette-grille
   ========================================================================== */

export {};

const { getPayload } = await import('payload');
const { default: config } = await import('../src/payload.config.js');
const { grilleApplicable, montantReservantLaPlace, fraisDeDossier, echeancesDe } = await import(
  '../src/payload/finances/grille.js'
);
const { total } = await import('../src/payload/finances/montants.js');

const payload = await getPayload({ config });
const ANNEE = `RECETTE-${Date.now()}`;
const FORMATION = 'bts-agriculture-tropicale-production-animale';

let echecs = 0;
function verifier(intitule: string, condition: boolean, detail = '') {
  if (condition) console.log(`  ok    ${intitule}`);
  else {
    echecs += 1;
    console.log(`  ÉCHEC ${intitule} ${detail}`);
  }
}

const LIGNES = [
  { nature: 'dossier', libelle: 'Frais de dossier', montant: 15_000, echeances: [] },
  { nature: 'inscription', libelle: 'Frais d’inscription', montant: 50_000, echeances: [] },
  {
    nature: 'scolarite',
    libelle: 'Scolarité',
    montant: 300_000,
    echeances: [
      { exigibleLe: '2026-10-05', intitule: 'Première tranche' },
      { exigibleLe: '2027-01-05', intitule: 'Deuxième tranche' },
      { exigibleLe: '2027-04-05', intitule: 'Troisième tranche' },
      { exigibleLe: '2027-06-05', intitule: 'Quatrième tranche' },
      { exigibleLe: '2027-07-05', intitule: 'Cinquième tranche' },
      { exigibleLe: '2027-08-05', intitule: 'Sixième tranche' },
      { exigibleLe: '2027-09-05', intitule: 'Septième tranche' },
    ],
  },
];

console.log('\n--- création et arrêt ---');

const brouillon = await payload.create({
  collection: 'grilles',
  data: {
    circuit: 'academique',
    formation: FORMATION,
    anneeAcademique: ANNEE,
    version: 1,
    etat: 'brouillon',
    lignes: LIGNES,
  } as never,
  overrideAccess: true,
});
verifier(`brouillon créé — code ${(brouillon as { code?: string }).code}`, Boolean(brouillon.id));

/* Un brouillon n'est pas applicable : le site public ne doit pas l'afficher. */
verifier(
  'un brouillon n’est pas applicable',
  (await grilleApplicable(payload, FORMATION, ANNEE)) === null,
);

const arretee = await payload.update({
  collection: 'grilles',
  id: brouillon.id,
  data: { etat: 'arretee' } as never,
  overrideAccess: true,
});
const a = arretee as unknown as Record<string, unknown>;
verifier('l’arrêt porte sa date', Boolean(a.arreteeLe));

console.log('\n--- immuabilité ---');

let refuse = false;
try {
  await payload.update({
    collection: 'grilles',
    id: brouillon.id,
    data: { lignes: [{ nature: 'scolarite', libelle: 'Scolarité', montant: 1, echeances: [] }] } as never,
    overrideAccess: true,
  });
} catch {
  refuse = true;
}
verifier('une grille arrêtée refuse toute modification', refuse);

let archivage = true;
try {
  await payload.update({
    collection: 'grilles',
    id: brouillon.id,
    data: { etat: 'archivee' } as never,
    overrideAccess: true,
  });
} catch {
  archivage = false;
}
verifier('elle accepte en revanche d’être archivée', archivage);

console.log('\n--- lecture de la grille applicable ---');

const v2 = await payload.create({
  collection: 'grilles',
  data: {
    circuit: 'academique',
    formation: FORMATION,
    anneeAcademique: ANNEE,
    version: 2,
    etat: 'brouillon',
    lignes: LIGNES,
    motifVersion: 'Recette : seconde version.',
    remplace: brouillon.id,
  } as never,
  overrideAccess: true,
});
await payload.update({
  collection: 'grilles',
  id: v2.id,
  data: { etat: 'arretee' } as never,
  overrideAccess: true,
});

const lue = await grilleApplicable(payload, FORMATION, ANNEE);
verifier('la dernière version arrêtée est retenue', lue?.version === 2, `vu ${lue?.version}`);
verifier('le total vaut la somme des lignes', lue?.total === 365_000, `vu ${lue?.total}`);
verifier('les frais de dossier se lisent', fraisDeDossier(lue) === 15_000);
verifier('le montant réservant la place se lit', montantReservantLaPlace(lue) === 50_000);

const echeances = echeancesDe(lue);
verifier('sept échéances de scolarité', echeances.length === 7, `vu ${echeances.length}`);
verifier(
  `leur somme retombe sur 300 000 — ${echeances.map((e) => e.montant).join(' + ')}`,
  total(echeances.map((e) => e.montant)) === 300_000,
);
verifier(
  'elles sont triées par date',
  echeances.every((e, rang) => rang === 0 || e.exigibleLe >= echeances[rang - 1]!.exigibleLe),
);

console.log('\n--- motif de version ---');
const v3 = await payload.create({
  collection: 'grilles',
  data: {
    circuit: 'academique',
    formation: FORMATION,
    anneeAcademique: ANNEE,
    version: 3,
    etat: 'brouillon',
    lignes: LIGNES,
  } as never,
  overrideAccess: true,
});
let motifExige = false;
try {
  await payload.update({
    collection: 'grilles',
    id: v3.id,
    data: { etat: 'arretee' } as never,
    overrideAccess: true,
  });
} catch {
  motifExige = true;
}
verifier('arrêter une version 2 ou plus sans motif est refusé', motifExige);

console.log(echecs === 0 ? '\nLa grille tient ses règles.\n' : `\n${echecs} écart(s).\n`);
process.exit(echecs === 0 ? 0 : 1);
