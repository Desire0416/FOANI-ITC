import type { Metadata } from 'next';
import { CadreInscription } from '@/components/candidat/cadre-inscription';
import { Formulaire } from '@/components/candidat/formulaire';
import { Alerte, Carte, Champ } from '@/components/candidat/ui';
import { exigerDossierInscription } from '@/lib/inscription-garde';
import { enregistrerUrgence } from '../actions';

export const metadata: Metadata = { title: 'Qui prévenir' };

export default async function Urgence() {
  const { dossier } = await exigerDossierInscription();
  const d = dossier as unknown as Record<string, string | null>;

  return (
    <CadreInscription
      dossier={dossier}
      etape="urgence"
      chapo="La personne que nous appellerons s’il vous arrivait quelque chose. Des mois ont passé depuis votre candidature : vérifiez que ces coordonnées sont encore les bonnes."
    >
      <Formulaire action={enregistrerUrgence}>
        <Carte titre="La personne à prévenir">
          <div className="grid gap-5 sm:grid-cols-2">
            <Champ
              nom="urgenceNom"
              etiquette="Nom et prénoms"
              valeur={d.urgenceNom ?? dossier.contactNom}
              requis
            />
            <Champ
              nom="urgenceLien"
              etiquette="Lien avec vous"
              valeur={d.urgenceLien ?? dossier.contactLien}
              requis
              aide="Père, mère, sœur, tuteur, conjoint…"
            />
            <Champ
              nom="urgenceTelephone"
              etiquette="Téléphone"
              valeur={d.urgenceTelephone ?? dossier.contactTelephone}
              type="tel"
              inputMode="tel"
              requis
            />
            <Champ
              nom="urgenceTelephoneSecond"
              etiquette="Second téléphone"
              valeur={d.urgenceTelephoneSecond}
              type="tel"
              inputMode="tel"
              facultatif
              aide="Un seul numéro injoignable rend cette rubrique inutile le jour où elle sert."
            />
          </div>
        </Carte>

        <Carte
          titre="Où elle habite"
          aide="En cas d’urgence, nous devons pouvoir faire porter un message, pas seulement appeler."
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <Champ nom="urgenceVille" etiquette="Ville ou commune" valeur={d.urgenceVille} requis />
            <Champ
              nom="urgenceQuartier"
              etiquette="Quartier"
              valeur={d.urgenceQuartier}
              requis
            />
          </div>
        </Carte>

        {/* Loyauté de la collecte : ce sont les données d'un tiers absent,
            recueillies sans son intervention. Il doit au moins le savoir. */}
        <Alerte>
          Prévenez cette personne que vous l’avez désignée&nbsp;: nous conserverons ses coordonnées
          pendant votre scolarité, et nous ne les emploierons qu’en cas d’urgence.
        </Alerte>
      </Formulaire>
    </CadreInscription>
  );
}
