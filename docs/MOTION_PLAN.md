# Motion & Visual Polish Plan

Status: **Phases 1, 1b, 1c complete** · page transitions removed · D8 closed · 2026-08-04

> **Read §1 before §2.** Two defects in the first audit (D2, D7) turned out to be
> misreadings of a system that was already correct. They are kept in place, struck
> through, with what is actually true — a plan that hides its own wrong turns
> invites the next reader to repeat them.

The portal's motion is not missing — it is **contradictory in three layers and
partly dead**. This plan repairs it first, then adds the two things it genuinely
lacks: one signature card hover, and explanatory SVG that survives on a phone.

**Governing rule.** All timing lives in `assets/genai-motion.css`, which is
loaded last. Nothing in `styles.css` or `office-theme.css` may declare a
transition or keyframe from here on. That file's own header explains why: the
drawer's timing was once decided by three files at once, and re-timing it meant
editing three blocks in two 100 KB stylesheets while hoping no fourth override
existed. We do not grow a fourth wall.

---

## 1 · Audit

### What already exists and works

| Area | Where | Notes |
| --- | --- | --- |
| Motion layer | [`genai-motion.css`](../assets/genai-motion.css) | 658 lines, 3 durations / 2 curves, loaded last |
| Drawer, sidebar collapse, chevrons, sticky chrome, press states, collapsibles | `genai-motion.css` §2–§8 | Transform/opacity/shadow/border only — compositor-safe |
| Scroll-driven entrances | `genai-motion.css:481` | `animation-timeline: view()` with an `@supports` fallback stagger for Safari |
| Cross-document view transitions | `styles.css:694-712` | `@view-transition { navigation: auto }` + per-region `view-transition-name` |
| Theme toggle | `enhance.js:1160` | Runs through `document.startViewTransition` |
| **Page-loading SVG** | `sitenav.js:700-736`, `styles.css:780-830` | Stroke-dasharray ring, 220 ms grace, 12 s give-up, keyframe not transition (a page slow enough to need a spinner may not be running frames), own `view-transition-name` so it exits as itself |
| Reduced motion | 5 stylesheets + print blocks | Honored properly; every addition must extend these |

The page loader is **already the "page loading SVG animation"** and its logic is
correct. Do not restructure it; Phase 3 only restyles the mark it draws.

### Defects found

**D1 — Dead spotlight system, paying full cost.**
[`enhance.js:1024-1034`](../assets/enhance.js) attaches a `pointermove` listener to every
`.card, .callout, .quiz, .demo, .diagram, .readmap, .concept-lab, .progress-card,
.collapse` on every page and writes two custom properties per move.
[`office-theme.css:899`](../assets/office-theme.css) then kills `.glass-spotlight::before` with
`content: none !important; display: none !important`. Dozens of elements per page
invalidate style on every mouse move and paint nothing.

**D2 — ~~Card hover does almost nothing~~ → WRONG. Corrected 2026-08-04.**

The first reading of this stopped at `styles.css:1500` (a `-5px` lift) and
`office-theme.css:907` (`box-shadow: var(--shadow-sm) !important`) and concluded
hover was dead. It is not. There is a **canonical, deliberate, documented card
hover** further down the same file:

```
:is(.card, .card.hover, .module-card, .prep-topic-card, .page-nav a)
  :not(.is-soon):is(:hover, .is-hovered, :focus-visible) {
  box-shadow: var(--card-hover-shadow) !important; transform: none !important;
  border-color: var(--border-strong) !important; }
```

`--card-hover-shadow` is a purpose-built three-layer diffused shadow, defined per
theme. Its comment explains that the hover deliberately **does not move** — the
older lift, the heading nudge, the scaling blob on `.prep-topic-card::before` and
the drifting circle on `.module-card::after` are all cancelled "so a hover reads
as a single gesture rather than four" — and it documents the specificity maths
(0-4-0) that lets it win. Touch (`@media (hover: none)`) and reduced-motion
guards are both present.

