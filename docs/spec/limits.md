# Limits and diagnostics

## Limits

| Limit                 | v0 value                     | `links-notation` option                            |
| --------------------- | ---------------------------- | -------------------------------------------------- |
| Maximum nesting depth | 64                           | `maxDepth` (its default, `DEFAULT_MAX_DEPTH = 64`) |
| Maximum input size    | 1 MiB (1,048,576 code units) | `maxInputSize` (the parser default is 10 MiB)      |

- Implementations MUST reject input deeper than 64 levels with the error
  `depth-exceeded` (fixture `errors/syntax-depth-exceeded`).
- Implementations MUST reject input longer than 1 MiB with the error
  `input-too-large`, before parsing it. The JavaScript parser measures
  `input.length` (UTF-16 code units); ports SHOULD use the same measure.
- Hosts MAY use smaller limits for untrusted input; they MUST NOT use larger
  ones for untrusted input.

## Unknown content is inert

- An element with an unknown kind MUST be rendered as an inert placeholder: it
  has no behaviour, loads nothing, and is never executed.
- Unknown sublinks are kept for round trips but have no effect.
- Handlers are names, never code (see [behaviour.md](behaviour.md)).

## Diagnostics

A diagnostic is `{ "code", "severity", "at" }`. `at` points at the source:

- `line` and `column` (1-based) for parser errors;
- `element` (the element id, `null` for an anonymous element or the document
  root), plus `property`, `head`, `kind` or `token` where they apply.

Severities: `error` (the document or the element MUST NOT be rendered as
written), `warning` (rendering continues; the content is ignored or
replaced), `info` (no effect). Unless a fixture says otherwise, an
implementation MUST report every diagnostic of a document, not only the first.

| Code                 | Severity | Points at                  | Defined in                                 |
| -------------------- | -------- | -------------------------- | ------------------------------------------ |
| `syntax-error`       | error    | line, column               | this file                                  |
| `depth-exceeded`     | error    | line, column               | this file                                  |
| `input-too-large`    | error    | nothing (`{}`)             | this file                                  |
| `missing-kind`       | error    | element                    | [elements.md](elements.md)                 |
| `unknown-kind`       | warning  | element, kind              | [elements.md](elements.md)                 |
| `unknown-sublink`    | warning  | element, head              | [elements.md](elements.md)                 |
| `unexpected-child`   | warning  | element                    | [elements.md](elements.md)                 |
| `duplicate-id`       | error    | element                    | [ordering-and-ids.md](ordering-and-ids.md) |
| `duplicate-property` | warning  | element, property          | [ordering-and-ids.md](ordering-and-ids.md) |
| `reserved-sigil`     | warning  | element, property (if any) | [values.md](values.md)                     |
| `invalid-value`      | error    | element, property          | [values.md](values.md)                     |
| `reference-cycle`    | error    | element, property, token   | [values.md](values.md)                     |
| `invalid-handler`    | error    | element, property          | [behaviour.md](behaviour.md)               |
| `unknown-action`     | warning  | element, property          | [behaviour.md](behaviour.md)               |
| `unsafe-url`         | error    | element, property          | [behaviour.md](behaviour.md)               |

A parser error stops the projection: the tree is empty and the error is the
only diagnostic. All other diagnostics are collected while the tree is built.
