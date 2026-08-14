'use server';

import { revalidatePath } from 'next/cache';
import { headers as entetes } from 'next/headers';
import { getPayload, type Payload } from 'payload';
import config from '@payload-config';
import { ETATS_OFFRE_EN_COURS, JOURS_ACCEPTATION } from '../chaine';
import { ROLES_DECISION, type Role } from '../roles';

/* ==========================================================================
   Échéances de la chaîne — RG-45 et §3.4
   --------------------------------------------------------------------------
   « L'expiration du délai d'acceptation vaut désistement et libère la place. »

   Le mot « vaut » compte : le désistement n'est pas une décision que
   l'établissement prend, c'est une conséquence que le temps produit. Sans ce
   balayage, une offre non confirmée gèle une place jusqu'à la rentrée — et
   l'établissement perd une inscription qu'il aurait pu réaliser au profit d'un
   candidat de la liste d'attente (§3.4).

   Le balayage est écrit une fois et appelé de deux façons :

   — par une tâche planifiée, qui le rend ponctuel ;
   — à la main depuis la file de l'admission, ce qui le rend utilisable dès
     aujourd'hui, avant que la planification ne soit branchée.

   Dans les deux cas l'auteur est enregistré (RG-42) : le dispositif lorsque
   c'est le temps qui a tranché, l'agent lorsqu'il l'a constaté lui-même.
   ========================================================================== */

export type Balayage = {
  readonly ok: boolean;
  readonly message: string;
  readonly traites: number;
};

/**
 * Passe en désistement toutes les offres dont le délai est expiré.
 *
 * Exporté pour la tâche planifiée, qui n'a pas de session d'agent : l'auteur
 * inscrit au journal est alors le dispositif lui-même.
 */
export async function balayerLesEcheances(
  payload: Payload,
  auteur: string,
): Promise<number> {
  const { docs } = await payload.find({
    collection: 'candidatures',
    where: {
      and: [
        { etat: { in: [...ETATS_OFFRE_EN_COURS] } },
        { limiteAcceptation: { less_than: new Date().toISOString() } },
      ],
    } as never,
    limit: 200,
    depth: 0,
    overrideAccess: true,
  });

  let traites = 0;

  for (const dossier of docs) {
    try {
      await payload.update({
        collection: 'candidatures',
        id: (dossier as { id: number | string }).id,
        data: { etat: 'desiste' } as never,
        overrideAccess: true,
        context: {
          motifTransition: `Délai d’acceptation de ${JOURS_ACCEPTATION} jours expiré. La place est libérée.`,
          auteurImpose: auteur,
        },
      });
      traites += 1;
    } catch {
      // Un dossier récalcitrant ne doit pas arrêter le balayage des autres.
    }
  }

  if (traites > 0) {
    revalidatePath('/gestion');
    revalidatePath('/gestion/candidatures');
  }

  return traites;
}

/** Déclenchement manuel, depuis la file du poste Admission. */
export async function constaterLesDesistements(): Promise<Balayage> {
  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers: await entetes() });

  const agent = user as { collection?: string; role?: Role; actif?: boolean; nomComplet?: string } | null;
  if (
    agent?.collection !== 'utilisateurs' ||
    agent.actif === false ||
    !agent.role ||
    !ROLES_DECISION.includes(agent.role)
  ) {
    return {
      ok: false,
      traites: 0,
      message: 'Constater un désistement revient au service des admissions.',
    };
  }

  const traites = await balayerLesEcheances(
    payload,
    `${agent.nomComplet ?? 'Agent'} (échéance constatée)`,
  );

  return {
    ok: true,
    traites,
    message:
      traites === 0
        ? 'Aucune offre n’a dépassé son délai d’acceptation.'
        : `${traites} dossier${traites > 1 ? 's' : ''} passé${traites > 1 ? 's' : ''} en désistement. ${traites > 1 ? 'Les places sont' : 'La place est'} libérée${traites > 1 ? 's' : ''}.`,
  };
}
