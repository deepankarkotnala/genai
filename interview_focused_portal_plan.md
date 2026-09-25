# Interview-focused portal: implementation plan

A new portal, same design as the existing one, dedicated to the questions
actually asked in GenAI / AI-ML / Agentic AI interviews at large employers
hiring in India - and, for each one, an answer simple enough that you can say it
out loud and be understood.

Working name: **Interview Room**. Directory: `interview-room/`.

---

## 0 · What already exists, and why that changes the design

Before proposing anything, I counted what the portal already has.

| Surface | Pages | Question cards |
| --- | --- | --- |
| `interview-prep/` - topic-wise GenAI bank | 13 | **147** |
| `python-interview/` - Python bank | 16 | **347** |
| `machine-learning/` - classical ML bank | 26 | **196** |
| `interview-labs/` - timed technical drills | 7 | - |
| `scenario-practice/` - system-design scenarios | 10 | - |
| `docs/carryover/` - archived from the rewrite | 64 | 98 |
| `python_ai_ml_interview_questions_2026.md` | 1 file, 83 KB | - |

**690 question cards already exist.** So the gap this portal fills is not
volume, and a fourth topic-wise bank would be waste that competes with the three
you have.

**The gap is everything around the question:**

| The existing banks give you | They do not give you |
| --- | --- |
| A correct answer, by topic | Which round it gets asked in |
| A 30-second version | What the interviewer is actually testing |
| A likely follow-up | The wrong answer that loses the offer |
| - | What changes when the employer is a healthcare payer, a bank, or a services firm |
| - | Which answer to give at 2 years versus 8 years of experience |
| - | A rehearsal loop that tells you whether you can actually deliver it |

**This portal is a delivery portal, not a knowledge portal.** It reuses the
existing question corpus as its seed and adds the layer that converts knowing an
answer into being selected.

---

## 1 · An honest note on sourcing

I cannot give you verified transcripts of questions asked inside Optum,
UnitedHealth Group or any other named company. Anything claiming to be a leaked
company question bank is either fabricated or someone's recollection, and
presenting invented questions as real ones would set you up to walk into a room
expecting the wrong interview.

What this portal can honestly be built from:

1. **Public job descriptions** for GenAI / AI Engineer / ML Engineer roles at
   these employers' India centres - the responsibilities and required skills are
   published and are what the panel is briefed from.
2. **The domain the employer actually works in.** A healthcare payer interviews
   about PHI handling, de-identification, audit trails and Azure OpenAI because
   that is the system they run. That inference is sound and useful.
3. **The published interview process** - round structure, durations and formats
   that companies document on their own careers pages.
4. **The 690 cards already in this portal**, re-cut by round and by employer
   type.

Every page will say which of those four a question set is grounded in.
**No page will claim "this was asked at Optum" unless you supply it from your
own experience.** There is a contribution slot for exactly that (§9, phase 4).

---

## 2 · What the portal is

Three ways in, over one shared question set:

**By topic** - 18 topic pages mirroring the study plan, so a weak checkpoint
links straight to the questions that expose it.

**By round** - screening call, technical 1, technical 2 / system design, hiring
manager, HR. The same question is answered differently in round 1 and round 3,
and this is the axis no existing surface has.

**By employer type** - five tracks, because the same GenAI role interviews
differently depending on what the company sells (§6).

Plus one **rehearsal loop**: a timer, a self-score, and a record of which
questions you have delivered out loud without notes.

---

## 3 · Design and reuse

Same portal, same everything. Nothing new is designed.

| Asset | Reused as-is |
| --- | --- |
| `assets/styles.css`, `office-theme.css`, `genai-motion.css` | Yes |
| `assets/app.js`, `sitenav.js`, `enhance.js`, `glossary.js` | Yes |
| Sidebar, topbar, breadcrumbs, theme toggle, reading controls | Yes |
| `.prep-question` card + `assets/interview-prep.js` search and filter | **Yes - this is the core reuse** |
| Brand metadata, favicons, social card | Yes |

The existing card already carries most of what is needed:

```html
<details class="prep-question" data-question="what is an ai agent?"
         data-tags="agent definition architecture">
  <summary>… number, title, tags, chevron …</summary>
  <div class="prep-answer">
    <div class="prep-answer-label">Strong answer</div>   <p>…</p>
    <div class="prep-say"><strong>30-second version</strong><p>…</p></div>
    <div class="prep-follow"><strong>Likely follow-up:</strong> …</div>
  </div>
</details>
```

---

## 4 · The answer card, v2

Four slots added to the existing card. Same class names extended, same
stylesheet, so the two portals stay visually identical.

```html
<details class="prep-question" data-round="tech-1" data-level="2-5"
         data-track="healthcare" data-tags="rag phi evaluation">
  <summary>…</summary>
  <div class="prep-answer">

    <div class="prep-why">Testing: whether you know retrieval can fail silently</div>
    <div class="prep-answer-label">Strong answer</div>  <p>…</p>
    <div class="prep-say"><strong>Say this (25 seconds)</strong><p>…</p></div>
    <div class="prep-numbers">Numbers to quote: p95 900 ms, 4 chunks, ₹0.4 per query</div>
    <div class="prep-wrong">Loses the offer: "RAG stops hallucination." It does not.</div>
    <div class="prep-follow"><strong>Likely follow-up:</strong> …</div>

  </div>
</details>
```

