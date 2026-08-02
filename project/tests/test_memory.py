"""
Tests for state, context budgeting and memory (Lesson 6).
"""

import json

from agent.memory import (
    KEEP_RECENT,
    MAX_TOOL_RESULT_TOKENS,
    ConversationHistory,
    recall_prior_tickets,
)
from agent.state import RunState, estimate_tokens
from brain import Message


# -- state -----------------------------------------------------------------
def test_state_tracks_two_budgets_not_one():
    """Steps alone are a poor bound: one expensive call can outweigh five cheap."""
    s = RunState(goal="g", max_steps=3, token_budget=100)
    s.step = 3
    assert s.over_budget()
    t = RunState(goal="g", max_steps=9, token_budget=100)
    t.spend(150)
    assert t.over_budget()


def test_state_records_failed_attempts_so_they_are_not_retried():
    """The Lesson 2 infinite-retry bug, now prevented by state rather than inferred."""
    s = RunState(goal="g")
    s.record("read_ticket", {"error": "not_found", "message": "nope"})
    assert s.attempted("read_ticket")
    assert "read_ticket" not in s.facts


def test_state_keeps_successful_results_as_facts():
    s = RunState(goal="g")
    s.record("read_ticket", {"ticket_id": "TCK-1001"})
    assert s.facts["read_ticket"]["ticket_id"] == "TCK-1001"


def test_state_round_trips_for_later_resume():
    s = RunState(goal="Triage TCK-1001", ticket_id="TCK-1001", step=2)
    s.record("read_ticket", {"ticket_id": "TCK-1001"})
    back = RunState.from_json(s.to_json())
    assert back.goal == s.goal and back.step == 2
    assert back.facts == s.facts


# -- budgeting and truncation ---------------------------------------------
def test_an_oversized_tool_result_is_capped_on_the_way_in():
    """
    Compaction cannot rescue a transcript whose newest message is the problem.
    Capping at the source is the other half of the fix.
    """
    h = ConversationHistory()
    h.add(Message("tool", "x" * (MAX_TOOL_RESULT_TOKENS * 4 * 3), tool_name="search_kb"))
    assert h.truncations == 1
    assert "truncated" in h.messages[0].content
    assert estimate_tokens(h.messages[0].content) < MAX_TOOL_RESULT_TOKENS * 2


def test_should_compact_triggers_before_the_budget_is_exhausted():
    """At 100% it is too late -- the compaction call itself needs room."""
    h = ConversationHistory()
    h.add(Message("user", "word " * 200))
    assert h.should_compact(budget=300)
    assert not h.should_compact(budget=100_000)


# -- compaction ------------------------------------------------------------
def _history_with_steps(n: int = 4, body_words: int = 60) -> ConversationHistory:
    """
    Realistic sizes matter here. Real tool results are paragraphs, not two
    fields, and compaction only pays for itself when the span it replaces is
    genuinely bulky -- see test_compaction_is_skipped_when_it_would_not_help.
    """
    h = ConversationHistory()
    h.add(Message("system", "You are a support-ticket triage agent."))
    h.add(Message("user", "Triage ticket TCK-1001."))
    for i in range(n):
        h.add(Message("assistant", f"Calling read_ticket #{i}"))
        h.add(Message("tool", json.dumps({
            "ticket_id": f"TCK-100{i}",
            "category": "Billing",
            "body": "detail " * body_words,
        }), tool_name="read_ticket"))
    return h


def test_compaction_shrinks_the_transcript():
    h = _history_with_steps()
    before = h.tokens()
    result = h.compact()
    assert h.tokens() < before, result
    assert h.compactions == 1


def test_compaction_never_grows_the_transcript():
    """
    The invariant, across sizes. A summary of a short span can cost more than
    the span itself, and paying a model call to *grow* the prompt is the worst
    of both worlds -- so compact() refuses rather than assuming it helped.
    """
    for n in (2, 3, 4, 8):
        for body_words in (0, 1, 60):
            h = _history_with_steps(n=n, body_words=body_words)
            before = h.tokens()
            result = h.compact()
            assert h.tokens() <= before, f"n={n} body={body_words}: {result}"
            if "skipped" in result:
                assert h.tokens() == before and h.compactions == 0


def test_the_skip_path_is_reachable():
    """Prove the guard is live, not decorative: find a span it declines."""
    outcomes = [
        _history_with_steps(n=n, body_words=w).compact()
        for n in (2, 3) for w in (0, 1)
    ]
    assert any("skipped" in o for o in outcomes), outcomes


def test_compaction_keeps_the_system_prompt_and_the_goal_verbatim():
    """Drop the goal and the agent is answering a question it can no longer see."""
    h = _history_with_steps()
    h.compact()
    assert h.messages[0].role == "system"
    assert "triage agent" in h.messages[0].content
    assert h.messages[1].role == "user"
    assert "TCK-1001" in h.messages[1].content


def test_compaction_keeps_the_most_recent_turns():
    h = _history_with_steps()
    tail = [m.content for m in h.messages[-KEEP_RECENT:]]
    h.compact()
    assert [m.content for m in h.messages[-KEEP_RECENT:]] == tail


def test_compaction_summary_records_what_each_tool_found():
    h = _history_with_steps()
    h.compact()
    summary = h.messages[2].content
    assert "Summary of earlier steps" in summary
    assert "read_ticket" in summary
    # The gist must be parsed, not dumped raw -- a summary containing a Python
    # dict repr means json.loads failed and nothing was actually summarised.
    assert "ticket_id=" in summary


def test_compaction_is_a_no_op_on_a_short_transcript():
    h = ConversationHistory()
    h.add(Message("system", "s"))
    h.add(Message("user", "g"))
    assert h.compact() == "nothing to compact"
    assert h.compactions == 0


# -- long-term memory -----------------------------------------------------
def test_recall_returns_other_tickets_but_never_the_current_one():
    out = recall_prior_tickets("TCK-1001")
    ids = [t["ticket_id"] for t in out["prior_tickets"]]
    assert "TCK-1001" not in ids
    assert out["returned"] >= 1


def test_recall_states_the_basis_of_the_match():
    """An honest memory says how it matched. 'Same tier' is not 'same person'."""
    assert "customer_tier" in recall_prior_tickets("TCK-1001")["basis"]


def test_recall_is_ordered_newest_first():
    dates = [t["created_at"] for t in recall_prior_tickets("TCK-1001", limit=5)["prior_tickets"]]
    assert dates == sorted(dates, reverse=True)


def test_recall_of_an_unknown_ticket_is_a_recoverable_error():
    assert recall_prior_tickets("TCK-9999")["error"] == "not_found"
