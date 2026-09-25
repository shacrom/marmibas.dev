# Services mosaic — /servicios as one page with the E4 "cajón" mosaic

## Objective

Replace `/servicios` and its seven detail pages with a single terminal page: a mosaic of the seven services where
clicking a module opens a full-width drawer under its row (owner-chosen option E4 on the Claude Design canvas).

## Why

The owner finds the detail pages too much content: a visitor should see at a glance whether their idea fits one of
the services, without entering specific pages and without process explanations ("hay que ser más práctico").
After several rounds on Claude Design (lists, diagnosis, minimalist options) the owner chose the mosaic (E) and, for
opening a module, the drawer (E4).

## Owner decisions (2026-09-25)

- Visual spec: canvas https://claude.ai/artifact/8Y4kecEPqCfELEnquUpc3u, artboards "Servicios — E · mosaico
  (elegida)" (base) and "E4 · cajón" (interaction).
- No page per service; `/servicios` is the only services page.
- Module content: stroke icon (site Lucide icons), name, keyword. Drawer: `cat <slug>.md`, `# keyword`, name,
  description, "incluye" (4 items taken verbatim from each current detail page's deliverables), `[ Hablemos de
  esto ]`, close. Eighth module: "¿otra cosa? Cuéntamelo igualmente [ Hablemos ]".

## Constraints

- Copy stays verbatim from `src/lib/services.ts` and the current detail pages (the "incluye" items); no new facts.
- The seven `/servicios/<slug>/` pages are live, indexed and in the sitemap: keep their value with 301 redirects to
  `/servicios/#<slug>` (the drawer opens from the hash) and update every internal link (home `ServicesPane`, footer,
  `llms.txt`, SEO verify script, sitemap sources).
- Crawlable content: the description and "incluye" of every service must be in the server-rendered HTML, not only
  injected by JS. Progressive enhancement: without JS every service's content is reachable.
- Accessibility: modules are real buttons with `aria-expanded`/`aria-controls`; drawer focus management; Esc closes;
  reduced motion via `motion.css`.
- Responsive: drawer inserts after the clicked module's visual row (4 / 2 / 1 columns).
- TDD strict for pure logic (e.g. drawer insertion index per column count, redirect config): RED first; runner
  `npm test`. Astro markup → checks + visual QA.
- Known lint base failures: 5 errors in untouched files (after `feature/work-terminal`) — no new ones.
- Commits per work unit, Conventional Commits, no `Co-Authored-By`. Push/PR/merge only after owner OK.

## Tasks

| ID | Task | Route | Status |
|----|------|-------|--------|
| S1 | Services data: add the 4 "incluye" items + keyword/icon per service in `src/lib/services.ts` (tested) | delegated writer | [x] |
| S2 | `/servicios` mosaic + drawer (E4), hash deep links, crawlable content | delegated writer (same) | [x] |
| S3 | Remove the 7 detail pages, 301 redirects to `/servicios/#<slug>` (tested), update internal links, sitemap, `llms.txt`, SEO verify script | delegated writer (same) | [x] |
| S4 | Verification (checks, build, visual QA 1440/390) + delivery (asked) | parent | [~] verified, delivery pending |

Route evidence: S1–S3 touch 4+ non-trivial files → writer trigger.

## Acceptance criteria

- `/servicios` matches the E / E4 artboards at 1440 and works at 768 / 390.
- `/servicios/<slug>/` answers 301 → `/servicios/#<slug>` and that drawer opens on load.
- No internal link points to a removed page; `npm run test:seo` passes with the updated contract.
- Checks green except the known lint base failures.

## Progress

- Branch `feature/services-mosaic` stacked on `feature/work-terminal` (805e462) so the local preview shows both.

- S1 done — `e5fc406 feat(services): add the included items to the services data`: 4 "incluye" items per service,
  mosaic display names/order, `drawerInsertIndex`/`drawerNotchPercent` helpers; tests first (17/22 RED → GREEN).
- S2 done — `d1849b1 feat(services): show the services as a terminal mosaic with a drawer`: new
  `src/components/services/ServicesMosaic.astro`; drawers server-rendered in a fallback list (no-JS: all visible),
  JS moves the open one after the module's visual row (columns read from computed style), hash deep links, focus
  + Esc handling; `ItemList` of `Service` JSON-LD on `/servicios`. Contact has no prefill → plain `/contacto`.
- S3 done — `c20517e feat(services): redirect the service pages to the mosaic`: 7 detail pages deleted; 14
  permanent redirects (`/servicios/<slug>` and trailing slash → `/servicios/#<slug>`) with tests first (RED →
  GREEN); home `ServicesPane`, `llms.txt`, SEO verify script (now 3 public routes) updated.
- Parent review fix — `fb34049 fix(services): hide the parked drawers once the mosaic takes over`: with JS on, the
  collapsed drawers still painted border + notch below the grid.
- Checks: writer — `npm test` 154/154, `npm run check` 0 errors, eslint + prettier clean, build OK, `test:seo`
  passed. Parent — `npm test` 154/154, `npm run check` 0 errors, eslint + prettier on the fixed file clean; visual
  QA 1440 (closed + `#sistemas-de-gestion` open) and 390 (`#integraciones` open) with reduced motion.
- Possible follow-up: modules keep their 230px height on mobile (tall single-column list).

## Next step

Delivery (push/PR/merge) after the owner's OK — PR stacked after `feature/work-terminal`.
