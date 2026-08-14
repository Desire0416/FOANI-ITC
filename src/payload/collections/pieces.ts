import type { CollectionConfig } from 'payload';
import { aRole } from '../acces';
import { ROLES_PIECES } from '../roles';

/* ==========================================================================
   Pièces justificatives — CDC §20.2 et §22.1
   --------------------------------------------------------------------------
   « Conserver les pièces sur un espace de stockage protégé, jamais accessible
   par une adresse publique. » (§20.2)
   « Espace de stockage séparé du serveur, accès uniquement par lien
   temporaire. » (§22.1)

   D'où trois dispositions :

   1. `disableLocalStorage` n'est pas activé tant que le stockage externe n'est
      pas configuré, mais l'accès aux fichiers passe systématiquement par
      Payload — jamais par un dossier servi en statique. Une pièce d'identité
      n'a pas d'URL devinable.
   2. La lecture est restreinte aux rôles Admission et Scolarité, ou au
      candidat propriétaire du dossier.
   3. Chaque consultation est journalisée (§20.2).
   ========================================================================== */

export const Pieces: CollectionConfig = {
  slug: 'pieces',
  labels: { singular: 'Pièce justificative', plural: 'Pièces justificatives' },
  upload: {
    staticDir: process.env.PIECES_DIR ?? undefined,
    // Formats acceptés depuis un téléphone (§10.1) : photographie ou PDF.
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'application/pdf'],
    // Une seule variante, redimensionnée : le CDC demande l'allègement
    // automatique des images déposées depuis un téléphone (§10.1).
    imageSizes: [{ name: 'lisible', width: 1800, height: undefined, position: 'centre' }],
    adminThumbnail: 'lisible',
  },
  admin: {
    useAsTitle: 'filename',
    group: 'Admission',
    description: 'Documents déposés par les candidats. Jamais accessibles par une adresse publique.',
    hidden: ({ user }) => !aRole(user, ROLES_PIECES),
  },
  access: {
    // Un candidat authentifié peut déposer ; l'établissement peut téléverser
    // pour lui lors d'une reprise de dossier.
    create: ({ req }) => Boolean(req.user),
    read: ({ req }) => {
      if (aRole(req.user, ROLES_PIECES)) return true;
      if (req.user?.collection !== 'candidats') return false;
      return { deposePar: { equals: req.user.id } };
    },
    update: ({ req }) => aRole(req.user, ROLES_PIECES),
    // Une pièce déposée n'est pas effacée : elle est éventuellement rejetée,
    // avec motif, ce qui laisse une trace exploitable en cas de litige.
    delete: () => false,
  },
  fields: [
    {
      name: 'deposePar',
      type: 'relationship',
      relationTo: 'candidats',
      label: 'Déposée par',
      index: true,
      admin: { readOnly: true, position: 'sidebar' },
      hooks: {
        beforeChange: [
          ({ req, value, operation }) =>
            operation === 'create' && req.user?.collection === 'candidats' ? req.user.id : value,
        ],
      },
    },
    {
      /* Empreinte technique du fichier — Note complémentaire §5.4.
         « Le dispositif détecte le dépôt d'un même document dans deux dossiers
         distincts, par comparaison d'empreinte technique. » Et §5.4 encore :
         « Les pièces déposées sont conservées telles quelles, avec leur date de
         dépôt et leur empreinte, ce qui rend toute contestation ultérieure
         arbitrable. »

         Elle n'est pas unique en base, délibérément. Un même document déposé
         deux fois est un fait à signaler à un agent, pas une écriture à
         refuser : deux frères peuvent produire le même certificat de résidence,
         et un candidat peut légitimement redéposer le sien après un rejet. Le
         dispositif rapproche ; c'est l'agent qui tranche. */
      name: 'empreinte',
      type: 'text',
      label: 'Empreinte du fichier',
      index: true,
      admin: {
        readOnly: true,
        position: 'sidebar',
        description: 'SHA-256 du fichier tel que déposé. Sert à repérer un même document dans deux dossiers.',
      },
    },
    {
      name: 'nature',
      type: 'select',
      label: 'Nature du document',
      options: [
        { label: 'Pièce d’identité', value: 'identite' },
        { label: 'Relevé de notes', value: 'releve' },
        { label: 'Diplôme ou attestation de réussite', value: 'diplome' },
        { label: 'Photographie d’identité', value: 'photo' },
        { label: 'Autre', value: 'autre' },
      ],
      defaultValue: 'autre',
    },
    {
      name: 'consultations',
      type: 'array',
      label: 'Journal des consultations',
      admin: {
        readOnly: true,
        position: 'sidebar',
        description: '§20.2 — chaque accès à une pièce est enregistré.',
      },
      fields: [
        { name: 'agent', type: 'relationship', relationTo: 'utilisateurs' },
        { name: 'date', type: 'date' },
      ],
    },
  ],
};

/*
   Sur la journalisation.

   L'enregistrement de la consultation n'est volontairement pas branché sur un
   `afterRead` : ce crochet se déclenche aussi sur chaque ligne d'une liste, ce
   qui produirait une écriture par vignette affichée et noierait les accès
   réels sous le bruit des listings. Le §20.2 vise l'ouverture d'une pièce, pas
   son apparition dans un tableau.

   La journalisation est donc posée au point précis où un agent ouvre un
   document, dans l'écran d'instruction (`journaliserConsultation`).
*/
