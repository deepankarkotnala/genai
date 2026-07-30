# Type colour — headings and bold step down from black

Light mode ran headings at `#20232b` and bold at the same value, near enough to
black that a lesson read as a stack of hard black slabs over mid-grey body copy.
There is now one hierarchy, each step a token mix so both themes work from their
own pair instead of hard-coded hex:

| Step | Mix | Light | Used by |
| --- | --- | --- | --- |
| Heading | `--text` 72% | **#2D313B** | h1–h4, hero and card titles, callout titles, quiz questions, `<summary>`, demo titles |
| Bold | `--text` 55% | **#363A45** | `strong`, `b`, `dt` in prose |
| Body | `--text-secondary` | #505665 | paragraphs, lists |

Measured in Chrome, not estimated. Dark mode is deliberately left alone: it
already dials headings a step below `--text` because large, heavy type reads
brighter than its hex value, and dimming it further would cost legibility rather
than buy calm.

## Headings
`--heading` is the single token every heading in the portal already reads, so
softening it there covers h1–h4, hero titles, card titles and section headings on
every page family at once — modules, teach-agents lessons, DSA chapters, the hub
and the question bank. Six component titles (`.callout .c-title`, `.quiz .q`,
`.recall`/`.collapse` `> summary`, `.demo-title`, `.rm-head`) were wired to
`--text` directly rather than to `--heading`, so they were left out of that and
are now pointed at the token.

# Bold inside a lesson — grey bold instead of near-black

Body copy in a lesson is `--text-secondary` and bold was `--heading` at weight
650, so every emphasised phrase jumped from mid-grey (#505665) to near-black
(#20232b). In a paragraph carrying three or four bold terms that reads as a page
of headlines: the eye is pulled to the bold and the sentence around it goes
quiet.

## What changed
- Bold now sits one clear step above body copy instead of at the far end of the
  scale, at weight 600 rather than 650.
- The colour is a token mix, so each theme works from its own pair:
  `--prose-strong: color-mix(in srgb, var(--text) 55%, var(--text-secondary))`.
  Measured result — light: **#363A45** bold on #505665 body; dark: **#CED1D8**
  bold on #B6BBC5 body.
- `styles.css` lightened every `strong` to `#dde2e9` in dark mode, close to pure
  white against mid-grey body copy. That is the same over-emphasis, so it is
  answered explicitly rather than left to win by file order.
- Applies to `strong`, `b` and `dt`.

## Scope
Every prose column in the portal carries `.content` — the hub, interview prep,
ATS lab and Google sections add a second class to the same element — so one
scope covers all of them. Deliberately untouched:
- Chrome: `.brand-text strong` (sidebar), `.crumbs b` (breadcrumb), the contents
  rail. These sit outside `.content`.
- Accent figures: `.prep-say strong`, `.ats-progress-ring strong`,
  `.scenario-timer strong` and similar. They carry their own colour and win on
  specificity.
- Bold inside a heading, chip, button or link, which is structural rather than
  emphasis. Reset to `inherit` so it keeps the colour and weight of its host.

## Verified
Computed values measured in Chrome in both themes; rendered at 390 / 700 / 1000 /
1250 on a module page, light and dark.
