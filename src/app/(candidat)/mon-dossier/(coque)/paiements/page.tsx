import type { Metadata } from 'next';
import Link from 'next/link';
import { IconArrowRight, IconCheck, IconClock } from '@/components/brand/icons';
import { AnnoncerVersement } from '@/components/candidat/offre';
import { Carte } from '@/components/candidat/ui';
import { EnTetePage } from '@/components/commun/ui';
import { referenceReglement } from '@/app/(candidat)/mon-dossier/offre';
import { CONTACT, ETABLISSEMENT } from '@/content/site';
import { exigerDossier, socleCandidat } from '@/lib/candidat';
import { grilleApplicable } from '@/payload/finances/grille';
import { Tarifs } from '@/components/commun/tarifs';

export const metadata: Metadata = { title: 'Mes paiements' };

/* ==========================================================================
   Mes paiements — Note complémentaire §6.6 et §6.7
   --------------------------------------------------------------------------
   « Chaque personne dispose d'une référence de règlement propre, dérivée de
   son numéro de dossier ou de son numéro étudiant. Elle l'indique lors de son
   paiement mobile ou de son virement. C'est ce qui rend le rapprochement
   possible : sans elle, un versement effectué par un parent depuis son propre
   téléphone devient impossible à rattacher. »

   Cette phrase commande toute la page. La référence n'est pas une donnée
   d'affichage : c'est un objet à transmettre, souvent à quelqu'un d'autre que
   le candidat. Elle est donc en grand, seule, sélectionnable — et le texte qui
   l'accompagne s'adresse autant au payeur qu'au titulaire.

   Les montants viennent de la grille arrêtée par la direction pour la formation
   du candidat. Tant qu'aucune ne l'est, la page le dit franchement plutôt que
   d'afficher un zéro : un tarif non publié n'est pas une gratuité.

   « Dans tous les cas, la saisie dans le dispositif est le fait d'un agent :
   le dispositif n'encaisse rien. » C'est dit en toutes lettres à l'écran.
   ========================================================================== */

const MOYENS = [
  {
    titre: 'Paiement mobile',
    corps: 'Vers les numéros officiels de l’établissement. Indiquez votre référence dans le motif.',
  },
  {
    titre: 'Virement bancaire',
    corps: 'Portez votre référence en objet du virement, sans quoi il ne pourra pas être rattaché.',
  },
  {
    titre: 'Versement au guichet',
    corps: 'Sur place, à Agnibilékrou. Un agent enregistre le versement et remet le reçu.',
  },
];

