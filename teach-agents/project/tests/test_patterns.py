"""
Tests for the four reasoning patterns (Lesson 4).

The important ones are not "does it run" but "does each pattern have the
weakness the lesson claims it has". A test that pins a known trade-off is worth
more than a test that pins a happy path.
"""

import pytest

from agent.patterns import PATTERNS, ROUTES, run_pattern
from brain import StubBrain

GOAL = "Triage ticket TCK-1001 and recommend the next step."


def test_all_four_patterns_reach_an_answer():
    for name in PATTERNS:
        r = run_pattern(name, GOAL, StubBrain())
        assert r.answer, f"{name} produced no answer"
        assert r.pattern == name


def test_plan_execute_uses_two_model_calls_regardless_of_plan_length():
    """One planning call plus one synthesis call. That is the whole appeal."""
    r = run_pattern("plan_execute", GOAL, StubBrain())
    assert r.model_calls == 2
    assert len(r.plan) >= 3  # a plan longer than the number of model calls


def test_react_model_calls_scale_with_steps():
    r = run_pattern("react", GOAL, StubBrain())
    assert r.model_calls == len(r.steps)
    assert r.model_calls > 2


def test_reflect_costs_roughly_double_react():
    react = run_pattern("react", GOAL, StubBrain())
    reflect = run_pattern("reflect", GOAL, StubBrain())
    assert reflect.model_calls == react.model_calls + 2
    assert reflect.critique is not None


def test_route_adds_exactly_one_call_and_narrows_the_toolset():
    r = run_pattern("route", GOAL, StubBrain())
    assert r.route in ROUTES
    assert set(r.tool_calls) <= set(ROUTES[r.route])


def test_planning_blind_spot_plan_execute_calls_a_tool_it_did_not_need():
    """
    THE Lesson 4 test. TCK-1005 mentions no order.

    react reads the ticket, sees no order id, and skips lookup_order. Plan-and-
    execute committed to lookup_order before reading anything, so it calls it
    anyway and gets an error back. This is the cost of planning in ignorance,
    and it is measurable rather than a matter of opinion.
    """
    goal = "Triage ticket TCK-1005."
    react = run_pattern("react", goal, StubBrain())
    planned = run_pattern("plan_execute", goal, StubBrain())

    assert "lookup_order" not in react.tool_calls
    assert "lookup_order" in planned.tool_calls

    failed = [
        s for s in planned.steps
        if s.tool_name == "lookup_order" and (s.result or {}).get("error")
    ]
    assert failed, "the unnecessary lookup should have failed and been recorded"


def test_reflection_finds_a_real_gap_and_does_not_rubber_stamp():
    """A critique that always says 'looks good' is worse than no critique."""
    r = run_pattern("reflect", "Triage ticket TCK-1005.", StubBrain())
    assert "Gaps:" in (r.critique or "")


def test_critique_reads_the_draft_not_the_system_prompt():
    """
    Regression test. An earlier version scanned every message, so the system
    prompt's own words ("policy", "escalate") satisfied the checks and every
    critique came back clean.
    """
    r = run_pattern("reflect", "Triage ticket TCK-1005.", StubBrain())
    assert "No material gaps" not in (r.critique or "")


def test_routing_sends_a_billing_ticket_to_the_billing_route():
    r = run_pattern("route", "Triage ticket TCK-1001 about a duplicate charge.", StubBrain())
    assert r.route == "billing"


def test_unknown_pattern_is_rejected_with_the_valid_names():
    with pytest.raises(ValueError) as exc:
        run_pattern("chain_of_thought_ultra", GOAL, StubBrain())
    assert "react" in str(exc.value)


def test_every_pattern_is_reproducible():
    for name in PATTERNS:
        a = run_pattern(name, GOAL, StubBrain())
        b = run_pattern(name, GOAL, StubBrain())
        assert a.tool_calls == b.tool_calls
        assert a.answer == b.answer
