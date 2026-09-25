/**
 * Mapping de rutas internas (`RouteKey`) a sus paths localizados.
 *
 * - ES es el único idioma publicado y NO lleva prefijo
 *   (`prefixDefaultLocale: false`). La versión en inglés (`/en/*`) se
 *   eliminó — ver `odd/tasks/site-cleanup.md` C2.
 * - Los slugs ES están en español (`/trabajos`, `/proyectos`, `/contacto`,
 *   `/experiencia`) — facilita SEO y UX en mercados hispanohablantes.
 * - Cada entry sigue siendo `Record<Language, string>` (hoy solo `es`)
 *   deliberadamente, para que añadir un idioma en el futuro sea solo sumar
 *   su clave aquí y su página bajo `src/pages/<lang>/...`.
 *
 * Para añadir una ruta nueva:
 *   1) Añadir entry aquí con su path ES.
 *   2) Crear la página correspondiente bajo `src/pages/...`.
 *   3) Si aplica, añadir el label de nav al diccionario en `ui.ts`.
 *
 * Las páginas con `[slug]` (case studies / projects individuales) NO viven
 * aquí: este archivo solo declara routes "raíz" / "índice" para breadcrumbs
 * y nav principal.
 */

import type { Language } from './ui';

export const routes = {
  home: { es: '/' },
  work: { es: '/trabajos' },
  projects: { es: '/proyectos' },
  experience: { es: '/experiencia' },
  contact: { es: '/contacto' },
  caseStudies: { es: '/case-studies' },
} as const satisfies Record<string, Record<Language, string>>;

export type RouteKey = keyof typeof routes;
