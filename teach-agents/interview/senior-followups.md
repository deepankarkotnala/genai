# Senior follow-ups

The second question, after you have answered the first one well. These separate
"has built an agent" from "has operated one".

Each answer below is a *shape*, not a script. Say it in your own words.

---

### "Where is your remaining exposure?"

Name your own gaps before being asked — it is the fastest credibility signal
available, and every real system has them.

For this project: the ledger is not transactional with the payment, so a crash
between them allows a double payment on retry; approval tokens are in-memory and
never expire, so a leaked one is a standing credential; there is no
reconciliation against a payment provider, so drift is invisible until a customer
complains; there are no aggregate caps, so nothing stops a hundred individually
valid refunds; and the audit log is append-only by convention rather than
enforcement.

---

### "How do you ship a prompt change safely?"

Treat it as a behavioural change, because it is one — and note that **editing a
tool description is also a prompt change**, even when the schema is identical,
because it alters selection.

Run the golden set and diff outcome *and* trajectory: same answers via a
different tool sequence can still be a cost regression. Compare tokens, latency
and cost per run. Shadow it on real traffic without serving the output. Roll out
behind a flag by percentage. Version the prompt so a run can be attributed to a
configuration, and refuse to resume a run across a version boundary — otherwise
its behaviour changed halfway and no trace will explain it.

---

### "Your provider deprecates the model you pinned, in 30 days."

A dependency upgrade with a behavioural contract. Golden set against the new
model, diff outcome and trajectory, compare cost and latency, shadow on real
traffic, roll out by percentage with the old model still reachable.

Expect prompt adjustments — prompts are tuned to a model, so "same prompt, new
model" is not a null change. And say the honest part: without a golden set you
cannot do any of this, you can only hope.

---

### "How would you decide whether reflection is worth its cost?"

Make it an A/B on the golden set, not a judgement call. Run with and without,
score both on outcome metrics, compare against the cost and latency delta.

Reflection helps most where the failure is "incomplete" and least where it is
"confidently wrong", because a model cannot critique what it cannot see. If it
wins on only some ticket types, apply it selectively — reflect on refund
recommendations, skip it on password resets. Selective application is usually
where the win is.

---

### "Would you ever let the agent refund without a human?"

Yes, under stated conditions: a low amount cap, a category with an unambiguous
policy (a confirmed duplicate charge is arithmetic, not judgement), full audit,
aggregate daily limits, an anomaly alert, and a measured false-positive rate from
evaluation before it ships.

Then reframe: the question is not "human or not", it is "cost of being wrong ×
frequency, versus cost of the review". Approving thousands of £5 duplicate
refunds by hand has its own failure mode — reviewers stop reading, and the gate
becomes decorative while remaining expensive.

What I would not automate: anything requiring judgement about intent, anything
above a threshold where one error is material, anything where the policy has
ambiguity a model would have to resolve.

---

### "Is prompt injection solvable?"

Not in the general case, and I would say so plainly. There is no parameterised
query for natural language — no mechanism separating instruction from data the
way prepared statements separate code from values. Any text-layer defence is
heuristic, so novel phrasing gets through.

What *is* solvable is the consequence. If a successful injection can only cause
things you would let a hostile user do, you have contained it. That reframes the
goal from "prevent the model being fooled" to "ensure being fooled doesn't
matter" — capability restriction, approval gates, argument-level authorisation,
bounded blast radius.

Which is why "we added an injection classifier" isn't an answer on its own: it
reduces frequency without changing what happens when it fails.

---

### "How big should a golden set be?"

Big enough that a real regression fails a case, small enough to run on every
commit. A few hundred, and composition matters far more than size — thirteen
well-chosen cases caught two real regressions here; a thousand happy paths would
have caught neither.

Grow it by failure, not by volume: every incident and complaint becomes a case.
And measure the suite itself — periodically inject known regressions and count
how many it catches. That number told me my own suite had a hole in a file with
complete line coverage.

---

### "A cost regression shipped and no test caught it."

Expected — correctness tests don't measure cost. Make cost a first-class
assertion: record tokens and cost per golden case and fail the build when one
exceeds its budget. That is how a timestamp added to a system prompt — which
breaks prefix caching without changing a single answer — becomes visible.

Then a cost dashboard per prompt version so a regression is attributable, and a
nightly canary against production configuration, since cost can regress from a
provider-side change you did not make.

General principle: **anything you care about and do not assert will regress.**

---

### "Should the agent write its own memories?"

Rarely, and never without a correction path. The failure mode is a durable false
belief that shapes every future interaction and that nobody knows to look for. In
support, a wrong memory about a customer is worse than none — it produces
confidently wrong personalisation.

If it must: constrain writes to a fixed schema rather than freeform text, require
confirmation for anything consequential, timestamp and source every entry, expire
by default, make deletion trivial, and treat recall precision as an eval metric
rather than an assumption.

---

### "Your team wants to adopt a multi-agent framework. What do you ask?"

What measurement made multi-agent the answer. If there isn't one, that's the
first thing to produce — I have a baseline showing the split costing +1 model
call and +51 tokens for identical outcomes.

Then: how are tool sets and permissions separated per agent; does the handoff
carry a brief or a transcript; what bounds the handoff depth; how is a
misbehaving run attributed to an agent; what happens when a specialist escalates.

On the framework specifically: what does it do that twenty lines of routing plus
a filtered tool list does not? I'd want it earning its place on durable state,
resumability or a graph I actually need — not on giving names to control flow.

---

### "What would you alert on?"

Ratios and budgets, not error counts. Escalation rate rising is the earliest
quality signal and it's free. Human override rate on drafted replies — if
reviewers rewrite 60%, the agent isn't helping. Cost per resolved ticket, which
catches loops and prompt bloat no error surfaces. p99 latency. Retry rate per
tool, which finds a degrading dependency before it fails outright. Refund volume,
because that's the blast radius.

Not: raw error counts, which track traffic; or individual run failures, which are
normal and will train people to ignore the channel.

---

### "What's the hardest part of operating an agent?"

That the failures are quiet. A service that's down pages you. An agent that has
got 8% worse looks identical from the outside — same latency, same 200s, same
shape of output — and you find out from complaints weeks later.

Everything follows from that: a golden set with non-zero exit, override and
escalation rates as first-class metrics, traces you can actually read, and
budgets on cost and latency as well as correctness. **The instrumentation is not
overhead here; it is the only way you find out.**
