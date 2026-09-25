/**
 * Tests for `src/lib/work-case-display.ts` — small display helpers shared by
 * the `/trabajos` index (W1) and the case study page (W2), both terminal
 * redesign tasks.
 *
 * Plan (strict TDD — written and observed RED before
 * `work-case-display.ts` exists):
 *
 *   `hostnameLabel`:
 *     1. Strips the protocol from an https URL, matching the mockup's own
 *        "voxye.es" (from `externalUrl: "https://voxye.es"`).
 *     2. Strips a leading "www." so "https://www.novatex.es/" reads
 *        "novatex.es", not "www.novatex.es".
 *     3. Drops the path/query/hash — only the bare host is shown.
 *     4. Falls back to the raw input if it is not a parseable URL, so a
 *        malformed value in content never throws at build time.
 *
 *   `getLogoFit`:
 *     5. Defaults to `'contain'` for a transparent-mark logo (Voxye,
 *        Visomo's) — it sits padded inside the dark/white tile.
 *     6. Returns `'cover'` for `recetas-novatex` specifically: its own
 *        `public/logos/novatex.jpg` already ships a full dark background
 *        baked into the image (confirmed by inspection), so containing it
 *        with extra padding would double the border instead of blending
 *        into the tile — see the module's own docblock.
 */

import { describe, expect, it } from 'vitest';
import { getLogoFit, hostnameLabel } from '../../src/lib/work-case-display';

describe('hostnameLabel', () => {
  it('strips the protocol from an https URL', () => {
    expect(hostnameLabel('https://voxye.es')).toBe('voxye.es');
  });

  it('strips a leading www.', () => {
    expect(hostnameLabel('https://www.novatex.es/')).toBe('novatex.es');
  });

  it('drops the path, query and hash', () => {
    expect(hostnameLabel('https://visomos.com/producto?ref=trabajos#top')).toBe('visomos.com');
  });

  it('falls back to the raw input for a non-parseable value', () => {
    expect(hostnameLabel('not-a-url')).toBe('not-a-url');
  });
});

describe('getLogoFit', () => {
  it('defaults to "contain" for a transparent-mark logo', () => {
    expect(getLogoFit('voxye')).toBe('contain');
    expect(getLogoFit('visomos')).toBe('contain');
  });

  it('returns "cover" for recetas-novatex, whose logo already fills the tile', () => {
    expect(getLogoFit('recetas-novatex')).toBe('cover');
  });
});