**So the shadow-bloom hover the request asked for already exists.** The real
defect was narrower: surfaces outside that selector list had no share in it —
including `.page-nav a`, which I had given a bespoke `--shadow-md` hover earlier
the same day. That was a second hover vocabulary, added by me, for no reason.

**D3 — Six `transition: all` declarations.**
`styles.css:269, 371, 445, 502` and `dsa-prep.css:232, 242`. These animate layout
properties and contradict the motion layer's own stated rule. `.chip` is the
worst: `transition: all .4s` on an element that also carries an entrance.

**D4 — Touch guard: mostly present, one real hole (mine).**
Partly wrong as first written. `office-theme.css` guards the four canonical card
classes and `.content .card` under `@media (hover: none)`, and resets hover
borders at `office-theme.css:1690`. The genuine hole was the `.page-nav a` hover
shadow I had added earlier that day with no touch guard, so a tap left it raised.
`genai-motion.css:438`'s transform guard was also missing `.page-nav a` and
`.rm-link`.

**D7 — ~~`.rm-link:hover` animates padding~~ → WRONG.**
`office-theme.css:1002` does set `padding-left: 8px` on hover, but
`office-theme.css:1722` pins it back to the resting `42px`, precisely so the row
does not shift. Already correct; no action.

**D5 — 26 pages have no motion layer at all.**
Every `machine-learning/*.html` page loads `ml-visuals.css` + `ml-mobile.css`
instead of `genai-motion.css`. Per the motion file's header, the ML motion system
is scoped to `<= 980px`, so those 26 pages have **no desktop motion whatsoever**
while the other 124 do. This is the largest consistency gap in the portal.

**D6 — Explanatory visuals are thin and desktop-only.**
40 pages have a `.diagram`, 19 the animated `.prep-diagram`, 17 a `.cssflow` —
but only 4 pages use `<animate>`/`animateTransform`, and ~110 pages have no
explanatory visual. `office-theme.css` also sets `.concept-canvas { display: none }`
under 980 px, so phone readers lose the interactive canvas entirely and get a
text step-list instead.

---

## 2 · Phases

### Phase 1 — Repair, no new motion — ✅ DONE 2026-08-04
*Prerequisite for everything else. Skipping it means building on contradictions.*

1. **D1 ✅** — One delegated, rAF-throttled `pointermove` on `document` replaces
   N per-element listeners, gated behind `(hover: hover) and (pointer: fine)` and
   skipped entirely under reduced motion. The custom properties keep updating, so
   Phase 2 has its hook ready; nothing renders yet.
   → `enhance.js` `setupGlassSpotlight()`
2. **D2 ✅** — Folded `.page-nav a` into the canonical hover selector so it blooms
   with `--card-hover-shadow` like every other clickable card, and deleted the
   bespoke `--shadow-md` rule. Removed the two dead lift declarations in
   `styles.css` (`.card:hover, .page-nav a:hover` and the page-nav one) that had
   caused the misdiagnosis, each replaced by a comment pointing at the canonical
   rule. Removed `.card`/`.card.hover`/`.page-nav a` from the flattening group at
   `office-theme.css:905` — that group now covers only the genuinely
   non-clickable containers it is for.
3. **D3 ✅** — All six `transition: all` replaced with explicit property lists
   (`styles.css` ×4, `dsa-prep.css` ×2). Repo now has zero.
4. **D4 ✅** — `.page-nav a` added to both touch guards; it returns to
   `--shadow-card` (its resting value) rather than `--shadow-sm`, which would read
   as sinking. `.rm-link` added to the transform guard.
5. **✅ Principle established: hover is an affordance.** Only surfaces that do
   something when clicked get one. The hover I had put on
   `.scenario-framework > div` was removed on that basis — those five cards are
   read, not clicked. `.rule`, `.qa`, `.stage`, `.case` are the same and stay
   hover-free, so they need no entry in any motion list.

