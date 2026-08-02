# Behavioural framing

How to talk about this project, and about your background, without overstating
either.

---

## The honest position

You are an experienced IT and ML engineer who has recently built a substantial,
production-shaped agent system. That is the truth, and it is a strong position.

What you should **not** do is imply the agent shipped to customers, that you have
years of GenAI production experience, or that the fixtures were real traffic. It
is unnecessary — a well-built project you can defend in depth beats a vague claim
of production experience, and it survives follow-up questions, which the vague
claim does not.

**The sentence that does the work:**

> "I've got nine years in software and four to five in ML. GenAI is newer for me,
> so rather than read about agents I built one properly — a support-triage agent
> with an approval gate on refunds, an eval suite, tracing and an adversarial
> test corpus. Most of what made it work turned out to be ordinary engineering:
> idempotency, retry budgets, least privilege, audit trails."

That last clause is the important one. It reframes your background from a gap
into the reason you're credible.

---

## Mapping your existing experience

Interviewers are trying to work out whether you'll be useful in six weeks. Every
row here is evidence that you will.

| They ask about | You already know it as |
| --- | --- |
| Idempotency on an agent action | payment APIs, at-least-once delivery |
| Retry budgets and backoff | HTTP client resilience, circuit breakers |
| Step limits | queue redelivery limits, watchdogs |
| Tool allowlists | IAM least privilege |
| Argument-level authorisation | multi-tenant row-level security |
| Trajectory evaluation | integration tests asserting a call sequence |
| Tracing with correlation ids | distributed tracing, APM |
| Prompt versioning and rollout | schema migrations, feature flags |
| Context budgeting | memory budgets, response size limits |
| Retrieval tuning | search relevance work |
| The confused deputy | you have shipped this bug before |

Say the mapping out loud when it's relevant: *"I treated the model as an
unreliable remote dependency, which is a problem shape I've handled a lot."*

And name the two things that are genuinely different, so you don't sound like
you're flattening the domain:

1. **The caller is probabilistic.** It may sincerely believe it has not already
   asked. That is why idempotency matters more here than in a normal API client.
2. **There is no parameterised query for natural language.** You cannot separate
   instruction from data, which is why injection defence has to be architectural
   rather than sanitisation.

---

## The five-minute project walkthrough

Structure it as a problem, a spine, and three hard parts.

**Problem (20s).** Support tickets arrive; most need the same few lookups and a
policy-grounded reply. Some need a refund, which is irreversible.

**Spine (40s).** One agent, built up from a forty-line explicit loop with no
framework. Six tools: read a ticket, look up an order, search the knowledge base,
draft a reply, escalate, issue a refund.

**Hard part 1 — the refund (90s).** The centrepiece. Dry-run by default; policy
in code rather than the prompt; a derived idempotency key so a retry can't pay
twice; an approval token bound to an exact order and amount that the agent cannot
mint; an append-only audit log including refusals. Mention the timeout case: if
the payment call times out you don't know whether it happened, and the
idempotency key is what makes the follow-up safe.

**Hard part 2 — knowing it works (60s).** A golden set where happy paths are a
minority, because refusals regress silently. Outcome *and* trajectory checks. And
the thing worth leading with: *"I tested the suite by breaking the agent on
purpose, and one of my regressions wasn't caught — deleting a safety default
passed twelve out of twelve. That's how I found the coverage hole."*

**Hard part 3 — security (60s).** The boundary is that no dangerous capability
exists, not that a filter blocks things. There's a test that disables the keyword
screen and shows the money attacks still fail.

**Close (30s).** What you'd do differently: make the ledger transactional with
the payment, add reconciliation, put aggregate caps on refund volume.

---

## The two-minute version

Cut hard parts 2 and 3 to one sentence each, keep the refund, keep the close.
The close matters more than it looks: volunteering your own gaps is the fastest
credibility signal available.

---

## Questions about failure, answered well

**"What went wrong?"** Four real ones, and they're better material than any
success:

- *Infinite retry.* Failed tool results were filtered out of observed state, so
  "I have no ticket" stayed true however many times reading it failed. Fix:
  track *attempted* separately from *successful*.
- *Partial data reached a customer-facing summary.* `refund_eligible=None`
  formatted into prose, reported as a successful run. Needed two layers: the
  controller detects, the policy refuses.
- *A self-congratulating critique.* The reflection pass scanned the whole
  history, so the system prompt's own words satisfied its checks and it always
  came back clean.
- *An eval hole in fully-covered code.* Above.

**"What would you do differently?"** Measure the multi-agent split before
building it, not after — I built the supervisor and then found it cost more for
identical outcomes. And I'd have written the eval suite earlier; several bugs
would have been caught by it rather than by me.

**"What are you weakest on?"** Answer honestly and bound it: production
operation at scale — I've built the mechanisms but not run them under real
traffic for a year. Then say what you'd want in the first month: real traces,
the escalation rate, and a golden set built from actual tickets.

---

## Two things not to say

**"I used LangChain / CrewAI."** If you didn't, don't. And if asked why not:
*"I wanted to understand the loop before adopting something that names it. For a
production system I'd want durable state and resumability, which is where a
framework earns its place."* That's a better answer than either enthusiasm or
dismissal.

**"It works really well."** Nobody believes it, and it invites the question you
don't want. Say what it does, what it refuses, and where it's exposed.
