/**
 * Tests del helper i18n (`src/i18n/helpers.ts`).
 *
 * Spanish is now the only locale (the English version was removed — see
 * `odd/tasks/site-cleanup.md` C2). `getLangFromUrl` always resolves to the
 * default locale; there is no more `/en` prefix to detect, and
 * `getAlternateUrl`/`localePath` were removed as dead code (their only
 * consumer, `LangSwitcher.astro`, was deleted with the English locale).
 *
 * Plan de tests:
 *   1. getLangFromUrl siempre retorna 'es', incluso para un path que antes
 *      habría sido detectado como EN (no queda ningún prefijo de idioma).
 *   2. getLangFromUrl retorna 'es' (default) para URL sin prefijo lang.
 *   3. useTranslations resuelve key existente en ES y maneja fallback
 *      cuando una key no existe en el dict (devuelve la key como último recurso).
 *   4. getRoutePath('contact', 'es')='/contacto'.
 */

import { describe, expect, it } from 'vitest';
import { getLangFromUrl, getRoutePath, useTranslations } from '../../src/i18n/helpers';
import type { UIKey } from '../../src/i18n/ui';

describe('i18n helpers', () => {
  // -------------------------------------------------------------------------
  // Test 1: getLangFromUrl siempre resuelve al idioma único (ES)
  // -------------------------------------------------------------------------
  it("getLangFromUrl always returns 'es', even for a path that used to be the EN prefix", () => {
    const url = new URL('https://marmibas.dev/en/trabajos');
    expect(getLangFromUrl(url)).toBe('es');
  });

  // -------------------------------------------------------------------------
  // Test 2: getLangFromUrl cae al default cuando no hay prefijo
  // -------------------------------------------------------------------------
  it("getLangFromUrl returns 'es' (default) when no lang prefix is present", () => {
    const url = new URL('https://marmibas.dev/trabajos');
    expect(getLangFromUrl(url)).toBe('es');
  });

  // -------------------------------------------------------------------------
  // Test 3: useTranslations resuelve keys existentes y aplica fallback
  // -------------------------------------------------------------------------
  it('useTranslations resolves existing keys in ES and falls back when key is missing', () => {
    const tEs = useTranslations('es');
    expect(tEs('nav.home')).toBe('Inicio');
    expect(tEs('nav.work')).toBe('Trabajos');

    // Fallback final: una key que no existe en el dict devuelve la key
    // misma (último recurso, ver helpers.ts).
    // Forzamos un cast para simular un dict incompleto.
    const fakeKey = 'nav.nonexistent.key' as unknown as UIKey;
    expect(tEs(fakeKey)).toBe('nav.nonexistent.key');
  });

  // -------------------------------------------------------------------------
  // Test 4: getRoutePath devuelve el path localizado de una RouteKey
  // -------------------------------------------------------------------------
  it('getRoutePath returns the localized path for a RouteKey', () => {
    expect(getRoutePath('contact', 'es')).toBe('/contacto');
  });
});
