# EDA Lab — a data-analysis agent that runs entirely on your machine

**Supplementary to the main course.** Roughly 4–6 hours. Everything here is a
second angle on ideas Lessons 3, 9, 10, 14 and 15 already cover — structured
output, guardrails, evaluation, safety, and honest limitations — applied to a
domain where the failure modes look different and the interview questions are
sharper.

A local Gemma model reads a plain-English question and produces a **structured
analysis plan**. Deterministic pandas functions execute it. The model then
explains what was computed, and nothing else.

```
question  ->  Gemma plans  ->  schema + semantic validation  ->  pandas computes
                                                                      |
                            answer + caveats  <-  Gemma explains  <----+
```

The invariant worth memorising, because it is the answer to half the questions
this lab is designed to prepare you for:

> **Gemma decides what analysis to run. pandas decides what the numbers are.**

The model never writes Python, never executes anything, and never touches the
dataframe. Not because it is instructed not to — because no tool in the registry
can do those things.

## Setup

Ollama and the model are the only prerequisites. **This lab will not install
Ollama, start the service, download a model, or switch models for you.** When
something is missing it prints the exact command and stops. A tool that silently
pulls three gigabytes on a metered connection, or quietly substitutes a
different model so the numbers you demo came from something you never chose, is
worse than one that fails.

Install Ollama from <https://ollama.com/download>, then:

**macOS / Linux (bash or zsh)**

```bash
ollama serve                      # leave running in its own terminal
ollama pull gemma3:4b             # ~3.3 GB, once

cd teach-agents/eda-lab
python make_dataset.py            # writes data/support_ops_synthetic.csv
python -m eda_lab.cli --check     # confirms service + model
python -m eda_lab.cli "Which ticket categories have the longest resolution times?"
```

**Windows Command Prompt (`cmd.exe`)**

```
ollama serve
ollama pull gemma3:4b

cd teach-agents\eda-lab
python make_dataset.py
python -m eda_lab.cli --check
python -m eda_lab.cli "Which ticket categories have the longest resolution times?"
```

`--check` is worth running first. It reports the service and the model
*separately*, because those are two different failures with two different fixes
and collapsing them into "backend unavailable" sends you to the wrong one.

### Choosing a model

`gemma3:4b` is the default: it fits comfortably in 8 GB of RAM and is reliable
enough at constrained JSON to be interesting.

| Tag | Size | Notes |
| --- | --- | --- |
| `gemma3:1b` | ~0.8 GB | Fast, and it will produce invalid plans. Useful for that reason — set it deliberately and watch the repair path work. |
| `gemma3:4b` | ~3.3 GB | Default. |
| `gemma3:12b` | ~8.1 GB | Better plans, noticeably slower. Needs ~9 GB free RAM. |

There is no `gemma3:7b` — that tag does not exist, and asking for it produces a
confusing 404 rather than a clear error.

To swap:

```bash
ollama pull gemma3:12b            # macOS / Linux
export OLLAMA_MODEL=gemma3:12b
```

```
ollama pull gemma3:12b
set OLLAMA_MODEL=gemma3:12b
```

Swapping the model is the cheapest experiment in this lab. Run the same question
on `1b` and `4b` and watch where plan quality actually comes from.

## Running it

```
python -m eda_lab.cli --examples          # six worked questions
python -m eda_lab.cli --schema            # the columns, as the model sees them
python -m eda_lab.cli "your question"
```

Charts land in `out/` with a filename derived from the plan. The model cannot
name the file — a model-supplied path is a write-anywhere primitive.

## Tests and evaluation

```
python -m pytest                  # 87 tests, offline, no model needed
python -m pytest -m ollama        # 12 integration tests, needs a running model
python evals/run_evals.py         # 11 golden cases, 58 checks
python evals/run_evals.py --ollama
```

The default run is deliberately offline: a suite that needs a 3 GB download is a
suite nobody runs. `-m ollama` is excluded by `addopts` in `pyproject.toml`.

The two runs measure different things, and the difference is the point:

