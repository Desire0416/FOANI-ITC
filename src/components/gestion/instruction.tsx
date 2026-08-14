'use client';

import { useState, useTransition } from 'react';
import { IconCheck, IconClose, IconFile, IconInfo, IconShield } from '@/components/brand/icons';
import { Pastille } from '@/components/gestion/ui';
import {
  changerEtat,
  deciderPiece,
  enregistrerDecision,
  rapprocherTransaction,
  type EtatInstruction,
  type Retour,
} from '@/payload/actions/candidatures';
import {
  LIBELLES_SERVICE,
  etape as lireEtape,
  transitionsDuService,
  type Service,
} from '@/payload/chaine';
import { DECISIONS } from '@/lib/etats';
import { cn } from '@/lib/utils';

/* ==========================================================================
   Commandes d'instruction — CDC §10.3
   --------------------------------------------------------------------------
   Trois gestes, dans l'ordre où ils se font : statuer sur les pièces, faire
   avancer l'état, décider. Chaque commande affiche son retour sur place ; on
   ne quitte jamais le dossier pour savoir si l'action a pris.
   ========================================================================== */

export type PieceAffichee = {
  readonly index: number;
  readonly nom: string;
  readonly nature: string;
  readonly url: string | null;
  readonly etatPiece: 'attente' | 'acceptee' | 'rejetee';
  readonly motif: string | null;
};

/**
 * Pourquoi ce panneau ne propose rien.
 *
 * Masquer les boutons ne suffit pas : un agent devant un panneau muet croit a
 * une panne — ou, pire, ne comprend pas que son role a des limites. Le §5.2
 * distingue neuf perimetres ; encore faut-il que celui qui en porte un sache
 * ou s'arrete le sien, et a qui s'adresser.
 */
function Reserve({ acte, service }: { acte: string; service: string }) {
  return (
    <p className="flex items-start gap-2.5 rounded-xl border border-graphite-200 bg-paper-tint px-3.5 py-3 text-[0.8125rem] leading-relaxed text-graphite-600">
      <IconShield aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-graphite-400" />
      <span>
        {acte} revient au <strong className="font-semibold text-ink-800">{service}</strong>. Votre
        rôle donne la lecture, pas la décision.
      </span>
    </p>
  );
}

function useCommande() {
  const [retour, setRetour] = useState<Retour | null>(null);
  const [enCours, demarrer] = useTransition();
  const executer = (action: () => Promise<Retour>) =>
    demarrer(async () => setRetour(await action()));
  return { retour, setRetour, enCours, executer };
}

function Message({ retour, effacer }: { retour: Retour | null; effacer: () => void }) {
  if (!retour) return null;
  return (
    <p
      role="status"
      className={cn(
        'mt-4 flex items-start gap-3 rounded-xl px-4 py-3 text-[0.8125rem] leading-relaxed',
        retour.ok ? 'bg-[#e8f4ee] text-[#0f5c3c]' : 'bg-gold-50 text-gold-800',
      )}
    >
      {retour.message}
      <button type="button" onClick={effacer} aria-label="Masquer" className="ml-auto shrink-0 opacity-70">
        <IconClose className="h-3.5 w-3.5" />
      </button>
    </p>
  );
}

/* -------------------------------------------------------------------------- */

