import type { CollectionConfig, Where } from 'payload';
import { CYCLE_LABELS, FORMATIONS, titreComplet } from '@/content/formations';
import { reserveA, siensOuRoles, suppressionInterdite } from '../acces';
import { ROLES_CANDIDATURES } from '../roles';
import { attribuerReference } from '../sequence';

/* ==========================================================================
   Candidatures — CDC §10
   --------------------------------------------------------------------------
   Les états sont ceux du §10.3, dans l'ordre exact du cadrage :

     Brouillon → Soumis → En instruction → Complément demandé → Complet
     → Décision (admis, admis sous condition, liste d'attente, refusé)
     → Inscrit ou Désisté

   Trois règles du CDC sont tenues ici, et non dans l'interface :

   — une référence de transaction déjà utilisée est rejetée (§10.2). C'est une
     contrainte d'unicité en base, pas une vérification d'écran : deux
     candidats qui saisissent la même référence à la même seconde doivent être
     départagés par la base ;
   — un dossier n'est jamais supprimé (§10.3, journal) ;
   — chaque décision conserve son auteur et sa date (§10.3).
   ========================================================================== */

const OPTIONS_FORMATION = FORMATIONS.map((formation) => ({
  label: `${CYCLE_LABELS[formation.cycle]} — ${titreComplet(formation)}`,
  value: formation.slug,
}));

/**
 * Les états de la chaîne — note complémentaire §3.2 et §3.4.
 *
 * Six états sont venus s'ajouter : la chaîne s'arrêtait à « Admis », laissant
 * le parcours s'interrompre au moment précis où il devient décisif — celui où
 * un admis devient, ou non, un inscrit. Le détail de chaque étape, son service
 * propriétaire et son délai d'alerte vivent dans `payload/chaine.ts`.
 */
export const ETATS_CANDIDATURE = [
  { label: 'Brouillon', value: 'brouillon' },
  { label: 'Soumis', value: 'soumis' },
  { label: 'En instruction', value: 'instruction' },
  { label: 'Complément demandé', value: 'complement' },
  { label: 'Complet', value: 'complet' },
  { label: 'Admis', value: 'admis' },
  { label: 'Admis sous condition', value: 'admis-condition' },
  { label: 'Offre acceptée', value: 'offre-acceptee' },
  { label: 'Versement annoncé', value: 'versement-annonce' },
  { label: 'Place réservée', value: 'place-reservee' },
  { label: 'Inscription à valider', value: 'inscription-a-valider' },
  { label: 'Inscrit', value: 'inscrit' },
  { label: 'Accès ouverts', value: 'acces-ouverts' },
  { label: 'Liste d’attente', value: 'attente' },
  { label: 'Refusé', value: 'refuse' },
  { label: 'Désisté', value: 'desiste' },
  { label: 'Annulé', value: 'annule' },
] as const;

/** États que le candidat lui-même peut encore modifier. */
export const ETATS_MODIFIABLES = ['brouillon', 'complement'];

