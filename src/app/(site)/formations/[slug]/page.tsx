import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  IconArrowRight,
  IconCalendar,
  IconCheck,
  IconClock,
  IconDownload,
  IconFile,
  IconGlobe,
  IconGraduation,
  IconPin,
  IconShield,
  IconTeacher,
  IconTarget,
} from '@/components/brand/icons';
import { LeafSprig } from '@/components/brand/marks';
import { FormationCard } from '@/components/formation-card';
import { PageHero } from '@/components/layout/page-hero';
import { Accordion } from '@/components/ui/accordion';
import { ButtonLink } from '@/components/ui/button';
import { DonneeManquante } from '@/components/ui/donnee-manquante';
import { MediaPlaceholder } from '@/components/ui/media-placeholder';
import { Container, LeafList, Pill, Section, SectionHeading } from '@/components/ui/primitives';
import {
  CYCLE_LABELS,
  DOMAINE_LABELS,
  FORMATIONS,
  MODALITE_LABELS,
  dureeLisible,
  getFormation,
  titreComplet,
} from '@/content/formations';
import { ETABLISSEMENT } from '@/content/site';
import { formatDate } from '@/lib/utils';
import { socle } from '@/lib/session';
import { grilleApplicable } from '@/payload/finances/grille';
import { Tarifs } from '@/components/commun/tarifs';

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return FORMATIONS.map((formation) => ({ slug: formation.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const formation = getFormation(slug);
  if (!formation) return { title: 'Formation introuvable' };

  const titre = titreComplet(formation);
  return {
    // §19.1 — titre et description propres à chaque page.
    title: `${titre} — ${CYCLE_LABELS[formation.cycle]}`,
    description: formation.resume,
    alternates: { canonical: `/formations/${formation.slug}` },
    openGraph: { title: `${titre} — ${ETABLISSEMENT.sigle}`, description: formation.resume },
  };
}

export default async function FicheFormation({ params }: Params) {
  const { slug } = await params;
  const formation = getFormation(slug);
  if (!formation) notFound();

  const titre = titreComplet(formation);
  const duree = dureeLisible(formation);

  /* La grille arrêtée pour l'année de la rentrée. Lue à chaque rendu : elle
     change quand la direction en arrête une nouvelle version, et le public doit
     voir la dernière — jamais une copie figée dans le catalogue. */
  const rentree = new Date(ETABLISSEMENT.rentree).getFullYear();
  const grille = await grilleApplicable(
    await socle(),
    formation.slug,
    `${rentree}-${rentree + 1}`,
  );

  const proches = FORMATIONS.filter(
    (autre) =>
      autre.slug !== formation.slug &&
      autre.domaines.some((domaine) => formation.domaines.includes(domaine)),
  ).slice(0, 3);

  /** Données structurées de formation — §19.1. */
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: titre,
    description: formation.resume,
    provider: {
      '@type': 'CollegeOrUniversity',
      name: ETABLISSEMENT.nom,
      sameAs: process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.foani-itc.ci',
    },
    educationalCredentialAwarded: formation.diplome,
    inLanguage: 'fr',
  };

  return (
    <>
      <PageHero
        eyebrow={CYCLE_LABELS[formation.cycle]}
        titre={titre}
        lead={formation.resume}
        fil={[{ libelle: 'Formations', href: '/formations' }, { libelle: titre }]}
        actions={
          <>
            <ButtonLink
              href={`/candidature?formation=${formation.slug}`}
              variant="gold"
              size="lg"
              trailing={<IconArrowRight />}
            >
              Candidater à cette formation
            </ButtonLink>
            <ButtonLink
              href={`/contact?sujet=brochure&formation=${formation.slug}`}
              variant="onDark"
              size="lg"
              icon={<IconDownload />}
            >
              Recevoir la brochure
            </ButtonLink>
            <ButtonLink href={`/contact?formation=${formation.slug}`} variant="onDark" size="lg">
              Parler à un conseiller
            </ButtonLink>
          </>
        }
        aside={
          <dl className="flex flex-col gap-4">
            <FaitCle icone={<IconGraduation />} terme="Diplôme délivré" valeur={formation.diplome} />
            <FaitCle
              icone={<IconClock />}
              terme="Durée"
              valeur={duree ?? 'Durée en cours d’arrêt par l’établissement'}
              incertain={duree === null}
            />
            <FaitCle icone={<IconTarget />} terme="Niveau requis" valeur={formation.niveauRequis} />
            <FaitCle icone={<IconPin />} terme="Modalité" valeur={MODALITE_LABELS[formation.modalite]} />
          </dl>
        }
      />

      {/* --------------------------------------------------------- Identification */}
      <Section tone="paper" className="py-12 lg:py-14">
        <Container>
          <div className="flex flex-wrap items-center gap-2.5">
            <Pill tone="ink">{CYCLE_LABELS[formation.cycle]}</Pill>
            {formation.domaines.map((domaine) => (
              <Pill key={domaine} tone="outline">
                {DOMAINE_LABELS[domaine]}
              </Pill>
            ))}
            {formation.agrementRef ? (
              <Pill tone="gold">
                <IconShield className="h-3.5 w-3.5" />
                Sous agrément
              </Pill>
            ) : null}
          </div>
        </Container>
      </Section>

      {/* ----------------------------------------------- Objectifs et compétences */}
      <Section tone="tint" className="pt-0 lg:pt-0" id="contenu-formation">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <SectionHeading eyebrow="Objectifs" title="Ce que cette formation vous apprend à faire" />
              <LeafList className="mt-8" items={formation.objectifs.map((objectif) => objectif)} />
            </div>
            <div>
              <SectionHeading eyebrow="Compétences" title="Ce que vous saurez faire à la sortie" />
              <ul className="mt-8 flex flex-col gap-2.5">
                {formation.competences.map((competence) => (
                  <li
                    key={competence}
                    className="flex items-start gap-3 rounded-card border border-graphite-100 bg-paper px-4 py-3"
                  >
                    <IconCheck aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-gold-600" />
                    <span className="text-[0.9375rem] leading-snug text-graphite-600">{competence}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </Section>

      {/* ------------------------------------------------------------- Programme */}
      {formation.programme ? (
        <Section tone="paper" id="programme">
          <Container>
            <SectionHeading
              eyebrow="Programme"
              title="Le déroulé, année par année"
              lead="Voici le découpage du cursus, année par année. Le contenu détaillé de chaque module est arrêté par la direction des études."
              className="mb-10"
            />
            <Accordion
              elements={formation.programme.map((annee, index) => ({
                id: `annee-${index}`,
                titre: annee.annee,
                contenu: (
                  <ul className="grid gap-2.5 sm:grid-cols-2">
                    {annee.modules.map((module) => (
                      <li key={module} className="flex items-start gap-2.5">
                        <LeafSprig aria-hidden="true" className="mt-1 h-3.5 w-3.5 shrink-0 text-gold-500" />
                        <span>{module}</span>
                      </li>
                    ))}
                  </ul>
                ),
              }))}
            />
          </Container>
        </Section>
      ) : null}

      {/* --------------------------------------------------- Débouchés et suites */}
      <Section tone="ink" id="debouches">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:gap-16">
            <div>
              <SectionHeading
                eyebrow="Débouchés"
                title="Les métiers que cette formation ouvre"
                tone="light"
                lead="Les intitulés correspondent aux postes réellement occupés dans les filières agricoles ivoiriennes."
              />
              <ul className="mt-10 grid gap-3 sm:grid-cols-2">
                {formation.debouches.map((debouche) => (
                  <li
                    key={debouche}
                    className="rounded-card border border-paper/12 bg-paper/[0.04] px-4 py-3.5 text-[0.9375rem] leading-snug text-ink-100"
                  >
                    {debouche}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-card-lg border border-paper/12 bg-paper/[0.04] p-6">
              <p className="text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-gold-400">
                Poursuite d’études
              </p>
              <ul className="mt-5 flex flex-col gap-4">
                {formation.poursuites.map((poursuite) => (
                  <li key={poursuite} className="flex gap-3">
                    <LeafSprig aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" />
                    <span className="text-[0.9375rem] leading-relaxed text-ink-100">{poursuite}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </Section>

      {/* ------------------------------------------------- Conditions financières */}
      <Section tone="paper" id="conditions">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <SectionHeading eyebrow="Admission" title="Conditions et calendrier" />
              <dl className="mt-8 flex flex-col divide-y divide-graphite-100">
                <Ligne terme="Niveau requis" valeur={formation.niveauRequis} />
                <Ligne terme="Diplôme délivré" valeur={formation.diplome} />
                <Ligne terme="Rentrée" valeur={formatDate(ETABLISSEMENT.rentree)} />
                <Ligne terme="Lieu" valeur={formation.lieu} />
                <Ligne terme="Langue d’enseignement" valeur={formation.langue} />
                {formation.agrementRef ? <Ligne terme="Agrément" valeur={formation.agrementRef} /> : null}
              </dl>
              <DonneeManquante
                className="mt-6"
                quoi="La liste exacte des pièces à fournir et le calendrier de candidature sont arrêtés par le service des admissions et affichés dans le portail avant le dépôt du dossier."
                action={{ libelle: 'Voir la procédure', href: '/admissions#procedure' }}
              />
            </div>

            <div>
              <SectionHeading eyebrow="Conditions financières" title="Frais de scolarité" />
              {/* La grille arrêtée par la direction fait foi. Tant qu'il n'y en
                  a pas, on le dit : un tarif non publié n'est pas un tarif à
                  zéro franc, et afficher un chiffre que l'établissement n'a pas
                  arrêté serait l'engager à sa place. */}
              {grille ? (
                <div className="mt-8">
                  <Tarifs grille={grille} />
                </div>
              ) : (
                <>
                  <p className="mt-8 text-[0.9375rem] leading-relaxed text-graphite-500">
                    La grille tarifaire de cette formation n’est pas encore publiée. Nous préférons ne rien
                    afficher plutôt qu’un montant que l’établissement n’a pas arrêté.
                  </p>
                  <DonneeManquante
                    className="mt-5"
                    quoi="Frais de scolarité et échéancier de règlement : à demander au service des admissions."
                    action={{
                      libelle: 'Demander les conditions',
                      href: `/contact?sujet=frais&formation=${formation.slug}`,
                    }}
                  />
                </>
              )}

              <div className="mt-8 rounded-card-lg border border-graphite-100 bg-paper-tint p-6">
                <p className="flex items-center gap-2.5 font-display text-[1.0625rem] text-ink-800">
                  <IconCalendar className="h-5 w-5 text-gold-600" />
                  Modalités de règlement
                </p>
                <p className="mt-3 text-[0.875rem] leading-relaxed text-graphite-500">
                  Les frais de dossier se règlent par paiement mobile vers un numéro officiel de
                  l’établissement. Vous saisissez la référence de la transaction dans votre dossier&nbsp;;
                  l’administration la rapproche de son relevé et valide la candidature.
                </p>
                <Link
                  href="/admissions#reglement"
                  className="mt-3 inline-flex items-center gap-1.5 py-1 text-[0.875rem] font-semibold text-ink-700 hover:text-ink-600"
                >
                  Voir le détail du règlement
                  <IconArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* ----------------------------------------------------- Pédagogie et preuve */}
      <Section tone="tint">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
            <div>
              <SectionHeading
                eyebrow="Pédagogie"
                title="Comment vous apprenez"
                lead="La part de terrain n'est pas un supplément : c'est le mode d'enseignement principal."
              />
              <ul className="mt-9 flex flex-col gap-5">
                {[
                  {
                    icone: <IconTeacher />,
                    titre: 'Encadrement',
                    corps: formation.responsable
                      ? `Responsable pédagogique : ${formation.responsable}.`
                      : 'Un responsable pédagogique est désigné pour la formation. Sa fiche publique sera mise en ligne dès transmission par la direction des études.',
                  },
                  {
                    icone: <IconPin />,
                    titre: 'Lieu et équipements',
                    corps: `${formation.lieu}. Les parcelles, ateliers et laboratoires du campus servent de supports de travaux pratiques.`,
                  },
                  {
                    icone: <IconGlobe />,
                    titre: 'Langue et rythme',
                    corps: `Enseignement en ${formation.langue.toLowerCase()}. ${MODALITE_LABELS[formation.modalite]}.`,
                  },
                ].map((bloc) => (
                  <li key={bloc.titre} className="flex gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-pill border border-graphite-100 bg-paper [&>svg]:h-5 [&>svg]:w-5 [&>svg]:text-ink-700">
                      {bloc.icone}
                    </span>
                    <div>
                      <p className="font-display text-[1.0625rem] text-ink-800">{bloc.titre}</p>
                      <p className="mt-1 text-[0.9375rem] leading-relaxed text-graphite-500">{bloc.corps}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-5">
              <MediaPlaceholder sujet={`Travaux pratiques — ${titre}`} ratio="aspect-[4/3]" />
              <div className="rounded-card-lg border border-graphite-100 bg-paper p-6">
                <p className="flex items-center gap-2.5 font-display text-[1.0625rem] text-ink-800">
                  <IconFile className="h-5 w-5 text-gold-600" />
                  Brochure de la formation
                </p>
                <p className="mt-3 text-[0.875rem] leading-relaxed text-graphite-500">
                  La brochure détaillée — programme complet, équipe, équipements et témoignages — est en cours de
                  production par l’établissement. Laissez-nous vos coordonnées pour la recevoir dès parution.
                </p>
                <ButtonLink
                  href={`/contact?sujet=brochure&formation=${formation.slug}`}
                  variant="outline"
                  size="sm"
                  className="mt-5"
                  icon={<IconDownload />}
                >
                  Être prévenu de la parution
                </ButtonLink>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* ------------------------------------------------------------------ FAQ */}
      {formation.faq.length > 0 ? (
        <Section tone="paper" id="faq">
          <Container>
            <div className="grid gap-10 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-20">
              <SectionHeading
                eyebrow="Questions fréquentes"
                title="Sur cette formation"
                lead="Les questions générales d'admission sont traitées dans la rubrique Admissions."
                className="lg:sticky lg:top-32 lg:self-start"
              />
              <Accordion
                defautOuvert={null}
                tone="tint"
                elements={formation.faq.map((item, index) => ({
                  id: `faq-${index}`,
                  titre: item.question,
                  contenu: <p>{item.reponse}</p>,
                }))}
              />
            </div>
          </Container>
        </Section>
      ) : null}

      {/* ------------------------------------------------------- Formations proches */}
      {proches.length > 0 ? (
        <Section tone="tint">
          <Container>
            <SectionHeading eyebrow="Aussi dans ce domaine" title="Formations proches" className="mb-10" />
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {proches.map((autre, index) => (
                <li key={autre.slug} className="reveal" style={{ ['--reveal-delay' as string]: `${index * 70}ms` }}>
                  <FormationCard formation={autre} />
                </li>
              ))}
            </ul>
          </Container>
        </Section>
      ) : null}

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}

/* -------------------------------------------------------------------------- */

function FaitCle({
  icone,
  terme,
  valeur,
  incertain = false,
}: {
  icone: React.ReactNode;
  terme: string;
  valeur: string;
  incertain?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 border-b border-paper/10 pb-4 last:border-0 last:pb-0">
      <span className="mt-0.5 shrink-0 [&>svg]:h-4 [&>svg]:w-4 [&>svg]:text-gold-400">{icone}</span>
      <div>
        <dt className="text-[0.6875rem] uppercase tracking-[0.14em] text-ink-300">{terme}</dt>
        <dd className={incertain ? 'text-[0.9375rem] leading-snug text-ink-300' : 'text-[0.9375rem] leading-snug text-paper'}>
          {valeur}
        </dd>
      </div>
    </div>
  );
}

function Ligne({ terme, valeur }: { terme: string; valeur: string }) {
  return (
    <div className="flex flex-col gap-1 py-4 sm:flex-row sm:gap-6">
      <dt className="w-48 shrink-0 text-[0.8125rem] font-semibold uppercase tracking-[0.08em] text-graphite-500">
        {terme}
      </dt>
      <dd className="text-[0.9375rem] leading-snug text-ink-800">{valeur}</dd>
    </div>
  );
}
