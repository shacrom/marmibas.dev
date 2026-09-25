# Experience top panes — Marmibas × Voxye and Software para fábricas at the top of /experiencia

## Objective

Open `/experiencia` with the owner's current work instead of burying it at the end: two lock-up panes at the top
("Marmibas × Voxye", then "Software para fábricas" = Marmibas × Plazasys), followed by the timeline of previous
roles (Devoltec, Capgemini, Cleverpy).

## Why

The owner likes the Plazasys pane's effect (logo lock-up joined by an animated dashed connector with a "×" badge,
project rows with a pulsing LED + "en producción") and wants the same treatment for Marmibas with Voxye. With the
industrial work only as the page's closing section, the owner missed it when reviewing the page.

## Owner decisions (2026-09-25)

- Layout: **two panes at the top** — "Marmibas × Voxye" first, "Software para fábricas" second. The Marmibas card
  leaves the timeline, which now starts at Devoltec.
- Never frame Plazasys as an "alianza" — keep "junto a Plazasys" / "socio tecnológico".

## Scope

- Extract the lock-up pane from `src/components/work/FactorySoftwarePane.astro` into one reusable component so
  both panes share markup, styles and motion (no duplicated ~450-line component).
- New Marmibas × Voxye pane. Copy reused from `src/content/experience/es/marmibas.md` (intro paragraph + Voxye
  bullet) and the Voxye case study (`/case-studies/voxye`, `status: success`, `/logos/voxye.svg`); only the
  decorative framing (path, prompt command, eyebrow, heading) is new.
- Remove `src/content/experience/es/marmibas.md` from the timeline (only `/experiencia` reads the collection).
- Place both panes between the page header and the timeline; tune spacing and stagger the second pane's entrance.

## Constraints

- Design system: DESIGN.md (terminal, mono fonts, violet as signal); reuse existing `.t-flow`/`.t-flow-v`,
  `.t-led`, `TerminalPane`, `Prompt`. Reduced motion stays neutralised by `motion.css`.
- No visual change to the Plazasys pane besides its new position/spacing.
- TDD: strict mode is on, but these are Astro markup/copy changes with no pure logic and no component test
  harness (Vitest runs in `node` over `tests/**/*.test.ts`). Checks: `npm test`, `npm run check`, lint on changed
  files, `npm run test:seo`, visual QA at 1440/390.
- Known lint base failures on `main` (7 errors in untouched files: `astro.config.mjs`, layouts, `api/contact.ts`,
  `contacto.astro`) — no new ones allowed.
- Commits per work unit, Conventional Commits, no `Co-Authored-By`. Push/PR/merge only after owner OK.

## Tasks

| ID | Task | Route | Status |
|----|------|-------|--------|
| P1 | Extract reusable lock-up pane; `FactorySoftwarePane` becomes data-only (no visual change) | delegated writer | [x] |
| P2 | Marmibas × Voxye pane + both panes at the top + drop Marmibas from the timeline | delegated writer (same) | [x] |
| P3 | Verification (checks, build, visual QA 1440/390) + delivery (asked) | parent | [~] verified, delivery pending |

Route evidence: P1+P2 touch 4+ non-trivial files (pane component, new pane, page, content file) → writer trigger.

## Acceptance criteria

- `/experiencia` order: header → Marmibas × Voxye pane → Software para fábricas pane → timeline (Devoltec first)
  → education → CTA.
- Voxye pane: Marmibas logo × Voxye logo with the animated connector; Marmibas intro copy; one Voxye row linking
  to `/case-studies/voxye` with LED + "en producción".
- Plazasys pane unchanged except position/spacing; no "alianza" wording anywhere.
- Checks green except the known lint base failures.

## Progress

- Branch `feature/experience-top-panes` from `origin/main` ecf10c2.
- P1 done — `18c8b66 refactor(experience): extract the lock-up pane from the factory section`. New
  `src/components/work/LockupPane.astro` (props: path, promptCommand, headingId, eyebrow, heading, partnerLogo
  `{src, alt, wide}`, intro, fruitsIntro, statusLabel, rows, delayOffset, topSpacingDesktop/Mobile); the Marmibas
  tile is built in (every consumer is "Marmibas × X"). `FactorySoftwarePane.astro` is data-only. Top spacing moved
  from a `:global()` rule to a wrapper with CSS custom properties; built HTML diffed against `origin/main` shows
  the same structure (class renames + wrapper only).
- P2 done — `f487f78 feat(experience): open the page with the Voxye and factory panes`. New
  `src/components/work/VoxyePane.astro` (path `voxye`, `ls voxye/`, eyebrow "Producto propio", heading "Software
  para reformas", intro verbatim from the removed `marmibas.md`, one Voxye row → `/case-studies/voxye`, square
  partner tile since `voxye.svg` is ~0.9:1). Page order: header → Voxye pane → factory pane (`delayOffset` 300ms,
  48/32px top spacing) → timeline (64px top margin, starts at Devoltec) → education → CTA. Deleted
  `src/content/experience/es/marmibas.md` (only `/experiencia` read the collection; unused `partnerLogo` schema
  field left in `content.config.ts`).
- Checks (writer, foreground): `npm test` 94/94; `npm run check` 0 errors; eslint + prettier on changed files
  clean; `npm run build` OK; `npm run test:seo` passed (10 routes). Parent spot check: `npm test` 94/94,
  `npm run build` OK.
- Visual QA (parent, headless Chromium with reduced motion, dev server): 1440 and 390 render the intended order and
  lock-ups; mobile stacks with the vertical connector. The entrance animation itself was not captured — headless
  screenshots freeze mid-animation on every page (home included), so it needs a real-browser look.
- RDD: off (global) — no review lifecycle.

## Next step

Owner review of the page; then push/PR only after explicit OK.
