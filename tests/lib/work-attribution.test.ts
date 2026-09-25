/**
 * Tests for `src/lib/work-attribution.ts` (W1, terminal redesign of
 * `/trabajos`).
 *
 * `WorkIndex.astro` renders a `grep --autoria` filter group above the case
 * study list (`Trabajos.dc.html`: `todos · 3`, `producto propio · 1`,
 * `con Plazasys · 2`). The bucket list and its counts must come from the
 * case studies' own `attribution` frontmatter, not be hardcoded — this
 * module is the pure, unit-tested derivation (no DOM/Astro involved).
 *
 * Plan (strict TDD — written and observed RED before `work-attribution.ts`
 * exists):
 *   1. `getAttributionBuckets` always includes an `'todos'` bucket counting
 *      every item, even when the list is empty.
 *   2. Each distinct `attribution` becomes its own bucket, counted, in
 *      FIRST-OCCURRENCE order (not alphabetical) — matches the mockup's own
 *      "producto propio" before "con Plazasys" ordering, which follows the
 *      case studies' `order` frontmatter, not alphabetical sort.
 *   3. Repeated attributions aggregate into the same bucket instead of
 *      duplicating it.
 *   4. Bucket `label` only lowercases the FIRST character of the raw
 *      attribution string — matches the mockup exactly: "Producto propio"
 *      -> "producto propio", but "Con Plazasys" -> "con Plazasys" (the
 *      brand name "Plazasys" stays capitalized, a plain `.toLowerCase()`
 *      would wrongly yield "con plazasys").
 *   5. Bucket `id` is a stable, ASCII-lowercase-dash slug of the
 *      attribution, decoupled from the display label's casing.
 *   6. Items with no `attribution` (schema field is optional) still count
 *      toward `'todos'` but do not create or inflate any per-attribution
 *      bucket.
 *   7. `filterByAttribution('todos', items)` returns every item unchanged.
 *   8. `filterByAttribution(<bucket id>, items)` returns only the items
 *      whose attribution slugs to that id; an unknown id returns an empty
 *      list; an item with no `attribution` never matches a real bucket id.
 */

import { describe, expect, it } from 'vitest';
import {
  ALL_BUCKET_ID,
  attributionBucketId,
  filterByAttribution,
  getAttributionBuckets,
  type AttributedItem,
} from '../../src/lib/work-attribution';

describe('getAttributionBuckets', () => {
  it('includes a "todos" bucket counting every item, even when empty', () => {
    expect(getAttributionBuckets([])).toEqual([{ id: ALL_BUCKET_ID, label: 'todos', count: 0 }]);
  });

  it('creates one bucket per distinct attribution, in first-occurrence order', () => {
    const items: AttributedItem[] = [
      { attribution: 'Producto propio' },
      { attribution: 'Con Plazasys' },
      { attribution: 'Con Plazasys' },
    ];

    expect(getAttributionBuckets(items)).toEqual([
      { id: ALL_BUCKET_ID, label: 'todos', count: 3 },
      { id: 'producto-propio', label: 'producto propio', count: 1 },
      { id: 'con-plazasys', label: 'con Plazasys', count: 2 },
    ]);
  });

  it('aggregates repeated attributions instead of duplicating the bucket', () => {
    const items: AttributedItem[] = [
      { attribution: 'Con Plazasys' },
      { attribution: 'Con Plazasys' },
      { attribution: 'Con Plazasys' },
    ];

    const buckets = getAttributionBuckets(items);
    expect(buckets).toHaveLength(2);
    expect(buckets[1]).toEqual({ id: 'con-plazasys', label: 'con Plazasys', count: 3 });
  });

  it('lowercases only the first character of the label (brand names stay cased)', () => {
    const buckets = getAttributionBuckets([{ attribution: 'Con Plazasys' }]);
    expect(buckets[1]?.label).toBe('con Plazasys');
  });

  it('items without an attribution count toward "todos" but create no bucket', () => {
    const items: AttributedItem[] = [
      { attribution: 'Producto propio' },
      { attribution: undefined },
    ];

    expect(getAttributionBuckets(items)).toEqual([
      { id: ALL_BUCKET_ID, label: 'todos', count: 2 },
      { id: 'producto-propio', label: 'producto propio', count: 1 },
    ]);
  });
});

describe('filterByAttribution', () => {
  const items: AttributedItem[] = [
    { attribution: 'Producto propio' },
    { attribution: 'Con Plazasys' },
    { attribution: 'Con Plazasys' },
  ];

  it('returns every item for the "todos" bucket', () => {
    expect(filterByAttribution(items, ALL_BUCKET_ID)).toEqual(items);
  });

  it('returns only items matching a real bucket id', () => {
    expect(filterByAttribution(items, 'con-plazasys')).toEqual([
      { attribution: 'Con Plazasys' },
      { attribution: 'Con Plazasys' },
    ]);
  });

  it('returns an empty list for an unknown bucket id', () => {
    expect(filterByAttribution(items, 'no-existe')).toEqual([]);
  });

  it('never matches an item with no attribution against a real bucket id', () => {
    const withUnattributed: AttributedItem[] = [...items, { attribution: undefined }];
    expect(filterByAttribution(withUnattributed, 'con-plazasys')).toEqual([
      { attribution: 'Con Plazasys' },
      { attribution: 'Con Plazasys' },
    ]);
  });
});

describe('attributionBucketId', () => {
  it('slugs an attribution string the same way getAttributionBuckets does', () => {
    expect(attributionBucketId('Con Plazasys')).toBe('con-plazasys');
    expect(attributionBucketId('Producto propio')).toBe('producto-propio');
  });

  it('returns undefined for a missing attribution', () => {
    expect(attributionBucketId(undefined)).toBeUndefined();
  });
});
