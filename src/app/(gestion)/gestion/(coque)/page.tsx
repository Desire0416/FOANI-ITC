import type { Metadata } from 'next';
import Link from 'next/link';
import {
  IconArrowRight,
  IconArrowUpRight,
  IconCheck,
  IconClock,
  IconFile,
  IconUsers,
} from '@/components/brand/icons';
import { Anneau, Courbe, type PartAnneau, type PointSerie } from '@/components/gestion/graphiques';
import { Carte, EnTetePage, Pastille, Tuile, Vide } from '@/components/gestion/ui';
import { CYCLE_LABELS, getFormation, titreComplet } from '@/content/formations';
import type { Cycle } from '@/content/types';
import { Echeances } from '@/components/gestion/echeances';
import { CadreDuPoste, FileAttente, type LigneFile } from '@/components/gestion/file-attente';
import { Perimetre } from '@/components/gestion/perimetre';
import { exigerAgent, socle } from '@/lib/session';
import { ETATS_OFFRE_EN_COURS, enAlerte } from '@/payload/chaine';
import { posteDuRole } from '@/payload/postes';
import { LIBELLES_ROLE, ROLES_DOSSIERS } from '@/payload/roles';

export const metadata: Metadata = { title: 'Tableau de bord' };

const LIBELLES_ETAT: Record<string, string> = {
  brouillon: 'Brouillon',
  soumis: 'Soumis',
  instruction: 'En instruction',
  complement: 'Complément demandé',
  complet: 'Complet',
  admis: 'Admis',
  'admis-condition': 'Admis sous condition',
  attente: 'Liste d’attente',
  refuse: 'Refusé',
  inscrit: 'Inscrit',
  desiste: 'Désisté',
};

const TONS_ETAT: Record<string, 'neutre' | 'encre' | 'or' | 'vert' | 'plein' | 'rouge'> = {
  soumis: 'encre',
  instruction: 'encre',
  complement: 'or',
  complet: 'vert',
  admis: 'plein',
  'admis-condition': 'plein',
  inscrit: 'plein',
  attente: 'neutre',
  refuse: 'rouge',
  desiste: 'rouge',
  brouillon: 'neutre',
};

/* --------------------------------------------------------------------------
   Deux lectures du même jeu de dossiers
   -------------------------------------------------------------------------- */

/** Le lundi de la semaine contenant cette date, à minuit. */
function lundi(date: Date): Date {
  const jour = new Date(date);
  jour.setHours(0, 0, 0, 0);
  // getDay() rend 0 pour dimanche : on le ramène en fin de semaine.
  const decalage = (jour.getDay() + 6) % 7;
  jour.setDate(jour.getDate() - decalage);
  return jour;
}

/**
 * Dossiers reçus par semaine, sur les huit dernières.
 *
 * Les semaines sans dossier comptent pour zéro : sans elles, la courbe
 * mentirait sur le rythme en rapprochant deux pics séparés d'un mois.
 */
function receptionParSemaine(
  dossiers: readonly Record<string, string | undefined>[],
): readonly PointSerie[] {
  const semaines: { debut: Date; valeur: number }[] = [];
  const depart = lundi(new Date());

  for (let recul = 7; recul >= 0; recul -= 1) {
    const debut = new Date(depart);
    debut.setDate(debut.getDate() - recul * 7);
    semaines.push({ debut, valeur: 0 });
  }

  const premiere = semaines[0]!.debut.getTime();

  for (const dossier of dossiers) {
    const brut = dossier.soumisLe ?? dossier.createdAt;
    if (!brut) continue;
    const date = new Date(brut);
    if (Number.isNaN(date.getTime()) || date.getTime() < premiere) continue;

    const rang = Math.floor((lundi(date).getTime() - premiere) / (7 * 24 * 60 * 60 * 1000));
    const semaine = semaines[rang];
    if (semaine) semaine.valeur += 1;
  }

  // Chaque semaine porte sa date : c'est le graphique qui en masque une sur
  // deux à l'écran, pas la donnée qui les perd.
  return semaines.map(({ debut, valeur }) => ({
    etiquette: new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit' }).format(debut),
    valeur,
  }));
}

