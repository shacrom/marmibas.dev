# Site cleanup — remove blog and English version, footer polish, mobile clock

## Objective

Follow-up to the terminal redesign (PR #1, 0f0e4d2): remove the blog and the English version, drop orphaned i18n
keys, finish the footer polish and fix the mobile header clock layout.

## Owner decisions (2026-09-25)

- Blog: **delete and redirect** — pages, posts, RSS, nav/footer/sitemap entries removed; `/blog` and `/blog/*`
  301 to `/`. Posts remain recoverable from git history.
- English version: **remove** — all `/en/**` pages and EN content/copy; the i18n layer stays but with Spanish as
  the only locale (keeps the structure ready if a language is added again). `/en/*` 301 to the Spanish equivalent
  (e.g. `/en/work` → `/trabajos/`, `/en/contact` → `/contacto/`), otherwise `/`.
- Remove unused i18n keys (`about.stats.*` and any key orphaned by the removals).
- Footer: violet glow on the capture heading + staggered entrance of the `tree` rows.
- Mobile header: the clock sits against the top edge and the menu button — centre it vertically, give it room,
  verify at 320–390 px.

## Constraints

- Redirects are platform-level in `vercel.json` (existing config file), `permanent: true`.
- SEO output contract (`npm run test:seo`) keeps passing; update the script where it asserts EN-specific behaviour.
- Strict TDD for pure logic (`src/lib/navigation.ts`, `src/lib/footer.ts`, i18n helpers): update tests first (RED),
  then code (GREEN). Runner `npm test`.
- Known lint base failures (from main): see `odd/tasks/terminal-redesign.md` — some will disappear with the removed
  files; no new ones allowed.
- Commits per work unit, Conventional Commits, no `Co-Authored-By`. Push/PR/merge only after owner OK.

## Tasks

| ID | Task | Route | Status |
|----|------|-------|--------|
| C1 | Remove blog + 301 redirects + RSS/dependency cleanup | delegated writer | [x] |
| C2 | Remove English version (pages, content, EN copy, ES-only i18n) + 301 redirects + SEO script update | delegated writer | [ ] |
| C3 | Remove orphaned i18n keys (`about.stats.*` and others) | delegated writer | [ ] |
| C4 | Footer polish: heading glow + staggered tree rows | delegated writer | [ ] |
| C5 | Mobile header clock layout | delegated writer | [ ] |
| C6 | Verification (checks, redirects in build output, visual QA 1440/390/320) + delivery (asked) | parent | [ ] |

## Progress

- Branch `feature/site-cleanup` from `origin/main` 0f0e4d2.

- C1 done: deleted `src/pages/blog/**`, `src/pages/en/blog/**`, `src/pages/{,en/}rss.xml.ts`,
  `src/content/posts/**`, `src/layouts/PostLayout.astro` (verified only the blog imported it; `Prose.astro`/
  `prose.css` stay — still used by `CaseStudyLayout`, `ProjectDetailLayout`, `/experiencia`). Dropped the `posts`
  collection from `src/content.config.ts`, the posts sitemap-lastmod sources in `astro.config.mjs`, and the RSS
  `<link rel="alternate">` in `SeoHead.astro`. `npm uninstall @astrojs/rss` (lockfile clean, no leftover entry).
  Kept `@astrojs/mdx` — still used by case-studies/projects content.
  TDD (RED observed first): edited `tests/lib/navigation.test.ts` + `tests/lib/footer.test.ts` to drop blog/RSS
  expectations → 5 failing tests (nav ES/EN missing-blog assertions, footer `more`-group RSS-href assertions) →
  then updated `src/lib/navigation.ts` (dropped `blog` from `PRIMARY_ROUTE_NAV`) and `src/lib/footer.ts` (dropped
  the `rss` item from `getMoreGroup`, unused `t`/`localePath` params/import removed) → GREEN (63/63).
  Removed the `blog` route from `src/i18n/routes.ts`, and `nav.blog` / `footer.rss` / `blog.*` (heading, tagline,
  empty, readingTime) from both locales in `src/i18n/ui.ts`. Fixed stale `/blog/...` example paths in
  `src/i18n/helpers.ts` and `src/components/ui/SeoHead.astro` docstrings (swapped for `/case-studies/...`
  examples). `vercel.json`: added a `redirects` array — `/rss.xml` → `/`, `/blog` → `/`, `/blog/:path*` → `/`,
  all `permanent: true` (project has no `trailingSlash` config, so no trailing-slash variants needed — Vercel
  normalizes). README.md pages/content tree updated (dropped `posts`/blog/PostLayout mentions). DESIGN.md: dropped
  the blog max-width example and the blog "pendiente de iterar" line. Left `TASKS.md` and
  `src/pages/servicios/webs-corporativas.astro`'s "blog" (client feature copy, unrelated) untouched per brief.
  Checks: `npm test` 63/63; `npm run check` 0 errors/0 warnings; `npm run build` + `test:seo` passed (10 ES
  routes); `npm run lint` 8 errors + 2 warnings (down from the known 10+2 baseline — PostLayout's 2 `no-undef`
  errors disappeared with the file); `dist/client` has no `blog`/`rss` paths, sitemap has no `blog`/`rss` URLs;
  `vercel.json` parses as valid JSON.
  Removed i18n keys: `nav.blog`, `footer.rss`, `blog.heading`, `blog.tagline`, `blog.empty`, `blog.readingTime`
  (ES + EN, 6 keys × 2 locales = 12 entries).

- C1 commit: (pending — see below).

## Next step

C2.
