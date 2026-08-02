"""
brain.py — the one place the agent talks to a model.

Why this file exists at all
---------------------------
An agent is a loop around a decision-maker. If the loop calls a vendor SDK
directly, the loop and the vendor are welded together: you cannot test the loop
without a network call, you cannot swap models, and you cannot reproduce a bug.

So the loop never imports a vendor SDK. It depends on one small interface --
`Brain` -- with a single method, `decide()`. Everything else is an adapter.

Three backends implement it:

    StubBrain    deterministic, offline, no API key   <- the course default
    OllamaBrain  a local model via Ollama             <- optional
    ClaudeBrain  a hosted model                       <- optional adapter

The stub is not a mock that returns a fixed string. It is a small rule engine
that reads the same conversation the real models read and decides the next
action from it, so it drives *the same loop* through the same states. That is
the point: the loop cannot tell which backend it is talking to.

Interview note
--------------
"How would you test an agent?" is a common question, and the answer people
reach for is "mock the LLM". That is only half of it. A mock that always
returns the same tool call cannot exercise a multi-step trajectory, so it never
tests the interesting part -- what the loop does with results it did not
expect. A deterministic backend that *reacts to tool output* does.
"""

from __future__ import annotations

import json
import os
import time
from dataclasses import dataclass, field
from typing import Any, Protocol


# --------------------------------------------------------------------------
# Errors -- the transport layer and the content layer fail differently, and
# conflating them is how agents end up retrying things that can never succeed.
# --------------------------------------------------------------------------
class BrainError(Exception):
    """Base class for anything wrong with the model call itself."""


class BrainUnavailable(BrainError):
    """The backend could not be reached at all. Never worth a content retry."""


class BrainTimeout(BrainError):
    """The backend was reached but did not answer in time."""


class ModelNotInstalled(BrainError):
    """The backend is up but the requested model is not present."""


class MalformedDecision(BrainError):
    """The model answered, but not in a shape we can use. Retryable *once*."""


# --------------------------------------------------------------------------
# The wire types. Small, boring, and shared by every backend.
# --------------------------------------------------------------------------
@dataclass(frozen=True)
class Message:
    """One turn of the conversation. `role` is system | user | assistant | tool."""

    role: str
    content: str
    # Set only on role="tool", so the model can tell which call this answers.
    tool_name: str | None = None


@dataclass(frozen=True)
class ToolCall:
    name: str
    arguments: dict[str, Any] = field(default_factory=dict)


@dataclass(frozen=True)
class BrainResult:
    """
    Exactly one of `tool_call` or `final_text` is set.

    The telemetry fields are not decoration. "What did this run cost and where
    did the time go" is a question you will be asked about any agent you have
    built, and you cannot answer it if the numbers were never captured.
    """

    tool_call: ToolCall | None
    final_text: str | None
    backend: str
    model: str
    latency_ms: int
    prompt_tokens: int | None = None
    completion_tokens: int | None = None
    truncated: bool = False

    def __post_init__(self) -> None:
        if (self.tool_call is None) == (self.final_text is None):
            raise MalformedDecision(
                "a decision must be either a tool call or a final answer, not both "
                f"and not neither (got tool_call={self.tool_call!r}, "
                f"final_text={self.final_text!r})"
            )


class Brain(Protocol):
    """The whole contract. If it has this method, the loop can drive it."""

    name: str

    def decide(self, messages: list[Message], tools: list[dict]) -> BrainResult:
        """Look at the conversation so far and choose the single next action."""
        ...


