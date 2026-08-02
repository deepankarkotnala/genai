"""
state.py — run state, which is not memory.

Lesson 6. The distinction candidates fumble most often:

    STATE   belongs to ONE run. Where am I, what have I gathered, what is left
            of my budget? Discarded when the run ends. If the process dies,
            state is what you need to resume (Lesson 14).

    MEMORY  outlives the run. What do I know about this customer from last
            month? Persisted deliberately, with rules about what is worth
            keeping (see memory.py).

Conflating them produces two opposite bugs. Treat state as memory and last
week's half-finished investigation leaks into today's answer. Treat memory as
state and the agent forgets the customer between tickets while insisting it
remembers.

A useful test: **if it would be wrong to still have this tomorrow, it is state.**
"""

from __future__ import annotations

import json
from dataclasses import asdict, dataclass, field
from typing import Any

# A token is roughly four characters of English. This is an estimate, not a
# tokeniser: good enough to make budget decisions, and honest about it. A real
# system uses the provider's own counter, because being 20% wrong about the
# budget is how you get a truncation error in production.
CHARS_PER_TOKEN = 4


@dataclass
class RunState:
    """Everything true about one run, and nothing that outlives it."""

    goal: str
    ticket_id: str | None = None
    step: int = 0
    max_steps: int = 6

    # Budgets. Steps alone are a poor bound: one expensive call can cost more
    # than five cheap ones, so tokens are tracked too (Lesson 11 adds money).
    token_budget: int = 6000
    tokens_used: int = 0

    facts: dict[str, Any] = field(default_factory=dict)
    tools_attempted: list[str] = field(default_factory=list)
    compactions: int = 0

    # -- budget ------------------------------------------------------------
    def steps_left(self) -> int:
        return max(0, self.max_steps - self.step)

    def tokens_left(self) -> int:
        return max(0, self.token_budget - self.tokens_used)

    def over_budget(self) -> bool:
        return self.steps_left() == 0 or self.tokens_left() <= 0

    def spend(self, tokens: int) -> None:
        self.tokens_used += max(0, tokens)

    # -- facts -------------------------------------------------------------
    def record(self, tool: str, result: dict[str, Any]) -> None:
        """
        Remember that a tool ran, and its result if it succeeded.

        Both halves matter. `tools_attempted` grows even on failure, which is
        what stops the agent retrying a call that already failed identically --
        the infinite-retry bug from Lesson 2, now a first-class part of state
        rather than something the backend has to infer from the transcript.
        """
        self.tools_attempted.append(tool)
        if not result.get("error"):
            self.facts[tool] = result

    def attempted(self, tool: str) -> bool:
        return tool in self.tools_attempted

    # -- persistence (used properly in Lesson 14) --------------------------
    def to_json(self) -> str:
        return json.dumps(asdict(self), default=str, indent=2)

    @classmethod
    def from_json(cls, blob: str) -> "RunState":
        return cls(**json.loads(blob))

    def summary(self) -> str:
        return (
            f"step {self.step}/{self.max_steps} · "
            f"tokens {self.tokens_used}/{self.token_budget} · "
            f"facts: {', '.join(self.facts) or 'none'}"
            + (f" · compacted {self.compactions}x" if self.compactions else "")
        )


def estimate_tokens(text: str) -> int:
    return max(1, len(text) // CHARS_PER_TOKEN)
