import type { Metadata } from 'next';
import Link from 'next/link';
import { IconArrowRight, IconCalendar } from '@/components/brand/icons';
import { PageHero } from '@/components/layout/page-hero';
import { ButtonLink } from '@/components/ui/button';
import { MediaPlaceholder } from '@/components/ui/media-placeholder';
import { Container, Pill, Section } from '@/components/ui/primitives';
import { actualitesPubliees } from '@/lib/contenus-publies';
import { LIBELLE_CATEGORIE } from '@/lib/publications';
import { formatDate } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Actualités',
  description:
    "L'actualité de FOANI International Training College : ouverture du cycle Licence, campagne de candidature, ressources techniques et vie de l'établissement.",
  alternates: { canonical: '/actualites' },
};

export default async function PageActualites() {
  const actualites = await actualitesPubliees();
  const categories = Array.from(new Set(actualites.map((actualite) => actualite.categorie)));

  return (
    <>
      <PageHero
        eyebrow="Actualités"
        titre="Nos actualités"
        lead="Les nouvelles de l’école : ouvertures de formation, campagnes d’inscription et rendez-vous à venir."
        fil={[{ libelle: 'Actualités' }]}
        tone="tint"
        actions={
          <ButtonLink href="/evenements" variant="ink" size="lg" icon={<IconCalendar />} trailing={<IconArrowRight />}>
            Voir les événements
          </ButtonLink>
        }
      />

      <Section tone="paper">
        <Container>
          <div className="mb-12 flex flex-wrap gap-2">
            {categories.map((categorie) => (
              <Pill key={categorie} tone="outline">
                {LIBELLE_CATEGORIE[categorie] ?? categorie}
              </Pill>
            ))}
          </div>

          <ul className="flex flex-col gap-6">
            {actualites.map((actualite, index) => (
              <li key={actualite.slug} className="reveal" style={{ ['--reveal-delay' as string]: `${index * 60}ms` }}>
                <article className="group/article relative grid gap-6 overflow-hidden rounded-card-lg border border-graphite-100 bg-paper transition-[transform,border-color,box-shadow] duration-500 ease-[var(--ease-arc)] hover:[transform:translateY(-0.25rem)] hover:border-ink-100 hover:shadow-lift md:grid-cols-[minmax(0,18rem)_minmax(0,1fr)]">
                  <MediaPlaceholder
                    sujet={`Illustration — ${actualite.titre}`}
                    ratio="aspect-[16/10] md:aspect-auto md:h-full"
                    className="rounded-none"
                  />
                  <div className="p-7 md:py-8 md:pl-2 md:pr-8">
                    <div className="flex flex-wrap items-center gap-3">
                      <Pill tone="neutral">{LIBELLE_CATEGORIE[actualite.categorie] ?? actualite.categorie}</Pill>
                      <time dateTime={actualite.date} className="text-[0.8125rem] text-graphite-500">
                        {formatDate(actualite.date)}
                      </time>
                    </div>
                    <h2 className="mt-4 text-[1.5rem] leading-snug text-ink-800">
                      <Link href={`/actualites/${actualite.slug}`} className="after:absolute after:inset-0">
                        {actualite.titre}
                      </Link>
                    </h2>
                    <p className="mt-3 text-[0.9375rem] leading-relaxed text-graphite-500">{actualite.chapo}</p>
                    <span className="mt-5 inline-flex items-center gap-1.5 text-[0.875rem] font-semibold text-ink-700">
                      Lire l’article
                      <IconArrowRight className="h-4 w-4 transition-transform duration-300 ease-[var(--ease-arc)] group-hover/article:[transform:translateX(0.25rem)]" />
                    </span>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        </Container>
      </Section>
    </>
  );
}
