'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getPayload } from 'payload';
import config from '@payload-config';
import { exigerRole } from '@/lib/session';
import { lireMontant } from '@/payload/finances/montants';
import { NATURES } from '@/payload/finances/natures';
import { ROLES_GRILLES } from '@/payload/roles';

/* ==========================================================================
   Les actions sur une grille tarifaire — Note complémentaire §6.4
   --------------------------------------------------------------------------
   Quatre gestes, et un seul rôle : la direction.

   « La grille est définie par la direction. » Et : « un agent ne modifie
   jamais une grille ; il ne fait que constater des versements. » La garde est
   donc posée à chaque action, en plus des règles d'accès de la collection —
   un écran peut être contourné, une action non.
   ========================================================================== */

export type Retour = { readonly ok: boolean; readonly message: string };

function rafraichir() {
  revalidatePath('/gestion/grilles', 'layout');
  revalidatePath('/formations', 'layout');
  revalidatePath('/mon-dossier', 'layout');
}

/** Les lignes lues d'un formulaire, une par nature de frais renseignée. */
function lireLignes(donnees: FormData):
  | { readonly ok: true; readonly lignes: Record<string, unknown>[] }
  | { readonly ok: false; readonly message: string } {
  const lignes: Record<string, unknown>[] = [];

  for (const nature of NATURES) {
    const brut = String(donnees.get(`montant-${nature.cle}`) ?? '').trim();
    if (!brut) continue;

    const lu = lireMontant(brut);
    if (!lu.ok) return { ok: false, message: `${nature.libelle} : ${lu.message}` };

    /* Les dates d'échéance sont saisies une par ligne : c'est la forme la plus
       rapide à remplir pour quelqu'un qui recopie un calendrier depuis une
       délibération. */
    const dates = String(donnees.get(`echeances-${nature.cle}`) ?? '')
      .split(/[\n,;]+/)
      .map((date) => date.trim())
      .filter(Boolean);

    for (const date of dates) {
      if (Number.isNaN(new Date(date).getTime())) {
        return {
          ok: false,
          message: `${nature.libelle} : « ${date} » n’est pas une date. Employez le format 2026-10-05.`,
        };
      }
    }

    if (dates.length > 0 && !nature.echelonnable) {
      return { ok: false, message: `${nature.libelle} est dû en une fois. ${nature.regime}` };
    }

    lignes.push({
      nature: nature.cle,
      libelle: String(donnees.get(`libelle-${nature.cle}`) ?? '').trim() || nature.libelle,
      montant: lu.montant,
      echeances: dates.map((exigibleLe) => ({ exigibleLe })),
    });
  }

  if (lignes.length === 0) return { ok: false, message: 'Renseignez au moins un montant.' };

  return { ok: true, lignes };
}

/**
 * Crée une grille, toujours en brouillon.
 *
 * Un tarif ne devient opposable que par un geste distinct, l'arrêt. Créer et
 * arrêter d'un même mouvement retirerait la relecture que ce geste impose.
 */
export async function creerGrille(_precedent: Retour, donnees: FormData): Promise<Retour> {
  await exigerRole(ROLES_GRILLES);

  const formation = String(donnees.get('formation') ?? '').trim() || null;
  const intitule = String(donnees.get('intitule') ?? '').trim() || null;
  const anneeAcademique = String(donnees.get('anneeAcademique') ?? '').trim();

  if (!anneeAcademique) return { ok: false, message: 'Indiquez l’année académique.' };
  if (!formation && !intitule) {
    return { ok: false, message: 'Indiquez une formation, ou un intitulé pour une session.' };
  }

  const lues = lireLignes(donnees);
  if (!lues.ok) return { ok: false, message: lues.message };

  const payload = await getPayload({ config });

  /* La version se déduit de ce qui existe : une grille n'est jamais la
     première si une autre porte déjà la même formation et la même année. */
  const { docs } = await payload.find({
    collection: 'grilles',
    where: {
      and: [
        { anneeAcademique: { equals: anneeAcademique } },
        formation ? { formation: { equals: formation } } : { intitule: { equals: intitule } },
      ],
    },
    sort: '-version',
    limit: 1,
    depth: 0,
    overrideAccess: true,
  });

  const precedente = docs[0] as unknown as { id?: string | number; version?: number } | undefined;
  const version = (precedente?.version ?? 0) + 1;

  let creee: { id: string | number };
  try {
    creee = await payload.create({
      collection: 'grilles',
      data: {
        circuit: String(donnees.get('circuit') ?? 'academique'),
        formation,
        intitule,
        anneeAcademique,
        version,
        etat: 'brouillon',
        lignes: lues.lignes,
        motifVersion: String(donnees.get('motifVersion') ?? '').trim() || null,
        remplace: precedente?.id ?? null,
      } as never,
      overrideAccess: true,
    });
  } catch (erreur) {
    return { ok: false, message: (erreur as Error).message || 'La grille n’a pas pu être créée.' };
  }

  rafraichir();
  redirect(`/gestion/grilles/${creee.id}`);
}

/** Met à jour un brouillon. Une grille arrêtée refuse, par son crochet. */
export async function modifierGrille(
  id: string,
  _precedent: Retour,
  donnees: FormData,
): Promise<Retour> {
  await exigerRole(ROLES_GRILLES);

  const lues = lireLignes(donnees);
  if (!lues.ok) return { ok: false, message: lues.message };

  const payload = await getPayload({ config });
  try {
    await payload.update({
      collection: 'grilles',
      id,
      data: {
        lignes: lues.lignes,
        motifVersion: String(donnees.get('motifVersion') ?? '').trim() || null,
      } as never,
      overrideAccess: true,
    });
  } catch (erreur) {
    return {
      ok: false,
      message: (erreur as Error).message || 'La grille n’a pas pu être enregistrée.',
    };
  }

  rafraichir();
  return { ok: true, message: 'Grille enregistrée.' };
}

/**
 * Arrête une grille.
 *
 * C'est le geste qui la rend opposable et immuable. Il porte le nom de son
 * auteur et sa date, comme toute décision du dispositif.
 */
export async function arreterGrille(id: string): Promise<Retour> {
  const agent = await exigerRole(ROLES_GRILLES);

  const payload = await getPayload({ config });
  try {
    await payload.update({
      collection: 'grilles',
      id,
      /* L'auteur est posé ici, où il est connu, plutôt que déduit d'une
         session partielle par le crochet : `exigerRole` rend un identifiant en
         chaîne, que la relation refuse. La conversion se fait donc une fois, à
         l'endroit où l'on sait ce qu'on convertit. */
      data: { etat: 'arretee', arreteePar: Number(agent.id) } as never,
      overrideAccess: true,
    });
  } catch (erreur) {
    return {
      ok: false,
      message: (erreur as Error).message || 'La grille n’a pas pu être arrêtée.',
    };
  }

  rafraichir();
  return {
    ok: true,
    message: 'Grille arrêtée. Elle est désormais opposable, et ne se modifie plus.',
  };
}

/** Archive une grille arrêtée : elle cesse d'être applicable, sans disparaître. */
export async function archiverGrille(id: string): Promise<Retour> {
  await exigerRole(ROLES_GRILLES);

  const payload = await getPayload({ config });
  try {
    await payload.update({
      collection: 'grilles',
      id,
      data: { etat: 'archivee' } as never,
      overrideAccess: true,
    });
  } catch (erreur) {
    return {
      ok: false,
      message: (erreur as Error).message || 'La grille n’a pas pu être archivée.',
    };
  }

  rafraichir();
  return { ok: true, message: 'Grille archivée. Les appels déjà émis ne changent pas.' };
}
