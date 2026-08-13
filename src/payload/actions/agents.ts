'use server';

import { revalidatePath } from 'next/cache';
import { headers as entetes } from 'next/headers';
import { getPayload } from 'payload';
import config from '@payload-config';
import { LIBELLES_ROLE, type Role } from '../roles';

/* ==========================================================================
   Actions sur les comptes d'agents — CDC §5.2
   --------------------------------------------------------------------------
   « Les droits sont attribués par rôle, jamais par personne. » L'écran de
   gestion des agents doit donc permettre de changer un rôle et de couper un
   accès, sans passer par un formulaire d'édition complet.

   Toutes les actions vérifient l'auteur côté serveur. Une action déclenchée
   depuis l'interface n'est jamais présumée légitime : `overrideAccess: false`
   fait repasser Payload par les règles de `acces.ts`, et la vérification de
   rôle ci-dessous ferme la porte avant même d'y arriver.
   ========================================================================== */

export type ResultatAction = { readonly ok: boolean; readonly message: string };

async function contexte() {
  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers: await entetes() });
  return { payload, user };
}

function estAdministrateur(user: unknown): boolean {
  const agent = user as { collection?: string; role?: Role; actif?: boolean } | null;
  return agent?.collection === 'utilisateurs' && agent.role === 'administrateur' && agent.actif !== false;
}

/** Active ou désactive un compte. Le compte n'est jamais supprimé (§5.2). */
export async function basculerActivation(id: string, actif: boolean): Promise<ResultatAction> {
  const { payload, user } = await contexte();
  if (!estAdministrateur(user)) {
    return { ok: false, message: 'Seul un administrateur peut modifier un compte.' };
  }
  if (String(user?.id) === String(id) && !actif) {
    // Se désactiver soi-même ferme la porte de l'intérieur.
    return { ok: false, message: 'Vous ne pouvez pas désactiver votre propre compte.' };
  }

  try {
    await payload.update({
      collection: 'utilisateurs',
      id,
      data: { actif },
      user,
      overrideAccess: false,
    });
    revalidatePath('/gestion/agents');
    return {
      ok: true,
      message: actif ? 'Compte réactivé. L’agent peut se reconnecter.' : 'Compte désactivé. L’historique est conservé.',
    };
  } catch {
    return { ok: false, message: 'La modification n’a pas pu être enregistrée.' };
  }
}

/** Change le rôle d'un agent, et donc l'ensemble de ses droits. */
export async function changerRole(id: string, role: Role): Promise<ResultatAction> {
  const { payload, user } = await contexte();
  if (!estAdministrateur(user)) {
    return { ok: false, message: 'Seul un administrateur peut attribuer un rôle.' };
  }
  if (String(user?.id) === String(id) && role !== 'administrateur') {
    return { ok: false, message: 'Vous ne pouvez pas retirer votre propre rôle d’administrateur.' };
  }

  try {
    await payload.update({
      collection: 'utilisateurs',
      id,
      data: { role },
      user,
      overrideAccess: false,
    });
    revalidatePath('/gestion/agents');
    return { ok: true, message: `Rôle changé pour « ${LIBELLES_ROLE[role]} ».` };
  } catch {
    return { ok: false, message: 'Le rôle n’a pas pu être changé.' };
  }
}

/**
 * Déclenche une réinitialisation de mot de passe.
 *
 * L'acheminement dépend d'un adaptateur de messagerie, qui relève de la
 * phase 0 (§22.1 : « courriel et message court »). Tant qu'il n'est pas
 * configuré, l'action le dit franchement au lieu d'afficher un envoi qui n'a
 * pas eu lieu.
 */
export async function reinitialiserMotDePasse(id: string): Promise<ResultatAction> {
  const { payload, user } = await contexte();
  if (!estAdministrateur(user)) {
    return { ok: false, message: 'Seul un administrateur peut lancer une réinitialisation.' };
  }

  try {
    const agent = await payload.findByID({ collection: 'utilisateurs', id, overrideAccess: true });
    const email = (agent as { email?: string }).email;
    if (!email) return { ok: false, message: 'Ce compte n’a pas d’adresse électronique.' };

    if (!process.env.SMTP_HOST && !process.env.RESEND_API_KEY) {
      return {
        ok: false,
        message:
          'Aucun service d’envoi n’est configuré : le lien ne partirait nulle part. Communiquez un mot de passe provisoire à l’agent et demandez-lui de le changer.',
      };
    }

    await payload.forgotPassword({ collection: 'utilisateurs', data: { email }, disableEmail: false });
    return { ok: true, message: `Lien de réinitialisation envoyé à ${email}.` };
  } catch {
    return { ok: false, message: 'La réinitialisation n’a pas pu être lancée.' };
  }
}
