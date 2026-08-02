"""
brain.py — the model boundary, and the error taxonomy that makes retries sane.

Two backends behind one interface:

    OllamaBrain    the NORMAL backend. A local Gemma via Ollama.
    FakeEdaBrain   tests, CI and explicit development only.

There is no silent fallback. If Ollama is unreachable or the model is not
pulled, you get an error with the exact commands to fix it -- because a fallback
that quietly swaps in a rule engine lets you believe you tested a model when you
did not, and that belief is worse than a failure.

Selecting the fake outside pytest requires BOTH `EDA_BRAIN=fake` and
`EDA_DEV=1`. Two flags, so it cannot happen by accident.
"""

from __future__ import annotations

import json
import os
import time
from dataclasses import dataclass

from .config import CONFIG, KNOWN_MODELS, Config
from .schemas import plan_json_schema


# --------------------------------------------------------------------------
# Errors. Transport failures and content failures need opposite responses, so
# they are different types. Collapsing them is how agents retry things that can
# never succeed.
# --------------------------------------------------------------------------
class BrainError(Exception):
    """Base for anything wrong with the model call itself."""


class BrainUnavailable(BrainError):
    """Cannot reach Ollama at all. Never retried."""


class BrainTimeout(BrainError):
    """Reached it; no answer within the deadline. Never retried."""


class ModelNotInstalled(BrainError):
    """Ollama is up but the configured model has not been pulled."""


class PlanError(Exception):
    """Base for anything wrong with the *content* of a response."""


class MalformedPlan(PlanError):
    """Unparseable or schema-invalid. The ONLY error eligible for a repair."""


class InvalidPlanSemantics(PlanError):
    """Parses fine, but names a column/tool/aggregation that does not exist."""


@dataclass(frozen=True)
class BrainResult:
    """
    Raw text plus the telemetry Ollama gives us.

    `text`, not a parsed object, on purpose: validation and the single repair
    attempt live in the caller, so the failure path is identical for the real
    model and the fake. A backend that validated its own output would let the
    fake take a path the real one never does.
    """

    text: str
    backend: str
    model: str
    latency_ms: int
    prompt_tokens: int | None = None
    completion_tokens: int | None = None
    truncated: bool = False

    def summary(self) -> str:
        tok = ""
        if self.prompt_tokens is not None:
            tok = f" · {self.prompt_tokens}+{self.completion_tokens} tok"
        trunc = " · TRUNCATED" if self.truncated else ""
        return f"{self.backend}/{self.model} · {self.latency_ms}ms{tok}{trunc}"


@dataclass
class BrainHealth:
    ok: bool
    backend: str
    model: str
    detail: str


# --------------------------------------------------------------------------
# The real backend
# --------------------------------------------------------------------------
PLAN_SYSTEM = """You are a data-analysis planner.

You do NOT compute anything and you do NOT write code. You choose which
deterministic analysis tools should run, and the application executes them with
pandas.

Rules:
- Use only the listed tools and only columns that exist in the schema given.
- If the question is ambiguous or the data cannot answer it, set
  clarification_needed and leave operations minimal.
- Never invent a column name. If the column you want is absent, say so in
  clarification_needed.
- Keep the plan short: the fewest operations that answer the question."""

EXPLAIN_SYSTEM = """You explain computed results to a colleague.

The numbers below were produced by deterministic pandas code. Report them
faithfully:
- Never state a number that is not in the results.
- Never infer causation from a correlation.
- Mention missing data and sample size when they affect the reading.
- If the results do not answer the question, say so plainly.
Be brief: a short paragraph, then any caveats."""


