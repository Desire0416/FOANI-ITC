import type { MetadataRoute } from 'next';

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.foani-itc.ci';

/**
 * §19.1 — consignes d'indexation explicites pour les espaces publics et privés.
 * Les espaces authentifiés ne sont pas servis par cette application, mais la
 * consigne est posée d'emblée : le jour où ils partagent le domaine, rien à
 * reprendre.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/recherche', '/api/', '/espace-etudiant/', '/admin/'],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}
