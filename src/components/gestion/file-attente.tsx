import Link from 'next/link';
import { IconArrowRight, IconCheck, IconClock, IconInfo } from '@/components/brand/icons';
import { etape as lireEtape, joursDepuis } from '@/payload/chaine';
import type { Poste } from '@/payload/postes';
import { CLASSES_PASTILLE, etat as lireEtat, formatDate } from '@/lib/etats';
import { cn } from '@/lib/utils';

/* ==========================================================================
   La file d'attente d'un poste — Note complémentaire §4.1
   --------------------------------------------------------------------------
   « Un agent n'a pas à savoir où chercher ni à se souvenir de ce qui reste en
   suspens : le dispositif le lui présente. »

   L'écran d'accueil ne montre donc pas l'activité de l'établissement, mais
   celle du poste : les dossiers dont il est propriétaire, les plus immobiles
   en tête. Un dossier qui n'attend pas ce poste n'y figure pas, même si
   l'agent a le droit de le lire.

   Les dossiers en alerte (RG-44) ouvrent la liste : ce sont eux qui coûtent à
   l'établissement — un versement non rapproché retient une place, une
   inscription non validée retarde une rentrée.
   ========================================================================== */

export type LigneFile = {
  readonly id: string;
  readonly reference: string | null;
  readonly nom: string;
  readonly formation: string | null;
  readonly etat: string;
  readonly depuis: string | null;
  readonly enAlerte: boolean;
};

