/**
 * Contract for the template registry: the one place that says which quote
 * templates exist and what each needs to be usable from the build CLI.
 */

import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { quoteSchemas, validateQuote } from '../../quotes/lib/schema.mjs';
import { computeTotals } from '../../quotes/lib/totals.mjs';
import { getTemplate, listTemplates, templates } from '../../quotes/templates/index.mjs';

const templateFile = (id: string, name: string) =>
  new URL(`../../quotes/templates/${id}/${name}`, import.meta.url);

describe('template registry', () => {
  it('lists every template with its id and a one-line description', () => {
    const list = listTemplates();

    expect(list.map((template) => template.id)).toEqual(['scope-blocks']);
    for (const template of list) {
      expect(template.description.length).toBeGreaterThan(20);
      expect(template.description).not.toContain('\n');
    }
  });

  it('registers exactly the templates that have a schema', () => {
    expect(Object.keys(templates).sort()).toEqual(Object.keys(quoteSchemas).sort());
  });

  it('gives each template its id, schema and render function', () => {
    for (const [id, template] of Object.entries(templates)) {
      expect(template.id).toBe(id);
      expect(template.schema).toBe(quoteSchemas[id as keyof typeof quoteSchemas]);
      expect(typeof template.render).toBe('function');
    }
  });

  it('finds a template by id and rejects an unknown one', () => {
    expect(getTemplate('scope-blocks').id).toBe('scope-blocks');
    expect(() => getTemplate('fancy')).toThrow(/unknown template "fancy"/i);
    expect(() => getTemplate('toString')).toThrow(/unknown template/i);
  });

  it('ships a stylesheet, a README and a valid example with every template', () => {
    for (const { id } of listTemplates()) {
      expect(existsSync(templateFile(id, 'styles.css'))).toBe(true);
      expect(existsSync(templateFile(id, 'README.md'))).toBe(true);

      const example = validateQuote(
        JSON.parse(readFileSync(templateFile(id, 'example.json'), 'utf8'))
      );
      expect(example.template).toBe(id);
    }
  });
});

describe('scope-blocks example', () => {
  const example = validateQuote(
    JSON.parse(readFileSync(templateFile('scope-blocks', 'example.json'), 'utf8'))
  );

  it('is shaped like a real quote: five blocks and the three usual closing lists', () => {
    expect(example.scope).toHaveLength(5);
    for (const block of example.scope) {
      expect(block.items.length).toBeGreaterThanOrEqual(3);
      expect(block.items.length).toBeLessThanOrEqual(5);
    }
    expect(example.sections.map((section) => section.columns)).toEqual([2, 1, 1]);
  });

  it('adds up to a round subtotal', () => {
    const { subtotal } = computeTotals(example.scope, example.vatRate);

    expect(subtotal % 100).toBe(0);
  });
});
