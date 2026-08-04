# Top bar: offline chip removed, Display (text size + width) added

## Offline chip
- Removed the "Offline-ready" chip from the top bar entirely, along with its CSS.
  The bar is now `☰ · breadcrumb · Home · Focus · Display · theme`.

## Display control (text size and text width)
- Revived the reader controls that [DRAWER_READING_GUARDRAILS_UPDATE.md](DRAWER_READING_GUARDRAILS_UPDATE.md)
  retired, as one "Aa Display" button sitting with the other view controls.
  Icon + label on desktop, 36px icon-only on tablet and phone.
- Dropdown anchored under the button above 620px; bottom sheet with a scrim
  below it. The panel is portalled to `<body>` because the top bar's
  `backdrop-filter` makes it a containing block for fixed positioning and some
  breakpoints also clip it with `overflow: hidden`.
- **Text size** — small / standard / large / extra large, as a `--reading-scale`
  factor (0.92 / 1 / 1.14 / 1.28) applied to the theme's own type tokens, so
  headings, lead, prose, code, tables, cards, callouts and quizzes all move
  together and the responsive clamps still apply. The "ONE TYPE SCALE"
  normalisation layer in `office-theme.css` carries the factor too — without it
  that layer would pin headings and only body copy would respond.
- **Text width** — Cozy / Standard / Wide / Full. Standard is the layout as
  shipped, so nothing changes for a reader who never opens the panel. Wide and
  Full drop the contents rail on desktop; on a phone, where the column is
  already the viewport, they change the gutter instead (Full ≈ 9px, Cozy 26px).
- Full-bleed text is **not** the default: on a 390px phone it buys about 7% more
  line width and spends the margin that keeps text off the screen edge, and on
  wide screens long measures slow reading. It is one tap away for anyone who
  wants it, per device, and persists.
- Focus mode's own Narrow/Medium/Wide/Full strip is gone. The Display panel owns
  text width everywhere and maps its choice onto `--focus-measure`, so there is
  one setting instead of two that could disagree. The button docks into the focus
  bar next to Exit focus.

## Revision: Alignment added, Text width scoped to focus mode

The four width steps did nothing outside focus mode, and it was visible: Cozy and
Standard rendered identically, Wide and Full only removed the contents rail while
the column stayed at 1040px. The cause is the "ONE TYPE SCALE" layer in
`office-theme.css`, which pins `body:not(.focus-mode) .content` to
`max-width: var(--content-max) !important` as the single source of truth for
reading width across five stylesheets. Focus mode is excluded from that layer and
owns `--focus-measure`, which is why the steps work there and only there.

Rather than punch a hole in that layer, the control is now offered where the
measure genuinely varies:

| Setting | Regular mode | Focus mode | Below 861px |
| --- | --- | --- | --- |
| Text size | yes | yes | yes |
| Text width | — | yes (Standard / **Wide** / Full) | — |

*(An Alignment control shipped briefly and has been removed — see Revision 2.)*

- **Alignment (Left / Justified)** is new and available everywhere. Justification
  covers running prose only — headings, code, tables and chips keep their own
  alignment, and justifying a two-word table cell just opens gaps.
- **Words are never split.** `hyphens: auto` shipped with the first version of
  this and was wrong: it produced breaks like "nor- / mally" mid-paragraph, and
  a hyphen the reader has to reassemble costs more than the tighter spacing buys.
  Justified prose is now `hyphens: manual`, so the browser distributes the slack
  between words with `text-justify: inter-word`. The single exception is a token
  longer than the column, which has to break or overflow: inline code and links
  get `overflow-wrap: break-word`, which only engages when the token cannot fit
  on a line of its own.
- **Text width** is hidden below 861px in both modes: the column is the viewport
  there, so no step can change anything. A control that cannot do anything is
  hidden rather than shown disabled.
- The regular-mode width rules (per-step `max-width`, and hiding the contents rail
  at Wide/Full) are gone, so the normal layout is always the standard column.

## Storage and first paint
- One key, `gp.reading`:
  `{"size":"small|default|large|xl","width":"cozy|default|wide|full","align":"left|justify"}`.
  Anything unrecognised falls back to `default` (`left` for align).
- The inline pre-paint script in every page's `<head>` — the one that already
  applied the theme — now also applies these two attributes, so a reader who has
  chosen large text gets it in the first paint instead of watching the lesson
  reflow after load. Three places share that contract: the head script,
  `enhance.js`, and the CSS.

## Incidental fixes found on the way
- `styles.css` had `.reader-wrap { display: none !important; }` from the
  retirement; removed rather than fought with a louder `!important`.
- Dark mode styled the active segment chip `#7867bd`, left over from the retired
  purple accent; it now uses the theme's green with dark ink (white on the dark
  accent lands around 2:1).
- Dropped the dot under the active segment option — the filled accent chip
  already marks that state.

## Verified
Chrome renders at 360 / 390 / 430 / 768 / 880 / 1024 / 1300 / 1440, light and
dark, panel open and closed, focus mode, and the module / hub / interview-labs /
DSA chapter page families.

Not touched: `machine-learning/assets/` and `temp-transitions/assets/` keep their
own forked copies of these files.

## Revision 2: justification is the house style, and Cozy is gone

