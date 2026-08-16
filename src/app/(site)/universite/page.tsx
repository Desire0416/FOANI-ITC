import type { Metadata } from 'next';
import Link from 'next/link';
import { IconArrowRight, IconBuilding, IconQuote, IconShield, IconUsers } from '@/components/brand/icons';
import { LaurelWreath, LeafSprig, StarMark } from '@/components/brand/marks';
import { CountUp } from '@/components/motion/count-up';
import { PageHero } from '@/components/layout/page-hero';
import { ButtonLink } from '@/components/ui/button';
import { DonneeManquante } from '@/components/ui/donnee-manquante';
import { MediaPlaceholder } from '@/components/ui/media-placeholder';
import { Photo } from '@/components/ui/photo';
import { Container, Pill, Section, SectionHeading } from '@/components/ui/primitives';
import { AGREMENTS, GOUVERNANCE, MISSION, MOT_DIRECTION, VALEURS, VISION } from '@/content/institution';
import { PHOTOS } from '@/content/photos';
import { CHIFFRES_CLES, ETABLISSEMENT } from '@/content/site';

export const metadata: Metadata = {
  title: 'L’Université',
  description:
    "FOANI International Training College : première université ivoirienne intégralement dédiée à l'agriculture, adossée à plus de cinquante ans d'expérience du groupe FOANI. Histoire, vision, gouvernance, agréments et chiffres clés.",
  alternates: { canonical: '/universite' },
};

