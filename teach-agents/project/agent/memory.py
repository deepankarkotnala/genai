"""
memory.py — the context window as a budget, and the two stores worth building.

Lesson 6. There are seven things people call "memory" in an agent. Naming all
seven is interview-useful; building all seven is not. This module builds the two
the triage agent actually needs and tables the rest.

    STORE                 what it holds                      built here
    --------------------  ---------------------------------  ----------
    conversation history  the message list for this run       YES
    workflow state        step, budget, facts (state.py)      YES (state.py)
    working memory        scratch notes inside one step        no
    long-term memory      facts that outlive the run          YES (ticket history)
    user profile          durable preferences per customer     no
    retrieval store       documents (retrieval.py)            YES (Lesson 5)
    audit history         what was done, immutably            Lesson 8

The unbuilt three are not hard; they are just not needed for this agent, and an
agent carrying stores it does not use is slower, dearer and harder to debug.

`memory.html` in the deep dives covers the taxonomy (including CoALA's four
types) if you want the full map.
"""

from __future__ import annotations

import json
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

from brain import Message
from .state import estimate_tokens

FIXTURES = Path(__file__).resolve().parent.parent / "fixtures"

# When the transcript exceeds this share of the budget, compact it. Not 100%:
# compacting at the limit is too late, because the compaction call itself needs
# room to run.
COMPACT_AT = 0.7
# Always keep the system prompt, the goal, and this many recent turns verbatim.
# 2 = the most recent (assistant, tool) pair. Keeping more sounds safer and is
# not: the newest tool result is usually the largest, so a generous KEEP_RECENT
# protects exactly the messages that caused the problem.
KEEP_RECENT = 2

# Hard cap on any single tool result once it is in the transcript. This is the
# other half of the fix, and the half people forget. Compaction cannot help when
# one *recent* result is the bulk of the prompt -- the only remedy there is to
# stop putting the whole thing in. Cap at the source, summarise the rest.
MAX_TOOL_RESULT_TOKENS = 120


# --------------------------------------------------------------------------
# 1 · Conversation history, with compaction
# --------------------------------------------------------------------------
@dataclass
class ConversationHistory:
    """
    The message list, plus the ability to shrink it without losing the thread.

    Why this exists: every loop step appends a tool result, so the transcript
    grows monotonically while the window does not. Twenty steps in, the goal is
    a rounding error in what the model is looking at, and the agent drifts. That
    drift is not the model being stupid; it is you having diluted the prompt.
    """

    messages: list[Message] = field(default_factory=list)
    compactions: int = 0

    truncations: int = 0

    def add(self, message: Message) -> None:
        """Append, capping an oversized tool result before it ever lands."""
        if message.role == "tool" and estimate_tokens(message.content) > MAX_TOOL_RESULT_TOKENS:
            keep = MAX_TOOL_RESULT_TOKENS * 4  # tokens back to characters
            message = Message(
                message.role,
                message.content[:keep]
                + f"\n...[truncated: {estimate_tokens(message.content)} tokens, "
                  f"capped at {MAX_TOOL_RESULT_TOKENS}]",
                tool_name=message.tool_name,
            )
            self.truncations += 1
        self.messages.append(message)

    def tokens(self) -> int:
        return sum(estimate_tokens(m.content) for m in self.messages)

    def should_compact(self, budget: int) -> bool:
        return self.tokens() > budget * COMPACT_AT

    def compact(self) -> str:
        """
        Replace the middle of the transcript with a summary of what was learned.

        The order of operations is the whole lesson:

        * the **system prompt** stays verbatim -- it is the instructions;
        * the **goal** (first user turn) stays verbatim -- drop it and the agent
          is answering a question it can no longer see;
        * the **recent turns** stay verbatim -- they are what the next decision
          is actually about;
        * the **middle** becomes one summary line per tool that ran.

        Summarising is lossy on purpose. The alternative -- dropping the oldest
        messages blindly -- loses the same information without recording that
        anything was lost, which is how an agent ends up re-running a tool it
        already ran.
        """
        if len(self.messages) <= KEEP_RECENT + 2:
            return "nothing to compact"

        system = [m for m in self.messages if m.role == "system"][:1]
        goal = [m for m in self.messages if m.role == "user"][:1]
        recent = self.messages[-KEEP_RECENT:]
        middle = [m for m in self.messages if m not in system + goal + recent]

        learned: list[str] = []
        for m in middle:
            if m.role == "tool" and m.tool_name:
                learned.append(f"- {m.tool_name}: {_gist(m.content)}")
        digest = "\n".join(learned) or "- (no tool results in the compacted span)"

        summary = Message(
            "assistant",
            "Summary of earlier steps (compacted to fit the context window):\n" + digest,
        )
        before = self.tokens()
        candidate = system + goal + [summary] + recent
        after = sum(estimate_tokens(m.content) for m in candidate)

        # Refuse a compaction that does not pay for itself. Summarising a span of
        # short messages can easily produce a summary longer than the span --
        # you would spend a model call, lose detail, AND grow the prompt. Worth
        # checking rather than assuming: "compact when full" is the instinct,
        # "compact when it helps" is the rule.
        if after >= before:
            return f"compaction skipped: would grow {before} -> {after} tokens"

        self.messages = candidate
        self.compactions += 1
        return f"compacted {before} -> {after} tokens ({len(middle)} messages)"


