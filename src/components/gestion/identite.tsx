'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { IconArrowUpRight, IconCheck, IconInfo } from '@/components/brand/icons';
import { controlerIdentite } from '@/payload/actions/candidatures';
import { cn } from '@/lib/utils';

/* ==========================================================================
   Le contrôle visuel d'identité — Note complémentaire §5.1 étape 5, §5.4
   --------------------------------------------------------------------------
   Trois images, et deux boutons. Rien de plus, parce qu'il n'y a rien de plus
   à faire : l'agent regarde, et il tranche.

   Ce que l'écran lui donne pour trancher :

   — les trois clichés, ouverts par la route journalisée, jamais en accès
     direct : « qui accède aux pièces d'identité est identifié et journalisé »
     (§4.8) ;
   — ce que le candidat a déclaré, en regard, pour que la comparaison ne
     demande pas de mémoriser un numéro en changeant d'écran. C'est la
     « cohérence croisée » du §5.4, faite par un humain, qui est la seule à
     pouvoir la faire sans traitement biométrique ;
   — les autres dossiers où le même fichier a été déposé, s'il y en a.

   Ce dernier point est le seul contrôle que le papier ne permettait pas. Il
   signale, il ne bloque pas : deux frères produisent légitimement le même
   certificat de résidence. « Tout écart est signalé à l'agent, sans blocage
   automatique. »
   ========================================================================== */

export type ClicheAgent = {
  readonly cle: string;
  readonly titre: string;
  readonly id: string | number | null;
  readonly apercu: string | null;
};

export type Jumeau = {
  readonly dossierId: string | number;
  readonly dossierReference: string | null;
  readonly nom: string | null;
};

