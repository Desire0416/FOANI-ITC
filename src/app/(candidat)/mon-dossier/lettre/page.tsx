import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getPayload } from 'payload';
import config from '@payload-config';
import {
  DocumentOfficiel,
  Intertitre,
  Mentions,
  Modalites,
  Paragraphe,
} from '@/components/candidat/document-officiel';
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

   Deux remarques sur ce que la lettre ne dit pas.

   Le montant. L'établissement n'a communiqué aucun tarif : `fraisXof` vaut
   `null` pour toutes les formations. Une lettre d'admission est un document
   qui engage ; y porter un montant inventé serait la faute la plus grave que
   ce dispositif puisse commettre. Le document dit donc ce qui est vrai — que
   le montant est communiqué par le service des finances — et portera le
   chiffre le jour où la grille tarifaire du chapitre 6 existera.

   La civilité. Le dossier de candidature ne la recueille pas ; c'est l'étape 4
   du même chapitre qui recueillera « l'état civil complet ». La lettre s'ouvre
   donc sur le nom du destinataire plutôt que sur un « Monsieur » ou un
   « Madame » qu'il faudrait deviner. Deviner le genre de quelqu'un d'après son
   prénom, dans un acte qu'il présentera à une banque, n'est pas une option.

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
    if (!dejaAdmis) redirect('/mon-dossier');
  }

  const { intitule, niveau } = nommerFormation(dossier.voeu1);
  const titulaire = [dossier.nom?.toUpperCase(), dossier.prenoms].filter(Boolean).join(' ').trim();

  const payload = await getPayload({ config });
  const lettre = await delivrer(payload, {
    nature: 'lettre-admission',
    candidature: dossier.id,
    personne:
      typeof dossier.personne === 'object' && dossier.personne
        ? (dossier.personne as { id: string | number }).id
        : (dossier.personne ?? null),
    donnees: {
      titulaire: titulaire || 'Le candidat',
      formation: intitule,
      niveau,
      mentions: {
        dossier: dossier.reference ?? null,
        anneeEntree: dossier.anneeEntree ? String(dossier.anneeEntree) : null,
        limiteAcceptation: dossier.limiteAcceptation ?? null,
        conditions: dossier.decisionConditions ?? null,
      },
    },
  });

  /* À partir d'ici, on ne lit plus le dossier : on lit ce que la lettre a figé
     le jour où elle a été remise. Une date limite prolongée après coup ne doit
     pas réécrire un document déjà entre les mains du candidat. */
  const porte = lettre.donnees;
  const mentions = porte.mentions ?? {};
  const conditions = mentions.conditions ?? null;
  const limite = mentions.limiteAcceptation ?? null;

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
      destinataire={porte.titulaire}
      retour="/mon-dossier/documents"
    >
      <Paragraphe>
        Nous avons le plaisir de vous informer qu’après examen de votre candidature, votre admission
        à {ETABLISSEMENT.nom} a été prononcée
        {conditions ? ', sous réserve des conditions précisées ci-après,' : ''} pour la formation
        indiquée ci-dessous.
      </Paragraphe>

      <Mentions
        lignes={[
          { cle: 'Numéro de dossier', valeur: mentions.dossier ?? '—' },
          { cle: 'Formation', valeur: porte.formation ?? 'Formation non renseignée' },
          { cle: 'Niveau', valeur: porte.niveau ?? '—' },
          { cle: 'Année universitaire', valeur: mentions.anneeEntree ?? '—' },
          { cle: 'Rentrée', valeur: rentree },
          {
            cle: 'Date limite d’acceptation',
            valeur: limite ? formatDate(limite) : 'Communiquée par le service des admissions',
          },
          { cle: 'Montant réservant la place', valeur: 'Communiqué par le service des finances' },
        ]}
      />

      {conditions ? (
        <>
          <Intertitre>Conditions posées à l’admission</Intertitre>
          <Paragraphe>{conditions}</Paragraphe>
        </>
      ) : null}

      <Intertitre>Modalités de confirmation de l’admission</Intertitre>
      <Modalites
        etapes={[
          'Connectez-vous à votre espace candidat et acceptez l’offre d’admission dans le délai qui y est indiqué.',
          'L’acceptation est confirmée au moyen du code à usage unique reçu sur votre téléphone.',
          'Réglez ensuite les frais réservant votre place, en utilisant la référence de règlement affichée dans votre espace.',
        ]}
      />

      <Paragraphe>
        Passé le délai prévu sans confirmation de votre part, la place pourra être proposée à un
        autre candidat. L’ensemble de la procédure d’inscription se déroule à distance&nbsp;; votre
        premier déplacement à {ETABLISSEMENT.ville} interviendra pour la rentrée.
      </Paragraphe>

      <Paragraphe>
        Nous vous prions d’agréer, {porte.titulaire}, l’expression de nos salutations distinguées.
      </Paragraphe>
    </DocumentOfficiel>
  );
}