/** Répartition des dossiers par cycle, dans les tons de la charte. */
function repartitionParCycle(
  dossiers: readonly Record<string, string | undefined>[],
): readonly PartAnneau[] {
  const compte: Record<Cycle, number> = { bts: 0, licence: 0, certificat: 0, masterclass: 0 };

  for (const dossier of dossiers) {
    const formation = dossier.voeu1 ? getFormation(dossier.voeu1) : undefined;
    if (formation) compte[formation.cycle] += 1;
  }

  return [
    { libelle: CYCLE_LABELS.bts, valeur: compte.bts, couleur: 'var(--color-ink-800)' },
    { libelle: CYCLE_LABELS.licence, valeur: compte.licence, couleur: 'var(--color-ink-500)' },
    { libelle: CYCLE_LABELS.certificat, valeur: compte.certificat, couleur: 'var(--color-gold-400)' },
    { libelle: CYCLE_LABELS.masterclass, valeur: compte.masterclass, couleur: 'var(--color-gold-200)' },
  ];
}

function formatCourt(valeur: string | undefined): string {
  if (!valeur) return '—';
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    timeZone: 'Africa/Abidjan',
  }).format(new Date(valeur));
}

/**
 * Tableau de bord.
 *
 * Un chargé d'admission n'ouvre pas son espace pour choisir un menu : il
 * l'ouvre pour savoir combien de dossiers l'attendent. L'écran répond dans
 * cet ordre, et toutes les valeurs sont lues en base à l'affichage.
 */
/** Mêmes rôles que la page des publications. */
const ROLES_EDITORIAUX: readonly string[] = [
  'administrateur',
  'editeur',
  'redacteur',
  'carrieres',
];

