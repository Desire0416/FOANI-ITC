import type { Metadata } from 'next';
import Link from 'next/link';
import { enregistrerFrais } from '@/app/(candidat)/mon-dossier/actions';
import { CadreEtape } from '@/components/candidat/cadre-etape';
import { Formulaire } from '@/components/candidat/formulaire';
import { Alerte, Carte, Champ, Liste } from '@/components/candidat/ui';
import { exigerDossier } from '@/lib/candidat';
import { socleCandidat } from '@/lib/candidat';
import { ETABLISSEMENT } from '@/content/site';
import { fraisDeDossier, grilleApplicable } from '@/payload/finances/grille';
import { formaterMontant } from '@/payload/finances/montants';
import { dossierModifiable } from '@/lib/etapes-dossier';

export const metadata: Metadata = { title: 'Frais de dossier' };

const MODES = [
  { valeur: 'mobile', libelle: 'Paiement mobile' },
  { valeur: 'guichet', libelle: 'Versement au guichet' },
  { valeur: 'virement', libelle: 'Virement bancaire' },
];

/**
 * Frais de dossier — CDC §10.2.
 *
 * Le dispositif n'encaisse rien : il enregistre une référence de transaction
 * qu'un agent rapproche ensuite de son relevé. Deux conséquences pour cet
 * écran : on n'y demande jamais de coordonnées bancaires, et l'étape ne bloque
 * pas l'envoi du dossier — le montant et les numéros officiels de réception
 * n'ayant pas encore été arrêtés par la direction, exiger un paiement
 * reviendrait à réclamer une somme que nous ne savons pas nommer.
 */
export default async function EtapeFrais() {
  const { dossier } = await exigerDossier();
  const ouvert = dossierModifiable(dossier);

  /* Le montant vient de la grille arrêtée pour le premier vœu du candidat.
     Tant qu'aucune ne l'est, `null` — et l'écran le dit franchement. */
  const rentree = new Date(ETABLISSEMENT.rentree).getFullYear();
  const grille = await grilleApplicable(
    await socleCandidat(),
    dossier.voeu1,
    `${rentree}-${rentree + 1}`,
  );
  const montant = fraisDeDossier(grille);

  return (
    <CadreEtape
      dossier={dossier}
      etape="frais"
      chapo="Cette étape est facultative. Si vous avez déjà réglé les frais de dossier, recopiez ici la référence que votre opérateur vous a envoyée."
    >
      <div className="flex flex-col gap-6">
        {montant === null ? (
          <Alerte ton="attention" titre="Le montant n’est pas encore publié">
            La direction n’a pas arrêté le montant des frais de dossier. Nous préférons ne rien
            afficher plutôt qu’un chiffre que l’établissement n’a pas validé.{' '}
            <Link href="/contact?sujet=frais" className="font-semibold underline">
              Écrivez-nous
            </Link>{' '}
            pour connaître les conditions applicables à votre formation — et envoyez votre dossier
            sans attendre&nbsp;: cette étape ne le bloque pas.
          </Alerte>
        ) : (
          <Carte titre="Ce que vous devez régler">
            <p className="font-display text-[2rem] leading-none text-ink-800 tabular-nums">
              {formaterMontant(montant)}
            </p>
            <p className="mt-2.5 text-[0.9375rem] leading-relaxed text-graphite-600">
              Frais de dossier, exigibles à l’envoi de votre candidature. Ils ne sont pas
              remboursables, y compris si votre candidature n’est pas retenue.
            </p>
            <p className="mt-3 text-[0.8125rem] leading-relaxed text-graphite-500">
              Réglez par paiement mobile vers un numéro officiel de l’établissement, puis recopiez
              ci-dessous la référence que votre opérateur vous a envoyée. Un agent la rapprochera de
              son relevé.
            </p>
          </Carte>
        )}

        {dossier.transactionVerifiee ? (
          <Alerte ton="reussite" titre="Votre paiement a été retrouvé">
            Un agent a rapproché votre référence de son relevé. Vous n’avez plus rien à faire de ce
            côté.
          </Alerte>
        ) : null}

        {ouvert ? (
          <Formulaire
            action={enregistrerFrais}
            envoi="Enregistrer la référence"
            retour={{ href: '/mon-dossier/recapitulatif', libelle: 'Passer cette étape' }}
          >
            <Carte
              titre="Votre paiement"
              aide="Nous n’encaissons rien depuis ce site. Nous vérifions simplement, sur notre relevé, que le versement portant cette référence nous est bien parvenu."
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <Champ
                  nom="referenceTransaction"
                  etiquette="Référence de la transaction"
                  valeur={dossier.referenceTransaction}
                  aide="Le numéro figurant sur le message de confirmation de votre opérateur."
                  requis
                />
                <Liste
                  nom="modeReglement"
                  etiquette="Moyen utilisé"
                  valeur={dossier.modeReglement ?? 'mobile'}
                  options={MODES}
                />
              </div>
            </Carte>

            <Alerte>
              Ne nous communiquez jamais votre code secret ni votre mot de passe d’opérateur. Nous
              n’avons besoin que de la référence du versement.
            </Alerte>
          </Formulaire>
        ) : (
          <Carte titre="Votre paiement">
            <p className="text-[0.9375rem] text-graphite-600">
              Référence enregistrée&nbsp;:{' '}
              <span className="font-semibold text-ink-800">
                {dossier.referenceTransaction ?? 'aucune'}
              </span>
            </p>
          </Carte>
        )}
      </div>
    </CadreEtape>
  );
}
