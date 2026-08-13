import type { Metadata } from 'next';
import { IconArrowRight, IconUsers } from '@/components/brand/icons';
import { LaurelWreath } from '@/components/brand/marks';
import { PageHero } from '@/components/layout/page-hero';
import { ButtonLink } from '@/components/ui/button';
import { DonneeManquante } from '@/components/ui/donnee-manquante';
import { Container, Pill, Section, SectionHeading } from '@/components/ui/primitives';
import { EQUIPE } from '@/content/institution';

export const metadata: Metadata = {
  title: 'Équipe et annuaire',
  description:
    "Annuaire public des enseignants, experts et responsables académiques de FOANI-ITC : fonction, discipline et domaines d'expertise.",
  alternates: { canonical: '/universite/equipe' },
};

export default function PageEquipe() {
  const aFournir = EQUIPE.filter((membre) => membre.nom === null).length;

  return (
    <>
      <PageHero
        eyebrow="L’Université"
        titre="Nos enseignants"
        lead="Qui enseigne quoi, et à qui vous adresser selon votre question."
        fil={[{ libelle: 'L’Université', href: '/universite' }, { libelle: 'Équipe et annuaire' }]}
        tone="tint"
      />

      <Section tone="paper">
        <Container>
          {aFournir > 0 ? (
            <DonneeManquante
              className="mb-12"
              quoi={`${aFournir} fiches sont structurées et attendent leurs contenus : noms, biographies et portraits, à transmettre par la direction des études. Les postes ci-dessous correspondent à l'organisation de l'établissement.`}
              action={null}
            />
          ) : null}

          <SectionHeading
            eyebrow="Annuaire"
            title="À qui s’adresser"
            lead="Un responsable par domaine, et un interlocuteur à chaque étape de votre parcours."
            className="mb-12"
          />

          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {EQUIPE.map((membre, index) => (
              <li
                key={membre.slug}
                className="reveal"
                style={{ ['--reveal-delay' as string]: `${index * 60}ms` }}
              >
                <article className="relative flex h-full flex-col overflow-hidden rounded-card-lg border border-graphite-100 bg-paper-tint p-6">
                  <LaurelWreath
                    className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 text-ink-700/[0.05]"
                    leaves={9}
                  />
                  <span className="relative flex h-14 w-14 items-center justify-center rounded-pill border border-graphite-200 bg-paper">
                    <IconUsers className="h-6 w-6 text-ink-700" />
                  </span>

                  <h2 className="relative mt-5 font-display text-[1.125rem] leading-snug text-ink-800">
                    {membre.nom ?? membre.fonction}
                  </h2>
                  {membre.nom ? (
                    <p className="relative mt-1 text-[0.875rem] text-graphite-500">{membre.fonction}</p>
                  ) : null}

                  <p className="relative mt-3 text-[0.8125rem] uppercase tracking-[0.1em] text-gold-700">
                    {membre.discipline}
                  </p>

                  <ul className="relative mt-4 flex flex-wrap gap-1.5">
                    {membre.expertises.map((expertise) => (
                      <li key={expertise}>
                        <Pill tone="outline">{expertise}</Pill>
                      </li>
                    ))}
                  </ul>

                  {membre.biographie ? (
                    <p className="relative mt-4 flex-1 text-[0.875rem] leading-relaxed text-graphite-500">
                      {membre.biographie}
                    </p>
                  ) : (
                    <p className="relative mt-4 flex-1 text-[0.8125rem] italic leading-relaxed text-graphite-500">
                      Biographie et portrait à publier.
                    </p>
                  )}
                </article>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <Section tone="tint" className="py-16 lg:py-20">
        <Container>
          <div className="reveal rounded-card-lg border border-graphite-100 bg-paper px-6 py-14 text-center sm:px-12">
            <div className="mx-auto max-w-3xl">
          <SectionHeading
            eyebrow="Enseigner à FOANI-ITC"
            title="Vous souhaitez enseigner à FOANI-ITC&nbsp;?"
            lead="Nous faisons intervenir des professionnels en activité aux côtés de nos enseignants."
            align="center"
            className="mb-9"
          />
          <div className="flex flex-wrap justify-center gap-3">
            <ButtonLink href="/contact?sujet=intervenant" variant="ink" size="lg" trailing={<IconArrowRight />}>
              Proposer une intervention
            </ButtonLink>
            <ButtonLink href="/expertise" variant="outline" size="lg">
              Découvrir le cabinet
            </ButtonLink>
          </div>
          </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
