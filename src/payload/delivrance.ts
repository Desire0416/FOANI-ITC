import type { Payload } from 'payload';
import { CYCLE_LABELS, getFormation, titreComplet } from '@/content/formations';
import { delivrer, type DocumentDelivre } from '@/payload/documents';
import type { Candidature } from '@/payload-types';

/* ==========================================================================
   La délivrance immédiate — Note complémentaire §5.1 étape 8, et §5.2
   --------------------------------------------------------------------------
   « Le dispositif met immédiatement à disposition de l'étudiant son certificat
   de scolarité, sa carte étudiant numérique et son reçu. »

   Trois des quatre documents sont délivrés ici. Le quatrième — le reçu de
   versement — ne l'est pas, et c'est délibéré : le §5.2 exige qu'il mentionne
   « le montant, la date, le mode de règlement et la référence de la
   transaction ». Le montant n'existe pas tant que la grille tarifaire n'est
   pas arrêtée. Un reçu sans montant n'est pas un reçu, et un reçu au montant
   inventé serait pire. Il relève du chapitre 6, avec les encaissements.

   La délivrance est idempotente et paresseuse : le document est créé à sa
   première ouverture, jamais renuméroté ensuite. Un étudiant qui rouvre son
   certificat six mois plus tard retrouve exactement celui qu'il a présenté.
   ========================================================================== */

function formation(dossier: Candidature): { intitule: string | null; niveau: string | null } {
  const trouvee = dossier.voeu1 ? getFormation(dossier.voeu1) : null;
  if (!trouvee) return { intitule: null, niveau: null };
  return { intitule: titreComplet(trouvee), niveau: CYCLE_LABELS[trouvee.cycle] ?? null };
}

/** Le nom porté par les documents : celui de l'acte, s'il a été recopié. */
export function titulaireDe(dossier: Candidature): string {
  const brut = dossier as unknown as Record<string, string | null>;
  const acte = [brut.nomActe?.toUpperCase(), brut.prenomsActe].filter(Boolean).join(' ').trim();
  if (acte) return acte;
  return [dossier.nom?.toUpperCase(), dossier.prenoms].filter(Boolean).join(' ').trim() || 'L’étudiant';
}

export type NatureDelivree = 'certificat-scolarite' | 'attestation-inscription' | 'carte-etudiant';

/**
 * Délivre l'un des documents de l'étape 8.
 *
 * Les valeurs sont figées au moment de la remise, comme pour la lettre
 * d'admission : un certificat présenté à une banque ne doit pas changer de
 * contenu parce que le dossier a bougé depuis.
 */
export async function delivrerDocument(
  payload: Payload,
  nature: NatureDelivree,
  dossier: Candidature,
): Promise<DocumentDelivre> {
  const { intitule, niveau } = formation(dossier);
  const brut = dossier as unknown as Record<string, string | null>;

  return delivrer(payload, {
    nature,
    candidature: dossier.id,
    personne:
      typeof dossier.personne === 'object' && dossier.personne
        ? (dossier.personne as { id: string | number }).id
        : (dossier.personne ?? null),
    donnees: {
      titulaire: titulaireDe(dossier),
      formation: intitule,
      niveau,
      mentions: {
        numeroEtudiant: brut.numeroEtudiant ?? null,
        anneeEntree: dossier.anneeEntree ? String(dossier.anneeEntree) : null,
        dossier: dossier.reference ?? null,
        sexe: brut.sexe ?? null,
        dateNaissance: dossier.dateNaissance ?? null,
        lieuNaissance: brut.lieuNaissanceActe ?? dossier.lieuNaissance ?? null,
      },
    },
  });
}

/** Les états dans lesquels les documents de scolarité sont délivrables. */
export const ETATS_DELIVRANCE = ['inscrit', 'acces-ouverts'] as const;

export function documentsDelivrables(dossier: Candidature): boolean {
  return (ETATS_DELIVRANCE as readonly string[]).includes(dossier.etat);
}