export const Candidatures: CollectionConfig = {
  slug: 'candidatures',
  labels: { singular: 'Candidature', plural: 'Candidatures' },
  admin: {
    useAsTitle: 'reference',
    defaultColumns: ['reference', 'nomCandidat', 'voeu1', 'etat', 'updatedAt'],
    group: 'Admission',
    description: 'Dossiers déposés en ligne. Un dossier n’est jamais supprimé : il change d’état.',
    listSearchableFields: ['reference', 'nomCandidat', 'referenceTransaction'],
  },
  access: {
    create: ({ req }) => Boolean(req.user),
    read: siensOuRoles('candidat', [...ROLES_CANDIDATURES, 'finances', 'consultation']),
    update: ({ req }) => {
      if (req.user?.collection === 'utilisateurs') {
        return reserveA(ROLES_CANDIDATURES)({ req }) === true;
      }
      if (req.user?.collection !== 'candidats') return false;
      // Le candidat ne reprend la main que sur un brouillon ou sur un dossier
      // pour lequel un complément lui est demandé (§10.3).
      const contrainte: Where = {
        and: [{ candidat: { equals: req.user.id } }, { etat: { in: ETATS_MODIFIABLES } }],
      };
      return contrainte;
    },
    delete: suppressionInterdite,
  },
  fields: [
    {
      name: 'reference',
      type: 'text',
      label: 'Numéro de dossier',
      unique: true,
      index: true,
      admin: { position: 'sidebar', readOnly: true },
    },
    {
      name: 'etat',
      type: 'select',
      label: 'État du dossier',
      required: true,
      defaultValue: 'brouillon',
      index: true,
      options: [...ETATS_CANDIDATURE],
      access: {
        // Seul l'établissement fait avancer l'état ; le candidat soumet via
        // une action dédiée, contrôlée côté serveur.
        update: ({ req }) => req.user?.collection === 'utilisateurs',
      },
      admin: { position: 'sidebar' },
    },
    {
      name: 'candidat',
      type: 'relationship',
      relationTo: 'candidats',
      label: 'Compte candidat',
      index: true,
      admin: { position: 'sidebar', readOnly: true },
      hooks: {
        beforeChange: [
          ({ req, value, operation }) =>
            operation === 'create' && req.user?.collection === 'candidats' ? req.user.id : value,
        ],
      },
    },
    {
      name: 'personne',
      type: 'relationship',
      relationTo: 'personnes',
      label: 'Personne au référentiel',
      admin: {
        position: 'sidebar',
        description: 'Renseignée à l’admission, ou rattachée si la personne est déjà connue (§10.5).',
      },
      access: { update: ({ req }) => req.user?.collection === 'utilisateurs' },
    },

    /* ------------------------------------------------------------- Le vœu */
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Formation demandée',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'voeu1',
                  type: 'select',
                  label: 'Premier choix',
                  required: true,
                  options: OPTIONS_FORMATION,
                  index: true,
                  admin: { width: '50%' },
                },
                {
                  name: 'voeu2',
                  type: 'select',
                  label: 'Second choix',
                  options: OPTIONS_FORMATION,
                  admin: { width: '50%', description: 'Facultatif. Examiné si le premier choix n’aboutit pas.' },
                },
              ],
            },
            {
              name: 'anneeEntree',
              type: 'text',
              label: 'Année ou session d’entrée',
              defaultValue: '2026-2027',
            },
          ],
        },
        {
          label: 'Candidat',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'nom', type: 'text', label: 'Nom', admin: { width: '50%' } },
                { name: 'prenoms', type: 'text', label: 'Prénoms', admin: { width: '50%' } },
              ],
            },
            {
              name: 'nomCandidat',
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
              type: 'row',
              fields: [
                { name: 'telephone', type: 'text', label: 'Téléphone', admin: { width: '50%' } },
                { name: 'courriel', type: 'email', label: 'Adresse électronique', admin: { width: '50%' } },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'contactNom', type: 'text', label: 'Personne à contacter', admin: { width: '40%' } },
                { name: 'contactLien', type: 'text', label: 'Lien', admin: { width: '25%' } },
                { name: 'contactTelephone', type: 'text', label: 'Son téléphone', admin: { width: '35%' } },
              ],
            },
          ],
        },
        {
          label: 'Parcours scolaire',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'serieBac', type: 'text', label: 'Série du baccalauréat', admin: { width: '34%' } },
                { name: 'anneeBac', type: 'text', label: 'Année d’obtention', admin: { width: '33%' } },
                { name: 'mentionBac', type: 'text', label: 'Mention', admin: { width: '33%' } },
              ],
            },
            { name: 'etablissementOrigine', type: 'text', label: 'Établissement d’origine' },
            {
              name: 'situation',
              type: 'select',
              hasMany: true,
              label: 'Situation particulière',
              options: [
                { label: 'Reprise d’études', value: 'reprise' },
                { label: 'Activité salariée', value: 'salarie' },
                { label: 'Besoin d’hébergement', value: 'hebergement' },
              ],
            },
          ],
        },
        {
          label: 'Pièces',
          fields: [
            {
              name: 'pieces',
              type: 'array',
              label: 'Pièces déposées',
              labels: { singular: 'Pièce', plural: 'Pièces' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'fichier',
                      type: 'upload',
                      relationTo: 'pieces',
                      label: 'Document',
                      required: true,
                      admin: { width: '50%' },
                    },
                    {
                      name: 'etatPiece',
                      type: 'select',
                      label: 'Décision sur la pièce',
                      defaultValue: 'attente',
                      options: [
                        { label: 'En attente d’examen', value: 'attente' },
                        { label: 'Acceptée', value: 'acceptee' },
                        { label: 'Rejetée', value: 'rejetee' },
                      ],
                      access: { update: ({ req }) => req.user?.collection === 'utilisateurs' },
                      admin: { width: '50%' },
                    },
                  ],
                },
                {
                  name: 'motif',
                  type: 'text',
                  label: 'Motif du rejet',
                  access: { update: ({ req }) => req.user?.collection === 'utilisateurs' },
                  admin: {
                    condition: (_, siblingData) => siblingData?.etatPiece === 'rejetee',
                    description: 'Communiqué au candidat avec la demande de complément (§10.3).',
                  },
                },
              ],
            },
          ],
        },
        {
          label: 'Frais de dossier',
          description:
            'Le dispositif n’encaisse aucun fonds. Il enregistre une référence de transaction que l’administration rapproche de son relevé (§10.2).',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'referenceTransaction',
                  type: 'text',
                  label: 'Référence de la transaction',
                  unique: true,
                  index: true,
                  admin: {
                    width: '50%',
                    description: 'Une référence déjà utilisée est rejetée par le dispositif.',
                  },
                },
                {
                  name: 'modeReglement',
                  type: 'select',
                  label: 'Moyen',
                  options: [
                    { label: 'Paiement mobile', value: 'mobile' },
                    { label: 'Versement au guichet', value: 'guichet' },
                    { label: 'Virement', value: 'virement' },
                  ],
                  defaultValue: 'mobile',
                  admin: { width: '50%' },
                },
              ],
            },
            {
              name: 'transactionVerifiee',
              type: 'checkbox',
              label: 'Référence rapprochée du relevé',
              defaultValue: false,
              access: { update: ({ req }) => req.user?.collection === 'utilisateurs' },
              admin: { description: 'La validation reste humaine : un agent rapproche la référence de son relevé.' },
            },
          ],
        },
        {
          label: 'Décision',
          fields: [
            {
              name: 'decisionSens',
              type: 'select',
              label: 'Sens de la décision',
              options: [
                { label: 'Admis', value: 'admis' },
                { label: 'Admis sous condition', value: 'admis-condition' },
                { label: 'Liste d’attente', value: 'attente' },
                { label: 'Refusé', value: 'refuse' },
              ],
              access: { update: ({ req }) => reserveA(ROLES_CANDIDATURES)({ req }) === true },
            },
            {
              name: 'decisionConditions',
              type: 'textarea',
              label: 'Conditions à lever',
              access: { update: ({ req }) => reserveA(ROLES_CANDIDATURES)({ req }) === true },
              admin: { condition: (data) => data?.decisionSens === 'admis-condition' },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'decisionDate',
                  type: 'date',
                  label: 'Date de la décision',
                  access: { update: ({ req }) => reserveA(ROLES_CANDIDATURES)({ req }) === true },
                  admin: { width: '50%', readOnly: true },
                },
                {
                  name: 'decisionAgent',
                  type: 'relationship',
                  relationTo: 'utilisateurs',
                  label: 'Décision enregistrée par',
                  access: { update: ({ req }) => reserveA(ROLES_CANDIDATURES)({ req }) === true },
                  admin: { width: '50%', readOnly: true },
                },
              ],
            },
          ],
        },
      ],
    },

    /* ----------------------------------------------------------- Journal */
    {
      name: 'journal',
      type: 'array',
      label: 'Journal du dossier',
      access: { update: () => false, create: () => false },
      admin: {
        readOnly: true,
        description: '§10.3 — conserve l’auteur et la date de chaque décision.',
      },
      fields: [
        { name: 'date', type: 'date' },
        { name: 'action', type: 'text' },
        { name: 'auteur', type: 'text' },
      ],
    },
    {
      name: 'soumisLe',
      type: 'date',
      label: 'Soumis le',
      admin: { position: 'sidebar', readOnly: true },
    },
  ],
  hooks: {
    /**
     * Tout se joue avant l'écriture, en une seule opération.
     *
     * Le journal était auparavant écrit après coup, par une seconde mise à
     * jour lancée depuis `afterChange`. Sur SQLite cela passait ; sur
     * PostgreSQL, cette seconde écriture visait une ligne que la première
     * verrouillait encore, et attendait une transaction qui ne pouvait pas
     * s'achever tant que le crochet ne rendait pas la main. Un interblocage,
     * dénoué au bout d'une cinquantaine de secondes par le délai d'expiration
     * — et l'envoi d'un dossier n'aboutissait jamais.
     *
     * Écrire le journal ici règle plus qu'un blocage : l'état et sa trace
     * partent dans la même écriture. Il devient impossible qu'un dossier
     * change d'état sans que le journal le dise, ce qui est précisément ce
     * que demande le §10.3.
     */
    beforeChange: [
      async ({ data, operation, req, originalDoc, context }) => {
        // Numéro de dossier attribué une seule fois, à la création.
        if (operation === 'create' && !data.reference) {
          data.reference = await attribuerReference(req.payload, 'candidature');
        }

        // La décision porte toujours son auteur et sa date (§10.3).
        const sensChange = data.decisionSens && data.decisionSens !== originalDoc?.decisionSens;
        if (sensChange && req.user?.collection === 'utilisateurs') {
          data.decisionDate = new Date().toISOString();
          data.decisionAgent = req.user.id;
        }

        // Chaque changement d'état laisse sa trace, avec son auteur et sa date.
        const etatChange =
          operation === 'update' &&
          typeof data.etat === 'string' &&
          data.etat !== originalDoc?.etat;

        if (etatChange) {
          const auteur =
            req.user?.collection === 'utilisateurs'
              ? String(req.user.nomComplet ?? req.user.email)
              : 'Candidat';

          /* Un retour en arrière porte son motif, une saisie faite pour le
             compte du candidat le dit (§5.5). Sans cela, l'historique
             montrerait un aller-retour sans jamais en donner la raison. */
          const motif = typeof context?.motifTransition === 'string' ? context.motifTransition : '';
          const assistee = context?.transitionAssistee === true;

          const mentions = [
            `État : ${originalDoc?.etat ?? '—'} → ${data.etat}`,
            assistee ? 'saisi pour le compte du candidat' : '',
            motif ? `motif : ${motif}` : '',
          ].filter(Boolean);

          data.journal = [
            ...((originalDoc?.journal as unknown[] | undefined) ?? []),
            {
              date: new Date().toISOString(),
              action: mentions.join(' — '),
              auteur,
            },
          ];
        }

        return data;
      },
    ],
  },
};
