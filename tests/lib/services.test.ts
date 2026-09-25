/**
 * Tests for `src/lib/services.ts` — services mosaic data (S1,
 * `odd/tasks/services-mosaic.md`).
 *
 * Covers:
 *   1. `spanishServices` shape: every service has exactly 4 non-empty
 *      "incluye" items, unique slugs, and a display name resolvable for the
 *      mosaic module (`shortTitle` when present, `title` otherwise).
 *   2. `MOSAIC_SLUG_ORDER` / `servicesInMosaicOrder` — the fixed visual
 *      order (E4 mockup NN 01-07), independent from `spanishServices`'
 *      own array order (which stays untouched — the home `ServicesPane`
 *      keeps its pre-existing row order).
 *   3. `drawerInsertIndex` — pure helper mirroring the E4 mockup's
 *      `renderVals()` insertion rule: the open drawer is inserted right
 *      after the last cell of the clicked module's visual row, for a given
 *      column count (4 / 2 / 1 at desktop / tablet / mobile).
 *   4. `drawerNotchPercent` — pure helper for the notch's horizontal
 *      position within the open module's column.
 *
 * Strict TDD: written and observed RED before `src/lib/services.ts` gains
 * these fields/exports.
 */

import { describe, expect, it } from 'vitest';
import {
  spanishServices,
  MOSAIC_SLUG_ORDER,
  servicesInMosaicOrder,
  mosaicDisplayName,
  drawerInsertIndex,
  drawerNotchPercent,
  type SpanishService,
} from '../../src/lib/services';

describe('spanishServices — incluye items', () => {
  it('has exactly 7 services', () => {
    expect(spanishServices).toHaveLength(7);
  });

  it.each(spanishServices.map((service) => [service.slug, service] as const))(
    '%s has exactly 4 non-empty "incluye" items',
    (_slug, service) => {
      expect(service.includes).toHaveLength(4);
      for (const item of service.includes) {
        expect(item.trim().length).toBeGreaterThan(0);
      }
    }
  );

  it('has unique slugs', () => {
    const slugs = spanishServices.map((service) => service.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('has unique keys', () => {
    const keys = spanishServices.map((service) => service.key);
    expect(new Set(keys).size).toBe(keys.length);
  });
});

function findService(slug: string): SpanishService {
  const service = spanishServices.find((candidate) => candidate.slug === slug);
  if (!service) throw new Error(`Fixture service not found: ${slug}`);
  return service;
}

describe('mosaicDisplayName', () => {
  it('uses shortTitle when present (tiendas-online, desarrollo-aplicaciones-web)', () => {
    expect(mosaicDisplayName(findService('tiendas-online'))).toBe('Tiendas online');
    expect(mosaicDisplayName(findService('desarrollo-aplicaciones-web'))).toBe('Aplicaciones web');
  });

  it('falls back to title when shortTitle is absent', () => {
    const management = findService('sistemas-de-gestion');
    expect(mosaicDisplayName(management)).toBe(management.title);
  });
});

describe('MOSAIC_SLUG_ORDER / servicesInMosaicOrder', () => {
  it('lists exactly the 7 service slugs, matching the E4 mockup NN order', () => {
    expect(MOSAIC_SLUG_ORDER).toEqual([
      'tiendas-online',
      'sistemas-de-gestion',
      'automatizaciones',
      'integraciones',
      'desarrollo-aplicaciones-web',
      'aplicaciones-moviles',
      'webs-corporativas',
    ]);
  });

  it('is a reordering of spanishServices’ own slug set (no additions/removals)', () => {
    const mosaicSlugs = [...MOSAIC_SLUG_ORDER].sort();
    const catalogSlugs = spanishServices.map((service) => service.slug).sort();
    expect(mosaicSlugs).toEqual(catalogSlugs);
  });

  it('returns the full service objects in mosaic order', () => {
    const ordered = servicesInMosaicOrder();
    expect(ordered.map((service) => service.slug)).toEqual([...MOSAIC_SLUG_ORDER]);
    expect(ordered).toHaveLength(7);
  });
});

describe('drawerInsertIndex', () => {
  // Mosaic has 7 services + 1 trailing CTA card = 8 flat cells.
  const total = 8;

  it('inserts after the end of a 4-column row (desktop)', () => {
    expect(drawerInsertIndex(0, 4, total)).toBe(4);
    expect(drawerInsertIndex(3, 4, total)).toBe(4);
    expect(drawerInsertIndex(4, 4, total)).toBe(8);
    expect(drawerInsertIndex(6, 4, total)).toBe(8);
  });

  it('clamps to the total cell count when the row overflows it', () => {
    expect(drawerInsertIndex(7, 4, total)).toBe(8);
  });

  it('inserts after the end of a 2-column row (tablet)', () => {
    expect(drawerInsertIndex(0, 2, total)).toBe(2);
    expect(drawerInsertIndex(1, 2, total)).toBe(2);
    expect(drawerInsertIndex(2, 2, total)).toBe(4);
    expect(drawerInsertIndex(7, 2, total)).toBe(8);
  });

  it('inserts right after the open module for a 1-column layout (mobile)', () => {
    expect(drawerInsertIndex(0, 1, total)).toBe(1);
    expect(drawerInsertIndex(7, 1, total)).toBe(8);
  });

  it('throws for a non-positive column count', () => {
    expect(() => drawerInsertIndex(0, 0, total)).toThrow();
    expect(() => drawerInsertIndex(0, -1, total)).toThrow();
  });
});

describe('drawerNotchPercent', () => {
  it('centers the notch within the open module’s column (4 columns)', () => {
    expect(drawerNotchPercent(0, 4)).toBeCloseTo(12.5);
    expect(drawerNotchPercent(1, 4)).toBeCloseTo(37.5);
    expect(drawerNotchPercent(3, 4)).toBeCloseTo(87.5);
    // Wraps within the row: index 4 sits in column 0 of the second row.
    expect(drawerNotchPercent(4, 4)).toBeCloseTo(12.5);
  });

  it('centers the notch for a 2-column layout', () => {
    expect(drawerNotchPercent(0, 2)).toBeCloseTo(25);
    expect(drawerNotchPercent(1, 2)).toBeCloseTo(75);
  });

  it('always centers at 50% for a single column', () => {
    expect(drawerNotchPercent(0, 1)).toBeCloseTo(50);
    expect(drawerNotchPercent(6, 1)).toBeCloseTo(50);
  });

  it('throws for a non-positive column count', () => {
    expect(() => drawerNotchPercent(0, 0)).toThrow();
  });
});
