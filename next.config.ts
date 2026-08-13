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
