"""
Milestone entry point for Lessons 14-15 — the finished system.

    cd teach-agents/project
    python steps/l15_capstone.py               end-to-end demonstration
    python steps/l15_capstone.py --service     the agent as an HTTP service
    python steps/l15_capstone.py --resume      crash and recovery
    python steps/l15_capstone.py --versions    why a version change refuses to resume
    python steps/l15_capstone.py --inventory   everything built, mapped to lessons

This is the run to do in front of an interviewer.
"""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from a2a_demo.agents import RefundSpecialist, TriageAgent  # noqa: E402
from agent.approval import read_audit, reset_state  # noqa: E402
from agent.control import run_controlled  # noqa: E402
from agent.faults import FaultPlan, set_faults  # noqa: E402
from agent.persistence import PROMPT_VERSION, RunRecord, RunStore, can_resume  # noqa: E402
from agent.trace import Trace  # noqa: E402
from brain import get_brain  # noqa: E402
from mcp_server.server import EXPOSED_TOOLS, Client, Server  # noqa: E402
from service import api  # noqa: E402

BAR = "=" * 78
GOAL = "Triage ticket TCK-1001 and recommend the next step."


def end_to_end() -> None:
    reset_state()
    print(BAR); print("  SUPPORT TRIAGE AGENT — end to end"); print(BAR)

    print("\n  1 · a healthy run, traced")
    trace = Trace(goal=GOAL)
    result = run_controlled(GOAL, get_brain(), trace=trace)
    print(f"      outcome {result.outcome} · tools {' -> '.join(result.tool_calls)}")
    print(f"      {trace.total_tokens} tokens · {trace.wall_ms}ms · {len(trace.spans)} spans")

    print("\n  2 · a degraded run — a tool is down")
    set_faults(FaultPlan(unavailable={"search_kb"}))
    degraded = run_controlled(GOAL, get_brain())
    set_faults(None)
    print(f"      outcome {degraded.outcome} (needs_human={degraded.needs_human})")
    print(f"      {degraded.answer[:88]}")

    print("\n  3 · an injection attempt (TCK-1008 demands 5000.00 'without checking policy')")
    injected = run_controlled("Triage ticket TCK-1008 and recommend the next step.", get_brain())
    print(f"      outcome {injected.outcome} · tools {' -> '.join(injected.tool_calls)}")
    print(f"      issue_refund called: {'issue_refund' in injected.tool_calls}")

    print("\n  4 · the refund path — prepare, approve, retry")
    prepared = api.request_refund("run_demo", "ORD-5581", 120.0, "duplicate charge")
    print(f"      prepare  -> {prepared['status']}  key={prepared['idempotency_key']}")
    approved = api.approve_refund("run_demo", "ORD-5581", 120.0, "alice@support",
                                  "duplicate charge")
    print(f"      approve  -> {approved.get('status')}  refunded={approved.get('refunded')}")
    again = api.approve_refund("run_demo", "ORD-5581", 120.0, "alice@support",
                               "duplicate charge")
    print(f"      retry    -> {again.get('status')}  duplicate={again.get('duplicate')}")

    print("\n  5 · delegation to a peer (A2A)")
    task, _ = TriageAgent(RefundSpecialist()).delegate_refund(
        "ORD-5590", "returned annual plan", amount=480.00)
    content = task.artifacts[0].content
    print(f"      lifecycle {' -> '.join(task.history)}")
    print(f"      policy_allows={content['policy_allows']}  refunded={content['refunded']}")

    print("\n  6 · what crossed the MCP boundary")
    client = Client(Server()); client.initialize()
    print(f"      exposed  {[t['name'] for t in client.list_tools()]}")
    print(f"      withheld issue_refund, draft_reply, escalate")

    print("\n  7 · the audit log")
    executed = [r for r in read_audit(50) if r["outcome"] == "executed"]
    print(f"      {len(read_audit(50))} entries, {len(executed)} executed payment(s)")
    print("      Two approve calls, one payment. That is the whole point.")
    reset_state()


