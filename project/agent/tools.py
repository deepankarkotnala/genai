"""
tools.py — the three read-only tools, and the boundary they sit on.

Everything the agent can do, it does through this file. That sentence is the
most important one in the course, and it has a corollary worth saying out loud:
**the agent's capability is exactly the union of these functions.** It cannot
run shell commands because no tool runs shell commands. It cannot write to the
database because no tool writes. Capability is absent, not filtered.

Three habits every tool here follows, and every tool you write should:

* Fail with a message the *caller* can act on. `execute()` feeds these strings
  straight back to the model, so "unknown ticket TCK-9999" lets it recover
  while "KeyError" does not.
* Return data, never prose. Phrasing is the model's job; facts are yours.
* Treat tool *output* as trusted and ticket *content* as untrusted. A ticket
  body is a stranger's text that happens to be inside your prompt. Lesson 9
  attacks exactly this seam.
"""

from __future__ import annotations

import csv
import json
from pathlib import Path
from typing import Any, Callable

from .retrieval import retrieve
from .schemas import TOOL_SCHEMAS, UnknownToolError, validate_arguments

FIXTURES = Path(__file__).resolve().parent.parent / "fixtures"

# Caps exist so one bad call cannot flood the context window. A 50-article
# result would not make the agent smarter; it would push the goal out of scope.
MAX_KB_RESULTS = 5
MAX_SNIPPET_CHARS = 400


# --------------------------------------------------------------------------
# Loaders. Read once, hand out copies, never mutate.
# --------------------------------------------------------------------------
def _load_tickets() -> dict[str, dict[str, Any]]:
    raw = json.loads((FIXTURES / "tickets.json").read_text(encoding="utf-8"))
    return {t["ticket_id"]: t for t in raw}


def _load_orders() -> dict[str, dict[str, Any]]:
    out: dict[str, dict[str, Any]] = {}
    with (FIXTURES / "orders.csv").open(newline="", encoding="utf-8") as fh:
        for row in csv.DictReader(fh):
            row["amount"] = float(row["amount"])
            row["days_since_purchase"] = int(row["days_since_purchase"])
            row["refund_eligible"] = row["refund_eligible"] == "true"
            row["already_refunded"] = row["already_refunded"] == "true"
            out[row["order_id"]] = row
    return out


def _load_kb() -> list[dict[str, Any]]:
    articles = []
    for path in sorted((FIXTURES / "kb").glob("*.md")):
        text = path.read_text(encoding="utf-8")
        lines = text.splitlines()
        title = lines[0].lstrip("# ").strip() if lines else path.stem
        tags: list[str] = []
        for line in lines[:6]:
            if line.lower().startswith("tags:"):
                tags = [t.strip().lower() for t in line.split(":", 1)[1].split(",")]
        articles.append(
            {"id": path.stem, "title": title, "tags": tags, "text": text}
        )
    return articles


# --------------------------------------------------------------------------
# The tools
# --------------------------------------------------------------------------
def read_ticket(ticket_id: str) -> dict[str, Any]:
    """Return one ticket, or a structured error the model can recover from."""
    tickets = _load_tickets()
    ticket = tickets.get(ticket_id.upper())
    if ticket is None:
        return {
            "error": "not_found",
            "message": (
                f"No ticket {ticket_id!r}. Known ids: "
                + ", ".join(sorted(tickets)[:5])
                + " ..."
            ),
        }
    # dict(...) so a caller cannot mutate the fixture through the returned value.
    return dict(ticket)


def lookup_order(order_id: str) -> dict[str, Any]:
    """Return one order with the fields a refund decision actually needs."""
    orders = _load_orders()
    order = orders.get(order_id.upper())
    if order is None:
        return {
            "error": "not_found",
            "message": f"No order {order_id!r}.",
        }
    return dict(order)


