import Link from 'next/link';
import {
  IconArrowRight,
  IconArrowUpRight,
  IconBriefcase,
  IconCalendar,
  IconFlask,
  IconGraduation,
  IconHandshake,
  IconLeafPair,
  IconQuote,
  IconSearch,
  IconSprout,
} from '@/components/brand/icons';
import { LaurelWreath, LeafSprig } from '@/components/brand/marks';
import { CatalogueRapide, type EntreeApercu } from '@/components/sections/catalogue-rapide';
import { ButtonLink } from '@/components/ui/button';
import { MediaPlaceholder } from '@/components/ui/media-placeholder';
import { Photo } from '@/components/ui/photo';
import { Container, Pill, Section, SectionHeading } from '@/components/ui/primitives';
import { FORMATIONS, dureeLisible, titreComplet } from '@/content/formations';
import { MOT_DIRECTION } from '@/content/institution';
import { PHOTOS } from '@/content/photos';
import { actualitesPubliees, evenementsPublies } from '@/lib/contenus-publies';
import { LIBELLE_CATEGORIE } from '@/lib/publications';
import { RESSOURCES } from '@/content/ressources';
import { formatDate } from '@/lib/utils';

/* ==========================================================================
   Sections de la page d'accueil
   L'ordre suit celui du CDC §8.9 : hero, chiffres, mot de la direction,
   pourquoi FITC, accès directs, formations, carrières, campus, ressources,
   actualités, appel final. La page d'accueil n'est pas un sommaire du site —
   c'est un parcours, et chaque bloc y joue un rôle qu'aucun autre ne tient.
   ========================================================================== */

/* --------------------------------------------------------------------------
   Pourquoi FOANI-ITC
   -------------------------------------------------------------------------- */

const PILIERS = [
  {
    icone: IconSprout,
    titre: 'Vous apprenez en faisant',
    corps:
      "Les cours ont lieu sur les parcelles, dans les ateliers d'élevage et à l'unité de transformation. Vous faites le geste avant d'en apprendre la théorie.",
  },
  {
    icone: IconFlask,
    titre: 'Des enseignants qui viennent du métier',
    corps:
      "Le groupe FOANI travaille dans l'agriculture depuis plus de cinquante ans. Vos formateurs sont des praticiens autant que des enseignants.",
  },
  {
    icone: IconBriefcase,
    titre: 'Vous pouvez créer votre exploitation',
    corps:
      "Monter un projet, faire un plan d'affaires, chercher un financement : c'est au programme, et pas seulement en fin de parcours.",
  },
  {
    icone: IconHandshake,
    titre: 'Un stage dès la première année',
    corps:
      "Stages encadrés, contacts avec les entreprises de la filière, et préparation aux entretiens avant la sortie.",
  },
] as const;

