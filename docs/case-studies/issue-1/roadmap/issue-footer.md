## Conventions for every roadmap issue

This issue is part of the roadmap planned in #1. The full plan, the
requirement list and the research are in the
[issue 1 case study](https://github.com/link-foundation/ui/tree/main/docs/case-studies/issue-1),
and the target design is in
[`docs/ARCHITECTURE.md`](https://github.com/link-foundation/ui/blob/main/docs/ARCHITECTURE.md).

- **Read first:** `AGENTS.md`, `docs/CONTRIBUTING.md`,
  `docs/javascript-first.md` and `docs/ARCHITECTURE.md`.
- **Links Notation first.** Every new format (documents, configuration,
  tokens, styles, animations, recordings, asset records) is Links Notation
  parsed with the official `links-notation` package (or the official port for
  Swift and Kotlin). Never hand-write a LiNo parser with regular expressions.
  JSON, CSS, JSX and so on are only import or export formats.
- **JavaScript first.** Plain ES modules (`.js`/`.mjs`) with JSDoc types;
  TypeScript declaration files (`.d.ts`) are allowed for public APIs. Swift and
  Kotlin ports must pass the same shared fixtures as the JavaScript code.
- **Tests:** `node --test` (see `package.json`). Every behaviour change has a
  test that fails before the change. Keep tests deterministic: no network, no
  real clock (inject time), no random seeds without a fixed value.
- **Quality gates:** `npm run lint`, `npm run format:check`,
  `npm run check:duplication` and `npm test` must pass. Files stay under
  1,500 lines (`scripts/check-file-line-limits.sh`).
- **Releases:** a change to a published package needs a changeset
  (`npx changeset`), as described in `docs/CONTRIBUTING.md`.
- **Licensing:** the repository is public domain (Unlicense). Our own assets
  are CC0-1.0. A third-party dependency or asset must use a permissive licence
  (MIT, ISC, BSD, Apache-2.0, CC0, CC-BY with attribution recorded) and be
  recorded as described in the licensing issue. Do not add GPL, AGPL,
  non-commercial or "source available" code or assets.
- **Accessibility:** interactive UI follows the WAI-ARIA Authoring Practices,
  works with the keyboard, respects `prefers-reduced-motion` and
  `prefers-color-scheme`, and meets WCAG 2.2 AA contrast.
- **Scope discipline:** do only what this issue asks. If you find a defect or
  a missing prerequisite, open a new issue (type Bug or Feature) and link it,
  instead of widening this pull request.
- **Done means:** every acceptance criterion is checked, CI is green, and the
  pull request description says `Fixes #<this issue>` and shows how each
  criterion was verified (command output or screenshots for UI).
