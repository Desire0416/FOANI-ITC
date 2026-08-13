import type { Metadata } from 'next';
import { Hero } from '@/components/sections/hero';
import { Chiffres } from '@/components/sections/chiffres';
import {
  Actualites,
  Campus,
  Carrieres,
  FormationsPhares,
  MotDirection,
  Portes,
  Pourquoi,
  RechercheGlobale,
  Ressources,
} from '@/components/sections/home-sections';
import { ETABLISSEMENT } from '@/content/site';

export const metadata: Metadata = {
  title: `${ETABLISSEMENT.nom} — ${ETABLISSEMENT.positionnement}`,
  description:
    "FOANI-ITC forme une nouvelle génération de leaders agricoles à Agnibilékrou : BTS, Licence, certificats et masterclass en production animale, végétale, agroalimentaire et agribusiness. Candidature en ligne, rentrée le 5 octobre 2026.",
  alternates: { canonical: '/' },
};

/**
 * Ordre de la page : celui du CDC §8.9.
 *
 * Un seul outil d'orientation sur la page, et il est dans « Nos formations ».
 * Le moteur par situation qui occupait la troisième place faisait double
 * emploi avec le catalogue à trois niveaux ; il reste disponible sur la page
 * Formations, où il vient après le catalogue plutôt qu'en concurrence.
 * Le seul composant client de l'accueil est donc ce catalogue, qui reçoit un
 * index réduit — six champs par formation — plutôt que le contenu complet.
 */
export default function Accueil() {
  return (
    <>
      <Hero />
      <Chiffres />
      <MotDirection />
      <Pourquoi />
      <Portes />
      <FormationsPhares />
      <Carrieres />
      <Campus />
      <Ressources />
      <Actualites />
      <RechercheGlobale />
    </>
  );
}
