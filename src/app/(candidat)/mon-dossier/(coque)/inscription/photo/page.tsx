import type { Metadata } from 'next';
import { CadreInscription } from '@/components/candidat/cadre-inscription';
import { PhotoIdentite } from '@/components/candidat/photo-identite';
import { Carte } from '@/components/candidat/ui';
import { exigerDossierInscription } from '@/lib/inscription-garde';

export const metadata: Metadata = { title: 'Votre photographie' };

export default async function Photo() {
  const { dossier } = await exigerDossierInscription();

  /* La pièce est relue en profondeur par la session : on n'a besoin que de
     l'adresse de la variante lisible, pas du fichier d'origine. */
  const photo = (dossier as unknown as { photo?: { url?: string | null } | number | null }).photo;
  const adresse = typeof photo === 'object' && photo ? (photo.url ?? null) : null;

  return (
    <CadreInscription
      dossier={dossier}
      etape="photo"
      chapo="Le portrait qui figurera sur votre carte d’étudiant. Une seule prise, faite ici, remplace les quatre tirages papier qu’il fallait apporter."
    >
      <div className="flex flex-col gap-6">
        <Carte titre="Votre photographie d’identité">
          <PhotoIdentite deja={adresse} />
        </Carte>

        <Carte titre="Ce que nous vérifions, et ce que nous ne vérifions pas">
          <p className="text-[0.9375rem] leading-relaxed text-graphite-600">
            Le contrôle automatique porte sur l’image&nbsp;: sa définition, sa netteté, son
            exposition, l’uniformité du fond et son cadrage. Il est fait dans votre téléphone, avant
            l’envoi, pour ne pas vous faire monter une image qui serait refusée ensuite.
          </p>
          <p className="mt-3 text-[0.9375rem] leading-relaxed text-graphite-600">
            Il ne porte pas sur votre visage. Aucune reconnaissance faciale n’est employée, ni ici
            ni ailleurs dans ce dispositif&nbsp;: c’est un agent de la scolarité qui contrôlera que
            la photographie vous ressemble, à l’étape suivante.
          </p>
        </Carte>
      </div>
    </CadreInscription>
  );
}
