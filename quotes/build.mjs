#!/usr/bin/env node
/**
 * Build a quote: data file (JSON) → validated → HTML → PDF.
 *
 *   node quotes/build.mjs <data.json> [--out <dir>] [--html-only]
 *   node quotes/build.mjs --list
 *
 * Writes `<out>/<reference>.html` and `<out>/<reference>.pdf` (default
 * `quotes/out/`, git-ignored). Invalid data exits non-zero with one readable
 * line per problem and writes nothing.
 *
 * The PDF is printed by headless Chrome, which also fetches the quote fonts
 * from Google Fonts — the build needs Chrome and network. See quotes/README.md.
 */
import { execFile } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { delimiter, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { promisify } from 'node:util';
import { QuoteValidationError, validateQuote } from './lib/schema.mjs';
import { getTemplate, listTemplates } from './templates/index.mjs';

const QUOTES_DIR = fileURLToPath(new URL('.', import.meta.url));
const DEFAULT_OUT_DIR = join(QUOTES_DIR, 'out');
const WORDMARK_PATH = join(QUOTES_DIR, 'brand', 'marmibas-wordmark.svg');

const MAC_CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const LINUX_CHROME_NAMES = [
  'google-chrome',
  'google-chrome-stable',
  'chromium',
  'chromium-browser',
];

/** Time Chrome's virtual clock may run before printing: lets web fonts load. */
const VIRTUAL_TIME_BUDGET_MS = 15000;
const CHROME_TIMEOUT_MS = 60000;

const USAGE = `Usage: node quotes/build.mjs <data.json> [--out <dir>] [--html-only]
       node quotes/build.mjs --list

  <data.json>   Quote data file (start from a template's example.json)
  --out <dir>   Output directory (default: quotes/out)
  --html-only   Write the HTML and skip the PDF (no Chrome needed)
  --list        List the available templates`;

/** A problem the user can fix, reported without a stack trace. */
export class BuildError extends Error {
  /** @param {string} message */
  constructor(message) {
    super(message);
    this.name = 'BuildError';
  }
}

/**
 * @typedef {object} CliOptions
 * @property {boolean} list
 * @property {boolean} htmlOnly
 * @property {string | undefined} outDir
 * @property {string | undefined} dataPath
 */

/**
 * Parse the command-line arguments (without `node` and the script path).
 *
 * @param {string[]} argv
 * @returns {CliOptions}
 * @throws {BuildError} On a bad invocation.
 */
export function parseArgs(argv) {
  /** @type {CliOptions} */
  const options = { list: false, htmlOnly: false, outDir: undefined, dataPath: undefined };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = /** @type {string} */ (argv[index]);
    if (arg === '--list') {
      options.list = true;
    } else if (arg === '--html-only') {
      options.htmlOnly = true;
    } else if (arg === '--out') {
      const value = argv[(index += 1)];
      if (value === undefined || value.startsWith('--')) {
        throw new BuildError('--out needs a directory');
      }
      options.outDir = value;
    } else if (arg.startsWith('--')) {
      throw new BuildError(`Unknown option ${arg}`);
    } else if (options.dataPath !== undefined) {
      throw new BuildError('Expected one data file, got several');
    } else {
      options.dataPath = arg;
    }
  }

  if (!options.list && options.dataPath === undefined) {
    throw new BuildError('Missing the quote data file');
  }
  return options;
}

/**
 * Find the Chrome binary: `CHROME_PATH`, then the macOS app, then the usual
 * Linux names on `PATH`.
 *
 * @param {object} [deps]
 * @param {Record<string, string | undefined>} [deps.env]
 * @param {(path: string) => boolean} [deps.exists]
 * @returns {string}
 * @throws {BuildError} When no Chrome can be found.
 */
export function resolveChrome({ env = process.env, exists = existsSync } = {}) {
  if (env.CHROME_PATH) {
    if (exists(env.CHROME_PATH)) return env.CHROME_PATH;
    throw new BuildError(`CHROME_PATH points to ${env.CHROME_PATH}, which does not exist`);
  }
  if (exists(MAC_CHROME)) return MAC_CHROME;

  const pathDirs = (env.PATH ?? '').split(delimiter).filter(Boolean);
  for (const name of LINUX_CHROME_NAMES) {
    for (const dir of pathDirs) {
      const candidate = join(dir, name);
      if (exists(candidate)) return candidate;
    }
  }

  throw new BuildError(
    'Google Chrome was not found. Install it, or set CHROME_PATH to a Chrome or Chromium ' +
      'binary. Use --html-only to skip the PDF.'
  );
}

/**
 * Chrome arguments that print an HTML file to PDF, with no browser-added
 * header or footer (the template draws its own).
 *
 * @param {string} htmlPath Absolute path of the HTML file.
 * @param {string} pdfPath Absolute path of the PDF to write.
 * @returns {string[]}
 */
export function chromePdfArgs(htmlPath, pdfPath) {
  return [
    '--headless=new',
    '--no-pdf-header-footer',
    `--virtual-time-budget=${VIRTUAL_TIME_BUDGET_MS}`,
    `--print-to-pdf=${pdfPath}`,
    pathToFileURL(htmlPath).href,
  ];
}

