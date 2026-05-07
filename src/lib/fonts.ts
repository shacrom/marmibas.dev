/**
 * Self-hosted font preload paths.
 *
 * Source: T-07 (TASKS.md). Critical fonts to preload above the fold:
 *   - Fraunces variable (latin) → covers H1/hero (peso 600 al render).
 *   - Inter 400 (latin)         → covers body text on first paint.
 *
 * Consumed by `BaseLayout.astro` (T-16) which emits one
 * `<link rel="preload" as="font" type="font/woff2" crossorigin>` per entry.
 *
 * latin-ext is NOT preloaded: it's only needed when content includes
 * extended-Latin characters (e.g. specific EU diacritics), so we let the
 * browser fetch it on demand based on `unicode-range` in fonts.css.
 *
 * Inter 500/600 and JetBrains Mono 400 are NOT preloaded either — they
 * appear later in the page (UI states, code blocks) and self-load fine
 * with `font-display: swap`.
 */

export interface FontPreload {
  /** Absolute path served from public/fonts/ */
  readonly href: string;
  /** woff2 format identifier — what we ship in v1. */
  readonly type: 'font/woff2';
}

export const CRITICAL_FONT_PRELOADS: readonly FontPreload[] = [
  {
    href: '/fonts/fraunces/fraunces-latin-full-normal.woff2',
    type: 'font/woff2',
  },
  {
    href: '/fonts/inter/inter-latin-400-normal.woff2',
    type: 'font/woff2',
  },
] as const;
