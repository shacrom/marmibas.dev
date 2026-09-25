/**
 * Helpers de i18n: detección de idioma desde URL, traducción de claves UI,
 * resolución de paths localizados y URL canónica.
 *
 * Convenciones:
 * - ES es el único idioma publicado y vive en la raíz (sin prefijo).
 * - La versión en inglés (`/en/*`) se eliminó — ver
 *   `odd/tasks/site-cleanup.md` C2. `getAlternateUrl` y `localePath` se
 *   retiraron con ella (su único consumidor era `LangSwitcher.astro`,
 *   también eliminado); el resto de estos helpers conserva su parámetro
 *   `lang: Language` para quedar listos si se reintroduce un segundo idioma.
 *
 * Estos helpers se ejecutan tanto en SSR (endpoint API, build estático)
 * como inyectados en componentes Astro. No usan APIs específicas de Node
 * salvo `import.meta.env`, que Astro polyfilla en cliente.
 */

import { defaultLang, ui, type Language, type UIKey } from './ui';
import { routes, type RouteKey } from './routes';
import { canonicalUrlFor, siteOriginFromConfiguredUrl } from '../lib/seo';

// ---------------------------------------------------------------------------
// Site URL — leído de env, con fallback hardcoded para desarrollo local.
// ---------------------------------------------------------------------------

/**
 * URL pública del sitio. Usada para canonicals y URLs absolutas en JSON-LD,
 * og:url, etc. Lee `PUBLIC_SITE_URL` de env (Astro la expone en server y
 * cliente porque tiene el prefijo `PUBLIC_`).
 *
 * Fallback: `https://marmibas.dev` (dominio canónico del proyecto).
 */
const SITE_URL = siteOriginFromConfiguredUrl(import.meta.env?.PUBLIC_SITE_URL as string | undefined);

// ---------------------------------------------------------------------------
// getLangFromUrl
// ---------------------------------------------------------------------------

/**
 * Extrae el idioma del path. ES es el único idioma publicado, así que esto
 * siempre resuelve a `defaultLang` — se mantiene como función (en vez de
 * usar `defaultLang` directamente en cada call site) para que reintroducir
 * un segundo idioma solo implique restaurar la detección de prefijo aquí.
 *
 * Ejemplos:
 *   /              -> 'es'
 *   /trabajos      -> 'es'
 */
export function getLangFromUrl(_url: URL): Language {
  return defaultLang;
}

// ---------------------------------------------------------------------------
// useTranslations
// ---------------------------------------------------------------------------

/**
 * Devuelve una función `t(key)` que resuelve claves del diccionario `ui.ts`.
 *
 * Estrategia de fallback:
 *   1) Busca la key en el idioma solicitado (hoy, siempre ES).
 *   2) Si no existe, cae al `defaultLang` (ES) — con un único idioma esto
 *      es un no-op, pero queda listo para cuando el dict tenga más de un
 *      idioma y una key nueva llegue sin traducir todavía.
 *   3) Si tampoco existe en ES, devuelve la key tal cual como último recurso
 *      (visible en UI: facilita detectar typos en revisión).
 *
 * El tipo de `key` es `UIKey`, derivado de `ui.es` en `ui.ts`. Eso garantiza
 * que cualquier clave nueva debe estar al menos en ES.
 */
export function useTranslations(lang: Language): (key: UIKey) => string {
  const dict = ui[lang] as Record<string, string>;
  const fallbackDict = ui[defaultLang] as Record<string, string>;

  return function t(key: UIKey): string {
    const value = dict[key];
    if (value !== undefined) return value;

    const fallbackValue = fallbackDict[key];
    if (fallbackValue !== undefined) return fallbackValue;

    return key;
  };
}

// ---------------------------------------------------------------------------
// getRoutePath
// ---------------------------------------------------------------------------

/**
 * Devuelve el path localizado para una `RouteKey` y un idioma.
 *
 * Ejemplos:
 *   getRoutePath('work', 'es')    -> '/trabajos'
 *   getRoutePath('contact', 'es') -> '/contacto'
 */
export function getRoutePath(routeKey: RouteKey, lang: Language): string {
  return routes[routeKey][lang];
}

// ---------------------------------------------------------------------------
// getCanonicalUrl
// ---------------------------------------------------------------------------

/**
 * Construye la URL canónica absoluta del request actual usando `SITE_URL`
 * como origen. Mantiene el pathname tal cual y descarta query string + hash
 * (canonical no debe variar por params de tracking, filtros, etc.).
 *
 * Si por algún motivo el pathname queda vacío, se normaliza a `/`.
 *
 * Ejemplos (con SITE_URL = 'https://marmibas.dev'):
 *   new URL('http://localhost:4321/trabajos') -> 'https://marmibas.dev/trabajos'
 *   new URL('https://x.dev/?utm=x')            -> 'https://marmibas.dev/'
 */
export function getCanonicalUrl(currentUrl: URL): string {
  return canonicalUrlFor(currentUrl, SITE_URL);
}

// ---------------------------------------------------------------------------
// isCurrentRoute
// ---------------------------------------------------------------------------

/**
 * Indica si el `currentPath` corresponde a la `RouteKey` dada en el idioma
 * indicado. Útil para resaltar el item activo del nav (`aria-current="page"`
 * + estilo activo).
 *
 * Reglas:
 * - Para la home (path '/'): solo coincide si el currentPath es EXACTAMENTE
 *   la home (con o sin trailing slash). Cualquier otra ruta no la marca
 *   como activa, porque '/' sería prefijo de todo.
 * - Para el resto: coincide si el currentPath es exactamente la ruta o
 *   empieza por `routePath/` (subrutas dinámicas: `/trabajos/voxye` marca
 *   `work` como activa).
 *
 * Ejemplos:
 *   isCurrentRoute('/', 'home', 'es')                  -> true
 *   isCurrentRoute('/trabajos', 'home', 'es')          -> false
 *   isCurrentRoute('/trabajos', 'work', 'es')          -> true
 *   isCurrentRoute('/trabajos/voxye', 'work', 'es')    -> true
 */
export function isCurrentRoute(currentPath: string, routeKey: RouteKey, lang: Language): boolean {
  const routePath = routes[routeKey][lang];

  // Normalizamos comparando sin trailing slash final salvo que sea '/'.
  const stripTrail = (p: string): string => (p.length > 1 && p.endsWith('/') ? p.slice(0, -1) : p);

  const cur = stripTrail(currentPath);
  const target = stripTrail(routePath);

  if (routeKey === 'home') {
    return cur === target;
  }

  if (cur === target) return true;
  return cur.startsWith(`${target}/`);
}
