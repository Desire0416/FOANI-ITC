import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildConfig } from 'payload';
import { postgresAdapter } from '@payloadcms/db-postgres';
import { sqliteAdapter } from '@payloadcms/db-sqlite';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { s3Storage } from '@payloadcms/storage-s3';
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob';
import { fr } from '@payloadcms/translations/languages/fr';
import sharp from 'sharp';

import { Actualites } from './payload/collections/actualites';
import { Candidats } from './payload/collections/candidats';
import { Candidatures } from './payload/collections/candidatures';
import { Compteurs } from './payload/collections/compteurs';
import { Evenements } from './payload/collections/evenements';
import { Offres } from './payload/collections/offres';
import { Personnes } from './payload/collections/personnes';
import { Pieces } from './payload/collections/pieces';
import { Utilisateurs } from './payload/collections/utilisateurs';

const repertoire = path.dirname(fileURLToPath(import.meta.url));

/* ==========================================================================
   Socle d'administration — CDC §22.1
   --------------------------------------------------------------------------
   « Développement spécifique adossé à un socle d'administration éprouvé →
   interface d'administration complète dès la livraison, sans écran développé
   sur mesure ni délai supplémentaire. »

   Base de données : PostgreSQL en service, SQLite en secours local.

   Le dispositif est déployé sur une plateforme sans disque persistant : un
   fichier SQLite y disparaîtrait à chaque redéploiement. La base vit donc sur
   un serveur PostgreSQL géré, désigné par `DATABASE_URL`.

   Le §21.1 exige une « restauration documentée en français, utilisable par un
   technicien n'ayant pas participé au projet », et le §24.4 en fait un critère
   éliminatoire. PostgreSQL y répond par `pg_dump` et `pg_restore`, deux
   commandes qu'un correspondant technique trouvera documentées partout — et
   l'hébergeur ajoute ses propres sauvegardes datées.

   SQLite reste branché en secours : sans `DATABASE_URL`, le dispositif
   retombe sur un fichier local. C'est ce qui permet de travailler hors ligne
   et de faire tourner les scripts d'amorçage sans toucher à la base en
   service. Les collections sont identiques dans les deux cas.

   Stockage des pièces : §22.1 demande un « espace de stockage séparé du
   serveur, accès uniquement par lien temporaire ». Trois cas, dans cet ordre :
   Vercel Blob s'il est connecté, S3 s'il est configuré, sinon le disque local
   — les fichiers restant alors hors du dossier public et servis par Payload
   seul, sous contrôle d'accès.
   ========================================================================== */

/**
 * Le secret de session, exigé sans détour.
 *
 * Payload refuse de démarrer sans lui, mais son message — « missing secret
 * key » — arrive au milieu d'une trace de construction et ne dit pas où poser
 * la valeur. Sur une plateforme de déploiement, c'est vingt minutes perdues.
 * On échoue donc plus tôt, en français, avec la marche à suivre.
 */
function exigerSecret(): string {
  const secret = process.env.PAYLOAD_SECRET;
  if (secret && secret.length >= 32) return secret;

  throw new Error(
    [
      '',
      'PAYLOAD_SECRET est absent ou trop court (32 caractères au minimum).',
      '',
      'Cette chaîne signe les sessions des agents et des candidats. Elle doit',
      'être tirée au hasard, et différente par environnement.',
      '',
      '  Générer    : node -e "console.log(crypto.randomBytes(32).toString(\'hex\'))"',
      '  En local   : ajouter PAYLOAD_SECRET=… dans le fichier .env',
      '  Sur Vercel : Settings → Environment Variables → Add New',
      '',
      'DATABASE_URL est requise au même titre : la construction lit la base',
      'pour établir la liste des actualités publiées.',
      '',
    ].join('\n'),
  );
}

const adressePostgres = process.env.DATABASE_URL ?? process.env.POSTGRES_URL ?? null;

const stockageS3 =
  process.env.S3_BUCKET && process.env.S3_ENDPOINT && process.env.S3_ACCESS_KEY_ID;

