import Link from 'next/link';
import { IconArrowRight, IconCheck, IconClock, IconFile } from '@/components/brand/icons';
import { Alerte, Carte, Ligne } from '@/components/candidat/ui';
import { EnTetePage, Tuile, Vide } from '@/components/commun/ui';
import { Rail } from '@/components/candidat/rail';
import { AccepterOffre, AnnoncerVersement } from '@/components/candidat/offre';
import { referenceReglement } from '@/app/(candidat)/mon-dossier/offre';
import { CYCLE_LABELS, getFormation, titreComplet } from '@/content/formations';
import { getPayload } from 'payload';
import config from '@payload-config';
import { sessionCandidat } from '@/lib/candidat';
import { phaseDuDossier } from '@/lib/espace-candidat';
import { dossierModifiable, etapeAReprendre, manquesDuDossier } from '@/lib/etapes-dossier';
import { formatDate, journalEnClair, sensCandidat, etat as lireEtat } from '@/lib/etats';
import { CHAINE, joursRestants } from '@/payload/chaine';

/* ==========================================================================
   L'accueil de l'espace personnel — CDC §10.4
   --------------------------------------------------------------------------
   Cette page était une redirection : elle renvoyait le candidat au champ de
   saisie où il s'était arrêté. C'était juste tant que l'espace n'était qu'un
   formulaire en six écrans. Ce ne l'est plus depuis qu'il porte une admission,
   des documents et des règlements — et un candidat qui revient après trois
   semaines veut d'abord savoir où il en est, pas être jeté dans un champ.

   Elle obéit à la même règle que l'accueil de l'agent : ce n'est pas un menu,
   c'est ce qui vous attend. D'où l'ordre — l'état, puis le geste du moment,
   puis la progression, puis seulement le détail.

   « Chaque changement d'état donne lieu à une notification. » Tant qu'aucun
   service d'envoi n'est branché, la notification n'existe pas : cette page est
   le seul endroit où le candidat l'apprend, et elle le dit franchement plutôt
   que de laisser croire qu'un message est parti.
   ========================================================================== */

function nommer(slug: string | null | undefined): string | null {
  if (!slug) return null;
  const formation = getFormation(slug);
  if (!formation) return null;
  return `${CYCLE_LABELS[formation.cycle]} — ${titreComplet(formation)}`;
}

