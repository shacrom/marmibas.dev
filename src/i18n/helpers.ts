/**
 * Helpers de i18n: detección de idioma desde URL, traducción de claves UI,
 * resolución de paths localizados y URLs canónicas/alternativas.
 *
 * Convenciones:
 * - ES es el idioma por defecto y vive en la raíz (sin prefijo).
 * - EN vive bajo `/en`.
 * - Configurado en `astro.config.mjs` con `prefixDefaultLocale: false`,
 *   `redirectToDefaultLocale: false`, `fallbackType: 'rewrite'`,
 *   `fallback: { en: 'es' }`.
 *
 * Estos helpers se ejecutan tanto en SSR (endpoint API, build estático)
 * como inyectados en componentes Astro. No usan APIs específicas de Node
 * salvo `import.meta.env`, que Astro polyfilla en cliente.
 */

import { defaultLang, ui, type Language, type UIKey } from './ui';
import { routes, type RouteKey } from './routes';

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
const SITE_URL: string =
  (import.meta.env?.PUBLIC_SITE_URL as string | undefined) ?? 'https://marmibas.dev';

// ---------------------------------------------------------------------------
// getLangFromUrl
// ---------------------------------------------------------------------------

/**
 * Extrae el idioma del path. Cualquier ruta bajo `/en` (con o sin trailing
 * slash) se considera EN; el resto cae al `defaultLang` (ES).
 *
 * Ejemplos:
 *   /                      -> 'es'
 *   /trabajos              -> 'es'
 *   /en                    -> 'en'
 *   /en/                   -> 'en'
 *   /en/work               -> 'en'
 *   /en/work/voxye         -> 'en'
 */
export function getLangFromUrl(url: URL): Language {
  const segments = url.pathname.split('/').filter(Boolean);
  const first = segments[0];
  if (first === 'en') return 'en';
  return defaultLang;
}

// ---------------------------------------------------------------------------
// useTranslations
// ---------------------------------------------------------------------------

/**
 * Devuelve una función `t(key)` que resuelve claves del diccionario `ui.ts`.
 *
 * Estrategia de fallback:
 *   1) Busca la key en el idioma solicitado.
 *   2) Si no existe, cae al `defaultLang` (ES) — este caso solo puede
 *      ocurrir si el tipado se relaja con `as UIKey`; con tipado estricto
 *      todas las keys EN existen porque el dict satisface
 *      `Record<Language, Record<string, string>>`.
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
 *   getRoutePath('work', 'en')    -> '/en/work'
 *   getRoutePath('contact', 'es') -> '/contacto'
 *   getRoutePath('home', 'en')    -> '/en/'
 */
export function getRoutePath(routeKey: RouteKey, lang: Language): string {
  return routes[routeKey][lang];
}

// ---------------------------------------------------------------------------
// localePath
// ---------------------------------------------------------------------------

/**
 * Añade el prefijo `/en` a un path si lang === 'en' y el path no lo lleva
 * todavía. Útil para construir URLs ad-hoc cuando no hay una `RouteKey`
 * declarada (ejemplo: `/blog/${slug}`).
 *
 * Notas:
 * - Si lang === 'es', devuelve el path sin tocar (ES no lleva prefijo).
 * - Si el path ya empieza por `/en` (con `/` final o segmento), no se duplica.
 * - Normaliza el leading slash si falta.
 *
 * Ejemplos:
 *   localePath('/blog/post-1', 'es')   -> '/blog/post-1'
 *   localePath('/blog/post-1', 'en')   -> '/en/blog/post-1'
 *   localePath('/en/blog/post-1', 'en')-> '/en/blog/post-1' (no duplica)
 *   localePath('blog/post-1', 'en')    -> '/en/blog/post-1'
 */
export function localePath(path: string, lang: Language): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  if (lang === defaultLang) return normalized;
  if (normalized === '/en' || normalized.startsWith('/en/')) return normalized;
  return `/en${normalized}`;
}

// ---------------------------------------------------------------------------
// getAlternateUrl
// ---------------------------------------------------------------------------

/**
 * Dado un URL actual, devuelve el path equivalente en el `targetLang`.
 *
 * Estrategia:
 *   1) Detecta el idioma actual a partir del URL.
 *   2) Si ya está en el `targetLang`, devuelve el pathname tal cual.
 *   3) Busca un `RouteKey` cuyo path en el idioma actual sea prefijo del
 *      pathname actual. Si lo encuentra, swappea el prefijo por el path
 *      del `targetLang`, conservando el sufijo (slug, query, etc.).
 *   4) Si no encuentra match, cae a la home del `targetLang`.
 *
 * Pensado para:
 *   - `<link rel="alternate" hreflang>` en `<head>` (T-16 SeoHead).
 *   - LangSwitcher (T-19).
 *
 * Ejemplos:
 *   /trabajos          + 'en' -> '/en/work'
 *   /trabajos/voxye    + 'en' -> '/en/work/voxye'
 *   /en/blog/post-1    + 'es' -> '/blog/post-1'
 *   /                  + 'en' -> '/en/'
 *   /ruta-inventada    + 'en' -> '/en/' (fallback home)
 */
