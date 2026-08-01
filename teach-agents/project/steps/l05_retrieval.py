"""
Milestone entry point for Lessons 4-6.

Thin, like every milestone file: it imports the shared implementation in
../agent/ rather than carrying a copy.

    cd teach-agents/project
    python steps/l05_retrieval.py                   compare all four patterns
    python steps/l05_retrieval.py --pattern reflect TCK-1005
    python steps/l05_retrieval.py --retrieval       keyword vs BM25, side by side
    python steps/l05_retrieval.py --memory TCK-1001 context budget + compaction

No API key. No network. Deterministic backend.
"""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from agent.memory import ConversationHistory, recall_prior_tickets  # noqa: E402
from agent.patterns import PATTERNS, run_pattern  # noqa: E402
from agent.state import RunState, estimate_tokens  # noqa: E402
from agent.tools import search_kb, search_kb_keyword  # noqa: E402
from brain import Message, StubBrain, get_brain  # noqa: E402

BAR = "=" * 78


def compare_patterns(ticket: str) -> None:
    goal = f"Triage ticket {ticket} and recommend the next step."
    print(BAR)
    print(f"  {goal}")
    print(BAR)
    print(f"  {'pattern':14}{'model calls':>12}{'tools':>7}   trajectory")
    print("  " + "-" * 74)
    for name in PATTERNS:
        r = run_pattern(name, goal, get_brain())
        print(f"  {name:14}{r.model_calls:>12}{len(r.tool_calls):>7}   "
              f"{' -> '.join(r.tool_calls) or '(none)'}")
    print("\n  Read the columns, not the names: plan_execute is a flat 2 model calls")
    print("  however long the plan, react grows with the number of steps, reflect")
    print("  roughly doubles react, and route adds one call to buy a smaller toolset.")


def show_pattern(name: str, ticket: str) -> None:
    goal = f"Triage ticket {ticket} and recommend the next step."
    print(BAR)
    print(f"  PATTERN  {name}\n  GOAL     {goal}")
    print(BAR)
    r = run_pattern(name, goal, get_brain(), verbose=True)
    print(f"\n  model calls : {r.model_calls}")
    print(f"  tools       : {' -> '.join(r.tool_calls) or '(none)'}")
    if r.plan:
        print(f"  plan        : {len(r.plan)} steps")
    if r.route:
        print(f"  route       : {r.route}")
    if r.critique:
        print(f"  critique    : {r.critique}")
    print(f"\n  ANSWER\n  {r.answer}")


def compare_retrieval() -> None:
    print(BAR)
    print("  KEYWORD OVERLAP (Lesson 2)  vs  CHUNK + BM25 + RERANK (Lesson 5)")
    print(BAR)
    for q in ["account email change", "duplicate charge refund",
              "checkout 502 error", "quantum tunnelling in badgers"]:
        old = search_kb_keyword(q, 2)
        new = search_kb(q, 2)
        print(f"\n  query: {q!r}")
        print(f"    keyword   : {[a['id'] for a in old['articles']] or old['note']}")
        print(f"    retrieval : "
              f"{[(a['chunk_id'], a['score']) for a in new['articles']] or new['note']}")
        for a in new["articles"][:1]:
            print(f"      why: {a['why']}")
    print("\n  The last query matters most: keyword search and retrieval both return")
    print("  nothing, and 'nothing' is a useful answer. An agent that receives no")
    print("  policy can escalate; one handed the least-bad paragraph will cite it.")


def show_memory(ticket: str) -> None:
    print(BAR)
    print(f"  CONTEXT BUDGET AND COMPACTION  ({ticket})")
    print(BAR)
    state = RunState(goal=f"Triage {ticket}", ticket_id=ticket, token_budget=300)
    history = ConversationHistory()
    history.add(Message("system", "You are a support-ticket triage agent." * 3))
    history.add(Message("user", f"Triage ticket {ticket}."))

    import json

    from agent.tools import execute

    for tool, args in [
        ("read_ticket", {"ticket_id": ticket}),
        ("lookup_order", {"order_id": "ORD-5581"}),
        ("search_kb", {"query": "billing refund", "limit": 2}),
    ]:
        result = execute(tool, args)
        state.step += 1
        state.record(tool, result)
        # json.dumps, not str(): the loop serialises tool results as JSON, and
        # a Python dict repr uses single quotes that json.loads cannot read --
        # which silently defeats the compaction summariser.
        blob = json.dumps(result, default=str)
        state.spend(estimate_tokens(blob))
        history.add(Message("assistant", f"Calling {tool}"))
        history.add(Message("tool", blob, tool_name=tool))
        flag = "OVER" if history.should_compact(state.token_budget) else "ok"
        print(f"  step {state.step}: +{estimate_tokens(blob):>4} tokens  "
              f"transcript={history.tokens():>5}  budget={state.token_budget}  [{flag}]")

    print(f"\n  state: {state.summary()}")
    if history.should_compact(state.token_budget):
        print(f"\n  {history.compact()}")
        state.compactions = history.compactions
        print("\n  transcript after compaction:")
        for m in history.messages:
            label = m.tool_name or m.role
            print(f"    {label:12} {m.content[:88].replace(chr(10), ' / ')}")

    print("\n  MEMORY (outlives the run) — prior tickets for this customer:")
    recall = recall_prior_tickets(ticket, limit=3)
    for t in recall.get("prior_tickets", []):
        print(f"    {t['ticket_id']}  {t['category']:10} {t['subject']}")
    print(f"    basis: {recall.get('basis')}")


def main(argv: list[str]) -> int:
    args = [a for a in argv if not a.startswith("--")]
    ticket = (args[0] if args else "TCK-1001").upper()

    if "--retrieval" in argv:
        compare_retrieval()
    elif "--memory" in argv:
        show_memory(ticket)
    elif "--pattern" in argv:
        name = argv[argv.index("--pattern") + 1]
        show_pattern(name, ticket)
    else:
        compare_patterns(ticket)
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