**Verification run:** `tools/test-page-nav.js` 371/371 · `tools/test-metrics.js`
97/97 · `tools/validate.py` 42 ok, 1 failed, 4 warnings — the failure
(`active-route-count` expects 1, Release 3 ships 3) and all four warnings are
pre-existing and unrelated to motion.

Deferred out of Phase 1: **D5** (26 ML pages) is a separate release — it changes
which stylesheet 26 pages load and needs its own regression pass.

### Phase 1b — Page-transition jitter + ML section sync — ✅ DONE 2026-08-04
*Unplanned, both from user reports during Phase 1.*

**The jitter had a structural cause.** `.content-wrap` carries
`view-transition-name: page-body`, so its snapshot is as tall as the document —
often several thousand pixels. The old rule animated `transform: translateY(6px)`
on it. Opacity on a texture that size is one compositor blend per frame; a
transform is a resample of the whole texture per frame. Fixed in `styles.css`:

- `page-body` is now a **crossfade only** — no transform, no delay (a delay
  leaves a frame of empty column, which reads as flicker), `.12s` out / `.16s` in.
- The non-VT fallback path (`html:not(.xvt) .main`) lost its `translateY(8px)`
  for the same reason — that path serves Firefox and older Safari, the browsers
  with the least headroom to spare.
- `sitenav.js` navigation delay `180ms → 120ms`, matching the shortened fade.
  That delay is pure latency before the next page is even requested; the two
  numbers must stay equal.
- A documented **kill switch** now sits on `@view-transition`: change
  `navigation: auto` to `none` for an instant cut, with nothing else to edit.

**ML section (D5) — motion, animation and transition parity now shipped.**
The 26 `machine-learning/*.html` pages were not merely missing a stylesheet; they
run a **forked copy of the portal runtime**. What was fixed:

- `../assets/genai-motion.css` added to all 26 pages, loaded after `ml-mobile.css`
  so it owns timing last; `../assets/genai-motion.js` added after `enhance.js`
  (it is DOM-agnostic — scroll position → `body.is-scrolled`).
- `ml-mobile.css` §8 (Motion) retired. It duplicated genai-motion's press
  feedback, entrances and reveal curve at `<= 980px`, and its page transition was
  gated on `@supports not (view-transition-name: none)` — the same wrong test
  documented in styles.css — while animating `translateY` on `.main`, i.e. the
  jitter above. §9 stays: it freezes ML-specific decorations
  (`.prep-hero::before/::after`) that genai-motion has no selector for.
- `.prep-hero` added to both entrance lists in `genai-motion.css`, since §8 was
  the only thing giving it one (also benefits interview-prep and python-interview).
- `ml-sitenav.js` gained the **page-loading ring** (it had none at all) and the
  corrected `PageRevealEvent` path test, replacing
  `CSS.supports("view-transition-name: none")`. Leave delay aligned to 120ms.
- Motion tokens were already byte-identical on both sides (.18s / .28s / .42s and
  the same two curves), so none of this changes how anything feels — it makes the
  ML pages *have* the behaviour rather than approximate it below 980px.

**Still divergent — the ML runtime fork (own release, see D8).**