# --------------------------------------------------------------------------
# StubBrain -- the deterministic backend
# --------------------------------------------------------------------------
class StubBrain:
    """
    A rule engine standing in for a model.

    It reads the conversation exactly as a real model would: the user's goal
    plus every tool result so far. Its rules are written in terms of *what it
    has learned*, not *how many turns have passed*, which is why it produces a
    real multi-step trajectory and why removing a tool or changing a fixture
    changes its behaviour.

    Deliberate limitation: it is not a language model. See LIMITATIONS in the
    lesson and in README.md.
    """

    name = "stub"
    model = "deterministic-rules-v1"

    def __init__(self, *, latency_ms: int = 0) -> None:
        # Configurable so a lesson can simulate a slow model without a network.
        self._latency_ms = latency_ms

    def decide(self, messages: list[Message], tools: list[dict]) -> BrainResult:
        started = time.perf_counter()
        if self._latency_ms:
            time.sleep(self._latency_ms / 1000.0)

        available = {t["name"] for t in tools}
        goal = _first_user_message(messages)
        observed = _tool_results(messages)
        attempted = _attempted_tools(messages)

        # Lesson 4's patterns ask for a plan, a critique or a route instead of a
        # tool call. With a real model these are just differently-worded
        # prompts, so the stub detects them the same way a model would: by
        # reading the request. No extra protocol method, no special API.
        special = _special_request(messages)
        if special:
            decision = self._answer_special(special, messages, goal, observed)
        else:
            decision = self._choose(goal, observed, available, attempted)
        elapsed = int((time.perf_counter() - started) * 1000)

        # Token counts are a rough word count. Honest about being an estimate:
        # the field is here so the loop's accounting code is exercised, not to
        # pretend a rule engine has a tokeniser.
        prompt_words = sum(len(m.content.split()) for m in messages)

        if isinstance(decision, ToolCall):
            return BrainResult(
                tool_call=decision,
                final_text=None,
                backend=self.name,
                model=self.model,
                latency_ms=elapsed,
                prompt_tokens=prompt_words,
                completion_tokens=len(json.dumps(decision.arguments).split()),
            )
        return BrainResult(
            tool_call=None,
            final_text=decision,
            backend=self.name,
            model=self.model,
            latency_ms=elapsed,
            prompt_tokens=prompt_words,
            completion_tokens=len(decision.split()),
        )

    # -- responses to the pattern prompts (Lesson 4) ------------------------
    def _answer_special(
        self, kind: str, messages: list[Message], goal: str, observed: dict[str, Any]
    ) -> str:
        if kind == "ROUTE_REQUEST":
            text = " ".join(m.content for m in messages).lower()
            if any(w in text for w in ("refund", "invoice", "billing", "charged", "payment")):
                return "billing"
            if any(w in text for w in ("502", "error", "checkout fails", "technical", "outage")):
                return "technical"
            return "general"

        if kind == "PLAN_REQUEST":
            # A plan written before anything has run. Note it names a ticket it
            # has not read and an order it cannot know -- which is exactly the
            # weakness the lesson makes the learner observe.
            ticket = _extract(goal, prefix="TCK-") or "TCK-1001"
            return "\n".join(
                [
                    f"read_ticket({ticket})",
                    "lookup_order(from ticket body)",
                    "search_kb(from ticket category)",
                    "draft_reply(cite what search_kb returned)",
                ]
            )

        if kind == "CRITIQUE_REQUEST":
            # Critique the DRAFT only. Scanning the whole history would let the
            # system prompt's own words ("policy", "escalate") satisfy the
            # checks and the critique would always come back clean -- a
            # self-congratulating reviewer, which is worse than none.
            draft = ""
            for m in messages:
                if m.role == "user" and "CRITIQUE_REQUEST" in m.content:
                    _, _, after = m.content.partition("Draft answer:")
                    draft = after
                    break
            gaps = []
            if "refund_eligible" not in draft:
                gaps.append("it does not state whether the order is refund eligible")
            if "policy" not in draft.lower():
                gaps.append("it cites no policy article")
            if "escalat" not in draft.lower() and "review" not in draft.lower():
                gaps.append("it does not say who acts next")
            if not gaps:
                return "No material gaps: the facts are cited and the next step is stated."
            return "Gaps: " + "; ".join(gaps) + "."

        # The revision turn: a plain final answer built from what was gathered.
        return _summarise(
            observed.get("read_ticket"), observed.get("lookup_order"), observed.get("search_kb")
        ) + " Revised to name the eligibility, the policy and the reviewer explicitly."

    # -- the rules ---------------------------------------------------------
    def _choose(
        self,
        goal: str,
        observed: dict[str, Any],
        available: set[str],
        attempted: set[str],
    ) -> ToolCall | str:
        """
        Each rule asks "what do I still not know?" and never "which turn is
        this?". That is what makes the trajectory react to results.

        `attempted` matters as much as `observed`. Without it a tool that keeps
        failing gets called forever, because "I have no ticket" stays true no
        matter how many times reading it fails. Retrying a call that already
        failed identically is the single most common way an agent burns its
        step budget -- Lesson 7 makes a proper controller out of this idea.
        """
        ticket = observed.get("read_ticket")
        order = observed.get("lookup_order")
        kb = observed.get("search_kb")

        # 1. Nothing known yet -> read the ticket the goal names. Only once.
        if ticket is None and "read_ticket" not in attempted and "read_ticket" in available:
            ticket_id = _extract(goal, prefix="TCK-")
            if ticket_id:
                return ToolCall("read_ticket", {"ticket_id": ticket_id})

        # If reading the ticket was tried and produced nothing usable, there is
        # no path forward. Prefer an explicit escalation over a text apology:
        # escalation creates a record and a queue entry, prose creates neither.
        if ticket is None:
            ticket_id = _extract(goal, prefix="TCK-") or "unknown"
            if "escalate" in available and "escalate" not in attempted:
                return ToolCall(
                    "escalate",
                    {
                        "ticket_id": ticket_id,
                        "reason": "Could not read the ticket, so no facts could be established.",
                        "urgency": "normal",
                    },
                )
            return _summarise(None, None, None)

        # A partially-successful call is the dangerous one: nothing raised, the
        # shape is right, and a field we need is absent. Detecting it is the
        # controller's job; *refusing to proceed on it* is this layer's job.
        # Without this rule the agent produced "refund_eligible=None" in a
        # customer-facing summary and reported the run as resolved.
        incomplete = [name for name, res in observed.items()
                      if isinstance(res, dict) and res.get("_partial")]
        if incomplete and "escalate" in available and "escalate" not in attempted:
            return ToolCall(
                "escalate",
                {
                    "ticket_id": ticket.get("ticket_id", "unknown"),
                    "reason": (
                        f"{', '.join(incomplete)} returned incomplete data, so "
                        "eligibility could not be confirmed."
                    ),
                    "urgency": "normal",
                },
            )

        # A tool that stayed unavailable through its retries is not something to
        # work around silently -- hand over, and say which tool failed.
        broken = [
            name for name in ("lookup_order", "search_kb")
            if name in attempted and name not in observed
        ]
        if broken and "escalate" in available and "escalate" not in attempted:
            return ToolCall(
                "escalate",
                {
                    "ticket_id": ticket.get("ticket_id", "unknown"),
                    "reason": f"Could not complete {', '.join(broken)} after retries.",
                    "urgency": "high" if ticket.get("priority") in ("High", "Urgent") else "normal",
                },
            )

        # 2. Ticket mentions an order -> look it up before advising anything.
        #    Driven by the *content of the tool result*, not by a step counter.
        if order is None and "lookup_order" not in attempted and "lookup_order" in available:
            order_id = _extract(json.dumps(ticket), prefix="ORD-")
            if order_id:
                return ToolCall("lookup_order", {"order_id": order_id})

        # 3. Know the ticket (and order, if any) -> find the policy that applies.
        if kb is None and "search_kb" not in attempted and "search_kb" in available:
            category = (ticket.get("category") or "billing").lower()
            return ToolCall("search_kb", {"query": category, "limit": 2})

        # 4. Facts gathered -> draft a reply for a human, citing only articles
        #    the knowledge base actually returned. Citing from memory here is
        #    how fabricated references get into customer mail; draft_reply
        #    rejects unknown ids for exactly that reason.
        if "draft_reply" not in attempted and "draft_reply" in available:
            # Deduplicated: retrieval returns chunks, and two chunks from one
            # article would otherwise be cited twice as if they were two sources.
            cites: list[str] = []
            for article in (kb or {}).get("articles", []):
                aid = article.get("id")
                if aid and aid not in cites:
                    cites.append(aid)
            cites = cites[:2]
            return ToolCall(
                "draft_reply",
                {
                    "ticket_id": ticket.get("ticket_id", ""),
                    "summary": (
                        f"Your {ticket.get('category', 'support')} issue at "
                        f"{ticket.get('priority', 'normal')} priority has been reviewed."
                    ),
                    "next_step": "A support agent will confirm and reply to you.",
                    "citations": cites,
                },
            )

        # 5. Enough gathered -> answer, citing what was actually retrieved.
        return _summarise(ticket, order, kb)


