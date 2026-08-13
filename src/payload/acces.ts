import type { Access, FieldAccess } from 'payload';
import type { Role } from './roles';

/* ==========================================================================
   Contrôle d'accès
   --------------------------------------------------------------------------
   Toutes les règles d'accès du dispositif passent par ce fichier. Une règle
   écrite deux fois finit par diverger ; une règle écrite ici est vraie
   partout, y compris dans l'interface d'administration, l'API REST et
   l'API GraphQL, que Payload dérive des mêmes fonctions.
   ========================================================================== */

type Agent = { readonly collection?: string; readonly role?: Role; readonly actif?: boolean };

/** Agent interne authentifié et actif. Un compte désactivé ne vaut rien. */
function agent(utilisateur: unknown): Agent | null {
  const candidat = utilisateur as Agent | null;
  if (!candidat || candidat.collection !== 'utilisateurs') return null;
  if (candidat.actif === false) return null;
  return candidat;
}

/** Le compte d'un candidat, par opposition à un agent de l'établissement. */
function estCandidat(utilisateur: unknown): boolean {
  return (utilisateur as Agent | null)?.collection === 'candidats';
}

export function aRole(utilisateur: unknown, roles: readonly Role[]): boolean {
  const interne = agent(utilisateur);
  if (!interne?.role) return false;
  return roles.includes(interne.role);
}

/** Autorise les rôles indiqués, refuse tout le reste. */
export function reserveA(roles: readonly Role[]): Access {
  return ({ req }) => aRole(req.user, roles);
}

/** Même règle, au niveau d'un champ. */
export function champReserveA(roles: readonly Role[]): FieldAccess {
  return ({ req }) => aRole(req.user, roles);
}

export const administrateurSeul: Access = ({ req }) => aRole(req.user, ['administrateur']);

/** Tout agent interne actif, quel que soit son rôle. */
export const agentInterne: Access = ({ req }) => agent(req.user) !== null;

/**
 * Un candidat n'accède qu'à ses propres données ; un agent habilité accède à
 * l'ensemble. Le filtre est retourné sous forme de contrainte de requête, et
 * non appliqué après coup : c'est ce qui garantit qu'aucun enregistrement
 * étranger ne transite, même par l'API.
 */
export function siensOuRoles(champProprietaire: string, roles: readonly Role[]): Access {
  return ({ req }) => {
    if (aRole(req.user, roles)) return true;
    if (!estCandidat(req.user) || !req.user) return false;
    return { [champProprietaire]: { equals: req.user.id } };
  };
}

/** Personne ne supprime : §11.2 et §13.3 imposent la conservation. */
export const suppressionInterdite: Access = () => false;
