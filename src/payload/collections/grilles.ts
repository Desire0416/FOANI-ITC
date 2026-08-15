import type { CollectionConfig } from 'payload';
import { CYCLE_LABELS, FORMATIONS, titreComplet } from '@/content/formations';
import { reserveA, suppressionInterdite } from '../acces';
import { OPTIONS_NATURE } from '../finances/natures';
import { ROLES_GRILLES } from '../roles';

/* ==========================================================================
   Les grilles tarifaires — Note complémentaire §6.4
   --------------------------------------------------------------------------
   « La grille est définie par la direction, par formation, niveau et année
   académique. Elle comporte le montant total, le nombre de tranches, ainsi que
   le montant et la date d'exigibilité de chacune. »

   QUATRE RÈGLES, ET CE QU'ELLES IMPLIQUENT DANS LE CODE.

   1. « Un agent ne modifie jamais une grille ; il ne fait que constater des
      versements. » Le service des finances est donc absent des rôles
      d'écriture — délibérément, et c'est exactement ce que le poste Finances
      s'interdit déjà dans `postes.ts`.

   2. « Une grille déjà appliquée à des inscriptions n'est plus modifiable ;
      une évolution donne lieu à une nouvelle version. » L'immuabilité se
      déclenche à l'arrêt, non à la première inscription. C'est plus strict que
      la règle, et voulu : une grille arrêtée est publiée sur le site et jointe
      à l'engagement financier que l'étudiant signe. Elle est opposable dès cet
      instant, avant même qu'une inscription l'applique. Attendre la première
      inscription laisserait une fenêtre où la direction a annoncé un tarif et
      peut encore le changer.

   3. Le nombre de tranches n'est pas un champ : c'est la longueur du tableau
      des échéances. Un compteur séparé de ce qu'il compte finit toujours par
      mentir.

   4. « Un aménagement individuel est enregistré sur l'inscription concernée. »
      Il ne touche donc pas la grille, qui reste le tarif public.

   CE QUE CETTE COLLECTION N'EST PAS. Ce n'est pas une créance. Une grille est
   un catalogue : elle dit ce que coûte une formation, elle ne dit pas que
   quelqu'un doit quelque chose. La créance naît de l'appel de frais, émis à la
   validation de l'inscription à partir de la grille applicable.
   ========================================================================== */

const OPTIONS_FORMATION = FORMATIONS.map((formation) => ({
  label: `${CYCLE_LABELS[formation.cycle]} — ${titreComplet(formation)}`,
  value: formation.slug,
}));

export const ETATS_GRILLE = [
  { label: 'Brouillon', value: 'brouillon' },
  { label: 'Arrêtée', value: 'arretee' },
  { label: 'Archivée', value: 'archivee' },
] as const;

