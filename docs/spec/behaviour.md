# Behaviour

## Handlers

An event handler is the multi-valued property `on`:

```lino
(save: button 'Save' (on press (emit save) (navigate home)))
```

- Its first value MUST be an event name (an atom such as `press`, `focus`,
  `hover`).
- Each further value MUST be an **action**: a link whose head is an action
  declared in [vocabulary.lino](vocabulary.lino). v0 declares:

  | Action                              | Meaning                          |
  | ----------------------------------- | -------------------------------- |
  | `(navigate <element-id or 'url'>)`  | go to an element or a quoted URL |
  | `(emit <event>)`                    | send a named event to the host   |
  | `(set <element-id> <property> <v>)` | set a property of an element     |
  | `(toggle <element-id> <property>)`  | flip a boolean property          |
  | `(focus <element-id>)`              | move keyboard focus              |

- Actions run in source order.
- An `on` property without an action, or with an action that is not a link,
  MUST give the error `invalid-handler`.
- An action head that is not declared MUST give the warning `unknown-action`;
  renderers MUST ignore such an action.

## Handlers are data, never code

Handlers are names and data. Implementations and renderers MUST NOT evaluate
any value as code (no `eval`, no `new Function`, no script injection, no
expression language). A quoted string such as `'alert(1)'` in a handler is
only a string and gives `invalid-handler` (fixture
`behaviour/handler-is-not-code`).

`navigate` targets are element ids or quoted URLs. Renderers MUST reject the
`javascript:` scheme, and v0 implementations MUST also reject `data:` and
`vbscript:`; such a target gives the error `unsafe-url` and the action is not
run (fixture `behaviour/unsafe-url`).

## Bindings

Bindings are **reserved** in v0 with the shape

```lino
(draft: text (bind value (param draft.text)))
```

`bind` names the bound property, then a `(param path)` reference. The
projection keeps the link as a property; its runtime meaning is defined by a
later version (#33 owns the behaviour runtime).

## Conditions and expressions

Conditional rendering (`when`), computed expressions and their relation to the
linksql substitution syntax are **deferred**; `when` is listed as a reserved
property name in the vocabulary. See [open-questions.md](open-questions.md).

Fixtures: `behaviour/`, `references/param-binding`.
