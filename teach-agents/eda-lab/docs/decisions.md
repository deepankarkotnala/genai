# Design decisions — EDA Lab

What was chosen, what was rejected, and what is still exposed. The last section
is the one worth reading twice: a system with no listed weaknesses has an
author who has not looked.

---

## 1 · The model plans; it never computes

**Chosen.** Gemma emits an `AnalysisPlan` — a list of tool calls with arguments.
Deterministic pandas functions execute it.

**Rejected:** having the model generate pandas code and running it.

Code generation is more flexible and it is the wrong trade here. Executing
generated code makes the model's output a capability rather than a request, and
every guard after that point is trying to prove things about arbitrary Python —
a losing position. With a plan, the set of things that can happen is the eleven
functions in `REGISTRY`, and that set is enumerable, testable, and short.

The cost is real: the lab cannot answer questions outside those eleven tools.
That is the trade, stated plainly rather than hidden.

`test_the_model_never_computes_anything` pins the invariant: an explain call that
returns pure nonsense cannot change a single figure in `results`, because the
figures were computed before it ran.

## 2 · No `demo_codegen_unsafe/`

The instructive way to teach §1 is to build the dangerous version alongside it.
This lab does not.

A working demonstration of sandbox escape in a learning project outlives the
lesson it teaches. Someone finds the directory in eight months, without the
surrounding context, and it is example code. The design notes here plus
`test_no_execution_capability_exists` make the same point without leaving a
loaded example behind.

What generated-code execution would break, concretely: arbitrary filesystem
read and write, network egress, dataset mutation, secret exfiltration via
`os.environ`, and resource exhaustion — none of which are reachable from a plan
that can only name eleven functions.

## 3 · One loose `arguments` dict, tightened per tool

**Chosen.** `Operation.arguments` is a plain dict in the schema; `guards.TOOL_ARGS`
checks required and permitted arguments per tool.

**Rejected:** eleven per-tool schemas in a discriminated union.

The union is more correct and it measurably hurts plan quality on a 4B model —
it becomes eleven schemas the model has to choose between before it can start.
Moving the check one stage later keeps the decoding problem small. The check is
not weaker, only later, and it runs before any tool executes.

## 4 · Semantic validation is separate from schema validation

The sentence this lab exists to teach: **schema-valid is not semantically
valid.** `{"group_by": "sentiment_score", "aggregation": "mean"}` satisfies every
constraint in `AnalysisPlan` and names a column that does not exist.

JSON Schema cannot express "this string must be a column in a CSV you have not
read yet". So `guards.validate_plan` runs third, after decoding and parsing, and
it is where most real failures are caught.

It collects **every** fault rather than short-circuiting on the first, so one
repair attempt can fix everything at once. And the message names the real
columns — "invalid column" on its own produces a second guess, not a correction.

## 5 · Exactly one repair attempt

**Chosen.** `max_repairs = 1`.

Zero is too strict: a hallucinated column with feedback naming the real ones is
genuinely recoverable, and the fake's `repair_then_ok` mode proves the path
works. Three is a loop that bills for every turn — a model returning unparseable
output will keep returning unparseable output.

`test_malformed_output_does_not_loop` asserts the exact call count, not just the
outcome.

## 6 · Transport failures are terminal, never retried

A connection refusal, a missing model, or a timeout is not made better by trying
again. The error message already contains the fix (`ollama serve`,
`ollama pull gemma3:4b`), so retrying three times just delays showing it.

Semantic failures get a repair; transport failures do not. Different causes,
different treatment.

## 7 · The fake backend requires two explicit opt-ins

`EDA_BRAIN=fake` **and** `EDA_DEV=1`, or the process is under pytest.

A silent fallback to a scripted planner is the worst available default: the lab
appears to work and the learner concludes Gemma produced answers it never saw.
Nothing here switches backend, switches model, downloads a model, installs
Ollama or starts the service automatically. When something is missing it prints
the command and stops.

`test_no_model_is_downloaded_or_installed_automatically` greps the source to
keep that true.

## 8 · Caps refuse rather than truncate

`too_many_groups`, `result_too_large` and the rest return a structured error
naming the limit and the actual size.

Truncation is the dangerous alternative: the model reads 200 rows as the whole
answer and states a conclusion about the other 600 it never saw. A refusal that
says "800 distinct values, limit 50" lets the plan be narrowed. A truncation
says nothing and is indistinguishable from success.

## 9 · Silent narrowing is a bug class, and it bit three times

