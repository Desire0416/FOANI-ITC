import { BandeauEtapes } from '@/components/candidat/bandeau-etapes';
import { ETAPES, etapeFaite, type IdEtape } from '@/lib/etapes-dossier';
import type { Candidature } from '@/payload-types';

/**
 * Le bandeau des six étapes de la candidature.
 *
 * Il ne fait plus que fournir ses données au bandeau commun, que partage
 * désormais le dossier d'inscription. Sa signature n'a pas bougé : un seul
 * fichier l'importe, et il n'avait pas à changer d'appel.
 */
export function Rail({
  dossier,
  courante,
  cadre = false,
}: {
  dossier: Candidature | null;
  courante: IdEtape;
  cadre?: boolean;
}) {
  const faites = dossier
    ? ETAPES.filter((etape) => etapeFaite(etape.id, dossier)).map((etape) => etape.id)
    : [];

  return (
    <BandeauEtapes etapes={ETAPES} courante={courante} faites={faites} cadre={cadre} />
  );
}
