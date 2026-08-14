'use client';

import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { IconCheck, IconInfo } from '@/components/brand/icons';
import { deposerPhoto, retirerPhoto, type Etat } from '@/app/(candidat)/mon-dossier/(coque)/inscription/actions';
import { cn } from '@/lib/utils';

/* ==========================================================================
   La photographie d'identité — Note complémentaire §5.1, étape 4
   --------------------------------------------------------------------------
   « Il dépose sa photographie d'identité, prise selon un cadrage guidé et
   contrôlée automatiquement. »

   CE QUE LE CONTRÔLE FAIT, ET CE QU'IL NE FAIT PAS. Il porte sur l'image :
   définition, netteté, exposition, uniformité du fond, proportions. Il ne
   porte PAS sur le visage. Aucune détection, aucun gabarit facial, aucune
   comparaison à une base — un tel traitement serait biométrique, et la loi
   ivoirienne le soumet à autorisation préalable de l'autorité de protection.
   La distinction n'est pas rhétorique : elle sépare un contrôle qualité, que
   l'établissement peut mettre en œuvre aujourd'hui, d'un traitement qu'il ne
   peut pas engager sans démarche préalable.

   Le contrôle visuel du visage revient donc à la scolarité, à l'étape 5, comme
   la note le prévoit — « le service Scolarité procède au contrôle visuel ».

   LE CADRAGE. Le recadrage est fait ici, dans le navigateur, au format
   35 × 45 — celui du passeport et de la carte nationale d'identité ivoiriens.
   Le repère ovale montre où placer le visage. Recadrer avant l'envoi vaut
   mieux que refuser après : sur un réseau lent, un refus coûte une image
   entière montée pour rien.

   LES SEUILS. Ce sont des choix d'ingénierie, non une norme ivoirienne : il
   n'existe pas de spécification photographique publiée pour la carte
   d'étudiant. Ils sont donc posés larges, et chaque refus dit ce qu'il refuse.
   ========================================================================== */

/** 35 × 45 mm — format des titres d'identité ivoiriens. */
const RATIO = 35 / 45;
const LARGEUR_CIBLE = 600;
const HAUTEUR_CIBLE = Math.round(LARGEUR_CIBLE / RATIO);

/** En deçà, l'agrandissement au format carte pixelliserait. */
const DEFINITION_MINIMALE = 480;

type Verdict = { readonly ok: boolean; readonly motif?: string };

/**
 * Contrôle de l'image, et d'elle seule.
 *
 * La netteté est mesurée par la variance d'un laplacien discret : une image
 * floue a peu de variations locales d'intensité. L'uniformité du fond est
 * mesurée sur une bande périphérique, là où le fond se trouve quel que soit le
 * cadrage. Ni l'une ni l'autre ne regarde le visage.
 */
function controler(toile: HTMLCanvasElement): Verdict {
  const contexte = toile.getContext('2d', { willReadFrequently: true });
  if (!contexte) return { ok: true };

  const { width: l, height: h } = toile;
  const donnees = contexte.getImageData(0, 0, l, h).data;

  const gris = new Float32Array(l * h);
  let somme = 0;
  for (let rang = 0; rang < l * h; rang += 1) {
    const base = rang * 4;
    const valeur =
      0.299 * (donnees[base] ?? 0) + 0.587 * (donnees[base + 1] ?? 0) + 0.114 * (donnees[base + 2] ?? 0);
    gris[rang] = valeur;
    somme += valeur;
  }
  const moyenne = somme / (l * h);

  if (moyenne < 45) {
    return { ok: false, motif: 'La photographie est trop sombre. Placez-vous face à la lumière.' };
  }
  if (moyenne > 225) {
    return { ok: false, motif: 'La photographie est surexposée. Éloignez-vous de la source de lumière.' };
  }

  // Netteté — variance du laplacien, échantillonnée pour rester rapide.
  let sommeLap = 0;
  let sommeLapCarre = 0;
  let compte = 0;
  for (let y = 1; y < h - 1; y += 2) {
    for (let x = 1; x < l - 1; x += 2) {
      const rang = y * l + x;
      const lap =
        4 * (gris[rang] ?? 0) -
        (gris[rang - 1] ?? 0) -
        (gris[rang + 1] ?? 0) -
        (gris[rang - l] ?? 0) -
        (gris[rang + l] ?? 0);
      sommeLap += lap;
      sommeLapCarre += lap * lap;
      compte += 1;
    }
  }
  const variance = sommeLapCarre / compte - (sommeLap / compte) ** 2;
  if (variance < 45) {
    return { ok: false, motif: 'La photographie est floue. Tenez l’appareil bien stable et reprenez.' };
  }

  /* Fond : bande de 8 % sur les bords gauche, droit et haut — le bas porte
     souvent les épaules. Un fond uni donne un écart-type faible. */
  const marge = Math.max(2, Math.round(l * 0.08));
  let sommeFond = 0;
  let sommeFondCarre = 0;
  let compteFond = 0;
  for (let y = 0; y < Math.round(h * 0.6); y += 2) {
    for (let x = 0; x < l; x += 2) {
      const bord = x < marge || x >= l - marge || y < marge;
      if (!bord) continue;
      const valeur = gris[y * l + x] ?? 0;
      sommeFond += valeur;
      sommeFondCarre += valeur * valeur;
      compteFond += 1;
    }
  }
  if (compteFond > 0) {
    const moyenneFond = sommeFond / compteFond;
    const ecart = Math.sqrt(Math.max(0, sommeFondCarre / compteFond - moyenneFond ** 2));
    if (ecart > 62) {
      return {
        ok: false,
        motif:
          'Le fond est trop chargé. Placez-vous devant un mur uni et clair, sans meuble ni motif derrière vous.',
      };
    }
    if (moyenneFond < 70) {
      return {
        ok: false,
        motif: 'Le fond est trop sombre. Un mur clair, blanc ou gris, convient le mieux.',
      };
    }
  }

  return { ok: true };
}