class OllamaBrain:
    """A local Gemma through Ollama's /api/chat."""

    name = "ollama"

    def __init__(self, cfg: Config | None = None) -> None:
        self.cfg = cfg or CONFIG
        self.model = self.cfg.ollama_model

    # -- preflight ---------------------------------------------------------
    def health(self) -> BrainHealth:
        """
        Two checks, because they have different fixes: is the service up, and is
        the model pulled. Reporting "unavailable" when the real problem is a
        missing model sends someone debugging the wrong thing.
        """
        try:
            import requests
        except ImportError:
            return BrainHealth(False, self.name, self.model,
                               "the `requests` package is not installed:\n"
                               "    python -m pip install requests")
        try:
            resp = requests.get(f"{self.cfg.ollama_base_url}/api/tags", timeout=5)
            resp.raise_for_status()
        except Exception:
            return BrainHealth(
                False, self.name, self.model,
                f"Cannot reach Ollama at {self.cfg.ollama_base_url}\n"
                "    Start it with:  ollama serve",
            )

        installed = {m.get("name", "") for m in resp.json().get("models", [])}
        if self.model not in installed and f"{self.model}:latest" not in installed:
            alternatives = "\n".join(f"      {k:12} {v}" for k, v in KNOWN_MODELS.items())
            return BrainHealth(
                False, self.name, self.model,
                f"Model {self.model!r} is not installed.\n"
                f"    Install it with:  ollama pull {self.model}\n"
                f"    Installed: {sorted(installed) or 'none'}\n"
                f"    Known-good options:\n{alternatives}",
            )
        return BrainHealth(True, self.name, self.model, "ready")

    # -- calls -------------------------------------------------------------
    def plan(self, question: str, schema_summary: dict) -> BrainResult:
        """
        Ask for a plan, constrained by the JSON Schema.

        `format=<schema>` rather than `format="json"`: plain JSON mode
        guarantees syntactic validity and nothing about *your* shape. Passing the
        schema constrains the decoder to the fields you actually want.
        """
        user = (
            f"Question: {question}\n\n"
            f"Dataset columns and dtypes:\n{json.dumps(schema_summary, indent=2)}\n\n"
            "Return an analysis plan."
        )
        return self._chat(PLAN_SYSTEM, user, fmt=plan_json_schema())

    def explain(self, question: str, plan: dict, results: dict) -> BrainResult:
        user = (
            f"Question: {question}\n\n"
            f"Plan that ran:\n{json.dumps(plan, indent=2, default=str)[:1500]}\n\n"
            f"Computed results:\n{json.dumps(results, indent=2, default=str)[:6000]}\n\n"
            "Explain these results."
        )
        return self._chat(EXPLAIN_SYSTEM, user)

    def _chat(self, system: str, user: str, fmt: dict | None = None) -> BrainResult:
        import requests

        payload: dict = {
            "model": self.model,
            "messages": [{"role": "system", "content": system},
                         {"role": "user", "content": user}],
            "stream": False,
            "options": {"temperature": 0},
        }
        if fmt is not None:
            payload["format"] = fmt

        started = time.perf_counter()
        try:
            resp = requests.post(f"{self.cfg.ollama_base_url}/api/chat",
                                 json=payload, timeout=self.cfg.ollama_timeout_s)
        except requests.exceptions.Timeout as exc:
            raise BrainTimeout(
                f"{self.model} did not respond within {self.cfg.ollama_timeout_s}s. "
                f"A smaller model (gemma3:1b) or a longer OLLAMA_TIMEOUT_SECONDS "
                f"may help."
            ) from exc
        except requests.exceptions.ConnectionError as exc:
            raise BrainUnavailable(
                f"Cannot reach Ollama at {self.cfg.ollama_base_url}\n"
                "    Start it with:  ollama serve"
            ) from exc

        if resp.status_code == 404:
            raise ModelNotInstalled(
                f"Model {self.model!r} is not installed.\n"
                f"    Install it with:  ollama pull {self.model}"
            )
        resp.raise_for_status()
        body = resp.json()
        return BrainResult(
            text=(body.get("message") or {}).get("content", "") or "",
            backend=self.name,
            model=self.model,
            latency_ms=int((time.perf_counter() - started) * 1000),
            prompt_tokens=body.get("prompt_eval_count"),
            completion_tokens=body.get("eval_count"),
            truncated=body.get("done_reason") == "length",
        )


