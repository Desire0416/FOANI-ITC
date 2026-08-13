/**
 * Amorce de la révélation au défilement, injectée en ligne dans le document.
 *
 * Ce script ne fait qu'une chose : poser `data-motion="on"` sur la racine,
 * avant la première peinture. La règle CSS qui masque les éléments `.reveal`
 * n'existe que sous cet attribut — donc sans JavaScript, ou avec un lot de
 * scripts qui n'arrive jamais sur un réseau dégradé, la page reste
 * entièrement lisible. Le mouvement est un supplément, jamais la condition de
 * la lecture (CDC §18.2).
 *
 * L'observation elle-même est confiée à `RevealProvider`, après hydratation :
 * un script qui modifierait les éléments rendus par le serveur avant que React
 * ne les reprenne provoquerait un décalage d'hydratation.
 *
 * Le garde-fou est ici, et non dans le composant : si React n'arrive jamais —
 * lot de scripts perdu, navigateur ancien —, l'attribut est retiré au bout de
 * trois secondes et tout s'affiche. `RevealProvider` annule ce minuteur en
 * prenant la main.
 */
export const REVEAL_SCRIPT = `
(function () {
  var racine = document.documentElement;
  try {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!('IntersectionObserver' in window)) return;
  } catch (e) { return; }

  racine.setAttribute('data-motion', 'on');

  window.__fitcLibererMouvement = setTimeout(function () {
    racine.removeAttribute('data-motion');
  }, 3000);
})();
`.trim();
