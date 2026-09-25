/**
 * Pure formatting for the home "cases" pane's terminal-style hashtags
 * (`CasesPane.astro`, T6 terminal redesign). No DOM access — a plain string
 * transform so it can be unit-tested directly.
 *
 * Source of truth: the approved visual spec's own tag line
 * (`CasosTerminal.dc.html`: `#presupuestos #facturas #gestión-de-clientes`,
 * `#multi-empresa`, …) — this module reproduces that exact shape from the
 * pre-existing `featuredCases[].stack` labels (`FeaturedProjects.astro`),
 * nothing invented.
 */

/**
 * Formats a human label as a lowercase, `#`-prefixed, dash-joined tag.
 * Trims surrounding whitespace first; internal runs of whitespace collapse
 * to a single dash. Already-hyphenated words (`'Multi-empresa'`) are left
 * untouched besides lowercasing — only whitespace is replaced.
 */
export function toTag(label: string): string {
  return `#${label.trim().toLowerCase().replace(/\s+/g, '-')}`;
}

/** Maps a whole label list through `toTag` and joins with a single space. */
export function toTags(labels: readonly string[]): string {
  return labels.map(toTag).join(' ');
}
