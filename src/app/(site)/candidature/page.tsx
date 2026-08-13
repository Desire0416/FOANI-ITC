import type { Metadata } from 'next';
import Link from 'next/link';
import { IconArrowRight, IconCheck, IconFile, IconInfo, IconPhone } from '@/components/brand/icons';
import { LaurelWreath, LeafSprig } from '@/components/brand/marks';
import { FormulaireDemande } from '@/components/formulaire-demande';
import { PageHero } from '@/components/layout/page-hero';
import { ButtonLink } from '@/components/ui/button';
import { Container, Section, SectionHeading } from '@/components/ui/primitives';
import { getFormation, titreComplet } from '@/content/formations';
import { ETAPES_CANDIDATURE } from '@/content/institution';
import { ETABLISSEMENT } from '@/content/site';
import { formatDate } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Candidater',
  description:
    "Déposer une candidature à FOANI-ITC depuis un téléphone : étapes du parcours, pièces à préparer et accès au portail d'admission. Rentrée le 5 octobre 2026.",
  alternates: { canonical: '/candidature' },
};

/** Le dépôt en ligne se fait dans le dispositif lui-même (CDC §10). */
const PORTAIL = '/mon-dossier/inscription';

const A_PREPARER = [
  'Une pièce d’identité en cours de validité.',
  'Votre relevé de notes et votre diplôme du baccalauréat, ou votre attestation de réussite.',
  'Une photographie récente de vous.',
  'Les coordonnées d’une personne à contacter.',
  'Le nom de votre établissement d’origine, votre série et votre année de baccalauréat.',
] as const;

