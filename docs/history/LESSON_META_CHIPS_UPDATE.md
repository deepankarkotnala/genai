# Lesson meta chips — separated and restyled

The row under a lesson title (effort · difficulty · prerequisites) was a joined
segmented strip: `gap: 0`, a `-1px` margin per chip so neighbours shared one
border, and squared inner corners. At three chips of unequal length that read as
a single crowded block with seams through it rather than three separate facts.

## What changed
- Each chip stands on its own: 8px column gap, 7px row gap, its own 1px border
  and a uniform 9px radius. No negative margins, no squared inner corners.
- Taller and better padded — 30px min-height, 12px inline padding — so the text
  is not pressed against the border.
- The effort chip (the `⏱ … h` fact, always `.pill.blue`) carries a quiet green
  tint and slightly heavier weight. It is what a reader scans for first, and one
  accent per row keeps the rest calm instead of a row of competing colours.
- Chip type scales with the Display panel's text-size setting, like the prose it
  annotates. Replaces the legacy `--reader-meta-size` for this row.

## Responsive
- **Desktop / tablet** — chips sit on one line and wrap when they run out of room.
- **≤860px** — 28px chips, 8px radius, and values may wrap inside a chip so a
  long prerequisite does not force the row wider than the screen.
- **≤430px** — 26px chips and a 6px gap; the three facts stack to three lines,
  all visible.
- Removed the horizontal scroll strip that `@media (max-width: 620px)` used to
  apply. It pushed difficulty and prerequisites off the right edge of a phone
  with nothing on screen to say they were there.

Scoped to `.meta-row` throughout: `.pill` is also used in cards, module tiles and
the interview hub, and those are unchanged.

## Incidental fix
`claude-agent.html` styles its first chip (`.pill.anthropic`) as white text on a
purple gradient, from before purple was retired. The base `.pill` rule in
`office-theme.css` forces `background: var(--bg-elevated) !important`, so the
gradient was already gone and only the white text survived — the chip rendered as
blank space. It now joins the neutral set.

## Verified
Chrome at 360 / 390 / 430 / 768 / 1000 / 1250, light and dark, on the module,
ATS lab, teach-agents lesson, claude-agent (4 chips), interview hub and home
pages.