export function PiecesDuDossier({
  id,
  pieces,
  modifiable,
}: {
  id: string;
  pieces: readonly PieceAffichee[];
  modifiable: boolean;
}) {
  const { retour, setRetour, enCours, executer } = useCommande();
  const [motifs, setMotifs] = useState<Record<number, string>>({});
  const [ouvert, setOuvert] = useState<number | null>(null);

  if (pieces.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-graphite-200 bg-paper-tint px-4 py-6 text-center text-[0.875rem] text-graphite-500">
        Aucune pièce déposée pour l’instant.
      </p>
    );
  }

  return (
    <>
      {!modifiable ? (
        <div className="mb-4">
          <Reserve acte="Statuer sur une pièce" service="service des admissions" />
        </div>
      ) : null}

      <ul className="flex flex-col gap-3">
        {pieces.map((piece) => (
          <li key={piece.index} className="rounded-xl border border-graphite-100 bg-paper-tint p-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ink-800 text-gold-400">
                <IconFile className="h-[1.125rem] w-[1.125rem]" />
              </span>

              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-[0.9375rem] font-semibold text-ink-800">{piece.nom}</span>
                <span className="text-[0.75rem] text-graphite-500">{piece.nature}</span>
              </span>

              <Pastille
                ton={
                  piece.etatPiece === 'acceptee' ? 'vert' : piece.etatPiece === 'rejetee' ? 'rouge' : 'neutre'
                }
                point
              >
                {piece.etatPiece === 'acceptee'
                  ? 'Acceptée'
                  : piece.etatPiece === 'rejetee'
                    ? 'Rejetée'
                    : 'À examiner'}
              </Pastille>

              {piece.url ? (
                <a
                  href={piece.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="bouton bouton--contour h-9 px-3.5 text-[0.8125rem]"
                >
                  Ouvrir
                </a>
              ) : null}
            </div>

            {piece.motif ? (
              <p className="mt-3 rounded-lg bg-paper px-3 py-2 text-[0.8125rem] text-graphite-600">
                <span className="font-semibold text-ink-800">Motif du rejet&nbsp;:</span> {piece.motif}
              </p>
            ) : null}

            {modifiable ? (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={enCours || piece.etatPiece === 'acceptee'}
                  onClick={() => executer(() => deciderPiece(id, piece.index, 'acceptee', ''))}
                  className="bouton h-9 bg-[#e8f4ee] px-3.5 text-[0.8125rem] text-[#0f7a4d] hover:bg-[#d9ede2] disabled:opacity-45"
                >
                  <IconCheck className="h-3.5 w-3.5" />
                  Accepter
                </button>

                <button
                  type="button"
                  disabled={enCours}
                  onClick={() => setOuvert(ouvert === piece.index ? null : piece.index)}
                  className="bouton h-9 bg-[#fbeaec] px-3.5 text-[0.8125rem] text-state-danger hover:bg-[#f6dade]"
                >
                  <IconClose className="h-3.5 w-3.5" />
                  Rejeter
                </button>
              </div>
            ) : null}

            {ouvert === piece.index && modifiable ? (
              <div className="mt-3 rounded-xl border border-graphite-200 bg-paper p-3">
                <label htmlFor={`motif-${piece.index}`} className="etiquette">
                  Motif du rejet
                </label>
                <p className="mb-2 text-[0.8125rem] text-graphite-500">
                  Il est transmis au candidat avec la demande de complément. Soyez précis : il doit
                  savoir quoi refaire.
                </p>
                <textarea
                  id={`motif-${piece.index}`}
                  rows={2}
                  value={motifs[piece.index] ?? ''}
                  onChange={(evenement) =>
                    setMotifs((etatPrecedent) => ({ ...etatPrecedent, [piece.index]: evenement.target.value }))
                  }
                  placeholder="Ex. Le relevé de notes est illisible : reprenez la photo en plein jour."
                  className="champ"
                />
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    disabled={enCours}
                    onClick={() => {
                      executer(() => deciderPiece(id, piece.index, 'rejetee', motifs[piece.index] ?? ''));
                      setOuvert(null);
                    }}
                    className="bouton bouton--principal h-9 px-4 text-[0.8125rem]"
                  >
                    Enregistrer le rejet
                  </button>
                  <button
                    type="button"
                    onClick={() => setOuvert(null)}
                    className="bouton bouton--discret h-9 px-4 text-[0.8125rem]"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            ) : null}
          </li>
        ))}
      </ul>

      <Message retour={retour} effacer={() => setRetour(null)} />
    </>
  );
}

/* -------------------------------------------------------------------------- */

