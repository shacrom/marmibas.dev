// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// ---------------------------------------------------------------------------
// Sitemap lastmod map (T-50)
// ---------------------------------------------------------------------------
// The sitemap integration's `serialize` only receives the page URL — it does
// NOT have access to Astro's content layer. To set a meaningful `lastmod` per
// collection page we pre-build a Map<pathname, ISOString> at config init by
// scanning `src/content/{case-studies,posts}/**` and reading either:
//   1) `publishedAt` / `updatedAt` from the YAML frontmatter (if present), or
//   2) the file's `mtime` as a sensible fallback.
// The map is resolved once at config load and reused for every page that
// passes through `serialize`. Pages without a hit (static index/about/etc.)
// fall through to the integration's default behavior (no lastmod tag), which
// search engines tolerate.
//
// Why a tiny inline frontmatter regex instead of a dependency:
// `astro.config.mjs` runs before Astro's content layer is initialized, so
// `astro:content` is not available here. Pulling in `gray-matter` just for
// two date fields is not justified — the YAML block is well-known shape.
// ---------------------------------------------------------------------------

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Match `key: value` (or `key: 'value'`) lines inside the frontmatter block.
 * @param {string} raw — full file contents.
 * @param {string} key — frontmatter key to read (e.g. `publishedAt`).
 * @returns {Date | undefined}
 */
function readFrontmatterDate(raw, key) {
  // Frontmatter is delimited by leading `---\n...\n---`.
  const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!fmMatch) return undefined;
  const block = fmMatch[1];
  if (!block) return undefined;
  const re = new RegExp(`^${key}:\\s*["']?([^"'\\n\\r]+)["']?\\s*$`, 'm');
  const m = block.match(re);
  if (!m || !m[1]) return undefined;
  const date = new Date(m[1]);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

/**
 * Build URL pathname → lastmod (Date) map for case-studies + posts.
 *
 * Route reality (per `src/pages/`):
 *   - case-studies → `/case-studies/<slug>` (ES) and `/en/case-studies/<slug>`
 *     (EN). The user-facing aliases `/trabajos` and `/en/work` are LIST
 *     pages only; detail pages live under `/case-studies/`.
 *   - posts        → `/blog/<slug>` (ES) and `/en/blog/<slug>` (EN).
 *
 * If detail-page routes are renamed in the future (e.g. moved under
 * `/trabajos/<slug>`), update the `pathFor` callbacks below in lockstep.
 */
function buildLastmodMap() {
  const map = new Map();

  /** @type {Array<{ collection: string, langDir: string, pathFor: (slug: string) => string }>} */
  const sources = [
    {
      collection: 'case-studies',
      langDir: 'es',
      pathFor: (slug) => `/case-studies/${slug}`,
    },
    {
      collection: 'case-studies',
      langDir: 'en',
      pathFor: (slug) => `/en/case-studies/${slug}`,
    },
    {
      collection: 'posts',
      langDir: 'es',
      pathFor: (slug) => `/blog/${slug}`,
    },
    {
      collection: 'posts',
      langDir: 'en',
      pathFor: (slug) => `/en/blog/${slug}`,
    },
  ];

  for (const { collection, langDir, pathFor } of sources) {
    const dir = path.join(__dirname, 'src', 'content', collection, langDir);
    if (!fs.existsSync(dir)) continue;

    for (const entry of fs.readdirSync(dir)) {
      if (!/\.(md|mdx)$/.test(entry)) continue;
      const file = path.join(dir, entry);
      const slug = entry.replace(/\.(md|mdx)$/, '');
      let raw = '';
      try {
        raw = fs.readFileSync(file, 'utf8');
      } catch {
        continue;
      }
      const fmDate =
        readFrontmatterDate(raw, 'updatedAt') ??
        readFrontmatterDate(raw, 'publishedAt');
      let lastmod;
      if (fmDate) {
        lastmod = fmDate;
      } else {
        try {
          lastmod = fs.statSync(file).mtime;
        } catch {
          lastmod = undefined;
        }
      }
      if (lastmod) {
        map.set(pathFor(slug), lastmod.toISOString());
      }
    }
  }

  return map;
}

const LASTMOD_BY_PATH = buildLastmodMap();

// https://astro.build/config
export default defineConfig({
  site: 'https://marmibas.dev',
  output: 'static',

  adapter: vercel({
    webAnalytics: { enabled: true },
  }),

  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en'],
    routing: {
      prefixDefaultLocale: false,
      redirectToDefaultLocale: false,
      fallbackType: 'rewrite',
    },
    fallback: {
      en: 'es',
    },
  },

  integrations: [
    mdx(),
    sitemap({
      // English content is hidden from the public UI; do NOT advertise it in
      // the sitemap (no entries, no hreflang). The /en/* routes still build
      // and respond, but BaseLayout forces noindex on them and robots.txt
      // disallows the prefix. Re-enable the i18n config + drop the /en/
      // exclusion below to bring the English version back.
      // Skip API endpoints (e.g. /api/contact) — they are not addressable
      // pages and search engines must not index them. Skip /en/* while the
      // English version is hidden.
      filter: (page) => !page.includes('/api/') && !/\/en(\/|$)/.test(page),
      // Inject `lastmod` from the collection frontmatter (or file mtime) for
      // case-studies + posts. Other pages keep the integration default.
      serialize: (item) => {
        try {
          const url = new URL(item.url);
          // Strip trailing slash so `/blog/post/` matches `/blog/post`.
          const pathname = url.pathname.endsWith('/') && url.pathname !== '/'
            ? url.pathname.slice(0, -1)
            : url.pathname;
          const lastmod = LASTMOD_BY_PATH.get(pathname);
          if (lastmod) {
            return { ...item, lastmod };
          }
        } catch {
          // Malformed URL — return the item unchanged.
        }
        return item;
      },
    }),
  ],

  markdown: {
    shikiConfig: {
      theme: 'github-dark-dimmed',
      wrap: true,
    },
  },

  vite: {
    plugins: [tailwindcss()],
  },
});
