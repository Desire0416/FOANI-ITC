import type { Metadata } from 'next';
import Link from 'next/link';
import { IconArrowRight, IconBriefcase, IconHandshake, IconIdea, IconPin, IconUsers } from '@/components/brand/icons';
import { LeafSprig } from '@/components/brand/marks';
import { FormulaireDemande } from '@/components/formulaire-demande';
import { PageHero } from '@/components/layout/page-hero';
import { ButtonLink } from '@/components/ui/button';
import { DonneeManquante } from '@/components/ui/donnee-manquante';
import { MediaPlaceholder } from '@/components/ui/media-placeholder';
import { Container, Pill, Section, SectionHeading } from '@/components/ui/primitives';
import { offresOuvertes } from '@/lib/contenus-publies';
import { LIBELLE_TYPE_OFFRE } from '@/lib/publications';
import { formatDate } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Entrepreneuriat & Carrières',
  description:
    "Centre carrières de FOANI-ITC : stages, offres d'emploi, incubation des projets étudiants, réseau des anciens, et parcours dédié aux entreprises qui recrutent ou proposent un stage.",
  alternates: { canonical: '/carrieres' },
};

const SERVICES = [
  {
    icone: IconBriefcase,
    titre: 'Centre carrières',
    corps:
      "Recherche de stage, préparation à l'entretien, rédaction de candidature et accompagnement à l'insertion. Chaque étudiant construit son projet dès la première année.",
    id: 'centre',
  },
  {
    icone: IconIdea,
    titre: 'Entrepreneuriat et incubation',
    corps:
      "Accompagnement des projets étudiants : modèle économique, plan d'affaires, recherche de financement et suivi d'activité après l'installation.",
    id: 'incubation',
  },
  {
    icone: IconUsers,
    titre: 'Réseau des anciens',
    corps:
      "Ce que sont devenus nos anciens étudiants, et où ils travaillent aujourd'hui.",
    id: 'alumni',
  },
] as const;