export const Grilles: CollectionConfig = {
  slug: 'grilles',
  labels: { singular: 'Grille tarifaire', plural: 'Grilles tarifaires' },
  admin: {
    useAsTitle: 'code',
    defaultColumns: ['code', 'formation', 'anneeAcademique', 'version', 'etat'],
    group: 'Finances',
    description:
      'Ce que coûte une formation. Arrêtée par la direction, et immuable dès cet instant : une évolution donne lieu à une nouvelle version.',
  },
  access: {
    create: reserveA(ROLES_GRILLES),
    /* Une grille arrêtée est publique : elle figure sur la fiche de formation
       et dans l'engagement financier. Sa lecture n'est donc pas restreinte. */
    read: () => true,
    update: reserveA(ROLES_GRILLES),
    delete: suppressionInterdite,
  },
  fields: [
    {
      name: 'code',
      type: 'text',
      label: 'Code',
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Composé à l’enregistrement, à partir de la formation, de l’année et de la version.',
      },
    },
    {
      name: 'etat',
      type: 'select',
      label: 'État',
      required: true,
      defaultValue: 'brouillon',
      index: true,
      options: [...ETATS_GRILLE],
      admin: {
        position: 'sidebar',
        description: 'Une grille arrêtée n’est plus modifiable. Elle ne peut qu’être archivée.',
      },
    },
    {
      name: 'circuit',
      type: 'select',
      label: 'Circuit',
      required: true,
      defaultValue: 'academique',
      index: true,
      options: [
        { label: 'Académique', value: 'academique' },
        { label: 'Cabinet', value: 'cabinet' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Les prestations aux organisations suivent un circuit distinct (§6.3).',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'formation',
          type: 'select',
          label: 'Formation',
          options: OPTIONS_FORMATION,
          index: true,
          admin: {
            width: '50%',
            description: 'Laissé vide pour une grille de session courte ou de prestation.',
          },
        },
        {
          name: 'anneeAcademique',
          type: 'text',
          label: 'Année académique',
          required: true,
          defaultValue: '2026-2027',
          index: true,
          admin: { width: '25%' },
        },
        {
          name: 'version',
          type: 'number',
          label: 'Version',
          required: true,
          defaultValue: 1,
          min: 1,
          admin: { width: '25%', readOnly: true },
        },
      ],
    },
    {
      name: 'intitule',
      type: 'text',
      label: 'Intitulé',
      admin: {
        description: 'Pour une session courte ou une prestation, qui n’ont pas de formation au catalogue.',
      },
    },

    /* --------------------------------------------------------- Les lignes */
    {
      name: 'lignes',
      type: 'array',
      label: 'Ce que la formation coûte',
      minRows: 1,
      labels: { singular: 'Ligne', plural: 'Lignes' },
      admin: {
        description:
          'Une ligne par nature de frais. Le total de la grille est la somme de ses lignes.',
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'nature',
              type: 'select',
              label: 'Nature',
              required: true,
              options: OPTIONS_NATURE,
              admin: { width: '34%' },
            },
            {
              name: 'libelle',
              type: 'text',
              label: 'Libellé porté sur l’appel de frais',
              admin: { width: '41%' },
            },
            {
              name: 'montant',
              type: 'number',
              label: 'Montant (F CFA)',
              required: true,
              min: 0,
              admin: {
                width: '25%',
                step: 1,
                description: 'Entier. Le franc CFA n’a pas de centime.',
              },
            },
          ],
        },
        {
          /* Les dates sont saisies, non calculées : elles relèvent du
             calendrier de l'établissement. En déduire des mensualités
             supposerait de connaître le rythme de l'année académique, que le
             dispositif n'a pas à inventer. Le montant de chaque tranche, lui,
             est réparti automatiquement — c'est là qu'on perd des francs. */
          name: 'echeances',
          type: 'array',
          label: 'Échéances',
          labels: { singular: 'Échéance', plural: 'Échéances' },
          admin: {
            description:
              'Laissé vide, le frais est dû en une fois. Sinon, une date par tranche : le montant se répartit sans perte.',
          },
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'exigibleLe',
                  type: 'date',
                  label: 'Exigible le',
                  required: true,
                  admin: { width: '50%', date: { pickerAppearance: 'dayOnly' } },
                },
                {
                  name: 'intitule',
                  type: 'text',
                  label: 'Intitulé de la tranche',
                  admin: { width: '50%', placeholder: 'Première tranche' },
                },
              ],
            },
          ],
        },
      ],
    },

    /* ------------------------------------------------------------ L'arrêt */
    {
      type: 'row',
      fields: [
        {
          name: 'arreteeLe',
          type: 'date',
          label: 'Arrêtée le',
          admin: { width: '50%', readOnly: true },
        },
        {
          name: 'arreteePar',
          type: 'relationship',
          relationTo: 'utilisateurs',
          label: 'Arrêtée par',
          admin: { width: '50%', readOnly: true },
        },
      ],
    },
    {
      name: 'remplace',
      type: 'relationship',
      relationTo: 'grilles',
      label: 'Remplace la version',
      admin: { readOnly: true, position: 'sidebar' },
    },
    {
      name: 'motifVersion',
      type: 'textarea',
      label: 'Motif de cette version',
      admin: {
        description: 'Obligatoire dès la deuxième version : une évolution de tarif se justifie.',
      },
    },
  ],

  hooks: {
    beforeChange: [
      ({ data, operation, originalDoc }) => {
        /* ------------------------------------------------- L'immuabilité */
        if (operation === 'update' && originalDoc?.etat === 'arretee') {
          const versArchive = data.etat === 'archivee';
          if (!versArchive) {
            throw new Error(
              'Une grille arrêtée n’est plus modifiable. Créez une nouvelle version, ou archivez celle-ci.',
            );
          }
        }

        if (operation === 'update' && originalDoc?.etat === 'archivee') {
          throw new Error('Une grille archivée ne se modifie plus.');
        }

        /* L'arrêt porte sa date (§6.4, et §5.4 pour le principe). L'auteur,
           lui, est posé par l'action qui arrête : elle le connaît, là où le
           crochet devrait le déduire d'une session parfois partielle. */
        const arretMaintenant = data.etat === 'arretee' && originalDoc?.etat !== 'arretee';
        if (arretMaintenant) data.arreteeLe = new Date().toISOString();

        // Une évolution se justifie.
        if (arretMaintenant && Number(data.version ?? 1) > 1 && !String(data.motifVersion ?? '').trim()) {
          throw new Error('Indiquez le motif de cette version : une évolution de tarif se justifie.');
        }

        /* -------------------------------------------------------- Le code */
        const formation = String(data.formation ?? data.intitule ?? 'general')
          .toUpperCase()
          .replace(/[^A-Z0-9]+/g, '-')
          .replace(/^-|-$/g, '')
          .slice(0, 28);
        data.code = `${formation}/${data.anneeAcademique}/v${data.version ?? 1}`;

        return data;
      },
    ],
  },
};
