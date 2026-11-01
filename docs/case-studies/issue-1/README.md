# Case study: issue 1 — initial version of the associative UI framework

[Issue #1](https://github.com/link-foundation/ui/issues/1) asks for a plan for
an associative UI framework. The framework should be fully described,
configured, styled and animated in Links Notation (LiNo), and it should be
editable at runtime and in a WYSIWYG designer. It should run from plain
JavaScript, React, React Native, Vue, Swift and Kotlin, and in time it should
replace the UI code of every project in the `konard`, `deep-foundation`,
`link-foundation` and `link-assistant` organisations.

The issue limits its own scope to **documentation and planning**:

- collect the data;
- research the existing projects and the state of the art;
- list every requirement, with possible solutions;
- create the roadmap as GitHub issues in this repository.

This folder is that deliverable.

## Contents

| Path                                             | What it holds                                                                                                                                                              |
| ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`requirements.md`](requirements.md)             | Every requirement in the issue, R1.1–R36, quoted or paraphrased, and marked _plan_ (delivered here) or _deliver_ (delivered by the roadmap).                               |
| [`solutions.md`](solutions.md)                   | For every requirement: the chosen solution, the alternatives, the existing libraries and the roadmap issues that deliver it.                                               |
| [`research/`](research/)                         | Eight research reports (listed below).                                                                                                                                     |
| [`roadmap/`](roadmap/)                           | The source of every roadmap issue, the shared conventions footer and the issue plan. The GitHub issues are created from these files.                                       |
| [`samples/`](samples/)                           | A first sketch of the UI dialect in seven LiNo files (document, indented document, tokens, styles, animation and recording, overrides, asset records).                     |
| [`data/`](data/)                                 | Raw data: the issue as JSON, repository listings of the four owners, a copy of formal-ai's `docs/associative-tech-stack.md`, and the output of the parse-shape experiment. |
| [`ci-logs/`](ci-logs/)                           | Logs of the three workflows that failed on `main` at commit `428ee07`.                                                                                                     |
| [`../../ARCHITECTURE.md`](../../ARCHITECTURE.md) | The proposed target architecture that the roadmap implements.                                                                                                              |
| [`../../ROADMAP.md`](../../ROADMAP.md)           | The created issues, grouped by phase, with their GitHub numbers and "blocked by" relations.                                                                                |

Experiments are in
[`experiments/issue-1/`](../../../experiments/issue-1/):

- `lino-parse-shapes.mjs` shows how `links-notation` returns the same element
  written in different layouts;
- `lino-ui-dialect-roundtrip.mjs` parses every sample and checks that it
  formats back to an equal links network;
- `create-roadmap-issues.mjs` creates the roadmap issues and their relations.

## Timeline

| Date (UTC)       | Event                                                                                                                                                                                      |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 2026-11-01 10:56 | The repository is created from `link-foundation/js-ai-driven-development-pipeline-template`. The first `main` runs of "Example app", "Checks and release" and "Security" fail (see below). |
| 2026-11-01 11:20 | Issue #1 is opened.                                                                                                                                                                        |
| 2026-11-01       | Draft pull request #2 is opened. The data collection, the research, the requirement and solution lists, the architecture proposal and the roadmap issues are added to it.                  |

## Method

1. **Issue data.** The issue was saved as JSON. It has no comments, and the
   pull request had no review comments while this work was done.
2. **Source repositories.** Every repository named in the issue was read from
   shallow, blob-filtered clones and `gh api`. Downloaded code was treated as
   data and never executed. Each repository has a report that covers:
   - purpose and stack;
   - UI inventory;
   - configuration and settings model;
   - theming, i18n and animation;
   - assets and licences;
   - open UI issues;
   - patterns worth adopting;
   - duplication candidates;
   - limitations;
   - migration notes.
3. **All other repositories.** The four owners were listed in full (konard
   needed the paginated REST API, because it has more than 1,000
   repositories). About 120 UI candidates were checked by file tree and
   `package.json`. The result is an inventory of about 95 first-party UI
   repositories.
4. **Online research.** Prior art and libraries were researched for each
   requirement area: declarative UI formats, design tokens, designers,
   headless components, visualisation, animation, assets and licences, native
   runtimes and documentation tooling. Licences were checked against the
   public-domain goal.
