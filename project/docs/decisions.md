# Design decisions

Every decision in this project, with the reasoning and the trade-off. This is
the document to re-read before an interview: each entry is a question you may be
asked, and the "why not" column is usually what separates a good answer from a
recited one.

---

## 1 · The loop never imports a vendor SDK

**Decision.** `brain.py` defines one interface, `decide()`. Adapters translate.

**Why.** Weld the loop to a vendor and you cannot test without a network call,
cannot swap models, and cannot reproduce a bug.

**Trade-off.** A lowest-common-denominator interface can hide provider-specific
features (prompt caching, extended thinking). Mitigated by keeping the interface
thin and letting adapters carry their own extras.

**Not chosen.** LangChain's model abstraction — more capable, and it would have
hidden the mechanics this course exists to show.

---

## 2 · The deterministic backend is a rule engine, not a mock

**Decision.** `StubBrain` reads the conversation and decides from *state*, never
from turn number.

**Why.** A mock returning a fixed sequence cannot exercise the interesting part
of a loop: what happens when a result arrives that you did not expect. Remove a
tool and the trajectory changes; edit a fixture and it changes.

**Trade-off.** It teaches nothing about language understanding, variability,
malformed output, refusals or latency. Stated in the README and in Lesson 3,
which requires a real-model run.

---

## 3 · Tool errors are fed back, not raised

**Decision.** A failed tool returns `{"error": ...}` into the conversation.

**Why.** A missing ticket is information the agent can act on. An exception ends
the run.

