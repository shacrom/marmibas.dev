/**
 * Quote data schemas. A quote is a JSON file: the fields every quote shares
 * (`commonFields`) plus the fields of the template named in `template`.
 *
 * `validateQuote` is the single entry point: it returns the parsed quote or
 * throws a `QuoteValidationError` listing every problem as `path: reason`.
 *
 * Totals are deliberately absent from every schema — they are computed
 * (`totals.mjs`), never typed.
 */
import { z } from 'zod';
import { parseIsoDate } from './format.mjs';

/**
 * Error message for a field of the wrong type: a missing field says so.
 *
 * @param {string} wrongType Message when the field is present but mistyped.
 * @returns {(issue: { input?: unknown }) => string}
 */
const requiredOr = (wrongType) => (issue) =>
  issue.input === undefined ? 'is required' : wrongType;

/** Required, non-blank text. Surrounding whitespace is dropped. */
const text = () =>
  z
    .string({ error: requiredOr('must be text') })
    .trim()
    .min(1, 'must not be empty');

/** Required list with at least one entry. */
const nonEmptyList = (/** @type {z.ZodType} */ item, /** @type {string} */ what) =>
  z.array(item, { error: requiredOr('must be a list') }).min(1, `needs at least one ${what}`);

/** @param {number} amount */
const hasWholeCents = (amount) => Math.abs(amount * 100 - Math.round(amount * 100)) < 1e-6;

/** Fields shared by every quote, whatever its template. */
export const commonFields = {
  /** Quote id, also the output file name — hence the restricted charset. */
  reference: z
    .string({ error: requiredOr('must be text') })
    .regex(
      /^[A-Za-z0-9][A-Za-z0-9._-]*$/,
      'must start with a letter or digit and use only letters, digits, ".", "-" and "_" (it is the output file name)'
    ),
  date: z
    .string({ error: requiredOr('must be text') })
    .refine((value) => parseIsoDate(value) !== null, 'must be a real date written as YYYY-MM-DD'),
  version: z
    .number({ error: requiredOr('must be a whole number') })
    .int('must be a whole number')
    .min(1, 'must be 1 or greater'),
  client: text(),
  title: text(),
  project: text(),
  runningHeader: text(),
};

const scopeBlock = z.strictObject({
  title: text(),
  amount: z
    .number({ error: requiredOr('must be a finite number (euros, no currency sign)') })
    .min(0, 'must not be negative')
    .refine(hasWholeCents, 'must have at most two decimals'),
  items: nonEmptyList(text(), 'item'),
});

const closingSection = z.strictObject({
  title: text(),
  columns: z.literal([1, 2], 'must be 1 or 2').default(1),
  spacing: z.enum(['compact', 'relaxed'], 'must be "compact" or "relaxed"').default('compact'),
  items: nonEmptyList(text(), 'item'),
});

/** `scope-blocks`: fixed-price quote split into numbered, priced scope blocks. */
export const scopeBlocksSchema = z.strictObject({
  template: z.literal('scope-blocks'),
  ...commonFields,
  object: text(),
  scope: nonEmptyList(scopeBlock, 'block'),
  vatRate: z
    .number({ error: requiredOr('must be a number (percentage, e.g. 21)') })
    .min(0, 'must be between 0 and 100')
    .max(100, 'must be between 0 and 100'),
  sections: z.array(closingSection, 'must be a list').default([]),
});

/** One schema per template id. A new template adds its schema here. */
export const quoteSchemas = {
  'scope-blocks': scopeBlocksSchema,
};

/** @typedef {z.infer<typeof scopeBlocksSchema>} ScopeBlocksQuote */
/** @typedef {ScopeBlocksQuote} Quote Any valid quote (union of every template's data). */

/** A quote data file that cannot be used, with one readable line per problem. */
export class QuoteValidationError extends Error {
  /** @param {string[]} problems Each one as `path: reason`. */
  constructor(problems) {
    super(`Invalid quote data:\n${problems.map((problem) => `- ${problem}`).join('\n')}`);
    this.name = 'QuoteValidationError';
    this.problems = problems;
  }
}

/**
 * Write an issue path the way the data file reads: `scope[0].amount`.
 *
 * @param {ReadonlyArray<PropertyKey>} path
 * @returns {string}
 */
function formatPath(path) {
  return path.reduce(
    (/** @type {string} */ out, key) =>
      typeof key === 'number' ? `${out}[${key}]` : out ? `${out}.${String(key)}` : String(key),
    ''
  );
}

/**
 * Turn zod issues into `path: reason` lines.
 *
 * @param {ReadonlyArray<z.core.$ZodIssue>} issues
 * @returns {string[]}
 */
function describeIssues(issues) {
  return issues.flatMap((issue) => {
    if (issue.code === 'unrecognized_keys') {
      return issue.keys.map((key) => `${formatPath([...issue.path, key])}: unknown field`);
    }
    return [`${formatPath(issue.path) || 'quote'}: ${issue.message}`];
  });
}

/**
 * Validate the content of a quote data file against its template's schema.
 *
 * @param {unknown} data Parsed JSON.
 * @returns {Quote} The quote, with defaults applied.
 * @throws {QuoteValidationError} When the data cannot be used.
 */
export function validateQuote(data) {
  if (data === null || typeof data !== 'object' || Array.isArray(data)) {
    throw new QuoteValidationError(['quote: must be a JSON object']);
  }

  const available = Object.keys(quoteSchemas).join(', ');
  const template = /** @type {{ template?: unknown }} */ (data).template;
  if (template === undefined) {
    throw new QuoteValidationError([`template: is required (available: ${available})`]);
  }
  if (typeof template !== 'string' || !Object.hasOwn(quoteSchemas, template)) {
    throw new QuoteValidationError([
      `template: unknown template ${JSON.stringify(template)} (available: ${available})`,
    ]);
  }

  const schema = quoteSchemas[/** @type {keyof typeof quoteSchemas} */ (template)];
  const result = schema.safeParse(data);
  if (!result.success) throw new QuoteValidationError(describeIssues(result.error.issues));
  return result.data;
}
