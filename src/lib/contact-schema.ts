/**
 * Zod schema for the `/api/contact` POST payload · T-41 / T-55.
 *
 * Extracted from `src/pages/api/contact.ts` so it can be unit-tested in
 * isolation (no Astro / Resend env required) and reused if the form ever
 * lives in another endpoint or in a tRPC-style client.
 *
 * Fields:
 *   - `name`    2..100 chars
 *   - `email`   valid email format
 *   - `message` 10..2000 chars
 *   - `website` optional honeypot (filled = bot)
 *   - `lang`    enum 'es' | 'en' (default 'es')
 */

import { z } from 'zod';

export const contactSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  message: z.string().min(10).max(2000),
  website: z.string().optional(), // honeypot
  lang: z.enum(['es', 'en']).default('es'),
});

export type ContactPayload = z.infer<typeof contactSchema>;
