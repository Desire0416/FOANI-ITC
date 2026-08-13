import type { Metadata } from 'next';
import Link from 'next/link';
import { IconArrowUpRight, IconFile, IconGraduation, IconMail, IconTeacher, IconUsers } from '@/components/brand/icons';
import { LaurelWreath } from '@/components/brand/marks';
import { PageHero } from '@/components/layout/page-hero';
import { Container, Pill, Section, SectionHeading } from '@/components/ui/primitives';

export const metadata: Metadata = {
  title: 'Espace numérique',
  description:
    "Point d'entrée unique vers les services numériques de FOANI-ITC : portail candidat, espace étudiant, plateforme pédagogique et messagerie institutionnelle.",
  alternates: { canonical: '/espace-numerique' },
  robots: { index: true, follow: true },
};

/**
 * §7.2 — l'espace numérique donne accès de façon cohérente aux quatre
 * systèmes. Les adresses sont fournies par configuration : tant qu'un service
 * n'est pas en ligne, sa carte l'annonce au lieu de renvoyer vers une page
 * morte, ce qui est exactement ce que l'audit reprochait au dispositif
 * précédent.
 */
const SERVICES = [
  {
    id: 'candidature',
    icone: IconFile,
    titre: 'Portail candidat',
    corps: 'Déposer une candidature, suivre son dossier et répondre à une demande de pièce complémentaire.',
    // Le portail candidat fait partie du dispositif : il n'attend pas
    // qu'une adresse externe soit renseignée pour être annoncé ouvert.
    url: '/mon-dossier',
    interne: '/candidature',
    pour: 'Candidats',
  },
  {
    id: 'etudiant',
    icone: IconGraduation,
    titre: 'Espace étudiant',
    corps:
      'Consulter son parcours, sa situation financière et ses documents administratifs, et se réinscrire à l’ouverture de la campagne.',
    url: process.env.NEXT_PUBLIC_ESPACE_ETUDIANT_URL ?? null,
    interne: null,
    pour: 'Étudiants inscrits',
  },
  {
    id: 'moodle',
    icone: IconTeacher,
    titre: 'Plateforme pédagogique',
    corps: 'Accéder aux cours, aux ressources et aux activités d’apprentissage de sa formation.',
    url: process.env.NEXT_PUBLIC_MOODLE_URL ?? null,
    interne: null,
    pour: 'Étudiants et enseignants',
  },
  {
    id: 'messagerie',
    icone: IconMail,
    titre: 'Messagerie institutionnelle',
    corps: 'Boîte électronique de l’établissement, pour les étudiants et le personnel.',
    url: process.env.NEXT_PUBLIC_MESSAGERIE_URL ?? null,
    interne: null,
    pour: 'Étudiants et personnel',
  },
] as const;

export default function PageEspaceNumerique() {
  return (
    <>
      <PageHero
        eyebrow="Espace numérique"
        titre="Vos services en ligne"
        lead="Votre dossier, votre scolarité, vos cours et votre messagerie. Un seul numéro étudiant vous identifie partout."
        fil={[{ libelle: 'Espace numérique' }]}
      />

      <Section tone="paper">
        <Container>
          <ul className="grid gap-5 md:grid-cols-2">
            {SERVICES.map((service, index) => {
              const Icone = service.icone;
              const cible = service.url ?? service.interne;
              const disponible = cible !== null;
              const externe = service.url !== null;

              const contenu = (
                <>
                  <LaurelWreath
                    className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 text-ink-700/[0.04]"
                    leaves={9}
                  />
                  <div className="relative flex items-start justify-between gap-4">
                    <span className="flex h-12 w-12 items-center justify-center rounded-pill bg-ink-800">
                      <Icone className="h-5 w-5 text-gold-400" />
                    </span>
                    {disponible ? (
                      <IconArrowUpRight className="h-5 w-5 text-gold-500 transition-transform duration-300 ease-[var(--ease-arc)] group-hover/service:[transform:translate(0.125rem,-0.125rem)]" />
                    ) : (
                      <Pill tone="outline">Bientôt disponible</Pill>
                    )}
                  </div>
                  <h2 className="relative mt-6 text-[1.375rem] leading-snug text-ink-800">{service.titre}</h2>
                  <p className="relative mt-1.5 text-[0.75rem] font-bold uppercase tracking-[0.14em] text-gold-700">
                    {service.pour}
                  </p>
                  <p className="relative mt-3 flex-1 text-[0.9375rem] leading-relaxed text-graphite-500">
                    {service.corps}
                  </p>
                  {!disponible ? (
                    <p className="relative mt-5 border-t border-graphite-100 pt-4 text-[0.8125rem] leading-relaxed text-graphite-500">
                      Le service sera accessible ici dès sa mise en ligne. Aucune adresse n’est annoncée avant
                      qu’elle ne fonctionne.
                    </p>
                  ) : null}
                </>
              );

              const classe =
                'group/service relative flex h-full flex-col overflow-hidden rounded-card-lg border border-graphite-100 bg-paper-tint p-7';

              return (
                <li key={service.id} className="reveal" style={{ ['--reveal-delay' as string]: `${index * 70}ms` }}>
                  {disponible ? (
                    externe ? (
                      <a
                        href={cible}
                        rel="noreferrer noopener"
                        className={`${classe} transition-[transform,border-color,box-shadow] duration-500 ease-[var(--ease-arc)] hover:[transform:translateY(-0.25rem)] hover:border-ink-100 hover:shadow-lift`}
                      >
                        {contenu}
                      </a>
                    ) : (
                      <Link
                        href={cible}
                        className={`${classe} transition-[transform,border-color,box-shadow] duration-500 ease-[var(--ease-arc)] hover:[transform:translateY(-0.25rem)] hover:border-ink-100 hover:shadow-lift`}
                      >
                        {contenu}
                      </Link>
                    )
                  ) : (
                    <div className={classe}>{contenu}</div>
                  )}
                </li>
              );
            })}
          </ul>
        </Container>
      </Section>

      <Section tone="tint">
        <Container>
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <SectionHeading
                eyebrow="Votre identifiant"
                title="Votre numéro étudiant"
                lead="Il vous est donné à votre première inscription et ne change plus : carte étudiant, cours en ligne, reçus et attestations."
              />
            </div>
            <ul className="flex flex-col gap-4">
              {[
                {
                  titre: 'Il ne change jamais',
                  corps: 'Redoublement, changement de filière, passage du BTS à la Licence : le numéro reste le même.',
                },
                {
                  titre: 'Il vaut partout',
                  corps: 'C’est la clé commune à tous les services. Une seule numérotation, pour un suivi fiable.',
                },
                {
                  titre: 'Il vous survit comme étudiant',
                  corps:
                    'Un ancien étudiant peut obtenir un duplicata de relevé plusieurs années après son départ, sous le même numéro.',
                },
              ].map((point) => (
                <li key={point.titre} className="rounded-card-lg border border-graphite-100 bg-paper p-6">
                  <div className="flex items-start gap-3">
                    <IconUsers aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-gold-600" />
                    <div>
                      <p className="font-display text-[1.0625rem] text-ink-800">{point.titre}</p>
                      <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-graphite-500">{point.corps}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </Section>
    </>
  );
}
