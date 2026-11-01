# Research: konard/konard.github.io and konard/links-visuals

Source research for [link-foundation/ui#1](https://github.com/link-foundation/ui/issues/1).
Its goals are:

- an associative UI framework that is fully configurable and representable in Links Notation
- a DOM-like language
- animation recording
- a WYSIWYG configuration mode
- classic UIs available as themes
- bindings for JS, React/React Native, Vue, Swift and Kotlin
- public-domain assets

The two repositories were read from sparse, blob-filtered clones. Only the code was read; none of it was
executed. In the paths below, `K:` means `https://github.com/konard/konard.github.io/blob/main/` and `L:`
means `https://github.com/konard/links-visuals/blob/main/`.

---

## 1. Overview

### 1.1 konard/konard.github.io

- **Purpose.** A personal site with a CV, experience, repositories, research, blog, art and an associative
  stack. It has also become the testbed for a configurable UI. Issue #39 says so directly: _"all our UI
  elements must be owned by us ... We later once successfully make full configurability of our system will
  make our own UI configurable framework."_ That framework is link-foundation/ui.
- **Stack.**
  - React 19 and Vite 8, built as a multi-page app: each page is its own Vite entry and a real URL, with no
    client router ([K:src/pages/pages.js](https://github.com/konard/konard.github.io/blob/main/src/pages/pages.js),
    [K:vite.config.js](https://github.com/konard/konard.github.io/blob/main/vite.config.js)).
  - d3-force for layout.
  - `@fontsource` fonts: Orbitron, Electrolize, Chakra Petch, Share Tech Mono.
  - Testing: Vitest plus Testing Library, and Playwright suites per issue in `experiments/` that run on
    Chromium, Firefox and WebKit.
  - Linting and checks: eslint, prettier, secretlint, husky, ruff and shellcheck.
  - Requires Node 24 or later. Deployed to GitHub Pages by GitHub Actions.
- **License.** **None.** There is no LICENSE file and the GitHub API reports `license: null`. This blocks
  copying code into a public-domain framework until the author relicenses it. The sound engine and palettes
  are ported from konard/immortality, which is Unlicense.
- **Size.** About 372 MB. Most of it is `docs/case-studies/`, `dev/`, `ci-logs/` and `public/archive/`; the
  source is small. There are 24 issues, and #47 is open.
- **Key paths.**
  - Settings engine: [K:src/settings/](https://github.com/konard/konard.github.io/tree/main/src/settings)
    - `schema*.js`, `fields.js`, `store.js`, `apply.js`, `presets.js`
  - Owned controls: [K:src/components/](https://github.com/konard/konard.github.io/tree/main/src/components)
    - `Select.jsx`, `ColorInput.jsx`, `NumberInput.jsx`, `Tooltip.jsx`, `PrefSwitches.jsx`, `Sound.jsx`,
      `numericKeys.js`, `panelVisibility.js`, `edges.js`
  - Settings UI: [K:src/pages/SettingsPage.jsx](https://github.com/konard/konard.github.io/blob/main/src/pages/SettingsPage.jsx)
    - `Presets.jsx`, `InterfacePreview.jsx`, `UiSamples.jsx`, `CornerTiles.jsx`, `LinkSetting.jsx`
  - Links network engine: [K:src/links/](https://github.com/konard/konard.github.io/tree/main/src/links)
    - `configurations.js`, `edit.js`, `notation.js`, `glyph.js`, `placement.js`, `style*.js`, `render.js`,
      `export.js`, `collision*.js`, `solver-job.js`
  - Network editor: [K:src/pages/NetworkPage.jsx](https://github.com/konard/konard.github.io/blob/main/src/pages/NetworkPage.jsx)
    - `NetworkEditor.jsx`, `NetworkStyle.jsx`, `NetworkShare.jsx`, `NetworkGaps.jsx`, `useNetworkHistory.js`,
      `useCollisionSolver.js`
  - Canvas backgrounds: [K:src/visuals/](https://github.com/konard/konard.github.io/tree/main/src/visuals)
    - `nebula.js`, `stars.js`, `rain.js`, `beams.js`, `governor.js`, `size.js`
  - Sound: [K:src/sound/](https://github.com/konard/konard.github.io/tree/main/src/sound)
    - `engine.js`, `interactions.js`, `library.js`, `options.js`
  - i18n and prefs: [K:src/i18n/prefs.js](https://github.com/konard/konard.github.io/blob/main/src/i18n/prefs.js),
    `plural.js`
  - Skins:
    - [K:src/skins.frames.js](https://github.com/konard/konard.github.io/blob/main/src/skins.frames.js)
      generates `skins.frames.css` (1067 lines, about 84 KB)
    - `skins.glass.css`, `skins.liquid.css`, `skins.future.css`, `skins.materials.css`, `skins.palettes.css`,
      `ui.css`, `panels.css`
  - Line-limit guard: [K:scripts/check-file-line-limits.sh](https://github.com/konard/konard.github.io/blob/main/scripts/check-file-line-limits.sh)
    fails at 1500 lines and warns at 1350.

### 1.2 konard/links-visuals

- **Purpose.** A laboratory for drawing _one link_, and networks of links, as a single continuous curve
  where other links can point at a link's middle. This is the "blueprint" visual language that
  konard.github.io later adopted for its network glyphs.
- **Stack.**
  - Plain HTML pages plus ES modules in `js/`.
  - **D3 v7 is loaded at runtime** through `https://esm.sh/use-m`, as `use('d3')`.
  - SVG rendering with an optional Canvas mode.
  - A Bun `serve.ts` dev server.
  - Unit tests with `node --test`; e2e tests with Playwright / browser-commander.
- **License.** Unlicense ([L:LICENSE](https://github.com/konard/links-visuals/blob/main/LICENSE)), so it
  can be adopted directly. The repo is about 5.5 MB.
- **Key paths.**
  - Pages:
    - [L:index.html](https://github.com/konard/links-visuals/blob/main/index.html): one draggable link
    - [L:blueprint.html](https://github.com/konard/links-visuals/blob/main/blueprint.html): a 9-point spline blueprint
    - [L:animated-blueprint.html](https://github.com/konard/links-visuals/blob/main/animated-blueprint.html): IK bending and looping
    - [L:grid.html](https://github.com/konard/links-visuals/blob/main/grid.html): 1–64 links on an infinite grid
    - [L:draw.html](https://github.com/konard/links-visuals/blob/main/draw.html): freehand strokes become links
    - `H-fractal.html`, `fabrik.html`, `fabrik-horizontal.html`, `distance-constrained-blueprint.html`, `tests.html`
  - Modules in [L:js/](https://github.com/konard/links-visuals/tree/main/js):
    - `zoom-pan.mjs`, `grid.mjs`, `markers.mjs`, `blueprint-link.mjs`, `draw-link.mjs`, `ik-pure.mjs`,
      `ik.mjs`, `path.mjs`, `geometry.mjs`, `control-points.mjs`
    - `state.mjs`, `render-mode.mjs`, `canvas-render.mjs`, `hud.mjs`, `panels.mjs`, `sliders.mjs`,
      `animation.mjs`, `resize.mjs`, `svg-setup.mjs`, `constants.mjs`
  - History of earlier attempts: [L:docs/links-visuals-history.md](https://github.com/konard/links-visuals/blob/main/docs/links-visuals-history.md)
  - `failed-attempts/`: 76 HTML snapshots
  - Case studies: `docs/case-studies/issue-{15,21,27,28}`
  - 13 issues, all closed

---

## 2. Configurability model (konard.github.io)

This is the most mature part of the two repos and the strongest candidate for the core of link-foundation/ui.

1. **The schema is a list of sections of flat fields.**
   - Defined in [K:src/settings/schema.js](https://github.com/konard/konard.github.io/blob/main/src/settings/schema.js).
   - A section is `{id, column, title:{en,ru}, lead, fields, when(settings), tabs}`.
   - A field is created by a factory in [K:src/settings/fields.js](https://github.com/konard/konard.github.io/blob/main/src/settings/fields.js):
     - `range(key, d, min, max, step, label, extra)`
     - `toggle(...)`
     - `select(key, d, options, label)` with `option(value, en, ru)`
     - `color(...)`
   - Keys are dotted paths such as `liquid.blur`, `skin.name`, `ui.cornerTL`. They are already link-like
     (`section.key`) and would map one-to-one onto Links Notation doublets.
   - The sections are:
     - motion, nebula, stars, grid, beams, rain, sound
     - skins: glass, liquid, futuristic, materials, palettes, corners
     - ui: control sizes, borders, per-corner radii (−1 means "follow the skin"), menu size, slider track
     - theory: `theory.notation` chooses L→L² or R→R²
   - Split files: `schema.ui.js`, `schema.skins.js`, `schema.background.js`, `schema.layers.js`,
     `schema.materials.js`, `schema.sound.js`.
   - There are about 114 factory call sites; loops generate hundreds of fields, many of them script-only
     (`css:false`).
2. **One rule table.**
   - `RULES` maps each key to `{d, min, max, u, o, c}`: default, limits, unit, options, colour flag.
   - `CSS_RULES` is the subset that is projected into CSS.
   - `DEFAULTS` and `PREVIOUS_DEFAULTS` are exported.
   - [K:src/settings/schema.defaults.js](https://github.com/konard/konard.github.io/blob/main/src/settings/schema.defaults.js)
     holds `DEFAULT_LOOK`, the JSON the owner pasted in issue #45 ("That is defaults.").
3. **Normalization and migration.**
   - Lives in [K:src/settings/apply.js](https://github.com/konard/konard.github.io/blob/main/src/settings/apply.js).
   - `normalize(rules, stored)` clamps numbers, drops unknown options and validates `#rrggbb` colours.
   - It also migrates old values, for example `future.surface: 'transparent'` becomes a solid surface with
     opacity 0.
4. **Projection into the DOM, without the framework.** `applySettings(root, rules, settings)` writes:
   - numbers and colours as CSS variables on `<html>` (`liquid.blur` becomes `--liquid-blur: 18px`)
   - selects and toggles as `data-*` attributes (`skin.name` becomes `data-skin-name="glass"`)
   - derived values: corner-radius fallbacks, `--ui-accent-rgb`, an SVG `feTurbulence` noise data-URI, and
     `data-surface-invisible`

   All styling is then plain CSS that keys off these variables and attributes.

5. **Before-paint script.**
   - `normalize` and `applySettings` are serialized with `Function.toString` into `SETTINGS_SCRIPT`.
   - The `themeBeforePaint` Vite plugin prepends it into `<head>` together with `THEME_SCRIPT`
     ([K:vite.config.js](https://github.com/konard/konard.github.io/blob/main/vite.config.js)).
   - This avoids a flash of the wrong theme or skin, and it is the same code as at runtime, not a copy.
6. **Store.**
   - [K:src/settings/store.js](https://github.com/konard/konard.github.io/blob/main/src/settings/store.js)
     is built on `useSyncExternalStore`. It has no context provider.
   - **Only the diff from defaults** is stored, in localStorage `settings`. Users who never touched a key
     therefore get improved defaults automatically.
   - Other tabs stay in sync through the `storage` event.
   - API: `setSettings(patch)`, `resetSettings(keys)`, `changesOf`.
7. **Looks (presets).** Defined in [K:src/settings/presets.js](https://github.com/konard/konard.github.io/blob/main/src/settings/presets.js).
   - Built-in presets: Matrix universe (default), glass-universe, calm, matrix, deep-space, warp,
     neon (Tron), liquid, blueprint, and "Light and fast" for slow phones.
   - `before45()` rebases old presets onto `PREVIOUS_DEFAULTS`.
   - `COMFORT` lists keys that presets, shared links and Random never change:
     `motion.mode`, `sound.on`, `sound.volume`, `theory.notation`, `ui.transparency`. These are
     accessibility and preference keys; the idea comes from immortality's `src/settings.ts`.
   - `randomLook()` never goes above the default cost on any heavy key (counts, fps, blur, glow).
   - Saved looks are stored as `[{name, look}]` under `settings-presets`, with add, remove, import and rename.
   - Sharing: `#settings=<urlencoded JSON>` (`shareLink`, `lookOfHash`). When a shared link is opened,
     `openSharedLook()` applies it, saves the previous look as a "Before the link" preset, and strips the hash.
8. **Preferences outside the schema.** [K:src/i18n/prefs.js](https://github.com/konard/konard.github.io/blob/main/src/i18n/prefs.js)
   - Language is resolved as `?lang`, then the stored value, then `navigator`, then `en`.
   - Theme is auto/light/dark.
   - Each is a tiny external store.
   - All UI text is written inline as `{en, ru}` objects, and `plural.js` handles Russian plural forms.
9. **The network editor's local style model.** [K:src/links/style.js](https://github.com/konard/konard.github.io/blob/main/src/links/style.js)
   - `STYLE_SECTIONS` reuses the same field factories.
   - `normalizeStyle` validates; `styleToParams` and `styleFromParams` put **only non-default values in the
     query string**.
   - There are six link palettes: site, neon, pastel, warm, cold, print.
   - The network uses the same configuration grammar as the site settings, but it is scoped to a document
     (the URL) instead of the user (localStorage).
10. **Settings page as live designer.** [K:src/pages/SettingsPage.jsx](https://github.com/konard/konard.github.io/blob/main/src/pages/SettingsPage.jsx)
    - The page is generated from the schema. Each row is `label | control | value | ↺ reset`, and changed
      rows get an `is-changed` class.
    - Layer tabs show a dot when that layer is active.
    - There is a Reset button per section plus "Reset everything".
    - "Look at the background" is a peek mode that hides the panels.
    - The "Your changes" box shows the diff JSON with Copy, and has a paste area that loads either settings
      or `{presets:[...]}`.
    - Sounds have ▶ preview buttons.
    - The page itself is the preview: it includes `InterfacePreview`, `UiSamples` (small samples of every UI
      element, from #45), `MaterialPresets` and `CornerTiles`.
    - Columns are explicit because CSS multicol was buggy in Safari.
    - This is the closest existing thing to the "VS-designer configuration mode" the issue asks for, though
      it edits global tokens, not per-element instances.
11. **Testing every setting.** Issue #15 asked for proof that every setting is applied.
    [K:src/settings/applied.test.js](https://github.com/konard/konard.github.io/blob/main/src/settings/applied.test.js)
    goes through every field in `FIELDS` and fails if a setting is used in none of three ways: as a CSS
    variable or `<html>` attribute that a stylesheet reads, as an option a background script reads, or as a
    key a component reads.
12. **Skins and frames.**
    - [K:src/skins.frames.js](https://github.com/konard/konard.github.io/blob/main/src/skins.frames.js)
      defines corner shapes and corner lines once:
      - shapes: square, cut, tall, wide, round, scoop, notch
      - lines: none, gap, line, accent, bracket
    - `npm run build:frames` generates `skins.frames.css` from it, and the same definitions draw the
      `CornerTiles` previews. A test keeps the generated CSS in sync.
    - The CSS uses `@property` typed lengths and `:where()` to keep specificity at zero.
    - `schema.skins.js` has 12 palettes (from immortality) and the skins `glass`, `liquid`, `futuristic`.
    - Owner requirements from issues:
      - #39: a single transparency setting for all backgrounds; matte, glossy and liquid glass presets; no
        rounded corners in the futuristic look by default; rounded corners following t3code practice
      - #45: one per-side border configuration shared by panels, blocks, buttons and other elements; top
        highlight width set separately from corner/side widths; the corner layer above or below content;
        colours picked from palettes

---

## 3. Visualizations

### 3.1 Single link (links-visuals)

| Page                                                                                                                         | What it shows                                                                                                     | Tech / notes                                                                                                                             |
| ---------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| [index.html](https://github.com/konard/links-visuals/blob/main/index.html)                                                   | A diagonal line with a cross (source) and an arrow (target), draggable endpoints, fullscreen, a coordinates panel | D3 + SVG markers                                                                                                                         |
| [H-fractal.html](https://github.com/konard/links-visuals/blob/main/H-fractal.html)                                           | Recursive H subdivision with straight arrows                                                                      | Recursion demo                                                                                                                           |
| [blueprint.html](https://github.com/konard/links-visuals/blob/main/blueprint.html)                                           | A configurable link spline with 9 control points (start, p1–p3, center, p4–p6, end) on a grid                     | `path.mjs` converts Catmull-Rom to cubic. Points are colour-coded: start green, end red, center black, others blue. Dashed `4 2` outline |
| [distance-constrained-blueprint.html](https://github.com/konard/links-visuals/blob/main/distance-constrained-blueprint.html) | Fixed segment lengths                                                                                             | Constraint experiment                                                                                                                    |
| [fabrik.html](https://github.com/konard/links-visuals/blob/main/fabrik.html), `fabrik-horizontal.html`                       | FABRIK inverse kinematics                                                                                         | IK experiment (Freya Holmér and argonaut are credited in the README)                                                                     |
| [animated-blueprint.html](https://github.com/konard/links-visuals/blob/main/animated-blueprint.html)                         | IK-driven bending and looping animation                                                                           | `ik-pure.mjs` uses a pure constant-curvature sweep solver with `IK_SEG_COUNT=4`                                                          |
| [tests.html](https://github.com/konard/links-visuals/blob/main/tests.html)                                                   | Gallery of geometry cases                                                                                         | `test-cases.mjs`                                                                                                                         |

Markers ([L:js/markers.mjs](https://github.com/konard/links-visuals/blob/main/js/markers.mjs)):

- The cross and arrow use `viewBox 0 0 100 100` and `markerUnits="strokeWidth"`, so they scale with the line.
- Their proportions use the golden ratio.
- They are hardcoded black.

### 3.2 Networks (links-visuals)

- [grid.html](https://github.com/konard/links-visuals/blob/main/grid.html)
  - 1–64 coloured links placed on grid cells, with a link-count slider, Reset and snapping.
  - Proportions are shared with single-link mode through `blueprint-link.mjs` (fixed in #23 and #28).
- [draw.html](https://github.com/konard/links-visuals/blob/main/draw.html)
  - Freehand input through Pointer Events: Apple Pencil, touch and mouse, with `touch-action:none`.
  - A stroke is simplified into a link whose center is the 50% arc-length point.
  - An endpoint dropped near another link's center snaps and pins to it. Pins are re-resolved at render time
    by `applyCenterAnchors`, so links follow when their target moves.
  - Select and Draw modes; links persist in localStorage (#27).
- Infinite grid ([L:js/grid.mjs](https://github.com/konard/links-visuals/blob/main/js/grid.mjs)): SVG
  `pattern` tiles of minor and major lines over a 1e6-sized rect (#15).
- Zoom and pan ([L:js/zoom-pan.mjs](https://github.com/konard/links-visuals/blob/main/js/zoom-pan.mjs))
  - The wheel zooms about the pointer with factor `0.999^delta`, scale 0.1–20.
  - Listeners sit on `document`, which fixed the "zoom does not work far from the center" bugs (#19, #21).
  - `?debug=zoom` turns on a debug overlay.
- [L:docs/links-visuals-history.md](https://github.com/konard/links-visuals/blob/main/docs/links-visuals-history.md)
  surveys earlier attempts:
  - LinksPlatform web UI prototypes; doublet and triplet circle symbols
  - Cytoscape issue #1217 (edges to edges), declined, and its compound-node workarounds
  - GoJS label nodes; dmx cytoscape-edge-connections
  - Deep.Case Cytoscape (link node plus from/to edges) and A-Frame 3D
  - DeepVisual (Python); doublets-web SVG; react-deep-tree

  It ends with the open goal: _"stable identity, arbitrary source/target references, self-reference and
  cycles, understandable recursive structure, and layout that stays readable as links move."_

### 3.3 Networks as symbols (konard.github.io)

- **Encoding.** [K:src/links/configurations.js](https://github.com/konard/konard.github.io/blob/main/src/links/configurations.js)
  - A doublet network of N links (plus the 0 link meaning "nothing") is written as 2N digits in base N+1,
    for example `01 20`. With more than 9 links it is written as `s,t;s,t`.
  - Functions: `decode`, `encode`, `codeAt`, `indexOf` (BigInt), `randomCode`, `mathNotation` (subscripts),
    `linksNotation` (gives `(1: 0 1)`).
  - Classes up to relabelling are counted with Burnside's lemma (`classCount`, `representatives`), and there
    is a "real references only" mode.
- **Five editable notations that stay in sync.** These are in `Notations` in
  [K:src/pages/NetworkEditor.jsx](https://github.com/konard/konard.github.io/blob/main/src/pages/NetworkEditor.jsx):
  - theory notation, e.g. `λ = {1 ↦ (0, 1)}`, in L→L² or R→R² form ([K:src/links/notation.js](https://github.com/konard/konard.github.io/blob/main/src/links/notation.js))
  - pairs
  - the N-ary number, e.g. `0120₃`
  - its decimal index
  - Links Notation

  The parsers are in [K:src/links/edit.js](https://github.com/konard/konard.github.io/blob/main/src/links/edit.js)
  and return bilingual errors. While the user types, the text stays as typed and the other notations follow.

- **Glyph.** [K:src/links/glyph.js](https://github.com/konard/konard.github.io/blob/main/src/links/glyph.js)
  - Each link is one cubic-Bézier curve: a bar at the source, a middle, and an arrow at the target. This is
    the links-visuals blueprint.
  - Other links refer to a link by touching its middle.
  - A reference to 0 is a free end; a self-reference is a loop, so `(1: 1 1)` renders as ∞.
  - Constants: `SIZE=100`, `STROKE=2.4`, a 9-colour palette.
  - Markers: bar, arrow, triangle, tail, dot, circle, square, diamond, none.
  - `SHAPE` options: placement, order, frame, forces, rotation, spread, padding, bendMode, and more.
- **Placement.** [K:src/links/placement.js](https://github.com/konard/konard.github.io/blob/main/src/links/placement.js)
  offers circle, square grid, hex, dice, playing card, spiral, and d3-force.
- **Overlap reduction.**
  - `collisions.js`, `collision-gaps.js` and `collision-symmetry.js` add spacing automatically.
  - The work runs in a cancellable Web Worker (`collision-worker.js`, `solver-job.js`).
  - [K:src/pages/useCollisionSolver.js](https://github.com/konard/konard.github.io/blob/main/src/pages/useCollisionSolver.js)
    keys each result so a stale one never replaces a newer drawing.
- **Render and export.**
  - [K:src/links/render.js](https://github.com/konard/konard.github.io/blob/main/src/links/render.js):
    `networkSvg` builds one standalone SVG string. It is used for the on-screen preview _and_ every export.
    XML is escaped and values are normalized. It supports solid, linear and radial backgrounds, a card, and
    captions in the chosen notation.
  - [K:src/links/export.js](https://github.com/konard/konard.github.io/blob/main/src/links/export.js)
    exports:
    - SVG, plus PNG, JPEG and WebP by rasterizing on a canvas
    - a `.lino` file (Links Notation)
    - clipboard copies of text and images
    - the Web Share API and social share URLs
- **Editor page.** [K:src/pages/NetworkPage.jsx](https://github.com/konard/konard.github.io/blob/main/src/pages/NetworkPage.jsx)
  - URL: `/network/?code=…&<non-default style params>`, with `DEFAULT_CODE='11 22 12'`.
  - Sections: Notations, Links (a table plus per-link cards for colour, turns and gaps), Style, Share.
  - `useNetworkHistory.js` keeps debounced URL history and pauses it while a slider is being dragged.
    `localStorage network.debug` enables debugging.
  - The gallery is at `/art/#symbols` (`NetworkGallery.jsx`).
- **Other data visuals.** These are hand-built SVG/React components:
  - `ContributionCalendar`, `ContributionsChart`, `LanguagesChart`, `LanguageCloud`, `StatTiles`, `Timeline`
  - `EcosystemMap` (an orbit diagram), `ProblemSolvingDiagram`, `MetaTheory`, `Cosmos`, `LiquidRefraction`
- **Animated backgrounds.** [K:src/visuals/](https://github.com/konard/konard.github.io/tree/main/src/visuals)
  - Layered canvases: nebula, stars, beams, and rain (a "digital rain" of link glyphs).
  - [K:src/visuals/governor.js](https://github.com/konard/konard.github.io/blob/main/src/visuals/governor.js)
    is an FPS governor. It lowers resolution first and then fps, and never raises them again
    (`SLOW_GAP` 45 ms, `MIN_SCALE` 0.4).

---

## 4. Components inventory

### 4.1 konard.github.io: owned controls (candidates for framework primitives)

| Component                                                      | File                                                                                                                          | Notable behaviour                                                                                                                                         |
| -------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Select                                                         | [K:src/components/Select.jsx](https://github.com/konard/konard.github.io/blob/main/src/components/Select.jsx)                 | Portal popup; WAI-ARIA APG listbox keyboard handling with typeahead; size taken from the `ui.menuHeight` and `ui.menuWidth` settings                      |
| ColorInput                                                     | [K:src/components/ColorInput.jsx](https://github.com/konard/konard.github.io/blob/main/src/components/ColorInput.jsx)         | Hex field, RGB chooser and palettes (`colorPalettes.js`); portaled popup kept inside the viewport                                                         |
| NumberInput                                                    | [K:src/components/NumberInput.jsx](https://github.com/konard/konard.github.io/blob/main/src/components/NumberInput.jsx)       | Stepping through `numericKeys.js`                                                                                                                         |
| numericKeys                                                    | [K:src/components/numericKeys.js](https://github.com/konard/konard.github.io/blob/main/src/components/numericKeys.js)         | Arrow keys, PageUp/PageDown, Home/End, Shift for ×10; Safari focus fix; shared by sliders and number fields                                               |
| Tooltip                                                        | [K:src/components/Tooltip.jsx](https://github.com/konard/konard.github.io/blob/main/src/components/Tooltip.jsx)               | Owned tooltip                                                                                                                                             |
| PrefSwitches                                                   | [K:src/components/PrefSwitches.jsx](https://github.com/konard/konard.github.io/blob/main/src/components/PrefSwitches.jsx)     | Language and theme segmented switches                                                                                                                     |
| Sound                                                          | [K:src/components/Sound.jsx](https://github.com/konard/konard.github.io/blob/main/src/components/Sound.jsx)                   | Sound toggle and volume                                                                                                                                   |
| Glyph                                                          | [K:src/components/Glyph.jsx](https://github.com/konard/konard.github.io/blob/main/src/components/Glyph.jsx)                   | Renders a network code as an icon; each page has a glyph code in `pages.js`                                                                               |
| Layout                                                         | [K:src/components/Layout.jsx](https://github.com/konard/konard.github.io/blob/main/src/components/Layout.jsx)                 | Shared frame: cosmic background, top navigation, footer settings link; imports all skin CSS and fonts                                                     |
| Section, PageCards, StatTiles, Timeline, RepoList              | `src/components/`                                                                                                             | Content blocks                                                                                                                                            |
| edges.js                                                       | [K:src/components/edges.js](https://github.com/konard/konard.github.io/blob/main/src/components/edges.js)                     | Horizontal scroll lists fade at an edge (`data-more`) and centre the `aria-current` item                                                                  |
| panelVisibility.js                                             | [K:src/components/panelVisibility.js](https://github.com/konard/konard.github.io/blob/main/src/components/panelVisibility.js) | IntersectionObserver plus MutationObserver keep only on-screen `backdrop-filter` panels live                                                              |
| LinkSetting, Presets, InterfacePreview, UiSamples, CornerTiles | `src/pages/`                                                                                                                  | Pieces of the designer                                                                                                                                    |
| Sound engine                                                   | [K:src/sound/engine.js](https://github.com/konard/konard.github.io/blob/main/src/sound/engine.js)                             | Web Audio chain: tone shelf, compressor, convolution reverb; random detune; panning follows the pointer; `AudioContext` created only after a user gesture |
| Sound mapping                                                  | [K:src/sound/interactions.js](https://github.com/konard/konard.github.io/blob/main/src/sound/interactions.js)                 | Document-level listeners map element roles to sounds; a `data-sound` attribute overrides the default                                                      |

### 4.2 links-visuals: modules

| Module                                                                       | Role                                                                                    |
| ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `zoom-pan.mjs`                                                               | Pivot zoom and pan with document-level listeners                                        |
| `grid.mjs`                                                                   | Infinite pattern grid with minor and major lines                                        |
| `markers.mjs`                                                                | Cross and arrow SVG markers that scale with the stroke                                  |
| `blueprint-link.mjs`                                                         | Shared link proportions and control-point colours                                       |
| `path.mjs`, `geometry.mjs`, `control-points.mjs`                             | Spline maths                                                                            |
| `ik-pure.mjs`, `ik.mjs`                                                      | Pure IK solver and its adapter                                                          |
| `draw-link.mjs`                                                              | Stroke simplification, arc-length center, center anchors                                |
| `hud.mjs`, `panels.mjs`, `sliders.mjs`                                       | Coordinates HUD; a ☰ toggle that hides the HUD and config panel; offset sliders        |
| `render-mode.mjs`, `canvas-render.mjs`                                       | Switch between SVG and Canvas, plus the Canvas re-implementation                        |
| `state.mjs`, `animation.mjs`, `resize.mjs`, `svg-setup.mjs`, `constants.mjs` | Shared state, rAF loop, sizing, setup; geometry expressed as fractions of `gridSpacing` |

---

## 5. Patterns worth adopting

1. **One rule table per key**: `{default, min, max, unit, options, isColor}`. It drives normalization,
   validation, the generated UI, CSS projection and tests. It translates naturally into a Links Notation
   schema, e.g. `(liquid.blur: range 18 0 40 px)`.
2. **Store the diff from defaults, never the full state.** Defaults can then improve for everyone, and saved
   looks and share links stay small.
3. **Project settings into CSS variables and `data-*` attributes on the root.** Theming then works without
   any framework, and the same tokens can be emitted for SwiftUI and Compose as constant tables.
4. **Run the same `normalize` and `apply` before first paint**, serialized from the real functions rather
   than copied. There is no theme flash and no second implementation.
5. **Comfort keys.** Accessibility and preference keys (reduced motion, sound, volume, transparency,
   notation) are excluded from presets, shared links and randomization.
6. **Looks as data.** Built-in presets, saved presets, import/export JSON, `#settings=` share links, and an
   automatic "Before the link" backup when a shared look is applied.
7. **Bounded randomization.** `randomLook()` never exceeds the default cost on heavy keys, so Random is safe
   on slow devices. There is also an explicit "Light and fast" preset.
8. **The settings page is the live preview.** Each row has a per-field ↺ reset and changed rows are marked.
   There are section resets, a peek mode, a diff box with copy and paste, and sample tiles of every UI
   element. Extending this to per-element editing gives the WYSIWYG configuration mode.
9. **One source generates both CSS and preview tiles** (`skins.frames.js`), and a test fails if the
   generated CSS is out of date.
10. **One renderer for preview and export.** A single SVG string (`networkSvg`) is reused for PNG, JPEG and
    WebP export, so what is shared is exactly what is seen. The same idea fits animation recording: record
    the frames of the model, not screenshots.
11. **URL state holds only non-default parameters** (`styleToParams`), with debounced history that pauses
    while a slider is dragged.
12. **Several synchronized notations of one model**, with typed-text preservation and bilingual errors. This
    shows the framework's "DOM-like language and Links Notation as two views of one tree" in miniature.
13. **Expensive layout in a cancellable worker**, with keyed results that cannot overwrite newer state
    (`solver-job.js`, `useCollisionSolver.js`).
14. **Performance governors.** The FPS governor degrades resolution and then fps, and `panelVisibility.js`
    limits live `backdrop-filter` surfaces. Both belong in the framework runtime.
15. **Owned, ARIA-compliant controls.** Select follows the APG patterns, numeric keys are shared, and popups
    are portaled and clamped to the viewport. #39 says "all UI elements must be owned by us".
16. **Declarative sound.** A `data-sound` attribute on any element plus document-level role mapping, so
    components do not hard-code audio.
17. **Language and theme stores built on `useSyncExternalStore`, with no provider.** This ports cleanly to
    signals or observables in Vue, Swift and Kotlin.
18. **Pointer-centred zoom with document-level listeners** and an infinite pattern grid (links-visuals #15,
    #19, #21). These are designer-canvas basics.
19. **Arc-length center anchors for links that point at links.** An anchor is pinned and re-resolved at
    render time (`applyCenterAnchors`), which is the core of drawing associative links, not just node graphs.
20. **Pure geometry and IK separated from rendering** (`ik-pure.mjs`), so they can be unit-tested and ported
    to Swift and Kotlin.
21. **A test suite per issue** (`*-NN.test.js`, `experiments/issue-N-browser.mjs` on three browser engines),
    a case study per issue, and a hard 1500-line file limit.

---

## 6. Duplication candidates (move into link-foundation/ui)

| Concern                                                                        | Current location(s)                                                      | Proposed framework module                                                              |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| Settings schema, field factories, normalize/apply, store, presets, share links | K:src/settings/\*; the `COMFORT` idea from immortality `src/settings.ts` | `config` core: language-neutral schema plus adapters for JS, React, Vue, Swift, Kotlin |
| Field factories reused for the network style                                   | K:src/links/style.js reuses fields.js                                    | Same `config` core with scopes: user (storage) and document (URL or `.lino`)           |
| Select, ColorInput, NumberInput, Tooltip, switches, numericKeys                | K:src/components/\*                                                      | `controls` package                                                                     |
| Palettes (12 skins, 6 link palettes, colour chooser palettes)                  | `schema.skins.js`, `style.js`, `colorPalettes.js`, immortality           | `themes/palettes`                                                                      |
| Skins and corner frames generator                                              | `skins.frames.js` and `skins.*.css`                                      | `themes`: classic UIs become additional skins                                          |
| Sound engine and interaction mapping                                           | K:src/sound/\* (ported from immortality `src/sound.ts`)                  | `sound` package                                                                        |
| Canvas backgrounds and FPS governor                                            | K:src/visuals/\*                                                         | `effects` package with `governor` in the runtime                                       |
| i18n `{en,ru}` objects, plurals, language and theme prefs                      | K:src/i18n/\*, inline in every component                                 | `i18n` with message catalogs, ideally in Links Notation                                |
| Link geometry, glyph, markers, placement, collisions                           | K:src/links/_ **and** L:js/_ (the same blueprint idea implemented twice) | `links-view`: a single renderer for one link and for networks                          |
| Notation parsers and encoders                                                  | K:src/links/edit.js, configurations.js, notation.js                      | Use the official `links-notation` package; keep the code/index maths as a utility      |
| Export (SVG, rasters, `.lino`, clipboard, share)                               | K:src/links/export.js                                                    | `export` utility, reused by animation recording                                        |
| Zoom/pan, infinite grid, HUD, panel toggle                                     | L:js/zoom-pan.mjs, grid.mjs, hud.mjs, panels.mjs                         | `canvas` primitives for the designer surface                                           |
| SVG markers and their Canvas re-implementation                                 | L:js/markers.mjs, canvas-render.mjs; K:glyph.js MARKERS                  | One marker definition rendered by both back ends                                       |
| Inline per-page CSS (navy translucent panels)                                  | Every L:\*.html page                                                     | One theme stylesheet                                                                   |

---

## 7. Problems, bugs and limitations observed

### konard.github.io

1. **No license.** The code cannot legally be copied into a public-domain framework until it is relicensed
   (for example to Unlicense, like links-visuals and immortality).
2. **Links Notation is hand-parsed.** `parseLinks` in `edit.js` uses the regex
   `/\(\s*(?:(\d+)\s*:)?\s*(\d+)[\s,]+(\d+)\s*\)/g`, and `links-notation` is not imported anywhere in `src/`.
   It only accepts numeric doublets and does not handle nesting, names or multi-line input.
3. **Settings are JSON, not Links Notation.** This applies to localStorage, the `#settings=` hash, the
   diff box, and import/export. It contradicts the framework goal of representing everything in Links
   Notation.
4. **Bilingual text is hard-coded** as `{en, ru}` objects inside components, including long templated
   sentences in `NetworkEditor.jsx`. Adding a language means editing every component; there is no catalog.
5. **Configuration is global only.** The tokens style every element of a kind. There is no per-instance
   override and no element tree to select from, so it is not yet a WYSIWYG designer.
6. **React-bound.** The store, pages and controls are React components; only `apply.js` and `src/links/*`
   are framework-free.
7. **Open issue #47.** The top-left corner and the top and bottom edges are not transparent by default,
   although every other element is. These are still border/corner layering bugs from the #45 redesign.
8. **Fixed bugs worth remembering.**
   - #13: the rain sometimes scaled up too much on refresh.
   - #45: some border configurations clipped overflowing content or broke transparent backgrounds and
     selection.
   - CSS multicol was unreliable in Safari, so columns are explicit.
   - Safari needed a focus fix in `numericKeys.js`.
9. **Heavy generated CSS.** `skins.frames.css` is about 84 KB / 1067 lines, and a very large number of
   fields (hundreds) costs payload and maintenance.
10. **Repo weight.** About 372 MB, from case studies, logs and archives committed to the repo, so it is
    slow to clone. Sparse clones are needed.
11. **Migrations are ad hoc** (`before45()`, special cases in `normalize`). There is no versioned schema
    migration mechanism.

### links-visuals

1. **CDN at runtime.** D3 is fetched from `esm.sh/use-m` on every load. It does not work offline, it is
   unpinned and therefore a supply-chain risk, and it is not reproducible.
2. **Global mutable state** in `state.mjs` (module singletons with setters). Two views cannot share a page.
3. **Duplicated renderers.** `canvas-render.mjs` re-implements the SVG markers and paths by hand, and the
   two can drift apart.
4. **A rAF loop runs every frame even when idle** (`animation.mjs`), which wastes battery.
5. **Inline CSS is copied into every HTML page**, with no theming. Markers are hardcoded black, and only
   grid.html and draw.html have colour.
6. **Experiments are not composable.** Each page wires modules differently, and `failed-attempts/` holds 76
   HTML snapshots instead of git history.
7. **Limits of the network model.** grid.html places links in cells without real references. Only draw.html
   has link-to-link anchors, and only to centers (no source/target-to-endpoint semantics, no layout engine).
8. **Fixed bugs worth remembering.**
   - #1/#3: start-point snapping.
   - #15: the grid was not infinite.
   - #19/#21: zoom failed away from the center because the hit area was the SVG; listeners were moved to
     `document`.
   - #23/#28: grid proportions were inconsistent with single-link mode.

---

## 8. Migration notes for link-foundation/ui

1. **Licensing first.** links-visuals is Unlicense and can be ported now. For konard.github.io, ask the
   owner to add an Unlicense LICENSE before any code is moved. The sound engine and palettes are already
   Unlicense through immortality.
2. **Schema in Links Notation.** Express each RULES entry as links, for example:
   ```
   (liquid.blur: (type range) (default 18) (min 0) (max 40) (unit px))
   (skin.name: (type select) (default glass) (options glass liquid futuristic))
   ```
   Then generate the JS and TS rule tables, and the Swift and Kotlin constants, from it. Store user diffs as
   Links Notation too: `(liquid.blur 24)`. Keep JSON import for backward compatibility with existing
   `settings` and `settings-presets` values and `#settings=` links.
3. **Keep the projection contract.** Write `--section-key` CSS variables and `data-section-key` attributes,
   and keep the before-paint injection for web targets. Native targets get the same normalized map as an
   observable store.
4. **Scopes.** Keep the user/document split (localStorage vs URL or `.lino`), and add an element scope so the
   designer mode can override tokens per node in the DOM-like tree.
5. **Controls.** Port Select, ColorInput, NumberInput, Tooltip and numericKeys with their tests (`*.test.jsx`)
   as the first `controls` set. Keep WAI-ARIA APG behaviour and the Safari fixes.
6. **Links view.** Merge the K:src/links glyph, placement, collisions and render code with the L:js
   zoom-pan, grid, anchors and IK into a single renderer:
   - one marker set, with SVG and Canvas back ends generated from it
   - no global state; instance objects instead
   - D3 bundled and pinned, or dropped where `d3-force` alone is enough
   - an idle-stopping animation loop
7. **Parsing.** Replace the regex parser with the official `links-notation` package. Keep `configurations.js`
   (code and index maths, Burnside counting) as a pure utility.
8. **i18n.** Move the `{en, ru}` literals into per-language catalogs keyed by id, preferably in Links
   Notation, and keep `plural.js` rules per language.
9. **Themes.** Treat `glass`, `liquid` and `futuristic`, plus the 12 palettes and the corner/frame generator,
   as the first theme pack. Classic UIs (Windows 9x, Aqua and so on) become more theme packs on the same
   tokens. Fix #47-style corner and edge transparency in the generator, not in per-skin CSS.
10. **Animation recording.** Reuse the export pipeline: one model goes to a standalone SVG and then to a
    raster, over a timeline of settings and link diffs. The IK animation in links-visuals and the canvas
    backgrounds are the first recording targets.
11. **Process.** Adopt the per-issue test files, the three-engine Playwright runs, a case study per issue,
    and the 1500-line limit. Do not commit logs or archives, so the framework repo does not grow to hundreds
    of megabytes.
