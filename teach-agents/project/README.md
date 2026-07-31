# Support-ticket triage agent

The one project built across all fifteen lessons. Lessons 1–3 are in place; each
later lesson adds one capability to **this** package rather than starting over.

## Run it

No API key. No network. No installs.

```
cd teach-agents/project
python steps/l02_loop.py
```

Other things to try:

```
python steps/l02_loop.py TCK-1003          # a different ticket, a different path
python steps/l02_loop.py TCK-1005          # no order mentioned, so no order lookup
python steps/l02_loop.py TCK-9999          # a ticket that does not exist
python steps/l02_loop.py TCK-1001 --max-steps 2   # cut the loop short
```

The exit code is `0` when the agent reached an answer and `1` when the step limit
stopped it. A truncated run must never look like a finished one.

## Tests

```
cd teach-agents/project
python -m pytest
```

36 tests, fully offline and deterministic. Tests needing a real model backend are
marked `live_model` and excluded by default; run them with `python -m pytest -m live_model`.

## Layout

```
brain.py              the model boundary: Brain protocol, BrainResult, errors,
                      StubBrain (default) + Ollama and Claude adapters
agent/
  schemas.py          tool declarations + the argument validator
  tools.py            read_ticket, lookup_order, search_kb, dispatch boundary
  loop.py             the explicit agent loop
fixtures/
  tickets.json        8 support tickets
  orders.csv          7 orders with refund-eligibility fields
  kb/*.md             5 knowledge-base articles
steps/
  l02_loop.py         milestone entry point (thin; imports agent/)
tests/
```

## Backends

`AGENT_BRAIN` selects the backend and defaults to `stub`.

| Value | Needs | Notes |
| --- | --- | --- |
| `stub` | nothing | the course default; deterministic and offline |
| `ollama` | Ollama running, `requests` | `OLLAMA_MODEL` defaults to `gemma3:4b` |
| `claude` | `anthropic`, an API key | reference adapter; never used by tests |

macOS / Linux:

```bash
export AGENT_BRAIN=ollama
```

Windows Command Prompt:

```bat
set AGENT_BRAIN=ollama
```

The stub is chosen deliberately, never as a silent fallback after a failure. If
you ask for `ollama` and it is not there, you get an error telling you to run
`ollama serve` — not a quiet downgrade that makes you think you tested something
you did not.

## What the stub backend is and is not

`StubBrain` is a rule engine, not a language model. Its rules are written in
terms of *what it has learned so far* rather than *how many turns have passed*,
so it produces a genuine multi-step trajectory: remove a tool and the path
changes, edit a fixture and the path changes.

What it gives you: reproducible runs, tests with no network, a loop you can
single-step in a debugger, and no bill.

What it cannot show you — read this before claiming the agent "works":

- **No language understanding.** It finds `TCK-` and `ORD-` tokens with string
  matching. Rephrase the goal and a real model would cope; the stub may not.
- **No variability.** A real model can answer differently to the same input.
  Any strategy that only works because the model is deterministic is not a
  strategy. Lesson 3 makes you run the same prompt five times against a real
  model to feel this.
- **No malformed output.** It cannot emit broken JSON or invent a tool name, so
  the repair paths are exercised by tests that inject those faults rather than
  by the stub itself.
- **No token limits, no refusals, no latency.** Context-window pressure,
  safety refusals and slow first tokens are all invisible here. Lessons 6, 9
  and 11 address them.

The stub is how you learn the loop. It is not evidence that a real model will
follow it.
