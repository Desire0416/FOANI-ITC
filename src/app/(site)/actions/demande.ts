'use server';

/* ==========================================================================
   Réception des demandes issues du site
   --------------------------------------------------------------------------
   Le CDC sépare quatre systèmes (§7.1). Le site public ne stocke rien : il
   transmet les demandes d'information, de brochure, de devis et de
   recrutement au système qui tient la liste de prospects (§10.6).

   Le point de branchement est unique et explicite : `PROSPECTS_WEBHOOK_URL`.
   Tant qu'il n'est pas renseigné, l'action ne prétend pas avoir transmis quoi
   que ce soit — elle le dit. Un formulaire qui affiche « message envoyé »
   sans destinataire est pire que pas de formulaire du tout : il perd des
   candidats en leur laissant croire qu'ils ont été entendus.
   ========================================================================== */

export type TypeDemande = 'information' | 'brochure' | 'devis' | 'recruteur' | 'contact';

export type EtatDemande = {
  readonly statut: 'inerte' | 'succes' | 'erreur' | 'non-configure';
  readonly message?: string;
  readonly erreurs?: Readonly<Record<string, string>>;
};

/** Champs obligatoires selon le type de demande. */
const REQUIS: Record<TypeDemande, readonly string[]> = {
  information: ['nom', 'contact', 'message'],
  brochure: ['nom', 'contact'],
  devis: ['organisation', 'nom', 'contact', 'message'],
  recruteur: ['organisation', 'nom', 'contact', 'message'],
  contact: ['nom', 'contact', 'message'],
};

const LIBELLES: Record<string, string> = {
  nom: 'Nom et prénoms',
  contact: 'Téléphone ou adresse électronique',
  organisation: 'Organisation',
  message: 'Message',
  consentement: 'Consentement',
};

/**
 * Un contact est accepté comme numéro ivoirien ou comme adresse électronique.
 * La règle reste large à dessein : un candidat qui saisit son numéro avec des
 * espaces ne doit pas être rejeté par une expression régulière trop stricte.
 */
function contactValide(valeur: string): boolean {
  const compact = valeur.replace(/[\s.-]/g, '');
  const telephone = /^\+?\d{8,15}$/.test(compact);
  const courriel = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(valeur.trim());
  return telephone || courriel;
}

export async function envoyerDemande(_precedent: EtatDemande, donnees: FormData): Promise<EtatDemande> {
  const type = String(donnees.get('type') ?? 'contact') as TypeDemande;
  const champs = REQUIS[type] ?? REQUIS.contact;

  const valeurs: Record<string, string> = {};
  for (const [cle, valeur] of donnees.entries()) {
    if (typeof valeur === 'string') valeurs[cle] = valeur.trim();
  }

  const erreurs: Record<string, string> = {};
  for (const champ of champs) {
    if (!valeurs[champ]) erreurs[champ] = `${LIBELLES[champ] ?? champ} est obligatoire.`;
  }
  if (valeurs.contact && !contactValide(valeurs.contact)) {
    erreurs.contact = 'Saisissez un numéro de téléphone ou une adresse électronique valide.';
  }
  if (!donnees.get('consentement')) {
    erreurs.consentement = 'Votre accord est nécessaire pour que nous puissions vous répondre.';
  }
  // Piège à robots : un champ masqué que seul un automate remplit.
  if (valeurs.site) {
    return { statut: 'succes', message: 'Demande enregistrée.' };
  }

  if (Object.keys(erreurs).length > 0) {
    return { statut: 'erreur', message: 'Vérifiez les champs signalés.', erreurs };
  }

  const destination = process.env.PROSPECTS_WEBHOOK_URL;
  if (!destination) {
    return {
      statut: 'non-configure',
      message:
        'Le service de réception des demandes n’est pas encore raccordé. Vos informations n’ont donc pas été transmises : contactez directement le service des admissions le temps que le branchement soit effectué.',
    };
  }

  try {
    const reponse = await fetch(destination, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        type,
        origine: valeurs.origine ?? 'site-public',
        formation: valeurs.formation ?? null,
        recu: new Date().toISOString(),
        ...valeurs,
      }),
      cache: 'no-store',
    });

    if (!reponse.ok) throw new Error(`Réponse ${reponse.status}`);

    return {
      statut: 'succes',
      message:
        'Votre demande est bien enregistrée. Le service concerné vous répond sur le contact que vous avez indiqué.',
    };
  } catch {
    // Aucun détail technique ne remonte à l'utilisateur.
    return {
      statut: 'erreur',
      message:
        'La demande n’a pas pu être transmise. Réessayez dans un instant, ou joignez directement le service des admissions.',
    };
  }
}
