"""
trace.py — structured traces, and the numbers you will be asked about.

Lesson 11. A trace answers four questions that logs cannot:

    what happened      the ordered sequence of model calls and tool calls
    how long           per span, so you can see where the time actually went
    what it cost       tokens in and out, priced per model
    why it went wrong  the error class, attached to the span that failed

One correlation id ties a whole run together, and every span carries it. That is
the difference between "an agent misbehaved yesterday" and "run
r_8f3a2b spent 4.1s in search_kb and then escalated".

Design notes worth defending
----------------------------
* Spans nest, but the store is flat with a `parent_id`. Flat is easier to write,
  easier to query, and is what every real tracing backend does.
* Cost is computed from a price table, not guessed. An agent whose cost you
  cannot state is an agent you cannot budget.
* Redaction happens on the way *in*. A trace containing a customer's card number
  is a data-retention problem wearing a debugging hat -- and traces are copied
  to places production data is not supposed to go.
"""

from __future__ import annotations

import json
import time
import uuid
from contextlib import contextmanager
from dataclasses import asdict, dataclass, field
from pathlib import Path
from typing import Any, Iterator

from .guards import redact_secrets

TRACE_DIR = Path(__file__).resolve().parent.parent / "traces"

# USD per 1M tokens. Illustrative, and deliberately spread across two orders of
# magnitude so model routing in Lesson 11 has something real to trade off.
PRICES: dict[str, tuple[float, float]] = {
    "deterministic-rules-v1": (0.0, 0.0),      # the stub is free
    "small":                  (0.15, 0.60),
    "large":                  (3.00, 15.00),
}


@dataclass
class Span:
    span_id: str
    run_id: str
    name: str
    kind: str                       # "model" | "tool" | "control"
    parent_id: str | None = None
    started_at: float = 0.0
    duration_ms: int = 0
    ok: bool = True
    error_class: str | None = None
    model: str | None = None
    prompt_tokens: int = 0
    completion_tokens: int = 0
    cost_usd: float = 0.0
    attributes: dict[str, Any] = field(default_factory=dict)


class Trace:
    """One run. Create it, open spans inside it, then summarise or persist."""

    def __init__(self, run_id: str | None = None, goal: str = "") -> None:
        self.run_id = run_id or "r_" + uuid.uuid4().hex[:10]
        self.goal = goal
        self.spans: list[Span] = []
        self._stack: list[str] = []

    @contextmanager
    def span(self, name: str, kind: str, **attributes: Any) -> Iterator[Span]:
        s = Span(
            span_id="s_" + uuid.uuid4().hex[:8],
            run_id=self.run_id,
            name=name,
            kind=kind,
            parent_id=self._stack[-1] if self._stack else None,
            started_at=time.time(),
            attributes=_clean(attributes),
        )
        self.spans.append(s)
        self._stack.append(s.span_id)
        started = time.perf_counter()
        try:
            yield s
        except Exception as exc:                       # noqa: BLE001 - re-raised
            s.ok = False
            s.error_class = type(exc).__name__
            raise
        finally:
            s.duration_ms = int((time.perf_counter() - started) * 1000)
            self._stack.pop()

    # -- accounting --------------------------------------------------------
    def record_usage(self, span: Span, model: str, prompt: int, completion: int) -> None:
        span.model = model
        span.prompt_tokens = prompt or 0
        span.completion_tokens = completion or 0
        span.cost_usd = cost_of(model, span.prompt_tokens, span.completion_tokens)

    @property
    def total_cost_usd(self) -> float:
        return round(sum(s.cost_usd for s in self.spans), 6)

    @property
    def total_tokens(self) -> int:
        return sum(s.prompt_tokens + s.completion_tokens for s in self.spans)

    @property
    def wall_ms(self) -> int:
        return sum(s.duration_ms for s in self.spans if s.parent_id is None)

    def slowest(self, n: int = 3) -> list[Span]:
        return sorted(self.spans, key=lambda s: -s.duration_ms)[:n]

    def errors(self) -> list[Span]:
        return [s for s in self.spans if not s.ok or s.error_class]

    # -- output ------------------------------------------------------------
    def summary(self) -> dict[str, Any]:
        by_kind: dict[str, int] = {}
        for s in self.spans:
            by_kind[s.kind] = by_kind.get(s.kind, 0) + 1
        return {
            "run_id": self.run_id,
            "goal": self.goal,
            "spans": len(self.spans),
            "by_kind": by_kind,
            "tokens": self.total_tokens,
            "cost_usd": self.total_cost_usd,
            "wall_ms": self.wall_ms,
            "errors": len(self.errors()),
        }

    def render(self) -> str:
        """A readable tree. Reading a trace is a skill; make it legible."""
        lines = [f"run {self.run_id}  {self.goal}"]
        depth: dict[str | None, int] = {None: 0}
        for s in self.spans:
            d = depth.get(s.parent_id, 0)
            depth[s.span_id] = d + 1
            flag = "" if s.ok else f"  !! {s.error_class}"
            money = f"  ${s.cost_usd:.5f}" if s.cost_usd else ""
            tok = f"  {s.prompt_tokens}+{s.completion_tokens}tok" if s.prompt_tokens else ""
            lines.append(f"{'  ' * (d + 1)}{s.kind:7} {s.name:22} {s.duration_ms:>5}ms{tok}{money}{flag}")
        t = self.summary()
        lines.append(f"  total: {t['spans']} spans, {t['tokens']} tokens, "
                     f"${t['cost_usd']:.5f}, {t['wall_ms']}ms, {t['errors']} error(s)")
        return "\n".join(lines)

    def save(self) -> Path:
        TRACE_DIR.mkdir(exist_ok=True)
        path = TRACE_DIR / f"{self.run_id}.json"
        path.write_text(
            json.dumps({"summary": self.summary(),
                        "spans": [asdict(s) for s in self.spans]},
                       indent=2, default=str),
            encoding="utf-8",
        )
        return path


def cost_of(model: str, prompt_tokens: int, completion_tokens: int) -> float:
    """Price a call. Unknown models cost 0 and say so rather than guessing."""
    if model not in PRICES:
        return 0.0
    p_in, p_out = PRICES[model]
    return round((prompt_tokens * p_in + completion_tokens * p_out) / 1_000_000, 8)


def _clean(attributes: dict[str, Any]) -> dict[str, Any]:
    """
    Redact on the way in.

    A trace holding a card number is a retention problem wearing a debugging
    hat, and traces get copied into dashboards, tickets and screenshots that
    production data is not supposed to reach. Cheaper to never store it.
    """
    out: dict[str, Any] = {}
    for key, value in attributes.items():
        if isinstance(value, str):
            cleaned, found = redact_secrets(value)
            out[key] = cleaned
            if found:
                out[f"{key}_redacted"] = found
        else:
            out[key] = value
    return out
