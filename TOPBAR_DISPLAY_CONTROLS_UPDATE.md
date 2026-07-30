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
| Alignment | yes | yes | yes |
| Text width | — | yes | — |

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
