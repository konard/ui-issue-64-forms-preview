# Issue 1 — Roadmap issue plan

This folder is the source of every GitHub issue that issue #1 asked for
(requirements R32–R35 in [`../requirements.md`](../requirements.md)).

- [`issues/`](issues/) holds one Markdown file per GitHub issue. The front
  matter carries the key, title, issue type, labels, phase, the keys of the
  blocking issues and the requirement IDs.
- [`issue-footer.md`](issue-footer.md) is appended to every issue body. It holds
  the conventions every implementer (human or AI agent) must follow.
- [`created-issues.json`](created-issues.json) maps each key to the GitHub
  issue number and ID. It is written by the creation script.
- [`../../../../experiments/issue-1/create-roadmap-issues.mjs`](../../../../experiments/issue-1/create-roadmap-issues.mjs)
  creates the issues (bugs first, then features in key order), resolves
  `{{KEY}}` references to `#number`, adds the "blocked by" relations with the
  GitHub issue dependencies API, attaches every issue as a sub-issue of the
  tracking issue, and generates [`../../../ROADMAP.md`](../../../ROADMAP.md).
- [`../../../../experiments/issue-1/verify-roadmap-issues.mjs`](../../../../experiments/issue-1/verify-roadmap-issues.mjs)
  reads the created issues back from GitHub and compares title, type, labels,
  "blocked by" relations and sub-issues with the source files.
- [`logs/`](logs/) keeps the output of the creation runs and of the
  verification.

## Created issues

On 2026-11-01 the script created 73 issues:

