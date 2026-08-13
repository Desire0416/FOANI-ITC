'use client';

import { useRef, useState, useTransition, type DragEvent } from 'react';
import { useRouter } from 'next/navigation';
import { IconCheck, IconClose, IconFile, IconInfo } from '@/components/brand/icons';
import { deposerPiece, type Etat } from '@/app/(candidat)/mon-dossier/actions';
import { cn } from '@/lib/utils';

/* ==========================================================================
   Zone de dépôt d'un document — CDC §10.1
   --------------------------------------------------------------------------
   « Les documents se photographient depuis un téléphone : le portail contrôle
   le format et allège automatiquement les images. »

   L'allègement a lieu **dans le navigateur**, avant l'envoi. Ce n'est pas un
   raffinement : une photographie de téléphone pèse couramment trois à cinq
   mégaoctets, et une action serveur de Next refuse au-delà d'un mégaoctet —
   d'où la page d'erreur, sans explication, au moment précis où le candidat
   croyait avoir fini. Réduite à 1800 pixels de large, la même photo tient en
   trois cents kilo-octets : elle passe, elle part vite, et elle reste
   parfaitement lisible pour un agent qui vérifie un numéro de pièce.

   Sur une connexion mobile dégradée — le cas visé par le §18.2 — la
   différence n'est pas de confort : c'est ce qui distingue un dépôt qui
   aboutit d'un dépôt qui expire.

   Les PDF passent tels quels : ils ne se compriment pas dans un navigateur,
   et ils sont déjà légers.
   ========================================================================== */

/** Largeur maximale conservée. Au-delà, on n'ajoute plus de lisibilité. */
const LARGEUR_MAXIMALE = 1800;

/** Ce que le serveur acceptera. Contrôlé ici pour le dire tout de suite. */
const TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'application/pdf'];
const POIDS_MAXIMAL = 8 * 1024 * 1024;

const NATURES = [
  { valeur: 'identite', libelle: 'Pièce d’identité' },
  { valeur: 'releve', libelle: 'Relevé de notes' },
  { valeur: 'diplome', libelle: 'Diplôme ou attestation de réussite' },
  { valeur: 'photo', libelle: 'Photographie d’identité' },
  { valeur: 'autre', libelle: 'Autre document' },
];

function poids(octets: number): string {
  const mo = octets / (1024 * 1024);
  if (mo >= 1) return `${mo.toFixed(1)} Mo`;
  const ko = octets / 1024;
  return ko >= 1 ? `${Math.round(ko)} Ko` : 'moins de 1 Ko';
}

/**
 * Réduit une image à `LARGEUR_MAXIMALE` et la réencode en JPEG.
 *
 * Rend le fichier d'origine si le navigateur ne sait pas la décoder — c'est le
 * cas du HEIC sur la plupart des navigateurs de bureau. Mieux vaut envoyer
 * l'original que refuser un document parfaitement valable : le serveur, lui,
 * sait le traiter.
 */
async function alleger(fichier: File): Promise<{ fichier: File; gain: number }> {
  if (!fichier.type.startsWith('image/')) return { fichier, gain: 0 };

  try {
    const image = await createImageBitmap(fichier);
    const echelle = Math.min(1, LARGEUR_MAXIMALE / Math.max(image.width, image.height));

    // Déjà petite et déjà légère : on n'y touche pas, un réencodage ne ferait
    // que dégrader l'image sans rien gagner.
    if (echelle === 1 && fichier.size < 900 * 1024) {
      image.close();
      return { fichier, gain: 0 };
    }

    const toile = document.createElement('canvas');
    toile.width = Math.round(image.width * echelle);
    toile.height = Math.round(image.height * echelle);

    const contexte = toile.getContext('2d');
    if (!contexte) return { fichier, gain: 0 };
    contexte.drawImage(image, 0, 0, toile.width, toile.height);
    image.close();

    const blob = await new Promise<Blob | null>((resoudre) =>
      toile.toBlob(resoudre, 'image/jpeg', 0.82),
    );
    if (!blob || blob.size >= fichier.size) return { fichier, gain: 0 };

    const nom = fichier.name.replace(/\.[^.]+$/, '') + '.jpg';
    return {
      fichier: new File([blob], nom, { type: 'image/jpeg', lastModified: Date.now() }),
      gain: fichier.size - blob.size,
    };
  } catch {
    // Format que le navigateur ne décode pas : on laisse faire le serveur.
    return { fichier, gain: 0 };
  }
}

/* -------------------------------------------------------------------------- */

type Choisi = {
  readonly fichier: File;
  readonly origine: number;
  readonly gain: number;
  readonly apercu: string | null;
};

