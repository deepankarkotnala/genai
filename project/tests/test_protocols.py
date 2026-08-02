"""
Tests for MCP, A2A and the supervisor (Lessons 12-13).

The load-bearing tests here are the boundary ones: that the money tool is not
reachable over MCP, and that a peer agent cannot pay however it is asked.
"""

import pytest

from a2a_demo.agents import RefundSpecialist, TriageAgent
from a2a_demo.protocol import AgentCard, AgentSkill, Task
from agent.approval import read_audit, reset_state
from agent.supervisor import SPECIALISTS, classify, compare, run_supervised
from agent.tools import REGISTRY
from brain import StubBrain
from mcp_server.server import (
    EXPOSED_TOOLS, INVALID_PARAMS, INVALID_REQUEST, METHOD_NOT_FOUND, Client, Server,
)


@pytest.fixture(autouse=True)
def _clean():
    reset_state()
    yield
    reset_state()


# ==========================================================================
# Lesson 12 · MCP
# ==========================================================================
def test_the_money_tool_is_not_exposed_over_mcp():
    """
    The whole reason this server exists. A tool exposed over MCP is a tool any
    connected host can call, and the approval gate lives in our process.
    """
    assert "issue_refund" not in EXPOSED_TOOLS
    client = Client(Server())
    client.initialize()
    assert "issue_refund" not in [t["name"] for t in client.list_tools()]
    response = client.call_tool("issue_refund",
                                {"order_id": "ORD-5581", "amount": 120.0, "reason": "test"})
    assert response["error"]["code"] == METHOD_NOT_FOUND


def test_no_refund_appears_in_the_audit_log_from_an_mcp_call():
    """Prove nothing reached the tool, not merely that the response was an error."""
    client = Client(Server())
    client.initialize()
    client.call_tool("issue_refund", {"order_id": "ORD-5581", "amount": 120.0, "reason": "x"})
    assert not [r for r in read_audit(50) if r["action"] == "issue_refund"]


def test_the_exposure_list_is_an_allowlist_not_a_deny_list():
    """A tool added to REGISTRY later must not appear automatically."""
    assert EXPOSED_TOOLS <= set(REGISTRY)
    assert set(REGISTRY) - EXPOSED_TOOLS, "something must be withheld or the test is vacuous"


def test_the_error_for_a_withheld_tool_is_not_a_discovery_oracle():
    """'Not exposed' and 'does not exist' must read identically."""
    client = Client(Server())
    client.initialize()
    withheld = client.call_tool("issue_refund", {"order_id": "O", "amount": 1.0, "reason": "xxxxx"})
    invented = client.call_tool("delete_everything", {})
    assert withheld["error"]["code"] == invented["error"]["code"]
    assert "issue_refund" not in withheld["error"]["message"].replace("'issue_refund'", "")


def test_handshake_is_required_before_any_other_method():
    server = Server()
    response = server.handle({"jsonrpc": "2.0", "id": 1, "method": "tools/list"})
    assert response["error"]["code"] == INVALID_REQUEST
    assert "initialize" in response["error"]["message"]


def test_discovery_returns_names_descriptions_and_schemas():
    client = Client(Server())
    client.initialize()
    for tool in client.list_tools():
        assert tool["name"] and tool["description"]
        assert tool["inputSchema"]["type"] == "object"


def test_mcp_and_in_process_share_one_schema_definition():
    """If they could drift apart, they would."""
    from agent.schemas import schema_for

    client = Client(Server())
    client.initialize()
    for tool in client.list_tools():
        assert tool["inputSchema"] == schema_for(tool["name"])["parameters"]


def test_a_permitted_call_returns_content_blocks():
    client = Client(Server())
    client.initialize()
    result = client.call_tool("read_ticket", {"ticket_id": "TCK-1001"})["result"]
    assert result["isError"] is False
    assert result["content"][0]["type"] == "text"
    assert "TCK-1001" in result["content"][0]["text"]


def test_bad_arguments_are_rejected_with_the_standard_code():
    client = Client(Server())
    client.initialize()
    assert client.call_tool("read_ticket", {"ticket": "TCK-1001"})["error"]["code"] == INVALID_PARAMS


def test_a_notification_gets_no_response():
    assert Server().handle({"jsonrpc": "2.0", "method": "initialize"}) is None


def test_internal_errors_do_not_leak_tracebacks():
    server = Server()
    server.initialised = True
    response = server.handle({"jsonrpc": "2.0", "id": 1, "method": "tools/call",
                              "params": {"name": "read_ticket", "arguments": None}})
    assert "error" in response
    assert "Traceback" not in str(response)


# ==========================================================================
# Lesson 13 · A2A
# ==========================================================================
def test_the_agent_card_publishes_what_the_peer_will_not_do():
    """The honest half of a contract is the refusal."""
    card = RefundSpecialist.card.to_dict()
    will_not = card["skills"][0]["willNot"]
    assert any("execute a payment" in w for w in will_not)
    assert any("approval token" in w for w in will_not)