export function AvancementDossier({
  id,
  etatCourant,
  service,
}: {
  id: string;
  etatCourant: string;
  /** Le service que tient l'agent. Il décide des gestes proposés. */
  service: Service | null;
}) {
  const { retour, setRetour, enCours, executer } = useCommande();
  const [motifs, setMotifs] = useState<Record<string, string>>({});
  const [ouvert, setOuvert] = useState<string | null>(null);

  const gestes = transitionsDuService(etatCourant, service);
  const etapeCourante = lireEtape(etatCourant);

  /* Un dossier qui n'attend pas ce service ne lui propose rien — mais on dit
     à qui il appartient, plutôt que de laisser un panneau muet. */
  if (gestes.length === 0) {
    const detenteur = etapeCourante?.proprietaire;
    if (!detenteur || detenteur === service) {
      return (
        <p className="rounded-xl border border-dashed border-graphite-200 bg-paper-tint px-4 py-5 text-[0.875rem] leading-relaxed text-graphite-500">
          {etapeCourante?.terminal
            ? 'Ce dossier a atteint un état terminal : il ne bouge plus.'
            : 'Aucun geste n’est attendu de votre poste à ce stade.'}
        </p>
      );
    }
    return (
      <Reserve
        acte="Faire avancer ce dossier"
        service={detenteur === 'candidat' ? 'candidat lui-même' : `service ${LIBELLES_SERVICE[detenteur]}`}
      />
    );
  }

  return (
    <>
      {/* Ce que le dossier attend, avant les boutons : sans cela, l'agent
          choisit un geste sans savoir où il en est. */}
      {etapeCourante?.attendu ? (
        <p className="mb-4 rounded-xl border border-ink-100 bg-ink-50 px-3.5 py-3 text-[0.8125rem] leading-relaxed text-ink-800">
          {etapeCourante.attendu}
        </p>
      ) : null}

      <ul className="flex flex-col gap-2">
        {gestes.map((geste) => (
          <li key={geste.vers}>
            <button
              type="button"
              disabled={enCours}
              onClick={() => {
                if (geste.recule) {
                  setOuvert(ouvert === geste.vers ? null : geste.vers);
                  return;
                }
                executer(() => changerEtat(id, geste.vers as EtatInstruction, motifs[geste.vers] ?? ''));
              }}
              className="w-full rounded-xl border border-graphite-200 bg-paper px-4 py-3 text-left transition-colors hover:border-ink-300 hover:bg-ink-50 disabled:opacity-55"
            >
              <span className="flex items-center gap-2 text-[0.875rem] font-semibold text-ink-800">
                {geste.libelle}
                {geste.recule ? (
                  <span className="pastille bg-gold-50 text-gold-700">motif requis</span>
                ) : null}
                {geste.assiste ? (
                  <span className="pastille bg-graphite-100 text-graphite-600">mode assisté</span>
                ) : null}
              </span>
              <span className="mt-1 block text-[0.8125rem] leading-snug text-graphite-500">
                {geste.aide}
              </span>
            </button>

            {ouvert === geste.vers ? (
              <div className="mt-2 rounded-xl border border-graphite-200 bg-paper p-3">
                <label htmlFor={`motif-etat-${geste.vers}`} className="etiquette">
                  Motif du retour
                </label>
                <p className="mb-2 text-[0.8125rem] leading-snug text-graphite-500">
                  Il demeure visible dans l’historique du dossier. Soyez précis : c’est lui qui
                  rendra la décision compréhensible dans six mois.
                </p>
                <textarea
                  id={`motif-etat-${geste.vers}`}
                  rows={2}
                  value={motifs[geste.vers] ?? ''}
                  onChange={(evenement) =>
                    setMotifs((avant) => ({ ...avant, [geste.vers]: evenement.target.value }))
                  }
                  className="champ"
                />
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    disabled={enCours}
                    onClick={() => {
                      executer(() =>
                        changerEtat(id, geste.vers as EtatInstruction, motifs[geste.vers] ?? ''),
                      );
                      setOuvert(null);
                    }}
                    className="bouton bouton--principal h-9 px-4 text-[0.8125rem]"
                  >
                    Enregistrer
                  </button>
                  <button
                    type="button"
                    onClick={() => setOuvert(null)}
                    className="bouton bouton--discret h-9 px-3 text-[0.8125rem]"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            ) : null}
          </li>
        ))}
      </ul>

      <Message retour={retour} effacer={() => setRetour(null)} />
    </>
  );
}

/* -------------------------------------------------------------------------- */

