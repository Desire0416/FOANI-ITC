import type { Metadata } from 'next';
import { CadreInscription } from '@/components/candidat/cadre-inscription';
import { Formulaire } from '@/components/candidat/formulaire';
import { Carte, Champ, Liste } from '@/components/candidat/ui';
import { exigerDossierInscription } from '@/lib/inscription-garde';
import { enregistrerResidence } from '../actions';

export const metadata: Metadata = { title: 'Où vous vivrez' };

const HEBERGEMENTS = [
  { valeur: 'cite', libelle: 'Cité universitaire' },
  { valeur: 'famille', libelle: 'Domicile familial' },
  { valeur: 'location', libelle: 'Logement loué à titre personnel' },
  { valeur: 'heberge', libelle: 'Hébergé par un parent ou un tuteur' },
  { valeur: 'internat', libelle: 'Internat de l’établissement' },
  { valeur: 'sans', libelle: 'Sans hébergement stable' },
];

const OUI_NON = [
  { valeur: 'oui', libelle: 'Oui' },
  { valeur: 'non', libelle: 'Non' },
];

export default async function Residence() {
  const { dossier } = await exigerDossierInscription();
  const d = dossier as unknown as Record<string, string | null>;

  return (
    <CadreInscription
      dossier={dossier}
      etape="residence"
      chapo="Où vous logerez pendant l’année, et où joindre votre famille. L’adressage postal étant peu opérant, c’est le quartier qui compte."
    >
      <Formulaire action={enregistrerResidence}>
        <Carte titre="Votre logement pendant l’année">
          <div className="grid gap-5 sm:grid-cols-3">
            <Champ
              nom="residenceVille"
              etiquette="Ville ou commune"
              valeur={d.residenceVille}
              requis
            />
            <Champ
              nom="residenceQuartier"
              etiquette="Quartier"
              valeur={d.residenceQuartier}
              requis
            />
            <Champ
              nom="residenceRepere"
              etiquette="Repère"
              valeur={d.residenceRepere}
              facultatif
              aide="Un carrefour, une école, un commerce connu."
            />
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <Liste
              nom="hebergement"
              etiquette="Mode d’hébergement"
              valeur={d.hebergement}
              options={HEBERGEMENTS}
              vide="À choisir"
              requis
            />
            <Liste
              nom="demandeLogement"
              etiquette="Demandez-vous un logement universitaire ?"
              valeur={d.demandeLogement}
              options={OUI_NON}
              vide="À choisir"
              requis
              aide="Si oui, nous produirons d’office les pièces que le dossier de logement réclame de nous."
            />
          </div>
        </Carte>

        <Carte
          titre="La résidence de vos parents"
          aide="Elle sert à vous joindre par un autre canal que le vôtre, et figure sur les dossiers de bourse."
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <Champ nom="parentsVille" etiquette="Ville ou commune" valeur={d.parentsVille} requis />
            <Champ
              nom="parentsPays"
              etiquette="Pays"
              valeur={d.parentsPays ?? 'Côte d’Ivoire'}
              facultatif
            />
          </div>
        </Carte>
      </Formulaire>
    </CadreInscription>
  );
}