**Trade-off.** The agent can loop on a persistently failing tool — which is
exactly the bug found in Lesson 2 and fixed by tracking *attempted* separately
from *successful* (Lesson 6's `RunState`).

---

## 4 · Validation is hand-written, not `jsonschema`

**Decision.** ~60 lines in `schemas.py`.

**Why.** Being able to explain exactly what your validation checks is worth more
than importing something you cannot describe. It also let us make two decisions a
library would have made for us: reject `bool` where a number is expected, and
collect *all* faults before raising.

**Trade-off.** Supports a subset of JSON Schema. Fine for six tools; replace it
at thirty.

---

## 5 · Capability absence is the security boundary

**Decision.** No tool executes code, spawns a shell, reads arbitrary paths or
opens a socket. The keyword screen is defence in depth only.

**Why.** There is no parameterised query for natural language — no way to
separate instruction from data. Any text-layer defence is heuristic. What *is*
solvable is the consequence.

**Evidence.** `test_attacks_still_fail_with_the_keyword_screen_disabled`. If the
screen were load-bearing, disabling it would break everything.

---

## 6 · Business policy lives in code, not the prompt

**Decision.** `policy.py` decides refunds. The knowledge base only *describes*
the policy so the agent can quote it.

**Why.** A prompt policy is a suggestion a persuasive ticket can argue with.

**Demonstrated.** Lesson 9's exercise moves policy into the prompt, re-runs the
poisoned knowledge base, and the attack works.

---

## 7 · Idempotency keys are derived, never random

**Decision.** `sha256(order|amount|reason)`.

**Why.** A UUID per attempt gives every retry a fresh key — implementing the
mechanism and disabling it in the same line.

**Trade-off.** Two legitimately identical refunds for different purposes need
different `reason` text. Accepted: the alternative is a double payment.

**Remaining exposure.** The ledger is not transactional with the payment. A
crash between them re-opens the hole. Named in Lesson 8.

---

## 8 · `dry_run=True` is the default

**Decision.** Moving money requires an explicit flag *and* a token.

**Why.** The unsafe path will eventually be reached by an argument nobody
validated, so it must be the one requiring effort.

**Evidence.** Flipping this default passed 12/12 of the eval suite until a case
was added to pin it. See §12.

---

## 9 · The agent cannot mint its own approval

**Decision.** `grant_approval()` is not in the tool registry.

**Why.** A gate the caller can open itself is not a gate. This is the most common
way the control is implemented wrongly.

---

## 10 · The audit log is append-only and records refusals

**Decision.** Every attempt is written, including denials.

**Why.** The question an audit answers is "what happened, in what order, and who
decided". An overwritten status column cannot answer it, and a log of only
successes cannot tell you an agent tried forty times.

**Trade-off.** Append-only by convention, not enforcement — a file anyone can
edit is not an audit trail.

---

## 11 · Retrieval can return nothing

**Decision.** A relevance floor; below it, zero results.

**Why.** Without it, retrieval returns its top-k however bad they are, and the
agent grounds a confident answer in the least-bad paragraph. Most RAG
hallucination is faithful summary of context that should never have been
retrieved.

**Trade-off.** The threshold is a precision/recall dial with no setting right for
every query. Choosing it properly needs the eval set.

---

## 12 · Happy paths are a minority of the eval suite

**Decision.** 4 of 13 cases; the rest are refusals, failures and attacks.

**Why.** A suite of happy paths measures whether the demo still works. Refusals
regress *silently*.

**How we know it works.** Two deliberate regressions. The first — removing the
`dry_run` default — was **not caught**, which exposed a real coverage hole in a
file with complete line coverage. A case was added; it is caught now.

---

## 13 · Tracing is opt-in

**Decision.** Pass a `Trace` and the loop produces a span tree; omit it and the
loop stays readable.

**Why.** Lessons 2–9 are about the loop. Instrumentation everywhere would obscure
the thing being taught.

**Trade-off.** Production would always trace. Sampling belongs at the backend.

---

## 14 · `issue_refund` is withheld from the MCP server

**Decision.** The server exposes three read-only tools.

**Why.** A tool exposed over MCP is callable by any connected host, and the
approval gate lives in our process. The protocol offers no way to require a
client to honour it.

**Asymmetry.** Exposing it saves a little integration work; the downside is an
unapproved payment.

**Implementation.** An allowlist, not a deny-list — deny-lists fail open. And the
error for a withheld tool is identical to the error for a nonexistent one, so it
cannot become a discovery oracle.

---

## 15 · Multi-agent is measured, and it loses

**Decision.** Build the supervisor, measure it, report the result honestly.

**Result.** +1.0 model calls and +51 tokens per ticket, identical outcomes.

**Why keep it.** Because the negative result is the lesson. It would pay when
specialists need genuinely different tool sets or permissions, or ship
independently. None of that is true of four routes over six tools.

**Honesty note.** The comparison counts the supervisor's own model call. Omitting
it would have made the split look free.

---

## 16 · Delegation moves work, never authority

**Decision.** The A2A refund specialist calls the tool in dry-run mode, holds no
token, and publishes `willNot` in its Agent Card.

**Why.** An agent that could grant itself permission by asking another agent has
no permissions at all.

**Ordering.** Capability first, authorisation second, contract last. If you rely
on the card, the security model is backwards.

---

## 17 · Resume restores state; it does not replay

**Decision.** A resumed run reloads established facts and continues.

**Why.** Replaying would re-execute anything with a side effect — the
double-payment problem again.

**Corollary.** A run that cannot be restored safely escalates rather than
restarting.

---

## 18 · Resuming across a version change is refused

**Decision.** `can_resume()` compares `prompt_version` and `toolset_version`.

**Why.** A run started under one prompt and finished under another has behaviour
no trace will explain. Refusing is cheap; a mystified engineer six weeks later is
not.

**Trade-off.** A prompt edit abandons in-flight runs. Correct: they go to a human
with their facts intact.

---

## 19 · Unsafe generated-code execution is explained, not built

**Decision.** No sandboxed code-execution demo.

**Why.** Maintaining a second, unsafe implementation to demonstrate a risk is a
poor trade. The architecture note and the tests make the point.

---

## Open exposures, stated deliberately

1. **Ledger and payment are not one transaction.** Crash between them → double
   payment on retry.
2. **Approval tokens are in-memory and never expire.** A leaked token is a
   standing credential.
3. **No reconciliation** against a payment provider, so drift is invisible.
4. **No aggregate caps** — nothing stops a hundred individually valid refunds.
5. **The audit log is append-only by convention.**
6. **A timeout still leaks a thread**, because a wait limit is not cancellation.
7. **The A2A demo is in-process** — no HTTP, no auth exchange, no streaming.
8. **`RunStore` is a directory of files**, not a database sharing a transaction
   boundary with side effects.

Being able to enumerate your own gaps is a stronger signal than a clean-sounding
design. Every real system has them; the question is whether you know where.
