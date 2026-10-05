/**
 * Contract for the quote build CLI (`quotes/build.mjs`), up to the point where
 * headless Chrome takes over. Printing the PDF needs Chrome and network, so it
 * is replaced by a stub here and verified by actually building a quote.
 */

import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  buildQuote,
  chromePdfArgs,
  main,
  parseArgs,
  renderQuoteHtml,
  resolveChrome,
} from '../../quotes/build.mjs';
import { QuoteValidationError } from '../../quotes/lib/schema.mjs';

const EXAMPLE = new URL('../../quotes/templates/scope-blocks/example.json', import.meta.url);
const exampleData = (): Record<string, unknown> => JSON.parse(readFileSync(EXAMPLE, 'utf8'));

let workDir: string;
let outDir: string;

beforeEach(() => {
  workDir = mkdtempSync(join(tmpdir(), 'quotes-build-'));
  outDir = join(workDir, 'out');
});

afterEach(() => {
  rmSync(workDir, { recursive: true, force: true });
});

/** Writes a quote data file and returns its path. */
function dataFile(data: unknown, name = 'quote.json') {
  const path = join(workDir, name);
  writeFileSync(path, typeof data === 'string' ? data : JSON.stringify(data));
  return path;
}

/** Captures what the CLI prints. */
function fakeIo() {
  const io = { out: '', err: '' };
  return {
    io,
    streams: {
      stdout: (text: string) => void (io.out += text),
      stderr: (text: string) => void (io.err += text),
    },
  };
}

describe('parseArgs', () => {
  it('reads the data file and the defaults', () => {
    expect(parseArgs(['quote.json'])).toEqual({
      list: false,
      htmlOnly: false,
      outDir: undefined,
      dataPath: 'quote.json',
    });
  });

  it('reads --out, --html-only and --list in any position', () => {
    expect(parseArgs(['--out', 'build', 'quote.json', '--html-only'])).toMatchObject({
      outDir: 'build',
      htmlOnly: true,
      dataPath: 'quote.json',
    });
    expect(parseArgs(['--list'])).toMatchObject({ list: true, dataPath: undefined });
  });

  it('rejects a missing data file, a missing --out value, extras and unknown flags', () => {
    expect(() => parseArgs([])).toThrow(/data file/);
    expect(() => parseArgs(['quote.json', '--out'])).toThrow(/--out/);
    expect(() => parseArgs(['a.json', 'b.json'])).toThrow(/one data file/);
    expect(() => parseArgs(['quote.json', '--pdf'])).toThrow(/--pdf/);
  });
});

describe('resolveChrome', () => {
  const MAC_CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

  it('prefers CHROME_PATH', () => {
    const chrome = resolveChrome({ env: { CHROME_PATH: '/opt/chrome' }, exists: () => true });

    expect(chrome).toBe('/opt/chrome');
  });

  it('fails clearly when CHROME_PATH points nowhere', () => {
    expect(() => resolveChrome({ env: { CHROME_PATH: '/nope' }, exists: () => false })).toThrow(
      /CHROME_PATH.*\/nope/
    );
  });

  it('falls back to the macOS app, then to Linux binaries on PATH', () => {
    expect(resolveChrome({ env: {}, exists: (path) => path === MAC_CHROME })).toBe(MAC_CHROME);
    expect(
      resolveChrome({
        env: { PATH: '/usr/local/bin:/usr/bin' },
        exists: (path) => path === '/usr/bin/chromium',
      })
    ).toBe('/usr/bin/chromium');
  });

  it('explains how to fix a machine without Chrome', () => {
    expect(() => resolveChrome({ env: { PATH: '/usr/bin' }, exists: () => false })).toThrow(
      /Chrome.*CHROME_PATH/s
    );
  });
});

describe('chromePdfArgs', () => {
  it('prints a file URL to PDF headlessly, without browser header or footer', () => {
    expect(chromePdfArgs('/tmp/a b/quote.html', '/tmp/a b/quote.pdf')).toEqual([
      '--headless=new',
      '--no-pdf-header-footer',
      '--virtual-time-budget=15000',
      '--print-to-pdf=/tmp/a b/quote.pdf',
      'file:///tmp/a%20b/quote.html',
    ]);
  });
});

