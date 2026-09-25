# Portal rewrite: implementation plan

**v3 · full rewrite.** Earlier versions of this plan added a breakdown block and
did a language pass over existing prose. That is no longer the job. **Every
teaching page is written from scratch in the CampusX shape. The only thing kept
from the current pages is the interview questions.**

---

## 0 · What this version changes

Three instructions drive this rewrite:

1. **Teach every topic the CampusX way**, using the structure in
   `campusx_langchain_langgraph_agentic_research.txt` - problem first, mechanics
   before abstraction, one component at a time, code in assembly order, failure
   before the fix.
2. **Discard the old content.** Do not edit it. Write new content against the
   new template. The only exception is interview questions.
3. **Animated SVG diagrams wherever they help**, not only in the opening block.

Consequences that follow, and are handled below:

- The 15-section module skeleton is retired. §2 defines the replacement.
- Section anchors change, so cross-page links break unless migrated (§8.3).
- Per-page durations must be re-derived after the rewrite. **This reverses the
  earlier "no change to hours" decision** - you cannot rewrite a page end to end
  and honestly claim the same study time (§8.5).
- The research file exposes topics the portal does not currently teach (§7).

---

## 1 · The teaching contract

### 1.1 The 20 rules

Adopted from the research file, in full, as the standard every page is measured
against.

1. Problem before framework class name.
2. Execution mechanics before abstraction.
3. One new core idea per subsection.
4. Define technical terms literally.
5. Keep real engineering terms in English.
6. Show runtime flow as numbered steps or arrows.
7. Teach each component independently before combining it.
8. Build code in the same order the system is assembled.
9. Trace actual values and state after code.
10. Show one failure before teaching the feature that fixes it.
11. Always state where state lives and how long it survives.
12. Always state termination conditions for loops and agents.
13. Separate retrieval, generation, storage and orchestration.
14. Separate model capability from framework capability.
15. Projects come after components.
16. Connect every page to the previous and next page.
17. Use literal examples, not metaphor.
18. Compare real alternatives, not arbitrary pairs.
19. Never use "more advanced" as a reason to choose a technology.
20. End with exact engineering selection rules.

### 1.2 Language rules

- One idea per sentence. Target 15 words, ceiling 25 - **explanatory prose
  only**. Definition sentences and enumerations are exempt.
- Active voice, second person. Paragraphs of 2–4 sentences.
- **Keep the technology's own vocabulary** (rule 5): *component, Runnable,
  retriever, vector store, state, node, edge, reducer, checkpointer, thread,
  superstep, tool schema*. Define each in one line at first use, then reuse the
  same word. Never substitute a vaguer everyday word - an earlier draft replaced
  "component" with "part" and made the page both vaguer and less accurate.
- Banned: metaphor, analogy, anthropomorphism, "magic", and inflated verbs
  (*orchestrates, leverages, facilitates, unlocks, seamlessly, powerful*). The
  ban is on verbs and adjectives, never on technical nouns.
- Numbers instead of adjectives: "adds 200–400 ms", not "adds latency".

**Worked corrections, from the research file:**

| Do not write | Write |
| --- | --- |
| A node is like a worker in a factory. | A node receives the current graph state and returns a state update. |
| The retriever acts like a librarian. | The retriever accepts a query and returns Documents selected by its retrieval strategy. |
| State is the spine of the graph. | Each node returns a partial update. The runtime merges it into the state using the reducer declared for that field. |

### 1.3 Spoken repetition becomes structure

CampusX repeats each idea as definition → simpler restatement → example → code →
observed result. In video that works. In text it becomes four *different*
artefacts, never four paragraphs saying the same thing:

**snapshot** (the block) → **execution trace** (values before and after) →
**code trace** (line by line) → **compact recap** (one bold sentence).

---

## 2 · The page template

Replaces the 15-section skeleton entirely. Sixteen steps, in this order.

| # | Section | What it must contain |
| --- | --- | --- |
| 1 | **What you already know** | Two sentences naming the previous page and the capability it left you with. |
| 2 | **What breaks now** | The literal engineering problem this page exists to solve. No framework names yet. |
| 3 | **Simple breakdown** (the block) | Six labels × two technologies, differences table, In Short. Spec in §3. |
| 4 | **Without the technology** | The manual version, in plain Python. Then the list of what it cannot do. |
| 5 | **Runtime mechanics** | Numbered execution flow + **animated SVG** (§4). |
| 6 | **Smallest working version** | The least code that runs. Nothing optional in it. |
| 7 | **The components, one at a time** | One heading per component: one sentence, one runnable block. The ladder. |
| 8 | **State and data flow** | The ten state questions (§2.1) + **state-trace SVG**. |
| 9 | **Full code, in assembly order** | Imports → schema → functions → wiring → compile → invoke → inspect. |
| 10 | **Trace** | What executed, in what order, and which values changed. |
| 11 | **Break it** | One realistic failure, demonstrated + **failure SVG**. |
| 12 | **Fix it** | The smallest mechanism that fixes the failure in 11. |
| 13 | **Production version** | Retry, timeout, idempotency, concurrency, authorisation, audit, rate limits, cost, evaluation, rollback. |
| 14 | **Comparison** | Genuine alternatives only. Expands the block's differences table. |
| 15 | **Interview questions** | **Carried over from the existing page. The only salvaged content.** |
| 16 | **In short + next page** | Selection rules, then the exact limitation the next page solves. |

