/**
 * Template registry: the one place that says which quote templates exist.
 * The build CLI looks a quote's `template` id up here.
 *
 * Adding a template: create `quotes/templates/<id>/` (template.mjs,
 * styles.css, example.json, README.md), add its schema to
 * `quotes/lib/schema.mjs`, and register it below.
 */
import { quoteSchemas } from '../lib/schema.mjs';
import { render as renderScopeBlocks } from './scope-blocks/template.mjs';

/**
 * @typedef {object} QuoteTemplate
 * @property {string} id Value of the `template` field in a quote data file.
 * @property {string} description One line: what the template is for.
 * @property {import('zod').ZodType} schema Schema of its data file.
 * @property {(quote: any, assets: { wordmarkSvg: string, css: string }) => string} render
 *   Validated quote → complete HTML document.
 */

/** @type {Record<string, QuoteTemplate>} */
export const templates = {
  'scope-blocks': {
    id: 'scope-blocks',
    description:
      'Fixed-price quote: cover, object, scope in numbered priced blocks, amount table with VAT, closing lists.',
    schema: quoteSchemas['scope-blocks'],
    render: renderScopeBlocks,
  },
};

/**
 * Every registered template, for `--list` and the docs.
 *
 * @returns {Array<{ id: string, description: string }>}
 */
export function listTemplates() {
  return Object.values(templates).map(({ id, description }) => ({ id, description }));
}

/**
 * Look a template up by id.
 *
 * @param {string} id
 * @returns {QuoteTemplate}
 * @throws {Error} When no template has that id.
 */
export function getTemplate(id) {
  const template = Object.hasOwn(templates, id) ? templates[id] : undefined;
  if (!template) {
    const available = Object.keys(templates).join(', ');
    throw new Error(`Unknown template "${id}" (available: ${available})`);
  }
  return template;
}
