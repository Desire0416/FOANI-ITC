/* ==========================================================================
   Recette du contrôle automatique d'identité
   --------------------------------------------------------------------------
   Éprouve le fournisseur en service — local par défaut — sur des visages
   réels : détection, comparaison de deux photographies d'une même personne,
   comparaison de deux personnes différentes, et décision de bout en bout.

   Usage :
     pnpm recette-visage <dossier contenant portrait.jpg, meme2.jpg, autre.jpg>

   Les photographies de recette ne sont pas versées au dépôt : ce sont des
   visages, et un dépôt public n'est pas leur place.
   ========================================================================== */

// Recette du fournisseur local : détection, comparaison, et décision.
import { readFileSync } from 'node:fs';
import { fournisseurLocal, similariteDepuisDistance } from '../src/payload/biometrie/local.js';
import { controlerIdentiteComplete, controlerPortrait } from '../src/payload/biometrie/controles.js';
import sharp from 'sharp';

const D = process.argv[2];
const lire = (nom: string) => readFileSync(`${D}/${nom}`);

console.log('--- détection ---');
const uni = await sharp({
  create: { width: 800, height: 1000, channels: 3, background: { r: 200, g: 200, b: 200 } },
})
  .jpeg()
  .toBuffer();

for (const [nom, image] of [
  ['image unie', uni],
  ['portrait A', lire('portrait.jpg')],
  ['portrait A bis', lire('meme2.jpg')],
  ['portrait B', lire('autre.jpg')],
] as [string, Buffer][]) {
  const t = Date.now();
  const visages = await fournisseurLocal.detecterVisages(image);
  console.log(
    `  ${nom.padEnd(16)} → ${visages.length} visage(s)` +
      (visages[0]
        ? ` confiance ${visages[0].confiance.toFixed(1)} surface ${(visages[0].surface * 100).toFixed(1)}% lacet ${visages[0].lacet?.toFixed(0)}°`
        : '') +
      `  (${Date.now() - t} ms)`,
  );
}

console.log('--- comparaison ---');
for (const [nom, a, b] of [
  ['A contre A (même image)', 'portrait.jpg', 'portrait.jpg'],
  ['A contre A bis (autre photo)', 'portrait.jpg', 'meme2.jpg'],
  ['A contre B (autre personne)', 'portrait.jpg', 'autre.jpg'],
  ['A contre image unie', 'portrait.jpg', null],
] as [string, string, string | null][]) {
  const cible = b ? lire(b) : uni;
  const t = Date.now();
  const { similarite } = await fournisseurLocal.comparerVisages(lire(a), cible);
  console.log(
    `  ${nom.padEnd(30)} → ${similarite === null ? 'aucun visage' : similarite.toFixed(0) + ' %'}  (${Date.now() - t} ms)`,
  );
}

console.log('--- décision de bout en bout ---');
for (const [nom, portrait, recto, selfie] of [
  ['pièce du titulaire', 'portrait.jpg', 'meme2.jpg', 'portrait.jpg'],
  ['pièce d’un tiers', 'portrait.jpg', 'autre.jpg', 'portrait.jpg'],
  ['portrait sans visage', null, 'meme2.jpg', 'portrait.jpg'],
] as [string, string | null, string, string][]) {
  const r = await controlerIdentiteComplete({
    portrait: portrait ? lire(portrait) : uni,
    recto: lire(recto),
    selfie: lire(selfie),
    nomDeclare: 'LINCOLN Abraham',
    numeroDeclare: 'CI001',
  });
  const lignes = r.controles.map((c) => `${c.cle}=${c.verdict}${c.score !== undefined ? '(' + c.score + ')' : ''}`);
  console.log(`  ${nom.padEnd(22)} → ${r.verdict.padEnd(12)} ${lignes.join(' ')}`);
}

console.log('--- portrait, contrôle d’entrée ---');
for (const [nom, image] of [
  ['image unie', uni],
  ['portrait correct', lire('portrait.jpg')],
] as [string, Buffer][]) {
  const r = await controlerPortrait(image);
  const cause = r.controles.find((c) => c.verdict !== 'conforme');
  console.log(`  ${nom.padEnd(18)} → ${r.verdict.padEnd(12)} ${cause?.detail ?? ''}`);
}

console.log('similarité pour une distance de 0,35 →', similariteDepuisDistance(0.35).toFixed(0), '%');
console.log('similarité pour une distance de 0,60 →', similariteDepuisDistance(0.6).toFixed(0), '%');
process.exit(0);
