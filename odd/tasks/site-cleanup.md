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
| C2 | Remove English version (pages, content, EN copy, ES-only i18n) + 301 redirects + SEO script update | delegated writer | [x] |
| C3 | Remove orphaned i18n keys (`about.stats.*` and others) | delegated writer | [x] |
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

- C1 commit: 342cfca.

- C2 done: deleted `src/pages/en/**` (7 files) and EN content (`src/content/{case-studies,experience,
  projects}/en/**`). CRITICAL finding: `astro.config.mjs`'s `i18n` block still had `locales: ['es','en']` +
  `fallback: { en: 'es' }` + `fallbackType: 'rewrite'` — with the manual `src/pages/en/**` files gone, Astro's
  built-in fallback-rewrite would have auto-generated a full shadow `/en/*` mirror of every Spanish page (the
  pre-existing build WARN "Could not render `/en` from route `/en/`... conflicts with higher priority route"
  during C1's `test:seo` was this same mechanism already racing the manual EN pages). Fixed by shrinking the
  `i18n` block to `locales: ['es']` with no `fallback` — confirmed via `npm run build`: no `/en` warnings, no
  `dist/client/en/` directory, 19 routes built (was silently ~38 incl. shadow fallbacks before the fix).
  i18n core: `src/i18n/ui.ts` (`languages`/`Language` → `{ es: 'Español' }` only, dropped the 168-line `en:`
  dictionary block), `src/i18n/routes.ts` (each route entry dropped its `en` path, kept the `Record<Language,
  string>` shape for future-readiness), `src/i18n/helpers.ts` (`getLangFromUrl` simplified to always return
  `defaultLang`; `getAlternateUrl` + `localePath` deleted as dead code — their only consumer was the now-deleted
  `LangSwitcher.astro`). TDD (RED observed first): edited `tests/i18n/helpers.test.ts` — new test asserts
  `getLangFromUrl` returns `'es'` for a `/en/...` path (previously `'en'`) → RED (`AssertionError: expected 'en'
  to be 'es'`) → implemented the simplification → GREEN. `tests/lib/navigation.test.ts` / `tests/lib/footer.test.ts`
  had their EN-locale test cases removed (calling `getPrimaryNav('en', ...)` / `getFooterTree('en')` would no
  longer type-check once `Language` is ES-only) — mechanical removal, not a fresh RED/GREEN cycle.
  Deleted `src/components/ui/LangSwitcher.astro` (orphaned — zero imports found; its only reason to exist was
  switching to the now-gone EN locale).
  Per-component EN copy branches dropped (flattened `lang === 'es' ? A : B` → `A`, or dropped the `en:` key from
  `Record<Language, …>` objects, per file): `AboutPane.astro`, `DemoPane.astro` (incl. the client-side `<script>`
  that read `root.dataset.lang === 'en'`, and the now-unused `data-lang` attribute), `HeroPane.astro`,
  `ServicesPane.astro`, `FaqPane.astro`, `ProcessPane.astro`, `CasesPane.astro`, `LeadCTA.astro` (orphaned like
  T7's finding, fixed anyway — same precedent), `CaseStudyHero.astro`, `Header.astro`, `Footer.astro`,
  `src/lib/footer.ts` (also dropped the now-unused `lang` params from `getSocialGroup`/`getMoreGroup`),
  `ProjectDetailLayout.astro`, `src/components/work/WorkIndex.astro`, `src/lib/faqs.ts` (deleted the 35-line
  `faqsEn` array, `getFaqs` now always returns `faqsEs`). `SeoHead.astro`: `ogLocale`/`inLanguage` flattened to
  `es_ES`/`es-ES`; `isHome` detection dropped its `/en` branch. `BaseLayout.astro`: dropped the EN-forced-noindex
  branch and the bilingual `analyticsConsentCopy`/`cookiePolicyHref`. `contacto.astro`: client-side validation
  messages dropped their `en` branch and the lang-detection ternary (hidden `lang` field is always `'es'`).
  `src/lib/contact-schema.ts` (`lang` enum `['es','en']` → `['es']`) and `src/pages/api/contact.ts`
  (`buildSubject`/email template dropped their EN branches) — not explicitly listed in the brief but covered by
  the "no dead EN strings" instruction (grepped `'en'`/`/en/` across `src/`).
  `src/content.config.ts`: `LANGS` (`z.enum` backing every collection's `lang` field) shrunk from `['es','en']`
  to `['es']`, same future-readiness pattern as the i18n layer.
  Deliberately NOT touched: `src/pages/404.astro`'s bilingual ES/EN copy — it exists because a static host
  serves one generic `404.html` for any unknown path regardless of locale (explained in its own docblock), so
  the English text there serves any visitor hitting a broken link, independent of whether `/en/*` pages exist;
  it isn't leftover EN-locale infrastructure.
  `vercel.json` redirects added: `/en/case-studies/voxye` → `/case-studies/voxye/` (only EN case-study that
  actually built, verified via git history of the deleted `[slug].astro` — EN filtered by `lang==='en'` and only
  `voxye.mdx` existed under `case-studies/en/`), `/en/case-studies/:slug` → `/trabajos/`, `/en/projects/:slug` →
  `/trabajos/` (EN projects content dir was always empty — `/en/projects/*` never built a single real route,
  confirmed via git history — so no per-slug ES match is possible/needed), `/en/work` → `/trabajos/`,
  `/en/experience` → `/experiencia/`, `/en/contact` → `/contacto/`, `/en/cookie-policy` → `/politica-cookies/`,
  `/en` and `/en/` → `/`, final catch-all `/en/:path*` → `/`. Specific rules ordered before the catch-all.
  `scripts/verify-seo-output.mjs`: dropped the `readRoute('/en/')` noindex assertion (route no longer exists),
  added `/blog` to the sitemap-exclusion list (was checking `/en/`/`/contacto/`/`/politica-cookies/`/`/404` only),
  changed the robots.txt assertion from "`Disallow: /en/` must be present" to "must NOT be present" (removed the
  now-pointless line from `public/robots.txt` — `/en/` doesn't exist at all now, so disallowing it is moot; kept
  `Disallow: /api/`).
  Docs: `DESIGN.md` §13 rewritten (was "EN sigue oculto", now "Español, único idioma"); `README.md` intro +
  stack bullet + tree comment updated (dropped "en español e inglés", the `/en` i18n description, "posts").
  Checks: `npm test` 58/58; `npm run check` 0 errors/0 warnings; `npm run build` clean (19 routes, no `/en`
  warnings); `test:seo` passed (10 ES routes); `npm run lint` 7 errors + 2 warnings (down from 8+2 after C1 —
  `en/contact.astro`'s non-null-assertion error disappeared with the file); `dist/client` has no `en/` directory
  at all; sitemap has no `/en/`/`/blog` URLs; `vercel.json` parses as valid JSON (13 redirects total).
  Final sweep: `grep -rn "lang === 'en'"` and `currentLang === 'en'"` across `src/` → 0 hits.

- C2 commit: d3c2713.

- C3 done: verified every key in `src/i18n/ui.ts` against actual usage in `src/` (accounting for dynamic
  key construction like `t(\`services.${service.key}.title\`)` in `ServicesPane.astro` and the
  `status: 'status.success'` lookup map in `Pill.astro`, both real uses that a naive literal grep would
  miss). Removed 34 orphaned keys (68 including EN, already gone with C2's dictionary): `nav.projects`,
  `nav.about`, `footer.copyright` (Footer.astro hardcodes `© {year} marmibas`), `cta.viewCaseStudy`,
  `cta.viewProject`, `cta.viewAllWork`, `cta.readMore`, `cta.backHome`, `cta.backToTop`, `cta.sendMessage`,
  `cta.downloadCv`, `cta.copyEmail`, `cta.emailCopied`, `form.sending`, `form.error.rateLimit`,
  `form.error.validation`, `form.validation.{nameRequired,nameTooShort,emailRequired,emailInvalid,
  messageRequired,messageMinLength,messageMaxLength}` (7 keys — `contacto.astro`'s client script has its
  own local `messages` object with the same ES copy, never called `t()` for these), `meta.languageSwitcher`,
  `meta.langSwitcherLabel`, `meta.currentLanguage`, `meta.toggleMenu`, `meta.closeMenu`, `meta.openExternal`,
  `meta.search` (all `LangSwitcher.astro`-only or otherwise unwired — `LangSwitcher` was already deleted in
  C2), `common.readMore`, `common.viewProject`, `common.viewCaseStudy`, `common.publishedOn`,
  `common.updatedOn`, `common.readingTime`, `common.tableOfContents` (superseded by `toc.label`, which stays),
  `common.relatedPosts`, `common.previousPost`, `common.nextPost`, `common.empty.posts` (blog, removed in C1),
  `common.empty.work`, `common.filters.{status,tag,clear,all}` (4 keys), `work.filter.{label,all,success,
  development,sideProjects}` (5 keys — `WorkIndex.astro`'s filter UI was already dead/unwired before this
  task: `data-status`/`data-bucket` attributes exist with no `<select>`/script consumer; left that dead
  markup alone as out of C3's i18n-key scope), `experience.disclaimer`, `experience.fallback`,
  `notFound.{title,description,backHome,viewWork}` (4 keys — `404.astro` hardcodes its own bilingual copy,
  never called `t()`), `about.stats.{years,yearsValue,projects,projectsValue}` (4 keys, the ones named in the
  brief). Fixed the stale comment in `AboutPane.astro` that referenced `about.stats.yearsValue` as if still
  live. Kept (confirmed real usage): `cta.contact`, `cta.viewWork`, `common.backTo`, `toc.label`, all
  `status.*` (dynamic lookup), all `services.*` (dynamic `${service.key}` construction), `meta.skipToContent`,
  `work.heading/tagline/empty`, `experience.heading/tagline/education.*`, `nav.home/work/services/experience/
  contact`, `form.{name,email,message}.*`, `form.submit/success/error`, `footer.social.*`, `header.*`,
  `featured.*`, `about.heading/bio.*/cta.*`.
  Checks: `npm test` 58/58; `npm run check` 0 errors/0 warnings; `npm run build` + `test:seo` passed (10 ES
  routes); `npm run lint` 7 errors + 2 warnings (unchanged from C2 baseline — no lint impact from a
  dictionary-only change).

- C3 commit: (pending — recorded after this commit).

## Next step

C4.
