/**
 * Tests for `toTag`/`toTags` (`src/lib/case-tags.ts`) — T6 terminal redesign.
 *
 * `CasesPane.astro` renders each case study's existing `stack` array (plain
 * human labels, e.g. `'Gestión de clientes'`) as terminal-style hashtags
 * (`#gestión-de-clientes`), matching `CasosTerminal.dc.html`'s own tag line
 * (`#presupuestos #facturas #gestión-de-clientes`). This module is the pure,
 * unit-tested port of that formatting rule — no DOM/Astro involved.
 *
 * Plan (strict TDD — written and observed RED before `src/lib/case-tags.ts`
 * exists):
 *   1. Single word: lowercased and `#`-prefixed (`'Facturas'` -> `'#facturas'`).
 *   2. Multi-word: spaces collapsed to a single dash, lowercased
 *      (`'Gestión de clientes'` -> `'#gestión-de-clientes'`, the task's own
 *      example).
 *   3. Already-hyphenated words are left as-is, just lowercased and
 *      `#`-prefixed (`'Multi-empresa'` -> `'#multi-empresa'`), matching the
 *      mockup's own `#multi-empresa` tag exactly.
 *   4. Leading/trailing whitespace is trimmed before formatting.
 *   5. `toTags` maps a whole label list and joins the results with a single
 *      space, matching the mockup's `#a #b #c` tag line shape.
 *   6. `toTags` on an empty array returns an empty string.
 */

import { describe, expect, it } from 'vitest';
import { toTag, toTags } from '../../src/lib/case-tags';

describe('toTag', () => {
  it('lowercases a single word and prefixes it with #', () => {
    expect(toTag('Facturas')).toBe('#facturas');
  });

  it('collapses spaces into a single dash (task example)', () => {
    expect(toTag('Gestión de clientes')).toBe('#gestión-de-clientes');
  });

  it('keeps an already-hyphenated word as-is besides lowercasing', () => {
    expect(toTag('Multi-empresa')).toBe('#multi-empresa');
  });

  it('trims leading/trailing whitespace before formatting', () => {
    expect(toTag('  Búsqueda rápida  ')).toBe('#búsqueda-rápida');
  });
});

describe('toTags', () => {
  it('maps a label list and joins with a single space', () => {
    expect(toTags(['Presupuestos', 'Facturas', 'Gestión de clientes'])).toBe(
      '#presupuestos #facturas #gestión-de-clientes'
    );
  });

  it('returns an empty string for an empty list', () => {
    expect(toTags([])).toBe('');
  });
});
