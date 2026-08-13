import { Fraunces, Plus_Jakarta_Sans } from 'next/font/google';

/* ==========================================================================
   Polices du dispositif
   --------------------------------------------------------------------------
   Déclarées une seule fois et partagées par le site public et l'espace
   d'administration. Le §7.2 demande « une identité visuelle commune, de sorte
   qu'un étudiant perçoive qu'il reste chez FITC en passant d'un espace à
   l'autre » — cela vaut aussi pour les agents de l'établissement.
   ========================================================================== */

/**
 * Fraunces porte l'axe SOFT, qui arrondit les empattements : c'est le pont
 * entre le « FOANI » gravé du logo et une lettre contemporaine.
 */
export const fraunces = Fraunces({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-fraunces',
  axes: ['SOFT', 'WONK', 'opsz'],
});

/**
 * Plus Jakarta Sans : grotesque humaniste aux terminaisons légèrement
 * adoucies, lisible à 14 px sur un téléphone d'entrée de gamme.
 */
export const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jakarta',
});
