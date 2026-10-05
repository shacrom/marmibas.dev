/**
 * Text formatters for quote documents: es-ES money and dates as they are
 * printed, plus the HTML escaping every data string goes through.
 */

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

const longDate = new Intl.DateTimeFormat('es-ES', {
  timeZone: 'UTC',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

/** @type {Record<string, string>} */
const HTML_ENTITIES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

/**
 * Format an amount in euros the way a quote prints it: `1.500 €`, `315 €`,
 * `12.345,50 €`. Whole amounts show no decimals; anything else shows two.
 * The space before the euro sign is non-breaking.
 *
 * @param {number} amount Amount in euros.
 * @returns {string}
 */
export function formatMoney(amount) {
  const cents = Math.round(amount * 100);
  const digits = cents % 100 === 0 ? 0 : 2;
  // es-ES leaves four-digit numbers ungrouped by default (1500, not 1.500).
  const number = new Intl.NumberFormat('es-ES', {
    useGrouping: 'always',
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(cents / 100);
  return `${number}\u00a0€`;
}

/**
 * Parse a `YYYY-MM-DD` date into a UTC `Date`, or `null` when the text is not
 * a real calendar date. Parsing by parts (never `new Date(text)`) keeps the
 * day stable whatever the machine's time zone is.
 *
 * @param {unknown} isoDate
 * @returns {Date | null}
 */
export function parseIsoDate(isoDate) {
  const match = typeof isoDate === 'string' ? ISO_DATE.exec(isoDate) : null;
  if (!match) return null;
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const date = new Date(Date.UTC(year, month - 1, day));
  const isRealDate =
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
  return isRealDate ? date : null;
}

/**
 * Format an ISO date as a long Spanish date: `2026-10-05` → `5 de octubre de 2026`.
 *
 * @param {string} isoDate Date written as `YYYY-MM-DD`.
 * @returns {string}
 */
export function formatDate(isoDate) {
  const date = parseIsoDate(isoDate);
  if (!date) throw new Error(`Invalid date "${isoDate}": expected a real date as YYYY-MM-DD`);
  return longDate.format(date);
}

/**
 * Escape a value for use in HTML text or in a quoted attribute.
 *
 * @param {unknown} value
 * @returns {string}
 */
export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => HTML_ENTITIES[char] ?? char);
}
