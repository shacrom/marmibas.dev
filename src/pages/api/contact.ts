/**
 * `/api/contact` — POST endpoint del formulario de contacto · T-41.
 *
 * Stack: Astro endpoint + Zod + Resend.
 *
 * Pipeline:
 *   1. Content-Type guard (solo JSON).
 *   2. Parse JSON.
 *   3. Validación Zod (`safeParse`).
 *   4. Honeypot (`website` rellenado → 200 silencioso, no envía).
 *   5. Rate-limit en memoria por IP (5 req / 10 min).
 *   6. Resend SDK envía email.
 *
 * Notas:
 *   - `prerender = false` fuerza SSR de este endpoint a pesar de que el
 *     resto del sitio sea estático (`output: 'static'` en astro.config).
 *   - Logging mínimo: solo IP + timestamp + status. Nunca el contenido del
 *     mensaje (privacidad + GDPR-friendly).
 *   - El Map de rate-limit vive en memoria del proceso. En serverless cada
 *     instancia tiene su propio Map; es una mitigación, no una garantía
 *     férrea. Suficiente para un site personal de bajo volumen.
 *   - From `noreply@marmibas.dev` requiere DKIM verificado en Hostinger DNS
 *     (followup T-58). Sin DKIM, Resend rechaza el envío.
 */

import type { APIRoute } from 'astro';
import { z } from 'zod';
import { Resend } from 'resend';

// SSR forzado para este endpoint en un site con `output: 'static'`.
export const prerender = false;

// --- Esquema Zod ----------------------------------------------------------

const contactSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  message: z.string().min(10).max(2000),
  website: z.string().optional(), // honeypot
  lang: z.enum(['es', 'en']).default('es'),
});

type ContactPayload = z.infer<typeof contactSchema>;

// --- Rate-limit en memoria ------------------------------------------------

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutos
const RATE_LIMIT_MAX_REQUESTS = 5;

interface RateLimitEntry {
  count: number;
  firstAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Devuelve true si la IP ha excedido el rate-limit. También limpia entradas
 * expiradas oportunisticamente para no crecer sin límite.
 */
function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  if (!entry || now - entry.firstAt > RATE_LIMIT_WINDOW_MS) {
    rateLimitStore.set(ip, { count: 1, firstAt: now });
    return false;
  }

  entry.count += 1;
  if (entry.count > RATE_LIMIT_MAX_REQUESTS) {
    return true;
  }
  return false;
}

// --- Helpers --------------------------------------------------------------

/**
 * Extrae IP del cliente. En Vercel el primer hop es `x-forwarded-for`;
 * fallback a `x-real-ip` y por último `'unknown'`.
 */
function getClientIp(request: Request): string {
  const xff = request.headers.get('x-forwarded-for');
  if (xff) {
    // x-forwarded-for puede ser "client, proxy1, proxy2" — quedarse con el primero.
    const first = xff.split(',')[0]?.trim();
    if (first) return first;
  }
  const xRealIp = request.headers.get('x-real-ip');
  if (xRealIp) return xRealIp.trim();
  return 'unknown';
}

function jsonResponse(
  body: Record<string, unknown>,
  status: number
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });
}

function buildSubject(name: string, lang: 'es' | 'en'): string {
  return lang === 'en'
    ? `[marmibas.dev] New message from ${name}`
    : `[marmibas.dev] Nuevo mensaje de ${name}`;
}

/**
 * Escapa HTML para evitar inyección en el email renderizado.
 */