def test_delegation_produces_a_recommendation_and_moves_no_money():
    """The boundary. Delegation moves work, never authority."""
    task, _ = TriageAgent(RefundSpecialist()).delegate_refund(
        "ORD-5590", "returned annual plan", amount=480.00)
    assert task.state == "completed"
    content = task.artifacts[0].content
    assert content["policy_allows"] is True
    assert content["refunded"] is False
    assert content["tool_status"] == "requires_approval"


def test_no_execution_appears_in_the_audit_log_after_delegation():
    TriageAgent(RefundSpecialist()).delegate_refund("ORD-5590", "returned", amount=480.00)
    assert not [r for r in read_audit(50) if r["outcome"] == "executed"]


def test_a_missing_amount_becomes_a_question_not_a_failure():
    """input_required is what makes A2A more than a function call."""
    task, notes = TriageAgent(RefundSpecialist()).delegate_refund("ORD-5590", "returned")
    assert any("asked for input" in n for n in notes)
    assert task.state == "completed"      # resumed and finished


def test_the_peer_refuses_a_policy_breaking_refund():
    task, _ = TriageAgent(RefundSpecialist()).delegate_refund(
        "ORD-5555", "ninety days ago", amount=49.00)
    content = task.artifacts[0].content
    assert content["policy_allows"] is False
    assert content["refunded"] is False


def test_an_unknown_order_fails_the_task_rather_than_guessing():
    task, _ = TriageAgent(RefundSpecialist()).delegate_refund(
        "ORD-0000", "does not exist", amount=10.0)
    assert task.state == "failed"
    assert task.error


def test_an_unknown_skill_fails_the_task():
    task = Task.new("summarise_everything", "do a thing")
    assert RefundSpecialist().handle(task).state == "failed"


def test_a_completed_task_cannot_be_resurrected():
    """Late duplicate responses must not reopen finished work."""
    task = Task.new("assess_refund", "x")
    task.transition("working")
    task.transition("completed")
    with pytest.raises(ValueError):
        task.transition("working")


def test_artifacts_are_separate_from_the_message_stream():
    task, _ = TriageAgent(RefundSpecialist()).delegate_refund(
        "ORD-5590", "returned", amount=480.00)
    assert task.artifacts and task.messages
    assert task.artifacts[0].content["order_id"] == "ORD-5590"


def test_a_card_serialises_to_the_published_shape():
    card = AgentCard(name="x", version="1", description="d",
                     skills=[AgentSkill(id="s", name="S", description="d")]).to_dict()
    assert set(card) >= {"name", "version", "authentication", "capabilities", "skills"}


# ==========================================================================
# Lesson 13 · the supervisor, and the measurement
# ==========================================================================
def test_each_specialist_sees_a_narrower_tool_set_than_the_registry():
    for route, tools in SPECIALISTS.items():
        assert set(tools) < set(REGISTRY), f"{route} is not actually narrowed"


def test_only_the_refund_specialist_can_reach_the_refund_tool():
    for route, tools in SPECIALISTS.items():
        assert ("issue_refund" in tools) == (route == "refund")


def test_routing_sends_tickets_to_plausible_specialists():
    assert classify("Triage ticket TCK-1004 about a refund.") == "refund"
    assert classify("invoice does not match", {"category": "Billing"}) == "billing"
    assert classify("checkout returns 502", {"category": "Technical"}) == "technical"
    assert classify("how do I change my email?") == "general"


def test_the_supervisor_reaches_the_same_outcome():
    result = run_supervised("Triage ticket TCK-1001 and recommend the next step.", StubBrain())
    assert result.outcome == "resolved"
    assert result.route == "billing"


def test_the_handoff_is_a_brief_not_a_transcript():
    """
    A specialist handed the supervisor's whole context inherits its
    context-window problem and its confusion.
    """
    result = run_supervised("Triage ticket TCK-1001.", StubBrain())
    assert len(result.handoff_note) < 400
    assert "handoff from supervisor" in result.handoff_note


def test_the_split_costs_more_for_the_same_outcome():
    """
    The honest negative result. On this workload the supervisor is strictly
    worse, and the lesson says so rather than selling the pattern.
    """
    result = compare("Triage ticket TCK-1001 and recommend the next step.", StubBrain)
    assert result["single"]["resolved"] and result["supervised"]["resolved"]
    assert result["supervised"]["model_calls"] > result["single"]["model_calls"]
    assert result["supervised"]["tokens"] > result["single"]["tokens"]


def test_the_supervisor_counts_its_own_model_call():
    """Count honestly or the comparison lies in the pattern's favour."""
    result = compare("Triage ticket TCK-1001.", StubBrain)
    assert "read_ticket(supervisor)" in result["supervised"]["tools"]