Sections 11→12 are the engine of the whole thing: **build, expose failure,
introduce the smallest mechanism that fixes it.** A page that introduces a
feature before showing the failure it fixes is not finished, however accurate it
is.

### 2.1 The ten state questions

Every stateful topic answers all ten, in section 8:

1. What data is state? 2. Who writes each field? 3. Who reads each field?
4. Is the value replaced, appended or merged? 5. What reducer controls merging?
6. Is it only in process memory? 7. Is it checkpointed? 8. Is it in a database?
9. How long does it survive? 10. What thread, user or key retrieves it again?

If the topic is stateless, say so in the first sentence and say what that costs.

---

## 3 · The opening block: locked

Approved on the LangChain sample. Do not redesign it.

- Six labels per technology: **What it is · Core purpose · Execution model** /
  **Architecture under the hood · State handling · Limitations and advanced
  features**. Three difference rows: **workflow design · error recovery ·
  architectural paradigm**. Then **In Short**.
- **No "How this section is written" box.** Earlier drafts opened the block with
  a panel explaining the six labels. Reviewed on the page, it was dead weight - 
  the same text on all 58 pages, explaining a structure the labels already make
  obvious. The heading goes straight into Technology A.
- **The six labels carry `class="no-jargon"`.** `assets/glossary.js` otherwise
  matches "state" inside *State handling* and renders the label split around a
  tooltip.
- **The page's own technology is always Technology A.**
- **A ladder still breaks down exactly two technologies.** A third appears only
  as a table column and an *In Short* bullet.
- *What it is* is one dense sentence naming the category and the real
  components. The approved model:
  *"LangChain is an open-source Python framework for building LLM-based
  applications from reusable components such as models, prompts, retrievers,
  tools, and runnables."*
- *Core purpose* is one sentence: *"It reduces the amount of application code you
  need to write when several LLM-related components must work together."*
- *Execution model* is an **animated SVG**, not text.
- Measured size: **703 words.** Budget 550–800.

---

## 4 · The SVG diagram system

Diagrams are functional, not decorative. A useful one shows nodes, edges,
START/END, branching, loops and state movement - nothing else.

**Seven reusable types**, built once in `assets/styles.css` with a documented
markup pattern, so 58 pages do not each invent their own:

| Type | Shows | Animation |
| --- | --- | --- |
| `flow` | Linear stages left to right | Stages light in sequence; a dot travels between them |
| `cycle` | A flow with a back edge | Same, plus a dashed animated return arc |
| `branch` | One input, a routing test, several exits | Only the selected path lights |
| `parallel` | Fan-out to N branches, then merge | Branches light at the same time; merge lights last |
| `state-trace` | A state object's fields after each node | Rows fill in as each node runs |
| `layers` | Application → client → server → external system | A request descends and a response returns |
| `failure` | The same flow with one stage failing | The failing stage turns red; the run stops or falls back |

**Rules for all seven:** existing CSS tokens only, so dark mode needs no extra
rules. `<title>` and `<desc>` on every diagram so the flow is readable as text.
All animation stops under `prefers-reduced-motion`. `viewBox` + `width:100%`, and
below 600 px the layout stacks vertically rather than shrinking the labels.

**Minimum per page: three.** Execution model (§5), architecture or state trace
(§8), failure (§11). Pages about control flow - LangGraph, agents, routing,
CRAG, Self-RAG - will want five or six.

The `flow` and `cycle` types are already built and working in
`docs/sample-langchain.html`. The other five are new.

---

## 5 · What is kept, and what is deleted

**Kept - interview questions only.** Section 10 of each current module page
(`<h2 id="interview">`) moves into section 15 of the new page, wording unchanged
unless it references content that no longer exists.

**Deleted and rewritten from scratch:** executive summary, first principles,
visual architecture, deep technical explanation, interactive widgets, practical
Python, Ollama section, industry perspective, top mistakes, mini project, real
project connection.

**Needs your decision - three sections that are questions but not interview
questions:** `11 · Knowledge check` (quiz), `12 · Active recall`,
`13 · Exercises`. They test content that will no longer exist, so they cannot be
carried over verbatim. My assumption unless you say otherwise: **rewrite them
against the new content**, keeping the same three formats.

