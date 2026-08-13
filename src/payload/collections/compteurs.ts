import type { CollectionConfig } from 'payload';
import { administrateurSeul } from '../acces';

/**
 * Compteurs de séquence — support technique de `sequence.ts`.
 *
 * Masqué de l'interface : ce n'est pas une donnée métier, et une valeur
 * modifiée à la main provoquerait des doublons de numéro de dossier ou de
 * numéro étudiant, ce que le §11.1 interdit formellement.
 */
export const Compteurs: CollectionConfig = {
  slug: 'compteurs',
  labels: { singular: 'Compteur', plural: 'Compteurs' },
  admin: { hidden: true, useAsTitle: 'sequence' },
  access: {
    create: () => false,
    read: administrateurSeul,
    update: () => false,
    delete: () => false,
  },
  fields: [
    { name: 'sequence', type: 'text', required: true, unique: true, index: true },
    { name: 'valeur', type: 'number', required: true, defaultValue: 0 },
  ],
};
