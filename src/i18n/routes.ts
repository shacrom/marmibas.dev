/**
 * Mapping de rutas internas (`RouteKey`) a sus paths localizados.
 *
 * - ES es default y NO lleva prefijo (`prefixDefaultLocale: false`).
 * - EN vive bajo `/en` (definido en `astro.config.mjs`).
 * - Los slugs ES están en español (`/trabajos`, `/proyectos`, `/contacto`,
 *   `/experiencia`) — facilita SEO y UX en mercados hispanohablantes.
 * - Los slugs EN siguen convención inglesa estándar (`/en/work`,
 *   `/en/projects`, `/en/contact`, `/en/experience`).
 *
 * Para añadir una ruta nueva:
 *   1) Añadir entry aquí con paths ES + EN.
 *   2) Crear las páginas correspondientes bajo `src/pages/...` y
 *      `src/pages/en/...`.
 *   3) Si aplica, añadir el label de nav al diccionario en `ui.ts`.
 *
 * Las páginas con `[slug]` (case studies / projects / posts individuales)
 * NO viven aquí: este archivo solo declara routes "raíz" / "índice" para
 * el LangSwitcher, breadcrumbs y nav principal.
 */

import type { Language } from './ui';

export const routes = {
  home: { es: '/', en: '/en/' },
  work: { es: '/trabajos', en: '/en/work' },
  projects: { es: '/proyectos', en: '/en/projects' },
  blog: { es: '/blog', en: '/en/blog' },
  experience: { es: '/experiencia', en: '/en/experience' },
  contact: { es: '/contacto', en: '/en/contact' },
  caseStudies: { es: '/case-studies', en: '/en/case-studies' },
} as const satisfies Record<string, Record<Language, string>>;

export type RouteKey = keyof typeof routes;
