import type { Metadata } from 'next';
import { CadreInscription } from '@/components/candidat/cadre-inscription';
import { Formulaire } from '@/components/candidat/formulaire';
import { Carte, Champ, Liste } from '@/components/candidat/ui';
import { exigerDossierInscription } from '@/lib/inscription-garde';
import { enregistrerFiliation } from '../actions';

export const metadata: Metadata = { title: 'Votre filiation' };

const PERE = [
  { valeur: 'vivant', libelle: 'Vivant' },
  { valeur: 'decede', libelle: 'Décédé' },
  { valeur: 'inconnu', libelle: 'Non déclaré' },
];

const MERE = [
  { valeur: 'vivante', libelle: 'Vivante' },
  { valeur: 'decedee', libelle: 'Décédée' },
  { valeur: 'inconnue', libelle: 'Non déclarée' },
];

export default async function Filiation() {
  const { dossier } = await exigerDossierInscription();
  const d = dossier as unknown as Record<string, string | null>;

  return (
    <CadreInscription
      dossier={dossier}
      etape="filiation"
      chapo="Vos parents tels qu’ils figurent sur votre acte de naissance, et la personne qui répond de vous si ce n’est aucun des deux."
    >
      <Formulaire action={enregistrerFiliation}>
        <Carte titre="Vos parents">
          <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,12rem)]">
            <Champ nom="pereNom" etiquette="Nom et prénoms du père" valeur={d.pereNom} requis />
            <Liste
              nom="pereSituation"
              etiquette="Situation"
              valeur={d.pereSituation}
              options={PERE}
              vide="À choisir"
              requis
            />
            <Champ nom="mereNom" etiquette="Nom et prénoms de la mère" valeur={d.mereNom} requis />
            <Liste
              nom="mereSituation"
              etiquette="Situation"
              valeur={d.mereSituation}
              options={MERE}
              vide="À choisir"
              requis
            />
          </div>
          <p className="aide mt-4">
            Si un parent n’est pas déclaré sur votre acte, choisissez «&nbsp;Non déclaré&nbsp;» —
            cela n’a aucune conséquence sur votre inscription.
          </p>
        </Carte>

        <Carte
          titre="Votre répondant"
          aide="À renseigner si vous êtes mineur, ou si la personne qui répond de vous n’est ni votre père ni votre mère."
        >
          <div className="grid gap-5 sm:grid-cols-3">
            <Champ
              nom="repondantNom"
              etiquette="Nom et prénoms"
              valeur={d.repondantNom}
              facultatif
            />
            <Champ
              nom="repondantLien"
              etiquette="Lien avec vous"
              valeur={d.repondantLien}
              facultatif
            />
            <Champ
              nom="repondantTelephone"
              etiquette="Son téléphone"
              valeur={d.repondantTelephone}
              type="tel"
              inputMode="tel"
              facultatif
            />
          </div>
        </Carte>
      </Formulaire>
    </CadreInscription>
  );
}
