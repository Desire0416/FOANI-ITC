import type { Metadata } from 'next';
import Link from 'next/link';
import { IconArrowRight, IconCheck, IconClock } from '@/components/brand/icons';
import { BandeauEtapes } from '@/components/candidat/bandeau-etapes';
import { Alerte, Carte, Ligne } from '@/components/candidat/ui';
import { EnTetePage } from '@/components/commun/ui';
import { exigerDossierInscription } from '@/lib/inscription-garde';
import {
  ETAPES_INSCRIPTION,
  etapeInscriptionAReprendre,
  etapeInscriptionFaite,
  inscriptionEnvoyable,
  manquesDuDossierInscription,
} from '@/lib/etapes-inscription';
import { cn } from '@/lib/utils';
import { BoutonAction } from '@/components/candidat/formulaire';
import { soumettreInscription } from './actions';

export const metadata: Metadata = { title: 'Mon inscription' };

/* ==========================================================================
   Le sommaire du dossier d'inscription — Note complémentaire §5.1
   --------------------------------------------------------------------------
   Les étapes 4, 5 et 6 forment un tout : compléter le dossier, faire vérifier
   son identité, signer ses engagements. La scolarité ne valide qu'après les
   trois (étape 7).

   L'étape 4 est ouverte. Les deux suivantes ne le sont pas encore, et cette
   page le dit — plutôt que d'offrir un bouton d'envoi qui ferait sauter deux
   étapes, ce que la chaîne interdit (RG-41) et ce qui laisserait la scolarité
   valider une inscription sans identité vérifiée ni engagement signé.
   ========================================================================== */

