import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { IconArrowUpRight, IconCheck } from '@/components/brand/icons';
import { Editeur, type ChampEditeur } from '@/components/gestion/editeur';
import { EnTetePage } from '@/components/gestion/ui';
import { formatDate } from '@/lib/etats';
import { RUBRIQUES, rubrique as lireRubrique, type CleRubrique } from '@/lib/publications';
import { exigerRole, socle } from '@/lib/session';
import { CATEGORIES_ACTUALITE } from '@/payload/collections/actualites';
import { TYPES_OFFRE } from '@/payload/collections/offres';
import { peutPublier } from '@/payload/publication';

export const metadata: Metadata = { title: 'Rédaction' };

const ROLES_EDITORIAUX = ['administrateur', 'editeur', 'redacteur', 'carrieres'] as const;

/** `2026-08-13` à partir d'une date ISO, pour un champ de type `date`. */
function jour(valeur: unknown): string | null {
  if (typeof valeur !== 'string' || !valeur) return null;
  return new Date(valeur).toISOString().slice(0, 10);
}

function texte(valeur: unknown): string | null {
  return typeof valeur === 'string' ? valeur : null;
}

/**
 * Les champs de chaque rubrique.
 *
 * Ils sont décrits ici plutôt que dans l'éditeur : celui-ci ne connaît que
 * des types de champs, ce qui permet d'ajouter une rubrique sans le toucher.
 */
function champsDe(cle: CleRubrique, doc: Record<string, unknown>): readonly ChampEditeur[] {
  if (cle === 'actualites') {
    return [
      {
        type: 'texte',
        nom: 'titre',
        etiquette: 'Titre',
        valeur: texte(doc.titre),
        requis: true,
        aide: 'Une phrase claire. C’est ce que le lecteur verra en premier.',
      },
      {
        type: 'liste',
        nom: 'categorie',
        etiquette: 'Rubrique',
        valeur: texte(doc.categorie) ?? 'etablissement',
        requis: true,
        largeur: 'moitie',
        options: CATEGORIES_ACTUALITE.map((item) => ({ valeur: item.value, libelle: item.label })),
      },
      {
        type: 'date',
        nom: 'date',
        etiquette: 'Date de l’actualité',
        valeur: jour(doc.date),
        requis: true,
        largeur: 'moitie',
      },
      {
        type: 'zone',
        nom: 'chapo',
        etiquette: 'Chapô',
        valeur: texte(doc.chapo),
        requis: true,
        lignes: 3,
        max: 320,
        aide: 'Deux ou trois lignes. C’est ce qui s’affiche en liste et dans les résultats de recherche.',
      },
      {
        type: 'zone',
        nom: 'corps',
        etiquette: 'Texte',
        valeur: texte(doc.corps),
        requis: true,
        lignes: 16,
        aide: 'Laissez une ligne vide entre deux paragraphes. Le site s’occupe de la mise en forme.',
      },
      {
        type: 'texte',
        nom: 'slug',
        etiquette: 'Adresse de la page',
        valeur: texte(doc.slug),
        aide: 'Déduite du titre si vous la laissez vide. Ne la changez plus une fois publiée.',
      },
    ];
  }

  if (cle === 'evenements') {
    return [
      { type: 'texte', nom: 'titre', etiquette: 'Intitulé', valeur: texte(doc.titre), requis: true },
      {
        type: 'date',
        nom: 'date',
        etiquette: 'Date',
        valeur: jour(doc.date),
        largeur: 'moitie',
        aide: 'Laissez vide tant que la date n’est pas arrêtée : le site écrira « date à confirmer ».',
      },
      {
        type: 'texte',
        nom: 'lieu',
        etiquette: 'Lieu',
        valeur: texte(doc.lieu) ?? 'Campus de FOANI-ITC, Agnibilékrou',
        requis: true,
        largeur: 'moitie',
      },
      {
        type: 'zone',
        nom: 'resume',
        etiquette: 'De quoi s’agit-il',
        valeur: texte(doc.resume),
        requis: true,
        lignes: 5,
        max: 400,
        aide: 'Quelques lignes : ce qui se passe, et pour qui.',
      },
      {
        type: 'case',
        nom: 'inscriptionRequise',
        etiquette: 'Une inscription est nécessaire',
        coche: doc.inscriptionRequise === true,
      },
      { type: 'texte', nom: 'slug', etiquette: 'Adresse de la page', valeur: texte(doc.slug) },
    ];
  }

  return [
    { type: 'texte', nom: 'intitule', etiquette: 'Intitulé du poste', valeur: texte(doc.intitule), requis: true },
    {
      type: 'texte',
      nom: 'structure',
      etiquette: 'Entreprise ou organisation',
      valeur: texte(doc.structure),
      requis: true,
      largeur: 'moitie',
    },
    { type: 'texte', nom: 'lieu', etiquette: 'Lieu', valeur: texte(doc.lieu), requis: true, largeur: 'moitie' },
    {
      type: 'liste',
      nom: 'type',
      etiquette: 'Nature',
      valeur: texte(doc.type) ?? 'stage',
      requis: true,
      largeur: 'moitie',
      options: TYPES_OFFRE.map((item) => ({ valeur: item.value, libelle: item.label })),
    },
    {
      type: 'date',
      nom: 'dateLimite',
      etiquette: 'Date limite de candidature',
      valeur: jour(doc.dateLimite),
      requis: true,
      largeur: 'moitie',
      aide: 'Passé ce jour, l’offre disparaît d’elle-même du site public.',
    },
    {
      type: 'zone',
      nom: 'description',
      etiquette: 'Ce qui est proposé',
      valeur: texte(doc.description),
      requis: true,
      lignes: 12,
      aide: 'Missions, profil attendu, conditions. Une ligne vide sépare deux paragraphes.',
    },
    {
      type: 'texte',
      nom: 'contact',
      etiquette: 'Comment postuler',
      valeur: texte(doc.contact),
      requis: true,
      aide: 'Adresse électronique, numéro, ou consigne précise donnée par l’entreprise.',
    },
    { type: 'texte', nom: 'slug', etiquette: 'Adresse', valeur: texte(doc.slug) },
  ];
}

