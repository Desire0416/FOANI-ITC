import type { Metadata } from 'next';
import { IconArrowRight, IconCheck } from '@/components/brand/icons';
import { LeafSprig } from '@/components/brand/marks';
import { PageHero } from '@/components/layout/page-hero';
import { ButtonLink } from '@/components/ui/button';
import { DonneeManquante } from '@/components/ui/donnee-manquante';
import { PhotoLegendee } from '@/components/ui/photo';
import { Container, Pill, Section, SectionHeading } from '@/components/ui/primitives';
import { CAMPUS_RUBRIQUES, ENGAGEMENTS } from '@/content/institution';
import { PHOTOS } from '@/content/photos';
import { ETABLISSEMENT } from '@/content/site';

/* La grille fait quatre colonnes au plus ; les deux grandes vignettes en
   occupent deux. Le navigateur n'a pas à télécharger une image pleine largeur
   pour la poser dans un huitième d'écran. */
const SIZES_VIGNETTE = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw';
const SIZES_LARGE = '(max-width: 640px) 100vw, 50vw';

export const metadata: Metadata = {
  title: 'Vie du campus',
  description:
    "Étudier à FOANI-ITC : hébergement, restauration, encadrement, vie associative, infrastructures, parcelles et unités de production sur le campus d'Agnibilékrou.",
  alternates: { canonical: '/campus' },
};

