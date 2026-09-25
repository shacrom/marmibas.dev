/**
 * `getPrimaryNav` — primary-nav data extraction for the terminal header
 * (T2 terminal redesign, `odd/tasks/terminal-redesign.md` T2).
 *
 * Extracts, as pure data, exactly what `src/components/ui/Header.astro`
 * builds inline today: the 4 `RouteKey` nav items (home, work, experience,
 * contact) via `getRoutePath` + `t('nav.*')`, with ES injecting a
 * decorative `services` entry at index 1 (hardcoded `/servicios` href —
 * `services` is not a `RouteKey` in `src/i18n/routes.ts`) whose `current`
 * state mirrors the Header's own dedicated check
 * (`pathname === '/servicios' || pathname.startsWith('/servicios/')`).
 *
 * This module mirrors the existing Header behaviour; it does not change
 * it. `Header.astro` itself is rewired to consume this in T3 (out of T2
 * scope).
 *
 * Adds a terminal-only `tab` label: `~/` + the localised nav label,
 * lower-cased (e.g. ES `~/inicio`, `~/servicios`; EN `~/home`), for the
 * pane-bar-style tabs in DESIGN.md §8.
 */

import { useTranslations, getRoutePath, isCurrentRoute } from '../i18n/helpers';
import type { Language } from '../i18n/ui';
import type { RouteKey } from '../i18n/routes';

export interface PrimaryNavItem {
  /** Route identity. `'services'` is a decorative ES-only key, not a `RouteKey`. */
  key: RouteKey | 'services';
  /** Localised label (`t('nav.*')`). */
  label: string;
  /** Localised href. */
  href: string;
  /** True when `currentPath` matches this item's route (Header parity). */
  current: boolean;
  /** Terminal tab label: `~/` + `label.toLowerCase()`. */
  tab: string;
}

/** Route keys + their label key, in the exact order Header.astro renders them. */
const PRIMARY_ROUTE_NAV: {
  key: RouteKey;
  labelKey: 'nav.home' | 'nav.work' | 'nav.experience' | 'nav.contact';
}[] = [
  { key: 'home', labelKey: 'nav.home' },
  { key: 'work', labelKey: 'nav.work' },
  { key: 'experience', labelKey: 'nav.experience' },
  { key: 'contact', labelKey: 'nav.contact' },
];

/** Hardcoded in Header.astro today — `services` has no `RouteKey` entry. */
const SERVICES_HREF = '/servicios';

/** Index at which Header.astro splices the ES-only `services` item. */
const SERVICES_INSERT_INDEX = 1;

function toTab(label: string): string {
  return `~/${label.toLowerCase()}`;
}

/**
 * Builds the primary-nav item list for `lang`, marking the item matching
 * `currentPath` as `current` — same order, hrefs and current-detection as
 * `Header.astro`.
 */
export function getPrimaryNav(lang: Language, currentPath: string): PrimaryNavItem[] {
  const t = useTranslations(lang);

  const items: PrimaryNavItem[] = PRIMARY_ROUTE_NAV.map(({ key, labelKey }) => {
    const label = t(labelKey);
    return {
      key,
      label,
      href: getRoutePath(key, lang),
      current: isCurrentRoute(currentPath, key, lang),
      tab: toTab(label),
    };
  });

  if (lang === 'es') {
    const label = t('nav.services');
    items.splice(SERVICES_INSERT_INDEX, 0, {
      key: 'services',
      label,
      href: SERVICES_HREF,
      current: currentPath === SERVICES_HREF || currentPath.startsWith(`${SERVICES_HREF}/`),
      tab: toTab(label),
    });
  }

  return items;
}
