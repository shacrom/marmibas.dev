/**
 * Tests for the home demo pane's pure logic (`src/lib/showcase-demo.ts`) —
 * T5 terminal redesign.
 *
 * Plan (strict TDD — this file is written and observed RED before
 * `src/lib/showcase-demo.ts` exists):
 *
 *   `formatThousands`
 *   1. Below 1000: no separator inserted (`999` -> `'999'`, `0` -> `'0'`).
 *   2. At/above 1000: dot-grouped every 3 digits from the right, es-ES style
 *      (`1240` -> `'1.240'`, `1000` -> `'1.000'`, `12345` -> `'12.345'`).
 *   3. Exactly 3 digits (`100`) still has no separator — only the ≥1000
 *      boundary matters, not the digit count of the input itself.
 *
 *   `tickCounts`
 *   4. Only running machines advance, each by its own `rates` entry; a
 *      stopped machine's count is unchanged.
 *   5. Default `rates` (`[3, 2, 1]`) applies when the third argument is
 *      omitted.
 *   6. Does not mutate the input `counts` array (returns a new array).
 *
 *   `productionTotal` / `stopsCount`
 *   7. `productionTotal` sums ALL counts (regardless of running state —
 *      meters already produced don't disappear when a machine stops) plus
 *      `base`.
 *   8. `stopsCount` counts only machines currently NOT running, plus `base`.
 *
 *   `docTotal`
 *   9. Sums only the amounts whose matching `checked` entry is `true`.
 *   10. All unchecked -> `0`; all checked -> full sum.
 *
 *   `pdfProgressLabel`
 *   11. Mid-progress: 10 cells, `#` filled / `·` empty, matches the exact
 *       spec example (`60` -> `'[######····] 60%'`).
 *   12. Edge `0`: all empty cells, `'[··········] 0%'`.
 *   13. Edge `100`: all filled cells, `'[##########] 100%'`.
 *   14. Clamps `>100` down to `100` and negative values up to `0`.
 *
 *   `easeOutCubic` / `tweenValue`
 *   15. `easeOutCubic(0) === 0` and `easeOutCubic(1) === 1` (boundary
 *       identities of the cubic ease-out curve).
 *   16. `easeOutCubic(0.5)` matches the closed-form value (`1 - 0.5^3`).
 *   17. `tweenValue` at `t=0` returns `from` (rounded); at `t=1` returns
 *       `to` (rounded).
 *   18. `tweenValue` rounds a fractional intermediate result.
 *
 *   `filterRows`
 *   19. Empty query + `date: 'all'` returns every row unchanged.
 *   20. Query matches case-insensitively against `client`.
 *   21. Query matches case-insensitively against `product`.
 *   22. A query matching neither client nor product returns an empty array.
 *   23. `date !== 'all'` narrows to rows whose `date` matches exactly.
 *   24. Query + date combine with AND semantics.
 */

import { describe, expect, it } from 'vitest';
import {
  docTotal,
  easeOutCubic,
  filterRows,
  formatThousands,
  pdfProgressLabel,
  productionTotal,
  stopsCount,
  tickCounts,
  tweenValue,
  type DemoTableRow,
} from '../../src/lib/showcase-demo';

describe('formatThousands', () => {
  it('does not group numbers below 1000', () => {
    expect(formatThousands(999)).toBe('999');
    expect(formatThousands(0)).toBe('0');
  });

  it('groups numbers at/above 1000 with a dot every 3 digits', () => {
    expect(formatThousands(1240)).toBe('1.240');
    expect(formatThousands(1000)).toBe('1.000');
    expect(formatThousands(12345)).toBe('12.345');
  });

  it('does not group a bare 3-digit number', () => {
    expect(formatThousands(100)).toBe('100');
  });
});

describe('tickCounts', () => {
  it('advances only running machines by their own rate', () => {
    expect(tickCounts([1240, 980, 0], [true, true, false])).toEqual([1243, 982, 0]);
  });

  it('uses the default rates [3, 2, 1] when omitted', () => {
    expect(tickCounts([0, 0, 0], [true, true, true])).toEqual([3, 2, 1]);
  });

  it('does not mutate the input counts array', () => {
    const counts = [10, 20, 30];
    tickCounts(counts, [true, true, true]);
    expect(counts).toEqual([10, 20, 30]);
  });
});

