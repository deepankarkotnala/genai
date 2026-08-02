"""
Tool tests — the deterministic half of the system.

Gemma decides *what* analysis to run; these functions decide *what the numbers
are*. So these tests pin numbers, not shapes: an assertion that a dict has a
"rows" key would survive every arithmetic bug in the file.
"""

from __future__ import annotations

import json
import math
from pathlib import Path

import pandas as pd
import pytest

from eda_lab.config import CONFIG, OUT_DIR
from eda_lab.tools import (
    REGISTRY, ToolContext, correlation_summary, create_chart,
    descriptive_statistics, detect_outliers, filter_rows, grouped_summary,
    inspect_schema, load_data, missing_value_summary, preview_rows,
    schema_summary, time_series_summary, value_counts,
)


@pytest.fixture
def ctx() -> ToolContext:
    return ToolContext(cfg=CONFIG)


@pytest.fixture(scope="module")
def frame() -> pd.DataFrame:
    return load_data()


# --------------------------------------------------------------------------
# the dataset itself
# --------------------------------------------------------------------------
def test_dataset_shape_is_pinned(frame):
    assert len(frame) == 800
    assert list(frame.columns) == [
        "ticket_id", "created_at", "category", "priority", "channel",
        "customer_tier", "first_response_minutes", "resolution_minutes",
        "status", "escalated", "refund_requested", "refund_amount",
        "csat_score",
    ]


def test_missing_data_is_present_on_purpose(frame):
    """A tidy dataset teaches nothing. csat is missing for unsurveyed tickets
    and first_response for tickets that were never answered before closing --
    both MNAR, both a trap for `.mean()`."""
    assert frame["csat_score"].isna().sum() == 172
    assert frame["first_response_minutes"].isna().sum() == 35


def test_tools_never_mutate_the_source_frame(ctx, frame):
    """Every tool works on a copy. If one did not, the second question in a
    session would silently see the first question's edits."""
    before = pd.util.hash_pandas_object(frame).sum()
    for name, fn in REGISTRY.items():
        args = {
            "value_counts": {"column": "category"},
            "grouped_summary": {"group_by": "category",
                                "metric": "resolution_minutes",
                                "aggregation": "mean"},
            "filter_rows": {"column": "category", "op": "==", "value": "Billing"},
            "time_series_summary": {"date_column": "created_at"},
            "detect_outliers": {"column": "resolution_minutes"},
            "create_chart": {"type": "none"},
        }.get(name, {})
        fn(ctx, **args)
    assert pd.util.hash_pandas_object(load_data()).sum() == before


# --------------------------------------------------------------------------
# the numbers
# --------------------------------------------------------------------------
def test_grouped_summary_matches_pandas(ctx, frame):
    result = grouped_summary(ctx, group_by="category",
                             metric="resolution_minutes", aggregation="mean",
                             sort="descending")
    expected = frame.groupby("category")["resolution_minutes"].mean()
    assert result["rows"][0]["category"] == "Returns"
    assert math.isclose(result["rows"][0]["mean_resolution_minutes"],
                        expected["Returns"], abs_tol=0.01)


def test_grouped_summary_reports_group_sizes(ctx):
    """A mean over four rows and a mean over four hundred are different claims.
    Without `n` the answer looks equally confident either way."""
    rows = grouped_summary(ctx, group_by="category", metric="resolution_minutes",
                           aggregation="mean")["rows"]
    assert all("n" in row and row["n"] > 0 for row in rows)
    assert sum(row["n"] for row in rows) == 800


def test_grouped_summary_warns_about_missing_values(ctx):
    """The trap this dataset exists to teach: `.mean()` drops NaN silently, so
    the answer covers 628 of 800 rows and says nothing about it."""
    result = grouped_summary(ctx, group_by="channel", metric="csat_score",
                             aggregation="mean")
    note = (result.get("warning") or "") + (result.get("note") or "")
    assert "172" in note and "missing" in note.lower()


def test_escalation_by_tier_is_the_planted_signal(ctx):
    rows = grouped_summary(ctx, group_by="customer_tier", metric="escalated",
                           aggregation="mean")["rows"]
    rates = {r["customer_tier"]: r["mean_escalated"] for r in rows}
    assert rates["Enterprise"] / rates["Free"] > 2.0


def test_correlation_summary_is_symmetric_and_bounded(ctx):
    rows = correlation_summary(ctx, columns=["resolution_minutes",
                                             "first_response_minutes",
                                             "csat_score"])["rows"]
    assert rows and all(-1.0 <= r["r"] <= 1.0 for r in rows)
    assert all(r["a"] != r["b"] for r in rows)


def test_correlation_refuses_an_unusable_column_rather_than_dropping_it(ctx):
    """
    Found while writing these tests: the tool used to filter unknown names out
    of `columns` and correlate whatever was left. It answered a question nobody
    asked, and looked completely normal doing it. Silently narrowing an
    argument is the same bug as the silent chart failure.
    """
    result = correlation_summary(ctx, columns=["resolution_minutes",
                                               "message_length"])
    assert result["error"] == "unusable_columns"
    assert "message_length" in result["message"]
    assert "csat_score" in result["message"]        # names the real options


def test_correlation_refuses_a_text_column(ctx):
    """`category` exists but is not numeric -- also unusable, also not silent."""
    assert correlation_summary(
        ctx, columns=["category", "resolution_minutes"])["error"] == "unusable_columns"


def test_correlation_carries_the_causation_caveat(ctx):
    result = correlation_summary(ctx, columns=["escalated", "resolution_minutes"])
    text = (result.get("warning") or "") + (result.get("note") or "")
    assert "causation" in text.lower()