export function Pourquoi() {
  return (
    <Section tone="paper" id="pourquoi">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-16">
          <div>
            <SectionHeading
              eyebrow="Pourquoi nous choisir"
              title="Une école agricole, c’est d’abord la pratique"
              lead="Voici ce que vous trouverez ici. Tout est vérifiable sur place, le jour où vous venez."
            />

            <ul className="mt-12 flex flex-col">
              {PILIERS.map((pilier, index) => {
                const Icone = pilier.icone;
                return (
                  <li
                    key={pilier.titre}
                    className="reveal group/pilier flex gap-5 border-t border-graphite-100 py-6 first:border-t-0 first:pt-0"
                    style={{ ['--reveal-delay' as string]: `${index * 70}ms` }}
                  >
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-pill border border-graphite-100 bg-paper transition-colors duration-500 ease-[var(--ease-arc)] group-hover/pilier:border-gold-200 group-hover/pilier:bg-gold-50">
                      <Icone className="h-5 w-5 text-ink-700" />
                    </span>
                    <div>
                      <h3 className="text-[1.375rem] leading-snug text-ink-800">{pilier.titre}</h3>
                      <p className="mt-2 text-[0.9375rem] leading-relaxed text-graphite-500">{pilier.corps}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="reveal flex flex-col gap-5">
            <Photo
              photo={PHOTOS.pepiniere}
              ratio="aspect-[4/5]"
              className="w-full"
              sizes="(max-width: 1024px) 100vw, 32vw"
            />
            <div className="rounded-card-lg border border-graphite-100 bg-paper-tint p-6">
              <p className="font-display text-[1.375rem] leading-snug text-ink-800">
                Des diplômes reconnus par l’État
              </p>
              <p className="mt-3 text-[0.9375rem] leading-relaxed text-graphite-500">
                Le BTS se termine par un examen d’État. La Licence ouvre en octobre 2026, sous
                agrément. Et derrière l’école, un groupe qui travaille la terre depuis plus de
                cinquante ans.
              </p>
              <Link
                href="/universite#agrements"
                className="mt-3 inline-flex items-center gap-1.5 py-1 text-[0.875rem] font-semibold text-ink-700 transition-colors hover:text-ink-600"
              >
                Voir nos agréments
                <IconArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}

/* --------------------------------------------------------------------------
   Trois chemins d'entrée dans l'offre — §9.2
   -------------------------------------------------------------------------- */

const PORTES = [
  {
    icone: IconGraduation,
    surtitre: 'Après le baccalauréat',
    titre: 'Je suis bachelier',
    corps: 'Comparez le BTS en 2 ans et la Licence en 3 ans, puis déposez votre dossier en ligne.',
    href: '/formations?cycle=bts,licence',
    action: 'Voir les BTS et Licences',
  },
  {
    icone: IconSprout,
    surtitre: 'Déjà dans le métier',
    titre: 'Je suis un professionnel',
    corps: 'Aviculture, maraîchage, pisciculture : une formation courte par production, sans condition de diplôme.',
    href: '/formations?cycle=certificat',
    action: 'Voir les formations courtes',
  },
  {
    icone: IconLeafPair,
    surtitre: 'Besoin d’un conseil',
    titre: 'Je cherche une réponse technique',
    corps: 'Nos fiches pratiques sont gratuites. Chacune vous mène vers la formation qui va plus loin.',
    href: '/ressources',
    action: 'Voir les fiches techniques',
  },
] as const;

export function Portes() {
  return (
    <Section tone="tint">
      <Container>
        <SectionHeading
          eyebrow="Accès direct"
          title="Trois entrées, selon votre profil"
          lead="Un clic et vous arrivez sur la page qui vous concerne, sans passer par le reste du site."
          align="center"
        />

        <ul className="mt-14 grid gap-5 md:grid-cols-3">
          {PORTES.map((porte, index) => {
            const Icone = porte.icone;
            return (
              <li
                key={porte.titre}
                className="reveal"
                style={{ ['--reveal-delay' as string]: `${index * 90}ms` }}
              >
                <Link
                  href={porte.href}
                  className="group/porte relative flex h-full flex-col overflow-hidden rounded-card-lg border border-graphite-100 bg-paper p-7 transition-[transform,box-shadow,border-color] duration-500 ease-[var(--ease-arc)] hover:[transform:translateY(-0.25rem)] hover:border-ink-100 hover:shadow-lift"
                >
                  <LaurelWreath
                    className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 text-ink-700/[0.04] transition-transform duration-700 ease-[var(--ease-arc)] group-hover/porte:[transform:rotate(12deg)]"
                    leaves={9}
                  />
                  <span className="relative flex h-12 w-12 items-center justify-center rounded-pill bg-ink-800 transition-colors duration-500 group-hover/porte:bg-ink-700">
                    <Icone className="h-5 w-5 text-gold-400" />
                  </span>
                  <p className="relative mt-6 text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-gold-700">
                    {porte.surtitre}
                  </p>
                  <h3 className="relative mt-2 text-[1.625rem] leading-snug text-ink-800">{porte.titre}</h3>
                  <p className="relative mt-3 flex-1 text-[0.9375rem] leading-relaxed text-graphite-500">
                    {porte.corps}
                  </p>
                  <span className="relative mt-6 inline-flex items-center gap-1.5 text-[0.875rem] font-semibold text-ink-700">
                    {porte.action}
                    <IconArrowRight className="h-4 w-4 transition-transform duration-300 ease-[var(--ease-arc)] group-hover/porte:[transform:translateX(0.25rem)]" />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </Container>
    </Section>
  );
}

/* --------------------------------------------------------------------------
   Mot de la direction — §8.2
   --------------------------------------------------------------------------
   Ce bloc occupe la place que tenait le moteur d'orientation. Ce dernier
   faisait double emploi avec le catalogue à trois niveaux qui suit : deux
   filtres à quatre sections d'écart, c'est un site qui se répète. Le mot de
   la direction, lui, ne se trouve nulle part ailleurs sur l'accueil — et
   c'est la seule voix humaine de la page.

   Le texte intégral reste sur la page Université ; on n'en publie pas ici
   une version raccourcie qui dirait autre chose.
   -------------------------------------------------------------------------- */

export function MotDirection() {
  return (
    <section className="relative overflow-hidden bg-ink-900 py-section lg:py-section-lg">
      <LaurelWreath
        className="pointer-events-none absolute -bottom-40 -left-32 h-[34rem] w-[34rem] text-paper/[0.04]"
        leaves={13}
      />

      <Container className="relative">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:items-center lg:gap-16">
          {/* --- Le signataire -------------------------------------------
              Tant que le nom n'est pas fourni, le texte est signé par la
              fonction — comme sur la page Université. On n'affiche pas un
              « nom à publier » qui ferait passer un manque pour un contenu. */}
          <div className="reveal">
            <MediaPlaceholder
              sujet="Portrait de la directrice"
              ratio="aspect-[3/4]"
              className="border border-paper/10"
            />
            <p className="mt-5 font-display text-[1.1875rem] leading-snug text-paper">
              {MOT_DIRECTION.auteur ?? MOT_DIRECTION.fonction}
            </p>
            {MOT_DIRECTION.auteur ? (
              <p className="mt-1 text-[0.875rem] leading-snug text-ink-300">{MOT_DIRECTION.fonction}</p>
            ) : null}
          </div>

          {/* --- Le texte ------------------------------------------------- */}
          <div>
            <SectionHeading
              tone="light"
              eyebrow="Mot de la directrice"
              title="Pourquoi nous avons créé cette université"
            />

            <IconQuote aria-hidden="true" className="reveal mt-9 h-9 w-9 text-gold-400/70" />

            <div className="mt-4 flex max-w-3xl flex-col gap-5">
              {MOT_DIRECTION.texte.map((paragraphe, index) => (
                <p
                  key={paragraphe.slice(0, 32)}
                  className="reveal font-display text-[1.125rem] leading-relaxed text-ink-100 sm:text-[1.25rem]"
                  style={{ ['--reveal-delay' as string]: `${index * 80}ms` }}
                >
                  {paragraphe}
                </p>
              ))}
            </div>

            <div className="reveal mt-10 flex flex-wrap gap-3">
              <ButtonLink href="/universite#direction" variant="onDark" size="lg" trailing={<IconArrowRight />}>
                Découvrir l’université
              </ButtonLink>
              <ButtonLink href="/universite/equipe" variant="onDark" size="lg">
                Voir l’équipe
              </ButtonLink>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

/* --------------------------------------------------------------------------
   Orientation et catalogue — §8.9 et §9.2
   -------------------------------------------------------------------------- */

export function FormationsPhares() {
  /* Index allégé : six champs par formation, pas le catalogue entier. */
  const index: readonly EntreeApercu[] = FORMATIONS.map((formation) => ({
    slug: formation.slug,
    titre: titreComplet(formation),
    cycle: formation.cycle,
    domaines: formation.domaines,
    resume: formation.resume,
    duree: dureeLisible(formation),
  }));

  return (
    <Section tone="paper" id="formations">
      <Container>
        <SectionHeading
          eyebrow="Orientation et formations"
          title="Trouvez votre formation en trois clics"
          lead="Trente formations au catalogue. Indiquez ce que vous cherchez, à quel niveau et dans quel domaine : la liste se réduit à chaque clic."
          className="max-w-3xl"
        />

        <CatalogueRapide index={index} />
      </Container>
    </Section>
  );
}

/* --------------------------------------------------------------------------
   Entrepreneuriat, carrières et relations entreprises — §8.5
   -------------------------------------------------------------------------- */

export function Carrieres() {
  return (
    <Section tone="paper" className="border-y border-graphite-100">
      <Container>
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div className="reveal order-2 lg:order-1">
            <MediaPlaceholder sujet="Étudiants en stage dans une entreprise partenaire" ratio="aspect-[5/4]" />
          </div>

          <div className="order-1 lg:order-2">
            <SectionHeading
              eyebrow="Après la formation"
              title="Trouver du travail, ou créer son activité"
              lead="Nous vous accompagnons pour préparer votre stage, votre recherche d’emploi ou la création de votre exploitation."
            />

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {[
                { titre: 'Aide à la recherche de stage', corps: 'Un accompagnement, du CV à l’entretien.', href: '/carrieres#centre' },
                { titre: 'Offres de stage et d’emploi', corps: 'Les propositions reçues par l’école.', href: '/carrieres#offres' },
                { titre: 'Créer son entreprise', corps: 'Accompagnement des projets étudiants.', href: '/carrieres#incubation' },
                { titre: 'Vous êtes une entreprise', corps: 'Recruter un étudiant ou proposer un stage.', href: '/carrieres#recruter' },
              ].map((item, index) => (
                <Link
                  key={item.titre}
                  href={item.href}
                  className="reveal group/item rounded-card border border-graphite-100 bg-paper p-5 transition-[transform,border-color,box-shadow] duration-500 ease-[var(--ease-arc)] hover:[transform:translateY(-0.125rem)] hover:border-ink-100 hover:shadow-raise"
                  style={{ ['--reveal-delay' as string]: `${index * 70}ms` }}
                >
                  <p className="flex items-center justify-between gap-3 text-[0.9375rem] font-semibold text-ink-800">
                    {item.titre}
                    <IconArrowUpRight className="h-4 w-4 shrink-0 text-gold-500 transition-transform duration-300 ease-[var(--ease-arc)] group-hover/item:[transform:translate(0.125rem,-0.125rem)]" />
                  </p>
                  <p className="mt-1.5 text-[0.8125rem] leading-snug text-graphite-500">{item.corps}</p>
                </Link>
              ))}
            </div>

            <div className="reveal mt-6 rounded-card-lg bg-ink-900 p-6">
              <p className="text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-gold-400">
                Vous êtes une coopérative ou une entreprise
              </p>
              <p className="mt-3 text-[1.25rem] leading-snug text-paper">
                Nous intervenons aussi chez vous.
              </p>
              <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink-200">
                Conseil technique sur vos parcelles ou dans vos élevages, et formation de vos équipes.
              </p>
              <ButtonLink href="/expertise" variant="gold" size="sm" trailing={<IconArrowRight />} className="mt-5">
                Demander un devis
              </ButtonLink>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}

/* --------------------------------------------------------------------------
   Vie du campus — §8.4
   -------------------------------------------------------------------------- */

export function Campus() {
  return (
    <Section tone="tint">
      <Container>
        <SectionHeading
          eyebrow="La vie ici"
          title="Étudier et vivre sur le campus"
          lead="Les installations, les exploitations, les équipements et la vie étudiante, en dehors des cours."
        />

        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {[
            { photo: PHOTOS.alleeBatiments, titre: 'Le campus', href: '/campus#infrastructures' },
            { photo: PHOTOS.bananeraieAllee, titre: 'Les exploitations', href: '/campus#production' },
            { photo: PHOTOS.amphitheatreGradins, titre: 'Les équipements', href: '/campus#infrastructures' },
            { photo: PHOTOS.citeUniversitaire, titre: 'La vie étudiante', href: '/campus#associations' },
          ].map((item, index) => (
            <Link
              key={item.titre}
              href={item.href}
              className="reveal group/tuile relative block overflow-hidden rounded-media"
              style={{ ['--reveal-delay' as string]: `${index * 80}ms` }}
            >
              <Photo
                photo={item.photo}
                ratio="aspect-[3/4]"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 24vw"
                className="transition-transform duration-700 ease-[var(--ease-arc)] group-hover/tuile:[transform:scale(1.03)]"
              />
              {/* Voile sombre sous le libellé : le contraste du texte ne doit
                  pas dépendre de la luminosité de la photographie — un ciel
                  blanc de saison des pluies avalerait un titre clair. */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-28 rounded-t-media bg-gradient-to-b from-ink-950/75 to-transparent"
              />
              <span className="pointer-events-none absolute inset-x-0 top-0 flex items-center gap-1.5 p-5 font-display text-[1.0625rem] text-paper">
                <LeafSprig className="h-3.5 w-3.5 text-gold-400" />
                {item.titre}
              </span>
            </Link>
          ))}
        </div>

        <div className="reveal mt-10 flex justify-center">
          <ButtonLink href="/campus" variant="outline" size="md" trailing={<IconArrowRight />}>
            Voir le campus
          </ButtonLink>
        </div>
      </Container>
    </Section>
  );
}

/* --------------------------------------------------------------------------
   Ressources agricoles — §8.6, l'atout de visibilité du portail
   -------------------------------------------------------------------------- */

export function Ressources() {
  const selection = RESSOURCES.slice(0, 3);

  return (
    <Section tone="paper">
      <Container>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            eyebrow="Conseils techniques"
            title="Nos fiches pratiques, gratuites pour tous"
            lead="Vous produisez déjà ? Ces fiches répondent aux questions du terrain. Chacune mène vers la formation qui va plus loin."
            className="max-w-2xl"
          />
          <ButtonLink href="/ressources" variant="outline" size="md" trailing={<IconArrowRight />} className="reveal shrink-0">
            Voir toutes les fiches
          </ButtonLink>
        </div>

        <ul className="mt-12 grid gap-5 md:grid-cols-3">
          {selection.map((ressource, index) => (
            <li key={ressource.slug} className="reveal" style={{ ['--reveal-delay' as string]: `${index * 80}ms` }}>
              <Link
                href={`/ressources/${ressource.slug}`}
                className="group/fiche relative flex h-full flex-col rounded-card-lg border border-graphite-100 bg-paper-warm p-6 transition-[transform,box-shadow,border-color] duration-500 ease-[var(--ease-arc)] hover:[transform:translateY(-0.25rem)] hover:border-gold-200 hover:shadow-lift"
              >
                <Pill tone="gold">{ressource.filiere}</Pill>
                <h3 className="mt-4 text-[1.125rem] leading-snug text-ink-800">{ressource.titre}</h3>
                <p className="mt-3 flex-1 text-[0.875rem] leading-relaxed text-graphite-500">{ressource.resume}</p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-[0.8125rem] font-semibold text-gold-700">
                  Lire la fiche
                  <IconArrowRight className="h-4 w-4 transition-transform duration-300 ease-[var(--ease-arc)] group-hover/fiche:[transform:translateX(0.25rem)]" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}

/* --------------------------------------------------------------------------
   Actualités et événements — §8.7
   -------------------------------------------------------------------------- */

export async function Actualites() {
  // Trois articles suffisent en page d'accueil : une une, puis deux rappels.
  const [premiere, ...suivantes] = await actualitesPubliees(3);
  const evenements = await evenementsPublies(10);
  const prochainEvenement = evenements.find((evenement) => evenement.date !== null);

  return (
    <Section tone="tint">
      <Container>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            eyebrow="Nouvelles de l’école"
            title="Actualités et rendez-vous"
            className="max-w-2xl"
          />
          <div className="reveal flex gap-3">
            <ButtonLink href="/actualites" variant="outline" size="md">
              Actualités
            </ButtonLink>
            <ButtonLink href="/evenements" variant="outline" size="md" icon={<IconCalendar />}>
              Événements
            </ButtonLink>
          </div>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          {premiere ? (
            <article className="reveal group/une relative overflow-hidden rounded-card-lg border border-graphite-100 bg-paper">
              <MediaPlaceholder
                sujet="Illustration de l’actualité à la une"
                ratio="aspect-[16/9]"
                className="rounded-none"
              />
              <div className="p-7">
                <div className="flex flex-wrap items-center gap-3">
                  <Pill tone="neutral">{LIBELLE_CATEGORIE[premiere.categorie] ?? premiere.categorie}</Pill>
                  <time dateTime={premiere.date} className="text-[0.8125rem] text-graphite-500">
                    {formatDate(premiere.date)}
                  </time>
                </div>
                <h3 className="mt-4 text-[1.5rem] leading-snug text-ink-800">
                  <Link href={`/actualites/${premiere.slug}`} className="after:absolute after:inset-0">
                    {premiere.titre}
                  </Link>
                </h3>
                <p className="mt-3 text-[0.9375rem] leading-relaxed text-graphite-500">{premiere.chapo}</p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-[0.875rem] font-semibold text-ink-700">
                  Lire l’article
                  <IconArrowRight className="h-4 w-4 transition-transform duration-300 ease-[var(--ease-arc)] group-hover/une:[transform:translateX(0.25rem)]" />
                </span>
              </div>
            </article>
          ) : null}

          <div className="flex flex-col gap-5">
            {suivantes.map((actualite, index) => (
              <article
                key={actualite.slug}
                className="reveal group/breve relative rounded-card-lg border border-graphite-100 bg-paper p-6 transition-[transform,border-color,box-shadow] duration-500 ease-[var(--ease-arc)] hover:[transform:translateY(-0.125rem)] hover:border-ink-100 hover:shadow-raise"
                style={{ ['--reveal-delay' as string]: `${index * 80}ms` }}
              >
                <div className="flex flex-wrap items-center gap-3">
                  <Pill tone="neutral">{LIBELLE_CATEGORIE[actualite.categorie] ?? actualite.categorie}</Pill>
                  <time dateTime={actualite.date} className="text-[0.8125rem] text-graphite-500">
                    {formatDate(actualite.date)}
                  </time>
                </div>
                <h3 className="mt-3 text-[1.125rem] leading-snug text-ink-800">
                  <Link href={`/actualites/${actualite.slug}`} className="after:absolute after:inset-0">
                    {actualite.titre}
                  </Link>
                </h3>
                <p className="mt-2 line-clamp-2 text-[0.875rem] leading-relaxed text-graphite-500">
                  {actualite.chapo}
                </p>
              </article>
            ))}

            {prochainEvenement ? (
              <article className="reveal relative overflow-hidden rounded-card-lg bg-ink-900 p-6">
                <LaurelWreath
                  className="pointer-events-none absolute -bottom-16 -right-12 h-48 w-48 text-paper/[0.05]"
                  leaves={11}
                />
                <p className="relative inline-flex items-center gap-2 text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-gold-400">
                  <IconCalendar className="h-3.5 w-3.5" />
                  Prochain rendez-vous
                </p>
                <h3 className="relative mt-3 text-[1.25rem] leading-snug text-paper">{prochainEvenement.titre}</h3>
                {prochainEvenement.date ? (
                  <p className="relative mt-2 text-[0.875rem] text-ink-200">
                    {formatDate(prochainEvenement.date, { weekday: 'long' })} — {prochainEvenement.lieu}
                  </p>
                ) : null}
                <Link
                  href={`/evenements`}
                  className="relative mt-3 inline-flex items-center gap-1.5 py-1 text-[0.875rem] font-semibold text-gold-400 transition-colors hover:text-gold-300"
                >
                  Voir les événements
                  <IconArrowRight className="h-4 w-4" />
                </Link>
              </article>
            ) : null}
          </div>
        </div>
      </Container>
    </Section>
  );
}

/* --------------------------------------------------------------------------
   Recherche globale — §8.10
   -------------------------------------------------------------------------- */

export function RechercheGlobale() {
  return (
    <Section tone="paper" className="py-16 lg:py-20">
      <Container>
        <div className="reveal flex flex-col items-center gap-6 rounded-card-lg border border-graphite-100 bg-paper-tint px-6 py-12 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-pill bg-ink-800">
            <IconSearch className="h-6 w-6 text-gold-400" />
          </span>
          <h2 className="max-w-xl text-[2rem] leading-tight text-ink-800">
            Vous ne trouvez pas&nbsp;?
          </h2>
          <p className="max-w-xl text-[0.9375rem] leading-relaxed text-graphite-500">
            Tapez ce que vous cherchez : un métier, une production, un diplôme. La recherche parcourt
            tout le site, formations comprises.
          </p>
          <ButtonLink href="/recherche" variant="ink" size="lg" icon={<IconSearch />} trailing={<IconArrowRight />}>
            Lancer une recherche
          </ButtonLink>
        </div>
      </Container>
    </Section>
  );
}