export function DecisionDossier({
  id,
  sensCourant,
  modifiable,
}: {
  id: string;
  sensCourant: string | null;
  modifiable: boolean;
}) {
  const { retour, setRetour, enCours, executer } = useCommande();
  const [choisi, setChoisi] = useState<string | null>(sensCourant);
  const [conditions, setConditions] = useState('');

  if (!modifiable) {
    return <Reserve acte="Prononcer une admission" service="service des admissions" />;
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {DECISIONS.map((decision) => (
          <button
            key={decision.cle}
            type="button"
            onClick={() => setChoisi(decision.cle)}
            className={cn(
              'rounded-full border px-4 py-2 text-[0.8125rem] font-semibold transition-colors',
              choisi === decision.cle
                ? 'border-ink-800 bg-ink-800 text-paper'
                : 'border-graphite-200 bg-paper text-graphite-600 hover:border-ink-300 hover:text-ink-700',
            )}
          >
            {decision.libelle}
          </button>
        ))}
      </div>

      {choisi === 'admis-condition' ? (
        <div className="mt-4">
          <label htmlFor="conditions" className="etiquette">
            Conditions à lever
          </label>
          <textarea
            id="conditions"
            rows={3}
            value={conditions}
            onChange={(evenement) => setConditions(evenement.target.value)}
            placeholder="Ex. Fournir le relevé de notes définitif avant le 30 septembre."
            className="champ"
          />
          <p className="aide">Elles sont affichées au candidat avec la notification de décision.</p>
        </div>
      ) : null}

      <button
        type="button"
        disabled={enCours || !choisi}
        onClick={() =>
          choisi
            ? executer(() =>
                enregistrerDecision(
                  id,
                  choisi as 'admis' | 'admis-condition' | 'attente' | 'refuse',
                  conditions,
                ),
              )
            : undefined
        }
        className="bouton bouton--principal mt-4 w-full"
      >
        {enCours ? 'Enregistrement…' : 'Enregistrer la décision'}
      </button>

      <p className="mt-3 flex items-start gap-2 text-[0.75rem] leading-relaxed text-graphite-500">
        <IconInfo aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        L’auteur et la date sont enregistrés automatiquement, et la décision reste au journal du
        dossier.
      </p>

      <Message retour={retour} effacer={() => setRetour(null)} />
    </>
  );
}

/* -------------------------------------------------------------------------- */

export function FraisDeDossier({
  id,
  reference,
  mode,
  verifiee,
  modifiable,
}: {
  id: string;
  reference: string | null;
  mode: string | null;
  verifiee: boolean;
  modifiable: boolean;
}) {
  const { retour, setRetour, enCours, executer } = useCommande();

  return (
    <>
      <dl className="flex flex-col divide-y divide-graphite-100">
        <div className="flex items-baseline justify-between gap-4 py-2.5">
          <dt className="text-[0.8125rem] text-graphite-500">Référence</dt>
          <dd className="font-display text-[0.9375rem] tabular-nums text-ink-800">
            {reference || 'Non saisie'}
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-4 py-2.5">
          <dt className="text-[0.8125rem] text-graphite-500">Moyen</dt>
          <dd className="text-[0.875rem] text-ink-800">{mode || '—'}</dd>
        </div>
        <div className="flex items-center justify-between gap-4 py-2.5">
          <dt className="text-[0.8125rem] text-graphite-500">Rapprochement</dt>
          <dd>
            <Pastille ton={verifiee ? 'vert' : 'neutre'} point>
              {verifiee ? 'Rapprochée du relevé' : 'Non rapprochée'}
            </Pastille>
          </dd>
        </div>
      </dl>

      {!modifiable && reference ? (
        <div className="mt-4">
          <Reserve acte="Rapprocher un versement du relevé" service="service des finances" />
        </div>
      ) : null}

      {modifiable && reference ? (
        <button
          type="button"
          disabled={enCours}
          onClick={() => executer(() => rapprocherTransaction(id, !verifiee))}
          className={cn('bouton mt-4 w-full', verifiee ? 'bouton--contour' : 'bouton--principal')}
        >
          {verifiee ? 'Annuler le rapprochement' : 'Confirmer le rapprochement'}
        </button>
      ) : null}

      <p className="mt-3 text-[0.75rem] leading-relaxed text-graphite-500">
        Le dispositif n’encaisse aucun fonds : il enregistre une référence que vous rapprochez de
        votre relevé. La validation reste humaine.
      </p>

      <Message retour={retour} effacer={() => setRetour(null)} />
    </>
  );
}
