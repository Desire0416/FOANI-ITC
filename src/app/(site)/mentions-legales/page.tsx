import type { Metadata } from 'next';
import { PageTexte } from '@/components/layout/page-texte';
import { ETABLISSEMENT } from '@/content/site';

export const metadata: Metadata = {
  title: 'Mentions légales',
  description: `Mentions légales du site de ${ETABLISSEMENT.nom}.`,
  alternates: { canonical: '/mentions-legales' },
};

export default function PageMentions() {
  return (
    <PageTexte
      eyebrow="Informations légales"
      titre="Mentions légales"
      lead="Identification de l'éditeur, de l'hébergeur et conditions d'utilisation du présent site."
      blocs={[
        {
          titre: 'Éditeur du site',
          corps: [
            `${ETABLISSEMENT.nom} (${ETABLISSEMENT.sigle}), établissement d'enseignement supérieur privé implanté à ${ETABLISSEMENT.ville}, ${ETABLISSEMENT.pays}.`,
            'Forme juridique, numéro d’immatriculation, capital, siège social et nom du directeur de la publication : à compléter par l’établissement avant mise en ligne.',
          ],
        },
        {
          titre: 'Hébergement',
          corps: [
            'Nom, raison sociale, adresse et coordonnées de l’hébergeur : à compléter avant mise en ligne.',
            'Conformément aux décisions de cadrage du projet, tous les comptes d’hébergement et de services sont ouverts au nom de l’établissement.',
          ],
        },
        {
          titre: 'Propriété intellectuelle',
          corps: [
            'L’ensemble des contenus de ce site — textes, éléments graphiques, logo, photographies et documents téléchargeables — est la propriété de l’établissement ou fait l’objet d’une autorisation d’usage.',
            'Toute reproduction, représentation ou diffusion, totale ou partielle, sans autorisation écrite préalable est interdite, à l’exception des ressources expressément mises à disposition dans l’espace presse et dans le respect des conditions qui y figurent.',
          ],
        },
        {
          titre: 'Exactitude des informations',
          corps: [
            'L’établissement s’attache à publier des informations exactes et à jour. Certaines données — grilles tarifaires, calendriers, capacités d’accueil — sont susceptibles d’évoluer et sont explicitement signalées lorsqu’elles ne sont pas encore arrêtées.',
            'Aucune information publiée sur ce site ne se substitue aux documents officiels remis par les services de l’établissement.',
          ],
        },
        {
          titre: 'Liens',
          corps: [
            'Le site peut renvoyer vers des services numériques de l’établissement ou vers des sites tiers. L’établissement n’exerce aucun contrôle sur le contenu des sites tiers et décline toute responsabilité à leur égard.',
          ],
        },
        {
          titre: 'Signalement',
          corps: [
            'Pour signaler une erreur, une information obsolète ou un contenu litigieux, utilisez le formulaire de la page Contact. Chaque signalement est examiné.',
          ],
        },
      ]}
      note="Cette page est un cadre conforme aux obligations habituelles. Les mentions d’identification et d’hébergement doivent être complétées par l’établissement avant la mise en ligne publique du site."
    />
  );
}
