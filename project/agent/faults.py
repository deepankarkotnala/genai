"""
faults.py — deliberate breakage, so Lesson 7 can be run rather than described.

Reliability is the one topic you cannot learn from prose. You have to watch the
agent hang, loop and half-succeed, then watch your controls catch it. This module
lets a lesson (or a test) inject the four failures that actually happen in
production, without editing the tools.

    slow          the tool answers, eventually. Tests timeouts.
    flaky         fails N times, then succeeds. Tests retry budgets.
    unavailable   always fails. Tests fallbacks and safe termination.
    partial       succeeds but returns incomplete data. The nastiest one,
                  because nothing raises and nothing looks wrong.

Fault injection lives here rather than in `tools.py` on purpose: the tools stay
honest, and the controller is what gets exercised.
"""

from __future__ import annotations

import time
from dataclasses import dataclass, field


@dataclass
class FaultPlan:
    """What should go wrong. Empty by default -- nothing is broken unless asked."""

    slow: dict[str, float] = field(default_factory=dict)      # tool -> seconds
    flaky: dict[str, int] = field(default_factory=dict)       # tool -> failures first
    unavailable: set[str] = field(default_factory=set)
    partial: set[str] = field(default_factory=set)

    _attempts: dict[str, int] = field(default_factory=dict, repr=False)

    def reset(self) -> None:
        self._attempts.clear()

    def before_call(self, tool: str) -> None:
        """
        Raise or sleep as configured. Called before the real tool runs.

        `TimeoutError` and `ConnectionError` are deliberately the standard
        library's own exceptions -- the controller should not need a bespoke
        error type to recognise a transport failure, and neither should you.
        """
        self._attempts[tool] = self._attempts.get(tool, 0) + 1
        attempt = self._attempts[tool]

        if tool in self.unavailable:
            raise ConnectionError(f"{tool} is unavailable")

        if tool in self.flaky and attempt <= self.flaky[tool]:
            raise ConnectionError(
                f"{tool} transient failure (attempt {attempt} of "
                f"{self.flaky[tool] + 1} before it succeeds)"
            )

        if tool in self.slow:
            time.sleep(self.slow[tool])

    def degrade(self, tool: str, result: dict) -> dict:
        """
        Quietly damage a successful result.

        This models the failure people forget: the call returned 200, the shape
        is right, and a field you needed is missing. Nothing raises. The agent
        proceeds on incomplete facts, which is how a refund gets recommended for
        an order whose eligibility was never actually read.
        """
        if tool not in self.partial or result.get("error"):
            return result
        damaged = dict(result)
        for field_name in ("refund_eligible", "already_refunded", "days_since_purchase"):
            damaged.pop(field_name, None)
        damaged["_partial"] = True
        return damaged


# The active plan. A lesson sets it, a test sets it, production never does.
ACTIVE = FaultPlan()


def set_faults(plan: FaultPlan | None = None) -> FaultPlan:
    global ACTIVE
    ACTIVE = plan or FaultPlan()
    ACTIVE.reset()
    return ACTIVE
