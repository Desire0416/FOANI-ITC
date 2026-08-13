'use client';

import { useEffect } from 'react';

/**
 * Un unique IntersectionObserver pour tout le document.
 *
 * Il prend le relais de l'amorce en ligne (`src/lib/reveal-script.ts`) une fois
 * l'hydratation faite — c'est-à-dire au moment où React a repris la main sur le
 * balisage rendu par le serveur. Marquer les éléments plus tôt provoquerait un
 * décalage d'hydratation.
 *
 * Le composant ne rend aucun balisage : les éléments à révéler portent
 * simplement la classe `.reveal`, y compris ceux rendus côté serveur. Un
 * MutationObserver reprend ceux qui sont injectés après coup — filtres du
 * catalogue, résultats de recherche — sans qu'aucun composant n'ait à s'en
 * préoccuper.
 */
export function RevealProvider() {
  useEffect(() => {
    // L'amorce a armé un minuteur de secours ; nous prenons la main.
    const minuteur = (window as { __fitcLibererMouvement?: number }).__fitcLibererMouvement;
    if (minuteur) window.clearTimeout(minuteur);

    if (document.documentElement.getAttribute('data-motion') !== 'on') return;

    const observateur = new IntersectionObserver(
      (entrees) => {
        for (const entree of entrees) {
          if (!entree.isIntersecting) continue;
          const element = entree.target as HTMLElement;
          element.dataset.shown = 'true';
          observateur.unobserve(element);
        }
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.08 },
    );

    const enregistrer = () => {
      document.querySelectorAll<HTMLElement>('.reveal:not([data-shown])').forEach((element) => {
        observateur.observe(element);
      });
    };

    enregistrer();

    const mutations = new MutationObserver(enregistrer);
    mutations.observe(document.body, { childList: true, subtree: true });

    return () => {
      observateur.disconnect();
      mutations.disconnect();
    };
  }, []);

  return null;
}
