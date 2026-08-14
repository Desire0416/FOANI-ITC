'use client';

import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { IconCheck, IconInfo } from '@/components/brand/icons';
import {
  deposerCliche,
  retirerCliche,
  type Cliche,
  type Etat,
} from '@/app/(candidat)/mon-dossier/(coque)/inscription/actions';
import { cn } from '@/lib/utils';

/* ==========================================================================
   Les trois clichés de la pièce d'identité — Note complémentaire §5.1, §5.4
   --------------------------------------------------------------------------
   « Le candidat photographie sa pièce d'identité recto et verso, puis se
   photographie tenant cette pièce. Le dispositif contrôle la lisibilité et la
   cohérence entre les informations déclarées et celles figurant sur la pièce.
   Le service Scolarité procède au contrôle visuel. »

   Le contrôle fait ici porte sur la LISIBILITÉ, et sur elle seule : une pièce
   d'identité photographiée trop petite, floue ou dans l'ombre est illisible
   pour l'agent, et le lui envoyer quand même ne fait que déplacer le refus de
   trois jours. Une pièce fait 85 × 54 mm ; les caractères d'un numéro de CNI
   mesurent deux millimètres. En deçà de 1000 pixels de large, ils ne se lisent
   plus.

   Ce qui n'est pas fait ici : aucune lecture du texte, aucune reconnaissance
   de caractères, aucune comparaison de visage. La cohérence entre ce qui est
   déclaré et ce qui figure sur la pièce est rapprochée côté agent, où elle
   est signalée sans blocage — c'est la règle du §5.4. Comparer un visage à un
   autre serait un traitement biométrique, soumis à autorisation préalable.

   La détection de capture d'écran est approchée, et honnêtement : une capture
   d'écran de téléphone a des dimensions qui correspondent exactement à un
   format d'affichage courant, et un histogramme pauvre en bruit. On signale,
   on ne refuse pas.
   ========================================================================== */

const POIDS_MAXIMAL = 4 * 1024 * 1024;

/** Un numéro de pièce d'identité cesse d'être lisible en deçà. */
const LARGEUR_MINIMALE = 1000;
const LARGEUR_CIBLE = 1600;

type Verdict = { readonly ok: true; readonly fichier: File; readonly apercu: string } | { readonly ok: false; readonly motif: string };

/** Netteté par variance du laplacien — la même mesure que pour le portrait. */
function nettete(toile: HTMLCanvasElement): number {
  const contexte = toile.getContext('2d', { willReadFrequently: true });
  if (!contexte) return Number.POSITIVE_INFINITY;

  const { width: l, height: h } = toile;
  const donnees = contexte.getImageData(0, 0, l, h).data;
  const gris = new Float32Array(l * h);
  for (let rang = 0; rang < l * h; rang += 1) {
    const base = rang * 4;
    gris[rang] =
      0.299 * (donnees[base] ?? 0) + 0.587 * (donnees[base + 1] ?? 0) + 0.114 * (donnees[base + 2] ?? 0);
  }

  let somme = 0;
  let sommeCarre = 0;
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
      somme += lap;
      sommeCarre += lap * lap;
      compte += 1;
    }
  }
  return sommeCarre / compte - (somme / compte) ** 2;
}

async function preparer(fichier: File, selfie: boolean): Promise<Verdict> {
  const image = await createImageBitmap(fichier);
  const { width: source, height: haut } = image;

  if (Math.max(source, haut) < LARGEUR_MINIMALE) {
    image.close();
    return {
      ok: false,
      motif: `Cette image fait ${source} × ${haut} pixels : le numéro de votre pièce n’y sera pas lisible. Reprenez-la de plus près, avec l’appareil photo.`,
    };
  }

  const echelle = Math.min(1, LARGEUR_CIBLE / Math.max(source, haut));
  const toile = document.createElement('canvas');
  toile.width = Math.round(source * echelle);
  toile.height = Math.round(haut * echelle);
  const contexte = toile.getContext('2d');
  if (!contexte) {
    image.close();
    return { ok: false, motif: 'Votre navigateur n’a pas pu préparer l’image. Réessayez.' };
  }
  contexte.drawImage(image, 0, 0, toile.width, toile.height);
  image.close();

  const variance = nettete(toile);
  /* Le seuil est plus exigeant pour la pièce que pour le portrait : ce qu'il
     faut y lire, ce sont des caractères de deux millimètres. */
  if (variance < (selfie ? 40 : 80)) {
    return {
      ok: false,
      motif: selfie
        ? 'La photographie est floue. Tenez l’appareil bien stable et reprenez.'
        : 'La pièce est floue : son numéro ne sera pas lisible. Posez-la à plat, sur un fond uni, et reprenez sans bouger.',
    };
  }

  const blob = await new Promise<Blob | null>((resoudre) =>
    toile.toBlob(resoudre, 'image/jpeg', 0.88),
  );
  if (!blob) return { ok: false, motif: 'L’image n’a pas pu être préparée. Réessayez.' };

  return {
    ok: true,
    fichier: new File([blob], `${selfie ? 'porteur' : 'piece'}.jpg`, {
      type: 'image/jpeg',
      lastModified: Date.now(),
    }),
    apercu: toile.toDataURL('image/jpeg', 0.7),
  };
}