- the 6 bugs B01–B06 as
  [#3](https://github.com/link-foundation/ui/issues/3)–[#8](https://github.com/link-foundation/ui/issues/8)
  (type `Bug`, label `bug`);
- the 66 features F01–F66 as
  [#9](https://github.com/link-foundation/ui/issues/9)–[#74](https://github.com/link-foundation/ui/issues/74)
  (type `Feature`, label `enhancement`);
- the tracking task T01 as
  [#75](https://github.com/link-foundation/ui/issues/75) (type `Task`), with
  the other 72 issues as its sub-issues.

The issues are connected by 102 native "blocked by" relations.
[`ROADMAP.md`](../../../ROADMAP.md) lists them by phase.

The first run stopped at the 10-minute limit of the shell session while it
was adding sub-issues ([`logs/create-roadmap-issues-run1.log`](logs/create-roadmap-issues-run1.log)).
The script is idempotent, so the second run skipped what existed and finished
the sub-issues ([`logs/create-roadmap-issues-run2.log`](logs/create-roadmap-issues-run2.log)).
The verification found no difference between GitHub and the source files
([`logs/verify-roadmap-issues.log`](logs/verify-roadmap-issues.log)).

To add an issue later, add a file to `issues/`, a row to the plan below, and
run the script again. It creates only the missing issues and relations.

## Rules used to cut the issues

1. **Bugs first.** Every defect found while studying this repository is a
   `Bug` issue with key `Bxx`. Bugs have no feature blockers, so they can be
   done first and in parallel.
2. **Features next**, keyed `Fxx` in delivery order. The key order is a
   suggested order only; the real constraint is the dependency graph.
3. **Parallel by default.** An issue is blocked only by issues whose output it
   directly consumes (a package API, a file format, a deployed site). Shared
   knowledge is a reference, not a blocker.
4. **One reviewable pull request per issue.** An issue that would need more
   than about 1,500 changed lines of source is split.
5. **Written for a less capable agent.** Each body says why, what is in and
   out of scope, which files to create, step-by-step instructions, checkable
   acceptance criteria, exact verification commands, prior art and the
   requirement IDs it delivers.

## Issue body template

Every file in `issues/` uses these sections, in this order:

```markdown
---
key: F06
title: 'ui-core: parse Links Notation into the UI element tree'
type: Feature
labels: [enhancement]
phase: 2
blocked_by: [F01, F03]
requirements: [R2, R3, R6]
---

## Context

## Goal

## Scope

### In scope

### Out of scope

## Dependencies

## Step-by-step plan

## Files to create or change

## Acceptance criteria

## How to verify

## Prior art and libraries

## References
```

## Issue list

`Blocked by` lists the issues that must be merged first. Each row is
connected with the GitHub "blocked by" relation when the issues are created.

### Phase 0 — Bugs

| Key | Title                                                                         | Blocked by | Requirements |
| --- | ----------------------------------------------------------------------------- | ---------- | ------------ |
| B01 | Repository still identifies itself as the JavaScript template                 | —          | R23, R36     |
| B02 | Inherited template case studies and analyses collide with our issue numbers   | —          | R28, R36     |
| B03 | Example app deploy fails because GitHub Pages is not enabled                  | —          | R24          |
| B04 | Preview image regeneration fails: `gh` is missing in the Playwright container | —          | R24          |
| B05 | Release preflight fails: no npm package and no `NPM_TOKEN`                    | B01        | R18          |
| B06 | Security workflow fails because the dependency graph is disabled              | —          | R25          |

### Phase 1 — Foundation

| Key | Title                                                           | Blocked by | Requirements       |
| --- | --------------------------------------------------------------- | ---------- | ------------------ |
| F01 | Monorepo workspace for the framework packages                   | B01        | R18, R23           |
| F02 | Licensing and third-party asset records (REUSE, SPDX, CI)       | —          | R25, R26, R27      |
| F03 | UI dialect specification v0 with conformance fixtures           | —          | R2, R3, R6, R7, R8 |
| F04 | Design guidelines digest: Material 3, Fluent 2, Apple HIG, ARIA | —          | R13, R15           |
| F05 | Visual regression and accessibility test infrastructure         | F01        | R13, R24           |

### Phase 2 — Core (JavaScript)

| Key | Title                                                                 | Blocked by | Requirements     |
| --- | --------------------------------------------------------------------- | ---------- | ---------------- |
| F06 | ui-core: parse Links Notation into the UI element tree                | F01, F03   | R2, R3, R6, R8   |
| F07 | ui-core: typed values, units, colours and references                  | F06        | R2, R3, R6       |
| F08 | ui-store: links network store with stable IDs and undo/redo           | F06        | R3, R5, R9       |
| F09 | ui-store: IndexedDB persistence compatible with doublets-web          | F08        | R9, R11          |
| F10 | ui-config: layered configuration and override patches                 | F08        | R2, R9, R12      |
| F11 | ui-tokens: design tokens in LiNo with CSS, DTCG, Swift, Kotlin output | F07        | R2, R14, R15     |
| F12 | ui-style: style rules, states and responsive conditions               | F07, F11   | R2, R6, R14      |
| F13 | ui-i18n: localisation with lino-i18n                                  | F10        | R2, R23          |
| F14 | Source-preserving LiNo edits (comments and layout kept)               | F06        | R5, R7, R12      |
| F15 | Settings schema engine: validation, presets, diff-only sharing        | F10        | R2, R9, R11, R12 |

### Phase 3 — Rendering

| Key | Title                                               | Blocked by | Requirements |
| --- | --------------------------------------------------- | ---------- | ------------ |
| F16 | ui-dom: reference DOM renderer with custom elements | F08, F12   | R3, R18      |
| F17 | HTML/DOM to LiNo importer                           | F06        | R6, R9, R23  |
| F18 | ui-react: React adapter                             | F16        | R19          |
| F19 | ui-vue: Vue adapter                                 | F16        | R20          |
| F20 | ui-react-native: React Native renderer              | F18        | R19          |
| F21 | Swift Links Notation parser                         | F03        | R21, R8      |
| F22 | ui-swift: SwiftUI renderer                          | F21, F11   | R21          |
| F23 | Kotlin Links Notation parser                        | F03        | R22, R8      |
| F24 | ui-kotlin: Jetpack Compose renderer                 | F23, F11   | R22          |

### Phase 4 — Components

| Key | Title                                                                     | Blocked by | Requirements  |
| --- | ------------------------------------------------------------------------- | ---------- | ------------- |
| F25 | Behaviour state machines, actions registry and accessibility              | F16        | R13, R15      |
| F26 | Basic controls                                                            | F25        | R13, R15      |
| F27 | Overlays and navigation (dialog, popover, menu, tabs, toast, radial menu) | F25        | R13, R15      |
| F28 | Layout and windowing (stack, grid, split panes, docking, windows)         | F16        | R10, R13, R14 |
| F29 | Data display: lists, trees, tables, virtualisation                        | F25        | R13           |
| F30 | Chat UI kit (from meta-sovereign and formal-ai)                           | F26, F29   | R17, R23      |
| F31 | Charts                                                                    | F16        | R13           |
| F32 | Diagrams (Mermaid and LiNo diagrams)                                      | F16        | R13           |
| F33 | Single link visualisation (from links-visuals)                            | F16        | R16           |
| F34 | Links network visualisation (layouts, interaction, worker)                | F33, F08   | R16           |
| F35 | Universal Links Notation to network visualisation converter               | F34        | R16           |
| F36 | Icons and asset pipeline                                                  | F02, F16   | R13, R26, R27 |
| F37 | Settings panel generated from the settings schema                         | F15, F26   | R9, R11, R12  |
| F38 | Code and LiNo text editor component                                       | F26        | R5, R13       |

### Phase 5 — Themes

| Key | Title                                                                | Blocked by    | Requirements |
| --- | -------------------------------------------------------------------- | ------------- | ------------ |
| F39 | Theme engine: nested themes, colour schemes, contrast, motion        | F11, F12, F26 | R14, R15     |
| F40 | Material 3 theme and MUI mapping                                     | F39, F04      | R14, R15     |
| F41 | Fluent 2 theme                                                       | F39, F04      | R14, R15     |
| F42 | Apple HIG theme                                                      | F39, F04      | R14, R15     |
| F43 | Classic themes: deepcase versions, konard.github.io, formal-ai skins | F39, F28      | R14          |

### Phase 6 — Animation

| Key | Title                                      | Blocked by | Requirements |
| --- | ------------------------------------------ | ---------- | ------------ |
| F44 | ui-animation: animation model and player   | F12, F16   | R4, R6       |
| F45 | Animation and interaction recorder, replay | F44, F08   | R4, R7       |
| F66 | ui-sound: UI sound themes with Web Audio   | F10, F25   | R13, R14     |

### Phase 7 — Development mode and designer

| Key | Title                                                     | Blocked by         | Requirements |
| --- | --------------------------------------------------------- | ------------------ | ------------ |
| F46 | Development/configuration mode inspector overlay          | F10, F16           | R9, R11      |
| F47 | "Make these the defaults": agent hand-off and share links | F46                | R7, R12      |
| F48 | WYSIWYG designer                                          | F46, F28, F26, F14 | R5, R10      |
| F49 | Animation timeline editor                                 | F48, F45           | R4, R5, R10  |
| F50 | Development mode for pages not built with the framework   | F46, F17           | R9, R23      |

### Phase 8 — Interoperability

| Key | Title                                                                | Blocked by | Requirements |
| --- | -------------------------------------------------------------------- | ---------- | ------------ |
| F51 | Importers: JSX, MUI and Vue single-file components via meta-language | F17        | R6, R15, R23 |
| F52 | Code exporters: React, Vue, SwiftUI and Compose source               | F18, F19   | R6, R19, R20 |
| F53 | Interop with A2UI, Adaptive Cards, JSON Forms and Lottie             | F06        | R6           |

### Phase 9 — Documentation and demo site

| Key | Title                                                | Blocked by         | Requirements |
| --- | ---------------------------------------------------- | ------------------ | ------------ |
| F54 | Documentation and demo site built with the framework | B03, F16, F26, F39 | R24          |
| F55 | Component gallery and live playground                | F54, F46           | R24, R7      |
| F56 | Contributor guide and issue templates for AI agents  | F01                | R35          |

### Phase 10 — Migration of existing projects

| Key | Title                                                  | Blocked by    | Requirements   |
| --- | ------------------------------------------------------ | ------------- | -------------- |
| F57 | Migration playbook and MUI-to-framework mapping guide  | F26, F39      | R15, R23       |
| F58 | Migrate konard.github.io                               | F34, F37, F46 | R1.1, R9, R23  |
| F59 | Migrate links-visuals                                  | F33           | R1.4, R23      |
| F60 | Migrate meta-sovereign chat                            | F30           | R1.7, R17, R23 |
| F61 | Migrate formal-ai                                      | F30, F13, F37 | R1.8, R23      |
| F62 | Migrate deepcase                                       | F43, F34      | R1.5, R14, R23 |
| F63 | Migrate anime-avatar                                   | F37, F45      | R1.3, R23      |
| F64 | Migrate immortality                                    | F37, F44, F66 | R1.2, R23      |
| F65 | Migrate the remaining UI projects of our organisations | F57           | R1.9, R23      |

### Tracking

| Key | Title                             | Type |
| --- | --------------------------------- | ---- |
| T01 | Roadmap: associative UI framework | Task |

T01 lists every issue above as a GitHub sub-issue. It is deliberately not a
sub-issue of #1: issue #1 is the planning issue, closed by the pull request
that adds this folder, and its sub-issues would otherwise be part of that pull
request's required scope.
