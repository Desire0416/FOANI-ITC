import type { CollectionConfig } from 'payload';
import { suppressionInterdite } from '../acces';
import {
  champsPublication,
  crochetsPublication,
  ecriturePublication,
  lecturePublication,
} from '../publication';

/* ==========================================================================
   Actualités — CDC §8.7 et §15
   --------------------------------------------------------------------------
   C'est la rubrique qui vit : ouvertures de formation, campagnes
   d'inscription, rendez-vous. Elle changeait jusqu'ici par une modification
   de code — c'est exactement ce que le critère de recette « autonomie
   éditoriale » interdit.

   Le corps est saisi en texte simple, un paragraphe par ligne vide. Ce n'est
   pas une économie de moyens : un éditeur de texte riche impose au rédacteur
   des choix de mise en forme qui échapperaient ensuite à la charte, et il
   alourdit la page publique d'un moteur de rendu. Ici, la forme reste au site,
   le fond au rédacteur.
   ========================================================================== */

export const CATEGORIES_ACTUALITE = [
  { label: 'Vie de l’établissement', value: 'etablissement' },
  { label: 'Admissions', value: 'admissions' },
  { label: 'Formations', value: 'formations' },
  { label: 'Ressources', value: 'ressources' },
  { label: 'Partenariats', value: 'partenariats' },
] as const;

export const Actualites: CollectionConfig = {
  slug: 'actualites',
  labels: { singular: 'Actualité', plural: 'Actualités' },
  admin: {
    useAsTitle: 'titre',
    defaultColumns: ['titre', 'categorie', 'date', 'etat'],
    group: 'Éditorial',
    listSearchableFields: ['titre', 'chapo'],
  },
  access: {
    read: lecturePublication,
    create: ecriturePublication(),
    update: ecriturePublication(),
    // Une actualité publiée puis retirée reste consultable en interne : on
    // archive, on ne supprime pas.
    delete: suppressionInterdite,
  },
  fields: [
    {
      name: 'titre',
      type: 'text',
      label: 'Titre',
      required: true,
      admin: { description: 'Ce que le lecteur verra en premier. Une phrase, pas un slogan.' },
    },
    {
      name: 'slug',
      type: 'text',
      label: 'Adresse de la page',
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
        description: 'Déduite du titre si elle est laissée vide. Ne la changez plus une fois publiée.',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'categorie',
          type: 'select',
          label: 'Rubrique',
          required: true,
          defaultValue: 'etablissement',
          options: [...CATEGORIES_ACTUALITE],
          admin: { width: '50%' },
        },
        {
          name: 'date',
          type: 'date',
          label: 'Date de l’actualité',
          required: true,
          admin: {
            width: '50%',
            date: { pickerAppearance: 'dayOnly', displayFormat: 'dd/MM/yyyy' },
          },
        },
      ],
    },
    {
      name: 'chapo',
      type: 'textarea',
      label: 'Chapô',
      required: true,
      maxLength: 320,
      admin: {
        description:
          'Deux ou trois lignes. C’est ce qui s’affiche en liste et dans les résultats de recherche.',
      },
    },
    {
      name: 'corps',
      type: 'textarea',
      label: 'Texte',
      required: true,
      admin: {
        rows: 14,
        description: 'Laissez une ligne vide entre deux paragraphes. Le site s’occupe de la mise en forme.',
      },
    },
    ...champsPublication(),
  ],
  hooks: crochetsPublication('titre'),
};