def search_kb_keyword(query: str, limit: int = 3) -> dict[str, Any]:
    """
    The Wave 1 implementation: term overlap over whole articles, tags weighted.

    Kept, unchanged, so Lesson 5 can run it side by side with the real thing.
    Its flaw is instructive: every word counts the same, so a query about
    "account" matches the refund policy because that document happens to contain
    the phrase "account credit". Word counting cannot tell a rare, meaningful
    term from a common, meaningless one.
    """
    limit = max(1, min(int(limit), MAX_KB_RESULTS))
    terms = [t for t in query.lower().replace(",", " ").split() if len(t) > 2]

    scored = []
    for article in _load_kb():
        haystack = article["text"].lower()
        tag_hits = sum(1 for t in terms if any(t in tag for tag in article["tags"]))
        body_hits = sum(1 for t in terms if t in haystack)
        score = tag_hits * 3 + body_hits
        if score:
            scored.append((score, article))

    scored.sort(key=lambda pair: (-pair[0], pair[1]["id"]))
    hits = [
        {
            "id": a["id"],
            "title": a["title"],
            "score": s,
            "snippet": a["text"][:MAX_SNIPPET_CHARS].strip(),
        }
        for s, a in scored[:limit]
    ]
    return {
        "query": query,
        "returned": len(hits),
        "articles": hits,
        "note": "no matching article" if not hits else None,
    }


def search_kb(query: str, limit: int = 3) -> dict[str, Any]:
    """
    Retrieval over the knowledge base: chunk, BM25, rerank, relevance floor.

    Returns chunk-level citations (`refunds#2`) rather than whole-article ones,
    so a reviewer can check the exact paragraph a reply leaned on. "Cited the
    refund policy" is not verifiable; "cited refunds#2" is.
    """
    limit = max(1, min(int(limit), MAX_KB_RESULTS))
    return retrieve(query, _load_kb(), limit=limit, use_rerank=True)


def draft_reply(
    ticket_id: str,
    summary: str,
    next_step: str,
    citations: list[str] | None = None,
) -> dict[str, Any]:
    """
    Compose a draft for a human to review. Deliberately does NOT send.

    Two semantic checks the schema cannot do:

    * the ticket must exist -- a schema-valid `ticket_id` can still be fiction;
    * every citation must name a real article -- otherwise the agent can
      manufacture authority by citing `refund-policy-v2.md`, which sounds
      entirely plausible and does not exist. Fabricated citations are worse
      than no citations, because they survive a skim.
    """
    citations = citations or []
    if ticket_id.upper() not in _load_tickets():
        return {"error": "not_found", "message": f"No ticket {ticket_id!r} to answer."}

    known = {a["id"] for a in _load_kb()}
    unknown = [c for c in citations if c not in known]
    if unknown:
        return {
            "error": "unknown_citation",
            "message": (
                f"These article ids do not exist: {', '.join(unknown)}. "
                f"Search the knowledge base and cite what it returned."
            ),
        }

    return {
        "status": "drafted",
        "sent": False,  # stated explicitly so no reader assumes otherwise
        "ticket_id": ticket_id.upper(),
        "draft": (
            f"Hi,\n\n{summary}\n\nNext step: {next_step}\n\n"
            "Best regards,\nCustomer Support"
        ),
        "citations": citations,
        "requires_human_review": True,
    }


def escalate(ticket_id: str, reason: str, urgency: str = "normal") -> dict[str, Any]:
    """
    Hand over to a human. Always succeeds -- and that is a design decision.

    Escalation is the one path that must never fail, because it is what every
    other failure falls back to. A fallible fallback is not a fallback. So it
    does no lookups, touches no external system, and validates nothing beyond
    its own arguments.
    """
    return {
        "status": "escalated",
        "ticket_id": ticket_id.upper(),
        "urgency": urgency,
        "reason": reason,
        "message": (
            f"Escalated {ticket_id.upper()} to a human ({urgency} urgency): {reason}"
        ),
    }


