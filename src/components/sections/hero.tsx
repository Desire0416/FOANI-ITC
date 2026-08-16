import Image from 'next/image';
import {
  IconArrowRight,
  IconBriefcase,
  IconGraduation,
  IconIdea,
  IconInfo,
  IconSprout,
  IconTeacher,
} from '@/components/brand/icons';
import { ArcClipDef, ArcTrace, LaurelWreath, LeafSprig, StarMark } from '@/components/brand/marks';
import { ButtonLink } from '@/components/ui/button';
import { POURQUOI_FITC } from '@/content/institution';
import { PHOTOS } from '@/content/photos';
import { ETABLISSEMENT } from '@/content/site';

/* ==========================================================================
   Hero institutionnel — §8.9
   --------------------------------------------------------------------------
   Reprise de la maquette fournie, avec sa règle de composition :

   — la photographie touche le bord droit de l'écran. Rien ne la contient :
     c'est ce qui fait la différence entre une bannière et une ouverture ;
   — l'arc du laurier sépare le texte de l'image, doublé à l'extérieur d'un
     trait d'or qui empêche la découpe de ressembler à un masque ;
   — la carte de preuves est une réglette : icône, intitulé, filet or. Pas de
     paragraphe — le hero annonce, il n'explique pas. Le développement de ces
     quatre points est en section « Pourquoi FOANI-ITC ».

   La composition en deux colonnes n'apparaît qu'à partir de 1280 px, et la
   hauteur du hero est pilotée en `vw`. Les deux vont ensemble : le panneau
   photographique doit rester plus large que haut, sinon la découpe rogne le
   sujet par les côtés. En dessous, la photographie prend toute la largeur
   de l'écran — plus immersive encore, et le cadrage reste entier.

   La photographie est celle de l'ombrière de production végétale du campus.
   Elle a remplacé une vue de synthèse — trois personnes en blouse dans une
   serre industrielle — qui portait le logo de l'école sur des blouses que
   personne n'a jamais portées ici, et montrait une installation qui n'est pas
   la sienne. §9.3 l'interdisait déjà ; il ne manquait que la vraie image.
   ========================================================================== */

const ICONES = {
  sprout: IconSprout,
  teacher: IconTeacher,
  idea: IconIdea,
  briefcase: IconBriefcase,
} as const;

/** Même gouttière que le reste du portail, appliquée à gauche seulement. */
const GOUTTIERE_GAUCHE = 'pl-[clamp(1.25rem,4vw,4.5rem)]';
const GOUTTIERE_DROITE = 'pr-[clamp(1.25rem,4vw,4.5rem)]';