def _gist(blob: str) -> str:
    """One short line describing a tool result, for the compaction summary."""
    try:
        data = json.loads(blob)
    except json.JSONDecodeError:
        return blob[:90]
    if not isinstance(data, dict):
        return str(data)[:90]
    if data.get("error"):
        return f"failed ({data['error']})"
    keys = ("ticket_id", "order_id", "category", "priority", "amount",
            "refund_eligible", "status", "returned")
    bits = [f"{k}={data[k]}" for k in keys if k in data]
    if "articles" in data:
        bits.append("cited=" + ",".join(a.get("chunk_id", a.get("id", "?"))
                                       for a in data["articles"][:3]))
    return "; ".join(bits) or json.dumps(data)[:90]


# --------------------------------------------------------------------------
# 2 · Long-term memory: prior tickets for this customer
# --------------------------------------------------------------------------
def recall_prior_tickets(ticket_id: str, limit: int = 3) -> dict[str, Any]:
    """
    What else has this customer contacted us about?

    Long-term memory in one function. It is a *lookup*, not a mystery: the same
    machinery as retrieval, pointed at history rather than documents. That
    equivalence is worth saying in an interview -- memory and RAG are the same
    mechanism with different purposes, which is the framing `memory.html` uses.

    The write rule here is deliberately strict: nothing is written at all. The
    tickets are the record. Agents that write their own memories need a policy
    for what is worth keeping and a way to correct a wrong one, and an agent
    that confidently recalls something false is worse than one that recalls
    nothing. Lesson 8's audit log is the first thing this agent genuinely writes,
    and it is append-only for exactly that reason.
    """
    raw = json.loads((FIXTURES / "tickets.json").read_text(encoding="utf-8"))
    by_id = {t["ticket_id"]: t for t in raw}
    this = by_id.get(ticket_id.upper())
    if not this:
        return {"error": "not_found", "message": f"No ticket {ticket_id!r}."}

    tier = this.get("customer_tier")
    prior = [
        {
            "ticket_id": t["ticket_id"],
            "created_at": t["created_at"],
            "category": t["category"],
            "subject": t["subject"],
            "status": t["status"],
        }
        for t in raw
        if t["ticket_id"] != this["ticket_id"] and t.get("customer_tier") == tier
    ]
    prior.sort(key=lambda t: t["created_at"], reverse=True)
    return {
        "ticket_id": this["ticket_id"],
        "customer_tier": tier,
        "returned": len(prior[:limit]),
        "prior_tickets": prior[:limit],
        # Stated so a reader does not mistake a tier match for a customer match.
        "basis": "matched on customer_tier (the fixture has no customer id)",
    }
