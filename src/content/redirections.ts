/* ==========================================================================
   Plan de redirections — CDC §19.1
   --------------------------------------------------------------------------
   « Les adresses du site précédent doivent continuer de fonctionner : un lien
   partagé, une page indexée ou un document imprimé ne doivent pas aboutir sur
   une erreur. »

   Le tableau ci-dessous est le plan lui-même. Il est vide tant que
   l'établissement n'a pas fourni la liste des adresses de l'ancien site — et
   c'est volontaire : une redirection inventée envoie un visiteur sur une page
   qui n'a rien à voir avec ce qu'il cherchait, ce qui est pire qu'une erreur
   franche.

   Comment le remplir
   ------------------
   1. Récupérer les adresses de l'ancien site : export du plan de site, journal
      du serveur, ou rapport d'indexation de la Search Console.
   2. Pour chaque adresse, écrire la page correspondante du nouveau site.
   3. Ajouter une ligne ici. La redirection est active à la construction
      suivante ; aucune autre modification n'est nécessaire.

   `permanente` vaut `true` par défaut (301) : l'adresse a définitivement
   changé, et les moteurs doivent transférer l'ancienneté de la page. On ne
   passe à `false` (307) que pour un déplacement temporaire.
   ========================================================================== */

export type Redirection = {
  /** Adresse de l'ancien site, telle qu'elle circule encore. */
  readonly depuis: string;
  /** Page du nouveau site qui traite le même sujet. */
  readonly vers: string;
  readonly permanente?: boolean;
  /** D'où vient cette adresse : utile pour vérifier le plan plus tard. */
  readonly source?: string;
};

export const REDIRECTIONS: readonly Redirection[] = [
  /* Exemple de la forme attendue, à supprimer au premier ajout réel :
  { depuis: '/nos-formations.php', vers: '/formations', source: 'Ancien menu principal' },
  { depuis: '/inscription', vers: '/candidature', source: 'Bouton de l’ancien site' },
  */
];

/**
 * Redirections internes, décidées par la refonte elle-même.
 *
 * Elles ne dépendent d'aucune information extérieure : ce sont des adresses
 * que le nouveau site a lui-même déplacées ou raccourcies, et qu'il faut
 * continuer d'honorer parce qu'elles ont pu être partagées.
 */
export const REDIRECTIONS_INTERNES: readonly Redirection[] = [
  { depuis: '/admission', vers: '/admissions', source: 'Singulier fréquemment saisi' },
  { depuis: '/formation', vers: '/formations', source: 'Singulier fréquemment saisi' },
  { depuis: '/actualite', vers: '/actualites', source: 'Singulier fréquemment saisi' },
  { depuis: '/evenement', vers: '/evenements', source: 'Singulier fréquemment saisi' },
  { depuis: '/contactez-nous', vers: '/contact', source: 'Formulation courante' },
  { depuis: '/candidater', vers: '/candidature', source: 'Libellé du bouton principal' },
  { depuis: '/mon-compte', vers: '/mon-dossier', source: 'Formulation courante' },
  { depuis: '/admin', vers: '/gestion', source: 'Réflexe d’administrateur' },
];

/** Les deux plans réunis, au format attendu par Next. */
export function toutesLesRedirections() {
  return [...REDIRECTIONS_INTERNES, ...REDIRECTIONS].map((regle) => ({
    source: regle.depuis,
    destination: regle.vers,
    permanent: regle.permanente ?? true,
  }));
}
