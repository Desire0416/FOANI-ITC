/* ==========================================================================
   Rôles internes — CDC §5.2
   --------------------------------------------------------------------------
   « Les droits sont attribués par rôle, jamais par personne, et un compte
   n'est jamais partagé entre plusieurs agents. »

   Le principe de moindre privilège (§5.2) est appliqué littéralement : chaque
   rôle reçoit exactement les droits nécessaires à sa fonction, et la colonne
   « ne peut pas » du CDC est traduite en refus explicites dans `acces.ts`.
   ========================================================================== */

export const ROLES = [
  'administrateur',
  'editeur',
  'redacteur',
  'admission',
  'scolarite',
  'finances',
  'consultation',
  'carrieres',
  'recherche',
] as const;

export type Role = (typeof ROLES)[number];

export const LIBELLES_ROLE: Record<Role, string> = {
  administrateur: 'Administrateur',
  editeur: 'Éditeur',
  redacteur: 'Rédacteur',
  admission: 'Chargé d’admission',
  scolarite: 'Scolarité',
  finances: 'Finances',
  consultation: 'Consultation',
  carrieres: 'Responsable carrières et partenariats',
  recherche: 'Référent recherche et innovation',
};

export const PERIMETRES_ROLE: Record<Role, string> = {
  administrateur: 'Configuration générale, comptes et rôles, accès à l’ensemble des espaces.',
  editeur: 'Création, modification et publication de tous les contenus du site.',
  redacteur: 'Rédaction et soumission de contenus, sans publication.',
  admission: 'Instruction des candidatures, demande de pièces, décision d’admission, export.',
  scolarite: 'Inscriptions, dossiers étudiants, documents administratifs, décisions académiques.',
  finances: 'Versements, grilles tarifaires, situations et relances.',
  consultation: 'Lecture des tableaux de bord et des états de synthèse.',
  carrieres: 'Offres de stage et d’emploi, relations entreprises, demandes entrantes.',
  recherche: 'Profils chercheurs, projets, publications et contenus scientifiques.',
};

/**
 * Rôles autorisés à consulter les pièces d'identité déposées par les candidats.
 * §20.2 : « Restreindre l'accès aux pièces d'identité aux seuls rôles habilités,
 * et journaliser les consultations. » La liste est volontairement courte et
 * n'est référencée qu'ici.
 */
export const ROLES_PIECES: readonly Role[] = ['administrateur', 'admission', 'scolarite'];

/** Rôles instruisant les candidatures — §5.2. */
export const ROLES_CANDIDATURES: readonly Role[] = ['administrateur', 'admission', 'scolarite'];

/** Rôles touchant au dossier étudiant permanent — §5.2. */
export const ROLES_PERSONNES: readonly Role[] = ['administrateur', 'admission', 'scolarite'];
