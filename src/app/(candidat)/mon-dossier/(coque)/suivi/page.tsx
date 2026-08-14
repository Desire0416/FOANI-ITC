import { redirect } from 'next/navigation';

/**
 * Ancienne adresse du suivi.
 *
 * Le suivi n'est plus une page à part : il est devenu l'accueil de l'espace,
 * parce qu'un candidat qui revient veut d'abord savoir où il en est. Cette
 * adresse a été communiquée, mise en favori, peut-être écrite quelque part —
 * elle continue donc de mener au bon endroit, en conservant l'indicateur
 * d'envoi qui déclenche le message de confirmation.
 */
export default async function AncienSuivi({
  searchParams,
}: {
  searchParams: Promise<{ envoye?: string }>;
}) {
  const { envoye } = await searchParams;
  redirect(envoye ? `/mon-dossier?envoye=${encodeURIComponent(envoye)}` : '/mon-dossier');
}
