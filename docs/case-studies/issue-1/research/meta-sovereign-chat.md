# meta-sovereign chat UI: research for the associative UI framework

Research input for [issue #1](https://github.com/link-foundation/ui/issues/1).
meta-sovereign is the largest UI codebase in the organisation that already
stores its data as links. Its chat screen is the main candidate for the first
real consumer of `link-foundation/ui`.

- Repository: <https://github.com/link-foundation/meta-sovereign> (v1.2.0, about 386 MB including history and case-study data)
- Live build: <https://link-foundation.github.io/meta-sovereign/>
- Data was collected on 2026-11-01 from a sparse, blob-limited checkout and
  `gh api`. Nothing was executed. Paths below are relative to the repository
  root.

## 1. Overview

| Aspect            | Finding                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Product           | Local-first workspace for talking across messengers and job sites (Telegram, VK, email, GitHub, Upwork, ...): Chat, Operator queue, Contacts/CRM, automations, CV sync                                                                                                                                                                                                                                                                                                       |
| UI tech           | React 19 (`react` / `react-dom` ^19.3.1) **without JSX**: `React.createElement` aliased as `el(...)` everywhere. No component library: issue #25 asked for Chakra UI, but the result is hand-written components and CSS                                                                                                                                                                                                                                                      |
| Bundle            | esbuild into a committed bundle, `js/src/web/app.min.js` (4.6 MB)                                                                                                                                                                                                                                                                                                                                                                                                            |
| Styles            | One stylesheet, `js/src/web/app.css`: 13,794 lines, 280 KB, about 60 distinct custom properties, 1,114 `var(--...)` uses, 21 `@keyframes`, 13 `prefers-reduced-motion` blocks, about 200 lines with `!important`                                                                                                                                                                                                                                                             |
| Source size       | `js/src/web/`: 409 JS files (about 102k lines including the bundle). **215 of them are `chat-*.js`**                                                                                                                                                                                                                                                                                                                                                                         |
| Data model        | Everything is a link with a typed id (`msg:telegram:<chat>:<id>`, `plan:*`, `graph:*`, `reply:*`, `secret:*`). `js/src/storage/lino-store.js` writes one `lino-objects-codec` record per line, for example `(o: (id "msg:vk:1") (tokens ("msg" "vk" "1")) (body "...") ...)`, as an append-only log with tombstones and compaction. `doublets-store.js` / `dual-store.js` mirror it into doublets. `lino.js` is an older indented reader that is still used for CV documents |
| Dependencies      | `links-notation` ^0.27.1, `lino-objects-codec` ^0.9.3, `htmlparser2`. Dev: `katex`, `lottie-web`, `lino-arguments` 0.4.0. Optional: `doublets-web`, `axe-core`, `playwright`, `teleproto` 1.232.0 (MTProto)                                                                                                                                                                                                                                                                  |
| Platforms         | Browser SPA (GitHub Pages, browser-only mode). Electron 45 desktop (`desktop/electron-builder.config.cjs`). Capacitor 8 iOS/Android, which wraps the same bundle in a WebView (`mobile/README.md`, `capacitor.config.json`). Docker. Rust crates `meta-sovereign-server`, `-core` and `-wasm` (`publish = false`, server state in memory)                                                                                                                                    |
| i18n              | en / ru / hi / zh. `js/src/web/i18n.js` (about 150 LOC, `t()`, fallback to English and then to the key), 41 locale files in `js/src/web/locales/`. Docs are translated too (`*.ru.md`, `*.hi.md`, `*.zh.md`)                                                                                                                                                                                                                                                                 |
| Design references | `docs/PRODUCT-VISION.md`: "T3 Code guides visual style and configurability. Telegram guides the baseline messaging features". `docs/CHAT-REFERENCES.md` pins commits of tweb, telegram-tt, tdesktop, Signal Desktop, Element Web and t3code, with the rule "learned, never copied" (most of them are GPL/AGPL)                                                                                                                                                               |
| Quality gates     | Playwright e2e in Chromium and WebKit, axe-core WCAG 2.0 A/AA audit (`stepAxeAudit`), pixel and contrast regression checks (`docs/DELIVERY-AUDIT.md`), unit tests on pure modules                                                                                                                                                                                                                                                                                            |

### 1.1 Architecture of the chat screen

```
app.js                    React root, shell, global hooks (useAppearance, useApplyUiScale,
                          useApplyCloudTheme, LockScreen)
shell/app-shell.js        responsive nav: <=640 bottom bar, 641-1023 rail, >=1024 drawer (Material 3)
dom.js / client.js        `api`: offline-first store, discovery (discover.js), WebRTC sync, server fallback
chat-view.js              ChatScreen / ChatView: list + conversation + floating composer
  chat-state.js           useChatState: list, search, composer, typing, drafts, automations (all I/O via injected api)
  chat-model.js           PURE: chat summaries, sorting, folders, unread, delivery status, day groups
  message-parts.js        PURE: msg link -> display parts (incl. stripped-JPEG preview rebuild)
  message-text.js         PURE textTree + MessageText: Telegram entities (bold, code, spoiler, links, ...)
  chat-message.js         MessageBubble, ReplyQuote, MsgContextMenu, Delete/Pin dialogs, ForwardPicker
  chat-window.js          paged history window (PAGE_SIZE 50, prefetch 30, priority queue)
  chat-follow.js          stick-to-bottom, keep place on prepend, unread line, seen tracking
  chat-list-window.js     measured virtual list for the chat list
```

The split between **pure model modules** (`chat-model.js`, `message-parts.js`,
`message-text.js`, `wallpaper-css.js`), **state hooks** (`chat-state.js`,
`chat-window.js`) and **views** (`chat-view.js`, `chat-message.js`) is
consistent. Everything goes through an injected `api`, so screens render in
tests with a fake.

## 2. Chat UI components inventory

All files are in `js/src/web/`. Line counts are as of v1.2.0.

| Area                       | File(s)                                                                                                                           | What it does                                                                                                                                                                                                                             |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Screen                     | `chat-view.js` (1460)                                                                                                             | Conversation list plus centred column (`--chat-column: 44rem`), typing indicators, floating composer with whole-reply suggestions, `messageRuns()` sender grouping (same sender, same day, within the gap, not a service line)           |
| State                      | `chat-state.js` (1355), `chat-draft-state.js`                                                                                     | Chat list, search, composer, typing both ways, automation menu, cloud drafts                                                                                                                                                             |
| Model                      | `chat-model.js` (619)                                                                                                             | `summarizeChats`, `sortChats`, `CHAT_FILTERS`, `folderChats`, `unreadCount`, `deliveryStatus`, `dayGroup`, `typingStatus`. Pure                                                                                                          |
| Chat list row              | `chat-list.js` (398)                                                                                                              | Avatar or initials on the Telegram colour, name, mute mark, time, last sender and preview ("Sticker", "Photo"), unread badge (grey when muted), pin, archive row                                                                         |
| Sidebar                    | `chat-sidebar.js` (510)                                                                                                           | Stories strip, search, sort, tabs All/Private/Groups/Channels plus Telegram folders, archive, paged chats, global search results                                                                                                         |
| Virtual list               | `chat-list-window.js`                                                                                                             | Measured viewport after telegram-tt `viewportIds`: `listOffsets`, binary-search `indexAt`, `listRange` renders one screen of overscan above and below. CSS `content-visibility: auto` on `.chat-item`                                    |
| Message bubble             | `chat-message.js` (1439)                                                                                                          | `MessageBubble`, `MsgAvatar` (first bubble of a run in groups), `ReplyQuote` (colour bar, name, one line), forwarded header, reactions row, service lines, pending/failed/waiting states, fast reply, selection check                    |
| Rich text                  | `message-text.js` (360), `rich-text-nodes.js` (103)                                                                               | Entity formatting by UTF-16 offsets. Hashtags, cards, dates, custom emoji, formulas (KaTeX)                                                                                                                                              |
| Media                      | `chat-media.js` (1035), `lottie-sticker.js` (172)                                                                                 | Video with blurred preview, looping GIFs, round video, voice waveform, audio, sticker without a bubble, document, location, contact, poll. Lottie `.tgs` through `lottie-web` light (no `eval`), frozen when reduced motion is requested |
| Context menu and selection | `chat-selection.js` (707), `chat-drag.js` (288)                                                                                   | Telegram Desktop menu set (Reply, Quote and Reply, Edit, Pin, Copy, Forward, Delete, Select ...). Full-row multi-selection, drag-to-select ranges                                                                                        |
| Reactions                  | `chat-reactions.js` (363), `chat-quick-reaction.js`                                                                               | Per-chat allowed reactions (All/Some/None), quick reaction                                                                                                                                                                               |
| Composer                   | `chat-view.js`, `chat-composer-height.js` (43), `chat-composer-space.js` (78)                                                     | Floating composer. Auto height capped by CSS, `ResizeObserver` work deferred to `requestAnimationFrame` (WebKit loop). The message list reserves exactly the space the composer covers                                                   |
| Attach                     | `chat-attach.js` (674)                                                                                                            | Paperclip, paste or drop, a preview box, caption, "Compress images", "Group items" (albums), upload progress                                                                                                                             |
| Voice and round video      | `chat-voice.js` (477), `chat-round-record.js` (560)                                                                               | Hold-to-record, slide to lock or cancel, MediaRecorder, one-minute round video with a progress ring                                                                                                                                      |
| Emoji, stickers, GIFs      | `chat-emoji.js` (966), `chat-stickers.js` (971)                                                                                   | Panel with recents, categories, search, sticker sets, saved GIFs                                                                                                                                                                         |
| Threads                    | `chat-topics.js` (254), `chat-comments.js` (351), `chat-channel-dm-thread.js`                                                     | Forum topic strip, channel comments / reply threads panel with its own composer                                                                                                                                                          |
| Navigation in history      | `chat-window.js` (659), `chat-jump.js` (480), `chat-days.js` (454), `chat-follow.js` (352)                                        | Paged window. Jump far back with a `ceiling`, then `loadNewer` / `toNewest`. Floating date and calendar picker. Unread line                                                                                                              |
| Misc. chat                 | `chat-pinned.js`, `chat-schedule.js`, `chat-poll.js`, `chat-wallpaper.js` + `wallpaper-css.js` (158), `chat-layout-trace.js` (86) | Pinned bar, scheduled messages, polls, wallpapers through `--wp-*` CSS variables, geometry-only diagnostics                                                                                                                              |
| App chrome                 | `shell/app-shell.js` (270), `panel-resize.js` (97), `shortcuts.js` (237), `icons.js` (587), `dialog-focus.js`, `tutorial.js`      | Responsive navigation, draggable dividers with keyboard control and saved widths, Ctrl/Cmd/Alt chords, Lucide-shaped line icons (ISC) in `currentColor`, focus traps, spotlight tutorial                                                 |
| Appearance                 | `appearance.js`, `cloud-themes.js` (425), `ui-scale.js` (167), `effects.js` (265)                                                 | See section 3.2                                                                                                                                                                                                                          |

## 3. Patterns worth adopting

### 3.1 Architecture

- **Pure model, thin view.** Display shaping (`message-parts.js`,
  `message-text.js`, `chat-model.js`) has no DOM and no React, so it can be unit
  tested. In `link-foundation/ui` the same split should become LiNo-in, LiNo-out
  transforms that every target (React, React Native, Vue, SwiftUI, Compose)
  reuses.
- **Injected `api`.** Every screen takes its data source as a prop. This is the
  seam the WYSIWYG editor needs to render components against fake data.
- **Links as the data model.** Messages, plans, graphs and replies are already
  links stored as LiNo. A LiNo UI description sitting next to LiNo data is the
  natural next step.
- **The `el()` style without JSX** makes the component tree a plain function of
  data. That is easy to generate from a LiNo element tree and easy to emit from
  a code generator.

### 3.2 Theming and configurability

The model: modes × skins × tokens.

- `appearance.js` sets `<html data-theme-mode>` (system, light, dark, or auto,
  where auto means light 07:00-19:00), `data-theme` (the resolved mode) and
  `data-skin`.
- Skins are `t3` (default), `telegram`, `whatsapp` and `signal`, defined at
  `app.css` around lines 3310-3400.
- Choices are stored in localStorage (`metaSovereignTheme`, `metaSovereignSkin`).

There is a semantic token layer:

- General: `--bg`, `--bg-elev`, `--bg-input`, `--bg-active`, `--border`,
  `--text`, `--text-muted`, `--text-subtle`, `--accent`, `--accent-fill`,
  `--accent-bg`, `--danger`, `--link`, `--shadow`.
- Sizing: `--control-h: 2.25rem`, `--control-gap`, `--control-pad`,
  `--radius: 8px`, `--topbar-h`, `--bottom-nav-h`,
  `--safe-bottom: env(safe-area-inset-bottom)`.
- Chat: `--chat-bg`, `--chat-sidebar`, `--chat-accent`, `--bubble-in` /
  `-text` / `-pad`, `--bubble-out` / `-text`, `--bubble-radius` (Telegram 15px,
  WhatsApp 7.5px, Signal 18px), `--bubble-tail`.

This is effectively the issue's "themes that reproduce classical UIs", in its
first form. These token names are the seed vocabulary for the LiNo theme
format (see `links-notation-ecosystem.md` section 6.3).

Other patterns in the same area:

- **Accessible accents.** Filled accents are darkened to keep 4.5:1 contrast,
  and shared filled-control tokens fixed white-on-white failures across badges,
  tabs and Mini App buttons (`docs/DELIVERY-AUDIT.md`).
- **Runtime themes from data.** `cloud-themes.js` maps a Telegram cloud
  theme's colours (accent, outgoing bubble, light or dark) onto the CSS tokens.
  In other words, theme application is already "data in, token overrides out".
- **Scale through rem.** `ui-scale.js` sets the `<html>` font-size to 100-200 %
  and a separate message text size. Everything is sized in rem, so one knob
  scales the whole UI.
- **Adaptive effects.** `effects.js` runs a bounded frame-time probe and sets
  `<html data-effects="reduced">` on slow GPUs. It also honours
  `prefers-reduced-motion`, `prefers-reduced-transparency` and
  `prefers-color-scheme`.
- **Wallpapers as data.** `{ kind: 'none' | 'telegram' | 'file' }` is turned
  into `--wp-*` variables by a pure function.

### 3.3 Performance

- The chat list uses a **measured virtual list** with binary-search offsets
  and one screen of overscan, plus `content-visibility: auto` and
  `contain-intrinsic-size`.
- **Paged history**, store first and network second:
  - pages are read from the local store before the network (Telegram)
  - a priority prefetch queue (`PAGE_SIZE 50`, `PREFETCH_SIZE 30`,
    `PREFETCH_QUEUE 40`, `STALL_MS 5000`, `HOLD_MS 30000`)
  - unread chats are prefetched
  - when jumping far back, a `ceiling` keeps newer messages from showing above
    a gap
- **Avatars.**
  - Read-ahead covers one viewport, with at most two uncached loads at once.
  - The URL cache is limited to 512 entries.
  - Initials are the fallback, so there are no spinner storms
    (`docs/UI-STATES.md`).
- **Optimistic sends.** The pending bubble and directory preview update at
  once, and an outbox with a stable `clientId` handles retries.
- The **geometry-only layout trace** (`chat-layout-trace.js`) records
  diagnostics without logging message text.

### 3.4 Interaction rules worth codifying

These come from `docs/PRODUCT-VISION.md`:

- Local and immediate interactions.
- A context-menu target is distinct from a multi-selection.
- Jumps load the history around the target and briefly highlight it.
- A missing provider capability is never shown as success.
- Keyboard parity: a skip link, visible focus, shortcuts that never steal plain
  keys from fields, and focus traps in dialogs.

These rules belong in the framework's component contracts and tests, not only
in one app.

## 4. Duplication candidates (what `link-foundation/ui` should own)

| Candidate                    | Today in meta-sovereign                                                                  | Proposed generic component / module                                                                                                                     |
| ---------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Design tokens and skins      | Hard-coded in `app.css` (`:root[data-skin=...]`) plus `appearance.js`                    | `theme` links in LiNo, compiled to CSS variables and native themes. Skins become data files: `t3.lino`, `telegram.lino`, `whatsapp.lino`, `signal.lino` |
| Virtual list                 | `chat-list-window.js`, part of `chat-window.js`                                          | `VirtualList` (measured, bidirectional, anchor-preserving)                                                                                              |
| Paged bidirectional history  | `chat-window.js`, `chat-jump.js`, `chat-follow.js`                                       | `Timeline` / `MessageStream` with `loadOlder`, `loadNewer`, `jumpTo`, ceiling, stick-to-bottom                                                          |
| Message bubble family        | `chat-message.js`, `chat-media.js`                                                       | `Bubble`, `ReplyQuote`, `ReactionBar`, `MediaTile`, `ServiceLine`, `DeliveryTicks`                                                                      |
| Composer                     | `chat-view.js`, `chat-composer-*.js`, `chat-attach.js`, `chat-voice.js`, `chat-emoji.js` | `Composer` with slots (attach, emoji, voice) and an auto-grow `TextArea` with a reserved-space contract                                                 |
| Rich text                    | `message-text.js`, `rich-text-nodes.js`                                                  | `RichText` driven by an entity list (offsets are UTF-16 code units)                                                                                     |
| Context menu and selection   | `chat-selection.js`, `chat-drag.js`, `menuPlace()`                                       | `ContextMenu` (placement maths), `SelectionModel` (range and drag)                                                                                      |
| Date separators and calendar | `chat-days.js`                                                                           | `DaySeparator`, `StickyDate`, `CalendarPicker`                                                                                                          |
| Resizable panes              | `panel-resize.js`                                                                        | `Split` / `ResizeHandle` with keyboard control and persistence (the `split` element in the LiNo sketch)                                                 |
| Responsive shell             | `shell/app-shell.js`                                                                     | `AppShell` with Material 3 breakpoints (bottom bar, rail, drawer)                                                                                       |
| Scale and effects            | `ui-scale.js`, `effects.js`                                                              | Framework-level `Settings` for scale, motion and transparency                                                                                           |
| Icons                        | `icons.js` (Lucide shapes, ISC)                                                          | Icon registry addressed by name. Use a public-domain set, as the issue asks: Lucide is ISC, not public domain                                           |
| i18n                         | `i18n.js` plus JSON locales                                                              | Replace with lino-i18n (`.lino` catalogues, React adapter)                                                                                              |
| Settings persistence         | localStorage keys per feature                                                            | One LiNo settings document resolved through lino-arguments (defaults, file, user)                                                                       |

## 5. Problems, bugs and limitations

### 5.1 From the issue tracker

<https://github.com/link-foundation/meta-sovereign/issues>: 25 issues, 1 open,
and 30 PRs. The UI-related issues and their state:

- [#25](https://github.com/link-foundation/meta-sovereign/issues/25) asked for:
  - mobile-first design
  - full translation
  - a dedicated connections page
  - a tutorial based on real UI elements
  - Apple-glass translucency
  - **Chakra UI + React**

  It was closed by PR #26 (mobile-first shell, Connections, tutorial spotlight),
  but Chakra UI was not adopted. The UI stayed hand-written CSS.

- [#27](https://github.com/link-foundation/meta-sovereign/issues/27): "simplify
  the UI, and reduce repeating ourselves (DRY in code and UI/UX)". The author
  writes that the earlier vision was "partially ignored". This is direct
  evidence of the duplication problem that a shared component framework should
  solve.
- [#10](https://github.com/link-foundation/meta-sovereign/issues/10) (hide
  empty sections) and [#13](https://github.com/link-foundation/meta-sovereign/issues/13)
  (tutorial progress lost after refresh, fixed in PR #14) are UI-state
  persistence bugs.
- [#18](https://github.com/link-foundation/meta-sovereign/issues/18): i18n was
  added later rather than designed in. Strings were retrofitted.
- [#42](https://github.com/link-foundation/meta-sovereign/issues/42) (open)
  is about provider coverage, not UI.

### 5.2 Observed in the code and docs

1. **CSS monolith.** `app.css` has 13.8k lines and about 200 `!important` lines, plus
   overrides that depend on order. Some skin rules sit thousands of lines away
   from their definitions, for example
   `:root[data-theme='dark'][data-skin='t3']` at around line 13,589 versus the
   skin block at around line 3,317. There is no scoping (no CSS modules or
   layers), and the tokens are not machine-readable outside CSS.
2. **Skins are code, not data.** A new classical theme requires CSS edits in
   several places. Users cannot share or edit skins as files. Preferences live
   in scattered localStorage keys, not in LiNo, which contradicts the project's
   own "everything is links" model.
3. **Bundle size.** `app.min.js` is 4.6 MB, committed, and served whole. There
   is no route-level code splitting, even though KaTeX, lottie-web and the
   emoji and sticker panels are heavy and rarely used.
4. **Platform reach.** Mobile is a Capacitor WebView around the same bundle:
   - no native components
   - no React Native, Swift or Kotlin UI, all of which the issue asks for

   Desktop is Electron 45. Both inherit the web bundle's size and performance.

5. **Fragile layout areas.** These need dedicated fixes and regressions, which
   shows how hard they are to get right:
   - floating composer clearance and overlap at the live tail
   - typing / header overlap (`docs/DELIVERY-2026-10-31.md`)
   - WebKit `ResizeObserver` loops (`chat-composer-height.js`)
   - white-on-white selection controls (`docs/DELIVERY-AUDIT.md`)
6. **Tight coupling to Telegram semantics.** Bubble, media and selection
   components encode Telegram concepts directly (`msg:telegram:*`, entities,
   topics, `.tgs`). Other providers get Telegram's shape. A framework needs
   provider-neutral component contracts, with capabilities passed as data.
7. **Licensing.**
   - Behaviour is "learned, never copied" from GPL/AGPL clients (tweb,
     telegram-tt, tdesktop, Signal, Element).
   - Icons are Lucide (ISC).
   - Neither is public domain. The framework must source public-domain assets
     separately, as the issue requires.
8. **Server limits.** The Rust server crates are `publish = false`, with server
   state in memory. The npm package is not published, so other projects cannot
   reuse any component today.
9. **No visual editor.** Appearance is changed only through settings panels.
   There is no inspector, no live token editing and no dev/config overlay.
   These are features the issue explicitly wants (WYSIWYG, dev/config mode).

## 6. Migration notes (meta-sovereign onto `link-foundation/ui`)

1. **Tokens first, with zero visual change.**
   - Extract the ~60 custom properties and the four skin blocks from
     `app.css` into `themes/*.lino` (token names unchanged).
   - Generate a CSS file of `:root[data-skin=...][data-theme=...]` variables
     from them.
   - meta-sovereign keeps its existing selectors. Only the source of truth
     moves.

   Validate with the existing Playwright pixel and contrast checks.

2. **Settings as LiNo.**
   - Replace the localStorage keys (`metaSovereignTheme`, `metaSovereignSkin`,
     scale, effects, locale) with one settings link, resolved with
     lino-arguments and stored in the existing lino store.
   - Keep localStorage as a cache.
3. **Leaf components next.** Extract the pure modules first, because they have
   no DOM coupling and already have unit tests:
   - `message-text.js` becomes `RichText`
   - `message-parts.js` becomes a media model
   - `chat-model.js` provides date grouping and delivery status
   - `wallpaper-css.js`

   Then extract `panel-resize.js` (`Split`), `chat-list-window.js`
   (`VirtualList`) and `menuPlace` (`ContextMenu`).

4. **Bubble and composer behind a provider-neutral contract.**
   - Define `Bubble` / `Composer` props in a LiNo schema (capabilities such as
     `can-edit`, `can-react` and `max-attachments` as data).
   - Adapt the Telegram specifics in meta-sovereign, not in the framework.
5. **i18n swap.** Convert `js/src/web/locales/*` to lino-i18n catalogues with
   its CLI. Keep the `t()` signature through the lino-i18n React adapter.
6. **Screens declared in LiNo.**
   - Describe the shell and chat layout (`split`, `list`, `stack`) as LiNo,
     rendered by the framework's React target.
   - Keep the hand-written behaviour hooks (`useChatState`, `chat-window.js`)
     as named behaviours that the LiNo document references, for example
     `(behavior chat-window)`.
7. **Constraints to preserve.**
   - no JSX requirement (the `el()` style is fine for generated code)
   - CSP-friendly: no `eval`, which lottie-web light already respects
   - axe-core gating
   - Chromium and WebKit e2e
   - reduced-motion / transparency / effects switches
   - rem-based scaling
   - offline-first, immediate interactions
8. **Risks.**
   - 13.8k lines of CSS with order-dependent overrides. Migrate per area and
     diff screenshots.
   - Behaviour hidden in CSS (`content-visibility`, composer reserve) must
     become explicit component props.
   - The 215 chat modules change often, so
     extraction should happen upstream-first with thin re-exports to avoid
     long-lived forks.
