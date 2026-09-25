/**
 * Pure logic for the home "interactive demo" pane (`DemoPane.astro`, T5
 * terminal redesign). No DOM access anywhere in this module — every
 * function is a plain data transform so it can be unit-tested directly and
 * reused identically from the pane's client-side `<script>`.
 *
 * Source of truth for the exact formulas/labels below: the approved visual
 * spec's embedded logic (`DemoTerminal.dc.html` / `DemoTerminalMovil.dc.html`,
 * `<script type="text/x-dc">`) — this module is a typed, tested port of that
 * reference implementation, not a reinterpretation of it.
 */

/** A single row of the panel-3 "spreadsheet-to-app" demo table. */
export interface DemoTableRow {
  client: string;
  product: string;
  date: string;
  amount: number;
  status: string;
}

/**
 * es-ES–style thousands grouping: a `.` every 3 digits from the right,
 * only once the number reaches 1000 (below that, no separator at all).
 *
 * Deliberately NOT `Intl.NumberFormat` — that API has no portable way to
 * express "group only at/above 1000" across JS engines without relying on
 * `minimumGroupingDigits`, which the task brief explicitly rules out as
 * non-deterministic tooling. A plain regex replace on the integer's digits
 * reproduces the same result deterministically: below 1000 the lookahead
 * below never has 3+ trailing digits to group, so it naturally emits no
 * separator; matches the mockup's own `fmt()` helper exactly.
 */
export function formatThousands(n: number): string {
  const sign = n < 0 ? '-' : '';
  const digits = String(Math.trunc(Math.abs(n)));
  return sign + digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/**
 * Advances each RUNNING machine's count by its own `rates` entry; a
 * stopped machine's count is left untouched. Returns a new array (never
 * mutates `counts`), matching the spec's `setInterval` tick.
 */
export function tickCounts(
  counts: readonly number[],
  running: readonly boolean[],
  rates: readonly number[] = [3, 2, 1]
): number[] {
  return counts.map((count, i) => (running[i] ? count + (rates[i] ?? 0) : count));
}

/**
 * Today's total production: `base` (earlier shifts) plus EVERY machine's
 * count — running or not. A stopped machine keeps whatever it already
 * produced; stopping it doesn't erase past output, it just stops it from
 * accumulating further (see `tickCounts`, which only advances running
 * machines).
 */
export function productionTotal(counts: readonly number[], base: number): number {
  return base + counts.reduce((sum, count) => sum + count, 0);
}

/** Stop count: `base` (earlier stops) plus every machine NOT currently running. */
export function stopsCount(running: readonly boolean[], base: number): number {
  return base + running.filter((isRunning) => !isRunning).length;
}

/** Quote total: sum of `amounts` whose matching `checked` entry is `true`. */
export function docTotal(amounts: readonly number[], checked: readonly boolean[]): number {
  return amounts.reduce((sum, amount, i) => (checked[i] ? sum + amount : sum), 0);
}

/**
 * ASCII progress label for the "Generar PDF" button while busy: 10 cells,
 * `#` filled / `·` empty, clamped to `0`–`100` (a caller could otherwise
 * pass a stray `110` from an off-by-one tick or a negative value).
 */
export function pdfProgressLabel(pct: number): string {
  const clamped = Math.min(100, Math.max(0, pct));
  const filled = Math.round(clamped / 10);
  return `[${'#'.repeat(filled)}${'·'.repeat(10 - filled)}] ${clamped}%`;
}

/** Cubic ease-out: `1 - (1 - t)^3`. Expects `t` already clamped to `[0, 1]`. */
export function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/** Eased, rounded tween between `from` and `to` at progress `t` (`[0, 1]`). */
export function tweenValue(from: number, to: number, t: number): number {
  return Math.round(from + (to - from) * easeOutCubic(t));
}

/**
 * Filters `rows` for the panel-3 table: `query` matches case-insensitively
 * against EITHER `client` or `product` (empty query matches everything);
 * `date` narrows to an exact match unless it is the sentinel `'all'`. Both
 * conditions combine with AND.
 */
export function filterRows(
  rows: readonly DemoTableRow[],
  query: string,
  date: string
): DemoTableRow[] {
  const q = query.trim().toLowerCase();
  return rows.filter((row) => {
    const matchesQuery = q === '' || `${row.client} ${row.product}`.toLowerCase().includes(q);
    const matchesDate = date === 'all' || row.date === date;
    return matchesQuery && matchesDate;
  });
}
