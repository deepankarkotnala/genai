"""
tools.py — eleven deterministic pandas tools. The model calls none of them.

The whole safety argument of this lab is visible in the imports: pandas,
matplotlib, hashlib, re. No `os.system`, no `subprocess`, no `eval`, no `exec`,
no `importlib`, and no function that takes a path. **The capability is absent,
not filtered.**

Every tool goes through the same decorator, which enforces:

    validate arguments   ->  reject unknown columns  ->  operate on a COPY
    ->  cap rows/groups  ->  cap result size  ->  return structured data
    ->  record a trace entry

The copy matters more than it looks: a tool that mutates the shared frame makes
every later operation in the plan depend on execution order, and that bug is
invisible until the day the planner reorders two steps.
"""

from __future__ import annotations

import hashlib
import json
import re
import time
from dataclasses import dataclass, field
from functools import wraps
from pathlib import Path
from typing import Any, Callable

import matplotlib
matplotlib.use("Agg")           # no display, no interactive backend, ever
import matplotlib.pyplot as plt  # noqa: E402
import pandas as pd              # noqa: E402

from .config import CONFIG, DATASET, OUT_DIR, Config  # noqa: E402

_FRAME: pd.DataFrame | None = None


@dataclass
class TraceEntry:
    tool: str
    arguments: dict
    duration_ms: int
    rows_scanned: int
    rows_returned: int
    truncated: bool = False
    error: str | None = None


@dataclass
class ToolContext:
    """Per-run state: the trace, and the chart budget."""

    cfg: Config = field(default_factory=lambda: CONFIG)
    trace: list[TraceEntry] = field(default_factory=list)
    charts_made: int = 0


def load_data(path: Path | None = None) -> pd.DataFrame:
    """Load once, hand out copies. Parsed dtypes are pinned, not inferred."""
    global _FRAME
    if _FRAME is None or path is not None:
        frame = pd.read_csv(path or DATASET, parse_dates=["created_at"])
        frame["escalated"] = frame["escalated"].astype(bool)
        frame["refund_requested"] = frame["refund_requested"].astype(bool)
        if path is not None:
            return frame
        _FRAME = frame
    return _FRAME


def schema_summary(frame: pd.DataFrame | None = None) -> dict[str, str]:
    frame = frame if frame is not None else load_data()
    return {c: str(dt) for c, dt in frame.dtypes.items()}


# --------------------------------------------------------------------------
# The shared decorator
# --------------------------------------------------------------------------
def eda_tool(fn: Callable) -> Callable:
    @wraps(fn)
    def wrapper(ctx: ToolContext, **kwargs: Any) -> dict[str, Any]:
        started = time.perf_counter()
        frame = load_data()

        if len(frame) > ctx.cfg.max_rows_scanned:
            entry = TraceEntry(fn.__name__, kwargs, 0, len(frame), 0,
                               error="dataset exceeds max_rows_scanned")
            ctx.trace.append(entry)
            return {"error": "too_large",
                    "message": f"{len(frame)} rows exceeds the scan limit"}

        try:
            # .copy() -- never hand a tool the shared frame.
            result = fn(ctx, frame.copy(), **kwargs)
        except Exception as exc:                       # noqa: BLE001
            ctx.trace.append(TraceEntry(fn.__name__, kwargs,
                                        int((time.perf_counter() - started) * 1000),
                                        len(frame), 0, error=type(exc).__name__))
            return {"error": "tool_failed",
                    "message": f"{type(exc).__name__}: {exc}"}

        rows = result.get("rows")
        truncated = False
        if isinstance(rows, list) and len(rows) > ctx.cfg.max_rows_returned:
            result["rows"] = rows[: ctx.cfg.max_rows_returned]
            result["truncated"] = truncated = True
            result["total_rows"] = len(rows)

        # Result-size cap. A tool returning 400 KB of JSON would blow the
        # context window of the explain call that follows it.
        blob = json.dumps(result, default=str)
        if len(blob) > 32_000:
            result = {"error": "result_too_large",
                      "message": f"result was {len(blob)} bytes; narrow the query"}
            truncated = True

        ctx.trace.append(TraceEntry(
            fn.__name__, kwargs, int((time.perf_counter() - started) * 1000),
            len(frame), len(result.get("rows", []) or []), truncated,
        ))
        return result

    return wrapper


def _records(frame: pd.DataFrame) -> list[dict]:
    """DataFrame -> JSON-safe records, with NaN as None rather than the string 'nan'."""
    return json.loads(frame.to_json(orient="records", date_format="iso"))


# --------------------------------------------------------------------------
# The eleven tools
# --------------------------------------------------------------------------
@eda_tool
def inspect_schema(ctx, frame, **_) -> dict:
    return {
        "columns": [
            {"name": c, "dtype": str(frame[c].dtype),
             "non_null": int(frame[c].notna().sum()),
             "unique": int(frame[c].nunique(dropna=True))}
            for c in frame.columns
        ],
        "row_count": int(len(frame)),
    }


