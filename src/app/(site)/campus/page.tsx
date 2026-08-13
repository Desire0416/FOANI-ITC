import type { Metadata } from 'next';
import { IconArrowRight, IconCheck } from '@/components/brand/icons';
import { LeafSprig } from '@/components/brand/marks';
import { PageHero } from '@/components/layout/page-hero';
import { ButtonLink } from '@/components/ui/button';
import { DonneeManquante } from '@/components/ui/donnee-manquante';
import { MediaPlaceholder } from '@/components/ui/media-placeholder';
import { Container, Pill, Section, SectionHeading } from '@/components/ui/primitives';
import { CAMPUS_RUBRIQUES, ENGAGEMENTS } from '@/content/institution';
import { ETABLISSEMENT } from '@/content/site';

export const metadata: Metadata = {
  title: 'Vie du campus',
  description:
    "Étudier à FOANI-ITC : hébergement, restauration, encadrement, vie associative, infrastructures, parcelles et unités de production sur le campus d'Agnibilékrou.",
  alternates: { canonical: '/campus' },
};

export default function PageCampus() {
  const aFournir = CAMPUS_RUBRIQUES.filter((rubrique) => rubrique.statut === 'a-fournir').length;

  return (
    <>
      <PageHero
        eyebrow="Vie du campus"
        titre={`Étudier à ${ETABLISSEMENT.ville}, au milieu des exploitations.`}
        lead="Ici, les parcelles et les ateliers font partie des cours. Voici les installations, les exploitations, l’encadrement et la vie étudiante."
        fil={[{ libelle: 'Vie du campus' }]}
        actions={
          <ButtonLink href="/contact?sujet=visite" variant="gold" size="lg" trailing={<IconArrowRight />}>
            Demander une visite
          </ButtonLink>
        }
      />

      {/* --------------------------------------------------------------- Galerie */}
      <Section tone="paper" id="galerie" className="py-14 lg:py-16">
        <Container>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MediaPlaceholder
              sujet="Vue d’ensemble du campus"
              ratio="aspect-[4/3]"
              className="reveal sm:col-span-2 sm:aspect-[16/9]"
            />
            <MediaPlaceholder sujet="Salles de cours" ratio="aspect-[4/3]" className="reveal" />
            <MediaPlaceholder sujet="Laboratoire d’analyse" ratio="aspect-[4/3]" className="reveal" />
            <MediaPlaceholder sujet="Ateliers d’élevage" ratio="aspect-[4/3]" className="reveal" />
            <MediaPlaceholder sujet="Parcelles de production" ratio="aspect-[4/3]" className="reveal" />
            <MediaPlaceholder
              sujet="Vie étudiante"
              ratio="aspect-[4/3]"
              className="reveal sm:col-span-2 sm:aspect-[16/9]"
            />
          </div>
          <DonneeManquante
            className="mt-8"
            quoi="Corpus photographique et vidéo du campus : à produire par l'établissement. Aucun visuel provenant d'un autre établissement n'est utilisé ici."
            action={null}
          />
        </Container>
      </Section>

      {/* ------------------------------------------------------------- Rubriques */}
      <Section tone="tint">
        <Container>
          <SectionHeading
            eyebrow="La vie ici"
            title="Une année sur le campus"
            lead={
              aFournir > 0
                ? `${aFournir} des rubriques ci-dessous attendent leur contenu définitif. Elles sont structurées et prêtes à recevoir la description de l'établissement.`
                : undefined
            }
            className="mb-14"
          />

          <div className="flex flex-col gap-5">
            {CAMPUS_RUBRIQUES.map((rubrique, index) => (
              <section
                key={rubrique.id}
                id={rubrique.id}
                className="reveal grid gap-6 rounded-card-lg border border-graphite-100 bg-paper p-7 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] lg:gap-10"
                style={{ ['--reveal-delay' as string]: `${index * 60}ms` }}
              >
                <div>
                  <LeafSprig aria-hidden="true" className="h-5 w-5 text-gold-500" />
                  <h2 className="mt-4 text-[1.375rem] leading-snug text-ink-800">{rubrique.titre}</h2>
                  {rubrique.statut === 'a-fournir' ? (
                    <p className="mt-3">
                      <Pill tone="outline">Contenu à compléter</Pill>
                    </p>
                  ) : null}
                </div>
                <p className="text-[1rem] leading-relaxed text-graphite-600">{rubrique.corps}</p>
              </section>
            ))}
          </div>
        </Container>
      </Section>

      {/* ----------------------------------------------------------- Engagements */}
      <Section tone="ink" id="engagements">
        <Container>
          <SectionHeading
            eyebrow="Nos engagements"
            title="Ce à quoi nous nous engageons"
            tone="light"
            lead="Trois engagements que vous êtes en droit de nous rappeler."
            className="mb-14"
          />
          <ul className="grid gap-5 md:grid-cols-3">
            {ENGAGEMENTS.map((engagement, index) => (
              <li
                key={engagement.titre}
                className="reveal rounded-card-lg border border-paper/12 bg-paper/[0.04] p-7"
                style={{ ['--reveal-delay' as string]: `${index * 70}ms` }}
              >
                <IconCheck aria-hidden="true" className="h-6 w-6 text-gold-400" />
                <h3 className="mt-5 font-display text-[1.25rem] leading-snug text-paper">{engagement.titre}</h3>
                <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-200">{engagement.corps}</p>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      {/* ------------------------------------------------------------- Renvoi */}
      <Section tone="paper" className="py-16 lg:py-20">
        <Container>
          <div className="reveal flex flex-col items-start gap-6 rounded-card-lg border border-graphite-100 bg-paper-tint p-8 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-[1.5rem] leading-snug text-ink-800">
                Vous souhaitez visiter avant de vous inscrire&nbsp;?
              </h2>
              <p className="mt-2 max-w-lg text-[0.9375rem] leading-relaxed text-graphite-500">
                Les visites se font sur rendez-vous. Dites-nous quand vous êtes disponible.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <ButtonLink href="/contact?sujet=visite" variant="ink" size="md" trailing={<IconArrowRight />}>
                Organiser une visite
              </ButtonLink>
              <ButtonLink href="/evenements" variant="outline" size="md">
                Voir les événements
              </ButtonLink>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
