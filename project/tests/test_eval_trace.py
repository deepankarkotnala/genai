"""
Tests for the evaluation suite and the tracer (Lessons 10-11).

The eval suite is itself code, and code that grades other code needs its own
tests -- otherwise a broken grader reports everything green forever.
"""

import json
import subprocess
import sys
from pathlib import Path

import pytest

from agent.approval import reset_state
from agent.control import run_controlled
from agent.faults import FaultPlan, set_faults
from agent.trace import PRICES, Trace, cost_of
from brain import StubBrain

ROOT = Path(__file__).resolve().parent.parent
GOLDEN = json.loads((ROOT / "evals" / "golden_set.json").read_text(encoding="utf-8"))
GOAL = "Triage ticket TCK-1001 and recommend the next step."


@pytest.fixture(autouse=True)
def _clean():
    set_faults(None)
    reset_state()
    yield
    set_faults(None)
    reset_state()


# -- the golden set --------------------------------------------------------
def test_the_suite_passes():
    proc = subprocess.run([sys.executable, str(ROOT / "evals" / "run_evals.py")],
                          capture_output=True, text=True, cwd=ROOT)
    assert proc.returncode == 0, proc.stdout[-2000:]


def test_the_suite_exits_non_zero_on_failure():
    """It has to be usable in a build, which means the exit code must matter."""
    tools = ROOT / "agent" / "tools.py"
    original = tools.read_text(encoding="utf-8")
    tools.write_text(original.replace("    dry_run: bool = True,",
                                      "    dry_run: bool = False,"), encoding="utf-8")
    try:
        proc = subprocess.run([sys.executable, str(ROOT / "evals" / "run_evals.py")],
                              capture_output=True, text=True, cwd=ROOT)
        assert proc.returncode != 0, "removing a safety default must fail the suite"
    finally:
        tools.write_text(original, encoding="utf-8")


def test_happy_paths_are_a_minority_of_the_suite():
    """
    A golden set made of happy paths measures whether the demo still works.
    The cases that matter are refusals, failures and attacks.
    """
    kinds = [c["kind"] for c in GOLDEN["cases"]]
    assert kinds.count("happy") < len(kinds) / 2


def test_the_suite_covers_adversarial_and_unsafe_trajectories():
    kinds = {c["kind"] for c in GOLDEN["cases"]}
    assert {"adversarial", "unsafe_trajectory", "graceful_failure"} <= kinds


def test_every_case_states_an_expectation():
    for case in GOLDEN["cases"]:
        keys = set(case)
        assert keys & {"expect_outcome", "expect_error", "expect_status",
                       "must_not_call", "must_not_refund", "forbidden_outcomes"}, \
            f"{case['id']} asserts nothing"


def test_trajectory_checks_exist_not_just_outcome_checks():
    """`must_not_call` is how a run fails despite a correct-looking answer."""
    assert any("must_not_call" in c for c in GOLDEN["cases"])


# -- the tracer ------------------------------------------------------------
def test_a_traced_run_records_one_span_per_model_and_tool_call():
    t = Trace(goal=GOAL)
    r = run_controlled(GOAL, StubBrain(), trace=t)
    model_spans = [s for s in t.spans if s.kind == "model"]
    tool_spans = [s for s in t.spans if s.kind == "tool"]
    assert len(tool_spans) == len(r.tool_calls)
    assert len(model_spans) == len(r.steps)


def test_every_span_carries_the_run_id():
    t = Trace(goal=GOAL)
    run_controlled(GOAL, StubBrain(), trace=t)
    assert all(s.run_id == t.run_id for s in t.spans)
    assert t.run_id.startswith("r_")


def test_a_failing_tool_marks_its_span_not_the_whole_run():
    set_faults(FaultPlan(unavailable={"search_kb"}))
    t = Trace(goal=GOAL)
    run_controlled(GOAL, StubBrain(), trace=t)
    failed = t.errors()
    assert len(failed) == 1
    assert failed[0].name == "tool:search_kb"
    assert failed[0].error_class == "unavailable"


def test_tokens_and_cost_are_accounted():
    t = Trace(goal=GOAL)
    run_controlled(GOAL, StubBrain(), trace=t)
    assert t.total_tokens > 0
    assert t.total_cost_usd == 0.0, "the stub is free, and the table says so"


def test_cost_scales_with_the_price_table():
    small = cost_of("small", 4200, 380)
    large = cost_of("large", 4200, 380)
    assert 0 < small < large
    assert large / small > 5, "the table must make routing a real trade-off"


def test_an_unknown_model_costs_zero_rather_than_guessing():
    assert cost_of("some-model-we-have-no-price-for", 1000, 1000) == 0.0
    assert "deterministic-rules-v1" in PRICES


def test_prompt_tokens_grow_across_steps():
    """
    Cost is quadratic in steps, not linear, because every step re-sends the
    whole transcript. This is the real argument for fewer, coarser tools.
    """
    t = Trace(goal=GOAL)
    run_controlled(GOAL, StubBrain(), trace=t)
    prompts = [s.prompt_tokens for s in t.spans if s.kind == "model"]
    assert prompts == sorted(prompts)
    assert prompts[-1] > prompts[0] * 2


def test_secrets_are_redacted_before_they_reach_a_span():
    """A trace holding a token is a retention problem wearing a debugging hat."""
    t = Trace()
    with t.span("x", "tool", note="token apr_0123456789abcdef here"):
        pass
    assert "apr_0123456789abcdef" not in t.spans[0].attributes["note"]
    assert "approval token" in t.spans[0].attributes["note_redacted"]


def test_the_trace_renders_and_summarises():
    t = Trace(goal=GOAL)
    run_controlled(GOAL, StubBrain(), trace=t)
    text = t.render()
    assert t.run_id in text and "total:" in text
    summary = t.summary()
    assert summary["spans"] == len(t.spans)
    assert set(summary["by_kind"]) <= {"model", "tool", "control"}


def test_slowest_spans_are_identifiable():
    set_faults(FaultPlan(slow={"lookup_order": 0.12}))
    t = Trace(goal=GOAL)
    run_controlled(GOAL, StubBrain(), trace=t)
    assert t.slowest(1)[0].name == "tool:lookup_order"


def test_tracing_is_optional_and_off_by_default():
    """The loop stays readable for Lessons 2-9; tracing is opt-in."""
    r = run_controlled(GOAL, StubBrain())
    assert r.outcome == "resolved"
