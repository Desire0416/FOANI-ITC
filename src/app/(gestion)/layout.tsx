import type { Metadata, Viewport } from 'next';
import { fraunces, jakarta } from '@/lib/polices';
import './gestion.css';

export const metadata: Metadata = {
  title: { default: 'Back-office', template: '%s — Back-office FOANI-ITC' },
  // §19.1 — les espaces privés ne sont jamais indexés.
  robots: { index: false, follow: false },
  icons: { icon: [{ url: '/icone.svg', type: 'image/svg+xml' }] },
};

export const viewport: Viewport = {
  themeColor: '#000a38',
  colorScheme: 'light',
};

/**
 * Racine du back-office.
 *
 * Distincte de celle du portail public : l'espace de gestion n'hérite ni de
 * l'en-tête, ni du pied de page, ni des styles du site. Seules les polices et
 * les jetons de charte sont communs — c'est ce que demande le §7.2.
 */
export default function GestionLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${fraunces.variable} ${jakarta.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
