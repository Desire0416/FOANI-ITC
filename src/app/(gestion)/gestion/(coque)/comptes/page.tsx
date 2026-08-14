import type { Metadata } from 'next';
import Link from 'next/link';
import { IconMail, IconPhone, IconUsers } from '@/components/brand/icons';
import { Carte, EnTetePage, Pastille, Tuile, Vide } from '@/components/gestion/ui';
import { formatDate } from '@/lib/etats';
import { exigerRole, socle } from '@/lib/session';
import { ROLES_COMPTES } from '@/payload/roles';

export const metadata: Metadata = { title: 'Comptes candidats' };

/**
 * Comptes candidats — CDC §10.1.
 *
 * « Création de compte par adresse électronique ou numéro de téléphone, avec
 * vérification. » Le compte est distinct de la personne : la personne est
 * permanente et peut exister sans compte (§11.2). L'écran le montre en
 * indiquant, pour chaque compte, s'il est rattaché au référentiel.
 */
export default async function PageComptes() {
  await exigerRole(ROLES_COMPTES);
  const payload = await socle();

  const resultat = await payload
    .find({ collection: 'candidats', limit: 200, sort: '-createdAt', depth: 1, overrideAccess: true })
    .catch(() => ({ docs: [] as unknown[], totalDocs: 0 }));

  const comptes = resultat.docs.map((brut) => {
    const doc = brut as Record<string, unknown>;
    const personne = doc.personne as Record<string, string> | string | null;
    const rattache = personne !== null && typeof personne === 'object';
    return {
      id: String(doc.id),
      identifiant: String(doc.username ?? doc.email ?? '—'),
      email: typeof doc.email === 'string' ? doc.email : null,
      telephone: typeof doc.telephone === 'string' ? doc.telephone : null,
      verifie: doc.verifie === true,
      rattache,
      nomPersonne: rattache ? (personne.identite ?? null) : null,
      creeLe: formatDate(doc.createdAt as string | undefined),
    };
  });

  const verifies = comptes.filter((compte) => compte.verifie).length;
  const rattaches = comptes.filter((compte) => compte.rattache).length;

  return (
    <div className="flex flex-col gap-6">
      <EnTetePage
        surtitre="Admission"
        titre="Comptes candidats"
        resume="Créés par les candidats eux-mêmes depuis le portail. Un compte ne donne accès qu’à son propre dossier ; il est distinct de la personne au référentiel."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Tuile etiquette="Comptes créés" valeur={comptes.length} icone={<IconUsers />} ton="encre" />
        <Tuile
          etiquette="Contacts vérifiés"
          valeur={verifies}
          detail="Téléphone ou adresse confirmés"
          icone={<IconPhone />}
          ton="clair"
        />
        <Tuile
          etiquette="Rattachés au référentiel"
          valeur={rattaches}
          detail="Reliés à une personne"
          icone={<IconMail />}
          ton="clair"
        />
      </div>

      {comptes.length === 0 ? (
        <Vide
          titre="Aucun compte candidat"
          corps="Les comptes se créent depuis le portail public, par numéro de téléphone ou par adresse électronique. Ils apparaîtront ici dès la première inscription."
        />
      ) : (
        <Carte className="p-2 lg:p-2.5">
          <div className="hidden grid-cols-[minmax(0,2fr)_minmax(0,1.6fr)_auto_auto] gap-4 border-b border-graphite-100 px-3 pb-3 pt-2 text-[0.625rem] font-bold uppercase tracking-[0.14em] text-graphite-400 lg:grid">
            <span>Identifiant</span>
            <span>Personne rattachée</span>
            <span>Contact</span>
            <span className="text-right">Créé</span>
          </div>

          <ul>
            {comptes.map((compte) => (
              <li key={compte.id} className="border-b border-graphite-100 last:border-0">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 rounded-xl px-3 py-3.5 transition-colors hover:bg-paper-tint lg:grid-cols-[minmax(0,2fr)_minmax(0,1.6fr)_auto_auto]">
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-ink-600 to-ink-900 text-paper">
                      <IconUsers className="h-[1.125rem] w-[1.125rem]" />
                    </span>
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate text-[0.9375rem] font-semibold text-ink-800">
                        {compte.identifiant}
                      </span>
                      <span className="truncate text-[0.75rem] text-graphite-400">
                        {compte.email ?? compte.telephone ?? 'Contact non renseigné'}
                      </span>
                    </span>
                  </span>

                  <span className="hidden text-[0.875rem] lg:block">
                    {compte.rattache ? (
                      <Link
                        href="/gestion/personnes"
                        className="text-ink-700 transition-colors hover:text-ink-600"
                      >
                        {compte.nomPersonne ?? 'Personne rattachée'}
                      </Link>
                    ) : (
                      <span className="text-graphite-300">Non rattaché</span>
                    )}
                  </span>

                  <Pastille ton={compte.verifie ? 'vert' : 'neutre'} point>
                    {compte.verifie ? 'Vérifié' : 'Non vérifié'}
                  </Pastille>

                  <span className="hidden w-24 text-right text-[0.75rem] tabular-nums text-graphite-400 lg:block">
                    {compte.creeLe}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </Carte>
      )}

      <p className="rounded-xl border-l-2 border-gold-400 bg-gold-50 px-4 py-3.5 text-[0.8125rem] leading-relaxed text-gold-800">
        Un compte n’est jamais fusionné automatiquement. Si une personne est déjà connue de
        l’établissement — ancien étudiant, participant à une formation courte —, elle est rattachée à
        son numéro existant plutôt que dupliquée (§10.5).
      </p>
    </div>
  );
}