@eda_tool
def preview_rows(ctx, frame, n: int = 5, **_) -> dict:
    n = max(1, min(int(n), 20))
    return {"rows": _records(frame.head(n)), "returned": n}


@eda_tool
def missing_value_summary(ctx, frame, **_) -> dict:
    missing = frame.isna().sum()
    return {"rows": [
        {"column": c, "missing": int(missing[c]),
         "missing_pct": round(float(missing[c]) / len(frame) * 100, 2)}
        for c in frame.columns if missing[c] > 0
    ], "row_count": int(len(frame)),
        "note": "missingness may not be random -- check before dropping rows"}


@eda_tool
def descriptive_statistics(ctx, frame, columns: list[str] | None = None, **_) -> dict:
    numeric = frame.select_dtypes("number")
    if columns:
        numeric = numeric[[c for c in columns if c in numeric.columns]]
    if numeric.empty:
        return {"rows": [], "note": "no numeric columns selected"}
    stats = numeric.describe().T.round(2).reset_index(names="column")
    return {"rows": _records(stats), "returned": len(stats)}


@eda_tool
def value_counts(ctx, frame, column: str, top_n: int = 20, **_) -> dict:
    top_n = max(1, min(int(top_n), ctx.cfg.max_unique_values))
    counts = frame[column].value_counts(dropna=False).head(top_n)
    return {"column": column, "rows": [
        {"value": (None if pd.isna(k) else k), "count": int(v)}
        for k, v in counts.items()
    ], "distinct": int(frame[column].nunique(dropna=True))}


@eda_tool
def grouped_summary(ctx, frame, group_by: str, metric: str, aggregation: str,
                    sort: str = "none", top_n: int = 50, **_) -> dict:
    groups = frame[group_by].nunique(dropna=True)
    if groups > ctx.cfg.max_groups:
        return {"error": "too_many_groups",
                "message": f"{group_by} has {groups} distinct values "
                           f"(limit {ctx.cfg.max_groups})"}

    series = frame.groupby(group_by, dropna=False)[metric]
    out = getattr(series, aggregation)().round(4)
    counts = frame.groupby(group_by, dropna=False)[metric].count()

    result = pd.DataFrame({
        group_by: out.index.astype(str),
        f"{aggregation}_{metric}": out.values,
        "n": counts.values,
    })
    if sort == "descending":
        result = result.sort_values(f"{aggregation}_{metric}", ascending=False)
    elif sort == "ascending":
        result = result.sort_values(f"{aggregation}_{metric}", ascending=True)

    missing = int(frame[metric].isna().sum())
    return {
        "rows": _records(result.head(int(top_n))),
        "returned": min(len(result), int(top_n)),
        # Stated on every grouped result: an average over a column that is 21%
        # missing is an average over the rows that happen to have it.
        "note": (f"{metric} is missing in {missing} of {len(frame)} rows; "
                 f"the aggregate covers the rest") if missing else None,
    }


@eda_tool
def filter_rows(ctx, frame, column: str, op: str, value: Any, n: int = 20, **_) -> dict:
    series = frame[column]
    if pd.api.types.is_numeric_dtype(series) and isinstance(value, str):
        try:
            value = float(value)
        except ValueError:
            pass
    ops = {"==": series.eq, "!=": series.ne, ">": series.gt,
           ">=": series.ge, "<": series.lt, "<=": series.le}
    matched = frame[ops[op](value)]
    n = max(1, min(int(n), ctx.cfg.max_rows_returned))
    return {"matched": int(len(matched)), "rows": _records(matched.head(n)),
            "returned": min(n, len(matched))}


@eda_tool
def time_series_summary(ctx, frame, date_column: str, freq: str = "M",
                        metric: str = "ticket_id", aggregation: str = "count", **_) -> dict:
    frame = frame.dropna(subset=[date_column])
    # pandas 2.2 renamed the period-end aliases; keep the plan vocabulary simple
    # ("M") and translate here rather than making the model learn "ME".
    freq = {"M": "ME", "Q": "QE", "Y": "YE"}.get(freq, freq)
    grouped = frame.set_index(date_column).resample(freq)[metric]
    out = getattr(grouped, aggregation)()
    if len(out) > ctx.cfg.max_groups:
        return {"error": "too_many_periods",
                "message": f"{len(out)} periods at freq={freq}; use a coarser freq"}
    result = pd.DataFrame({"period": out.index.strftime("%Y-%m-%d"),
                           aggregation: out.values})
    first, last = (float(out.iloc[0]), float(out.iloc[-1])) if len(out) else (0.0, 0.0)
    return {"rows": _records(result), "returned": len(result),
            "first": first, "last": last,
            "change_pct": round((last - first) / first * 100, 1) if first else None}


