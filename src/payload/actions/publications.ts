'use server';

import { revalidatePath } from 'next/cache';
import { headers as entetes } from 'next/headers';
import { getPayload } from 'payload';
import config from '@payload-config';
import { ROLES_OFFRES, ROLES_PUBLICATION, ROLES_REDACTION, type EtatPublication } from '../publication';
import type { Role } from '../roles';

/* ==========================================================================
   Actions éditoriales — CDC §15 et §24.4
   --------------------------------------------------------------------------
   Le cycle Brouillon → À valider → Publié → Archivé se pilote ici, et nulle
   part ailleurs. Trois raisons de ne pas laisser l'écran écrire directement
   le champ `etat` :

   1. une transition n'est pas une valeur. Passer de « brouillon » à « publié »
      sans relecture est un raccourci que le CDC exclut ; le contrôle porte
      donc sur le chemin, pas sur la destination ;
   2. les droits diffèrent selon la transition — un rédacteur soumet, un
      éditeur publie ;
   3. la mise en ligne doit régénérer les pages publiques concernées. C'est
      fait ici, au moment exact où le contenu change d'état.
   ========================================================================== */

export type Rubrique = 'actualites' | 'evenements' | 'offres';

export type Retour = { readonly ok: boolean; readonly message: string };

/** Transitions permises, et qui a le droit de les demander. */
const TRANSITIONS: Record<
  string,
  { readonly depuis: readonly EtatPublication[]; readonly roles: readonly Role[]; readonly libelle: string }
> = {
  soumettre: {
    depuis: ['brouillon'],
    roles: ROLES_REDACTION,
    libelle: 'Soumis à validation',
  },
  reprendre: {
    depuis: ['a-valider'],
    roles: ROLES_REDACTION,
    libelle: 'Repassé en brouillon',
  },
  publier: {
    depuis: ['brouillon', 'a-valider', 'archive'],
    roles: ROLES_PUBLICATION,
    libelle: 'Mis en ligne',
  },
  depublier: {
    depuis: ['publie'],
    roles: ROLES_PUBLICATION,
    libelle: 'Retiré du site',
  },
  archiver: {
    depuis: ['brouillon', 'a-valider', 'publie'],
    roles: ROLES_PUBLICATION,
    libelle: 'Archivé',
  },
};

const ETAT_APRES: Record<string, EtatPublication> = {
  soumettre: 'a-valider',
  reprendre: 'brouillon',
  publier: 'publie',
  depublier: 'brouillon',
  archiver: 'archive',
};

export type Transition = keyof typeof ETAT_APRES;

/** Pages publiques à régénérer quand une rubrique change. */
const PAGES: Record<Rubrique, readonly string[]> = {
  actualites: ['/', '/actualites', '/plan-du-site'],
  evenements: ['/', '/evenements', '/campus'],
  offres: ['/carrieres'],
};

async function contexte() {
  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers: await entetes() });
  const agent = user as { collection?: string; role?: Role; actif?: boolean; nomComplet?: string; email?: string } | null;
  const valide = agent?.collection === 'utilisateurs' && agent.actif !== false ? agent : null;
  return { payload, agent: valide };
}

function rolesDeLaRubrique(rubrique: Rubrique, roles: readonly Role[]): readonly Role[] {
  // Le responsable carrières écrit les offres, et rien d'autre (§8.5).
  if (rubrique === 'offres' && roles === ROLES_REDACTION) return ROLES_OFFRES;
  return roles;
}

/**
 * Fait franchir une étape à un contenu.
 *
 * L'état de départ est relu en base — pas reçu de l'écran : deux agents sur
 * le même contenu ne doivent pas pouvoir enchaîner deux transitions à partir
 * d'un état périmé.
 */
