import { headers as entetes } from 'next/headers';
import { redirect } from 'next/navigation';
import { getPayload } from 'payload';
import config from '@payload-config';
import type { Role } from '@/payload/roles';

/* ==========================================================================
   Session d'un agent
   --------------------------------------------------------------------------
   Le back-office ne fait jamais confiance au navigateur : chaque page vérifie
   la session côté serveur avant de rendre quoi que ce soit. Une entrée de
   menu masquée n'est pas une sécurité (§5.2, moindre privilège) ; c'est cette
   vérification qui l'est.
   ========================================================================== */

export type Agent = {
  readonly id: string;
  readonly email: string;
  readonly nom: string;
  readonly prenoms: string;
  readonly nomComplet: string;
  readonly fonction: string | null;
  readonly role: Role;
  readonly actif: boolean;
  readonly initiales: string;
};

function initiales(nomComplet: string): string {
  return (
    nomComplet
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((mot) => mot[0]?.toUpperCase() ?? '')
      .join('') || 'A'
  );
}

/** Agent connecté, ou `null`. Ne redirige pas. */
export async function agentConnecte(): Promise<Agent | null> {
  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers: await entetes() });

  if (!user || user.collection !== 'utilisateurs') return null;

  const brut = user as unknown as Record<string, unknown>;
  // Un compte désactivé conserve son historique mais ne se connecte plus.
  if (brut.actif === false) return null;

  const nomComplet = String(brut.nomComplet || brut.email || 'Agent');

  return {
    id: String(brut.id),
    email: String(brut.email ?? ''),
    nom: String(brut.nom ?? ''),
    prenoms: String(brut.prenoms ?? ''),
    nomComplet,
    fonction: brut.fonction ? String(brut.fonction) : null,
    role: (brut.role as Role | undefined) ?? 'consultation',
    actif: brut.actif !== false,
    initiales: initiales(nomComplet),
  };
}

/** Agent connecté, ou redirection vers l'écran d'accès. */
export async function exigerAgent(): Promise<Agent> {
  const agent = await agentConnecte();
  if (!agent) redirect('/gestion/connexion');
  return agent;
}

/** Agent connecté disposant de l'un des rôles indiqués, sinon renvoi à l'accueil. */
export async function exigerRole(roles: readonly Role[]): Promise<Agent> {
  const agent = await exigerAgent();
  if (!roles.includes(agent.role)) redirect('/gestion');
  return agent;
}

/** Instance Payload pour les lectures côté serveur. */
export async function socle() {
  return getPayload({ config });
}
