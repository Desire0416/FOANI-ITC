import type { Metadata } from 'next';
import { IconArrowRight, IconCalendar, IconPin } from '@/components/brand/icons';
import { LeafSprig } from '@/components/brand/marks';
import { PageHero } from '@/components/layout/page-hero';
import { ButtonLink } from '@/components/ui/button';
import { Container, Pill, Section } from '@/components/ui/primitives';
import { evenementsPublies } from '@/lib/contenus-publies';
import { formatDate } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Événements',
  description:
    "Les rendez-vous de FOANI-ITC : rentrée académique du 5 octobre 2026, journées portes ouvertes et manifestations sur le campus d'Agnibilékrou.",
  alternates: { canonical: '/evenements' },
};

export default async function PageEvenements() {
  const evenements = await evenementsPublies();

  return (
    <>
      <PageHero
        eyebrow="Événements"
        titre="Nos rendez-vous"
        lead="Rentrée, portes ouvertes et autres événements sur le campus. Quand la date n’est pas encore fixée, nous le disons."
        fil={[{ libelle: 'Événements' }]}
        tone="tint"
      />

      <Section tone="paper">
        <Container>
          <ul className="flex flex-col gap-5">
            {evenements.map((evenement, index) => (
              <li key={evenement.slug} className="reveal" style={{ ['--reveal-delay' as string]: `${index * 70}ms` }}>
                <article className="grid gap-6 rounded-card-lg border border-graphite-100 bg-paper-tint p-7 md:grid-cols-[minmax(0,12rem)_minmax(0,1fr)] md:items-center md:gap-10">
                  <div className="flex items-center gap-4 md:flex-col md:items-start">
                    {evenement.date ? (
                      <>
                        <p className="font-display text-[3rem] leading-none text-ink-700 tabular-nums">
                          {new Intl.DateTimeFormat('fr-FR', {
                            day: '2-digit',
                            timeZone: 'Africa/Abidjan',
                          }).format(new Date(evenement.date))}
                        </p>
                        <p className="text-[0.9375rem] font-semibold uppercase tracking-[0.1em] text-gold-700">
                          {new Intl.DateTimeFormat('fr-FR', {
                            month: 'long',
                            year: 'numeric',
                            timeZone: 'Africa/Abidjan',
                          }).format(new Date(evenement.date))}
                        </p>
                      </>
                    ) : (
                      <div>
                        <LeafSprig aria-hidden="true" className="h-7 w-7 text-gold-400" />
                        <p className="mt-3 text-[0.9375rem] font-semibold text-graphite-500">Date à confirmer</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2.5">
                      {evenement.inscriptionRequise ? <Pill tone="gold">Inscription requise</Pill> : null}
                      {/* Un événement annoncé sans date le dit lui-même : c'est
                          le champ vide qui porte l'information, plus un statut
                          éditorial à tenir à jour à la main. */}
                      {evenement.date === null ? <Pill tone="outline">À programmer</Pill> : null}
                    </div>
                    <h2 className="mt-3 text-[1.5rem] leading-snug text-ink-800">{evenement.titre}</h2>
                    <p className="mt-3 text-[0.9375rem] leading-relaxed text-graphite-500">{evenement.resume}</p>
                    <p className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[0.875rem] text-graphite-500">
                      <span className="inline-flex items-center gap-2">
                        <IconPin aria-hidden="true" className="h-4 w-4 text-gold-600" />
                        {evenement.lieu}
                      </span>
                      {evenement.date ? (
                        <span className="inline-flex items-center gap-2">
                          <IconCalendar aria-hidden="true" className="h-4 w-4 text-gold-600" />
                          {formatDate(evenement.date, { weekday: 'long' })}
                        </span>
                      ) : null}
                    </p>
                    {evenement.inscriptionRequise ? (
                      <ButtonLink
                        href={`/contact?sujet=evenement&evenement=${evenement.slug}`}
                        variant="outline"
                        size="sm"
                        className="mt-5"
                        trailing={<IconArrowRight />}
                      >
                        Être prévenu de la date
                      </ButtonLink>
                    ) : null}
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
