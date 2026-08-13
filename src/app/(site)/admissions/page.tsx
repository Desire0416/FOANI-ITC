import type { Metadata } from 'next';
import Link from 'next/link';
import {
  IconArrowRight,
  IconCalendar,
  IconCheck,
  IconInfo,
  IconPhone,
  IconShield,
} from '@/components/brand/icons';
import { LaurelWreath, LeafSprig } from '@/components/brand/marks';
import { PageHero } from '@/components/layout/page-hero';
import { Accordion } from '@/components/ui/accordion';
import { ButtonLink } from '@/components/ui/button';
import { DonneeManquante } from '@/components/ui/donnee-manquante';
import { Container, Pill, Section, SectionHeading } from '@/components/ui/primitives';
import { CYCLE_LABELS, formationsParCycle } from '@/content/formations';
import { ETAPES_CANDIDATURE, FAQ_ADMISSIONS } from '@/content/institution';
import { ETABLISSEMENT } from '@/content/site';
import { formatDate } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Admissions',
  description:
    "Candidater à FOANI-ITC : conditions d'admission par cycle, procédure en ligne pas à pas depuis un téléphone, calendrier, frais de scolarité et questions fréquentes. Rentrée le 5 octobre 2026.",
  alternates: { canonical: '/admissions' },
};

const CONDITIONS = [
  {
    cycle: 'bts' as const,
    duree: 'Deux ans',
    requis: 'Baccalauréat, toutes séries scientifiques et techniques',
    sanction: "Diplôme sanctionné par un examen d'État",
  },
  {
    cycle: 'licence' as const,
    duree: 'Trois ans',
    requis: 'Baccalauréat — ouverture de la première année à la rentrée 2026',
    sanction: 'Licence, sous agrément',
  },
  {
    cycle: 'certificat' as const,
    duree: 'Session courte',
    requis: 'Ouvert sans condition de diplôme',
    sanction: 'Attestation en fin de session',
  },
  {
    cycle: 'masterclass' as const,
    duree: 'Module court',
    requis: 'Ouvert aux étudiants et aux publics externes',
    sanction: 'Attestation de participation',
  },
];

