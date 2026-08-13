import type { Metadata } from 'next';
import Link from 'next/link';
import { enregistrerFrais } from '@/app/(candidat)/mon-dossier/actions';
import { CadreEtape } from '@/components/candidat/cadre-etape';
import { Formulaire } from '@/components/candidat/formulaire';
import { Alerte, Carte, Champ, Liste } from '@/components/candidat/ui';
import { exigerDossier } from '@/lib/candidat';
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

  return (
    <CadreEtape
      dossier={dossier}
      etape="frais"
      chapo="Cette étape est facultative. Si vous avez déjà réglé les frais de dossier, recopiez ici la référence que votre opérateur vous a envoyée."
    >
      <div className="flex flex-col gap-6">
        <Alerte ton="attention" titre="Le montant n’est pas encore publié">
          La direction n’a pas arrêté le montant des frais de dossier ni les numéros officiels de
          réception. Nous préférons ne rien afficher plutôt qu’un chiffre que l’établissement n’a pas
          validé.{' '}
          <Link href="/contact?sujet=frais" className="font-semibold underline">
            Écrivez-nous
          </Link>{' '}
          pour connaître les conditions applicables à votre formation — et envoyez votre dossier sans
          attendre&nbsp;: cette étape ne le bloque pas.
        </Alerte>

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
