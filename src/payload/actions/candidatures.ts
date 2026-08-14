'use server';

import { revalidatePath } from 'next/cache';
import { headers as entetes } from 'next/headers';
import { getPayload } from 'payload';
import config from '@payload-config';
import { etat as lireEtat } from '@/lib/etats';
import type { Candidature } from '@/payload-types';
import { serviceDuRole, transition as lireTransition } from '../chaine';
import { ROLES_DECISION, ROLES_INSTRUCTION, ROLES_VERSEMENTS, type Role } from '../roles';

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

/**
 * Une garde par acte, et non une seule pour tout l'ecran.
 *
 * Une garde unique faisait se ressembler des roles que le §5.2 distingue :
 * la scolarite pouvait prononcer une admission, et les finances ne pouvaient
 * pas rapprocher un versement — l'inverse exact de leurs perimetres.
 *
 * La separation tient en une phrase : celui qui instruit n'encaisse pas,
 * celui qui rapproche les versements ne decide pas de l'admission.
 */
function habilite(user: unknown, roles: readonly Role[]): boolean {
  const agent = user as { collection?: string; role?: Role; actif?: boolean } | null;
  if (agent?.collection !== 'utilisateurs' || agent.actif === false) return false;
  return agent.role ? roles.includes(agent.role) : false;
}

/** Refus expliqué : l'agent doit savoir à quel service revient l'acte. */
const REFUS = {
  instruction:
    'Instruire un dossier revient au service des admissions. Votre rôle ne le permet pas.',
  decision:
    'Prononcer une admission revient au service des admissions. Votre rôle ne le permet pas.',
  versement:
    'Rapprocher un versement du relevé revient au service des finances. Votre rôle ne le permet pas.',
} as const;

function rafraichir(id: string) {
  revalidatePath('/gestion/candidatures');
  revalidatePath(`/gestion/candidatures/${id}`);
  revalidatePath('/gestion');
}

/** États que l'instruction peut poser. Le type vient du schéma : un état
 *  inventé ne compile pas. */
export type EtatInstruction = NonNullable<Candidature['etat']>;

/**
 * Fait avancer un dossier le long de la chaîne.
 *
 * Trois contrôles, qu'aucune version précédente ne faisait :
 *
 * — la transition demandée doit exister (RG-41). L'action acceptait auparavant
 *   n'importe quel état, y compris un saut d'étape ;
 * — elle doit revenir au service de l'agent. Un chargé d'admission ne valide
 *   pas une inscription, la scolarité ne constate pas un versement ;
 * — un retour en arrière exige un motif (RG-43), qui rejoint le journal.
 *
 * L'état visé n'est pas relu depuis le navigateur : il est comparé à l'état
 * réel du dossier, lu en base au moment de l'action.
 */
export async function changerEtat(
  id: string,
  nouvelEtat: EtatInstruction,
  motif = '',
): Promise<Retour> {
  const { payload, user } = await contexte();

  const agent = user as { collection?: string; role?: Role; actif?: boolean } | null;
  if (agent?.collection !== 'utilisateurs' || agent.actif === false || !agent.role) {
    return { ok: false, message: REFUS.instruction };
  }

  let courant: string;
  try {
    const dossier = await payload.findByID({
      collection: 'candidatures',
      id,
      depth: 0,
      overrideAccess: true,
    });
    courant = String((dossier as { etat?: string }).etat ?? '');
  } catch {
    return { ok: false, message: 'Ce dossier est introuvable.' };
  }

  const permise = lireTransition(courant, nouvelEtat);
  if (!permise) {
    return {
      ok: false,
      message: `Un dossier « ${lireEtat(courant).libelle} » ne peut pas passer directement à « ${lireEtat(nouvelEtat).libelle} ».`,
    };
  }

  const service = serviceDuRole(agent.role);
  const toutPuissant = agent.role === 'administrateur';
  if (!toutPuissant && service !== permise.par) {
    return {
      ok: false,
      message: `Ce geste revient au service ${permise.par}. Votre poste ne le permet pas.`,
    };
  }

  if (permise.recule && motif.trim().length < 3) {
    return {
      ok: false,
      message: 'Un retour en arrière demande un motif : il restera visible dans l’historique.',
    };
  }

  try {
    await payload.update({
      collection: 'candidatures',
      id,
      data: { etat: nouvelEtat },
      user,
      overrideAccess: false,
      /* Le motif ne rejoint pas un champ du dossier mais son journal : le
         RG-43 veut qu'il « demeure visible dans l'historique », et un champ
         serait écrasé au retour suivant. */
      context: {
        motifTransition: motif.trim(),
        transitionAssistee: permise.assiste === true,
      },
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
  if (!habilite(user, ROLES_INSTRUCTION)) return { ok: false, message: REFUS.instruction };
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
  if (!habilite(user, ROLES_VERSEMENTS)) return { ok: false, message: REFUS.versement };

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
  if (!habilite(user, ROLES_DECISION)) return { ok: false, message: REFUS.decision };
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