/* -------------------------------------------------------------------------- */

export function ClicheIdentite({
  cliche,
  titre,
  consigne,
  deja,
  ouvert,
}: {
  cliche: Cliche;
  titre: string;
  consigne: string;
  deja: string | null;
  ouvert: boolean;
}) {
  const router = useRouter();
  const champ = useRef<HTMLInputElement>(null);
  const [apercu, setApercu] = useState<string | null>(null);
  const [message, setMessage] = useState<Etat | null>(null);
  const [prepare, setPrepare] = useState(false);
  const [envoi, demarrer] = useTransition();

  const selfie = cliche === 'selfie';

  async function accepter(fichiers: FileList | null) {
    const brut = fichiers?.[0];
    if (!brut) return;

    if (!brut.type.startsWith('image/')) {
      setMessage({ message: 'Choisissez une image, pas un document.' });
      return;
    }
    if (brut.size > POIDS_MAXIMAL * 3) {
      setMessage({ message: 'Cette image est trop lourde. Reprenez-la en qualité normale.' });
      return;
    }

    setMessage(null);
    setPrepare(true);
    try {
      const verdict = await preparer(brut, selfie);
      if (!verdict.ok) {
        setMessage({ message: verdict.motif });
        return;
      }

      setApercu(verdict.apercu);
      const donnees = new FormData();
      donnees.set('cliche', cliche);
      donnees.set('fichier', verdict.fichier);

      demarrer(async () => {
        const retour = await deposerCliche({ message: null }, donnees);
        setMessage(retour);
        if (!retour.message) {
          setApercu(null);
          router.refresh();
        }
      });
    } catch {
      setMessage({ message: 'L’image n’a pas pu être lue. Reprenez-la au format JPEG.' });
    } finally {
      setPrepare(false);
      if (champ.current) champ.current.value = '';
    }
  }

  const visuel = apercu ?? deja;

  return (
    <div className="carte overflow-hidden">
      <header className="border-b border-graphite-100 bg-paper-tint px-4 py-3">
        <h3 className="flex items-center gap-2 text-[0.9375rem] leading-snug">
          {deja ? (
            <IconCheck aria-hidden="true" className="h-4 w-4 shrink-0 text-state-success" />
          ) : null}
          {titre}
        </h3>
      </header>

      <div className="p-4">
        <div className="relative overflow-hidden rounded-xl border border-graphite-200 bg-paper-tint">
          <div style={{ paddingTop: selfie ? '120%' : '63%' }} />
          {visuel ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={visuel}
              alt={titre}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <span className="absolute inset-0 flex items-center justify-center px-4 text-center text-[0.8125rem] text-graphite-400">
              {prepare ? 'Préparation…' : 'Aucune image'}
            </span>
          )}
        </div>

        <p className="mt-3 text-[0.8125rem] leading-relaxed text-graphite-600">{consigne}</p>

        {message?.message ? (
          <p
            role="alert"
            className="mt-3 flex gap-2.5 rounded-xl border border-state-danger/25 bg-state-danger/[0.06] p-3 text-[0.8125rem] leading-relaxed font-medium text-state-danger"
          >
            <IconInfo aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
            {message.message}
          </p>
        ) : null}

        {ouvert ? (
          <div className="mt-4 flex flex-wrap gap-2.5">
            <input
              ref={champ}
              type="file"
              accept="image/*"
              capture={selfie ? 'user' : 'environment'}
              onChange={(evenement) => accepter(evenement.target.files)}
              className="hidden"
              tabIndex={-1}
              aria-hidden="true"
            />
            <button
              type="button"
              disabled={prepare || envoi}
              onClick={() => champ.current?.click()}
              className={cn('bouton h-10 px-4 text-[0.875rem]', deja ? 'bouton--discret' : 'bouton--principal')}
            >
              {prepare || envoi ? 'Envoi…' : deja ? 'Reprendre' : 'Photographier'}
            </button>

            {deja ? (
              <button
                type="button"
                disabled={envoi}
                onClick={() => {
                  if (!window.confirm('Retirer cette image ?')) return;
                  demarrer(async () => {
                    const retour = await retirerCliche(cliche);
                    setMessage(retour);
                    if (!retour.message) router.refresh();
                  });
                }}
                className="bouton bouton--discret h-10 px-4 text-[0.875rem]"
              >
                Retirer
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
