import type { Metadata } from 'next';
import { IconMail, IconPhone, IconPin, IconClock, IconArrowRight } from '@/components/brand/icons';
import { FormulaireDemande } from '@/components/formulaire-demande';
import type { TypeDemande } from '@/app/(site)/actions/demande';
import { PageHero } from '@/components/layout/page-hero';
import { ButtonLink } from '@/components/ui/button';
import { DonneeManquante } from '@/components/ui/donnee-manquante';
import { MediaPlaceholder } from '@/components/ui/media-placeholder';
import { Container, Section, SectionHeading } from '@/components/ui/primitives';
import { getFormation, titreComplet } from '@/content/formations';
import { CONTACT, ETABLISSEMENT } from '@/content/site';

export const metadata: Metadata = {
  title: 'Contact et accès',
  description:
    "Joindre FOANI International Training College à Agnibilékrou : demande d'information, brochure, conditions financières, visite du campus et plan d'accès.",
  alternates: { canonical: '/contact' },
};

/** Sujets reconnus dans l'URL, pour préremplir le bon formulaire. */
const SUJETS: Record<string, { readonly titre: string; readonly type: TypeDemande }> = {
  brochure: { titre: 'Recevoir une brochure', type: 'brochure' },
  frais: { titre: 'Connaître les conditions financières', type: 'information' },
  admission: { titre: 'Question sur les admissions', type: 'information' },
  visite: { titre: 'Organiser une visite du campus', type: 'information' },
  intervenant: { titre: 'Proposer une intervention', type: 'contact' },
  temoignage: { titre: 'Partager mon parcours d’ancien étudiant', type: 'contact' },
  ressource: { titre: 'Proposer un sujet de fiche technique', type: 'contact' },
  recherche: { titre: 'Signaler un contenu manquant', type: 'contact' },
  evenement: { titre: 'Être prévenu de la date d’un événement', type: 'information' },
};

