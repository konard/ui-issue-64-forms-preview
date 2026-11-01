# Tree projection

`links-notation` gives the same UI document three different shapes depending
on how it is written (measured with 0.27.1; see
[`experiments/issue-1/lino-parse-shapes.mjs`](../../experiments/issue-1/lino-parse-shapes.mjs)
and [`experiments/issue-11/dump.mjs`](../../experiments/issue-11/dump.mjs)):

| Written as                       | `parse()` returns                                                                                      |
| -------------------------------- | ------------------------------------------------------------------------------------------------------ |
| one line                         | one nested link `(ok: button (label OK) (on press (navigate home)))`                                   |
| several lines inside parentheses | one anonymous link holding the head and **path links**: `((ok: button) ((ok: button) (label OK)) ...)` |
| indented, without parentheses    | separate top-level links: `(ok: button)`, `((ok: button) (label OK))`, ...                             |

The multi-line expansion is the intended upstream behaviour: since
links-notation [#282](https://github.com/link-foundation/links-notation/issues/282)
a parenthesised group opens a nested context with the same line rules as the
file root.

The **tree projection** turns all three shapes into one element tree.
Implementations MUST produce byte-identical tree JSON for the three forms of
one document; the `shapes/` fixtures prove it.

## Path folding

Implementations MUST project `parse()` output by **path folding**:

- A **path link** is a link without an id whose first value is a link. Its
  first value is the **path** and the remaining values are the **payload**.
- A path names a node: an element head (`(ok: button)`, an element link with
  only its atom values), a property head (`(track opacity)`), or a path link
  made of them (`((ok: button) (on press))`), compared **structurally** (same
  ids, same values in the same order, recursively).
- If the path is structurally equal to an already-seen head or path, the
  payload values are appended, in order, to the node it names, using the
  normal rules of [elements.md](elements.md) (for an element) or as further
  values (for a property).
- If the path is not yet known but is itself an element head or a property
  head valid in the current context, it is first declared there (as a child
  element or property) and then receives the payload. This is how the
  anonymous wrapper of the multi-line form and of nested multi-line groups is
  read.
- Otherwise the path link is not foldable: it is kept verbatim in `unknown`
  with the warning `unknown-sublink`.

Element heads are looked up document-wide (element ids are unique). Property
heads are looked up only inside their own element, so `(label OK)` in two
buttons cannot collide.

`parseGroups()` MAY be used where an implementation offers it; the result
MUST be identical to path folding of `parse()`.

## Algorithm

```text
project(links):
  root := new document; known := empty map (structural key -> node)
  for link in links: place(root, link)
  return root

place(node, link):                        # node is an element, the root or a property
  if link is a path link (no id, first value is a link):
    path := first value of link
    target := lookup(node, path)          # local heads first, then document-wide
    if target is none: target := place(node, path)
    if target is none: keep link in node.unknown; warn unknown-sublink; return none
    for value in rest of link:
      created := place(target, value)
      remember (path value) -> created or target
    return target
  if node is a property: append value-json(link) to node.values; return none
  if link is an atom: append it to node.positional; return none
  if link has an id: return new child element (id, kind = first value, rest placed in it)
  head := first value of link
  if head is a declared property of node.kind: return new or replaced property
  if head is a registered kind: return new anonymous child element
  keep link in node.unknown; warn unknown-sublink; return none
```

The top-level root behaves as an element that accepts only elements.

## Worked example

The indented text

```lino
ok: button
  label OK
  on press
    navigate home
```

gives four links from `parse()`:

```lino
(ok: button)
((ok: button) (label OK))
((ok: button) (on press))
(((ok: button) (on press)) (navigate home))
```

Folding them:

1. `(ok: button)` declares the element `ok` of kind `button`.
2. `((ok: button) (label OK))` has the path `(ok: button)`, which is known; the
   payload `(label OK)` is a declared `button` property, so `ok` gets the
   property `label` with the value `OK`.
3. `((ok: button) (on press))` appends the property `on` with the value
   `press`, and remembers the path `((ok: button) (on press))` for that
   property.
4. `(((ok: button) (on press)) (navigate home))` has the known path
   `((ok: button) (on press))`; its payload `(navigate home)` is appended to
   the values of that `on` property.

The result equals the one-line form `(ok: button (label OK) (on press (navigate home)))`:

```json
{
  "id": "ok",
  "kind": "button",
  "positional": [],
  "properties": [
    { "name": "label", "values": ["OK"] },
    { "name": "on", "values": ["press", ["navigate", "home"]] }
  ],
  "children": [],
  "unknown": []
}
```

Fixtures: `shapes/button.*`, `shapes/form.*` (nested elements and several
actions), `shapes/track.*` (a multi-line property value),
`samples/document` and `samples/indented`.
