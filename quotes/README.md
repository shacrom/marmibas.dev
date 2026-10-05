# Quotes — Marmibas quote PDFs from reusable templates

A quote is a JSON data file. A **template** (layout + data schema + example) turns it into a Marmibas-branded A4 PDF.
New quotes start from a template's example instead of from scratch; new templates are made from a quote PDF the owner
hands over.

This folder is a local tool. It is outside `src/` and `public/`, so nothing here is built or deployed with the site.

> **Privacy — the repository is public.** Real quote data (client names, amounts, scope text) lives only in
> `quotes/private/` and `quotes/out/`, both git-ignored. Everything committed here is fictional.

## Create a quote from a template

```bash
npm run quote -- --list                                    # 1. pick a template
cp quotes/templates/<id>/example.json quotes/private/<reference>.json   # 2. start from its example
# 3. rewrite the content of quotes/private/<reference>.json for the new job
npm run quote -- quotes/private/<reference>.json            # 4. build
open quotes/out/<reference>.pdf                             # 5. read it
```

1. **Pick a template.** `--list` prints each template id with a one-line description. Its `README.md` says when to
   use it and documents every field.
2. **Copy the example** to `quotes/private/<reference>.json`. Name the reference
   `MMB-<CLIENT>-<TOPIC>-<YYYY>-<MM>` (e.g. `MMB-DEMO-RES-2026-10`); it is also the output file name.
3. **Rewrite the content** for the new job. Keep the example's structure and its writing style: Spanish, nominal
   phrases, one deliverable per bullet, no hours, no marketing language. Set `"reference"` to the same value as the
   file name.
4. **Build.** The command writes `quotes/out/<reference>.html` and `quotes/out/<reference>.pdf`. If the data is
   invalid it prints one `path: reason` line per problem, exits non-zero and writes nothing — fix and rerun.
5. **Check the PDF** page by page: nothing cut or orphaned, the amount table adds up to what was agreed, fonts are
   Montserrat (headings) and Mulish (body).

### Rules

| Rule                                   | Why                                                                                   |
| -------------------------------------- | ------------------------------------------------------------------------------------- |
| Totals are computed, never typed       | Subtotal, VAT and total come from the block amounts. The schema has no field for them |
| Client data stays in `quotes/private/` | The repository is public. Never put a real quote in `templates/` or in a test         |
| The owner confirms before sending      | Amounts and scope are the owner's decision. An AI drafts; it does not price or send   |
| Fix the template, not the output       | `quotes/out/` is regenerated on every build. Layout changes go in the template        |

### Asking an AI for a quote

Name the template and give the job: _"New quote with the `scope-blocks` template for …"_. The AI follows the five
steps above, proposes blocks and wording from the brief, leaves amounts as given by the owner (or asks for them), and
hands back the PDF path for review.

### Options

| Command                                    | Result                                       |
| ------------------------------------------ | -------------------------------------------- |
| `npm run quote -- <data.json>`             | HTML + PDF in `quotes/out/`                  |
| `npm run quote -- <data.json> --out <dir>` | HTML + PDF in `<dir>`                        |
| `npm run quote -- <data.json> --html-only` | HTML only, to check the data without Chrome  |
| `npm run quote -- --list`                  | Template ids, descriptions and example paths |

## Add a template from a PDF

The owner hands over a finished quote PDF (and its HTML source, when there is one). These are the steps that produced
`scope-blocks`:

1. **Read the PDF page by page** and list its sections in order.
2. **Split fixed from data.** Headings, labels and the brand are fixed and go in the template; everything specific to
   the job is a field. Anything derivable (numbering, totals, folios, the long date) is computed, not a field.
3. **Write the schema** in `quotes/lib/schema.mjs`: spread `commonFields`, add the template's own fields, add the
   schema to `quoteSchemas`. Use `strictObject` so a typo in a data file is an error.
4. **Write the tests first** in `tests/quotes/<id>.test.ts`: what the rendered HTML must contain, escaping included.
5. **Create `quotes/templates/<id>/`** with the four files below, and register the template in
   `quotes/templates/index.mjs`.
6. **Reproduce the original.** Transcribe the PDF's content into `quotes/private/<reference>.json`, build it, and
   compare with the original page by page (`pdftoppm -r 80 -png <pdf> <prefix>` renders pages to PNG). Iterate on the
   CSS until they match.
7. **Stress the pagination.** Build one much shorter and one much longer variant (use `--out` with a directory outside
   the repo) and check that nothing is cut or orphaned.
8. **Before committing**, search the staged diff for the client's names: `git diff --cached | grep -i <name>`.

| File           | Content                                                                               |
| -------------- | ------------------------------------------------------------------------------------- |
| `template.mjs` | `render(quote, { wordmarkSvg, css })` → full HTML document. Escapes every data string |
| `styles.css`   | Print stylesheet                                                                      |
| `example.json` | A **fictional** quote of realistic length — the starting point for every new quote    |
| `README.md`    | What the template is for, when to pick it, its sections and its field reference       |

### Layout rules that hold in Chrome's PDF output

| Need                                    | Do                                                                                                                      |
| --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Content of any length                   | One continuous flow cut by `@page`; never fixed `297mm` page blocks                                                     |
| Full-bleed cover                        | A named page: `page: cover` on the element, `@page cover { margin: 0 }`                                                 |
| Running header, footer, folio           | Page margin boxes (`@top-left`, `@bottom-right`…), folio with `counter(page)` / `counter(pages)`                        |
| Per-quote text in a margin box          | Emit `content: "…"` from the template through `cssString` (see `scope-blocks/template.mjs`)                             |
| Logo in a margin box                    | `content: url(data:…)`; it renders at its intrinsic size, so size it inside the SVG                                     |
| No ugly breaks                          | `break-inside: avoid` on blocks, rows and items; `break-after: avoid` on headings                                       |
| Same gap under the header on every page | Put the gap in the page margin; a heading's own top margin is dropped after a natural break but kept after a forced one |
| Highlighted table row                   | One background on the `tr`; box-shadow and per-cell gradients show seams                                                |

## Layout of this folder

| Path                          | Content                                                                  | In git |
| ----------------------------- | ------------------------------------------------------------------------ | ------ |
| `build.mjs`                   | CLI: data → validate → HTML → PDF                                        | yes    |
| `lib/`                        | Formatting (`format.mjs`), totals (`totals.mjs`), schemas (`schema.mjs`) | yes    |
| `templates/index.mjs`         | Template registry                                                        | yes    |
| `templates/<id>/`             | One template: layout, styles, fictional example, README                  | yes    |
| `brand/marmibas-wordmark.svg` | The wordmark, cropped to its glyphs, painted with `currentColor`         | yes    |
| `private/`                    | Real quote data files                                                    | **no** |
| `out/`                        | Generated HTML and PDF                                                   | **no** |

Tests live in `tests/quotes/` and run with `npm test`.

## Requirements

| Requirement        | Detail                                                                                                                 |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| Node 22 or newer   | As the rest of the repo                                                                                                |
| Google Chrome 131+ | Prints the PDF (page margin boxes need 131). Found at the macOS default path or on `PATH`; otherwise set `CHROME_PATH` |
| Network            | Chrome loads Montserrat and Mulish from Google Fonts while printing. `pdffonts <pdf>` lists the fonts actually used    |
