"""
runner.py — the ten-step controlled workflow.

    1  the user asks a natural-language question
    2  Gemma produces a structured analysis plan
    3  constrained by JSON Schema at decode time
    4  validated by Pydantic on parse
    5  semantic checks: tools, columns, aggregations, limits
    6  deterministic pandas tools compute the numbers
    7  compact results go back to Gemma
    8  Gemma explains ONLY what was computed
    9  the answer carries assumptions, warnings and limitations
    10 the run records tool calls, timings and model telemetry

The invariant worth stating out loud: **Gemma decides what analysis to run;
pandas decides what the numbers are.** No step in this file gives the model a
way to compute, execute or write anything.
"""

from __future__ import annotations

import json
import time
from dataclasses import dataclass, field
from typing import Any

from pydantic import ValidationError

from .brain import (
    BrainError, BrainResult, FakeEdaBrain, MalformedPlan, get_brain,
)
from .config import CONFIG, Config
from .guards import PlanRejected, screen_request, validate_plan
from .schemas import AnalysisPlan
from .tools import REGISTRY, TraceEntry, ToolContext, load_data, schema_summary


@dataclass
class RunResult:
    question: str
    status: str                      # answered | clarification | rejected | failed
    answer: str = ""
    plan: dict | None = None
    results: dict[str, Any] = field(default_factory=dict)
    assumptions: list[str] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)
    trace: list[TraceEntry] = field(default_factory=list)
    telemetry: list[str] = field(default_factory=list)
    repairs: int = 0
    charts: list[str] = field(default_factory=list)
    duration_ms: int = 0

    def render(self) -> str:
        lines = [f"Q: {self.question}", f"   status: {self.status}", ""]
        if self.plan:
            for op in self.plan.get("operations", []):
                lines.append(f"   plan  · {op['tool']}({_short(op.get('arguments', {}))})")
        for entry in self.trace:
            flag = f" !! {entry.error}" if entry.error else ""
            lines.append(f"   ran   · {entry.tool:22} {entry.duration_ms:>4}ms  "
                         f"{entry.rows_returned:>3} rows{flag}")
        if self.charts:
            lines.append(f"   chart · {', '.join(self.charts)}")
        lines += ["", self.answer]
        if self.assumptions:
            lines += ["", "Assumptions:"] + [f"  - {a}" for a in self.assumptions]
        if self.warnings:
            lines += ["", "Warnings:"] + [f"  - {w}" for w in self.warnings]
        lines += ["", f"   {' | '.join(self.telemetry)}  ({self.duration_ms}ms total)"]
        return "\n".join(lines)


def _short(args: dict) -> str:
    return ", ".join(f"{k}={v!r}" for k, v in list(args.items())[:3])


def ask(question: str, brain: Any = None, cfg: Config | None = None) -> RunResult:
    """Run one question end to end. Never raises for content problems."""
    cfg = cfg or CONFIG
    brain = brain or get_brain(cfg)
    started = time.perf_counter()
    out = RunResult(question=question, status="failed")

    # -- layer 4, first and least important: log, do not decide on it -------
    screening = screen_request(question)
    if screening.flagged:
        out.warnings.append(f"input screen flagged: {screening.report()}")

    columns = schema_summary(load_data())

    # -- steps 2-5: plan, parse, validate, with ONE repair ------------------
    plan: AnalysisPlan | None = None
    feedback = ""
    for attempt in range(cfg.max_repairs + 1):
        try:
            reply: BrainResult = brain.plan(
                question if not feedback else f"{question}\n\nPrevious attempt failed: {feedback}",
                columns,
            )
        except BrainError as exc:
            # Transport failures are terminal. Retrying a connection refusal or a
            # missing model cannot succeed, and the message already says how to fix it.
            out.status = "failed"
            out.answer = str(exc)
            out.duration_ms = int((time.perf_counter() - started) * 1000)
            return out

        out.telemetry.append(reply.summary())
        try:
            plan = AnalysisPlan.model_validate_json(reply.text)
            warnings = validate_plan(plan, columns, cfg)
            out.warnings.extend(warnings)
            break
        except (ValidationError, json.JSONDecodeError) as exc:
            feedback = f"the response was not a valid AnalysisPlan: {str(exc)[:300]}"
            plan = None
        except PlanRejected as exc:
            # Semantic failure. A hallucinated column is worth one repair
            # because the feedback names the real columns -- but it does NOT
            # enter a loop, and if the repair fails the run stops.
            feedback = "; ".join(exc.faults)
            plan = None

        if attempt < cfg.max_repairs:
            out.repairs += 1

    if plan is None:
        out.status = "rejected"
        out.answer = (
            "Could not produce a valid analysis plan after "
            f"{out.repairs} repair attempt(s).\n  Reason: {feedback}"
        )
        out.duration_ms = int((time.perf_counter() - started) * 1000)
        return out

    out.plan = plan.model_dump()
    out.assumptions = list(plan.assumptions)

    # -- ambiguity is an outcome, not a failure -----------------------------
    if plan.is_clarification:
        out.status = "clarification"
        out.answer = plan.clarification_needed
        out.duration_ms = int((time.perf_counter() - started) * 1000)
        return out

    # -- step 6: deterministic execution ------------------------------------
    ctx = ToolContext(cfg=cfg)
    results: dict[str, Any] = {}
    for i, op in enumerate(plan.operations):
        handler = REGISTRY[op.tool]            # safe: validated against the Literal
        result = handler(ctx, **op.arguments)
        results[f"{i}:{op.tool}"] = result
        if isinstance(result, dict):
            if result.get("warning"):
                out.warnings.append(result["warning"])
            if result.get("note"):
                out.warnings.append(result["note"])
            if result.get("chart"):
                out.charts.append(result["chart"])

    if plan.chart.type != "none":
        chart = REGISTRY["create_chart"](
            ctx, type=plan.chart.type, x=plan.chart.x, y=plan.chart.y,
            title=plan.chart.title,
        )
        if chart.get("chart"):
            out.charts.append(chart["chart"])
        elif chart.get("error"):
            out.warnings.append(f"chart: {chart['message']}")

    out.results = results
    out.trace = ctx.trace

    # -- steps 7-9: explain what was computed, and only that ----------------
    try:
        explanation = brain.explain(question, out.plan, results)
        out.telemetry.append(explanation.summary())
        out.answer = explanation.text.strip()
    except BrainError as exc:
        # The numbers survive even if the narration fails -- so report them
        # rather than throwing the work away.
        out.answer = (f"Analysis completed but the explanation call failed: {exc}\n"
                      f"Raw results: {json.dumps(results, default=str)[:800]}")
        out.warnings.append("explanation unavailable; figures above are raw")

    out.status = "answered"
    out.duration_ms = int((time.perf_counter() - started) * 1000)
    return out


def preflight(cfg: Config | None = None) -> tuple[bool, str]:
    """
    Check the backend before asking anything, so the failure is one clear
    message rather than a stack trace mid-question.
    """
    cfg = cfg or CONFIG
    try:
        brain = get_brain(cfg)
    except BrainError as exc:
        return False, str(exc)
    health = brain.health()
    return health.ok, health.detail
