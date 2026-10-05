/**
 * Quote totals. They are always derived from the scope block amounts — never
 * read from the data file — so a quote cannot carry a total that disagrees
 * with its own lines.
 */

/**
 * @typedef {object} Totals
 * @property {number} subtotal Sum of the block amounts, in euros.
 * @property {number} vat VAT on the subtotal, rounded to the cent, in euros.
 * @property {number} total Subtotal plus VAT, in euros.
 */

/**
 * Add the block amounts and apply VAT. The arithmetic runs in integer cents,
 * so float noise never reaches the printed figures.
 *
 * @param {ReadonlyArray<{ amount: number }>} blocks Scope blocks, amounts in euros.
 * @param {number} vatRate VAT rate as a percentage, e.g. `21`.
 * @returns {Totals}
 */
export function computeTotals(blocks, vatRate) {
  const subtotalCents = blocks.reduce((sum, block) => sum + Math.round(block.amount * 100), 0);
  const vatCents = Math.round((subtotalCents * vatRate) / 100);
  return {
    subtotal: subtotalCents / 100,
    vat: vatCents / 100,
    total: (subtotalCents + vatCents) / 100,
  };
}
