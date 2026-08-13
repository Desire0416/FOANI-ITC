import { IconArrowRight, IconSearch } from '@/components/brand/icons';
import { LaurelWreath, LeafSprig } from '@/components/brand/marks';
import { ButtonLink } from '@/components/ui/button';
import { Container } from '@/components/ui/primitives';

export const metadata = {
  title: 'Page introuvable',
  robots: { index: false, follow: true },
};

/**
 * Une page d'erreur est un moment d'orientation, pas un cul-de-sac (§18.2 :
 * « les écrans vides, les erreurs et les attentes sont traités comme des
 * moments d'orientation, avec une indication de ce qu'il convient de faire »).
 */
export default function Introuvable() {
  return (
    <div className="relative flex min-h-[70vh] items-center overflow-hidden bg-paper-tint pb-20 pt-40">
      <LaurelWreath
        className="pointer-events-none absolute -right-24 top-10 h-[32rem] w-[32rem] text-ink-700/[0.05]"
        leaves={13}
      />
      <Container className="relative max-w-2xl text-center">
        <LeafSprig aria-hidden="true" className="mx-auto h-10 w-10 text-gold-400" />
        <p className="mt-8 font-display text-[4rem] leading-none text-ink-700">404</p>
        <h1 className="mt-4 text-[2rem] leading-tight text-ink-800 sm:text-[2.5rem]">
          Cette page n’existe pas
        </h1>
        <span className="rule-gold mx-auto mt-6" />
        <p className="mx-auto mt-6 max-w-lg text-[1.0625rem] leading-relaxed text-graphite-500">
          L’adresse a peut-être changé. Essayez la recherche : elle couvre les formations, les rubriques et
          les fiches techniques.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/recherche" variant="ink" size="lg" icon={<IconSearch />} trailing={<IconArrowRight />}>
            Lancer une recherche
          </ButtonLink>
          <ButtonLink href="/formations" variant="outline" size="lg">
            Voir les formations
          </ButtonLink>
          <ButtonLink href="/" variant="ghost" size="lg">
            Retour à l’accueil
          </ButtonLink>
        </div>
      </Container>
    </div>
  );
}
