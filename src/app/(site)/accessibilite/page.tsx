import type { Metadata } from 'next';
import { PageTexte } from '@/components/layout/page-texte';

export const metadata: Metadata = {
  title: 'Accessibilité',
  description:
    "Engagement d'accessibilité du site de FOANI-ITC : objectif WCAG 2.2 niveau AA, dispositions retenues et moyen de signaler une difficulté.",
  alternates: { canonical: '/accessibilite' },
};

export default function PageAccessibilite() {
  return (
    <PageTexte
      eyebrow="Accessibilité"
      titre="Déclaration d’accessibilité"
      lead="L'objectif retenu est la conformité WCAG 2.2 niveau AA sur les parcours publics essentiels."
      blocs={[
        {
          titre: 'Ce qui est mis en œuvre',
          corps: [
            'Contraste vérifié entre le texte et son arrière-plan sur l’ensemble des écrans. Le bouton d’action principal porte du texte bleu sur fond ambre, et non du blanc, précisément pour cette raison.',
            'Navigation au clavier possible sur l’ensemble des parcours, avec un focus visible, un ordre de tabulation logique et un lien d’évitement vers le contenu principal.',
            'Description alternative sur les images porteuses d’information, et emplacements photographiques annoncés explicitement lorsqu’un visuel reste à fournir.',
            'Formulaires dotés d’étiquettes explicites, de messages d’erreur compréhensibles rattachés au champ concerné, et de retours annoncés aux lecteurs d’écran.',
            'Aucune information transmise par la seule couleur : un état est toujours doublé d’un libellé ou d’une forme.',
            'Cibles tactiles dimensionnées pour un usage sur téléphone.',
            'Animations réduites ou désactivées lorsque le système de la personne le demande — l’ensemble des mouvements du site respecte ce réglage.',
          ],
        },
        {
          titre: 'Ce qui reste à vérifier',
          corps: [
            'Une recette d’accessibilité complète sur les gabarits et parcours critiques est prévue avant la mise en service, conformément au cadrage du projet.',
            'Les contenus tiers intégrés ultérieurement — plan d’accès, vidéos, outils de mesure — feront l’objet d’un contrôle spécifique. Les vidéos institutionnelles porteuses d’information seront sous-titrées ou accompagnées d’une transcription.',
          ],
        },
        {
          titre: 'Signaler une difficulté',
          corps: [
            'Si une page vous est inaccessible, signalez-la par le formulaire de la page Contact en indiquant l’adresse concernée et la nature du blocage.',
            'Chaque signalement est traité, et une réponse vous est apportée, y compris lorsque la correction demande du temps.',
          ],
        },
      ]}
    />
  );
}
