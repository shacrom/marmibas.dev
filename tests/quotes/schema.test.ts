/**
 * Contract for quote validation: a quote data file either parses into the
 * template's shape or fails with a message a person can act on (path + reason).
 */

import { describe, expect, it } from 'vitest';
import { QuoteValidationError, quoteSchemas, validateQuote } from '../../quotes/lib/schema.mjs';

/** A minimal valid `scope-blocks` quote. All content is fictional. */
function validQuote(): Record<string, unknown> {
  return {
    template: 'scope-blocks',
    reference: 'MMB-ACME-WEB-2026-10',
    date: '2026-10-05',
    version: 1,
    client: 'Acme Ficticia S.L.',
    title: 'Sitio web corporativo',
    project: 'Acme',
    runningHeader: 'Acme · Sitio web',
    object: 'Sitio web corporativo de cinco páginas.',
    scope: [
      { title: 'Diseño', amount: 400, items: ['Página de inicio.', 'Páginas interiores.'] },
      { title: 'Desarrollo', amount: 600, items: ['Maquetación.'] },
    ],
    vatRate: 21,
    sections: [{ title: 'No incluido', columns: 2, items: ['Alojamiento.', 'Dominio.'] }],
  };
}

/** Runs the validation and returns the error message, failing if it passes. */
function messageFor(data: unknown): string {
  try {
    validateQuote(data);
  } catch (error) {
    expect(error).toBeInstanceOf(QuoteValidationError);
    return (error as Error).message;
  }
  throw new Error('expected the quote to be rejected');
}

describe('validateQuote', () => {
  it('accepts a valid quote and returns its data', () => {
    const quote = validateQuote(validQuote());

    expect(quote.reference).toBe('MMB-ACME-WEB-2026-10');
    expect(quote.scope).toHaveLength(2);
    expect(quote.sections[0]?.columns).toBe(2);
  });

  it('defaults the optional parts: no closing sections, one column, compact spacing', () => {
    const data = validQuote();
    delete data.sections;
    expect(validateQuote(data).sections).toEqual([]);

    data.sections = [{ title: 'Observaciones', items: ['Una nota.'] }];
    expect(validateQuote(data).sections[0]).toMatchObject({ columns: 1, spacing: 'compact' });
  });

  it('rejects an unknown template and names the available ones', () => {
    const message = messageFor({ ...validQuote(), template: 'fancy' });

    expect(message).toContain('template');
    expect(message).toContain('"fancy"');
    expect(message).toContain('scope-blocks');
  });

  it('rejects a quote without a template', () => {
    const data = validQuote();
    delete data.template;

    expect(messageFor(data)).toMatch(/template: .*required/);
  });

  it('rejects a missing required field, naming it', () => {
    const data = validQuote();
    delete data.client;

    expect(messageFor(data)).toMatch(/client: .*required/);
  });

  it('rejects a blank string where text is required', () => {
    expect(messageFor({ ...validQuote(), object: '   ' })).toMatch(/object: .*empty/);
  });

  it('rejects an empty scope and a block without items', () => {
    expect(messageFor({ ...validQuote(), scope: [] })).toMatch(/scope: .*at least one/);
    expect(
      messageFor({ ...validQuote(), scope: [{ title: 'Diseño', amount: 400, items: [] }] })
    ).toMatch(/scope\[0\]\.items: .*at least one/);
  });

  it('rejects negative, non-finite and sub-cent amounts with the block path', () => {
    const withAmount = (amount: unknown) => ({
      ...validQuote(),
      scope: [{ title: 'Diseño', amount, items: ['Página de inicio.'] }],
    });

    expect(messageFor(withAmount(-1))).toMatch(/scope\[0\]\.amount: .*negative/);
    expect(messageFor(withAmount(Number.POSITIVE_INFINITY))).toMatch(/scope\[0\]\.amount: /);
    expect(messageFor(withAmount(Number.NaN))).toMatch(/scope\[0\]\.amount: /);
    expect(messageFor(withAmount('400'))).toMatch(/scope\[0\]\.amount: /);
    expect(messageFor(withAmount(10.005))).toMatch(/scope\[0\]\.amount: .*two decimals/);
  });

  it('rejects a reference that is not safe as a file name', () => {
    for (const reference of ['../etc/passwd', 'a/b', 'a\\b', 'MMB 2026', '.hidden', '']) {
      expect(messageFor({ ...validQuote(), reference })).toMatch(/reference: /);
    }
  });

  it('rejects a date that is not a real ISO date', () => {
    expect(messageFor({ ...validQuote(), date: '05/10/2026' })).toMatch(/date: .*YYYY-MM-DD/);
    expect(messageFor({ ...validQuote(), date: '2026-02-30' })).toMatch(/date: .*YYYY-MM-DD/);
  });

  it('rejects a VAT rate outside 0–100 and a column count other than 1 or 2', () => {
    expect(messageFor({ ...validQuote(), vatRate: -1 })).toMatch(/vatRate: /);
    expect(messageFor({ ...validQuote(), vatRate: 101 })).toMatch(/vatRate: /);
    expect(
      messageFor({ ...validQuote(), sections: [{ title: 'Notas', columns: 3, items: ['Una.'] }] })
    ).toMatch(/sections\[0\]\.columns: /);
  });

  it('rejects unknown fields so a typo cannot be silently ignored', () => {
    expect(messageFor({ ...validQuote(), totl: 1815 })).toMatch(/totl/);
  });

  it('reports every problem at once, one per line', () => {
    const data = validQuote();
    delete data.client;
    data.vatRate = -1;
    const message = messageFor(data);

    expect(message.split('\n').filter((line) => line.startsWith('- '))).toHaveLength(2);
  });

  it('rejects data that is not an object', () => {
    expect(messageFor(null)).toMatch(/object/);
    expect(messageFor([])).toMatch(/object/);
  });
});

describe('quoteSchemas', () => {
  it('holds one schema per template id', () => {
    expect(Object.keys(quoteSchemas)).toEqual(['scope-blocks']);
  });
});