export default async function PageRedaction({
  params,
}: {
  params: Promise<{ rubrique: string; id: string }>;
}) {
  const agent = await exigerRole([...ROLES_EDITORIAUX]);
  const { rubrique: brute, id } = await params;

  if (!RUBRIQUES.some((item) => item.cle === brute)) notFound();
  const courante = lireRubrique(brute);

  const nouveau = id === 'nouveau';
  let doc: Record<string, unknown> = {};

  if (!nouveau) {
    const payload = await socle();
    try {
      doc = (await payload.findByID({
        collection: courante.cle,
        id,
        depth: 0,
        overrideAccess: true,
      })) as unknown as Record<string, unknown>;
    } catch {
      notFound();
    }
  }

  const etat = nouveau ? 'brouillon' : String(doc.etat ?? 'brouillon');
  const enLigne = etat === 'publie' && typeof doc.slug === 'string';

  return (
    <>
      <EnTetePage
        surtitre={courante.libelle}
        titre={nouveau ? `Rédiger : ${courante.singulier.toLowerCase()}` : String(doc.titre ?? doc.intitule ?? 'Contenu')}
        resume={nouveau ? courante.aide : undefined}
        actions={
          <Link href={`/gestion/publications?rubrique=${courante.cle}`} className="bouton bouton--contour">
            Retour à la liste
          </Link>
        }
      />

      <div className="mt-7">
        <Editeur
          rubrique={courante.cle}
          id={nouveau ? null : id}
          etat={etat}
          champs={champsDe(courante.cle, doc)}
          peutPublier={peutPublier(agent.role)}
          apercu={
            nouveau ? null : (
              <section className="carte p-5">
                <p className="text-[0.8125rem] font-semibold text-graphite-700">Suivi</p>
                <dl className="mt-3 flex flex-col gap-2 text-[0.8125rem]">
                  <div className="flex justify-between gap-4">
                    <dt className="text-graphite-500">Dernière modification</dt>
                    <dd className="text-ink-800">{formatDate(String(doc.updatedAt), true)}</dd>
                  </div>
                  {doc.publieLe ? (
                    <div className="flex justify-between gap-4">
                      <dt className="text-graphite-500">Mis en ligne le</dt>
                      <dd className="text-ink-800">{formatDate(String(doc.publieLe))}</dd>
                    </div>
                  ) : null}
                </dl>

                {enLigne ? (
                  <a
                    href={`${courante.ou}/${doc.slug}`}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="bouton bouton--contour mt-4 w-full"
                  >
                    Voir sur le site
                    <IconArrowUpRight className="h-4 w-4" />
                  </a>
                ) : null}

                {Array.isArray(doc.journal) && doc.journal.length > 0 ? (
                  <div className="mt-5 border-t border-graphite-100 pt-4">
                    <p className="text-[0.8125rem] font-semibold text-graphite-700">Historique</p>
                    <ol className="mt-3 flex flex-col gap-2.5">
                      {[...(doc.journal as Record<string, string>[])].reverse().map((entree, rang) => (
                        <li key={rang} className="flex gap-2.5">
                          <IconCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-graphite-400" />
                          <span className="text-[0.75rem] leading-snug text-graphite-600">
                            {entree.action} — {entree.auteur}
                            <span className="block text-graphite-400">{formatDate(entree.date, true)}</span>
                          </span>
                        </li>
                      ))}
                    </ol>
                  </div>
                ) : null}
              </section>
            )
          }
        />
      </div>
    </>
  );
}