export default async function MesPaiements() {
  const { dossier } = await exigerDossier();
  const reglement = await referenceReglement(dossier.reference);

  const rentree = new Date(ETABLISSEMENT.rentree).getFullYear();
  const grille = await grilleApplicable(
    await socleCandidat(),
    dossier.voeu1,
    `${rentree}-${rentree + 1}`,
  );

  const annonceAttendue = dossier.etat === 'offre-acceptee';

  return (
    <div className="flex flex-col gap-6">
      <EnTetePage
        surtitre="Mes paiements"
        titre="Régler mes frais"
        resume="Tout ce qui concerne vos règlements : votre référence personnelle, les moyens acceptés, et l’état de ce que vous avez annoncé."
      />

      {/* ------------------------------------------------ La référence */}
      <section className="carte overflow-hidden">
        <header className="border-b border-graphite-100 bg-paper-tint px-5 py-4">
          <h2 className="text-[1.0625rem] leading-snug">Votre référence de règlement</h2>
        </header>
        <div className="p-5 sm:p-6">
          <p className="font-display text-[2rem] leading-none text-ink-800 tabular-nums select-all sm:text-[2.5rem]">
            {reglement}
          </p>
          <p className="mt-4 max-w-2xl text-[0.9375rem] leading-relaxed text-graphite-600">
            Indiquez-la à chacun de vos paiements. C’est elle, et elle seule, qui permet de
            rattacher un versement à votre dossier. Si un proche règle pour vous depuis son propre
            téléphone, communiquez-lui cette référence&nbsp;: sans elle, son versement ne pourra
            pas vous être attribué.
          </p>
        </div>
      </section>

      {/* ------------------------------------------------ Ce qui est attendu */}
      {annonceAttendue ? (
        <section className="carte overflow-hidden">
          <header className="border-b border-graphite-100 bg-paper-tint px-5 py-4">
            <h2 className="text-[1.0625rem] leading-snug">Annoncer mon versement</h2>
          </header>
          <div className="p-5 sm:p-6">
            <AnnoncerVersement reference={reglement} />
          </div>
        </section>
      ) : null}

      {/* ------------------------------------------------ Ce qui est enregistré */}
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Carte titre="Ce que vous avez annoncé">
          {dossier.referenceTransaction ? (
            <div className="flex items-start gap-3.5 rounded-xl border border-graphite-200 bg-paper-tint p-4">
              <span
                className={
                  dossier.transactionVerifiee
                    ? 'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-state-success/12 text-state-success'
                    : 'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gold-100 text-gold-800'
                }
              >
                {dossier.transactionVerifiee ? (
                  <IconCheck className="h-4 w-4" />
                ) : (
                  <IconClock className="h-4 w-4" />
                )}
              </span>
              <div className="min-w-0">
                <p className="font-display text-[1.0625rem] text-ink-800">
                  {dossier.referenceTransaction}
                </p>
                <p className="mt-1 text-[0.875rem] leading-relaxed text-graphite-600">
                  {dossier.transactionVerifiee
                    ? 'Versement constaté par le service des finances.'
                    : 'En attente de vérification. Le service des finances doit le rapprocher de son relevé avant qu’il produise effet.'}
                </p>
                {dossier.modeReglement ? (
                  <p className="mt-1 text-[0.8125rem] text-graphite-500">
                    Moyen déclaré&nbsp;: {dossier.modeReglement}
                  </p>
                ) : null}
              </div>
            </div>
          ) : (
            <p className="text-[0.9375rem] leading-relaxed text-graphite-500">
              Vous n’avez encore annoncé aucun versement. Dès qu’un paiement est fait, revenez
              saisir la référence que votre opérateur vous a envoyée&nbsp;: c’est ce qui permet au
              service des finances de le retrouver.
            </p>
          )}

          <p className="mt-5 border-t border-graphite-100 pt-4 text-[0.8125rem] leading-relaxed text-graphite-500">
            Ce site n’encaisse aucun fonds. Un versement annoncé n’a d’effet qu’une fois constaté
            par un agent, qui le rapproche du relevé de l’établissement. Ne communiquez jamais votre
            code secret d’opérateur, à personne.
          </p>
        </Carte>

        <div className="flex flex-col gap-4">
          <Carte titre="Les moyens acceptés">
            <ul className="flex flex-col gap-4">
              {MOYENS.map((moyen) => (
                <li key={moyen.titre}>
                  <p className="text-[0.9375rem] font-semibold text-ink-800">{moyen.titre}</p>
                  <p className="mt-0.5 text-[0.8125rem] leading-relaxed text-graphite-500">
                    {moyen.corps}
                  </p>
                </li>
              ))}
            </ul>
          </Carte>

          <Carte titre="Les montants">
            {grille ? (
              <Tarifs grille={grille} />
            ) : (
              <>
                <p className="text-[0.9375rem] leading-relaxed text-graphite-600">
                  L’établissement n’a pas encore publié sa grille tarifaire. Les montants vous sont
                  communiqués par le service des finances, qui vous indiquera aussi votre
                  échéancier.
                </p>
                <Link
                  href={`tel:${CONTACT.telephone.valeur}`}
                  className="mt-4 inline-flex items-center gap-1.5 text-[0.875rem] font-semibold text-ink-700 hover:text-ink-600"
                >
                  Appeler l’établissement — {CONTACT.telephone.affichage}
                  <IconArrowRight className="h-3.5 w-3.5" />
                </Link>
              </>
            )}
          </Carte>
        </div>
      </div>
    </div>
  );
}