**D8 — The ML section runs stale forked JS.**
`machine-learning/assets/` holds its own `app.js` (442 lines vs the portal's 447)
and `enhance.js` (1104 vs 1282). Neither contains a single ML-specific selector —
they are simply old copies. The fork is missing the reading-settings API rename
(`applyReaderSettings` → `applyReadingSettings`), `structureCrumbs`, the glossary
popover, and the delegated spotlight from Phase 1. Switching the 26 pages to
`../assets/*` is the right end state but is **not** a link edit:

- the portal `enhance.js` auto-injects a `.concept-lab` topic diagram unless the
  page sets `data-no-concept-lab` — so 26 content pages would grow a new section;
- the ML pre-paint head script lacks the reading-size/width block the portal
  `enhance.js` expects, so reader settings would apply after first paint (reflow);
- `machine-learning/assets/styles.css` (4056 lines) and `office-theme.css` are
  **dead copies** — nothing links them, and one of them already misled a reader of
  this repo into diagnosing against the wrong file. Recommend deletion, not done
  here: this is not a git repo, so it would be irreversible.

### Phase 1c — Page transitions REMOVED · ML runtime unforked — ✅ DONE 2026-08-04

**Page transitions are gone.** Two attempts to smooth them (a shorter crossfade,
then opacity-only with no transform) were both still reported as jittery on real
hardware, so the effect was removed rather than tuned a third time.

The mechanism does not leave room to win: `.content-wrap` carried a
`view-transition-name`, so the browser snapshots the entire reading column —
commonly several thousand pixels — and animates it during the exact window in
which it is also parsing, styling and laying out a new document. There is no
budget there to buy smoothness with.

What was removed:
- the `@view-transition` at-rule (absent now, not `navigation: none` — the
  at-rule opts in, so not writing it *is* the off state);
- `view-transition-name: page-body` and the `vt-body-in` / `vt-body-out` pair;
- the non-VT fallback (`page-enter` keyframe, `.is-leaving` fade);
- click interception in `sitenav.js` **and** `ml-sitenav.js` — no
  `preventDefault`, no `setTimeout` before `location.href`. **A click now
  navigates immediately**, which also removes 120–180 ms of pure latency that sat
  in front of every navigation;
- the one-shot arrival stagger in `genai-motion.css` §7. It fired as a new
  document painted, so to a reader clicking a link it *was* the page transition;
- §10, which existed only to stop those two effects doubling up.

What was kept:
- **the loading ring** — the "loading SVG with a fade" — which now carries the
  whole job. It appears only after a 220 ms grace period, so a fast navigation
  shows nothing at all and a slow one gets an honest signal instead of decoration
  over a swap that already finished. `ml-sitenav.js` gained it in Phase 1b;
- **scroll-driven `gm-rise`** — it plays as a card scrolls into view, which no
  navigation triggers;
- **the theme toggle's same-document transition**, which is unrelated to
  navigation and must keep working — its `vt-theme` name-withdrawal block was
  preserved deliberately.

`.xvt` / `.vt-in` are still written by the pre-paint head script (`PageRevealEvent`
exists whether or not the at-rule does) but nothing keys off them. Left documented
so that restoring transitions restores their guard too.

**D8 closed — the ML runtime fork is gone.** All 26 pages now load the shared
`../assets/app.js`, `enhance.js` and `interview-prep.js`, and their pre-paint head
script was replaced with the portal's (the ML one set only the theme, so reading
size and width applied *after* first paint — a reflow of the whole lesson on every
load). Five stale files deleted: `styles.css` (4056 lines) and `office-theme.css`
— both dead, linked by nothing — plus the `app.js`, `enhance.js` and
`interview-prep.js` copies. None contained a single ML-specific selector; they
were old copies missing the RAG-page merge, `structureCrumbs`, the glossary
popover and Phase 1's delegated spotlight. Backed up outside the repo before
deletion, since this is not a git repository.

One behaviour change worth knowing: the fork stored reader preferences under
`genai-reader-settings-v2`, the portal uses `gp.reading`. An ML reader's saved
font size resets once, then follows them across the whole portal.

Kept as genuinely ML-specific: `ml-sitenav.js` (its own nav registry),
`ml-visuals.css`, `ml-mobile.js`, `ml-mobile.css` (§8 retired in Phase 1b, §9
kept for `.prep-hero` decorations), and `assets/brand/`.

**Verification:** page-nav 371/371 · metrics 97/97 · validate 42 ok / 1 pre-existing
failure; `javascript-syntax` now 19 files (was 22), `runtime-asset-version` single
version across 300 references, `nav-baseline` still 150 pages.

### Phase 2 — The signature card hover
**Re-scoped after the D2 correction.** Parts 1 and 2 below are already shipped and
deliberate — `--card-hover-shadow` *is* the diffused-shadow hover, and the
no-movement choice is documented, not accidental. What is actually left:

