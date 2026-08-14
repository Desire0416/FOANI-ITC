import type { Metadata } from 'next';
import { CadreInscription } from '@/components/candidat/cadre-inscription';
import { Formulaire } from '@/components/candidat/formulaire';
import { Carte, Champ, Liste } from '@/components/candidat/ui';
import { exigerDossierInscription } from '@/lib/inscription-garde';
import { enregistrerEtatCivil } from '../actions';

export const metadata: Metadata = { title: 'Votre état civil' };

/* Ces listes sont fermées parce qu'elles alimentent des documents officiels :
   une saisie libre y produirait autant de graphies que d'étudiants. */
const SEXES = [
  { valeur: 'feminin', libelle: 'Féminin' },
  { valeur: 'masculin', libelle: 'Masculin' },
];

const ACTES = [
  { valeur: 'extrait', libelle: 'Extrait d’acte de naissance' },
  { valeur: 'copie-integrale', libelle: 'Copie intégrale d’acte de naissance' },
  { valeur: 'jugement-suppletif', libelle: 'Jugement supplétif' },
  { valeur: 'acte-consulaire', libelle: 'Acte transcrit au consulat' },
  { valeur: 'en-cours', libelle: 'En cours de régularisation' },
];

const MATRIMONIALES = [
  { valeur: 'celibataire', libelle: 'Célibataire' },
  { valeur: 'marie', libelle: 'Marié(e)' },
  { valeur: 'divorce', libelle: 'Divorcé(e)' },
  { valeur: 'veuf', libelle: 'Veuf(ve)' },
];

const PIECES = [
  { valeur: 'cni', libelle: 'Carte nationale d’identité' },
  { valeur: 'attestation', libelle: 'Attestation d’identité' },
  { valeur: 'passeport', libelle: 'Passeport' },
  { valeur: 'sejour', libelle: 'Titre de séjour' },
];

export default async function EtatCivil() {
  const { dossier } = await exigerDossierInscription();
  const d = dossier as unknown as Record<string, string | null>;

  return (
    <CadreInscription
      dossier={dossier}
      etape="etat-civil"
      chapo="Recopiez ces informations depuis votre acte de naissance, sans rien corriger. Ce sont elles qui seront imprimées sur vos documents officiels."
    >
      <Formulaire action={enregistrerEtatCivil}>
        <Carte titre="Votre identité" aide="Telle qu’elle figure sur votre acte de naissance.">
          <div className="grid gap-5 sm:grid-cols-2">
            <Liste
              nom="sexe"
              etiquette="Sexe"
              valeur={d.sexe}
              options={SEXES}
              vide="À choisir"
              requis
              aide="Détermine la civilité portée sur vos documents."
            />
            <Champ
              nom="nomActe"
              etiquette="Nom"
              valeur={d.nomActe ?? dossier.nom}
              requis
              aide="Apostrophes, tirets et accents sont acceptés : N’Guessan, Kouadio-Yao, Séka."
            />
            <Champ
              nom="prenomsActe"
              etiquette="Prénoms complets"
              valeur={d.prenomsActe ?? dossier.prenoms}
              requis
              className="sm:col-span-2"
              aide="Tous vos prénoms, dans l’ordre de l’acte. Ils figureront ainsi sur vos documents."
            />
            <Champ
              nom="prenomUsuel"
              etiquette="Prénom usuel"
              valeur={d.prenomUsuel}
              facultatif
              aide="Celui qu’on vous donne au quotidien, s’il diffère."
            />
            <Liste
              nom="situationMatrimoniale"
              etiquette="Situation matrimoniale"
              valeur={d.situationMatrimoniale}
              options={MATRIMONIALES}
              vide="À choisir"
              requis
            />
          </div>
        </Carte>

        <Carte titre="Votre naissance">
          <div className="grid gap-5 sm:grid-cols-2">
            <Champ
              nom="paysNaissance"
              etiquette="Pays de naissance"
              valeur={d.paysNaissance ?? 'Côte d’Ivoire'}
              requis
            />
            <Champ
              nom="lieuNaissanceActe"
              etiquette="Lieu de naissance"
              valeur={d.lieuNaissanceActe ?? dossier.lieuNaissance}
              requis
              aide="Le libellé exact porté sur l’acte, même s’il vous paraît mal orthographié."
            />
          </div>
        </Carte>

        <Carte
          titre="Votre pièce d’état civil"
          aide="Si votre acte n’est pas encore établi, dites-le : votre inscription n’en dépend pas."
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <Liste
              nom="natureActe"
              etiquette="Pièce produite"
              valeur={d.natureActe}
              options={ACTES}
              vide="À choisir"
              requis
              className="sm:col-span-2"
            />
            <Champ
              nom="numeroActe"
              etiquette="Numéro de l’acte ou du jugement"
              valeur={d.numeroActe}
              facultatif
            />
            <Champ
              nom="dateActe"
              etiquette="Établi le"
              type="date"
              valeur={d.dateActe ? d.dateActe.slice(0, 10) : null}
              facultatif
            />
            <Champ
              nom="centreActe"
              etiquette="Centre d’état civil ou tribunal"
              valeur={d.centreActe}
              facultatif
              className="sm:col-span-2"
            />
          </div>
        </Carte>

        <Carte titre="Votre pièce d’identité">
          <div className="grid gap-5 sm:grid-cols-2">
            <Liste
              nom="naturePieceIdentite"
              etiquette="Nature de la pièce"
              valeur={d.naturePieceIdentite}
              options={PIECES}
              vide="À choisir"
              requis
            />
            <Champ
              nom="numeroPieceIdentite"
              etiquette="Numéro de la pièce"
              valeur={d.numeroPieceIdentite}
              requis
            />
            <Champ
              nom="telephoneSecond"
              etiquette="Second numéro de téléphone"
              valeur={d.telephoneSecond}
              type="tel"
              inputMode="tel"
              facultatif
              aide="Dix chiffres. Un second numéro évite qu’on ne puisse plus vous joindre."
            />
            <Champ
              nom="numeroCmu"
              etiquette="Numéro d’enrôlement CMU"
              valeur={d.numeroCmu}
              facultatif
              aide="Votre numéro d’assuré seulement. Aucune information de santé n’est demandée."
            />
          </div>
        </Carte>
      </Formulaire>
    </CadreInscription>
  );
}
