"""
Tests for the reliability controller (Lesson 7) and the refund path (Lesson 8).

Sleeps are kept tiny deliberately: a test suite that takes ten seconds to prove
a backoff works will be skipped by the person who most needs it to pass.
"""

import pytest

from agent.approval import (
    grant_approval, idempotency_key, read_audit, reset_state,
)
from agent.control import (
    BLOCKED, ESCALATED, EXHAUSTED, RESOLVED, guarded_execute, run_controlled,
)
from agent.faults import FaultPlan, set_faults
from agent.policy import check_refund
from agent.tools import execute
from brain import BrainResult, StubBrain, ToolCall

GOAL = "Triage ticket TCK-1001 and recommend the next step."


@pytest.fixture(autouse=True)
def _clean():
    set_faults(None)
    reset_state()
    yield
    set_faults(None)
    reset_state()


# ==========================================================================
# Lesson 7 · reliability
# ==========================================================================
def test_a_healthy_run_resolves():
    r = run_controlled(GOAL, StubBrain())
    assert r.outcome == RESOLVED
    assert not r.needs_human


def test_every_outcome_is_terminal_and_tells_the_caller_what_happened():
    """The guarantee: never silence, never a bare exception."""
    for plan, kw in [(None, {}), (FaultPlan(unavailable={"search_kb"}), {}), (None, {"max_steps": 2})]:
        set_faults(plan)
        r = run_controlled(GOAL, StubBrain(), **kw)
        assert r.outcome in {RESOLVED, ESCALATED, EXHAUSTED, BLOCKED}
        assert r.answer


def test_a_flaky_tool_is_retried_with_backoff_and_then_succeeds():
    set_faults(FaultPlan(flaky={"lookup_order": 2}))
    r = run_controlled(GOAL, StubBrain())
    assert r.outcome == RESOLVED
    assert any("attempt 1 failed" in i for i in r.interventions)
    assert any("succeeded on attempt 3" in i for i in r.interventions)


def test_retries_are_bounded():
    set_faults(FaultPlan(unavailable={"search_kb"}))
    r = run_controlled(GOAL, StubBrain())
    assert any("failed all 3 attempts" in i for i in r.interventions)


def test_an_unavailable_tool_leads_to_escalation_not_a_guess():
    set_faults(FaultPlan(unavailable={"search_kb"}))
    r = run_controlled(GOAL, StubBrain())
    assert r.outcome == ESCALATED
    assert "search_kb" in r.answer


def test_a_timeout_is_not_retried():
    """
    Retrying a timeout usually makes things worse: the slow thing is still slow
    and now two of them are running.
    """
    set_faults(FaultPlan(slow={"lookup_order": 0.4}))
    result, notes = guarded_execute("lookup_order", {"order_id": "ORD-5581"}, timeout_s=0.05)
    assert result["error"] == "timeout"
    assert any("not retried" in n for n in notes)
    assert "unknown" in result["message"]  # honest about the ambiguity


def test_a_malformed_call_is_not_retried_either():
    """A bad argument cannot succeed on attempt two."""
    result, notes = guarded_execute("read_ticket", {"ticket": "TCK-1001"})
    assert result["error"] == "invalid_call"
    assert not any("retry" in n for n in notes)


def test_partial_data_is_surfaced_and_acted_on():
    """
    The dangerous failure: nothing raised, shape correct, a needed field absent.
    The controller flags it; the agent refuses to draft on it.
    """
    set_faults(FaultPlan(partial={"lookup_order"}))
    r = run_controlled(GOAL, StubBrain())
    assert any("incomplete data" in i for i in r.interventions)
    assert r.outcome == ESCALATED
    assert "refund_eligible=None" not in r.answer


def test_identical_repeats_are_blocked():
    class Stuck:
        name, model = "stuck", "test"

        def decide(self, messages, tools):
            return BrainResult(tool_call=ToolCall("read_ticket", {"ticket_id": "TCK-1001"}),
                               final_text=None, backend=self.name, model=self.model,
                               latency_ms=0)

    r = run_controlled(GOAL, Stuck(), max_steps=20)
    assert r.outcome == BLOCKED
    assert any("blocked repeat" in i for i in r.interventions)
    assert len(r.steps) < 20, "the repeat control must fire before the step budget"


def test_oscillation_between_two_calls_is_blocked():
    class Oscillating:
        name, model = "osc", "test"

        def __init__(self):
            self.n = 0

        def decide(self, messages, tools):
            self.n += 1
            tid = "TCK-1001" if self.n % 2 else "TCK-1002"
            return BrainResult(tool_call=ToolCall("read_ticket", {"ticket_id": tid}),
                               final_text=None, backend=self.name, model=self.model,
                               latency_ms=0)

    r = run_controlled(GOAL, Oscillating(), max_steps=20)
    assert r.outcome == BLOCKED
    assert any("oscillation" in i for i in r.interventions)


