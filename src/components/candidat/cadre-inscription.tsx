import type { ReactNode } from 'react';
import Link from 'next/link';
import { IconArrowRight } from '@/components/brand/icons';
import { BandeauEtapes } from '@/components/candidat/bandeau-etapes';
import { Alerte } from '@/components/candidat/ui';
import {
  ETAPES_INSCRIPTION,
  etapeInscriptionFaite,
  inscriptionModifiable,
  manquesDuDossierInscription,
  type IdEtapeInscription,
} from '@/lib/etapes-inscription';
import { cn } from '@/lib/utils';
import type { Candidature } from '@/payload-types';

/* ==========================================================================
   Cadre commun aux étapes du dossier d'inscription
   --------------------------------------------------------------------------
   Même agencement que celui de la candidature — en-tête, bandeau, formulaire à
   gauche, contexte à droite —, parce qu'il n'y a aucune raison qu'un candidat
   qui a appris à remplir l'un doive réapprendre à remplir l'autre.

   Le contexte diffère : là où la candidature rappelait le numéro de dossier,
   celui-ci rappelle qu'une inscription se prononce sur les pièces recopiées,
   et que la graphie compte. C'est l'avertissement le plus utile de tout le
   parcours : une lettre d'écart entre l'attestation délivrée ici et l'acte de
   naissance fait rejeter un dossier de bourse ou de logement.
   ========================================================================== */

export function CadreInscription({
  dossier,
  etape,
  chapo,
  children,
}: {
  dossier: Candidature;
  etape: IdEtapeInscription;
  chapo?: string;
  children: ReactNode;
}) {
  const courante = ETAPES_INSCRIPTION.find((item) => item.id === etape)!;
  const ouvert = inscriptionModifiable(dossier);
  const faites = ETAPES_INSCRIPTION.filter((item) =>
    etapeInscriptionFaite(item.id, dossier),
  ).map((item) => item.id);
  const manques = manquesDuDossierInscription(dossier);

  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="text-[0.6875rem] font-bold tracking-[0.16em] text-ink-700 uppercase">
          Inscription — étape {courante.numero} sur {ETAPES_INSCRIPTION.length}
        </p>
        <h1 className="mt-2 text-[1.75rem] leading-tight sm:text-[2.125rem]">{courante.libelle}</h1>
        {chapo ? (
          <p className="mt-3 max-w-2xl text-[0.9375rem] leading-relaxed text-graphite-600">
            {chapo}
          </p>
        ) : null}
      </header>

      <BandeauEtapes etapes={ETAPES_INSCRIPTION} courante={etape} faites={faites} cadre />

      {ouvert ? null : (
        <Alerte ton="attention" titre="Ce dossier n’est plus modifiable">
          Il est entre les mains du service de la scolarité. Vous pouvez suivre son avancement
          depuis votre espace.
        </Alerte>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,20rem)]">
        <fieldset disabled={!ouvert} className={cn('min-w-0', ouvert ? undefined : 'opacity-70')}>
          {children}
        </fieldset>

        {/* Hors du `fieldset`, délibérément : ses liens doivent rester
            cliquables même quand le formulaire est éteint. */}
        <div className="min-w-0 xl:sticky xl:top-24 xl:self-start">
          <aside className="flex flex-col gap-4">
            <div className="carte p-5">
              <h2 className="text-[0.9375rem] leading-snug">Recopiez, ne corrigez pas</h2>
              <p className="mt-2 text-[0.8125rem] leading-relaxed text-graphite-600">
                Votre nom, vos prénoms et votre lieu de naissance doivent être saisis{' '}
                <strong className="font-semibold text-ink-800">exactement</strong> comme ils
                figurent sur votre acte de naissance — accents, apostrophes et ordre compris.
              </p>
              <p className="mt-2.5 text-[0.8125rem] leading-relaxed text-graphite-500">
                C’est cette graphie qui sera imprimée sur votre certificat de scolarité, votre
                attestation d’inscription et votre carte. Une seule lettre d’écart, et un dossier de
                bourse ou de logement est rejeté.
              </p>
            </div>

            {ouvert ? (
              <div className="carte p-5">
                <h2 className="text-[0.9375rem] leading-snug">
                  {manques.length === 0 ? 'Votre dossier est complet' : 'Ce qu’il reste à faire'}
                </h2>

                {manques.length === 0 ? (
                  <p className="mt-2 text-[0.8125rem] leading-relaxed text-graphite-500">
                    Il ne reste plus qu’à vérifier votre identité et à signer vos engagements.
                  </p>
                ) : (
                  <ul className="mt-3 flex flex-col gap-2.5">
                    {manques.map((ligne) => (
                      <li key={ligne.etape.id}>
                        <Link
                          href={ligne.etape.href}
                          className="flex items-start gap-2.5 text-[0.8125rem] leading-snug text-graphite-600 hover:text-ink-700"
                        >
                          <span
                            aria-hidden="true"
                            className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-400"
                          />
                          <span className="min-w-0">
                            <span className="font-semibold text-ink-800">
                              {ligne.etape.libelle}
                            </span>
                            {' — '}
                            {ligne.absents.join(', ')}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}

                <Link
                  href="/mon-dossier/inscription"
                  className="mt-4 inline-flex items-center gap-1.5 text-[0.8125rem] font-semibold text-ink-700 hover:text-ink-600"
                >
                  Revenir au sommaire
                  <IconArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ) : null}

            {/* Mention d'information, exigée dès lors qu'on recueille des
                données personnelles — et ici celles de tiers, parents et
                personne à prévenir, qui ne sont pas là pour consentir. */}
            <div className="carte p-5">
              <h2 className="text-[0.9375rem] leading-snug">Vos données</h2>
              <p className="mt-2 text-[0.8125rem] leading-relaxed text-graphite-600">
                Ces informations servent à établir votre inscription et les documents officiels qui
                en découlent. Elles ne sont lues que par les services de la scolarité et des
                admissions.
              </p>
              <Link
                href="/confidentialite"
                className="mt-3 inline-flex items-center gap-1.5 text-[0.8125rem] font-semibold text-ink-700 hover:text-ink-600"
              >
                Politique de confidentialité
                <IconArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
