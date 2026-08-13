import type { Metadata } from 'next';
import { IconShield, IconTeacher, IconUsers } from '@/components/brand/icons';
import { AgentLigne, type Agent } from '@/components/gestion/agent-ligne';
import { Carte, EnTetePage, Tuile } from '@/components/gestion/ui';
import { exigerAgent, socle } from '@/lib/session';
import { LIBELLES_ROLE, PERIMETRES_ROLE, ROLES, type Role } from '@/payload/roles';

export const metadata: Metadata = { title: 'Agents' };

function initiales(nom: string): string {
  return (
    nom
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((mot) => mot[0]?.toUpperCase() ?? '')
      .join('') || 'A'
  );
}

function formatDate(valeur: string | undefined): string {
  if (!valeur) return '—';
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: '2-digit',
    timeZone: 'Africa/Abidjan',
  }).format(new Date(valeur));
}

/**
 * Gestion des agents — CDC §5.2.
 *
 * La liste des agents d'un établissement n'est pas une table de données :
 * c'est une équipe. On y cherche qui fait quoi, qui a encore accès, et on y
 * agit. Le périmètre de chaque rôle est rappelé : le §5.2 pose un principe de
 * moindre privilège, encore faut-il que celui qui attribue sache ce qu'il donne.
 */
export default async function PageAgents() {
  const courant = await exigerAgent();
  const payload = await socle();

  const resultat = await payload
    .find({
      collection: 'utilisateurs',
      limit: 200,
      sort: 'nomComplet',
      depth: 0,
      overrideAccess: true,
    })
    .catch(() => ({ docs: [] as unknown[] }));

  const agents: Agent[] = resultat.docs.map((brut) => {
    const doc = brut as Record<string, string | boolean | undefined>;
    const nom = String(doc.nomComplet || doc.email || 'Agent');
    return {
      id: String(doc.id),
      nom,
      email: String(doc.email ?? '—'),
      fonction: doc.fonction ? String(doc.fonction) : null,
      role: (doc.role as Role) ?? 'consultation',
      actif: doc.actif !== false,
      initiales: initiales(nom),
      creeLe: formatDate(doc.createdAt as string | undefined),
      estSoi: String(doc.id) === courant.id,
    };
  });

  const actifs = agents.filter((agent) => agent.actif).length;
  const administrateurs = agents.filter((agent) => agent.role === 'administrateur').length;
  const peutAgir = courant.role === 'administrateur';

  const parRole = ROLES.map((role) => ({
    role,
    nombre: agents.filter((agent) => agent.role === role).length,
  })).filter((ligne) => ligne.nombre > 0);

  return (
    <div className="flex flex-col gap-6">
      <EnTetePage
        surtitre="Administration"
        titre="Agents de l’établissement"
        resume="Les droits sont attribués par rôle, jamais par personne. Un compte n’est jamais partagé entre plusieurs agents, et n’est jamais supprimé : il est désactivé."
        actions={
          peutAgir ? (
            <span className="bouton bouton--contour cursor-default">
              <IconTeacher className="h-4 w-4" />
              {agents.length} compte{agents.length > 1 ? 's' : ''}
            </span>
          ) : undefined
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Tuile etiquette="Comptes créés" valeur={agents.length} icone={<IconUsers />} ton="encre" />
        <Tuile etiquette="Accès ouverts" valeur={actifs} icone={<IconShield />} ton="clair" />
        <Tuile etiquette="Accès coupés" valeur={agents.length - actifs} icone={<IconShield />} ton="clair" />
        <Tuile etiquette="Administrateurs" valeur={administrateurs} icone={<IconTeacher />} ton="clair" />
      </div>

      {parRole.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {parRole.map((ligne) => (
            <span
              key={ligne.role}
              title={PERIMETRES_ROLE[ligne.role]}
              className="inline-flex items-center gap-2 rounded-full border border-graphite-200 bg-paper px-3.5 py-1.5 text-[0.8125rem] text-graphite-600"
            >
              {LIBELLES_ROLE[ligne.role]}
              <span className="inline-grid h-5 min-w-5 place-items-center rounded-full bg-ink-50 px-1 text-[0.6875rem] font-bold text-ink-700">
                {ligne.nombre}
              </span>
            </span>
          ))}
        </div>
      ) : null}

      <Carte className="p-2 lg:p-2.5">
        <div className="hidden grid-cols-[minmax(0,2.2fr)_minmax(0,1.3fr)_minmax(0,1.1fr)_auto_auto_2.75rem] gap-4 border-b border-graphite-100 px-3 pb-3 pt-2 text-[0.625rem] font-bold uppercase tracking-[0.14em] text-graphite-400 xl:grid">
          <span>Agent</span>
          <span>Fonction</span>
          <span>Rôle</span>
          <span>Accès</span>
          <span className="text-right">Créé</span>
          <span />
        </div>

        <ul>
          {agents.map((agent) => (
            <AgentLigne key={agent.id} agent={agent} peutAgir={peutAgir} />
          ))}
        </ul>
      </Carte>

      {!peutAgir ? (
        <p className="rounded-xl border-l-2 border-gold-400 bg-gold-50 px-4 py-3.5 text-[0.8125rem] leading-relaxed text-gold-800">
          Vous consultez cet annuaire. La création de comptes et l’attribution des rôles relèvent du
          seul administrateur du dispositif.
        </p>
      ) : null}
    </div>
  );
}
