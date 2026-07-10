import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const dist = resolve('dist/client');
const services = [
  'tiendas-online',
  'sistemas-de-gestion',
  'aplicaciones-moviles',
  'automatizaciones',
  'webs-corporativas',
  'desarrollo-aplicaciones-web',
  'integraciones',
];
const publicSpanishRoutes = [
  '/',
  '/experiencia/',
  '/servicios/',
  ...services.map((slug) => `/servicios/${slug}/`),
];

function outputFile(route) {
  if (route.endsWith('.html')) return resolve(dist, route.slice(1));
  return route === '/' ? resolve(dist, 'index.html') : resolve(dist, route.slice(1), 'index.html');
}

function readRoute(route) {
  const file = outputFile(route);
  if (!existsSync(file)) throw new Error(`Missing rendered output for ${route}: ${file}`);
  return readFileSync(file, 'utf8');
}

function attr(html, selector) {
  const match = html.match(selector);
  if (!match?.[1]) throw new Error(`Missing expected metadata: ${selector}`);
  return match[1];
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertHttpsUrl(value, label) {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`${label} is not an absolute URL: ${value}`);
  }
  assert(url.protocol === 'https:', `${label} must use HTTPS: ${value}`);
}

function assertIndexableSpanishPage(route) {
  const html = readRoute(route);
  assert(!/name="robots" content="[^"]*noindex/i.test(html), `${route} must be indexable`);
  assert(!/hreflang="en"/i.test(html), `${route} must not expose a hidden English alternate`);

  const canonical = attr(html, /<link rel="canonical" href="([^"]+)"/i);
  const ogUrl = attr(html, /<meta property="og:url" content="([^"]+)"/i);
  const ogImage = attr(html, /<meta property="og:image" content="([^"]+)"/i);
  assertHttpsUrl(canonical, `${route} canonical`);
  assertHttpsUrl(ogUrl, `${route} og:url`);
  assertHttpsUrl(ogImage, `${route} og:image`);
  assert(canonical === ogUrl, `${route} canonical and og:url must agree`);

  const alternateLanguages = [
    ...html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/gi),
  ];
  assert(
    alternateLanguages.length === 2,
    `${route} must expose only current-language and x-default alternates`
  );
  for (const [, language, href] of alternateLanguages) {
    assert(
      language === 'es' || language === 'x-default',
      `${route} emitted an untruthful alternate`
    );
    assert(href === canonical, `${route} ${language} alternate must match its canonical URL`);
  }
}

for (const route of publicSpanishRoutes) assertIndexableSpanishPage(route);

for (const route of ['/contacto/', '/politica-cookies/']) {
  assert(
    /name="robots" content="noindex, follow"/i.test(readRoute(route)),
    `${route} must remain noindex`
  );
}
assert(
  /name="robots" content="noindex, nofollow"/i.test(readRoute('/404.html')),
  '404 must remain noindex, nofollow'
);
assert(
  /name="robots" content="noindex, follow"/i.test(readRoute('/en/')),
  'English pages must remain noindex'
);

for (const slug of services) {
  const html = readRoute(`/servicios/${slug}/`);
  const schemas = [
    ...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi),
  ].map(([, json]) => JSON.parse(json));
  assert(
    schemas.some((schema) => schema['@type'] === 'Service'),
    `/servicios/${slug}/ needs Service JSON-LD`
  );
}

const sitemap = readFileSync(resolve(dist, 'sitemap-0.xml'), 'utf8');
for (const route of publicSpanishRoutes) {
  assert(sitemap.includes(`https://marmibas.dev${route}`), `Sitemap must include ${route}`);
}
for (const excluded of ['/en/', '/contacto/', '/politica-cookies/', '/404']) {
  assert(!sitemap.includes(`https://marmibas.dev${excluded}`), `Sitemap must exclude ${excluded}`);
}

const robots = readFileSync(resolve(dist, 'robots.txt'), 'utf8');
assert(/Allow: \//.test(robots), 'robots.txt must allow public pages');
assert(/Disallow: \/api\//.test(robots), 'robots.txt must block API routes');
assert(/Disallow: \/en\//.test(robots), 'robots.txt must block hidden English routes');
assert(
  /Sitemap: https:\/\/marmibas\.dev\/sitemap-index\.xml/.test(robots),
  'robots.txt sitemap must be canonical'
);

console.log(`SEO output contract passed for ${publicSpanishRoutes.length} public Spanish routes.`);
