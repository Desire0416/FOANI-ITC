import { existsSync } from 'node:fs';
import path from 'node:path';
import type { Fournisseur, Visage } from './fournisseur';

/* ==========================================================================
   Le fournisseur local — reconnaissance faciale sans service extérieur
   --------------------------------------------------------------------------
   POURQUOI IL EXISTE. Un dispositif qui attend l'ouverture d'un compte chez un
   tiers pour se mettre en marche n'est pas fonctionnel : il est en attente. Ce
   fournisseur-ci s'exécute sur le serveur de l'établissement, sans compte,
   sans coût par appel, et sans qu'aucune image ne quitte le dispositif — ce
   qui répond du même coup à la question du transfert hors de Côte d'Ivoire.

   COMMENT. Trois réseaux, embarqués dans le dépôt (`modeles/visage`, 12 Mo) :
   un détecteur de visages, un repère de points caractéristiques, et un réseau
   qui produit un descripteur de 128 nombres par visage. Comparer deux visages,
   c'est mesurer la distance euclidienne entre leurs descripteurs.

   Le calcul passe par WebAssembly, non par les liaisons natives de
   TensorFlow : celles-ci se compilent à l'installation et ne survivent pas à
   un déploiement sans serveur. Le décodage des images passe par `sharp`, déjà
   présent pour le redimensionnement des pièces. Aucune dépendance native n'est
   ajoutée.

   CE QU'IL NE FAIT PAS. Il ne lit pas le texte des pièces. Une reconnaissance
   optique de caractères embarquée ajouterait une dizaine de mégaoctets pour un
   résultat médiocre sur une pièce photographiée de travers ; le rapprochement
   du nom reste donc à l'agent, et le dispositif le dit. C'est la seule chose
   que le fournisseur distant fait de plus.

   CE QU'IL VAUT. Le modèle employé est celui de la bibliothèque `face-api`,
   entraîné sur un jeu public. Il est bon, et il n'est pas parfait : il détecte
   nettement moins bien un visage de profil marqué, très sombre, ou imprimé en
   petit sur une pièce ancienne. C'est précisément pourquoi le dispositif ne
   décide pas seul, et pourquoi le contrôle visuel de la scolarité subsiste.

   SUR LA LOI. Comparer deux visages reste un traitement biométrique, quel que
   soit le lieu où le calcul s'effectue. L'autorisation préalable prévue par la
   loi n° 2013-450 demeure requise. Ce fournisseur supprime le transfert vers
   un tiers, ce qui allège le dossier — il ne supprime pas la démarche.
   ========================================================================== */

const RACINE_MODELES = path.join(process.cwd(), 'modeles', 'visage');

/**
 * Conversion d'une distance en pourcentage de similarité.
 *
 * La bibliothèque rend une distance euclidienne entre descripteurs : zéro pour
 * deux images du même visage, environ 0,6 au seuil usuel d'identité, au-delà
 * de 1 pour deux personnes différentes. Le reste du dispositif raisonne en
 * pourcentages, et ses seuils sont posés à 90 et 70.
 *
 * La droite retenue fait donc correspondre 0,35 à 90 % et 0,60 à 70 %. Ce
 * n'est pas une probabilité, et cela ne prétend pas en être une : c'est une
 * échelle lisible, calée sur les deux seuils qui décident.
 */
export function similariteDepuisDistance(distance: number): number {
  return Math.max(0, Math.min(100, 118 - 80 * distance));
}

/* --------------------------------------------------------------------------
   Chargement paresseux
   --------------------------------------------------------------------------
   Les modèles pèsent douze mégaoctets et mettent une centaine de millisecondes
   à se charger. On ne les charge qu'au premier contrôle, et une seule fois par
   instance : un candidat qui ne dépose rien ne paie pas ce prix.
   -------------------------------------------------------------------------- */

type Moteur = {
  readonly faceapi: typeof import('@vladmandic/face-api');
  readonly tf: typeof import('@tensorflow/tfjs');
};

let moteur: Promise<Moteur> | null = null;

async function demarrer(): Promise<Moteur> {
  if (moteur) return moteur;

  moteur = (async () => {
    const tf = await import('@tensorflow/tfjs');
    const wasm = await import('@tensorflow/tfjs-backend-wasm');
    const faceapi = await import('@vladmandic/face-api/dist/face-api.node-wasm.js');

    /* Les binaires WebAssembly sont copiés auprès des modèles plutôt que lus
       dans leur paquet : sous pnpm leur chemin dépend du graphe de
       dépendances, et le déploiement ne les emporterait pas. Un seul dossier
       à embarquer, une seule chose à vérifier. */
    wasm.setWasmPaths(path.join(RACINE_MODELES, 'wasm') + path.sep);

    await tf.setBackend('wasm');
    await tf.ready();

    await faceapi.nets.ssdMobilenetv1.loadFromDisk(RACINE_MODELES);
    await faceapi.nets.faceLandmark68Net.loadFromDisk(RACINE_MODELES);
    await faceapi.nets.faceRecognitionNet.loadFromDisk(RACINE_MODELES);

    return { faceapi, tf } as Moteur;
  })();

  return moteur;
}

