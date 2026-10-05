/**
 * Contract for the `scope-blocks` template: what the rendered HTML document
 * must contain for a given quote. Layout and pagination live in `styles.css`
 * and are checked by building the PDF, not here.
 */

import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { validateQuote } from '../../quotes/lib/schema.mjs';
import { cssString, render } from '../../quotes/templates/scope-blocks/template.mjs';

const WORDMARK =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 2" fill="currentColor"><path d="M0 0h10v2H0z"/></svg>';
const CSS = '/* stylesheet under test */';

/** The committed fictional example, as the build would load it. */
function example(overrides: Record<string, unknown> = {}) {
  const url = new URL('../../quotes/templates/scope-blocks/example.json', import.meta.url);
  return validateQuote({ ...JSON.parse(readFileSync(url, 'utf8')), ...overrides });
}

const renderQuote = (overrides: Record<string, unknown> = {}) =>
  render(example(overrides), { wordmarkSvg: WORDMARK, css: CSS });

/** Text of every match of `pattern`'s first group. */
const all = (html: string, pattern: RegExp) => [...html.matchAll(pattern)].map((m) => m[1]);

/** Undo CSS string escapes (`\22 ` → `"`), to read back what a browser would. */
const cssUnescape = (value: string) =>
  value.replace(/\\([0-9a-f]{1,6}) ?/gi, (_, hex: string) =>
    String.fromCodePoint(Number.parseInt(hex, 16))
  );

const twoBlocks = [
  { title: 'Diseño', amount: 1000.5, items: ['Página de inicio.'] },
  { title: 'Desarrollo', amount: 499.5, items: ['Maquetación.', 'Publicación.'] },
];