**Not touched:** the standalone question banks (`interview-prep/*`), the timed
drills (`interview-labs/*`), and the scenario pages - those are already
question-only pages and are Type C in §6.

---

## 6 · Page inventory and comparisons

**58 pages get the full template and a block** (55 comparison, 3 solo).
27 route pages get neither - index pages, drills, question banks, scenarios,
mocks, job search - because they test knowledge rather than teach a technology.
58 + 27 = 85 = 69 spine steps + 16 Python rail steps.

The comparison for each page is unchanged from v2 and stays as recorded, with
the page's own technology as Technology A throughout:

| Phase | Pages | Representative comparisons |
| --- | --- | --- |
| 1 · Foundations | 5 | Pre-training vs Fine-tuning · Training vs Inference · Transformer vs RNN · Local vs Hosted · Ollama vs vLLM |
| 2 · Retrieval | 3 | Embeddings vs BM25 · Vector DB vs Relational · RAG vs Fine-tuning |
| 3 · Agent fundamentals | 2 | Agent vs Workflow · MCP vs REST tool schema |
| 4 · Agent course | 15 | Structured vs free text · ReAct vs Plan-execute · Retry vs Fallback · Allowlist vs Guardrail model · Final-answer vs Trajectory eval |
| 5 · Frameworks | 9 | **LangChain vs LangGraph** · LlamaIndex vs LangChain · asyncio vs Threads · Pydantic vs dataclass · Supervisor vs Handoff · MCP vs A2A |
| 6 · Production | 6 | Offline eval vs Online monitoring · LLM-judge vs Deterministic metric · MLOps vs LLMOps · Input vs Output guardrail |
| 7 · Backend | 4 | asyncio vs Threads · FastAPI vs Flask · WebSockets vs SSE · Text-to-SQL vs RAG |
| 8 · Capstone | 1 | Which stack to choose |
| Python rail | 13 | list vs tuple · Generator vs List · Decorator vs Context manager · Inheritance vs Composition · Shallow vs Deep copy |

---

## 7 · Coverage gaps the research exposes

I grepped the portal against the CampusX ladder. These are taught by CampusX and
are **missing or thin here**, and the rewrite is the moment to add them.

| Missing | Evidence | Where it belongs |
| --- | --- | --- |
| **Document loaders** | Named on `modules/11_llamaindex.html` only | LangChain component ladder |
| **Text splitters, chunk size, chunk overlap** | `TextSplitter` appears on **0 pages** | LangChain component ladder |
| **RunnableBranch** | **0 pages** | LangChain, composition section |
| **RunnableLambda** | 1 page, in passing | LangChain, composition section |
| **Pregel / supersteps** | 0 real pages | LangGraph, architecture section |
| **Subgraphs** | `langgraph.html` only | LangGraph deep dive |
| **CRAG (Corrective RAG)** | Named once, not taught | `rag-deep-dive.html` |
| **Self-RAG** | Named once, not taught | `rag-deep-dive.html` |
| **"LLMs do not have memory"** | Not stated anywhere as its own idea | `memory.html`, opening section |

The last one matters more than its size suggests. It is the misconception that
makes learners think checkpointing and memory are the same feature, and CampusX
gives it a whole lesson.

**Deliberately not adopted:** the Streamlit UI lessons. This portal is an
interview-preparation route, not an app-building course, and a UI layer earns
its place only inside the capstone.

---

## 8 · Tooling

### 8.1 `assets/styles.css`
The `.breakdown` component (drafted, inline in the sample) plus the seven
diagram types from §4. Written once.

### 8.2 `assets/curriculum.js`
Per page: `breakdown: {shape, a, b, third?}`. `shape` is
`pair | ladder | nearest-confused | none`.

### 8.3 Anchor migration: **new, and the highest-risk item**
The old ids (`summary`, `first-principles`, `architecture`, `deep-dive`,
`interactive`, `python`, `ollama`, `industry`, `mistakes`, `interview`, `quiz`,
`recall`, `exercises`, `mini-project`, `real-project`) are replaced by the
sixteen new ones. `check_links` in `tools/validate.py` already validates every
in-page anchor across 193 files, so breakage will be caught - but it must be
planned, not discovered. Before wave 1: build the old→new id map, and rewrite
every inbound link in the same commit as the page it points at.

### 8.4 New validator checks
- `breakdown-blocks` - block present, first on the page, six labels per
  technology, three difference rows, In Short present, heading agrees with the
  manifest.
- `page-template` - all sixteen sections present, in order.
- `diagram-minimum` - at least three `.bd-svg` figures, each with `<title>` and
  `<desc>`.
- `interview-carryover` - the new section 15 is non-empty on every page that had
  an interview section before. Catches the one thing that must not be lost.

