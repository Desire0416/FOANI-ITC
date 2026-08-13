import Image from 'next/image';
import Link from 'next/link';
import { IconArrowRight, IconMail, IconPhone, IconPin } from '@/components/brand/icons';
import { LaurelWreath, StarMark } from '@/components/brand/marks';
import { ButtonLink } from '@/components/ui/button';
import { Container } from '@/components/ui/primitives';
import { CONTACT, ETABLISSEMENT, PIED_COLONNES, PIED_LEGAL, RESEAUX } from '@/content/site';

/* ==========================================================================
   Pied de page
   La couronne du logo revient ici à sa plus grande échelle, en filigrane :
   le même signe qu'en tête de page, mais posé comme une signature.
   ========================================================================== */

const ANNEE = new Date().getFullYear();

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-ink-900 text-ink-100">
      <LaurelWreath
        className="pointer-events-none absolute -right-24 -top-24 h-[28rem] w-[28rem] text-paper/[0.035]"
        leaves={13}
      />

      {/* --- Appel final ------------------------------------------------- */}
      <Container className="relative border-b border-paper/10 py-14 lg:py-20">
        <div className="flex flex-col items-start gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <p className="inline-flex items-center gap-2 text-[0.6875rem] font-bold uppercase tracking-[0.18em] text-gold-400">
              <StarMark className="h-2.5 w-2.5" />
              Rentrée du 5 octobre 2026
            </p>
            <h2 className="mt-4 text-balance text-[1.875rem] leading-tight text-paper sm:text-[2.375rem]">
              Inscrivez-vous depuis votre téléphone
            </h2>
            <p className="mt-4 text-[1.0625rem] leading-relaxed text-ink-200">
              Créez votre compte, remplissez votre dossier et suivez son avancement. Tout se fait en ligne,
              sans venir à {ETABLISSEMENT.ville}.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/candidature" variant="gold" size="lg" trailing={<IconArrowRight />}>
              Candidater
            </ButtonLink>
            <ButtonLink href="/contact" variant="onDark" size="lg">
              Poser une question
            </ButtonLink>
          </div>
        </div>
      </Container>

      {/* --- Colonnes ------------------------------------------------------ */}
      <Container className="relative py-14">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,20rem)_1fr]">
          <div>
            <Link href="/" className="inline-block rounded-card bg-paper px-5 py-4">
              <Image
                src="/brand/logo-horizontal.png"
                alt={ETABLISSEMENT.nom}
                width={2172}
                height={724}
                sizes="220px"
                className="h-11 w-auto"
              />
            </Link>
            <p className="mt-5 max-w-xs font-display text-[1.0625rem] italic leading-snug text-gold-200">
              {ETABLISSEMENT.baseline}
            </p>

            <ul className="mt-7 flex flex-col gap-3 text-[0.875rem]">
              <li className="flex items-start gap-3">
                <IconPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" />
                <span className="text-ink-200">
                  {CONTACT.adresse.valeur ?? CONTACT.adresse.secours}
                  {CONTACT.adresse.valeur === null ? (
                    <span className="block text-[0.75rem] text-ink-300">Adresse complète à publier</span>
                  ) : null}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <IconPhone className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" />
                <span className="flex flex-col">
                  <a
                    href={`tel:${CONTACT.telephone.valeur}`}
                    className="link-underline inline-block py-1 text-ink-200"
                  >
                    {CONTACT.telephone.affichage}
                  </a>
                  <a
                    href={`tel:${CONTACT.telephoneFixe.valeur}`}
                    className="link-underline inline-block py-1 text-ink-200"
                  >
                    {CONTACT.telephoneFixe.affichage}
                  </a>
                </span>
              </li>
              <li className="flex items-start gap-3">
                <IconMail className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" />
                {CONTACT.courriel.valeur ? (
                  <a
                    href={`mailto:${CONTACT.courriel.valeur}`}
                    className="link-underline inline-block py-1 text-ink-200"
                  >
                    {CONTACT.courriel.valeur}
                  </a>
                ) : (
                  <Link href="/contact" className="link-underline inline-block py-1 text-ink-200">
                    Formulaire de contact
                  </Link>
                )}
              </li>
            </ul>

            {/* Un compte dont l'adresse exacte n'a pas été transmise est cité,
                pas lié : mieux vaut un nom qu'un lien qui tombe à côté. */}
            {RESEAUX.length > 0 ? (
              <ul className="mt-6 flex flex-wrap gap-2">
                {RESEAUX.map((reseau) => (
                  <li key={reseau.nom}>
                    {reseau.url ? (
                      <a
                        href={reseau.url}
                        rel="noreferrer noopener"
                        target="_blank"
                        className="rounded-pill border border-paper/20 px-3.5 py-1.5 text-[0.75rem] font-semibold text-ink-100 transition-colors hover:border-gold-400 hover:text-gold-300"
                      >
                        {reseau.nom}
                      </a>
                    ) : (
                      <span className="inline-flex flex-col rounded-pill border border-paper/15 px-3.5 py-1.5 text-[0.75rem] text-ink-200">
                        <span className="font-semibold text-ink-100">{reseau.nom}</span>
                        <span className="text-[0.6875rem] text-ink-300">{reseau.compte}</span>
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <nav aria-label="Pied de page" className="grid grid-cols-2 gap-x-8 gap-y-9 sm:grid-cols-4">
            {PIED_COLONNES.map((colonne) => (
              <div key={colonne.titre}>
                <p className="mb-4 text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-gold-400">
                  {colonne.titre}
                </p>
                <ul className="flex flex-col gap-1">
                  {colonne.liens.map((lien) => (
                    <li key={`${lien.href}-${lien.libelle}`}>
                      <Link
                        href={lien.href}
                        className="link-underline inline-block py-1 text-[0.875rem] leading-snug text-ink-200 transition-colors hover:text-paper"
                      >
                        {lien.libelle}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>
      </Container>

      {/* --- Bandeau légal -------------------------------------------------- */}
      <div className="relative border-t border-paper/10">
        <Container className="flex flex-col gap-4 py-6 md:flex-row md:items-center md:justify-between">
          <p className="text-[0.75rem] text-ink-300">
            © {ANNEE} {ETABLISSEMENT.nom} — {ETABLISSEMENT.ville}, {ETABLISSEMENT.pays}
          </p>
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {PIED_LEGAL.map((lien) => (
              <li key={lien.href}>
                <Link
                  href={lien.href}
                  className="link-underline inline-block py-1.5 text-[0.75rem] text-ink-300 hover:text-ink-100"
                >
                  {lien.libelle}
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </div>
    </footer>
  );
}