| Slot | Purpose | Rule |
| --- | --- | --- |
| `prep-why` | What the interviewer is checking | One line. Names the skill, not the topic |
| `prep-answer` | The full correct answer | Existing bank's standard |
| `prep-say` | **The words you actually say** | 55–70 words, ≤18 words per sentence, no clause you would stumble over out loud |
| `prep-numbers` | A figure to attach | Every senior answer needs one real number |
| `prep-wrong` | The common answer that fails | Quoted, then corrected in one line |
| `prep-follow` | The next question | Links to the card that answers it |

**The `prep-say` slot is the product.** Everything else supports it. It obeys
the same language rules as the rewrite: no metaphors, no analogies, correct
technical nouns kept, short sentences.

---

## 5 · Topic map

18 pages, mirroring the study plan so every checkpoint has a home.

| # | Topic | Cards | Seeded from |
| --- | --- | --- | --- |
| 01 | Python for AI roles | 30 | `python-interview/` |
| 02 | ML fundamentals | 30 | `machine-learning/` |
| 03 | Neural networks and training | 25 | `interview-prep/00` |
| 04 | LLM foundations - tokens, context, sampling | 30 | `modules/01`, `interview-prep/01` |
| 05 | Transformers and attention | 25 | `modules/02` |
| 06 | Prompting and structured output | 25 | `interview-prep/01` |
| 07 | Embeddings and vector databases | 30 | `modules/04`, `modules/05` |
| 08 | RAG | 40 | `rag-deep-dive`, `interview-prep/02` |
| 09 | Advanced RAG - rerank, hybrid, CRAG | 25 | `rag-deep-dive` |
| 10 | Agents - loop, tools, termination | 35 | `modules/08`, `teach-agents/` |
| 11 | LangChain and LangGraph | 30 | `modules/10`, `modules/12` |
| 12 | MCP, A2A and the tool boundary | 20 | `modules/09`, `agent-protocols` |
| 13 | Evaluation - offline, online, judges | 30 | `llm-evals`, `interview-prep/04` |
| 14 | LLMOps, tracing and observability | 25 | `llmops`, `langfuse` |
| 15 | Guardrails, security and responsible AI | 30 | `guardrails`, `interview-prep/06` |
| 16 | Cost, latency and scale | 25 | `interview-prep/05` |
| 17 | Cloud and deployment - Azure, AWS, Databricks | 25 | `interview-prep/07` |
| 18 | Project story and behavioural | 25 | `interview-prep/08` |
| | **Total** | **≈505** | |

Roughly 60% re-cut from the existing 690 cards and rewritten to the v2 format;
40% new, mostly in rounds, wrong answers and numbers.

---

## 6 · Employer tracks

Five tracks. Each is a page that reorders the same cards and adds 15–25 of its
own, because the domain changes what gets asked.

| Track | Who it covers | What the questions skew to |
| --- | --- | --- |
| **Healthcare payer / provider** | Optum, UnitedHealth Group, Philips, Siemens Healthineers, Novartis | PHI and de-identification, HIPAA, Azure OpenAI in a regulated tenant, audit trails, clinical-document RAG, why a human stays in the loop |
| **Banking and financial services** | JPMorgan, Goldman, Amex, Wells Fargo, Deutsche | Auditability, citation and traceability, model risk governance, data residency, deterministic fallbacks, text-to-SQL on sensitive schemas |
| **Retail and supply chain** | Walmart Global Tech, Target, Lowe's, Tesco, Maersk | Cost per request at very high volume, catalogue and product RAG, latency budgets, multilingual, caching |
| **Product and platform** | Microsoft IDC, Google, Salesforce, ServiceNow, Adobe, Intuit | Depth on one system, evaluation rigour, trade-off defence, coding round alongside |
| **Services and consulting** | TCS, Infosys, Wipro, Cognizant, Accenture, Deloitte, Capgemini | Breadth over depth, client framing, delivery estimates, accelerators and reuse, multi-cloud |

Each track page carries: the round structure, what the panel is usually drawn
from, the 10 questions most likely in that context, and one worked 40-minute
scenario using `scenario-practice/`'s framework.

**Grounding is labelled per track**, per §1 - public JD, domain inference, or
published process.

---

## 7 · Round map

The axis nothing in the portal currently has.

| Round | Typical | What it tests | Answer shape |
| --- | --- | --- | --- |
| **Screening** | 20–30 min, recruiter or junior engineer | Are the CV claims real | 30 seconds, no jargon, one number |
| **Technical 1** | 45–60 min | Fundamentals and whether you built it yourself | 2 minutes, mechanism first, then a trade-off |
| **Technical 2 / design** | 60 min | Can you architect and defend it | Whiteboard, requirements before technology names |
| **Hiring manager** | 45 min | Ownership, incidents, judgement | A story with a decision and a consequence |
| **HR / fitment** | 30 min | Stability, expectations, notice period | Short, consistent, no negotiation detail |

