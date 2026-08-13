import { CountUp } from '@/components/motion/count-up';
import { Container } from '@/components/ui/primitives';
import { CHIFFRES_CLES } from '@/content/site';

/* ==========================================================================
   Chiffres clés — §8.9 puis §8.3 « datés et sourcés »
   --------------------------------------------------------------------------
   Chaque valeur affiche sa source au survol et en permanence sur mobile. Un
   chiffre sans provenance, sur le site d'un établissement supérieur, dessert
   celui qui le publie.
   ========================================================================== */

/** Sépare la partie numérique du suffixe (« 50+ » → 50 et « + »). */
function decouper(valeur: string): { nombre: number | null; suffixe: string } {
  const trouve = valeur.match(/^(\d+)(.*)$/);
  if (!trouve?.[1]) return { nombre: null, suffixe: valeur };
  return { nombre: Number(trouve[1]), suffixe: trouve[2] ?? '' };
}

export function Chiffres() {
  return (
    <section className="relative overflow-hidden border-y border-graphite-100 bg-paper py-14 lg:py-16">
      <Container>
        <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0">
          {CHIFFRES_CLES.map((chiffre, index) => {
            const { nombre, suffixe } = decouper(chiffre.valeur);
            return (
              <li
                key={chiffre.libelle}
                className="reveal group/chiffre relative lg:px-8 lg:first:pl-0 lg:last:pr-0 lg:[&:not(:first-child)]:border-l lg:[&:not(:first-child)]:border-graphite-100"
                style={{ ['--reveal-delay' as string]: `${index * 80}ms` }}
              >
                <p className="font-display text-[3rem] leading-none text-ink-700 tabular-nums sm:text-[3.5rem]">
                  {nombre === null ? (
                    chiffre.valeur
                  ) : (
                    <CountUp value={nombre} suffix={suffixe} />
                  )}
                </p>
                <span aria-hidden="true" className="mt-4 block h-[2px] w-8 rounded-pill bg-gold-400" />
                <p className="mt-4 max-w-[22rem] text-[0.9375rem] leading-snug text-graphite-600">
                  {chiffre.libelle}
                </p>
                <p className="mt-2 text-[0.6875rem] uppercase tracking-[0.1em] text-graphite-600">
                  {chiffre.source}
                </p>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