5. **Experiments.** The `links-notation` 0.27.1 JavaScript package was
   installed and run against UI-shaped LiNo, to check that the proposed
   dialect can be parsed and formatted back without loss.
6. **Repository audit.** The failing `main` CI runs were downloaded and their
   root causes traced. The template leftovers were listed.

## Research reports

| Report                                                                               | Sources                                                                                  | Main takeaways                                                                                                                                                                                                                                                                                                                                                                  |
| ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [konard.github.io and links-visuals](research/konard-github-io-and-links-visuals.md) | `konard/konard.github.io`, `konard/links-visuals`                                        | The most configurable UI so far: a settings schema with presets, diff-only share links, IndexedDB persistence, theme and i18n preferences, and a links network editor. links-visuals gives the reference drawings of a single link. Both become framework packages (settings engine, settings panel, link and network visualisation).                                           |
| [immortality and anime-avatar](research/immortality-and-anime-avatar.md)             | `konard/immortality`, `konard/anime-avatar`                                              | Fully configurable sci-fi/HUD look built from code (canvas, SVG, Web Audio; no binary assets), many settings axes, charts, and an avatar configuration panel. The HUD look is a theme; the settings axes feed the schema engine; avatar animations need the recorder.                                                                                                           |
| [deepcase](research/deepcase.md)                                                     | `deep-foundation/deepcase`, `deepcase-app`, `perception-*`, `deepcase.github.io`, `deep` | Associative OS UI: graph view (Cytoscape), tabbed editors (Monaco, CodeMirror), windowing, handlers that render links. Three generations with different looks (Chakra v2, perception, MUI 6), which is the reason for "classic UIs as themes".                                                                                                                                  |
| [Links Notation ecosystem](research/links-notation-ecosystem.md)                     | `link-foundation/links-notation` and the `lino-*` packages                               | The grammar, the implementations (JS, Rust, C#, Python, Go and C++ at 0.27.1; Java and PHP unpublished; no Swift port), round-trip limits (comments, layout and quoting are not kept), syntax traps (`#` starts a comment after whitespace, so hex colours must be quoted), and the related packages (`lino-objects-codec`, `lino-i18n`, `lino-arguments`).                     |
| [meta-sovereign chat](research/meta-sovereign-chat.md)                               | `link-foundation/meta-sovereign`                                                         | The best chat UI in the organisation: 215 `chat-*.js` files, React 19 without JSX, one 13,794-line stylesheet, data already stored as links with `lino-objects-codec`. Its chat components become the chat UI kit.                                                                                                                                                              |
| [formal-ai](research/formal-ai.md)                                                   | `link-assistant/formal-ai`, its `docs/associative-tech-stack.md`                         | Many UI needs (chat, settings, themes, `lino-i18n`, IndexedDB memory, trace and network views, desktop and VS Code hosts) with an admittedly weak UI. Its associative tech stack maps directly onto framework layers (see `ARCHITECTURE.md`).                                                                                                                                   |
| [UI projects inventory](research/ui-projects-inventory.md)                           | All repositories of `konard`, `deep-foundation`, `link-foundation`, `link-assistant`     | About 95 first-party UI repositories. Two app shells are copied everywhere (the template's universal app into 15 repositories, the Deep scaffold into about 8). Theme toggles, settings panels, four i18n implementations, links views and chat UIs are duplicated. Migration waves 0–6 and a ranked top 15.                                                                    |
| [Existing solutions](research/existing-solutions.md)                                 | Online research                                                                          | What to build on (DTCG tokens, Web Components, Zag-style state machines, Floating UI, WAAPI, Cytoscape/Sigma/d3-force, ECharts, Mermaid, Lucide, REUSE/SPDX), what to only interoperate with (MUI, Figma, A2UI, Adaptive Cards, Lottie, ELK), and what to avoid for licence or maintenance reasons (GSAP, tldraw SDK, Theatre.js Studio, Remix Icon, SF Symbols, Material Web). |

## Key findings

### 1. Links Notation can carry the whole UI dialect, with three caveats

All seven samples in [`samples/`](samples/) parse with `links-notation` 0.27.1
and format back to an equal links network. The experiments found three
things the framework has to design around:

1. **One element, several link shapes.** The same element gives different
   link structures depending on how it is written
   ([`data/lino-parse-shapes-output.txt`](data/lino-parse-shapes-output.txt)):

   ```text
   single line       -> (ok: button (label OK) (on press (navigate home)))
   multi-line parens -> ((ok: button) ((ok: button) (label OK)) ((ok: button) (on press (navigate home))))
   indented parse()  -> (ok: button), ((ok: button) (label OK)), ...
   parseGroups()     -> a tree: (ok: button) with children (label OK), (on press) -> (navigate home)
   ```

   So `ui-core` needs one **tree projection** that maps all forms to the same
   element tree. The dialect specification (roadmap issue F03) fixes it with
   conformance fixtures that every implementation must pass.

2. **Round trip loses source details.** `Link.format()` does not keep
   comments, layout or the original quoting. The designer must edit files
   without destroying them, so source-preserving edits are a separate issue
   (F14).

3. **Syntax traps.** `#` after whitespace starts a comment, so colours like
   `'#6750A4'` must be quoted, and `:` cannot appear in bare values (URLs and
   times must be quoted). The specification and the error messages of
   `ui-core` must say so.

### 2. Swift and Kotlin need parsers first

There is no Swift port of `links-notation`, and the Java port is not published
([links-notation#192](https://github.com/link-foundation/links-notation/issues/192)).
The roadmap therefore has a parser issue before each native renderer (F21 and
F23). Both are driven by the shared fixtures.

### 3. The same UI pieces are rebuilt again and again

The inventory found the same patterns in many repositories:

- theme toggles in about 16 repositories;
- settings panels in 7;
- four different i18n implementations;
- links or graph views in 10 (d3-force, Cytoscape, canvas/SVG, doublets-web);
- chat UIs in 9.

Each of these is a framework package in the roadmap. That is what makes
"project code gets simpler for humans and agents" (R23) measurable: a migrated
repository deletes its local copy.

### 4. The architecture follows from the requirements

The requirements are: runtime editing on any site (R9, R11), "every other
framework is just LiNo" (R6), and five platforms (R18–R22). Together they rule
out a code-generation-first design (the lesson of Airbnb Lona and Mitosis).
The proposal in [`ARCHITECTURE.md`](../../ARCHITECTURE.md) is:

- a LiNo **runtime interpreter** with stable link IDs, and thin renderers per
  platform;
- **Web Components** as the reference renderer;
- **configuration layers** (defaults < theme < site < user < session), so dev
  mode edits only the top layers, and "make these the defaults" (R12) is a
  diff exported as a LiNo patch for an agent;
- **themes** as LiNo packages of tokens, style rules and control templates.
  This is the XAML idea, and it covers both "classic UIs as themes" (R14) and
  Material, Fluent and Apple alignment (R15).

### 5. Licensing narrows the library choice

The public-domain goal (R25–R27) excludes several popular options:

- GSAP (proprietary terms that forbid visual animation builders);
- the tldraw SDK (licence key);
- Theatre.js Studio (AGPL);
- Remix Icon (custom licence since 2026);
- SF Symbols (restricted).

ELK and Graphviz (EPL) are allowed only as optional plugins. Every asset needs
a record with its SPDX licence, which the licensing issue (F02) implements with
REUSE 3.3.

## Defects found in the repository

The repository was created from a template, and several things on `main` are
broken or still describe the template. Issue #1 is a planning issue, so these
are not fixed in this pull request. Each one is a **Bug** issue in phase 0 of
the roadmap, scheduled before every feature.

| Key | Defect                                                                                                                                                                                                                                                                                                                      | Evidence                                                                                                                 | Who can fix it                                         |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------ |
| B01 | The repository still calls itself the template: the package is `@link-foundation/example-package-name` with a template description, `bin` and keywords; README and CONTRIBUTING have template titles; `src/index.js` exports demo `add`, `multiply` and `delay` functions; 7 template changesets are pending.               | `package.json`, `README.md`, `src/index.js`, `.changeset/`                                                               | Pull request                                           |
| B02 | 19 template case-study folders (`docs/case-studies/issue-3` … `issue-212`) and 6 template analyses (`docs/ISSUE-*.md`) describe template issues, but their numbers will collide with this repository's issues. Workflows, scripts and tests refer to them.                                                                  | `release.yml` lines 212 and 280, `scripts/simulate-fresh-merge.sh`, `tests/release-badge.test.js` line 61                | Pull request                                           |
| B03 | "Example app" fails on `main`: GitHub Pages is not enabled. The check already fails on `main` with the exact action to take and only warns on pull requests.                                                                                                                                                                | [`ci-logs/main-41299671748.log`](ci-logs/main-41299671748.log) line 12                                                   | Maintainer: Settings → Pages → Source "GitHub Actions" |
| B04 | "Regenerate Preview Images" fails on `main` with `gh: command not found` (exit 127). The job runs in the Playwright container, which has no GitHub CLI, but the step "Commit drift back to main" runs `gh auth setup-git`, and the fallback pull-request path also calls `gh`. This is a code defect, not a missing secret. | [`ci-logs/main-41299671748.log`](ci-logs/main-41299671748.log) lines 52–53; `.github/workflows/example-app.yml` line 346 | Pull request                                           |
| B05 | "Checks and release" fails on `main`: the release preflight finds no npm package and no `NPM_TOKEN`. The package name must be fixed first (B01).                                                                                                                                                                            | [`ci-logs/main-41299671735.log`](ci-logs/main-41299671735.log) line 15                                                   | Maintainer: add `NPM_TOKEN`, then trusted publishing   |
| B06 | "Security" fails on `main`: the dependency graph is disabled, so dependency review cannot run. Dependency review also has no licence policy yet.                                                                                                                                                                            | [`ci-logs/main-41299671730.log`](ci-logs/main-41299671730.log) line 17; `.github/workflows/security.yml`                 | Maintainer (setting) and pull request (licence policy) |

Pull requests are not affected by B03, B05 and B06: the checks only warn on
pull requests and fail on `main` with an explicit message about what a
maintainer has to do.

## Decisions

| Decision                                                                                                  | Reason                                                                                                                                                          |
| --------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| This pull request changes documentation and experiments only.                                             | The issue's scope is planning (R36). Defects became bug issues.                                                                                                 |
| LiNo is the only source of truth; other formats are import or export only.                                | R6, R8. Every domain still maps losslessly to its closest standard (DTCG, WAAPI/Lottie, Vega-Lite, Mermaid, A2UI).                                              |
| Runtime interpreter with thin renderers, not code generation first.                                       | Runtime editing (R9, R11) needs the links network at run time. Code generation is kept for wrappers and optional exports (F52).                                 |
| Web Components are the reference renderer; React and Vue are adapters.                                    | One implementation serves plain JS, React and Vue (R18–R20).                                                                                                    |
| JavaScript first; Swift and Kotlin follow the shared fixtures.                                            | `docs/javascript-first.md`. The native ports need parsers first (F21, F23).                                                                                     |
| Issue sources are files in `roadmap/issues/`, and a script creates the issues.                            | The plan is reviewable in the pull request. The script is idempotent and can add issues later. Relations use the native dependencies and sub-issues APIs (R34). |
| A tracking Task (T01) is the parent of all roadmap issues; it is not a sub-issue of #1.                   | #1 is closed by this pull request; making the roadmap its sub-issues would pull the whole roadmap into this pull request's scope.                               |
| Issues are blocked only by issues whose output they consume.                                              | This maximises parallel work (R34). Knowledge-only links are written as references in the body.                                                                 |
| Repositories outside `link-foundation/ui` are migrated through issues opened in those repositories (F65). | Their code changes belong to their own pull requests.                                                                                                           |

## Open questions and uncertainty

- **Package names.** They are working names. The monorepo issue (F01) decides
  the final ones.
- **The tree projection rules.** They are only sketched here (finding 1). F03
  turns them into a specification. If `links-notation` changes how it parses
  multi-line forms, the fixtures will show it.
- **Some library facts change quickly.** These include the A2UI version,
  Compose Multiplatform for Web stability and the licence of the Skip engine.
  [`research/existing-solutions.md`](research/existing-solutions.md#d-open-questions-to-verify-before-writing-issues)
  lists them, and the issues that depend on them ask the implementer to
  re-check.
- **The inventory is incomplete in places.** GitHub code search was
  rate-limited during the inventory, so some pattern counts are lower bounds.
  The `deep-assistant` organisation was not in scope and was not scanned.