export function Hero() {
  return (
    <section className="relative isolate w-full overflow-hidden bg-paper-tint">
      <ArcClipDef id="arc-hero" />

      {/* Filigrane végétal côté texte — le même signe que dans le pied de page,
          à une échelle intermédiaire. */}
      <LaurelWreath
        className="pointer-events-none absolute -left-40 top-20 hidden h-[42rem] w-[42rem] text-ink-700/[0.05] xl:block"
        leaves={13}
      />

      <div className="grid grid-cols-1 xl:h-[clamp(36rem,44vw,52rem)] xl:grid-cols-[minmax(0,46%)_minmax(0,54%)]">
        {/* ------------------------------------------------ Colonne de texte
            `xl:pt-24` réserve la hauteur de l'en-tête flottant : sans elle, le
            centrage vertical fait passer le badge sous la carte de navigation. */}
        <div
          className={`relative z-10 flex flex-col justify-center pb-12 pt-28 sm:pt-32 xl:pb-10 xl:pt-24 ${GOUTTIERE_GAUCHE} ${GOUTTIERE_DROITE} xl:pr-14`}
        >
          <div className="max-w-2xl">
            <p
              className="inline-flex items-center gap-2.5 rounded-pill border border-graphite-200 bg-paper py-1.5 pl-1.5 pr-4 shadow-raise"
              style={{ animation: 'rise-in 0.7s var(--ease-arc) both' }}
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-pill bg-ink-800">
                <StarMark className="h-3.5 w-3.5 text-gold-400" />
              </span>
              <span className="text-[0.8125rem] font-semibold text-ink-800">{ETABLISSEMENT.sigle}</span>
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-pill bg-gold-400" />
              <span className="text-[0.8125rem] text-graphite-500">Université d’excellence</span>
            </p>

            {/* Deux lignes, comme sur la maquette. La coupure est décidée ici,
                et la taille est calée sur la ligne la plus longue :
                « Université 100 % » mesure 9,75 em dans cette fonte. À partir
                de `xl`, la colonne vaut 46 vw moins la gouttière — d'où un
                `clamp` en `vw` plutôt que des paliers, qui laisseraient le
                titre déborder juste avant chaque rupture. */}
            <h1
              className="mt-7 text-[2.05rem] uppercase leading-[0.98] tracking-[-0.02em] text-ink-800 sm:text-[3rem] xl:text-[clamp(2.2rem,3.6vw,3.75rem)]"
              style={{ animation: 'rise-in 0.8s var(--ease-arc) 0.08s both' }}
            >
              <span className="block whitespace-nowrap">Université 100 %</span>
              <span className="inline-flex items-center gap-3 whitespace-nowrap">
                agricole
                <LeafSprig
                  aria-hidden="true"
                  className="h-[0.6em] w-[0.6em] shrink-0 text-gold-400"
                  style={{ animation: 'sway 7s ease-in-out 1.2s infinite' }}
                />
              </span>
            </h1>

            <div
              className="mt-7 flex items-center gap-4"
              style={{ animation: 'rise-in 0.8s var(--ease-arc) 0.16s both' }}
            >
              <span aria-hidden="true" className="h-[3px] w-10 shrink-0 rounded-pill bg-gold-400" />
              <p className="font-display text-[1.125rem] italic leading-snug text-ink-800 sm:text-[1.375rem]">
                {ETABLISSEMENT.baseline}
              </p>
            </div>

            <p
              className="mt-6 max-w-xl text-[1.0625rem] leading-relaxed text-graphite-500 sm:text-[1.125rem]"
              style={{ animation: 'rise-in 0.8s var(--ease-arc) 0.24s both' }}
            >
              {ETABLISSEMENT.sigle} forme une nouvelle génération de leaders agricoles grâce à une pédagogie
              innovante, pratique et tournée vers l’avenir.
            </p>

            <div
              className="mt-9 flex flex-wrap gap-3"
              style={{ animation: 'rise-in 0.8s var(--ease-arc) 0.32s both' }}
            >
              <ButtonLink
                href="/formations"
                variant="ink"
                size="lg"
                icon={<IconGraduation />}
                trailing={<IconArrowRight />}
              >
                Découvrir nos formations
              </ButtonLink>
              <ButtonLink
                href="/contact"
                variant="outline"
                size="lg"
                icon={<IconInfo />}
                trailing={<IconArrowRight />}
              >
                Demander des informations
              </ButtonLink>
            </div>
          </div>
        </div>

        {/* --------------------------------------------------- Colonne média
            Elle touche le bord droit de l'écran : aucun conteneur ne
            l'enferme. Sur téléphone, l'arc ne peut pas séparer deux colonnes —
            il devient un seul angle adouci en haut à gauche. */}
        <div className="relative h-[75vw] max-h-[36rem] overflow-hidden rounded-tl-[3.5rem] sm:rounded-tl-[6rem] xl:h-full xl:max-h-none xl:overflow-visible xl:rounded-none">
          <ArcTrace
            className="absolute inset-0 z-10 hidden h-full w-full text-gold-400 xl:block"
            offset={0.055}
            animate
          />
          <div
            className="absolute inset-0 xl:[clip-path:url(#arc-hero)]"
            style={{ animation: 'rise-in 0.9s var(--ease-arc) 0.1s both' }}
          >
            <Image
              src={PHOTOS.serreMaraichage.src}
              alt={PHOTOS.serreMaraichage.alt}
              fill
              priority
              sizes="(max-width: 1280px) 100vw, 54vw"
              className="object-cover object-center"
            />
          </div>
        </div>
      </div>

      {/* ------------------------------------------------ Réglette de preuves
          Posée sur la photographie, alignée sur la gouttière droite. En dessous
          de `lg`, elle repasse dans le flux : superposée à une image de 62 vw,
          elle la masquerait. */}
      <div
        className={`relative z-20 -mt-12 pb-14 sm:-mt-16 xl:pointer-events-none xl:absolute xl:inset-x-0 xl:bottom-[clamp(1.5rem,4vw,4rem)] xl:mt-0 xl:pb-0 ${GOUTTIERE_GAUCHE} ${GOUTTIERE_DROITE}`}
      >
        <div className="xl:flex xl:justify-end">
          <ul className="pointer-events-auto grid grid-cols-2 gap-x-2 gap-y-6 rounded-card-lg border border-graphite-100 bg-paper/95 px-4 py-6 shadow-float backdrop-blur-sm sm:grid-cols-4 sm:gap-0 sm:px-2 sm:py-7 xl:w-[52%] xl:min-w-[34rem]">
            {POURQUOI_FITC.map((point, index) => {
              const Icone = ICONES[point.icone];
              return (
                <li
                  key={point.titre}
                  className="reveal flex flex-col items-center gap-3 px-2 text-center sm:px-4 sm:[&:not(:first-child)]:border-l sm:[&:not(:first-child)]:border-graphite-100"
                  style={{ ['--reveal-delay' as string]: `${index * 90}ms` }}
                >
                  <Icone className="h-7 w-7 shrink-0 text-ink-700" />
                  <h2 className="text-[0.9375rem] font-semibold leading-tight text-ink-800">{point.titre}</h2>
                  <span aria-hidden="true" className="h-[2px] w-8 rounded-pill bg-gold-400" />
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
