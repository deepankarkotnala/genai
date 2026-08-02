"""
supervisor.py — multi-agent, and the measurement that decides whether to use it.

Lesson 13. A supervisor routes a ticket to a specialist, each specialist having
a narrow tool set. This is the pattern people reach for first and justify least.

The distinction to get right in an interview:

    A TOOL   is a function. Cheap, deterministic dispatch, no model call.
    AN AGENT is a loop with its own model calls, its own context and its own
             failure modes.

**Making something an agent that could have been a tool is the most common
multi-agent mistake.** A "summariser agent" that always does one thing with no
decisions is a function with a latency problem.

When a supervisor genuinely earns its place:
  * the specialists need *different tool sets*, and combining them would hurt
    selection accuracy (Lesson 3: more tools, worse choices);
  * the specialists need *different permissions* (Lesson 9: least privilege);
  * they are owned by different teams and version independently.

When it does not:
  * you wanted a router. Routing (Lesson 4) costs one model call, not a fleet.

This module measures the split against the single agent so the trade-off is a
number rather than an opinion. On our workload it comes out **worse**, and that
honest negative result is the most useful thing in the lesson.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from brain import Brain
from . import loop as loop_module
from .control import RESOLVED, run_controlled
from .trace import Trace

# Each specialist sees only the tools its job needs. Note the refund specialist
# gets `issue_refund` -- and that it remains dry-run-by-default and gated by the
# approval token, so a narrower agent is not a more powerful one.
SPECIALISTS: dict[str, list[str]] = {
    "billing": ["read_ticket", "lookup_order", "search_kb", "draft_reply", "escalate"],
    "refund": ["read_ticket", "lookup_order", "search_kb", "issue_refund", "escalate"],
    "technical": ["read_ticket", "search_kb", "draft_reply", "escalate"],
    "general": ["read_ticket", "search_kb", "draft_reply", "escalate"],
}


@dataclass
class SupervisorResult:
    route: str
    outcome: str
    answer: str
    model_calls: int = 0
    tool_calls: list[str] = field(default_factory=list)
    handoff_note: str = ""
    trace: Trace | None = None


def classify(goal: str, ticket: dict[str, Any] | None = None) -> str:
    """
    Route selection. Deliberately cheap and deterministic here.

    A real supervisor uses one model call. Ours reads the ticket category,
    because the interesting question in this lesson is what the *split* costs,
    not how the routing decision is made -- and a deterministic router keeps the
    comparison clean.
    """
    text = goal.lower()
    category = (ticket or {}).get("category", "").lower()
    if "refund" in text or category == "returns":
        return "refund"
    if category == "billing" or any(w in text for w in ("invoice", "charge", "billing")):
        return "billing"
    if category == "technical" or any(w in text for w in ("502", "error", "outage")):
        return "technical"
    return "general"


def run_supervised(
    goal: str,
    brain: Brain,
    *,
    max_steps: int = 8,
    trace: Trace | None = None,
    verbose: bool = False,
) -> SupervisorResult:
    """
    Supervisor: read the ticket, choose a specialist, hand off, collect.

    The handoff passes a **brief**, not a transcript. That is the whole art of
    multi-agent: a specialist given the supervisor's entire context inherits its
    context-window problem and its confusion, and you have paid two model calls
    for one agent's judgement.
    """
    from .tools import execute

    # Step 1: the supervisor does the minimum needed to route. One read.
    ticket_id = _extract_ticket(goal)
    ticket = execute("read_ticket", {"ticket_id": ticket_id}) if ticket_id else None
    if ticket and ticket.get("error"):
        ticket = None

    route = classify(goal, ticket)
    allowed = set(SPECIALISTS[route])

    # The brief. Short on purpose -- everything the specialist needs, nothing else.
    brief = (
        f"{goal}\n"
        f"[handoff from supervisor] category={(ticket or {}).get('category', 'unknown')}, "
        f"priority={(ticket or {}).get('priority', 'unknown')}, "
        f"tier={(ticket or {}).get('customer_tier', 'unknown')}. "
        f"You are the {route} specialist."
    )
    if verbose:
        print(f"\n  SUPERVISOR  route={route}  tools={sorted(allowed)}")
        print(f"  BRIEF       {brief[:110]}...")

    # Step 2: run the specialist with a narrowed tool set.
    original = loop_module.tool_specs
    loop_module.tool_specs = lambda: [s for s in original() if s["name"] in allowed]
    try:
        result = run_controlled(brief, brain, max_steps=max_steps, trace=trace,
                                verbose=verbose)
    finally:
        loop_module.tool_specs = original

    return SupervisorResult(
        route=route,
        outcome=result.outcome,
        answer=result.answer,
        # +1 for the supervisor's own read. A real supervisor's classification
        # call would be another; count honestly or the comparison lies.
        model_calls=len(result.steps) + 1,
        tool_calls=(["read_ticket(supervisor)"] + result.tool_calls),
        handoff_note=brief,
        trace=trace,
    )


def compare(goal: str, brain_factory, *, max_steps: int = 8) -> dict[str, Any]:
    """
    Single agent versus supervisor, on the same goal. Same brain, fresh each time.

    Returns the numbers rather than a verdict, because the verdict depends on the
    workload -- and being able to produce the numbers is the point.
    """
    single_trace, split_trace = Trace(goal="single"), Trace(goal="supervised")
    single = run_controlled(goal, brain_factory(), max_steps=max_steps, trace=single_trace)
    split = run_supervised(goal, brain_factory(), max_steps=max_steps, trace=split_trace)

    return {
        "single": {
            "outcome": single.outcome,
            "model_calls": len(single.steps),
            "tools": single.tool_calls,
            "tokens": single_trace.total_tokens,
            "resolved": single.outcome == RESOLVED,
        },
        "supervised": {
            "outcome": split.outcome,
            "route": split.route,
            "model_calls": split.model_calls,
            "tools": split.tool_calls,
            "tokens": split_trace.total_tokens,
            "resolved": split.outcome == RESOLVED,
        },
    }


def _extract_ticket(text: str) -> str | None:
    for raw in text.replace(",", " ").replace(".", " ").split():
        token = raw.strip("()'\"")
        if token.upper().startswith("TCK-") and len(token) > 4:
            return token.upper()
    return None