@eda_tool
def correlation_summary(ctx, frame, columns: list[str] | None = None, **_) -> dict:
    numeric = frame.select_dtypes(include=["number", "bool"]).astype(float)
    if columns:
        # Dropping the unusable names silently would compute a correlation over
        # a *different* set of columns than the one that was asked for, and
        # report it as the answer. Same failure class as the chart bug: refuse
        # and name what is available.
        unusable = [c for c in columns if c not in numeric.columns]
        if unusable:
            return {"error": "unusable_columns",
                    "message": f"{', '.join(unusable)} is not a numeric column. "
                               f"Numeric columns: {', '.join(numeric.columns)}"}
        numeric = numeric[list(columns)]
    if numeric.shape[1] < 2:
        return {"rows": [], "note": "need at least two numeric columns"}

    corr = numeric.corr(numeric_only=True)
    pairs = []
    cols = list(corr.columns)
    for i, a in enumerate(cols):
        for b in cols[i + 1:]:
            r = corr.loc[a, b]
            if pd.notna(r):
                pairs.append({"a": a, "b": b, "r": round(float(r), 3),
                              "strength": _strength(abs(float(r)))})
    pairs.sort(key=lambda p: -abs(p["r"]))
    return {
        "rows": pairs[:20], "returned": min(len(pairs), 20),
        # Not decoration. The single most common misreading of this output is
        # causal, and the tool that produces it should say so.
        "warning": "Correlation is not causation. Pairwise r ignores confounders "
                   "-- priority drives both escalation and resolution time here.",
    }


def _strength(r: float) -> str:
    return "strong" if r >= 0.5 else "moderate" if r >= 0.3 else "weak" if r >= 0.1 else "negligible"


@eda_tool
def detect_outliers(ctx, frame, column: str, method: str = "iqr", **_) -> dict:
    series = frame[column].dropna()
    if method == "zscore":
        mu, sigma = series.mean(), series.std()
        mask = (series - mu).abs() > 3 * sigma
        bounds = {"lower": round(float(mu - 3 * sigma), 2),
                  "upper": round(float(mu + 3 * sigma), 2)}
    else:
        q1, q3 = series.quantile(0.25), series.quantile(0.75)
        iqr = q3 - q1
        lower, upper = q1 - 1.5 * iqr, q3 + 1.5 * iqr
        mask = (series < lower) | (series > upper)
        bounds = {"lower": round(float(lower), 2), "upper": round(float(upper), 2)}

    outliers = frame.loc[mask[mask].index]
    return {"column": column, "method": method, "bounds": bounds,
            "count": int(mask.sum()),
            "pct": round(float(mask.sum()) / len(series) * 100, 2),
            "rows": _records(outliers.head(20)[["ticket_id", column]]),
            "note": "outliers are not errors -- check before removing them"}


@eda_tool
def create_chart(ctx, frame, type: str, x: str = "", y: str = "", title: str = "", **_) -> dict:
    """
    Render a chart. Every path decision is made here, never by the model.

    The filename is derived, the directory is fixed, the count is capped, the
    dimensions and DPI are clamped, and the figure is closed in a `finally` --
    matplotlib leaks memory across a long run otherwise.
    """
    if ctx.charts_made >= ctx.cfg.max_charts:
        return {"error": "chart_limit",
                "message": f"already produced {ctx.charts_made} charts "
                           f"(limit {ctx.cfg.max_charts})"}
    if type == "none":
        return {"skipped": True}

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    slug = re.sub(r"[^a-z0-9]+", "-", (title or f"{type}-{x}-{y}").lower()).strip("-")[:40]
    digest = hashlib.sha1(f"{type}|{x}|{y}|{title}".encode()).hexdigest()[:8]
    path = OUT_DIR / f"{slug or 'chart'}-{digest}.png"

    inches = min(ctx.cfg.chart_max_px, 1200) / 100
    fig, ax = plt.subplots(figsize=(inches, inches * 0.6))
    try:
        if type == "hist" and x in frame.columns:
            ax.hist(frame[x].dropna(), bins=30)
            ax.set_xlabel(x)
        elif x in frame.columns and y in frame.columns:
            plot = frame.groupby(x)[y].mean() if frame[x].dtype == object else frame.set_index(x)[y]
            (ax.bar if type == "bar" else ax.plot)(plot.index.astype(str), plot.values)
            ax.set_xlabel(x); ax.set_ylabel(y)
            if len(plot) > 6:
                ax.tick_params(axis="x", rotation=45)
        else:
            return {"error": "bad_chart",
                    "message": f"cannot plot with x={x!r}, y={y!r}"}
        ax.set_title(title or f"{y} by {x}")
        fig.tight_layout()
        fig.savefig(path, dpi=min(ctx.cfg.chart_max_dpi, 150))
    finally:
        plt.close(fig)          # always, even if savefig raised

    ctx.charts_made += 1
    return {"chart": path.name, "path": str(path.relative_to(OUT_DIR.parent)),
            "type": type}


REGISTRY: dict[str, Callable] = {
    "inspect_schema": inspect_schema,
    "preview_rows": preview_rows,
    "missing_value_summary": missing_value_summary,
    "descriptive_statistics": descriptive_statistics,
    "value_counts": value_counts,
    "grouped_summary": grouped_summary,
    "filter_rows": filter_rows,
    "time_series_summary": time_series_summary,
    "correlation_summary": correlation_summary,
    "detect_outliers": detect_outliers,
    "create_chart": create_chart,
}
