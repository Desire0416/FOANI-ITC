import type { CollectionConfig } from 'payload';
import { champReserveA, reserveA, suppressionInterdite } from '../acces';
import { ROLES_PERSONNES, ROLES_PERSONNES_LECTURE, ROLES_PIECES } from '../roles';

/* ==========================================================================
   Personnes — CDC §11.2
   --------------------------------------------------------------------------
   « La personne est permanente. Créée une seule fois, jamais dupliquée, jamais
   supprimée — un ancien étudiant peut solliciter un duplicata de relevé
   plusieurs années après son départ. »

   Deux règles structurantes tiennent dans ce fichier :

   — le niveau et la filière n'y figurent pas. Ce sont des propriétés de
     l'inscription annuelle, pas de la personne (§11.2). Les inscrire ici
     écraserait la trace des années précédentes ;
   — le numéro étudiant n'encode ni la filière ni le niveau (§11.1), et il
     n'est pas modifiable une fois attribué.
   ========================================================================== */

export const Personnes: CollectionConfig = {
  slug: 'personnes',
  labels: { singular: 'Personne', plural: 'Personnes' },
  admin: {
    useAsTitle: 'identite',
    defaultColumns: ['identite', 'numeroEtudiant', 'dateNaissance', 'telephone'],
    group: 'Scolarité',
    description:
      'Référentiel unique. Chaque candidat, étudiant ou participant n’y existe qu’une fois, et n’en est jamais retiré.',
  },
  access: {
    /* Écriture réservée à la scolarité, qui tient le référentiel ; lecture
       ouverte à qui doit y retrouver une personne — l'admission pour éviter
       un doublon, les finances pour rattacher un versement. Les deux listes
       viennent de la même matrice, ce qui les empêche de diverger. */
    create: reserveA(ROLES_PERSONNES),
    read: reserveA(ROLES_PERSONNES_LECTURE),
    update: reserveA(ROLES_PERSONNES),
    delete: suppressionInterdite,
  },
  fields: [
    {
      name: 'numeroEtudiant',
      type: 'text',
      label: 'Numéro étudiant',
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
        readOnly: true,
        description:
          'Attribué à la première inscription, conservé au-delà du diplôme. Il n’encode ni la filière ni le niveau, et ne change jamais.',
      },
    },
    {
      name: 'identite',
      type: 'text',
      admin: { hidden: true },
      hooks: {
        beforeChange: [
          ({ siblingData }) =>
            `${String(siblingData.nom ?? '').toUpperCase()} ${siblingData.prenoms ?? ''}`.trim(),
        ],
      },
    },
    {
      type: 'collapsible',
      label: 'État civil',
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'nom', type: 'text', label: 'Nom', required: true, admin: { width: '50%' } },
            { name: 'prenoms', type: 'text', label: 'Prénoms', required: true, admin: { width: '50%' } },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'dateNaissance',
              type: 'date',
              label: 'Date de naissance',
              admin: { width: '34%', date: { pickerAppearance: 'dayOnly', displayFormat: 'dd/MM/yyyy' } },
            },
            { name: 'lieuNaissance', type: 'text', label: 'Lieu de naissance', admin: { width: '33%' } },
            {
              name: 'nationalite',
              type: 'text',
              label: 'Nationalité',
              defaultValue: 'Ivoirienne',
              admin: { width: '33%' },
            },
          ],
        },
        {
          name: 'sexe',
          type: 'select',
          label: 'Sexe',
          options: [
            { label: 'Féminin', value: 'f' },
            { label: 'Masculin', value: 'm' },
          ],
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Coordonnées',
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'telephone', type: 'text', label: 'Téléphone', index: true, admin: { width: '50%' } },
            { name: 'courriel', type: 'email', label: 'Adresse électronique', admin: { width: '50%' } },
          ],
        },
        { name: 'adresse', type: 'textarea', label: 'Adresse ou repère' },
      ],
    },
    {
      type: 'collapsible',
      label: 'Personne à contacter',
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'contactNom', type: 'text', label: 'Nom', admin: { width: '40%' } },
            { name: 'contactLien', type: 'text', label: 'Lien', admin: { width: '25%' } },
            { name: 'contactTelephone', type: 'text', label: 'Téléphone', admin: { width: '35%' } },
          ],
        },
      ],
    },
    {
      name: 'pieceIdentite',
      type: 'upload',
      relationTo: 'pieces',
      label: 'Pièce d’identité',
      // §20.2 — l'accès aux pièces d'identité est restreint aux rôles habilités.
      access: { read: champReserveA(ROLES_PIECES), update: champReserveA(ROLES_PIECES) },
      admin: { description: 'Consultable par les seuls rôles Admission et Scolarité. Chaque accès est journalisé.' },
    },
    {
      name: 'note',
      type: 'textarea',
      label: 'Note interne',
      admin: { description: 'Usage administratif. N’est jamais exposée au public ni à la personne concernée.' },
    },
  ],
};
