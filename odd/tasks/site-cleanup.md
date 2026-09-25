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
| C4 | Footer polish: heading glow + staggered tree rows | delegated writer | [x] |
| C5 | Mobile header clock layout | delegated writer | [x] |
| C6 | Verification (checks, redirects in build output, visual QA 1440/390/320) + delivery (asked) | parent | [x] |

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

- C3 commit: c10fc2e.

- C4 done: `src/components/ui/Footer.astro`. Heading glow: `.footer-capture__heading` gets
  `text-shadow: 0 0 24px rgba(167, 139, 250, 0.25)` — the exact value copied from
  `HeroPane.astro`'s `.hero-pane__title` rule (verified via `getComputedStyle` in a headless
  Chrome check: `rgba(167, 139, 250, 0.25) 0px 0px 24px`). Tree rows: each `.footer-tree__row`
  gets `class="t-show"` + `style="--t-delay: <n>ms"`, computed as `TREE_ROW_BASE_DELAY +
  TREE_ROW_STEP * globalIndex` where `TREE_ROW_BASE_DELAY` = the `tree marmibas.dev` prompt's
  own typing duration (`Math.max(220, 17 * 38) = 646ms`, mirroring `Prompt.astro`'s own default
  formula since this call passes neither `delay` nor `duration`) + 150ms = 796ms, `TREE_ROW_STEP`
  = 40ms, and `globalIndex` runs continuously across all 3 columns in DOM/reading order (site's 5
  rows, then social's 5, then more's 1 — 11 rows total, delays 796ms→1196ms). No new CSS utility
  needed — reused the existing `.t-show` (terminal.css), which the footer's `TerminalPane` already
  pauses via the run-on-view `.is-waiting` mechanism, and whose reduced-motion final-state
  guarantee is already covered by `motion.css`'s single global block (verified: with
  `reducedMotion: 'reduce'` emulated, all 11 rows read `opacity: 1` within 50ms of the footer
  entering view — no extra motion.css entry required, confirming the task brief's expectation).
  TDD note: this is CSS/markup, not pure logic — verified via `npm run check` (astro/tsc) +
  visual QA (Playwright + system Chrome), not `npm test` (no new unit-testable logic).
  Bug fixed along the way: `treeGroupStartIndex[groupIndex]` indexed a `number[]` under
  `noUncheckedIndexedAccess`, giving `number | undefined` → `ts(2532)` error; added `?? 0`.
  QA (Playwright + system Chrome, dev server on :4400): confirmed via `getComputedStyle` that all
  rows sit at `opacity: 0` immediately after the footer scrolls into view (before any `--t-delay`
  elapses) and reach `opacity: 1` once their delay + 60ms fade complete — the "backwards" fill
  mode + increasing per-row delay is correctly wired end to end, screenshotted at 1440/390.
  Checks: `npm test` 58/58 (unchanged — no logic touched); `npm run check` 0 errors; `npm run
  build` + `test:seo` passed; `npm run lint` unchanged (7 errors + 2 warnings, same baseline).

- C4 commit: 54c7772.

- C5 done: `src/components/ui/Header.astro`, mobile-only (`@media (max-width: 900px)`) media query.
  Root cause: `.t-header__inner` is `display: flex; align-items: stretch;` (unchanged base rule).
  For `.t-header__mobile-clock` (auto/no explicit height), stretch grows its box to the full 56px
  bar height, but its own `flex-direction: column` content had no `justify-content` set, so the
  label+time stack sat at the top of that stretched box (top-flush, matching the owner's
  screenshot). For `.t-header__menu-btn` (explicit `height: 44px`), a fixed-size flex item does
  NOT get resized by `align-items: stretch` — per the CSS spec it falls back to `flex-start`
  positioning instead, so the 44×44 button also sat flush at the top rather than centred. Fixed
  both: added `justify-content: center` to `.t-header__mobile-clock` and `align-self: center` to
  `.t-header__menu-btn` (both mobile-only, so the desktop bar — which hides both elements anyway
  — is provably unaffected). Also bumped `.t-header__inner`'s mobile `gap` from 12px to 14px (mid
  of the brief's 12–16px "comfortable gap" range) for a touch more breathing room before the
  button; verified this doesn't introduce overflow at 320px (see sweep below).
  QA (Playwright + system Chrome, dev server on :4400, screenshots at 390/320/1440): mobile clock
  now sits vertically centred in the 56px bar at both 390 and 320, label above time, right-aligned,
  with a clear gap before the menu button, which is itself centred with equal space above/below.
  Desktop bar (1440) screenshotted and confirmed unchanged (5 tabs, clock, CTA button all in their
  original positions).
  Checks: `npm test` 58/58 (unchanged — CSS-only); `npm run check` 0 errors; `npm run build` +
  `test:seo` passed; `npm run lint` unchanged (7 errors + 2 warnings, same baseline). Overflow
  sweep (Playwright, `overflow.mjs`) at 1440/390/320 on `/`, `/servicios/`, `/trabajos/`,
  `/experiencia/`, `/contacto/`: `scrollW === vw` for all 15 route×width combinations — no
  horizontal scroll anywhere (the `.srv-index-hero__ambient` and demo-table entries the sweep
  flags are pre-existing contained/clipped overflows per T7's fix, not page-level scroll; matches
  terminal-redesign.md's own "0/87" baseline methodology).

- C5 commit: 181a7ab.

- C6 parent verification: npm test 58/58; check 0 errors; test:seo passed; lint 7 errors + 2 warnings (known base
  minus removed files); build has no `dist/client/en` or `dist/client/blog`, sitemap without `/en/` or `/blog`,
  llms.txt/robots.txt clean; vercel.json redirects reviewed (specific `/en/*` rules before the catch-all). Mobile
  header measured at 300/310/320/390: clock centred, 14px from the menu button; at 310px (owner's screen) the page
  still overflowed by 8px → brand logo made fluid (`clamp(104px, 36vw, 132px)`), now no overflow down to 300px.
- 404: owner asked for Spanish only → `404.astro` now Spanish-only (heading, subtitle, CTAs; bilingual dividers and
  their CSS removed). Checks: astro check 0 errors; test:seo passed (404 stays noindex, nofollow); built
  `404.html` has no English copy.

- Delivered: PR #2 merged (54f0d2b) and deployed. Production check found trailing-slash URLs
  (`/blog/<post>/`, `/en/work/`) returning 404 — Vercel `:path*`/`:slug` sources ignore a trailing slash.
  Hotfix PR #3 (a4c3330): `(.*)` catch-alls + explicit slash variants, regression test
  `tests/config/vercel-redirects.test.ts` (RED reproduced production: 13 failures; GREEN 90/90). Production
  verified 26/26 (19 old URLs → 308 to the expected page, 7 live pages 200).

## Next step

Done.
