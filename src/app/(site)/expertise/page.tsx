import type { Metadata } from 'next';
import { IconArrowRight, IconCheck, IconShield, IconSprout, IconTeacher } from '@/components/brand/icons';
import { LeafSprig } from '@/components/brand/marks';
import { FormulaireDemande } from '@/components/formulaire-demande';
import { PageHero } from '@/components/layout/page-hero';
import { ButtonLink } from '@/components/ui/button';
import { DonneeManquante } from '@/components/ui/donnee-manquante';
import { Container, Pill, Section, SectionHeading } from '@/components/ui/primitives';
import { EXPERTISES } from '@/content/institution';

export const metadata: Metadata = {
  title: 'Expertise et formation continue',
  description:
    "Le cabinet de FOANI-ITC accompagne coopératives, organisations professionnelles et entreprises agricoles : installation d'exploitations, fertilité des sols, santé animale, nutrition, transformation et formation continue.",
  alternates: { canonical: '/expertise' },
};

export default function PageExpertise() {
  const vegetale = EXPERTISES.filter((offre) => offre.volet === 'vegetale');
  const animale = EXPERTISES.filter((offre) => offre.volet === 'animale');

  return (
    <>
      <PageHero
        eyebrow="Cabinet d’expertise"
        titre="Conseil et formation pour les professionnels"
        lead="Nous intervenons sur vos parcelles et dans vos élevages, et nous formons vos équipes. Cette offre s’adresse aux coopératives et aux entreprises, pas aux particuliers."
        fil={[{ libelle: 'Expertise et formation continue' }]}
        actions={
          <>
            <ButtonLink href="#devis" variant="gold" size="lg" trailing={<IconArrowRight />}>
              Demander un devis
            </ButtonLink>
            <ButtonLink href="#offres" variant="onDark" size="lg">
              Voir ce que nous faisons
            </ButtonLink>
          </>
        }
        aside={
          <div className="rounded-card-lg border border-paper/12 bg-paper/[0.05] p-6">
            <p className="inline-flex items-center gap-2 text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-gold-400">
              <IconShield className="h-3.5 w-3.5" />
              Agrément
            </p>
            <p className="mt-4 text-[0.9375rem] leading-relaxed text-ink-100">
              L’activité s’exerce sous agrément au titre de la formation professionnelle.
            </p>
            <p className="mt-4 border-t border-paper/10 pt-4 text-[0.8125rem] leading-relaxed text-ink-300">
              Référence de l’agrément et conditions de prise en charge : à publier dès transmission.
            </p>
          </div>
        }
      />

      {/* -------------------------------------------------------------- Offres */}
      <Section tone="paper" id="offres">
        <Container>
          <SectionHeading
            eyebrow="Domaines d’intervention"
            title="Production végétale"
            lead="De l’étude du terrain au suivi de la campagne, avec des résultats que vous pouvez mesurer."
            className="mb-12"
          />
          <ul className="grid gap-5 md:grid-cols-2">
            {vegetale.map((offre, index) => (
              <li key={offre.slug} className="reveal" style={{ ['--reveal-delay' as string]: `${index * 60}ms` }}>
                <CarteExpertise offre={offre} />
              </li>
            ))}
          </ul>

          <SectionHeading eyebrow="Domaines d’intervention" title="Production animale" className="mb-12 mt-20" />
          <ul className="grid gap-5 md:grid-cols-2">
            {animale.map((offre, index) => (
              <li key={offre.slug} className="reveal" style={{ ['--reveal-delay' as string]: `${index * 60}ms` }}>
                <CarteExpertise offre={offre} />
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      {/* -------------------------------------------------- Formation continue */}
      <Section tone="tint" id="continue">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <SectionHeading
                eyebrow="Formation continue"
                title="Former vos équipes"
                lead="Le programme est construit avec vous, à partir de vos productions et de vos objectifs."
              />
              <ul className="mt-9 flex flex-col gap-4">
                {[
                  'Diagnostic préalable des besoins de compétences.',
                  'Programme construit sur vos productions et vos contraintes.',
                  'Formation sur site ou sur le campus, selon les équipements nécessaires.',
                  'Attestation en fin de session et évaluation des acquis.',
                ].map((item) => (
                  <li key={item} className="flex gap-3">
                    <IconCheck aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-gold-600" />
                    <span className="text-[0.9375rem] leading-relaxed text-graphite-600">{item}</span>
                  </li>
                ))}
              </ul>
              <DonneeManquante
                className="mt-8"
                quoi="Références, réalisations et clients de l'activité de cabinet : à transmettre par la direction, avec l'accord des organisations concernées."
                action={null}
              />
            </div>

            <div className="flex flex-col gap-5">
              {[
                {
                  icone: IconSprout,
                  titre: 'Sur votre exploitation',
                  corps: "L'intervention se déroule là où le problème se pose, sur vos parcelles ou dans vos ateliers.",
                },
                {
                  icone: IconTeacher,
                  titre: 'Sur le campus',
                  corps:
                    'Vos équipes accèdent aux laboratoires, aux ateliers de transformation et aux parcelles de démonstration.',
                },
              ].map((mode) => {
                const Icone = mode.icone;
                return (
                  <div key={mode.titre} className="rounded-card-lg border border-graphite-100 bg-paper p-7">
                    <span className="flex h-12 w-12 items-center justify-center rounded-pill bg-ink-50">
                      <Icone className="h-5 w-5 text-ink-700" />
                    </span>
                    <p className="mt-5 font-display text-[1.125rem] text-ink-800">{mode.titre}</p>
                    <p className="mt-2 text-[0.9375rem] leading-relaxed text-graphite-500">{mode.corps}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </Container>
      </Section>

      {/* ---------------------------------------------------------------- Devis */}
      <Section tone="paper" id="devis">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,30rem)] lg:gap-16">
            <div>
              <SectionHeading
                eyebrow="Demande de devis"
                title="Demander un devis"
                lead="Décrivez votre besoin. Il est examiné et précisé avec vous avant toute proposition chiffrée."
              />
              <ol className="mt-10 flex flex-col gap-5">
                {[
                  'Vous décrivez votre besoin et votre organisation.',
                  'Un interlocuteur vous contacte pour préciser votre besoin.',
                  'Vous recevez une proposition chiffrée, avec le détail des prestations et le calendrier.',
                  "La suite se traite directement avec l’établissement, en dehors du site.",
                ].map((etape, index) => (
                  <li key={etape} className="flex gap-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-pill bg-ink-800 font-display text-[0.8125rem] text-gold-400">
                      {index + 1}
                    </span>
                    <span className="pt-1 text-[0.9375rem] leading-relaxed text-graphite-600">{etape}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="rounded-card-lg border border-graphite-100 bg-paper-tint p-7">
              <h2 className="font-display text-[1.25rem] text-ink-800">Demande de devis</h2>
              <p className="mt-3 text-[0.875rem] leading-relaxed text-graphite-500">
                Réservé aux organisations. Les particuliers cherchant une formation passent par le catalogue.
              </p>
              <FormulaireDemande type="devis" origine="expertise-devis" className="mt-6" />
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}

function CarteExpertise({ offre }: { offre: (typeof EXPERTISES)[number] }) {
  return (
    <article className="flex h-full flex-col rounded-card-lg border border-graphite-100 bg-paper-tint p-6">
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-[1.125rem] leading-snug text-ink-800">{offre.intitule}</h3>
        <Pill tone="outline">{offre.volet === 'vegetale' ? 'Végétal' : 'Animal'}</Pill>
      </div>
      <p className="mt-3 text-[0.9375rem] leading-relaxed text-graphite-500">{offre.resume}</p>
      <ul className="mt-5 flex flex-col gap-2 border-t border-graphite-200 pt-5">
        {offre.prestations.map((prestation) => (
          <li key={prestation} className="flex gap-2.5">
            <LeafSprig aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold-500" />
            <span className="text-[0.875rem] leading-snug text-graphite-600">{prestation}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}
