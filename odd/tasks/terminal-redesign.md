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
| T3 | Global chrome: Header (tabs, clock, mobile menu), Footer (capture, tree, status bar), BaseLayout overlays, logo | delegated writer | [ ] |
| T4 | Home: hero, diagnosis, services (ES/EN) | delegated writer | [ ] |
| T5 | Home: interactive demo (Showcase) with logic in `src/lib/showcase-demo.ts` (TDD) | delegated writer | [ ] |
| T6 | Home: MidCta + case studies, process, about (neofetch), FAQ | delegated writer | [ ] |
| T7 | Inner pages pass: fix breakages from the new tokens (contact danger colours, overflow with monospace) | delegated writer | [ ] |
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

## Next step

T3.
