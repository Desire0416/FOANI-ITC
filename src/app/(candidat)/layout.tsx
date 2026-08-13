import type { Metadata, Viewport } from 'next';
import { fraunces, jakarta } from '@/lib/polices';
import './candidat.css';

export const metadata: Metadata = {
  title: { default: 'Mon dossier', template: '%s — Candidature FOANI-ITC' },
  // §19.1 — un dossier de candidature n'est jamais indexé.
  robots: { index: false, follow: false },
  icons: { icon: [{ url: '/icone.svg', type: 'image/svg+xml' }] },
};

export const viewport: Viewport = {
  themeColor: '#000a38',
  colorScheme: 'light',
};

/**
 * Racine du portail de candidature.
 *
 * Distincte de celle du site public : le candidat qui remplit son dossier n'a
 * pas besoin du menu de l'établissement sous les yeux, et chaque élément
 * d'interface en moins est du réseau en moins sur un téléphone en 3G (§18.2).
 * Seules les polices et les jetons de charte sont communs (§7.2).
 */
export default function CandidatLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${fraunces.variable} ${jakarta.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