### 8.5 Duration re-derivation: **decision reversed**
The earlier "counts as revision, hours do not change" decision applied to adding
a block. It cannot survive a full rewrite. Per-page durations are re-derived
after each wave, and the ten published totals in `study-plan.html` are recomputed
**once, at close-out**, not per wave. The metric checks already in the validator
will hold the numbers honest.

### 8.6 `tools/plain-language.py`
Banned phrases, sentences over 25 words outside definitions, passive voice,
"more advanced" as a justification, undefined acronyms on first use.

---

## 8b · Build status

**Phase 0 - complete.**

| Item | State |
| --- | --- |
| Interview archive | `tools/extract-interview-carryover.py` → **33 pages, 98 questions, 20,974 words** in `docs/carryover/` |
| Shared CSS | `.breakdown` + all 7 diagram types appended to `assets/styles.css` (+239 lines) |
| Validator | 4 new checks in `tools/validate.py`: `rewrite-sections`, `rewrite-block`, `rewrite-diagrams`, `interview-carryover`. Scoped by content, so they switch on per page |

**Phase 1 - complete.** `modules/10_langchain.html`, `modules/12_langgraph.html`.

**Wave 1 - complete.** 7 pages rewritten in total.

| Page | Sections | Diagrams | Questions |
| --- | --- | --- | --- |
| `modules/10_langchain.html` | 16 | 7 | 7 carried |
| `modules/12_langgraph.html` | 16 | 7 | 7 carried |
| `modules/01_foundations.html` | 16 | 6 | 7 carried |
| `modules/02_transformers.html` | 16 | 4 | 7 carried |
| `modules/03_local_llms.html` | 16 | 4 | 6 carried |
| `interview-prep/00-neural-networks.html` | 16 | 4 | 16 carried |
| `hermes.html` | 16 | 3 | 6 **new** |

`hermes.html` had no interview section to carry, so six were written for it and
labelled as new rather than carried. That is the standing rule for any page in
the same position.

**Wave 2 - complete.** 9 pages rewritten in total.

| Page | Sections | Diagrams | Questions |
| --- | --- | --- | --- |
| `modules/11_llamaindex.html` | 16 | 4 | 7 carried |
| `langgraph-pydantic.html` | 16 | 3 | carried |

**Wave 3 - complete.** 12 pages rewritten in total.

| Page | Sections | Diagrams | Questions |
| --- | --- | --- | --- |
| `modules/04_embeddings.html` | 16 | 3 | 6 carried |
| `modules/05_vector_databases.html` | 16 | 4 | 6 carried |
| `rag-deep-dive.html` | 16 | 4 | 8 **new** |

**Eight of the nine §7 coverage gaps are now closed**, verified by grep:

| Gap | Now taught in |
| --- | --- |
| Document loaders | `modules/10_langchain.html` |
| Text splitters, chunk size, overlap | `modules/10_langchain.html`, `rag-deep-dive.html` |
| `RunnableBranch` | `modules/10_langchain.html` |
| `RunnableLambda` | `modules/10_langchain.html` |
| Pregel / supersteps | `modules/12_langgraph.html` |
| Subgraphs | `modules/12_langgraph.html` |
| CRAG | `rag-deep-dive.html` |
| Self-RAG | `rag-deep-dive.html` |

The ninth - **"LLMs do not have memory" as its own idea** - was closed in
wave 6. It is now `memory.html` §2's opening premise. **All nine §7 coverage
gaps are closed.**

**Wave 6 - complete.** 6 pages rewritten, bringing the verified total to
**39 of 58**.

| Page | Comparison (A vs B) | Questions |
| --- | --- | --- |
| `memory.html` | memory store vs a longer context window | 7 **new** |
| `llm-evals.html` | evaluation suite vs manual review | 7 carried |
| `guardrails.html` | code guardrail vs a system-prompt instruction | 7 **new** |
| `llmops.html` | LLMOps vs MLOps | 6 carried |
| `langfuse.html` | tracing platform vs your own logging | 7 **new** |
| `modules/14_production_genai.html` | production system vs a working prototype | 7 carried |

**The last §7 coverage gap is closed.** "LLMs do not have memory" is now
`memory.html` §2's opening premise, demonstrated in two calls, with a table
separating it from the three assumptions people substitute for it - including
that checkpointing is memory, which it is not.

**A third carry-over counting shape.** After waves 5's `class="recall"` and
`Q &middot;` fixes, `llm-evals.html` and `llmops.html` still reported 0
questions because theirs are `Q.` callouts. The counter now recognises all
three, and the archive reports **83 pages / 577 questions / 80,606 words**.
Verified with `--verify`: no archived byte changed. Three pages - `memory.html`,
`guardrails.html`, `langfuse.html` - genuinely have no interview section
anywhere in their history, so theirs were authored and labelled new.

