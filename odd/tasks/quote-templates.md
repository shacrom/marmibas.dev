# Quote templates — reusable Marmibas quote layouts built from a PDF

## Objective

Give the repo a small, private-by-default quote tool: reusable **templates** (layout + data schema + example) that
render a Marmibas-branded A4 PDF, so a new quote starts from a template instead of from scratch. The owner produces
a quote PDF elsewhere, hands it over, and it becomes a template here; the owner then corrects the template as needed.
When asking an AI for a quote, the owner names the template to use as base/example.

## Problem

Quotes were built ad hoc inside each client repo (a Python generator in one, a hand-written HTML page in another),
each with its own layout code and manual pagination. Nothing was reusable and there was no single place for the
Marmibas quote identity.

## Owner decisions (2026-10-05)

- No quote section existed in this repo (verified: no route, component or script). The owner confirmed the model:
  **PDF in → template in the repo → owner iterates on the template**. No web UI, nothing published on the site.
- First template: derived from the label-printing quote PDF (3 pages: cover, scope by numbered blocks, amount table
  with VAT, closing lists). Its HTML source lives in another repo and is the styling reference.

## Scope

- `quotes/` tool at the repo root, outside `src/` and `public/` (never part of the Astro build or the deployed site).
- Template `scope-blocks`: fixed-price quote with a cover, an object paragraph, a scope split into numbered blocks,
  an amount table derived from those blocks (subtotal, VAT, total) and free titled closing lists.
- Build CLI: quote data (JSON) → validated → HTML → PDF through headless Chrome.
- Documentation for humans and AI agents: how to create a quote from a template, and how to add a template from a PDF.

Out of scope: web UI, AI API integration, self-hosted fonts, storing client quotes in git.

## Constraints

- **The repository is public.** No real client quote data (client names, amounts, scope text) may be committed:
  the committed template example is fictional. Real quote data lives in `quotes/private/` and generated files in
  `quotes/out/`, both git-ignored.
- Totals are always computed from the block amounts; they are never typed by hand or by an AI.
- Pagination is automatic (CSS paged media), not fixed page blocks, so content of any length paginates safely.
- Client-facing quote content is Spanish; code, docs, comments and tests are English.
- Strict TDD for pure logic (totals, formatting, validation, HTML rendering). Runner `npm test`.
- Follow repo idiom: `.mjs` modules with JSDoc, Vitest tests under `tests/`, `zod` for validation, no new
  dependencies.
- Commits per work unit, Conventional Commits, no `Co-Authored-By`. Push/PR/merge only after owner OK.

## Tasks

| ID  | Task                                                                                   | Route            | Status |
| --- | -------------------------------------------------------------------------------------- | ---------------- | ------ |
| Q1  | Quote core: money/date formatting, totals, quote schema validation (+ tests)           | delegated writer | [x]    |
| Q2  | `scope-blocks` template (HTML/CSS, brand wordmark), fictional example, build CLI → PDF | delegated writer | [x]    |
| Q3  | Docs: `quotes/README.md` (create a quote from a template; add a template from a PDF)   | delegated writer | [x]    |
| Q4  | Verification: checks + visual comparison of the rebuilt PDF against the original       | parent           | [x]    |

Route evidence: Q1–Q3 touch more than two non-trivial new files and need the reference HTML read before writing
(writer + preparation triggers) → one bounded writer. Q4 is a parent spot check.

## Acceptance criteria

- `npm run quote -- <data.json>` writes `<reference>.html` and `<reference>.pdf` under `quotes/out/`.
- Rebuilding the original quote from private data gives a PDF visually equivalent to the original (cover, running
  header/footer with folio, numbered blocks, amount table with highlighted total, two-column list).
- Invalid data (missing field, unknown template, negative amount) fails with a readable message and writes nothing.
- Totals and `es-ES` formatting are covered by tests (thousands separator on four-digit amounts included).
- `git status` shows no client data staged; `quotes/private/` and `quotes/out/` are ignored.