Three separate bugs in this lab were the same shape — an argument quietly
ignored, everything downstream looking completely normal:

- **The chart.** A plan asked for `y="mean_resolution_minutes"`, a name that
  exists only in the *grouped output*. `create_chart` reads the source frame,
  so it rendered nothing. Validation had passed with a warning. Now a hard
  fault, with the real column names in the message.
- **The correlation.** `correlation_summary` filtered unknown names out of
  `columns` and correlated whatever was left — answering a question nobody
  asked, and looking normal doing it. Now `unusable_columns`.
- **The truncated table.** See §8.

The generalisation, and the one worth saying out loud in an interview: **a
silent failure downstream of a clean validation is the worst outcome
available.** It is worse than a crash, because a crash gets investigated.

## 10 · Ambiguity is a first-class outcome

`clarification_needed` is a field on the plan, and `clarification` is a run
status alongside `answered` and `rejected`.

"Which tickets are bad?" has no answer in this dataset — bad could mean low
CSAT, long resolution, or escalated. A system that asks is better than one that
picks. Making it a *status* rather than an error means it can be measured:
`ambiguity_clarification` is one of the ten eval metrics.

## 11 · The caveat is attached by the tool, not the model

`grouped_summary` returns the missing-value note itself; `correlation_summary`
returns the causation warning itself. Neither depends on the model remembering.

`csat_score` is 21.5% missing and `.mean()` drops those rows silently, so the
honest answer covers 628 of 800 tickets. A 4B model will forget to mention that
some of the time. A `dict` key will not.

## 12 · Charts get derived filenames

`ChartSpec` has no path field. The filename is a slug plus a hash of the plan,
into a fixed `out/`. A model-supplied path is a write-anywhere primitive, and
there is no version of accepting one that is safe enough to be worth the
convenience.

`test_no_tool_accepts_a_path_argument` scans every tool signature.

## 13 · The dataset regenerates byte-identically

Five controls: seeded `default_rng`, fixed category tuples, sort by `ticket_id`,
`float_format="%.2f"`, `lineterminator="\n"`.

Every pinned number in the golden set is a fact about one specific file. Without
byte-stability the suite drifts into grading against numbers that no longer
exist — so `test_pinned_numbers_are_recomputable` derives all of them from the
CSV again and fails loudly if the generator moved.

## 14 · Integration tests assert properties, not exact plans

A test that pins the exact output of a 4B model fails on Tuesday for no reason.
`test_ollama_integration.py` asserts that plans parse, that columns are real,
that a plausible tool was chosen — never a specific plan.

They are also deselected by default. A suite that needs a 3 GB download is a
suite nobody runs.

## 15 · Eleven golden cases, four happy

The behaviours that regress silently are the refusals, so the set is weighted
towards them.

`test_every_failure_mode_of_the_fake_is_covered` pins every mode the fake can
produce to a case in the set. It found a genuine hole the first time it ran —
`too_many_ops` had no case — which is the argument for having it.

---

## Still exposed

1. **A plausible-but-wrong plan passes everything.** Grouping CSAT by
   `ticket_id` is valid on every layer and analytically useless. The guards
   check legality, not sense. Only the eval set catches this, and only for
   questions it happens to contain.
2. **`faithfulness` is a number-matching heuristic.** It compares figures in the
   prose against figures in `results`. A model that states a correct number and
   attaches a false causal claim to it passes. Detecting that needs a judge.
3. **The keyword screen is decorative and known to be.** Layer 4 of a four-layer
   model, kept for logging, with a test asserting it can be bypassed.
4. **`--ollama` evals are not deterministic.** Two runs of the same case can
   disagree. Useful as a signal, unusable as a gate.
5. **No concurrency story.** `load_data()` re-reads the CSV per run and nothing
   is shared. Fine for a single-user lab; the caching question is unanswered.
6. **Cost is untracked.** Local inference is free, so there is no token
   accounting here. Port this to a hosted model and quadratic step cost becomes
   the first thing that bites — the main course covers it; this lab does not.
7. **The clarification path is only as good as the model.** `clarification_needed`
   exists, but a 4B model asked "which tickets are bad?" will sometimes guess
   instead. The integration test accepts several honest outcomes for that
   reason, which is weaker than pinning one.
8. **One dataset, one shape.** Every semantic check knows about this CSV. Point
   the lab at a different file and the guards still work, but the planted
   signals, the golden numbers and the tuned prompt do not transfer.
