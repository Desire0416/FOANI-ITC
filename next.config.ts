import type { NextConfig } from 'next';
import { withPayload } from '@payloadcms/next/withPayload';
import { toutesLesRedirections } from './src/content/redirections';

/**
 * Le poids des pages est une exigence fonctionnelle du CDC (§19.5) :
 * le site doit rester utilisable depuis un téléphone sur réseau dégradé.
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  /**
   * Poids maximal du corps d'une action serveur.
   *
   * Next en accepte un mega-octet par defaut. Une photographie de telephone en
   * pese trois a cinq : le depot echouait sur une page d'erreur, sans un mot
   * d'explication, au moment ou le candidat croyait avoir fini.
   *
   * Les images sont maintenant allegees dans le navigateur avant l'envoi
   * (voir components/candidat/zone-depot.tsx). Cette marge sert aux PDF, qui
   * ne se compriment pas de ce cote, et reste sous la limite de charge utile
   * des fonctions de la plateforme.
   */
  experimental: {
    serverActions: { bodySizeLimit: '6mb' },
  },

  /**
   * Le moteur de reconnaissance faciale, et ce qu'il faut emporter.
   *
   * Les trois réseaux et les binaires WebAssembly vivent dans `modeles/visage`
   * et sont lus depuis le disque à la première comparaison. Aucun n'est importé
   * statiquement : le traceur de fichiers de Next ne peut pas les découvrir
   * seul, et un déploiement les laisserait derrière — le dispositif se croirait
   * armé et ne le serait pas.
   *
   * Les binaires WebAssembly ont été copiés ici plutôt que désignés dans leur
   * paquet : sous pnpm, leur chemin passe par un dossier dont le nom porte la
   * version et le graphe des dépendances, et le tracer par un motif faisait
   * parcourir `node_modules` en entier — assez pour buter sur un lien cassé et
   * faire échouer la construction.
   */
  outputFileTracingIncludes: {
    '/mon-dossier/inscription/**': ['./modeles/visage/**'],
    '/gestion/candidatures/**': ['./modeles/visage/**'],
  },

  /* Ces paquets chargent leurs poids et leurs binaires à l'exécution : les
     empaqueter casserait ces résolutions. */
  serverExternalPackages: [
    '@tensorflow/tfjs',
    '@tensorflow/tfjs-backend-wasm',
    '@vladmandic/face-api',
    'sharp',
  ],

  images: {
    formats: ['image/avif', 'image/webp'],
    // Tailles alignées sur les largeurs réellement rendues (mobile-first 360 px).
    deviceSizes: [360, 420, 640, 750, 828, 1080, 1200, 1600, 1920],
    imageSizes: [64, 96, 128, 192, 256, 384],
  },

  /**
   * Plan de redirections — §19.1.
   * Le contenu du plan vit dans `src/content/redirections.ts`, avec le mode
   * d'emploi pour le compléter : une adresse ajoutée là devient active à la
   * construction suivante, sans toucher à cette configuration.
   */
  redirects: async () => toutesLesRedirections(),

  /**
   * En-têtes de sécurité — §20.1.
   * Ils s'appliquent à tout le dispositif, espaces privés compris.
   */
  headers: async () => [
    {
      source: '/:chemin*',
      headers: [
        // Le site n'a pas vocation à être encadré par un tiers.
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        // Aucune de ces capacités n'est utilisée par le portail.
        {
          key: 'Permissions-Policy',
          value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
        },
      ],
    },
    {
      // Un dossier de candidature ne se met jamais en cache partagé.
      source: '/mon-dossier/:chemin*',
      headers: [{ key: 'Cache-Control', value: 'private, no-store' }],
    },
    {
      source: '/gestion/:chemin*',
      headers: [{ key: 'Cache-Control', value: 'private, no-store' }],
    },
  ],
};

/**
 * `withPayload` externalise les modules serveur du socle — pilote de base de
 * données, outillage de migration — que le bundler ne doit pas embarquer.
 */
export default withPayload(nextConfig, { devBundleServerPackages: false });