/**
 * Print an HTML file to PDF with headless Chrome. No shell is involved.
 *
 * @param {string} htmlPath
 * @param {string} pdfPath
 * @returns {Promise<void>}
 */
export async function printWithChrome(htmlPath, pdfPath) {
  const chrome = resolveChrome();
  try {
    await promisify(execFile)(chrome, chromePdfArgs(htmlPath, pdfPath), {
      timeout: CHROME_TIMEOUT_MS,
    });
  } catch (error) {
    throw new BuildError(`Chrome could not print the PDF: ${/** @type {Error} */ (error).message}`);
  }
  if (!existsSync(pdfPath) || statSync(pdfPath).size === 0) {
    throw new BuildError(`Chrome ran but wrote no PDF at ${pdfPath}`);
  }
}

/**
 * Validate quote data and render it with its template and assets.
 *
 * @param {unknown} data Parsed content of a quote data file.
 * @returns {{ quote: import('./lib/schema.mjs').Quote, html: string }}
 * @throws {QuoteValidationError} When the data cannot be used.
 */
export function renderQuoteHtml(data) {
  const quote = validateQuote(data);
  const template = getTemplate(quote.template);
  const html = template.render(quote, {
    wordmarkSvg: readFileSync(WORDMARK_PATH, 'utf8'),
    css: readFileSync(join(QUOTES_DIR, 'templates', template.id, 'styles.css'), 'utf8'),
  });
  return { quote, html };
}

/**
 * Read and parse a quote data file.
 *
 * @param {string} dataPath
 * @returns {unknown}
 * @throws {BuildError} When the file is missing or is not JSON.
 */
function readDataFile(dataPath) {
  let text;
  try {
    text = readFileSync(dataPath, 'utf8');
  } catch (error) {
    throw new BuildError(`Cannot read ${dataPath}: ${/** @type {Error} */ (error).message}`);
  }
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new BuildError(`${dataPath} is not valid JSON: ${/** @type {Error} */ (error).message}`);
  }
}

/**
 * Build one quote. Nothing is written unless the data is valid.
 *
 * @param {string} dataPath Quote data file.
 * @param {object} [options]
 * @param {string} [options.outDir] Output directory (default `quotes/out`).
 * @param {boolean} [options.htmlOnly] Skip the PDF.
 * @param {(htmlPath: string, pdfPath: string) => Promise<void>} [options.printPdf]
 *   PDF printer; headless Chrome unless replaced (tests).
 * @returns {Promise<{ htmlPath: string, pdfPath?: string }>}
 */
export async function buildQuote(
  dataPath,
  { outDir = DEFAULT_OUT_DIR, htmlOnly = false, printPdf = printWithChrome } = {}
) {
  const { quote, html } = renderQuoteHtml(readDataFile(dataPath));

  const absoluteOutDir = resolve(outDir);
  const htmlPath = join(absoluteOutDir, `${quote.reference}.html`);
  mkdirSync(absoluteOutDir, { recursive: true });
  writeFileSync(htmlPath, html);
  if (htmlOnly) return { htmlPath };

  const pdfPath = join(absoluteOutDir, `${quote.reference}.pdf`);
  await printPdf(htmlPath, pdfPath);
  return { htmlPath, pdfPath };
}

/** The `--list` output: one line per template, then where its example is. */
function describeTemplates() {
  const templates = listTemplates();
  const width = Math.max(...templates.map((template) => template.id.length));
  return templates
    .map(({ id, description }) => {
      const example = relative(process.cwd(), join(QUOTES_DIR, 'templates', id, 'example.json'));
      return `${id.padEnd(width)}  ${description}\n${' '.repeat(width)}  example: ${example}`;
    })
    .join('\n');
}

/**
 * CLI entry point.
 *
 * @param {string[]} argv Arguments after the script path.
 * @param {object} [streams]
 * @param {(text: string) => void} [streams.stdout]
 * @param {(text: string) => void} [streams.stderr]
 * @returns {Promise<number>} Process exit code.
 */
export async function main(
  argv,
  {
    stdout = (text) => void process.stdout.write(text),
    stderr = (text) => void process.stderr.write(text),
  } = {}
) {
  let options;
  try {
    options = parseArgs(argv);
  } catch (error) {
    stderr(`${/** @type {Error} */ (error).message}\n\n${USAGE}\n`);
    return 1;
  }

  if (options.list) {
    stdout(`${describeTemplates()}\n`);
    return 0;
  }

  try {
    const { htmlPath, pdfPath } = await buildQuote(/** @type {string} */ (options.dataPath), {
      outDir: options.outDir,
      htmlOnly: options.htmlOnly,
    });
    stdout(`HTML  ${htmlPath}\n`);
    if (pdfPath) stdout(`PDF   ${pdfPath}\n`);
    return 0;
  } catch (error) {
    if (error instanceof QuoteValidationError || error instanceof BuildError) {
      stderr(`${error.message}\n`);
      return 1;
    }
    throw error;
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = await main(process.argv.slice(2));
}
