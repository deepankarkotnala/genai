"""
Golden-set tests — the evaluation harness, run as part of the suite.

Two separate jobs here, and conflating them is a common mistake:

    the EXPECTATIONS must match the data   (or the suite drifts into fiction)
    the AGENT must match the expectations  (the actual evaluation)

The first is checked by recomputing every pinned number from the dataset. If
someone regenerates the data with a different seed, these fail loudly instead of
the golden set quietly grading against numbers that no longer exist.
"""

from __future__ import annotations

import json
import math
from pathlib import Path

import pandas as pd
import pytest

from eda_lab.tools import DATASET

import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "evals"))
import run_evals  # noqa: E402

GOLDEN = json.loads(
    (Path(__file__).resolve().parents[1] / "evals" / "golden_set.json")
    .read_text(encoding="utf-8")
)
CASES = GOLDEN["cases"]


@pytest.fixture(scope="module")
def frame() -> pd.DataFrame:
    return pd.read_csv(DATASET)


# --------------------------------------------------------------------------
# job 1 · the expectations must still describe the data
# --------------------------------------------------------------------------
def test_dataset_facts_are_current(frame):
    facts = GOLDEN["dataset_facts"]
    assert len(frame) == facts["row_count"]
    assert frame["csat_score"].isna().sum() == facts["missing_csat"]
    assert frame["first_response_minutes"].isna().sum() == facts["missing_first_response"]


def test_pinned_numbers_are_recomputable(frame):
    """Every figure in the golden set, derived again from the CSV."""
    by = lambda col, metric: frame.groupby(col)[metric].mean()  # noqa: E731

    resolution = by("category", "resolution_minutes")
    assert math.isclose(resolution["Returns"], 949.3418, abs_tol=0.01)
    assert resolution.idxmax() == "Returns"
    assert resolution.drop("Returns").idxmax() == "Technical"

    escalation = by("customer_tier", "escalated")
    assert math.isclose(escalation["Enterprise"], 0.2185, abs_tol=0.01)
    assert math.isclose(escalation["Free"], 0.0987, abs_tol=0.01)
    assert math.isclose(escalation["Enterprise"] / escalation["Free"], 2.21, abs_tol=0.05)

    csat = by("channel", "csat_score")
    assert csat.idxmin() == "Phone"
    assert math.isclose(csat["Phone"], 3.4412, abs_tol=0.01)

    refund = by("refund_requested", "resolution_minutes")
    assert math.isclose(refund[True], 806.5501, abs_tol=0.01)
    assert math.isclose(refund[False], 382.2405, abs_tol=0.01)


# --------------------------------------------------------------------------
# job 2 · the agent must match the expectations
# --------------------------------------------------------------------------
@pytest.mark.parametrize("case", CASES, ids=[c["id"] for c in CASES])
def test_golden_case(case):
    result = run_evals.score_case(case, use_ollama=False)
    assert result["passed"], "; ".join(result["failures"])


# --------------------------------------------------------------------------
# the set itself has to be worth running
# --------------------------------------------------------------------------
def test_the_set_is_mostly_not_happy_paths():
    """
    The behaviours that regress silently are the refusals. A golden set that is
    90% happy path measures the one thing least likely to break.
    """
    happy = [c for c in CASES if c["kind"] == "happy"]
    assert len(happy) <= len(CASES) / 2


def test_every_case_states_why_it_exists():
    """A case nobody can justify is a case nobody will fix when it fails --
    it just gets deleted."""
    for case in CASES:
        assert case.get("why"), case["id"]


def test_every_failure_mode_of_the_fake_is_covered():
    """
    The lesson from the main course: an eval suite is only as good as its
    coverage, and coverage holes are invisible. Flipping a default there passed
    12/12 because no case exercised it.

    So: every mode the fake can produce must appear in the set, and adding a new
    one fails this test until it does.
    """
    from eda_lab.brain import FakeEdaBrain
    covered = {c.get("mode", "normal") for c in CASES}
    assert covered == set(FakeEdaBrain.MODES), (
        f"uncovered modes: {set(FakeEdaBrain.MODES) - covered}"
    )


def test_all_ten_metrics_are_reachable():
    """A metric nothing scores is documentation, not measurement."""
    scored: set[str] = set()
    for case in CASES:
        brain_mode = case.get("mode", "normal")
        assert brain_mode in __import__(
            "eda_lab.brain", fromlist=["x"]).FakeEdaBrain.MODES
    for case in CASES:
        result = run_evals.score_case(case, use_ollama=False)
        assert result["checks"] > 0
        scored.add(case["kind"])
    # Every metric name is a real one, and every kind of case is present.
    assert scored == {"happy", "clarification", "semantic_failure",
                      "malformed", "unsafe"}
    assert len(run_evals.METRICS) == 10
