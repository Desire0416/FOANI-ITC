import Image from 'next/image';
import type { Photo as PhotoSource } from '@/content/photos';
import { cn } from '@/lib/utils';

/* ==========================================================================
   Une photographie de l'établissement, posée à la place d'un emplacement vide
   --------------------------------------------------------------------------
   `MediaPlaceholder` avait promis de se remplacer « par une balise next/image
   sans toucher à la mise en page ». Ce composant tient la promesse : même
   enveloppe, même `rounded-media`, même prop `ratio`, même `className`. Un
   emplacement se convertit en changeant le nom du composant et rien d'autre,
   et les deux peuvent cohabiter sur une même grille — ce qui arrive, puisque
   tous les sujets ne sont pas encore photographiés.

   Le cadrage est en `object-cover` : la fenêtre commande, la photographie
   s'y plie. C'est ce qui permet de poser une image portrait dans une
   vignette 3/4 sans déformer personne. Ce qui sort du cadre est perdu, d'où
   l'attention portée au choix de la photographie pour chaque emplacement.
   ========================================================================== */

export function Photo({
  photo,
  className,
  ratio = 'aspect-[4/3]',
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  priority = false,
  position = 'object-center',
}: {
  photo: PhotoSource;
  className?: string;
  ratio?: string;
  /** Largeur de rendu attendue, pour que le navigateur choisisse sa variante. */
  sizes?: string;
  priority?: boolean;
  /** `object-position`, quand le sujet n'est pas au milieu du cadre. */
  position?: string;
}) {
  return (
    <div className={cn('relative isolate overflow-hidden rounded-media bg-ink-800', ratio, className)}>
      <Image
        src={photo.src}
        alt={photo.alt}
        fill
        sizes={sizes}
        priority={priority}
        className={cn('object-cover', position)}
      />
    </div>
  );
}

/* --------------------------------------------------------------------------
   Vignette légendée
   --------------------------------------------------------------------------
   Une galerie sans légendes oblige à deviner : cette rangée de cages, est-ce
   l'élevage de l'école ou une illustration ? La légende répond, et le voile
   sombre qui la porte garantit son contraste quelle que soit la luminosité de
   la photographie — un ciel blanc de saison des pluies sous un texte clair,
   sinon, ne se lit plus.
   -------------------------------------------------------------------------- */

export function PhotoLegendee({
  photo,
  className,
  ratio = 'aspect-[4/3]',
  sizes,
  position,
}: {
  photo: PhotoSource;
  className?: string;
  ratio?: string;
  sizes?: string;
  position?: string;
}) {
  return (
    <figure className={cn('relative', className)}>
      <Photo photo={photo} ratio={ratio} sizes={sizes} position={position} className="h-full w-full" />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 rounded-b-media bg-gradient-to-t from-ink-950/80 to-transparent"
      />
      <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 p-5 font-display text-[1rem] leading-snug text-paper">
        {photo.legende}
      </figcaption>
    </figure>
  );
}
