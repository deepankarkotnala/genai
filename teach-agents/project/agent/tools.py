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


def search_kb(query: str, limit: int = 3) -> dict[str, Any]:
    """
    Keyword search over the knowledge base.

    Deliberately simple: term overlap against tags and body, tags weighted
    higher. Lesson 5 replaces it with real retrieval. Starting here is on
    purpose -- you should be able to see retrieval fail in an obvious way
    before meeting embeddings, so you know what embeddings are *for*.
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
        # An empty result is information, not an exception. The agent should be
        # able to say "no policy covers this" and escalate instead of inventing.
        "note": "no matching article" if not hits else None,
    }


REGISTRY: dict[str, Callable[..., dict[str, Any]]] = {
    "read_ticket": read_ticket,
    "lookup_order": lookup_order,
    "search_kb": search_kb,
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