export default async function MonEspace({
  searchParams,
}: {
  searchParams: Promise<{ envoye?: string }>;
}) {
  const { dossier } = await sessionCandidat();
  const { envoye } = await searchParams;

  /* Compte tout neuf : rien à suivre, une seule chose à faire. */
  if (!dossier) {
    return (
      <div className="flex flex-col gap-6">
        <EnTetePage
          surtitre="Candidature — rentrée 2026"
          titre="Bienvenue."
          resume="Votre compte est ouvert. Il ne reste qu’à choisir la formation que vous visez : votre dossier s’ouvrira à ce moment-là."
        />
        <Vide
          titre="Vous n’avez pas encore de dossier"
          corps="Il s’ouvre dès que vous avez indiqué votre premier vœu. Tout ce que vous saisirez ensuite sera enregistré au fur et à mesure : vous pourrez vous arrêter et reprendre plus tard."
          action={{ libelle: 'Commencer ma candidature', href: '/mon-dossier/formation' }}
        />
      </div>
    );
  }

  const etat = lireEtat(dossier.etat);
  const sens = sensCandidat(dossier.etat);
  const phase = phaseDuDossier(dossier);
  const ouvert = dossierModifiable(dossier);
  const journal = [...(dossier.journal ?? [])].reverse();
  const rejetees = (dossier.pieces ?? []).filter((ligne) => ligne.etatPiece === 'rejetee');
  const manques = ouvert ? manquesDuDossier(dossier) : [];
  const reglement = await referenceReglement(dossier.reference);
  const maillon = CHAINE.find((item) => item.cle === dossier.etat);

  const payload = await getPayload({ config });
  const documents = await payload
    .count({
      collection: 'documents',
      where: { candidature: { equals: dossier.id } },
      overrideAccess: true,
    })
    .then((resultat) => resultat.totalDocs)
    .catch(() => 0);

  /* Les étapes 4 à 8 du chapitre 5 n'ont pas encore d'écran. Dans ces états,
     quelque chose est bien attendu du candidat — mais pas ici, et pas encore.
     Le lui dire vaut mieux que lui montrer un cadre vide, qui donne à croire
     que la page n'a pas fini de charger. */
  const enAttenteDOuverture = ['place-reservee', 'inscrit', 'acces-ouverts'].includes(dossier.etat);

  return (
    <div className="flex flex-col gap-6">
      {envoye ? (
        <Alerte ton="reussite" titre="Votre dossier est parti">
          Notez votre numéro de dossier&nbsp;: c’est lui qu’il faudra citer si vous nous appelez.
        </Alerte>
      ) : null}

      <EnTetePage
        surtitre={etat.libelle}
        titre={sens.titre}
        resume={sens.corps}
        actions={
          ouvert ? (
            <Link href={etapeAReprendre(dossier).href} className="bouton bouton--principal">
              {rejetees.length > 0 ? 'Redéposer mes documents' : 'Reprendre mon dossier'}
              <IconArrowRight className="h-4 w-4" />
            </Link>
          ) : null
        }
      />

      {/* ---------------------------------------------- Ce qui vous attend */}
      <BlocAction titre={sens.aVous ? 'Ce qu’il vous reste à faire' : 'Où en est votre dossier'}>
        {rejetees.length > 0 ? (
          <div className="mb-5">
            <h3 className="text-[0.9375rem] font-semibold text-ink-800">
              Les documents à refaire
            </h3>
            <ul className="mt-3 flex flex-col gap-3">
              {rejetees.map((ligne, rang) => (
                <li
                  key={ligne.id ?? rang}
                  className="rounded-xl border border-state-danger/25 bg-state-danger/[0.04] p-4"
                >
                  <p className="text-[0.9375rem] font-semibold text-ink-800">
                    {typeof ligne.fichier === 'object' ? ligne.fichier.filename : 'Document'}
                  </p>
                  {ligne.motif ? (
                    <p className="mt-1 text-[0.875rem] leading-snug text-state-danger">
                      {ligne.motif}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {dossier.decisionSens === 'admis-condition' && dossier.decisionConditions ? (
          <div className="mb-5 rounded-xl border border-gold-200 bg-gold-50 p-4">
            <p className="text-[0.9375rem] font-semibold text-gold-800">Conditions à remplir</p>
            <p className="mt-1 text-[0.875rem] leading-relaxed whitespace-pre-line text-gold-800">
              {dossier.decisionConditions}
            </p>
          </div>
        ) : null}

        {/* Étape 2 du parcours d'inscription : accepter, ou décliner. */}
        {dossier.etat === 'admis' || dossier.etat === 'admis-condition' ? (
          <AccepterOffre joursRestants={joursRestants(dossier.limiteAcceptation)} />
        ) : null}

        {/* Étape 3 : annoncer le versement qui réserve la place. */}
        {dossier.etat === 'offre-acceptee' ? <AnnoncerVersement reference={reglement} /> : null}

        {/* Dossier encore ouvert : ce qui manque, nommément. C'était jusqu'ici
            réservé au récapitulatif, à la toute fin du parcours — donc invisible
            à celui qui s'arrête au milieu, c'est-à-dire tout le monde. */}
        {ouvert && manques.length > 0 ? (
          <>
            <p className="text-[0.9375rem] text-graphite-600">
              Il reste {manques.length === 1 ? 'une étape' : `${manques.length} étapes`} à compléter
              avant de pouvoir envoyer votre dossier&nbsp;:
            </p>
            <ul className="mt-3 flex flex-col gap-2.5">
              {manques.map((ligne) => (
                <li key={ligne.etape.id}>
                  <Link
                    href={ligne.etape.href}
                    className="flex items-start gap-2.5 text-[0.875rem] leading-snug text-graphite-600 hover:text-ink-700"
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
          </>
        ) : null}

        {ouvert && manques.length === 0 ? (
          <p className="text-[0.9375rem] text-graphite-600">
            Votre dossier est complet. Il ne reste qu’à le relire et à l’envoyer.{' '}
            <Link href="/mon-dossier/recapitulatif" className="font-semibold text-ink-700 underline">
              Voir le récapitulatif
            </Link>
          </p>
        ) : null}

        {enAttenteDOuverture ? (
          <div className="text-[0.9375rem] leading-relaxed text-graphite-600">
            <p>
              Les étapes suivantes — dossier d’inscription, vérification d’identité et signature de
              vos engagements — ouvriront dans cet espace. Le service des admissions vous préviendra
              dès qu’elles seront disponibles.
            </p>
            <p className="mt-2 text-[0.875rem] text-graphite-500">
              Vous n’avez rien à faire d’ici là, et rien de ce que vous avez déposé n’est perdu.
            </p>
          </div>
        ) : null}

        {/* Ni action de votre part, ni action possible : dire qui a la main, et
            sous quel délai. Ce délai existe dans la chaîne depuis toujours, et
            le candidat n'y avait accès nulle part. */}
        {!sens.aVous && !ouvert && !enAttenteDOuverture ? (
          <div className="text-[0.9375rem] leading-relaxed text-graphite-600">
            <p>
              Rien ne vous est demandé pour le moment.
              {maillon ? ` ${maillon.attendu}` : ''}
            </p>
            {maillon?.alerteApres ? (
              <p className="mt-2 text-[0.875rem] text-graphite-500">
                Ce service dispose de {maillon.alerteApres} jour
                {maillon.alerteApres > 1 ? 's' : ''} pour traiter votre dossier. Au-delà, il est
                signalé comme en retard dans le dispositif.
              </p>
            ) : null}
          </div>
        ) : null}
      </BlocAction>

      {/* ------------------------------------------------------ Progression */}
      {phase === 'candidature' ? (
        <Carte titre="Votre progression" aide="Aucune étape n’est verrouillée : vous pouvez y revenir dans l’ordre qui vous arrange.">
          <Rail dossier={dossier} courante={etapeAReprendre(dossier).id} />
        </Carte>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          <Tuile
            etiquette="Votre dossier"
            valeur={dossier.reference ?? '—'}
            detail={nommer(dossier.voeu1) ?? 'Formation non renseignée'}
            icone={<IconFile />}
            ton="encre"
            href="/mon-dossier/recapitulatif"
          />
          <Tuile
            etiquette="Vos documents"
            valeur={documents}
            detail={documents === 0 ? 'Votre lettre vous attend' : 'Numérotés et vérifiables'}
            complement="Voir"
            icone={<IconFile />}
            href="/mon-dossier/documents"
          />
          <Tuile
            etiquette="Votre référence de règlement"
            valeur={<span className="text-[1.375rem]">{reglement}</span>}
            detail="À indiquer lors de votre paiement"
            icone={<IconCheck />}
            ton="or"
            href="/mon-dossier/paiements"
          />
        </div>
      )}

      {/* ----------------------------------------------- Historique et détail */}
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Carte titre="L’historique de votre dossier">
          {journal.length > 0 ? (
            <ol className="flex flex-col">
              {journal.map((entree, rang) => (
                <li
                  key={entree.id ?? rang}
                  className="flex gap-4 border-b border-graphite-100 py-3 first:pt-0 last:border-0 last:pb-0"
                >
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink-50 text-ink-700">
                    {rang === 0 ? (
                      <IconClock className="h-4 w-4" />
                    ) : (
                      <IconCheck className="h-3.5 w-3.5" />
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[0.9375rem] text-ink-800">
                      {journalEnClair(entree.action ?? '')}
                    </span>
                    <span className="mt-0.5 block text-[0.8125rem] text-graphite-500">
                      {formatDate(entree.date, true)}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-[0.9375rem] text-graphite-500">
              Rien encore. L’historique se remplira à chaque changement d’état de votre dossier.
            </p>
          )}
        </Carte>

        <div className="flex flex-col gap-4">
          <Carte titre="Ce que vous avez déposé">
            <dl>
              <Ligne
                intitule="Premier choix"
                valeur={nommer(dossier.voeu1)}
                href={ouvert ? '/mon-dossier/formation' : undefined}
              />
              <Ligne intitule="Second choix" valeur={nommer(dossier.voeu2)} />
              <Ligne
                intitule="Nom et prénoms"
                valeur={[dossier.nom?.toUpperCase(), dossier.prenoms].filter(Boolean).join(' ')}
                href={ouvert ? '/mon-dossier/identite' : undefined}
              />
              <Ligne intitule="Téléphone" valeur={dossier.telephone} />
              <Ligne
                intitule="Documents déposés"
                valeur={String((dossier.pieces ?? []).length)}
                href={ouvert ? '/mon-dossier/pieces' : undefined}
              />
              <Ligne
                intitule="Frais de dossier"
                valeur={
                  dossier.referenceTransaction
                    ? dossier.transactionVerifiee
                      ? `${dossier.referenceTransaction} — vérifiée`
                      : `${dossier.referenceTransaction} — en attente de vérification`
                    : null
                }
              />
            </dl>
          </Carte>

          <Carte titre="Une question ?">
            <p className="text-[0.9375rem] leading-relaxed text-graphite-600">
              Nous vous préviendrons sur le contact indiqué dans votre dossier dès que son état
              changera. Vous pouvez aussi revenir sur cette page à tout moment.
            </p>
            <Link
              href="/contact"
              className="mt-4 inline-flex items-center gap-1.5 text-[0.875rem] font-semibold text-ink-700 hover:text-ink-600"
            >
              Écrire au service des admissions
              <IconArrowRight className="h-3.5 w-3.5" />
            </Link>
            <p className="mt-4 border-t border-graphite-100 pt-4 text-[0.75rem] leading-relaxed text-graphite-400">
              Vos informations ne sont lues que par le service des admissions.{' '}
              <Link href="/confidentialite" className="underline">
                Vos données
              </Link>
            </p>
          </Carte>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

/** Le pendant, côté candidat, de la file d'attente d'un poste : à en-tête teinté. */
function BlocAction({ titre, children }: { titre: string; children: React.ReactNode }) {
  return (
    <section className="carte overflow-hidden">
      <header className="border-b border-graphite-100 bg-paper-tint px-5 py-4">
        <h2 className="text-[1.0625rem] leading-snug">{titre}</h2>
      </header>
      <div className="p-5 sm:p-6">{children}</div>
    </section>
  );
}