/** Recadre au format d'identité, centré, et rend un JPEG. */
async function recadrer(fichier: File): Promise<{ fichier: File; apercu: string } | Verdict> {
  const image = await createImageBitmap(fichier);

  /* Relevées avant toute libération : un `ImageBitmap` fermé rend des
     dimensions nulles, et le message d'erreur annoncerait « 0 × 0 ». */
  const { width: source, height: haut } = image;

  if (Math.min(source, haut) < DEFINITION_MINIMALE) {
    image.close();
    return {
      ok: false,
      motif: `Cette image est trop petite (${source} × ${haut} pixels). Reprenez-la avec l’appareil photo plutôt qu’une capture d’écran.`,
    };
  }

  /* Fenêtre au format 35 × 45 la plus grande possible dans l'image, centrée
     horizontalement et remontée d'un dixième : sur un portrait tenu à bout de
     bras, la tête est au-dessus du centre géométrique. */
  const ratioImage = source / haut;
  let largeur = source;
  let hauteur = haut;
  if (ratioImage > RATIO) largeur = Math.round(haut * RATIO);
  else hauteur = Math.round(source / RATIO);

  const x = Math.round((source - largeur) / 2);
  const y = Math.max(0, Math.round((haut - hauteur) / 2 - hauteur * 0.06));

  const toile = document.createElement('canvas');
  toile.width = LARGEUR_CIBLE;
  toile.height = HAUTEUR_CIBLE;
  const contexte = toile.getContext('2d');
  if (!contexte) {
    image.close();
    return { ok: false, motif: 'Votre navigateur n’a pas pu préparer l’image. Réessayez.' };
  }
  contexte.drawImage(image, x, y, largeur, hauteur, 0, 0, LARGEUR_CIBLE, HAUTEUR_CIBLE);
  image.close();

  const verdict = controler(toile);
  if (!verdict.ok) return verdict;

  const blob = await new Promise<Blob | null>((resoudre) =>
    toile.toBlob(resoudre, 'image/jpeg', 0.9),
  );
  if (!blob) return { ok: false, motif: 'L’image n’a pas pu être préparée. Réessayez.' };

  return {
    fichier: new File([blob], 'photographie-identite.jpg', {
      type: 'image/jpeg',
      lastModified: Date.now(),
    }),
    apercu: toile.toDataURL('image/jpeg', 0.8),
  };
}

/* -------------------------------------------------------------------------- */

const REGLES = [
  'De face, tête droite, expression neutre et bouche fermée.',
  'Devant un mur uni et clair, sans motif ni ombre portée.',
  'Visage entièrement dégagé, du menton à la naissance des cheveux.',
  'Sans lunettes de soleil, sans casquette ni chapeau.',
  'Une photographie du jour : ni capture d’écran, ni photo d’une photo.',
];