/**
 * `true` si les modèles sont présents et le moteur autorisé.
 *
 * Le test porte sur le fichier de poids, pas sur le dossier : un dossier vide
 * subsisterait à une copie incomplète, et le dispositif se croirait armé.
 * `BIOMETRIE_LOCALE=0` l'éteint explicitement, pour l'établissement qui
 * préfère s'en tenir au contrôle humain.
 */
export function localDisponible(): boolean {
  if (process.env.BIOMETRIE_LOCALE === '0') return false;
  try {
    return existsSync(path.join(RACINE_MODELES, 'ssd_mobilenetv1_model.bin'));
  } catch {
    return false;
  }
}

/* --------------------------------------------------------------------------
   Détection et comparaison
   -------------------------------------------------------------------------- */

type Trouve = {
  readonly descripteur: Float32Array;
  readonly visage: Visage;
};

/**
 * Décode une image et y cherche les visages.
 *
 * L'image est ramenée à 1024 pixels de large au plus : au-delà, la détection
 * coûte plusieurs secondes sans rien gagner, un visage exploitable occupant de
 * toute façon une part notable du cadre.
 */
async function analyser(image: Buffer): Promise<readonly Trouve[]> {
  const { faceapi, tf } = await demarrer();
  const sharp = (await import('sharp')).default;

  const prepare = await sharp(image)
    .rotate()
    .resize({ width: 1024, withoutEnlargement: true })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { data, info } = prepare;
  const tenseur = tf.tensor3d(new Uint8Array(data), [info.height, info.width, 3]);

  try {
    const resultats = await faceapi
      .detectAllFaces(tenseur as never)
      .withFaceLandmarks()
      .withFaceDescriptors();

    const surfaceImage = info.width * info.height;

    return resultats
      .map((resultat) => {
        const boite = resultat.detection.box;
        /* Le lacet est approché par l'écart entre le nez et le milieu des
           yeux : la bibliothèque ne rend pas la pose, mais les points
           caractéristiques suffisent à repérer une tête franchement tournée. */
        const points = resultat.landmarks;
        const nez = points.getNose()[3];
        const oeilGauche = points.getLeftEye()[0];
        const oeilDroit = points.getRightEye()[3];
        const milieu = oeilGauche && oeilDroit ? (oeilGauche.x + oeilDroit.x) / 2 : null;
        const largeurYeux = oeilGauche && oeilDroit ? Math.abs(oeilDroit.x - oeilGauche.x) : 0;
        const lacet =
          nez && milieu !== null && largeurYeux > 0
            ? ((nez.x - milieu) / largeurYeux) * 90
            : null;
        const roulis =
          oeilGauche && oeilDroit
            ? (Math.atan2(oeilDroit.y - oeilGauche.y, oeilDroit.x - oeilGauche.x) * 180) / Math.PI
            : null;

        const visage: Visage = {
          confiance: resultat.detection.score * 100,
          /* Le modèle ne rend pas de mesure de netteté : le contrôle client
             s'en charge déjà, avant l'envoi. On rend une valeur neutre plutôt
             qu'un chiffre inventé qui déclencherait un refus injustifié. */
          nettete: 100,
          luminosite: 100,
          surface: (boite.width * boite.height) / surfaceImage,
          yeuxOuverts: null,
          lunettesSoleil: null,
          lacet,
          tangage: null,
          roulis,
        };

        return { descripteur: resultat.descriptor, visage };
      })
      .sort((a, b) => b.visage.surface - a.visage.surface);
  } finally {
    tenseur.dispose();
  }
}

export const fournisseurLocal: Fournisseur = {
  nom: 'Reconnaissance locale (face-api)',
  litLeTexte: false,

  async detecterVisages(image) {
    return (await analyser(image)).map((trouve) => trouve.visage);
  },

  async comparerVisages(reference, cible) {
    const { faceapi } = await demarrer();

    const [visagesReference, visagesCible] = await Promise.all([
      analyser(reference),
      analyser(cible),
    ]);

    const premier = visagesReference[0];
    if (!premier || visagesCible.length === 0) return { similarite: null };

    /* On retient la meilleure correspondance parmi les visages de la cible :
       sur la photographie d'un porteur tenant sa pièce, deux visages sont
       présents — le sien et celui imprimé sur le document. Les deux sont de
       bonnes réponses. */
    const distances = visagesCible.map((candidat) =>
      faceapi.euclideanDistance(
        Array.from(premier.descripteur),
        Array.from(candidat.descripteur),
      ),
    );

    return { similarite: similariteDepuisDistance(Math.min(...distances)) };
  },

  async lireTexte() {
    /* Aucune reconnaissance optique embarquée : le rapprochement du nom et du
       numéro reste à l'agent, et le rapport le dit plutôt que de rendre une
       liste vide qu'on prendrait pour une pièce illisible. */
    return [];
  },
};
