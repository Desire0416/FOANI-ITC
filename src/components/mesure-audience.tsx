'use client';

import Link from 'next/link';
import Script from 'next/script';
import { useState, useSyncExternalStore } from 'react';
import { IconClose } from '@/components/brand/icons';
import { TEMOIN_CONSENTEMENT, type Configuration } from '@/lib/audience';

/* ==========================================================================
   Mesure d'audience et consentement — CDC §19.1 et §20.2
   --------------------------------------------------------------------------
   Le bandeau n'apparaît que si l'outil retenu dépose effectivement un traceur.
   Quand il apparaît, « Refuser » est un bouton, de la même taille et au même
   endroit que « Accepter » — le §20.2 demande que le refus soit aussi
   accessible que l'acceptation, ce qui exclut le lien gris en petits
   caractères sous un gros bouton vert.

   Le choix est mémorisé dans un témoin d'un an, sans identifiant : il ne
   contient que « oui » ou « non ».
   ========================================================================== */

/** `inconnu` tant que le navigateur n'a pas repris la main sur le rendu. */
type Choix = 'inconnu' | 'oui' | 'non' | 'sans-reponse';

function lireChoix(): Choix {
  const trouve = document.cookie
    .split(';')
    .map((morceau) => morceau.trim())
    .find((morceau) => morceau.startsWith(`${TEMOIN_CONSENTEMENT}=`));
  const valeur = trouve?.split('=')[1];
  return valeur === 'oui' || valeur === 'non' ? valeur : 'sans-reponse';
}

function ecrireChoix(choix: 'oui' | 'non') {
  const unAn = 60 * 60 * 24 * 365;
  document.cookie = `${TEMOIN_CONSENTEMENT}=${choix}; path=/; max-age=${unAn}; SameSite=Lax`;
}

/* Le témoin ne notifie personne : l'abonnement est vide, et la valeur est
   relue à chaque rendu. C'est le motif prévu par React pour lire une donnée
   qui n'existe que dans le navigateur, sans écrire d'état dans un effet. */
const SANS_ABONNEMENT = () => () => {};
const AVANT_HYDRATATION = (): Choix => 'inconnu';

export function MesureAudience({ configuration }: { configuration: Configuration }) {
  const enregistre = useSyncExternalStore(SANS_ABONNEMENT, lireChoix, AVANT_HYDRATATION);
  const [repondu, setRepondu] = useState<'oui' | 'non' | null>(null);
  const choix: Choix = repondu ?? enregistre;

  const setChoix = (valeur: 'oui' | 'non') => {
    ecrireChoix(valeur);
    setRepondu(valeur);
  };

  if (configuration.outil === 'aucun') return null;

  // Outil sans traceur : rien n'est déposé, la mesure démarre tout de suite.
  if (!configuration.avecTraceur) {
    return (
      <Script
        src={configuration.script!}
        data-domain={configuration.site!}
        data-website-id={configuration.site!}
        strategy="afterInteractive"
        defer
      />
    );
  }

  // Le bandeau ne s'affiche qu'une fois le témoin lu, pour éviter qu'il
  // apparaisse puis disparaisse chez un visiteur qui a déjà répondu.
  if (choix === 'inconnu') return null;

  if (choix === 'oui') {
    return (
      <Script
        src={configuration.script!}
        data-website-id={configuration.site!}
        strategy="afterInteractive"
        defer
      />
    );
  }

  if (choix === 'non') return null;

  return (
    <div
      role="dialog"
      aria-labelledby="traceurs-titre"
      aria-describedby="traceurs-texte"
      className="fixed inset-x-3 bottom-3 z-50 rounded-card-lg border border-graphite-200 bg-paper p-5 shadow-float sm:inset-x-auto sm:right-5 sm:bottom-5 sm:max-w-md sm:p-6"
    >
      <p id="traceurs-titre" className="font-display text-[1.125rem] leading-snug text-ink-800">
        Mesurer la fréquentation du site
      </p>
      <p id="traceurs-texte" className="mt-2 text-[0.875rem] leading-relaxed text-graphite-600">
        Nous aimerions savoir quelles pages sont consultées, pour améliorer le site. Cela suppose de
        déposer un traceur sur votre appareil. Vous pouvez refuser&nbsp;: rien ne change pour vous.
      </p>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setChoix('oui')}
          className="inline-flex h-11 flex-1 items-center justify-center rounded-pill bg-ink-800 px-5 text-[0.875rem] font-semibold text-paper transition-colors hover:bg-ink-700"
        >
          Accepter
        </button>
        {/* Même taille, même place, même poids visuel que « Accepter » : le
            refus doit être aussi facile que l'acceptation (§20.2). */}
        <button
          type="button"
          onClick={() => setChoix('non')}
          className="inline-flex h-11 flex-1 items-center justify-center rounded-pill border border-graphite-300 px-5 text-[0.875rem] font-semibold text-ink-800 transition-colors hover:border-ink-300 hover:bg-ink-50"
        >
          Refuser
        </button>
      </div>

      <p className="mt-4 text-[0.75rem] text-graphite-500">
        <Link href="/traceurs" className="link-underline">
          En savoir plus sur les traceurs
        </Link>
      </p>

      <button
        type="button"
        aria-label="Fermer sans choisir"
        onClick={() => setChoix('non')}
        className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-pill text-graphite-500 transition-colors hover:bg-ink-50 hover:text-ink-700"
      >
        <IconClose className="h-4 w-4" />
      </button>
    </div>
  );
}