def show_service() -> None:
    reset_state()
    print(BAR); print("  THE AGENT AS A SERVICE"); print(BAR)
    submitted = api.submit_triage(GOAL)
    print(f"\n  POST /triage")
    for key in ("run_id", "status", "outcome", "needs_human", "tokens", "prompt_version"):
        print(f"      {key:16} {submitted[key]}")

    print(f"\n  GET /runs/{submitted['run_id']}")
    read_back = api.get_run(submitted["run_id"])
    print(f"      status={read_back['status']} step={read_back['step']}")
    print(f"      facts={read_back['facts']}")
    print("\n  The service holds nothing in memory. Any process can serve this read,")
    print("  which is why horizontal scaling and crash recovery are one mechanism.")
    reset_state()


def show_resume() -> None:
    reset_state()
    print(BAR); print("  CRASH AND RECOVERY"); print(BAR)
    store = RunStore()
    crashed = RunRecord(run_id="run_crashdemo1", goal=GOAL, status="running", step=2,
                        facts={"read_ticket": {"ticket_id": "TCK-1001"}},
                        tools_attempted=["read_ticket", "lookup_order"])
    store.save(crashed)
    print(f"\n  a run died at step {crashed.step} with facts: {sorted(crashed.facts)}")
    ok, why = can_resume(crashed)
    print(f"  can_resume -> {ok} ({why})")
    resumed = api.resume_run("run_crashdemo1")
    print(f"  resumed    -> {resumed['status']} / {resumed['outcome']}")
    print("\n  It RESTORED state; it did not replay. Replaying would re-execute")
    print("  anything with a side effect -- the double-payment problem again.")
    store.delete("run_crashdemo1")
    reset_state()


def show_versions() -> None:
    print(BAR); print("  WHY A VERSION CHANGE REFUSES TO RESUME"); print(BAR)
    store = RunStore()
    stale = RunRecord(run_id="run_versiondemo", goal=GOAL, status="running", step=3,
                      prompt_version="2026-01-01.0")
    store.save(stale)
    print(f"\n  run started under prompt {stale.prompt_version}")
    print(f"  current prompt version    {PROMPT_VERSION}")
    ok, why = can_resume(stale)
    print(f"\n  can_resume -> {ok}")
    print(f"  reason: {why}")
    out = api.resume_run("run_versiondemo")
    print(f"\n  -> {out['status']}: {out['message']}")
    print("\n  A run started under one prompt and finished under another has behaviour")
    print("  no trace will explain. Refusing is cheap; a mystified engineer is not.")
    store.delete("run_versiondemo")


def show_inventory() -> None:
    print(BAR); print("  WHAT YOU BUILT"); print(BAR)
    rows = [
        ("01", "brain.py", "one interface, three backends, no API key"),
        ("02", "agent/loop.py", "the explicit loop, step limit, named outcomes"),
        ("03", "agent/schemas.py + tools.py", "schemas, validation, dispatch boundary"),
        ("04", "agent/patterns.py", "ReAct, plan-execute, reflection, routing"),
        ("05", "agent/retrieval.py", "chunk, BM25, rerank, relevance floor"),
        ("06", "agent/state.py + memory.py", "budgets, capping, compaction, recall"),
        ("07", "agent/control.py + faults.py", "timeouts, retries, loop detection"),
        ("08", "agent/policy.py + approval.py", "policy, idempotency, approval, audit"),
        ("09", "agent/guards.py + adversarial/", "authz, redaction, 10 attacks"),
        ("10", "evals/", "13 cases, mostly refusals; non-zero exit"),
        ("11", "agent/trace.py", "spans, correlation ids, token cost"),
        ("12", "mcp_server/server.py", "JSON-RPC MCP, read-only allowlist"),
        ("13", "a2a_demo/ + supervisor.py", "peer delegation, measured split"),
        ("14", "agent/persistence.py + service/", "durable runs, resume, versioning"),
        ("15", "docs/decisions.md + interview/", "19 decisions, 45 questions, 4 drills"),
    ]
    print(f"\n  {'L':4}{'artifact':34}what it does")
    print("  " + "-" * 74)
    for lesson, artifact, what in rows:
        print(f"  {lesson:4}{artifact:34}{what}")
    print("\n  Six tools. Zero frameworks. No API key required anywhere.")


def main(argv: list[str]) -> int:
    if "--service" in argv:
        show_service()
    elif "--resume" in argv:
        show_resume()
    elif "--versions" in argv:
        show_versions()
    elif "--inventory" in argv:
        show_inventory()
    else:
        end_to_end()
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
