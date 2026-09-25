import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const dist = resolve('dist/client');
// The 7 dedicated /servicios/<slug>/ landing pages were removed (S3,
// `odd/tasks/services-mosaic.md`) and folded into /servicios' mosaic
// drawers; they now 301-redirect to /servicios/#<slug> (tested in
// tests/config/vercel-redirects.test.ts), so this list is only used below
// to assert they no longer produce build output or sitemap entries.
const removedServiceSlugs = [
  'tiendas-online',
  'sistemas-de-gestion',
  'aplicaciones-moviles',
  'automatizaciones',
  'webs-corporativas',
  'desarrollo-aplicaciones-web',
  'integraciones',
];
const publicSpanishRoutes = ['/', '/experiencia/', '/servicios/'];

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
  assert(!/hreflang="en"/i.test(html), `${route} must not expose an English alternate (removed)`);

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

// /servicios/ carries an ItemList of Service ListItems — the structured-
// data replacement for the Service schema the removed detail pages used to
// emit individually (see SeoHead.astro). One entry per removed slug, each
// pointing at that service's mosaic drawer hash.
{
  const html = readRoute('/servicios/');
  const schemas = [
    ...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi),
  ].map(([, json]) => JSON.parse(json));
  const itemList = schemas.find((schema) => schema['@type'] === 'ItemList');
  assert(itemList, '/servicios/ needs an ItemList JSON-LD block');
  assert(
    itemList.itemListElement.length === removedServiceSlugs.length,
    `/servicios/ ItemList must have ${removedServiceSlugs.length} items`
  );
  for (const slug of removedServiceSlugs) {
    assert(
      itemList.itemListElement.some(
        (entry) =>
          entry.item?.['@type'] === 'Service' &&
          entry.item.url === `https://marmibas.dev/servicios/#${slug}`
      ),
      `/servicios/ ItemList must include a Service item for #${slug}`
    );
  }
}

// The removed detail pages must not produce build output any more.
for (const slug of removedServiceSlugs) {
  assert(
    !existsSync(outputFile(`/servicios/${slug}/`)),
    `/servicios/${slug}/ must no longer be built (removed in S3)`
  );
}

const sitemap = readFileSync(resolve(dist, 'sitemap-0.xml'), 'utf8');
for (const route of publicSpanishRoutes) {
  assert(sitemap.includes(`https://marmibas.dev${route}`), `Sitemap must include ${route}`);
}
for (const excluded of ['/en/', '/blog', '/contacto/', '/politica-cookies/', '/404']) {
  assert(!sitemap.includes(`https://marmibas.dev${excluded}`), `Sitemap must exclude ${excluded}`);
}
for (const slug of removedServiceSlugs) {
  assert(
    !sitemap.includes(`https://marmibas.dev/servicios/${slug}/`),
    `Sitemap must exclude the removed /servicios/${slug}/`
  );
}

const robots = readFileSync(resolve(dist, 'robots.txt'), 'utf8');
assert(/Allow: \//.test(robots), 'robots.txt must allow public pages');
assert(/Disallow: \/api\//.test(robots), 'robots.txt must block API routes');
assert(!/Disallow: \/en\//.test(robots), 'robots.txt must not reference the removed /en/ prefix');
assert(
  /Sitemap: https:\/\/marmibas\.dev\/sitemap-index\.xml/.test(robots),
  'robots.txt sitemap must be canonical'
);

console.log(`SEO output contract passed for ${publicSpanishRoutes.length} public Spanish routes.`);