Every card is tagged with the round it belongs to, and the topic pages can be
filtered to one round - which is how you prepare for the interview you have on
Thursday rather than all five at once.

---

## 8 · Registration and tooling

**Directory:** `interview-room/`, one level deep, so `../assets/…` resolves
exactly as it does in `modules/`.

**Manifest.** `disk-to-registry` is a hard failure for any HTML with no entry,
so every page is registered in `assets/curriculum.js` as a new collection:

```js
"interview-room": {
  "label": "Interview Room",
  "index": "ir-index",
  "members": ["ir-01", "ir-02", …, "ir-t05"]
}
```

Pages get `type: "content"`, `contentRole: "practice"`, and are **in no route** - 
the same pattern `dsa` already uses, so `check_route_shape` and the hour metrics
are untouched and the published totals do not move.

**New validator check `interview-room-cards`:** every card has `prep-why`,
`prep-say`, `prep-wrong` and `prep-follow`; `data-round`, `data-level` and
`data-track` are from the allowed vocabulary; `prep-say` is 55–70 words; every
`prep-follow` that names a card id resolves.

**`tools/seed-interview-room.py`:** reads the 690 existing cards plus
`docs/carryover/`, dedupes by normalised question text, and emits a per-topic
worklist marking which are re-cuts and which are new. Stops the same question
being written three times.

**Reused runtime:** `assets/interview-prep.js` already does search, tag filter
and expand-all. It needs one addition - filtering by the three new data
attributes.

---

## 9 · Phases

### Phase 0: Foundations *(no cards)*
- `interview-room/index.html` with the three entry points.
- Extend `.prep-question` CSS with the four new slots.
- Extend `assets/interview-prep.js` with round / level / track filters.
- `tools/seed-interview-room.py` and its first dedupe report.
- Manifest collection + `interview-room-cards` check.
- **Gate:** one finished sample page for you to read before 500 cards exist.

### Phase 1: Pilot *(1 topic page)*
Topic 08, **RAG**, at 40 cards. Chosen because it is the single most-asked
subject and it exercises every slot: silent failures for `prep-wrong`, latency
and chunk counts for `prep-numbers`, and a different answer in every round.

### Phase 2: Core GenAI *(topics 04–12, ≈260 cards)*
LLM foundations, transformers, prompting, embeddings, RAG advanced, agents,
LangChain/LangGraph, MCP.

### Phase 3: Production and platform *(topics 13–17, ≈135 cards)*
Evaluation, LLMOps, guardrails, cost, cloud.

### Phase 4: Foundations and story *(topics 01–03, 18, ≈110 cards)*
Python, ML, neural networks, behavioural.

### Phase 5: Employer tracks *(5 pages)*
Written last, because a track page reorders cards that must already exist.

### Phase 6: Rehearsal loop
Timer, self-score, "delivered without notes" state in `localStorage`, mirroring
`progress.html`. Plus the contribution slot: a page where you record real
questions from your own interviews, dated and attributed, which over time turns
this from an inferred bank into a real one.

---

## 10 · Definition of done

A card is finished when:

1. All six slots are filled.
2. `prep-say` is 55–70 words and you can read it aloud in one breath per
   sentence.
3. It carries a real number, or says explicitly that no number applies.
4. `prep-wrong` quotes an answer a real candidate would give - not a strawman.
5. Round, level and track tags are set.
6. The follow-up resolves to another card.
7. No metaphor, no analogy, no undefined jargon - same rules as the rewrite.
8. It is not a duplicate of an existing card in another bank, or it is a
   deliberate re-cut and says so.

A **page** is finished when it also carries: the round structure, a "if you have
one evening" ten-card shortlist, and a link back to the study-plan page that
teaches the material.

---

## 11 · Risks

| Risk | Mitigation |
| --- | --- |
| **Fabricated company specificity** | §1 grounding label on every set; no "asked at X" without your own attribution |
| A fourth duplicate bank | `seed-interview-room.py` dedupes against all 690 existing cards before writing |
| Answers that read well but cannot be said | 55–70 word ceiling on `prep-say`, and the rehearsal loop exists to catch the rest |
| Card count becomes the goal | Phase gates are per topic, not per card; 505 is a ceiling, not a target |
| Drifts from the main portal's design | Zero new components - the card is the existing one plus four divs |
| Competes with the rewrite for attention | It is a separate collection in no route. The two never block each other |
| Hour totals move | In no route, so the metrics never see it |

**Out of scope:** DSA (already a track), non-AI backend rounds beyond topic 01,
salary negotiation, and visa or relocation guidance.

---

## 12 · Relationship to the rewrite

They are independent and share one rule: the language standard in
`claude_plan.md` §1 applies here too.

The rewrite's section 15 keeps the interview questions **on the teaching page**,
where they test that page. This portal cuts the same material by round and by
employer, for the week before an interview. A learner uses the study plan for
months and this portal for ten days.

**Current status of the rewrite:** Phase 0 and Phase 1 complete, wave 1 at 3 of
5 pages. Resuming there next.
