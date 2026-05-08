/**
 * Tests del helper i18n (`src/i18n/helpers.ts`).
 *
 * Plan de tests (ver TASKS.md T-54):
 *   1. getLangFromUrl retorna 'en' para URL con prefijo /en/
 *   2. getLangFromUrl retorna 'es' (default) para URL sin prefijo lang
 *   3. useTranslations resuelve key existente en ES y maneja fallback
 *      cuando una key no existe en el dict (devuelve la key como último recurso)
 *   4. getRoutePath('contact', 'es')='/contacto' y ('contact','en')='/en/contact'
 *   5. getAlternateUrl swap del prefijo ES→EN para una ruta declarada
 */

import { describe, expect, it } from 'vitest';
import {
  getAlternateUrl,
  getLangFromUrl,
  getRoutePath,
  useTranslations,
} from '../../src/i18n/helpers';
import type { UIKey } from '../../src/i18n/ui';

describe('i18n helpers', () => {
  // -------------------------------------------------------------------------
  // Test 1: getLangFromUrl detecta prefijo /en/
  // -------------------------------------------------------------------------
  it("getLangFromUrl returns 'en' for URLs under /en/ prefix", () => {
    const url = new URL('https://marmibas.dev/en/trabajos');
    expect(getLangFromUrl(url)).toBe('en');
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

    // EN dict cubre todas las keys (garantizado por el `satisfies` en ui.ts).
    // Esta es la rama "happy path" en EN.
    const tEn = useTranslations('en');
    expect(tEn('nav.home')).toBe('Home');

    // Fallback final: una key que no existe en ningún dict devuelve la key
    // misma (último recurso, ver helpers.ts línea 87).
    // Forzamos un cast para simular un dict incompleto.
    const fakeKey = 'nav.nonexistent.key' as unknown as UIKey;
    expect(tEn(fakeKey)).toBe('nav.nonexistent.key');
  });

  // -------------------------------------------------------------------------
  // Test 4: getRoutePath devuelve el path localizado de una RouteKey
  // -------------------------------------------------------------------------
  it('getRoutePath returns the localized path for a RouteKey', () => {
    expect(getRoutePath('contact', 'es')).toBe('/contacto');
    expect(getRoutePath('contact', 'en')).toBe('/en/contact');
  });

  // -------------------------------------------------------------------------
  // Test 5: getAlternateUrl traduce el prefijo ES → EN para rutas declaradas
  // -------------------------------------------------------------------------
  it('getAlternateUrl swaps the lang prefix correctly for declared routes', () => {
    const url = new URL('https://marmibas.dev/trabajos');
    expect(getAlternateUrl(url, 'en')).toBe('/en/work');
  });
});