def _summarise(ticket: Any, order: Any, kb: Any) -> str:
    if not ticket:
        return (
            "I could not read the ticket, so I have nothing to work from. "
            "Escalating rather than guessing."
        )
    lines = [
        f"Ticket {ticket.get('ticket_id')} is a {ticket.get('category')} issue "
        f"at {ticket.get('priority')} priority from a "
        f"{ticket.get('customer_tier')} customer."
    ]
    if order:
        lines.append(
            f"Order {order.get('order_id')} totals {order.get('amount')} "
            f"{order.get('currency')} and refund_eligible="
            f"{order.get('refund_eligible')}."
        )
    if kb:
        # Deduplicated: retrieval returns chunks, so two sections of one article
        # would otherwise be listed as "Refund policy, Refund policy".
        titles: list[str] = []
        for article in kb.get("articles", []):
            title = article.get("title", "?")
            if title not in titles:
                titles.append(title)
        lines.append(f"Relevant policy: {', '.join(titles)}.")
    lines.append(
        "Recommended next step: draft a reply quoting the policy above. "
        "No refund is issued here -- that needs the approval path from Lesson 8."
    )
    return " ".join(lines)


# --------------------------------------------------------------------------
# Optional real backends. Imported lazily so the course never needs them.
# --------------------------------------------------------------------------
class OllamaBrain:
    """
    A local model through Ollama. Optional -- the course does not require it.

    Kept deliberately thin. The interesting engineering is in the loop and the
    tool layer, not in HTTP plumbing.
    """

    name = "ollama"

    def __init__(
        self,
        model: str | None = None,
        base_url: str | None = None,
        timeout_s: int = 120,
    ) -> None:
        self.model = model or os.environ.get("OLLAMA_MODEL", "gemma3:4b")
        self.base_url = base_url or os.environ.get(
            "OLLAMA_BASE_URL", "http://localhost:11434"
        )
        self.timeout_s = timeout_s

    def decide(self, messages: list[Message], tools: list[dict]) -> BrainResult:
        try:
            import requests  # noqa: PLC0415 -- optional dependency, imported on use
        except ImportError as exc:  # pragma: no cover - environment dependent
            raise BrainUnavailable(
                "The Ollama backend needs `requests`. Install it with:\n"
                "    python -m pip install requests"
            ) from exc

        payload = {
            "model": self.model,
            "messages": [{"role": m.role, "content": m.content} for m in messages],
            "tools": [{"type": "function", "function": t} for t in tools],
            "stream": False,
            "options": {"temperature": 0},
        }
        started = time.perf_counter()
        try:
            resp = requests.post(
                f"{self.base_url}/api/chat", json=payload, timeout=self.timeout_s
            )
        except requests.exceptions.Timeout as exc:
            raise BrainTimeout(
                f"Ollama did not respond within {self.timeout_s}s. "
                "A smaller model (gemma3:1b) or a longer timeout may help."
            ) from exc
        except requests.exceptions.ConnectionError as exc:
            raise BrainUnavailable(
                f"Cannot reach Ollama at {self.base_url}\n"
                "Start it with:\n    ollama serve"
            ) from exc

        if resp.status_code == 404:
            raise ModelNotInstalled(
                f"Model '{self.model}' is not installed.\n"
                f"Install it with:\n    ollama pull {self.model}"
            )
        resp.raise_for_status()
        body = resp.json()
        elapsed = int((time.perf_counter() - started) * 1000)
        return _decode_openai_style(
            body, backend=self.name, model=self.model, latency_ms=elapsed
        )