export function FileAttente({
  poste,
  lignes,
  total,
}: {
  poste: Poste;
  lignes: readonly LigneFile[];
  total: number;
}) {
  const alertes = lignes.filter((ligne) => ligne.enAlerte).length;

  return (
    <section className="carte overflow-hidden">
      <header className="flex flex-wrap items-center gap-x-5 gap-y-3 border-b border-graphite-100 bg-paper-tint px-5 py-4">
        <span className="min-w-0 flex-1">
          <h2 className="text-[1.0625rem] leading-tight">Ce qui attend votre poste</h2>
          <p className="mt-0.5 text-[0.8125rem] text-graphite-500">
            {total === 0
              ? 'Rien à traiter pour le moment.'
              : `${total} dossier${total > 1 ? 's' : ''} vous ${total > 1 ? 'sont adressés' : 'est adressé'}.`}
          </p>
        </span>

        {alertes > 0 ? (
          <span className="pastille bg-[#fbeaec] text-state-danger">
            <IconClock className="h-3.5 w-3.5" />
            {alertes} sans mouvement
          </span>
        ) : null}
      </header>

      {lignes.length === 0 ? (
        /* Une file vide n'est pas un écran vide : c'est une information, et
           c'est même la meilleure que le poste puisse recevoir. */
        <div className="flex flex-col items-center px-6 py-12 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e8f4ee] text-[#0f7a4d]">
            <IconCheck className="h-6 w-6" />
          </span>
          <p className="mt-4 font-display text-[1.25rem] text-ink-800">Votre file est vide</p>
          <p className="mx-auto mt-2 max-w-md text-[0.9375rem] leading-relaxed text-graphite-500">
            Aucun dossier n’attend une action du poste {poste.libelle}. Ce que vous voyez ailleurs
            dans le dispositif appartient, pour l’instant, à un autre service.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-graphite-100">
          {lignes.map((ligne) => {
            const etat = lireEtat(ligne.etat);
            const etapeChaine = lireEtape(ligne.etat);
            const jours = joursDepuis(ligne.depuis);

            return (
              <li key={ligne.id}>
                <Link
                  href={`/gestion/candidatures/${ligne.id}`}
                  className={cn(
                    'flex flex-wrap items-center gap-x-5 gap-y-3 px-5 py-4 transition-colors hover:bg-paper-tint',
                    ligne.enAlerte && 'bg-state-danger/[0.03]',
                  )}
                >
                  <span
                    className={cn(
                      'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-display text-[0.8125rem]',
                      ligne.enAlerte ? 'bg-state-danger text-paper' : 'bg-ink-800 text-gold-400',
                    )}
                  >
                    {ligne.reference ? ligne.reference.slice(-3) : '—'}
                  </span>

                  <span className="min-w-0 flex-1 basis-56">
                    <span className="block truncate text-[0.9375rem] font-semibold text-ink-800">
                      {ligne.nom}
                    </span>
                    <span className="mt-0.5 block truncate text-[0.8125rem] text-graphite-500">
                      {[ligne.reference, ligne.formation].filter(Boolean).join(' · ')}
                    </span>
                  </span>

                  {/* Ce que le poste doit faire de ce dossier — la file ne
                      dirait rien sans cela. */}
                  <span className="min-w-0 basis-64 text-[0.8125rem] leading-snug text-graphite-600">
                    {etapeChaine?.attendu}
                  </span>

                  <span className={cn('pastille shrink-0', CLASSES_PASTILLE[etat.ton])}>
                    {etat.libelle}
                  </span>

                  <span
                    className={cn(
                      'w-32 shrink-0 text-right text-[0.75rem] tabular-nums',
                      ligne.enAlerte ? 'font-semibold text-state-danger' : 'text-graphite-500',
                    )}
                  >
                    {jours === null
                      ? '—'
                      : jours === 0
                        ? 'aujourd’hui'
                        : `depuis ${jours} jour${jours > 1 ? 's' : ''}`}
                  </span>

                  <IconArrowRight className="h-4 w-4 shrink-0 text-graphite-400" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      {total > lignes.length ? (
        <footer className="border-t border-graphite-100 px-5 py-3.5">
          <Link
            href="/gestion/candidatures"
            className="text-[0.8125rem] font-semibold text-ink-700 hover:text-ink-600"
          >
            Voir les {total} dossiers de votre file
          </Link>
        </footer>
      ) : null}
    </section>
  );
}

/* -------------------------------------------------------------------------- */

/**
 * Ce que le poste ne traite pas.
 *
 * La note énonce pour chaque poste ce à quoi il n'accède pas. L'afficher évite
 * la question qui revient sans cesse — « pourquoi je ne vois pas les
 * versements ? » — et rend l'organisation lisible depuis l'écran plutôt que
 * depuis un document.
 */
export function CadreDuPoste({ poste }: { poste: Poste }) {
  return (
    <section className="carte p-5 sm:p-6">
      <h2 className="text-[1.0625rem] leading-tight">Poste {poste.libelle}</h2>
      <p className="mt-1 text-[0.875rem] leading-relaxed text-graphite-600">{poste.metier}</p>

      <div className="mt-6 grid gap-x-8 gap-y-6 lg:grid-cols-3">
        <div>
          <p className="text-[0.6875rem] font-bold tracking-[0.14em] text-ink-700 uppercase">
            Vous faites
          </p>
          <ul className="mt-3 flex flex-col gap-2">
            {poste.actions.map((ligne) => (
              <li key={ligne} className="flex items-start gap-2.5">
                <IconCheck aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-[#0f7a4d]" />
                <span className="text-[0.8125rem] leading-snug text-graphite-700">{ligne}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-[0.6875rem] font-bold tracking-[0.14em] text-graphite-500 uppercase">
            Vous consultez
          </p>
          <ul className="mt-3 flex flex-col gap-2">
            {poste.consultation.map((ligne) => (
              <li key={ligne} className="flex items-start gap-2.5">
                <IconInfo aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-graphite-400" />
                <span className="text-[0.8125rem] leading-snug text-graphite-600">{ligne}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-[0.6875rem] font-bold tracking-[0.14em] text-graphite-500 uppercase">
            Vous n’accédez pas
          </p>
          <ul className="mt-3 flex flex-col gap-2">
            {poste.interdit.map((ligne) => (
              <li key={ligne} className="flex items-start gap-2.5">
                <span
                  aria-hidden="true"
                  className="mt-2 h-1 w-3 shrink-0 rounded-full bg-graphite-300"
                />
                <span className="text-[0.8125rem] leading-snug text-graphite-500">{ligne}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="mt-6 border-t border-graphite-100 pt-4 text-[0.75rem] leading-relaxed text-graphite-500">
        Un dossier appartient à un seul service à la fois. Il quitte votre file dès que l’action
        attendue est accomplie, et passe au service suivant.
      </p>
    </section>
  );
}

/** Date lisible, pour le pied des lignes. */
export { formatDate };