export function ControleIdentite({
  id,
  cliches,
  declare,
  jumeaux,
  verdict,
  motifExistant,
  controleLe,
  controlePar,
  autorise,
}: {
  id: string;
  cliches: readonly ClicheAgent[];
  declare: readonly { readonly cle: string; readonly valeur: string | null }[];
  jumeaux: readonly Jumeau[];
  verdict: string;
  motifExistant: string | null;
  controleLe: string | null;
  controlePar: string | null;
  autorise: boolean;
}) {
  const router = useRouter();
  const [motif, setMotif] = useState(motifExistant ?? '');
  const [reprise, setReprise] = useState(false);
  const [retour, setRetour] = useState<{ ok: boolean; message: string } | null>(null);
  const [enCours, demarrer] = useTransition();

  const complet = cliches.every((cliche) => cliche.id);

  function trancher(sens: 'conforme' | 'a-revoir') {
    demarrer(async () => {
      const resultat = await controlerIdentite(id, sens, motif);
      setRetour(resultat);
      if (resultat.ok) {
        setReprise(false);
        router.refresh();
      }
    });
  }

  return (
    <div className="flex flex-col gap-5">
      {retour ? (
        <p
          role="status"
          className={cn(
            'flex gap-3 rounded-xl border p-4 text-[0.875rem] leading-relaxed font-medium',
            retour.ok
              ? 'border-state-success/25 bg-state-success/[0.06] text-state-success'
              : 'border-state-danger/25 bg-state-danger/[0.06] text-state-danger',
          )}
        >
          <IconInfo aria-hidden="true" className="mt-0.5 h-[1.125rem] w-[1.125rem] shrink-0" />
          {retour.message}
        </p>
      ) : null}

      {/* ------------------------------------------------- Doublon d'empreinte */}
      {jumeaux.length > 0 ? (
        <div className="rounded-xl border border-state-warning/30 bg-state-warning/[0.07] p-4">
          <p className="text-[0.875rem] font-semibold text-ink-800">
            Un même fichier figure dans {jumeaux.length === 1 ? 'un autre dossier' : `${jumeaux.length} autres dossiers`}
          </p>
          <ul className="mt-2 flex flex-col gap-1">
            {jumeaux.map((jumeau) => (
              <li key={String(jumeau.dossierId)}>
                <Link
                  href={`/gestion/candidatures/${jumeau.dossierId}`}
                  className="inline-flex items-center gap-1.5 text-[0.875rem] font-semibold text-ink-700 hover:underline"
                >
                  {jumeau.dossierReference ?? `Dossier ${jumeau.dossierId}`}
                  {jumeau.nom ? ` — ${jumeau.nom}` : ''}
                  <IconArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-2.5 text-[0.8125rem] leading-relaxed text-graphite-600">
            Ce n’est pas nécessairement une fraude&nbsp;: deux membres d’une même famille peuvent
            produire le même justificatif. Le dispositif rapproche, c’est vous qui tranchez.
          </p>
        </div>
      ) : null}

      {/* ------------------------------------------------------------ Clichés */}
      <div className="grid gap-4 sm:grid-cols-3">
        {cliches.map((cliche) => (
          <div key={cliche.cle} className="overflow-hidden rounded-xl border border-graphite-200">
            <p className="border-b border-graphite-100 bg-paper-tint px-3 py-2 text-[0.75rem] font-semibold text-ink-800">
              {cliche.titre}
            </p>
            {cliche.id ? (
              <Link
                href={`/gestion/pieces/${cliche.id}/ouvrir`}
                target="_blank"
                rel="noreferrer"
                className="group relative block"
              >
                <div style={{ paddingTop: '70%' }} />
                {cliche.apercu ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={cliche.apercu}
                    alt={cliche.titre}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <span className="absolute inset-0 flex items-center justify-center text-[0.8125rem] text-graphite-400">
                    Ouvrir
                  </span>
                )}
                <span className="absolute inset-0 flex items-center justify-center bg-ink-950/0 text-paper opacity-0 transition-all group-hover:bg-ink-950/45 group-hover:opacity-100">
                  <span className="inline-flex items-center gap-1.5 text-[0.8125rem] font-semibold">
                    Ouvrir en grand
                    <IconArrowUpRight className="h-3.5 w-3.5" />
                  </span>
                </span>
              </Link>
            ) : (
              <div className="flex items-center justify-center bg-paper-tint px-3 py-10 text-center text-[0.8125rem] text-graphite-400">
                Pas encore déposé
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ------------------------------------------------------- Ce qui est dit */}
      <div className="rounded-xl border border-graphite-200 bg-paper-tint p-4">
        <p className="text-[0.75rem] font-bold tracking-[0.12em] text-graphite-500 uppercase">
          Ce que le candidat a déclaré
        </p>
        <dl className="mt-3 grid gap-x-8 gap-y-2 sm:grid-cols-2">
          {declare.map((ligne) => (
            <div key={ligne.cle} className="flex flex-wrap items-baseline justify-between gap-x-4">
              <dt className="text-[0.8125rem] text-graphite-500">{ligne.cle}</dt>
              <dd
                className={cn(
                  'text-[0.875rem]',
                  ligne.valeur ? 'font-medium text-ink-800' : 'text-graphite-400 italic',
                )}
              >
                {ligne.valeur ?? 'Non renseigné'}
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-[0.75rem] leading-relaxed text-graphite-500">
          Comparez ces valeurs à celles portées sur la pièce. Le dispositif ne lit pas la pièce et
          ne compare aucun visage&nbsp;: ce rapprochement vous appartient.
        </p>
      </div>

      {/* ---------------------------------------------------------- La décision */}
      {verdict === 'conforme' ? (
        <p className="flex items-center gap-2.5 rounded-xl border border-state-success/25 bg-state-success/[0.06] px-4 py-3 text-[0.875rem] font-medium text-state-success">
          <IconCheck aria-hidden="true" className="h-4 w-4 shrink-0" />
          Identité vérifiée
          {controlePar ? ` par ${controlePar}` : ''}
          {controleLe ? `, le ${new Date(controleLe).toLocaleDateString('fr-FR')}` : ''}.
        </p>
      ) : null}

      {autorise && verdict !== 'conforme' ? (
        <div className="flex flex-col gap-3">
          {!complet ? (
            <p className="text-[0.875rem] text-graphite-500">
              Les trois clichés ne sont pas tous déposés. Vous pouvez déjà demander une reprise en
              précisant ce qui manque.
            </p>
          ) : null}

          {reprise ? (
            <div className="rounded-xl border border-graphite-200 bg-paper-tint p-4">
              <label
                htmlFor="motif-identite"
                className="mb-1.5 block text-[0.8125rem] font-semibold text-ink-800"
              >
                Ce que le candidat doit refaire
              </label>
              <textarea
                id="motif-identite"
                rows={3}
                value={motif}
                onChange={(evenement) => setMotif(evenement.target.value)}
                placeholder="Le verso est illisible : le numéro n’apparaît pas. Reprenez la photographie de plus près, sans reflet."
                className="w-full rounded-xl border border-graphite-200 bg-paper p-3 text-[0.875rem] text-ink-800 outline-none focus:border-ink-700"
              />
              <p className="aide mt-1.5">
                Ce texte est affiché tel quel dans l’espace du candidat.
              </p>
              <div className="mt-3 flex flex-wrap gap-2.5">
                <button
                  type="button"
                  disabled={enCours || motif.trim().length < 3}
                  onClick={() => trancher('a-revoir')}
                  className="bouton bouton--principal h-10 px-4 text-[0.875rem]"
                >
                  {enCours ? 'Enregistrement…' : 'Demander la reprise'}
                </button>
                <button
                  type="button"
                  onClick={() => setReprise(false)}
                  className="bouton bouton--discret h-10 px-4 text-[0.875rem]"
                >
                  Annuler
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                disabled={enCours || !complet}
                onClick={() => trancher('conforme')}
                className="bouton bouton--or h-10 px-4 text-[0.875rem]"
              >
                <IconCheck className="h-4 w-4" />
                {enCours ? 'Enregistrement…' : 'Identité vérifiée'}
              </button>
              <button
                type="button"
                disabled={enCours}
                onClick={() => setReprise(true)}
                className="bouton bouton--discret h-10 px-4 text-[0.875rem]"
              >
                Demander une reprise
              </button>
            </div>
          )}
        </div>
      ) : null}

      {!autorise ? (
        <p className="text-[0.8125rem] leading-relaxed text-graphite-500">
          Le contrôle d’identité relève du service de la scolarité. C’est le second regard que le
          dispositif impose sur un dossier&nbsp;: qui décide de l’admission ne valide pas
          l’inscription.
        </p>
      ) : null}
    </div>
  );
}
