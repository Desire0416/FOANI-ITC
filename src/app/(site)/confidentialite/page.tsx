import type { Metadata } from 'next';
import { PageTexte } from '@/components/layout/page-texte';
import { ETABLISSEMENT } from '@/content/site';

export const metadata: Metadata = {
  title: 'Politique de confidentialité',
  description: `Traitement des données personnelles par ${ETABLISSEMENT.nom} : finalités, durées de conservation et droits des personnes.`,
  alternates: { canonical: '/confidentialite' },
};

export default function PageConfidentialite() {
  return (
    <PageTexte
      eyebrow="Protection des données"
      titre="Politique de confidentialité"
      lead="Ce que l'établissement collecte, pourquoi, pendant combien de temps, et ce que vous pouvez exiger."
      blocs={[
        {
          titre: 'Ce que ce site collecte',
          corps: [
            'Le site public ne demande que ce qui est nécessaire pour vous répondre : votre nom, un moyen de contact — numéro de téléphone ou adresse électronique —, éventuellement le nom de votre organisation, et le contenu de votre demande.',
            'Aucune pièce d’identité, aucun document scolaire et aucune donnée financière ne transitent par ce site. Ces éléments relèvent du portail de candidature et de l’espace de scolarité, qui sont des systèmes distincts, soumis à authentification.',
          ],
        },
        {
          titre: 'Pourquoi',
          corps: [
            'Répondre à votre demande d’information, vous adresser une brochure, vous rappeler, instruire une demande de devis ou traiter une proposition de partenariat.',
            'Ces informations ne sont utilisées à aucune autre fin. Elles ne sont ni vendues, ni cédées, ni transmises à un tiers à des fins commerciales.',
          ],
        },
        {
          titre: 'Consentement',
          corps: [
            'Chaque formulaire recueille votre accord explicite avant l’envoi. Aucune case n’est cochée d’avance. Vous pouvez retirer cet accord à tout moment en écrivant à l’établissement.',
          ],
        },
        {
          titre: 'Durées de conservation',
          corps: [
            'Une politique de durées de conservation par catégorie — prospects, candidatures non retenues, étudiants, anciens étudiants, pièces justificatives, journaux techniques et documents financiers — est définie par l’établissement avant la mise en service du dispositif complet.',
            'Les durées applicables seront publiées ici et communiquées sur demande.',
          ],
        },
        {
          titre: 'Qui accède à vos données',
          corps: [
            'L’accès est attribué par rôle, jamais par personne, et selon le principe de moindre privilège : chaque agent reçoit exactement les droits nécessaires à sa fonction.',
            'L’accès aux pièces d’identité déposées par les candidats est restreint aux seuls rôles Admission et Scolarité, et chaque consultation est journalisée.',
          ],
        },
        {
          titre: 'Vos droits',
          corps: [
            'Vous pouvez demander l’accès à vos données, leur rectification, leur limitation, vous opposer à leur traitement, ou en demander la suppression lorsque la réglementation et les obligations de conservation le permettent.',
            'Ces demandes s’exercent par le formulaire de la page Contact. L’établissement y répond dans les délais prévus par la réglementation ivoirienne relative à la protection des données à caractère personnel.',
          ],
        },
        {
          titre: 'Candidats mineurs',
          corps: [
            'Certains candidats peuvent être mineurs. Les données les concernant font l’objet des mêmes garanties, et l’accord d’un représentant légal est requis lorsque la réglementation l’exige.',
          ],
        },
        {
          titre: 'Droit à l’image',
          corps: [
            'Les photographies et témoignages d’étudiants ne sont publiés qu’avec l’accord écrit des personnes concernées. Toute demande de retrait est traitée sans condition et sans délai déraisonnable.',
          ],
        },
        {
          titre: 'Sécurité',
          corps: [
            'Les documents sensibles sont conservés sur un espace de stockage protégé, distinct du serveur du site, et ne sont jamais accessibles par une adresse publique.',
            'Le responsable du traitement et ses coordonnées seront précisés ici avant la mise en ligne publique.',
          ],
        },
      ]}
      note="Ce document décrit la politique retenue dans le cadrage du projet. Il doit être complété par l’identité du responsable de traitement et les durées de conservation arrêtées, avant mise en ligne publique."
    />
  );
}
