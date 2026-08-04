# Global Study Plan update

## 2026-08-02 — rebuilt as a sequential, page-by-page route

The plan previously listed hours per section and a five-card "recommended route"
that named only a handful of pages. Following it as a sequence was not possible:
several sections were priced in the hours table but never given a position in the
route, and 5 of the 11 Deep Dives were missing entirely.

**What changed**

- `study-plan.html` is now a **numbered spine of 69 steps across 9 phases**. Every
  page on the AI Engineer path has a step number, an hour estimate and a one-line
  reason naming what it depends on. Step numbering is continuous across phases
  (implemented by overriding the `.readmap` CSS counter with an inline
  `counter-reset: roadmap N`, so no new CSS was needed).
- **Understanding AI Agents is now Phase 4 in full** — steps 14–29, all 15 lessons
  plus environment setup for the `teach-agents/eda-lab` Python lab. Previously it
  appeared only as a row in the hours table with no position in the route, so a
  reader following the route would never have been told when to do it.
- **All 11 Deep Dives are placed**, each next to the module it extends. The five
  that were missing from the old page: `agent-protocols.html`, `llm-evals.html`,
  `llmops.html`, `langgraph-asyncio.html`, `langgraph-pydantic.html`. The two
  LangGraph prerequisites are deliberately sequenced *before* the LangGraph module.
- **The 16-page Python bank is a named parallel rail** (P01–P16, 30–60 min/day)
  rather than an unplaced block. The 6 technology drills are distributed into
  phases 2, 5 and 7, each directly after the material it tests.
- **Every phase ends with a checkpoint** stated as a thing you can do from memory,
  not a set of pages to have opened.
- Hour estimates recomputed bottom-up from the per-page numbers so the section
  table and the phase totals reconcile: spine **428–664 h**, Python rail
  **36–54 h**, total **464–718 h**, plus the optional DSA track (90–140 h).
  The figures in the previous revision of this file (300–460 h route / 610–970 h
  library) were stale and did not match what the page rendered.
- Coverage check: 87 of the 88 canonical non-DSA pages in `assets/sitenav.js` are
  now sequenced. The exception is `interview-labs/index.html`, a section overview,
  which is linked from the Phase 2 prose instead of being given a step number.

**Scope decisions**

- `machine-learning/` (25 pages) is **deliberately not in the plan**. It is a
  self-contained sub-portal, is absent from `assets/sitenav.js`, and nothing in the
  main hub links to it. It remains on disk and reachable by direct URL. Revisit if
  a target role screens on classical ML.
- **Deleted** as confirmed-dead duplicates: `learn-rag-mcp/` (8 pages — the
  comment at `assets/sitenav.js:56` records that it and the retired
  `06_rag_basics` / `07_advanced_rag` modules restated `rag-deep-dive.html` in
  different words), `modules/__p.html` (a duplicate of module 05 under a scratch
  filename), and the checked-in `teach-agents/eda-lab/eda_lab/__pycache__/`
  bytecode. No live page linked to any of them; the surviving references are three
  comments and a path regex. Page count went 159 → 150.

**Still outstanding**

- `modules/06_rag_basics.html` and `modules/07_advanced_rag.html` are named as
  retired in the same `sitenav.js` comment and are absent from the nav, but were
  not part of the approved deletion list. They are still on disk.
- `modules/00_basics.html`, `progress.html` and `google-prep/` are not in the nav
  and not in the plan. Left untouched pending a decision.
- There is no `.gitignore` in this repo, so `__pycache__` will reappear the next
  time the lab is run.

## Original entry

- Added `genai-portal/study-plan.html` as the first top-level sidebar destination.
- Added beginner-paced hour estimates for every major site section.
- The estimates assume no prior Neural Networks, AI, or GenAI knowledge, while allowing for basic Python and classical ML experience.
- Estimates include explanation, note-making, implementation, debugging, active recall, revision, and interview practice—not only reading time.
- Kept the requested cadence: 2–4 focused hours on weekdays and 8 focused hours across the weekend.
- Removed browser-stored learning progress and completion UI so a public static deployment does not imply cross-device synchronization.
- Theme, sidebar, and reading preferences remain local because they are display preferences, not learning records.
