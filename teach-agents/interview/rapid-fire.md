# Rapid-fire: 45 questions

Answer out loud in under 30 seconds each. If you hesitate, that topic needs
another pass. Answers are deliberately terse — the drill is recall, not essays.

---

## Foundations (L1–L3)

**1 · What is an LLM, in one sentence?**
A stateless function from text to text that scores which text plausibly
continues what you sent.

**2 · Why can't it remember your last message?**
It can't. Anything it appears to remember was re-sent in the prompt.

**3 · What are the four message roles?**
system, user, assistant, tool. They organise a conversation; they enforce
nothing.

**4 · Does `temperature=0` give you determinism?**
No — closest available. Batching, GPU scheduling and silent model updates all
break exact reproducibility. So never assert exact matches on a live model.

**5 · What does "the model called a tool" actually mean?**
It didn't call anything. It emitted a structured request naming a tool; your code
decided whether to honour it.

**6 · Where is the enforcement point for tool use?**
The dispatch function, not the prompt.

**7 · Schema-valid — does that mean correct?**
No. `{"ticket_id": "TCK-9999"}` is schema-valid and names nothing. Schema
validation and semantic validation are different layers.

**8 · Why is a tool description part of your prompt?**
The model never sees your code — only name, description and schema. Wrong tool
chosen? Fix the description first.

**9 · Why reject `True` where an integer is expected?**
`bool` subclasses `int` in Python, so `{"limit": true}` silently becomes
`limit=1`. Silent coercion hides bugs.

**10 · Why is dispatch a dictionary lookup?**
So a hallucinated tool name is a clean error, not an incident. No `eval`, no
`getattr` on model output.

**11 · Trusted or untrusted: a ticket body returned by your own tool?**
Untrusted. Tool output *shape* is trusted because your code made it; the
*content* is only as trusted as its source.

---

## Loop and patterns (L2, L4)

**12 · Prompt, chain, workflow, agent — what distinguishes them?**
Who decides the next step: nobody, you at build time, you with branches, the
model at run time.

**13 · When would you not build an agent?**
When you can draw the flowchart. Also: audit requires an identical path, latency
is tight, or a wrong action is expensive with no approval gate.

**14 · What actually bounds the loop?**
The step limit. If termination depends on the model choosing to stop, it isn't
bounded.

**15 · ReAct in one sentence.**
Interleave reasoning and acting: one action, observe the result, decide again.

**16 · When is plan-and-execute better?**
Steps knowable up front; two model calls regardless of plan length; you can show
the plan to a human before anything runs.

**17 · Its weakness?**
The plan is made in ignorance. Ours called `lookup_order(ORD-0000)` on a ticket
with no order.

**18 · How many reflection passes?**
Exactly one. Critique-revise loops don't converge; they oscillate or drift while
the bill grows.

**19 · What can reflection not catch?**
An error the model can't see. It shares its own blind spots — good at omissions,
bad at wrong beliefs.

**20 · What does routing buy?**
One cheap call for a smaller tool set: better selection accuracy and less
context. Most production systems use it; most candidates don't mention it.

---

## Retrieval and memory (L5–L6)

**21 · Retrieval as a tool, or stuffed into context?**
Tool when the query depends on what you find; pre-load when it's knowable up
front.

**22 · Why chunk on headings rather than fixed windows?**
Half a policy reads as complete while omitting the condition that matters.

**23 · BM25 in one sentence.**
Rare terms count more, repetition saturates, length is normalised.

**24 · Why rerank only the top handful?**
Stage one is fast and mediocre over everything; stage two is sharp and slow over
a shortlist. Reranking everything costs what stage one exists to avoid.

**25 · Why should retrieval be able to return nothing?**
So the agent can escalate instead of grounding on the least-bad paragraph. Most
RAG hallucination is faithful summary of context that shouldn't have been
retrieved.

**26 · State or memory?**
If it would be wrong to still have it tomorrow, it's state.

**27 · Memory vs RAG?**
Same machinery, different purpose. Retrieval searches documents; memory searches
history. The interesting question is what you *write*.

**28 · Your agent hits the context limit. First question?**
Is it one huge result or many small ones? Cap at the source vs compact — opposite
fixes.

**29 · What must compaction always keep?**
System prompt and the goal. Drop the goal and the agent is answering a question
it can no longer see.

---

## Reliability and safety (L7–L9)

**30 · What does a timeout do?**
Stops you waiting. Not the work. For a side effect, that means "unknown".

**31 · What do you never retry?**
A timeout (the slow thing is still slow) and a malformed argument (it can't
succeed on attempt two).

**32 · Repeat vs oscillation?**
Same call again vs A,B,A,B. Different detectors — a check against the previous
call alone misses the cycle.

**33 · Why must escalation never fail?**
It's the fallback for every other failure. A fallible fallback isn't one.

**34 · Most dangerous failure mode?**
Partial success. Nothing raises, the shape is right, a field is missing — and a
missing field becomes prose that reads as fact.

**35 · How do you let an agent spend money?**
Dry-run default, policy in code, derived idempotency key, approval token bound to
order and amount, append-only audit, caps.

**36 · Why is a derived key, not a UUID?**
A fresh key per attempt makes every retry look new — you'd implement the
mechanism and disable it in the same line.

**37 · Duplicate detected — error or success?**
Success with `duplicate: true`. The caller asked for a state and that state
holds. Errors invite workarounds.

**38 · Why check policy before asking a human?**
An approval request for an impossible action trains reviewers to click through.
Approval fatigue is a security failure.

**39 · Your primary defence against prompt injection?**
That no dangerous capability exists. Not filtering — absence.

**40 · Direct vs indirect injection?**
Ticket body vs a document your own retriever fetched. Indirect is harder because
it arrives through your trusted tool.

**41 · Why must authorisation ignore model output?**
Otherwise an injection claims to be an admin. Confused deputy.

**42 · Is prompt injection solvable?**
Not in general — no parameterised query for natural language. The *consequence*
is solvable.

---

## Evaluation, cost, protocols (L10–L13)

**43 · Outcome vs trajectory eval?**
Is the answer right vs was the path acceptable. A perfect answer reached by
reading another customer's data passes outcome eval.

**44 · Why is agent cost quadratic in steps?**
Every step re-sends the transcript. Fewer steps beats cheaper tokens.

**45 · When does multi-agent hurt?**
Almost always unless you can name what it buys. Measured here: +1 model call,
+51 tokens, identical outcomes.
