import type { MetadataRoute } from 'next';
import { FORMATIONS } from '@/content/formations';
import { actualitesPubliees } from '@/lib/contenus-publies';
import { RESSOURCES } from '@/content/ressources';
import { RECHERCHE_ACTIVE } from '@/content/site';

/**
 * Plan du site généré automatiquement — §19.1.
 * Il se construit à partir des mêmes sources que les pages : une formation
 * ajoutée au catalogue y entre sans intervention, et une rubrique non publiée
 * — Recherche & Innovation tant que ses contenus n'existent pas — n'y figure
 * jamais.
 */
const BASE = process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.foani-itc.ci';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const maintenant = new Date();
  const actualites = await actualitesPubliees(200);

  const pages: readonly { readonly chemin: string; readonly priorite: number }[] = [
    { chemin: '/', priorite: 1 },
    { chemin: '/formations', priorite: 0.9 },
    { chemin: '/admissions', priorite: 0.9 },
    { chemin: '/candidature', priorite: 0.9 },
    { chemin: '/universite', priorite: 0.8 },
    { chemin: '/universite/equipe', priorite: 0.6 },
    { chemin: '/campus', priorite: 0.7 },
    { chemin: '/carrieres', priorite: 0.7 },
    { chemin: '/expertise', priorite: 0.7 },
    { chemin: '/ressources', priorite: 0.8 },
    { chemin: '/actualites', priorite: 0.6 },
    { chemin: '/evenements', priorite: 0.6 },
    { chemin: '/international', priorite: 0.5 },
    { chemin: '/presse', priorite: 0.5 },
    { chemin: '/contact', priorite: 0.7 },
    { chemin: '/espace-numerique', priorite: 0.5 },
    { chemin: '/verifier', priorite: 0.4 },
    { chemin: '/plan-du-site', priorite: 0.3 },
    { chemin: '/mentions-legales', priorite: 0.2 },
    { chemin: '/confidentialite', priorite: 0.2 },
    { chemin: '/traceurs', priorite: 0.2 },
    { chemin: '/accessibilite', priorite: 0.2 },
    ...(RECHERCHE_ACTIVE ? [{ chemin: '/recherche-innovation', priorite: 0.7 }] : []),
  ];

  return [
    ...pages.map((page) => ({
      url: `${BASE}${page.chemin}`,
      lastModified: maintenant,
      changeFrequency: 'monthly' as const,
      priority: page.priorite,
    })),
    ...FORMATIONS.map((formation) => ({
      url: `${BASE}/formations/${formation.slug}`,
      lastModified: maintenant,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    ...RESSOURCES.map((ressource) => ({
      url: `${BASE}/ressources/${ressource.slug}`,
      lastModified: new Date(ressource.miseAJour),
      changeFrequency: 'yearly' as const,
      priority: 0.7,
    })),
    ...actualites.map((actualite) => ({
      url: `${BASE}/actualites/${actualite.slug}`,
      lastModified: new Date(actualite.date),
      changeFrequency: 'yearly' as const,
      priority: 0.5,
    })),
  ];
}
