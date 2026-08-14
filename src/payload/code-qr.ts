import { cache } from 'react';
import QRCode from 'qrcode';

/* ==========================================================================
   Le code à deux dimensions des documents — Note complémentaire §5.2
   --------------------------------------------------------------------------
   « Un employeur, une banque ou une administration doit pouvoir vérifier
   qu'un certificat présenté est authentique. »

   Le code de vérification en dix caractères suppose qu'on le recopie. Sur un
   document photocopié, tenu à bout de bras à un guichet, cette recopie est
   précisément le moment où la vérification n'a pas lieu : dix caractères à
   saisir sur un téléphone, c'est assez pour renoncer.

   Le code à deux dimensions supprime ce moment. Il porte l'adresse complète de
   la page de vérification, code compris : viser, et la réponse s'affiche.

   Deux partis pris techniques.

   Il est produit en SVG, sur le serveur, et inséré dans la page. Une image
   matricielle deviendrait floue à l'impression, et une image chargée depuis
   une adresse extérieure ne s'imprimerait pas du tout si le réseau a coupé
   entre-temps — ce qui est exactement le cas où l'on imprime.

   La correction d'erreurs est réglée au niveau moyen : un document officiel
   est photocopié, plié, parfois taché. `M` supporte environ quinze pour cent
   de dégradation, ce qui couvre ces usages sans rendre le motif si dense
   qu'une impression à trois cents points par pouce le brouille.
   ========================================================================== */

/** L'adresse que porte le code : la page publique, code déjà saisi. */
export function adresseVerification(code: string): string {
  const base = (process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.foani-itc.ci').replace(/\/$/, '');
  return `${base}/verifier?code=${encodeURIComponent(code)}`;
}

/**
 * Rend le code à deux dimensions, en SVG.
 *
 * Mémorisé le temps d'une requête : un document peut porter le sien à deux
 * endroits — en tête et en pied — sans le calculer deux fois.
 */
export const codeQR = cache(async function codeQR(code: string): Promise<string> {
  return QRCode.toString(adresseVerification(code), {
    type: 'svg',
    errorCorrectionLevel: 'M',
    /* Aucune marge : le cadre du document fait déjà la zone de silence, et la
       marge par défaut de quatre modules mangerait un quart de la surface. */
    margin: 0,
    color: { dark: '#000a38', light: '#ffffff' },
  });
});
