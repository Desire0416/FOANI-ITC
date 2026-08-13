import { BarreHaute } from '@/components/gestion/barre-haute';
import { BarreLaterale } from '@/components/gestion/barre-laterale';
import { LIBELLES_ROLE } from '@/payload/roles';
import { exigerAgent, socle } from '@/lib/session';
import { fermerSession } from '../(acces)/connexion/actions';

/**
 * Coque du back-office.
 *
 * La session est vérifiée ici, avant tout rendu : aucune page de gestion
 * n'existe pour un visiteur non authentifié, et le contenu ne part jamais
 * sur le réseau avant la vérification.
 */
export default async function CoqueLayout({ children }: { children: React.ReactNode }) {
  const agent = await exigerAgent();

  const payload = await socle();
  const aInstruire = await payload
    .count({
      collection: 'candidatures',
      where: { etat: { in: ['soumis', 'instruction'] } },
      overrideAccess: true,
    })
    .then((resultat) => resultat.totalDocs)
    .catch(() => 0);

  return (
    <div className="min-h-dvh bg-paper-tint">
      <BarreLaterale role={agent.role} deconnexion={fermerSession} />

      <div className="lg:pl-laterale">
        <BarreHaute
          aInstruire={aInstruire}
          initiales={agent.initiales}
          nomComplet={agent.nomComplet}
          fonction={LIBELLES_ROLE[agent.role]}
        />
        <main className="px-5 py-7 lg:px-8 lg:py-9">{children}</main>
      </div>
    </div>
  );
}