function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildHtmlBody(payload: ContactPayload): string {
  const name = escapeHtml(payload.name);
  const email = escapeHtml(payload.email);
  // Preservar saltos de línea del mensaje en el render HTML.
  const message = escapeHtml(payload.message).replace(/\n/g, '<br />');

  return `<!doctype html>
<html lang="${payload.lang}">
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background:#0a0a0f; color:#fafafa; padding:24px; margin:0;">
    <div style="max-width:600px; margin:0 auto; background:#13131a; border:1px solid #27272f; border-radius:12px; padding:32px;">
      <h1 style="margin:0 0 8px 0; font-size:20px; color:#a78bfa;">marmibas.dev</h1>
      <p style="margin:0 0 24px 0; color:#9ca3af; font-size:13px;">${
        payload.lang === 'en' ? 'New contact form message' : 'Nuevo mensaje del formulario de contacto'
      }</p>
      <table style="width:100%; border-collapse:collapse; margin-bottom:20px;">
        <tr>
          <td style="padding:8px 12px; background:#1c1c24; border-radius:6px 0 0 6px; color:#9ca3af; font-size:13px; width:80px;">${
            payload.lang === 'en' ? 'Name' : 'Nombre'
          }</td>
          <td style="padding:8px 12px; background:#1c1c24; border-radius:0 6px 6px 0; color:#fafafa; font-size:14px;">${name}</td>
        </tr>
        <tr><td style="height:6px;" colspan="2"></td></tr>
        <tr>
          <td style="padding:8px 12px; background:#1c1c24; border-radius:6px 0 0 6px; color:#9ca3af; font-size:13px; width:80px;">Email</td>
          <td style="padding:8px 12px; background:#1c1c24; border-radius:0 6px 6px 0; color:#fafafa; font-size:14px;"><a href="mailto:${email}" style="color:#a78bfa; text-decoration:none;">${email}</a></td>
        </tr>
      </table>
      <div style="padding:16px; background:#1c1c24; border-left:3px solid #a78bfa; border-radius:4px; color:#e5e7eb; font-size:14px; line-height:1.6; white-space:pre-wrap;">${message}</div>
    </div>
  </body>
</html>`;
}

// --- Handler --------------------------------------------------------------

export const POST: APIRoute = async ({ request }) => {
  const ip = getClientIp(request);
  const startedAt = new Date().toISOString();

  // 1. Content-Type guard.
  const contentType = request.headers.get('content-type') ?? '';
  if (!contentType.toLowerCase().includes('application/json')) {
    console.warn(`[contact] ${startedAt} ip=${ip} status=400 reason=invalid_content_type`);
    return jsonResponse({ ok: false, error: 'invalid_content_type' }, 400);
  }

  // 2. Parse JSON.
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    console.warn(`[contact] ${startedAt} ip=${ip} status=400 reason=invalid_json`);
    return jsonResponse({ ok: false, error: 'invalid_json' }, 400);
  }

  // 3. Validación Zod.
  const parsed = contactSchema.safeParse(raw);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    const issueMsg = firstIssue?.message ?? 'invalid_payload';
    console.warn(`[contact] ${startedAt} ip=${ip} status=400 reason=validation`);
    return jsonResponse({ ok: false, error: 'validation', issue: issueMsg }, 400);
  }

  const payload = parsed.data;

  // 4. Honeypot: si está rellenado, devolvemos 200 silencioso (no enviamos).
  if (payload.website && payload.website.trim().length > 0) {
    console.info(`[contact] ${startedAt} ip=${ip} status=200 reason=honeypot`);
    return jsonResponse({ ok: true }, 200);
  }

  // 5. Rate-limit por IP.
  if (isRateLimited(ip)) {
    console.warn(`[contact] ${startedAt} ip=${ip} status=429 reason=rate_limit`);
    return jsonResponse({ ok: false, error: 'rate_limit' }, 429);
  }

  // 6. Resend.
  const apiKey = import.meta.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error(`[contact] ${startedAt} ip=${ip} status=500 reason=missing_api_key`);
    return jsonResponse({ ok: false, error: 'server_misconfigured' }, 500);
  }

  const toEmail = import.meta.env.CONTACT_TO_EMAIL ?? 'marmibas.dev@gmail.com';
  const resend = new Resend(apiKey);

  try {
    const result = await resend.emails.send({
      from: 'marmibas.dev <noreply@marmibas.dev>',
      to: [toEmail],
      replyTo: payload.email,
      subject: buildSubject(payload.name, payload.lang),
      html: buildHtmlBody(payload),
    });

    if (result.error) {
      console.error(
        `[contact] ${startedAt} ip=${ip} status=500 reason=resend_error name=${result.error.name}`
      );
      return jsonResponse({ ok: false, error: 'send_failed' }, 500);
    }

    console.info(`[contact] ${startedAt} ip=${ip} status=200 lang=${payload.lang}`);
    return jsonResponse({ ok: true }, 200);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown';
    console.error(`[contact] ${startedAt} ip=${ip} status=500 reason=exception msg=${message}`);
    return jsonResponse({ ok: false, error: 'send_failed' }, 500);
  }
};