### Two tooling guards added, both from defects that had already shipped

**`tools/make-rewrite-body.py`** - the wave-5 harness, promoted from scratch
with a `_check_closed` guard. A section body ending in prose rather than a tag
is a `<p>` that was never closed: browsers close it, so the page renders, but
the source and the output disagree and anchor matching silently fails. It fired
on nine sections of the first wave-6 page and on every page after.

**`tools/apply-rewrite.py` now warns on dropped cross-page links.** Three
consecutive waves shipped a rewrite that silently removed a link the live page
carried; twice it was the Release 3.1 canonical middleware anchor, which turned
`middleware-cross-links` amber days later. The guard warns rather than refusing,
because a rewrite legitimately drops most old links - but it names them, so the
decision is made rather than discovered. **It caught two real cross-references
on its first run**, and four more across wave 6 that were restored pointing at
the rewritten targets' new sections.

Validator after wave 6: **5 failed, 3 warnings** - the pre-existing baseline.
All 39 rewritten pages pass the four checks, their Python snippets compile, and
the 190 project tests pass.

**Wave 5 - complete.** 4 pages rewritten, bringing the verified total to
**33 of 58**.

| Page | Comparison (A vs B) | Diagrams | Questions |
| --- | --- | --- | --- |
| `langgraph-asyncio.html` | asyncio vs threads | 3 | 6 carried |
| `langgraph.html` | checkpointer vs process state | 3 | 7 **new** |
| `modules/13_multi_agents.html` | supervisor vs one agent with every tool | 3 | 7 carried |
| `agent-protocols.html` | MCP vs A2A, with A2UI as a third column | 3 | 5 carried |

`langgraph.html` had no interview section anywhere in its history, so seven were
written for it and labelled new - the standing `hermes.html` rule.

**Two defects found in the carry-over tooling, both counting bugs rather than
lost content.** `extract-interview-carryover.py` counted only
`<details class="collapse">`, so pages using `class="recall"` or `Q &middot;`
callouts reported **0 questions** while their archived text was complete and
correct. `apply-rewrite.py` had the same bug in its confirmation line. Both now
count any `<details>` plus callout-style questions, and the archive reports
**81 pages / 550 questions / 79,814 words** rather than 99 questions. Verified
with `--verify`: no archived byte changed, only the counts.

**The §8.3 anchor risk fired again**, as it now has in every wave that touches a
linked page: rewriting `langgraph.html` broke `claude-agent.html -> #hitl`,
remapped to `#components` where the `interrupt` material now lives. And the
`agent-protocols.html` rewrite dropped the Release 3.1 canonical link, turning
`middleware-cross-links` amber; the link is restored in the section that makes
the same point, so the check is green again. **Both were caught by the validator
rather than by reading**, which is the argument for running it after every page.

**A source-level habit worth recording:** several section bodies ended in prose
with no closing `</p>`. Browsers close it, so the pages rendered correctly, but
anchor-matching against the generated HTML failed and the source disagreed with
the output. All wave-5 bodies now close their paragraphs.

Validator after wave 5: **5 failed, 3 warnings** - the pre-existing baseline.
`rewrite-sections`, `rewrite-block`, `rewrite-diagrams` and
`interview-carryover` cover 33 pages and are green; all 33 pages' Python
snippets compile; the 190 project tests pass.

**Wave 4 - in progress.** `modules/08_agents.html` (16 sections, 4 diagrams, 7
carried) and `modules/09_mcp.html` (16 sections, 3 diagrams, 7 carried) are
done, which brings the verified total to **14 of 58 pages**.

### Wave 4a: the 15 lesson pages, enriched in place

The `teach-agents/lessons/` pages are a build-along lab: one codebase in
`teach-agents/project/` grows across the fifteen lessons, 190 tests pass against
it, and every code block is an excerpt from a real file. They already implement
the plan's engine - problem first, `break` → `fix`, `production`, `interview`,
`recap` - so they were enriched rather than restructured:

| Done | Detail |
| --- | --- |
| **45 diagrams** | Three per lesson, anchored to prose that already argued for one. Verified well-formed, titled, described, LF, no label overflow, legible in both themes |
| Python errors | The two flagged in the 15 registered lessons were both intentional `...` excerpts. One was already labelled and is now allowlisted; the other four reported earlier were the `<=` validator bug, now fixed |
| `.mono` fill | `state_trace` is the first consumer of `.bd-svg .mono`, which set no `fill` - row labels rendered as disabled text in dark mode. Given an explicit token |

**`tools/make-diagram.py`** generates all seven types from computed geometry, so
the ~200 diagrams the rewrite still needs cannot drift in baseline, stagger
class, or missing `<title>`/`<desc>`. Three defects it now refuses outright,
each found by rendering rather than by reading:

