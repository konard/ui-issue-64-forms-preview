# Research: deep-foundation/deepcase and related UI repositories

Scope: the deepcase UI library, the deepcase-app shell, the "perception" second generation
(perception-imports / perception-app), the deepcase.github.io landing site and the 2025 rewrite
`deep-foundation/deep`. Gathered for [link-foundation/ui#1](https://github.com/link-foundation/ui/issues/1)
(associative UI framework fully representable in Links Notation, with themes that reproduce
classic UIs).

Sources were read via `gh api` and shallow, blob-filtered clones in `/tmp/research-ui/` (not
executed). All paths below are relative to the named repository's default branch.

---

## 1. Overview

| Repository                                                                                  | Role                                                                                     | Version / License                              | Stack highlights                                                                                   |
| ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| [deep-foundation/deepcase](https://github.com/deep-foundation/deepcase)                     | UI component library + deep package (`deep.json`)                                        | `@deep-foundation/deepcase` 0.0.135, Unlicense | Next.js 14 (peer), React 18, Chakra UI v2 + Emotion, framer-motion, Cytoscape, Monaco, Slate, rjsf |
| [deep-foundation/deepcase-app](https://github.com/deep-foundation/deepcase-app)             | Application shell (web, Capacitor Android/iOS, Electron, Chrome extension, Docker, Helm) | 0.1.0-beta.41, Unlicense                       | Next.js pages router, `@deep-foundation/deepcase`, `@deep-foundation/deeplinks`                    |
| [deep-foundation/deeplinks](https://github.com/deep-foundation/deeplinks)                   | Engine + `DeepClient`; owns `evalClientHandler`, `CatchErrors`, `_findHandler`           | Unlicense                                      | Hasura/GraphQL, Apollo, minilinks                                                                  |
| [deep-foundation/perception-imports](https://github.com/deep-foundation/perception-imports) | Second-gen UI library                                                                    | 0.0.140                                        | Chakra, `go` navigation API, Monaco + CodeMirror                                                   |
| [deep-foundation/perception-app](https://github.com/deep-foundation/perception-app)         | Second-gen shell (app shell itself is a handler)                                         | —                                              | declarative Cytoscape React wrapper, keyboard orientation                                          |
| [deep-foundation/perception-links](https://github.com/deep-foundation/perception-links)     | Intended package of perception links                                                     | empty repo (HTTP 409 on contents)              | —                                                                                                  |
| [deep-foundation/deepcase.github.io](https://github.com/deep-foundation/deepcase.github.io) | Landing/docs site                                                                        | —                                              | framer-motion 3D tilt "DeepFrame"                                                                  |
| [deep-foundation/deep](https://github.com/deep-foundation/deep)                             | 2025 rewrite                                                                             | Unlicense                                      | Next 15 app router, MUI 6 (dark), echarts + echarts-gl                                             |

Other dependencies of deepcase: recharts, amcharts5, d3 / d3-force-3d, react-d3-cloud,
aframe + aframe-forcegraph (3D, commented out), react-grid-layout, re-resizable, i18next,
react-icons, xterm, peerjs, emoji-picker-react, yandex-maps, react-hook-form.

Key paths (deepcase, `https://github.com/deep-foundation/deepcase/blob/main/` prefix):

- `imports/client-handler.tsx` — `ClientHandler`, `ClientHandlerRenderer`, `require` whitelist
- `imports/cyto/graph.tsx` — main Cytoscape graph component
- `imports/cyto/layouts.tsx`, `imports/cyto/stylesheets.tsx`, `imports/cyto/elements.tsx`
- `imports/cyto/react.tsx` — `CytoReactLayout` (React overlays synced to graph)
- `imports/cyto/opened.tsx` — opened-window model
- `imports/cyto/hooks.tsx` — cxtmenu commands (~L905-1065), handler-window header (~L640-710)
- `imports/cyto/menu.tsx` — top menu; `imports/cyto/traveler.tsx` — Traveler
- `imports/cyto/editor.tsx`, `imports/editor/editor-grid.tsx`, `imports/editor/editor-switcher.tsx`
- `imports/cyto-handler.tsx` — HandleCyto
- `imports/theme/theme.tsx`, `imports/switch-mode.tsx`, `imports/color-mode-toggle.tsx`
- `imports/deep-wysiwyg.tsx` — Slate editor
- `imports/hooks.tsx` — store hooks; `deep.json` — package links

deepcase-app: `pages/index.tsx`, `pages/client-handler.tsx`, `pages/editor.tsx`, `pages/card.tsx`,
`pages/component.tsx`, `pages/message.tsx`, `pages/cyber.tsx`.

Provider stack in deepcase-app `pages/index.tsx`:
`StaticProviders -> Provider(gqlPath) -> DeepNamespaceProvider -> MinilinksProvider -> DeepProvider -> Connector -> AutoGuest -> Content`.

---

## 2. Architecture: links-as-UI and client handlers

### 2.1 UI stored as links

A UI component is a **code link** plus **binding links**:

```
(handler: Handler clientSupportsJs -> tsxCodeLink)      # "this code runs in the browser"
(handleClient: HandleClient SomeType -> handler)        # "render links of SomeType with it"
```

- The code link (type `TSX`, `@deep-foundation/core`) holds a string value of the form
  `({deep, require}) => { const React = require('react'); ... return Component }`.
- `deep._findHandler({ handlerId, context })` (deeplinks `imports/client.tsx` ~L2277) queries the
  `handlers` table filtered by the JS execution provider. Without `handlerId` it matches a
  `@deep-foundation/deepcase` `Context` link among the context ids — i.e. handler choice is
  context-sensitive and itself a link query.
- `evalClientHandler` (deeplinks `imports/client-handler.tsx`) runs `eval(value)`, expects a
  function, calls it with `{deep, gql, require, ...input}`, and renders the returned component.
- `require` is a **whitelist map** (`r.list` in deepcase `imports/client-handler.tsx`) of
  packages: react, chakra, framer-motion, monaco, cytoscape, recharts, d3, etc. Heavier modules
  are resolved lazily through `DeepClient.resolveDependency`.
- `CatchErrors` is an error boundary that renders a Chakra `Alert` with a reset button.
  Perception replaces it with `ClientHandlerErrorComponent` (modal, src/dist toggle, FinderButton).
- `ClientHandlerRenderer` props: `fillSize`, `onClose`, `linkId`, `handlerId`, `context`.

### 2.2 Package-defined handlers (`deep.json` of deepcase)

| Handler                  | Bound to types                       |
| ------------------------ | ------------------------------------ |
| `asyncFileClientHandler` | AsyncFile (image/video/file preview) |
| `stringClientHandler`    | Join, PackageQuery, Contain          |
| `queryClientHandler`     | Query                                |
| `editorClientHandler`    | SyncTextFile, TSX                    |

Other types declared: `Traveler` (Any -> Query, symbol 🧳), `ContextToken`, `Context`.

### 2.3 HandleCyto — graph rendering as links

`@deep-foundation/handle-cyto` defines `HandleCyto`: a handler that returns Cytoscape `elements`
and `stylesheets` for links of a given type (`imports/cyto-handler.tsx`). Example:
`HandleCytoContainInvisible` hides Contain edges. Rules can be toggled per handler
(`useCytoHandlersRules`). So **per-type visual representation is data**, not code in the shell.

### 2.4 State stores

`@deep-foundation/store` provides one hook API over three backends:
`useQueryStore` (URL query, shareable), `useLocalStore` (localStorage), `useCookiesStore`.
Examples: `useSpaceId`, `useContainer` (query store); `layout`, `editor-tabs` (local store).

### 2.5 Perception (second generation)

- `perception-imports/imports/go.tsx` (927 lines): `GoI`, `GoProvider`, `useGo` — navigation as a
  chainable cursor (`go.focus`, `go.do`, `go.parents`) with `History` / `HistoryHandler` links.
- `perception-imports/imports/react-handler.tsx`: `ReactHandler`, `ReactHandlersProvider`,
  `createComponent` — handlers usable as plain React components.
- `perception-app/pages/index.tsx`: the **whole app shell is a handler** —
  `<go.Handler handlerId={deep.idLocal('@deep-foundation/perception-links','Layout')} Auth={...} Status={...} ColorMode={...}/>`.
  The shell supplies only slot components (auth slide-out panel, status indicator, color mode).
- Also: Telegram web-app script, regenerable `preloaded.json` (handlers bundled offline).

### 2.6 The 2025 rewrite (`deep-foundation/deep`)

Next 15 app router, MUI 6 dark theme (`src/theme.tsx`) with a **per-JS-value-type palette**
(`types.value/symbol/undefined/promise/boolean/string/number/bigint/set/weakSet...`, each with
main/light/dark), black canvas page rendering an echarts graph (`src/app/page.tsx`,
`src/components/echarts.js`).

---

## 3. Graph visualization

**Library:** Cytoscape via `react-cytoscapejs` (`imports/cyto/graph.tsx`).
Plugins: dagre, cola, d3-force, custom `cytoscape-deep-d3-force`, custom fork of cxtmenu
(`imports/cyto/cxtmenu.tsx`), edge-connections, edgehandles (drag to create links).

**Layouts** (`imports/cyto/layouts.tsx`, chosen in top menu, stored in local store `layout`):

| Layout                    | Parameters                                                                                    |
| ------------------------- | --------------------------------------------------------------------------------------------- |
| `deep-d3-force` (default) | manyBodyStrength -2000, linkDistance 100, alpha 0.8, `infinite: true` (continuous simulation) |
| `cola`                    | edgeLength = 100 + 10 \* connectedEdges                                                       |
| `dagre`                   | hierarchical                                                                                  |

**Encoding a link** (`imports/cyto/elements.tsx`): every link is a node; `from`, `to` and `type`
become separate edges from that node. Missing endpoints are auto-added as id-only nodes.
Label: `id\ntype:Name\nname:Name\nvalue(11 chars + "..." + 9 chars)\n\n symbol`; symbol from the
type's `Symbol` link, default 📍.

**Stylesheet** (`imports/cyto/stylesheets.tsx`):

| Selector             | Style                             |
| -------------------- | --------------------------------- |
| `.link-node`         | 30x30, white, label below         |
| `.link-from`         | edge, `tee` arrow                 |
| `.link-to`           | edge, triangle arrow              |
| `.link-type`         | dashed `[5,5]`, triangle arrow    |
| `:hover`             | underlay #0080ff                  |
| `.focused`           | border-width 4, blue.500          |
| `.query-link-*-node` | small 8px / 16px dots             |
| `:parent`            | compound nodes, gray, opacity 0.1 |

**Interactions**

- Radial context menu on node (`cxttapstart` / `taphold`), radius 108, activeFillColor
  `rgba(0,128,255,0.75)`: editor, unlock, delete, delete down, insert, update, login, space,
  container, traveler (n), readme. Core (background) menu: insert, center, query.
- Double click opens the type's handler as a floating window; drag positions get saved as Focus.
- Edgehandles: drag from a node to create a link (type picked afterwards).
- Traveler (`imports/cyto/traveler.tsx`): per-node sub-menu toggling query links that pull in
  neighbours: types, out, in, up, down, to, from, typed, all / by-type. A `Traveler` link points
  to an active `Query` contained in the space.
- Search (`MenuSearch`), "clear focuses", per-handler HandleCyto toggles.

**Perception graph** (`perception-app/imports/graph.tsx`): declarative React components
`<Graph>`, `<GraphNode>`, `<GraphEdge>`, `<GraphStyle>` over cytoscape, with
`cytoscape-node-html-label` (HTML labels in nodes), cola and dagre.

**Keyboard orientation** (`perception-app/imports/orientation.tsx`): `NavDirection` values
current, close, delete, edit-from, from, type, to, edit-to, out, typed, in, up, down, prev, next,
parents, contains, insert, value, results. Each has a left/up/right/down mapping — a spatial
keyboard map over link relations.

**3D**: aframe + aframe-forcegraph code exists but is fully commented out; 3D mode requested in
deepcase-app #159.

---

## 4. Windows / frames / tabs model

All window state is **links in the space**, so a layout is persistable and shareable:

| Concept                      | Representation                                                        |
| ---------------------------- | --------------------------------------------------------------------- |
| Space (workspace)            | a link id in URL (`useSpaceId`), "enter space" via radial menu        |
| Container (where inserts go) | link id in URL (`useContainer`)                                       |
| Node position                | `Focus` link (space -> link), value `{x, y}`; "unlock" deletes it     |
| Open window                  | `Opened` link (space -> link) from `@deep-foundation/deepcase-opened` |
| Which handler in the window  | `OpenedHandler` link (Opened -> Handler)                              |
| Visible neighbours           | `Traveler` -> `Query` links                                           |

- API: `useOpenedMethods()` in `imports/cyto/opened.tsx` -> `open(id, handlerId)`, `close(id)`,
  `isOpened(id)`.
- Windows are React overlays anchored to graph nodes: `CytoReactLayout`
  (`imports/cyto/react.tsx`) applies a CSS transform to a div synchronized with Cytoscape
  `pan zoom`, `render`, `add`, `layoutstop`, `data`, `position bounds` events.
- Window header (`imports/cyto/hooks.tsx` ~L640-710): handler picker popover
  (`CytoReactLinksCard`), "open in new full tab" button, close button.
- Full tab: `/client-handler?props={"linkId":..,"handlerId":..}` (deepcase-app
  `pages/client-handler.tsx`) renders any handler as a standalone page.
- Modal windows: editor (`CytoEditor`), packager (`PackagerInterface`: npm search + install /
  uninstall tabs), connector (local docker/engine portal).
- Top menu (`imports/cyto/menu.tsx`, framer-motion animated) — attached ButtonGroups:
  `auth <id> x`, `space <id> x`, `container <id> x`, copy token / paste token / login token,
  gql, editor; switches: autofocus, focus, opened, debug, types, traveler, breadcrumbs,
  cytoHandlers, animation; layout select; search; clear focuses; Travelers popover; CytoHandlers
  popover. Version text bottom-left; sun/moon toggle fixed top-right (`imports/switch-mode.tsx`).

---

## 5. Editors

1. **Code editor modal** — `CytoEditor` (`imports/cyto/editor.tsx`, 656 lines):
   - Tabs persisted in local store `editor-tabs` + active `editor-tab`; drafts in `editor-values`
     (500 ms debounce). `EditorTab` = `{id, saved, active, loading, initialValue}` with unsaved dot.
   - `EditorGrid` (`imports/editor/editor-grid.tsx`): two columns or VerticalSash split; left
     Monaco, right switchable area (`editor-switcher.tsx`): **Preview** (runs handler on the link,
     `fillSize` toggle), **Handlers** (which handlers bind this code), **Results** (handler/
     promise results). Language list `editor-lang-list`, TS diagnostics options.
2. **WYSIWYG** — `DeepWysiwyg` (`imports/deep-wysiwyg.tsx`): Slate with Mark buttons (bold,
   italic, underline, code) and Block buttons (h1/h2, quote, numbered/bulleted list, align),
   HTML (de)serialization via slate-serializers; `useStringSaver` writes the link's string value.
3. **Forms** — rjsf JSON-schema forms and react-hook-form for structured values.
4. **Graph editing** — insert / update / delete via radial menu and edgehandles.
5. **Perception editor** — Monaco plus CodeMirror (`@uiw/react-codemirror`) for mobile.

---

## 6. Theming

**deepcase theme** (`imports/theme/theme.tsx`): Chakra `extendTheme`, `cssVarPrefix: 'deepCase'`,
`initialColorMode: 'light'`.

| Token / color               | Light                                                 | Dark                |
| --------------------------- | ----------------------------------------------------- | ------------------- |
| body bg                     | gray.100                                              | cyDark `#141214`    |
| backgroundModal             | blue.50                                               | blue.900 `#19202B`  |
| editorPreviewBackgroundGrid | `#e5eefc`                                             | `#404040`           |
| primary                     | `#0080ff`                                             | `#0080ff`           |
| text                        | grayText `#3a3a3a`                                    | whiteText `#ebf8ff` |
| other                       | whiteBg `#fcfcfc`, gray.10 `#eee`, gray.900 `#111720` |                     |

Semantic tokens: text, borderColor, backgroundModal, buttonBackgroundModal, switchOn/Off,
editorPreviewBackground, editorPreviewBackgroundGrid, whiteGray, bgColor, siteBg.

**perception theme** (`perception-imports/imports/theme.tsx`): `initialColorMode: 'dark'`,
`useSystemColorMode: true`; `deep` palette 50 `#EBF8FF`, 100 `#BEE3F8`, 400 `#4299E1`,
600 `#2B6CB0`, 700 `#2C5282`, 800 `#1B2535`, 900 `#19202B`, 950 `#0000004d`; `danger` palette;
active `#00438F` (light) / cyan (dark); splash `#0D1117`; tokens deepBg, deepColor, deepBgHover,
deepBgActive, deepLine, deepLinkNodeBg; `ColorMode` button component.

**deep (2025)** (`src/theme.tsx`): MUI dark, neutral primary `#cccccc`, per-value-type colors
(value `#64B5F6`, symbol `#FFD54F`, undefined `#90A4AE`, promise `#4DB6AC`, boolean `#F06292`,
string `#81C784`, number `#7986CB`, bigint `#9575CD`, set `#4DD0E1`, ...), black canvas.

Graph colors live separately in Cytoscape stylesheets (not in Chakra tokens) — a source of
light/dark bugs (see section 10).

---

## 7. Classic UI versions worth reproducing as themes

1. **"DeepCase classic light" (0.1.0-beta, deepcase-app issue #76 screenshot)**
   - Full-screen pale gray-blue canvas (`#edf2f7`-like, Chakra gray.100); hundreds of small
     emoji nodes (⭐ Type, 📍 default, 🔥 Operation, 📎 Value, 🌲 Tree) with multi-line labels
     `75 / type:Type / name:Schedule`; thin gray edges with arrowheads.
   - Row 1: attached outlined button groups `auth 376 x | space 182 x | container 182 x |
copy token | paste token | gql | editor`; blue `packager` button top-right.
   - Row 2: switches autofocus (on, blue), focus, debug, types, promises, traveler, breadcrumbs;
     search input below; version `0.1.0-beta.2` bottom-left.
2. **"DeepCase dark + radial menu" (issue #299)** — `#141214` canvas, selected node white circle
   with blue ring and emoji avatar, large faded label `1044 type:User`, dark gray pie menu with
   rotated wedge labels (editor, traveler (0), container, space, login, update, insert,
   delete down, delete, unlock); blue active wedge.
3. **"DeepCase handler windows"** — floating Chakra cards anchored to nodes, header with handler
   picker / new tab / close; Monaco editor modal with tab strip and Preview/Handlers/Results.
4. **"Perception dark"** — `deep` palette (`#19202B`/`#1B2535`), cyan active, HTML labels inside
   nodes, keyboard-orientation navigation, slide-out auth panel, status dot.
5. **"deepcase.github.io landing"** — `DeepFrame` (`imports/deep-case-frame/deep-frame.tsx`):
   framer-motion spring tilt card (rotateX/rotateY +/-15 deg, perspective 450) with DeepCaseMini
   inside, play button, toggler; flying words, typist effect.
6. **"Deep 2025 echarts"** — black canvas, MUI dark, nodes colored by JS value type.
7. **"RTS / game mode"** (deepcase-app #116, #112, #114) — UI "inspired by RTS games",
   edge-scrolling, keyboard scroll, fullscreen; must be switchable back to "boring".
8. **"3D / VR force graph"** (#159, commented-out aframe-forcegraph code).

Each can be captured as a nested Links Notation theme: tokens (colors), graph style rules
(selector -> properties), chrome layout (which menus/rows/switches exist), interaction profile
(radial vs linear menu, mouse vs keyboard).

---

## 8. Patterns worth adopting (concrete)

1. **Type-bound renderers as links**: `HandleClient(Type -> Handler)`; renderer lookup is a
   query, so adding a renderer never touches the shell.
2. **Context-sensitive handler selection** via `Context` links (same link, different view per
   context: graph node, window, full tab, list row).
3. **Separate visual-in-graph handlers** (`HandleCyto`) from content handlers — two binding kinds:
   "how it looks as a node" vs "how it looks when opened".
4. **Window state as links**: `Opened(space -> link)` + `OpenedHandler(opened -> handler)`.
5. **Positions as links**: `Focus(space -> link) = {x, y}` — layout is data; unlock = delete.
6. **Workspace = link** (space) and **insertion target = link** (container), both in the URL.
7. **Traveler**: neighbourhood expansion as stored, toggleable queries (types/in/out/up/down/...).
8. **Overlay sync**: HTML windows positioned by graph pan/zoom transform (`CytoReactLayout`).
9. **Declarative graph DSL** (`<Graph><GraphNode/><GraphEdge/><GraphStyle/></Graph>`) — maps
   1:1 to nested Links Notation.
10. **Keyboard orientation map**: relation -> arrow-key direction table (`orientation.tsx`).
11. **One store API, three backends** (URL / local / cookie) — shareable vs private state.
12. **Semantic tokens with light/dark values** (Chakra semantic tokens, `cssVarPrefix`).
13. **Require whitelist** for user code and lazy dependency resolution.
14. **Error boundary per handler** with reset and source/dist view.
15. **Layout picker** with layout parameters as data (force, cola, dagre).
16. **Full-tab URL for any (link, handler) pair** — deep linking into any view.
17. **Editor = tabs + code + Preview/Handlers/Results**; drafts autosaved with debounce.
18. **WYSIWYG for string values** with HTML serialization.
19. **App shell itself as a handler** (perception `Layout` link with Auth/Status/ColorMode slots).
20. **Per-value-type color palette** (deep 2025) as a theme dimension.
21. **Link label template** (`id / type / name / value / symbol`) and **type Symbol** (emoji
    icon per type) as default node rendering.
22. **Radial context menu** for link operations; linear alternative for readability (#299).

---

## 9. Duplication candidates

| Duplicated thing                                | Locations                                                                                                             | Suggested single home                            |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| ClientHandler / evalClientHandler / CatchErrors | deepcase `imports/client-handler.tsx`, deeplinks `imports/client-handler.tsx`, perception-imports `react-handler.tsx` | one renderer core in link-foundation/ui          |
| Chakra theme                                    | deepcase `imports/theme/theme.tsx`, perception-imports `imports/theme.tsx`, deep `src/theme.tsx` (MUI)                | theme as Links Notation, adapters per toolkit    |
| Color mode toggle                               | `switch-mode.tsx`, `color-mode-toggle.tsx`, perception `ColorMode`                                                    | one component                                    |
| Graph wrapper                                   | deepcase `cyto/graph.tsx`, perception-app `imports/graph.tsx`, deep echarts                                           | one declarative graph DSL with renderer backends |
| Editor                                          | deepcase `cyto/editor.tsx`, perception-imports Editor (Monaco + CodeMirror)                                           | one editor component                             |
| Wysiwyg                                         | deepcase `deep-wysiwyg.tsx` and copies in other packages                                                              | one                                              |
| Platform shells                                 | deepcase-app and perception-app (Capacitor, Electron, Next)                                                           | one shell template                               |
| Stores                                          | `@deep-foundation/store` used plus ad-hoc localStorage in editor                                                      | one store API                                    |

---

## 10. Problems, bugs, limitations

Issue numbers: `#N` up to #85 without prefix = [deepcase issues](https://github.com/deep-foundation/deepcase/issues);
numbers marked "deepcase-app" or above #85 = [deepcase-app issues](https://github.com/deep-foundation/deepcase-app/issues).

**Architectural**

- `eval` of TSX strings: no sandbox, full DOM/network access; whitelist only limits `require`
  (deepcase #85 proposes renaming to "unsafe" handlers and adding safe ones).
- Handlers tied to React + Chakra + browser; no React Native / Swift / Kotlin path.
- Handler dependency resolution and paths (#60, #63, #64 `import.meta`), MUI in handlers (#72/#74).
- Graph styles live in Cytoscape stylesheets, outside theme tokens -> dark/light mismatches
  (#22 icons disappear in dark mode; deepcase-app #234/#80/#296 light-theme readability).
- No label LOD: tiny/overlapping text is rendered (#37, #47); no pagination (#36).
- Performance: too many re-renders (#65), slow/crashes after 24 h (#24), freezes/white screen
  (deepcase-app #226/#123), iPadOS nodes disappear (#235), edges disappear when moving (#320).

**Layout**

- d3-force with `infinite: true` is unstable and wanders (#51, #52, deepcase-app #269/#218/#191);
  cola cannot accept positions (#27); auto-place over the whole screen requested (#56);
  Any-Any link treated as node (#28).

**Windows**

- deepcase-app: z-index of handler window over modal (deepcase-app #290); handler not fully visible in preview
  (#297), handler not reopened / freeze with duplicate handlers (#282/#281); deepcase: handler
  link floats (#53), double click opens twice (#30); remember last opened handler (#292); draggable
  widget header requested (#198).

**Editor**

- State/tab bugs (deepcase-app #243, #238, #231, #178, #171, #170, #138, #137, #240), random
  links opened (#45), splitter not remembered (#54), code lost when switching tabs (#43),
  links unsorted (#84), no warn-before-update (#44), cannot set empty string (#35), clicking a
  code file runs it (#3).

**UX**

- deepcase-app: rotated radial menu text unreadable (#299); browser context menu conflicts (#57/#87/#95);
  search case / trailing space bugs (#110/#99/#245); drag & drop broken (#293).
- Requested: user-configurable themes (#300, #247) and backgrounds/animated handlers (#301),
  multilingual UI (#274), linear.app-style keyboard (#228), graph aggregation / filters / time
  sort / PNG-PDF export (#89, Linkurious/Ogma references), and in deepcase zoom-into-space (#82),
  return to last space (#83), pinning (#41), graphical undo/snapshots (#8), 3D (#159), voice/sounds (#155-#158).
- Build/OS: Vite/bun (#9/#10), many build/OS issues (deepcase-app #31-#41).

---

## 11. Migration notes for link-foundation/ui

1. **Replace eval'd TSX with Links Notation component trees.** A handler becomes a LiNo tree
   (element / props / children / bindings) interpreted by per-platform renderers (DOM, React,
   React Native, Vue, SwiftUI, Compose). Keep an explicit "unsafe code" escape hatch, sandboxed.
2. **Keep the binding links** (`HandleClient`, `HandleCyto`, `Context`) as LiNo relations:
   `(render: Type -> view)`, `(renderNode: Type -> nodeStyle)`, `(inContext: view -> context)`.
3. **Map theme tokens to LiNo theme links**: e.g.
   ```
   (theme deepcase-classic
     (mode light (bg gray.100) (primary #0080ff) (text #3a3a3a))
     (mode dark (bg #141214) (modal #19202B) (text #ebf8ff)))
   ```
4. **Map Cytoscape selectors to LiNo style rules**
   (`(style link-type (line dashed 5 5) (arrow triangle))`) so graph and chrome share tokens.
5. **Window/space state** (`Opened`, `OpenedHandler`, `Focus`, `Traveler`) maps directly to
   nested/tabbed LiNo documents — a saved workspace is just a LiNo file; this also gives
   animation recording (timestamped Focus/Opened changes) and undo snapshots (#8).
6. **Convert `deep.json` packages** (types, handlers, symbols) to LiNo; preserve type Symbols
   (emoji) as the default icon set.
7. **Chrome as data**: top menu rows, switches, radial menu items, keyboard orientation table —
   all declared in LiNo so classic themes (section 7) are reproducible configurations.
8. **Avoid inherited bugs**: bounded force simulation (stop/settle), label LOD, single z-index
   layer manager for overlays vs modals, editor state keyed by link id, horizontal radial labels
   with icons.
