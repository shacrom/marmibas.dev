/**
 * `scope-blocks` template: a fixed-price quote with a cover, an object
 * paragraph, a scope split into numbered blocks, an amount table derived from
 * those blocks and free titled closing lists.
 *
 * `render` only produces markup. Layout and pagination live in `styles.css`:
 * the document is one continuous flow and CSS paged media cuts it into A4
 * pages, with the running header and footer drawn in page margin boxes. The
 * per-quote strings of those boxes are the only CSS this module emits.
 */
import { escapeHtml, formatDate, formatMoney, formatPercent } from '../../lib/format.mjs';
import { computeTotals } from '../../lib/totals.mjs';

/** @typedef {import('../../lib/schema.mjs').ScopeBlocksQuote} ScopeBlocksQuote */

/** Wordmark on the dark cover. */
const COVER_WORDMARK = { fill: '#f7f6f6', width: 48.1, height: 7.86 };
/** Wordmark in the running header of the inner pages. */
const HEADER_WORDMARK = { fill: '#3c3c3b', width: 27.06, height: 4.42 };

/** `1` → `01`: block numbers and table rows share this numbering. */
const blockNumber = (/** @type {number} */ index) => String(index + 1).padStart(2, '0');

/**
 * Quote a value as a CSS string. Quotes, backslashes, angle brackets and
 * control characters become hex escapes, so the value can neither end the
 * string nor close the `<style>` element it is written into.
 *
 * @param {string} value
 * @returns {string}
 */
export function cssString(value) {
  const escaped = value.replace(
    /["\\<>]|\p{Cc}/gu,
    (char) => `\\${char.charCodeAt(0).toString(16)} `
  );
  return `"${escaped}"`;
}

/**
 * The wordmark as a data URI, coloured and sized. An image in a page margin
 * box renders at its intrinsic size, so the size goes into the SVG itself.
 *
 * @param {string} svg Wordmark SVG that paints with `currentColor`.
 * @param {{ fill: string, width: number, height: number }} look Colour, and size in mm.
 * @returns {string}
 */
function wordmarkUri(svg, { fill, width, height }) {
  const sized = svg
    .replace('<svg ', `<svg width="${width}mm" height="${height}mm" `)
    .replaceAll('currentColor', fill);
  return `data:image/svg+xml;base64,${Buffer.from(sized, 'utf8').toString('base64')}`;
}

/** @param {string[]} items */
const listItems = (items) => items.map((item) => `<li>${escapeHtml(item)}</li>`).join('\n');

/** @param {ScopeBlocksQuote} quote */
function renderCover(quote, /** @type {string} */ wordmarkSvg) {
  return `<section class="cover">
<img class="wordmark" src="${wordmarkUri(wordmarkSvg, COVER_WORDMARK)}" alt="Marmibas">
<div class="eyebrow">Presupuesto</div>
<h1>${escapeHtml(quote.title)}</h1>
<div class="subtitle">${escapeHtml(quote.project)}</div>
<div class="rule"></div>
<dl class="meta">
<div><dt>Referencia</dt><dd>${escapeHtml(quote.reference)}</dd></div>
<div><dt>Fecha</dt><dd>${escapeHtml(formatDate(quote.date))}</dd></div>
<div><dt>Para</dt><dd class="wrap">${escapeHtml(quote.client)}</dd></div>
<div><dt>Versión</dt><dd>${escapeHtml(quote.version)}</dd></div>
</dl>
<div class="tagline">Marmibas™ // Desarrollo web &amp; apps</div>
</section>`;
}

/** @param {ScopeBlocksQuote['scope']} scope */
function renderScope(scope) {
  return scope
    .map(
      (block, index) => `<div class="block">
<div class="num">${blockNumber(index)}</div>
<div>
<h3>${escapeHtml(block.title)}</h3>
<ul>
${listItems(block.items)}
</ul>
</div>
</div>`
    )
    .join('\n');
}

/** @param {ScopeBlocksQuote} quote */
function renderAmounts(quote) {
  const totals = computeTotals(quote.scope, quote.vatRate);
  const rows = quote.scope
    .map(
      (block, index) =>
        `<tr><td><span class="n">${blockNumber(index)}</span>${escapeHtml(block.title)}</td>` +
        `<td class="amount">${formatMoney(block.amount)}</td></tr>`
    )
    .join('\n');

  return `<table>
<thead>
<tr><th>Concepto</th><th class="amount">Importe</th></tr>
</thead>
<tbody>
${rows}
</tbody>
<tbody class="totals">
<tr class="subtotal"><td>Total</td><td class="amount">${formatMoney(totals.subtotal)}</td></tr>
<tr class="tax"><td>IVA (${formatPercent(quote.vatRate)})</td><td class="amount">${formatMoney(totals.vat)}</td></tr>
<tr class="total"><td>Total con IVA</td><td class="amount">${formatMoney(totals.total)}</td></tr>
</tbody>
</table>`;
}

/** @param {ScopeBlocksQuote['sections']} sections */
function renderSections(sections) {
  return sections
    .map((section) => {
      const classes = [
        section.columns === 2 ? 'cols' : '',
        section.spacing === 'relaxed' ? 'relaxed' : '',
      ].filter(Boolean);
      const list = classes.length > 0 ? `<ul class="${classes.join(' ')}">` : '<ul>';
      return `<h2>${escapeHtml(section.title)}</h2>\n${list}\n${listItems(section.items)}\n</ul>`;
    })
    .join('\n');
}

/**
 * The per-quote content of the page margin boxes. Their look is in `styles.css`.
 *
 * @param {ScopeBlocksQuote} quote
 * @param {string} wordmarkSvg
 */
function renderPageContent(quote, wordmarkSvg) {
  return `@page {
  @top-left { content: url("${wordmarkUri(wordmarkSvg, HEADER_WORDMARK)}"); }
  @top-right { content: ${cssString(quote.runningHeader)}; }
  @bottom-left { content: ${cssString(quote.reference)}; }
  @bottom-center { content: ${cssString(formatDate(quote.date))}; }
}`;
}

/**
 * Render a validated `scope-blocks` quote as a complete HTML document.
 * Every data string is HTML-escaped (or CSS-escaped, in the margin boxes).
 *
 * @param {ScopeBlocksQuote} quote Validated quote data.
 * @param {{ wordmarkSvg: string, css: string }} assets The brand wordmark
 *   (painting with `currentColor`) and this template's stylesheet.
 * @returns {string}
 */
export function render(quote, { wordmarkSvg, css }) {
  const documentTitle = `Presupuesto · ${quote.title.replace(/\s+/g, ' ')} · ${quote.project}`;

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<title>${escapeHtml(documentTitle)}</title>
<meta name="author" content="Marmibas">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700&amp;family=Mulish:wght@400;600;700&amp;display=swap" rel="stylesheet">
<style>
${css}
</style>
<style>
${renderPageContent(quote, wordmarkSvg)}
</style>
</head>
<body>
${renderCover(quote, wordmarkSvg)}
<main class="sheet">
<h2>Objeto</h2>
<p class="lead">${escapeHtml(quote.object)}</p>
<h2>Alcance</h2>
${renderScope(quote.scope)}
<h2>Importe</h2>
${renderAmounts(quote)}
${renderSections(quote.sections)}
</main>
</body>
</html>
`;
}
