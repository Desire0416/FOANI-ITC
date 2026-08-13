import type { Metadata } from 'next';
import { PageTexte } from '@/components/layout/page-texte';

export const metadata: Metadata = {
  title: 'Politique relative aux traceurs',
  description:
    "Usage des cookies et traceurs sur le site de FOANI-ITC : ce qui est déposé, à quoi cela sert et comment refuser.",
  alternates: { canonical: '/traceurs' },
};

export default function PageTraceurs() {
  return (
    <PageTexte
      eyebrow="Traceurs"
      titre="Politique relative aux traceurs"
      lead="Ce qui est déposé sur votre appareil, pourquoi, et comment refuser aussi facilement qu'accepter."
      blocs={[
        {
          titre: 'Ce que ce site dépose aujourd’hui',
          corps: [
            'En l’état, le site public ne dépose aucun traceur publicitaire, aucun traceur de réseau social et aucun traceur tiers.',
            'Seuls des éléments strictement nécessaires au fonctionnement peuvent être utilisés — par exemple pour mémoriser un choix d’affichage. Ils ne servent ni à vous identifier, ni à vous suivre d’un site à l’autre.',
          ],
        },
        {
          titre: 'Mesure d’audience',
          corps: [
            'Un outil de mesure d’audience est prévu au cadrage du projet. Lorsqu’il sera installé, il sera configuré pour limiter la collecte au strict nécessaire, et sa présence sera mentionnée ici.',
            'Si la configuration retenue nécessite votre consentement, celui-ci vous sera demandé avant tout dépôt, et le refus sera aussi accessible que l’acceptation.',
          ],
        },
        {
          titre: 'Refuser',
          corps: [
            'Le refus des traceurs non essentiels n’altère en rien votre accès aux contenus du site, à la recherche, aux fiches de formation ou aux formulaires.',
            'Vous pouvez également configurer votre navigateur pour bloquer ou supprimer les cookies déjà déposés.',
          ],
        },
        {
          titre: 'Services externes',
          corps: [
            'Le portail de candidature, l’espace étudiant et la plateforme pédagogique sont des services distincts, accessibles depuis l’Espace numérique. Ils disposent de leur propre politique, présentée à la connexion.',
          ],
        },
      ]}
      note="Cette page sera mise à jour dès l’installation effective de l’outil de mesure d’audience, avec la liste nominative des traceurs déposés et leur durée de vie."
    />
  );
}
