import type { ReactNode } from 'react';
import { Cartouche } from '@/components/candidat/cartouche';
import { Rail } from '@/components/candidat/rail';
import { Alerte, EnTeteEtape } from '@/components/candidat/ui';
import { ETAPES, dossierModifiable, type IdEtape } from '@/lib/etapes-dossier';
import { cn } from '@/lib/utils';
import type { Candidature } from '@/payload-types';

/* ==========================================================================
   Cadre commun aux six étapes
   --------------------------------------------------------------------------
   Le bandeau des étapes en haut, le formulaire à gauche, le contexte à droite.
   C'est l'agencement des écrans de détail du back-office — contenu large,
   contexte étroit — et il n'y a pas de raison qu'un dossier se lise autrement
   selon qu'on est de ce côté-ci ou de l'autre du guichet.

   L'avertissement du dossier figé est traité ici plutôt que dans chaque
   étape : un candidat dont le dossier vient d'être soumis peut revenir sur un
   lien mis en favori, et il doit comprendre pourquoi ses champs ne bougent
   plus (§10.3).
   ========================================================================== */

export function CadreEtape({
  dossier,
  etape,
  chapo,
  sansContexte = false,
  children,
}: {
  dossier: Candidature | null;
  etape: IdEtape;
  chapo?: string;
  /** Le récapitulatif est déjà une relecture : le cartouche y ferait doublon. */
  sansContexte?: boolean;
  children: ReactNode;
}) {
  const courante = ETAPES.find((item) => item.id === etape)!;
  // Sans dossier, on est à la toute première étape : rien n'est encore figé.
  const ouvert = dossier === null || dossierModifiable(dossier);

  return (
    <div className="flex flex-col gap-6">
      <EnTeteEtape numero={courante.numero} titre={courante.libelle} chapo={chapo} />

      {/* Le bandeau reste hors de la grille : il porte sur tout l'écran, pas
          sur la seule colonne du formulaire. */}
      <Rail dossier={dossier} courante={etape} cadre />

      {ouvert ? null : (
        <Alerte ton="attention" titre="Ce dossier n’est plus modifiable">
          Il est entre les mains du service des admissions. Vous pouvez suivre son avancement depuis
          votre espace.
        </Alerte>
      )}

      <div
        className={cn(
          'grid gap-6',
          sansContexte ? undefined : 'xl:grid-cols-[minmax(0,1fr)_minmax(0,20rem)]',
        )}
      >
        {/* Un dossier parti n'est plus saisissable. Le contrôle vit aussi
            dans chaque action serveur — celui-ci évite simplement au candidat
            de remplir un formulaire qui sera refusé. Le `fieldset` désactive
            d'un coup les champs et le bouton d'envoi. */}
        <fieldset disabled={!ouvert} className={cn('min-w-0', ouvert ? undefined : 'opacity-70')}>
          {children}
        </fieldset>

        {/* Hors du `fieldset`, délibérément : ses liens doivent rester
            cliquables exactement dans l'état où le candidat en a le plus
            besoin — dossier parti, formulaire éteint. */}
        {sansContexte ? null : (
          <div className="min-w-0 xl:sticky xl:top-24 xl:self-start">
            <Cartouche dossier={dossier} />
          </div>
        )}
      </div>
    </div>
  );
}