1. ~~Shadow ramp~~ — **exists** as `--card-hover-shadow`. Optional refinement
   only: a few percent accent tint so the bloom reads warm rather than grey.
2. ~~Lift~~ — **deliberately rejected** by the existing design. Reopening it means
   overriding a documented decision; needs an explicit call (open decision 2).
3. **Pointer-follow sheen** — the one genuinely new part. Revive
   `.glass-spotlight::before` (currently killed at `office-theme.css:899`) using
   the `--spot-x/--spot-y` hook Phase 1 made cheap: `opacity 0 → 1`, no transition
   on position, since tracking the pointer directly is what makes it feel alive.
4. **Extend the canonical hover to the surfaces still outside it** — audit which
   clickable cards are not in the `:is()` list (`.rm-link`, `.nn-study-map a.card`,
   `.interview-card`, `.gp-card` are candidates).

Timing is asymmetric: ~170 ms `--gm-ease-out` in, ~260 ms `--gm-ease` out, so it
arrives crisp and leaves calmly. Touch gets `:active { scale(.985) }` and no
sheen. Reduced motion gets shadow and border only. `will-change: transform` is
applied **on hover only** — a blanket `will-change` on 40 cards is its own bug.

**Explicitly rejected: 3D tilt.** It wins design awards and annoys people trying
to read documentation.

### Phase 3 — Loading and navigation polish
- Restyle the loader to a stroke-draw of the brand mark. **Do not touch the
  grace/give-up/keyframe logic** — it is correct and hard-won.
- Kill the layout pop from JS-built regions: `page-nav.js` and the TOC swap in
  after paint, so the footer jumps. Reserve height or fade the swap.
- Audit view transitions at mobile width — drawer-open state across a navigation
  is the likely bug and nothing currently tests it.

### Phase 4 — Explanatory SVG program
Build the mechanism once, then author against it.

- **Reusable diagram pattern:** `stroke-dasharray` draw-on-scroll via
  `animation-timeline: view()` (already proven here), staged label reveals, and
  an optional step control for multi-stage concepts. One CSS block, no per-page JS.
- **Mobile-first requirement:** diagrams reflow or scroll — they do not
  `display: none`. This reverses the current `.concept-canvas` behaviour and is an
  explicit decision, not an accident.
- **Accessibility contract:** every animated diagram needs a text equivalent
  (`.concept-mobile-steps` is the right precedent) and freezes under reduced motion.
- **Then author ~10 diagrams,** prioritized by how badly the concept needs a
  picture: tokenization → embedding space → attention (Q/K/V) → the
  autoregressive loop → RAG retrieve/rerank/generate → agent observe-act loop →
  guardrail chain → eval harness. One per major module page.

This is the biggest perceived-quality gain and the only phase that scales with
authoring time rather than engineering time.

### Phase 5 — Verification (define before Phase 2 ships)
DevTools paint-flashing + compositor check on a heavy page · 4× CPU throttle at a
phone viewport · reduced-motion pass · touch pass for stuck hover · print pass ·
`tools/test-page-nav.js` · `tools/test-metrics.js` · `tools/validate.py`.

---

## 3 · Open decisions

| # | Decision | Default if unanswered |
| --- | --- | --- |
| 1 | Revive the sheen (Phase 2.3) or delete `setupGlassSpotlight` outright? | Revive — Phase 1 left the hook live and cheap |
| 2 | Reopen the 3 px lift, overriding the existing documented no-movement decision? | No — the flat bloom stands unless you say otherwise |
| 3 | Do the 26 ML pages join `genai-motion.css` (D5)? | Yes, but as its own release |

## 4 · Sequencing

Phases 1–3 ship as one release. Phase 4 is its own release with per-page review,
since it changes content rather than chrome. D5 sits between them.

Every phase bumps the `?v=` token on each asset it edits, across all 150 pages.
