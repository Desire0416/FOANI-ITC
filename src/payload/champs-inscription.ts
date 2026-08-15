import type { Field } from 'payload';

/* ==========================================================================
   Le dossier d'inscription — Note complémentaire §5.1, étape 4
   --------------------------------------------------------------------------
   « Le candidat complète les informations que la candidature ne recueillait
   pas : état civil complet, filiation, personne à prévenir, situation
   vis-à-vis de l'hébergement, données nécessaires aux documents officiels. »

   Trois principes ont commandé le choix des champs, et l'exclusion des autres.

   1. LA SOURCE DE VÉRITÉ N'EST PAS L'ÉTABLISSEMENT. Les documents délivrés
      ici — certificat, attestation, carte — servent ailleurs : dossier de
      bourse, dossier de logement, démarches administratives. Ces guichets
      confrontent l'attestation à l'extrait de naissance et rejettent au
      moindre écart. On recueille donc l'état civil « tel qu'il figure sur
      l'extrait », et c'est cette graphie-là qui sera imprimée — jamais une
      forme normalisée par le dispositif.

   2. ON NE DEMANDE QUE CE QUI SERT. La loi ivoirienne n° 2013-450 range parmi
      les données sensibles celles qui touchent à la religion, à l'origine
      ethnique, aux opinions politiques, à la santé et aux poursuites. Aucune
      n'a de finalité dans une inscription, et plusieurs figurent encore sur
      des fiches papier héritées — « village d'origine », « langue parlée »,
      « groupe sanguin » — dont deux sont des indicateurs ethniques directs et
      le troisième une donnée de santé. Aucune n'existe ici, et ce n'est pas un
      oubli.

   3. UN FORMULAIRE NE DOIT EXCLURE PERSONNE. Exiger un numéro d'extrait de
      naissance comme condition de validation revient à écarter les étudiants
      sans état civil constitué — précisément ceux que la dématérialisation
      devrait cesser de renvoyer au guichet. Le jugement supplétif est donc
      admis à parité, et la référence de l'acte reste facultative.
   ========================================================================== */

const OUI_NON = [
  { value: 'oui', label: 'Oui' },
  { value: 'non', label: 'Non' },
];

