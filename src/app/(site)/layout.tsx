import type { Metadata, Viewport } from 'next';
import { Header } from '@/components/layout/header';
import { MesureAudience } from '@/components/mesure-audience';
import { Footer } from '@/components/layout/footer';
import { RevealProvider } from '@/components/motion/reveal-provider';
import { fraunces, jakarta } from '@/lib/polices';
import { REVEAL_SCRIPT } from '@/lib/reveal-script';
import { lireConfiguration } from '@/lib/audience';
import { ETABLISSEMENT } from '@/content/site';
import { PHOTOS } from '@/content/photos';
import './globals.css';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.foani-itc.ci';

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: `${ETABLISSEMENT.nom} — ${ETABLISSEMENT.positionnement}`,
    // §19.1 — un titre propre à chaque page, jamais dupliqué.
    template: `%s — ${ETABLISSEMENT.sigle}`,
  },
  description:
    "Première université ivoirienne intégralement dédiée à l'agriculture. BTS, Licence, certificats et masterclass en production animale, production végétale, agroalimentaire et agribusiness, à Agnibilékrou.",
  applicationName: ETABLISSEMENT.nom,
  authors: [{ name: ETABLISSEMENT.nom }],
  keywords: [
    'université agricole Côte d’Ivoire',
    'BTS agriculture tropicale',
    'licence agronomie Côte d’Ivoire',
    'formation agricole Agnibilékrou',
    'certificat aviculture',
    'FOANI ITC',
  ],
  openGraph: {
    type: 'website',
    locale: 'fr_CI',
    siteName: ETABLISSEMENT.nom,
    url: APP_URL,
    /* Un lien partagé sur WhatsApp sans vignette est un lien qu'on n'ouvre
       pas. C'est la cour du campus qui la fournit — une photographie de
       l'établissement, pas un logo posé sur un aplat. */
    images: [
      {
        url: PHOTOS.campusCour.src,
        width: PHOTOS.campusCour.largeur,
        height: PHOTOS.campusCour.hauteur,
        alt: PHOTOS.campusCour.alt,
      },
    ],
  },
  robots: { index: true, follow: true },
  alternates: { canonical: '/' },
  icons: {
    icon: [{ url: '/icone.svg', type: 'image/svg+xml' }],
    apple: '/brand/logo-vertical.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#00168e',
  colorScheme: 'light',
};

/** Données structurées d'établissement — §19.1. */
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollegeOrUniversity',
  name: ETABLISSEMENT.nom,
  alternateName: ETABLISSEMENT.sigle,
  slogan: ETABLISSEMENT.baseline,
  url: APP_URL,
  logo: `${APP_URL}/brand/logo-vertical.png`,
  address: {
    '@type': 'PostalAddress',
    addressLocality: ETABLISSEMENT.ville,
    addressCountry: 'CI',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // La configuration est lue sur le serveur : sans outil renseigné, rien n'est
  // envoyé au navigateur et aucun domaine tiers n'est appelé (§20.2).
  const audience = lireConfiguration();

  return (
    // `suppressHydrationWarning` : l'amorce ci-dessous pose `data-motion` sur
    // cet élément avant l'hydratation. C'est voulu, et c'est le seul attribut
    // concerné.
    <html lang="fr" className={`${fraunces.variable} ${jakarta.variable}`} suppressHydrationWarning>
      <head>
        {/* Avant la peinture : arme le mouvement, ou le laisse désarmé si le
            navigateur ne peut pas suivre. Voir src/lib/reveal-script.ts. */}
        <script dangerouslySetInnerHTML={{ __html: REVEAL_SCRIPT }} />
      </head>
      <body className="antialiased">
        <a
          href="#contenu"
          className="skip-link rounded-pill bg-ink-800 px-5 py-3 text-sm font-semibold text-paper shadow-lift"
        >
          Aller au contenu principal
        </a>
        <RevealProvider />
        <Header />
        <main id="contenu">{children}</main>
        <Footer />
        <MesureAudience configuration={audience} />
        <script
          type="application/ld+json"
          // Données statiques et maîtrisées : aucune entrée utilisateur n'y transite.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