export default function PageCampus() {
  const aFournir = CAMPUS_RUBRIQUES.filter((rubrique) => rubrique.statut === 'a-fournir').length;

  return (
    <>
      <PageHero
        eyebrow="Vie du campus"
        titre={`Étudier à ${ETABLISSEMENT.ville}, au milieu des exploitations.`}
        lead="Ici, les parcelles et les ateliers font partie des cours. Voici les installations, les exploitations, l’encadrement et la vie étudiante."
        fil={[{ libelle: 'Vie du campus' }]}
        actions={
          <ButtonLink href="/contact?sujet=visite" variant="gold" size="lg" trailing={<IconArrowRight />}>
            Demander une visite
          </ButtonLink>
        }
      />

      {/* --------------------------------------------------------------- Galerie
          Le corpus photographique de l'établissement, dans son ensemble. C'est
          la page où quelqu'un vient pour voir à quoi ressemble l'endroit : elle
          montre tout ce dont nous disposons, sans trier pour faire joli. Les
          deux grandes vignettes ouvrent et referment la série ; entre les deux,
          la grille alterne les bâtiments, les cultures et les élevages, dans
          l'ordre où on les rencontre en traversant le campus.

          Aucune image ne vient d'ailleurs (§9.3). La vidéo, elle, reste à
          produire — c'est ce que dit la mention en bas de section. */}
      <Section tone="paper" id="galerie" className="py-14 lg:py-16">
        <Container>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <PhotoLegendee
              photo={PHOTOS.campusCour}
              ratio="aspect-[4/3] sm:aspect-[16/9]"
              sizes={SIZES_LARGE}
              className="reveal sm:col-span-2"
            />
            <PhotoLegendee photo={PHOTOS.amphitheatreEstrade} sizes={SIZES_VIGNETTE} className="reveal" />
            <PhotoLegendee photo={PHOTOS.bibliotheque} sizes={SIZES_VIGNETTE} className="reveal" />
            <PhotoLegendee photo={PHOTOS.alleeBatiments} sizes={SIZES_VIGNETTE} className="reveal" />
            <PhotoLegendee photo={PHOTOS.amphitheatreGradins} sizes={SIZES_VIGNETTE} className="reveal" />
            <PhotoLegendee
              photo={PHOTOS.atelierProductionVegetale}
              ratio="aspect-[4/3] sm:aspect-[16/9]"
              sizes={SIZES_LARGE}
              className="reveal sm:col-span-2"
            />
            <PhotoLegendee photo={PHOTOS.serreMaraichage} sizes={SIZES_VIGNETTE} className="reveal" />
            <PhotoLegendee photo={PHOTOS.serreMaraichageAllee} sizes={SIZES_VIGNETTE} className="reveal" />
            <PhotoLegendee photo={PHOTOS.pepiniere} sizes={SIZES_VIGNETTE} className="reveal" />
            <PhotoLegendee photo={PHOTOS.pepiniereVueLarge} sizes={SIZES_VIGNETTE} className="reveal" />
            <PhotoLegendee photo={PHOTOS.bananeraie} sizes={SIZES_VIGNETTE} className="reveal" />
            <PhotoLegendee photo={PHOTOS.bananeraieAllee} sizes={SIZES_VIGNETTE} className="reveal" />
            <PhotoLegendee photo={PHOTOS.jardinAromatique} sizes={SIZES_VIGNETTE} className="reveal" />
            <PhotoLegendee photo={PHOTOS.abordsFleuris} sizes={SIZES_VIGNETTE} className="reveal" />
            <PhotoLegendee photo={PHOTOS.elevageCailles} sizes={SIZES_VIGNETTE} className="reveal" />
            <PhotoLegendee photo={PHOTOS.elevageCaillesVoliere} sizes={SIZES_VIGNETTE} className="reveal" />
            <PhotoLegendee photo={PHOTOS.elevagePoussins} sizes={SIZES_VIGNETTE} className="reveal" />
            <PhotoLegendee photo={PHOTOS.elevageLapins} sizes={SIZES_VIGNETTE} className="reveal" />
            <PhotoLegendee
              photo={PHOTOS.citeUniversitairePanorama}
              ratio="aspect-[4/3] sm:aspect-[16/9]"
              sizes={SIZES_LARGE}
              className="reveal sm:col-span-2"
            />
            <PhotoLegendee photo={PHOTOS.citeUniversitaire} sizes={SIZES_VIGNETTE} className="reveal" />
            <PhotoLegendee photo={PHOTOS.bananeraieJeunesPlants} sizes={SIZES_VIGNETTE} className="reveal" />
          </div>
          <DonneeManquante
            className="mt-8"
            quoi="Vidéo de présentation du campus : à produire par l'établissement. Les photographies ci-dessus ont toutes été prises sur le site d'Agnibilékrou ; aucun visuel provenant d'un autre établissement n'est utilisé ici."
            action={null}
          />
        </Container>
      </Section>

      {/* ------------------------------------------------------------- Rubriques */}
      <Section tone="tint">
        <Container>
          <SectionHeading
            eyebrow="La vie ici"
            title="Une année sur le campus"
            lead={
              aFournir > 0
                ? `${aFournir} des rubriques ci-dessous attendent leur contenu définitif. Elles sont structurées et prêtes à recevoir la description de l'établissement.`
                : undefined
            }
            className="mb-14"
          />

          <div className="flex flex-col gap-5">
            {CAMPUS_RUBRIQUES.map((rubrique, index) => (
              <section
                key={rubrique.id}
                id={rubrique.id}
                className="reveal grid gap-6 rounded-card-lg border border-graphite-100 bg-paper p-7 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] lg:gap-10"
                style={{ ['--reveal-delay' as string]: `${index * 60}ms` }}
              >
                <div>
                  <LeafSprig aria-hidden="true" className="h-5 w-5 text-gold-500" />
                  <h2 className="mt-4 text-[1.375rem] leading-snug text-ink-800">{rubrique.titre}</h2>
                  {rubrique.statut === 'a-fournir' ? (
                    <p className="mt-3">
                      <Pill tone="outline">Contenu à compléter</Pill>
                    </p>
                  ) : null}
                </div>
                <p className="text-[1rem] leading-relaxed text-graphite-600">{rubrique.corps}</p>
              </section>
            ))}
          </div>
        </Container>
      </Section>

      {/* ----------------------------------------------------------- Engagements */}
      <Section tone="ink" id="engagements">
        <Container>
          <SectionHeading
            eyebrow="Nos engagements"
            title="Ce à quoi nous nous engageons"
            tone="light"
            lead="Trois engagements que vous êtes en droit de nous rappeler."
            className="mb-14"
          />
          <ul className="grid gap-5 md:grid-cols-3">
            {ENGAGEMENTS.map((engagement, index) => (
              <li
                key={engagement.titre}
                className="reveal rounded-card-lg border border-paper/12 bg-paper/[0.04] p-7"
                style={{ ['--reveal-delay' as string]: `${index * 70}ms` }}
              >
                <IconCheck aria-hidden="true" className="h-6 w-6 text-gold-400" />
                <h3 className="mt-5 font-display text-[1.25rem] leading-snug text-paper">{engagement.titre}</h3>
                <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-200">{engagement.corps}</p>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      {/* ------------------------------------------------------------- Renvoi */}
      <Section tone="paper" className="py-16 lg:py-20">
        <Container>
          <div className="reveal flex flex-col items-start gap-6 rounded-card-lg border border-graphite-100 bg-paper-tint p-8 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-[1.5rem] leading-snug text-ink-800">
                Vous souhaitez visiter avant de vous inscrire&nbsp;?
              </h2>
              <p className="mt-2 max-w-lg text-[0.9375rem] leading-relaxed text-graphite-500">
                Les visites se font sur rendez-vous. Dites-nous quand vous êtes disponible.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <ButtonLink href="/contact?sujet=visite" variant="ink" size="md" trailing={<IconArrowRight />}>
                Organiser une visite
              </ButtonLink>
              <ButtonLink href="/evenements" variant="outline" size="md">
                Voir les événements
              </ButtonLink>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
