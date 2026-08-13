'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Décompte d'un nombre à l'entrée dans le champ de vision.
 *
 * La valeur finale est rendue côté serveur et reste dans le DOM : si le
 * script ne s'exécute pas — réseau coupé en cours de chargement, navigateur
 * ancien —, le chiffre reste juste. L'animation est un supplément, jamais le
 * moyen d'afficher la donnée.
 */
export function CountUp({ value, suffix = '' }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [affiche, setAffiche] = useState(value);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let frame = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();

        const duree = 1100;
        const depart = performance.now();
        const tick = (maintenant: number) => {
          const progres = Math.min(1, (maintenant - depart) / duree);
          // Même courbe que le reste du site : sortie longue, arrivée douce.
          const eased = 1 - Math.pow(1 - progres, 3);
          setAffiche(Math.round(value * eased));
          if (progres < 1) frame = requestAnimationFrame(tick);
        };
        setAffiche(0);
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, [value]);

  return (
    <span ref={ref}>
      {affiche}
      {suffix}
    </span>
  );
}
