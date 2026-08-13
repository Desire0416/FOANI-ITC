import type { Metadata } from 'next';
import Image from 'next/image';
import { IconDownload, IconFile, IconMail } from '@/components/brand/icons';
import { FormulaireDemande } from '@/components/formulaire-demande';
import { PageHero } from '@/components/layout/page-hero';
import { DonneeManquante } from '@/components/ui/donnee-manquante';
import { Container, Section, SectionHeading } from '@/components/ui/primitives';
import { ETABLISSEMENT } from '@/content/site';

export const metadata: Metadata = {
  title: 'Espace presse',
  description:
    "Ressources presse de FOANI International Training College : informations officielles, logos, éléments de marque et contact presse.",
  alternates: { canonical: '/presse' },
  robots: { index: true, follow: true },
};

const LOGOS = [
  { fichier: '/brand/logo-horizontal.png', libelle: 'Logo horizontal — fond transparent', fond: 'bg-paper' },
  { fichier: '/brand/logo-vertical.png', libelle: 'Logo vertical — fond transparent', fond: 'bg-paper' },
  { fichier: '/brand/logo-horizontal-fond-blanc.png', libelle: 'Logo horizontal — fond blanc', fond: 'bg-paper-tint' },
] as const;

export default function PagePresse() {
  return (
    <>
      <PageHero
        eyebrow="Espace presse"
        titre="Espace presse"
        lead="Informations officielles, logos et contact, destinés aux journalistes et aux structures qui souhaitent parler de l’établissement."
        fil={[{ libelle: 'Espace presse' }]}
      />

      {/* ---------------------------------------------------------- L'essentiel */}
      <Section tone="paper">
        <Container>
          <SectionHeading eyebrow="En bref" title="L’essentiel en quelques lignes" className="mb-10" />
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:gap-16">
            <div className="flex flex-col gap-4 text-[1.0625rem] leading-relaxed text-graphite-600">
              <p>
                {ETABLISSEMENT.nom} ({ETABLISSEMENT.sigle}) est un établissement d’enseignement supérieur privé
                spécialisé dans les domaines agricole, agropastoral et agroalimentaire, implanté à{' '}
                {ETABLISSEMENT.ville}, en {ETABLISSEMENT.pays}.
              </p>
              <p>
                Il conjugue deux activités : une université spécialisée délivrant des diplômes — BTS sur deux ans
                et Licence sur trois ans — et un cabinet de formation et d’expertise agréé intervenant auprès des
                organisations professionnelles et des entreprises.
              </p>
              <p>
                L’établissement s’adosse à plus de cinquante ans d’expérience du groupe FOANI dans le secteur
                agricole. Deux promotions ont été conduites jusqu’au BTS et présentées à l’examen d’État. Le
                cycle Licence ouvre en première année à la rentrée du 5 octobre 2026.
              </p>
            </div>

            <dl className="flex flex-col divide-y divide-graphite-100 rounded-card-lg border border-graphite-100 bg-paper-tint px-6">
              {[
                ['Dénomination', ETABLISSEMENT.nom],
                ['Sigle', ETABLISSEMENT.sigle],
                ['Signature', ETABLISSEMENT.signature],
                ['Implantation', `${ETABLISSEMENT.ville}, ${ETABLISSEMENT.pays}`],
                ['Rentrée 2026', '5 octobre 2026'],
              ].map(([terme, valeur]) => (
                <div key={terme} className="py-4">
                  <dt className="text-[0.6875rem] uppercase tracking-[0.14em] text-graphite-600">{terme}</dt>
                  <dd className="mt-1 text-[0.9375rem] leading-snug text-ink-800">{valeur}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Container>
      </Section>

      {/* ------------------------------------------------------------- Logos */}
      <Section tone="tint">
        <Container>
          <SectionHeading
            eyebrow="Ressources de marque"
            title="Logos officiels"
            lead="Merci de ne pas modifier le logo : ni les couleurs, ni les proportions. Ménagez un espace libre autour de lui."
            className="mb-12"
          />
          <ul className="grid gap-5 md:grid-cols-3">
            {LOGOS.map((logo, index) => (
              <li key={logo.fichier} className="reveal" style={{ ['--reveal-delay' as string]: `${index * 70}ms` }}>
                <figure className="flex h-full flex-col overflow-hidden rounded-card-lg border border-graphite-100 bg-paper">
                  <div className={`flex flex-1 items-center justify-center p-8 ${logo.fond}`}>
                    <Image
                      src={logo.fichier}
                      alt={logo.libelle}
                      width={600}
                      height={400}
                      sizes="(max-width: 768px) 90vw, 300px"
                      className="h-auto max-h-32 w-auto object-contain"
                    />
                  </div>
                  <figcaption className="flex items-center justify-between gap-4 border-t border-graphite-100 px-5 py-4">
                    <span className="text-[0.8125rem] leading-snug text-graphite-600">{logo.libelle}</span>
                    <a
                      href={logo.fichier}
                      download
                      aria-label={`Télécharger : ${logo.libelle}`}
                      className="shrink-0 rounded-pill bg-ink-50 p-2.5 text-ink-700 transition-colors hover:bg-ink-100"
                    >
                      <IconDownload className="h-4 w-4" />
                    </a>
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>

          <DonneeManquante
            className="mt-8"
            quoi="Fichiers vectoriels du logo et du badge institutionnel, photographies autorisées et dossier de presse : à fournir par l'établissement, accompagnés de leurs conditions d'utilisation."
            action={null}
          />
        </Container>
      </Section>

      {/* ------------------------------------------------------------ Contact */}
      <Section tone="paper">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,30rem)] lg:gap-16">
            <div>
              <SectionHeading
                eyebrow="Contact presse"
                title="Nous joindre"
                lead="Les demandes presse sont traitées par la direction de l'établissement."
              />
              <ul className="mt-9 flex flex-col gap-4">
                {[
                  { icone: IconMail, texte: 'Contact presse dédié : adresse à publier.' },
                  { icone: IconFile, texte: 'Dossier institutionnel et communiqués : en préparation.' },
                ].map((item) => {
                  const Icone = item.icone;
                  return (
                    <li key={item.texte} className="flex items-center gap-3 text-[0.9375rem] text-graphite-600">
                      <Icone aria-hidden="true" className="h-5 w-5 shrink-0 text-gold-600" />
                      {item.texte}
                    </li>
                  );
                })}
              </ul>
            </div>
            <div className="rounded-card-lg border border-graphite-100 bg-paper-tint p-7">
              <h2 className="font-display text-[1.25rem] text-ink-800">Demande presse</h2>
              <FormulaireDemande type="contact" origine="presse" className="mt-6" />
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
