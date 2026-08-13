import type { Metadata } from 'next';
import Link from 'next/link';
import { IconArrowRight, IconLeafPair } from '@/components/brand/icons';
import { PageHero } from '@/components/layout/page-hero';
import { ButtonLink } from '@/components/ui/button';
import { Container, Pill, Section, SectionHeading } from '@/components/ui/primitives';
import { FILIERES, RESSOURCES } from '@/content/ressources';
import { getFormation, titreComplet } from '@/content/formations';
import { formatDate } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Ressources agricoles',
  description:
    "Fiches techniques agricoles en accès libre : calendrier cultural du cacaoyer, démarrage d'un atelier avicole, qualité de l'eau en pisciculture, post-récolte de l'anacarde, compostage et conduite de la saignée de l'hévéa.",
  alternates: { canonical: '/ressources' },
};

export default function PageRessources() {
  return (
    <>
      <PageHero
        eyebrow="Ressources agricoles"
        titre="Nos fiches techniques"
        lead="Des conseils pratiques, gratuits, pour ceux qui produisent. Chaque fiche vous indique la formation qui va plus loin sur le sujet."
        fil={[{ libelle: 'Ressources agricoles' }]}
        tone="tint"
        actions={
          <ButtonLink href="/formations?cycle=certificat" variant="ink" size="lg" trailing={<IconArrowRight />}>
            Voir les formations courtes
          </ButtonLink>
        }
      />

      <Section tone="paper">
        <Container>
          <div className="mb-12 flex flex-wrap gap-2">
            {FILIERES.map((filiere) => (
              <Pill key={filiere} tone="outline">
                {filiere}
              </Pill>
            ))}
          </div>

          <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {RESSOURCES.map((ressource, index) => {
              const formation = ressource.formationLiee ? getFormation(ressource.formationLiee) : undefined;
              return (
                <li key={ressource.slug} className="reveal" style={{ ['--reveal-delay' as string]: `${index * 60}ms` }}>
                  <article className="group/fiche relative flex h-full flex-col overflow-hidden rounded-card-lg border border-graphite-100 bg-paper-warm p-6 transition-[transform,box-shadow,border-color] duration-500 ease-[var(--ease-arc)] hover:[transform:translateY(-0.25rem)] hover:border-gold-200 hover:shadow-lift">
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute -right-14 -top-14 h-32 w-32 rounded-pill bg-gold-100/70 transition-transform duration-700 ease-[var(--ease-arc)] group-hover/fiche:[transform:scale(1.5)]"
                    />
                    <div className="relative flex items-center gap-3">
                      <IconLeafPair aria-hidden="true" className="h-5 w-5 text-gold-600" />
                      <Pill tone="gold">{ressource.filiere}</Pill>
                    </div>
                    <h2 className="relative mt-4 text-[1.25rem] leading-snug text-ink-800">
                      <Link href={`/ressources/${ressource.slug}`} className="after:absolute after:inset-0">
                        {ressource.titre}
                      </Link>
                    </h2>
                    <p className="relative mt-3 flex-1 text-[0.9375rem] leading-relaxed text-graphite-500">
                      {ressource.resume}
                    </p>
                    <div className="relative mt-5 border-t border-gold-200/60 pt-4">
                      {formation ? (
                        <p className="text-[0.8125rem] leading-snug text-graphite-500">
                          Formation liée&nbsp;:{' '}
                          <span className="font-semibold text-ink-800">{titreComplet(formation)}</span>
                        </p>
                      ) : null}
                      <p className="mt-2 text-[0.75rem] text-graphite-500">
                        Mise à jour&nbsp;: {formatDate(ressource.miseAJour)}
                      </p>
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        </Container>
      </Section>

      <Section tone="tint" className="py-16 lg:py-20">
        <Container>
          <div className="reveal rounded-card-lg border border-graphite-100 bg-paper px-6 py-14 text-center sm:px-12">
            <div className="mx-auto max-w-3xl">
          <SectionHeading
            eyebrow="Cette rubrique s’enrichit"
            title="Un sujet vous manque&nbsp;?"
            lead="Dites-nous quel sujet vous intéresse. Vos demandes orientent les prochaines fiches."
            align="center"
            className="mb-9"
          />
          <ButtonLink href="/contact?sujet=ressource" variant="ink" size="lg" trailing={<IconArrowRight />}>
            Proposer un sujet
          </ButtonLink>
          </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
