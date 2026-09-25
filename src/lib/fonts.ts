/**
 * Self-hosted font preload paths.
 *
 * Source: B3 · Terminal redesign (T1). Critical fonts to preload above the fold:
 *   - Space Mono 700 (latin) → covers H1/hero display weight at render.
 *   - IBM Plex Mono 400 (latin) → covers body text on first paint.
 *
 * Consumed by `BaseLayout.astro` which emits one
 * `<link rel="preload" as="font" type="font/woff2" crossorigin>` per entry.
 *
 * latin-ext is NOT preloaded: it's only needed when content includes
 * extended-Latin characters (e.g. specific EU diacritics), so we let the
 * browser fetch it on demand based on `unicode-range` in fonts.css.
 *
 * IBM Plex Mono 500/600 and Space Mono 400 are NOT preloaded either — they
 * appear later in the page (UI states, secondary display text) and
 * self-load fine with `font-display: swap`.
 */

export interface FontPreload {
  /** Absolute path served from public/fonts/ */
  readonly href: string;
  /** woff2 format identifier — what we ship in v1. */
  readonly type: 'font/woff2';
}

export const CRITICAL_FONT_PRELOADS: readonly FontPreload[] = [
  {
    href: '/fonts/space-mono/space-mono-latin-700-normal.woff2',
    type: 'font/woff2',
  },
  {
    href: '/fonts/ibm-plex-mono/ibm-plex-mono-latin-400-normal.woff2',
    type: 'font/woff2',
  },
] as const;
