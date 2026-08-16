/* ==========================================================================
   Le corpus photographique de l'établissement
   --------------------------------------------------------------------------
   Le CDC confie la production photographique à l'établissement (§7.3) et
   interdit tout emprunt visuel à un autre établissement (§9.3). Toutes les
   images décrites ici ont été prises sur le campus d'Agnibilékrou et fournies
   par la direction. Aucune banque d'images, aucune vue de synthèse.

   Le catalogue est unique et central pour une raison précise : le texte de
   remplacement. Une même photographie apparaît sur l'accueil, sur la page du
   campus et sur une fiche de formation ; si chaque écran rédige son propre
   `alt`, les trois finissent par se contredire — et deux d'entre eux
   décrivent mal ce que voit la personne qui n'y voit pas. Ici, la description
   est écrite une fois, avec la photographie.

   `largeur` et `hauteur` ne servent pas au rendu — les emplacements sont
   tous en `fill` — mais à documenter le cadrage : une image portrait posée
   dans une fenêtre panoramique perd ses bords, et c'est en lisant ces deux
   nombres qu'on s'en aperçoit avant l'utilisateur.
   ========================================================================== */

import type { Domaine } from './types';

export type Photo = {
  /** Chemin public, servi tel quel par `next/image`. */
  readonly src: string;
  /** Ce que la photographie montre, pour qui ne la voit pas. */
  readonly alt: string;
  /** Légende courte, quand l'emplacement en affiche une. */
  readonly legende: string;
  readonly largeur: number;
  readonly hauteur: number;
};

function photo(
  fichier: string,
  largeur: number,
  hauteur: number,
  legende: string,
  alt: string,
): Photo {
  return { src: `/images/${fichier}`, alt, legende, largeur, hauteur };
}