export default async function PageTableauDeBord() {
  const agent = await exigerAgent();
  const payload = await socle();

  /* Tous les roles voyaient les memes tuiles — celles de l'admission. Un
     redacteur y lisait un nombre de dossiers qu'il n'a pas a connaitre, et n'y
     trouvait rien de son propre travail. Le tableau de bord se scinde donc :
     ceux qui instruisent voient les dossiers, les autres voient l'editorial. */
  const voitLesDossiers = ROLES_DOSSIERS.includes(agent.role);
  const voitLEditorial = ROLES_EDITORIAUX.includes(agent.role);

  /* Le poste que tient l'agent, et les états dont il est propriétaire. C'est
     la file d'attente du §4.1 : ce qui attend son action, et rien d'autre. */
  const poste = posteDuRole(agent.role);
  const file = poste?.file ?? [];

  const dossiersDeLaFile =
    file.length > 0
      ? await payload
          .find({
            collection: 'candidatures',
            where: { etat: { in: [...file] } } as never,
            sort: 'updatedAt',
            limit: 12,
            depth: 0,
            overrideAccess: true,
          })
          .catch(() => ({ docs: [] as Record<string, unknown>[], totalDocs: 0 }))
      : { docs: [] as Record<string, unknown>[], totalDocs: 0 };

  const lignesFile: LigneFile[] = (dossiersDeLaFile.docs as Record<string, unknown>[]).map((brut) => {
    const formation = typeof brut.voeu1 === 'string' ? getFormation(brut.voeu1) : undefined;
    const depuis = String(brut.updatedAt ?? '');
    return {
      id: String(brut.id),
      reference: typeof brut.reference === 'string' ? brut.reference : null,
      nom: String(brut.nomCandidat || 'Candidat sans nom'),
      formation: formation ? `${CYCLE_LABELS[formation.cycle]} — ${titreComplet(formation)}` : null,
      etat: String(brut.etat ?? ''),
      depuis,
      enAlerte: enAlerte(String(brut.etat ?? ''), depuis),
    };
  });

  /* Les dossiers immobiles d'abord (RG-44) : ce sont eux qui coûtent une
     place gelée ou une rentrée retardée. */
  lignesFile.sort((a, b) => Number(b.enAlerte) - Number(a.enAlerte));


  const compter = (where?: Record<string, unknown>) =>
    payload
      .count({ collection: 'candidatures', where: where as never, overrideAccess: true })
      .then((resultat) => resultat.totalDocs)
      .catch(() => 0);

  const [total, aInstruire, complements, admis, comptes, personnes] = voitLesDossiers
    ? await Promise.all([
        compter({ etat: { not_equals: 'brouillon' } }),
        compter({ etat: { in: ['soumis', 'instruction'] } }),
        compter({ etat: { equals: 'complement' } }),
        compter({ etat: { in: ['admis', 'admis-condition', 'inscrit'] } }),
        payload
          .count({ collection: 'candidats', overrideAccess: true })
          .then((r) => r.totalDocs)
          .catch(() => 0),
        payload
          .count({ collection: 'personnes', overrideAccess: true })
          .then((r) => r.totalDocs)
          .catch(() => 0),
      ])
    : [0, 0, 0, 0, 0, 0];

  /* Pour les roles editoriaux, ce qui compte est l'etat des publications. */
  const compterPublications = async (etat: string) => {
    const rubriques = ['actualites', 'evenements', 'offres'] as const;
    const totaux = await Promise.all(
      rubriques.map((rubrique) =>
        payload
          .count({ collection: rubrique, where: { etat: { equals: etat } }, overrideAccess: true })
          .then((r) => r.totalDocs)
          .catch(() => 0),
      ),
    );
    return totaux.reduce((somme, valeur) => somme + valeur, 0);
  };

  const [brouillons, aValider, publies] = voitLEditorial
    ? await Promise.all([
        compterPublications('brouillon'),
        compterPublications('a-valider'),
        compterPublications('publie'),
      ])
    : [0, 0, 0];

  /* Échéances et places libérées — le poste Admission seul en a l'usage. */
  const estAdmission = poste?.cle === 'admission';

  const [offresExpirees, enListeAttente, placesLiberees] = estAdmission
    ? await Promise.all([
        compter({
          and: [
            { etat: { in: [...ETATS_OFFRE_EN_COURS] } },
            { limiteAcceptation: { less_than: new Date().toISOString() } },
          ],
        }),
        compter({ etat: { equals: 'attente' } }),
        compter({ etat: { in: ['desiste', 'annule'] } }),
      ])
    : [0, 0, 0];

  const recentes = voitLesDossiers
    ? await payload
        .find({
          collection: 'candidatures',
          where: { etat: { not_equals: 'brouillon' } },
          sort: '-updatedAt',
          limit: 6,
          depth: 0,
          overrideAccess: true,
        })
        .catch(() => ({ docs: [] as unknown[] }))
    : { docs: [] as unknown[] };

  /* Tous les dossiers soumis, en deux champs : de quoi tracer le rythme de
     réception et la répartition par cycle sans multiplier les requêtes. */
  const pourGraphiques = !voitLesDossiers
    ? ([] as Record<string, string | undefined>[])
    : await payload
    .find({
      collection: 'candidatures',
      where: { etat: { not_equals: 'brouillon' } },
      sort: '-createdAt',
      limit: 1000,
      depth: 0,
      select: { soumisLe: true, createdAt: true, voeu1: true } as never,
      overrideAccess: true,
    })
    .then((resultat) => resultat.docs as Record<string, string | undefined>[])
    .catch(() => [] as Record<string, string | undefined>[]);

  const reception = receptionParSemaine(pourGraphiques);
  const parCycle = repartitionParCycle(pourGraphiques);

  /* Ce que l'agent lit en premier doit parler de son poste, pas du dispositif.
     Un agent des finances à qui l'on annonce « aucun dossier n'attend
     d'instruction » alors qu'un versement l'attend juste en dessous cesse de
     croire la phrase — et, à terme, l'écran. La file du poste prime donc sur
     le décompte général, qui ne subsiste que pour les rôles sans file. */
  const enFile = dossiersDeLaFile.totalDocs;
  const resume = poste
    ? enFile > 0
      ? `${enFile} dossier${enFile > 1 ? 's' : ''} vous ${enFile > 1 ? 'sont adressés' : 'est adressé'}.`
      : 'Votre file est vide. Rien n’attend votre poste pour le moment.'
    : voitLesDossiers
      ? aInstruire > 0
        ? `${aInstruire} dossier${aInstruire > 1 ? 's' : ''} attend${aInstruire > 1 ? 'ent' : ''} votre instruction.`
        : 'Aucun dossier n’attend d’instruction pour le moment.'
      : voitLEditorial
        ? aValider > 0
          ? `${aValider} contenu${aValider > 1 ? 'x' : ''} attend${aValider > 1 ? 'ent' : ''} une validation.`
          : 'Aucun contenu n’attend de validation.'
        : 'Votre rôle n’ouvre pas encore d’espace de travail dans le dispositif.';

  const heure = new Date().getHours();
  const salutation = heure < 12 ? 'Bonjour' : heure < 18 ? 'Bon après-midi' : 'Bonsoir';
  const pourcentage = (valeur: number) => (total > 0 ? `${Math.round((valeur / total) * 100)} %` : '—');

  return (
    <div className="flex flex-col gap-6">
      <EnTetePage
        surtitre={LIBELLES_ROLE[agent.role]}
        titre={`${salutation}${agent.prenoms ? `, ${agent.prenoms}` : ''}.`}
        resume={resume}
        actions={
          voitLesDossiers ? (
            <Link href="/gestion/candidatures" className="bouton bouton--principal">
              Ouvrir les candidatures
              <IconArrowRight className="h-4 w-4" />
            </Link>
          ) : voitLEditorial ? (
            <Link href="/gestion/publications" className="bouton bouton--principal">
              Ouvrir les publications
              <IconArrowRight className="h-4 w-4" />
            </Link>
          ) : null
        }
      />

      {/* La file d'attente d'abord : l'écran d'accueil n'est pas un menu,
          c'est une liste de travail (§4.1). */}
      {poste && file.length > 0 ? (
        <FileAttente poste={poste} lignes={lignesFile} total={dossiersDeLaFile.totalDocs} />
      ) : null}

      {estAdmission ? (
        <Echeances
          expirees={offresExpirees}
          enAttente={enListeAttente}
          liberees={placesLiberees}
        />
      ) : null}

      {/* Ce que le poste fait, consulte, et ne touche pas. */}
      {poste ? <CadreDuPoste poste={poste} /> : <Perimetre role={agent.role} />}

      {/* ------------------------------------------------------------ Tuiles */}
      {voitLEditorial && !voitLesDossiers ? (
        <div className="grid gap-4 sm:grid-cols-3">
          <Tuile
            etiquette="Brouillons"
            valeur={brouillons}
            detail="En cours d’écriture"
            icone={<IconFile />}
            ton="encre"
            href="/gestion/publications?vue=brouillon"
          />
          <Tuile
            etiquette="À valider"
            valeur={aValider}
            detail={
              agent.role === 'redacteur'
                ? 'Soumis, en attente d’un éditeur'
                : 'Soumis par un rédacteur'
            }
            icone={<IconClock />}
            ton="or"
            href="/gestion/publications?vue=a-valider"
          />
          <Tuile
            etiquette="En ligne"
            valeur={publies}
            detail="Visibles sur le site"
            icone={<IconCheck />}
            ton="vert"
            href="/gestion/publications?vue=publie"
          />
        </div>
      ) : null}

      {voitLesDossiers ? (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Tuile
          etiquette="Dossiers reçus"
          valeur={total}
          detail="Hors brouillons"
          complement={`${comptes} compte${comptes > 1 ? 's' : ''}`}
          icone={<IconFile />}
          ton="encre"
          href="/gestion/candidatures"
        />
        <Tuile
          etiquette="À instruire"
          valeur={aInstruire}
          detail="Soumis ou en cours"
          complement={pourcentage(aInstruire)}
          icone={<IconClock />}
          ton="or"
          href="/gestion/candidatures?vue=instruire"
        />
        <Tuile
          etiquette="Compléments demandés"
          valeur={complements}
          detail="En attente du candidat"
          complement={pourcentage(complements)}
          icone={<IconArrowUpRight />}
          ton="ambre"
          href="/gestion/candidatures?vue=complement"
        />
        <Tuile
          etiquette="Admis"
          valeur={admis}
          detail="Décision favorable"
          complement={pourcentage(admis)}
          icone={<IconCheck />}
          ton="vert"
          href="/gestion/candidatures?vue=decides"
        />
      </div>
      ) : null}

      {/* -------------------------------------------------------- Réception */}
      {voitLesDossiers ? (
      <Carte
        titre="Réception des dossiers"
        mention="Huit dernières semaines"
        lien={{ libelle: 'Voir la liste', href: '/gestion/candidatures' }}
      >
        <Courbe serie={reception} titre="Dossiers reçus par semaine, sur les huit dernières semaines" />
      </Carte>
      ) : null}

      {/* ------------------------------------------------- Derniers mouvements */}
      {voitLesDossiers ? (
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Carte titre="Derniers mouvements" lien={{ libelle: 'Tout voir', href: '/gestion/candidatures' }}>
          {recentes.docs.length === 0 ? (
            <Vide
              titre="Aucun dossier soumis"
              corps="Les candidatures déposées depuis le portail apparaîtront ici, du plus récemment modifié au plus ancien."
            />
          ) : (
            <ul className="-mx-2 flex flex-col">
              {recentes.docs.map((brut) => {
                const doc = brut as Record<string, string | undefined>;
                const formation = doc.voeu1 ? getFormation(doc.voeu1) : undefined;
                const etat = doc.etat ?? 'brouillon';
                return (
                  <li key={String(doc.id)}>
                    <Link
                      href={`/gestion/candidatures/${doc.id}`}
                      className="flex items-center gap-4 rounded-xl px-2 py-3 transition-colors hover:bg-ink-50"
                    >
                      <span className="w-20 shrink-0 font-display text-[0.8125rem] font-semibold tabular-nums text-ink-700">
                        {doc.reference ?? '—'}
                      </span>
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate text-[0.875rem] font-semibold text-ink-800">
                          {doc.nomCandidat || 'Sans nom'}
                        </span>
                        <span className="truncate text-[0.75rem] text-graphite-500">
                          {formation
                            ? `${CYCLE_LABELS[formation.cycle]} — ${titreComplet(formation)}`
                            : 'Formation non renseignée'}
                        </span>
                      </span>
                      <Pastille ton={TONS_ETAT[etat] ?? 'neutre'} point>
                        {LIBELLES_ETAT[etat] ?? etat}
                      </Pastille>
                      <span className="hidden w-16 shrink-0 text-right text-[0.75rem] text-graphite-400 sm:block">
                        {formatCourt(doc.updatedAt)}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Carte>

        <div className="flex flex-col gap-4">
          <Carte titre="Référentiel">
            <ul className="flex flex-col gap-3">
              <li className="flex items-center gap-3 rounded-xl border border-graphite-100 bg-paper-tint px-4 py-3.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink-800 text-gold-400">
                  <IconUsers className="h-[1.125rem] w-[1.125rem]" />
                </span>
                <span className="flex flex-1 flex-col">
                  <span className="text-[0.875rem] font-semibold text-ink-800">Personnes</span>
                  <span className="text-[0.75rem] text-graphite-500">Référentiel unique</span>
                </span>
                <span className="font-display text-[1.375rem] tabular-nums text-ink-700">{personnes}</span>
              </li>
              <li className="flex items-center gap-3 rounded-xl border border-graphite-100 bg-paper-tint px-4 py-3.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink-800 text-gold-400">
                  <IconFile className="h-[1.125rem] w-[1.125rem]" />
                </span>
                <span className="flex flex-1 flex-col">
                  <span className="text-[0.875rem] font-semibold text-ink-800">Comptes candidats</span>
                  <span className="text-[0.75rem] text-graphite-500">Créés depuis le portail</span>
                </span>
                <span className="font-display text-[1.375rem] tabular-nums text-ink-700">{comptes}</span>
              </li>
            </ul>
          </Carte>

          <Carte titre="Répartition par cycle" mention="Dossiers soumis">
            <Anneau
              titre="Répartition des dossiers soumis par cycle de formation"
              parts={parCycle}
              centre={String(total)}
              souscentre={total > 1 ? 'dossiers' : 'dossier'}
            />
          </Carte>
        </div>
      </div>
      ) : null}
    </div>
  );
}