export default function PageAdmissions() {
  return (
    <>
      <PageHero
        eyebrow="Admissions"
        titre="Comment s’inscrire"
        lead="Tout se fait en ligne, depuis votre téléphone. Vous n’avez pas besoin de venir à Agnibilékrou pour déposer votre dossier."
        fil={[{ libelle: 'Admissions' }]}
        actions={
          <>
            <ButtonLink href="/candidature" variant="gold" size="lg" trailing={<IconArrowRight />}>
              Déposer ma candidature
            </ButtonLink>
            <ButtonLink href="#procedure" variant="onDark" size="lg">
              Voir la procédure
            </ButtonLink>
          </>
        }
        aside={
          <div className="rounded-card-lg border border-paper/12 bg-paper/[0.05] p-6">
            <p className="inline-flex items-center gap-2 text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-gold-400">
              <IconCalendar className="h-3.5 w-3.5" />
              Date fixe
            </p>
            <p className="mt-4 font-display text-[2rem] leading-none text-paper">
              {formatDate(ETABLISSEMENT.rentree, { day: 'numeric', month: 'long' })}
            </p>
            <p className="mt-2 text-[0.9375rem] text-ink-200">Rentrée académique 2026</p>
            <p className="mt-5 border-t border-paper/10 pt-4 text-[0.8125rem] leading-relaxed text-ink-300">
              La période de recrutement est engagée. Les candidats arbitrent en août et septembre.
            </p>
          </div>
        }
      />

      {/* ------------------------------------------------------------ Procédure */}
      <Section tone="paper" id="procedure">
        <Container>
          <SectionHeading
            eyebrow="La procédure"
            title="Les six étapes"
            lead="Votre dossier est enregistré au fur et à mesure. Si le réseau coupe, vous reprenez là où vous vous étiez arrêté."
            className="mb-14"
          />

          <ol className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {ETAPES_CANDIDATURE.map((etape, index) => (
              <li
                key={etape.numero}
                className="reveal group/etape relative overflow-hidden rounded-card-lg border border-graphite-100 bg-paper-tint p-6 transition-[transform,border-color,box-shadow] duration-500 ease-[var(--ease-arc)] hover:[transform:translateY(-0.25rem)] hover:border-ink-100 hover:shadow-raise"
                style={{ ['--reveal-delay' as string]: `${index * 70}ms` }}
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-6 -top-8 font-display text-[5.5rem] leading-none text-ink-700/[0.06] transition-transform duration-700 ease-[var(--ease-arc)] group-hover/etape:[transform:scale(1.1)]"
                >
                  {etape.numero}
                </span>
                <span className="relative flex h-9 w-9 items-center justify-center rounded-pill bg-ink-800 font-display text-[0.875rem] text-gold-400">
                  {etape.numero}
                </span>
                <h3 className="relative mt-5 text-[1.125rem] leading-snug text-ink-800">{etape.titre}</h3>
                <p className="relative mt-2 text-[0.9375rem] leading-relaxed text-graphite-500">{etape.corps}</p>
              </li>
            ))}
          </ol>

          <div className="reveal mt-10 flex flex-wrap items-center gap-4 rounded-card-lg border border-graphite-100 bg-paper p-6">
            <IconInfo aria-hidden="true" className="h-6 w-6 shrink-0 text-gold-600" />
            <p className="flex-1 text-[0.9375rem] leading-relaxed text-graphite-600">
              Un étudiant déjà inscrit ne candidate pas&nbsp;: il se <strong className="text-ink-800">réinscrit</strong>{' '}
              depuis son espace étudiant, au niveau autorisé par la décision de fin d’année.
            </p>
            <ButtonLink href="/espace-numerique" variant="outline" size="sm" trailing={<IconArrowRight />}>
              Espace étudiant
            </ButtonLink>
          </div>
        </Container>
      </Section>

      {/* ----------------------------------------------------------- Conditions */}
      <Section tone="tint" id="conditions">
        <Container>
          <SectionHeading
            eyebrow="Conditions d’admission"
            title="Qui peut s’inscrire"
            lead="Voici ce qu’il faut avoir pour chaque type de formation. Le détail par série de baccalauréat sera publié dès qu’il sera arrêté."
            className="mb-12"
          />

          <div className="overflow-x-auto">
            <table className="w-full min-w-[44rem] border-collapse text-left">
              <caption className="sr-only">Conditions d’admission par cycle</caption>
              <thead>
                <tr className="border-b border-graphite-200">
                  {['Cycle', 'Durée', 'Niveau requis', 'Sanction', 'Formations'].map((entete) => (
                    <th
                      key={entete}
                      scope="col"
                      className="pb-4 pr-6 text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-graphite-600"
                    >
                      {entete}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CONDITIONS.map((ligne) => (
                  <tr key={ligne.cycle} className="border-b border-graphite-100 last:border-0">
                    <th scope="row" className="py-5 pr-6 align-top">
                      <Pill tone="neutral">{CYCLE_LABELS[ligne.cycle]}</Pill>
                    </th>
                    <td className="py-5 pr-6 align-top text-[0.9375rem] text-ink-800">{ligne.duree}</td>
                    <td className="py-5 pr-6 align-top text-[0.9375rem] leading-snug text-graphite-600">
                      {ligne.requis}
                    </td>
                    <td className="py-5 pr-6 align-top text-[0.9375rem] leading-snug text-graphite-600">
                      {ligne.sanction}
                    </td>
                    <td className="py-5 align-top">
                      <Link
                        href={`/formations?cycle=${ligne.cycle}`}
                        className="inline-flex items-center gap-1.5 py-1 whitespace-nowrap text-[0.875rem] font-semibold text-ink-700 hover:text-ink-600"
                      >
                        {formationsParCycle(ligne.cycle).length} formations
                        <IconArrowRight className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <DonneeManquante
            className="mt-8"
            quoi="Liste des pièces justificatives attendues, capacités d'accueil par formation et conditions d'admission par équivalence : en cours d'arrêt par la direction des études."
            action={{ libelle: 'Poser une question', href: '/contact?sujet=admission' }}
          />
        </Container>
      </Section>

      {/* ------------------------------------------------------------ Calendrier */}
      <Section tone="paper" id="calendrier">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <SectionHeading eyebrow="Calendrier" title="Les dates à retenir" />
              <ol className="mt-9 flex flex-col">
                {[
                  {
                    date: 'Août – septembre 2026',
                    titre: 'Période d’arbitrage des candidats',
                    corps: "Les résultats du baccalauréat sont connus. C'est la fenêtre où se décident les inscriptions.",
                    ferme: true,
                  },
                  {
                    date: 'À confirmer',
                    titre: 'Clôture des candidatures',
                    corps: "La date de clôture est arrêtée par le service des admissions et publiée ici dès validation.",
                    ferme: false,
                  },
                  {
                    date: formatDate(ETABLISSEMENT.rentree),
                    titre: 'Rentrée académique',
                    corps: "Date fixe, indépendante du calendrier de candidature.",
                    ferme: true,
                  },
                ].map((jalon) => (
                  <li key={jalon.titre} className="relative flex gap-5 pb-8 last:pb-0">
                    <div className="flex flex-col items-center">
                      <span
                        className={
                          jalon.ferme
                            ? 'mt-1.5 h-3 w-3 shrink-0 rounded-pill bg-gold-400 ring-4 ring-gold-100'
                            : 'mt-1.5 h-3 w-3 shrink-0 rounded-pill border-2 border-graphite-300 bg-paper'
                        }
                      />
                      <span aria-hidden="true" className="mt-1 w-px flex-1 bg-graphite-200 last:hidden" />
                    </div>
                    <div>
                      <p className="text-[0.75rem] font-bold uppercase tracking-[0.14em] text-gold-700">
                        {jalon.date}
                      </p>
                      <p className="mt-1.5 font-display text-[1.125rem] text-ink-800">{jalon.titre}</p>
                      <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-graphite-500">{jalon.corps}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            {/* ------------------------------------------------------- Règlement */}
            <div id="frais">
              <SectionHeading eyebrow="Coût des études" title="Le coût des études" />

              <div className="mt-9 rounded-card-lg border border-graphite-100 bg-paper-tint p-6">
                <p className="font-display text-[1.125rem] text-ink-800">Frais de scolarité</p>
                <p className="mt-3 text-[0.9375rem] leading-relaxed text-graphite-500">
                  La grille tarifaire par formation, niveau et année académique est en cours de validation par la
                  direction. Nous ne publions pas de montant tant qu’il n’est pas arrêté.
                </p>
                <DonneeManquante
                  className="mt-5"
                  quoi="Frais de scolarité, échéancier de règlement et éventuelles facilités de paiement."
                  action={{ libelle: 'Demander la grille', href: '/contact?sujet=frais' }}
                />
              </div>

              <div id="reglement" className="mt-6 rounded-card-lg border border-graphite-100 bg-paper p-6">
                <p className="flex items-center gap-2.5 font-display text-[1.125rem] text-ink-800">
                  <IconPhone className="h-5 w-5 text-gold-600" />
                  Frais de dossier — paiement mobile
                </p>
                <ol className="mt-5 flex flex-col gap-4">
                  {[
                    'Vous effectuez un transfert par paiement mobile vers un numéro officiel de l’établissement.',
                    'Vous saisissez la référence de la transaction dans votre dossier de candidature.',
                    "L'administration rapproche cette référence de son relevé et valide le dossier.",
                  ].map((etape, index) => (
                    <li key={etape} className="flex gap-3.5">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-pill bg-ink-800 text-[0.75rem] font-bold text-paper">
                        {index + 1}
                      </span>
                      <span className="text-[0.9375rem] leading-relaxed text-graphite-600">{etape}</span>
                    </li>
                  ))}
                </ol>
                <p className="mt-5 flex items-start gap-2.5 rounded-card bg-ink-50 px-4 py-3 text-[0.8125rem] leading-relaxed text-ink-800">
                  <IconShield aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-ink-700" />
                  L’établissement n’encaisse aucun fonds via ce site. Une référence de transaction déjà utilisée
                  est rejetée par le dispositif.
                </p>
              </div>

              <div id="bourses" className="mt-6 rounded-card-lg border border-graphite-100 bg-paper p-6">
                <p className="font-display text-[1.125rem] text-ink-800">Bourses et facilités de paiement</p>
                <p className="mt-3 text-[0.9375rem] leading-relaxed text-graphite-500">
                  L’existence et les conditions d’un dispositif d’aide restent à confirmer par la direction. Cette
                  rubrique ne sera publiée que si un dispositif est effectivement en place.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* ------------------------------------------------------------------ FAQ */}
      <Section tone="tint" id="faq">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-20">
            <SectionHeading
              eyebrow="Questions fréquentes"
              title="Vos questions les plus fréquentes"
              lead="Une question qui ne figure pas ici&nbsp;? Adressez-la au service des admissions."
              className="lg:sticky lg:top-32 lg:self-start"
            />
            <Accordion
              defautOuvert={0}
              elements={FAQ_ADMISSIONS.map((item, index) => ({
                id: `faq-${index}`,
                titre: item.question,
                contenu: <p>{item.reponse}</p>,
              }))}
            />
          </div>
        </Container>
      </Section>

      {/* ------------------------------------------------------------ Appel final */}
      <Section tone="paper" className="py-16 lg:py-20">
        <Container>
          <div className="reveal relative overflow-hidden rounded-card-lg bg-ink-900 px-6 py-14 text-center sm:px-12">
            <LaurelWreath
              className="pointer-events-none absolute left-1/2 top-1/2 h-[26rem] w-[26rem] -translate-x-1/2 -translate-y-1/2 text-paper/[0.05]"
              leaves={13}
            />
            <LeafSprig className="relative mx-auto h-8 w-8 text-gold-400" />
            <h2 className="relative mx-auto mt-6 max-w-2xl text-[1.875rem] leading-tight text-paper sm:text-[2.25rem]">
              Votre dossier tient dans votre téléphone
            </h2>
            <p className="relative mx-auto mt-4 max-w-xl text-[1rem] leading-relaxed text-ink-200">
              Comptez une vingtaine de minutes pour un premier dépôt. Vous pouvez interrompre et reprendre à tout
              moment.
            </p>
            <div className="relative mt-9 flex flex-wrap justify-center gap-3">
              <ButtonLink href="/candidature" variant="gold" size="lg" trailing={<IconArrowRight />}>
                Commencer ma candidature
              </ButtonLink>
              <ButtonLink href="/formations" variant="onDark" size="lg" icon={<IconCheck />}>
                Choisir ma formation d’abord
              </ButtonLink>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
