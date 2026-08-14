import type { Metadata } from 'next';
import Link from 'next/link';
import { getPayload } from 'payload';
import config from '@payload-config';
import { IconArrowRight, IconFile } from '@/components/brand/icons';
import { Carte } from '@/components/candidat/ui';
import { EnTetePage, Vide } from '@/components/commun/ui';
import { exigerDossier } from '@/lib/candidat';
import { formatDate } from '@/lib/etats';
import { natureDocument, type ValeursFigees } from '@/payload/documents';

export const metadata: Metadata = { title: 'Mes documents' };

/* ==========================================================================
   Mes documents — Note complémentaire §5.2
   --------------------------------------------------------------------------
   Tout ce que l'établissement a remis, à un seul endroit et pour toujours.

   Cette rubrique corrige un défaut réel : la lettre d'admission n'était
   atteignable que depuis le bloc « ce qu'il vous reste à faire » de l'accueil,
   lequel ne s'affiche que dans les états où quelque chose est demandé au
   candidat. Un inscrit — à qui plus rien n'est demandé — ne pouvait donc plus
   rouvrir sa propre lettre. Un document délivré ne se retire pas.

   Elle recevra sans changement de forme le certificat de scolarité, la carte
   étudiant, le reçu et l'attestation d'inscription : ils sont déjà des lignes
   de la même collection, avec leur numéro et leur code.
   ========================================================================== */

/** Les natures qui savent s'afficher aujourd'hui, avec leur adresse. */
const CONSULTABLES: Record<string, string> = {
  'lettre-admission': '/mon-dossier/lettre',
};

export default async function MesDocuments() {
  const { dossier } = await exigerDossier();

  const payload = await getPayload({ config });
  const { docs } = await payload.find({
    collection: 'documents',
    where: { candidature: { equals: dossier.id } },
    sort: '-delivreLe',
    limit: 50,
    depth: 0,
    overrideAccess: true,
  });

  /* La lettre est délivrée à la première ouverture. Tant que le candidat n'a
     pas ouvert la sienne, elle n'existe pas en base — mais elle lui est due :
     on l'annonce, et le lien la fabrique. */
  const admis = [
    'admis',
    'admis-condition',
    'offre-acceptee',
    'versement-annonce',
    'place-reservee',
    'inscription-a-valider',
    'inscrit',
    'acces-ouverts',
  ].includes(dossier.etat);

  const lettreDelivree = docs.some(
    (document) => (document as { nature?: string }).nature === 'lettre-admission',
  );

  return (
    <div className="flex flex-col gap-6">
      <EnTetePage
        surtitre="Mes documents"
        titre="Ce que l’établissement vous a remis"
        resume="Chaque document porte un numéro et un code de vérification. Vous pouvez les consulter, les imprimer ou les enregistrer en PDF autant de fois que nécessaire."
      />

      {docs.length === 0 && !admis ? (
        <Vide
          titre="Aucun document pour le moment"
          corps="Vos documents officiels apparaîtront ici au fur et à mesure de votre parcours : lettre d’admission, puis certificat de scolarité, carte étudiant et reçus."
        />
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        {admis && !lettreDelivree ? (
          <LigneDocument
            titre="Lettre d’admission"
            detail="À ouvrir pour la première fois : elle sera numérotée à cet instant."
            href="/mon-dossier/lettre"
          />
        ) : null}

        {docs.map((brut) => {
          const document = brut as unknown as {
            id: string | number;
            nature: string;
            numero: string;
            code: string;
            delivreLe: string;
            donnees?: ValeursFigees;
          };
          const nature = natureDocument(document.nature);
          const href = CONSULTABLES[document.nature];

          return (
            <LigneDocument
              key={document.id}
              titre={nature.libelle}
              numero={document.numero}
              code={document.code}
              detail={`Délivré le ${formatDate(document.delivreLe)}${
                document.donnees?.formation ? ` — ${document.donnees.formation}` : ''
              }`}
              href={href}
            />
          );
        })}
      </div>

      <Carte titre="À quoi sert le code de vérification">
        <p className="text-[0.9375rem] leading-relaxed text-graphite-600">
          Un employeur, une banque ou une administration à qui vous présentez l’un de ces documents
          peut en contrôler l’authenticité&nbsp;: il saisit le code sur la page publique de
          vérification, qui lui indique la date de délivrance et la formation concernée — et rien
          d’autre. Aucune de vos données personnelles n’y figure.
        </p>
        <Link
          href="/verifier"
          className="mt-4 inline-flex items-center gap-1.5 text-[0.875rem] font-semibold text-ink-700 hover:text-ink-600"
        >
          Voir la page de vérification
          <IconArrowRight className="h-3.5 w-3.5" />
        </Link>
      </Carte>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function LigneDocument({
  titre,
  numero,
  code,
  detail,
  href,
}: {
  titre: string;
  numero?: string;
  code?: string;
  detail: string;
  href?: string;
}) {
  const contenu = (
    <>
      <div className="flex items-start gap-3.5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ink-50 text-ink-700">
          <IconFile className="h-[1.125rem] w-[1.125rem]" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[1rem] font-semibold text-ink-800">{titre}</span>
          {numero ? (
            <span className="mt-0.5 block font-display text-[0.8125rem] text-graphite-600 tabular-nums">
              N° {numero}
            </span>
          ) : null}
          <span className="mt-1 block text-[0.8125rem] leading-snug text-graphite-500">
            {detail}
          </span>
        </span>
        {href ? (
          <IconArrowRight
            aria-hidden="true"
            className="mt-3 h-4 w-4 shrink-0 text-graphite-400 transition-transform duration-300 group-hover:translate-x-0.5"
          />
        ) : null}
      </div>

      {code ? (
        <p className="mt-4 flex flex-wrap items-baseline gap-x-2.5 gap-y-1 border-t border-graphite-100 pt-3.5">
          <span className="text-[0.6875rem] font-semibold tracking-[0.08em] text-graphite-500 uppercase">
            Code de vérification
          </span>
          <span className="font-display text-[0.9375rem] tracking-[0.06em] text-ink-800">
            {code}
          </span>
        </p>
      ) : null}
    </>
  );

  return href ? (
    <Link href={href} className="carte group block p-5 transition-colors hover:border-ink-200">
      {contenu}
    </Link>
  ) : (
    <div className="carte p-5">{contenu}</div>
  );
}
