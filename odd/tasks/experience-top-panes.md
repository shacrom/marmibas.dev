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
- Review feedback (2026-09-25, after seeing it locally): **factory pane first, Marmibas pane second**; the Marmibas
  pane drops the connector and the Voxye logo from the lock-up (Marmibas logo alone), keeps the rest of the style
  and shows Voxye only as the project row below.
- Follow-up request (2026-09-25): give Devoltec, Capgemini and Cleverpy "more or less the same design" as the two
  top panes — each role becomes a terminal pane (bar `~/<company>`, `ls <company>/`, period as eyebrow, company as
  heading + role line, company logo tile linking to its site, stack badges, the MD body with bullets as ✓ rows).
  The vertical timeline line goes away; copy stays in the `experience` MD files.
- Follow-up request (2026-09-25): connect the sections so the page reads as a progression from the bottom up.

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
| P3 | Verification (checks, build, visual QA 1440/390) + delivery (asked) | parent | [x] |
| P4 | Owner feedback: swap pane order; Marmibas pane without connector/partner logo (partner optional in `LockupPane`) | direct inline (3 small edits in understood files) | [x] |
| P5 | Past roles as terminal panes: generalise `LockupPane` (primary logo, role line, tags, body slot, optional rows) without visual change to the top panes, then replace the timeline with one pane per role | delegated writer | [x] |
| P6 | Connectors between the stacked panes: vertical dashed `.t-flow-v` bar flowing upward + "↑" badge, so the page reads bottom (Cleverpy) → top (Plazasys) | direct inline (1 understood file) | [x] |

Route evidence: P1+P2 touch 4+ non-trivial files (pane component, new pane, page, content file) → writer trigger.

## Acceptance criteria

- `/experiencia` order (updated by P4): header → Software para fábricas pane → Marmibas pane → timeline
  (Devoltec first) → education → CTA.
- Marmibas pane (updated by P4): Marmibas logo alone (no connector, no Voxye logo); Marmibas intro copy; one Voxye
  row linking to `/case-studies/voxye` with LED + "en producción".
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

- P4 done — `590989c feat(experience): lead with the factory pane and show Marmibas without a lock-up`.
  `LockupPane` `partnerLogo` is optional (no partner → Marmibas tile alone, connector not rendered);
  `VoxyePane` passes no partner; page renders `FactorySoftwarePane` then `VoxyePane` (`delayOffset` 300,
  48/32 top spacing moved to it). Checks: `npm test` 94/94, `npm run check` 0 errors, eslint + prettier on the
  4 changed files clean. Visual QA 1440/390 (reduced motion): factory pane first with its lock-up, Marmibas pane
  with the logo alone and the Voxye row + LED.

- Owner tweak — `feat(experience): name the Marmibas pane path and prompt after Marmibas`: Marmibas pane bar `~/voxye` → `~/marmibas`, prompt `ls voxye/` → `ls marmibas/`
  (matches the factory pane's `~/fabricas` + `ls fabricas/`). Verified in the dev server HTML.
- Owner tweak — `feat(experience): retitle the Marmibas pane "Software a medida"`: the pane now covers Marmibas as a
  whole (Voxye is one project row), so "Software para reformas" was too narrow; the new heading matches the home
  hero. Verified in the dev server HTML.
- P5 done — `44d7fc5 refactor(experience): generalise the lock-up pane for single-logo panes` (`LockupPane`: optional
  primary `logo {src, alt, variant, href?}` defaulting to the Marmibas wordmark, `subheading`, `tags`, optional
  intro/rows, default slot in `.lockup-pane__body` styling MD `p` as intro and `li` as ✓ rows; `motion.css` covers
  the new entrance) and `0fb2fcf feat(experience): show every past role as a terminal pane` (timeline replaced by
  one pane per role: `~/<slug>`, `ls <slug>/`, period eyebrow, company h2 + role line, square logo tile linking to
  the company site, stack badges, MD body; dead timeline markup/CSS removed). Top panes: only whitespace-level HTML
  diff. Checks (writer): `npm test` 94/94, `npm run check` 0 errors, eslint + prettier on changed files clean,
  build OK, `test:seo` passed, whole-repo lint = the 7 known base errors only. Parent spot check `npm test` 94/94;
  visual QA 1440/390 (reduced motion) OK.
- Owner tweaks — `c67a0de feat(experience): name the Plazasys pane after Plazasys and trim its intro`: bar/prompt
  `~/plazasys` + `ls plazasys/`, intro drops "y cliente principal", Marmibas pane eyebrow "Marca propia". Checks:
  `npm test` 94/94, build OK, eslint + prettier on the 2 files clean; strings verified in the dev server HTML.
- Delivery (owner: "haz commit y sube todos los cambios a producción", 2026-09-25): one PR to `main` with label
  `size:exception` (~1.7k changed lines in `src`, mostly the factory pane moved into `LockupPane` and the removed
  timeline CSS; the owner asked to ship everything now rather than slice). Merged with a merge commit like #5/#6;
  Vercel deploys `main` to production. `fix/og-image` ships in its own PR in the same round.

- P6 done — `53b2e9a feat(experience): link the stacked panes bottom to top`. New `src/components/work/PaneLink.astro`
  (88px desktop / 64px mobile gap, `.t-flow-v` with `animation-direction: reverse` so dashes travel up, "↑" badge
  styled like the lock-up "×"); 4 links rendered, panes after a link use top spacing 0. Checks: `npm test` 94/94,
  `npm run check` 0 errors, eslint + prettier on the 2 files clean. Visual QA 1440/390 (reduced motion) OK; the
  upward motion itself not captured headless.

- Delivered 2026-09-25: with the owner's OK the gh account was switched to `shacrom`; PR #8 (`size:exception`,
  `type:feature`) merged as `b65f075` alongside PR #7 (OG image). Vercel preview checks passed and the production
  deployment for `b65f075` succeeded; the live `/experiencia` HTML shows `~/plazasys`, "# Marca propia", the role
  panes and the connectors, without "cliente principal". Head branches deleted after merge.

## Next step

None — feature complete.
