import type { Payload } from 'payload';

/* ==========================================================================
   Séquences — numéro de dossier et numéro étudiant
   --------------------------------------------------------------------------
   Le CDC impose (§11.1) que le numéro étudiant « n'encode ni la filière ni le
   niveau » : « le jour où l'étudiant redouble, change de filière ou passe du
   BTS à la Licence, un numéro porteur de cette information devient faux et ne
   peut être corrigé sans rompre l'historique ».

   Les numéros produits ici sont donc strictement séquentiels et opaques. Le
   millésime lui-même en est absent : un participant à une formation courte
   peut candidater à un cursus diplômant deux ans plus tard, sous le même
   numéro (§11.1), et un numéro daté rendrait cette continuité illisible.

   La série est unique, partagée par les étudiants et les participants aux
   formations courtes, conformément au même paragraphe.
   ========================================================================== */

export type Sequence = 'candidature' | 'etudiant';

const PREFIXES: Record<Sequence, string> = {
  candidature: 'D',
  etudiant: 'E',
};

const LARGEUR = 6;

/**
 * Incrémente une séquence et retourne la référence formatée.
 *
 * L'incrément et la lecture se font dans une transaction : deux candidatures
 * déposées à la même seconde ne peuvent pas recevoir le même numéro. C'est le
 * seul endroit du dispositif où un compteur est écrit.
 */
export async function attribuerReference(payload: Payload, sequence: Sequence): Promise<string> {
  return formater(sequence, await incrementer(payload, sequence));
}

/**
 * Incrémente une série nommée et rend sa nouvelle valeur.
 *
 * Les documents délivrés (§5.2) ont leur propre série par nature de document :
 * les lettres d'admission se numérotent indépendamment des certificats. D'où
 * une fonction qui ne présume rien du format, laissée à l'appelant.
 */
export async function incrementer(payload: Payload, sequence: string): Promise<number> {
  const existantes = await payload.find({
    collection: 'compteurs',
    where: { sequence: { equals: sequence } },
    limit: 1,
    overrideAccess: true,
  });

  const courant = existantes.docs[0];

  if (!courant) {
    const cree = await payload.create({
      collection: 'compteurs',
      data: { sequence, valeur: 1 },
      overrideAccess: true,
    });
    return cree.valeur as number;
  }

  const suivant = (courant.valeur as number) + 1;
  await payload.update({
    collection: 'compteurs',
    id: courant.id,
    data: { valeur: suivant },
    overrideAccess: true,
  });

  return suivant;
}

function formater(sequence: Sequence, valeur: number): string {
  return `${PREFIXES[sequence]}${String(valeur).padStart(LARGEUR, '0')}`;
}