describe('renderQuoteHtml', () => {
  it('validates the data and renders it with the template assets', () => {
    const { quote, html } = renderQuoteHtml(exampleData());

    expect(quote.template).toBe('scope-blocks');
    expect(html).toContain(`<dd>${quote.reference}</dd>`);
    expect(html).toContain('@page');
    expect(html).toContain('data:image/svg+xml;base64,');
  });

  it('rejects invalid data', () => {
    expect(() => renderQuoteHtml({ ...exampleData(), scope: [] })).toThrow(QuoteValidationError);
  });
});

describe('buildQuote', () => {
  it('writes <reference>.html and prints <reference>.pdf next to it', async () => {
    const printed: string[][] = [];
    const result = await buildQuote(dataFile({ ...exampleData(), reference: 'MMB-TEST-2026-10' }), {
      outDir,
      printPdf: async (htmlPath, pdfPath) => {
        printed.push([htmlPath, pdfPath]);
      },
    });

    expect(result).toEqual({
      htmlPath: join(outDir, 'MMB-TEST-2026-10.html'),
      pdfPath: join(outDir, 'MMB-TEST-2026-10.pdf'),
    });
    expect(readFileSync(result.htmlPath, 'utf8')).toContain('<dd>MMB-TEST-2026-10</dd>');
    expect(printed).toEqual([[result.htmlPath, result.pdfPath]]);
  });

  it('stops after the HTML with htmlOnly', async () => {
    const result = await buildQuote(dataFile(exampleData()), {
      outDir,
      htmlOnly: true,
      printPdf: async () => {
        throw new Error('must not print');
      },
    });

    expect(result.pdfPath).toBeUndefined();
    expect(readdirSync(outDir)).toHaveLength(1);
  });

  it('writes nothing when the data is invalid', async () => {
    const build = buildQuote(dataFile({ ...exampleData(), vatRate: -1 }), { outDir });

    await expect(build).rejects.toThrow(QuoteValidationError);
    expect(existsSync(outDir)).toBe(false);
  });

  it('reports an unreadable or malformed data file by name', async () => {
    await expect(buildQuote(join(workDir, 'missing.json'), { outDir })).rejects.toThrow(
      /missing\.json/
    );
    await expect(buildQuote(dataFile('{ not json', 'broken.json'), { outDir })).rejects.toThrow(
      /broken\.json.*JSON/s
    );
    expect(existsSync(outDir)).toBe(false);
  });
});

describe('main', () => {
  it('lists the templates with --list', async () => {
    const { io, streams } = fakeIo();

    expect(await main(['--list'], streams)).toBe(0);
    expect(io.out).toMatch(/^scope-blocks\s+\S/m);
    expect(io.out).toContain('quotes/templates/scope-blocks/example.json');
  });

  it('builds a quote and prints where the files are', async () => {
    const { io, streams } = fakeIo();
    const code = await main([dataFile(exampleData()), '--out', outDir, '--html-only'], streams);

    expect(code).toBe(0);
    expect(io.out).toContain(join(outDir, `${exampleData().reference}.html`));
    expect(io.err).toBe('');
  });

  it('exits non-zero with the readable problems and writes nothing on invalid data', async () => {
    const { io, streams } = fakeIo();
    const invalid = { ...exampleData(), template: 'fancy' };
    const code = await main([dataFile(invalid), '--out', outDir, '--html-only'], streams);

    expect(code).toBe(1);
    expect(io.err).toContain('template: unknown template "fancy"');
    expect(io.out).toBe('');
    expect(existsSync(outDir)).toBe(false);
  });

  it('exits non-zero with the usage on bad arguments', async () => {
    const { io, streams } = fakeIo();

    expect(await main([], streams)).toBe(1);
    expect(io.err).toMatch(/Usage: node quotes\/build\.mjs/);
  });
});