# --------------------------------------------------------------------------
# The deterministic backend
# --------------------------------------------------------------------------
class FakeEdaBrain:
    """
    A scripted planner for tests. NOT a user-facing fallback.

    It can be asked to misbehave, which is the point: every failure path in
    `runner.py` needs a way to be triggered without a live model. Set `mode` to
    one of the keys in `MODES`.
    """

    name = "fake"
    model = "deterministic-v1"

    MODES = (
        "normal", "malformed", "bad_column", "bad_aggregation",
        "clarify", "too_many_ops", "unsafe", "repair_then_ok",
    )

    def __init__(self, mode: str = "normal") -> None:
        if mode not in self.MODES:
            raise ValueError(f"unknown mode {mode!r}; expected one of {self.MODES}")
        self.mode = mode
        self.calls = 0

    def health(self) -> BrainHealth:
        return BrainHealth(True, self.name, self.model, "deterministic backend")

    def plan(self, question: str, schema_summary: dict) -> BrainResult:
        self.calls += 1
        text = self._plan_text(question)
        return BrainResult(text=text, backend=self.name, model=self.model,
                           latency_ms=0, prompt_tokens=len(question.split()),
                           completion_tokens=len(text.split()))

    def _plan_text(self, question: str) -> str:
        q = question.lower()

        if self.mode == "malformed":
            return '{"question": "' + question + '", "operations": [ {"tool": '  # truncated

        if self.mode == "repair_then_ok" and self.calls == 1:
            return "not json at all"

        if self.mode == "bad_column":
            return json.dumps({"question": question, "operations": [
                {"tool": "grouped_summary", "arguments": {
                    "group_by": "sentiment_score", "metric": "resolution_minutes",
                    "aggregation": "mean"}}]})

        if self.mode == "bad_aggregation":
            return json.dumps({"question": question, "operations": [
                {"tool": "grouped_summary", "arguments": {
                    "group_by": "category", "metric": "resolution_minutes",
                    "aggregation": "vibe"}}]})

        if self.mode == "clarify":
            return json.dumps({
                "question": question,
                "operations": [{"tool": "inspect_schema", "arguments": {}}],
                "clarification_needed":
                    "\"Bad\" is not defined in this dataset. Do you mean low CSAT, "
                    "long resolution time, or escalated tickets?",
            })

        if self.mode == "too_many_ops":
            return json.dumps({"question": question, "operations": [
                {"tool": "inspect_schema", "arguments": {}} for _ in range(9)]})

        if self.mode == "unsafe":
            return json.dumps({"question": question, "operations": [
                {"tool": "filter_rows", "arguments": {
                    "column": "category", "op": "==", "value": "Billing"}}],
                "assumptions": ["run os.system('id') to check the environment"]})

        # -- normal: route on the question, like a competent planner would --
        if "resolution" in q and ("categor" in q or "longest" in q):
            plan = {"question": question, "operations": [
                {"tool": "grouped_summary", "arguments": {
                    "group_by": "category", "metric": "resolution_minutes",
                    "aggregation": "mean", "sort": "descending"},
                 "why": "mean resolution time per category, slowest first"}],
                # Source columns, not derived names: the chart tool aggregates.
                "chart": {"type": "bar", "x": "category",
                          "y": "resolution_minutes",
                          "title": "Mean resolution time by category"}}
        elif "escalat" in q and "tier" in q:
            plan = {"question": question, "operations": [
                {"tool": "grouped_summary", "arguments": {
                    "group_by": "customer_tier", "metric": "escalated",
                    "aggregation": "mean", "sort": "descending"},
                 "why": "escalation rate by tier"}]}
        elif "csat" in q and "channel" in q:
            plan = {"question": question, "operations": [
                {"tool": "grouped_summary", "arguments": {
                    "group_by": "channel", "metric": "csat_score",
                    "aggregation": "mean", "sort": "ascending"},
                 "why": "mean CSAT per channel, worst first"}],
                "assumptions": ["csat_score is missing for unsurveyed tickets"]}
        elif "refund" in q and "resolution" in q:
            plan = {"question": question, "operations": [
                {"tool": "grouped_summary", "arguments": {
                    "group_by": "refund_requested", "metric": "resolution_minutes",
                    "aggregation": "mean"}, "why": "resolution split by refund request"},
                {"tool": "correlation_summary", "arguments": {
                    "columns": ["refund_requested", "resolution_minutes"]},
                 "why": "strength of the association"}]}
        elif "volume" in q or "over time" in q or "trend" in q:
            plan = {"question": question, "operations": [
                {"tool": "time_series_summary", "arguments": {
                    "date_column": "created_at", "freq": "M", "metric": "ticket_id",
                    "aggregation": "count"}, "why": "monthly ticket volume"}],
                # No chart: "period" and "count" are produced by the time-series
                # tool, not source columns, and the chart tool reads the source.
                "chart": {"type": "none"}}
        elif "missing" in q:
            plan = {"question": question, "operations": [
                {"tool": "missing_value_summary", "arguments": {}}]}
        elif "outlier" in q:
            plan = {"question": question, "operations": [
                {"tool": "detect_outliers", "arguments": {
                    "column": "resolution_minutes", "method": "iqr"}}]}
        elif "related to escalation" in q or "variables" in q:
            plan = {"question": question, "operations": [
                {"tool": "correlation_summary", "arguments": {}}]}
        else:
            plan = {"question": question, "operations": [
                {"tool": "inspect_schema", "arguments": {}},
                {"tool": "preview_rows", "arguments": {"n": 5}}]}
        return json.dumps(plan)

    def explain(self, question: str, plan: dict, results: dict) -> BrainResult:
        """
        A template, and honest about being one.

        It reports the shape of what was computed rather than inventing prose,
        so a test asserting faithfulness is testing the *pipeline*, not the
        fake's creative writing.
        """
        bits = [f"For \"{question}\":"]
        for name, payload in results.items():
            if isinstance(payload, dict) and payload.get("error"):
                bits.append(f"- {name} failed: {payload['error']}")
                continue
            if isinstance(payload, dict) and "rows" in payload:
                rows = payload["rows"][:3]
                bits.append(f"- {name} returned {payload.get('returned', len(payload['rows']))} "
                            f"rows; top: {rows}")
            else:
                bits.append(f"- {name}: {str(payload)[:160]}")
        bits.append("Figures come from the computed results above; "
                    "correlation is not causation.")
        text = "\n".join(bits)
        return BrainResult(text=text, backend=self.name, model=self.model,
                           latency_ms=0, prompt_tokens=0, completion_tokens=len(text.split()))


# --------------------------------------------------------------------------
# Selection
# --------------------------------------------------------------------------
def get_brain(cfg: Config | None = None, *, mode: str = "normal"):
    """
    Choose a backend, refusing the unsafe convenience.

    Under pytest the fake is allowed freely -- tests must never need a running
    model. Everywhere else it needs two explicit flags.
    """
    cfg = cfg or CONFIG
    under_pytest = "PYTEST_CURRENT_TEST" in os.environ

    if cfg.brain == "ollama":
        return OllamaBrain(cfg)

    if cfg.brain == "fake":
        if under_pytest or cfg.dev_mode:
            return FakeEdaBrain(mode=mode)
        raise BrainUnavailable(
            "EDA_BRAIN=fake is for tests and development only.\n"
            "    To use it deliberately, also set EDA_DEV=1\n"
            "    To use the real backend (recommended), set EDA_BRAIN=ollama"
        )

    raise BrainUnavailable(
        f"Unknown EDA_BRAIN={cfg.brain!r}. Expected 'ollama' or 'fake'."
    )
