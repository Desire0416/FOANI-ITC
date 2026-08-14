import { randomBytes } from 'node:crypto';
import type { Payload } from 'payload';
import { incrementer } from './sequence';

/* ==========================================================================
   Les documents délivrés — Note complémentaire §5.2
   --------------------------------------------------------------------------
   « Un employeur, une banque ou une administration doit pouvoir vérifier
   qu'un certificat présenté est authentique. »

   D'où trois exigences, qui commandent toute la conception de ce module.

   1. Un document est un fait, pas une vue. La lettre d'admission remise le
      14 août doit rester lisible telle qu'elle a été remise, même si le
      dossier change d'état, si l'intitulé de la formation est corrigé ou si
      le candidat se désiste. On fige donc les valeurs au moment de la
      délivrance, dans `donnees`, plutôt que de les relire du dossier.

   2. Un document est numéroté, et son numéro ne se rejoue pas. La série est
      propre à chaque nature de document : les lettres d'admission se comptent
      indépendamment des certificats.

   3. Un document porte un code de vérification, que n'importe qui peut saisir
      sur une page publique. Le code doit donc être imprononçable par hasard —
      un tirage aléatoire, jamais dérivé du numéro de dossier — et l'alphabet
      exclut les caractères qu'on confond en recopiant depuis un papier.

   La délivrance est idempotente : redemander sa lettre ne la renumérote pas.
   ========================================================================== */

export type NatureDocument =
  | 'lettre-admission'
  | 'certificat-scolarite'
  | 'carte-etudiant'
  | 'recu-versement'
  | 'attestation-inscription'
  | 'engagement-signe';

type Definition = {
  readonly libelle: string;
  /** Le segment porté par le numéro. Court, et lisible à l'oral. */
  readonly code: string;
};

export const NATURES: Record<NatureDocument, Definition> = {
  'lettre-admission': { libelle: 'Lettre d’admission', code: 'LA' },
  'certificat-scolarite': { libelle: 'Certificat de scolarité', code: 'CS' },
  'carte-etudiant': { libelle: 'Carte étudiant', code: 'CE' },
  'recu-versement': { libelle: 'Reçu de versement', code: 'RV' },
  'attestation-inscription': { libelle: 'Attestation d’inscription', code: 'AI' },
  'engagement-signe': { libelle: 'Engagement financier signé', code: 'EF' },
};

export function natureDocument(cle: string | null | undefined): Definition {
  return NATURES[(cle ?? '') as NatureDocument] ?? { libelle: cle ?? '—', code: '??' };
}

/* --------------------------------------------------------------------------
   Le code de vérification
   -------------------------------------------------------------------------- */

/* Ni I ni 1, ni O ni 0 : le code sera recopié depuis une feuille imprimée,
   souvent photocopiée, parfois par quelqu'un qui ne l'attendait pas. */
const ALPHABET = 'ACDEFGHJKLMNPQRSTUVWXYZ23456789';
const LONGUEUR_CODE = 10;

/** Tire un code de vérification, en groupes de quatre pour se dicter. */
export function tirerCode(): string {
  const octets = randomBytes(LONGUEUR_CODE);
  let brut = '';
  for (let rang = 0; rang < LONGUEUR_CODE; rang += 1) {
    brut += ALPHABET[(octets[rang] ?? 0) % ALPHABET.length];
  }
  return `${brut.slice(0, 4)}-${brut.slice(4, 7)}-${brut.slice(7)}`;
}

/** Normalise une saisie : casse, espaces et tirets ne comptent pas. */
export function normaliserCode(saisi: string): string {
  return saisi.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

/* --------------------------------------------------------------------------
   La délivrance
   -------------------------------------------------------------------------- */

export type ValeursFigees = {
  /** Le nom porté sur le document, tel qu'il était au moment de la remise. */
  readonly titulaire: string;
  readonly formation: string | null;
  readonly niveau: string | null;
  /** Ce que le document dit de plus, propre à sa nature. */
  readonly mentions?: Readonly<Record<string, string | null>>;
};

export type DocumentDelivre = {
  readonly id: string | number;
  readonly nature: NatureDocument;
  readonly numero: string;
  readonly code: string;
  readonly delivreLe: string;
  readonly donnees: ValeursFigees;
};

/**
 * Délivre un document, ou rend celui qui existe déjà.
 *
 * Un même dossier ne peut recevoir deux lettres d'admission portant deux
 * numéros : ce serait donner à un candidat deux pièces contradictoires à
 * présenter. La recherche préalable n'est donc pas une optimisation, c'est la
 * règle.
 */
export async function delivrer(
  payload: Payload,
  parametres: {
    readonly nature: NatureDocument;
    readonly candidature: string | number;
    readonly personne?: string | number | null;
    readonly donnees: ValeursFigees;
  },
): Promise<DocumentDelivre> {
  const { docs } = await payload.find({
    collection: 'documents',
    where: {
      and: [
        { nature: { equals: parametres.nature } },
        { candidature: { equals: parametres.candidature } },
      ],
    },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  });

  const existant = docs[0] as unknown as DocumentDelivre | undefined;
  if (existant) return existant;

  const rang = await incrementer(payload, `document-${parametres.nature}`);
  const millesime = new Date().getFullYear();
  const numero = `FITC/${millesime}/${NATURES[parametres.nature].code}/${String(rang).padStart(5, '0')}`;

  const cree = await payload.create({
    collection: 'documents',
    data: {
      nature: parametres.nature,
      numero,
      code: tirerCode(),
      candidature: parametres.candidature,
      personne: parametres.personne ?? null,
      delivreLe: new Date().toISOString(),
      donnees: parametres.donnees,
    } as never,
    overrideAccess: true,
  });

  return cree as unknown as DocumentDelivre;
}

/**
 * Retrouve un document par son code de vérification.
 *
 * Sert la page publique : elle ne dit que ce que le §5.2 autorise — que le
 * document a bien été délivré, quand, et pour quelle formation.
 */
export async function parCode(payload: Payload, saisi: string): Promise<DocumentDelivre | null> {
  const normalise = normaliserCode(saisi);
  if (normalise.length !== LONGUEUR_CODE) return null;

  const code = `${normalise.slice(0, 4)}-${normalise.slice(4, 7)}-${normalise.slice(7)}`;

  const { docs } = await payload.find({
    collection: 'documents',
    where: { code: { equals: code } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  });

  return (docs[0] as unknown as DocumentDelivre | undefined) ?? null;
}
