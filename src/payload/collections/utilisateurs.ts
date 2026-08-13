import type { CollectionConfig } from 'payload';
import { administrateurSeul, agentInterne, aRole } from '../acces';
import { LIBELLES_ROLE, PERIMETRES_ROLE, ROLES } from '../roles';

/**
 * Agents de l'établissement — CDC §5.2.
 *
 * La création et la modification des comptes relèvent du seul administrateur.
 * Un agent peut lire l'annuaire interne et modifier son propre compte, rien de
 * plus : le CDC attribue les droits par rôle, jamais par personne.
 */
export const Utilisateurs: CollectionConfig = {
  slug: 'utilisateurs',
  labels: { singular: 'Agent', plural: 'Agents de l’établissement' },
  auth: {
    tokenExpiration: 60 * 60 * 8,
    maxLoginAttempts: 8,
    lockTime: 15 * 60 * 1000,
  },
  admin: {
    useAsTitle: 'nomComplet',
    defaultColumns: ['nomComplet', 'email', 'role', 'actif'],
    group: 'Administration',
    description: 'Les droits sont attribués par rôle. Un compte n’est jamais partagé entre plusieurs agents.',
  },
  access: {
    create: administrateurSeul,
    // Un agent lit l'annuaire interne ; lui seul, ou l'administrateur, le modifie.
    read: agentInterne,
    update: ({ req, id }) => aRole(req.user, ['administrateur']) || req.user?.id === id,
    delete: administrateurSeul,
    admin: ({ req }) => req.user?.collection === 'utilisateurs' && req.user?.actif !== false,
  },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'nom', type: 'text', label: 'Nom', required: true, admin: { width: '50%' } },
        { name: 'prenoms', type: 'text', label: 'Prénoms', required: true, admin: { width: '50%' } },
      ],
    },
    {
      name: 'nomComplet',
      type: 'text',
      label: 'Nom complet',
      admin: { hidden: true },
      hooks: {
        beforeChange: [({ siblingData }) => `${siblingData.nom ?? ''} ${siblingData.prenoms ?? ''}`.trim()],
      },
    },
    {
      name: 'role',
      type: 'select',
      label: 'Rôle',
      required: true,
      defaultValue: 'consultation',
      options: ROLES.map((role) => ({ label: LIBELLES_ROLE[role], value: role })),
      access: { update: ({ req }) => aRole(req.user, ['administrateur']) },
      admin: {
        description: 'Détermine l’ensemble des droits. Voir le périmètre de chaque rôle au chapitre 5.2 du cadrage.',
      },
    },
    {
      name: 'fonction',
      type: 'text',
      label: 'Fonction',
      admin: { description: 'Intitulé de poste, tel qu’il figure dans l’organigramme.' },
    },
    {
      name: 'actif',
      type: 'checkbox',
      label: 'Compte actif',
      defaultValue: true,
      access: { update: ({ req }) => aRole(req.user, ['administrateur']) },
      admin: {
        position: 'sidebar',
        description: 'Un compte désactivé conserve son historique mais ne peut plus se connecter.',
      },
    },
  ],
};

export const PERIMETRES = PERIMETRES_ROLE;
