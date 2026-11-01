# Issue 1 — Requirements Inventory

Every requirement below is quoted or paraphrased from
[issue #1](https://github.com/link-foundation/ui/issues/1) (raw copy:
[`data/issue-1.json`](data/issue-1.json)). Each one has a stable ID, so the
solution plan ([`solutions.md`](solutions.md)), the roadmap
([`../../ROADMAP.md`](../../ROADMAP.md)) and every GitHub issue created for
the roadmap can point back to the requirement it delivers.

`Scope` is **plan** for requirements that this planning pull request must
finish, and **deliver** for requirements that roadmap issues will implement
after this pull request is merged.

## A. Sources that must be absorbed

| ID    | Requirement                                                                                                                                                         | Scope |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- |
| R1.1  | Take all needs and best practices from `konard/konard.github.io` ("best UI/UX configurability so far and links network visualization").                             | plan  |
| R1.2  | Take all needs and best practices from `konard/immortality`.                                                                                                        | plan  |
| R1.3  | Take all needs and best practices from `konard/anime-avatar`.                                                                                                       | plan  |
| R1.4  | Take all needs and best practices from `konard/links-visuals` ("reference visualizations for single link and UI/UX closest to links editor").                       | plan  |
| R1.5  | Take all needs and best practices from `deep-foundation/deepcase` (associative OS UI/UX).                                                                           | plan  |
| R1.6  | Take all needs and best practices from `link-foundation/links-notation` (later a universal converter from Links Notation to a UI visualization of a links network). | plan  |
| R1.7  | Take all needs and best practices from `link-foundation/meta-sovereign` ("best chat UI we have for messaging in Telegram so far").                                  | plan  |
| R1.8  | Take all needs and best practices from `link-assistant/formal-ai` ("lots of UI/UX needs here, yet the UI/UX not the best possible").                                | plan  |
| R1.9  | Review the other repositories of `konard`, `deep-foundation`, `link-foundation` and `link-assistant`.                                                               | plan  |
| R1.10 | Use everything from formal-ai's `docs/associative-tech-stack.md` where possible.                                                                                    | plan  |

## B. Language and model

| ID  | Requirement                                                                                                                                                                    | Scope   |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------- |
| R2  | Deeply **configurable** through Links Notation: a universal configuration language.                                                                                            | deliver |
| R3  | Deeply **representable** through Links Notation: a DOM-like document language.                                                                                                 | deliver |
| R4  | **Animation recording**, with recordings stored as Links Notation.                                                                                                             | deliver |
| R5  | A WYSIWYG editor based entirely on Links Notation.                                                                                                                             | deliver |
| R6  | Any other UI/UX framework is "just" a Links Notation document (a links network) describing configuration, document structure, animations and styles in **one single dialect**. | deliver |
| R7  | Use the simplest possible description, which is **sharable by default**.                                                                                                       | deliver |
| R8  | Prefer links theory and Links Notation over everything else.                                                                                                                   | deliver |

## C. Editing experience

| ID  | Requirement                                                                                                                                        | Scope   |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| R9  | Modify the UI/UX on the fly on any of our websites (landing pages, apps), as already done in `konard.github.io`.                                   | deliver |
| R10 | Full support for an industry-leading WYSIWYG editor, similar to Visual Studio and other easy-to-use top UI/UX frameworks — "but we do it our way". | deliver |
| R11 | The framework can enter a **development and/or configuration mode** in which every UI/UX element can be fully configured visually.                 | deliver |
| R12 | Easy to explain changes to agents: reconfigure any UI, then ask an agent to make those settings the defaults.                                      | deliver |

## D. Components and themes

| ID  | Requirement                                                                                                                                           | Scope   |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| R13 | Own all traditional UI/UX elements: basic controls, charts, diagrams "and so on".                                                                     | deliver |
| R14 | Support all classical UI/UX as **themes**, so previous versions (for example of deepcase) can be reproduced visually as nested/tabbed Links Notation. | deliver |
| R15 | Use the UI/UX guidelines from Google, Microsoft and Apple, so migrating from Material UI and other top frameworks is easy.                            | deliver |
| R16 | Links network visualization (single link and network), later a universal converter from Links Notation to a UI visualization of a links network.      | deliver |
| R17 | The best chat UI patterns (from meta-sovereign) are part of the framework.                                                                            | deliver |

## E. Platforms and adoption

| ID  | Requirement                                                                                                                                                               | Scope   |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| R18 | Usable from plain JavaScript.                                                                                                                                             | deliver |
| R19 | Usable from React.js and React Native.                                                                                                                                    | deliver |
| R20 | Usable from Vue.js.                                                                                                                                                       | deliver |
| R21 | The same framework in Swift.                                                                                                                                              | deliver |
| R22 | The same framework in Kotlin.                                                                                                                                             | deliver |
| R23 | Every place where we use UI/UX is easy to migrate to this system; anything duplicated across our projects moves here, so project code gets simpler for humans and agents. | deliver |
| R24 | Our own GitHub Pages documentation and demo website, built with our own UI/UX framework.                                                                                  | deliver |

## F. Licensing

| ID  | Requirement                                                                                                                          | Scope   |
| --- | ------------------------------------------------------------------------------------------------------------------------------------ | ------- |
| R25 | Fully public domain (the repository uses the Unlicense).                                                                             | deliver |
| R26 | Our own assets are fully public domain.                                                                                              | deliver |
| R27 | Third-party icons/assets may be used, but each one links to its source and states its legal terms (copyright, license, attribution). | deliver |

## G. Planning deliverables (this pull request)

| ID  | Requirement                                                                                                                                        | Scope |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ----- |
| R28 | Collect the issue-related data into `./docs/case-studies/issue-1`.                                                                                 | plan  |
| R29 | A deep case-study analysis, including online research for additional facts and data.                                                               | plan  |
| R30 | A list of each and every requirement from the issue (this file).                                                                                   | plan  |
| R31 | Possible solutions and solution plans for each requirement, including known existing components/libraries that solve similar problems or can help. | plan  |
| R32 | Plan every issue first; all issues are created **in this repository**.                                                                             | plan  |
| R33 | Each issue is clearly marked as a **feature** or a **bug**; bugs are scheduled first, then features.                                               | plan  |
| R34 | Prefer issues that can run in parallel; where order matters, mark which issue blocks which through the **GitHub native API** (issue dependencies). | plan  |
| R35 | Every issue is explained in enough detail that a less capable AI agent can still produce a valid result.                                           | plan  |
| R36 | The scope of issue #1 is documentation and planning; after merge, the roadmap issues are delivered one by one.                                     | plan  |
