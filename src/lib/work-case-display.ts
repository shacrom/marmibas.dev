/**
 * Small pure display helpers shared by the `/trabajos` index (W1) and the
 * case study page (W2), both terminal redesign tasks. No DOM access — see
 * `tests/lib/work-case-display.test.ts` (written first per strict TDD).
 */

/**
 * Bare-domain label for an external product/company URL — the mockups show
 * `voxye.es ↗` next to the raw `externalUrl: "https://voxye.es"`, never the
 * full URL with protocol/path. Strips a leading `www.` too, so
 * `"https://www.novatex.es/"` reads `"novatex.es"`.
 *
 * Falls back to the raw input for anything `URL` can't parse, so a
 * malformed value in content frontmatter never throws at build time — the
 * fallback is a visible, debuggable string rather than a build failure.
 */
export function hostnameLabel(url: string): string {
  try {
    const { hostname } = new URL(url);
    return hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

/** How a case study's logo tile should fit its image inside the tile. */
export type LogoFit = 'contain' | 'cover';

/**
 * Logos whose own image already fills its full square with a solid/dark
 * background baked in — `public/logos/novatex.jpg` (confirmed by visual
 * inspection: a 200x200 JPEG with an opaque dark-grey background, not a
 * transparent mark). Containing it with the usual tile padding would leave
 * a visible seam between the tile's own background and the image's — cover
 * fill blends it into the tile edge-to-edge instead, per the owner-approved
 * mockup's own note for this case.
 *
 * Every other case study logo (`voxye.svg`, `visomos.svg`) is a transparent
 * mark and uses the default `'contain'` fit, padded inside the tile.
 */
const COVER_FIT_SLUGS = new Set(['recetas-novatex']);

export function getLogoFit(slug: string): LogoFit {
  return COVER_FIT_SLUGS.has(slug) ? 'cover' : 'contain';
}