class ClaudeBrain:
    """
    Reference adapter for a hosted provider. Requires the `anthropic` package
    and an API key, so it is never exercised by the course's tests.
    """

    name = "claude"

    def __init__(self, model: str = "claude-sonnet-5") -> None:
        self.model = model

    def decide(self, messages: list[Message], tools: list[dict]) -> BrainResult:
        try:
            import anthropic  # noqa: PLC0415 -- optional dependency
        except ImportError as exc:
            raise BrainUnavailable(
                "The Claude backend needs the `anthropic` package:\n"
                "    python -m pip install anthropic\n"
                "and ANTHROPIC_API_KEY in your environment.\n"
                "The course does not require this -- the stub backend is the default."
            ) from exc

        client = anthropic.Anthropic()
        system = " ".join(m.content for m in messages if m.role == "system")
        turns = [
            {"role": "assistant" if m.role == "assistant" else "user",
             "content": m.content}
            for m in messages
            if m.role != "system"
        ]
        started = time.perf_counter()
        resp = client.messages.create(
            model=self.model,
            max_tokens=1024,
            system=system or "You are a support triage agent.",
            messages=turns,
            tools=[
                {
                    "name": t["name"],
                    "description": t["description"],
                    "input_schema": t["parameters"],
                }
                for t in tools
            ],
        )
        elapsed = int((time.perf_counter() - started) * 1000)
        for block in resp.content:
            if getattr(block, "type", None) == "tool_use":
                return BrainResult(
                    tool_call=ToolCall(block.name, dict(block.input)),
                    final_text=None,
                    backend=self.name,
                    model=self.model,
                    latency_ms=elapsed,
                    prompt_tokens=resp.usage.input_tokens,
                    completion_tokens=resp.usage.output_tokens,
                    truncated=resp.stop_reason == "max_tokens",
                )
        text = "".join(getattr(b, "text", "") for b in resp.content)
        return BrainResult(
            tool_call=None,
            final_text=text or "(no answer)",
            backend=self.name,
            model=self.model,
            latency_ms=elapsed,
            prompt_tokens=resp.usage.input_tokens,
            completion_tokens=resp.usage.output_tokens,
            truncated=resp.stop_reason == "max_tokens",
        )


