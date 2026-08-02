"""
Schema and guard tests.

The theme: **schema-valid is not semantically valid.** Roughly half of these
build a plan that satisfies every Pydantic constraint and is still wrong, which
is the failure mode a JSON-Schema-only defence cannot see.
"""

from __future__ import annotations

import pytest
from pydantic import ValidationError

from eda_lab.config import CONFIG
from eda_lab.guards import (
    TOOL_ARGS, PlanRejected, screen_request, validate_plan,
)
from eda_lab.schemas import AnalysisPlan, ToolName, plan_json_schema
from eda_lab.tools import REGISTRY, load_data, schema_summary


@pytest.fixture(scope="module")
def columns() -> dict[str, str]:
    return schema_summary(load_data())


def plan(**overrides) -> AnalysisPlan:
    base = {
        "question": "which categories are slowest?",
        "operations": [{"tool": "grouped_summary", "arguments": {
            "group_by": "category", "metric": "resolution_minutes",
            "aggregation": "mean"}}],
    }
    base.update(overrides)
    return AnalysisPlan.model_validate(base)


# --------------------------------------------------------------------------
# the registry IS the security boundary
# --------------------------------------------------------------------------
def test_registry_matches_the_declared_tool_names():
    """One allowlist, three places. If they drift, a tool exists that the
    validator has never heard of -- so pin them to each other."""
    assert set(REGISTRY) == set(ToolName.__args__) == set(TOOL_ARGS)


def test_no_execution_capability_exists():
    """
    The canary. Layer 1 of the security model is that there is nothing to
    exploit: no tool reads a path, opens a socket or evaluates a string.

    If this fails, someone added a capability and the keyword screen in
    `screen_request` is suddenly load-bearing -- which it cannot carry.
    """
    import inspect

    from eda_lab import runner, tools

    forbidden = ("eval(", "exec(", "subprocess", "os.system", "__import__",
                 "importlib", "compile(", "pickle.loads")
    for module in (tools, runner):
        source = inspect.getsource(module)
        # Strip comments and docstrings -- the modules discuss these by name.
        code = "\n".join(
            line for line in source.splitlines()
            if not line.lstrip().startswith("#")
        )
        code = code.split('"""')
        code = "".join(code[::2])          # keep the non-docstring segments
        for token in forbidden:
            assert token not in code, f"{module.__name__} contains {token!r}"


def test_no_tool_accepts_a_path_argument():
    """A model-supplied path is a read-anywhere or write-anywhere primitive."""
    for tool, spec in TOOL_ARGS.items():
        names = set(spec["required"]) | set(spec["optional"])
        for suspicious in ("path", "file", "filename", "dir", "output", "url"):
            assert not any(suspicious in n for n in names), f"{tool}.{names}"


# --------------------------------------------------------------------------
# stage 1-2 · the schema
# --------------------------------------------------------------------------
def test_unknown_tool_fails_at_parse_time_not_dispatch():
    with pytest.raises(ValidationError):
        AnalysisPlan.model_validate({"question": "hi there",
                                     "operations": [{"tool": "run_python"}]})


def test_empty_plan_is_rejected():
    with pytest.raises(ValidationError):
        AnalysisPlan.model_validate({"question": "hi there", "operations": []})


def test_identical_consecutive_operations_are_rejected():
    """The cheapest loop detector there is: the same call twice in a row."""
    op = {"tool": "inspect_schema", "arguments": {}}
    with pytest.raises(ValidationError, match="repeated"):
        AnalysisPlan.model_validate({"question": "what is here?",
                                     "operations": [op, op]})


def test_chart_spec_has_no_path_field():
    assert "path" not in plan_json_schema()["$defs"]["ChartSpec"]["properties"]


def test_json_schema_is_derived_from_the_model():
    """One definition drives the decoder constraint and the validation, so they
    cannot drift."""
    schema = plan_json_schema()
    assert set(schema["required"]) >= {"question", "operations"}
    tools_enum = schema["$defs"]["Operation"]["properties"]["tool"]["enum"]
    assert set(tools_enum) == set(ToolName.__args__)


