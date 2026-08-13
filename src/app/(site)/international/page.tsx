import type { Metadata } from 'next';
import { IconArrowRight, IconGlobe, IconHandshake, IconUsers } from '@/components/brand/icons';
import { FormulaireDemande } from '@/components/formulaire-demande';
import { PageHero } from '@/components/layout/page-hero';
import { DonneeManquante } from '@/components/ui/donnee-manquante';
import { Container, Section, SectionHeading } from '@/components/ui/primitives';

export const metadata: Metadata = {
  title: 'International et partenariats',
  description:
    "Accords académiques, mobilité, projets conjoints et parcours « devenir partenaire » de FOANI International Training College.",
  alternates: { canonical: '/international' },
};

const VOLETS = [
  {
    icone: IconGlobe,
    titre: 'Accords académiques',
    corps:
      "Coopérations avec des établissements d'enseignement supérieur, reconnaissance de parcours et co-construction de programmes.",
  },
  {
    icone: IconUsers,
    titre: 'Mobilité et étudiants internationaux',
    corps:
      "Accueil d'étudiants de la sous-région, conditions d'admission et accompagnement à l'installation sur le campus.",
  },
  {
    icone: IconHandshake,
    titre: 'Projets et partenariats techniques',
    corps:
      "Programmes de développement agricole, projets de recherche appliquée et partenariats avec les filières professionnelles.",
  },
] as const;

export default function PageInternational() {
  return (
    <>
      <PageHero
        eyebrow="International"
        titre="Nos partenaires"
        lead="Accords avec d’autres écoles, accueil d’étudiants de la sous-région et projets menés avec les filières."
        fil={[{ libelle: 'International et partenariats' }]}
      />

      <Section tone="paper">
        <Container>
          <SectionHeading eyebrow="Trois volets" title="Trois façons de travailler ensemble" className="mb-14" />
          <ul className="grid gap-5 md:grid-cols-3">
            {VOLETS.map((volet, index) => {
              const Icone = volet.icone;
              return (
                <li
                  key={volet.titre}
                  className="reveal flex h-full flex-col rounded-card-lg border border-graphite-100 bg-paper-tint p-7"
                  style={{ ['--reveal-delay' as string]: `${index * 70}ms` }}
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-pill bg-ink-800">
                    <Icone className="h-5 w-5 text-gold-400" />
                  </span>
                  <h2 className="mt-6 text-[1.25rem] leading-snug text-ink-800">{volet.titre}</h2>
                  <p className="mt-3 flex-1 text-[0.9375rem] leading-relaxed text-graphite-500">{volet.corps}</p>
                </li>
              );
            })}
          </ul>

          <DonneeManquante
            className="mt-10"
            quoi="Liste des accords signés, établissements partenaires et projets en cours : à publier dès transmission par la direction. Aucun partenariat n'est affiché tant qu'il n'est pas formalisé."
            action={null}
          />
        </Container>
      </Section>

      <Section tone="tint" id="partenaires">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,30rem)] lg:gap-16">
            <div>
              <SectionHeading
                eyebrow="Devenir partenaire"
                title="Vous souhaitez travailler avec nous&nbsp;?"
                lead="Décrivez-nous votre projet. La direction examine chaque demande de partenariat."
              />
            </div>
            <div className="rounded-card-lg border border-graphite-100 bg-paper p-7">
              <h2 className="font-display text-[1.25rem] text-ink-800">Proposition de partenariat</h2>
              <FormulaireDemande type="devis" origine="international-partenariat" className="mt-6" />
            </div>
          </div>
        </Container>
      </Section>

      <Section tone="paper" className="py-16 lg:py-20">
        <Container>
          <div className="reveal rounded-card-lg border border-graphite-100 bg-paper px-6 py-14 text-center sm:px-12">
            <div className="mx-auto max-w-3xl">
          <SectionHeading
            eyebrow="Version anglaise"
            title="Une version anglaise est prévue"
            lead="Elle couvrira les pages de présentation, les fiches des formations diplômantes et les informations d’admission. Elle sera publiée dès que l’établissement aura fourni les traductions."
            align="center"
            className="mb-8"
          />
          <p className="inline-flex items-center gap-2 rounded-pill border border-graphite-200 px-5 py-2.5 text-[0.875rem] text-graphite-500">
            <IconArrowRight className="h-4 w-4 text-gold-600" />
            Traductions en attente de fourniture
          </p>
          </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
