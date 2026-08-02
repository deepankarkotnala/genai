"""
Tests for the tool layer: validation, dispatch, and the read-only guarantee.

These are the tests worth showing an interviewer, because they encode claims
rather than coverage. Each one is an assertion about how the system behaves
under a specific kind of wrong input.
"""

import pytest

from agent.schemas import ArgumentError, UnknownToolError, validate_arguments
from agent.tools import REGISTRY, execute, read_ticket, search_kb, tool_specs


# -- happy paths -----------------------------------------------------------
def test_read_ticket_returns_the_ticket():
    ticket = read_ticket("TCK-1001")
    assert ticket["ticket_id"] == "TCK-1001"
    assert ticket["category"] == "Billing"
    assert "ORD-5581" in ticket["body"]


def test_ticket_id_is_case_insensitive():
    assert read_ticket("tck-1001")["ticket_id"] == "TCK-1001"


def test_lookup_order_exposes_the_refund_decision_fields():
    order = execute("lookup_order", {"order_id": "ORD-5581"})
    assert order["refund_eligible"] is True
    assert order["already_refunded"] is False
    assert isinstance(order["amount"], float)


def test_search_kb_ranks_the_relevant_article_first():
    hits = search_kb("duplicate charge refund", limit=3)["articles"]
    assert hits, "expected at least one article"
    assert hits[0]["id"] in ("billing-duplicate-charges", "refunds")


# -- the interesting paths -------------------------------------------------
def test_missing_ticket_is_a_recoverable_result_not_an_exception():
    """The agent must be able to read this and try something else."""
    out = read_ticket("TCK-9999")
    assert out["error"] == "not_found"
    assert "TCK-1001" in out["message"]  # tells the caller what does exist


def test_empty_kb_result_is_reported_not_invented():
    """Lesson 5 replaced word counting with a relevance floor; the note changed."""
    out = search_kb("quantum tunnelling in badgers")
    assert out["returned"] == 0
    assert out["note"] == "no article passed the relevance floor"


def test_unknown_tool_is_rejected():
    with pytest.raises(UnknownToolError) as exc:
        execute("delete_everything", {})
    assert "delete_everything" in str(exc.value)


def test_missing_required_argument_names_the_argument():
    with pytest.raises(ArgumentError) as exc:
        execute("read_ticket", {})
    assert "ticket_id" in str(exc.value)


def test_unexpected_argument_is_rejected_and_lists_what_is_allowed():
    with pytest.raises(ArgumentError) as exc:
        execute("read_ticket", {"ticket": "TCK-1001"})
    message = str(exc.value)
    assert "'ticket'" in message
    assert "ticket_id" in message


def test_wrong_type_is_rejected():
    with pytest.raises(ArgumentError) as exc:
        execute("read_ticket", {"ticket_id": 1001})
    assert "expected string" in str(exc.value)


def test_boolean_is_not_accepted_as_an_integer():
    """bool subclasses int in Python; silently coercing it hides a real bug."""
    with pytest.raises(ArgumentError) as exc:
        execute("search_kb", {"query": "billing", "limit": True})
    assert "boolean" in str(exc.value)


def test_out_of_range_integer_is_rejected():
    with pytest.raises(ArgumentError):
        execute("search_kb", {"query": "billing", "limit": 99})


def test_too_short_string_is_rejected():
    with pytest.raises(ArgumentError):
        execute("search_kb", {"query": "a"})


def test_validate_returns_a_clean_copy():
    clean = validate_arguments("search_kb", {"query": "billing", "limit": 2})
    assert clean == {"query": "billing", "limit": 2}


# -- structural guarantees ------------------------------------------------
def test_every_declared_tool_is_implemented_and_vice_versa():
    declared = {spec["name"] for spec in tool_specs()}
    implemented = set(REGISTRY)
    assert declared == implemented, "a declared tool with no handler is a live bug"


def test_no_tool_can_execute_code_or_reach_outside_the_fixtures():
    """
    The security boundary is architectural: capability is absent, not filtered.

    This test was written in Wave 1 as a canary listing `issue_refund` among the
    forbidden tools, and it fired when Lesson 8 added it -- which is exactly what
    it was for. The invariant is now stated properly: arbitrary execution, shell,
    filesystem, network and database access remain absent, and the one tool that
    *does* act on the world is gated (see the two tests below).
    """
    dangerous = {"exec", "eval", "shell", "run_python", "read_file", "write_file",
                 "http_get", "fetch_url", "run_sql", "send_email"}
    assert not (dangerous & set(REGISTRY))


def test_the_one_acting_tool_is_safe_by_default():
    """`issue_refund` exists, so its default must not move money."""
    out = execute("issue_refund", {"order_id": "ORD-5581", "amount": 120.0,
                                   "reason": "duplicate charge"})
    assert out["refunded"] is False
    assert out["status"] == "requires_approval"


def test_the_agent_cannot_mint_the_approval_it_needs():
    """A gate the caller can open itself is not a gate."""
    assert not any("approval" in name or "grant" in name for name in REGISTRY)


def test_tools_do_not_mutate_the_fixtures():
    first = read_ticket("TCK-1001")
    first["category"] = "TAMPERED"
    assert read_ticket("TCK-1001")["category"] == "Billing"


def test_kb_result_size_is_capped():
    out = search_kb("billing refund shipping checkout order", limit=5)
    assert out["returned"] <= 5
    for article in out["articles"]:
        assert len(article["snippet"]) <= 400