- a third line in a box - silently dropped before, which turned
  `"two refunds|if not idempotent"` into a box reading *"two effects"*: a wrong
  diagram that still validated;
- a `"|"` in a `state_trace` row, where rows are single-line - it rendered
  literally as *"what we know|about the customer"*;
- fixed-width `branch` exit columns - long labels sat flush against both box
  edges, so the column is now sized from its content.

**Checked and found not to be a defect:** diagrams appear clipped at a 360 px
headless window, but so does the body text, and an isolated render at the same
width scales correctly. Headless Chrome does not honour `<meta viewport>`
without device emulation. No page change was made.

### Wave 4b: the CampusX section, 15 new pages

A second section at `teach-agents/campusx/`, one page per lesson of the
hands-on course, each written to the **literal sixteen-section template**. Where
a lesson teaches a build step, the page teaches the idea behind it.

**On the invented comparisons.** The concern that build-step lessons have no
honest Technology B did not survive contact with the work: the real alternative
is always the *manual* one - an agent vs a fixed workflow, tool calling vs
parsing free text, an approval gate vs full autonomy, tracing vs logging.
Section 4 then writes that alternative out in real Python and shows where it
fails, which is exactly what §2 asks for. **The template fits; the earlier
worry was wrong.**

| | |
| --- | --- |
| Pages | 15, plus a generated section index |
| Sections | 16 on every page, in order |
| Diagrams | 45, three per page, all seven types used |
| Questions | 90, authored - these pages are new, so nothing was carried (the `hermes.html` rule) |
| Voice | §1.2, no analogies - matching the 14 rewritten module pages |

**Voice decision, recorded because the repo contradicted itself.** §1.2 bans
metaphor outright, while `0_interview_focused_portal/PLAN.md` line 19 overturned
exactly that rule for its own portal, reasoning that CampusX's voice is built on
analogies. Both readings of "simple language" were defensible. Written both
ways and put to the owner: **genai-main uses Voice A**, so the whole portal
stays in one voice. The sibling portal keeps its own rule.

**Tooling**, so the remaining 29 pages of the rewrite are content work:

- `tools/make-agents-section.py` - assembles a page from a spec and self-checks
  section count, diagram minimum, and six labels on both technologies.
- `tools/agents_section_content.py` - the prose, as data.
- `tools/make-agents-index.py` - generates the index from the specs, so a page
  cannot be added without appearing there and the card copy cannot drift.

**Registered, not routed.** The 16 pages are in `assets/curriculum.js` with
`contentRole: "learn"` and null durations, and linked from
`teach-agents/index.html`. No route gained a step: route counts and the ten
published totals are pinned by the validator and are recomputed once at
close-out (§8.5). `curriculum.js` is a UMD module, not JSON - its own header
says Python never parses it - so registration edits the text and
`tools/curriculum-export.js` stays the reader.

**Three defects found by checking rather than reading:** a bare `return` at
module level in page 04's assembly snippet; a regex in page 09 whose escaped
quote broke the surrounding string; and "highest-leverage", an inflated
adjective §1.2 bans. Page 12's column block is the same intentional excerpt as
`modules/09_mcp.html` and is labelled and allowlisted.

**Validator after both parts:** 5 failed, 3 warnings, down from 6 and 6.
`rewrite-sections`, `rewrite-block`, `rewrite-diagrams` and
`interview-carryover` now cover **29 pages** and are green; `page-identity`,
`no-links-to-retired-pages` and both middleware checks moved to ok; the 190
project tests still pass. Every remaining failure is pre-existing and out of
scope (§11): the retired `lessons/` duplicates, `0_interview_focused_portal/`,
`ats-agent-lab/`, `learn-rag-mcp/`, and the three-active-route condition.

**`tools/apply-rewrite.py`** now does the assembly - shell in, body + carried
section 15 + section 16 spliced, term dialogs dropped, description swapped. Page
bodies are authored as fragments and applied with one command, so the remaining
53 pages are content work rather than surgery.

All three pass the four new checks.

**Correction - the §8.3 anchor risk did materialise.** An earlier revision of
this section claimed `missing-anchors` stayed at 0 and the risk had not
appeared. It had: rewriting `modules/09_mcp.html` and `rag-deep-dive.html`
dropped the old section ids, and **14 inbound links from 6 pages** broke. The
claim was wrong because the count was read before those two pages landed.
Resolved (below); the lesson is that §8.3's map must be built *per wave*, at the
moment a page is rewritten, not once at the start.

### Defects found and fixed in waves 1–3