export default async function PageCarrieres() {
  const offres = await offresOuvertes();

  return (
    <>
      <PageHero
        eyebrow="Entrepreneuriat & Carrières"
        titre="Après la formation"
        lead="Nous vous accompagnons dans votre recherche de stage et dans votre entrée dans la vie active. Et si vous voulez créer votre activité, la formation vous y prépare."
        fil={[{ libelle: 'Entrepreneuriat & Carrières' }]}
        actions={
          <>
            <ButtonLink href="#recruter" variant="gold" size="lg" trailing={<IconArrowRight />}>
              Recruter un étudiant
            </ButtonLink>
            <ButtonLink href="#offres" variant="onDark" size="lg">
              Voir les offres
            </ButtonLink>
          </>
        }
      />

      {/* -------------------------------------------------------------- Services */}
      <Section tone="paper">
        <Container>
          <SectionHeading
            eyebrow="Pour les étudiants"
            title="Ce que nous mettons à votre disposition"
            className="mb-14"
          />
          <ul className="grid gap-5 md:grid-cols-3">
            {SERVICES.map((service, index) => {
              const Icone = service.icone;
              return (
                <li
                  key={service.id}
                  id={service.id}
                  className="reveal flex h-full flex-col rounded-card-lg border border-graphite-100 bg-paper-tint p-7"
                  style={{ ['--reveal-delay' as string]: `${index * 70}ms` }}
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-pill bg-ink-800">
                    <Icone className="h-5 w-5 text-gold-400" />
                  </span>
                  <h2 className="mt-6 text-[1.25rem] leading-snug text-ink-800">{service.titre}</h2>
                  <p className="mt-3 flex-1 text-[0.9375rem] leading-relaxed text-graphite-500">{service.corps}</p>
                </li>
              );
            })}
          </ul>
        </Container>
      </Section>

      {/* ---------------------------------------------------------------- Offres */}
      <Section tone="tint" id="offres">
        <Container>
          <SectionHeading
            eyebrow="Offres de stage et d’emploi"
            title="Les offres du moment"
            lead="Chaque offre indique sa date limite. Une offre terminée disparaît de la liste."
            className="mb-12"
          />

          {offres.length === 0 ? (
            <div className="rounded-card-lg border border-dashed border-graphite-200 bg-paper px-6 py-16 text-center">
              <LeafSprig aria-hidden="true" className="mx-auto h-8 w-8 text-gold-400" />
              <p className="mt-5 font-display text-[1.375rem] text-ink-800">Aucune offre en ce moment.</p>
              <p className="mx-auto mt-3 max-w-lg text-[0.9375rem] leading-relaxed text-graphite-500">
                Revenez d’ici quelques jours. Les entreprises souhaitant proposer un stage ou un poste
                peuvent nous le signaler dès maintenant.
              </p>
              <ButtonLink href="#recruter" variant="ink" size="md" className="mt-7" trailing={<IconArrowRight />}>
                Proposer une offre
              </ButtonLink>
            </div>
          ) : (
            <ul className="grid gap-5 md:grid-cols-2">
              {offres.map((offre, index) => (
                <li
                  key={offre.slug}
                  className="reveal flex h-full flex-col rounded-card-lg border border-graphite-100 bg-paper p-7"
                  style={{ ['--reveal-delay' as string]: `${index * 60}ms` }}
                >
                  <div className="flex flex-wrap items-center gap-2.5">
                    <Pill tone="neutral">{LIBELLE_TYPE_OFFRE[offre.type] ?? offre.type}</Pill>
                    <span className="text-[0.8125rem] text-graphite-500">
                      Jusqu’au {formatDate(offre.dateLimite)}
                    </span>
                  </div>

                  <h3 className="mt-4 text-[1.25rem] leading-snug text-ink-800">{offre.intitule}</h3>
                  <p className="mt-1.5 text-[0.9375rem] font-semibold text-ink-700">{offre.structure}</p>
                  <p className="mt-1 flex items-center gap-2 text-[0.875rem] text-graphite-500">
                    <IconPin aria-hidden="true" className="h-4 w-4 text-gold-600" />
                    {offre.lieu}
                  </p>

                  <div className="mt-4 flex flex-1 flex-col gap-3">
                    {offre.description.map((paragraphe) => (
                      <p
                        key={paragraphe.slice(0, 40)}
                        className="text-[0.9375rem] leading-relaxed text-graphite-600"
                      >
                        {paragraphe}
                      </p>
                    ))}
                  </div>

                  <p className="mt-6 border-t border-graphite-100 pt-4 text-[0.875rem] text-graphite-600">
                    <span className="font-semibold text-ink-800">Pour postuler&nbsp;:</span> {offre.contact}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Container>
      </Section>

      {/* -------------------------------------------------------------- Recruteur */}
      <Section tone="paper" id="recruter">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,30rem)] lg:gap-16">
            <div>
              <SectionHeading
                eyebrow="Pour les entreprises"
                title="Vous cherchez un stagiaire ou un employé&nbsp;?"
                lead="Décrivez le profil recherché. Nous transmettons votre offre aux étudiants concernés."
              />

              <ul className="mt-10 flex flex-col gap-4">
                {[
                  'Diffusion de votre offre auprès des promotions concernées.',
                  'Présélection des profils par le référent carrières.',
                  'Accueil sur le campus pour une présentation de votre structure.',
                  'Conventions de stage et suivi pendant la période.',
                ].map((item) => (
                  <li key={item} className="flex gap-3">
                    <LeafSprig aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-gold-500" />
                    <span className="text-[0.9375rem] leading-relaxed text-graphite-600">{item}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-10">
                <MediaPlaceholder sujet="Rencontre entreprises sur le campus" ratio="aspect-[16/9]" />
              </div>
            </div>

            <div className="rounded-card-lg border border-graphite-100 bg-paper-tint p-7">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-pill bg-ink-800">
                  <IconHandshake className="h-5 w-5 text-gold-400" />
                </span>
                <h2 className="font-display text-[1.25rem] text-ink-800">Formulaire recruteur</h2>
              </div>
              <p className="mt-4 text-[0.875rem] leading-relaxed text-graphite-500">
                Recrutement, stage, intervention en cours ou visite d’entreprise : une seule demande suffit.
              </p>
              <FormulaireDemande type="recruteur" origine="carrieres-recruteur" className="mt-6" />
            </div>
          </div>
        </Container>
      </Section>

      {/* --------------------------------------------------------------- Alumni */}
      <Section tone="ink">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
            <div>
              <SectionHeading
                eyebrow="Réseau des anciens"
                title="Nos anciens étudiants"
                tone="light"
                lead="Nos premiers diplômés entrent dans la vie active. Nous publierons leurs parcours ici, avec leur accord : ce sont eux qui en parleront le mieux."
              />
              <DonneeManquante
                className="mt-8"
                quoi="Témoignages et parcours d'anciens : à recueillir auprès des diplômés, avec leur accord écrit de publication et de droit à l'image."
                action={null}
              />
            </div>
            <div className="rounded-card-lg border border-paper/12 bg-paper/[0.04] p-7">
              <p className="text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-gold-400">
                Vous êtes ancien étudiant&nbsp;?
              </p>
              <p className="mt-4 text-[1.0625rem] leading-relaxed text-ink-100">
                Racontez votre parcours depuis la sortie. Votre témoignage aide un candidat à se projeter mieux
                que n’importe quelle plaquette.
              </p>
              <ButtonLink
                href="/contact?sujet=temoignage"
                variant="gold"
                size="md"
                className="mt-6"
                trailing={<IconArrowRight />}
              >
                Partager mon parcours
              </ButtonLink>
            </div>
          </div>
        </Container>
      </Section>

      {/* ------------------------------------------------------------- Renvoi */}
      <Section tone="tint" className="py-16 lg:py-20">
        <Container>
          <div className="reveal flex flex-col items-start gap-6 rounded-card-lg border border-graphite-100 bg-paper p-8 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-[1.5rem] leading-snug text-ink-800">
                Votre besoin porte sur de l’expertise, pas du recrutement&nbsp;?
              </h2>
              <p className="mt-2 max-w-xl text-[0.9375rem] leading-relaxed text-graphite-500">
                Le cabinet de FOANI-ITC intervient en conseil technique et en formation continue auprès des
                organisations agricoles.
              </p>
            </div>
            <Link
              href="/expertise"
              className="inline-flex h-12 shrink-0 items-center gap-2 rounded-pill bg-ink-800 px-6 text-[0.875rem] font-semibold text-paper transition-colors hover:bg-ink-700"
            >
              Voir l’offre d’expertise
              <IconArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Container>
      </Section>
    </>
  );
}
