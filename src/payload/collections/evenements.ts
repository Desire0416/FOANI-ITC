import type { CollectionConfig } from 'payload';
import { suppressionInterdite } from '../acces';
import {
  champsPublication,
  crochetsPublication,
  ecriturePublication,
  lecturePublication,
} from '../publication';

/* ==========================================================================
   Événements — CDC §8.7
   --------------------------------------------------------------------------
   Rentrée, portes ouvertes, forums. La date peut légitimement manquer :
   l'établissement annonce souvent l'événement avant d'en arrêter le jour. Le
   champ est donc facultatif, et la page publique écrit « date à confirmer »
   plutôt que d'afficher un jour inventé (§9.3).
   ========================================================================== */

export const Evenements: CollectionConfig = {
  slug: 'evenements',
  labels: { singular: 'Événement', plural: 'Événements' },
  admin: {
    useAsTitle: 'titre',
    defaultColumns: ['titre', 'date', 'lieu', 'etat'],
    group: 'Éditorial',
    listSearchableFields: ['titre', 'lieu'],
  },
  access: {
    read: lecturePublication,
    create: ecriturePublication(),
    update: ecriturePublication(),
    delete: suppressionInterdite,
  },
  fields: [
    { name: 'titre', type: 'text', label: 'Intitulé', required: true },
    {
      name: 'slug',
      type: 'text',
      label: 'Adresse de la page',
      unique: true,
      index: true,
      admin: { position: 'sidebar', description: 'Déduite de l’intitulé si elle est laissée vide.' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'date',
          type: 'date',
          label: 'Date',
          admin: {
            width: '50%',
            date: { pickerAppearance: 'dayOnly', displayFormat: 'dd/MM/yyyy' },
            description: 'Laissez vide tant que la date n’est pas arrêtée.',
          },
        },
        {
          name: 'lieu',
          type: 'text',
          label: 'Lieu',
          required: true,
          defaultValue: 'Campus de FOANI-ITC, Agnibilékrou',
          admin: { width: '50%' },
        },
      ],
    },
    {
      name: 'resume',
      type: 'textarea',
      label: 'De quoi s’agit-il',
      required: true,
      maxLength: 400,
      admin: { description: 'Quelques lignes : ce qui se passe, et pour qui.' },
    },
    {
      name: 'inscriptionRequise',
      type: 'checkbox',
      label: 'Inscription nécessaire',
      defaultValue: false,
    },
    ...champsPublication(),
  ],
  hooks: crochetsPublication('titre'),
};
