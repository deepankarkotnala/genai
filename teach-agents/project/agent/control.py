"""
control.py — the controller that makes the loop survivable.

Lesson 7. Lesson 2's loop always terminates, which is the minimum. It does not
yet cope with a tool that hangs, a tool that fails twice then works, a tool that
is simply down, or an agent that asks the same question forever.

Five controls, each answering one question:

    repeat detection    "have I already done exactly this?"
    oscillation         "am I going round in a circle?"
    timeout             "how long am I prepared to wait?"
    retry budget        "how many attempts is this worth, and how spaced?"
    safe termination    "if I give up, what does the caller get?"

The last one is the one people skip, and it is the one that matters. An agent
that cannot finish must still *return something a human can act on*. Silence and
a stack trace are both worse than "I could not establish the facts; escalating."

A note on what a timeout is
---------------------------
`future.result(timeout=...)` stops us *waiting*. It does not stop the work: the
thread runs on. That is not a flaw in the code, it is what a timeout is on any
platform without cancellation, and saying so out loud in an interview is worth
more than pretending otherwise. It also means a hung tool leaks a thread, which
is why the pool is bounded and why a real system needs cancellable I/O.
"""

from __future__ import annotations

import json
import time
from concurrent.futures import ThreadPoolExecutor, TimeoutError as FutureTimeout
from dataclasses import dataclass, field
from typing import Any

from brain import Brain, Message
from . import faults
from .loop import SYSTEM_PROMPT, Step
from .schemas import ToolError
from .state import RunState, estimate_tokens
from .tools import execute, tool_specs

# Defaults chosen to be *observable* in a lesson, not to be production values.
DEFAULT_TIMEOUT_S = 2.0
DEFAULT_MAX_ATTEMPTS = 3       # 1 try + 2 retries
BACKOFF_BASE_S = 0.05          # doubles each retry
REPEAT_LIMIT = 2               # identical call allowed twice, blocked on the third
OSCILLATION_WINDOW = 6

_POOL = ThreadPoolExecutor(max_workers=4, thread_name_prefix="tool")


# --------------------------------------------------------------------------
# Outcomes -- every run ends in exactly one of these, and the caller can tell.
# --------------------------------------------------------------------------
RESOLVED = "resolved"            # the agent answered
ESCALATED = "escalated"          # the agent gave up deliberately, with a reason
EXHAUSTED = "exhausted"          # a budget stopped it
BLOCKED = "blocked"              # a control stopped it (loop, repeat)

TERMINAL = {RESOLVED, ESCALATED, EXHAUSTED, BLOCKED}


@dataclass
class ControlledResult:
    outcome: str
    answer: str
    steps: list[Step] = field(default_factory=list)
    state: RunState | None = None
    interventions: list[str] = field(default_factory=list)

    @property
    def tool_calls(self) -> list[str]:
        return [s.tool_name for s in self.steps if s.kind == "tool_call" and s.tool_name]

    @property
    def needs_human(self) -> bool:
        return self.outcome != RESOLVED


