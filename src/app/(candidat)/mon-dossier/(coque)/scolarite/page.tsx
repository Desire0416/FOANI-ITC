import type { Metadata } from 'next';
import { enregistrerScolarite } from '@/app/(candidat)/mon-dossier/actions';
import { CadreEtape } from '@/components/candidat/cadre-etape';
import { Formulaire } from '@/components/candidat/formulaire';
import { Alerte, Carte, Champ } from '@/components/candidat/ui';
import { getFormation } from '@/content/formations';
import { exigerDossier } from '@/lib/candidat';
import { exigeBaccalaureat } from '@/lib/etapes-dossier';

export const metadata: Metadata = { title: 'Votre parcours' };

const SITUATIONS = [
  { valeur: 'reprise', libelle: 'Je reprends mes études après une interruption' },
  { valeur: 'salarie', libelle: 'Je travaille en même temps' },
  { valeur: 'hebergement', libelle: 'J’aurai besoin d’un hébergement' },
];

export default async function EtapeScolarite() {
  const { dossier } = await exigerDossier();

  const bacRequis = exigeBaccalaureat(dossier);
  const formation = getFormation(dossier.voeu1);
  const dejaCochees = new Set(dossier.situation ?? []);

  return (
    <CadreEtape
      dossier={dossier}
      etape="scolarite"
      chapo={
        bacRequis
          ? 'Votre baccalauréat conditionne l’accès à cette formation. Renseignez-le tel qu’il figure sur votre relevé.'
          : 'Cette formation ne demande aucun diplôme. Ces informations nous aident seulement à composer les groupes.'
      }
    >
      <Formulaire
        action={enregistrerScolarite}
        retour={{ href: '/mon-dossier/identite', libelle: 'Étape précédente' }}
      >
        <Carte
          titre="Votre baccalauréat"
          aide={
            bacRequis
              ? undefined
              : 'Laissez vide si vous n’avez pas le baccalauréat : ce n’est pas une condition pour cette formation.'
          }
        >
          <div className="grid gap-5 sm:grid-cols-3">
            <Champ
              nom="serieBac"
              etiquette="Série"
              valeur={dossier.serieBac}
              requis={bacRequis}
              facultatif={!bacRequis}
              placeholder="D, C, A2…"
            />
            <Champ
              nom="anneeBac"
              etiquette="Année d’obtention"
              inputMode="numeric"
              valeur={dossier.anneeBac}
              requis={bacRequis}
              facultatif={!bacRequis}
              placeholder="2026"
            />
            <Champ
              nom="mentionBac"
              etiquette="Mention"
              valeur={dossier.mentionBac}
              facultatif
              placeholder="Passable, Assez bien…"
            />
          </div>

          <div className="mt-5">
            <Champ
              nom="etablissementOrigine"
              etiquette="Dernier établissement fréquenté"
              valeur={dossier.etablissementOrigine}
              facultatif
              placeholder="Nom du lycée, du collège ou de l’école"
            />
          </div>
        </Carte>

        <Carte
          titre="Votre situation"
          aide="Cochez ce qui vous concerne. Rien de ce que vous cochez ne joue contre votre candidature."
        >
          <fieldset className="flex flex-col gap-3">
            <legend className="sr-only">Situation particulière</legend>
            {SITUATIONS.map((situation) => (
              <label
                key={situation.valeur}
                className="flex cursor-pointer items-center gap-3 rounded-xl border border-graphite-200 bg-paper px-4 py-3 transition-colors hover:border-ink-300"
              >
                <input
                  type="checkbox"
                  name="situation"
                  value={situation.valeur}
                  defaultChecked={dejaCochees.has(situation.valeur as never)}
                  className="h-4.5 w-4.5 shrink-0 accent-[var(--color-ink-700)]"
                />
                <span className="text-[0.9375rem] text-ink-800">{situation.libelle}</span>
              </label>
            ))}
          </fieldset>
        </Carte>

        {bacRequis && formation ? (
          <Alerte>
            Les conditions d’admission détaillées par série de baccalauréat sont en cours de validation
            par la direction des études. Renseignez ce que vous avez : le service des admissions
            reviendra vers vous si un élément manque.
          </Alerte>
        ) : null}
      </Formulaire>
    </CadreEtape>
  );
}
