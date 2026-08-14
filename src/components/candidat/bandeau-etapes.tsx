import Link from 'next/link';
import { IconCheck } from '@/components/brand/icons';
import { cn } from '@/lib/utils';

/* ==========================================================================
   Le bandeau des étapes
   --------------------------------------------------------------------------
   Un sommaire, pas une navigation : il dit où l'on en est dans un dossier, et
   la barre latérale dit où l'on en est dans l'espace. Deux rôles distincts,
   deux géométries distinctes.

   Il sert la candidature et le dossier d'inscription, qui ont chacun leur
   suite d'étapes. D'où une liste passée en paramètre plutôt qu'importée : le
   jour où une troisième suite apparaît — la réinscription, §5.6 —, elle
   n'aura rien à réécrire.

   Aucune étape n'est verrouillée. On ne force pas l'ordre à quelqu'un qui
   n'a pas sa pièce sous la main au moment où il commence.
   ========================================================================== */

export type PasBandeau = {
  readonly id: string;
  readonly numero: number;
  readonly libelle: string;
  readonly href: string;
};

export function BandeauEtapes({
  etapes,
  courante,
  faites,
  cadre = true,
}: {
  etapes: readonly PasBandeau[];
  courante: string;
  /** Les identifiants des étapes accomplies. */
  faites: readonly string[];
  /** Encadré par défaut ; sans cadre lorsqu'il est déjà dans une carte. */
  cadre?: boolean;
}) {
  return (
    <nav
      aria-label="Étapes du dossier"
      className={cn('rail overflow-x-auto', cadre ? 'carte p-2' : '-mx-1 px-1 pb-1')}
    >
      <ol className="flex min-w-max gap-1.5 lg:min-w-0">
        {etapes.map((etape) => {
          const active = etape.id === courante;
          const faite = faites.includes(etape.id);

          return (
            <li key={etape.id} className="lg:flex-1">
              <Link
                href={etape.href}
                aria-current={active ? 'step' : undefined}
                className={cn(
                  'flex items-center gap-2.5 rounded-xl px-3 py-2.5 transition-colors duration-200 lg:w-full',
                  active
                    ? 'bg-ink-700 text-paper'
                    : 'text-graphite-600 hover:bg-ink-50 hover:text-ink-700',
                )}
              >
                {/* La pastille est un repère visuel : lue à voix haute, son
                    chiffre se collerait au libellé — « 5Frais de dossier ». Le
                    rang est donc dit proprement juste après. */}
                <span
                  aria-hidden="true"
                  className={cn(
                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-display text-[0.75rem]',
                    active
                      ? 'bg-gold-400 text-ink-900'
                      : faite
                        ? 'bg-state-success text-paper'
                        : 'bg-graphite-200 text-graphite-600',
                  )}
                >
                  {faite && !active ? <IconCheck className="h-3.5 w-3.5" /> : etape.numero}
                </span>

                <span className="text-[0.8125rem] font-semibold whitespace-nowrap lg:whitespace-normal">
                  <span className="sr-only">
                    Étape {etape.numero}
                    {faite ? ', faite' : ''}&nbsp;:{' '}
                  </span>
                  {etape.libelle}
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