describe('scope-blocks render', () => {
  it('returns a complete Spanish HTML document with the stylesheet inlined', () => {
    const html = renderQuote();

    expect(html.startsWith('<!doctype html>')).toBe(true);
    expect(html).toContain('<html lang="es">');
    expect(html).toContain(CSS);
    expect(html.trimEnd().endsWith('</html>')).toBe(true);
  });

  it('puts the quote identity on the cover', () => {
    const html = renderQuote({
      reference: 'MMB-ACME-WEB-2026-10',
      date: '2026-10-05',
      version: 3,
      client: 'Acme Ficticia S.L.',
      title: 'Sitio web corporativo',
      project: 'Acme Web',
    });
    const cover = html.slice(html.indexOf('<section class="cover">'), html.indexOf('</section>'));

    expect(cover).toContain('<div class="eyebrow">Presupuesto</div>');
    expect(cover).toContain('<h1>Sitio web corporativo</h1>');
    expect(cover).toContain('<div class="subtitle">Acme Web</div>');
    expect(all(cover, /<dd[^>]*>([^<]*)<\/dd>/g)).toEqual([
      'MMB-ACME-WEB-2026-10',
      '5 de octubre de 2026',
      'Acme Ficticia S.L.',
      '3',
    ]);
  });

  it('numbers the scope blocks 01, 02… with their title and items', () => {
    const html = renderQuote();
    const quote = example();

    expect(all(html, /<div class="num">(\d+)<\/div>/g)).toEqual(['01', '02', '03', '04', '05']);
    expect(all(html, /<h3>([^<]*)<\/h3>/g)).toEqual(quote.scope.map((block) => block.title));
    for (const item of quote.scope.flatMap((block) => block.items)) {
      expect(html).toContain(`<li>${item}</li>`);
    }
  });

  it('derives the amount table from the blocks, with computed totals', () => {
    const html = renderQuote({ scope: twoBlocks, vatRate: 21 });
    const table = html.slice(html.indexOf('<table>'), html.indexOf('</table>'));

    expect(all(table, /<span class="n">(\d+)<\/span>/g)).toEqual(['01', '02']);
    expect(all(table, /<td class="amount">([^<]*)<\/td>/g)).toEqual([
      '1.000,50\u00a0€',
      '499,50\u00a0€',
      '1.500\u00a0€',
      '315\u00a0€',
      '1.815\u00a0€',
    ]);
    expect(table).toContain('<td>Total</td>');
    expect(table).toContain('<td>IVA (21\u00a0%)</td>');
    expect(table).toContain('<td>Total con IVA</td>');
  });

  it('prints a fractional VAT rate the Spanish way', () => {
    expect(renderQuote({ vatRate: 10.5 })).toContain('IVA (10,5\u00a0%)');
  });

  it('renders each closing section as a titled list, in one or two columns', () => {
    const html = renderQuote({
      sections: [
        { title: 'No incluido', columns: 2, items: ['Alojamiento.', 'Dominio.'] },
        { title: 'Observaciones', spacing: 'relaxed', items: ['Una nota larga.'] },
        { title: 'Plazo', items: ['Cuatro semanas.'] },
      ],
    });

    expect(html).toContain(
      '<h2>No incluido</h2>\n<ul class="cols">\n<li>Alojamiento.</li>\n<li>Dominio.</li>\n</ul>'
    );
    expect(html).toContain(
      '<h2>Observaciones</h2>\n<ul class="relaxed">\n<li>Una nota larga.</li>\n</ul>'
    );
    expect(html).toContain('<h2>Plazo</h2>\n<ul>\n<li>Cuatro semanas.</li>\n</ul>');
  });

  it('keeps the fixed headings in order: Objeto, Alcance, Importe, then the sections', () => {
    const html = renderQuote({ sections: [{ title: 'Observaciones', items: ['Una nota.'] }] });

    expect(all(html, /<h2>([^<]*)<\/h2>/g)).toEqual([
      'Objeto',
      'Alcance',
      'Importe',
      'Observaciones',
    ]);
  });

  it('escapes HTML in every data string', () => {
    const evil = '<img src=x onerror="alert(1)"> & co';
    const html = renderQuote({
      client: evil,
      title: evil,
      project: evil,
      object: evil,
      scope: [{ title: evil, amount: 100, items: [evil] }],
      sections: [{ title: evil, items: [evil] }],
    });

    expect(html).not.toContain('<img src=x');
    // <title> (title + project), h1, subtitle, client, object, h3, table row, block item,
    // section title and section item: eleven places.
    expect(html.split('&lt;img src=x onerror=&quot;alert(1)&quot;&gt; &amp; co')).toHaveLength(12);
  });

  it('keeps a hostile running header inside its CSS string', () => {
    const hostile = '"; } body { display: none } </style><script>alert(1)</script> \\ \n end';
    const html = renderQuote({ runningHeader: hostile });

    expect(html).not.toContain('<script');
    // Only the two style elements the template itself emits are closed.
    expect(html.split('</style>')).toHaveLength(3);
    const emitted = /@top-right \{ content: "([^"\n]*)"; \}/.exec(html)?.[1];
    expect(emitted).toBeDefined();
    expect(cssUnescape(emitted ?? '')).toBe(hostile);
  });

  it('feeds the running header and footer through page margin boxes', () => {
    const html = renderQuote({
      reference: 'MMB-ACME-WEB-2026-10',
      date: '2026-10-05',
      runningHeader: 'Acme · Sitio web',
    });

    expect(html).toContain('@top-right { content: "Acme · Sitio web"; }');
    expect(html).toContain('@bottom-left { content: "MMB-ACME-WEB-2026-10"; }');
    expect(html).toContain('@bottom-center { content: "5 de octubre de 2026"; }');
  });

  it('embeds the wordmark light on the cover and dark in the running header', () => {
    const html = renderQuote();
    const svgIn = (pattern: RegExp) =>
      Buffer.from(pattern.exec(html)?.[1] ?? '', 'base64').toString('utf8');
    const DATA_URI = 'data:image\\/svg\\+xml;base64,([A-Za-z0-9+/=]+)';

    const cover = svgIn(new RegExp(`<img class="wordmark" src="${DATA_URI}" alt="Marmibas">`));
    const header = svgIn(new RegExp(`@top-left \\{ content: url\\("${DATA_URI}"\\); \\}`));

    expect(cover).toContain('fill="#f7f6f6"');
    expect(header).toContain('fill="#3c3c3b"');
    // Margin-box images render at their intrinsic size, so the SVG carries one.
    expect(header).toMatch(/^<svg width="[\d.]+mm" height="[\d.]+mm" /);
    expect(html).not.toContain('currentColor');
  });
});

describe('cssString', () => {
  it('quotes plain text as is', () => {
    expect(cssString('Acme · Sitio web')).toBe('"Acme · Sitio web"');
  });

  it('escapes quotes, backslashes, markup and line breaks', () => {
    expect(cssString('a"b')).toBe('"a\\22 b"');
    expect(cssString('a\\b')).toBe('"a\\5c b"');
    expect(cssString('</style>')).toBe('"\\3c /style\\3e "');
    expect(cssString('a\nb')).toBe('"a\\a b"');
  });
});