# --------------------------------------------------------------------------
# Guarded execution: timeout + retry + fault injection
# --------------------------------------------------------------------------
def guarded_execute(
    tool: str,
    args: dict[str, Any],
    *,
    timeout_s: float = DEFAULT_TIMEOUT_S,
    max_attempts: int = DEFAULT_MAX_ATTEMPTS,
) -> tuple[dict[str, Any], list[str]]:
    """
    Run one tool with a wait limit and a bounded number of attempts.

    Returns (result, notes). Notes are for the trace: a run that succeeded on
    attempt 3 looks identical to one that succeeded first time unless you record
    the difference, and "it works but retries constantly" is a real incident.
    """
    notes: list[str] = []

    for attempt in range(1, max_attempts + 1):
        started = time.perf_counter()
        try:
            future = _POOL.submit(_call, tool, args)
            result = future.result(timeout=timeout_s)
            elapsed = time.perf_counter() - started
            if attempt > 1:
                notes.append(f"{tool} succeeded on attempt {attempt}")
            if elapsed > timeout_s * 0.5:
                notes.append(f"{tool} took {elapsed:.2f}s (limit {timeout_s}s)")
            return result, notes

        except FutureTimeout:
            # We stop waiting. The thread does not stop working -- see the module
            # docstring. Retrying a timeout is usually wrong (the slow thing is
            # still slow, and now two of them are running), so we do not.
            notes.append(f"{tool} timed out after {timeout_s}s; not retried")
            return {
                "error": "timeout",
                "message": (
                    f"{tool} did not respond within {timeout_s}s. "
                    "Whether it took effect is unknown."
                ),
            }, notes

        except (ConnectionError, OSError) as exc:
            if attempt >= max_attempts:
                notes.append(f"{tool} failed all {max_attempts} attempts")
                return {
                    "error": "unavailable",
                    "message": f"{tool} is unavailable: {exc}",
                }, notes
            delay = BACKOFF_BASE_S * (2 ** (attempt - 1))
            notes.append(f"{tool} attempt {attempt} failed ({exc}); retry in {delay:.2f}s")
            time.sleep(delay)

        except ToolError as exc:
            # A bad *argument* is not transient. Retrying an identical malformed
            # call cannot succeed, so it is returned immediately rather than
            # burning the budget three times over.
            return {"error": "invalid_call", "message": str(exc)}, notes

    return {"error": "unavailable", "message": f"{tool} exhausted retries"}, notes


def _call(tool: str, args: dict[str, Any]) -> dict[str, Any]:
    faults.ACTIVE.before_call(tool)
    return faults.ACTIVE.degrade(tool, execute(tool, args))


# --------------------------------------------------------------------------
# Loop controls
# --------------------------------------------------------------------------
def _signature(tool: str, args: dict[str, Any]) -> str:
    return f"{tool}:{json.dumps(args, sort_keys=True, default=str)}"


def _is_oscillating(history: list[str]) -> bool:
    """
    Detect an A,B,A,B cycle in the recent signatures.

    Repeat detection catches "same call again". This catches the subtler
    version: two calls alternating forever, each one looking novel to a check
    that only compares against the immediately previous call.
    """
    window = history[-OSCILLATION_WINDOW:]
    if len(window) < 4:
        return False
    return window[-1] == window[-3] and window[-2] == window[-4] and window[-1] != window[-2]


