import type { CollectionConfig } from 'payload';
import { reserveA } from '../acces';
import { ROLES_CANDIDATURES } from '../roles';

/* ==========================================================================
   Comptes candidats — CDC §10.1
   --------------------------------------------------------------------------
   « Création de compte : par adresse électronique ou numéro de téléphone, avec
   vérification. »

   Le compte est distinct de la personne (§11.2) : la personne est permanente
   et peut exister sans compte — un dossier repris par la scolarité, un ancien
   étudiant. Le compte n'est qu'un moyen d'accès.
   ========================================================================== */

export const Candidats: CollectionConfig = {
  slug: 'candidats',
  labels: { singular: 'Compte candidat', plural: 'Comptes candidats' },
  auth: {
    // Le numéro de téléphone est le moyen d'accès majoritaire ; l'adresse
    // électronique reste acceptée. D'où une connexion par identifiant, avec
    // courriel facultatif.
    loginWithUsername: {
      allowEmailLogin: true,
      requireEmail: false,
      requireUsername: true,
    },
    tokenExpiration: 60 * 60 * 24 * 7,
    maxLoginAttempts: 10,
    lockTime: 10 * 60 * 1000,
    verify: false,
  },
  admin: {
    useAsTitle: 'username',
    defaultColumns: ['username', 'email', 'personne', 'createdAt'],
    group: 'Admission',
    description: 'Comptes créés par les candidats eux-mêmes. Ils ne donnent accès qu’à leur propre dossier.',
  },
  access: {
    // L'inscription est ouverte : c'est le point d'entrée du recrutement.
    create: () => true,
    read: ({ req }) => {
      if (req.user?.collection === 'utilisateurs') return true;
      if (req.user?.collection !== 'candidats') return false;
      return { id: { equals: req.user.id } };
    },
    update: ({ req, id }) => {
      if (req.user?.collection === 'utilisateurs') return true;
      return req.user?.collection === 'candidats' && req.user.id === id;
    },
    delete: reserveA(['administrateur']),
    admin: ({ req }) => req.user?.collection === 'utilisateurs',
  },
  fields: [
    {
      name: 'personne',
      type: 'relationship',
      relationTo: 'personnes',
      label: 'Personne rattachée',
      index: true,
      access: { update: ({ req }) => reserveA(ROLES_CANDIDATURES)({ req }) === true },
      admin: {
        position: 'sidebar',
        description:
          'Rattachement au référentiel unique. Si la personne est déjà connue de l’établissement, on la rattache plutôt que de la dupliquer (§10.5).',
      },
    },
    {
      name: 'telephone',
      type: 'text',
      label: 'Téléphone',
      index: true,
      admin: { description: 'Sert aux notifications par message court.' },
    },
    {
      name: 'verifie',
      type: 'checkbox',
      label: 'Contact vérifié',
      defaultValue: false,
      access: { update: ({ req }) => reserveA(ROLES_CANDIDATURES)({ req }) === true },
      admin: { position: 'sidebar' },
    },
  ],
};
