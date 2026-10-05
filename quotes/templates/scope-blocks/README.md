# `scope-blocks` — fixed-price quote in numbered blocks

A quote for a closed piece of work at a fixed price: the scope is split into a few numbered blocks, each with its own
price, and the amount table is derived from them.

## When to pick it

| Pick it when                                             | Look for another template when                   |
| -------------------------------------------------------- | ------------------------------------------------ |
| The work has a closed scope and a fixed price            | The price is hourly or a monthly retainer        |
| The scope splits into 2–8 blocks, each priced on its own | Lines need quantities, unit prices or discounts  |
| The closing notes fit short bullet lists                 | The quote needs phases, a schedule or long prose |

## Sections

| Order | Section       | Source                                                                  |
| ----- | ------------- | ----------------------------------------------------------------------- |
| 1     | Cover         | `title`, `project`, `reference`, `date`, `client`, `version`            |
| 2     | Objeto        | `object`                                                                |
| 3     | Alcance       | `scope` — one numbered block (`01`, `02`…) per entry                    |
| 4     | Importe       | Derived from `scope`: one row per block, then Total, IVA, Total con IVA |
| 5     | Closing lists | `sections` — one titled bullet list per entry, in the order given       |

Every inner page carries the running header (wordmark + `runningHeader`) and the footer (`reference`, date, folio).
Fixed headings and labels are Spanish and live in `template.mjs`.

## Fields

All fields are required unless marked optional. Unknown fields are rejected.

| Field                | Type                       | Notes                                                                                          |
| -------------------- | -------------------------- | ---------------------------------------------------------------------------------------------- |
| `template`           | `"scope-blocks"`           |                                                                                                |
| `reference`          | text                       | `MMB-<CLIENT>-<TOPIC>-<YYYY>-<MM>`. Letters, digits, `.`, `-`, `_`: it is the output file name |
| `date`               | `YYYY-MM-DD`               | Printed as `5 de octubre de 2026`                                                              |
| `version`            | whole number               | `1` for the first issue                                                                        |
| `client`             | text                       | Legal name of who the quote is for                                                             |
| `title`              | text                       | Cover title. A `\n` forces a line break; otherwise lines are balanced                          |
| `project`            | text                       | Cover subtitle: the product or project the work belongs to                                     |
| `runningHeader`      | text                       | Short `Project · Topic`, printed uppercase at the top of every inner page                      |
| `object`             | text                       | One paragraph: what is delivered                                                               |
| `scope[]`            | list, 1 or more            | The priced blocks                                                                              |
| `scope[].title`      | text                       | Also the row label in the amount table                                                         |
| `scope[].amount`     | number                     | Euros before VAT, zero or more, at most two decimals                                           |
| `scope[].items[]`    | list, 1 or more            | Bullets of the block                                                                           |
| `vatRate`            | number                     | Percentage, `0`–`100` (`21`)                                                                   |
| `sections[]`         | list, optional             | Closing lists; omit it for none                                                                |
| `sections[].title`   | text                       | Heading of the list (`No incluido`, `Observaciones`…)                                          |
| `sections[].columns` | `1` or `2`                 | Optional, default `1`. Use `2` for many short items                                            |
| `sections[].spacing` | `"compact"` or `"relaxed"` | Optional, default `compact`. Use `relaxed` when items are full sentences                       |
| `sections[].items[]` | list, 1 or more            | Bullets of the list                                                                            |

There is no field for the subtotal, the VAT amount or the total: they are computed from `scope[].amount` and `vatRate`.

## Writing style

`example.json` is the reference: nominal phrases, one deliverable per bullet, no hours, no marketing language. Keep a
block to 3–5 bullets, and say what is left out in `No incluido` rather than hedging inside the scope.

## Pagination

Content flows and pages are cut automatically: a scope block, a table row and a list item never split across pages, a
heading never stays alone at the bottom of a page, and the amount table and each closing list stay whole when they fit
on a page. The example fills three pages (cover, scope, amounts and lists); shorter or longer content simply produces
fewer or more pages.