export function ZoneDepot() {
  const router = useRouter();
  const champ = useRef<HTMLInputElement>(null);
  const [survol, setSurvol] = useState(false);
  const [choisi, setChoisi] = useState<Choisi | null>(null);
  const [nature, setNature] = useState('identite');
  const [message, setMessage] = useState<Etat | null>(null);
  const [prepare, setPrepare] = useState(false);
  const [envoi, demarrer] = useTransition();

  async function accepter(fichiers: FileList | null) {
    setMessage(null);
    const brut = fichiers?.[0];
    if (!brut) return;

    if (!TYPES.includes(brut.type)) {
      setMessage({ message: 'Déposez une photo (JPG, PNG, WEBP, HEIC) ou un PDF.' });
      return;
    }
    if (brut.size > POIDS_MAXIMAL) {
      setMessage({ message: `Ce fichier pèse ${poids(brut.size)}. Le maximum est de 8 Mo.` });
      return;
    }

    setPrepare(true);
    const { fichier, gain } = await alleger(brut);
    setPrepare(false);

    setChoisi({
      fichier,
      origine: brut.size,
      gain,
      apercu: fichier.type.startsWith('image/') ? URL.createObjectURL(fichier) : null,
    });
  }

  function retirer() {
    if (choisi?.apercu) URL.revokeObjectURL(choisi.apercu);
    setChoisi(null);
    setMessage(null);
    if (champ.current) champ.current.value = '';
  }

  function envoyer() {
    if (!choisi) return;
    const donnees = new FormData();
    donnees.set('fichier', choisi.fichier);
    donnees.set('nature', nature);

    demarrer(async () => {
      const retour = await deposerPiece({ message: null }, donnees);
      setMessage(retour);
      if (!retour.message) {
        retirer();
        // Sans cela, le document part bien mais la liste ne bouge pas : le
        // candidat croit que rien ne s'est passé et recommence.
        router.refresh();
      }
    });
  }

  const surDepot = (evenement: DragEvent<HTMLDivElement>) => {
    evenement.preventDefault();
    setSurvol(false);
    void accepter(evenement.dataTransfer.files);
  };

  return (
    <div className="flex flex-col gap-5">
      {message?.message ? (
        <p
          role="alert"
          className="flex gap-3 rounded-2xl border border-state-danger/25 bg-state-danger/[0.06] p-4 text-[0.875rem] leading-relaxed font-medium text-state-danger"
        >
          <IconInfo aria-hidden="true" className="mt-0.5 h-[1.125rem] w-[1.125rem] shrink-0" />
          {message.message}
        </p>
      ) : null}

      {choisi === null ? (
        /* ------------------------------------------------------- La zone */
        <div
          onDragOver={(evenement) => {
            evenement.preventDefault();
            setSurvol(true);
          }}
          onDragLeave={() => setSurvol(false)}
          onDrop={surDepot}
          className={cn(
            'rounded-2xl border-2 border-dashed p-8 text-center transition-colors duration-200',
            survol ? 'border-ink-700 bg-ink-50' : 'border-graphite-300 bg-paper-tint',
          )}
        >
          <span
            className={cn(
              'mx-auto flex h-14 w-14 items-center justify-center rounded-2xl transition-colors',
              survol ? 'bg-ink-700 text-paper' : 'bg-paper text-ink-700',
            )}
          >
            <IconFile className="h-6 w-6" />
          </span>

          <p className="mt-4 text-[1rem] font-semibold text-ink-800">
            {prepare ? 'Préparation du document…' : 'Glissez votre document ici'}
          </p>
          <p className="mt-1.5 text-[0.875rem] leading-relaxed text-graphite-500">
            Ou choisissez-le depuis votre appareil. Sur téléphone, vous pouvez le photographier.
          </p>

          <button
            type="button"
            onClick={() => champ.current?.click()}
            disabled={prepare}
            className="bouton bouton--principal mt-5"
          >
            Choisir un document
          </button>

          <p className="mt-4 text-[0.75rem] text-graphite-500">
            Photo ou PDF, 8 Mo au maximum. Les photos sont allégées automatiquement.
          </p>

          {/* `hidden` et non `sr-only` : masqué à l'écran mais focalisable, ce
              champ créait un arrêt de tabulation invisible. C'est le bouton
              ci-dessus qui l'ouvre, et lui seul reçoit le focus. */}
          <input
            ref={champ}
            type="file"
            accept={TYPES.join(',')}
            capture="environment"
            onChange={(evenement) => void accepter(evenement.target.files)}
            className="hidden"
            tabIndex={-1}
            aria-hidden="true"
          />
        </div>
      ) : (
        /* --------------------------------------------- Le document retenu */
        <div className="rounded-2xl border border-graphite-200 bg-paper p-4">
          <div className="flex items-center gap-4">
            {choisi.apercu ? (
              /* Aperçu local, jamais envoyé : c'est le fichier que le candidat
                 vient de choisir, affiché depuis sa propre mémoire. */
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={choisi.apercu}
                alt=""
                className="h-16 w-16 shrink-0 rounded-xl border border-graphite-100 object-cover"
              />
            ) : (
              <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-ink-50 text-ink-700">
                <IconFile className="h-6 w-6" />
              </span>
            )}

            <div className="min-w-0 flex-1">
              <p className="truncate text-[0.9375rem] font-semibold text-ink-800">
                {choisi.fichier.name}
              </p>
              <p className="mt-0.5 text-[0.8125rem] text-graphite-500">{poids(choisi.fichier.size)}</p>
              {choisi.gain > 0 ? (
                <p className="mt-1 flex items-center gap-1.5 text-[0.75rem] font-medium text-[#0f7a4d]">
                  <IconCheck className="h-3.5 w-3.5" />
                  Allégé de {poids(choisi.origine)} à {poids(choisi.fichier.size)}
                </p>
              ) : null}
            </div>

            <button
              type="button"
              onClick={retirer}
              disabled={envoi}
              aria-label="Retirer ce document"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-graphite-500 transition-colors hover:bg-ink-50 hover:text-ink-700"
            >
              <IconClose className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-5 border-t border-graphite-100 pt-5">
            <label htmlFor="nature-piece" className="etiquette">
              De quel document s’agit-il&nbsp;?
            </label>
            <select
              id="nature-piece"
              value={nature}
              onChange={(evenement) => setNature(evenement.target.value)}
              disabled={envoi}
              className="champ"
            >
              {NATURES.map((option) => (
                <option key={option.valeur} value={option.valeur}>
                  {option.libelle}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={envoyer}
              disabled={envoi}
              className="bouton bouton--principal mt-5 w-full"
            >
              {envoi ? 'Dépôt en cours…' : 'Déposer ce document'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
