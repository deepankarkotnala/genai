"""
approval.py — idempotency, approval tokens, and an append-only audit log.

Lesson 8, and the most transferable file in the course: none of it is
AI-specific. It is what you already do for a payments endpoint. The only new
part is that the caller is a probabilistic system which may sincerely believe it
has not already asked.

Four mechanisms, and the order matters because each protects against the
previous one's blind spot:

    1. IDEMPOTENCY KEY   the same request twice produces one effect
    2. APPROVAL TOKEN    a human authorised *this specific* amount
    3. AUDIT LOG         append-only, so what happened can be reconstructed
    4. TIMEOUT RECORD    the case where you genuinely do not know

Number 4 is the one people forget, and the one that costs money. If a refund
call times out you do not know whether it succeeded. Retrying might double-pay;
not retrying might strand a customer. The only safe design is to have decided in
advance -- which is what the idempotency key buys you.
"""

from __future__ import annotations

import hashlib
import json
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

STATE_DIR = Path(__file__).resolve().parent.parent / "state"
LEDGER = STATE_DIR / "refund_ledger.jsonl"
AUDIT = STATE_DIR / "audit.jsonl"

# Tokens are scoped to an exact (order, amount) pair. A token that authorises
# "a refund on ORD-5581" rather than "48.00 on ORD-5581" is an open cheque, and
# an agent that misreads the amount would spend it.
_APPROVALS: dict[str, dict[str, Any]] = {}


# --------------------------------------------------------------------------
# 1 · Idempotency
# --------------------------------------------------------------------------
def idempotency_key(order_id: str, amount: float, reason: str) -> str:
    """
    Derive a stable key from what makes this refund *this* refund.

    Deliberately NOT random and NOT time-based. A UUID per attempt gives every
    retry a fresh key, which defeats the entire mechanism -- the second attempt
    looks like a new refund because you told it to. Deriving from the request
    means the same request always produces the same key, whoever sends it and
    however many times.

    `reason` is included so two legitimately different refunds on one order (a
    duplicate charge and, later, a returned item) are distinct.
    """
    material = f"{order_id.upper()}|{amount:.2f}|{reason.strip().lower()}"
    return "idem_" + hashlib.sha256(material.encode()).hexdigest()[:16]


def _read_ledger() -> dict[str, dict[str, Any]]:
    if not LEDGER.exists():
        return {}
    entries: dict[str, dict[str, Any]] = {}
    for line in LEDGER.read_text(encoding="utf-8").splitlines():
        if line.strip():
            row = json.loads(line)
            entries[row["idempotency_key"]] = row
    return entries


def already_processed(key: str) -> dict[str, Any] | None:
    """Return the original record if this key has been seen, else None."""
    return _read_ledger().get(key)


def record_refund(key: str, payload: dict[str, Any]) -> None:
    STATE_DIR.mkdir(exist_ok=True)
    row = {"idempotency_key": key, **payload}
    with LEDGER.open("a", encoding="utf-8") as fh:
        fh.write(json.dumps(row, default=str) + "\n")


# --------------------------------------------------------------------------
# 2 · Approval tokens
# --------------------------------------------------------------------------
@dataclass
class Approval:
    token: str
    order_id: str
    amount: float
    approver: str
    note: str = ""
    used: bool = False


def grant_approval(order_id: str, amount: float, approver: str, note: str = "") -> Approval:
    """
    A human authorises one specific refund. In a real system this is a UI action
    and the token is signed and expiring; the *shape* is what matters here.

    Note the agent cannot call this. It is not in the tool registry. An agent
    able to mint its own approvals has an approval gate in name only -- which is
    the most common way this control is implemented wrongly.
    """
    token = "apr_" + hashlib.sha256(
        f"{order_id}|{amount:.2f}|{approver}".encode()
    ).hexdigest()[:16]
    approval = Approval(token=token, order_id=order_id.upper(), amount=round(amount, 2),
                        approver=approver, note=note)
    _APPROVALS[token] = approval.__dict__
    return approval


def check_approval(token: str, order_id: str, amount: float) -> tuple[bool, str]:
    """
    Validate a token against the exact refund being attempted.

    Three separate checks, because each has been a real incident somewhere:
    unknown token (forged or hallucinated), mismatched order or amount (a token
    reused for a different refund), and already used (replay).
    """
    record = _APPROVALS.get(token)
    if not record:
        return False, "approval token is not recognised"
    if record["order_id"] != order_id.upper():
        return False, (
            f"approval token was issued for {record['order_id']}, not {order_id.upper()}"
        )
    if abs(float(record["amount"]) - round(amount, 2)) > 0.001:
        return False, (
            f"approval token authorises {record['amount']:.2f}, not {amount:.2f}"
        )
    if record["used"]:
        return False, "approval token has already been used"
    return True, "approved"


def consume_approval(token: str) -> None:
    if token in _APPROVALS:
        _APPROVALS[token]["used"] = True


def reset_approvals() -> None:
    """Test helper. Production has no such function, which is the point."""
    _APPROVALS.clear()


# --------------------------------------------------------------------------
# 3 · Audit log
# --------------------------------------------------------------------------
@dataclass
class AuditEntry:
    action: str
    ticket_id: str
    order_id: str
    amount: float
    outcome: str
    detail: str = ""
    actor: str = "agent"
    approver: str | None = None
    idempotency_key: str | None = None
    trace: list[str] = field(default_factory=list)


def audit(entry: AuditEntry) -> None:
    """
    Append-only. Never updated, never deleted.

    Why append-only rather than a status column you update: the question an audit
    answers is "what happened, in what order, and who decided" -- and an
    overwritten row cannot answer it. A refused refund followed by an approved
    one is two facts, not one row that changed its mind.

    Every *attempt* is logged, including refusals. A log containing only
    successes cannot tell you that an agent tried forty times.
    """
    STATE_DIR.mkdir(exist_ok=True)
    with AUDIT.open("a", encoding="utf-8") as fh:
        fh.write(json.dumps(entry.__dict__, default=str) + "\n")


def read_audit(limit: int = 20) -> list[dict[str, Any]]:
    if not AUDIT.exists():
        return []
    rows = [json.loads(line) for line in AUDIT.read_text(encoding="utf-8").splitlines() if line.strip()]
    return rows[-limit:]


def reset_state() -> None:
    """Clear the ledger and audit log. For lessons and tests only."""
    for path in (LEDGER, AUDIT):
        if path.exists():
            path.unlink()
    reset_approvals()