# --------------------------------------------------------------------------
# The controlled loop
# --------------------------------------------------------------------------
def run_controlled(
    goal: str,
    brain: Brain,
    *,
    max_steps: int = 8,
    token_budget: int = 8000,
    timeout_s: float = DEFAULT_TIMEOUT_S,
    verbose: bool = False,
    trace: Any = None,
) -> ControlledResult:
    """
    Lesson 2's loop with the five controls, and one guarantee:

    **it always returns a ControlledResult whose outcome says what happened.**

    Note what is NOT here: no automatic recovery beyond retries, no cleverness.
    Reliability is mostly refusing to continue in states you cannot reason about.
    """
    specs = tool_specs()
    state = RunState(goal=goal, max_steps=max_steps, token_budget=token_budget)
    messages = [Message("system", SYSTEM_PROMPT), Message("user", goal)]
    steps: list[Step] = []
    interventions: list[str] = []
    signatures: list[str] = []
    counts: dict[str, int] = {}

    def finish(outcome: str, answer: str) -> ControlledResult:
        if verbose:
            print(f"\n  OUTCOME  {outcome}\n  {answer}")
        return ControlledResult(outcome, answer, steps, state, interventions)

    while True:
        if state.step >= max_steps:
            interventions.append(f"step budget exhausted at {max_steps}")
            return finish(EXHAUSTED, _giving_up(state, "the step budget ran out"))
        if state.tokens_left() <= 0:
            interventions.append(f"token budget exhausted at {token_budget}")
            return finish(EXHAUSTED, _giving_up(state, "the token budget ran out"))

        # One span per model call. Tracing is opt-in so the loop stays readable
        # for Lessons 2-9; passing a Trace turns the same run into the tree that
        # Lesson 11 debugs.
        if trace is not None:
            with trace.span(f"decide:{state.step + 1}", "model") as sp:
                decision = brain.decide(messages, specs)
                trace.record_usage(sp, getattr(brain, "model", "unknown"),
                                   decision.prompt_tokens or 0,
                                   decision.completion_tokens or 0)
                sp.attributes["chose"] = (
                    decision.tool_call.name if decision.tool_call else "final_answer"
                )
        else:
            decision = brain.decide(messages, specs)

        state.step += 1
        state.spend((decision.prompt_tokens or 0) + (decision.completion_tokens or 0))

        if decision.final_text is not None:
            steps.append(Step(n=state.step, kind="final", text=decision.final_text,
                              latency_ms=decision.latency_ms))
            return finish(RESOLVED, decision.final_text)

        call = decision.tool_call
        sig = _signature(call.name, call.arguments)

        # -- control 1: identical repeat -----------------------------------
        counts[sig] = counts.get(sig, 0) + 1
        if counts[sig] > REPEAT_LIMIT:
            interventions.append(f"blocked repeat: {call.name} called {counts[sig]}x identically")
            return finish(
                BLOCKED,
                _giving_up(state, f"{call.name} was called identically {counts[sig]} times "
                                  "without making progress"),
            )

        # -- control 2: oscillation ----------------------------------------
        signatures.append(sig)
        if _is_oscillating(signatures):
            interventions.append("blocked oscillation: two calls alternating")
            return finish(BLOCKED, _giving_up(state, "the agent began cycling between two calls"))

        # -- control 3+4: timeout and retries ------------------------------
        if trace is not None:
            with trace.span(f"tool:{call.name}", "tool", **call.arguments) as sp:
                result, notes = guarded_execute(call.name, dict(call.arguments),
                                                timeout_s=timeout_s)
                if result.get("error"):
                    sp.ok = False
                    sp.error_class = result["error"]
                sp.attributes["retries"] = sum(1 for n in notes if "attempt" in n)
        else:
            result, notes = guarded_execute(call.name, dict(call.arguments), timeout_s=timeout_s)
        interventions.extend(notes)

        # -- partial results are surfaced, never silently accepted ---------
        if result.get("_partial"):
            interventions.append(f"{call.name} returned incomplete data")

        state.record(call.name, result)
        steps.append(Step(n=state.step, kind="tool_call", tool_name=call.name,
                          arguments=dict(call.arguments), result=result,
                          latency_ms=decision.latency_ms))
        if verbose:
            _print(state.step, call.name, call.arguments, result, notes)

        blob = json.dumps(result, default=str)
        state.spend(estimate_tokens(blob))
        messages.append(Message("assistant", f"Calling {call.name} with {call.arguments}"))
        messages.append(Message("tool", blob, tool_name=call.name))

        # -- control 5: an explicit give-up is a *success* of the design ----
        if call.name == "escalate":
            return finish(ESCALATED, result.get("message", "Escalated to a human."))


def _giving_up(state: RunState, why: str) -> str:
    """
    What the caller gets when the agent stops early.

    It names the reason and lists what *was* established, because a human
    picking this up should not have to redo the work the agent already did.
    A bare "failed" throws away everything.
    """
    known = ", ".join(state.facts) or "nothing"
    return (
        f"Stopping without a resolution: {why}. "
        f"Established so far: {known}. "
        f"Handing to a human with the trace attached ({state.summary()})."
    )


def _print(n: int, tool: str, args: dict, result: dict, notes: list[str]) -> None:
    print(f"\n  STEP {n}  ACT   {tool}({', '.join(f'{k}={v!r}' for k, v in args.items())})")
    if result.get("error"):
        print(f"          OBSERVE  ERROR {result['error']}: {result.get('message', '')[:90]}")
    else:
        keys = [k for k in result if not k.startswith('_')][:4]
        print(f"          OBSERVE  {', '.join(f'{k}={str(result[k])[:34]}' for k in keys)}")
    for note in notes:
        print(f"          CONTROL  {note}")
