import Link from 'next/link';
import type { ReactNode } from 'react';
import { IconArrowRight } from '@/components/brand/icons';
import { LeafSprig } from '@/components/brand/marks';
import { PageHero } from '@/components/layout/page-hero';
import { Container, Section } from '@/components/ui/primitives';

/* ==========================================================================
   Gabarit de page rédactionnelle
   --------------------------------------------------------------------------
   Sert les pages légales et informatives.

   La page occupe toute la largeur, mais la colonne de lecture reste bornée :
   une ligne de mille pixels ne se lit pas. La largeur disponible sert donc à
   autre chose — un sommaire ancré, qui suit le défilement et indique où l'on
   se trouve dans un document long. C'est la seule façon d'occuper l'écran
   sans dégrader la lecture.
   ========================================================================== */

export type BlocTexte = {
  readonly titre: string;
  readonly corps: readonly (string | ReactNode)[];
};

/** Identifiant d'ancre stable, dérivé du titre. */
function ancre(titre: string, index: number): string {
  const base = titre
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return base ? `${base}` : `section-${index}`;
}

export function PageTexte({
  eyebrow,
  titre,
  lead,
  blocs,
  note,
}: {
  eyebrow: string;
  titre: string;
  lead?: string;
  blocs: readonly BlocTexte[];
  note?: ReactNode;
}) {
  return (
    <>
      <PageHero eyebrow={eyebrow} titre={titre} lead={lead} fil={[{ libelle: titre }]} tone="tint" />

      <Section tone="paper">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[minmax(0,17rem)_minmax(0,1fr)] lg:gap-16 xl:grid-cols-[minmax(0,17rem)_minmax(0,1fr)_minmax(0,19rem)] xl:gap-14">
            {/* ------------------------------------------------------ Sommaire */}
            <nav aria-label="Sommaire de la page" className="lg:sticky lg:top-32 lg:self-start">
              <p className="text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-graphite-600">
                Sur cette page
              </p>
              <span className="rule-gold mt-3" />
              <ol className="mt-5 flex flex-col gap-2.5">
                {blocs.map((bloc, index) => (
                  <li key={bloc.titre}>
                    <a
                      href={`#${ancre(bloc.titre, index)}`}
                      className="flex items-start gap-2.5 text-[0.875rem] leading-snug text-graphite-600 transition-colors hover:text-ink-700"
                    >
                      <LeafSprig aria-hidden="true" className="mt-1 h-3 w-3 shrink-0 text-gold-500" />
                      {bloc.titre}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>

            {/* --------------------------------------------------------- Corps */}
            <div>
              <div className="flex max-w-3xl flex-col gap-12">
                {blocs.map((bloc, index) => (
                  <section
                    key={bloc.titre}
                    id={ancre(bloc.titre, index)}
                    className="reveal scroll-mt-32"
                    style={{ ['--reveal-delay' as string]: `${index * 40}ms` }}
                  >
                    <h2 className="flex items-baseline gap-3 text-[1.5rem] leading-snug text-ink-800">
                      <LeafSprig aria-hidden="true" className="h-4 w-4 shrink-0 translate-y-0.5 text-gold-500" />
                      {bloc.titre}
                    </h2>
                    <div className="mt-4 flex flex-col gap-4 border-l-2 border-graphite-100 pl-5">
                      {bloc.corps.map((paragraphe, position) =>
                        typeof paragraphe === 'string' ? (
                          <p key={position} className="text-[1rem] leading-relaxed text-graphite-600">
                            {paragraphe}
                          </p>
                        ) : (
                          <div key={position} className="text-[1rem] leading-relaxed text-graphite-600">
                            {paragraphe}
                          </div>
                        ),
                      )}
                    </div>
                  </section>
                ))}
              </div>

              {note ? (
                <p className="mt-14 max-w-3xl rounded-card border border-graphite-100 bg-paper-tint px-5 py-4 text-[0.8125rem] leading-relaxed text-graphite-500">
                  {note}
                </p>
              ) : null}
            </div>

            {/* --------------------------------------------------------- Encart
                Une page légale n'est presque jamais lue en entier : elle est
                consultée pour une question précise. Le moyen de la poser reste
                donc visible tout du long. */}
            <aside className="hidden xl:sticky xl:top-32 xl:block xl:self-start">
              <div className="rounded-card-lg border border-graphite-100 bg-paper-tint p-6">
                <p className="text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-graphite-600">
                  Une question sur cette page&nbsp;?
                </p>
                <span className="rule-gold mt-3" />
                <p className="mt-4 text-[0.875rem] leading-relaxed text-graphite-600">
                  Signalez une erreur, demandez une précision ou exercez vos droits sur vos données&nbsp;: la
                  demande est transmise au service concerné.
                </p>
                <Link
                  href="/contact"
                  className="mt-5 inline-flex h-11 items-center gap-2 rounded-pill bg-ink-800 px-5 text-[0.875rem] font-semibold text-paper transition-colors hover:bg-ink-700"
                >
                  Nous écrire
                  <IconArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </aside>
          </div>
        </Container>
      </Section>
    </>
  );
}
