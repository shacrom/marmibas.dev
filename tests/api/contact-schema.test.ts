/**
 * Unit tests for the contact form Zod schema · T-55.
 *
 * Cover the 5 main validation paths used by `/api/contact`:
 *   1. Happy path with all fields including `lang`.
 *   2. `name` shorter than the min length (2).
 *   3. Malformed `email`.
 *   4. `message` shorter than the min length (10).
 *   5. `lang` outside the allowed enum ('es' | 'en').
 */

import { describe, it, expect } from 'vitest';
import { contactSchema } from '../../src/lib/contact-schema';

describe('contactSchema', () => {
  it('accepts a valid payload with explicit lang', () => {
    const result = contactSchema.safeParse({
      name: 'Mario',
      email: 'm@example.com',
      message: 'Hola mundo, mensaje válido',
      lang: 'es',
    });

    expect(result.success).toBe(true);
  });

  it('rejects a name shorter than 2 chars', () => {
    const result = contactSchema.safeParse({
      name: 'M',
      email: 'm@e.com',
      message: 'mensaje válido aquí',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path[0] === 'name')).toBe(true);
    }
  });

  it('rejects an invalid email format', () => {
    const result = contactSchema.safeParse({
      name: 'Mario',
      email: 'no-es-email',
      message: 'mensaje válido aquí',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path[0] === 'email')).toBe(true);
    }
  });

  it('rejects a message shorter than 10 chars', () => {
    const result = contactSchema.safeParse({
      name: 'Mario',
      email: 'm@e.com',
      message: 'hola',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path[0] === 'message')).toBe(true);
    }
  });

  it('rejects a lang value outside the enum', () => {
    const result = contactSchema.safeParse({
      name: 'Mario',
      email: 'm@e.com',
      message: 'mensaje válido aquí',
      lang: 'fr',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path[0] === 'lang')).toBe(true);
    }
  });
});
