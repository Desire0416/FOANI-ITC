import type { Metadata } from 'next';
import { Suspense } from 'react';
import { PageHero } from '@/components/layout/page-hero';
import { RechercheGlobale } from '@/components/recherche-globale';
import { Container, Section } from '@/components/ui/primitives';
import { construireIndex } from '@/lib/index-recherche';

export const metadata: Metadata = {
  title: 'Recherche',
  description: 'Rechercher une formation, une page, une actualité, un événement ou une ressource agricole.',
  alternates: { canonical: '/recherche' },
  // §19.1 — une page de résultats n'a pas vocation à être indexée.
  robots: { index: false, follow: true },
};

export default async function PageRecherche() {
  const index = await construireIndex();

  return (
    <>
      <PageHero
        eyebrow="Recherche"
        titre="Rechercher"
        lead="Tapez un métier, une production, un diplôme ou un sujet. La recherche parcourt tout le site."
        fil={[{ libelle: 'Recherche' }]}
        tone="tint"
      />

      <Section tone="paper">
        <Container>
          <Suspense fallback={<p className="text-graphite-500">Chargement de la recherche…</p>}>
            <RechercheGlobale index={index} />
          </Suspense>
        </Container>
      </Section>
    </>
  );
}
