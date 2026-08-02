# Understanding AI Agents — curriculum

Interview-focused course on agentic AI. **15 lessons, ~49 hours**, beginner to
intermediate. One project throughout: a **support-ticket triage agent** that
starts as a forty-line explicit loop and becomes a production-shaped system.

Pace: ~1 h per weekday for 6–7 weeks, or about 4 weeks with longer weekend
sessions.

## Principles

- Start with **no framework**. The loop is written out in full.
- **One capability per lesson.** Build it, deliberately break it, debug it.
- Every lesson connects the concept to a **production concern** and ends with
  **interview practice**.
- Link to the portal's existing deep-dive pages rather than restating them.
- No multi-agent work until one agent can be built and debugged reliably.
- The deterministic backend is the default, so **no API key is ever required**.

## Lessons

| # | Lesson | Tool added | h |
| --- | --- | --- | --- |
| 1 | LLM mechanics — messages and roles, context window, determinism, structured output, what tool calling really is. Builds `brain.py` | — | 2.5 |
| 2 | The agent loop — observe/decide/act, prompt vs chain vs workflow vs agent, when *not* to build one, termination, step limits | `search_kb` | 3.0 |
| 3 | Tool calling and validation — schemas, typed arguments, unknown tools, parallel vs sequential, trusted vs untrusted content | `read_ticket`, `lookup_order` | 3.5 |
| 4 | Reasoning and orchestration patterns — ReAct, plan-and-execute, reflection, routing; traces compared on one ticket | `draft_reply` | 3.0 |
| 5 | Retrieval as a tool — chunking, similarity, ranking, grounding, citations, retrieval failure, practical reranking | — | 3.5 |
| 6 | Context, state and memory — budgeting, compaction, summarisation, write rules, state vs memory | — | 2.5 |
| 7 | Reliability and safe termination — loop and repeat detection, timeouts, retry budgets, backoff, partial failure, fallbacks | `escalate` | 3.5 |
| 8 | Irreversible actions and human approval — validation, policy, idempotency keys, approval tokens, audit trail, recommend vs execute | **`issue_refund`** | 4.0 |
| 9 | Security and guardrails — direct and indirect injection, retrieval poisoning, instruction hierarchy, allowlists, argument-level authorisation | — | 3.5 |
| 10 | Agent evaluation — task success, tool selection, groundedness, policy compliance, trajectory evaluation, regression, LLM-as-judge | — | 3.0 |
| 11 | Tracing, latency and cost — structured traces, correlation IDs, token accounting, error classification, prompt caching, model routing | — | 3.0 |
| 12 | MCP and the tool boundary — host/client/server, discovery, local vs remote, MCP vs REST, trust boundaries, MCP security risks | — | 2.5 |
| 13 | Multi-agent and A2A — supervisor and specialist, delegation, context isolation, failure propagation; hands-on two-agent demo | — | 4.0 |
| 14 | Frameworks, deployment and operations — framework comparison, run-state persistence, resume after crash, concurrency, streaming, prompt and tool versioning, SLOs | — | 3.5 |
| 15 | Interview capstone — deliverables pack plus four drills | — | 4.0 |
| | | **Total** | **49.0** |

Every lesson follows the same shape: plain-language concept → build one
capability → break or misuse it → debug and improve → the production concern →
two-minute interview answer → system-design question → debugging question →
coding exercise → senior follow-ups → recap → next lesson → optional deep dives.

## Build waves

| Wave | Contents | Status |
| --- | --- | --- |
| 1 | Lessons 1–3, `brain.py`, tool layer, fixtures, `steps/l02_loop.py`, tests | **done** |
| 2 | Lessons 4–6 — reasoning patterns, retrieval, memory | **done** |
| 3 | Lessons 7–9 — reliability, refund approval path, security | **done** |
| 4 | Lessons 10–13 — evaluation, tracing, MCP, multi-agent and A2A | **done** |
| 5 | Lessons 14–15 — deployment, capstone, interview drills | **done** |
| 6 | Supplementary EDA lab (local Gemma via Ollama) | in progress |

The main course is complete: 15 lessons, 190 passing tests, a 13-case evaluation
suite, an adversarial corpus of 10 attacks, six runnable milestones, and no API
key required anywhere.

## Six runnable milestones

Thin entry points over one shared implementation in `project/agent/`, so a
learner can restart at any milestone without having built the previous one:
`l02_loop.py`, `l05_retrieval.py`, `l08_safe_refund.py`, `l10_evaluated.py`,
`l13_protocols.py`, `l15_capstone.py`.

---

# Appendix · Carried over from the retired course

The previous version of this course has been removed. Four pieces of its
teaching content were worth keeping and are recorded here, rewritten for the
support-operations domain. They are **source material for lessons 4 and 13**,
not finished lesson text.

## A1 · Handoff, orchestrator, orchestration

**Handoff** — one agent's output becomes the next agent's input. A triage
agent's classification is handed to a knowledge agent; the knowledge agent's
findings are handed to a resolution agent. Data flows down the chain.

**Orchestrator** — the conductor that runs each agent in order and passes
results along. It holds the *workflow*; the agents hold the *expertise*. The
orchestrator itself does no domain work — it coordinates.

**Orchestration** — the overall pattern of coordinating several specialists so
their combined work produces one outcome.

*Plain-English analogy worth keeping:* an orchestra. Each musician is a
specialist who plays one part; the conductor decides who plays when and keeps
them in sync. No single musician plays the whole symphony.

## A2 · The autonomy spectrum

"Agentic" is not all-or-nothing. The real question is **how much of the
decision-making you hand to the model at run time**:

    fixed code  →  workflow  →  workflow + local autonomy  →  autonomous agent
    (no model)     (model in     (model chooses within        (model chooses
                    fixed steps)   a step)                      everything)

Left: more predictable, cheaper, easier to debug. Right: more flexible.

Lesson 13's supervisor sits at *workflow + local autonomy* — the model decides
inside each agent, but the order of agents is fixed by us.

## A3 · Workflow vs autonomous, compared

| | Workflow | Autonomous agent |
| --- | --- | --- |
| Who decides the steps | you, in advance | the model, at run time |
| Predictability | high — same path every run | lower — path varies |
| Best when | steps are known and stable | steps depend on what is discovered |
| Cost and latency | lower, bounded | higher, variable |
| Debuggability | easy — trace a fixed path | harder — every run differs |
| Failure mode | rigid; cannot handle the unforeseen | can wander or loop |

## A4 · The four-question decision rule

Ask in order. The first "yes" usually decides the shape.

1. **Are the steps the same every time?** → workflow. The sequence is known, so
   encode it.
2. **Does the next step depend on what the last step found?** → you need some
   autonomy, but *localise* it. Let an agent choose within a step rather than
   redesign the flow. (Our triage agent looking up an order id it found inside a
   ticket body is exactly this.)
3. **Is the task genuinely open-ended exploration?** → only then reach for a
   fully autonomous orchestrator.
4. **Where is the risk?** Anything touching money, customer-visible actions or
   irreversible changes wants a workflow with explicit policy and approval
   steps — never free roaming.

Risk always pulls you back toward a guarded workflow, whatever the first three
answers were. This rule belongs in lesson 2 (as the short version) and lesson 13
(as the full version).
