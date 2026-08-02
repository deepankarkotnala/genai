"""
a2a_demo/agents.py — two agents, one boundary that must hold.

Lesson 13. A triage agent delegates a refund question to a refund specialist
over A2A. The specialist knows the refund policy in depth; the triage agent does
not need to.

**The constraint the whole demo exists to prove:** the specialist may
*recommend*. It cannot execute. The approval gate from Lesson 8 is not
negotiable by a peer, and the reason is worth stating precisely -- delegation
moves *work*, never *authority*. An agent that could grant itself permission by
asking another agent has no permissions at all.

So the specialist:
  * runs the same `policy.check_refund` the tool would;
  * calls `issue_refund` in **dry-run** mode, which cannot move money;
  * returns an artifact saying "permitted, awaiting human approval";
  * has no approval token and no way to obtain one.
"""

from __future__ import annotations

import sys
from pathlib import Path
from typing import Any

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from agent.policy import check_refund  # noqa: E402
from agent.tools import _load_orders, execute  # noqa: E402
from .protocol import AgentCard, AgentSkill, Artifact, Task  # noqa: E402


# --------------------------------------------------------------------------
# The refund specialist
# --------------------------------------------------------------------------
REFUND_SPECIALIST_CARD = AgentCard(
    name="refund-specialist",
    version="1.0.0",
    description="Assesses refund eligibility against policy and prepares a recommendation.",
    skills=[
        AgentSkill(
            id="assess_refund",
            name="Assess a refund request",
            description="Checks an order against refund policy and prepares a recommendation.",
            accepts=["order_id", "amount", "reason"],
            # Publishing the refusal is the point. A caller reading this card
            # cannot plan a workflow in which the specialist pays anybody.
            will_not=[
                "execute a payment",
                "issue or obtain an approval token",
                "override policy",
            ],
        )
    ],
)


class RefundSpecialist:
    """A peer agent. Deep on one thing, deliberately powerless."""

    card = REFUND_SPECIALIST_CARD

    def handle(self, task: Task) -> Task:
        if task.skill_id != "assess_refund":
            task.transition("failed")
            task.error = f"unknown skill {task.skill_id!r}"
            return task

        task.transition("working")
        request = task.messages[0]
        order_id = str(request.data.get("order_id", "")).upper()
        amount = request.data.get("amount")

        # The clarification path -- the state that makes A2A more than a function
        # call. A missing amount is not a failure; it is a question.
        if amount is None:
            task.transition("input_required")
            task.say("agent", "How much should be refunded? I will not assume the order total.")
            return task

        order = _load_orders().get(order_id)
        if order is None:
            task.transition("failed")
            task.error = f"no order {order_id!r}"
            task.say("agent", f"I cannot assess {order_id!r}: no such order.")
            return task

        decision = check_refund(order, float(amount))

        # Dry run. Structurally incapable of moving money, not merely instructed
        # not to -- and it produces the same audit record the tool always does.
        preview = execute("issue_refund", {
            "order_id": order_id,
            "amount": float(amount),
            "reason": str(request.data.get("reason") or "assessed by refund specialist"),
        })

        task.produce(Artifact(
            name="refund-recommendation",
            kind="recommendation",
            content={
                "order_id": order_id,
                "amount": float(amount),
                "policy_allows": decision.allowed,
                "policy_explanation": decision.explain(),
                "requires_second_approver": decision.allowed and decision.requires_second_approver,
                "tool_status": preview.get("status") or preview.get("error"),
                "refunded": preview.get("refunded", False),
                "idempotency_key": preview.get("idempotency_key"),
                "next_step": (
                    "A human must approve this amount before any payment is made."
                    if decision.allowed else
                    "Explain the refusal to the customer, or escalate."
                ),
            },
        ))
        task.say("agent", decision.explain())
        task.transition("completed")
        return task


# --------------------------------------------------------------------------
# The triage agent, as an A2A client
# --------------------------------------------------------------------------
class TriageAgent:
    """
    Delegates refund assessment rather than learning policy itself.

    Note what it does with the artifact: it reads `refunded`, and if a peer ever
    claimed to have paid, that is an incident rather than a result. **Trust the
    boundary, verify the claim** -- a peer's word is not evidence.
    """

    def __init__(self, specialist: RefundSpecialist) -> None:
        self.specialist = specialist

    def discover(self) -> dict[str, Any]:
        """Read the peer's card before delegating. This is capability discovery."""
        return self.specialist.card.to_dict()

    def delegate_refund(
        self, order_id: str, reason: str, amount: float | None = None
    ) -> tuple[Task, list[str]]:
        notes: list[str] = []
        card = self.discover()
        skill = card["skills"][0]
        notes.append(f"discovered {card['name']} v{card['version']}, skill {skill['id']}")
        notes.append(f"peer declares it will not: {', '.join(skill['willNot'])}")

        task = Task.new("assess_refund", f"Assess a refund for {order_id}",
                        {"order_id": order_id, "amount": amount, "reason": reason})
        task = self.specialist.handle(task)
        notes.append(f"task {task.id} -> {' -> '.join(task.history)}")

        # Handle the clarification round trip. A tool call could not do this.
        if task.state == "input_required":
            notes.append("peer asked for input; supplying the order total")
            order = _load_orders().get(order_id.upper()) or {}
            resume = Task.new("assess_refund", f"Assess a refund for {order_id}",
                              {"order_id": order_id, "reason": reason,
                               "amount": order.get("amount")})
            task = self.specialist.handle(resume)
            notes.append(f"task {task.id} -> {' -> '.join(task.history)}")

        for artifact in task.artifacts:
            if artifact.content.get("refunded"):
                # Verify rather than trust. If this ever fires, a peer has
                # exceeded its published limits and the run is an incident.
                notes.append("!! peer reported a completed payment -- boundary violated")
        return task, notes