- **Text is always justified.** The Left/Justified control was removed rather
  than kept at a default: one way for the portal to read, nothing to choose. The
  rules now apply unconditionally, and `data-reading-align` is gone from both the
  stylesheet and the pre-paint script in all 132 pages.
- Justification reaches **all** prose, not just direct children of `.content` —
  the home page hero lead was the one that gave the earlier version away. Opted
  back out: table cells, code, chips, captions, quiz options and the meta rows,
  where justifying two words opens comedy-sized gaps.
- **Focus mode: Cozy removed, Wide is the default.** Three steps remain
  (Standard 1000px / Wide 1360px / Full uncapped). On the wide screens where
  focus mode actually gets used, the old default left two thirds of the canvas
  empty. Stored `cozy` values fall back to `wide`.
- **Workspace tabs are larger in focus mode** — 13.5px against the breadcrumb
  row's 12.5px, since they are the only navigation left on screen. Unchanged
  outside focus mode.
- **Page titles are smaller:** `--fs-h1` went from `clamp(31px, 3vw, 44px)` to
  `clamp(26px, 2.05vw, 33px)` (mobile `clamp(29px, 8vw, 38.5px)` →
  `clamp(24px, 6.1vw, 30px)`). At 44px the title dwarfed the lead beneath it.
- **Prose has its own font token, `--font-read`,** set to `system-ui` — so body
  copy renders in whatever the reader's own OS uses for interface text (Segoe UI
  Variable Text on Windows 11, SF on macOS, Roboto on Android). No download,
  which the offline requirement demands. Headings keep `--font-sans`. A serif
  (Charter/Georgia) was tried first and rejected: wrong register for a portal
  that sits next to code.
- **Fixed on the way:** that experiment had briefly routed `code` and `pre`
  through `--font-sans`, which silently de-monospaced every inline snippet. Code
  is explicitly `--font-mono` again.

## Revision 3: left-aligned by default, a smaller phone default, one size per box

Three fixes, all of them walking back a decision from Revision 2.

- **Alignment is a setting again, and Left is the default.** Revision 2 made
  justification the house style with nothing to choose. Without hyphenation the
  browser can only buy a flush right edge out of the word spaces, and the
  narrower the measure the more it charges — a phone column and a card are the
  worst cases, and they are most of the reading. `html[data-reading-align]` is
  back with `left` as the fallback, the justify rules in `office-theme.css` are
  gated behind `[data-reading-align="justify"]`, and the Display panel has an
  Alignment row again.
  - The ragged-right exception list (cards, table cells, chips, quiz options)
    ties with the gated justify selectors on specificity and sits later in the
    file, so it still wins. Gating only the justify block was enough.
- **The default is the bottom of the ladder on desktop and one step up on a
  phone** — `xs` (0.88) above 860px, `s` (1.0) below. `m` (1.14) had been the
  default everywhere, which put prose at 17.9px on a wide column where the
  smallest step reads comfortably and fits much more on screen. The phone default
  is deliberately the larger of the two: at 0.88 a ~360px column drops to about
  30 characters a line. The viewport decides only the *untouched* default — an
  explicit choice still applies on every device.
  - Four places implement this and must agree: the head script in all 124 pages,
    `defaultSize()` in `enhance.js`, "Reset to default", and the bare `:root`
    `--reading-scale` pair in `office-theme.css` that covers the no-JavaScript
    path. The `:root` rules are (0,1,0) and every `[data-reading-size]` rule is
    (0,1,1), so a stored choice always wins over the media query.
  - Resulting sizes at the desktop default: prose 13.8px, card/callout body
    12.5px, tables and code 11.0px. The bottom of that range is small for
    sustained reading; the four larger steps and the Display panel are the escape
    hatch, and the choice persists per reader.
- **A phone column has one text size, not three.** Below 861px `.grid-2` /
  `.grid-3` collapse, so a card, a callout and a paragraph are the same
  full-width block in the same measure — but they rendered at three sizes
  (17.9 / 16.2 / 17.9px at the default scale) and two leadings (1.62 / 1.55),
  which is why a callout following a card read as both larger and looser. Card,
  callout, recall and quiz *body* text now take `--reader-font-size` / 1.62 on
  phones. Titles keep their own step. The desktop ladder is unchanged: there a
  card really is a narrower thing beside the prose.

### Fixed since: the contents rail is back

The `wide` width rules this file claimed to have removed were still in
`styles.css` (lines 2088-2094), and once Revision 2 made `wide` the pre-paint
default they hid the right-hand chapter-contents rail for every reader on every
page, leaving the reserved `var(--toc-w)` track as a blank band. They are now
actually gone. Outside focus mode the column is pinned by the ONE TYPE SCALE
layer regardless, so removing them changes nothing except restoring the rail.

### Known: the same properties are still declared in several places

`.card p` has a `font-size` in five rules across two files at three different
values; `.callout p` has four. `styles.css` also still carries a dead
`html[data-reading-size="small"|"large"]` vocabulary from the four-step scale,
which the current `xs|s|m|l|xl` attribute never matches — except `xl`, where the
two collide. Nothing here consolidated that; the fixes above were made in the
last layer, which is the same move that produced the pile. Untangling it means
deleting the superseded rules in `styles.css` and the earlier normalisation
layers in `office-theme.css`, not adding a sixth.
