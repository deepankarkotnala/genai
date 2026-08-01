"""
policy.py — the rules, in code, where a model cannot argue with them.

Lesson 8. The knowledge base *describes* the refund policy in prose so the agent
can quote it to a customer. This module *enforces* it, and the two are not the
same thing:

    the KB tells the model what to say
    this file decides what may happen

That separation is the whole point. A policy that lives only in a prompt is a
suggestion -- the model can be talked out of it by a persuasive ticket, and
Lesson 9 shows exactly that happening. A policy that lives in a function cannot
be talked out of anything, because the model never gets a vote.

Interview framing: "where does your business logic live?" If the answer is "in
the system prompt", the follow-up will be unpleasant.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

MAX_REFUND_DAYS = 30
REFUNDABLE_STATUSES = {"delivered", "in_transit"}
# Above this, a refund needs a second approver. The number is a business
# decision, not an engineering one -- which is why it is a named constant here
# rather than a magic value buried in a condition.
SECOND_APPROVER_ABOVE = 500.00


@dataclass
class PolicyDecision:
    allowed: bool
    reasons: list[str] = field(default_factory=list)
    requires_second_approver: bool = False
    max_amount: float = 0.0

    def explain(self) -> str:
        verdict = "permitted" if self.allowed else "not permitted"
        detail = "; ".join(self.reasons) if self.reasons else "all conditions met"
        # The second-approver note only makes sense on a permitted refund. On a
        # denial it reads as a hint that a second signature would unlock it,
        # which is the opposite of true.
        extra = " (needs a second approver)" if (self.allowed and self.requires_second_approver) else ""
        return f"Refund {verdict}{extra}: {detail}"


def check_refund(order: dict[str, Any], amount: float) -> PolicyDecision:
    """
    Decide whether this refund may happen. Deterministic, testable, no model.

    Every failed condition is collected rather than short-circuiting on the
    first. A customer told "your order is too old" who is *also* over the amount
    limit will otherwise come back twice, and the agent will look evasive both
    times. Collecting reasons is the same instinct as collecting validation
    faults in Lesson 3.
    """
    reasons: list[str] = []

    # A missing field is a refusal, not a default. This is the partial-failure
    # lesson from Lesson 7 applied to money: if eligibility could not be read,
    # the answer is no -- never "probably fine".
    required = ("order_id", "amount", "status", "days_since_purchase",
                "refund_eligible", "already_refunded")
    missing = [f for f in required if f not in order]
    if missing:
        return PolicyDecision(
            allowed=False,
            reasons=[f"order data incomplete (missing {', '.join(missing)})"],
        )

    if order["already_refunded"]:
        reasons.append("this order has already been refunded")
    if not order["refund_eligible"]:
        reasons.append("the order is flagged not refund-eligible")
    if order["days_since_purchase"] > MAX_REFUND_DAYS:
        reasons.append(
            f"the order is {order['days_since_purchase']} days old "
            f"(limit {MAX_REFUND_DAYS})"
        )
    if order["status"] not in REFUNDABLE_STATUSES:
        reasons.append(
            f"order status is {order['status']!r} "
            f"(refundable: {', '.join(sorted(REFUNDABLE_STATUSES))})"
        )
    if amount <= 0:
        reasons.append("the refund amount must be positive")
    if amount > float(order["amount"]):
        reasons.append(
            f"the refund amount {amount:.2f} exceeds the order total "
            f"{float(order['amount']):.2f}"
        )

    return PolicyDecision(
        allowed=not reasons,
        reasons=reasons,
        requires_second_approver=amount > SECOND_APPROVER_ABOVE,
        max_amount=float(order["amount"]),
    )
