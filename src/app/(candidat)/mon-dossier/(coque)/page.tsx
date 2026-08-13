import { redirect } from 'next/navigation';
import { sessionCandidat } from '@/lib/candidat';
import { dossierModifiable, etapeAReprendre } from '@/lib/etapes-dossier';

/**
 * Entrée du portail.
 *
 * Cet écran ne s'affiche jamais : il renvoie le candidat là où il s'était
 * arrêté. C'est ce qui rend la reprise indolore — le lien « Mon dossier » mène
 * toujours au bon endroit, qu'on revienne cinq minutes ou trois semaines plus
 * tard (§10.1). Tant qu'aucun dossier n'existe, ce bon endroit est la première
 * étape : le dossier s'ouvre au moment où le premier vœu est choisi.
 */
export default async function EntreePortail() {
  const { dossier } = await sessionCandidat();

  if (!dossier) redirect('/mon-dossier/formation');

  // Dossier parti, ou complément demandé : dans les deux cas la page de suivi
  // est la bonne, car elle explique ce que l'établissement attend.
  if (!dossierModifiable(dossier) || dossier.etat === 'complement') redirect('/mon-dossier/suivi');

  redirect(etapeAReprendre(dossier).href);
}
