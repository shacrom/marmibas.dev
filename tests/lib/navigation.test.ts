/**
 * Tests for `getPrimaryNav` (`src/lib/navigation.ts`) — T2 terminal redesign.
 *
 * `getPrimaryNav` extracts the primary-nav data that `Header.astro` builds
 * inline today (see `src/components/ui/Header.astro`): route keys and
 * labels via `getRoutePath` / `t('nav.*')`, with ES injecting a decorative
 * `services` entry at index 1 that is NOT a `RouteKey` (hardcoded
 * `/servicios` href, current-detection mirrors the Header's own
 * `pathname === '/servicios' || pathname.startsWith('/servicios/')` check).
 * This file only mirrors that existing behaviour — it does not change it.
 * `Header.astro` itself is not touched in T2.
 *
 * Plan (strict TDD — written and observed RED before
 * `src/lib/navigation.ts` exists):
 *   1. ES: item order, hrefs and `tab` labels match the Header exactly,
 *      including the injected `services` item at index 1.
 *   2. `current` is true only for the item matching the current route
 *      (home path).
 *   3. `current` mirrors the Header's dedicated services sub-route check:
 *      `/servicios/tiendas-online/` marks `services` current (and nothing
 *      else), without touching `work`'s own `isCurrentRoute` result.
 *
 * Spanish is now the only locale (the English version was removed — see
 * `odd/tasks/site-cleanup.md` C2), so the EN-specific cases were dropped.
 */

import { describe, expect, it } from 'vitest';
import { getPrimaryNav } from '../../src/lib/navigation';

describe('getPrimaryNav', () => {
  it('returns the ES nav in Header order, with hrefs and tabs, services injected at index 1', () => {
    const nav = getPrimaryNav('es', '/');

    expect(nav.map((item) => item.key)).toEqual([
      'home',
      'services',
      'work',
      'experience',
      'contact',
    ]);

    expect(nav.map((item) => item.href)).toEqual([
      '/',
      '/servicios',
      '/trabajos',
      '/experiencia',
      '/contacto',
    ]);

    expect(nav.map((item) => item.tab)).toEqual([
      '~/inicio',
      '~/servicios',
      '~/trabajos',
      '~/experiencia',
      '~/contacto',
    ]);
  });

  it('marks only the home item as current when currentPath is the ES home', () => {
    const nav = getPrimaryNav('es', '/');
    const current = nav.filter((item) => item.current).map((item) => item.key);
    expect(current).toEqual(['home']);
  });

  it('marks the services item as current for a services sub-route, mirroring the Header check', () => {
    const nav = getPrimaryNav('es', '/servicios/tiendas-online/');
    const current = nav.filter((item) => item.current).map((item) => item.key);
    expect(current).toEqual(['services']);
  });
});