| Defect | Cause | Fix |
| --- | --- | --- |
| `interview-prep/00-neural-networks.html` nav block truncated - lost its Previous title and its whole Next anchor, and swallowed `</main>` inside the unclosed nav `<div>` | Residual damage from the fragment-contamination bug; the page was repaired from a clean sibling but the nav block was not | Nav restored from the immutable baseline fixture |
| `nav-baseline-drift` reported 7 pages | `baseline_inner` compared a CRLF-era fixture against LF-normalised blocks, so an untouched nav read as drift on every rewritten page. The line 427 CRLF fix was incomplete - it normalised the *pages*, not the *comparison* | `baseline_inner` now normalises line endings, with the reason recorded next to the `data-page-nav` exemption it sits beside |
| `python-snippet-syntax` flagged `langgraph-pydantic.html` | Validator bug, not a page defect. The tag-strip regex ate `<= urgency <=`, turning valid `if not 1 <= urgency <= 10:` into `if not 1` | Tag pattern now requires a name character after `<`, so comparison operators survive |
| `python-snippet-syntax` flagged `modules/09_mcp.html` | Genuine but intentional - three teams' signatures in columns, to make the duplication visible | Added to `PY_EXCERPT_ALLOWLIST` with its reason, matching the existing entries |
| `middleware-section` + `middleware-cross-links` warnings | The `09_mcp.html` rewrite **deleted the Release 3.1 canonical section** outright. Its prose was unrecoverable - no git repo, no backup, and the carry-over archive holds only interview questions | Re-authored from the drill's stated scope: API vs agent middleware, authn/authz, JWT/OAuth 2.0/OIDC, JWT validation, confused deputy, MCP vs A2A, multi-tenant isolation, observability. Kept as a documented exception outside the 16-section template, since 4 other pages deep-link into it |
| `missing-anchors` at 20 | The two rewrites dropped `#guardrails`, `#output-eval`, `#chunking`, `#conflicts`, `#pipeline`, `#retrieval`, `#hallucination`, `#middleware-identity-interoperability` | Added ids to the §7 subsections of `rag-deep-dive.html` (`indexing`, `retrieval`, `generating`, `correcting`) and remapped all 14 links to the section that actually delivers what the linking sentence promises. Now **5**, all pre-existing and out of scope |

Two nav fallbacks (`guardrails.html`, `langfuse.html`) carried dead fragments
after the remap. The destination page is unchanged and the nav title already
names the topic, so the fragment was dropped and both are recorded as approved
differences with their destinations asserted - not silenced.

**Remaining validator failures are all pre-existing and out of scope** (§11):
the retired `lessons/` duplicates with broken `../../` asset paths, the
unregistered `0_interview_focused_portal/` tree, `ats-agent-lab/`, and the
three-active-route condition. None is rewrite-caused.

### What the pilot proved

- **The template generalises past frameworks.** On `01_foundations` the three
  framework-shaped sections re-read cleanly: *without the technology* became an
  n-gram counter in nine lines, *smallest working version* became fifteen lines
  of `transformers` printing real token probabilities, and *assembly order*
  became the generation loop written out with no library running it.
- **Break-it → fix-it carries the page.** LangChain: a retriever returns nothing
  and the model invents a refund policy. LangGraph: a router with no exit burns
  25 model calls. Foundations: truncation silently deletes the system prompt.
  Each failure is shown before the mechanism that fixes it.
- **The banned-phrase scanner needs word boundaries.** It flagged
  "**orchestra**tion framework" in a carried-over interview answer. The ban is on
  the verb *orchestrates*, never on the noun.

### Two defects the waves found in Phase 0's own work

**The archive filter missed a question bank.** It matched section ids containing
"interview", which caught `interview-checklist` on the neural-networks page but
not the `id="questions"` heading below it holding *10 · Neural network interview
questions*. That page was archived with **75 words instead of 1,686**. The
filter now matches `questions` too, and the archive is **64 pages / 98 questions
/ 73,662 words**. Quiz, active recall and exercises are still deliberately
excluded - they test content the rewrite replaces.

**Archived fragments swallowed the page tail.** `section_after` ended a fragment
at the next `<h2>`. When the interview section is the *last* one on a page there
is no next `<h2>`, so the fragment ran to end-of-file and captured the page-nav
block, `</main>`, the script tags and `</body></html>`. **29 of 64 fragments
were contaminated.** Splicing one produced a page with three `</main>` and three
`</body>`, and because the splice preserves the live tail, re-running preserved
the damage. Fixed three ways: the fragment now also ends at a page-nav,
`</main>` or `<dialog>` boundary; `apply-rewrite.py` refuses to write a document
with more than one `</main>`, `</body>`, `</html>` or any duplicate element id;
and the affected page was repaired from a clean sibling. Re-extraction: 64
pages, **99** questions, 73,353 words, 0 contaminated.

**Every rewritten page was written as CRLF.** The repo is LF throughout;
Python's default newline translation on Windows rewrote every line, which turned
each page into a whole-file diff and tripped `nav-baseline-drift` on all five.
Both tools now pass `newline="\n"`, everything written this session is
normalised, and the drift is back to its pre-existing count. **Any future script
that writes a page must set `newline="\n"`.**

