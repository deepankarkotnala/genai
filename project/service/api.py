"""
service/api.py — the agent as a service.

Lesson 14. Turning the agent into an HTTP service forces four decisions that an
in-process loop lets you avoid.

1 · STATELESS SERVICE, STATEFUL RUN
    Any process can serve any request, because run state lives in the store, not
    in a dict on this instance. That is what makes horizontal scaling and
    crash recovery the same mechanism.

2 · THE APPROVAL GATE IS A SEPARATE REQUEST
    A refund pauses the run and returns 202 with a `run_id`. A human approves
    via a different endpoint, possibly hours later, possibly on a different
    process. The gate from Lesson 8 only becomes real here -- in-process it was
    a function argument; over HTTP it is a genuine human step.

3 · LONG RUNS DO NOT FIT A REQUEST
    A four-step agent takes seconds; a degraded one takes a minute. So the API
    is submit-and-poll rather than request-and-block.

4 · VERSIONS ARE PART OF THE CONTRACT
    Every response carries the prompt and toolset version that produced it, so
    an answer can be attributed to a configuration after the fact.

Run it:
    python -m uvicorn service.api:app --reload     (needs uvicorn)
The tests exercise the handlers directly, so no server is required.
"""

from __future__ import annotations

import sys
import uuid
from pathlib import Path
from typing import Any

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from agent.approval import grant_approval  # noqa: E402
from agent.control import run_controlled  # noqa: E402
from agent.persistence import (  # noqa: E402
    PROMPT_VERSION, TOOLSET_VERSION, RunRecord, RunStore, can_resume,
)
from agent.trace import Trace  # noqa: E402
from agent.tools import execute  # noqa: E402
from brain import get_brain  # noqa: E402

STORE = RunStore()

# A per-caller context, the same shape Lesson 9's `authorise()` expects. In a
# real service this comes from the authenticated principal, never from the
# request body -- a body-supplied identity is an invitation.
DEFAULT_CONTEXT = {
    "may_refund": True,
    "may_execute": False,      # this service prepares refunds; it never pays
    "refund_cap": 500.00,
}


# --------------------------------------------------------------------------
# Handlers, written as plain functions so they are testable without a server
# --------------------------------------------------------------------------
def submit_triage(goal: str, max_steps: int = 8) -> dict[str, Any]:
    """Start a run. Returns immediately with an id and the final state."""
    run_id = "run_" + uuid.uuid4().hex[:10]
    record = RunRecord(run_id=run_id, goal=goal, status="running")
    STORE.save(record)                       # durable BEFORE any work happens

    trace = Trace(run_id=run_id, goal=goal)
    result = run_controlled(goal, get_brain(), max_steps=max_steps, trace=trace)

    record.step = result.state.step if result.state else 0
    record.facts = dict(result.state.facts) if result.state else {}
    record.tools_attempted = list(result.state.tools_attempted) if result.state else []
    record.outcome = result.outcome
    record.answer = result.answer
    record.status = "done"
    STORE.save(record)

    return {
        "run_id": run_id,
        "status": record.status,
        "outcome": result.outcome,
        "answer": result.answer,
        "needs_human": result.needs_human,
        "tools": result.tool_calls,
        "tokens": trace.total_tokens,
        "cost_usd": trace.total_cost_usd,
        # Provenance on every response, so an answer can be traced to a config.
        "prompt_version": PROMPT_VERSION,
        "toolset_version": TOOLSET_VERSION,
    }


def get_run(run_id: str) -> dict[str, Any]:
    record = STORE.load(run_id)
    if record is None:
        return {"error": "not_found", "message": f"No run {run_id!r}."}
    return {
        "run_id": record.run_id, "status": record.status, "goal": record.goal,
        "step": record.step, "outcome": record.outcome, "answer": record.answer,
        "facts": sorted(record.facts), "prompt_version": record.prompt_version,
    }


