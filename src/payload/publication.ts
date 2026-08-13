import type { Access, CollectionBeforeChangeHook, Field, Where } from 'payload';
import { aRole } from './acces';
import type { Role } from './roles';

/* ==========================================================================
   Cycle de publication — CDC §15 et §24.4
   --------------------------------------------------------------------------
   « Brouillon → À valider → Publié → Archivé », et le critère de recette qui
   va avec : « le personnel de l'établissement modifie une page et publie une
   actualité sans assistance technique ».

   Deux rôles, deux pouvoirs, et la frontière entre les deux tient en une
   phrase : le rédacteur écrit, l'éditeur engage l'établissement. Un rédacteur
   ne peut donc pas mettre un texte en ligne, même le sien, même par erreur —
   ce n'est pas une convention d'écran, c'est un refus au niveau de la donnée.

   Ce module est partagé par les trois collections éditoriales. Un état, un
   libellé, un droit : décrits une seule fois, ils ne peuvent pas diverger
   d'une rubrique à l'autre.
   ========================================================================== */

export const ETATS_PUBLICATION = [
  { label: 'Brouillon', value: 'brouillon' },
  { label: 'À valider', value: 'a-valider' },
  { label: 'Publié', value: 'publie' },
  { label: 'Archivé', value: 'archive' },
] as const;

export type EtatPublication = (typeof ETATS_PUBLICATION)[number]['value'];

/** Rôles qui écrivent : ils créent et modifient, sans mettre en ligne. */
export const ROLES_REDACTION: readonly Role[] = ['administrateur', 'editeur', 'redacteur'];

/** Rôles qui engagent l'établissement : eux seuls publient et archivent. */
export const ROLES_PUBLICATION: readonly Role[] = ['administrateur', 'editeur'];

/** Les offres d'emploi relèvent aussi du responsable carrières (§8.5). */
export const ROLES_OFFRES: readonly Role[] = ['administrateur', 'editeur', 'carrieres'];

export function peutPublier(role: Role | undefined): boolean {
  return role !== undefined && ROLES_PUBLICATION.includes(role);
}

/* --------------------------------------------------------------------------
   Accès
   -------------------------------------------------------------------------- */

/**
 * Lecture d'une collection éditoriale.
 *
 * Le public — c'est-à-dire une requête sans agent connecté — ne voit que ce
 * qui est publié. Un brouillon n'est pas « caché par l'interface » : il est
 * hors de portée de la requête, ce qui vaut aussi pour l'API et pour les
 * moteurs de recherche.
 */
export const lecturePublication: Access = ({ req }) => {
  if (req.user?.collection === 'utilisateurs') return true;
  const contrainte: Where = { etat: { equals: 'publie' } };
  return contrainte;
};

export function ecriturePublication(roles: readonly Role[] = ROLES_REDACTION): Access {
  return ({ req }) => aRole(req.user, roles);
}

/* --------------------------------------------------------------------------
   Champs communs
   -------------------------------------------------------------------------- */

/**
 * Le bloc d'état, identique dans les trois collections.
 *
 * `etat` n'est modifiable que par les rôles de publication : un rédacteur
 * pousse son texte « à valider » par une action serveur dédiée, qui contrôle
 * la transition demandée. Le champ lui-même lui reste fermé.
 */
export function champsPublication(rolesPublication: readonly Role[] = ROLES_PUBLICATION): Field[] {
  return [
    {
      name: 'etat',
      type: 'select',
      label: 'État',
      required: true,
      defaultValue: 'brouillon',
      index: true,
      options: [...ETATS_PUBLICATION],
      access: { update: ({ req }) => aRole(req.user, rolesPublication) },
      admin: { position: 'sidebar' },
    },
    {
      name: 'publieLe',
      type: 'date',
      label: 'Mis en ligne le',
      access: { update: ({ req }) => aRole(req.user, rolesPublication) },
      admin: { position: 'sidebar', readOnly: true },
    },
    {
      name: 'publiePar',
      type: 'relationship',
      relationTo: 'utilisateurs',
      label: 'Mis en ligne par',
      access: { update: ({ req }) => aRole(req.user, rolesPublication) },
      admin: { position: 'sidebar', readOnly: true },
    },
    {
      name: 'redigePar',
      type: 'relationship',
      relationTo: 'utilisateurs',
      label: 'Rédigé par',
      admin: { position: 'sidebar', readOnly: true },
      hooks: {
        beforeChange: [
          ({ req, value, operation }) =>
            operation === 'create' && req.user?.collection === 'utilisateurs' ? req.user.id : value,
        ],
      },
    },
    {
      name: 'journal',
      type: 'array',
      label: 'Journal éditorial',
      access: { update: () => false, create: () => false },
      admin: { readOnly: true, description: 'Qui a fait quoi, et quand.' },
      fields: [
        { name: 'date', type: 'date' },
        { name: 'action', type: 'text' },
        { name: 'auteur', type: 'text' },
      ],
    },
  ];
}

/** Fabrique un identifiant d'adresse à partir d'un titre. */
export function enSlug(titre: string): string {
  return titre
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90);
}

/**
 * Crochet commun : slug déduit du titre s'il n'est pas fourni, date et auteur
 * de mise en ligne posés au passage à « publié ».
 */
export function crochetsPublication(
  champTitre = 'titre',
): { beforeChange: CollectionBeforeChangeHook[] } {
  const poser: CollectionBeforeChangeHook = ({ data, originalDoc, req }) => {
    const champs = data as Record<string, unknown>;
    const avant = originalDoc as Record<string, unknown> | undefined;

    if (!champs.slug && typeof champs[champTitre] === 'string') {
      champs.slug = enSlug(champs[champTitre] as string);
    }

    // La date et l'auteur de mise en ligne sont posés au franchissement, une
    // seule fois : republier un texte déjà en ligne ne réécrit pas sa date.
    if (champs.etat === 'publie' && avant?.etat !== 'publie') {
      champs.publieLe = new Date().toISOString();
      if (req.user?.collection === 'utilisateurs') champs.publiePar = req.user.id;
    }

    return champs;
  };

  return { beforeChange: [poser] };
}