- **`run_evals.py`** (fake backend) checks the *system* — the guards, the repair
  budget, the caveats, the refusals. Deterministic, so a regression is a
  regression.
- **`run_evals.py --ollama`** checks the *model*. Expect variation between runs.
  Treat a drop as a signal, not a failure.

Ten metrics, split the way an interviewer will ask you to split them:

| Trajectory — *how it got there* | Outcome — *what came out* |
| --- | --- |
| tool selection | numerical correctness |
| column selection | missing-data handling |
| aggregation choice | ambiguity clarification |
| | unsafe rejection |
| | faithfulness |
| | unsupported-question handling |
| | latency |

A run that produces the right number by calling three unnecessary tools and
ignoring 21% missing data is not a good run, and only trajectory metrics can see
that.

Only 4 of the 11 golden cases are happy paths. The behaviours that regress
silently are the refusals.

## Safety, in priority order

Say it in this order in an interview. The order *is* the answer.

1. **Capability.** No tool reads a path, opens a socket, or evaluates a string.
   There is no `eval`, `exec`, `subprocess`, dynamic import or path argument
   anywhere in the package. `test_no_execution_capability_exists` asserts it and
   fails the moment someone adds one.
2. **Semantics.** The plan names real columns, real tools, real aggregations —
   checked in `guards.py`, because JSON Schema structurally cannot. `{"group_by":
   "sentiment_score"}` satisfies every schema constraint and names a column that
   does not exist.
3. **Limits.** Bounded operations, rows, groups, charts, and result size. Caps
   *refuse* rather than truncate: a silently truncated table gets read as the
   whole answer.
4. **Keyword screen.** `screen_request` looks for known-unsafe shapes. It is
   trivially bypassed by rephrasing, and there is a test asserting exactly that.
   It is logging, not defence.

There is a test — `test_unsafe_request_stays_harmless_with_the_screen_disabled`
— that turns layer 4 off entirely and shows nothing changes. That is the
demonstration. A keyword filter guarding a real capability is theatre; one
guarding nothing is useful logging.

**Why there is no `demo_codegen_unsafe/`.** The obvious way to teach this is to
build the dangerous version and run it. This lab does not, because a working
sandbox-escape demo in a learning project is a liability that outlives the
lesson. `docs/decisions.md` covers what generated-code execution would break and
why the plan-based design avoids it; the tests demonstrate the boundary without
ever creating something on the other side of it.

## Files

```
eda_lab/
  config.py       frozen dataclass; every limit in one place
  schemas.py      the AnalysisPlan -- one definition drives decoding AND validation
  brain.py        OllamaBrain, FakeEdaBrain (8 misbehaviour modes), error hierarchy
  guards.py       semantic validation, limits, the supplementary screen
  tools.py        11 pandas functions; the entire capability surface
  runner.py       the 10-step loop, one bounded repair
  cli.py
evals/            golden_set.json + run_evals.py
tests/            5 files, 87 offline + 12 integration
docs/decisions.md what was chosen, what was rejected, what is still exposed
DATA_DICTIONARY.md  the planted signals, and the two traps
make_dataset.py   seeded; regenerates byte-identically
```

## What to take into an interview

Five things from this lab that survive contact with a real question:

1. **Structured output is a decoding constraint, not a promise.** `format=<schema>`
   makes the shape right. It cannot make the content true.
2. **Schema-valid is not semantically valid.** This is the single most useful
   sentence here. The gap between them is where `guards.py` lives.
3. **The security boundary is the tool registry.** Prompt instructions are not a
   boundary; capability absence is.
4. **Silent narrowing is a bug class.** Three separate bugs in this lab were the
   same shape: a chart that rendered nothing, a correlation over the wrong
   columns, a truncated table. All validated cleanly. All wrong. Both fixes are
   in the tests, with the story attached.
5. **Ambiguity is an outcome.** "Which tickets are bad?" has no answer in this
   dataset. A system that asks is better than one that guesses, and
   `clarification_needed` makes that a first-class result rather than a failure.
