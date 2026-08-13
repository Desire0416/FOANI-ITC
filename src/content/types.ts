/* ==========================================================================
   Modèle de contenu éditorial
   --------------------------------------------------------------------------
   Deux principes tenus du CDC :

   §9.3 « Aucune rubrique n'est publiée sans contenu » — d'où le champ
   `statut`, qui distingue ce qui est vérifié de ce qui reste à confirmer par
   l'établissement. Rien n'est affiché comme certain sans l'être.

   Annexe A « La documentation institutionnelle ne précise ni les durées, ni
   les tarifs, ni les conditions d'admission » — d'où les `null` explicites
   plutôt que des valeurs inventées. L'interface sait présenter une donnée
   manquante ; elle ne sait pas rattraper une donnée fausse.
   ========================================================================== */

/** Provenance d'une information publiée. */
export type Statut =
  /** Établi par le CDC ou la documentation institutionnelle. */
  | 'verifie'
  /** Proposition rédactionnelle du prestataire, soumise à validation. */
  | 'a-valider'
  /** Donnée absente : l'établissement doit la fournir avant publication. */
  | 'a-fournir';

export type Cycle = 'bts' | 'licence' | 'certificat' | 'masterclass';

export type Domaine =
  | 'production-animale'
  | 'production-vegetale'
  | 'agroalimentaire'
  | 'agribusiness'
  | 'environnement'
  | 'technologie'
  | 'transversal';

export type Modalite = 'presentiel' | 'hybride' | 'terrain';

export type ModuleProgramme = {
  readonly annee: string;
  readonly modules: readonly string[];
};

export type QuestionReponse = {
  readonly question: string;
  readonly reponse: string;
};

export type Formation = {
  readonly slug: string;
  readonly intitule: string;
  /** Option ou spécialité, lorsque l'intitulé officiel en comporte une. */
  readonly option?: string;
  readonly cycle: Cycle;
  readonly domaines: readonly Domaine[];
  /** Diplôme, certificat ou attestation effectivement délivré. */
  readonly diplome: string;
  /** Durée en mois. `null` tant que l'établissement ne l'a pas arrêtée. */
  readonly dureeMois: number | null;
  readonly dureeStatut: Statut;
  readonly niveauRequis: string;
  readonly niveauRequisStatut: Statut;
  /** Résumé d'une phrase, affiché en liste et en méta-description. */
  readonly resume: string;
  readonly objectifs: readonly string[];
  readonly competences: readonly string[];
  readonly programme: readonly ModuleProgramme[] | null;
  readonly debouches: readonly string[];
  readonly poursuites: readonly string[];
  readonly modalite: Modalite;
  readonly lieu: string;
  readonly langue: string;
  /** Frais de scolarité en francs CFA, entiers. `null` = à publier. */
  readonly fraisXof: number | null;
  readonly echeancier: string | null;
  readonly agrementRef: string | null;
  readonly responsable: string | null;
  readonly faq: readonly QuestionReponse[];
  /** Qualité d'ensemble de la fiche, pilotant l'affichage des réserves. */
  readonly statut: Statut;
};

export type SessionCourte = {
  readonly debut: string | null;
  readonly fin: string | null;
  readonly lieu: string;
  readonly capacite: number | null;
  readonly tarifXof: number | null;
};

export type Ressource = {
  readonly slug: string;
  readonly titre: string;
  readonly filiere: string;
  readonly resume: string;
  readonly sections: readonly { readonly titre: string; readonly corps: readonly string[] }[];
  readonly formationLiee: string | null;
  readonly miseAJour: string;
  readonly statut: Statut;
};

export type Actualite = {
  readonly slug: string;
  readonly titre: string;
  readonly categorie: string;
  readonly date: string;
  readonly chapo: string;
  readonly corps: readonly string[];
  readonly statut: Statut;
};

export type Evenement = {
  readonly slug: string;
  readonly titre: string;
  readonly date: string | null;
  readonly lieu: string;
  readonly resume: string;
  readonly inscriptionRequise: boolean;
  readonly statut: Statut;
};

export type Membre = {
  readonly slug: string;
  readonly nom: string | null;
  readonly fonction: string;
  readonly discipline: string;
  readonly expertises: readonly string[];
  readonly biographie: string | null;
  readonly statut: Statut;
};

export type ChiffreCle = {
  readonly valeur: string;
  readonly libelle: string;
  readonly source: string;
  readonly statut: Statut;
};

export type OffreExpertise = {
  readonly slug: string;
  readonly intitule: string;
  readonly volet: 'vegetale' | 'animale';
  readonly resume: string;
  readonly prestations: readonly string[];
};
