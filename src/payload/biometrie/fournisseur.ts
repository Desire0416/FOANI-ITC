/* ==========================================================================
   Reconnaissance faciale et lecture des pièces — Note complémentaire §5.4
   --------------------------------------------------------------------------
   « La dématérialisation supprime le contrôle visuel de l'original. Elle doit
   être compensée par des contrôles que le traitement papier ne permettait
   pas. » Et parmi eux : « cohérence croisée — les informations déclarées,
   celles figurant sur la pièce d'identité et celles du relevé de notes doivent
   concorder ».

   POURQUOI CE MODULE EXISTE. Les contrôles précédents portaient sur la qualité
   de l'image : définition, netteté, exposition, fond. Ils sont nécessaires et
   ils ne suffisent pas — une photographie parfaitement nette d'un mur les
   passe tous, et une pièce d'identité appartenant à quelqu'un d'autre aussi.
   Le seul barrage réel était l'œil de l'agent, ce qui, à l'échelle d'une
   campagne d'admission, revient à n'en avoir aucun sur la majorité des
   dossiers.

   CE QUE LA LOI EXIGE, ET QUI N'EST PAS FACULTATIF. La loi ivoirienne
   n° 2013-450 relative à la protection des données à caractère personnel
   soumet le traitement de données biométriques à AUTORISATION PRÉALABLE de
   l'autorité de protection. Comparer deux visages est un tel traitement.
   Contrôler la netteté d'une image ne l'est pas.

   Trois dispositions en découlent, et elles sont dans le code, pas seulement
   dans une note :

   1. Le dispositif est INACTIF tant qu'aucun fournisseur n'est configuré. Il
      ne se met pas en marche par défaut, et il ne prétend pas contrôler quand
      il ne contrôle pas.
   2. Aucun gabarit facial n'est conservé. On calcule une comparaison, on
      garde son score, on jette les images de travail. Conserver un gabarit
      serait constituer une base biométrique, ce qui est un traitement bien
      plus lourd que celui-ci.
   3. Le consentement du candidat est recueilli et horodaté avant tout envoi,
      distinctement de celui portant sur l'impression de sa photographie.

   POURQUOI UNE INTERFACE PLUTÔT QU'UN APPEL DIRECT. Le fournisseur est un
   choix de l'établissement, pas du dispositif : il engage un contrat, un lieu
   d'hébergement des traitements et une déclaration. Le jour où il change —
   pour un service hébergé en Afrique, ou pour un modèle installé sur les
   serveurs de l'établissement —, c'est un fichier à écrire, pas un parcours à
   refaire.
   ========================================================================== */

export type Visage = {
  /** Confiance que la zone détectée est bien un visage, en pourcentage. */
  readonly confiance: number;
  /** Qualité de l'image du visage : netteté et luminosité, 0 à 100. */
  readonly nettete: number;
  readonly luminosite: number;
  /** Part de la surface de l'image occupée par le visage, 0 à 1. */
  readonly surface: number;
  readonly yeuxOuverts: boolean | null;
  readonly lunettesSoleil: boolean | null;
  /** Rotation de la tête, en degrés. */
  readonly lacet: number | null;
  readonly tangage: number | null;
  readonly roulis: number | null;
};

export type Comparaison = {
  /** Similarité entre les deux visages, en pourcentage. `null` si aucun n'est comparable. */
  readonly similarite: number | null;
};

export type Fournisseur = {
  readonly nom: string;
  /** Les visages présents dans une image, du plus grand au plus petit. */
  detecterVisages(image: Buffer): Promise<readonly Visage[]>;
  /** Compare le visage de référence à celui de la cible. */
  comparerVisages(reference: Buffer, cible: Buffer): Promise<Comparaison>;
  /** Les lignes de texte lisibles dans une image. */
  lireTexte(image: Buffer): Promise<readonly string[]>;
};

/** Le fournisseur absent : il ne prétend rien, et le dit. */
export const AUCUN_FOURNISSEUR = null;