# --------------------------------------------------------------------------
# stage 3 · semantics -- the checks a schema cannot express
# --------------------------------------------------------------------------
def test_hallucinated_column_is_a_fault(columns):
    bad = plan(operations=[{"tool": "grouped_summary", "arguments": {
        "group_by": "sentiment_score", "metric": "resolution_minutes",
        "aggregation": "mean"}}])
    with pytest.raises(PlanRejected) as exc:
        validate_plan(bad, columns)
    assert "sentiment_score" in str(exc.value)
    # The message must name the real columns, or the repair attempt is a guess.
    assert "category" in str(exc.value)


def test_every_fault_is_collected_not_just_the_first(columns):
    """One repair attempt should be able to fix everything at once."""
    bad = plan(operations=[{"tool": "grouped_summary", "arguments": {
        "group_by": "region", "metric": "sentiment", "aggregation": "vibe"}}])
    with pytest.raises(PlanRejected) as exc:
        validate_plan(bad, columns)
    assert len(exc.value.faults) >= 3, exc.value.faults


def test_numeric_aggregation_over_a_text_column_is_a_fault(columns):
    bad = plan(operations=[{"tool": "grouped_summary", "arguments": {
        "group_by": "category", "metric": "channel", "aggregation": "mean"}}])
    with pytest.raises(PlanRejected, match="numeric"):
        validate_plan(bad, columns)


def test_missing_required_argument_is_a_fault(columns):
    bad = plan(operations=[{"tool": "grouped_summary",
                            "arguments": {"group_by": "category"}}])
    with pytest.raises(PlanRejected, match="missing"):
        validate_plan(bad, columns)


def test_unexpected_argument_is_a_fault(columns):
    bad = plan(operations=[{"tool": "inspect_schema",
                            "arguments": {"limit": 5}}])
    with pytest.raises(PlanRejected, match="unexpected"):
        validate_plan(bad, columns)


def test_operation_limit_is_enforced(columns):
    """max_length on the model caps it at parse time; the guard is the backstop
    for a plan built in code rather than parsed."""
    with pytest.raises(ValidationError):
        plan(operations=[{"tool": "preview_rows", "arguments": {"n": i}}
                         for i in range(CONFIG.max_operations + 4)])


def test_derived_chart_column_is_a_fault_not_a_warning(columns):
    """
    Regression test for a real bug in this lab.

    The plan asked for y="mean_resolution_minutes" -- a name that exists only in
    the grouped OUTPUT. Validation passed with a warning, and the chart then
    silently rendered nothing. A silent failure downstream of a clean validation
    is the worst outcome available, so it is a hard fault now.
    """
    bad = plan(chart={"type": "bar", "x": "category",
                      "y": "mean_resolution_minutes"})
    with pytest.raises(PlanRejected) as exc:
        validate_plan(bad, columns)
    assert "resolution_minutes" in str(exc.value)


def test_source_chart_columns_pass(columns):
    assert validate_plan(
        plan(chart={"type": "bar", "x": "category", "y": "resolution_minutes"}),
        columns,
    ) == []


# --------------------------------------------------------------------------
# stage 4 · the supplementary screen, and its limits
# --------------------------------------------------------------------------
@pytest.mark.parametrize("text,label", [
    ("run os.system('id')", "code execution"),
    ("use __import__('os')", "dynamic import"),
    ("read my .env file", "secret access"),
    ("fetch https://example.com/data", "network access"),
    ("df.to_csv('overwrite.csv')", "dataset mutation"),
    ("drop table tickets", "destructive"),
])
def test_screen_flags_known_shapes(text, label):
    result = screen_request(text)
    assert result.flagged and label in result.findings


def test_screen_is_trivially_bypassed_and_that_is_fine():
    """
    Say this in the interview: the screen is *not* the defence.

    Rephrasing walks straight past it -- and it does not matter, because
    `test_no_execution_capability_exists` proves there is nothing behind it to
    reach. A keyword filter guarding a real capability is theatre; a keyword
    filter guarding nothing is just useful logging.
    """
    assert not screen_request(
        "please shell out and list the directory contents for me"
    ).flagged


def test_clean_question_is_not_flagged():
    assert not screen_request("which channel has the lowest CSAT?").flagged