export async function changerEtat(
  rubrique: Rubrique,
  id: string,
  transition: Transition,
): Promise<Retour> {
  const regle = TRANSITIONS[transition];
  if (!regle) return { ok: false, message: 'Action inconnue.' };

  const { payload, agent } = await contexte();
  if (!agent) return { ok: false, message: 'Votre session a expiré. Reconnectez-vous.' };

  const autorises = rolesDeLaRubrique(rubrique, regle.roles);
  if (!agent.role || !autorises.includes(agent.role)) {
    return {
      ok: false,
      message:
        transition === 'publier'
          ? 'Seul un éditeur peut mettre un contenu en ligne. Soumettez-le à validation.'
          : 'Votre rôle ne permet pas cette action.',
    };
  }

  let contenu: { etat?: string; journal?: unknown[] };
  try {
    contenu = (await payload.findByID({
      collection: rubrique,
      id,
      depth: 0,
      overrideAccess: true,
    })) as { etat?: string; journal?: unknown[] };
  } catch {
    return { ok: false, message: 'Ce contenu est introuvable.' };
  }

  if (!regle.depuis.includes(contenu.etat as EtatPublication)) {
    return {
      ok: false,
      message: 'Ce contenu a changé d’état entre-temps. Rechargez la page.',
    };
  }

  const auteur = agent.nomComplet ?? agent.email ?? 'Agent';

  try {
    await payload.update({
      collection: rubrique,
      id,
      data: {
        etat: ETAT_APRES[transition],
        journal: [
          ...((contenu.journal as unknown[]) ?? []),
          { date: new Date().toISOString(), action: regle.libelle, auteur },
        ],
      } as never,
      overrideAccess: true,
    });
  } catch {
    return { ok: false, message: 'L’enregistrement n’a pas abouti. Réessayez.' };
  }

  revalidatePath('/gestion/publications');
  for (const page of PAGES[rubrique]) revalidatePath(page);

  return { ok: true, message: `${regle.libelle}.` };
}

/* --------------------------------------------------------------------------
   Enregistrement du contenu lui-même
   -------------------------------------------------------------------------- */

/**
 * Crée ou met à jour un contenu.
 *
 * `etat` n'est jamais accepté ici : il ne bouge que par `changerEtat`. Un
 * formulaire trafiqué qui l'enverrait le verrait ignoré.
 */
export async function enregistrerContenu(
  rubrique: Rubrique,
  id: string | null,
  donnees: Record<string, unknown>,
): Promise<Retour & { readonly id?: string }> {
  const { payload, agent } = await contexte();
  if (!agent) return { ok: false, message: 'Votre session a expiré. Reconnectez-vous.' };

  const autorises = rolesDeLaRubrique(rubrique, ROLES_REDACTION);
  if (!agent.role || !autorises.includes(agent.role)) {
    return { ok: false, message: 'Votre rôle ne permet pas de modifier ce contenu.' };
  }

  // Modifier un contenu déjà en ligne, c'est publier : le public le lit dans
  // la seconde. Cette retouche revient donc à l'éditeur, comme la mise en
  // ligne elle-même. L'état est relu en base, jamais reçu de l'écran.
  if (id && !ROLES_PUBLICATION.includes(agent.role)) {
    try {
      const actuel = (await payload.findByID({
        collection: rubrique,
        id,
        depth: 0,
        overrideAccess: true,
      })) as { etat?: string };

      if (actuel.etat === 'publie') {
        return {
          ok: false,
          message:
            'Ce contenu est en ligne : sa modification est réservée aux éditeurs. Demandez son retrait du site pour le reprendre.',
        };
      }
    } catch {
      return { ok: false, message: 'Ce contenu est introuvable.' };
    }
  }

  const { etat: _ignore, journal: _aussi, ...sain } = donnees;

  try {
    if (id) {
      await payload.update({ collection: rubrique, id, data: sain as never, overrideAccess: true });
      for (const page of PAGES[rubrique]) revalidatePath(page);
      revalidatePath('/gestion/publications');
      return { ok: true, message: 'Modifications enregistrées.', id };
    }

    const cree = await payload.create({
      collection: rubrique,
      data: sain as never,
      overrideAccess: true,
    });
    revalidatePath('/gestion/publications');
    return { ok: true, message: 'Contenu créé.', id: String(cree.id) };
  } catch (erreur) {
    const message = erreur instanceof Error ? erreur.message : '';
    // L'unicité de l'adresse est une contrainte de base : on la traduit.
    if (/unique/i.test(message)) {
      return { ok: false, message: 'Cette adresse de page est déjà prise. Modifiez-la.' };
    }
    return { ok: false, message: 'L’enregistrement n’a pas abouti. Vérifiez les champs obligatoires.' };
  }
}