def test_budget_exhaustion_reports_what_was_established():
    """A human picking this up should not have to redo the agent's work."""
    r = run_controlled(GOAL, StubBrain(), max_steps=2)
    assert r.outcome == EXHAUSTED
    assert "Established so far" in r.answer
    assert "read_ticket" in r.answer


def test_escalate_always_succeeds():
    """It is the fallback for every other failure, so it cannot be fallible."""
    out = execute("escalate", {"ticket_id": "TCK-9999",
                               "reason": "nothing about this ticket could be read"})
    assert out["status"] == "escalated"


# ==========================================================================
# Lesson 8 · irreversible actions
# ==========================================================================
def test_policy_collects_every_reason_rather_than_the_first():
    order = {"order_id": "ORD-X", "amount": 10.0, "status": "processing",
             "days_since_purchase": 99, "refund_eligible": False, "already_refunded": True}
    d = check_refund(order, 50.0)
    assert not d.allowed
    assert len(d.reasons) >= 4


def test_missing_order_data_is_a_refusal_not_a_default():
    """Lesson 7's partial-failure problem, applied to money."""
    d = check_refund({"order_id": "ORD-X", "amount": 10.0}, 5.0)
    assert not d.allowed
    assert "incomplete" in d.reasons[0]


def test_the_same_refund_twice_pays_once():
    """The centrepiece test of the whole course."""
    args = {"order_id": "ORD-5581", "amount": 120.0, "reason": "duplicate charge",
            "dry_run": False}
    token = grant_approval("ORD-5581", 120.0, "alice@support").token
    first = execute("issue_refund", {**args, "approval_token": token})
    second = execute("issue_refund", {**args, "approval_token": token})

    assert first["status"] == "refunded" and first["duplicate"] is False
    assert second["duplicate"] is True
    assert second["refunded"] is True          # the state holds -- not an error
    executed = [r for r in read_audit(50) if r["outcome"] == "executed"]
    assert len(executed) == 1, "exactly one payment must appear in the audit log"


def test_idempotency_keys_are_derived_not_random():
    a = idempotency_key("ORD-5581", 120.0, "duplicate charge")
    b = idempotency_key("ord-5581", 120.00, "Duplicate Charge")
    assert a == b, "the same request must always produce the same key"
    assert a != idempotency_key("ORD-5581", 120.0, "returned item")


def test_an_approval_token_is_bound_to_one_order_and_amount():
    token = grant_approval("ORD-5590", 480.0, "alice@support").token
    wrong_amount = execute("issue_refund", {"order_id": "ORD-5590", "amount": 100.0,
                                            "reason": "return", "dry_run": False,
                                            "approval_token": token})
    assert wrong_amount["error"] == "approval_invalid"


def test_an_approval_token_cannot_be_replayed():
    token = grant_approval("ORD-5581", 120.0, "alice@support").token
    args = {"order_id": "ORD-5581", "amount": 120.0, "dry_run": False,
            "approval_token": token}
    assert execute("issue_refund", {**args, "reason": "duplicate charge"})["refunded"] is True
    # A different reason gives a different idempotency key, so this is a genuinely
    # new refund attempt -- and the token must not authorise it.
    replay = execute("issue_refund", {**args, "reason": "second unrelated refund"})
    assert replay["error"] == "approval_invalid"
    assert "already been used" in replay["message"]


def test_policy_is_checked_before_a_human_is_asked():
    """Do not ask a reviewer to approve something policy forbids."""
    out = execute("issue_refund", {"order_id": "ORD-5555", "amount": 49.0,
                                   "reason": "too old", "dry_run": False})
    assert out["error"] == "policy_denied"
    assert "approval" not in out["error"]


def test_every_attempt_is_audited_including_refusals():
    """A log of only successes cannot tell you the agent tried forty times."""
    execute("issue_refund", {"order_id": "ORD-9999", "amount": 10.0,
                             "reason": "order does not exist"})
    execute("issue_refund", {"order_id": "ORD-5555", "amount": 49.0, "reason": "too old"})
    outcomes = [r["outcome"] for r in read_audit(50)]
    assert "not_found" in outcomes
    assert "policy_denied" in outcomes


def test_a_timeout_on_the_refund_call_is_reported_as_unknown():
    """
    The ambiguous outcome. Whether the payment happened is genuinely unknown,
    and the idempotency key is what makes the follow-up safe.
    """
    set_faults(FaultPlan(slow={"issue_refund": 0.4}))
    result, _ = guarded_execute("issue_refund",
                                {"order_id": "ORD-5581", "amount": 120.0,
                                 "reason": "duplicate charge"}, timeout_s=0.05)
    assert result["error"] == "timeout"
    assert "unknown" in result["message"].lower()
