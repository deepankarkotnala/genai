"""
schemas.py — the analysis plan, as a Pydantic model.

The model's job is to produce ONE of these. It never writes Python, never runs
anything, and never touches the dataframe. It decides *what* analysis is needed;
deterministic pandas tools decide *what the numbers are*.

Two-stage validation, and the distinction matters:

    JSON SCHEMA   constrains the decoder, so the shape comes back right
    PYDANTIC      validates the parse, because constrained decoding is not a
                  guarantee -- and neither stage can tell you whether
                  `category` is a real column

The third stage, semantic validation, lives in `guards.py`. Schema-valid is not
semantically valid: `{"group_by": "sentiment_score"}` satisfies every constraint
here and names a column that does not exist.
"""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field, field_validator

# The allowlist, as a type. A plan naming anything else fails at parse time
# rather than at dispatch, which is the earliest possible point.
ToolName = Literal[
    "inspect_schema",
    "preview_rows",
    "missing_value_summary",
    "descriptive_statistics",
    "value_counts",
    "grouped_summary",
    "filter_rows",
    "time_series_summary",
    "correlation_summary",
    "detect_outliers",
    "create_chart",
]

Aggregation = Literal["mean", "median", "sum", "count", "min", "max", "std"]
SortOrder = Literal["ascending", "descending", "none"]
ChartType = Literal["bar", "line", "hist", "none"]


class Operation(BaseModel):
    """One analysis step. `arguments` is deliberately loose here and tightened
    per-tool in guards.py -- one schema per tool would be eleven schemas the
    model has to choose between, which measurably hurts plan quality."""

    tool: ToolName
    arguments: dict = Field(default_factory=dict)
    why: str = Field(default="", max_length=200)


class ChartSpec(BaseModel):
    """
    Note what is missing: any path or filename field.

    The model cannot name an output file, because a model-supplied path is a
    write-anywhere primitive. `tools.py` derives the filename from a slug plus a
    hash of the plan, into a fixed directory.

    `x` and `y` must be **source columns**, not derived result fields. The chart
    tool reads the dataset and aggregates itself, so `y="resolution_minutes"` is
    right and `y="mean_resolution_minutes"` is not -- that name exists only in
    the grouped output. Getting this wrong was a real bug here: the plan looked
    valid, validation passed with a warning, and the chart silently failed at
    render time. It is now a hard fault with the real column names in the
    message, so one repair attempt can fix it.
    """

    type: ChartType = "none"
    x: str = Field(default="", description="source column for the x axis")
    y: str = Field(default="", description="source column for the y axis; the "
                                           "chart aggregates it by x automatically")
    title: str = Field(default="", max_length=120)


class AnalysisPlan(BaseModel):
    question: str = Field(min_length=3, max_length=500)
    operations: list[Operation] = Field(min_length=1, max_length=5)
    chart: ChartSpec = Field(default_factory=ChartSpec)
    assumptions: list[str] = Field(default_factory=list, max_length=6)
    # Set when the question genuinely cannot be answered from this dataset.
    # A model that can say "I need to know what you mean by 'bad'" is worth more
    # than one that guesses -- so ambiguity is a first-class outcome, not a
    # failure mode.
    clarification_needed: str = Field(default="", max_length=300)

    @field_validator("operations")
    @classmethod
    def _no_duplicate_tools_back_to_back(cls, ops: list[Operation]) -> list[Operation]:
        for a, b in zip(ops, ops[1:]):
            if a.tool == b.tool and a.arguments == b.arguments:
                raise ValueError(f"operation {a.tool} is repeated identically")
        return ops

    @property
    def is_clarification(self) -> bool:
        return bool(self.clarification_needed.strip())


def plan_json_schema() -> dict:
    """
    The schema handed to Ollama's `format` parameter.

    This is the point of using Pydantic rather than hand-rolling: one definition
    drives both the decoder constraint and the validation. If they were separate
    they would drift, and the drift would show up as mysterious parse failures.
    """
    return AnalysisPlan.model_json_schema()
