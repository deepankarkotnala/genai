"""
patterns.py — the four named reasoning patterns, as control flow.

The single most useful thing to understand here: **a reasoning pattern is not a
different API.** Every pattern below calls the same `brain.decide()` and the same
`execute()`. What changes is:

  1. what you put in the messages, and
  2. what your code does with the answer.

That is all "ReAct" and "plan-and-execute" mean at the implementation level.
Frameworks give these things class names and make them look like features you
have to adopt. They are twenty lines of control flow each.

  react          decide -> act -> observe, one step at a time. Adaptive.
  plan_execute   plan once, then run the plan. Predictable, cheaper.
  reflect        produce, critique once, revise. Better quality, ~2x cost.
  route          classify first, then narrow the tools and run react.

None of them is "best". Lesson 4 measures all four on the same ticket so the
trade-off is a number rather than an opinion.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from brain import Brain, Message
from .loop import SYSTEM_PROMPT, RunResult, Step, run
from .schemas import ToolError
from .tools import execute, tool_specs

# Sentinels the stub backend recognises. With a real model these are just
# instructions in a prompt -- nothing here depends on a special API.
PLAN_REQUEST = "PLAN_REQUEST"
CRITIQUE_REQUEST = "CRITIQUE_REQUEST"
ROUTE_REQUEST = "ROUTE_REQUEST"

# Which tools each route is allowed to touch. Narrowing the tool set is the
# cheapest accuracy win available: fewer options, fewer wrong choices, and a
# smaller prompt. See Lesson 3 on why 30 tools degrades selection.
ROUTES: dict[str, list[str]] = {
    "billing": ["read_ticket", "lookup_order", "search_kb", "draft_reply"],
    "technical": ["read_ticket", "search_kb", "draft_reply"],
    "general": ["read_ticket", "search_kb", "draft_reply"],
}


@dataclass
class PatternResult:
    """A RunResult plus what the pattern itself did on top of the loop."""

    pattern: str
    answer: str
    steps: list[Step] = field(default_factory=list)
    stopped_because: str = "final_answer"
    plan: list[str] = field(default_factory=list)
    critique: str | None = None
    route: str | None = None
    model_calls: int = 0
    total_latency_ms: int = 0

    @property
    def tool_calls(self) -> list[str]:
        return [s.tool_name for s in self.steps if s.kind == "tool_call" and s.tool_name]


# --------------------------------------------------------------------------
# 1 · ReAct — the Wave 1 loop, named
# --------------------------------------------------------------------------
def run_react(goal: str, brain: Brain, *, max_steps: int = 6, **kw) -> PatternResult:
    """
    Reason + Act, interleaved. This is exactly `loop.run()`.

    Strength: adaptive. It can use what step 1 returned to choose step 2, which
    is the only reason to prefer an agent over a workflow at all.

    Weakness: one model call per step, so cost and latency scale with the number
    of steps, and there is no global view -- it can wander because it never
    committed to a route.
    """
    r: RunResult = run(goal, brain, max_steps=max_steps, **kw)
    return PatternResult(
        pattern="react",
        answer=r.answer,
        steps=r.steps,
        stopped_because=r.stopped_because,
        model_calls=len(r.steps),
        total_latency_ms=r.total_latency_ms,
    )


# --------------------------------------------------------------------------
# 2 · Plan-and-execute
# --------------------------------------------------------------------------
def run_plan_execute(
    goal: str, brain: Brain, *, max_steps: int = 6, verbose: bool = False
) -> PatternResult:
    """
    Ask for the whole plan up front, then execute it without re-planning.

    Strength: predictable and cheaper -- one planning call plus one execution
    pass, and you can show the plan to a human *before* anything runs. That last
    property is why regulated workflows like this shape.

    Weakness: the plan is made in ignorance. If step 2 reveals something the
    plan did not anticipate, a pure plan-executor ploughs on regardless. Real
    systems add "re-plan if a step fails", which is where the simplicity goes.
    """
    specs = tool_specs()
    messages = [
        Message("system", SYSTEM_PROMPT),
        Message(
            "user",
            f"{PLAN_REQUEST}\nGoal: {goal}\n"
            "List the tools to call, in order, one per line, as tool_name(argument). "
            "Do not execute anything yet.",
        ),
    ]
    planning = brain.decide(messages, specs)
    plan = _parse_plan(planning.final_text or "")
    if verbose:
        print("\n  PLAN")
        for i, line in enumerate(plan, 1):
            print(f"        {i}. {line}")

    steps: list[Step] = []
    observed: dict[str, Any] = {}
    latency = planning.latency_ms

    for n, line in enumerate(plan[:max_steps], 1):
        name, arg = _parse_call(line)
        if name not in {s["name"] for s in specs}:
            steps.append(
                Step(n=n, kind="tool_call", tool_name=name, arguments={},
                     result={"error": "invalid_call", "message": f"unknown tool {name!r}"})
            )
            continue
        args = _arguments_for(name, arg, observed)
        try:
            result = execute(name, args)
        except ToolError as exc:
            result = {"error": "invalid_call", "message": str(exc)}
        observed[name] = result
        steps.append(
            Step(n=n, kind="tool_call", tool_name=name, arguments=args, result=result)
        )
        if verbose:
            print(f"  STEP {n}  ACT   {name}({args})")

    # One synthesis call at the end, with everything the plan gathered.
    messages.append(Message("assistant", "Plan executed."))
    for name, result in observed.items():
        messages.append(Message("tool", _dump(result), tool_name=name))
    final = brain.decide(messages, specs)
    latency += final.latency_ms
    answer = final.final_text or "(plan produced no answer)"
    steps.append(Step(n=len(steps) + 1, kind="final", text=answer))

    return PatternResult(
        pattern="plan_execute",
        answer=answer,
        steps=steps,
        plan=plan,
        model_calls=2,  # the whole point: 2 calls regardless of plan length
        total_latency_ms=latency,
    )


# --------------------------------------------------------------------------
# 3 · Reflection
# --------------------------------------------------------------------------
def run_reflect(
    goal: str, brain: Brain, *, max_steps: int = 6, verbose: bool = False
) -> PatternResult:
    """
    Run, critique once, revise. Exactly once -- see the note below.

    Strength: catches omissions the first pass missed, and it is the cheapest
    quality upgrade available when the failure mode is "incomplete" rather than
    "wrong tool".

    Weakness: roughly doubles cost and latency for one extra pass. And a model
    critiquing its own work shares its own blind spots -- reflection cannot find
    an error the model cannot see. It is not a substitute for evaluation
    (Lesson 10) or for a human.

    Why exactly one pass: critique-revise loops do not converge. They oscillate,
    or they drift into agreeable rewording while the token bill grows. If one
    pass is not enough, the fix is a better first prompt or a real evaluator.
    """
    first = run(goal, brain, max_steps=max_steps)

    specs = tool_specs()
    messages = [
        Message("system", SYSTEM_PROMPT),
        Message(
            "user",
            f"{CRITIQUE_REQUEST}\nGoal: {goal}\nDraft answer:\n{first.answer}\n"
            "What is missing or unsupported? Be specific and brief.",
        ),
    ]
    crit = brain.decide(messages, specs)
    critique = crit.final_text or ""
    if verbose:
        print(f"\n  CRITIQUE\n        {critique}")

    messages.append(Message("assistant", critique))
    messages.append(
        Message("user", "Now give the improved final answer, addressing that critique.")
    )
    revised = brain.decide(messages, specs)
    answer = revised.final_text or first.answer

    steps = list(first.steps)
    steps.append(Step(n=len(steps) + 1, kind="final", text=answer))
    return PatternResult(
        pattern="reflect",
        answer=answer,
        steps=steps,
        critique=critique,
        model_calls=len(first.steps) + 2,
        total_latency_ms=first.total_latency_ms + crit.latency_ms + revised.latency_ms,
    )


# --------------------------------------------------------------------------
# 4 · Routing
# --------------------------------------------------------------------------
def run_route(
    goal: str, brain: Brain, *, max_steps: int = 6, verbose: bool = False
) -> PatternResult:
    """
    One cheap classification call, then run ReAct with a narrowed tool set.

    This is the pattern most production systems actually use, and the one
    candidates mention least. It is also the cheapest: a router can send the
    easy 80% down a deterministic path and only hand the remainder to an agent
    (see Lesson 2's 10,000-tickets-a-day question).
    """
    specs_all = tool_specs()
    messages = [
        Message("system", SYSTEM_PROMPT),
        Message(
            "user",
            f"{ROUTE_REQUEST}\nGoal: {goal}\n"
            f"Reply with exactly one word: {' | '.join(ROUTES)}.",
        ),
    ]
    routing = brain.decide(messages, specs_all)
    route = (routing.final_text or "general").strip().lower().split()[0]
    if route not in ROUTES:
        route = "general"
    if verbose:
        print(f"\n  ROUTE  {route}  (tools: {', '.join(ROUTES[route])})")

    allowed = set(ROUTES[route])
    from . import loop as loop_module

    original = loop_module.tool_specs
    loop_module.tool_specs = lambda: [s for s in original() if s["name"] in allowed]
    try:
        r = run(goal, brain, max_steps=max_steps, verbose=verbose)
    finally:
        loop_module.tool_specs = original

    return PatternResult(
        pattern="route",
        answer=r.answer,
        steps=r.steps,
        stopped_because=r.stopped_because,
        route=route,
        model_calls=len(r.steps) + 1,
        total_latency_ms=r.total_latency_ms + routing.latency_ms,
    )


PATTERNS = {
    "react": run_react,
    "plan_execute": run_plan_execute,
    "reflect": run_reflect,
    "route": run_route,
}


def run_pattern(name: str, goal: str, brain: Brain, **kw) -> PatternResult:
    if name not in PATTERNS:
        raise ValueError(f"Unknown pattern {name!r}. Available: {', '.join(PATTERNS)}")
    return PATTERNS[name](goal, brain, **kw)


# --------------------------------------------------------------------------
# Helpers
# --------------------------------------------------------------------------
def _parse_plan(text: str) -> list[str]:
    lines = []
    for raw in text.splitlines():
        line = raw.strip().lstrip("0123456789.-) ").strip()
        if "(" in line and ")" in line:
            lines.append(line)
    return lines


def _parse_call(line: str) -> tuple[str, str]:
    name, _, rest = line.partition("(")
    return name.strip(), rest.rstrip(")").strip().strip("'\"")


def _arguments_for(name: str, arg: str, observed: dict[str, Any]) -> dict[str, Any]:
    """
    Turn a planned `tool(arg)` into real arguments.

    This function is where plan-and-execute shows its seam. A plan written
    before anything ran cannot know an order id that only appears inside a
    ticket, so the executor has to fill the gap from what it has observed --
    which is a small re-planning step wearing a disguise.
    """
    if name == "read_ticket":
        return {"ticket_id": arg or "TCK-1001"}
    if name == "lookup_order":
        if arg.upper().startswith("ORD-"):
            return {"order_id": arg}
        ticket = observed.get("read_ticket") or {}
        found = _find_token(_dump(ticket), "ORD-")
        return {"order_id": found or "ORD-0000"}
    if name == "search_kb":
        # A plan written in advance cannot know the category, so it writes a
        # placeholder like "from ticket category". Passing that string through as
        # the query is how one unresolved placeholder becomes three failures: a
        # nonsense query, the wrong article retrieved, and that wrong article
        # cited in a customer reply. Detect placeholders and resolve from state.
        if arg and not _is_placeholder(arg):
            return {"query": arg, "limit": 2}
        ticket = observed.get("read_ticket") or {}
        return {"query": (ticket.get("category") or "billing").lower(), "limit": 2}
    if name == "draft_reply":
        ticket = observed.get("read_ticket") or {}
        kb = observed.get("search_kb") or {}
        return {
            "ticket_id": ticket.get("ticket_id", arg or "TCK-1001"),
            "summary": f"Regarding your {ticket.get('category', 'support')} issue.",
            "next_step": "A support agent will review this and reply.",
            "citations": _cite(kb),
        }
    return {}


def _cite(kb_result: dict[str, Any], limit: int = 2) -> list[str]:
    """
    Article ids to cite, deduplicated, order preserved.

    Retrieval now returns *chunks*, and two chunks often come from one article,
    so the naive mapping produces ["refunds", "refunds"]. Citing the same source
    twice reads as careless and inflates apparent evidence -- two citations that
    are really one.
    """
    seen: list[str] = []
    for article in kb_result.get("articles", []):
        aid = article.get("id")
        if aid and aid not in seen:
            seen.append(aid)
    return seen[:limit]


_PLACEHOLDER_HINTS = ("from ", "what ", "the ticket", "cite ", "returned", "body", "category")


def _is_placeholder(arg: str) -> bool:
    """
    Does this look like plan prose rather than a real argument?

    Crude on purpose. The robust answer is to have the planner emit typed slots
    that reference earlier steps (`lookup_order(order_id=$1.order_id)`) instead
    of English -- which is what production plan-executors do, and it is most of
    why they stop being simple.
    """
    low = arg.lower()
    return any(h in low for h in _PLACEHOLDER_HINTS)


def _find_token(text: str, prefix: str) -> str | None:
    for raw in text.replace(",", " ").replace('"', " ").split():
        token = raw.strip(".!?)(':")
        if token.upper().startswith(prefix.upper()) and len(token) > len(prefix):
            return token
    return None


def _dump(value: Any) -> str:
    import json

    return json.dumps(value, default=str)
