import type { Metadata } from 'next';
import Link from 'next/link';
import { IconArrowRight } from '@/components/brand/icons';
import { Carte, Ligne } from '@/components/candidat/ui';
import { EnTetePage } from '@/components/commun/ui';
import { fermerSession } from '@/app/(candidat)/mon-dossier/actions';
import { CONTACT } from '@/content/site';
import { sessionCandidat } from '@/lib/candidat';
import { dossierModifiable } from '@/lib/etapes-dossier';
import { formatDate } from '@/lib/etats';

export const metadata: Metadata = { title: 'Mon compte' };

/* ==========================================================================
   Mon compte
   --------------------------------------------------------------------------
   Peu de choses, et c'est voulu : l'identifiant de connexion, les coordonnées
   auxquelles l'établissement écrira, ce qu'il advient des données, et la
   sortie.

   Les coordonnées ne se modifient pas ici. Elles vivent sur le dossier, à
   l'étape « Vous », et un second endroit où les changer produirait deux
   vérités — celle du compte et celle du dossier — dont personne ne saurait
   laquelle fait foi au moment d'appeler le candidat. Le lien y renvoie donc
   plutôt que de dupliquer le formulaire.

   Le mot de passe ne se change pas non plus : aucun service d'envoi de
   messages n'est branché, donc aucune vérification d'identité n'est possible
   à distance. Offrir le geste sans pouvoir en vérifier l'auteur serait ouvrir
   la porte à qui aurait accès au téléphone. On le dit, et on renvoie au
   service des admissions.
   ========================================================================== */

export default async function MonCompte() {
  const { candidat, dossier } = await sessionCandidat();
  const ouvert = dossier ? dossierModifiable(dossier) : true;

  return (
    <div className="flex flex-col gap-6">
      <EnTetePage
        surtitre="Mon compte"
        titre="Votre accès et vos coordonnées"
        resume="Ce qui vous identifie auprès de l’établissement, et ce qu’il advient de ce que vous avez déposé."
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-4">
          <Carte titre="Votre accès">
            <dl>
              <Ligne intitule="Identifiant de connexion" valeur={candidat.identifiant} />
              {dossier?.reference ? (
                <Ligne intitule="Numéro de dossier" valeur={dossier.reference} />
              ) : null}
              {dossier?.createdAt ? (
                <Ligne intitule="Compte ouvert le" valeur={formatDate(dossier.createdAt)} />
              ) : null}
            </dl>
            <p className="mt-5 border-t border-graphite-100 pt-4 text-[0.875rem] leading-relaxed text-graphite-500">
              Pour changer votre mot de passe, appelez le service des admissions en citant votre
              numéro de dossier&nbsp;: la vérification de votre identité se fait de vive voix, tant
              qu’aucun service d’envoi de messages n’est en place.
            </p>
          </Carte>

          <Carte
            titre="Vos coordonnées"
            aide="Ce sont celles de votre dossier : c’est à ce contact que l’établissement vous écrira."
          >
            <dl>
              <Ligne
                intitule="Nom et prénoms"
                valeur={
                  dossier
                    ? [dossier.nom?.toUpperCase(), dossier.prenoms].filter(Boolean).join(' ')
                    : null
                }
                href={ouvert ? '/mon-dossier/identite' : undefined}
              />
              <Ligne intitule="Téléphone" valeur={dossier?.telephone ?? null} />
              <Ligne intitule="Adresse électronique" valeur={dossier?.courriel ?? null} />
            </dl>
            {ouvert ? null : (
              <p className="mt-5 border-t border-graphite-100 pt-4 text-[0.875rem] leading-relaxed text-graphite-500">
                Votre dossier étant parti, ces informations ne se modifient plus ici. Signalez tout
                changement au service des admissions.
              </p>
            )}
          </Carte>
        </div>

        <div className="flex flex-col gap-4">
          <Carte titre="Vos données">
            <p className="text-[0.9375rem] leading-relaxed text-graphite-600">
              Vos informations et vos documents ne sont lus que par le service des admissions de
              l’établissement, et par les agents dont le travail les concerne. Chaque consultation
              d’une pièce justificative est enregistrée avec le nom de son auteur.
            </p>
            <Link
              href="/confidentialite"
              className="mt-4 inline-flex items-center gap-1.5 text-[0.875rem] font-semibold text-ink-700 hover:text-ink-600"
            >
              Politique de confidentialité
              <IconArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Carte>

          <Carte titre="Besoin d’aide ?">
            <ul className="flex flex-col gap-2.5 text-[0.9375rem]">
              <li>
                <Link href="/admissions" className="text-ink-700 hover:underline">
                  Comment s’inscrire
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-ink-700 hover:underline">
                  Écrire à l’établissement
                </Link>
              </li>
              <li>
                <Link
                  href={`tel:${CONTACT.telephone.valeur}`}
                  className="text-ink-700 hover:underline"
                >
                  {CONTACT.telephone.affichage}
                </Link>
              </li>
            </ul>
          </Carte>

          <Carte titre="Quitter">
            <p className="text-[0.9375rem] leading-relaxed text-graphite-600">
              Fermez votre session si vous êtes sur un téléphone ou un ordinateur partagé. Votre
              dossier reste enregistré&nbsp;: vous le retrouverez tel quel à votre prochaine
              connexion.
            </p>
            <form action={fermerSession} className="mt-4">
              <button type="submit" className="bouton bouton--discret">
                Fermer ma session
              </button>
            </form>
          </Carte>
        </div>
      </div>
    </div>
  );
}