export function getAlternateUrl(currentUrl: URL, targetLang: Language): string {
  const currentLang = getLangFromUrl(currentUrl);
  const pathname = currentUrl.pathname;

  if (currentLang === targetLang) return pathname;

  // Recorremos las routes ordenadas por longitud DESC del path en el lang
  // actual: garantiza que rutas más específicas matcheen antes que `/`
  // (que es prefijo de todo).
  const routeEntries = (Object.keys(routes) as RouteKey[])
    .map((key) => ({ key, currentPath: routes[key][currentLang] }))
    .sort((a, b) => b.currentPath.length - a.currentPath.length);

  for (const { key, currentPath } of routeEntries) {
    // Match exacto a la ruta raíz (con o sin trailing slash).
    if (
      pathname === currentPath ||
      pathname === `${currentPath}/` ||
      (currentPath.endsWith('/') && pathname === currentPath.slice(0, -1))
    ) {
      return routes[key][targetLang];
    }

    // Match por prefijo (ruta dinámica: /trabajos/voxye, /en/blog/post-1).
    // Excluimos `home` porque su path ('/' o '/en/') matchearía cualquier
    // pathname y rompería la detección de las demás rutas.
    if (key === 'home') continue;

    const prefix = currentPath.endsWith('/') ? currentPath : `${currentPath}/`;
    if (pathname.startsWith(prefix)) {
      const suffix = pathname.slice(currentPath.length);
      const targetBase = routes[key][targetLang];
      // Evita doble slash si el target base ya termina en `/`.
      if (targetBase.endsWith('/') && suffix.startsWith('/')) {
        return `${targetBase}${suffix.slice(1)}`;
      }
      return `${targetBase}${suffix}`;
    }
  }

  // Sin match: fallback a la home del idioma destino.
  return routes.home[targetLang];
}

// ---------------------------------------------------------------------------
// getCanonicalUrl
// ---------------------------------------------------------------------------

/**
 * Construye la URL canónica absoluta del request actual usando `SITE_URL`
 * como origen. Mantiene el pathname tal cual (incluye prefijo `/en` cuando
 * aplica) y descarta query string + hash (canonical no debe variar por
 * params de tracking, filtros, etc.).
 *
 * Si por algún motivo el pathname queda vacío, se normaliza a `/`.
 *
 * Ejemplos (con SITE_URL = 'https://marmibas.dev'):
 *   new URL('http://localhost:4321/trabajos')        -> 'https://marmibas.dev/trabajos'
 *   new URL('https://x.dev/en/blog/post-1?utm=x')    -> 'https://marmibas.dev/en/blog/post-1'
 *   new URL('https://x.dev/')                        -> 'https://marmibas.dev/'
 */
export function getCanonicalUrl(currentUrl: URL): string {
  const base = SITE_URL.endsWith('/') ? SITE_URL.slice(0, -1) : SITE_URL;
  const pathname = currentUrl.pathname || '/';
  return `${base}${pathname}`;
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
 * - Para la home (path '/' o '/en/'): solo coincide si el currentPath es
 *   EXACTAMENTE la home (con o sin trailing slash). Cualquier otra ruta
 *   no la marca como activa, porque '/' sería prefijo de todo.
 * - Para el resto: coincide si el currentPath es exactamente la ruta o
 *   empieza por `routePath/` (subrutas dinámicas: `/trabajos/voxye` marca
 *   `work` como activa).
 *
 * Ejemplos:
 *   isCurrentRoute('/', 'home', 'es')                  -> true
 *   isCurrentRoute('/trabajos', 'home', 'es')          -> false
 *   isCurrentRoute('/trabajos', 'work', 'es')          -> true
 *   isCurrentRoute('/trabajos/voxye', 'work', 'es')    -> true
 *   isCurrentRoute('/en/blog/post-1', 'blog', 'en')    -> true
 *   isCurrentRoute('/en', 'home', 'en')                -> true
 *   isCurrentRoute('/en/', 'home', 'en')               -> true
 */
export function isCurrentRoute(
  currentPath: string,
  routeKey: RouteKey,
  lang: Language,
): boolean {
  const routePath = routes[routeKey][lang];

  // Normalizamos comparando sin trailing slash final salvo que sea '/'.
  const stripTrail = (p: string): string =>
    p.length > 1 && p.endsWith('/') ? p.slice(0, -1) : p;

  const cur = stripTrail(currentPath);
  const target = stripTrail(routePath);

  if (routeKey === 'home') {
    return cur === target;
  }

  if (cur === target) return true;
  return cur.startsWith(`${target}/`);
}
