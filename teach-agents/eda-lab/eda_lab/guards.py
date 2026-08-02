"""
guards.py — semantic validation, resource limits, and the supplementary screen.

The security model, in priority order. Say it this way in an interview:

    1 · CAPABILITY      the model cannot execute code, read files or open
                        sockets, because no tool does those things. There is no
                        eval, no exec, no subprocess, no dynamic import, no path
                        argument anywhere in this package. **This is the
                        boundary.**
    2 · SEMANTIC        the plan names real columns, real tools, real
                        aggregations -- checked here, because JSON Schema cannot.
    3 · LIMITS          bounded operations, rows, groups, charts, output size.
    4 · KEYWORD SCREEN  the function at the bottom. Supplementary. Trivially
                        bypassed, kept for logging.

There is a test proving the ordering: disable the keyword screen entirely and
the unsafe request still cannot do anything, because there is nothing for it to
invoke.
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field

from .config import CONFIG, Config
from .schemas import AnalysisPlan

# Which arguments each tool accepts, and which are required. Checked before any
# tool runs -- a tool that validates its own arguments has already been called.
TOOL_ARGS: dict[str, dict[str, tuple[str, ...]]] = {
    "inspect_schema":         {"required": (), "optional": ()},
    "preview_rows":           {"required": (), "optional": ("n",)},
    "missing_value_summary":  {"required": (), "optional": ()},
    "descriptive_statistics": {"required": (), "optional": ("columns",)},
    "value_counts":           {"required": ("column",), "optional": ("top_n",)},
    "grouped_summary":        {"required": ("group_by", "metric", "aggregation"),
                               "optional": ("sort", "top_n")},
    "filter_rows":            {"required": ("column", "op", "value"),
                               "optional": ("n",)},
    "time_series_summary":    {"required": ("date_column",),
                               "optional": ("freq", "metric", "aggregation")},
    "correlation_summary":    {"required": (), "optional": ("columns",)},
    "detect_outliers":        {"required": ("column",), "optional": ("method",)},
    "create_chart":           {"required": ("type",), "optional": ("x", "y", "title")},
}

COLUMN_ARGS = ("column", "group_by", "metric", "date_column", "x", "y")
VALID_AGGREGATIONS = ("mean", "median", "sum", "count", "min", "max", "std")
VALID_OPS = ("==", "!=", ">", ">=", "<", "<=")
VALID_FREQ = ("D", "W", "M", "Q", "Y")
VALID_OUTLIER_METHODS = ("iqr", "zscore")

# Layer 4. Patterns, not intelligence. Every one is evadable by rephrasing --
# which is exactly why it is bottom of the list and used for logging.
UNSAFE_PATTERNS = [
    (r"\b(os\.system|subprocess|popen|eval|exec)\s*\(", "code execution"),
    (r"\b__import__|importlib", "dynamic import"),
    (r"\bopen\s*\(|read_csv\s*\(\s*['\"](?!.*support_ops)", "file access"),
    (r"\brequests\.|urllib|http[s]?://", "network access"),
    (r"\.env\b|api[_ ]?key|secret|credential|password", "secret access"),
    (r"\brm\s+-rf|del\s+/|drop\s+table|truncate\s+table", "destructive"),
    (r"\bto_csv\s*\(|to_parquet\s*\(|\.write\b", "dataset mutation"),
]


@dataclass
class Screening:
    flagged: bool = False
    findings: list[str] = field(default_factory=list)

    def report(self) -> str:
        return "; ".join(self.findings) if self.findings else "clean"


class PlanRejected(Exception):
    """Semantic validation failed. Carries every fault, not just the first."""

    def __init__(self, faults: list[str]) -> None:
        super().__init__("; ".join(faults))
        self.faults = faults


# --------------------------------------------------------------------------
# Layer 2 + 3 · semantic validation and limits
# --------------------------------------------------------------------------
def validate_plan(
    plan: AnalysisPlan,
    columns: dict[str, str],
    cfg: Config | None = None,
) -> list[str]:
    """
    Check a schema-valid plan against reality. Returns warnings; raises on faults.

    Every fault is collected rather than short-circuiting, for the same reason
    as the main course's argument validator: one repair attempt should be able
    to fix everything at once.
    """
    cfg = cfg or CONFIG
    faults: list[str] = []
    warnings: list[str] = []
    known = set(columns)

    if len(plan.operations) > cfg.max_operations:
        faults.append(
            f"{len(plan.operations)} operations exceeds the limit of {cfg.max_operations}"
        )

    for i, op in enumerate(plan.operations):
        spec = TOOL_ARGS.get(op.tool)
        if spec is None:                       # unreachable via the Literal type
            faults.append(f"op{i}: unknown tool {op.tool!r}")
            continue

        allowed = set(spec["required"]) | set(spec["optional"])
        unexpected = set(op.arguments) - allowed
        if unexpected:
            faults.append(
                f"op{i} {op.tool}: unexpected argument(s) "
                f"{', '.join(sorted(unexpected))}; allowed: {', '.join(sorted(allowed)) or 'none'}"
            )
        missing = [a for a in spec["required"] if a not in op.arguments]
        if missing:
            faults.append(f"op{i} {op.tool}: missing {', '.join(missing)}")

        # THE check JSON Schema cannot do: does this column exist?
        for key in COLUMN_ARGS:
            value = op.arguments.get(key)
            if isinstance(value, str) and value and value not in known:
                faults.append(
                    f"op{i} {op.tool}: column {value!r} does not exist. "
                    f"Available: {', '.join(sorted(known))}"
                )
        cols = op.arguments.get("columns")
        if isinstance(cols, list):
            for value in cols:
                if value not in known:
                    faults.append(f"op{i} {op.tool}: column {value!r} does not exist")

        agg = op.arguments.get("aggregation")
        if agg is not None and agg not in VALID_AGGREGATIONS:
            faults.append(
                f"op{i} {op.tool}: aggregation {agg!r} is not supported; "
                f"use one of {', '.join(VALID_AGGREGATIONS)}"
            )
        op_arg = op.arguments.get("op")
        if op_arg is not None and op_arg not in VALID_OPS:
            faults.append(f"op{i} {op.tool}: operator {op_arg!r} is not supported")
        freq = op.arguments.get("freq")
        if freq is not None and freq not in VALID_FREQ:
            faults.append(f"op{i} {op.tool}: freq {freq!r} is not supported")
        method = op.arguments.get("method")
        if method is not None and method not in VALID_OUTLIER_METHODS:
            faults.append(f"op{i} {op.tool}: method {method!r} is not supported")

        # A numeric aggregation over a text column is a real mistake a planner
        # makes, and pandas would either raise or silently do something odd.
        metric = op.arguments.get("metric")
        if (isinstance(metric, str) and metric in columns and agg in
                ("mean", "median", "sum", "std")):
            dtype = columns[metric]
            if not (dtype.startswith(("int", "float", "bool"))):
                faults.append(
                    f"op{i} {op.tool}: {agg} needs a numeric column, "
                    f"but {metric!r} is {dtype}"
                )

    if plan.chart.type != "none":
        for key in ("x", "y"):
            value = getattr(plan.chart, key)
            # A FAULT, not a warning. The chart tool aggregates from the source
            # frame, so a derived name like `mean_resolution_minutes` renders
            # nothing. This was a warning first, and the result was a plan that
            # validated cleanly and then produced no chart -- a silent failure.
            # Naming the real columns here lets one repair attempt fix it.
            if value and value not in known:
                faults.append(
                    f"chart.{key}={value!r} is not a source column. Use the raw "
                    f"column (the chart aggregates it for you). Available: "
                    f"{', '.join(sorted(known))}"
                )

    if faults:
        raise PlanRejected(faults)
    return warnings


# --------------------------------------------------------------------------
# Layer 4 · the supplementary screen
# --------------------------------------------------------------------------
def screen_request(text: str) -> Screening:
    """
    Look for known-unsafe shapes in a question or a plan.

    Use the result to LOG and to produce a helpful refusal -- never as the thing
    that keeps you safe. There is nothing here for an unsafe request to reach:
    the tool registry contains eleven pandas functions and no execution
    primitive, and `test_no_execution_capability_exists` asserts it.
    """
    out = Screening()
    low = text.lower()
    for pattern, label in UNSAFE_PATTERNS:
        if re.search(pattern, low):
            out.flagged = True
            if label not in out.findings:
                out.findings.append(label)
    return out
