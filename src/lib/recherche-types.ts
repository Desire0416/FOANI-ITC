/* ==========================================================================
   Vocabulaire de la recherche globale
   --------------------------------------------------------------------------
   Ce module ne contient que des types et des libellés — aucune lecture de
   données. C'est ce qui permet au composant de recherche, qui tourne dans le
   navigateur, de les importer sans entraîner avec lui la couche de données :
   un `import` de trop et Payload, sharp et leurs dépendances Node se
   retrouvaient dans le paquet du visiteur.

   La construction de l'index, elle, vit dans `index-recherche.ts`, qui lit la
   base et ne s'exécute que sur le serveur.
   ========================================================================== */

export type TypeResultat =
  | 'formation'
  | 'page'
  | 'actualite'
  | 'evenement'
  | 'ressource'
  | 'expertise';

export type Resultat = {
  readonly id: string;
  readonly titre: string;
  readonly resume: string;
  readonly url: string;
  readonly type: TypeResultat;
  readonly categorie: string;
  /** Chaîne normalisée sur laquelle porte la comparaison. */
  readonly cle: string;
};

export const LIBELLES_TYPE: Record<TypeResultat, string> = {
  formation: 'Formation',
  page: 'Page',
  actualite: 'Actualité',
  evenement: 'Événement',
  ressource: 'Ressource agricole',
  expertise: 'Expertise',
};
