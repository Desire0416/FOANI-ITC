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
 * C'est le seul endroit du dispositif où un compteur est écrit.
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
 *
 * L'INCRÉMENT EST ATOMIQUE, ET IL DOIT L'ÊTRE.
 *
 * La version précédente lisait le compteur, ajoutait un, puis réécrivait —
 * trois opérations distinctes, avec deux fenêtres entre elles. Deux dépôts
 * simultanés lisaient la même valeur et repartaient avec le même numéro. Pour
 * un numéro de dossier, la contrainte d'unicité rattrapait la collision en
 * *erreur* : le second candidat voyait son envoi échouer. Pour un numéro de
 * reçu, ce serait pire — le §6.8 exige une numérotation « continue et sans
 * rupture, par exercice », et une collision y produit soit un trou, soit un
 * doublon, l'un et l'autre invalidant l'export comptable.
 *
 * L'instruction ci-dessous fait le tout en un aller-retour. PostgreSQL tient
 * un verrou de ligne pour sa durée : deux appels concurrents se sérialisent,
 * et chacun repart avec sa propre valeur. Il n'y a plus de fenêtre parce qu'il
 * n'y a plus de lecture séparée de l'écriture.
 *
 * Le repli sous SQLite reste l'ancienne façon de faire, en trois temps. Ce
 * n'est pas une négligence : le repli local sert un poste de développement, où
 * il n'y a jamais deux écritures simultanées. La dégradation est nommée plutôt
 * que silencieuse.
 */
export async function incrementer(payload: Payload, sequence: string): Promise<number> {
  /* Le pilote PostgreSQL expose son pool. On s'en sert directement : passer
     par une requête paramétrée évite d'ajouter une dépendance au constructeur
     de requêtes, dont la version est celle qu'a choisie le socle. */
  const pool = (payload.db as unknown as {
    readonly pool?: {
      query: (
        texte: string,
        valeurs?: readonly unknown[],
      ) => Promise<{ rows: { valeur: string | number }[] }>;
    };
  }).pool;

  if (pool) {
    const { rows } = await pool.query(
      `INSERT INTO compteurs (sequence, valeur, updated_at, created_at)
       VALUES ($1, 1, NOW(), NOW())
       ON CONFLICT (sequence) DO UPDATE
         SET valeur = compteurs.valeur + 1, updated_at = NOW()
       RETURNING valeur`,
      [sequence],
    );

    const valeur = rows[0]?.valeur;
    /* `valeur` est un `numeric` en base, que le pilote rend en chaîne pour ne
       pas perdre de précision. Un compteur tient largement dans un entier. */
    if (valeur !== undefined && valeur !== null) return Number(valeur);
  }

  /* Repli, employé si le pilote n'expose pas d'exécution directe. Il n'est pas
     atomique, et c'est dit : mieux vaut une dégradation nommée qu'une
     dégradation silencieuse. */
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
