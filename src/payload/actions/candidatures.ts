'use server';

import { revalidatePath } from 'next/cache';
import { headers as entetes } from 'next/headers';
import { getPayload } from 'payload';
import config from '@payload-config';
import { etat as lireEtat } from '@/lib/etats';
import type { Candidature } from '@/payload-types';
import { ROLES_CANDIDATURES, type Role } from '../roles';

/* ==========================================================================
   Instruction d'une candidature — CDC §10.3
   --------------------------------------------------------------------------
   « Validation ou rejet pièce par pièce, avec motif. Demande de complément
   adressée au candidat, qui rouvre son dossier. Décision d'admission,
   individuelle ou par lot. Journal conservant l'auteur et la date de chaque
   décision. »

   Chaque action revérifie l'auteur côté serveur et repasse par les règles
   d'accès de `acces.ts`. Rien n'est présumé légitime parce que le bouton
   existait à l'écran.
   ========================================================================== */

export type Retour = { readonly ok: boolean; readonly message: string };

async function contexte() {
  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers: await entetes() });
  return { payload, user };
}

function habilite(user: unknown): boolean {
  const agent = user as { collection?: string; role?: Role; actif?: boolean } | null;
  if (agent?.collection !== 'utilisateurs' || agent.actif === false) return false;
  return agent.role ? ROLES_CANDIDATURES.includes(agent.role) : false;
}

function rafraichir(id: string) {
  revalidatePath('/gestion/candidatures');
  revalidatePath(`/gestion/candidatures/${id}`);
  revalidatePath('/gestion');
}

/** États que l'instruction peut poser. Le type vient du schéma : un état
 *  inventé ne compile pas. */
export type EtatInstruction = NonNullable<Candidature['etat']>;

/** Fait avancer l'état du dossier. Le journal est écrit par la collection. */
export async function changerEtat(id: string, nouvelEtat: EtatInstruction): Promise<Retour> {
  const { payload, user } = await contexte();
  if (!habilite(user)) return { ok: false, message: 'Vous n’êtes pas habilité à instruire un dossier.' };

  try {
    await payload.update({
      collection: 'candidatures',
      id,
      data: { etat: nouvelEtat },
      user,
      overrideAccess: false,
    });
    rafraichir(id);
    return { ok: true, message: `Dossier passé à « ${lireEtat(nouvelEtat).libelle} ».` };
  } catch {
    return { ok: false, message: 'L’état n’a pas pu être changé.' };
  }
}

/**
 * Statue sur une pièce. Un rejet exige un motif : c'est lui qui sera
 * communiqué au candidat avec la demande de complément (§10.3).
 */
export async function deciderPiece(
  id: string,
  index: number,
  etatPiece: 'attente' | 'acceptee' | 'rejetee',
  motif: string,
): Promise<Retour> {
  const { payload, user } = await contexte();
  if (!habilite(user)) return { ok: false, message: 'Vous n’êtes pas habilité à instruire un dossier.' };
  if (etatPiece === 'rejetee' && motif.trim().length < 3) {
    return { ok: false, message: 'Un rejet demande un motif : le candidat doit savoir quoi corriger.' };
  }

  try {
    const dossier = await payload.findByID({
      collection: 'candidatures',
      id,
      depth: 0,
      overrideAccess: true,
    });

    const pieces = [...((dossier as { pieces?: Record<string, unknown>[] }).pieces ?? [])];
    const piece = pieces[index];
    if (!piece) return { ok: false, message: 'Cette pièce n’existe plus dans le dossier.' };

    pieces[index] = { ...piece, etatPiece, motif: etatPiece === 'rejetee' ? motif.trim() : null };

    await payload.update({
      collection: 'candidatures',
      id,
      data: { pieces },
      user,
      overrideAccess: false,
    });
    rafraichir(id);
    return {
      ok: true,
      message: etatPiece === 'acceptee' ? 'Pièce acceptée.' : etatPiece === 'rejetee' ? 'Pièce rejetée, motif enregistré.' : 'Pièce remise en attente.',
    };
  } catch {
    return { ok: false, message: 'La décision sur la pièce n’a pas pu être enregistrée.' };
  }
}

/** Rapproche la référence de transaction du relevé — §10.2, validation humaine. */
export async function rapprocherTransaction(id: string, verifiee: boolean): Promise<Retour> {
  const { payload, user } = await contexte();
  if (!habilite(user)) return { ok: false, message: 'Vous n’êtes pas habilité à instruire un dossier.' };

  try {
    await payload.update({
      collection: 'candidatures',
      id,
      data: { transactionVerifiee: verifiee },
      user,
      overrideAccess: false,
    });
    rafraichir(id);
    return {
      ok: true,
      message: verifiee ? 'Référence rapprochée du relevé.' : 'Rapprochement annulé.',
    };
  } catch {
    return { ok: false, message: 'Le rapprochement n’a pas pu être enregistré.' };
  }
}

/**
 * Enregistre la décision d'admission.
 *
 * La collection pose elle-même l'auteur et la date (§10.3) : ils ne
 * transitent pas par le navigateur.
 */
export async function enregistrerDecision(
  id: string,
  sens: 'admis' | 'admis-condition' | 'attente' | 'refuse',
  conditions: string,
): Promise<Retour> {
  const { payload, user } = await contexte();
  if (!habilite(user)) return { ok: false, message: 'Vous n’êtes pas habilité à décider d’une admission.' };
  if (sens === 'admis-condition' && conditions.trim().length < 3) {
    return { ok: false, message: 'Une admission sous condition demande les conditions à lever.' };
  }

  try {
    await payload.update({
      collection: 'candidatures',
      id,
      data: {
        decisionSens: sens,
        decisionConditions: sens === 'admis-condition' ? conditions.trim() : null,
        etat: sens,
      },
      user,
      overrideAccess: false,
    });
    rafraichir(id);
    return { ok: true, message: `Décision enregistrée : ${lireEtat(sens).libelle}.` };
  } catch {
    return { ok: false, message: 'La décision n’a pas pu être enregistrée.' };
  }
}
