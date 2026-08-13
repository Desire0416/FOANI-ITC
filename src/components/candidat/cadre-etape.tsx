import type { ReactNode } from 'react';
import { Rail } from '@/components/candidat/rail';
import { EnTeteEtape } from '@/components/candidat/ui';
import { ETAPES, dossierModifiable, type IdEtape } from '@/lib/etapes-dossier';
import { Alerte } from '@/components/candidat/ui';
import { cn } from '@/lib/utils';
import type { Candidature } from '@/payload-types';

/* ==========================================================================
   Cadre commun aux six étapes
   --------------------------------------------------------------------------
   Le rail à gauche, l'étape à droite, et un avertissement lorsque le dossier
   n'est plus modifiable. Ce dernier cas mérite d'être traité ici plutôt que
   dans chaque étape : un candidat dont le dossier vient d'être soumis peut
   revenir sur un lien mis en favori, et il doit comprendre pourquoi ses
   champs ne bougent plus (§10.3).
   ========================================================================== */

export function CadreEtape({
  dossier,
  etape,
  chapo,
  children,
}: {
  dossier: Candidature | null;
  etape: IdEtape;
  chapo?: string;
  children: ReactNode;
}) {
  const courante = ETAPES.find((item) => item.id === etape)!;
  // Sans dossier, on est à la toute première étape : rien n'est encore figé.
  const ouvert = dossier === null || dossierModifiable(dossier);

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-7 sm:px-8 sm:py-10">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] lg:gap-12">
        {/* `min-w-0` n'est pas un détail : une cellule de grille prend par
            défaut la largeur de son contenu. Sans cela, le rail — qui mesure
            près d'un mètre d'écran une fois ses six étapes mises bout à bout —
            élargissait la page entière au lieu de défiler dans son cadre, et
            tout le portail se lisait de travers sur un téléphone. */}
        <div className="min-w-0 lg:sticky lg:top-8 lg:self-start">
          <Rail dossier={dossier} courante={etape} />
        </div>

        <div className="min-w-0">
          <EnTeteEtape numero={courante.numero} titre={courante.libelle} chapo={chapo} />

          {ouvert ? null : (
            <Alerte ton="attention" titre="Ce dossier n’est plus modifiable" className="mt-6">
              Il est entre les mains du service des admissions. Vous pouvez suivre son avancement
              depuis la page de suivi.
            </Alerte>
          )}

          {/* Un dossier parti n'est plus saisissable. Le contrôle vit aussi
              dans chaque action serveur — celui-ci évite simplement au
              candidat de remplir un formulaire qui sera refusé. Le `fieldset`
              désactive d'un coup les champs et le bouton d'envoi. */}
          <fieldset
            disabled={!ouvert}
            className={cn('mt-7 min-w-0', ouvert ? undefined : 'opacity-70')}
          >
            {children}
          </fieldset>
        </div>
      </div>
    </div>
  );
}