export const CHAMPS_INSCRIPTION: Field = {
  type: 'tabs',
  tabs: [
    {
      label: 'Dossier d’inscription',
      description:
        'Renseigné par l’étudiant après réservation de sa place. Ces données alimentent les documents officiels.',
      fields: [
        /* ------------------------------------------------------ État civil */
        {
          type: 'collapsible',
          label: 'État civil',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'sexe',
                  type: 'select',
                  label: 'Sexe',
                  options: [
                    { value: 'feminin', label: 'Féminin' },
                    { value: 'masculin', label: 'Masculin' },
                  ],
                  admin: {
                    width: '25%',
                    description: 'Détermine la civilité portée sur les documents délivrés.',
                  },
                },
                {
                  name: 'nomActe',
                  type: 'text',
                  label: 'Nom, tel qu’il figure sur l’acte',
                  admin: { width: '35%' },
                },
                {
                  name: 'prenomsActe',
                  type: 'text',
                  label: 'Prénoms complets, dans l’ordre de l’acte',
                  admin: { width: '40%' },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'prenomUsuel',
                  type: 'text',
                  label: 'Prénom usuel',
                  admin: {
                    width: '30%',
                    description: 'Celui qu’on emploie au quotidien, s’il diffère.',
                  },
                },
                {
                  name: 'paysNaissance',
                  type: 'text',
                  label: 'Pays de naissance',
                  admin: { width: '35%' },
                },
                {
                  name: 'lieuNaissanceActe',
                  type: 'text',
                  label: 'Lieu de naissance, tel qu’il figure sur l’acte',
                  admin: { width: '35%' },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'natureActe',
                  type: 'select',
                  label: 'Pièce d’état civil produite',
                  options: [
                    { value: 'extrait', label: 'Extrait d’acte de naissance' },
                    { value: 'copie-integrale', label: 'Copie intégrale d’acte de naissance' },
                    { value: 'jugement-suppletif', label: 'Jugement supplétif' },
                    { value: 'acte-consulaire', label: 'Acte transcrit au consulat' },
                    { value: 'en-cours', label: 'En cours de régularisation' },
                  ],
                  admin: { width: '34%' },
                },
                {
                  name: 'numeroActe',
                  type: 'text',
                  label: 'Numéro de l’acte ou du jugement',
                  admin: { width: '33%' },
                },
                {
                  name: 'dateActe',
                  type: 'date',
                  label: 'Établi le',
                  admin: { width: '33%', date: { pickerAppearance: 'dayOnly' } },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'centreActe',
                  type: 'text',
                  label: 'Centre d’état civil ou tribunal',
                  admin: { width: '50%' },
                },
                {
                  name: 'situationMatrimoniale',
                  type: 'select',
                  label: 'Situation matrimoniale',
                  options: [
                    { value: 'celibataire', label: 'Célibataire' },
                    { value: 'marie', label: 'Marié(e)' },
                    { value: 'divorce', label: 'Divorcé(e)' },
                    { value: 'veuf', label: 'Veuf(ve)' },
                  ],
                  admin: { width: '50%' },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'naturePieceIdentite',
                  type: 'select',
                  label: 'Pièce d’identité',
                  options: [
                    { value: 'cni', label: 'Carte nationale d’identité' },
                    { value: 'attestation', label: 'Attestation d’identité' },
                    { value: 'passeport', label: 'Passeport' },
                    { value: 'sejour', label: 'Titre de séjour' },
                  ],
                  admin: { width: '34%' },
                },
                {
                  name: 'numeroPieceIdentite',
                  type: 'text',
                  label: 'Numéro de la pièce',
                  admin: { width: '33%' },
                },
                {
                  name: 'telephoneSecond',
                  type: 'text',
                  label: 'Second numéro de téléphone',
                  admin: { width: '33%' },
                },
              ],
            },
            {
              /* La couverture maladie universelle conditionne, depuis 2023,
                 l'inscription dans les établissements supérieurs. Le champ
                 recueille un NUMÉRO D'ASSURÉ — jamais une donnée de santé, qui
                 serait une donnée sensible au sens de la loi. Il reste
                 facultatif tant que l'établissement n'a pas confirmé qu'il
                 l'exige : bloquer une inscription sur une règle non vérifiée
                 auprès de lui serait pire que de ne pas la recueillir. */
              name: 'numeroCmu',
              type: 'text',
              label: 'Numéro d’enrôlement CMU',
              admin: {
                description:
                  'Numéro d’assuré uniquement. Aucune information de santé n’est demandée ni conservée.',
              },
            },
          ],
        },

        /* -------------------------------------------------------- Filiation */
        {
          type: 'collapsible',
          label: 'Filiation',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'pereNom',
                  type: 'text',
                  label: 'Nom et prénoms du père',
                  admin: { width: '60%' },
                },
                {
                  name: 'pereSituation',
                  type: 'select',
                  label: 'Situation',
                  options: [
                    { value: 'vivant', label: 'Vivant' },
                    { value: 'decede', label: 'Décédé' },
                    { value: 'inconnu', label: 'Non déclaré' },
                  ],
                  admin: { width: '40%' },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'mereNom',
                  type: 'text',
                  label: 'Nom et prénoms de la mère',
                  admin: { width: '60%' },
                },
                {
                  name: 'mereSituation',
                  type: 'select',
                  label: 'Situation',
                  options: [
                    { value: 'vivante', label: 'Vivante' },
                    { value: 'decedee', label: 'Décédée' },
                    { value: 'inconnue', label: 'Non déclarée' },
                  ],
                  admin: { width: '40%' },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'repondantNom',
                  type: 'text',
                  label: 'Répondant — nom et prénoms',
                  admin: {
                    width: '40%',
                    description: 'Exigé si l’étudiant est mineur, ou si aucun parent ne répond.',
                  },
                },
                {
                  name: 'repondantLien',
                  type: 'text',
                  label: 'Lien',
                  admin: { width: '25%' },
                },
                {
                  name: 'repondantTelephone',
                  type: 'text',
                  label: 'Téléphone du répondant',
                  admin: { width: '35%' },
                },
              ],
            },
          ],
        },

        /* --------------------------------------------- Résidence et logement */
        {
          type: 'collapsible',
          label: 'Résidence et hébergement',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'residenceVille',
                  type: 'text',
                  label: 'Ville ou commune de résidence pendant l’année',
                  admin: { width: '40%' },
                },
                {
                  name: 'residenceQuartier',
                  type: 'text',
                  label: 'Quartier',
                  admin: { width: '30%' },
                },
                {
                  name: 'residenceRepere',
                  type: 'text',
                  label: 'Repère',
                  admin: { width: '30%' },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'hebergement',
                  type: 'select',
                  label: 'Mode d’hébergement',
                  options: [
                    { value: 'cite', label: 'Cité universitaire' },
                    { value: 'famille', label: 'Domicile familial' },
                    { value: 'location', label: 'Logement loué à titre personnel' },
                    { value: 'heberge', label: 'Hébergé par un parent ou un tuteur' },
                    { value: 'internat', label: 'Internat de l’établissement' },
                    { value: 'sans', label: 'Sans hébergement stable' },
                  ],
                  admin: { width: '50%' },
                },
                {
                  name: 'demandeLogement',
                  type: 'select',
                  label: 'Demande un logement universitaire',
                  options: OUI_NON,
                  admin: {
                    width: '50%',
                    description:
                      'Si oui, l’établissement produit d’office le certificat de scolarité et le reçu que réclame le dossier de logement.',
                  },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'parentsVille',
                  type: 'text',
                  label: 'Ville ou commune de résidence des parents',
                  admin: { width: '50%' },
                },
                {
                  name: 'parentsPays',
                  type: 'text',
                  label: 'Pays de résidence des parents',
                  admin: { width: '50%' },
                },
              ],
            },
          ],
        },

        /* ------------------------------------------------ Personne à prévenir */
        {
          type: 'collapsible',
          label: 'Personne à prévenir',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'urgenceNom',
                  type: 'text',
                  label: 'Nom et prénoms',
                  admin: { width: '40%' },
                },
                { name: 'urgenceLien', type: 'text', label: 'Lien', admin: { width: '20%' } },
                {
                  name: 'urgenceTelephone',
                  type: 'text',
                  label: 'Téléphone',
                  admin: { width: '20%' },
                },
                {
                  name: 'urgenceTelephoneSecond',
                  type: 'text',
                  label: 'Second téléphone',
                  admin: { width: '20%' },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  /* La vraie valeur ajoutée de cette rubrique par rapport à la
                     candidature : en cas d'accident, l'établissement doit
                     pouvoir faire porter un message, pas seulement appeler. */
                  name: 'urgenceVille',
                  type: 'text',
                  label: 'Ville ou commune',
                  admin: { width: '50%' },
                },
                {
                  name: 'urgenceQuartier',
                  type: 'text',
                  label: 'Quartier',
                  admin: { width: '50%' },
                },
              ],
            },
          ],
        },

        /* ---------------------------------------------------- Photographie */
        {
          type: 'collapsible',
          label: 'Photographie d’identité',
          fields: [
            {
              name: 'photo',
              type: 'upload',
              relationTo: 'pieces',
              label: 'Photographie d’identité',
              admin: {
                description:
                  'Portrait cadré selon les normes d’identité. Imprimé sur la carte étudiant.',
              },
            },
            {
              name: 'photoConsentieLe',
              type: 'date',
              label: 'Consentement à l’impression donné le',
              admin: {
                readOnly: true,
                description:
                  'Horodatage du consentement à l’impression de la photographie sur la carte.',
              },
            },
          ],
        },

        /* ------------------------------------------ Vérification d'identité */
        {
          type: 'collapsible',
          label: 'Vérification d’identité',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'pieceRecto',
                  type: 'upload',
                  relationTo: 'pieces',
                  label: 'Pièce d’identité — recto',
                  admin: { width: '33%' },
                },
                {
                  name: 'pieceVerso',
                  type: 'upload',
                  relationTo: 'pieces',
                  label: 'Pièce d’identité — verso',
                  admin: { width: '33%' },
                },
                {
                  /* La photographie du candidat tenant sa pièce. Elle ne
                     remplace pas le contrôle de l'agent : elle le rend
                     possible à distance, en liant le porteur au document. */
                  name: 'pieceSelfie',
                  type: 'upload',
                  relationTo: 'pieces',
                  label: 'Le candidat tenant sa pièce',
                  admin: { width: '34%' },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'identiteControle',
                  type: 'select',
                  label: 'Contrôle visuel',
                  defaultValue: 'attente',
                  options: [
                    { value: 'attente', label: 'En attente de contrôle' },
                    { value: 'conforme', label: 'Identité vérifiée' },
                    { value: 'a-revoir', label: 'À reprendre' },
                  ],
                  admin: { width: '34%' },
                },
                {
                  name: 'identiteMotif',
                  type: 'text',
                  label: 'Motif, si à reprendre',
                  admin: { width: '66%' },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'identiteControleeLe',
                  type: 'date',
                  label: 'Contrôlée le',
                  admin: { width: '50%', readOnly: true },
                },
                {
                  /* §5.4 : « Chaque validation de pièce porte le nom de
                     l'agent et la date. Un dossier frauduleux passé au travers
                     reste imputable. » */
                  name: 'identiteControleePar',
                  type: 'relationship',
                  relationTo: 'utilisateurs',
                  label: 'Contrôlée par',
                  admin: { width: '50%', readOnly: true },
                },
              ],
            },
          ],
        },

        /* --------------------------------------------- Signature (§5.1, ét. 6) */
        {
          type: 'collapsible',
          label: 'Engagements signés',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'engagementsSignesLe',
                  type: 'date',
                  label: 'Signés le',
                  admin: { width: '33%', readOnly: true, date: { displayFormat: 'dd/MM/yyyy HH:mm' } },
                },
                {
                  /* Qui a apposé la signature. Pour un mineur, ce n'est pas
                     l'étudiant mais son représentant légal (§5.1, étape 6). */
                  name: 'engagementsSignataire',
                  type: 'text',
                  label: 'Signataire',
                  admin: { width: '34%', readOnly: true },
                },
                {
                  name: 'engagementsVersion',
                  type: 'text',
                  label: 'Version des textes signés',
                  admin: {
                    width: '33%',
                    readOnly: true,
                    description:
                      'Le jour où le conseil arrête un texte définitif, cette version change et les signatures antérieures deviennent identifiables.',
                  },
                },
              ],
            },
            {
              /* « Le dispositif conserve le document signé, la date, l'heure et
                 l'empreinte technique de la signature. » L'empreinte porte sur
                 le texte intégral tel qu'il a été affiché, l'identité du
                 signataire et l'horodatage : elle rend la signature opposable
                 sans conserver de copie du texte pour chaque étudiant. */
              name: 'engagementsEmpreinte',
              type: 'text',
              label: 'Empreinte de la signature',
              admin: {
                readOnly: true,
                description: 'SHA-256 du texte signé, du signataire et de l’horodatage.',
              },
            },
          ],
        },

        /* ------------------------------------------------------- Achèvement */
        {
          name: 'inscriptionCompleteeLe',
          type: 'date',
          label: 'Dossier d’inscription complété le',
          admin: { readOnly: true },
        },
      ],
    },
  ],
};
