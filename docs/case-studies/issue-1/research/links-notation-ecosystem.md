# Links Notation (LiNo) ecosystem: research for the associative UI framework

Research input for [issue #1](https://github.com/link-foundation/ui/issues/1).
It covers the notation the whole framework (DOM-like structure, config, styles,
animations, the WYSIWYG editor and the links-network visualizer) is meant to be
written in. Data was collected on 2026-11-01 from GitHub and package registries.
Sources: shallow/sparse checkouts of the repositories listed below and `gh api`.
No downloaded code was executed.

Primary sources:

- Repository: <https://github.com/link-foundation/links-notation>
- Grammar (EBNF, v0.24.0 grammar, current packages 0.27.1):
  [`docs/grammar/GRAMMAR.md`](https://github.com/link-foundation/links-notation/blob/main/docs/grammar/GRAMMAR.md),
  and the same grammar written in LiNo itself:
  [`docs/grammar/grammar.lino`](https://github.com/link-foundation/links-notation/blob/main/docs/grammar/grammar.lino)
- Reference literals: [`docs/protocol/reference-literals.md`](https://github.com/link-foundation/links-notation/blob/main/docs/protocol/reference-literals.md)
- Binary form: [`docs/protocol/binary-links-notation.md`](https://github.com/link-foundation/links-notation/blob/main/docs/protocol/binary-links-notation.md)
- Cross-language parity corpus: [`parity/`](https://github.com/link-foundation/links-notation/tree/main/parity) (`parity/text-fixtures.json`)

## 1. Syntax summary

A **link** is an ordered sequence of references, written `(id: v1 v2 ...)`.
The id is optional, and so is everything else. A **reference** is either a
simple token or a delimited (quoted) string. Values can themselves be links,
so nesting goes as deep as you like.

### 1.1 Links and ids

```lino
papa loves mama                 # anonymous link with three values
family: papa mama son daughter  # link with id "family" and four values
(papa loves mama)               # same as line 1, explicit parentheses
(outer: (inner: v1 v2) v3)      # inline nesting
```

The id is a **single** reference followed by `:`. `a b: c` is not a link with a
two-word id.

### 1.2 Indentation (hierarchy without parentheses)

```lino
family:
  papa
  mama
```

This is `(family: papa mama)`. A value line that has indented children forms a
nested link:

```lino
root:
  child1
  child2
    grandchild
```

This is `(root: child1 (child2 grandchild))`. The rules:

- The first content line sets the base indentation.
- Children must be indented more than their parent, and siblings must be
  indented equally.
- Only spaces count; tabs do not.

### 1.3 Multi-line groups (nested context, issue #282, v0.14.0+)

```lino
array (
  a
    b
  c
)
```

A `(` opens a nested context that starts again at indentation level 0, so the
indentation inside it is structural. A body that yields a single link collapses
to that link, so `(a b c)` is one link. `((a b))` stays distinct from `(a b)`.

### 1.4 References and quoting

- Simple reference: any characters except whitespace, `(`, `:` and `)`. So
  `button.primary`, `@space.3`, `$accent`, `8px`, `100%`, `0.25` and `-1` are
  all plain simple references.
- Delimiters: `"`, `'` and `` ` `` behave identically. N-quoting works as
  follows: a run of N delimiters opens and closes, and a run of 2N delimiters
  inside the body stands for N literal delimiters. Example: `""say ""hi"" ""`.
- `""` is the empty reference. Formatters write it explicitly so it round-trips.
- Lossless literal, v0.24.0+: `~1{hex UTF-8}`, for example `~1{e282ac}` for the
  euro sign. Any string, control characters included, round-trips exactly. The
  prefix `~[0-9]+{` is reserved.

### 1.5 Comments (issue #301)

```lino
# the machines this deploys to
deploy: staging # only staging, for now
```

- `#` opens a comment only at the start of the document or after whitespace.
  `issue#1047` and `"#"` are literal.
- Comment characters are replaced by spaces, so error positions stay correct.
- Comments are on by default and can be disabled (`comments: false`) for legacy
  documents.
- Formatters quote references that start with `#` (`'#tag'`).

**Consequence for UI:** CSS hex colours (`#3390ec`) must be quoted, otherwise
they are read as comments. URLs and CSS pseudo-classes contain `:`, so they
must be quoted too (`"https://..."`, `":hover"`).

### 1.6 Other forms

- **Streaming parsers** exist in all 8 languages: push events (`link`, `error`,
  `end`) plus iterators. Useful for large documents and live editing.
- **Binary Links Notation v1** (`docs/protocol/binary-links-notation.md`,
  originating in link-cli PR #106) has golden vectors. It is a candidate wire
  and storage format between a UI runtime and a doublets store.

## 2. Implementations

All implementations are hand-written. JS is the reference, and the others are
held to it by the shared parity corpus (`parity/text-fixtures.json`) and golden
round-trip tests. Versions are as of 2026-11-01.

| Language        | Package                                                                                                                                          | Version / status                                                                            | Parser tech                                | Tests | Maturity                                                                                          |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------- | ------------------------------------------ | ----- | ------------------------------------------------------------------------------------------------- |
| JavaScript / TS | npm [`links-notation`](https://www.npmjs.com/package/links-notation)                                                                             | 0.27.1                                                                                      | Peggy grammar, TS types, zero runtime deps | 316   | Reference implementation. Browser-safe since 0.27.1 (#351 fixed a Node `events` polyfill problem) |
| Rust            | crate [`links-notation`](https://crates.io/crates/links-notation) (`parse_lino`), plus `links-notation-macro` 0.1.2 (`lino!` compile-time macro) | 0.27.1                                                                                      | hand-written                               | 401   | Stable. Usable from WASM                                                                          |
| C#              | NuGet `Link.Foundation.Links.Notation`                                                                                                           | 0.27.1                                                                                      | Pegasus PEG                                | 295   | Stable                                                                                            |
| Python          | PyPI [`links-notation`](https://pypi.org/project/links-notation/) (`from links_notation import Parser`)                                          | 0.27.1                                                                                      | hand-written                               | 247   | Stable                                                                                            |
| Go              | `github.com/link-foundation/links-notation/go` (`lino.Parse`)                                                                                    | v0.27.1                                                                                     | hand-written                               | 139   | Stable, smaller API                                                                               |
| Java            | `io.github.link-foundation:links-notation`                                                                                                       | not on Maven Central ([#192](https://github.com/link-foundation/links-notation/issues/192)) | hand-written                               | 185   | Source only                                                                                       |
| PHP             | `link-foundation/links-notation`                                                                                                                 | not on Packagist (#192)                                                                     | hand-written                               | 235   | Source only                                                                                       |
| C++             | CMake, release archives                                                                                                                          | 0.27.1                                                                                      | hand-written                               | 346   | Stable                                                                                            |
| Swift           | none                                                                                                                                             | -                                                                                           | -                                          | -     | **Missing.** Needed for the issue's Swift target                                                  |
| Kotlin          | none (could use Java once published)                                                                                                             | -                                                                                           | -                                          | -     | **Blocked on #192**                                                                               |

### 2.1 JS API surface (the one the UI framework will use first)

- `new Parser({ maxInputSize, maxDepth = 64, comments })`.
  - `.parse(text)` returns `Link[]`.
  - `.parseGroups(text)` returns a `LinksGroup` tree. `LinksGroup` exists only in
    JS, C#, Java and C++.
- `new Link(id, values)`, with `.format(options)` and `.toString()`.
- `formatLinks(links, { lessParentheses, maxLineLength, indentLongLines, maxInlineRefs, groupConsecutive })`.
- `parseIndentedDocument` / `formatIndentedDocument` (JS and C++ only).
- `escapeReference(ref, { minimal })` / `unescapeReference(ref)`.
- `StreamParser`: events `link`, `error` and `end`, plus `position()`, `drain()`
  and `reset()`.

### 2.2 Round-trip guarantees

| Guarantee                                                                       | Status                                                   |
| ------------------------------------------------------------------------------- | -------------------------------------------------------- |
| `parse -> format -> parse` yields the same link tree                            | Yes, in every language, tested against the golden corpus |
| Any Unicode string survives as a reference                                      | Yes, via quoting or the `~1{}` literal                   |
| Same tree across languages                                                      | Yes, via the parity fixtures                             |
| Comments survive                                                                | **No.** They are dropped during parsing                  |
| Original layout survives (indentation vs parentheses, quote style, blank lines) | **No.** The formatter re-chooses the layout              |
| Quoted vs bare distinction is visible in the tree                               | **No.** `"1"` and `1` are the same reference string      |

For a WYSIWYG editor that edits the user's `.lino` file, the last three rows
matter most. See section 5.

### 2.3 Open and relevant issues (links-notation)

- Open: [#192](https://github.com/link-foundation/links-notation/issues/192)
  (publish Java and PHP) and #350 (dependabot). The repository is otherwise
  quiet and stable.
- Closed but relevant to UI:
  - #301 (comments)
  - #282 (nested context for multi-line groups)
  - #332 (lossless reference literal)
  - #351 (browser bundling)
  - #313 (formatter / empty reference)
  - #184 (multi-reference values)

## 3. Related lino packages

| Repository                                                                        | Package / version                                                             | What it offers a UI framework                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [lino-objects-codec](https://github.com/link-foundation/lino-objects-codec)       | npm `lino-objects-codec` 0.9.4, crate 0.9.3, PyPI, NuGet `Lino.Objects.Codec` | **Typed object <-> LiNo.** It has its own reader (`js/src/readable.js`) that tells quoted from bare references. Strings are quoted. Numbers, booleans and `null` are bare. Objects are `(key value)` lists, arrays are `( )`, special strings are `(escaped "...")`. `encodeLine` writes one record per line as `(o: (k v) ...)`. `encodeCompact` uses type markers plus `obj_N` ids, so it handles cycles. JS also has JSON <-> LiNo and fuzzy matching. This is the most direct base for UI props and config |
| [lino-i18n](https://github.com/link-foundation/lino-i18n)                         | npm 0.5.0, crate 0.5.1                                                        | `.lino` message catalogues: nesting flattened to dot keys, plurals, contexts, `{{name}}` placeholders, `"""` multi-line. React adapter (`T`, `Var`), ICU, Vite/Rollup plugin, and a CLI that converts i18next / i18n-js / react-intl catalogues. Ready-made i18n layer                                                                                                                                                                                                                                         |
| [lino-arguments](https://github.com/link-foundation/lino-arguments)               | npm 0.4.0, crate 0.5.0                                                        | Config priority chain CLI > env > config file > defaults. `lino-arguments/pure` works in browser and WASM. Fits the "dev / config mode" settings resolution                                                                                                                                                                                                                                                                                                                                                    |
| [lino-env](https://github.com/link-foundation/lino-env)                           | npm 0.2.8, crate 0.1.0                                                        | `.lenv` files (`KEY: value`)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| [meta-language](https://github.com/link-foundation/meta-language)                 | npm 0.46.0, crate 1.0.0                                                       | Self-describing language over a links network: grammars and translation rules. Native **HTML import** (tag stack, raw `script`/`style` text) and **CSS import** with a lossless CST (trivia and spans). This is the path to "import an existing HTML/CSS UI into links" and to theme reproduction ([vision](https://github.com/link-foundation/meta-language/blob/main/docs/vision.md))                                                                                                                        |
| [meta-notation](https://github.com/link-foundation/meta-notation)                 | not published                                                                 | LiNo-like subset without `:`. It parses `()`, `{}`, `[]` and quotes, and round-trips them. A possible tolerant reader for embedded CSS/JS snippets                                                                                                                                                                                                                                                                                                                                                             |
| [link-cli](https://github.com/link-foundation/link-cli) (`clink`)                 | crate 1.0.9                                                                   | C# and Rust CLI/library over doublets. Queries are single substitutions. Its WASM React workbench at <https://link-foundation.github.io/link-cli/> already visualizes a links store in the browser                                                                                                                                                                                                                                                                                                             |
| [doublets-web](https://github.com/linksplatform/doublets-web) (linksplatform org) | npm `doublets-web` 0.1.3                                                      | WASM bindings of doublets-rs (`UnitedLinks`, `LinksConstants`, `Link`) and a Monaco playground with a graph view. Storage and runtime for the "UI as a links network" view                                                                                                                                                                                                                                                                                                                                     |
| [links-client](https://github.com/link-foundation/links-client)                   | npm `@link-foundation/links-client` 1.0.0                                     | JS/Python client for link-cli                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| [linksql](https://github.com/link-foundation/linksql)                             | not published                                                                 | Query language `(restriction) (substitution)` with `$vars` and `*`. A model for bindings and selectors                                                                                                                                                                                                                                                                                                                                                                                                         |
| [transformer](https://github.com/link-foundation/transformer)                     | Rust                                                                          | LiNo rewrite rules (match / replace with `$vars`). A model for theme derivation and dialect lowering (LiNo UI to React / SwiftUI / Compose)                                                                                                                                                                                                                                                                                                                                                                    |
| [deduplino](https://github.com/link-foundation/deduplino)                         | npm 0.0.9                                                                     | Deduplicates repeated LiNo sub-links. Can extract shared style fragments                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| [lino-cache](https://github.com/link-foundation/lino-cache)                       | not published                                                                 | cache-manager store over the codec                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| [meta-ontology](https://github.com/link-foundation/meta-ontology)                 | Rust                                                                          | Self-describing ontology in LiNo. A source of type and schema vocabulary                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| lino-schema, lino-document-markup-language, dedup-log                             | -                                                                             | **Stubs.** The README is still the JS template. The names show intent (schema validation, document markup), but nothing is implemented                                                                                                                                                                                                                                                                                                                                                                         |
| grammar-expressions, lino-tokenizer, lino-rest-api, links-queue                   | -                                                                             | Adjacent tooling: grammar-as-data, a tokenizer, a REST API and a queue                                                                                                                                                                                                                                                                                                                                                                                                                                         |

The organisation has 177 repositories in total. Only the ones above touch LiNo
directly. The other UI-producing projects (meta-sovereign, link-cli workbench,
doublets-web playground) are covered in sibling research files.

## 4. What a UI dialect needs that LiNo already has

| UI need                                                              | Existing LiNo feature                                                                                                                         |
| -------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Tree of elements (DOM-like)                                          | Indentation and nested groups. `parseGroups` keeps the hierarchy                                                                              |
| Element identity                                                     | Link id (`save:`). Ids are single references, globally addressable                                                                            |
| Graph, not just tree (reuse, references between elements and tokens) | A reference is just a name, so `@token` / `$name` / an element id can point anywhere in the document. This is native to the associative model |
| Attributes / props                                                   | `(key value)` sub-links, the lino-objects-codec convention                                                                                    |
| Text content with any characters                                     | Quoting, N-quoting and `~1{}` literals                                                                                                        |
| Comments in hand-written files                                       | `#` comments (read side only)                                                                                                                 |
| Big documents, live editing                                          | Streaming parsers, `position()` for error locations                                                                                           |
| One spec for many targets                                            | 8 implementations with a parity corpus. Rust compiles to WASM                                                                                 |
| Typed config objects                                                 | lino-objects-codec (quoted = string, bare = number/bool/null)                                                                                 |
| i18n strings                                                         | lino-i18n catalogues and React adapter                                                                                                        |
| Settings resolution                                                  | lino-arguments (pure build for browser)                                                                                                       |
| Import of existing HTML/CSS                                          | meta-language HTML/CSS importers with lossless CST                                                                                            |
| Storage as a links network                                           | doublets-web (WASM), link-cli, binary LiNo                                                                                                    |
| Visualizing the network                                              | link-cli workbench and doublets-web playground graph views (prior art for the issue's "LiNo -> links network UI" converter)                   |

## 5. Gaps and open questions

1. **Typed values.** The core tree has only strings, and `"1"` and `1` produce
   the same reference. The dialect needs a rule. Options:
   - (a) Adopt the lino-objects-codec rule: bare means number, boolean or null,
     and quoted means string. This requires the codec's own reader, because the
     core parser loses quoting.
   - (b) Use schema-driven typing: the property's declared type decides how
     `8px`, `0.2s` or `100%` are read.

   Recommendation: (b) for dimensions, durations and colours, with (a) as the
   fallback for free-form props. Also ask upstream for a `quoted` flag on
   parsed references, which would remove the need for a second reader.

2. **Units and colours.**
   - `8px`, `0.2s`, `50%` and `1.5rem` are valid bare references, but they are
     strings until a schema parses them.
   - Hex colours must be quoted because of `#` comments.
   - Alternative: `rgb(...)` / `oklch(...)` as links, for example
     `(oklch 0.62 0.19 255)`, which is better for the associative model and for
     theme maths.
3. **`:` in values.** URLs, CSS pseudo-classes (`:hover`), media queries and
   ratios (`16:9`) need quoting. Prefer structured links instead:
   `(state hover)`, `(media (max-width 640px))` and `(aspect 16 9)`.
4. **Comments and formatting are lost on round trip.** A WYSIWYG editor that
   writes back to `.lino` will strip the user's comments and reflow the layout.
   Options:
   - (a) A CST mode upstream (trivia and spans, as meta-language already does
     for CSS).
   - (b) Make comments first-class links, for example `(note "...")`.
   - (c) Patch-in-place edits using parser positions.

   This needs an issue upstream in links-notation.

5. **Ordering.** Link values are ordered, which is good for children and
   keyframes. Property order, however, should be insignificant. The dialect
   must state which parts are sequences (children, keyframes, transitions) and
   which are sets (props). It must also define the meaning of a duplicate key:
   last wins, as in lino-store logs.
6. **Ids and scoping.** Ids are document-global strings, and nothing prevents
   duplicates. Questions:
   - Do we need namespaces (`login.save`) or nested id scopes per component?
   - How do ids map to doublet numeric addresses, and are they stable across
     edits? The editor needs stable ids for selection, undo and collaboration.
7. **References for styles and tokens.** There is no built-in reference sigil.
   A convention is needed:
   - `@token.path` for design tokens
   - `$param` for component parameters (the linksql / transformer convention)
   - a bare id for elements and keyframe tracks

   Open questions: resolution order (component, then theme, then base),
   cycles, and fallbacks (`(or @color.accent "#3390ec")`).

8. **Schemas and validation.** lino-schema is only a stub. The dialect needs a
   schema (which props an element accepts, their types and defaults) for:
   - the editor's property panel
   - validation
   - codegen to React, Vue, React Native, SwiftUI and Compose
9. **Expressions and bindings.** Event handlers, data bindings and conditional
   rendering need a small expression vocabulary, for example
   `(on press (emit save))`, `(bind value $draft.text)` and
   `(when $sending (show spinner))`. Decide whether this reuses the linksql
   substitution syntax.
10. **Missing languages.**
    - Swift: no implementation exists.
    - Kotlin: blocked by the unpublished Java package (#192).

    Options: native targets either ship a parser or consume a precompiled
    form (JSON or binary LiNo) produced by the JS/Rust toolchain.

11. **Security.** The parser has `maxDepth = 64` and `maxInputSize`. User-supplied
    themes must never contain executable code. Event handlers are names, not
    code.

## 6. Proposed sketch of a UI dialect in LiNo (PROPOSAL, not an existing format)

> Everything in this section is a **proposal for discussion**. It is not
> implemented anywhere. It only uses syntax the current grammar (0.27.1)
> accepts. The meaning of every name is defined by the proposed dialect
> schema, not by LiNo itself.

Conventions used:

- An indented id link (`save:`) declares an element, token set or animation.
  Its first value is the **kind** (`button`, `stack`, `theme`, `animation`).
- Props are `(key value...)` sub-links. Their order does not matter.
- Children, keyframes and transitions are ordered.
- `@a.b.c` is a design-token reference. `$name` is a component parameter. A
  bare id is an element or animation reference.
- Quoted text is a literal string. Bare values are interpreted by the property
  schema (number, dimension, duration, enum).
- Colours are quoted hex or structured `(oklch L C H)`.

### 6.1 A button

```lino
save:
  button
  (label (t "composer.send"))          # i18n key, resolved by lino-i18n
  (variant primary)
  (size md)
  (icon send)                          # public-domain icon set, by name
  (disabled $draft.empty)              # binding to a parameter
  (on press (emit message.send))       # handlers are names, never code
  (style
    (background @color.accent-fill)
    (color @color.on-accent)
    (radius @radius.control)
    (padding @space.2 @space.3)
    (state hover (background @color.accent))
    (state pressed (scale 0.97)))
  (enter bubble-in)                    # reference to an animation below
```

### 6.2 A layout

```lino
chat-screen:
  split
  (direction row)
  (resizable true)
  (remember-size "chat.columns")
  (children chat-list conversation)

chat-list:
  list
  (virtualized true)
  (item-height 3.5rem)
  (min-width 16rem)
  (items $chats)
  (template chat-row)

conversation:
  stack
  (direction column)
  (max-width @size.chat-column)
  (children
    (header (title $chat.name))
    (messages (items $messages) (group-by sender) (follow bottom))
    composer)

compact-layout:
  breakpoint
  (when (max-width 640px))
  (override chat-screen (direction column) (children conversation))
```

`children` holds element ids, so the same element can sit in several layouts.
That reuse is the graph property the associative model gives for free. Inline
anonymous children (`(header ...)`) are also allowed.

### 6.3 A theme token set

```lino
base:
  theme
  (space (1 0.25rem) (2 0.5rem) (3 0.75rem) (4 1rem))
  (radius (control 8px) (bubble 15px))
  (size (control-h 2.25rem) (chat-column 44rem))
  (motion (fast 120ms) (normal 200ms) (easing standard))

telegram-light:
  theme
  (extends base)
  (mode light)
  (color
    (bg "#ffffff")
    (text "#000000")
    (accent "#3390ec")
    (accent-fill "#2a7bd0")              # darkened for 4.5:1 contrast
    (on-accent "#ffffff")
    (bubble-out "#e3fee0")
    (bubble-in "#ffffff"))
  (radius (bubble 15px))

telegram-dark:
  theme
  (extends telegram-light)
  (mode dark)
  (color (bg "#212121") (text "#ffffff") (bubble-out "#8774e1") (bubble-in "#212121"))
```

The token names were chosen so that meta-sovereign's existing CSS custom
properties (`--bg`, `--accent`, `--accent-fill`, `--bubble-out`,
`--bubble-radius`, `--control-h`, `--chat-column`) map onto them one to one.
A theme compiles to `:root[data-theme=...]` CSS variables on the web and to
platform theme objects elsewhere. The colour values above are illustrative.

### 6.4 An animation keyframe track

```lino
bubble-in:
  animation
  (duration @motion.normal)
  (easing "cubic-bezier(0.2, 0, 0, 1)")  # quoted because it has parens
  (fill both)
  (keyframes
    (at 0 (opacity 0) (translate-y 8px) (scale 0.98))
    (at 0.6 (opacity 1))
    (at 1 (opacity 1) (translate-y 0) (scale 1)))
  (reduced-motion (duration 0ms))        # honours prefers-reduced-motion

typing-dots:
  animation
  (duration 1.2s)
  (iterations infinite)
  (tracks
    (track dot-1 (keyframes (at 0 (opacity 0.3)) (at 0.5 (opacity 1)) (at 1 (opacity 0.3))))
    (track dot-2 (delay 0.15s) (same-as dot-1))
    (track dot-3 (delay 0.3s) (same-as dot-1)))
```

`keyframes` is an ordered sequence of `(at offset props...)`. `tracks` lets one
animation drive several targets, which suits a timeline editor in the WYSIWYG
tool. Targets: CSS `@keyframes` / the Web Animations API, React Native
`Animated`, SwiftUI `keyframeAnimator` and Compose `keyframes`.

### 6.5 Open decisions for this sketch

- Should the kind be the first value (`save:\n  button`), or should the id
  carry it (`button.save:`)? The first keeps ids clean. The second makes
  queries such as "all buttons" a prefix match.
- Should `style` be inline, or always a reference to a named style link? The
  latter deduplicates better, can use deduplino, and maps better to doublets.
- Should a document be decoded through lino-objects-codec (typed) or through
  the core parser plus a schema (strings)? Both are viable. The schema route
  keeps one parser across all 8 languages.
