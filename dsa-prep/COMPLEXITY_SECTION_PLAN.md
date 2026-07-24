# Plan — New DSA Section: "Time & Space Complexity from Zero"

> A build-first plan for a **new, foundational chapter that sits at the very top of the
> DSA curriculum**, teaching time and space complexity from absolute zero — with simple
> explanations, analogies, runnable code snippets, worked examples, and practice.
> This is the design document. Implementation happens **after** this plan is approved.

---

## 1. Goal & who it's for

**Goal:** A learner who has never heard "Big-O" should finish this chapter able to:

1. Say *what* time complexity and space complexity mean in plain English.
2. Count the operations in a loop and turn that count into a Big-O expression.
3. Recognise the ~8 complexity classes on sight (O(1), O(log n), O(n), O(n log n), O(n²), O(2ⁿ), O(n!)).
4. Read a function and state its time **and** auxiliary-space cost out loud.
5. Explain the trade-off between a slow-but-simple and a fast-but-memory-hungry solution.
6. Use the vocabulary an interviewer expects (worst/average/best case, amortised, in-place).

**Audience:** Complete beginners first; the later sections reward returning readers.
No prior CS theory assumed — only the basic Python from later chapters.

**Non-goals (kept deliberately out, to avoid overwhelming a beginner):**
- Formal limit-based definitions of Θ / Ω (mention Big-O only, note the others exist).
- Master theorem proofs (we *use* recurrence intuition, we don't prove it).
- Cache/hardware-level performance (belongs in ch. 22).

---

## 2. Placement & wiring ("at the top")

The curriculum currently runs `00-interview-strategy` → `24-advanced-dsa-optional`.
"At the top" = a new **Chapter 0**, placed *before* `00-interview-strategy`, inside the
existing **Foundations** track. We avoid renumbering all 25 files.

| Item | Decision |
|------|----------|
| **New file** | `dsa-prep/00-complexity.html` — but `00` is taken. Use `dsa-prep/complexity.html` with the display number **`0`** (marker style, like Contents uses `✦`). |
| **Display label** | Number chip renders **`0`**; title **"Time & Space Complexity"**; eyebrow **"Chapter 0 · Foundations"**. |
| **Track** | `Foundations` (same track as 00 and 01). |
| **Order** | First card in the Foundations block, above `00-interview-strategy`. |

**Three wiring points (all beginner-invisible, must stay in sync):**

1. **[index.html](index.html)** — add a new `<a class="dsa-crow" …>` as the *first* row in the
   Foundations `<div class="dsa-contents">` (before the `00-interview-strategy` row).
   Also update the hero pill `25 chapters` → `26 chapters`.
   *(The "N of N chapters shown" line is computed from `rows.length` in
   [dsa-prep.js:206](../assets/dsa-prep.js#L206) — it updates itself, no edit needed.)*

2. **[sitenav.js](../assets/sitenav.js)** — insert one entry in the `dsa` section's `pages`
   array, immediately after the `Contents` entry and before `00-interview-strategy`:
   `{ path: "dsa-prep/complexity.html", title: "Time & Space Complexity", num: "0", track: "Foundations", kw: "big o time complexity space complexity auxiliary memory constant linear logarithmic quadratic exponential worst average best amortized in place growth rate operations counting" }`

3. **Prev/next `page-nav` chaining** (bottom of pages):
   - `index.html` "Start here →" link → point to `complexity.html`.
   - New page `complexity.html`: prev = Contents (`index.html`), next = `00-interview-strategy.html`.
   - `00-interview-strategy.html`: change its `prev` from Contents to `complexity.html`.

**Head/meta for the new page** (copy the exact pattern from `01-python-dsa-foundations.html`):
same three stylesheets, favicons, `<body data-page="dsa-chapter">`, sidebar + topbar +
`content-wrap` shell, and the four script tags at the end.

---

## 3. Design conventions to reuse (do not invent new CSS)

Reuse the classes already proven in [01-python-dsa-foundations.html](01-python-dsa-foundations.html):

- **Chapter header block:** `dsa-chead` → `dsa-chapter-no` + `dsa-outcome`, `dsa-tags`
  (`dsa-tag core/sde/ds`), `dsa-facts` (study time, prerequisites, drills, difficulty).
- **Code snippets:** `code-block` → `code-head` (`lang` + `dots` + `copy-btn`) → `<pre><code>`.
  Every snippet ends with an `assert` + `print("… ok")` so "runs" means "proven".
- **Callouts:** `callout note` (🧭/🧠), `callout warn` (⚠️), `callout danger` (🚫),
  `callout key` (📏). Used for traps and the memory-analysis standard.
- **Tables:** `table-wrap` > `table` for the complexity-class and cost-cheatsheet grids.
- **Quiz:** `quiz` → `q` / `opt[data-correct]` / `explain`.
- **Cheat sheet:** `dsa-cheat` closing block.
- **Section numbering:** `<h2 id="…">N · Title</h2>` like the other chapters.
- **Bottom nav:** `page-nav` with prev/next.

**One new, optional visual element** (only if cheap to add with existing CSS): a small
ASCII/box "growth table" showing how each class scales at n = 10, 100, 1000 — rendered as a
normal `table-wrap` table, so **no new CSS is required**.

---

## 4. Pedagogical spine — how concepts stack

Each concept is introduced only after its prerequisite, so nothing feels like magic:

```
What is "cost"? (wall-clock is unreliable → count operations)
        │
        ▼
Counting operations in straight-line code and single loops
        │
        ▼
Big-O = "drop constants & lower-order terms, keep the dominant growth"
        │
        ▼
The complexity zoo: O(1) → O(log n) → O(n) → O(n log n) → O(n²) → O(2ⁿ) → O(n!)
        │
        ▼
Nested vs sequential loops (multiply vs add)   ── recognition drills
        │
        ▼
Worst / average / best case, and amortised
        │
        ▼
Space complexity: input vs auxiliary vs output; the recursion stack
        │
        ▼
Time–space trade-offs (hashing for speed, in-place for memory)
        │
        ▼
How to state complexity in an interview (the script) → cheat sheet
```

Every section = **plain-English idea → everyday analogy → tiny code snippet →
"count it with me" walkthrough → 1 short practice question.** Beginner comfort is the
priority: short sentences, one idea per snippet.

---

## 5. Section-by-section content outline

> `id` values are the on-page anchors. Roughly 14 sections + drills + quiz + cheat sheet.

### 0 · Chapter header (`dsa-chead`)
- Outcome sentence (see §1). Tags: Core for every role. Facts: Study time **3–4 h**,
  Prerequisites **none (a little Python helps)**, Drills **6**, Difficulty **Concept, not puzzle**.
- Lead paragraph: "Before *what* to code, learn how to talk about *how expensive* code is.
  This single skill is asked in every interview and quietly runs through every later chapter."

### 1 · Why we don't measure time with a stopwatch (`id="why"`)
- Idea: a fast laptop hides a bad algorithm on small inputs; we care about **how cost grows**
  as the input grows, independent of hardware.
- Analogy: two recipes — one gets slower *a little* as guests double, one *quadruples*. At a
  dinner party both look fine; at a wedding one collapses.
- Snippet: same task, `n=10` vs `n=1_000_000`, showing the linear vs quadratic gap in
  *operation counts* (printed counters, not timings).
- Callout note: "We analyse **growth**, not seconds."

### 2 · Counting operations (`id="counting"`)
- Idea: assign a rough "1 step" to each basic operation; add them up as a function of `n`.
- Walkthroughs (with a running tally in comments):
  - constant work (3 statements → 3 steps → constant),
  - one loop over `n` (→ n steps),
  - a loop doing `k` steps each pass (→ k·n steps).
- Practice: "How many prints does this loop make?"

### 3 · Big-O: keep the dominant term (`id="big-o"`)
- Idea in one line: **Big-O = the shape of growth after dropping constants and smaller terms.**
- Three rules with mini-examples: drop constants (`2n → O(n)`), drop lower-order terms
  (`n² + n → O(n²)`), keep the biggest.
- Analogy: describing a road trip as "about 5 hours" — you don't add the 30 seconds at a stop sign.
- Table: expression → Big-O (5–6 rows).
- Callout key: what "worst case unless stated" means (matches the book's convention).

### 4 · The complexity zoo (`id="zoo"`) — the heart of the chapter
For **each** class: one-line meaning + everyday example + a canonical code snippet +
"where you'll meet it later". Table at the top ranks them best→worst.

| Class | Everyday picture | Canonical code example |
|-------|------------------|------------------------|
| **O(1)** constant | grabbing the first page of a book | `arr[0]`, dict lookup, push/pop |
| **O(log n)** logarithmic | guessing a number by halving the range | binary search, heap push |
| **O(n)** linear | reading every page once | sum a list, find max, linear scan |
| **O(n log n)** linearithmic | sorting a deck by repeated merging | `sorted()`, merge sort |
| **O(n²)** quadratic | shaking hands with everyone in a room | nested loop, bubble sort, naive pair-check |
| **O(2ⁿ)** exponential | trying every on/off combination of switches | naive subsets, naive Fibonacci |
| **O(n!)** factorial | every seating order at a table | permutations, brute-force TSP |

- **Growth table** (as `table-wrap`): steps at n = 10 / 100 / 1000 for each class, so the
  learner *feels* why O(n²) and O(2ⁿ) explode. (Cap huge numbers with "≈ astronomically large".)
- Small self-contained snippet per class (all with `assert` + `print(... ok)`).

### 5 · Sequential vs nested loops — add vs multiply (`id="loops"`)
- Rule: loops **one after another** add (`O(n) + O(n) = O(n)`); loops **inside** each other
  multiply (`O(n) × O(n) = O(n²)`).
- Snippets: two separate loops; a nested loop; a nested loop whose inner bound depends on the
  outer index (the `n(n−1)/2` triangular case → still O(n²)).
- Practice: classify three given fragments.

### 6 · Where log n comes from (`id="log"`)
- Idea: every step **halves** the remaining work → number of steps ≈ log₂ n.
- Analogy: phone book / "higher-lower" guessing game.
- Snippet: binary search with a step-counter proving ~log₂ n comparisons for n up to 1e6.
- Callout note: "Halving the problem → log n. Splitting *and* touching everything →
  n log n (that's sorting)."

### 7 · Worst, average, and best case (`id="cases"`)
- Idea with a linear-search example: item first (best O(1)), item missing (worst O(n)),
  typical (average O(n)).
- Convention: interviews assume **worst case** unless you say otherwise.
- Practice: give best/worst for "check if a list has duplicates by nested loop".

### 8 · Amortised cost (`id="amortised"`)
- Idea: one occasional expensive step, averaged over many cheap ones, is still cheap.
- Canonical example: Python `list.append` — mostly O(1), occasionally resizes O(n),
  **amortised O(1)**. (Cross-link to [01 · Python DSA Foundations](01-python-dsa-foundations.html#list-growth).)
- Callout note: "Amortised ≠ average-case; it's a guarantee across a sequence of ops."

### 9 · What space complexity means (`id="space"`)
- Three buckets, defined simply and with a picture:
  - **Input space** — what you were given (usually not counted).
  - **Auxiliary space** — *extra* memory your algorithm allocates (this is what we optimise).
  - **Output space** — memory for the answer (usually excluded).
- Snippet contrast: summing a list in O(1) auxiliary vs building a new doubled list in O(n) auxiliary.
- Reuse the exact **memory-analysis standard** callout (`callout key`) from ch. 01 §12.

### 10 · The recursion stack is memory too (`id="stack"`)
- Idea: each pending recursive call holds a frame; depth = auxiliary space.
- Snippet: recursive sum → O(n) stack; note the skewed-tree O(h) case.
- Callout note (🧠): "Say the depth out loud: 'O(h), so O(n) worst case on a skewed tree.'"
  (Mirrors ch. 01 §9.)

### 11 · Time–space trade-offs (`id="tradeoffs"`) — the "aha" section
- The core interview move: **spend memory to save time, or save memory by doing more work.**
- Worked pair on one problem (**Two Sum**, beginner-familiar):
  - Brute force: nested loop, **O(n²) time / O(1) space**.
  - Hash map: one pass, **O(n) time / O(n) space**.
  - Side-by-side snippets + a two-row comparison table.
- Second, shorter example: in-place reverse (O(1) aux) vs building a reversed copy (O(n) aux).
- Callout key: "There is rarely a 'best' — there's the best *for the given constraints*.
  State the trade-off; let the interviewer pick."

### 12 · A repeatable analysis recipe (`id="recipe"`)
A numbered checklist the reader applies to any function:
1. Identify the input size(s) — name them (`n`, `m`, …).
2. Count loops: nested → multiply, sequential → add.
3. Spot hidden costs (`x in list`, slicing, string `+=`, sorting inside a loop).
   Cross-link to ch. 01 for the Python-specific traps.
4. Drop constants and lower-order terms.
5. Do the same for extra memory (aux space) + recursion depth.
6. State it: "O(_) time, O(_) auxiliary space, worst case."

### 13 · Common beginner traps (`id="traps"`)
`callout warn`/`danger` set:
- "Two loops means O(n²)" — no, only if **nested**.
- Forgetting that `sorted()` inside a loop adds a log factor per iteration.
- Counting the output array as auxiliary space (usually it isn't).
- Assuming `x in my_list` is O(1) (it's O(n); a set is O(1)). Cross-link ch. 01.
- Ignoring recursion-stack memory when calling a solution "O(1) space".

### 14 · Required drills (`id="drills"`)
6 ordered drills (mirrors ch. 01's numbered `<ol>`):
1. **Name the class.** Given 8 code fragments, state Big-O for each.
2. **Add or multiply?** Classify sequential vs nested loop pairs.
3. **Halving hunt.** Point to the line that makes an algorithm O(log n).
4. **Time vs space.** For Two Sum, write both solutions and fill the trade-off table.
5. **Find the hidden cost.** Spot the operation that secretly makes a function O(n²).
6. **Say it in one sentence.** For 5 functions, produce the interviewer-ready complexity sentence.

### Quiz (`quiz`)
1–2 multiple-choice questions with `data-correct` + `explain`, e.g. "Which is faster for large
n: O(n log n) or O(n²)?" and "A function builds a new list of size n and returns it — what is
its *auxiliary* space?".

### One-page cheat sheet (`dsa-cheat`)
- Growth order best→worst (with the everyday picture for each).
- "Drop constants and lower-order terms."
- Nested = multiply, sequential = add. Halving = log n.
- Worst case unless stated; amortised = averaged over a sequence.
- Aux space excludes input & output; recursion depth counts.
- Interview sentence template: *"O(\_) time, O(\_) space, worst case, because \_."*

---

## 6. The "many examples" inventory (so implementation is mechanical)

Every example is a small, **self-contained, runnable** snippet with `assert` + `print`.
Target ~20 snippets total:

- **O(1):** first element, dict lookup, stack push/pop.
- **O(log n):** binary search with step counter; halving loop.
- **O(n):** sum, max, linear search, count occurrences.
- **O(n log n):** `sorted()`; sketch of merge-sort structure.
- **O(n²):** nested loop pair-sum; duplicate check; triangular `n(n−1)/2`.
- **O(2ⁿ):** naive recursive Fibonacci with a call counter; generating all subsets.
- **O(n!):** generating all permutations (small n, with a count).
- **Loops:** sequential-add vs nested-multiply demonstrations.
- **Space:** O(1)-aux running sum vs O(n)-aux copy; recursive-sum stack depth.
- **Trade-off:** Two Sum brute vs hash; in-place reverse vs copy reverse.

Growth intuition rendered as a table (n = 10 / 100 / 1000) — no code, just numbers.

---

## 7. Voice & formatting rules (consistency with the book)

- Second person, short sentences, one idea per paragraph. British spelling ("amortised",
  "optimise", "analyse") to match ch. 01.
- Bold the term the first time it's defined; `code` font for identifiers and operators.
- Each `code-block` filename is descriptive (`counting_ops.py`, `binary_search_steps.py`, …).
- Cross-link, don't duplicate: point to ch. 01 for Python container costs and the memory
  standard; point forward to ch. 09 (sorting), ch. 10 (binary search), ch. 11 (recursion),
  ch. 04 (hashing) as "you'll use this here".

---

## 8. Implementation checklist (execute after approval)

1. [ ] Create `dsa-prep/complexity.html` from the ch. 01 shell (head, sidebar, topbar, scripts).
2. [ ] Write sections 0–14 + quiz + cheat sheet per §5, with all §6 snippets.
3. [ ] Set breadcrumb `DSA Interview Preparation / Time & Space Complexity`.
4. [ ] Add the Foundations `dsa-crow` card to `index.html` (first row) + bump `25 → 26 chapters` pill.
5. [ ] Repoint `index.html` "Start here →" to `complexity.html`.
6. [ ] Insert the `sitenav.js` `dsa` entry (after Contents, before `00`).
7. [ ] Fix `page-nav`: Contents→Complexity→00, and 00's prev→Complexity.
8. [ ] Verify in browser: sidebar shows "0 · Time & Space Complexity" first; copy buttons,
       quiz, theme toggle, and TOC rail all work; every snippet runs clean (`python file.py`).
9. [ ] Skim on mobile width (nav drawer) and in dark theme.

## 9. Open decisions to confirm before building

- **Display number:** `0` chip (recommended) vs a symbol like `✦`/`★`. Default: **`0`**.
- **Filename:** `complexity.html` (recommended) vs renumbering everything to make it a true `00`.
  Default: **`complexity.html`** (no renumbering, lowest risk).
- **Depth of the zoo:** include O(2ⁿ) and O(n!) for completeness (recommended, kept gentle) —
  or stop at O(n²) to avoid scaring beginners. Default: **include, clearly labelled "rare / brute force".**
