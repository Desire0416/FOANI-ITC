import { cn } from '@/lib/utils';

/* ==========================================================================
   Graphiques du tableau de bord
   --------------------------------------------------------------------------
   Écrits en SVG, sans bibliothèque. Une bibliothèque de graphiques pèse
   plusieurs dizaines de kilo-octets dans le navigateur ; nous avons besoin de
   deux formes, et deux formes se dessinent à la main.

   Ils sont rendus par le serveur : le back-office n'attend aucun script pour
   afficher ses chiffres. Chaque graphique est doublé d'un tableau lisible par
   un lecteur d'écran — un graphique n'informe que ceux qui le voient (§18.3).
   ========================================================================== */

export type PointSerie = { readonly etiquette: string; readonly valeur: number };

/* --------------------------------------------------------------------------
   Courbe de réception
   -------------------------------------------------------------------------- */

/**
 * Trace une courbe adoucie passant par les points, en coordonnées 0→100.
 * L'adoucissement est une simple moyenne des abscisses entre deux points :
 * suffisant pour éviter l'aspect anguleux, sans calcul de spline.
 */
function chemin(points: readonly { x: number; y: number }[]): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0]!.x} ${points[0]!.y}`;

  return points.reduce((trace, point, index) => {
    if (index === 0) return `M ${point.x} ${point.y}`;
    const avant = points[index - 1]!;
    const milieu = (avant.x + point.x) / 2;
    return `${trace} C ${milieu} ${avant.y}, ${milieu} ${point.y}, ${point.x} ${point.y}`;
  }, '');
}

export function Courbe({
  serie,
  titre,
  className,
}: {
  serie: readonly PointSerie[];
  titre: string;
  className?: string;
}) {
  const maximum = Math.max(1, ...serie.map((point) => point.valeur));
  const pas = serie.length > 1 ? 100 / (serie.length - 1) : 100;

  const points = serie.map((point, index) => ({
    x: index * pas,
    // 6 points de marge en haut pour que le sommet ne touche pas le bord.
    y: 100 - (point.valeur / maximum) * 88 - 6,
  }));

  const trace = chemin(points);
  const aire = `${trace} L 100 100 L 0 100 Z`;
  const dernier = points[points.length - 1];

  return (
    <figure className={cn('m-0', className)}>
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        role="img"
        aria-label={titre}
        className="h-36 w-full"
      >
        <defs>
          <linearGradient id="courbe-remplissage" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-ink-700)" stopOpacity="0.18" />
            <stop offset="100%" stopColor="var(--color-ink-700)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Trois repères horizontaux, discrets : ils donnent l'échelle sans
            encombrer. */}
        {[25, 50, 75].map((y) => (
          <line
            key={y}
            x1="0"
            y1={y}
            x2="100"
            y2={y}
            stroke="var(--color-graphite-100)"
            strokeWidth="0.4"
            vectorEffect="non-scaling-stroke"
          />
        ))}

        <path d={aire} fill="url(#courbe-remplissage)" />
        <path
          d={trace}
          fill="none"
          stroke="var(--color-ink-700)"
          strokeWidth="2"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />

        {dernier ? (
          <circle
            cx={dernier.x}
            cy={dernier.y}
            r="3"
            fill="var(--color-gold-400)"
            stroke="var(--color-paper)"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
        ) : null}
      </svg>

      {/* Huit dates à la suite ne se lisent pas : une sur deux est masquée à
          l'écran. La donnée, elle, reste entière — c'est le tableau ci-dessous
          qui la porte, et c'est lui que lit un lecteur d'écran. */}
      <div className="mt-2 flex justify-between text-[0.6875rem] text-graphite-400">
        {serie.map((point, index) => {
          const dernier = index === serie.length - 1;
          const montrer = index % 2 === 0 || dernier;
          return (
            <span
              key={point.etiquette}
              aria-hidden="true"
              className={cn(dernier && 'font-semibold text-ink-700')}
            >
              {montrer ? point.etiquette : ''}
            </span>
          );
        })}
      </div>

      {/* Le même contenu, en tableau : un graphique n'informe que ceux qui le
          voient. */}
      <figcaption className="sr-only">
        <table>
          <caption>{titre}</caption>
          <tbody>
            {serie.map((point) => (
              <tr key={point.etiquette}>
                <th scope="row">{point.etiquette}</th>
                <td>{point.valeur}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </figcaption>
    </figure>
  );
}

/* --------------------------------------------------------------------------
   Anneau de répartition
   -------------------------------------------------------------------------- */

export type PartAnneau = {
  readonly libelle: string;
  readonly valeur: number;
  /** Couleur de charte, en variable CSS. */
  readonly couleur: string;
};

export function Anneau({
  parts,
  titre,
  centre,
  souscentre,
}: {
  parts: readonly PartAnneau[];
  titre: string;
  centre: string;
  souscentre: string;
}) {
  const total = parts.reduce((somme, part) => somme + part.valeur, 0);
  const rayon = 42;
  const circonference = 2 * Math.PI * rayon;

  let parcouru = 0;

  return (
    <figure className="m-0 flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:gap-7">
      <div className="relative shrink-0">
        <svg viewBox="0 0 100 100" role="img" aria-label={titre} className="h-36 w-36 -rotate-90">
          <circle
            cx="50"
            cy="50"
            r={rayon}
            fill="none"
            stroke="var(--color-graphite-100)"
            strokeWidth="12"
          />
          {total > 0
            ? parts.map((part) => {
                const longueur = (part.valeur / total) * circonference;
                const decalage = -parcouru;
                parcouru += longueur;
                if (part.valeur === 0) return null;
                return (
                  <circle
                    key={part.libelle}
                    cx="50"
                    cy="50"
                    r={rayon}
                    fill="none"
                    stroke={part.couleur}
                    strokeWidth="12"
                    strokeLinecap="butt"
                    strokeDasharray={`${longueur} ${circonference - longueur}`}
                    strokeDashoffset={decalage}
                  />
                );
              })
            : null}
        </svg>

        <span className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-[1.625rem] leading-none tabular-nums text-ink-800">
            {centre}
          </span>
          <span className="mt-1 text-[0.6875rem] text-graphite-500">{souscentre}</span>
        </span>
      </div>

      <figcaption className="w-full min-w-0">
        <ul className="flex w-full flex-col gap-2.5">
          {parts.map((part) => (
            <li key={part.libelle} className="flex items-center gap-2.5">
              <span
                aria-hidden="true"
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: part.couleur }}
              />
              <span className="min-w-0 flex-1 truncate text-[0.8125rem] text-graphite-600">
                {part.libelle}
              </span>
              <span className="text-[0.8125rem] font-semibold tabular-nums text-ink-800">
                {part.valeur}
              </span>
              <span className="w-10 text-right text-[0.75rem] tabular-nums text-graphite-400">
                {total > 0 ? `${Math.round((part.valeur / total) * 100)} %` : '—'}
              </span>
            </li>
          ))}
        </ul>
      </figcaption>
    </figure>
  );
}
