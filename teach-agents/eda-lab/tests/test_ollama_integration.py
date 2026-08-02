"""
Integration tests — the only file here that needs a real model.

Deselected by default (`addopts = -m "not ollama"` in pyproject.toml), so the
ordinary suite is offline and deterministic. Run these deliberately:

    macOS / Linux:   python -m pytest -m ollama
    Command Prompt:  python -m pytest -m ollama

Requires, and will NOT do for you:
    ollama serve
    ollama pull gemma3:4b

What is being tested is different from every other file. Elsewhere the fake
makes behaviour deterministic. Here the point is that the real model is *not*
deterministic, so these assert **properties** -- valid JSON, real columns, a
plausible tool -- and never an exact plan. A test that pins the exact output of
a 4B model is a test that fails on Tuesday for no reason.
"""

from __future__ import annotations

import json

import pytest
from pydantic import ValidationError

from eda_lab.brain import BrainError, OllamaBrain
from eda_lab.config import CONFIG
from eda_lab.guards import PlanRejected, validate_plan
from eda_lab.runner import ask, preflight
from eda_lab.schemas import AnalysisPlan
from eda_lab.tools import load_data, schema_summary

pytestmark = pytest.mark.ollama


@pytest.fixture(scope="module")
def brain() -> OllamaBrain:
    ok, detail = preflight()
    if not ok:
        pytest.skip(f"backend not ready: {detail}")
    return OllamaBrain(CONFIG)


@pytest.fixture(scope="module")
def columns() -> dict[str, str]:
    return schema_summary(load_data())


def test_health_reports_service_and_model_separately(brain):
    """
    Two different failures with two different fixes: `ollama serve` and
    `ollama pull`. Collapsing them into "backend unavailable" sends people to
    the wrong one.
    """
    health = brain.health()
    assert health.ok
    assert CONFIG.ollama_model in health.detail or CONFIG.ollama_model == health.model


def test_constrained_decoding_returns_parseable_json(brain, columns):
    """`format=<schema>` constrains the decoder. This is the property that makes
    a 4B model usable as a planner at all."""
    reply = brain.plan("Which channels have the lowest CSAT?", columns)
    parsed = json.loads(reply.text)
    assert "operations" in parsed


def test_plans_validate_against_the_pydantic_model(brain, columns):
    reply = brain.plan("Which ticket categories take longest to resolve?", columns)
    plan = AnalysisPlan.model_validate_json(reply.text)
    assert plan.operations


@pytest.mark.parametrize("question", [
    "Which ticket categories take longest to resolve?",
    "Which channel has the lowest customer satisfaction?",
    "Does escalation rate vary by customer tier?",
])
def test_real_questions_produce_semantically_valid_plans(brain, columns, question):
    """
    Properties, not exact plans. A small model will phrase the same correct
    analysis several different ways across runs, and all of them are fine.
    """
    reply = brain.plan(question, columns)
    plan = AnalysisPlan.model_validate_json(reply.text)
    validate_plan(plan, columns)                  # raises PlanRejected if wrong
    assert any(op.tool in ("grouped_summary", "value_counts",
                           "descriptive_statistics") for op in plan.operations)


def test_end_to_end_answer_contains_a_computed_figure(brain):
    """The numbers in the prose must have come from pandas. This is the
    faithfulness property, checked against a live model."""
    result = ask("Which ticket categories have the longest resolution times?")
    assert result.status == "answered"
    rows = next(v for v in result.results.values()
                if isinstance(v, dict) and v.get("rows"))["rows"]
    # The dataset's signal is strong enough that any competent plan finds it.
    assert any(str(row.get("category")) == "Returns" for row in rows[:3])


def test_telemetry_is_recorded_for_a_real_call(brain):
    reply = brain.plan("How many tickets are there?", schema_summary(load_data()))
    assert reply.latency_ms > 0
    assert reply.prompt_tokens > 0 and reply.completion_tokens > 0
    assert CONFIG.ollama_model in reply.summary()


def test_a_missing_model_is_a_distinct_error(brain):
    """Deliberately ask for a tag that does not exist. The message must say
    `ollama pull` and must not silently substitute another model -- a silent
    swap means the numbers you demo came from something you never chose.

    Takes the `brain` fixture only for its skip: without a running service every
    model looks missing, and this would pass for the wrong reason."""
    import dataclasses

    cfg = dataclasses.replace(CONFIG, ollama_model="gemma3:definitely-not-real")
    with pytest.raises(BrainError) as exc:
        OllamaBrain(cfg).plan("hello there", {"a": "int64"})
    assert "pull" in str(exc.value).lower()


def test_the_model_is_not_asked_to_write_code(brain, columns):
    """The prompt must never invite Python. If a plan comes back with something
    that looks like code in it, the prompt has drifted."""
    reply = brain.plan("Compute the average resolution time by category", columns)
    lowered = reply.text.lower()
    for token in ("import ", "df.", "pd.", "lambda", "def "):
        assert token not in lowered, f"model emitted {token!r}"


@pytest.mark.parametrize("question", [
    "Which tickets are bad?",
    "What will next quarter's ticket volume be?",
])
def test_unanswerable_questions_do_not_produce_confident_answers(brain, question):
    """
    The behaviour worth having: clarify, or refuse. Not invent.

    A small model will sometimes still guess, so this asserts the *system*
    outcome rather than the model's virtue -- either it clarified, or the plan
    was rejected, or the answer carries an explicit limitation.
    """
    result = ask(question)
    acceptable = (
        result.status in ("clarification", "rejected")
        or result.warnings
        or any(word in result.answer.lower()
               for word in ("cannot", "not possible", "would need", "unclear",
                            "does not contain", "no data"))
    )
    assert acceptable, f"answered confidently: {result.answer[:200]}"