describe('productionTotal / stopsCount', () => {
  it('productionTotal sums all counts regardless of running state, plus base', () => {
    // Third machine stopped but keeps its already-produced meters.
    expect(productionTotal([1240, 980, 415], 1262)).toBe(3897);
  });

  it('stopsCount counts only non-running machines, plus base', () => {
    expect(stopsCount([true, true, false], 1)).toBe(2);
    expect(stopsCount([true, true, true], 1)).toBe(1);
  });
});

describe('docTotal', () => {
  it('sums only checked amounts', () => {
    expect(docTotal([3200, 950, 700], [true, false, true])).toBe(3900);
  });

  it('all unchecked yields 0, all checked yields the full sum', () => {
    expect(docTotal([3200, 950, 700], [false, false, false])).toBe(0);
    expect(docTotal([3200, 950, 700], [true, true, true])).toBe(4850);
  });
});

describe('pdfProgressLabel', () => {
  it('matches the exact spec example at 60%', () => {
    expect(pdfProgressLabel(60)).toBe('[######····] 60%');
  });

  it('renders all-empty at 0%', () => {
    expect(pdfProgressLabel(0)).toBe('[··········] 0%');
  });

  it('renders all-filled at 100%', () => {
    expect(pdfProgressLabel(100)).toBe('[##########] 100%');
  });

  it('clamps out-of-range percentages', () => {
    expect(pdfProgressLabel(140)).toBe('[##########] 100%');
    expect(pdfProgressLabel(-20)).toBe('[··········] 0%');
  });
});

describe('easeOutCubic / tweenValue', () => {
  it('has the boundary identities easeOutCubic(0) = 0 and easeOutCubic(1) = 1', () => {
    expect(easeOutCubic(0)).toBe(0);
    expect(easeOutCubic(1)).toBe(1);
  });

  it('matches the closed-form value at t=0.5', () => {
    expect(easeOutCubic(0.5)).toBeCloseTo(1 - Math.pow(0.5, 3), 10);
  });

  it('tweenValue returns the rounded endpoints at t=0 and t=1', () => {
    expect(tweenValue(3200, 4850, 0)).toBe(3200);
    expect(tweenValue(3200, 4850, 1)).toBe(4850);
  });

  it('tweenValue rounds a fractional intermediate result', () => {
    // easeOutCubic(0.5) = 0.875 -> 3200 + 1650 * 0.875 = 4643.75 -> 4644
    expect(tweenValue(3200, 4850, 0.5)).toBe(4644);
  });
});

describe('filterRows', () => {
  const rows: DemoTableRow[] = [
    { client: 'Ferretería Solá', product: 'Tornillería M6', date: 'Hoy', amount: 1240, status: 'Listo' },
    { client: 'Grupo Ánfora', product: 'Tornillería M8', date: 'Semana', amount: 1180, status: 'Listo' },
    {
      client: 'Mueblex S.L.',
      product: 'Bisagra reforzada',
      date: 'Hoy',
      amount: 860,
      status: 'Pendiente',
    },
  ];

  it('returns every row for an empty query and date "all"', () => {
    expect(filterRows(rows, '', 'all')).toEqual(rows);
  });

  it('matches the query case-insensitively against client', () => {
    expect(filterRows(rows, 'mueblex', 'all')).toEqual([rows[2]]);
    expect(filterRows(rows, 'FERRETERÍA', 'all')).toEqual([rows[0]]);
  });

  it('matches the query case-insensitively against product', () => {
    expect(filterRows(rows, 'bisagra', 'all')).toEqual([rows[2]]);
  });

  it('returns an empty array when nothing matches', () => {
    expect(filterRows(rows, 'no-existe', 'all')).toEqual([]);
  });

  it('narrows by exact date when date is not "all"', () => {
    expect(filterRows(rows, '', 'Hoy')).toEqual([rows[0], rows[2]]);
    expect(filterRows(rows, '', 'Semana')).toEqual([rows[1]]);
  });

  it('combines query and date with AND semantics', () => {
    expect(filterRows(rows, 'tornillería', 'Hoy')).toEqual([rows[0]]);
    expect(filterRows(rows, 'tornillería', 'Semana')).toEqual([rows[1]]);
    expect(filterRows(rows, 'tornillería', 'Ayer')).toEqual([]);
  });
});
