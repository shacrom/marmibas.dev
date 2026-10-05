/**
 * Contract for the quote text formatters: es-ES money and dates as they are
 * printed on a quote, plus the HTML escaping every data string goes through.
 */

import { describe, expect, it } from 'vitest';
import { escapeHtml, formatDate, formatMoney, formatPercent } from '../../quotes/lib/format.mjs';

/** Non-breaking space between the number and the euro sign. */
const NBSP = '\u00a0';

describe('formatMoney', () => {
  it('prints whole amounts without decimals', () => {
    expect(formatMoney(0)).toBe(`0${NBSP}€`);
    expect(formatMoney(315)).toBe(`315${NBSP}€`);
  });

  it('groups thousands from four digits on (es-ES does not by default)', () => {
    expect(formatMoney(1500)).toBe(`1.500${NBSP}€`);
    expect(formatMoney(1815)).toBe(`1.815${NBSP}€`);
    expect(formatMoney(1234567)).toBe(`1.234.567${NBSP}€`);
  });

  it('prints two decimals as soon as the amount has cents', () => {
    expect(formatMoney(12345.5)).toBe(`12.345,50${NBSP}€`);
    expect(formatMoney(0.07)).toBe(`0,07${NBSP}€`);
  });

  it('treats float noise around a whole amount as the whole amount', () => {
    expect(formatMoney(0.1 + 0.2 + 99.7)).toBe(`100${NBSP}€`);
  });
});

describe('formatPercent', () => {
  it('prints a rate the Spanish way, with a non-breaking space before the sign', () => {
    expect(formatPercent(21)).toBe(`21${NBSP}%`);
    expect(formatPercent(10.5)).toBe(`10,5${NBSP}%`);
    expect(formatPercent(0)).toBe(`0${NBSP}%`);
  });
});

describe('formatDate', () => {
  it('writes an ISO date as a long Spanish date', () => {
    expect(formatDate('2026-10-05')).toBe('5 de octubre de 2026');
  });

  it('does not drift a day on month and year boundaries', () => {
    expect(formatDate('2026-01-01')).toBe('1 de enero de 2026');
    expect(formatDate('2026-12-31')).toBe('31 de diciembre de 2026');
    expect(formatDate('2028-02-29')).toBe('29 de febrero de 2028');
  });

  it('rejects anything that is not a real YYYY-MM-DD date', () => {
    expect(() => formatDate('05/10/2026')).toThrow(/YYYY-MM-DD/);
    expect(() => formatDate('2026-02-30')).toThrow(/YYYY-MM-DD/);
  });
});

describe('escapeHtml', () => {
  it('escapes the five characters that are significant in HTML', () => {
    expect(escapeHtml(`<b class="x">Tom & 'Jerry'</b>`)).toBe(
      '&lt;b class=&quot;x&quot;&gt;Tom &amp; &#39;Jerry&#39;&lt;/b&gt;'
    );
  });

  it('leaves accents and typographic quotes untouched', () => {
    expect(escapeHtml('Botón «Reservar» · 62 × 30 mm')).toBe('Botón «Reservar» · 62 × 30 mm');
  });

  it('stringifies non-string values', () => {
    expect(escapeHtml(3)).toBe('3');
  });
});
