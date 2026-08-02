"""
Tests for the loop and the deterministic backend.

The claim being tested is the one the whole course rests on: the stub backend
drives *the same loop* a real model would, reacting to tool results rather than
replaying a script.
"""

import pytest

from agent import run
from agent.loop import SYSTEM_PROMPT
from brain import (
    BrainResult,
    BrainUnavailable,
    MalformedDecision,
    Message,
    StubBrain,
    ToolCall,
    get_brain,
)


# -- the trajectory --------------------------------------------------------
def test_a_billing_ticket_gathers_facts_then_drafts():
    """Lesson 4 added draft_reply, so the full path is four tools plus an answer."""
    result = run("Triage ticket TCK-1001 and recommend the next step.", StubBrain())
    assert result.tool_calls == ["read_ticket", "lookup_order", "search_kb", "draft_reply"]
    assert result.stopped_because == "final_answer"
    assert len(result.steps) == 5


def test_the_order_lookup_is_driven_by_the_ticket_body_not_by_turn_number():
    """
    TCK-1005 mentions no order, so a script keyed on 'step 2 = lookup_order'
    would call it anyway. The stub reads the ticket content instead, so it
    skips straight to the knowledge base.
    """
    result = run("Triage ticket TCK-1005.", StubBrain())
    assert "lookup_order" not in result.tool_calls
    assert result.tool_calls == ["read_ticket", "search_kb", "draft_reply"]


def test_the_answer_cites_facts_that_came_from_tools():
    result = run("Triage ticket TCK-1001.", StubBrain())
    assert "TCK-1001" in result.answer
    assert "ORD-5581" in result.answer
    assert "120.0" in result.answer or "120" in result.answer


def test_a_different_ticket_takes_a_different_path():
    billing = run("Triage ticket TCK-1001.", StubBrain())
    technical = run("Triage ticket TCK-1003.", StubBrain())
    assert billing.answer != technical.answer
    assert "Technical" in technical.answer


def test_the_run_is_reproducible():
    a = run("Triage ticket TCK-1001.", StubBrain())
    b = run("Triage ticket TCK-1001.", StubBrain())
    assert a.answer == b.answer
    assert a.tool_calls == b.tool_calls


# -- the bounds ------------------------------------------------------------
def test_max_steps_stops_the_loop_and_says_so():
    result = run("Triage ticket TCK-1001.", StubBrain(), max_steps=2)
    assert result.stopped_because == "max_steps"
    assert len(result.steps) == 2
    assert "Escalating" in result.answer


def test_a_run_that_hits_the_limit_is_never_reported_as_finished():
    result = run("Triage ticket TCK-1001.", StubBrain(), max_steps=1)
    assert result.stopped_because != "final_answer"


def test_an_unreadable_ticket_still_terminates():
    result = run("Triage ticket TCK-9999.", StubBrain())
    assert result.stopped_because == "final_answer"
    assert "escalat" in result.answer.lower()


# -- the seams -------------------------------------------------------------
def test_a_bad_tool_call_is_fed_back_instead_of_crashing_the_run():
    class BadFirstCall:
        """Asks for a nonexistent tool once, then answers."""

        name, model = "bad", "test"

        def __init__(self):
            self.calls = 0

        def decide(self, messages, tools):
            self.calls += 1
            if self.calls == 1:
                return BrainResult(
                    tool_call=ToolCall("no_such_tool", {}),
                    final_text=None,
                    backend=self.name,
                    model=self.model,
                    latency_ms=0,
                )
            return BrainResult(
                tool_call=None,
                final_text="recovered",
                backend=self.name,
                model=self.model,
                latency_ms=0,
            )

    result = run("anything", BadFirstCall())
    assert result.answer == "recovered"
    assert result.steps[0].result["error"] == "invalid_call"


def test_the_loop_records_every_step_for_replay():
    result = run("Triage ticket TCK-1001.", StubBrain())
    for step in result.steps:
        assert step.n > 0
        assert step.kind in ("tool_call", "final")
        if step.kind == "tool_call":
            assert step.tool_name and step.arguments is not None


def test_telemetry_is_captured_even_on_the_stub():
    result = run("Triage ticket TCK-1001.", StubBrain())
    assert all(s.prompt_tokens is not None for s in result.steps)
    assert result.total_latency_ms >= 0


def test_the_stub_sees_the_tools_it_is_offered():
    """Remove a tool and the trajectory must change -- proof it reads the specs."""

    class OnlyTicketTool(StubBrain):
        pass

    from agent import loop as loop_module

    original = loop_module.tool_specs
    loop_module.tool_specs = lambda: [
        s for s in original() if s["name"] == "read_ticket"
    ]
    try:
        result = run("Triage ticket TCK-1001.", OnlyTicketTool())
    finally:
        loop_module.tool_specs = original
    assert result.tool_calls == ["read_ticket"]


# -- the contract ----------------------------------------------------------
def test_a_decision_cannot_be_both_a_call_and_an_answer():
    with pytest.raises(MalformedDecision):
        BrainResult(
            tool_call=ToolCall("read_ticket", {}),
            final_text="also an answer",
            backend="x",
            model="y",
            latency_ms=0,
        )


def test_a_decision_cannot_be_neither():
    with pytest.raises(MalformedDecision):
        BrainResult(
            tool_call=None, final_text=None, backend="x", model="y", latency_ms=0
        )


def test_the_default_backend_needs_no_api_key(monkeypatch):
    monkeypatch.delenv("AGENT_BRAIN", raising=False)
    assert get_brain().name == "stub"


def test_an_unknown_backend_name_fails_clearly():
    with pytest.raises(BrainUnavailable) as exc:
        get_brain("gpt-9")
    assert "stub" in str(exc.value)


def test_the_system_prompt_states_what_the_agent_may_not_do():
    assert "cannot issue refunds" in SYSTEM_PROMPT
    assert "recommend" in SYSTEM_PROMPT.lower()


def test_messages_are_immutable():
    m = Message("user", "hello")
    with pytest.raises(Exception):
        m.content = "changed"  # type: ignore[misc]
