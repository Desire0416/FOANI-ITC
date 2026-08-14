import Link from 'next/link';
import { IconArrowRight, IconFile } from '@/components/brand/icons';
import { dossierModifiable, manquesDuDossier } from '@/lib/etapes-dossier';
import { CLASSES_PASTILLE, etat as lireEtat } from '@/lib/etats';
import { cn } from '@/lib/utils';
import type { Candidature } from '@/payload-types';

/* ==========================================================================
   La colonne de contexte des étapes
   --------------------------------------------------------------------------
   Ce qui occupait la colonne de gauche — le rail — est devenu un bandeau. La
   place ainsi libérée à droite reçoit ce qui manquait vraiment : le numéro à
   citer, l'état, et surtout la liste de ce qui bloque encore l'envoi.

   Cette liste existait déjà, mais seulement au récapitulatif, c'est-à-dire au
   sixième écran. Celui qui s'arrête au troisième — c'est-à-dire à peu près
   tout le monde — ne la voyait jamais. La montrer à chaque étape ne change
   rien au calcul ; cela change tout à ce que le candidat sait.

   Elle vit hors du `fieldset` désactivé du cadre : ses liens doivent rester
   cliquables précisément dans le cas où le dossier n'est plus modifiable.
   ========================================================================== */

export function Cartouche({ dossier }: { dossier: Candidature | null }) {
  if (!dossier) {
    return (
      <aside className="carte p-5">
        <p className="text-[0.875rem] leading-relaxed text-graphite-600">
          Votre dossier s’ouvrira dès que vous aurez indiqué votre premier vœu. Tout ce que vous
          saisirez ensuite est enregistré au fur et à mesure.
        </p>
      </aside>
    );
  }

  const etat = lireEtat(dossier.etat);
  const ouvert = dossierModifiable(dossier);
  const manques = ouvert ? manquesDuDossier(dossier) : [];

  return (
    <aside className="flex flex-col gap-4">
      <div className="carte p-5">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className={cn('pastille', CLASSES_PASTILLE[etat.ton])}>
            <span className="pastille__point" aria-hidden="true" />
            {etat.libelle}
          </span>
        </div>

        {dossier.reference ? (
          <p className="mt-4 flex items-center gap-2.5 rounded-xl border border-graphite-200 bg-paper-tint px-3.5 py-2.5">
            <IconFile aria-hidden="true" className="h-4 w-4 shrink-0 text-ink-700" />
            <span className="min-w-0 text-[0.75rem] text-graphite-500">
              Votre numéro de dossier
              <span className="mt-0.5 block font-display text-[1.0625rem] text-ink-800 tabular-nums">
                {dossier.reference}
              </span>
            </span>
          </p>
        ) : null}

        <p className="mt-4 text-[0.8125rem] leading-relaxed text-graphite-500">
          Tout est enregistré au fur et à mesure. Vous pouvez vous arrêter et reprendre plus tard,
          même si le réseau coupe.
        </p>
      </div>

      {ouvert ? (
        <div className="carte p-5">
          <h2 className="text-[0.9375rem] leading-snug">
            {manques.length === 0 ? 'Votre dossier est complet' : 'Ce qu’il reste à faire'}
          </h2>

          {manques.length === 0 ? (
            <p className="mt-2 text-[0.8125rem] leading-relaxed text-graphite-500">
              Il ne vous reste qu’à le relire et à l’envoyer.
            </p>
          ) : (
            <ul className="mt-3 flex flex-col gap-2.5">
              {manques.map((ligne) => (
                <li key={ligne.etape.id}>
                  <Link
                    href={ligne.etape.href}
                    className="group flex items-start gap-2.5 text-[0.8125rem] leading-snug text-graphite-600 hover:text-ink-700"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-400"
                    />
                    <span className="min-w-0">
                      <span className="font-semibold text-ink-800">{ligne.etape.libelle}</span>
                      {' — '}
                      {ligne.absents.join(', ')}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <Link
            href="/mon-dossier/recapitulatif"
            className="mt-4 inline-flex items-center gap-1.5 text-[0.8125rem] font-semibold text-ink-700 hover:text-ink-600"
          >
            Relire mon dossier
            <IconArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      ) : null}
    </aside>
  );
}