export default async function PageCandidature({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const parametres = await searchParams;
  const slug = typeof parametres.formation === 'string' ? parametres.formation : undefined;
  const formation = slug ? getFormation(slug) : undefined;

  return (
    <>
      <PageHero
        eyebrow="Candidature"
        titre="Déposer mon dossier"
        lead={
          formation
            ? `Vous candidatez à : ${titreComplet(formation)}. Comptez une vingtaine de minutes pour un premier dépôt, interruptible à tout moment.`
            : "Comptez une vingtaine de minutes pour un premier dépôt. Le brouillon s'enregistre automatiquement : une coupure de réseau ne fait rien perdre."
        }
        fil={[{ libelle: 'Candidater' }]}
        aside={
          <div className="rounded-card-lg border border-paper/12 bg-paper/[0.05] p-6">
            <p className="text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-gold-400">Rentrée</p>
            <p className="mt-4 font-display text-[1.75rem] leading-none text-paper">
              {formatDate(ETABLISSEMENT.rentree)}
            </p>
            <p className="mt-4 border-t border-paper/10 pt-4 text-[0.8125rem] leading-relaxed text-ink-300">
              Date fixe. La période d’arbitrage des candidats se joue en août et septembre.
            </p>
          </div>
        }
      />

      {/* ------------------------------------------------------- Accès au portail */}
      <Section tone="paper">
        <Container>
          <div className="reveal relative overflow-hidden rounded-card-lg bg-ink-900 p-8 sm:p-12">
            <LaurelWreath
              className="pointer-events-none absolute -right-20 -top-20 h-96 w-96 text-paper/[0.05]"
              leaves={13}
            />
            <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
              <div>
                <LeafSprig aria-hidden="true" className="h-7 w-7 text-gold-400" />
                <h2 className="mt-5 max-w-xl text-[1.75rem] leading-tight text-paper sm:text-[2.125rem]">
                  Les candidatures sont ouvertes
                </h2>
                <p className="mt-4 max-w-xl text-[1rem] leading-relaxed text-ink-200">
                  Créez votre compte avec votre numéro de téléphone, puis laissez-vous guider. Vous
                  pouvez vous arrêter et reprendre quand vous voulez&nbsp;: votre dossier est
                  enregistré à chaque étape.
                </p>
                <p className="mt-4 max-w-xl text-[0.875rem] leading-relaxed text-ink-300">
                  Vous avez déjà commencé&nbsp;?{' '}
                  <Link href="/mon-dossier/connexion" className="font-semibold text-gold-400 hover:text-gold-300">
                    Retrouvez votre dossier
                  </Link>
                  .
                </p>
              </div>
              <ButtonLink href={PORTAIL} variant="gold" size="lg" trailing={<IconArrowRight />} className="shrink-0">
                Créer mon compte
              </ButtonLink>
            </div>
          </div>
        </Container>
      </Section>

      {/* --------------------------------------------------------------- Étapes */}
      <Section tone="tint" className="pt-0 lg:pt-0">
        <Container>
          <SectionHeading
            eyebrow="Le parcours"
            title="Comment se déroule la candidature"
            className="mb-12"
          />
          <ol className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {ETAPES_CANDIDATURE.map((etape, index) => (
              <li
                key={etape.numero}
                className="reveal rounded-card-lg border border-graphite-100 bg-paper p-6"
                style={{ ['--reveal-delay' as string]: `${index * 60}ms` }}
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-pill bg-ink-800 font-display text-[0.875rem] text-gold-400">
                  {etape.numero}
                </span>
                <h3 className="mt-5 text-[1.0625rem] leading-snug text-ink-800">{etape.titre}</h3>
                <p className="mt-2 text-[0.875rem] leading-relaxed text-graphite-500">{etape.corps}</p>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      {/* --------------------------------------------------------- À préparer */}
      <Section tone="paper">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <SectionHeading
                eyebrow="Avant de commencer"
                title="Ce qu’il faut préparer"
                lead="Vous pouvez photographier vos documents avec votre téléphone : le site vérifie le format et allège les images."
              />
              <ul className="mt-9 flex flex-col gap-3">
                {A_PREPARER.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 rounded-card border border-graphite-100 bg-paper-tint px-4 py-3.5"
                  >
                    <IconCheck aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-gold-600" />
                    <span className="text-[0.9375rem] leading-snug text-graphite-600">{item}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-6 flex items-start gap-2.5 rounded-card bg-ink-50 px-4 py-3.5 text-[0.875rem] leading-relaxed text-ink-800">
                <IconInfo aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-ink-700" />
                La liste exacte des pièces attendues est arrêtée par le service des admissions et affichée dans le
                portail avant le dépôt du dossier.
              </p>
            </div>

            <div>
              <div className="rounded-card-lg border border-graphite-100 bg-paper-tint p-7">
                <p className="flex items-center gap-2.5 font-display text-[1.125rem] text-ink-800">
                  <IconPhone className="h-5 w-5 text-gold-600" />
                  Frais de dossier
                </p>
                <p className="mt-3 text-[0.9375rem] leading-relaxed text-graphite-500">
                  Ils se règlent par paiement mobile vers un numéro officiel de l’établissement. Vous saisissez
                  la référence de la transaction dans votre dossier&nbsp;; l’administration la rapproche de son
                  relevé et valide la candidature.
                </p>
                <p className="mt-4 text-[0.8125rem] leading-relaxed text-graphite-500">
                  Ce site n’encaisse aucun fonds. Une référence de transaction déjà utilisée est rejetée.
                </p>
              </div>

              <div className="mt-5 rounded-card-lg border border-graphite-100 bg-paper p-7">
                <p className="flex items-center gap-2.5 font-display text-[1.125rem] text-ink-800">
                  <IconFile className="h-5 w-5 text-gold-600" />
                  Vous êtes déjà étudiant ici&nbsp;?
                </p>
                <p className="mt-3 text-[0.9375rem] leading-relaxed text-graphite-500">
                  Vous ne candidatez pas : vous vous réinscrivez depuis votre espace étudiant, au niveau autorisé
                  par la décision de fin d’année.
                </p>
                <ButtonLink
                  href="/espace-numerique"
                  variant="outline"
                  size="sm"
                  className="mt-5"
                  trailing={<IconArrowRight />}
                >
                  Espace étudiant
                </ButtonLink>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* ------------------------------------------------------------- Prévenir */}
      <Section tone="tint" id="prevenir">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,30rem)] lg:gap-16">
            <div>
              <SectionHeading
                eyebrow="Besoin d’aide"
                title="Quelque chose vous bloque ?"
                lead="Décrivez ce qui ne va pas, en indiquant votre numéro de dossier si vous en avez déjà un. Le service des admissions reprend votre dossier avec vous."
              />
            </div>
            <div className="rounded-card-lg border border-graphite-100 bg-paper p-7">
              <FormulaireDemande
                type="information"
                formation={slug}
                origine="candidature"
                intitule={formation ? titreComplet(formation) : undefined}
              />
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
