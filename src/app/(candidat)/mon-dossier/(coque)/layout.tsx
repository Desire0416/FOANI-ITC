import { BarreBasse, BarreHaute, BarreLaterale } from '@/components/candidat/navigation';
import { rubriquesDe } from '@/lib/espace-candidat';
import { etat as lireEtat } from '@/lib/etats';
import { sessionCandidat } from '@/lib/candidat';
import { fermerSession } from '../actions';

/**
 * Coque des écrans authentifiés.
 *
 * Même squelette que celui du back-office — barre latérale fixe, contenu
 * décalé de sa largeur, barre haute collante — parce qu'il n'y a aucune raison
 * que les deux espaces d'un même dispositif s'agencent différemment. Ce qui
 * change tient à l'appareil : le candidat est sur un téléphone, d'où la barre
 * d'onglets en bas plutôt qu'un tiroir (voir `navigation.tsx`).
 *
 * La session est vérifiée ici, et de nouveau dans chaque page : une garde de
 * mise en page protège l'affichage, pas les données. Ce sont les pages et les
 * actions qui relisent le dossier et en vérifient la propriété.
 *
 * Le dossier n'est pas passé aux barres : elles sont clientes, et lui pousser
 * ses pièces et son journal à chaque navigation coûterait cher pour afficher
 * un numéro. Elles ne reçoivent que ce qu'elles montrent.
 */
export default async function CoqueDossier({ children }: { children: React.ReactNode }) {
  const { dossier } = await sessionCandidat();

  const rubriques = rubriquesDe(dossier);
  const etat = dossier ? lireEtat(dossier.etat) : null;

  return (
    <div className="min-h-dvh bg-paper-tint">
      <BarreLaterale rubriques={rubriques} deconnexion={fermerSession} />

      <div className="lg:pl-laterale">
        <BarreHaute
          rubriques={rubriques}
          reference={dossier?.reference ?? null}
          etatLibelle={etat?.libelle ?? null}
          etatTon={etat?.ton ?? 'neutre'}
        />

        {/* `pb-24` réserve la hauteur de la barre d'onglets : sans lui, le
            dernier bouton de chaque page serait recouvert par la navigation. */}
        <main className="px-5 py-7 pb-24 lg:px-8 lg:py-9 lg:pb-9">{children}</main>

        <BarreBasse rubriques={rubriques} />
      </div>
    </div>
  );
}
