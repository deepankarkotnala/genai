# Left sidebar: one geometry token, and the resize handle back on the edge

## The bug

The resize handle floated about 25px to the right of the sidebar's visible edge,
in the gutter, as a detached vertical hairline — and while dragging it pulled
further away the more you moved.

Two coordinate systems were being mixed. The shell renders the desktop sidebar
at 90% via `zoom`, so a *layout* width of W occupies 0.9W on screen:

| | before | after |
| --- | --- | --- |
| `--sidebar-w` (layout) | 252px (written inline by `sitenav.js`) | 238px |
| grid track = visible edge | 226.8px | 214.2px |
| handle centre | 252px | 214.2px |
| gap | **25.2px** | 0 |

The handle is `position: fixed`, so it sits outside the zoomed subtree and is
never scaled — but it was positioned from the unscaled `--sidebar-w`. The drag
maths had the same fault in motion: pointer travel is screen pixels, the value
written is a layout width, so the edge moved at 0.9 of the cursor.

## Overlapping declarations that made it hard to see

- **`--sidebar-w` was declared seven times** across two files — twice at the top
  level of `styles.css` and four times inside `@media (min-width: 861px)` blocks
  there, plus once in `office-theme.css`. Media queries add no specificity and
  `office-theme.css` loads last, so its plain `:root` value won on every screen
  and the other six were dead. The narrow-desktop step meant to drop the panel to
  184px between 861 and 1080px never applied — that window got the full 238px.
- **The density factor `0.9` was written as a bare literal in three places** (the
  grid track, the sidebar's `zoom`, the height correction) and omitted from a
  fourth where it was needed (the handle).
- **The override sat in the wrong file.** `html .app` at the bottom of
  `styles.css` is (0,1,1) and outranked `office-theme.css`'s own `.app` rule
  while consuming a variable that file owns.
- **`sitenav.js` mirrored the wrong token.** `desktopMinimum()` reproduced
  `clamp(220px, 15vw, 252px)` in JavaScript — one of the five losing
  declarations.

## What it looks like now

    --sidebar-w      layout width — what the resizer stores and JS writes
    --density        desktop density factor (0.9; 1 below 861px)
    --sidebar-track  calc(--sidebar-w * --density) — what you actually see

Anything positioned against the sidebar's visible edge uses `--sidebar-track`;
anything scaling with density reads `--density`. Both are declared once, in
`office-theme.css`, beside a note explaining the split. `sitenav.js` reads both
from the computed style instead of hard-coding them, so the stylesheet stays the
single source of truth — and because `--density` is 1 below 861px, the mobile
drawer needs no special case in the JS at all.

`STYLESHEET_DESKTOP_W` is captured once at setup, before `apply()` writes an
inline `--sidebar-w` on `<html>`. Reading it lazily would have made the minimum
rise to meet the current width and the panel impossible to shrink.

Also fixed on the way: `activeMaximum()` compared a screen-space budget
(`innerWidth - 560`) against a layout width, so the cap reserved 10% less for the
article than it read as. And `--mobile-sidebar-w` now has a `:root` default —
without one, `min(98vw, var(--mobile-sidebar-w))` was invalid at parse time until
`sitenav.js` ran, and the width silently fell through to another rule.

## Not changed

`.sidebar::after` is sized in four places in `styles.css`
(`width: calc(var(--sidebar-w) - 20px)` and three variants). All four are inert:
`office-theme.css` kills the pseudo-element outright with
`content: none !important; display: none !important`. They are dead rather than
wrong, so they were left alone rather than risk a wider edit — deleting them is
a clean follow-up.
