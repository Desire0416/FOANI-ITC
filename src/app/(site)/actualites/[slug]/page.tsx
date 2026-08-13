import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { IconArrowRight } from '@/components/brand/icons';
import { PageHero } from '@/components/layout/page-hero';
import { MediaPlaceholder } from '@/components/ui/media-placeholder';
import { Container, Pill, Section } from '@/components/ui/primitives';
import { ETABLISSEMENT } from '@/content/site';
import { actualitePubliee, actualitesPubliees } from '@/lib/contenus-publies';
import { LIBELLE_CATEGORIE } from '@/lib/publications';
import { formatDate } from '@/lib/utils';

type Params = { params: Promise<{ slug: string }> };

/* Les adresses sont celles des articles effectivement en ligne au moment de
   la construction. Un article publié ensuite est rendu à la demande, puis
   régénéré par l'action éditoriale. */
export async function generateStaticParams() {
  const actualites = await actualitesPubliees(200);
  return actualites.map((actualite) => ({ slug: actualite.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const actualite = await actualitePubliee(slug);
  if (!actualite) return { title: 'Article introuvable' };

  return {
    title: actualite.titre,
    description: actualite.chapo,
    alternates: { canonical: `/actualites/${actualite.slug}` },
    openGraph: {
      type: 'article',
      title: actualite.titre,
      description: actualite.chapo,
      publishedTime: actualite.date,
    },
  };
}

export default async function Article({ params }: Params) {
  const { slug } = await params;
  const actualite = await actualitePubliee(slug);
  if (!actualite) notFound();

  const toutes = await actualitesPubliees(200);
  const autres = toutes.filter((item) => item.slug !== actualite.slug).slice(0, 2);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: actualite.titre,
    description: actualite.chapo,
    datePublished: actualite.date,
    inLanguage: 'fr',
    publisher: { '@type': 'Organization', name: ETABLISSEMENT.nom },
  };

  return (
    <>
      <PageHero
        eyebrow={LIBELLE_CATEGORIE[actualite.categorie] ?? actualite.categorie}
        titre={actualite.titre}
        lead={actualite.chapo}
        fil={[{ libelle: 'Actualités', href: '/actualites' }, { libelle: actualite.titre }]}
      />

      <Section tone="paper">
        {/* La page occupe l'écran ; la colonne de lecture reste bornée. La
            largeur restante porte l'illustration et les repères de
            publication, au lieu d'être perdue en marges. */}
        <Container>
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:gap-20">
            <article className="max-w-3xl">
              <p className="text-[0.8125rem] text-graphite-500">
                Publié le{' '}
                <time dateTime={actualite.date}>{formatDate(actualite.date)}</time> — {ETABLISSEMENT.sigle}
              </p>

              <div className="mt-10 flex flex-col gap-5">
                {actualite.corps.map((paragraphe) => (
                  <p key={paragraphe.slice(0, 40)} className="text-[1.0625rem] leading-relaxed text-graphite-600">
                    {paragraphe}
                  </p>
                ))}
              </div>
            </article>

            <aside className="lg:sticky lg:top-32 lg:self-start">
              <MediaPlaceholder sujet={`Illustration — ${actualite.titre}`} ratio="aspect-[4/3]" />
              <div className="mt-5 rounded-card-lg border border-graphite-100 bg-paper-tint p-6">
                <p className="text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-graphite-600">
                  Rubrique
                </p>
                <p className="mt-3">
                  <Pill tone="neutral">{LIBELLE_CATEGORIE[actualite.categorie] ?? actualite.categorie}</Pill>
                </p>
                <p className="mt-5 border-t border-graphite-200 pt-4 text-[0.8125rem] leading-relaxed text-graphite-500">
                  Publié par {ETABLISSEMENT.nom}, {ETABLISSEMENT.ville}.
                </p>
              </div>
            </aside>
          </div>
        </Container>
      </Section>

      {autres.length > 0 ? (
        <Section tone="tint">
          <Container>
            <h2 className="mb-8 text-[1.5rem] leading-snug text-ink-800">À lire également</h2>
            <ul className="grid gap-4 md:grid-cols-2">
              {autres.map((autre) => (
                <li key={autre.slug}>
                  <Link
                    href={`/actualites/${autre.slug}`}
                    className="group/lien flex items-start justify-between gap-6 rounded-card-lg border border-graphite-100 bg-paper p-6 transition-[transform,border-color,box-shadow] duration-500 ease-[var(--ease-arc)] hover:[transform:translateY(-0.125rem)] hover:border-ink-100 hover:shadow-raise"
                  >
                    <div>
                      <Pill tone="neutral">{LIBELLE_CATEGORIE[autre.categorie] ?? autre.categorie}</Pill>
                      <p className="mt-3 font-display text-[1.125rem] leading-snug text-ink-800">{autre.titre}</p>
                    </div>
                    <IconArrowRight className="mt-1 h-5 w-5 shrink-0 text-gold-500 transition-transform duration-300 ease-[var(--ease-arc)] group-hover/lien:[transform:translateX(0.25rem)]" />
                  </Link>
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
