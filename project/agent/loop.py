"""
loop.py — the agent loop, written out in full.

This is the whole idea of an agent, and it is about forty lines of ordinary
Python. No framework. Read `run()` once and you have seen everything: the model
decides, your code acts, the result goes back in, repeat until an answer or a
limit.

The parts worth defending in an interview are the ones that are *not* the happy
path:

* `max_steps` -- a loop whose exit depends on a model deciding to stop is not
  bounded. The step limit is the bound. Lesson 7 shows what happens without it.
* Tool errors are fed back, not raised. A `not_found` result is information the
  agent can use; a traceback ends the run. Recoverable and fatal are different.
* Every step is recorded. If you cannot replay a run you cannot debug it, and
  "it did something odd yesterday" is not a bug report.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from brain import Brain, Message, ToolCall
from .schemas import ToolError
from .tools import execute, tool_specs

SYSTEM_PROMPT = """You are a support-ticket triage agent.

Your job: understand the ticket, gather the facts you need with the tools you
have, then state a recommended next step.

Rules:
- Read the ticket before doing anything else.
- If the ticket references an order, look the order up before advising.
- Check the knowledge base for the policy that applies. Quote it; do not invent
  policy from memory.
- You cannot issue refunds, send email, or change any record. You recommend.
- If you cannot establish the facts, say so and recommend escalation.
"""


@dataclass
class Step:
    """One turn of the loop, kept for tracing and for the tests."""

    n: int
    kind: str  # "tool_call" | "final"
    tool_name: str | None = None
    arguments: dict[str, Any] | None = None
    result: dict[str, Any] | None = None
    text: str | None = None
    latency_ms: int = 0
    prompt_tokens: int | None = None
    completion_tokens: int | None = None


@dataclass
class RunResult:
    answer: str
    steps: list[Step] = field(default_factory=list)
    stopped_because: str = "final_answer"  # or "max_steps"
    backend: str = ""
    model: str = ""

    @property
    def tool_calls(self) -> list[str]:
        return [s.tool_name for s in self.steps if s.kind == "tool_call" and s.tool_name]

    @property
    def total_latency_ms(self) -> int:
        return sum(s.latency_ms for s in self.steps)


def run(goal: str, brain: Brain, *, max_steps: int = 6, verbose: bool = False) -> RunResult:
    """Drive the agent until it answers or runs out of steps."""
    specs = tool_specs()
    messages: list[Message] = [
        Message("system", SYSTEM_PROMPT),
        Message("user", goal),
    ]
    steps: list[Step] = []

    for n in range(1, max_steps + 1):
        # 1. DECIDE -- the only place a model is consulted.
        decision = brain.decide(messages, specs)

        # 2. If it chose to answer, we are done.
        if decision.final_text is not None:
            steps.append(
                Step(
                    n=n,
                    kind="final",
                    text=decision.final_text,
                    latency_ms=decision.latency_ms,
                    prompt_tokens=decision.prompt_tokens,
                    completion_tokens=decision.completion_tokens,
                )
            )
            if verbose:
                _print_final(n, decision.final_text)
            return RunResult(
                answer=decision.final_text,
                steps=steps,
                stopped_because="final_answer",
                backend=decision.backend,
                model=decision.model,
            )

        # 3. ACT -- run the tool it asked for.
        call: ToolCall = decision.tool_call  # type: ignore[assignment]
        try:
            result = execute(call.name, call.arguments)
        except ToolError as exc:
            # A bad call is a fact about the world, so it goes back into the
            # conversation like any other observation. The agent gets a chance
            # to correct itself instead of the process dying.
            result = {"error": "invalid_call", "message": str(exc)}

        steps.append(
            Step(
                n=n,
                kind="tool_call",
                tool_name=call.name,
                arguments=dict(call.arguments),
                result=result,
                latency_ms=decision.latency_ms,
                prompt_tokens=decision.prompt_tokens,
                completion_tokens=decision.completion_tokens,
            )
        )
        if verbose:
            _print_step(n, call, result)

        # 4. OBSERVE -- the result becomes part of what the model sees next.
        import json as _json

        messages.append(
            Message("assistant", f"Calling {call.name} with {call.arguments}")
        )
        messages.append(
            Message("tool", _json.dumps(result), tool_name=call.name)
        )

    # 5. The limit, not the model, ended this run. Say so plainly -- a truncated
    #    run reported as a finished one is how silent failures reach production.
    return RunResult(
        answer=(
            f"Stopped after {max_steps} steps without reaching an answer. "
            "Escalating to a human."
        ),
        steps=steps,
        stopped_because="max_steps",
    )


# --------------------------------------------------------------------------
# Trace printing. Reading a trace is a skill; this makes it readable.
# --------------------------------------------------------------------------
def _print_step(n: int, call: ToolCall, result: dict[str, Any]) -> None:
    print(f"\n  STEP {n}  ACT   {call.name}({_fmt_args(call.arguments)})")
    print(f"          OBSERVE  {_fmt_result(result)}")


def _print_final(n: int, text: str) -> None:
    print(f"\n  STEP {n}  ANSWER")
    for line in _wrap(text, 74):
        print(f"          {line}")


def _fmt_args(args: dict[str, Any]) -> str:
    return ", ".join(f"{k}={v!r}" for k, v in args.items())


def _fmt_result(result: dict[str, Any]) -> str:
    if result.get("error"):
        return f"ERROR {result['error']}: {result.get('message', '')}"
    keys = [k for k in result if k not in ("note",)]
    preview = {k: result[k] for k in keys[:4]}
    text = ", ".join(f"{k}={_short(v)}" for k, v in preview.items())
    if len(keys) > 4:
        text += f", ... (+{len(keys) - 4} fields)"
    return text


def _short(value: Any, limit: int = 46) -> str:
    text = str(value)
    return text if len(text) <= limit else text[: limit - 3] + "..."


def _wrap(text: str, width: int) -> list[str]:
    words, lines, current = text.split(), [], ""
    for word in words:
        if len(current) + len(word) + 1 > width:
            lines.append(current)
            current = word
        else:
            current = f"{current} {word}".strip()
    if current:
        lines.append(current)
    return lines
