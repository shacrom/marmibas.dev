/**
 * Contract for the quote totals. They are always derived from the scope block
 * amounts — never typed — and computed in integer cents so they cannot drift.
 */

import { describe, expect, it } from 'vitest';
import { computeTotals } from '../../quotes/lib/totals.mjs';

const blocks = (...amounts: number[]) => amounts.map((amount) => ({ amount }));

describe('computeTotals', () => {
  it('adds the blocks and applies VAT on a five-block quote', () => {
    expect(computeTotals(blocks(250, 150, 400, 300, 400), 21)).toEqual({
      subtotal: 1500,
      vat: 315,
      total: 1815,
    });
  });

  it('rounds VAT to the cent on a non-round subtotal', () => {
    // 21 % of 333.33 is 69.9993 → 70.00
    expect(computeTotals(blocks(333.33), 21)).toEqual({ subtotal: 333.33, vat: 70, total: 403.33 });
    // 21 % of 10.50 is 2.205 → rounds half up to 2.21
    expect(computeTotals(blocks(10.5), 21)).toEqual({ subtotal: 10.5, vat: 2.21, total: 12.71 });
  });

  it('does not accumulate float error across blocks', () => {
    expect(computeTotals(blocks(0.1, 0.2, 0.3), 0).subtotal).toBe(0.6);
    expect(computeTotals(blocks(19.99, 19.99, 19.99), 10)).toEqual({
      subtotal: 59.97,
      vat: 6,
      total: 65.97,
    });
  });

  it('charges no VAT at a zero rate', () => {
    expect(computeTotals(blocks(250, 150), 0)).toEqual({ subtotal: 400, vat: 0, total: 400 });
  });

  it('supports fractional VAT rates', () => {
    expect(computeTotals(blocks(1000), 10.5)).toEqual({ subtotal: 1000, vat: 105, total: 1105 });
  });

  it('returns zeros for an empty block list', () => {
    expect(computeTotals([], 21)).toEqual({ subtotal: 0, vat: 0, total: 0 });
  });
});
