# Python & AI/ML Interview Section — Build Plan

**Source:** `python_ai_ml_interview_questions_2026.md` (1448 questions, no answers)
**Target:** a new "Python & AI/ML Interviews" section inside the Switch job portal
**Created:** 27 July 2026

---

## 1. Goal

Turn the raw question bank into a usable study section in the portal, where every question has a
short, plain-language answer, and where every question kept has been checked against what is
actually being asked in Python and AI/ML interviews in India in 2025 and 2026.

Three rules drive every decision:

1. **No clutter.** Only questions with real interview signal survive. Trivia is cut, not stored.
2. **Simple answers.** Short sentences, everyday words, no jargon unless the jargon *is* the answer.
3. **Recency-validated.** Each phase runs a web check before its pages are written.

---

## 2. Where it lives

New folder `python-interview/`, sitting beside the existing `interview-prep/` and
`machine-learning/` sections. It reuses the shared assets — no new CSS or JS.

```
python-interview/
  index.html                 overview + topic grid
  01-python-core.html
  02-data-structures.html
  ...
  14-project-behavioural.html
```

Registered in `assets/sitenav.js` as one new group:

```js
{ id: "pythoninterview", label: "Python & AI/ML Interviews", mark: "Y",
  blurb: "Validated 2026 question bank", home: "python-interview/index.html", pages: [ … ] }
```

Every page reuses the proven `interview-prep` page shell: sidebar, topbar, `prep-content`,
`prep-toolbar` filter, and `<details class="prep-question">` blocks. Each answer carries:

| Part | Purpose |
|---|---|
| **Simple answer** | 3–5 plain sentences. This is the whole answer, not a summary of one. |
| **Say this in 30 seconds** | The compressed spoken version for the actual room. |
| **Likely follow-up** | The one question that reliably comes next. |
| Code block | Only where code explains faster than words. Not on every question. |

---

## 3. Page map

The md file's 28 sections collapse into 14 pages. Sections that interviewers treat as one topic are
merged; sections that are mostly filler are trimmed into their nearest neighbour.

| # | Page | Source sections | Target Qs |
|---|---|---|---|
| 01 | Python Core & How It Runs | 2, 3, 4 | ~34 |
| 02 | Strings, Collections & Data Structures | 5, 6 | ~40 |
| 03 | Functions, Scope & Functional Python | 7, 8 | ~32 |
| 04 | Iterators, Generators & Comprehensions | 9 | ~24 |
| 05 | Decorators, Context Managers & Descriptors | 10 | ~24 |
| 06 | OOP & the Python Data Model | 11, 12 | ~42 |
| 07 | Exceptions, Modules & Packaging | 13 | ~26 |
| 08 | Memory, Garbage Collection & Performance | 14 | ~28 |
| 09 | Threads, Processes & Asyncio | 15 | ~34 |
| 10 | Type Hints, Standard Library & Testing | 16, 17, 18 | ~38 |
| 11 | Backend Python, APIs & Databases | 19 | ~30 |
| 12 | NumPy, Pandas & Data Engineering | 20, 21, 22 | ~44 |
| 13 | ML, Deep Learning, LLMs & MLOps | 23, 24, 25, 26 | ~60 |
| 14 | Coding Round & Project / Behavioural | 27, 28 | ~40 |

Roughly **500 validated questions** out of 1448. The cut is the point: the remaining ~950 are
rephrasings, textbook trivia, or questions no recent report supports.

---

## 4. Validation method

Before writing each phase's pages, run web searches scoped to that phase's topics, for example
*"Python decorators interview question asked 2026"*, *"asyncio interview questions India 2025"*.

A question is **kept** when at least one holds:

- It appears in 2025–2026 interview reports, or in question lists dated 2025 or 2026.
- It is a standing fundamental that every Python round touches (GIL, mutability, `is` vs `==`).
- It maps to a skill named in current India job descriptions (async, FastAPI, Pandas, RAG, MLOps).

A question is **cut** when:

- It only appears in pre-2024 material and nowhere recent.
- It is a near-duplicate of a question already kept — the clearer phrasing wins.
- It tests a deprecated or vanishing detail (Python 2 behaviour, `%` formatting minutiae).

Each page records its check date and what the check found, in one line — not a source dump.

---

## 5. Phases

| Phase | Work | Output |
|---|---|---|
| **1** | Section scaffold: folder, `index.html`, sitenav group, topic grid, breadcrumbs | Section is navigable and empty pages resolve |
| **2** | Validate + build pages 01–05 (Python fundamentals) | 5 pages |
| **3** | Validate + build pages 06–10 (advanced Python) | 5 pages |
| **4** | Validate + build pages 11–13 (backend, data, ML/AI) | 3 pages |
| **5** | Validate + build page 14, then link audit and counts | 1 page + audit |

Each phase ends with: all internal links resolving, prev/next chain intact, question counts on the
index matching the pages, and the source md updated with a note on what was kept and cut.

---

## 6. Build outcome (all phases complete)

Built 27 July 2026. **319 questions** across 14 pages, cut from the 1448 in the research file.

| # | Page | Qs | # | Page | Qs |
|---|---|---|---|---|---|
| 01 | Python Core & How It Runs | 35 | 08 | Memory, GC & Performance | 15 |
| 02 | Strings, Collections & Data Structures | 30 | 09 | Threads, Processes & Asyncio | 18 |
| 03 | Functions, Scope & Functional Python | 20 | 10 | Type Hints, Stdlib & Testing | 21 |
| 04 | Iterators, Generators & Comprehensions | 21 | 11 | Backend Python, APIs & Databases | 22 |
| 05 | Decorators, Context Managers & Descriptors | 18 | 12 | NumPy, Pandas & Data Engineering | 21 |
| 06 | OOP & the Python Data Model | 23 | 13 | ML, Deep Learning, LLMs & MLOps | 34 |
| 07 | Exceptions, Modules & Packaging | 18 | 14 | Coding Round & Project Discussion | 23 |

Final counts run below the per-page targets in section 3 because deduplication was more aggressive
than planned — many questions in the research file were rephrasings of one another, and only the
clearest wording of each was kept.

**What the recency checks changed.** Four searches were run, one per phase. They confirmed the
existing shape of the bank and added three things that were not adequately covered:

- **Free-threaded Python (PEP 703, 3.13+)** — now a live senior-level GIL follow-up, added to page 09.
- **RAG versus fine-tuning** — reported as standard now even at fresher level, so it leads page 13's
  LLM section rather than sitting mid-page.
- **Scenario framing over definitions** — 2026 reports consistently describe interviews moving from
  "what is X" to "what would you do when X breaks", which is why every answer carries a production
  consequence rather than only a definition.

**Verified after build:** no broken internal links, no duplicate questions across pages, all 15 nav
entries resolve, per-page counts match their headers, and every page parses as well-formed HTML.

---

## 7. Definition of done

- Every question on every page has a simple answer, a 30-second version, and a follow-up.
- No page exceeds what a person can work through in one sitting (~45 questions).
- The section is reachable from the sidebar on every page of the portal.
- `python_ai_ml_interview_questions_2026.md` gains a short header pointing to the built section.
