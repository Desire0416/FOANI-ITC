/* ==========================================================================
   Recette des séquences — Note complémentaire §6.8
   --------------------------------------------------------------------------
   « La numérotation des appels de frais et des reçus est continue et sans
   rupture, par exercice. »

   Une numérotation continue suppose que deux tirages simultanés ne rendent
   jamais la même valeur. L'ancienne implémentation lisait le compteur, ajoutait
   un, puis réécrivait : deux appels concurrents lisaient la même valeur et
   repartaient avec le même numéro. Pour un numéro de dossier, la contrainte
   d'unicité rattrapait la collision en erreur ; pour un numéro de reçu, elle
   produirait un trou ou un doublon dans l'export comptable.

   Ce contrôle tire cinquante numéros en parallèle sur une série d'essai et
   vérifie qu'ils forment exactement la suite 1..50 : ni trou, ni doublon.

   Usage : pnpm recette-sequences
   ========================================================================== */

export {};

const { getPayload } = await import('payload');
const { default: config } = await import('../src/payload.config.js');
const { incrementer } = await import('../src/payload/sequence.js');

const payload = await getPayload({ config });

const TIRAGES = 50;
const serie = `recette-${Date.now()}`;

console.log(`\nSérie d’essai : ${serie}`);
console.log(`${TIRAGES} tirages lancés en parallèle…\n`);

const debut = Date.now();
const valeurs = await Promise.all(
  Array.from({ length: TIRAGES }, () => incrementer(payload, serie)),
);
const duree = Date.now() - debut;

const triees = [...valeurs].sort((a, b) => a - b);
const attendues = Array.from({ length: TIRAGES }, (_, rang) => rang + 1);

const doublons = triees.filter((valeur, rang) => rang > 0 && valeur === triees[rang - 1]);
const trous = attendues.filter((attendue) => !triees.includes(attendue));

console.log(`  obtenues   ${triees[0]} … ${triees[triees.length - 1]}`);
console.log(`  distinctes ${new Set(valeurs).size} sur ${TIRAGES}`);
console.log(`  doublons   ${doublons.length > 0 ? doublons.join(', ') : 'aucun'}`);
console.log(`  trous      ${trous.length > 0 ? trous.join(', ') : 'aucun'}`);
console.log(`  durée      ${duree} ms`);

const conforme =
  new Set(valeurs).size === TIRAGES && doublons.length === 0 && trous.length === 0;

/* La série d'essai est laissée en base : un compteur n'est jamais supprimé,
   et celui-ci porte sa date dans son nom, ce qui le rend reconnaissable. */

console.log(
  conforme
    ? '\nLa suite est continue et sans doublon.\n'
    : '\nLA SUITE EST ROMPUE. Un numéro de reçu ne peut pas être délivré dans cet état.\n',
);

process.exit(conforme ? 0 : 1);
