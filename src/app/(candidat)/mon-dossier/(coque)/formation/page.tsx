import type { Metadata } from 'next';
import { enregistrerVoeux } from '@/app/(candidat)/mon-dossier/actions';
import { CadreEtape } from '@/components/candidat/cadre-etape';
import { Formulaire } from '@/components/candidat/formulaire';
import { Alerte, Carte, Liste } from '@/components/candidat/ui';
import { CYCLE_LABELS, FORMATIONS, dureeLisible, titreComplet } from '@/content/formations';
import { sessionCandidat } from '@/lib/candidat';

export const metadata: Metadata = { title: 'Votre formation' };

/* Les formations sont proposées par cycle : un bachelier cherche « Licence »
   avant de chercher un intitulé, et une liste de trente lignes à plat est
   illisible sur un téléphone. */
const OPTIONS = FORMATIONS.map((formation) => {
  const duree = dureeLisible(formation);
  return {
    valeur: formation.slug,
    libelle: `${CYCLE_LABELS[formation.cycle]} — ${titreComplet(formation)}${duree ? ` (${duree})` : ''}`,
  };
});

export default async function EtapeFormation() {
  const { dossier } = await sessionCandidat();

  return (
    <CadreEtape
      dossier={dossier}
      etape="formation"
      chapo="Indiquez la formation que vous visez. Vous pouvez ajouter un second choix : il ne sera examiné que si le premier n’aboutit pas."
    >
      <Formulaire action={enregistrerVoeux} retour={{ href: '/formations', libelle: 'Revoir le catalogue' }}>
        <Carte>
          <div className="flex flex-col gap-5">
            <Liste
              nom="voeu1"
              etiquette="Premier choix"
              valeur={dossier?.voeu1}
              options={OPTIONS}
              vide="Choisissez une formation"
              requis
              aide="C’est ce choix qui est examiné en premier."
            />

            <Liste
              nom="voeu2"
              etiquette="Second choix"
              valeur={dossier?.voeu2}
              options={OPTIONS}
              vide="Aucun second choix"
              facultatif
              aide="Examiné uniquement si le premier n’aboutit pas."
            />

            <Liste
              nom="anneeEntree"
              etiquette="Entrée souhaitée"
              valeur={dossier?.anneeEntree ?? '2026-2027'}
              options={[{ valeur: '2026-2027', libelle: 'Rentrée du 5 octobre 2026' }]}
            />
          </div>
        </Carte>

        <Alerte>
          Vous hésitez encore&nbsp;? Enregistrez un choix maintenant : vous pourrez le changer tant que
          vous n’avez pas envoyé votre dossier.
        </Alerte>
      </Formulaire>
    </CadreEtape>
  );
}
