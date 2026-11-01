# Research: konard/immortality and konard/anime-avatar

> Scope: extract UI/UX needs, configuration patterns, animation and asset-licensing
> practice, reusable code and known limitations from two existing konard projects,
> as input for the associative UI framework planned in
> [link-foundation/ui#1](https://github.com/link-foundation/ui/issues/1).
>
> Method: shallow, blob-limited clones (`git clone --depth 1 --filter=blob:limit=200k`)
> read as data, plus `gh issue/pr list` and `gh api`. Nothing was executed.
> Snapshot date: 2026-11-01 (both default branches are `main`).

## 1. Overview

### 1.1 konard/immortality

| Item    | Value                                                                                                                                                                                                                           |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Purpose | "Longevity Escape Velocity Monitor": a dashboard of OWID life-expectancy data with a fully configurable sci-fi/HUD look (inspired by Arwes, thegridcn, glitchy.website, Soul Extract)                                           |
| Live    | https://konard.github.io/immortality/                                                                                                                                                                                           |
| Stack   | React 18.3, Vite 6, TypeScript 5.7, Vitest 2; only runtime deps beyond React are `@fontsource/*` fonts. Canvas backgrounds, SVG frames and charts, Web Audio synthesized sounds, CSS materials. No image or audio files shipped |
| License | Unlicense (public domain)                                                                                                                                                                                                       |
| CI      | [`.github/workflows/website.yml`](https://github.com/konard/immortality/blob/main/.github/workflows/website.yml): test, typecheck, build, Pages deploy, plus a monthly cron to refresh data                                     |

Key paths:

- [`app/src/settings.ts`](https://github.com/konard/immortality/blob/main/app/src/settings.ts) (1560 lines): the whole settings schema, catalogs, presets, migration, share-link codec and randomizer.
- [`app/src/App.tsx`](https://github.com/konard/immortality/blob/main/app/src/App.tsx): `Shell` projects settings to `data-*` attributes and CSS variables.
- [`app/src/components/SettingsPanel.tsx`](https://github.com/konard/immortality/blob/main/app/src/components/SettingsPanel.tsx): the generic, schema-driven settings drawer.
- [`app/src/sound.ts`](https://github.com/konard/immortality/blob/main/app/src/sound.ts): Web Audio synthesizer with 26 voices.
- [`app/src/frameShapes.ts`](https://github.com/konard/immortality/blob/main/app/src/frameShapes.ts), [`app/src/components/Frame.tsx`](https://github.com/konard/immortality/blob/main/app/src/components/Frame.tsx): HUD panel frames.
- [`app/src/textEffects.ts`](https://github.com/konard/immortality/blob/main/app/src/textEffects.ts): decipher, typewriter and glitch text, as pure functions of time.
- [`app/src/components/Starfield.tsx`](https://github.com/konard/immortality/blob/main/app/src/components/Starfield.tsx): 21 canvas backgrounds.
- [`app/src/styles.css`](https://github.com/konard/immortality/blob/main/app/src/styles.css): 3359 lines (about 76 KB), a single stylesheet.
- [`app/src/styling.test.ts`](https://github.com/konard/immortality/blob/main/app/src/styling.test.ts): asserts every option has a CSS rule.
- [`docs/case-studies/issue-7/`](https://github.com/konard/immortality/tree/main/docs/case-studies/issue-7): requirement table R1 to R23, reference survey and library/license decisions.
- Issues [#3](https://github.com/konard/immortality/issues/3) ("Everything must be configurable, so each breaking change is reversible") and [#5](https://github.com/konard/immortality/issues/5) (each futuristic style becomes a configurable axis).

### 1.2 konard/anime-avatar

| Item                      | Value                                                                                                                                                                                                                                                                                                      |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Purpose                   | "Avatar Studio": load, pose, animate, light, speak with and export VRM/glTF/FBX/MMD characters in the browser. Also contains an older procedural SVG/3D anime avatar demo                                                                                                                                  |
| Live                      | https://konard.github.io/anime-avatar/ (studio) and `/archive` (old demo)                                                                                                                                                                                                                                  |
| Stack (studio, `public/`) | No build step. React 18 UMD and Babel standalone from unpkg. An importmap provides three@0.160.0 (OrbitControls, TransformControls, GLTF/FBX/STL/PLY/OBJ/MMD loaders, GLTFExporter), @pixiv/three-vrm@2.1.1 and fflate. libarchive WASM is vendored. Modules are IIFEs that publish `window.ACS_*` globals |
| Stack (archive, `src/`)   | Vite and React with @react-three/fiber, @react-three/drei and three 0.182. Avatars are procedural SVG plus three.js                                                                                                                                                                                        |
| Tooling                   | ESLint 9, Prettier, Husky with lint-staged, Vitest 3 with jsdom, Pages deploy workflow                                                                                                                                                                                                                     |
| License                   | Unlicense for the code. Third-party models and animations are under their own terms (see section 4)                                                                                                                                                                                                        |

Key paths (all under [`public/studio/`](https://github.com/konard/anime-avatar/tree/main/public/studio)):

- [`index.html`](https://github.com/konard/anime-avatar/blob/main/public/index.html): CDN importmap and script order.
- [`App.jsx`](https://github.com/konard/anime-avatar/blob/main/public/studio/App.jsx): cfg state, persistence, view routing, and the `window.__acs` test hook.
- [`defaults.js`](https://github.com/konard/anime-avatar/blob/main/public/studio/defaults.js): flat default cfg with commented semantics.
- [`constants.js`](https://github.com/konard/anime-avatar/blob/main/public/studio/constants.js): bones, bone limits, poses, gestures, moods, easings, model and animation presets with licenses.
- [`apply.js`](https://github.com/konard/anime-avatar/blob/main/public/studio/apply.js) (1316 lines): the per-frame bridge from cfg to the three.js engine.
- [`Editor.jsx`](https://github.com/konard/anime-avatar/blob/main/public/studio/Editor.jsx) (2381 lines): one component holding all editor sections.
- [`ui.jsx`](https://github.com/konard/anime-avatar/blob/main/public/studio/ui.jsx): glass UI primitives.
- [`animations.js`](https://github.com/konard/anime-avatar/blob/main/public/studio/animations.js), [`gestures.js`](https://github.com/konard/anime-avatar/blob/main/public/studio/gestures.js), [`textMotion.js`](https://github.com/konard/anime-avatar/blob/main/public/studio/textMotion.js), [`gearSonic.js`](https://github.com/konard/anime-avatar/blob/main/public/studio/gearSonic.js), [`ipaSpeech.js`](https://github.com/konard/anime-avatar/blob/main/public/studio/ipaSpeech.js), [`textToModel.js`](https://github.com/konard/anime-avatar/blob/main/public/studio/textToModel.js): motion and AI features.
- [`modelLoader.js`](https://github.com/konard/anime-avatar/blob/main/public/studio/modelLoader.js), [`svg.js`](https://github.com/konard/anime-avatar/blob/main/public/studio/svg.js), [`randomizers.js`](https://github.com/konard/anime-avatar/blob/main/public/studio/randomizers.js), [`tests-registry.js`](https://github.com/konard/anime-avatar/blob/main/public/studio/tests-registry.js), [`Tests.jsx`](https://github.com/konard/anime-avatar/blob/main/public/studio/Tests.jsx).
- Archive: [`src/components/ConfigPanel.jsx`](https://github.com/konard/anime-avatar/blob/main/src/components/ConfigPanel.jsx), [`src/hooks/useAnimationCycle.js`](https://github.com/konard/anime-avatar/blob/main/src/hooks/useAnimationCycle.js), `src/components/svg/*`, `src/components/three/*`.
- [`ROADMAP.md`](https://github.com/konard/anime-avatar/blob/main/ROADMAP.md) and case studies under [`docs/case-studies/`](https://github.com/konard/anime-avatar/tree/main/docs/case-studies) (issues 19, 25, 26, 28, 31, 36, 39, 41).

### 1.3 Links Notation usage

Neither repo uses Links Notation. There are no `.lino` files and no `links-notation` dependency or reference in either repo. All configuration is TypeScript/JS objects, serialized as JSON to localStorage, to a URL hash (immortality) or to a downloaded `acs-config.json` (anime-avatar). Both formats are flat or two-level key/value maps, so they map directly to links (see section 9).

## 2. Configurability model

### 2.1 immortality: a typed axis schema as the single source of truth

`settings.ts` declares the whole configurable surface as data:

- **Option catalogs.** Each is a `readonly OptionDef[]` with `OptionDef = {id, label, description?, source?: ReferenceId}`. Examples: `PALETTES` (12), `SURFACES` (13 panel materials), `FRAME_STYLES` (9), `BACKGROUNDS` (21), `BACKDROP_GRADIENTS` (7), `FONTS`, `TITLE_STYLES`, `TEXT_EFFECTS`, `INTROS`, `CHART_STYLES`, `CURSORS`, `TABLE_STYLES`, `SCROLLBAR_STYLES`, `ENTRANCES`, `SOUNDS` (26). Id union types are derived with `(typeof X)[number]['id']`, so adding an option updates the types.
- **Reference registry.** `REFERENCES: Record<ReferenceId, {label, url}>` cites the design source of each option (Arwes, thegridcn, Soul Extract, glitchy.website and others). The panel renders these as links next to each axis.
- **Axes.** `AXES` has 49 entries:
  `Axis = ChoiceAxis {kind:'choice', options, display?:'buttons'|'select'} | ToggleAxis {kind:'toggle'} | RangeAxis {kind:'range', min, max, step, unit}`.
  The shared base is `{key, label, group, description?, sources?}`. `SETTING_GROUPS` defines 8 groups: Color, Panels, Type & text, Scene, HUD & charts, Controls & data, Motion, Audio.
- **Pure functions over the schema:**
  - `coerceAxisValue` and `coerceSoundList` validate one value.
  - `mergeSettings(base, raw)` accepts untrusted input and drops invalid keys.
  - `diffSettings` and `diffFromDefaults` compute what changed.
  - `parseStoredSettings` and `migrateLegacySettings` handle storage. Migration from v1 keeps only values the user changed from the v1 defaults.
  - `loadSettings(storage)` and `saveSettings(storage)` take the storage as a parameter, so they are testable.
  - `encodeShareHash` and `decodeShareHash` write `#ui=` + `encodeURIComponent(JSON{v:2, ...diff})`. Only the diff from defaults is shared.
  - `applySharedLook` applies a shared look but keeps the viewer's comfort settings (animations, sound, volume).
  - `applyPreset`, `isPresetActive`, `countCustomized`.
  - `randomizeSettings(current, random)` takes an injected RNG and skips locked keys (animations, intro, cursor, and all audio).
- **Presets.** There are 12 (Poseidon default, Mission, Grid, Ares, Arwes, Soul Extract, Glitchy, ZK matrix, Foundry, Study, Quiet, Resonance). Each is `{id, label, description, sources, settings}`, built by `preset()` as a partial override over a base.
- **Versioned storage key.** `immortality.ui-settings.v2`, with the v1 key read once for migration.
- **Rendering.** `Shell` in `App.tsx` writes every visual axis to a `data-*` attribute (`data-palette`, `data-frame`, `data-surface`, `data-glow` and so on) and to CSS custom properties (`--corner`, `--border-width`, `--surface-opacity`, `--surface-blur`, `--font-scale`, `--chart-line`, `--bg-speed`, `--motion-scale`, `--bg-opacity`). CSS selects on `[data-x='id']`, so theme switching does not re-render React. Palette variables are mirrored to `<html>` for scrollbars. The cursor is generated as an SVG data URI.
- **Settings UI.** `SettingsPanel.tsx` has one generic `AxisControl`:
  - A toggle is a switch button with `aria-pressed`.
  - A range is `<input type=range>` with `<output>` and a `--fill` variable.
  - A choice is a set of swatch buttons in a `<fieldset>`, or the custom `Select` when `display:'select'`.
  - The drawer is docked and non-modal (`role=dialog`, `aria-modal=false`). Escape closes it and focus returns to the opener. Group tabs support arrow keys.
  - It offers presets, Randomize, "Copy share link" (falls back to the address bar if the clipboard is blocked) and Restore defaults. An `aria-live` region announces the number of customized settings.
- **Context.** `uiContext.ts` provides `useUiSettings` and `motionAllowed(settings)`, which combines the user toggle with `prefers-reduced-motion`.

### 2.2 anime-avatar studio: flat cfg plus a hand-written editor

- `defaults.js` defines `window.ACS_DEFAULTS`, a flat object with about 150 keys, many commented. It covers:
  - Model: `vrmUrl`, `modelPresetId`, `modelUrl`, `modelFormat`, `modelKind`, `pose`.
  - Rig: nested `rot{bone:{x,y,z}}`, `scale{}`, `expr{}`.
  - Gaze: about 20 `look*` keys for follow target, eye and head amounts, smoothing, cone, saccades.
  - Materials: `mat*`, including `matPerMesh`.
  - Lights: key, fill, rim and ambient color and intensity.
  - Scene and cameras: `bg`, ground, `floorGrid`, `camera*`, a separate `svgCam*` set.
  - Toggles: `autoRotate`, `mirrorArms`, `showFPS`, and an experimental joint gizmo.
- `App.jsx` keeps cfg in React state, persists it to localStorage key `acs_B` merged over defaults, and keeps the view (`editor|tests|split|none`) in `?view=` and `acs_view`. It exposes `window.__acs = {cfg, setCfg, probe}` so in-app tests can drive the UI.
- There is no schema. Each control is hand-wired in `Editor.jsx` using `Studio.Section/Row/Slider/ColorPick/Select/Chips/Toggle` from `ui.jsx`. Ranges, steps and labels live inline in JSX.
- Every `Section` has a randomize button and a reset button. `randomizers.js` implements per-group randomize and reset, and respects `ACS_BONE_LIMITS`.
- Config I/O: Export downloads `acs-config.json`. Import does `{...DEFAULTS, ...JSON.parse(text)}` and reports errors with `alert`.
- Engine binding: `apply.js` `ACS_applyAll` runs every frame and pushes cfg into three.js state (pose merge, idle, gestures, look-at, expressions, blink, materials, grid, debug helpers). This is a declarative-state to imperative-scene reconciler.

### 2.3 anime-avatar archive

- `ConfigPanel.jsx` holds about 17 props: skin, hair, eye and clothes colors, blink interval, animation speed, idle and blink toggles, background, `detailLevel` 1 to 10, legs, 3D, shadows, LOD, scale, `modelUrl`.
- `useAnimationCycle({minInterval, maxInterval, animationDuration, excludeFromCycle})` picks a random named animation (idle, happy, wave, nod, thinking, surprised) on a timer.

## 3. Animation and 3D

### 3.1 immortality (2D UI motion)

- **Text effects** (`textEffects.ts`): `revealOrder`, `decipherFrame` and `sequenceFrame` are pure functions of `(text, t, seed)`. A component only supplies the clock. This makes them deterministic, testable and easy to record. Ported from Arwes (MIT) and re-implemented from Soul Extract ideas (GPL, ideas only).
- **Entrances and staggering** are CSS animations scaled by `--motion-scale`. A fixed bug is documented in [case study issue-7](https://github.com/konard/immortality/tree/main/docs/case-studies/issue-7): `animation-fill-mode: both` left `clip-path` and transforms on panels after the animation and made borders look glitchy. It is now `backwards`.
- **Backgrounds** (`Starfield.tsx`): 21 canvas renderers with `seededRandom`, `parseColor` and `useReducedMotion`. One background ("resonance") reacts to sound cues via `onSoundCue`, an event bus from `sound.ts`.
- **Pointer-reactive glow** in `Frame.tsx` writes `--mx/--my` directly on the element, with no React state.
- **Overlays** (scanlines, vignette, flicker, grain, illuminator) use `pointer-events:none`. The old `steps(1)` white-flash flicker was replaced with a smooth breathing glow, a photosensitivity fix.
- **Sound as part of motion**: `sound.ts` has 10 UI events (hover, click, toggle, select, scan, open, close, type, intro, notify), up to 6 sounds per event, and random, cycle or layer modes. The bus is tone shelf, then compressor/limiter, then convolution reverb send, with pointer-positioned stereo. The AudioContext is created lazily because of autoplay rules. `throttledScan` limits repeated scan sounds.
- No recording or timeline. All motion is either CSS or a clock-driven pure function.

### 3.2 anime-avatar (3D character motion)

- **Clip playback**: three.js `AnimationMixer`. `retargetMixamoToVRM(asset, vrm)` in `animations.js` maps Mixamo bone names through `ACS_MIXAMO_RIG_MAP`, rebuilds `QuaternionKeyframeTrack` and `VectorKeyframeTrack` data, scales hips by rig height, and flips axes for VRM0.
- **Procedural gestures**: `ACS_gestureDelta(name, t, mood, easing)` in `gestures.js` is stateless and returns `{rot, exprs}` deltas.
  - Gestures are `ACS_GESTURE_PRESETS` (wave, nod, shake, bow, each with duration, expression and peak).
  - Moods are `ACS_MOOD_PRESETS` (`ampScale`, `speedScale`, expression, weight).
  - Easings are `ACS_EASINGS` (linear, sine, quad, cubic, easeOut, easeInOut, backOut).
  - Bell and sustained envelopes shape each gesture.
- **Additive layering**: [case study issue-28](https://github.com/konard/anime-avatar/tree/main/docs/case-studies/issue-28) established that all motion sources (pose, idle, gestures, look-at, text-motion, mouse force) add relative deltas each frame instead of replacing each other, which removes snaps at gesture start and end. `ACS_mergePose` sums pose and manual rotations, and `mergeExpressionDeltas` sums expressions.
- **Anatomical constraints**: `ACS_BONE_LIMITS` gives per-bone, per-axis ranges in degrees, citing range-of-motion references. `ACS_clampBoneRad` applies them, and sliders show degrees.
- **Gaze**: smoothed look-at follows the camera, the mouse or random targets, with a cone, saccades and separate eye and head shares.
- **Text to motion** (`textMotion.js`): a regex command table (slowWalk, run, happyWalk, stealth and others) maps to GR00T modes and procedural bone deltas, and declares resource requirements. `gearSonic.js` fetches real GEAR-SONIC reference motions (joint_pos, root_pos, root_quat at 50 fps) and a Unitree G1 MJCF/STL robot, and can call a backend.
- **Speech** (`ipaSpeech.js`): an English-to-IPA lexicon produces a phoneme timeline, which drives VRM mouth expressions and the jaw.
- **Text to model** (`textToModel.js`): a TRELLIS backend client. With no URL configured it returns `{status:'no-backend'}`, so the feature degrades cleanly.
- **Editing**: an experimental TransformControls joint gizmo (one joint at a time, hover or tap to switch, off by default).
- **Export**: GLB (`-edited.glb` via GLTFExporter) and SVG (`ACS_vrmToSVG` projects triangles with back-face culling and depth sort). The SVG export has its own camera settings.
- **Loading**: `modelLoader.js` handles glTF/VRM, FBX, OBJ, STL, PLY and MMD (PMX/VMD), including zip, rar and 7z archives (fflate and libarchive WASM). `ACS_normalizeModelURL` rewrites GitHub `blob/` and `raw/refs/heads/` URLs to raw download URLs, and `ACS_detectModelFormat` infers the format.
- **Archive demo**: CSS `@keyframes` (talk, breathe, headSway) on SVG parts, plus a parallel three.js part tree.
- **Recording**: absent. Screenshot or video export, custom pose saving and a scene editor are only listed in `ROADMAP.md`. There is no MediaRecorder use and no user-editable keyframe timeline.

## 4. Assets and licensing

### 4.1 immortality: zero-asset, cite-everything

- It ships no images or audio. Everything is generated: canvas, SVG, CSS gradients, `feTurbulence` noise and Web Audio. Fonts are OFL `@fontsource` packages.
- Each option and each sound carries provenance. `OptionDef.source` points into `REFERENCES {label,url}`, and `SOUNDS` entries have `{character, sourceLabel, sourceUrl}`. Sounds have neutral names; the source names say what inspired them.
- License decisions are recorded per source in [`docs/case-studies/issue-7`](https://github.com/konard/immortality/tree/main/docs/case-studies/issue-7):
  - Arwes is MIT, so code was ported with attribution in comments (`frameShapes.ts`, `textEffects.ts`).
  - Soul Extract is GPL-3.0, so only ideas were re-implemented and no code was copied.
  - thegridcn has no license, so it was used as a visual reference only.
- Library choices were weighed by size. Tone.js (about 77 KB) was rejected for plain Web Audio, and the Select was hand-rolled with downshift as the fallback. The framework should keep this habit of recording rejected alternatives.

### 4.2 anime-avatar: per-asset metadata and conditional attribution

- `ACS_MODEL_PRESETS` entries have the shape `{id, label, url, format, kind, credit, license, flipped?, attributionRequired?}`. Examples:
  - pixiv VRM1 sample and Seed-san: VRM Public License 1.0.
  - Alicia Solid: Niconi Commons, attribution required, `flipped`.
  - V-Sekai girl: "See repository".
  - Khronos Duck: CC-BY 4.0.
  - DamagedHelmet: CC-BY-NC 4.0.
  - Unitree G1: NVIDIA.
- `ACS_ANIMATION_PRESETS` (Samba and Mixamo idle from the three.js examples, Gangnam Style from V-Sekai) carry `credit` and `license: 'Mixamo terms (free use with your avatar)'`.
- `attributionRequired(vrmMeta, preset, animMeta)` in `Editor.jsx` decides attribution in this order:
  1. VRM `creditNotation`.
  2. The preset flag.
  3. The animation flag.
  4. A license-string heuristic (CC-BY, Niconi, "attribution").
     `AttributionOverlay` shows a credit on the stage only when attribution is required ([issue #19](https://github.com/konard/anime-avatar/issues/19)). The Metadata section shows the loaded VRM meta.
- **Risks.**
  - `ACS_GF2_MMD_MODEL_ARCHIVES` hot-links about 70 proprietary SUNBORN Girls' Frontline 2 MMD archives from the publisher CDN, with license text "Official GF2 Exilium art page download".
  - DamagedHelmet is non-commercial.
  - The label "pixiv VRM1 sample (CC-ish / VRM license)" and the license "See repository" (V-Sekai girl) are not license identifiers.
  - Assets are loaded at runtime from third-party URLs (unpkg, three.js examples, GitHub raw). Availability and integrity are not pinned; there is no SRI.
  - None of these assets may enter a public-domain framework asset set.

## 5. Components inventory

| Component / module                                                                                                                                  | Repo         | Kind           | Reusable for the framework as                           |
| --------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ | -------------- | ------------------------------------------------------- |
| `settings.ts` axis schema, presets, migration, diff, share                                                                                          | immortality  | data and logic | **Core config model** (to re-express in Links Notation) |
| `SettingsPanel` + `AxisControl`                                                                                                                     | immortality  | generic panel  | Auto-generated "configuration mode" inspector           |
| `Select` (WAI-ARIA select-only combobox, type-ahead, edge flip)                                                                                     | immortality  | control        | Base dropdown                                           |
| `Frame` + `frameShapes.ts` (9 frames, chamfer, glow, material layer)                                                                                | immortality  | container      | Themed panel/"window chrome" primitive                  |
| `FxText` + `textEffects.ts`                                                                                                                         | immortality  | text           | Animated text primitive                                 |
| `Starfield` (21 canvas backgrounds)                                                                                                                 | immortality  | background     | Theme backdrop plugins                                  |
| `Overlays` (scanlines, vignette, flicker, grain, illuminator)                                                                                       | immortality  | overlay        | Theme post-effects                                      |
| `sound.ts` (26 voices, 10 events)                                                                                                                   | immortality  | audio          | UI sound theme layer                                    |
| `LineChart`, `DataTable` (accessible twins), `Gauge`, `StatTile`, sparkline                                                                         | immortality  | data viz       | Chart widgets with an a11y table fallback               |
| `HudBar` (UTC clock), `Intro` (boot sequence)                                                                                                       | immortality  | chrome         | Theme chrome                                            |
| `useElementWidth` (ResizeObserver), `useReducedMotion`, `motionAllowed`                                                                             | immortality  | hooks          | Platform utilities                                      |
| `Studio.GlassPanel`, `ConfigDrawer`, `Section` (randomize/reset), `Row`, `Slider`, `ColorPick`, `Select`, `Chips`, `Toggle`, `Stage`, `useIsMobile` | anime-avatar | panel kit      | Second panel kit; merge with `AxisControl`              |
| `Editor.jsx` (22 sections, including Bones, Proportions, Expressions, Lights, Cameras, Export, Debug, Metadata)                                     | anime-avatar | editor         | Example of a large inspector to generate                |
| `Tests.jsx` + `tests-registry.js` (in-app test runner, `probe`, canvas fingerprint, `probeDiff`)                                                    | anime-avatar | dev tool       | In-app self-test panel for configuration mode           |
| `apply.js` cfg-to-scene reconciler                                                                                                                  | anime-avatar | engine         | Pattern for a 3D/canvas binding                         |
| `gestures.js`, `ACS_EASINGS`, mood presets                                                                                                          | anime-avatar | animation      | Easing and envelope library                             |
| `animations.js` Mixamo-to-VRM retarget                                                                                                              | anime-avatar | animation      | 3D avatar plugin (optional)                             |
| `ipaSpeech.js`, `textMotion.js`, `gearSonic.js`, `textToModel.js`                                                                                   | anime-avatar | AI and motion  | Out of core; plugin candidates                          |
| `modelLoader.js`, `svg.js`                                                                                                                          | anime-avatar | IO             | 3D asset plugin; vector export idea                     |
| `AttributionOverlay` + `attributionRequired`                                                                                                        | anime-avatar | licensing UI   | **Core attribution component**                          |
| Archive `AvatarSVG`, `Avatar3D`, `ConfigPanel`, `useAnimationCycle`                                                                                 | anime-avatar | demo           | Reference only                                          |

## 6. Patterns worth adopting

1. **One declarative schema per configurable surface.** Declare every setting once as `{key, label, group, kind, options|min/max/step/unit, description, sources}`. Validation, defaults, the panel, presets, randomizer, diff, sharing, migration and tests all derive from it (immortality `AXES`). In the framework this schema should itself be a Links Notation document.
2. **Option catalogs with ids, labels, descriptions and provenance.** Derive types from the catalog (`(typeof X)[number]['id']`), so adding an option to a theme is a one-line data change.
3. **Store and share only the diff from defaults.** `diffFromDefaults`, plus a version tag (`v:2`), makes share links short, survives default changes and supports "N customized" counters.
4. **Treat all external config as untrusted.** `mergeSettings(base, raw)` coerces each value and drops unknown keys. Apply this to imports, URL hashes and storage (anime-avatar currently does not).
5. **Versioned persistence with intent-preserving migration.** Keep only what the user changed from the old defaults, so the new defaults still take effect.
6. **Comfort settings stay local.** When applying a shared look or preset, keep the viewer's accessibility and comfort keys (motion, sound, volume). Lock the same keys from randomization.
7. **Presets are partial overrides over a base**, with `isPresetActive` detection and source citations.
8. **Randomize and reset per group and globally, with an injected RNG**, respecting constraints (bone limits) and locked keys. This makes visual exploration safe and reproducible.
9. **Project theme state to `data-*` attributes and CSS variables** instead of re-rendering. This is cheap, framework-agnostic and works the same for plain JS, React and Vue. A test then checks that every option has a CSS rule (`styling.test.ts`).
10. **High-frequency visuals bypass the component tree.** Pointer glow (`--mx/--my`), canvas backgrounds and the per-frame `apply.js` loop write directly to the DOM or scene.
11. **Animations as pure functions of time** (`decipherFrame(text,t,seed)`, `ACS_gestureDelta(name,t,mood,easing)`). They are deterministic, so they can be recorded, replayed, scrubbed and tested. This is the natural basis for the framework's animation recording: record the clock and inputs, not the pixels.
12. **Additive animation layers.** Each source contributes deltas that are summed each frame, with envelopes for start and end, so nothing snaps (anime-avatar issue-28).
13. **Named easing and envelope catalog** (`ACS_EASINGS`, bell and sustained) shared by every animation.
14. **Domain constraints as data** (`ACS_BONE_LIMITS` in degrees, with references), used for clamping sliders, randomizers and gizmos alike.
15. **Reduced motion and photosensitivity by default.** Use `motionAllowed()` (the setting combined with `prefers-reduced-motion`), and avoid hard flashes, which is the reason the flicker was replaced.
16. **Accessible panel conventions**: a non-modal docked drawer, Escape to close, focus return, arrow-key tabs, `aria-pressed` toggles, `<output>` for ranges, an `aria-live` change counter, and a clipboard fallback.
17. **Accessible data twins**: every chart has a table equivalent, `role=img` and a text summary.
18. **UI sound theme** as a separate configurable layer: an event-to-sounds map, modes (random, cycle, layer), master bus, lazy AudioContext, throttling, and a cue event bus that visuals can subscribe to.
19. **Zero-binary assets.** Generate visuals and sounds procedurally so the framework's own assets are trivially public domain.
20. **Provenance on every borrowed item** (`source`, `sourceUrl`, `credit`, `license`, `attributionRequired`), with license decisions recorded per source (MIT port, GPL ideas only, no license means reference only).
21. **Conditional attribution UI**: show credits only when the asset's metadata or license requires it, and always expose a Metadata/Credits view.
22. **Dev mode exposes a state handle** (`window.__acs = {cfg, setCfg, probe}`) plus an in-app test runner that does not autostart, can be stopped and keeps its scroll position (issue #19). This fits a "configuration mode" well.
23. **View state in the URL** (`?view=`, `#ui=`), consumed and then cleaned with `replaceState`, and listening to `hashchange`.
24. **Graceful optional backends**: AI features return a typed `{status:'no-backend'}` instead of failing.
25. **URL normalization for user-supplied resources** (GitHub `blob/` to raw) and per-asset fix-up flags such as `flipped`.
26. **Case-study per issue** (requirements table, root causes, rejected libraries). Both repos already do this, and link-foundation/ui should continue it.

## 7. Duplication candidates

Both repos independently built the same subsystems. They should become single framework modules:

| Concern                   | immortality                                                    | anime-avatar                                                             | Unified module                                                           |
| ------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------ |
| Settings schema           | `AXES`, typed                                                  | implicit in `defaults.js` and `Editor.jsx` JSX                           | Links Notation schema with `choice/toggle/range/color/vector/list` kinds |
| Panel controls            | `AxisControl`, `Select`, range with `<output>`                 | `Studio.Slider/ColorPick/Select/Chips/Toggle/Row`                        | One control set rendered from the schema                                 |
| Drawer and panel chrome   | `SettingsPanel` drawer, `Frame`                                | `ConfigDrawer`, `GlassPanel` (inline styles)                             | Themeable panel primitive                                                |
| Group randomize and reset | `randomizeSettings`, Restore defaults                          | `randomizers.js`, per-`Section` buttons                                  | Schema-driven randomize/reset with locks and constraints                 |
| Persistence               | `loadSettings/saveSettings`, versioned key, migration          | `localStorage` `acs_B` shallow merge                                     | One store with versioning, migration, and a diff codec                   |
| Share and export          | `#ui=` hash of the diff                                        | `acs-config.json` download and import                                    | Links Notation text for both URL and file                                |
| Easing and timing         | CSS timing functions, text-effect clocks                       | `ACS_EASINGS`, envelopes                                                 | Shared easing catalog usable in CSS and JS                               |
| Motion preference         | `motionAllowed`, `useReducedMotion`                            | none in the studio (idle, auto-rotate and gaze always on unless toggled) | Platform motion policy                                                   |
| Responsive helpers        | `useElementWidth`                                              | `useIsMobile` (720 px)                                                   | Shared breakpoint and size utilities                                     |
| Provenance metadata       | `REFERENCES`, `source`, `sourceUrl`                            | `credit`, `license`, `attributionRequired`                               | One attribution record, using SPDX ids where possible                    |
| Visual regression         | `experiments/preset-gallery.js` screenshots, `styling.test.ts` | canvas fingerprint, `probeDiff`, PR #17 image compare                    | Shared screenshot and fingerprint test harness                           |
| Canvas backgrounds        | `Starfield` (21)                                               | scene background and grid, archive petals                                | Background plugin interface                                              |

## 8. Problems, bugs and limitations

### 8.1 immortality

1. **Monolithic stylesheet**: `styles.css` is 3359 lines, mixing all themes, components and axes. It cannot be tree-shaken per theme or reused outside the app.
2. **Hand-duplicated mapping**: the list of axes rendered as `data-*` attributes in `App.tsx` `Shell` is repeated by hand as `CSS_AXES` in `styling.test.ts`. The schema should declare `render: 'data-attr' | 'css-var'` so both are derived.
3. **React-bound**: the schema is portable TS, but rendering (`Shell`, `SettingsPanel`) is React-only. Nothing is available for plain JS, Vue or native.
4. **JSON in the URL hash**: share links are percent-encoded JSON, which is long and unreadable. Links Notation would be both shorter and human-readable.
5. **`isPresetActive` uses `JSON.stringify` comparison**, which depends on key order.
6. **No i18n**: labels and descriptions are English literals inside the schema.
7. **Theme ids are flat**: palettes, materials and frames combine freely, but there is no notion of a named "theme" bundle beyond presets, and no inheritance between presets beyond one base.
8. **Past animation bugs** worth adding to the framework's regression list: `animation-fill-mode: both` leaving `clip-path` on panels, a `steps(1)` white flash flicker (photosensitivity), and content hidden only inside `<details>`.

### 8.2 anime-avatar

1. **No build step in production**: Babel standalone transpiles JSX in the browser on every load, React runs in its development UMD build, and dependencies come from unpkg without SRI. This is slow, fragile and unsafe for a framework.
2. **Global namespace modules** (`window.ACS_*`, `window.Studio`, `window.__acs`) with implicit load order in `index.html`.
3. **Monoliths**: `Editor.jsx` is 2381 lines in one component, and `apply.js` is 1316 lines. All styling is inline style objects, so there is no theming.
4. **Two divergent apps** in one repo (studio in `public/` and the archived Vite app in `src/`). The README mostly documents the archive, and the archive's 2D and 3D part trees (`components/svg/*`, `components/three/*`) duplicate each other.
5. **Weak config validation**: import does a shallow `{...DEFAULTS, ...JSON.parse}`. Nested `rot/scale/expr` are not validated, unknown keys persist, errors use `alert`. There is no storage version or migration, and the key `acs_B` is opaque.
6. **No schema**: ranges and labels are duplicated between `Editor.jsx` and `randomizers.js`.
7. **Licensing**: the proprietary GF2 archives, the CC-BY-NC DamagedHelmet, and vague license strings ("See repository", "CC-ish"). The license-string heuristic in `attributionRequired` can miss cases.
8. **Bugs called out in [issue #19](https://github.com/konard/anime-avatar/issues/19)** (since addressed): the Alicia model loaded back-to-front, GitHub `blob/` URLs failed, loading errors never auto-hid, tests autostarted and could not be stopped, the test log forced scroll to the bottom, split view was shown on mobile, and copyright was shown unconditionally.
9. **Bugs called out in [issue #28](https://github.com/konard/anime-avatar/issues/28)**: an unnatural wave, non-anatomical slider ranges shown in radians, and gestures replacing look-at instead of adding to it, which caused snaps.
10. **No animation recording** and no keyframe editing. The Mixamo retarget only plays existing clips. Pose, scene editor and video export are only on the roadmap.
11. **Open requests** show demand for more model sources and mocap: [#18](https://github.com/konard/anime-avatar/issues/18) (VRoid Hub, CharacterStudio), [#21](https://github.com/konard/anime-avatar/issues/21) (kalidokit), [#22](https://github.com/konard/anime-avatar/issues/22) (webaverse), [#23](https://github.com/konard/anime-avatar/issues/23) (airi), [#24](https://github.com/konard/anime-avatar/issues/24) (GitHub miner), [#38](https://github.com/konard/anime-avatar/issues/38) (feature parity with TheSashaDev/girl-agent). [PR #17](https://github.com/konard/anime-avatar/pull/17) (image-comparison e2e) is still open.

## 9. Migration notes

### 9.1 Representing both configs in Links Notation

An immortality axis declaration could become:

```lino
(axis surface
  (label "Panel material")
  (group panels)
  (kind choice)
  (display buttons)
  (options gradient glass frosted solid transparent steel brass copper wood carbon holographic ...)
  (sources arwes gridcn))
(option glass (of surface) (label "Glass") (source arwes))
(reference arwes (label "Arwes") (url "https://github.com/arwes/arwes"))
```

A user's settings would be the diff from defaults:

```lino
(settings (version 2)
  (palette ares)
  (frame octagon)
  (glow medium)
  (surfaceOpacity 0.6)
  (sounds (click soft-tick glass-tap)))
```

The anime-avatar cfg, including nested bone rotations:

```lino
(cfg (version 1)
  (model (preset seed-san))
  (rot (rightUpperArm (z -80)) (rightLowerArm (x -90)))
  (expr (happy 0.4))
  (light (key (color "#ffffff") (intensity 1.2))))
```

The asset provenance record:

```lino
(asset alicia-solid
  (url "...")
  (format vrm)
  (credit "DWANGO Co., Ltd.")
  (license (spdx LicenseRef-Niconi-Commons))
  (attribution required)
  (fixup flipped))
```

### 9.2 Steps

1. **Port the `settings.ts` engine first.** Keep `coerce`, `merge`, `diff`, `migrate`, `encode/decode`, `applySharedLook` and `randomize` as framework-neutral pure functions, but read and write the schema and values as Links Notation. Swap the JSON share hash for a Links Notation hash and keep a JSON v2 reader for old links.
2. **Extend the axis kinds** to cover anime-avatar: `color`, `vector3` (bone rotation with per-axis limits and units), `map` (per-bone, per-mesh, per-expression), `list` (sounds per event), `asset` (URL plus format plus provenance), and `action` (buttons such as gestures and export).
3. **Add rendering hints to the schema** (`render data-attr|css-var|engine`), so `Shell`, the test assertions and engine bridges (`apply.js`-style reconcilers) are all generated.
4. **Generate the configuration-mode inspector** from the schema. It should merge `AxisControl` (a11y, sources, display hints) with the `Studio` kit (per-section randomize/reset, color pickers, chips, mobile full-screen drawer). Export `Editor.jsx`'s 22 sections as a large conformance test for that generator.
5. **Split `styles.css` into per-axis theme modules** keyed by `[data-axis='id']`, so each theme (Arwes HUD, glass, and later the classic-UI themes) is a separately loadable package.
6. **Animation recording**: build on the pure time-function pattern. A recording is a Links Notation timeline of `(at t (set key value))` and `(at t (play gesture wave (mood happy)))` entries, plus the seed. Playback re-evaluates the pure functions, so recordings are tiny, diffable and reproducible. Combine with additive layers and the shared easing catalog.
7. **Asset policy**: the framework's own assets follow immortality (procedural, Unlicense). Third-party assets need a mandatory provenance record (SPDX id or `LicenseRef-*`, source URL, credit, attribution flag, commercial-use flag) and a CI check that rejects missing or non-free licenses from the default catalog. Exclude GF2-style proprietary and NC assets from defaults, or gate them behind an explicit opt-in that displays the terms.
8. **Bindings**: the pure core (schema, store, codecs, easing, time functions, sound specs) should be a plain-JS package. React and Vue adapters wrap `useSettings`, the inspector and `Frame`. Swift and Kotlin bindings consume the same Links Notation schema and theme tokens, and implement native controls.
9. **Testing**: keep both repos' ideas. Add schema-to-CSS coverage tests (fixing the duplicated `CSS_AXES` list), a preset screenshot gallery, canvas fingerprinting and the in-app runner (no autostart, stoppable) as part of configuration mode.
10. **Do not carry over**: in-browser Babel, development React builds, unpinned CDN imports without SRI, `window.*` globals, inline-style-only theming, `alert`-based errors, and opaque storage keys.
