"""
Milestone entry point for Lesson 2 (and 3): run the agent and watch the loop.

This file is thin on purpose. It imports the shared implementation in ../agent/
rather than containing its own copy, so the six milestone files never drift
apart from each other or from the lessons.

Run it from the project directory:

    cd teach-agents/project
    python steps/l02_loop.py
    python steps/l02_loop.py TCK-1003
    python steps/l02_loop.py TCK-1001 --max-steps 2

No API key. No network. The default backend is the deterministic stub.
"""

from __future__ import annotations

import sys
from pathlib import Path

# Allow `python steps/l02_loop.py` from the project directory without an install.
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from agent import run  # noqa: E402
from brain import get_brain  # noqa: E402


def main(argv: list[str]) -> int:
    ticket_id = "TCK-1001"
    max_steps = 6

    args = [a for a in argv if not a.startswith("--")]
    if args:
        ticket_id = args[0].upper()
    if "--max-steps" in argv:
        max_steps = int(argv[argv.index("--max-steps") + 1])

    brain = get_brain()  # AGENT_BRAIN env var; defaults to "stub"
    goal = f"Triage ticket {ticket_id} and recommend the next step."

    print("=" * 78)
    print(f"  GOAL     {goal}")
    print(f"  BACKEND  {brain.name} / {getattr(brain, 'model', '?')}")
    print(f"  LIMIT    max_steps={max_steps}")
    print("=" * 78)

    result = run(goal, brain, max_steps=max_steps, verbose=True)

    print("\n" + "-" * 78)
    print(f"  stopped_because : {result.stopped_because}")
    print(f"  tools called    : {' -> '.join(result.tool_calls) or '(none)'}")
    print(f"  steps           : {len(result.steps)}")
    print(f"  model time      : {result.total_latency_ms} ms")
    print("-" * 78)
    return 0 if result.stopped_because == "final_answer" else 1


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
