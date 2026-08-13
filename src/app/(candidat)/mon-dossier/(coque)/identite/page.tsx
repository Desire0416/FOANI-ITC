import type { Metadata } from 'next';
import { enregistrerIdentite } from '@/app/(candidat)/mon-dossier/actions';
import { CadreEtape } from '@/components/candidat/cadre-etape';
import { Formulaire } from '@/components/candidat/formulaire';
import { Carte, Champ } from '@/components/candidat/ui';
import { exigerDossier } from '@/lib/candidat';

export const metadata: Metadata = { title: 'Vos informations' };

/** `2026-08-13` à partir d'une date ISO, pour un champ de type `date`. */
function jour(valeur: string | null | undefined): string | null {
  if (!valeur) return null;
  return new Date(valeur).toISOString().slice(0, 10);
}

export default async function EtapeIdentite() {
  const { dossier } = await exigerDossier();

  return (
    <CadreEtape
      dossier={dossier}
      etape="identite"
      chapo="Écrivez vos nom et prénoms exactement comme ils figurent sur votre pièce d’identité. Un écart bloquerait votre dossier plus tard."
    >
      <Formulaire
        action={enregistrerIdentite}
        retour={{ href: '/mon-dossier/formation', libelle: 'Étape précédente' }}
      >
        <Carte titre="Votre état civil">
          <div className="grid gap-5 sm:grid-cols-2">
            <Champ nom="nom" etiquette="Nom" valeur={dossier.nom} requis autoComplete="family-name" />
            <Champ
              nom="prenoms"
              etiquette="Prénoms"
              valeur={dossier.prenoms}
              requis
              autoComplete="given-name"
            />
            <Champ
              nom="dateNaissance"
              etiquette="Date de naissance"
              type="date"
              valeur={jour(dossier.dateNaissance)}
              max={new Date().toISOString().slice(0, 10)}
            />
            <Champ nom="lieuNaissance" etiquette="Lieu de naissance" valeur={dossier.lieuNaissance} />
            <Champ
              nom="nationalite"
              etiquette="Nationalité"
              valeur={dossier.nationalite ?? 'Ivoirienne'}
              className="sm:col-span-2"
            />
          </div>
        </Carte>

        <Carte titre="Où vous joindre" aide="C’est sur ces contacts que nous vous répondrons.">
          <div className="grid gap-5 sm:grid-cols-2">
            <Champ
              nom="telephone"
              etiquette="Téléphone"
              type="tel"
              inputMode="tel"
              valeur={dossier.telephone}
              requis
              autoComplete="tel"
              placeholder="07 00 00 00 00"
            />
            <Champ
              nom="courriel"
              etiquette="Adresse électronique"
              type="email"
              inputMode="email"
              valeur={dossier.courriel}
              facultatif
              autoComplete="email"
            />
          </div>
        </Carte>

        <Carte
          titre="Personne à prévenir"
          aide="Quelqu’un que nous pouvons joindre si nous n’arrivons pas à vous contacter."
        >
          <div className="grid gap-5 sm:grid-cols-3">
            <Champ nom="contactNom" etiquette="Nom et prénoms" valeur={dossier.contactNom} facultatif />
            <Champ
              nom="contactLien"
              etiquette="Lien avec vous"
              valeur={dossier.contactLien}
              facultatif
              placeholder="Père, mère, tuteur…"
            />
            <Champ
              nom="contactTelephone"
              etiquette="Son téléphone"
              type="tel"
              inputMode="tel"
              valeur={dossier.contactTelephone}
              facultatif
            />
          </div>
        </Carte>
      </Formulaire>
    </CadreEtape>
  );
}