export function PhotoIdentite({ deja }: { deja: string | null }) {
  const router = useRouter();
  const champ = useRef<HTMLInputElement>(null);
  const [apercu, setApercu] = useState<string | null>(null);
  const [pret, setPret] = useState<File | null>(null);
  const [consent, setConsent] = useState(false);
  const [message, setMessage] = useState<Etat | null>(null);
  const [prepare, setPrepare] = useState(false);
  const [envoi, demarrer] = useTransition();

  async function accepter(fichiers: FileList | null) {
    const brut = fichiers?.[0];
    if (!brut) return;

    if (!brut.type.startsWith('image/')) {
      setMessage({ message: 'Choisissez une image, pas un document.' });
      return;
    }

    setMessage(null);
    setPrepare(true);
    try {
      const resultat = await recadrer(brut);
      if ('ok' in resultat) {
        setMessage({ message: resultat.motif ?? 'Cette photographie ne convient pas.' });
        setPret(null);
        setApercu(null);
      } else {
        setPret(resultat.fichier);
        setApercu(resultat.apercu);
      }
    } catch {
      setMessage({
        message: 'L’image n’a pas pu être lue. Reprenez la photographie au format JPEG.',
      });
    } finally {
      setPrepare(false);
      if (champ.current) champ.current.value = '';
    }
  }

  function envoyer() {
    if (!pret) return;
    const donnees = new FormData();
    donnees.set('photo', pret);
    donnees.set('consentement', consent ? 'oui' : 'non');
    demarrer(async () => {
      const retour = await deposerPhoto({ message: null }, donnees);
      setMessage(retour);
      if (!retour.message) {
        setPret(null);
        setApercu(null);
        router.refresh();
      }
    });
  }

  return (
    <div className="flex flex-col gap-6">
      {message?.message ? (
        <p
          role="alert"
          className="flex gap-3 rounded-xl border border-state-danger/25 bg-state-danger/[0.06] p-4 text-[0.875rem] leading-relaxed font-medium text-state-danger"
        >
          <IconInfo aria-hidden="true" className="mt-0.5 h-[1.125rem] w-[1.125rem] shrink-0" />
          {message.message}
        </p>
      ) : null}

      <div className="grid gap-6 sm:grid-cols-[minmax(0,14rem)_minmax(0,1fr)]">
        {/* ------------------------------------------------------- Le cadre */}
        <div>
          <div className="relative mx-auto w-full max-w-[14rem] overflow-hidden rounded-2xl border border-graphite-200 bg-paper-tint">
            <div style={{ paddingTop: `${(1 / RATIO) * 100}%` }} />
            {apercu ?? deja ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={apercu ?? deja ?? ''}
                alt="Votre photographie d’identité"
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <span className="absolute inset-0 flex items-center justify-center text-[0.8125rem] text-graphite-400">
                Aucune photographie
              </span>
            )}

            {/* Le repère de cadrage : il montre où placer le visage, sans rien
                mesurer. Il disparaît dès qu'une image est en place. */}
            {!apercu && !deja ? (
              <svg
                aria-hidden="true"
                viewBox="0 0 35 45"
                className="absolute inset-0 h-full w-full text-graphite-300"
              >
                <ellipse
                  cx="17.5"
                  cy="19"
                  rx="10"
                  ry="13"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.5"
                  strokeDasharray="1.5 1.5"
                />
              </svg>
            ) : null}
          </div>

          <p className="mt-2 text-center text-[0.75rem] text-graphite-500">
            Format 35 × 45&nbsp;mm, recadré automatiquement
          </p>
        </div>

        {/* ------------------------------------------------------ Les règles */}
        <div>
          <h3 className="text-[0.9375rem] font-semibold text-ink-800">Ce que la photo doit être</h3>
          <ul className="mt-3 flex flex-col gap-2">
            {REGLES.map((regle) => (
              <li
                key={regle}
                className="flex items-start gap-2.5 text-[0.875rem] leading-snug text-graphite-600"
              >
                <IconCheck
                  aria-hidden="true"
                  className="mt-0.5 h-4 w-4 shrink-0 text-state-success"
                />
                {regle}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[0.8125rem] leading-relaxed text-graphite-500">
            Un couvre-chef porté pour motif religieux est admis, à condition que le visage reste
            entièrement visible.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <input
              ref={champ}
              type="file"
              accept="image/*"
              capture="user"
              onChange={(evenement) => accepter(evenement.target.files)}
              className="hidden"
              tabIndex={-1}
              aria-hidden="true"
            />
            <button
              type="button"
              disabled={prepare || envoi}
              onClick={() => champ.current?.click()}
              className="bouton bouton--principal"
            >
              {prepare ? 'Préparation…' : deja ? 'Reprendre ma photographie' : 'Prendre ou choisir ma photographie'}
            </button>

            {deja && !apercu ? (
              <button
                type="button"
                disabled={envoi}
                onClick={() => {
                  if (!window.confirm('Retirer votre photographie ?')) return;
                  demarrer(async () => {
                    const retour = await retirerPhoto();
                    setMessage(retour);
                    if (!retour.message) router.refresh();
                  });
                }}
                className="bouton bouton--discret"
              >
                Retirer
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* --------------------------------------------- Consentement et envoi */}
      {pret ? (
        <div className="rounded-2xl border border-ink-100 bg-ink-50 p-5">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={consent}
              onChange={(evenement) => setConsent(evenement.target.checked)}
              className="mt-0.5 h-5 w-5 shrink-0 rounded border-graphite-300 accent-ink-700"
            />
            <span className="text-[0.875rem] leading-relaxed text-ink-800">
              J’autorise l’impression de ma photographie sur ma carte d’étudiant et sa conservation
              pendant la durée de ma scolarité.
            </span>
          </label>

          <button
            type="button"
            disabled={!consent || envoi}
            onClick={envoyer}
            className={cn('bouton bouton--or mt-5', !consent && 'opacity-60')}
          >
            {envoi ? 'Envoi…' : 'Enregistrer ma photographie'}
          </button>
        </div>
      ) : null}
    </div>
  );
}
