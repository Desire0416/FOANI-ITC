import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { IconArrowRight, IconClock } from '@/components/brand/icons';
import { LeafSprig } from '@/components/brand/marks';
import { FormationCard } from '@/components/formation-card';
import { PageHero } from '@/components/layout/page-hero';
import { ButtonLink } from '@/components/ui/button';
import { Container, Pill, Section } from '@/components/ui/primitives';
import { getFormation } from '@/content/formations';
import { RESSOURCES, getRessource } from '@/content/ressources';
import { ETABLISSEMENT } from '@/content/site';
import { formatDate } from '@/lib/utils';

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return RESSOURCES.map((ressource) => ({ slug: ressource.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const ressource = getRessource(slug);
  if (!ressource) return { title: 'Fiche introuvable' };

  return {
    title: ressource.titre,
    description: ressource.resume,
    alternates: { canonical: `/ressources/${ressource.slug}` },
    openGraph: { type: 'article', title: ressource.titre, description: ressource.resume },
  };
}

export default async function FicheRessource({ params }: Params) {
  const { slug } = await params;
  const ressource = getRessource(slug);
  if (!ressource) notFound();

  const formation = ressource.formationLiee ? getFormation(ressource.formationLiee) : undefined;
  const autres = RESSOURCES.filter((autre) => autre.slug !== ressource.slug).slice(0, 3);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: ressource.titre,
    description: ressource.resume,
    dateModified: ressource.miseAJour,
    inLanguage: 'fr',
    publisher: { '@type': 'Organization', name: ETABLISSEMENT.nom },
  };

  return (
    <>
      <PageHero
        eyebrow={`Filière ${ressource.filiere}`}
        titre={ressource.titre}
        lead={ressource.resume}
        fil={[{ libelle: 'Ressources agricoles', href: '/ressources' }, { libelle: ressource.titre }]}
      />

      <Section tone="paper">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)] lg:gap-16">
            {/* ------------------------------------------------------- Corps */}
            <article>
              <p className="flex items-center gap-2 text-[0.8125rem] text-graphite-500">
                <IconClock aria-hidden="true" className="h-4 w-4" />
                Mise à jour&nbsp;: {formatDate(ressource.miseAJour)}
              </p>

              <div className="mt-10 flex flex-col gap-12">
                {ressource.sections.map((section, index) => (
                  <section key={section.titre} className="reveal" style={{ ['--reveal-delay' as string]: `${index * 50}ms` }}>
                    <h2 className="flex items-baseline gap-3 text-[1.5rem] leading-snug text-ink-800">
                      <LeafSprig aria-hidden="true" className="h-4 w-4 shrink-0 translate-y-0.5 text-gold-500" />
                      {section.titre}
                    </h2>
                    <div className="mt-5 flex flex-col gap-4 border-l-2 border-graphite-100 pl-5">
                      {section.corps.map((paragraphe) => (
                        <p key={paragraphe.slice(0, 40)} className="text-[1.0625rem] leading-relaxed text-graphite-600">
                          {paragraphe}
                        </p>
                      ))}
                    </div>
                  </section>
                ))}
              </div>

              <p className="mt-14 rounded-card border border-graphite-100 bg-paper-tint px-5 py-4 text-[0.8125rem] leading-relaxed text-graphite-500">
                Cette fiche présente des repères techniques généraux. Les itinéraires se raisonnent toujours à
                l’échelle d’une parcelle et d’un contexte. Pour un accompagnement sur votre exploitation, le
                cabinet de FOANI-ITC intervient sur devis.
              </p>
            </article>

            {/* ------------------------------------------------------ Colonne */}
            <aside className="flex flex-col gap-5 lg:sticky lg:top-32 lg:self-start">
              {formation ? (
                <div className="rounded-card-lg border border-graphite-100 bg-paper-warm p-6">
                  <p className="text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-gold-700">
                    Aller plus loin
                  </p>
                  <p className="mt-3 text-[0.9375rem] leading-relaxed text-graphite-600">
                    Ce sujet est traité en profondeur dans une formation de FOANI-ITC.
                  </p>
                  <div className="mt-5">
                    <FormationCard formation={formation} />
                  </div>
                </div>
              ) : null}

              <div className="rounded-card-lg bg-ink-900 p-6">
                <p className="text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-gold-400">
                  Besoin d’un appui technique&nbsp;?
                </p>
                <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-100">
                  Le cabinet accompagne les exploitations et les coopératives sur le terrain.
                </p>
                <ButtonLink href="/expertise#devis" variant="gold" size="sm" className="mt-5" trailing={<IconArrowRight />}>
                  Demander un devis
                </ButtonLink>
              </div>
            </aside>
          </div>
        </Container>
      </Section>

      {/* ---------------------------------------------------------- Autres fiches */}
      {autres.length > 0 ? (
        <Section tone="tint">
          <Container>
            <h2 className="mb-10 text-[1.75rem] leading-snug text-ink-800">Autres fiches techniques</h2>
            <ul className="grid gap-5 md:grid-cols-3">
              {autres.map((autre, index) => (
                <li key={autre.slug} className="reveal" style={{ ['--reveal-delay' as string]: `${index * 70}ms` }}>
                  <Link
                    href={`/ressources/${autre.slug}`}
                    className="group/autre flex h-full flex-col rounded-card-lg border border-graphite-100 bg-paper p-6 transition-[transform,border-color,box-shadow] duration-500 ease-[var(--ease-arc)] hover:[transform:translateY(-0.25rem)] hover:border-gold-200 hover:shadow-raise"
                  >
                    <Pill tone="gold">{autre.filiere}</Pill>
                    <h3 className="mt-4 text-[1.0625rem] leading-snug text-ink-800">{autre.titre}</h3>
                    <p className="mt-2 flex-1 text-[0.875rem] leading-relaxed text-graphite-500">{autre.resume}</p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-[0.8125rem] font-semibold text-gold-700">
                      Lire la fiche
                      <IconArrowRight className="h-4 w-4 transition-transform duration-300 ease-[var(--ease-arc)] group-hover/autre:[transform:translateX(0.25rem)]" />
                    </span>
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
