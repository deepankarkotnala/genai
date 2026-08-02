# Interview drills

Four timed exercises. Do them under time pressure — the constraint is the point.

---

## Drill 1 · The coding round (15 minutes, no notes)

**Task.** Implement a tool-calling agent loop from scratch. No framework.

Ship in this order:

1. A message list with roles.
2. A **bounded** `for` loop — not `while True`.
3. Call the model; branch on tool-call vs final answer.
4. Dispatch through a **dictionary**, never `getattr` or `eval` on model output.
5. Catch tool errors and feed them back as observations.
6. Append both the decision and the result to the messages.
7. Return an object carrying **why** it stopped, not just a string.

**Say these out loud while typing** — the commentary is half the score:

- "The step limit is the actual bound; if termination depends on the model
  choosing to stop, it isn't bounded."
- "Dictionary dispatch means a hallucinated tool name is a clean error."
- "The tool error goes back to the model, not up the stack — a missing record is
  information it can act on."
- "I return why it stopped, so the caller can tell a finished run from a
  truncated one."

**Failing patterns:** `while True`; `eval` dispatch; letting a tool exception
escape; returning only a string.

**Self-check:** run it against a ticket that doesn't exist. Does it terminate
cleanly and say so?

---

## Drill 2 · The whiteboard (2 minutes, spoken)

**Prompt.** "Design an agent that handles customer support tickets."

Do not start drawing boxes. Structure it:

**Scope (15s).** "What's the volume, and what can it do without a human? Those
two answers change the design more than anything else."

**Shape (30s).** "Most volume is a workflow — password resets, delivery status —
so I'd route first with one cheap classification call and only send ambiguous or
multi-step tickets to an agent. At ten thousand a day, if the agent handles 15%
that's 1,500 runs, which is a budget I can state."

**The loop (30s).** "Read the ticket, look up the order if it references one,
search the knowledge base for the policy, draft a reply. Step budget of six,
because measured runs finish in three or four."

**The hard part (30s).** "Refunds are irreversible, so: policy in code, dry-run
default, a derived idempotency key, an approval token bound to the exact amount
that the agent cannot mint, append-only audit."

**Proof (15s).** "A golden set that's mostly refusals and attacks, trajectory
checks as well as outcome, and traces with cost per run."

Then stop and ask what they want to go deeper on. Filling two minutes with
architecture is worse than leaving room for their actual question.

---

## Drill 3 · System design (20 minutes)

Pick one and talk for twenty minutes. Cover: scope, shape, tools and
permissions, failure handling, irreversible actions, security, evaluation,
observability, cost — and what you would *not* build.

1. Support triage at 10,000 tickets/day, three teams, four permission tiers.
2. An agent with email, calendar and CRM access for 10,000 employees.
3. Internal tools exposed to several AI applications across the company.
4. A refund agent for a marketplace where sellers, not you, hold the funds.
5. Retrieval over 50,000 documents in three languages with four permission tiers.

**Scoring yourself.** Did you push back on any part of the premise? Did you name
a cost or latency number? Did you say what you'd leave out? Did you volunteer a
failure mode before being asked? Four yeses is a strong answer.

---

## Drill 4 · Production incident (10 minutes, verbal)

You are on call. Work through each aloud: *what do I look at first, what are the
candidate causes, what's the immediate mitigation, what's the systemic fix.*

1. **"The agent has been looping for forty steps and timing out."**
2. **"A customer was refunded twice."**
3. **"Cost per ticket tripled overnight and no code shipped."**
4. **"The agent cited a policy document that says the opposite."**
5. **"Escalation rate went from 12% to 40% this morning."**
6. **"A ticket contained instructions and the agent followed them."**
7. **"p99 latency is 40s; mean is 3s."**
8. **"Eval scores went up but complaints went up too."**

For every one of these, the first question is the same: **do I have a trace?**
If the honest answer is no, that's the finding — and saying so is a better
response than speculating.

---

## What good looks like

Across all four drills, the differences that matter:

- You name **numbers**, not adjectives. "+1 model call, +51 tokens" beats
  "slightly more expensive."
- You volunteer **trade-offs and gaps** before being asked.
- You say **what you would not build** — over-engineering is a real answer to a
  real question.
- You reach for **capability restriction** before prompt wording on anything
  security-shaped.
- When you don't know, you say what you'd **measure** to find out.
