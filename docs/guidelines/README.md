# Design guidelines digest

This folder maps the component names and token names of the major design
systems into **one component catalogue** and **one token taxonomy** for this
framework. Component work (#34–#37), the token package (#19), the themes
(#48, #49, #50), behaviour acceptance criteria (#33) and the MUI migration
guide (#65) build against it.

| File                                               | Contents                                                    |
| -------------------------------------------------- | ----------------------------------------------------------- |
| [`component-catalogue.md`](component-catalogue.md) | One row per framework component kind, mapped to each system |
| [`token-taxonomy.md`](token-taxonomy.md)           | Token layers, categories, naming rules and mapping table    |
| [`catalogue.lino`](catalogue.lino)                 | The catalogue as Links Notation (source of truth)           |
| [`tokens-taxonomy.lino`](tokens-taxonomy.lino)     | The taxonomy as Links Notation (source of truth)            |

## Sources

All sources were read on **2026-11-01**.

| Source                     | Used for                                    | Link                                                                     |
| -------------------------- | ------------------------------------------- | ------------------------------------------------------------------------ |
| WAI-ARIA APG (W3C)         | Roles, patterns, keyboard behaviour         | https://www.w3.org/WAI/ARIA/apg/patterns/                                |
| Open UI (W3C CG)           | Common component names and anatomy research | https://open-ui.org/research/component-matrix/                           |
| Material 3 (Google)        | Component names, `md.sys.*` token names     | https://m3.material.io                                                   |
| Fluent 2 (Microsoft)       | Component names, alias token names          | https://fluent2.microsoft.design                                         |
| Apple HIG                  | Component names, semantic concepts          | https://developer.apple.com/design/human-interface-guidelines            |
| MUI                        | Component names (migration column)          | https://mui.com/material-ui/all-components/                              |
| DTCG Format Module 2025.10 | Token `$type` values                        | https://w3c.github.io/cg-reports/design-tokens/CG-FINAL-format-20251028/ |

How names were confirmed:

- every APG, Open UI, Material 3, Apple HIG and MUI link in the catalogue
  returned HTTP 200 on the read date (a wrong page on these sites returns 404);
- Fluent 2 pages are client-rendered and answer 200 for any path, so Fluent
  links were checked against the component index the site ships in its pages;
- Material 3 token names were checked against the `md-sys-*` custom
  properties of the `@material/web` package, and Fluent token names against
  the exports of the `@fluentui/tokens` package (both read only, not added
  as dependencies);
- any name that could not be confirmed this way is marked **(verify)**.

## Licence of sources

The digest records **facts** — component names, token names and links — and
every description, including each keyboard summary, is our own wording.
Nothing is copied from the guideline sites: no sentences, images, icons or
fonts. Material 3 and Fluent 2 documents are used for names only. The Apple
Human Interface Guidelines are proprietary documentation; we only link to
them, and SF Symbols and SF Pro must never be bundled with this framework.
APG text is not pasted either; each row links to the pattern instead.

## How to update

1. Edit [`catalogue.lino`](catalogue.lino) or
   [`tokens-taxonomy.lino`](tokens-taxonomy.lino). Keep one record per line,
   and quote every URL and every value that contains spaces or `:`. Write `'—'`
   when a system has no equivalent, and list unconfirmed systems in a
   `(verify ...)` field.
2. Regenerate the Markdown tables:

   ```bash
   node scripts/guidelines-tables.mjs
   ```

3. Run `node --test tests/guidelines-catalogue.test.js`; it fails when the
   tables are stale, a token path breaks the naming rules or a URL is not
   `https://`.
4. Update the read date above when you re-check the sources.
