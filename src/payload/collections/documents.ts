import type { CollectionConfig } from 'payload';
import { NATURES } from '../documents';
import { ROLES_DOSSIERS } from '../roles';

/* ==========================================================================
   Documents délivrés — Note complémentaire §5.2
   --------------------------------------------------------------------------
   Ce que l'établissement a remis, et quand. Une ligne par document : lettre
   d'admission, certificat de scolarité, carte étudiant, reçu.

   La collection est en écriture seule du point de vue applicatif : rien ne
   modifie un document délivré, et rien ne le supprime. Un certificat corrigé
   est un nouveau certificat, portant un nouveau numéro — c'est ce qui rend la
   page publique de vérification digne de foi.
   ========================================================================== */

export const Documents: CollectionConfig = {
  slug: 'documents',
  labels: { singular: 'Document délivré', plural: 'Documents délivrés' },
  admin: {
    useAsTitle: 'numero',
    defaultColumns: ['numero', 'nature', 'candidature', 'delivreLe'],
    group: 'Scolarité',
    description:
      'Ce que l’établissement a remis. Un document délivré ne se modifie pas : on en délivre un nouveau.',
  },
  access: {
    // La délivrance passe par `delivrer()`, côté serveur, avec dérogation.
    create: () => false,
    read: ({ req }) => {
      if (req.user?.collection === 'utilisateurs') {
        return ROLES_DOSSIERS.includes(req.user.role as never);
      }
      // Le candidat ne voit que les siens ; le filtre porte sur son dossier.
      return false;
    },
    update: () => false,
    delete: () => false,
  },
  fields: [
    {
      name: 'nature',
      type: 'select',
      required: true,
      index: true,
      options: Object.entries(NATURES).map(([value, def]) => ({ value, label: def.libelle })),
    },
    {
      name: 'numero',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      label: 'Numéro',
    },
    {
      name: 'code',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      label: 'Code de vérification',
      admin: { description: 'Saisi sur la page publique pour contrôler l’authenticité.' },
    },
    {
      name: 'candidature',
      type: 'relationship',
      relationTo: 'candidatures',
      index: true,
      label: 'Dossier',
    },
    {
      name: 'personne',
      type: 'relationship',
      relationTo: 'personnes',
      index: true,
    },
    {
      name: 'delivreLe',
      type: 'date',
      required: true,
      label: 'Délivré le',
    },
    {
      // Les valeurs figées au moment de la remise. Un document doit rester
      // lisible tel qu'il a été remis, même si le dossier a changé depuis.
      name: 'donnees',
      type: 'json',
      required: true,
      label: 'Valeurs portées par le document',
    },
  ],
};
