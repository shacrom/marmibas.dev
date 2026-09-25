# Terminal redesign (B3) — site-wide

## Objective

Re-skin marmibas.dev with the "B3 · Terminal" direction designed on Claude Design
(https://claude.ai/artifact/KPqGayZFatTgTMa1nENGmY, page "B3 · Terminal", desktop 1440 px and mobile 390 px columns)
and deploy it.

## Problem / why

The owner chose a terminal aesthetic (CLI prompts, monospace type, violet signal colour, purposeful motion) to
replace the current "tech minimal" look. The home is fully redesigned; every other page must inherit the same
look so navigation stays coherent.

## Scope

- In: design tokens and fonts; global chrome (Header with tab-style nav, live Spain clock, mobile menu; Footer with
  capture band, `tree` sitemap, status bar); BaseLayout background; the whole home (hero, diagnosis, services,
  interactive demo, MidCta + case studies, process, about, FAQ) in ES and EN; minimal fixes so inner pages render
  correctly with the new tokens; DESIGN.md.
- Out: deep redesign of inner pages; publishing the EN locale (stays `noindex`, no language switcher); content
  changes beyond decorative terminal framing (prompts, paths, comments).

## Constraints

- Real copy only; terminal framing strings (e.g. `whoami`, `~/servicios`) are decorative and localised per lang.
- ES/EN key parity in `src/i18n/ui.ts` and `src/lib/faqs.ts`.
- Motion: CSS-first, no animation libraries; every animation disabled under `prefers-reduced-motion`; progressive
  enhancement (server-rendered final state works without JS).
- Accessibility: real buttons/links, visible focus, touch targets ≥ 44 px on mobile, WCAG AA contrast.
- SEO output contract (`npm run test:seo`) must keep passing.
- Delivery: one PR to `main` with `size:exception` (owner's choice), commits per work unit, Conventional Commits.
  Push, PR, preview and production deploy only after explicit owner OK.

## TDD

- Mode: strict (source: owner's global instructions "Strict TDD Mode: enabled"). Runner: `npm test` (vitest,
  `tests/**/*.test.ts`).
- Applies to pure logic (clock formatting, demo calculations, navigation data). Pure CSS/markup/asset work has no
  unit under test; it is verified with `npm run check`, `npm run test:seo` and visual QA.

## Checks (per task)

- `npm test`, `npm run check`, `npm run test:seo` (builds).
- `npm run lint` — known failures on base (main 33adabc): 10 errors + 2 warnings in `astro.config.mjs:100`,
  `src/layouts/BaseLayout.astro:207`, `src/layouts/{CaseStudy,Post,ProjectDetail}Layout.astro` (no-undef ×2 each),
  `src/pages/contacto.astro:540`, `src/pages/en/contact.astro:530`, `src/pages/api/contact.ts` (no-console ×2).
  Any other lint failure is ours.

## Tasks

| ID | Task | Route | Status |
|----|------|-------|--------|
| T1 | Foundation: terminal tokens (colours, radii, gradients, danger token), self-hosted IBM Plex Mono + Space Mono, font preloads, theme-color, DESIGN.md rewrite | delegated writer (4+ files) | [x] |
| T2 | Terminal primitives: terminal motion CSS, `TerminalPane`/`Prompt` components, `src/lib/clock.ts` (TDD) | delegated writer | [x] |
| T3 | Global chrome: Header (tabs, clock, mobile menu), Footer (capture, tree, status bar), BaseLayout overlays, logo | delegated writer | [x] |
| T4 | Home: hero, diagnosis, services (ES/EN) | delegated writer | [x] |
| T5 | Home: interactive demo (Showcase) with logic in `src/lib/showcase-demo.ts` (TDD) | delegated writer | [x] |
| T6 | Home: MidCta + case studies, process, about (neofetch), FAQ | delegated writer | [x] |
| T7 | Inner pages pass: fix breakages from the new tokens (contact danger colours, overflow with monospace) | delegated writer | [x] |
| T8 | Verification + delivery: full checks, visual QA desktop/mobile, push, PR, preview, production (each outward step asked) | parent | [ ] |

## Progress

- 2026-09-25: branch `feature/terminal-redesign` from `main` (33adabc). Baseline: vitest 17/17, check 0 errors,
  test:seo OK, lint = known failures above. RDD: off. Delivery: single PR (`size:exception`).

- T1 done: tokens swapped (names kept), Space Mono 400/700 + IBM Plex Mono 400/500/600 self-hosted (latin +
  latin-ext), Geist/Inter/JetBrains removed, danger/warning/bg-inset/border-strong tokens, contact danger colours
  tokenised, theme-color #08070b, DESIGN.md rewritten. Checks: npm test 17/17; check 0 errors; test:seo passed;
  lint = known base failures only. Stale font comments in prose.css and later-task components deferred to T3–T7.

- T1 commit: aa0bde0.
- T2 done: `src/lib/clock.ts` + `src/lib/navigation.ts` (TDD: RED = module-not-found for both, then GREEN), terminal.css
  (t-* keyframes/utilities, `.btn-term`, run-on-view `.t-pane.is-waiting` pause), `TerminalPane`, `Prompt`,
  `TerminalButton`. Reduced-motion final states appended to the single block in motion.css (project rule).
  Checks: npm test 27/27; check 0 errors; test:seo passed; lint = known base failures only.

- T2 commit: 0e769dd.
- T3 done: Header rebuilt (tab nav from getPrimaryNav, live Spain clock, ≤900px menu button + dropdown with
  Escape/link/swap/resize close, noscript fallback), Footer rebuilt as a TerminalPane (capture band, `tree`
  sitemap from `getFooterTree` — TDD, RED = module-not-found — and violet status bar via new `after` slot),
  BrandLogo replaces MetallicLogo, CircuitBackground removed, `.t-pane-gutter` utility, i18n keys header.clock /
  header.menu.open / header.menu.close. Footer site order follows the header (experience before blog).
  Checks: npm test 33/33; check 0 errors; test:seo passed; build OK; lint = known base failures only
  (BaseLayout prefer-rest-params moved 207→203).
- Follow-up (polish, T8): staggered entrance in mobile dropdown and footer tree rows; violet glow on footer h2.

- T3 commit: ff5a3c7.
- T4 done: `HeroPane` (~/inicio [1/7]: whoami/cat/uptime session, single h1, diagnosis aside with spinners→✓) and
  `ServicesPane` (~/servicios [2/7], its own pane so it animates on view; ES rows link to /servicios/<slug>, EN plain
  rows as before). Old Hero/HeroIntro/ServicesSection deleted. Copy reused verbatim; framing strings per-lang consts.
  Checks: npm test 33/33; check 0 errors; test:seo passed; build OK (one h1, 7 ES service hrefs); lint = known base.

- T4 commit: 1d055ef.
- Parent visual QA (Playwright + system Chrome, 1440/390/360/320): fixed the last typed character staying clipped
  (Chrome ends steps() at 0.999… progress with fill `both` → terminal animations now use `backwards`), 320px header
  overflow (mobile brand cell padding) and the services closing prompt; commit 7c788c9. Menu verified: opens,
  Escape closes, focus returns to the button. No horizontal scroll at 1440/390/360/320 (old demo excluded).
- T5 done: `DemoPane` (~/demo [3/7]) replaces ShowcaseSection; logic in `src/lib/showcase-demo.ts` (TDD, RED =
  module-not-found, 24 tests). Live counters only while visible, tweened total, ASCII PDF progress, sliding
  Excel/App toggle, filtered table, lazily rendered Excel view. Sort control dropped (not in the approved design).
  Parent QA fixes before commit: running-machine stripes were wiped by a `background` shorthand, chart bars had 0
  height (percentage against an indefinite parent), PDF label pushed down by `white-space: pre`, and aria-live
  removed from the per-second counters and the PDF button (kept on the quote total).
  Checks: npm test 57/57; check 0 errors; test:seo passed; lint = known base; bars 50/79/64/102 px at 1440.
- Follow-up: EN demo numbers use dot grouping (EN page is hidden; revisit if EN is published).

- T5 commit: 6d20f2a.
- T6 done: `CasesPane` [4/7] (MidCta + 3 case cards, tags via tested `src/lib/case-tags.ts` — RED =
  module-not-found), `ProcessPane` [5/7] (pipeline with flowing connectors, spinners→✓), `AboutPane` [6/7]
  (neofetch: ASCII "M", facts derived from the bio, swatches; bio + CTAs), `FaqPane` [7/7] (details [+]/[-], full
  answers; FAQPage JSON-LD unchanged). Old MidCta/FeaturedProjects/ProcessSection/AboutSection/FAQSection removed.
  Parent QA fix: box-drawing/block glyphs are not in the Plex Mono subsets → new `--font-glyphs` system-mono stack
  for the ASCII art and footer `tree` connectors. Checks: npm test 63/63; check 0 errors; test:seo passed; lint =
  known base; no horizontal scroll at 320.
- Follow-up: `ui.ts` about.stats.* keys now unused (left in place).

- T6 commit: f1a2d3c.
- T7 done: fixed the 4 known-issue classes + a sweep-found overflow-wrap gap.
  1. `/experiencia` (+ `/en/experience` fallback data) timeline header: `.timeline__head` stacks to a column
     (logos → period → role) under 640px; the Marmibas × Plazasys logo pair additionally shrinks its
     `max-width` under 400px (two 140px pills + `×` no longer fit at 320px even stacked).
  2. `/servicios` + all 7 slug pages: `.srv-hero`/`.srv-index-hero` (the `__ambient` positioned ancestor) gained
     `overflow: clip` — the ambient's `-10vw` bleed was pushing scrollWidth to 429 at 390px.
  3. Contrast: grepped every `--gradient-cta`/`--gradient-cta-hover` usage (12 hits) and switched
     `color: var(--text-0)` → `var(--bg-0)` on the primary-CTA rule in BaseLayout (cookie consent), 404,
     `/servicios` index + all 6 slug pages' `.srv-cta--primary`, `desarrollo-aplicaciones-web.astro`'s `.cta`,
     `contacto.astro` + `en/contact.astro`'s `.contact__submit`, and the orphaned `LeadCTA.astro` (not currently
     imported anywhere, fixed anyway per the brief's explicit mention). Hover states inherit the same `color`
     (no separate hover color rule existed), so one line per file fixes both states.
  4. Stale Geist/Inter/JetBrains/Fraunces comments updated to Space Mono / IBM Plex Mono across 13 files
     (prose.css, SeoHead, TechBadge, LangSwitcher, ProjectCard, CaseStudyHero, TableOfContents, MetricsGrid,
     CaseStudyCard, PostLayout, 404.astro, contacto.astro, blog/index.astro). No stale hits left (verified by
     re-grep).
  5. Sweep (Playwright, system Chrome, 1440/390/320, 29 routes incl. EN) found 3 more overflow cases at 320,
     all the same root cause: `text-wrap: balance` doesn't stop a single long word from overflowing, and
     Space Mono is wide enough that some ES headings (`digitalización`, `desarrollador`, `aplicaciones`) no
     longer fit one word at the mobile clamp size. Added `overflow-wrap: anywhere` to the shared
     `h1..h6` rule in global.css (one line, no visual change where text already fits — confirmed at 390/1440).
  Checks: npm test 63/63; check 0 errors; test:seo passed (10 ES routes); lint = known base failures only;
  sweep = 0/87 route×width combos over viewport (was 5 before this task: 2 known issues + 3 found by the
  sweep). No commit yet — parent (T8) owns delivery.

## Next step

T8: verification + delivery (full checks already green from T7; visual QA desktop/mobile done during T7;
push/PR/preview/production still need explicit owner OK per each outward step).
