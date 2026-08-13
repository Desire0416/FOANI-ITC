import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Catalogue, type EntreeCatalogue } from '@/components/catalogue';
import { Comparateur, type EntreeComparaison } from '@/components/comparateur';
import { FormationCard } from '@/components/formation-card';
import { PageHero } from '@/components/layout/page-hero';
import { TrouverFormation, type IndexFormation } from '@/components/sections/trouver-formation';
import { ButtonLink } from '@/components/ui/button';
import { Container, Pill, Section, SectionHeading } from '@/components/ui/primitives';
import { IconArrowRight } from '@/components/brand/icons';
import {
  CYCLE_DESCRIPTIONS,
  CYCLE_LABELS,
  FORMATIONS,
  MODALITE_LABELS,
  dureeLisible,
  formationsParCycle,
  titreComplet,
} from '@/content/formations';
import type { Cycle } from '@/content/types';

export const metadata: Metadata = {
  title: 'Formations',
  description:
    "Le catalogue complet de FOANI-ITC : BTS et Licence en agriculture tropicale, agroalimentaire, agribusiness et technologie, certificats techniques en production animale et végétale, masterclass transversales.",
  alternates: { canonical: '/formations' },
};

const ORDRE: readonly Cycle[] = ['bts', 'licence', 'certificat', 'masterclass'];

export default function PageFormations() {
  const entreesCatalogue: readonly EntreeCatalogue[] = FORMATIONS.map((formation) => ({
    slug: formation.slug,
    titre: titreComplet(formation),
    resume: formation.resume,
    cycle: formation.cycle,
    domaines: formation.domaines,
    // La carte est rendue ici, côté serveur, puis transmise au filtre client.
    carte: <FormationCard formation={formation} />,
  }));

  const entreesComparaison: readonly EntreeComparaison[] = FORMATIONS.map((formation) => ({
    slug: formation.slug,
    titre: titreComplet(formation),
    cycle: CYCLE_LABELS[formation.cycle],
    diplome: formation.diplome,
    duree: dureeLisible(formation),
    niveauRequis: formation.niveauRequis,
    modalite: MODALITE_LABELS[formation.modalite],
    frais: formation.fraisXof === null ? null : `${formation.fraisXof} FCFA`,
    debouches: formation.debouches,
    poursuites: formation.poursuites,
  }));

  const index: readonly IndexFormation[] = FORMATIONS.map((formation) => ({
    slug: formation.slug,
    titre: titreComplet(formation),
    cycle: formation.cycle,
    domaines: formation.domaines,
  }));

  return (
    <>
      <PageHero
        eyebrow="Notre offre"
        titre="Nos formations"
        lead="Des diplômes en 2 ou 3 ans après le bac, et des formations courtes ouvertes à tous. Filtrez par type ou par domaine pour trouver la vôtre."
        fil={[{ libelle: 'Formations' }]}
        actions={
          <>
            <ButtonLink href="#catalogue" variant="gold" size="lg" trailing={<IconArrowRight />}>
              Voir la liste
            </ButtonLink>
            <ButtonLink href="#trouver" variant="onDark" size="lg">
              Trouver ma formation
            </ButtonLink>
          </>
        }
        aside={
          <ul className="flex flex-col gap-3">
            {ORDRE.map((cycle) => {
              const nombre = formationsParCycle(cycle).length;
              return (
                <li
                  key={cycle}
                  className="flex items-baseline justify-between gap-4 border-b border-paper/10 pb-3 last:border-0"
                >
                  <span className="text-[0.9375rem] font-semibold text-paper">{CYCLE_LABELS[cycle]}</span>
                  <span className="font-display text-[1.5rem] leading-none text-gold-400 tabular-nums">
                    {nombre}
                  </span>
                </li>
              );
            })}
          </ul>
        }
      />

      {/* --------------------------------------------------- Les quatre lignes */}
      <Section tone="paper" className="py-14 lg:py-16">
        <Container>
          <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {ORDRE.map((cycle, index2) => (
              <li
                key={cycle}
                className="reveal rounded-card-lg border border-graphite-100 bg-paper-tint p-6"
                style={{ ['--reveal-delay' as string]: `${index2 * 70}ms` }}
              >
                <Pill tone="neutral">{CYCLE_LABELS[cycle]}</Pill>
                <p className="mt-4 text-[0.9375rem] leading-relaxed text-graphite-600">
                  {CYCLE_DESCRIPTIONS[cycle]}
                </p>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      {/* ------------------------------------------------------------ Catalogue */}
      <Section tone="tint" className="pt-0 lg:pt-0">
        <Container>
          <SectionHeading
            eyebrow="Catalogue"
            title="Toutes nos formations"
            lead="Filtrez par type et par domaine, ou tapez directement une production, un métier ou un diplôme."
            className="mb-10"
          />
          <Suspense
            fallback={
              <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {FORMATIONS.slice(0, 6).map((formation) => (
                  <li key={formation.slug}>
                    <FormationCard formation={formation} />
                  </li>
                ))}
              </ul>
            }
          >
            <Catalogue entrees={entreesCatalogue} />
          </Suspense>
        </Container>
      </Section>

      {/* ---------------------------------------------------------- Comparateur */}
      <Section tone="paper">
        <Container>
          <SectionHeading
            eyebrow="Comparer"
            title="Comparer deux formations"
            lead="Durée, niveau demandé, diplôme, coût, métiers possibles : tout est mis côte à côte pour vous aider à choisir."
            className="mb-10"
          />
          <Comparateur entrees={entreesComparaison} />
        </Container>
      </Section>

      {/* ----------------------------------------------------------- Orientation */}
      <TrouverFormation index={index} />
    </>
  );
}
