/**
 * Pure grouping/counting/filtering for the `/trabajos` index's `grep
 * --autoria` filter group (`WorkIndex.astro`, terminal redesign W1). No DOM
 * access — a plain data transform so it can be unit-tested directly
 * (`tests/lib/work-attribution.test.ts`, written first per strict TDD).
 *
 * Source of truth: `Trabajos.dc.html`'s filter row — `todos · 3`,
 * `producto propio · 1`, `con Plazasys · 2` — built from the three real
 * case studies' `attribution` frontmatter (`voxye`: "Producto propio";
 * `recetas-novatex`/`visomos`: "Con Plazasys"), not hardcoded.
 *
 * Bucket order follows FIRST OCCURRENCE in the input list, not alphabetical
 * sort — `WorkIndex.astro` passes items already sorted by the case studies'
 * own `order` frontmatter, so this reproduces the mockup's own
 * "producto propio" before "con Plazasys" ordering for free.
 *
 * Bucket `label` only lowercases the attribution's FIRST character — a
 * plain `.toLowerCase()` would wrongly turn "Con Plazasys" into
 * "con plazasys", losing the brand name's own casing. The mockup's own
 * label is "con Plazasys" (only "Con" -> "con"), so that is the rule this
 * module encodes.
 */

/** Minimal shape this module needs from a work item. */
export interface AttributedItem {
  /** Case study's `attribution` frontmatter. Optional — schema-optional field. */
  attribution?: string;
}

export interface AttributionBucket {
  /** Stable, ASCII-lowercase-dash slug — used as `data-bucket-id` in markup. */
  id: string;
  /** Display label, shown as `"{label} · {count}"` in the filter button. */
  label: string;
  count: number;
}

/** Bucket id/label for the "show everything" filter — always first. */
export const ALL_BUCKET_ID = 'todos';
const ALL_BUCKET_LABEL = 'todos';

/** Lowercases only the first character; the rest of the string is untouched. */
function lowercaseFirst(value: string): string {
  if (value.length === 0) return value;
  return value.charAt(0).toLowerCase() + value.slice(1);
}

/** ASCII-lowercase-dash slug — ties a display label to a stable bucket id. */
function slugify(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, '-');
}

/**
 * Builds the filter bucket list: `'todos'` first (always present, counts
 * every item), then one bucket per distinct `attribution`, in first-
 * occurrence order. Items with no `attribution` still count toward
 * `'todos'` but never create or inflate a per-attribution bucket.
 */
export function getAttributionBuckets(items: readonly AttributedItem[]): AttributionBucket[] {
  const buckets: AttributionBucket[] = [
    { id: ALL_BUCKET_ID, label: ALL_BUCKET_LABEL, count: items.length },
  ];
  const byId = new Map<string, AttributionBucket>();

  for (const item of items) {
    const attribution = item.attribution;
    if (!attribution) continue;

    const id = slugify(attribution);
    const existing = byId.get(id);
    if (existing) {
      existing.count += 1;
      continue;
    }

    const bucket: AttributionBucket = { id, label: lowercaseFirst(attribution), count: 1 };
    byId.set(id, bucket);
    buckets.push(bucket);
  }

  return buckets;
}

/**
 * Filters `items` down to the ones belonging to `bucketId`. `'todos'`
 * returns every item unchanged (a shallow copy). An item with no
 * `attribution` never matches a real bucket id, and an unknown bucket id
 * simply matches nothing.
 */
export function filterByAttribution<T extends AttributedItem>(
  items: readonly T[],
  bucketId: string
): T[] {
  if (bucketId === ALL_BUCKET_ID) return [...items];
  return items.filter(
    (item) => item.attribution !== undefined && slugify(item.attribution) === bucketId
  );
}

/**
 * Public wrapper around the same slug rule `getAttributionBuckets` uses
 * internally — lets `WorkIndex.astro` tag each rendered case (`data-bucket`)
 * with the exact id its filter buttons expect, without duplicating the
 * slug logic. `undefined` in, `undefined` out (no attribution, no bucket).
 */
export function attributionBucketId(attribution: string | undefined): string | undefined {
  return attribution === undefined ? undefined : slugify(attribution);
}
