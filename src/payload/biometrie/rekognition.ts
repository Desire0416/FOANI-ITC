import {
  CompareFacesCommand,
  DetectFacesCommand,
  DetectTextCommand,
  RekognitionClient,
} from '@aws-sdk/client-rekognition';
import type { Fournisseur, Visage } from './fournisseur';

/* ==========================================================================
   Le fournisseur Amazon Rekognition
   --------------------------------------------------------------------------
   Choisi pour trois raisons, dans cet ordre.

   1. C'est une interface HTTP, sans dépendance native. Le dispositif est
      déployé sur une plateforme sans serveur : un modèle installé localement
      supposerait des liaisons natives et plusieurs dizaines de mégaoctets par
      fonction, ce qui n'y tient pas. Le jour où l'établissement disposera de
      ses propres serveurs, un second fournisseur pourra l'y remplacer sans
      toucher au parcours.
   2. Il fait les trois choses nécessaires, et rien d'autre : détecter un
      visage et en mesurer la qualité, comparer deux visages, lire le texte
      d'une pièce. Aucun stockage de gabarit n'est employé — ni collection de
      visages, ni index. Chaque appel est sans mémoire.
   3. Son coût est négligeable à cette échelle : de l'ordre de quatre appels
      par candidat, à un millième de dollar l'appel. Mille candidats coûtent
      environ quatre dollars par campagne.

   SUR LE LIEU DU TRAITEMENT. La région est configurable et vaut Paris par
   défaut. C'est un transfert hors de Côte d'Ivoire, qui doit figurer dans la
   déclaration faite à l'autorité de protection. Le Cap (`af-south-1`) est
   disponible et rapproche le traitement, sans supprimer la question.

   SUR CE QUI EST ENVOYÉ. Les images de la pièce d'identité et du portrait,
   pour le temps de l'appel. Rien n'est conservé chez le fournisseur : les
   commandes employées ici sont sans état, contrairement à celles qui indexent
   des visages dans une collection — que ce module n'emploie pas, et ne doit
   pas employer sans une nouvelle démarche.
   ========================================================================== */

const REGION = process.env.REKOGNITION_REGION ?? process.env.AWS_REGION ?? 'eu-west-3';

let client: RekognitionClient | null = null;

function connexion(): RekognitionClient {
  if (!client) {
    client = new RekognitionClient({
      region: REGION,
      credentials: {
        accessKeyId: process.env.REKOGNITION_ACCESS_KEY_ID ?? '',
        secretAccessKey: process.env.REKOGNITION_SECRET_ACCESS_KEY ?? '',
      },
    });
  }
  return client;
}

/** `true` si l'établissement a effectivement branché le service. */
export function rekognitionConfigure(): boolean {
  return Boolean(
    process.env.REKOGNITION_ACCESS_KEY_ID && process.env.REKOGNITION_SECRET_ACCESS_KEY,
  );
}

export const rekognition: Fournisseur = {
  nom: 'Amazon Rekognition',

  async detecterVisages(image) {
    const reponse = await connexion().send(
      new DetectFacesCommand({ Image: { Bytes: image }, Attributes: ['ALL'] }),
    );

    const visages: Visage[] = (reponse.FaceDetails ?? []).map((detail) => ({
      confiance: detail.Confidence ?? 0,
      nettete: detail.Quality?.Sharpness ?? 0,
      luminosite: detail.Quality?.Brightness ?? 0,
      /* La surface est donnée en fraction de la largeur et de la hauteur :
         leur produit est la part de l'image occupée par le visage. */
      surface: (detail.BoundingBox?.Width ?? 0) * (detail.BoundingBox?.Height ?? 0),
      yeuxOuverts: detail.EyesOpen?.Value ?? null,
      lunettesSoleil: detail.Sunglasses?.Value ?? null,
      lacet: detail.Pose?.Yaw ?? null,
      tangage: detail.Pose?.Pitch ?? null,
      roulis: detail.Pose?.Roll ?? null,
    }));

    // Du plus grand au plus petit : sur un portrait tenant une pièce, le
    // visage du porteur précède celui imprimé sur le document.
    return visages.sort((a, b) => b.surface - a.surface);
  },

  async comparerVisages(reference, cible) {
    try {
      const reponse = await connexion().send(
        new CompareFacesCommand({
          SourceImage: { Bytes: reference },
          TargetImage: { Bytes: cible },
          /* Un seuil bas au niveau de l'appel : c'est le dispositif qui
             tranche ensuite, et un score faible est une information utile —
             le masquer reviendrait à confondre « pas de correspondance » et
             « pas de visage », qui appellent des messages différents. */
          SimilarityThreshold: 1,
          QualityFilter: 'AUTO',
        }),
      );

      const meilleure = (reponse.FaceMatches ?? []).reduce<number | null>(
        (haut, correspondance) =>
          haut === null || (correspondance.Similarity ?? 0) > haut
            ? (correspondance.Similarity ?? 0)
            : haut,
        null,
      );

      return { similarite: meilleure };
    } catch (erreur) {
      /* Aucun visage exploitable dans l'une des deux images : ce n'est pas une
         panne, c'est un résultat. On le rend comme tel. */
      const nom = (erreur as { name?: string }).name ?? '';
      if (nom === 'InvalidParameterException') return { similarite: null };
      throw erreur;
    }
  },

  async lireTexte(image) {
    const reponse = await connexion().send(new DetectTextCommand({ Image: { Bytes: image } }));
    return (reponse.TextDetections ?? [])
      .filter((detection) => detection.Type === 'LINE' && (detection.Confidence ?? 0) > 70)
      .map((detection) => detection.DetectedText ?? '')
      .filter(Boolean);
  },
};