export default async function SommaireInscription() {
  const { dossier, ouvert } = await exigerDossierInscription();

  const faites = ETAPES_INSCRIPTION.filter((etape) =>
    etapeInscriptionFaite(etape.id, dossier),
  ).map((etape) => etape.id);
  const manques = manquesDuDossierInscription(dossier);
  const complet = inscriptionEnvoyable(dossier);
  const reprise = etapeInscriptionAReprendre(dossier);
  const d = dossier as unknown as Record<string, string | null>;
  const identiteVerifiee = d.identiteControle === 'conforme';

  return (
    <div className="flex flex-col gap-6">
      <EnTetePage
        surtitre="Mon inscription"
        titre={complet ? 'Votre dossier d’inscription est complet' : 'Votre dossier d’inscription'}
        resume={
          complet
            ? 'Il ne reste qu’à signer vos engagements. Cette étape ouvrira dans cet espace.'
            : 'Complétez les informations que votre candidature ne recueillait pas. Tout est enregistré au fur et à mesure.'
        }
        actions={
          ouvert && !complet ? (
            <Link href={reprise.href} className="bouton bouton--principal">
              {faites.length === 0 ? 'Commencer' : 'Reprendre'}
              <IconArrowRight className="h-4 w-4" />
            </Link>
          ) : null
        }
      />

      <BandeauEtapes
        etapes={ETAPES_INSCRIPTION}
        courante=""
        faites={faites}
        cadre
      />

      {/* ------------------------------------------------ Ce qui reste à faire */}
      {ouvert && manques.length > 0 ? (
        <section className="carte overflow-hidden">
          <header className="border-b border-graphite-100 bg-paper-tint px-5 py-4">
            <h2 className="text-[1.0625rem] leading-snug">Ce qu’il reste à renseigner</h2>
          </header>
          <ul className="flex flex-col">
            {manques.map((ligne) => (
              <li key={ligne.etape.id} className="border-b border-graphite-100 last:border-0">
                <Link
                  href={ligne.etape.href}
                  className="flex items-start gap-3.5 px-5 py-4 transition-colors hover:bg-paper-tint"
                >
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gold-100 font-display text-[0.75rem] text-gold-800">
                    {ligne.etape.numero}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[0.9375rem] font-semibold text-ink-800">
                      {ligne.etape.libelle}
                    </span>
                    <span className="mt-0.5 block text-[0.875rem] leading-snug text-graphite-500">
                      Il manque {ligne.absents.join(', ')}.
                    </span>
                  </span>
                  <IconArrowRight
                    aria-hidden="true"
                    className="mt-1.5 h-4 w-4 shrink-0 text-graphite-400"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* --------------------------------------------------------- L'envoi */}
      {ouvert && complet ? (
        <section className="carte overflow-hidden">
          <header className="border-b border-graphite-100 bg-paper-tint px-5 py-4">
            <h2 className="text-[1.0625rem] leading-snug">Envoyer mon dossier à la scolarité</h2>
          </header>
          <div className="p-5 sm:p-6">
            {identiteVerifiee ? (
              <>
                <p className="text-[0.9375rem] leading-relaxed text-graphite-600">
                  Tout est en place. Le service de la scolarité contrôlera une dernière fois votre
                  dossier, puis prononcera votre inscription et vous attribuera votre numéro
                  étudiant. Vous ne pourrez plus modifier ce dossier ensuite.
                </p>
                <BoutonAction
                  action={soumettreInscription}
                  libelle="Envoyer mon dossier d’inscription"
                  libelleAttente="Envoi en cours…"
                  variante="or"
                  confirmation="Envoyer votre dossier d’inscription au service de la scolarité ? Vous ne pourrez plus le modifier."
                  className="mt-5"
                />
              </>
            ) : (
              <p className="flex gap-3 text-[0.9375rem] leading-relaxed text-graphite-600">
                <IconClock aria-hidden="true" className="mt-0.5 h-[1.125rem] w-[1.125rem] shrink-0 text-graphite-400" />
                <span>
                  Votre dossier est complet. Il partira dès que le service de la scolarité aura
                  vérifié votre pièce d’identité&nbsp;: c’est le second regard que le dispositif
                  impose avant toute inscription. Vous n’avez rien d’autre à faire.
                </span>
              </p>
            )}
          </div>
        </section>
      ) : null}

      {!ouvert ? (
        <Alerte titre="Votre dossier est entre les mains de la scolarité">
          Vous pouvez le relire, mais plus le modifier. Nous vous préviendrons dès que votre
          inscription sera prononcée.
        </Alerte>
      ) : null}

      {/* --------------------------------------------------- Ce qui est saisi */}
      <div className="grid gap-4 xl:grid-cols-2">
        <Carte titre="Ce que vous avez renseigné">
          <dl>
            <Ligne
              intitule="Nom et prénoms"
              valeur={[d.nomActe, d.prenomsActe].filter(Boolean).join(' ')}
              href={ouvert ? '/mon-dossier/inscription/etat-civil' : undefined}
            />
            <Ligne intitule="Né(e) à" valeur={[d.lieuNaissanceActe, d.paysNaissance].filter(Boolean).join(', ')} />
            <Ligne
              intitule="Père"
              valeur={d.pereNom}
              href={ouvert ? '/mon-dossier/inscription/filiation' : undefined}
            />
            <Ligne intitule="Mère" valeur={d.mereNom} />
            <Ligne
              intitule="Résidence"
              valeur={[d.residenceQuartier, d.residenceVille].filter(Boolean).join(', ')}
              href={ouvert ? '/mon-dossier/inscription/residence' : undefined}
            />
            <Ligne
              intitule="À prévenir"
              valeur={d.urgenceNom}
              href={ouvert ? '/mon-dossier/inscription/urgence' : undefined}
            />
            <Ligne
              intitule="Pièce d’identité"
              valeur={
                d.identiteControle === 'conforme'
                  ? 'Vérifiée par la scolarité'
                  : d.identiteControle === 'a-revoir'
                    ? 'À reprendre'
                    : d.pieceRecto && d.pieceVerso && d.pieceSelfie
                      ? 'Déposée, en attente de contrôle'
                      : null
              }
              href={ouvert ? '/mon-dossier/inscription/piece-identite' : undefined}
            />
          </dl>
        </Carte>

        <Carte titre="Vos étapes">
          <ul className="flex flex-col gap-2.5">
            {ETAPES_INSCRIPTION.map((etape) => {
              const faite = faites.includes(etape.id);
              return (
                <li key={etape.id}>
                  <Link
                    href={etape.href}
                    className="flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-paper-tint"
                  >
                    <span
                      className={cn(
                        'flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-display text-[0.75rem]',
                        faite ? 'bg-state-success text-paper' : 'bg-graphite-200 text-graphite-600',
                      )}
                    >
                      {faite ? <IconCheck className="h-3.5 w-3.5" /> : etape.numero}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[0.875rem] font-semibold text-ink-800">
                        {etape.libelle}
                      </span>
                      <span className="block text-[0.8125rem] text-graphite-500">
                        {etape.resume}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Carte>
      </div>
    </div>
  );
}
