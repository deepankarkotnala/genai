"""
Milestone entry point for Lessons 12-13.

    cd teach-agents/project
    python steps/l13_protocols.py --mcp        MCP handshake, discovery, the withheld tool
    python steps/l13_protocols.py --a2a        delegate to a peer, watch the task lifecycle
    python steps/l13_protocols.py --compare    supervisor vs single agent, measured
    python steps/l13_protocols.py --boundary   what a peer cannot do, and why
"""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from a2a_demo.agents import RefundSpecialist, TriageAgent  # noqa: E402
from agent.approval import reset_state  # noqa: E402
from agent.supervisor import SPECIALISTS, compare  # noqa: E402
from agent.tools import REGISTRY  # noqa: E402
from brain import StubBrain  # noqa: E402
from mcp_server.server import EXPOSED_TOOLS, Client, Server  # noqa: E402

BAR = "=" * 78


def show_mcp() -> None:
    print(BAR); print("  MCP — host, client, server"); print(BAR)
    client = Client(Server())

    init = client.initialize()["result"]
    print(f"\n  1 · initialize (the handshake)")
    print(f"      server       {init['serverInfo']['name']} v{init['serverInfo']['version']}")
    print(f"      protocol     {init['protocolVersion']}")
    print(f"      capabilities {list(init['capabilities'])}")
    print(f"      instructions {init['instructions'][:64]}...")

    print(f"\n  2 · tools/list (capability discovery)")
    for tool in client.list_tools():
        print(f"      {tool['name']:16} {tool['description'][:58]}...")

    print(f"\n  3 · the boundary")
    print(f"      in REGISTRY : {sorted(REGISTRY)}")
    print(f"      exposed     : {sorted(EXPOSED_TOOLS)}")
    print(f"      WITHHELD    : {sorted(set(REGISTRY) - EXPOSED_TOOLS)}")

    print(f"\n  4 · tools/call — permitted")
    ok = client.call_tool("read_ticket", {"ticket_id": "TCK-1001"})["result"]
    print(f"      isError={ok['isError']}  {ok['content'][0]['text'][:62]}...")

    print(f"\n  5 · tools/call — withheld")
    bad = client.call_tool("issue_refund",
                           {"order_id": "ORD-5581", "amount": 120.0,
                            "reason": "duplicate charge"})["error"]
    print(f"      {bad['code']}  {bad['message']}")
    print(f"      available: {bad['data']['available']}")
    print("\n  Note the message does not admit the tool exists elsewhere. 'Not exposed'")
    print("  and 'does not exist' read identically, so the error is not a discovery oracle.")


def show_a2a() -> None:
    reset_state()
    print(BAR); print("  A2A — delegating to a peer agent"); print(BAR)
    triage = TriageAgent(RefundSpecialist())

    card = triage.discover()
    print(f"\n  1 · Agent Card (published capability metadata)")
    print(f"      name       {card['name']} v{card['version']}")
    print(f"      auth       {card['authentication']['schemes']}")
    for skill in card["skills"]:
        print(f"      skill      {skill['id']}: {skill['description']}")
        print(f"      accepts    {skill['accepts']}")
        print(f"      WILL NOT   {skill['willNot']}")

    print(f"\n  2 · delegate, without stating the amount")
    task, notes = triage.delegate_refund("ORD-5590", "customer returned the annual plan")
    for note in notes:
        print(f"      {note}")

    print(f"\n  3 · task lifecycle")
    print(f"      final state {task.state}")
    print(f"      history     {' -> '.join(task.history)}")
    print("      The input_required state is what makes this more than a function")
    print("      call: the peer stopped, asked, and the task resumed.")

    print(f"\n  4 · artifact (the durable output, not the chat)")
    for artifact in task.artifacts:
        print(f"      {artifact.name} ({artifact.kind})")
        for key, value in artifact.content.items():
            print(f"        {key:26} {value}")
    reset_state()


def show_boundary() -> None:
    reset_state()
    print(BAR); print("  THE BOUNDARY — delegation moves work, never authority"); print(BAR)
    triage = TriageAgent(RefundSpecialist())
    task, _ = triage.delegate_refund("ORD-5590", "returned annual plan", amount=480.00)
    content = task.artifacts[0].content

    print(f"\n  policy allows the refund        : {content['policy_allows']}")
    print(f"  the peer's tool call returned   : {content['tool_status']}")
    print(f"  did any money move              : {content['refunded']}")
    print(f"  idempotency key already derived : {content['idempotency_key']}")
    print(f"  next step                       : {content['next_step']}")

    print("\n  Three reasons the peer cannot pay, in order of strength:")
    print("    1 it called issue_refund in dry-run mode, which cannot move money")
    print("    2 it holds no approval token and has no way to obtain one")
    print("    3 its Agent Card publishes that it will not -- a contract, checked")
    print("\n  An agent that could grant itself permission by asking another agent")
    print("  has no permissions at all. Delegation moves work, never authority.")
    reset_state()


def show_compare() -> None:
    print(BAR); print("  MULTI-AGENT vs SINGLE — the measurement, not the opinion"); print(BAR)
    print(f"\n  specialist tool sets:")
    for route, tools in SPECIALISTS.items():
        print(f"      {route:10} {len(tools)} tools  {tools}")

    goals = [
        "Triage ticket TCK-1001 and recommend the next step.",
        "Triage ticket TCK-1004 about a refund.",
        "Triage ticket TCK-1003.",
    ]
    print(f"\n  {'goal':40}{'':4}{'outcome':11}{'calls':>7}{'tokens':>9}")
    print("  " + "-" * 74)
    deltas = []
    for goal in goals:
        reset_state()
        result = compare(goal, StubBrain)
        label = goal[:38]
        single, split = result["single"], result["supervised"]
        print(f"  {label:40}{'single':>4}  {single['outcome']:11}"
              f"{single['model_calls']:>7}{single['tokens']:>9}")
        print(f"  {'':40}{'split':>4}  {split['outcome']:11}"
              f"{split['model_calls']:>7}{split['tokens']:>9}   route={split['route']}")
        deltas.append((split["model_calls"] - single["model_calls"],
                       split["tokens"] - single["tokens"]))
    reset_state()

    avg_calls = sum(d[0] for d in deltas) / len(deltas)
    avg_tokens = sum(d[1] for d in deltas) / len(deltas)
    print(f"\n  average cost of the split: +{avg_calls:.1f} model calls, "
          f"+{avg_tokens:.0f} tokens per ticket")
    print("  Same outcomes. On this workload the supervisor is strictly worse, and")
    print("  saying so is the point: multi-agent is a cost you justify, not a default.")
    print("\n  It would start to pay when the specialists need genuinely different")
    print("  tool sets or permissions, or ship on different schedules.")


def main(argv: list[str]) -> int:
    if "--a2a" in argv:
        show_a2a()
    elif "--compare" in argv:
        show_compare()
    elif "--boundary" in argv:
        show_boundary()
    else:
        show_mcp()
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