export default async function PageContact({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const parametres = await searchParams;
  const cleSujet = typeof parametres.sujet === 'string' ? parametres.sujet : undefined;
  const sujet = cleSujet ? SUJETS[cleSujet] : undefined;

  const slugFormation = typeof parametres.formation === 'string' ? parametres.formation : undefined;
  const formation = slugFormation ? getFormation(slugFormation) : undefined;

  const intitule = [sujet?.titre, formation ? titreComplet(formation) : null].filter(Boolean).join(' — ') || undefined;

  return (
    <>
      <PageHero
        eyebrow="Contact"
        titre="Nous contacter"
        lead="Une question sur une formation, sur le coût des études, ou une demande de visite&nbsp;? Écrivez-nous : votre message est transmis au service concerné."
        fil={[{ libelle: 'Contact et accès' }]}
      />

      <Section tone="paper">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[minmax(0,30rem)_minmax(0,1fr)] lg:gap-16">
            {/* ------------------------------------------------------ Formulaire */}
            <div className="rounded-card-lg border border-graphite-100 bg-paper-tint p-7">
              <h2 className="font-display text-[1.375rem] text-ink-800">Écrire à l’établissement</h2>
              <p className="mt-3 text-[0.875rem] leading-relaxed text-graphite-500">
                Un numéro de téléphone suffit pour que nous puissions vous répondre.
              </p>
              <FormulaireDemande
                type={sujet?.type ?? 'information'}
                formation={slugFormation}
                origine={cleSujet ? `contact-${cleSujet}` : 'contact'}
                intitule={intitule}
                className="mt-7"
              />
            </div>

            {/* --------------------------------------------------- Coordonnées */}
            <div>
              <SectionHeading eyebrow="Nous joindre" title="Où nous trouver" />

              <ul className="mt-9 flex flex-col gap-5">
                <Coordonnee
                  icone={<IconPin />}
                  terme="Adresse"
                  valeur={CONTACT.adresse.valeur ?? CONTACT.adresse.secours ?? ''}
                  complement={CONTACT.adresse.valeur === null ? 'Adresse complète à publier' : undefined}
                />
                <Coordonnee
                  icone={<IconPhone />}
                  terme="Téléphone"
                  valeur={CONTACT.telephone.affichage}
                  complement={`Ligne fixe : ${CONTACT.telephoneFixe.affichage}`}
                />
                <Coordonnee
                  icone={<IconMail />}
                  terme="Adresse électronique"
                  valeur={CONTACT.courriel.valeur ?? 'À publier'}
                  complement={CONTACT.courriel.valeur === null ? 'Utilisez le formulaire ci-contre' : undefined}
                />
                <Coordonnee
                  icone={<IconClock />}
                  terme="Horaires d’accueil"
                  valeur={CONTACT.horaires.valeur ?? 'À publier'}
                />
              </ul>

              <DonneeManquante
                className="mt-8"
                quoi="Horaires d'accueil, adresses électroniques par service et repère d'accès précis : à fournir par l'établissement. Aucun contact n'est inventé ici."
                action={null}
              />

              <div className="mt-10">
                <h3 className="font-display text-[1.25rem] text-ink-800">Plan d’accès</h3>
                <p className="mt-2 text-[0.9375rem] leading-relaxed text-graphite-500">
                  Le campus se situe à {ETABLISSEMENT.ville}, en {ETABLISSEMENT.pays}. Un plan fonctionnel sera
                  intégré dès que les coordonnées exactes du site seront transmises.
                </p>
                <MediaPlaceholder sujet="Plan d’accès au campus" ratio="aspect-[16/9]" className="mt-5" />
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* ------------------------------------------------------ Autres parcours */}
      <Section tone="tint" className="py-16 lg:py-20">
        <Container>
          <SectionHeading
            eyebrow="Vous n’êtes pas candidat"
            title="Vous êtes dans un autre cas&nbsp;?"
            align="center"
            className="mb-12"
          />
          <ul className="grid gap-5 md:grid-cols-3">
            {[
              {
                titre: 'Organisation ou entreprise',
                corps: 'Expertise technique, formation continue, demande de devis.',
                href: '/expertise#devis',
                action: 'Demander un devis',
              },
              {
                titre: 'Recruteur',
                corps: 'Recruter un étudiant, proposer un stage ou une intervention.',
                href: '/carrieres#recruter',
                action: 'Parcours recruteur',
              },
              {
                titre: 'Presse et médias',
                corps: 'Informations officielles, logos et contact presse.',
                href: '/presse',
                action: 'Espace presse',
              },
            ].map((parcours, index) => (
              <li
                key={parcours.titre}
                className="reveal flex h-full flex-col rounded-card-lg border border-graphite-100 bg-paper p-7"
                style={{ ['--reveal-delay' as string]: `${index * 70}ms` }}
              >
                <h3 className="font-display text-[1.125rem] text-ink-800">{parcours.titre}</h3>
                <p className="mt-2 flex-1 text-[0.9375rem] leading-relaxed text-graphite-500">{parcours.corps}</p>
                <ButtonLink
                  href={parcours.href}
                  variant="outline"
                  size="sm"
                  className="mt-5 self-start"
                  trailing={<IconArrowRight />}
                >
                  {parcours.action}
                </ButtonLink>
              </li>
            ))}
          </ul>
        </Container>
      </Section>
    </>
  );
}

function Coordonnee({
  icone,
  terme,
  valeur,
  complement,
}: {
  icone: React.ReactNode;
  terme: string;
  valeur: string;
  complement?: string;
}) {
  return (
    <li className="flex items-start gap-4">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-pill border border-graphite-100 bg-paper-tint [&>svg]:h-5 [&>svg]:w-5 [&>svg]:text-ink-700">
        {icone}
      </span>
      <div>
        <p className="text-[0.6875rem] uppercase tracking-[0.14em] text-graphite-600">{terme}</p>
        <p className="mt-0.5 text-[1rem] leading-snug text-ink-800">{valeur}</p>
        {complement ? <p className="mt-0.5 text-[0.8125rem] text-graphite-500">{complement}</p> : null}
      </div>
    </li>
  );
}
