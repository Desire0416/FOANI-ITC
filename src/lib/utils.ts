/**
 * Concaténation conditionnelle de classes.
 * Volontairement écrit ici plutôt qu'importé : trois lignes ne justifient pas
 * une dépendance de plus dans un site dont le poids est une exigence (CDC §19.5).
 */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

/** Retire les accents et la ponctuation pour produire une clé de recherche. */
export function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/** Formate un entier en francs CFA, sans décimale. */
export function formatXof(amount: number): string {
  return `${new Intl.NumberFormat('fr-FR').format(Math.round(amount))} FCFA`;
}

/** Formate une date ISO pour un lecteur francophone d'Abidjan. */
export function formatDate(iso: string, options?: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Africa/Abidjan',
    ...options,
  }).format(new Date(iso));
}