export const PHOTOS = {
  /* --------------------------------------------------------- Bâtiments */

  campusCour: photo(
    'campus-cour.jpg',
    1080,
    810,
    'La cour centrale du campus',
    "La cour intérieure du campus de FOANI-ITC : deux bâtiments d'enseignement à étage bordés de coursives, un jardin planté d'un palmier au centre, et le drapeau ivoirien au fond.",
  ),
  alleeBatiments: photo(
    'allee-batiments.jpg',
    810,
    1080,
    'Les abords des salles de cours',
    "Une allée pavée longe les salles de cours de FOANI-ITC, bordée d'une pelouse, d'arbustes fleuris et de palmiers.",
  ),
  amphitheatre: photo(
    'amphitheatre.jpg',
    1080,
    810,
    "L'amphithéâtre",
    "L'amphithéâtre de FOANI-ITC vu depuis l'estrade : des rangées de fauteuils bleus et orange en gradins, face à un tableau blanc et un vidéoprojecteur.",
  ),
  amphitheatreEstrade: photo(
    'amphitheatre-2.jpg',
    1080,
    810,
    "L'estrade de l'amphithéâtre",
    "L'estrade de l'amphithéâtre de FOANI-ITC, avec son pupitre, son écran de projection et les fauteuils en gradins qui lui font face.",
  ),
  amphitheatreGradins: photo(
    'amphitheatre-3.jpg',
    1080,
    810,
    'Les gradins de l’amphithéâtre',
    "Les gradins de l'amphithéâtre de FOANI-ITC : une centaine de fauteuils bleus à assise orange, disposés en rangées sous un plafond éclairé.",
  ),
  bibliotheque: photo(
    'bibliotheque.jpg',
    1080,
    810,
    'La bibliothèque',
    "La bibliothèque de FOANI-ITC : des rayonnages garnis d'ouvrages et de revues, et une salle de travail meublée de tables rondes.",
  ),
  citeUniversitaire: photo(
    'cite-universitaire-3.jpg',
    2560,
    1920,
    'La cité universitaire',
    "Un bâtiment de la cité universitaire de FOANI-ITC : trois niveaux de logements à balcons, sur une cour pavée.",
  ),
  citeUniversitairePanorama: photo(
    'cite-universitaire-5.jpg',
    2560,
    1372,
    'La résidence étudiante',
    "Vue panoramique de la cité universitaire de FOANI-ITC : plusieurs bâtiments de logements autour d'une cour pavée plantée de palmiers.",
  ),
  abordsFleuris: photo(
    'abords-fleuris.jpg',
    810,
    1080,
    'Les abords du campus',
    "Un massif d'héliconias en fleurs, aux bractées orange, planté au pied d'un bâtiment du campus.",
  ),

  /* ------------------------------------------------- Production végétale */

  serreMaraichage: photo(
    'serre-maraichage.jpg',
    1080,
    810,
    "L'atelier de production végétale",
    "L'intérieur de l'ombrière de FOANI-ITC : de longues rangées de plants maraîchers en sachets — courges, tomates, aubergines — sous une charpente de bois couverte de bâche translucide.",
  ),
  serreMaraichageAllee: photo(
    'serre-maraichage-2.jpg',
    1080,
    810,
    'Les rangées de plants',
    "Les allées de l'ombrière de FOANI-ITC, où des centaines de plants maraîchers en sachets sont alignés sur la terre battue.",
  ),
  atelierProductionVegetale: photo(
    'atelier-production-vegetale.jpg',
    1080,
    412,
    "L'atelier « Production végétale »",
    "Vue panoramique extérieure de l'ombrière de FOANI-ITC, dont la bâche porte l'enseigne « Atelier — Production végétale ».",
  ),
  bananeraie: photo(
    'bananeraie.jpg',
    1080,
    810,
    'La bananeraie',
    "La bananeraie du campus de FOANI-ITC : une longue rangée de bananiers plantés le long d'une allée gravillonnée, avec sa ligne d'irrigation au sol.",
  ),
  bananeraieAllee: photo(
    'bananeraie-2.jpg',
    810,
    1080,
    'Sous les bananiers',
    "Une allée passant sous les bananiers de la parcelle de FOANI-ITC, dont les feuilles forment une voûte.",
  ),
  bananeraieJeunesPlants: photo(
    'bananeraie-3.jpg',
    810,
    1080,
    'Les jeunes bananiers',
    "Une rangée de jeunes bananiers plantés en bordure d'allée sur le campus de FOANI-ITC.",
  ),
  pepiniere: photo(
    'pepiniere-pots.jpg',
    810,
    1080,
    'Les travaux pratiques des étudiants',
    "La pépinière des travaux pratiques de FOANI-ITC : des dizaines de jeunes plants repiqués dans des bidons recyclés rouges, verts et jaunes, étiquetés au nom de leur cultivateur.",
  ),
  pepiniereVueLarge: photo(
    'pepiniere-pots-2.jpg',
    810,
    1080,
    'La parcelle-école',
    "La parcelle-école de FOANI-ITC : des plants en bidons recyclés disposés sur un lit de gravier, devant un bâtiment technique du campus.",
  ),
  jardinAromatique: photo(
    'jardin-aromatique.jpg',
    1080,
    810,
    'Le jardin aromatique',
    "Le jardin de plantes aromatiques et médicinales de FOANI-ITC : basilic en fleur et amarante pourpre plantés le long d'un bâtiment.",
  ),

  /* --------------------------------------------------- Production animale */

  elevageCailles: photo(
    'elevage-cailles.jpg',
    1080,
    810,
    "L'élevage de cailles",
    "Une cage de l'élevage de cailles de FOANI-ITC, vue du dessus : des dizaines de cailles adultes autour de leurs mangeoires et de leurs abreuvoirs.",
  ),
  elevageCaillesVoliere: photo(
    'elevage-cailles-2.jpg',
    1080,
    810,
    'La volière',
    "L'intérieur d'une volière de l'élevage de cailles de FOANI-ITC, où cohabitent des sujets blancs et des sujets sauvages.",
  ),
  elevagePoussins: photo(
    'elevage-poussins.jpg',
    1080,
    810,
    'Le poulailler',
    "Le poulailler de démarrage de FOANI-ITC : des poussins répartis sur une litière de copeaux, autour de mangeoires et d'abreuvoirs.",
  ),
  elevageLapins: photo(
    'elevage-lapins.jpg',
    810,
    1080,
    'La cuniculture',
    "Un lapin de l'atelier de cuniculture de FOANI-ITC, dans son clapier grillagé, devant sa mangeoire.",
  ),
} as const satisfies Record<string, Photo>;

export type NomPhoto = keyof typeof PHOTOS;

/* --------------------------------------------------------------------------
   Quelle installation montrer sur une fiche de formation
   --------------------------------------------------------------------------
   La fiche montre l'installation du campus qui sert de support aux travaux
   pratiques du domaine — et elle la légende pour ce qu'elle est. Nuance qui
   compte : aucune de ces photographies ne montre les travaux pratiques de
   cette formation-là. Les présenter ainsi laisserait croire à un candidat que
   les cailles qu'il voit sont celles de son futur atelier de BTS, ce que nous
   ne savons pas.

   Deux domaines n'ont pas encore d'installation photographiée : la
   transformation agroalimentaire et les équipements de technologie agricole.
   Ils reçoivent la vue générale du campus plutôt qu'une image approchante.
   -------------------------------------------------------------------------- */

const PHOTO_PAR_DOMAINE: Record<Domaine, Photo> = {
  'production-animale': PHOTOS.elevageCailles,
  'production-vegetale': PHOTOS.serreMaraichage,
  environnement: PHOTOS.bananeraieAllee,
  agribusiness: PHOTOS.bananeraie,
  transversal: PHOTOS.amphitheatre,
  agroalimentaire: PHOTOS.campusCour,
  technologie: PHOTOS.campusCour,
};

export function photoDuDomaine(domaines: readonly Domaine[]): Photo {
  const premier = domaines[0];
  return premier ? PHOTO_PAR_DOMAINE[premier] : PHOTOS.campusCour;
}
