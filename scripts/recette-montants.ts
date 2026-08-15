/* ==========================================================================
   Recette de l'arithmétique des montants — Note complémentaire §6.4
   --------------------------------------------------------------------------
   Un échéancier dont la somme ne retombe pas sur son total est un litige. Ce
   contrôle le vérifie sur des cas qui divisent mal, et sur les bornes.

   Usage : pnpm recette-montants
   ========================================================================== */

export {};

const { repartir, echeancier, total, formaterMontant, lireMontant, anciennete } = await import(
  '../src/payload/finances/montants.js'
);

let echecs = 0;

function verifier(intitule: string, condition: boolean, detail = '') {
  if (condition) {
    console.log(`  ok    ${intitule}`);
  } else {
    echecs += 1;
    console.log(`  ÉCHEC ${intitule} ${detail}`);
  }
}

console.log('--- répartition en tranches ---');
for (const [montant, tranches] of [
  [300_000, 7],
  [1, 3],
  [0, 5],
  [999_999, 4],
  [450_000, 3],
  [7, 7],
  [123_457, 12],
] as [number, number][]) {
  const parts = repartir(montant, tranches);
  const somme = total(parts);
  verifier(
    `${montant} en ${tranches} → ${parts.join(' + ')} = ${somme}`,
    somme === montant && parts.every(Number.isInteger) && parts.length === tranches,
    `attendu ${montant}`,
  );
}

console.log('--- les parts ne diffèrent jamais de plus d’un franc ---');
for (const [montant, tranches] of [
  [300_000, 7],
  [123_457, 12],
  [999_999, 4],
] as [number, number][]) {
  const parts = repartir(montant, tranches);
  verifier(
    `${montant} en ${tranches} : écart maximal ${Math.max(...parts) - Math.min(...parts)}`,
    Math.max(...parts) - Math.min(...parts) <= 1,
  );
}

console.log('--- échéancier ---');
const dates = ['2026-10-05', '2027-01-05', '2027-04-05'];
const plan = echeancier(450_001, dates);
verifier(
  `450 001 sur trois dates → ${plan.map((e) => e.montant).join(' + ')}`,
  total(plan.map((e) => e.montant)) === 450_001,
);
verifier(
  'les rangs se suivent à partir de un',
  plan.every((e, rang) => e.rang === rang + 1),
);

console.log('--- refus ---');
for (const [montant, tranches] of [
  [-1, 3],
  [100.5, 3],
  [100, 0],
] as [number, number][]) {
  let refuse = false;
  try {
    repartir(montant, tranches);
  } catch {
    refuse = true;
  }
  verifier(`${montant} en ${tranches} est refusé`, refuse);
}

console.log('--- lecture d’une saisie ---');
for (const [saisie, attendu] of [
  ['300000', 300_000],
  ['300 000', 300_000],
  ['  450000  ', 450_000],
] as [string, number][]) {
  const lu = lireMontant(saisie);
  verifier(`« ${saisie} » → ${attendu}`, lu.ok && lu.montant === attendu);
}

/* Le point et la virgule sont refusés : « 300.000 » est ambigu d'un facteur
   mille selon qu'on lit une typographie française ou un tableur. */
for (const saisie of ['300000,50', '12,5', '300.000', '300,000', 'abc', '']) {
  const lu = lireMontant(saisie);
  verifier(`« ${saisie} » est refusé`, !lu.ok, lu.ok ? 'accepté à tort' : '');
}

console.log('--- mise en forme ---');
verifier('300 000 se lit avec ses espaces', formaterMontant(300_000).includes('300'));
verifier('l’absence de montant se lit « — »', formaterMontant(null) === '—');

console.log('--- ancienneté ---');
const jour = 24 * 60 * 60 * 1000;
const maintenant = new Date('2026-08-15T12:00:00Z');
for (const [decalage, attendu] of [
  [10, 'a-echoir'],
  [-5, 'moins-30'],
  [-45, '30-60'],
  [-90, 'plus-60'],
] as [number, string][]) {
  const date = new Date(maintenant.getTime() + decalage * jour).toISOString();
  const trouve = anciennete(date, maintenant);
  verifier(`${decalage} jours → ${trouve}`, trouve === attendu, `attendu ${attendu}`);
}

console.log(echecs === 0 ? '\nTout concorde.' : `\n${echecs} contrôle(s) en échec.`);
process.exit(echecs === 0 ? 0 : 1);
