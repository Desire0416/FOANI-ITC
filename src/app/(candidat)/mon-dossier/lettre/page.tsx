import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getPayload } from 'payload';
import config from '@payload-config';
import { DocumentOfficiel, Mentions, Paragraphe } from '@/components/candidat/document-officiel';
import { CYCLE_LABELS, getFormation, titreComplet } from '@/content/formations';
import { ETABLISSEMENT } from '@/content/site';
import { exigerDossier } from '@/lib/candidat';
import { formatDate } from '@/lib/etats';
import { delivrer } from '@/payload/documents';

export const metadata: Metadata = { title: 'Ma lettre d’admission' };

/* ==========================================================================
   Étape 1 du parcours d'inscription — Note complémentaire §5.1
   --------------------------------------------------------------------------
   « Dans son espace, il télécharge sa lettre d'admission, document numéroté à
   en-tête de l'établissement, portant un code de vérification et mentionnant
   la formation, le niveau, le montant réservant la place, la date limite
   d'acceptation et les conditions d'inscription. »

   Une remarque sur le montant. L'établissement n'a communiqué aucun tarif :
   `fraisXof` vaut `null` pour toutes les formations. Une lettre d'admission
   est un document qui engage ; y porter un montant inventé serait la faute la
   plus grave que ce dispositif puisse commettre. Le document dit donc ce qui
   est vrai — que le montant est communiqué par le service des finances — et
   portera le chiffre le jour où la grille tarifaire du chapitre 6 existera.

   La lettre est délivrée à la première ouverture, et jamais renumérotée
   ensuite : c'est `delivrer()` qui en répond.
   ========================================================================== */

function nommerFormation(slug: string | null | undefined): {
  intitule: string | null;
  niveau: string | null;
} {
  if (!slug) return { intitule: null, niveau: null };
  const formation = getFormation(slug);
  if (!formation) return { intitule: null, niveau: null };
  return { intitule: titreComplet(formation), niveau: CYCLE_LABELS[formation.cycle] ?? null };
}

export default async function LettreAdmission() {
  const { dossier } = await exigerDossier();

  /* La lettre n'existe que si l'admission a été prononcée. Un candidat encore
     en instruction qui devinerait l'adresse ne doit pas s'en fabriquer une. */
  if (dossier.etat !== 'admis' && dossier.etat !== 'admis-condition') {
    const dejaAdmis = [
      'offre-acceptee',
      'versement-annonce',
      'place-reservee',
      'inscription-a-valider',
      'inscrit',
      'acces-ouverts',
    ].includes(dossier.etat);
    if (!dejaAdmis) redirect('/mon-dossier/suivi');
  }

  const { intitule, niveau } = nommerFormation(dossier.voeu1);
  const titulaire = [dossier.nom, dossier.prenoms].filter(Boolean).join(' ').trim() || 'Le candidat';

  const payload = await getPayload({ config });
  const lettre = await delivrer(payload, {
    nature: 'lettre-admission',
    candidature: dossier.id,
    personne:
      typeof dossier.personne === 'object' && dossier.personne
        ? (dossier.personne as { id: string | number }).id
        : (dossier.personne ?? null),
    donnees: {
      titulaire,
      formation: intitule,
      niveau,
      mentions: {
        dossier: dossier.reference ?? null,
        limiteAcceptation: dossier.limiteAcceptation ?? null,
        conditions: dossier.decisionConditions ?? null,
      },
    },
  });

  /* À partir d'ici, on ne lit plus le dossier : on lit ce que la lettre a
     figé le jour où elle a été remise. Une date limite prolongée après coup ne
     doit pas réécrire un document déjà entre les mains du candidat. */
  const porte = lettre.donnees;
  const mentions = porte.mentions ?? {};
  const conditions = mentions.conditions ?? null;
  const limite = mentions.limiteAcceptation ?? null;
  const sousCondition = Boolean(conditions);
  const rentree = new Date(ETABLISSEMENT.rentree).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <DocumentOfficiel
      titre="Lettre d’admission"
      numero={lettre.numero}
      code={lettre.code}
      delivreLe={lettre.delivreLe}
      retour="/mon-dossier/suivi"
    >
      <Paragraphe>
        <strong>{porte.titulaire}</strong>,
      </Paragraphe>

      <Paragraphe>
        J’ai le plaisir de vous informer que votre candidature a été retenue. Vous êtes admis
        {sousCondition ? ', sous réserve des conditions précisées ci-dessous,' : ''} à{' '}
        {ETABLISSEMENT.nom}, pour la formation suivante.
      </Paragraphe>

      <Mentions
        lignes={[
          { cle: 'Numéro de dossier', valeur: mentions.dossier ?? '—' },
          { cle: 'Formation', valeur: porte.formation ?? 'Formation non renseignée' },
          { cle: 'Niveau', valeur: porte.niveau ?? '—' },
          { cle: 'Année universitaire', valeur: String(dossier.anneeEntree ?? '—') },
          { cle: 'Rentrée', valeur: rentree },
          { cle: 'Date limite d’acceptation', valeur: limite ? formatDate(limite) : '—' },
          {
            cle: 'Montant réservant la place',
            valeur: 'Communiqué par le service des finances',
          },
        ]}
      />

      {conditions ? (
        <>
          <Paragraphe>
            <strong>Conditions posées à votre admission</strong>
          </Paragraphe>
          <Paragraphe>{conditions}</Paragraphe>
        </>
      ) : null}

      <Paragraphe>
        <strong>Ce qu’il vous reste à faire.</strong> Votre place n’est pas encore réservée. Pour la
        retenir, connectez-vous à votre espace et acceptez cette offre avant le{' '}
        {limite ? formatDate(limite) : 'terme indiqué'} :
        l’acceptation est confirmée par un code reçu sur votre téléphone. Vous réglerez ensuite les
        frais réservant votre place, en utilisant la référence de règlement affichée dans votre
        espace. Passé ce délai sans réponse de votre part, votre place sera proposée à un autre
        candidat.
      </Paragraphe>

      <Paragraphe>
        L’ensemble de votre inscription se fait à distance. Votre premier déplacement à{' '}
        {ETABLISSEMENT.ville} sera celui de la rentrée.
      </Paragraphe>

      <Paragraphe>Recevez, {porte.titulaire}, nos salutations les meilleures.</Paragraphe>
    </DocumentOfficiel>
  );
}