def test_detect_outliers_iqr_and_zscore_disagree(ctx):
    """Worth showing a learner: "outlier" is a method choice, not a fact about
    the data."""
    iqr = detect_outliers(ctx, column="resolution_minutes", method="iqr")
    z = detect_outliers(ctx, column="resolution_minutes", method="zscore")
    assert iqr["count"] > 0 and z["count"] > 0
    assert iqr["count"] != z["count"]


def test_time_series_uses_modern_pandas_aliases(ctx, recwarn):
    """`M` was deprecated in pandas 2.2. The plan vocabulary keeps `M` and the
    tool translates, so the model never has to learn `ME`."""
    result = time_series_summary(ctx, date_column="created_at", freq="M",
                                 metric="ticket_id", aggregation="count")
    assert len(result["rows"]) >= 6
    assert not [w for w in recwarn if issubclass(w.category, FutureWarning)]


def test_oversized_results_error_rather_than_truncate(ctx):
    """
    A silently truncated table is worse than no table: the model reads 200 rows
    as the whole answer and states a conclusion about the other 600 it never
    saw. So the cap refuses and says why, and the model can narrow the query.
    """
    result = filter_rows(ctx, column="category", op="==", value="Billing", n=10_000)
    assert result["error"] == "result_too_large"
    assert "narrow" in result["message"]


def test_missing_value_summary_reports_the_incomplete_columns(ctx, frame):
    rows = {r["column"]: r for r in missing_value_summary(ctx)["rows"]}
    assert set(rows) == {"first_response_minutes", "refund_amount", "csat_score"}
    assert rows["csat_score"]["missing"] == 172
    assert rows["csat_score"]["missing_pct"] == 21.5
    # refund_amount is 81.9% missing BY DESIGN -- it is null unless a refund was
    # requested. "Missing" and "not applicable" are different things, and a
    # learner who imputes the mean here has made a real mistake.
    assert rows["refund_amount"]["missing"] == 655


def test_schema_summary_reports_dtypes(frame):
    columns = schema_summary(frame)
    assert columns["resolution_minutes"].startswith(("int", "float"))
    assert columns["category"] in ("object", "string")


# --------------------------------------------------------------------------
# limits, and the shape of results
# --------------------------------------------------------------------------
def test_every_result_is_json_serialisable(ctx):
    """Results are fed back to the model as JSON. A numpy int64 that survives to
    that point raises inside the transport, which reads as a model failure."""
    for name, fn in REGISTRY.items():
        args = {
            "value_counts": {"column": "priority"},
            "grouped_summary": {"group_by": "priority",
                                "metric": "resolution_minutes",
                                "aggregation": "median"},
            "filter_rows": {"column": "escalated", "op": "==", "value": True},
            "time_series_summary": {"date_column": "created_at"},
            "detect_outliers": {"column": "first_response_minutes"},
            "create_chart": {"type": "none"},
        }.get(name, {})
        json.dumps(fn(ctx, **args))          # raises on anything unserialisable


def test_results_are_capped_in_size(ctx):
    """The result goes back into the prompt. An uncapped table is a context
    overflow that presents as the model going quiet."""
    for name, fn in REGISTRY.items():
        args = {"value_counts": {"column": "category", "top_n": 999},
                "filter_rows": {"column": "category", "op": "==", "value": "Other"},
                "grouped_summary": {"group_by": "channel",
                                    "metric": "resolution_minutes",
                                    "aggregation": "mean"},
                "time_series_summary": {"date_column": "created_at", "freq": "D"},
                "detect_outliers": {"column": "resolution_minutes"},
                "create_chart": {"type": "none"}}.get(name, {})
        assert len(json.dumps(fn(ctx, **args))) <= 32 * 1024, name


def test_group_cap_is_enforced(ctx):
    """Grouping by a near-unique key is a classic planner mistake; refusing it
    with the distinct count is far more useful than returning 800 rows."""
    result = grouped_summary(ctx, group_by="ticket_id",
                             metric="resolution_minutes", aggregation="mean")
    assert result["error"] == "too_many_groups"
    assert "800" in result["message"] and str(CONFIG.max_groups) in result["message"]


def test_trace_records_every_call(ctx):
    inspect_schema(ctx)
    preview_rows(ctx, n=3)
    descriptive_statistics(ctx)
    assert [e.tool for e in ctx.trace] == [
        "inspect_schema", "preview_rows", "descriptive_statistics"]
    assert all(e.duration_ms >= 0 for e in ctx.trace)


def test_preview_rows_cannot_dump_the_dataset(ctx):
    assert len(preview_rows(ctx, n=10_000)["rows"]) <= CONFIG.max_rows_returned


# --------------------------------------------------------------------------
# charts
# --------------------------------------------------------------------------
def test_chart_filename_is_derived_not_supplied(ctx):
    """The model has no say in where this lands. That is the whole design."""
    result = create_chart(ctx, type="bar", x="category", y="resolution_minutes",
                          title="Mean resolution by category")
    name = result["chart"]
    assert name.endswith(".png") and "/" not in name and "\\" not in name
    assert (OUT_DIR / name).exists()


def test_chart_is_deterministic_for_the_same_spec(ctx):
    a = create_chart(ctx, type="bar", x="category", y="resolution_minutes",
                     title="t")
    b = create_chart(ctx, type="bar", x="category", y="resolution_minutes",
                     title="t")
    assert a["chart"] == b["chart"]


def test_chart_with_an_unknown_column_reports_an_error(ctx):
    """Belt and braces: guards.validate_plan should have caught this first, but
    the tool must not fail silently if it is called directly."""
    result = create_chart(ctx, type="bar", x="category",
                          y="mean_resolution_minutes")
    assert result.get("error") and not result.get("chart")


def test_chart_type_none_produces_nothing(ctx):
    assert not create_chart(ctx, type="none").get("chart")