def resume_run(run_id: str, max_steps: int = 8) -> dict[str, Any]:
    """
    Continue a run interrupted by a crash.

    Note it *restores* rather than replays. Re-running completed steps would
    re-execute anything with a side effect -- the double-payment problem again.
    """
    record = STORE.load(run_id)
    if record is None:
        return {"error": "not_found", "message": f"No run {run_id!r}."}

    ok, why = can_resume(record)
    if not ok:
        # Refusing is a feature. A run that cannot be resumed safely goes to a
        # human with its established facts, exactly like Lesson 7's escalation.
        record.status = "abandoned"
        STORE.save(record)
        return {"run_id": run_id, "status": "abandoned", "reason": why,
                "established": sorted(record.facts),
                "message": "Cannot resume safely; handed to a human with the facts so far."}

    result = run_controlled(record.goal, get_brain(), max_steps=max_steps)
    record.outcome, record.answer, record.status = result.outcome, result.answer, "done"
    STORE.save(record)
    return {"run_id": run_id, "status": "done", "outcome": result.outcome,
            "answer": result.answer, "resumed_from_step": record.step}


def request_refund(run_id: str, order_id: str, amount: float, reason: str) -> dict[str, Any]:
    """
    Prepare a refund. Never executes -- this returns the approval request.

    202-shaped on purpose: the work is accepted and *pending a human*, which is
    a different thing from succeeded or failed.
    """
    preview = execute("issue_refund", {"order_id": order_id, "amount": amount,
                                       "reason": reason})
    if preview.get("error"):
        return {"run_id": run_id, "status": "rejected", **preview}

    record = STORE.load(run_id)
    if record:
        record.status = "awaiting_approval"
        STORE.save(record)

    return {
        "run_id": run_id,
        "status": "awaiting_approval",
        "order_id": order_id,
        "amount": amount,
        "idempotency_key": preview.get("idempotency_key"),
        "policy": preview.get("policy"),
        "message": "Refund prepared. A human must approve before any payment.",
    }


def approve_refund(run_id: str, order_id: str, amount: float, approver: str,
                   reason: str) -> dict[str, Any]:
    """
    The human step. A different request, possibly hours later.

    The token is minted here -- in the service, by an authenticated human -- and
    never by the agent. That separation is the approval gate; everything else is
    paperwork around it.
    """
    approval = grant_approval(order_id, amount, approver)
    result = execute("issue_refund", {
        "order_id": order_id, "amount": amount, "reason": reason,
        "dry_run": False, "approval_token": approval.token,
    })
    record = STORE.load(run_id)
    if record:
        record.status = "done"
        STORE.save(record)
    return {"run_id": run_id, "approver": approver, **result}


# --------------------------------------------------------------------------
# The FastAPI surface. Thin: every handler above is independently testable.
# --------------------------------------------------------------------------
def build_app():  # pragma: no cover - exercised only when serving
    from fastapi import FastAPI
    from pydantic import BaseModel

    app = FastAPI(title="Support triage agent", version="1.0.0")

    class TriageIn(BaseModel):
        goal: str
        max_steps: int = 8

    class RefundIn(BaseModel):
        order_id: str
        amount: float
        reason: str

    class ApprovalIn(RefundIn):
        approver: str

    @app.get("/health")
    def health() -> dict[str, Any]:
        return {"ok": True, "prompt_version": PROMPT_VERSION,
                "toolset_version": TOOLSET_VERSION}

    @app.post("/triage", status_code=201)
    def triage(body: TriageIn) -> dict[str, Any]:
        return submit_triage(body.goal, body.max_steps)

    @app.get("/runs/{run_id}")
    def read_run(run_id: str) -> dict[str, Any]:
        return get_run(run_id)

    @app.post("/runs/{run_id}/resume")
    def resume(run_id: str) -> dict[str, Any]:
        return resume_run(run_id)

    @app.post("/runs/{run_id}/refund", status_code=202)
    def refund(run_id: str, body: RefundIn) -> dict[str, Any]:
        return request_refund(run_id, body.order_id, body.amount, body.reason)

    @app.post("/runs/{run_id}/refund/approve")
    def approve(run_id: str, body: ApprovalIn) -> dict[str, Any]:
        return approve_refund(run_id, body.order_id, body.amount,
                              body.approver, body.reason)

    return app


app = None
try:                                        # pragma: no cover
    app = build_app()
except ImportError:
    # FastAPI is optional. The handlers above -- and every test -- work without it.
    pass
