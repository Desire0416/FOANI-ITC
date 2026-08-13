import type { Metadata } from 'next';
import Link from 'next/link';
import { LeafSprig } from '@/components/brand/marks';
import { PageHero } from '@/components/layout/page-hero';
import { Container, Section } from '@/components/ui/primitives';
import { CYCLE_LABELS, FORMATIONS, titreComplet } from '@/content/formations';
import { actualitesPubliees } from '@/lib/contenus-publies';
import { RESSOURCES } from '@/content/ressources';
import { NAVIGATION, PIED_LEGAL } from '@/content/site';

export const metadata: Metadata = {
  title: 'Plan du site',
  description: 'Toutes les pages du portail de FOANI International Training College, rubrique par rubrique.',
  alternates: { canonical: '/plan-du-site' },
};

export default async function PagePlan() {
  const actualites = await actualitesPubliees(200);

  return (
    <>
      <PageHero
        eyebrow="Plan du site"
        titre="Plan du site"
        lead="Toutes les pages du site, rassemblées ici."
        fil={[{ libelle: 'Plan du site' }]}
        tone="tint"
      />

      <Section tone="paper">
        <Container>
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3">
            {NAVIGATION.map((rubrique) => (
              <section key={rubrique.libelle}>
                <h2 className="text-[1.25rem] leading-snug text-ink-800">
                  <Link href={rubrique.href} className="link-underline">
                    {rubrique.libelle}
                  </Link>
                </h2>
                <span className="rule-gold mt-3" />
                <ul className="mt-5 flex flex-col gap-2">
                  {rubrique.colonnes.flatMap((colonne) =>
                    colonne.liens.map((lien) => (
                      <li key={`${colonne.titre}-${lien.href}-${lien.libelle}`}>
                        <Link
                          href={lien.href}
                          className="flex items-start gap-2.5 text-[0.9375rem] leading-snug text-graphite-600 transition-colors hover:text-ink-700"
                        >
                          <LeafSprig aria-hidden="true" className="mt-1 h-3 w-3 shrink-0 text-gold-500" />
                          {lien.libelle}
                        </Link>
                      </li>
                    )),
                  )}
                </ul>
              </section>
            ))}

            <section>
              <h2 className="text-[1.25rem] leading-snug text-ink-800">Services et informations</h2>
              <span className="rule-gold mt-3" />
              <ul className="mt-5 flex flex-col gap-2">
                {[
                  { libelle: 'Candidater', href: '/candidature' },
                  { libelle: 'Espace numérique', href: '/espace-numerique' },
                  { libelle: 'Recherche', href: '/recherche' },
                  { libelle: 'Contact et accès', href: '/contact' },
                  { libelle: 'Espace presse', href: '/presse' },
                  { libelle: 'International et partenariats', href: '/international' },
                  ...PIED_LEGAL,
                ].map((lien) => (
                  <li key={lien.href}>
                    <Link
                      href={lien.href}
                      className="flex items-start gap-2.5 text-[0.9375rem] leading-snug text-graphite-600 transition-colors hover:text-ink-700"
                    >
                      <LeafSprig aria-hidden="true" className="mt-1 h-3 w-3 shrink-0 text-gold-500" />
                      {lien.libelle}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </Container>
      </Section>

      <Section tone="tint">
        <Container>
          <h2 className="text-[1.5rem] leading-snug text-ink-800">Toutes les formations</h2>
          <span className="rule-gold mt-3" />
          <ul className="mt-8 grid gap-x-8 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
            {FORMATIONS.map((formation) => (
              <li key={formation.slug}>
                <Link
                  href={`/formations/${formation.slug}`}
                  className="flex items-start gap-2.5 text-[0.9375rem] leading-snug text-graphite-600 transition-colors hover:text-ink-700"
                >
                  <span className="mt-0.5 shrink-0 text-[0.6875rem] font-bold uppercase tracking-[0.08em] text-gold-700">
                    {CYCLE_LABELS[formation.cycle]}
                  </span>
                  {titreComplet(formation)}
                </Link>
              </li>
            ))}
          </ul>

          <h2 className="mt-16 text-[1.5rem] leading-snug text-ink-800">Ressources agricoles</h2>
          <span className="rule-gold mt-3" />
          <ul className="mt-8 grid gap-x-8 gap-y-2 sm:grid-cols-2">
            {RESSOURCES.map((ressource) => (
              <li key={ressource.slug}>
                <Link
                  href={`/ressources/${ressource.slug}`}
                  className="flex items-start gap-2.5 text-[0.9375rem] leading-snug text-graphite-600 transition-colors hover:text-ink-700"
                >
                  <LeafSprig aria-hidden="true" className="mt-1 h-3 w-3 shrink-0 text-gold-500" />
                  {ressource.titre}
                </Link>
              </li>
            ))}
          </ul>

          <h2 className="mt-16 text-[1.5rem] leading-snug text-ink-800">Actualités</h2>
          <span className="rule-gold mt-3" />
          <ul className="mt-8 grid gap-x-8 gap-y-2 sm:grid-cols-2">
            {actualites.map((actualite) => (
              <li key={actualite.slug}>
                <Link
                  href={`/actualites/${actualite.slug}`}
                  className="flex items-start gap-2.5 text-[0.9375rem] leading-snug text-graphite-600 transition-colors hover:text-ink-700"
                >
                  <LeafSprig aria-hidden="true" className="mt-1 h-3 w-3 shrink-0 text-gold-500" />
                  {actualite.titre}
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </Section>
    </>
  );
}
