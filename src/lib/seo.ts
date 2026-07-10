/** URL helpers shared by metadata generation and focused SEO tests. */

export const DEFAULT_SITE_ORIGIN = 'https://marmibas.dev';

/**
 * Resolves the public site origin used for static metadata.
 *
 * Only a bare HTTPS origin is accepted. A malformed or non-origin value falls
 * back to the production canonical origin so a bad environment value cannot
 * make static rendering fail or publish malformed canonical metadata.
 */
export function siteOriginFromConfiguredUrl(configuredUrl?: string): string {
  if (!configuredUrl) return DEFAULT_SITE_ORIGIN;

  try {
    const url = new URL(configuredUrl);
    if (
      url.protocol === 'https:' &&
      !url.username &&
      !url.password &&
      url.pathname === '/' &&
      !url.search &&
      !url.hash
    ) {
      return url.origin;
    }
  } catch {
    // Use the stable production origin below.
  }

  return DEFAULT_SITE_ORIGIN;
}

export function canonicalUrlFor(currentUrl: URL, siteUrl: string): string {
  const site = siteOriginFromConfiguredUrl(siteUrl);
  const canonical = new URL('/', site);
  canonical.pathname = currentUrl.pathname || '/';
  return canonical.toString();
}

/** Resolves a metadata URL to HTTPS, falling back to a safe local asset. */
export function absoluteUrl(value: string, origin: string, fallback = '/og/default.png'): string {
  const safeOrigin = siteOriginFromConfiguredUrl(origin);

  try {
    const url = new URL(value, safeOrigin);
    if (url.protocol === 'https:') return url.toString();
  } catch {
    // Fall through to the safe asset below.
  }

  return new URL(fallback, safeOrigin).toString();
}