const stockageVercel = process.env.BLOB_READ_WRITE_TOKEN;

export default buildConfig({
  // L'interface d'administration livrée par Payload est désactivée : le
  // back-office de FOANI-ITC est construit sur mesure (voir src/app/(gestion)).
  // Payload reste la couche de données, le contrôle d'accès et l'API.
  admin: { disable: true },

  collections: [
    Utilisateurs,
    Candidats,
    Personnes,
    Candidatures,
    Pieces,
    Compteurs,
    // Éditorial — ce que l'établissement publie lui-même (§15).
    Actualites,
    Evenements,
    Offres,
  ],

  editor: lexicalEditor(),

  db: adressePostgres
    ? postgresAdapter({
        pool: { connectionString: adressePostgres },
        /**
         * Le schéma n'est PAS appliqué au démarrage.
         *
         * Payload sait aligner la base sur les collections à chaque
         * initialisation (`push`). C'est commode en développement, et c'est
         * une faute en service : le rapprochement rejoue des instructions
         * `ALTER TABLE` à chaque démarrage à froid, et il les envoie par la
         * connexion poolée — qui, en mode transaction, ne les accepte pas.
         * Résultat observé : quatre-vingts secondes d'attente, une coupure de
         * connexion, puis une erreur 500 sur une action de candidature.
         *
         * Le schéma se pose donc explicitement, par la connexion directe :
         *     DATABASE_URL="$DATABASE_URL_UNPOOLED" PAYLOAD_DB_PUSH=1 pnpm amorcer
         *
         * Poser `PAYLOAD_DB_PUSH=1` reste possible en local, sur une base de
         * travail. Jamais sur la base en service.
         */
        push: process.env.PAYLOAD_DB_PUSH === '1',
      })
    : sqliteAdapter({
        client: { url: process.env.DATABASE_URI ?? 'file:./donnees/fitc.db' },
      }),

  // §19.3 — dispositif bilingue, le français faisant référence.
  localization: {
    locales: [
      { label: 'Français', code: 'fr' },
      { label: 'English', code: 'en' },
    ],
    defaultLocale: 'fr',
    fallback: true,
  },

  /**
   * L'interface d'administration est en français, et en français seulement.
   * §21.4 prévoit des « guides d'utilisation en français » ; il serait
   * incohérent de former des agents sur une interface anglaise.
   */
  i18n: {
    supportedLanguages: { fr },
    fallbackLanguage: 'fr',
    /**
     * Quelques formulations de la traduction française sont mécaniques —
     * « Créer un(e) nouveau ou nouvelle Candidature ». Sur un dispositif que
     * des agents utiliseront tous les jours, cela se remarque. On réécrit les
     * quelques libellés les plus exposés ; le reste de la traduction convient.
     */
    translations: {
      fr: {
        general: {
          createNew: 'Ajouter',
          createNewLabel: 'Ajouter : {{label}}',
          save: 'Enregistrer',
          saving: 'Enregistrement…',
          editLabel: 'Modifier {{label}}',
        },
      },
    },
  },

  secret: exigerSecret(),

  typescript: { outputFile: path.resolve(repertoire, 'payload-types.ts') },

  sharp,

  plugins: stockageVercel
    ? [
        vercelBlobStorage({
          collections: { pieces: true },
          token: process.env.BLOB_READ_WRITE_TOKEN as string,
          /* Les pièces d'identité ne sont jamais servies par une adresse
             devinable : l'accès reste soumis au contrôle de Payload (§20.2). */
          addRandomSuffix: true,
        }),
      ]
    : stockageS3
      ? [
          s3Storage({
            collections: { pieces: true },
            bucket: process.env.S3_BUCKET as string,
            config: {
              endpoint: process.env.S3_ENDPOINT,
              region: process.env.S3_REGION ?? 'auto',
              credentials: {
                accessKeyId: process.env.S3_ACCESS_KEY_ID as string,
                secretAccessKey: process.env.S3_SECRET_ACCESS_KEY as string,
              },
            },
          }),
        ]
      : [],
});