# --------------------------------------------------------------------------
# Selection
# --------------------------------------------------------------------------
def get_brain(name: str | None = None) -> Brain:
    """
    Pick a backend. Defaults to the stub, so nothing in the course needs a key.

    Unlike the supplementary EDA lab -- where the local model is the normal
    backend and falling back silently would be dishonest -- here the stub *is*
    the intended backend for teaching. It is chosen explicitly, never as a
    silent fallback after a failure.
    """
    choice = (name or os.environ.get("AGENT_BRAIN", "stub")).strip().lower()
    if choice == "stub":
        return StubBrain()
    if choice == "ollama":
        return OllamaBrain()
    if choice == "claude":
        return ClaudeBrain()
    raise BrainUnavailable(
        f"Unknown backend {choice!r}. Set AGENT_BRAIN to one of: stub, ollama, claude."
    )


# --------------------------------------------------------------------------
# Helpers
# --------------------------------------------------------------------------
def _first_user_message(messages: list[Message]) -> str:
    for m in messages:
        if m.role == "user":
            return m.content
    return ""


def _tool_results(messages: list[Message]) -> dict[str, Any]:
    """Latest parsed result per tool name, so rules read state not turn count."""
    out: dict[str, Any] = {}
    for m in messages:
        if m.role != "tool" or not m.tool_name:
            continue
        try:
            parsed = json.loads(m.content)
        except json.JSONDecodeError:
            parsed = {"raw": m.content}
        if isinstance(parsed, dict) and parsed.get("error"):
            continue  # a failed call teaches nothing; let the rules retry or move on
        out[m.tool_name] = parsed
    return out


def _special_request(messages: list[Message]) -> str | None:
    """
    Detect a pattern prompt. Only the most recent user turn counts: a run that
    started with a plan request and has since moved on should not keep being
    treated as a planning call.
    """
    for m in reversed(messages):
        if m.role != "user":
            continue
        for token in ("PLAN_REQUEST", "CRITIQUE_REQUEST", "ROUTE_REQUEST"):
            if token in m.content:
                return token
        # A later plain user turn (e.g. "now give the improved answer") ends the
        # special mode but still needs a text answer rather than a tool call.
        if "improved final answer" in m.content.lower():
            return "REVISE"
        return None
    return None


def _attempted_tools(messages: list[Message]) -> set[str]:
    """Every tool that has been called, whether or not it succeeded."""
    return {m.tool_name for m in messages if m.role == "tool" and m.tool_name}


def _extract(text: str, *, prefix: str) -> str | None:
    """Find the first token starting with `prefix` (e.g. TCK-, ORD-)."""
    for raw in text.replace(",", " ").replace('"', " ").replace(":", " ").split():
        token = raw.strip(".!?)('’")
        if token.upper().startswith(prefix.upper()) and len(token) > len(prefix):
            return token
    return None


def _decode_openai_style(
    body: dict, *, backend: str, model: str, latency_ms: int
) -> BrainResult:
    """Ollama's /api/chat mirrors the OpenAI message shape closely enough."""
    message = body.get("message") or {}
    calls = message.get("tool_calls") or []
    prompt_tokens = body.get("prompt_eval_count")
    completion_tokens = body.get("eval_count")
    truncated = body.get("done_reason") == "length"

    if calls:
        fn = calls[0].get("function", {})
        args = fn.get("arguments")
        if isinstance(args, str):
            try:
                args = json.loads(args)
            except json.JSONDecodeError as exc:
                raise MalformedDecision(
                    f"tool arguments were not valid JSON: {args!r}"
                ) from exc
        return BrainResult(
            tool_call=ToolCall(fn.get("name", ""), args or {}),
            final_text=None,
            backend=backend,
            model=model,
            latency_ms=latency_ms,
            prompt_tokens=prompt_tokens,
            completion_tokens=completion_tokens,
            truncated=truncated,
        )

    text = (message.get("content") or "").strip()
    if not text:
        raise MalformedDecision("the model returned neither a tool call nor any text")
    return BrainResult(
        tool_call=None,
        final_text=text,
        backend=backend,
        model=model,
        latency_ms=latency_ms,
        prompt_tokens=prompt_tokens,
        completion_tokens=completion_tokens,
        truncated=truncated,
    )
