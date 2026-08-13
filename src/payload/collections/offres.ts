import type { CollectionConfig } from 'payload';
import { suppressionInterdite } from '../acces';
import {
  ROLES_OFFRES,
  champsPublication,
  crochetsPublication,
  ecriturePublication,
  lecturePublication,
} from '../publication';

/* ==========================================================================
   Offres de stage et d'emploi — CDC §8.5
   --------------------------------------------------------------------------
   Le critère de recette est explicite : « chaque offre porte une date de
   clôture et un statut actif ou archivé ; une offre échue disparaît de la
   liste publique ». La date limite est donc obligatoire, et c'est elle — pas
   une intervention humaine — qui retire l'offre de l'affichage.

   La collection est ouverte au responsable carrières en plus des rôles
   éditoriaux : c'est lui qui reçoit les offres des entreprises.
   ========================================================================== */

export const TYPES_OFFRE = [
  { label: 'Stage', value: 'stage' },
  { label: 'Emploi', value: 'emploi' },
  { label: 'Alternance', value: 'alternance' },
] as const;

export const Offres: CollectionConfig = {
  slug: 'offres',
  labels: { singular: 'Offre', plural: 'Offres de stage et d’emploi' },
  admin: {
    useAsTitle: 'intitule',
    defaultColumns: ['intitule', 'structure', 'type', 'dateLimite', 'etat'],
    group: 'Éditorial',
    listSearchableFields: ['intitule', 'structure', 'lieu'],
  },
  access: {
    read: lecturePublication,
    create: ecriturePublication(ROLES_OFFRES),
    update: ecriturePublication(ROLES_OFFRES),
    delete: suppressionInterdite,
  },
  fields: [
    { name: 'intitule', type: 'text', label: 'Intitulé du poste', required: true },
    {
      name: 'slug',
      type: 'text',
      label: 'Adresse',
      unique: true,
      index: true,
      admin: { position: 'sidebar', description: 'Déduite de l’intitulé si elle est laissée vide.' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'structure',
          type: 'text',
          label: 'Entreprise ou organisation',
          required: true,
          admin: { width: '50%' },
        },
        { name: 'lieu', type: 'text', label: 'Lieu', required: true, admin: { width: '50%' } },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'type',
          type: 'select',
          label: 'Nature',
          required: true,
          defaultValue: 'stage',
          options: [...TYPES_OFFRE],
          admin: { width: '50%' },
        },
        {
          name: 'dateLimite',
          type: 'date',
          label: 'Date limite de candidature',
          required: true,
          index: true,
          admin: {
            width: '50%',
            date: { pickerAppearance: 'dayOnly', displayFormat: 'dd/MM/yyyy' },
            description: 'Passé ce jour, l’offre disparaît d’elle-même du site public.',
          },
        },
      ],
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Ce qui est proposé',
      required: true,
      admin: {
        rows: 10,
        description: 'Missions, profil attendu, conditions. Une ligne vide sépare deux paragraphes.',
      },
    },
    {
      name: 'contact',
      type: 'text',
      label: 'Comment postuler',
      required: true,
      admin: { description: 'Adresse électronique, numéro, ou consigne précise donnée par l’entreprise.' },
    },
    ...champsPublication(),
  ],
  hooks: crochetsPublication('intitule'),
};
