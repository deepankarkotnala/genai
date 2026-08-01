"""
Milestone entry point for Lessons 10-11.

    cd teach-agents/project
    python steps/l10_evaluated.py --eval        run the golden set
    python steps/l10_evaluated.py --regress     break it on purpose, watch evals fail
    python steps/l10_evaluated.py --trace       a healthy run as a span tree
    python steps/l10_evaluated.py --debug       a broken run: find the fault from the trace
    python steps/l10_evaluated.py --cost        token accounting and model routing
"""

from __future__ import annotations

import pathlib
import subprocess
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent))

from agent.control import run_controlled  # noqa: E402
from agent.faults import FaultPlan, set_faults  # noqa: E402
from agent.trace import PRICES, Trace, cost_of  # noqa: E402
from brain import get_brain  # noqa: E402

ROOT = pathlib.Path(__file__).resolve().parent.parent
BAR = "=" * 78
GOAL = "Triage ticket TCK-1001 and recommend the next step."


def run_eval() -> int:
    return subprocess.run([sys.executable, str(ROOT / "evals" / "run_evals.py")]).returncode


def regress() -> None:
    """
    Break something real, watch the suite catch it, put it back.

    This is how you find out whether your eval suite is load-bearing or
    decorative -- and the second regression below was NOT caught the first time
    it was tried, which is why the golden set has a case pinning it now.
    """
    print(BAR); print("  REGRESSION DRILL — does the suite actually catch anything?"); print(BAR)
    experiments = [
        ("agent/tools.py", "    dry_run: bool = True,", "    dry_run: bool = False,",
         "the refund tool's safe default is removed"),
        ("brain.py", "incomplete = [name for name, res in observed.items()",
         "incomplete = [] and [name for name, res in observed.items()",
         "the partial-data escalation rule is deleted"),
    ]
    for rel, old, new, description in experiments:
        path = ROOT / rel
        original = path.read_text(encoding="utf-8")
        assert old in original, f"anchor not found in {rel}"
        path.write_text(original.replace(old, new), encoding="utf-8")
        proc = subprocess.run([sys.executable, str(ROOT / "evals" / "run_evals.py")],
                              capture_output=True, text=True)
        path.write_text(original, encoding="utf-8")

        caught = proc.returncode != 0
        print(f"\n  Broke: {description}")
        print(f"    suite exit code : {proc.returncode}  ->  {'CAUGHT' if caught else 'MISSED'}")
        for line in proc.stdout.splitlines():
            if "FAIL" in line or line.strip().startswith("NO "):
                print(f"    {line.strip()}")
    print("\n  Restored. A regression the suite cannot see is a regression you ship.")


def show_trace() -> None:
    print(BAR); print("  TRACE — one healthy run"); print(BAR)
    t = Trace(goal=GOAL)
    run_controlled(GOAL, get_brain(), trace=t)
    print(t.render())
    path = t.save()
    print(f"\n  saved: {path.relative_to(ROOT)}")


def debug_trace() -> None:
    print(BAR); print("  DEBUG — a run that went wrong. Find the fault from the trace alone."); print(BAR)
    set_faults(FaultPlan(unavailable={"search_kb"}, slow={"lookup_order": 0.15},
                         flaky={"read_ticket": 1}))
    t = Trace(goal=GOAL + "  [degraded]")
    result = run_controlled(GOAL, get_brain(), trace=t)
    set_faults(None)
    print(t.render())
    print(f"\n  outcome      : {result.outcome}")
    print(f"  slowest spans: {[(s.name, f'{s.duration_ms}ms') for s in t.slowest(3)]}")
    print(f"  failed spans : {[(s.name, s.error_class) for s in t.errors()]}")
    print("\n  Read it in this order: which span failed, what did it cost in time,")
    print("  and what did the agent do next. The trace answers all three; a log line")
    print("  saying 'error' answers none of them.")


def show_cost() -> None:
    print(BAR); print("  COST — accounting, then routing"); print(BAR)
    t = Trace(goal=GOAL)
    run_controlled(GOAL, get_brain(), trace=t)
    model_spans = [s for s in t.spans if s.kind == "model"]
    tok_in = sum(s.prompt_tokens for s in model_spans)
    tok_out = sum(s.completion_tokens for s in model_spans)

    print(f"\n  This run: {len(model_spans)} model calls, {tok_in} in + {tok_out} out")
    print(f"\n  {'model':10}{'$/run':>12}{'$/10k tickets':>18}")
    print("  " + "-" * 40)
    for model in PRICES:
        per_run = cost_of(model, tok_in, tok_out)
        print(f"  {model:10}{per_run:>12.5f}{per_run * 10_000:>18,.2f}")

    small = cost_of("small", tok_in, tok_out)
    large = cost_of("large", tok_in, tok_out)
    if small:
        print(f"\n  large is {large / small:.0f}x the price of small.")
    print("  Routing exploits that: gather facts with the cheap model, and spend the")
    print("  expensive one only on the step where judgement actually matters.")
    print("\n  Note the prompt tokens climbing across the run -- 100, 142, 165, 267, 326.")
    print("  Every step re-sends the whole transcript, so cost is quadratic in steps,")
    print("  not linear. That is the real argument for fewer, coarser tools.")


def main(argv: list[str]) -> int:
    if "--regress" in argv:
        regress()
    elif "--trace" in argv:
        show_trace()
    elif "--debug" in argv:
        debug_trace()
    elif "--cost" in argv:
        show_cost()
    else:
        return run_eval()
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