def issue_refund(
    order_id: str,
    amount: float,
    reason: str,
    approval_token: str | None = None,
    dry_run: bool = True,
) -> dict[str, Any]:
    """
    The only tool that moves money, and the only one that cannot be undone.

    Read the order of the checks -- it is the lesson:

        1. does the order exist                 (semantic validation)
        2. does policy permit this refund       (policy.py, not the prompt)
        3. has this exact refund already run    (idempotency)
        4. dry run?  ->  stop here and report   (recommend vs execute)
        5. is there a valid human approval      (approval gate)
        6. execute, record, audit               (durable, append-only)

    Steps 2 and 3 run *before* the approval gate on purpose. There is no point
    asking a human to approve something policy forbids or that has already
    happened -- and an approval request for an impossible action trains
    reviewers to click through.

    `dry_run` defaults to **True**. The safe thing has to be the default,
    because the unsafe thing will eventually be reached by an argument nobody
    validated. An agent that wants to move money must say so explicitly.
    """
    from .approval import (
        AuditEntry, already_processed, audit, check_approval,
        consume_approval, idempotency_key, record_refund,
    )

    order_id = order_id.upper()
    amount = round(float(amount), 2)
    key = idempotency_key(order_id, amount, reason)

    def refuse(outcome: str, detail: str, **extra: Any) -> dict[str, Any]:
        audit(AuditEntry(action="issue_refund", ticket_id=extra.pop("ticket_id", ""),
                         order_id=order_id, amount=amount, outcome=outcome,
                         detail=detail, idempotency_key=key))
        return {"error": outcome, "message": detail, "refunded": False,
                "idempotency_key": key, **extra}

    # 1 · does the order exist
    order = _load_orders().get(order_id)
    if order is None:
        return refuse("not_found", f"No order {order_id!r}.")

    # 2 · policy, in code
    from .policy import check_refund

    decision = check_refund(order, amount)
    if not decision.allowed:
        return refuse("policy_denied", decision.explain(),
                      policy_reasons=decision.reasons)

    # 3 · idempotency -- before approval, and before any side effect
    prior = already_processed(key)
    if prior:
        # NOT an error. The caller asked for a state ("this refund exists") and
        # that state already holds. Returning success with `duplicate: True` is
        # what makes a retry safe; returning an error invites a workaround.
        return {
            "status": "already_refunded",
            "duplicate": True,
            "refunded": True,
            "order_id": order_id,
            "amount": prior.get("amount"),
            "idempotency_key": key,
            "message": (
                f"This exact refund was already processed "
                f"(key {key}). No second payment was made."
            ),
        }

    # 4 · dry run: recommend, do not execute
    if dry_run:
        audit(AuditEntry(action="issue_refund", ticket_id="", order_id=order_id,
                         amount=amount, outcome="dry_run",
                         detail="policy passed; awaiting human approval",
                         idempotency_key=key))
        return {
            "status": "requires_approval",
            "refunded": False,
            "order_id": order_id,
            "amount": amount,
            "idempotency_key": key,
            "policy": decision.explain(),
            "requires_second_approver": decision.requires_second_approver,
            "message": (
                f"A refund of {amount:.2f} on {order_id} is permitted by policy "
                "but has NOT been issued. A human must approve it."
            ),
        }

    # 5 · the approval gate
    if not approval_token:
        return refuse("approval_required",
                      "Executing a refund requires an approval token from a human.")
    ok, why = check_approval(approval_token, order_id, amount)
    if not ok:
        return refuse("approval_invalid", why)

    # 6 · execute, record, audit -- in that order
    consume_approval(approval_token)
    record_refund(key, {"order_id": order_id, "amount": amount, "reason": reason,
                        "approval_token": approval_token})
    audit(AuditEntry(action="issue_refund", ticket_id="", order_id=order_id,
                     amount=amount, outcome="executed", detail=reason,
                     approver="human", idempotency_key=key))
    return {
        "status": "refunded",
        "refunded": True,
        "duplicate": False,
        "order_id": order_id,
        "amount": amount,
        "idempotency_key": key,
        "message": f"Refunded {amount:.2f} on {order_id}.",
    }


REGISTRY: dict[str, Callable[..., dict[str, Any]]] = {
    "read_ticket": read_ticket,
    "lookup_order": lookup_order,
    "search_kb": search_kb,
    "draft_reply": draft_reply,
    "escalate": escalate,
    "issue_refund": issue_refund,
}


def execute(tool_name: str, arguments: dict[str, Any]) -> dict[str, Any]:
    """
    Validate then run. This is the only path from a model decision to real work.

    Note what is *not* here: no eval, no getattr on a model-supplied string, no
    import by name. The dispatch is a dictionary lookup against a fixed set of
    keys, which is why a hallucinated tool name is a clean error rather than an
    incident.
    """
    if tool_name not in REGISTRY:
        raise UnknownToolError(
            f"No tool named {tool_name!r}. Available: " + ", ".join(sorted(REGISTRY))
        )
    clean = validate_arguments(tool_name, arguments)
    return REGISTRY[tool_name](**clean)


def tool_specs() -> list[dict[str, Any]]:
    """The declarations handed to the model. A copy, so nothing can edit them."""
    return [dict(spec) for spec in TOOL_SCHEMAS]
