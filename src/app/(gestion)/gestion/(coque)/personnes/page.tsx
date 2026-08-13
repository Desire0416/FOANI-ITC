import type { Metadata } from 'next';
import { IconGraduation, IconSearch, IconShield } from '@/components/brand/icons';
import { Carte, EnTetePage, Pastille, Tuile, Vide } from '@/components/gestion/ui';
import { formatDate } from '@/lib/etats';
import { exigerRole, socle } from '@/lib/session';

export const metadata: Metadata = { title: 'Personnes' };

/**
 * Référentiel des personnes — CDC §11.
 *
 * « La personne est permanente. Créée une seule fois, jamais dupliquée,
 * jamais supprimée. » Le niveau et la filière n'apparaissent pas : ce sont
 * des propriétés de l'inscription annuelle, pas de la personne (§11.2).
 */
export default async function PagePersonnes({
  searchParams,
}: {
  searchParams: Promise<{ readonly q?: string }>;
}) {
  await exigerRole(['administrateur', 'admission', 'scolarite', 'finances', 'consultation']);
  const parametres = await searchParams;
  const recherche = parametres.q?.trim() ?? '';
  const payload = await socle();

  const resultat = await payload
    .find({
      collection: 'personnes',
      where: recherche
        ? ({
            or: [
              { identite: { like: recherche } },
              { numeroEtudiant: { like: recherche } },
              { telephone: { like: recherche } },
            ],
          } as never)
        : undefined,
      limit: 100,
      sort: 'identite',
      depth: 0,
      overrideAccess: true,
    })
    .catch(() => ({ docs: [] as unknown[], totalDocs: 0 }));

  const personnes = resultat.docs.map((brut) => {
    const doc = brut as Record<string, unknown>;
    return {
      id: String(doc.id),
      identite: String(doc.identite ?? '—'),
      numero: typeof doc.numeroEtudiant === 'string' ? doc.numeroEtudiant : null,
      telephone: typeof doc.telephone === 'string' ? doc.telephone : null,
      courriel: typeof doc.courriel === 'string' ? doc.courriel : null,
      naissance: doc.dateNaissance ? formatDate(String(doc.dateNaissance)) : null,
      creeLe: formatDate(doc.createdAt as string | undefined),
    };
  });

  const avecNumero = personnes.filter((personne) => personne.numero).length;

  return (
    <div className="flex flex-col gap-6">
      <EnTetePage
        surtitre="Scolarité"
        titre="Référentiel des personnes"
        resume="Chaque candidat, étudiant ou participant n’y existe qu’une fois, et n’en est jamais retiré : un ancien étudiant peut demander un duplicata plusieurs années après son départ."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Tuile
          etiquette="Personnes enregistrées"
          valeur={personnes.length}
          icone={<IconGraduation />}
          ton="encre"
        />
        <Tuile
          etiquette="Avec numéro étudiant"
          valeur={avecNumero}
          detail="Attribué à la première inscription"
          icone={<IconShield />}
          ton="clair"
        />
        <Tuile
          etiquette="Sans numéro"
          valeur={personnes.length - avecNumero}
          detail="Candidats non encore inscrits"
          icone={<IconShield />}
          ton="clair"
        />
      </div>

      <form action="/gestion/personnes" className="relative max-w-xl" role="search">
        <IconSearch
          aria-hidden="true"
          className="pointer-events-none absolute left-4 top-1/2 h-[1.125rem] w-[1.125rem] -translate-y-1/2 text-graphite-400"
        />
        <label htmlFor="q" className="sr-only">
          Rechercher une personne
        </label>
        <input
          id="q"
          name="q"
          type="search"
          defaultValue={recherche}
          placeholder="Nom, numéro étudiant, téléphone…"
          className="champ rounded-full pl-11"
        />
      </form>

      {personnes.length === 0 ? (
        <Vide
          titre={recherche ? 'Aucune personne ne correspond' : 'Référentiel vide'}
          corps={
            recherche
              ? 'La recherche porte sur le nom, le numéro étudiant et le téléphone. Le numéro fait foi ; le nom n’est qu’une aide à la saisie.'
              : 'Les personnes sont créées à l’admission, ou lors de la reprise des dossiers existants avant la rentrée.'
          }
          action={recherche ? { libelle: 'Effacer la recherche', href: '/gestion/personnes' } : undefined}
        />
      ) : (
        <Carte className="p-2 lg:p-2.5">
          <div className="hidden grid-cols-[7rem_minmax(0,2fr)_minmax(0,1.4fr)_auto_auto] gap-4 border-b border-graphite-100 px-3 pb-3 pt-2 text-[0.625rem] font-bold uppercase tracking-[0.14em] text-graphite-400 lg:grid">
            <span>Numéro</span>
            <span>Identité</span>
            <span>Contact</span>
            <span>Naissance</span>
            <span className="text-right">Enregistrée</span>
          </div>

          <ul>
            {personnes.map((personne) => (
              <li key={personne.id} className="border-b border-graphite-100 last:border-0">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 rounded-xl px-3 py-3.5 transition-colors hover:bg-paper-tint lg:grid-cols-[7rem_minmax(0,2fr)_minmax(0,1.4fr)_auto_auto]">
                  <span className="hidden lg:block">
                    {personne.numero ? (
                      <span className="font-display text-[0.875rem] font-semibold tabular-nums text-ink-700">
                        {personne.numero}
                      </span>
                    ) : (
                      <Pastille ton="neutre">Non attribué</Pastille>
                    )}
                  </span>

                  <span className="flex min-w-0 flex-col">
                    <span className="truncate text-[0.9375rem] font-semibold text-ink-800">
                      {personne.identite}
                    </span>
                    <span className="truncate text-[0.75rem] text-graphite-400 lg:hidden">
                      {personne.numero ?? 'Numéro non attribué'}
                    </span>
                  </span>

                  <span className="hidden min-w-0 flex-col lg:flex">
                    <span className="truncate text-[0.875rem] text-graphite-600">
                      {personne.telephone ?? '—'}
                    </span>
                    <span className="truncate text-[0.75rem] text-graphite-400">
                      {personne.courriel ?? ''}
                    </span>
                  </span>

                  <span className="hidden text-[0.8125rem] text-graphite-500 lg:block">
                    {personne.naissance ?? '—'}
                  </span>

                  <span className="w-24 text-right text-[0.75rem] tabular-nums text-graphite-400">
                    {personne.creeLe}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </Carte>
      )}

      <p className="rounded-xl border-l-2 border-gold-400 bg-gold-50 px-4 py-3.5 text-[0.8125rem] leading-relaxed text-gold-800">
        Le numéro étudiant est l’identifiant, jamais le nom. Il n’encode ni la filière ni le niveau,
        et il ne change pas : ni au redoublement, ni au changement de filière, ni au passage du BTS à
        la Licence.
      </p>
    </div>
  );
}
