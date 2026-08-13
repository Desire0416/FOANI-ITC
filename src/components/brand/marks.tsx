import type { SVGProps } from 'react';
import { cn } from '@/lib/utils';

type MarkProps = Omit<SVGProps<SVGSVGElement>, 'viewBox' | 'fill' | 'children'>;

/* ==========================================================================
   Signes de marque
   Tout ce qui suit est dérivé d'un seul objet : la couronne de laurier du
   logo. Trois signes en sortent, et trois seulement — la feuille, l'arc,
   l'étoile. Ils reviennent à des échelles différentes d'une section à
   l'autre ; on n'en introduit pas d'autres.
   ========================================================================== */

/**
 * Une foliole de laurier, dessinée dans un repère local :
 * base à l'origine, pointe vers le haut, longueur 34, largeur 14.
 * C'est la brique unique de tous les signes végétaux du site.
 */
const LEAF_PATH = 'M0 0C9-9 9-25 0-34-9-25-9-9 0 0Z';

/**
 * Le brin — deux folioles issues d'un même point.
 * Utilisé comme accent typographique (à côté d'un titre), comme puce de liste
 * et comme marqueur de rubrique. C'est la plus petite des trois échelles.
 */
export function LeafSprig({ className, ...props }: MarkProps) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className={className} fill="currentColor" {...props}>
      <path d={LEAF_PATH} transform="translate(24 44) rotate(24) scale(1)" />
      <path d={LEAF_PATH} transform="translate(24 44) rotate(-30) scale(0.74)" opacity="0.72" />
    </svg>
  );
}

/**
 * L'étoile à cinq branches qui surmonte la couronne du logo.
 * Réservée aux marqueurs de section et aux éléments de preuve : si elle
 * apparaît partout, elle ne signale plus rien.
 */
export function StarMark({ className, ...props }: MarkProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor" {...props}>
      <path d="M12 1.6l2.98 6.42 7.02.86-5.2 4.8 1.4 6.92L12 17.1l-6.2 3.5 1.4-6.92-5.2-4.8 7.02-.86z" />
    </svg>
  );
}

type WreathProps = MarkProps & {
  /** Nombre de folioles par branche. */
  leaves?: number;
};

/**
 * La couronne entière, en filigrane.
 * Les folioles ne sont pas dessinées une à une : elles sont distribuées le
 * long de deux arcs par un calcul de position, ce qui garantit un espacement
 * régulier et permet d'en changer la densité sans redessiner un chemin.
 * Rendu côté serveur — aucun coût pour le navigateur.
 */
export function LaurelWreath({ className, leaves = 11, ...props }: WreathProps) {
  const cx = 100;
  const cy = 100;
  const radius = 74;

  const branch = (side: 1 | -1) =>
    Array.from({ length: leaves }, (_, index) => {
      const progress = index / (leaves - 1);
      // De 122° (bas) à 250° (haut) sur la branche gauche, en miroir à droite.
      const angle = (122 + progress * 128) * (Math.PI / 180);
      const x = cx + side * radius * Math.sin(angle);
      const y = cy + radius * Math.cos(angle);
      // La foliole s'incline dans le sens de la tangente, et rapetisse aux extrémités.
      const rotation = side * (progress * 128 - 26);
      const scale = 0.5 + 0.5 * Math.sin(Math.PI * (0.25 + progress * 0.7));
      return (
        <path
          key={`${side}-${index}`}
          d={LEAF_PATH}
          transform={`translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${(rotation + (side === 1 ? 20 : -20)).toFixed(1)}) scale(${scale.toFixed(3)})`}
        />
      );
    });

  return (
    <svg viewBox="0 0 200 200" aria-hidden="true" className={className} fill="currentColor" {...props}>
      {branch(-1)}
      {branch(1)}
      <circle cx={cx} cy={cy + radius + 4} r="3.4" />
    </svg>
  );
}

/**
 * L'arc — la plus grande des trois échelles.
 * C'est la courbe de la couronne, isolée et agrandie jusqu'à devenir une
 * limite de page. Elle découpe les médias du site et se double d'un trait
 * d'or décalé, comme sur la maquette du hero.
 *
 * La courbe est décrite une seule fois, en coordonnées normalisées, et sert
 * à la fois de masque (clipPath en objectBoundingBox) et de tracé.
 */
export const ARC_CLIP = 'M0.63 0C0.32 0.14 0.07 0.45 0 1L1 1L1 0Z';
const ARC_TRACE = 'M0.63 0C0.32 0.14 0.07 0.45 0 1';

export function ArcClipDef({ id }: { id: string }) {
  return (
    <svg aria-hidden="true" className="absolute h-0 w-0" focusable="false">
      <defs>
        <clipPath id={id} clipPathUnits="objectBoundingBox">
          <path d={ARC_CLIP} />
        </clipPath>
      </defs>
    </svg>
  );
}

/**
 * Le trait d'or qui accompagne l'arc, décalé vers l'extérieur.
 * `vector-effect` conserve une épaisseur constante malgré l'étirement non
 * uniforme du viewBox ; c'est ce qui permet à un seul tracé de suivre
 * n'importe quel format de conteneur, du téléphone au grand écran.
 */
export function ArcTrace({
  className,
  offset = 0.045,
  animate = false,
}: {
  className?: string;
  offset?: number;
  animate?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 1 1"
      preserveAspectRatio="none"
      aria-hidden="true"
      className={cn('pointer-events-none overflow-visible', className)}
    >
      <path
        d={ARC_TRACE}
        transform={`translate(${-offset} ${-offset * 0.5}) scale(${1 + offset * 0.4})`}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
        vectorEffect="non-scaling-stroke"
        pathLength={100}
        style={
          animate
            ? {
                strokeDasharray: 100,
                animation: 'arc-draw 1.6s var(--ease-arc) 0.25s both',
                ['--arc-length' as string]: '100',
              }
            : undefined
        }
      />
    </svg>
  );
}
