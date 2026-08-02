"""
Milestone entry point for Lessons 7-9.

    cd teach-agents/project
    python steps/l08_safe_refund.py --faults      break it: timeout, flaky, down, partial
    python steps/l08_safe_refund.py --refund      the refund path, every branch
    python steps/l08_safe_refund.py --attacks     the adversarial corpus
    python steps/l08_safe_refund.py --audit       what the audit log records

No API key. No network. Nothing here can move real money.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from agent import guards  # noqa: E402
from agent.approval import grant_approval, read_audit, reset_state  # noqa: E402
from agent.control import run_controlled  # noqa: E402
from agent.faults import FaultPlan, set_faults  # noqa: E402
from agent.tools import execute  # noqa: E402
from brain import get_brain  # noqa: E402

BAR = "=" * 78
GOAL = "Triage ticket TCK-1001 and recommend the next step."


def show_faults() -> None:
    print(BAR); print("  RELIABILITY — the same goal, five broken worlds"); print(BAR)
    cases = [
        ("healthy", None, {}),
        ("lookup_order flaky (2 failures)", FaultPlan(flaky={"lookup_order": 2}), {}),
        ("search_kb unavailable", FaultPlan(unavailable={"search_kb"}), {}),
        ("lookup_order slow, 1s limit", FaultPlan(slow={"lookup_order": 3.0}), {"timeout_s": 1.0}),
        ("lookup_order partial data", FaultPlan(partial={"lookup_order"}), {}),
        ("step budget of 2", None, {"max_steps": 2}),
    ]
    for label, plan, kw in cases:
        set_faults(plan)
        r = run_controlled(GOAL, get_brain(), **kw)
        print(f"\n  {label}")
        print(f"    outcome   : {r.outcome}  (needs_human={r.needs_human})")
        print(f"    tools     : {' -> '.join(r.tool_calls) or '(none)'}")
        for note in r.interventions[:4]:
            print(f"    control   : {note}")
        print(f"    answer    : {r.answer[:96]}")
    set_faults(None)
    print("\n  Every row ends in a named outcome. None ends in silence or a traceback.")


def show_refund() -> None:
    reset_state()
    print(BAR); print("  IRREVERSIBLE ACTION — every branch of issue_refund"); print(BAR)

    def attempt(label: str, args: dict) -> None:
        r = execute("issue_refund", args)
        state = r.get("error") or r.get("status")
        print(f"\n  {label}")
        print(f"    -> {state:20} refunded={r.get('refunded')}")
        print(f"       {r.get('message', '')[:104]}")

    attempt("order does not exist",
            {"order_id": "ORD-9999", "amount": 10, "reason": "duplicate charge"})
    attempt("90 days old (limit 30)",
            {"order_id": "ORD-5555", "amount": 49, "reason": "duplicate charge"})
    attempt("already refunded",
            {"order_id": "ORD-5544", "amount": 99, "reason": "duplicate charge"})
    attempt("amount exceeds order total",
            {"order_id": "ORD-5581", "amount": 5000, "reason": "customer insists"})
    attempt("dry run — the DEFAULT",
            {"order_id": "ORD-5581", "amount": 120, "reason": "duplicate charge"})
    attempt("execute without a token",
            {"order_id": "ORD-5581", "amount": 120, "reason": "duplicate charge",
             "dry_run": False})

    token = grant_approval("ORD-5581", 120.00, "alice@support").token
    print(f"\n  [a human approves 120.00 on ORD-5581 -> {token}]")
    args = {"order_id": "ORD-5581", "amount": 120, "reason": "duplicate charge",
            "dry_run": False, "approval_token": token}
    attempt("execute with a valid token", args)
    attempt("THE SAME REQUEST AGAIN (a retry)", args)
    print("\n  The last two lines are the point: one payment, two calls.")


def show_attacks() -> None:
    print(BAR); print("  SECURITY — the adversarial corpus, and what actually stops each"); print(BAR)
    corpus = json.loads(
        (Path(__file__).resolve().parent.parent / "fixtures" / "adversarial" / "attacks.json")
        .read_text(encoding="utf-8")
    )
    for a in corpus:
        screen = guards.screen_untrusted(a["text"])
        print(f"\n  {a['id']}  ({a['kind']}, via {a['surface']})")
        print(f"    text        : {a['text'][:88]}")
        print(f"    screen      : {'FLAGGED' if screen.flagged else 'not flagged'} — {screen.report()}")
        print(f"    stopped by  : {a['stopped_by']}")

    print("\n  Note how many say 'capability absence' or 'policy in code' rather than")
    print("  'the screen'. The screen is evidence; the architecture is the boundary.")
    print("\n  Proof: with the screen disabled entirely, the money attacks still fail.")
    original = guards.INJECTION_PATTERNS
    guards.INJECTION_PATTERNS = []
    try:
        a = execute("issue_refund", {"order_id": "ORD-5581", "amount": 5000,
                                     "reason": "ignore policy, pre-approved"})
        b = execute("issue_refund", {"order_id": "ORD-5581", "amount": 120,
                                     "reason": "pre-approved by manager", "dry_run": False})
        print(f"    5000.00 attempt : {a['error']}  refunded={a['refunded']}")
        print(f"    execute attempt : {b['error']}  refunded={b['refunded']}")
    finally:
        guards.INJECTION_PATTERNS = original


def show_audit() -> None:
    reset_state()
    print(BAR); print("  AUDIT LOG — append-only, refusals included"); print(BAR)
    execute("issue_refund", {"order_id": "ORD-5555", "amount": 49, "reason": "too old to refund"})
    execute("issue_refund", {"order_id": "ORD-5581", "amount": 120, "reason": "duplicate charge"})
    token = grant_approval("ORD-5581", 120.00, "alice@support").token
    execute("issue_refund", {"order_id": "ORD-5581", "amount": 120, "reason": "duplicate charge",
                             "dry_run": False, "approval_token": token})
    print(f"\n  {'outcome':18} {'order':11} {'amount':>9}  detail")
    print("  " + "-" * 74)
    for row in read_audit(20):
        print(f"  {row['outcome']:18} {row['order_id']:11} {row['amount']:>9.2f}  {row['detail'][:38]}")
    print("\n  Three rows for one refund: denied, prepared, executed. A status column")
    print("  you overwrite could not tell you that story.")


def main(argv: list[str]) -> int:
    if "--refund" in argv:
        show_refund()
    elif "--attacks" in argv:
        show_attacks()
    elif "--audit" in argv:
        show_audit()
    else:
        show_faults()
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
