# Work terminal — /trabajos and case studies in the terminal design

## Objective

Bring `/trabajos` and the case study pages (`/case-studies/<slug>`) to the "B3 · Terminal" language already used on
the home page and `/experiencia`, following the owner-approved Claude Design canvas.

## Why

Both pages still use the pre-terminal look (rounded cards, gradient text, conic animated border, generic reveal).
The owner reviewed a redesign on Claude Design (2026-09-25) and approved the Trabajos index (after fixing the logo
tiles and the "Ver caso" button) and the case study page as drawn.

## Owner decisions (2026-09-25)

- Visual spec: Claude Design canvas https://claude.ai/artifact/8Y4kecEPqCfELEnquUpc3u, artboards "Trabajos — índice"
  and "Caso de éxito — Voxye".
- Trabajos index: `~/trabajos` pane with `ls -l trabajos/`, heading, a `grep --autoria` filter (todos / producto
  propio / con Plazasys) with counts, one mini window per case (slug bar + "en producción" LED; 56px dark logo tile
  next to the title; tagline; `#tags`; uniform `[ Ver caso → ]` plus an external text link when the case has one;
  cliente/año/autoría column), `total N`, then a `cat idea.txt` CTA pane.
- Case page: hero pane `cat <slug>/README.md` (LED + attribution, logo tile, h1, tagline, tags) with a `stat <slug>`
  aside (cliente, año, autoría, rol, external link), body sections in panes, results (`BeforeAfter`) as a
  `diff antes.txt despues.txt` block with growing bars, CTA pane, prev/next as `cd ../` cards.
- Servicios is still being designed — out of scope here.

## Constraints

- Copy stays as in the content files (`src/content/case-studies/es/*.mdx`, i18n); no invented facts.
- Reuse the terminal toolkit (`TerminalPane`, `Prompt`, `TerminalButton`, `.t-*` utilities, `motion.css` reduced
  motion). No gradients/conic borders.
- TDD strict for pure logic (e.g. filter counts / grouping in `src/lib`): RED first. Runner `npm test` (Vitest).
  Astro markup has no component harness → checks + visual QA.
- Known lint base failures on `main`: 7 errors in untouched files — no new ones.
- Commits per work unit, Conventional Commits, no `Co-Authored-By`. Push/PR/merge only after owner OK.

## Tasks

| ID | Task | Route | Status |
|----|------|-------|--------|
| W1 | Trabajos index in terminal panes + autoría filter (pure logic tested) | delegated writer | [x] |
| W2 | Case study page in terminal panes (hero + stat aside, body panes, diff results, CTA, prev/next) | delegated writer (same) | [x] |
| W3 | Verification (checks, build, visual QA 1440/390) + delivery (asked) | parent | [x] |

Route evidence: W1/W2 touch 4+ non-trivial files (WorkIndex, CaseStudyCard, CaseStudyLayout, CaseStudyHero,
BeforeAfter, lib + tests) → writer trigger.

## Acceptance criteria

- `/trabajos` and the three case pages match the approved artboards in structure and style at 1440; mobile stacks
  cleanly at 390.
- Filter works with JS (progressive enhancement: all cases visible without JS); counts come from data.
- Checks green except the known lint base failures.

## Progress

- Branch `feature/work-terminal` from `origin/main` b65f075.

- W1 done — `42ebc98 feat(work): show the work index as terminal panes`: `src/lib/work-attribution.ts` +
  `src/lib/work-case-display.ts` with Vitest tests written first (RED: missing modules / missing
  `attributionBucketId`, then GREEN); `WorkIndex.astro` rebuilt per the artboard (filter by attribution with
  progressive enhancement, mini windows, dark logo tiles, `total N`, `cat idea.txt` CTA); `CaseStudyCard.astro`
  deleted; optional `externalUrl` in the case-studies schema, set for Voxye (home `CasesPane` keeps its own data).
- W2 done — `105426e feat(work): show case studies as terminal panes`: hero pane + `stat` aside, a single
  `README.md` body pane (MDX stays the source; `##` prefix via CSS), `BeforeAfter` as a diff block with growing
  bars (new `.t-grow-x` + reduced-motion rule), `cd ../` + next-case navigation, TOC removed; fixed the
  pre-existing lint error in `CaseStudyLayout.astro` (base lint errors now 5).
- Parent review fix — `12ba822 fix(work): drop the duplicated case CTA and darken the hero logo tile`: the case
  page repeated the footer's "Cuéntame qué necesitas" pane right above the footer; the hero logo tile was light.
- Checks: writer — `npm test` 117/117, `npm run check` 0 errors, eslint + prettier on changed files clean, build
  OK, `test:seo` passed. Parent — `npm test` 117/117, `npm run check` 0 errors, eslint + prettier on the 2 fixed
  files clean; visual QA 1440 (index, Voxye, Recetas Novatex) and 390 (index) with reduced motion.
- Open note: `/trabajos` ends with its `cat idea.txt` CTA pane followed by the footer contact pane (different
  copy; kept as approved in the artboard).

- Delivered 2026-09-25 (owner: "Me cuadra, súbelo todo"): PR #10 (`type:feature`, `size:exception`) merged as
  `5746d3c` after the Vercel preview check passed. Later mobile/tablet fixes and the removal of the `/trabajos` page
  CTA shipped in PR #11 (`odd/tasks/services-mosaic.md`).

## Next step

None — feature complete.