export default function PageUniversite() {
  return (
    <>
      <PageHero
        eyebrow="L’Université"
        titre="Qui nous sommes"
        lead="Une école supérieure entièrement tournée vers l’agriculture, née d’un groupe qui travaille la terre depuis plus de cinquante ans."
        fil={[{ libelle: 'L’Université' }]}
        actions={
          <>
            <ButtonLink href="/universite/equipe" variant="gold" size="lg" trailing={<IconArrowRight />}>
              Voir nos enseignants
            </ButtonLink>
            <ButtonLink href="#agrements" variant="onDark" size="lg" icon={<IconShield />}>
              Agréments
            </ButtonLink>
          </>
        }
      />

      {/* -------------------------------------------------------------- Histoire */}
      <Section tone="paper">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-16">
            <div>
              <SectionHeading eyebrow="Notre histoire" title="Deux activités, un même toit" />
              <div className="mt-8 flex flex-col gap-5 text-[1.0625rem] leading-relaxed text-graphite-600">
                <p>
                  FOANI International Training College est un établissement d’enseignement supérieur privé
                  spécialisé dans les domaines agricole, agropastoral et agroalimentaire, implanté à{' '}
                  {ETABLISSEMENT.ville}.
                </p>
                <p>
                  Il conjugue deux activités qui se nourrissent l’une l’autre : une université spécialisée qui
                  délivre des diplômes, et un cabinet de formation et d’expertise agréé qui intervient auprès des
                  organisations professionnelles et des entreprises.
                </p>
                <p>
                  Deux promotions ont été conduites jusqu’au Brevet de Technicien Supérieur et présentées à
                  l’examen d’État. Le cycle Licence ouvre en première année à la rentrée 2026, sous agrément.
                </p>
              </div>

              <div className="mt-10 grid gap-4 sm:grid-cols-2">
                {[
                  {
                    titre: 'L’université',
                    corps: 'BTS et Licence, plusieurs filières et options, formations qualifiantes courtes.',
                    href: '/formations',
                    action: 'Voir les formations',
                  },
                  {
                    titre: 'Le cabinet',
                    corps: 'Expertise technique et formation continue pour les organisations agricoles.',
                    href: '/expertise',
                    action: 'Voir l’offre d’expertise',
                  },
                ].map((bloc) => (
                  <Link
                    key={bloc.titre}
                    href={bloc.href}
                    className="group/bloc rounded-card-lg border border-graphite-100 bg-paper-tint p-6 transition-[transform,border-color,box-shadow] duration-500 ease-[var(--ease-arc)] hover:[transform:translateY(-0.25rem)] hover:border-ink-100 hover:shadow-raise"
                  >
                    <p className="font-display text-[1.125rem] text-ink-800">{bloc.titre}</p>
                    <p className="mt-2 text-[0.9375rem] leading-relaxed text-graphite-500">{bloc.corps}</p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-[0.875rem] font-semibold text-ink-700">
                      {bloc.action}
                      <IconArrowRight className="h-4 w-4 transition-transform duration-300 ease-[var(--ease-arc)] group-hover/bloc:[transform:translateX(0.25rem)]" />
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            <Photo
              photo={PHOTOS.alleeBatiments}
              ratio="aspect-[4/5]"
              sizes="(max-width: 1024px) 100vw, 32vw"
              className="reveal"
            />
          </div>
        </Container>
      </Section>

      {/* ---------------------------------------------------------- Chiffres clés */}
      <Section tone="ink" id="chiffres" className="py-16 lg:py-20">
        <Container>
          <SectionHeading
            eyebrow="Chiffres clés"
            title="L’école en chiffres"
            tone="light"
            lead="Chaque chiffre indique d’où il vient. Vous pouvez les vérifier."
            className="mb-12"
          />
          <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {CHIFFRES_CLES.map((chiffre, index) => {
              const trouve = chiffre.valeur.match(/^(\d+)(.*)$/);
              return (
                <li
                  key={chiffre.libelle}
                  className="reveal border-t border-paper/15 pt-6"
                  style={{ ['--reveal-delay' as string]: `${index * 80}ms` }}
                >
                  <p className="font-display text-[3rem] leading-none text-gold-400 tabular-nums">
                    {trouve?.[1] ? <CountUp value={Number(trouve[1])} suffix={trouve[2] ?? ''} /> : chiffre.valeur}
                  </p>
                  <p className="mt-4 text-[0.9375rem] leading-snug text-ink-100">{chiffre.libelle}</p>
                  <p className="mt-2 text-[0.6875rem] uppercase tracking-[0.1em] text-ink-400">{chiffre.source}</p>
                </li>
              );
            })}
          </ul>
        </Container>
      </Section>

      {/* ---------------------------------------------------- Vision et valeurs */}
      <Section tone="paper" id="vision">
        <Container>
          <SectionHeading
            eyebrow="Vision, mission et valeurs"
            title="Ce en quoi nous croyons"
            align="center"
            className="mb-14"
          />

          {/* La vision et la mission sont reproduites dans les termes exacts de
              l'établissement. On ne les reformule pas : c'est sa parole. */}
          <div className="mb-14 grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
            <div className="reveal rounded-card-lg bg-ink-900 p-7 sm:p-9">
              <p className="inline-flex items-center gap-2 text-[0.6875rem] font-bold tracking-[0.18em] text-gold-400 uppercase">
                <StarMark className="h-2.5 w-2.5" />
                {VISION.titre}
              </p>
              <div className="mt-5 flex flex-col gap-4">
                {VISION.texte.map((paragraphe, index) => (
                  <p
                    key={paragraphe.slice(0, 32)}
                    className={
                      index === 0
                        ? 'font-display text-[1.25rem] leading-snug text-paper sm:text-[1.5rem]'
                        : 'text-[0.9375rem] leading-relaxed text-ink-200'
                    }
                  >
                    {paragraphe}
                  </p>
                ))}
              </div>
            </div>

            <div className="reveal rounded-card-lg border border-graphite-100 bg-paper-tint p-7 sm:p-9">
              <p className="inline-flex items-center gap-2 text-[0.6875rem] font-bold tracking-[0.18em] text-ink-700 uppercase">
                <StarMark className="h-2.5 w-2.5 text-gold-400" />
                {MISSION.titre}
              </p>
              <p className="mt-5 font-display text-[1.25rem] leading-snug text-ink-800 sm:text-[1.375rem]">
                {MISSION.texte}
              </p>
              <span className="rule-gold mt-6" />
              <p className="mt-6 text-[0.875rem] leading-relaxed text-graphite-500">
                Nos quatre valeurs découlent de cette mission. Elles sont ci-dessous.
              </p>
            </div>
          </div>

          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {VALEURS.map((valeur, index) => (
              <li
                key={valeur.titre}
                className="reveal relative overflow-hidden rounded-card-lg border border-graphite-100 bg-paper-tint p-7"
                style={{ ['--reveal-delay' as string]: `${index * 70}ms` }}
              >
                <LeafSprig aria-hidden="true" className="h-6 w-6 text-gold-500" />
                <h3 className="mt-5 text-[1.25rem] leading-snug text-ink-800">{valeur.titre}</h3>
                <p className="mt-3 text-[0.9375rem] leading-relaxed text-graphite-500">{valeur.corps}</p>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      {/* -------------------------------------------------- Mot de la directrice */}
      <Section tone="tint" id="direction">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:gap-16">
            <div className="reveal">
              <MediaPlaceholder sujet="Portrait de la direction" ratio="aspect-[3/4]" />
            </div>
            <div>
              <SectionHeading eyebrow="Mot de la directrice" title="Le mot de la directrice" />
              <IconQuote aria-hidden="true" className="mt-8 h-8 w-8 text-gold-300" />
              <div className="mt-4 flex flex-col gap-5 font-display text-[1.125rem] leading-relaxed text-ink-800 sm:text-[1.25rem]">
                {MOT_DIRECTION.texte.map((paragraphe) => (
                  <p key={paragraphe.slice(0, 32)}>{paragraphe}</p>
                ))}
              </div>
              <div className="mt-8 border-t border-graphite-200 pt-5">
                <p className="font-display text-[1.125rem] leading-snug text-ink-800">
                  {MOT_DIRECTION.auteur ?? MOT_DIRECTION.fonction}
                </p>
                {MOT_DIRECTION.auteur ? (
                  <p className="mt-1 text-[0.875rem] text-graphite-500">{MOT_DIRECTION.fonction}</p>
                ) : null}
              </div>
              <DonneeManquante
                className="mt-6"
                quoi="Portrait de la directrice : à transmettre par la direction avant publication."
                action={null}
              />
            </div>
          </div>
        </Container>
      </Section>

      {/* ------------------------------------------------------------ Agréments */}
      <Section tone="paper" id="agrements">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <SectionHeading
                eyebrow="Agréments et reconnaissance"
                title="Nos agréments"
                lead="Nous ne publions que ce que nous pouvons prouver. Les numéros officiels seront affichés ici dès leur transmission."
              />
              <ul className="mt-9 flex flex-col gap-4">
                {AGREMENTS.map((agrement) => (
                  <li
                    key={agrement.intitule}
                    className="rounded-card-lg border border-graphite-100 bg-paper-tint p-6"
                  >
                    <div className="flex items-start gap-3">
                      <IconShield aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-gold-600" />
                      <div>
                        <p className="font-display text-[1.0625rem] text-ink-800">{agrement.intitule}</p>
                        <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-graphite-500">
                          {agrement.detail}
                        </p>
                        <p className="mt-3">
                          <Pill tone={agrement.statut === 'verifie' ? 'neutral' : 'outline'}>
                            {agrement.statut === 'verifie' ? 'Établi' : 'À confirmer'}
                          </Pill>
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              <DonneeManquante
                className="mt-6"
                quoi="Numéros d'agrément, statut juridique et attestation de reconnaissance des diplômes : à publier dès transmission des références officielles."
                action={null}
              />
            </div>

            <div id="resultats">
              <SectionHeading eyebrow="Résultats aux examens" title="Nos résultats" />
              <div className="mt-9 rounded-card-lg border border-graphite-100 bg-paper p-7">
                <p className="text-[1.0625rem] leading-relaxed text-graphite-600">
                  Notre BTS se termine par un examen d’État : le diplôme est le même que celui
                  délivré partout ailleurs en Côte d’Ivoire. Deux promotions l’ont déjà présenté.
                </p>
                <DonneeManquante
                  className="mt-6"
                  quoi="Taux de réussite par promotion, par filière et par année : à publier dès transmission des procès-verbaux par la direction des études."
                  action={null}
                />
              </div>

              <div id="gouvernance" className="mt-10">
                <SectionHeading eyebrow="Gouvernance" title="Qui fait quoi" />
                <ul className="mt-8 flex flex-col divide-y divide-graphite-100">
                  {GOUVERNANCE.map((instance) => (
                    <li key={instance.instance} className="flex flex-col gap-1 py-4 sm:flex-row sm:gap-6">
                      <p className="w-56 shrink-0 font-display text-[1rem] text-ink-800">{instance.instance}</p>
                      <p className="text-[0.9375rem] leading-snug text-graphite-500">{instance.role}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* ------------------------------------------------------------- Renvois */}
      <Section tone="tint" className="py-16 lg:py-20">
        <Container>
          <ul className="grid gap-5 md:grid-cols-3">
            {[
              {
                icone: IconUsers,
                titre: 'Équipe et annuaire',
                corps: 'Enseignants, experts et responsables académiques.',
                href: '/universite/equipe',
              },
              {
                icone: IconBuilding,
                titre: 'Campus et infrastructures',
                corps: 'Salles, laboratoires, parcelles et unités de production.',
                href: '/campus#infrastructures',
              },
              {
                icone: IconShield,
                titre: 'International et partenariats',
                corps: 'Accords, mobilité et parcours « devenir partenaire ».',
                href: '/international',
              },
            ].map((lien, index) => {
              const Icone = lien.icone;
              return (
                <li key={lien.titre} className="reveal" style={{ ['--reveal-delay' as string]: `${index * 70}ms` }}>
                  <Link
                    href={lien.href}
                    className="group/lien relative flex h-full flex-col overflow-hidden rounded-card-lg border border-graphite-100 bg-paper p-7 transition-[transform,border-color,box-shadow] duration-500 ease-[var(--ease-arc)] hover:[transform:translateY(-0.25rem)] hover:border-ink-100 hover:shadow-lift"
                  >
                    <LaurelWreath
                      className="pointer-events-none absolute -right-14 -top-14 h-40 w-40 text-ink-700/[0.04]"
                      leaves={9}
                    />
                    <Icone className="relative h-6 w-6 text-ink-700" />
                    <p className="relative mt-5 font-display text-[1.125rem] text-ink-800">{lien.titre}</p>
                    <p className="relative mt-2 flex-1 text-[0.9375rem] leading-relaxed text-graphite-500">
                      {lien.corps}
                    </p>
                    <span className="relative mt-5 inline-flex items-center gap-1.5 text-[0.875rem] font-semibold text-ink-700">
                      Consulter
                      <IconArrowRight className="h-4 w-4 transition-transform duration-300 ease-[var(--ease-arc)] group-hover/lien:[transform:translateX(0.25rem)]" />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Container>
      </Section>
    </>
  );
}