## Checks

`npm test` · `npm run lint` · `npm run check` · `npx prettier --check` on the changed files · visual read of the
generated PDF.

## Delivery

Strategy `ask-on-risk`. Forecast ≈ 900 authored changed lines (over the ~400 budget), so the chain strategy
(`stacked-to-main` or `feature-branch-chain`) is asked together with the push/PR decision; commits are already
split into self-contained work units so either strategy applies without rework.

## Progress

- Branch `feature/quote-templates` from `main` 5a025e0.
- Q1 done — `50e8d38` `feat(quotes): add quote core with totals, formatting and validation`. `quotes/lib/{format,totals,schema}.mjs`
  - tests. RED observed: module-not-found for the three test files, then `expected '1500 €' to be '1.500 €'` until
    `useGrouping: 'always'` was added (`Intl.NumberFormat('es-ES')` leaves four-digit numbers ungrouped). Totals are
    computed in integer cents. Unknown fields are rejected (`strictObject`) so a typo is not silently ignored; amounts
    with more than two decimals are rejected.
- Q2 done — `4029797` `feat(quotes): add scope-blocks template and PDF build CLI`. `quotes/templates/` (registry +
  `scope-blocks` template, stylesheet, fictional example, README), `quotes/brand/marmibas-wordmark.svg`
  (`currentColor`, tinted per use), `quotes/build.mjs`, `npm run quote`, `quotes/private/` ignored. RED observed:
  module-not-found for template/registry/build and `formatPercent is not a function`. Two test corrections (an
  escaped-occurrence count and a wordmark-order assumption), no implementation change behind them.
  Accepted additions to the planned data model: `sections[].spacing` (`compact` | `relaxed`, the original
  "Observaciones" list is wider-spaced), `title` accepts `\n` for a forced line break, and the amount table and each
  closing list stay whole when they fit on a page (stress builds left a one-row table fragment otherwise).
  Pagination: natural flow, no forced break before "Importe"; a 15-block (7 pages) and a 2-block quote were built
  outside the repo with nothing cut or orphaned.
- Q3 done — `379f284` `docs(quotes): document the template workflow`. `quotes/README.md`: create a quote from a
  template, add a template from a PDF, requirements, privacy rule.
- Q4 done (parent, 2026-10-05):
  - `npm test`: 19 files, 222 tests passed (70 under `tests/quotes/`), re-run by the parent.
  - `npx eslint quotes tests/quotes --max-warnings=0`: clean. `npm run lint` on the whole repo still reports the
    base failures (5 errors, 2 warnings) in files this branch does not touch — see `odd/tasks/terminal-redesign.md`.
  - `npm run check`: 0 errors, 0 warnings (writer run). `prettier --check` on the changed files: pass (writer run).
  - Both builds re-run by the parent: fictional example and the private original, 3 pages each.
  - Visual comparison of the rebuilt original against the source PDF, page by page: equivalent. Known differences:
    the cover data row now ends on the right margin (the original overflowed it by ~2.5 mm), so a very long client
    name may wrap; sub-pixel offsets (≤ 0.3 mm) on a few rules and on header/footer text.
  - Privacy: `git diff main` has no client names, amounts or scope text; no attribution lines in the commits.
  - Review: receipt-driven development is off (global), so no native review ran.

## Size

`git diff --stat main` before this document: 19 files, 2322 insertions (Q1 530, Q2 1676, Q3 118). Q2 is over the
~400-line heuristic and was kept as one unit: the template, its stylesheet (437 lines, ported from the reference),
the CLI and their tests only make sense together.

## Pending / next step

- Not unit-tested by design: the headless-Chrome step (needs Chrome and network for Google Fonts); covered by the
  manual builds above.
- Owner decisions still open: push + PR (and chain strategy, given the size); whether AI sessions in other
  repositories should learn about `quotes/` through a global skill.