---

## 9 · Phase-wise execution

### Phase 0: Foundations of the rewrite *(no page content)*
- `docs/TEACHING_STYLE_GUIDE.md` - §1 and §2 of this plan, plus the worked
  corrections.
- The seven SVG types in `assets/styles.css`, each with a documented snippet.
- The old→new anchor map, and the four validator checks.
- **Extract and archive every existing interview section** to
  `docs/carryover/interview/<page-id>.html` before any page is rewritten. This
  is the one irreversible risk in the whole project - do it first, verify the
  count, then start.

### Phase 1: Pilot *(2 pages)*
- `modules/10_langchain.html` - the sample at `docs/sample-langchain.html` is a
  partial draft against the *old* skeleton. It must be restructured to the
  sixteen sections and extended: document loaders, text splitters,
  RunnableBranch and RunnableLambda added to the ladder (§7).
- `modules/12_langgraph.html` - the natural pair, and the page where `cycle`,
  `branch`, `parallel` and `state-trace` diagrams all get their first use.
- **Gate: you approve both before wave 1 starts.**

### Content waves: CampusX ladder order

The research file's cross-playlist ladder is the writing order, because each
stage supplies vocabulary the next one assumes.

| Wave | Stage | Pages | Notes |
| --- | --- | --- | --- |
| 1 | Model application basics | 5 | Foundations, transformers, local LLMs |
| 2 | Composition | 3 | LangChain, LlamaIndex, Pydantic |
| 3 | External knowledge | 3 | Embeddings, vector DBs, RAG - **plus CRAG and Self-RAG** |
| 4 | Actions and the agent loop | 2 + 15 | Agentic AI, MCP, then all 15 course lessons |
| 5 | Explicit control flow | 4 | asyncio, LangGraph, LangGraph deep dive, multi-agent |
| 6 | Durability, operations, safety | 6 | Production, evals, Langfuse, LLMOps, guardrails, memory |
| 7 | Backend | 4 | sync/async, FastAPI, WebSockets, SQL |
| 8 | Python rail | 13 | Runtime mechanics |
| 9 | Integration | 1 | Capstone |

Waves 2 and 5 revisit the two pilot pages once the surrounding vocabulary
exists.

### Phase 10: Close-out
- All four new validator checks green.
- Durations re-derived; the ten totals recomputed and reprinted once.
- "How every page is structured" added to `study-plan.html` and `index.html`.
- `CURRICULUM.md` principles replaced with the 20 rules.

---

## 10 · Definition of done

A page is finished when a learner who read only that page can answer:

1. What exactly is this? 2. Why does it exist? 3. What happens when it runs?
4. What are its components? 5. Where is state stored? 6. How does it change, and
how long does it survive? 7. What happens when something fails? 8. How would you
detect that? 9. What can it not do well? 10. What advanced features exist?
11. How does it differ from the nearest real alternative? 12. When should I use
it, and when not? 13. Could I implement a small version myself? 14. Can I
explain it without a single analogy?

Mechanical checks: all sixteen sections present and in order · interview section
carried over and non-empty · at least three diagrams with `<title>`/`<desc>` ·
block 550–800 words with the page's technology as A · every code block valid
Python in assembly order · `plain-language.py` clean · dark mode and 360 px
verified · `validate.py` shows no new failures.

---

## 11 · Scope and risk

**This is now roughly three times the v2 job.** v2 added a block and edited
existing prose. v3 writes 58 pages from scratch - new prose, new code in
assembly order, new traces, new failure demonstrations, and three to six new
animated diagrams each. Order of 150,000–200,000 words of new content plus
roughly 200 diagrams.

| Risk | Mitigation |
| --- | --- |
| **Interview questions lost during a rewrite** | Extracted and archived in Phase 0, before any page is touched; `interview-carryover` check enforces it |
| Cross-page anchors break | Old→new id map built in Phase 0; `check_links` already validates all 193 files |
| Correct technical detail lost when discarding old pages | Old pages stay in git history; each rewrite is diffed against the page it replaces for factual claims, even though the prose is not reused |
| 58 pages drift into 58 shapes | `page-template` and `breakdown-blocks` checks, not eyeballing |
| Diagrams become decorative | Seven fixed types only; a new type needs a reason |
| Published hour totals go stale | Re-derived per wave, recomputed once at close-out (§8.5) |
| The rewrite stalls half-done, leaving the portal in two styles | Waves are ordered so each one is independently coherent; a wave is never left partly written |

**Out of scope unless you ask:** the DSA track (29 pages), `machine-learning/`
(26 pages, off-route), `ats-agent-lab/`, `learn-rag-mcp/`, and the retired
`lessons/` duplicates.
