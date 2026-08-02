"""
run_evals.py — score the EDA agent against the golden set.

    python evals/run_evals.py            # fake backend, offline, deterministic
    python evals/run_evals.py --ollama   # score the real Gemma model

Ten metrics, because "did it answer" is not a measurement. The distinction that
gets asked about in interviews is here in the code: **outcome** metrics score the
final answer, **trajectory** metrics score how it got there. A run that produces
the right number by calling three unnecessary tools and ignoring 21% missing
data is not a good run, and only trajectory metrics can tell you that.

Exits non-zero when any case fails, so it can gate a change.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from eda_lab.brain import FakeEdaBrain, get_brain          # noqa: E402
from eda_lab.config import CONFIG                          # noqa: E402
from eda_lab.runner import RunResult, ask                  # noqa: E402
from eda_lab.schemas import ToolName                       # noqa: E402
from eda_lab.tools import REGISTRY                         # noqa: E402

GOLDEN = Path(__file__).with_name("golden_set.json")

METRICS = [
    "tool_selection",        # trajectory: did it reach for the right tools
    "column_selection",      # trajectory: real columns, and the right ones
    "aggregation_choice",    # trajectory
    "numerical_correctness",  # outcome: the numbers, to a tolerance
    "missing_data_handling",  # outcome: did the caveat survive to the answer
    "ambiguity_clarification",  # outcome: asking beats guessing
    "unsafe_rejection",      # outcome
    "faithfulness",          # outcome: no figure in the prose that is not in results
    "unsupported_question",  # outcome: refusal instead of invention
    "latency",               # operational
]


def _numbers_in(result: RunResult) -> set[float]:
    """Every number the tools actually produced, rounded, for faithfulness."""
    found: set[float] = set()

    def walk(node) -> None:
        if isinstance(node, bool):
            return
        if isinstance(node, (int, float)):
            found.add(round(float(node), 2))
        elif isinstance(node, dict):
            for v in node.values():
                walk(v)
        elif isinstance(node, list):
            for v in node:
                walk(v)

    walk(result.results)
    return found


def _rows(result: RunResult) -> list[dict]:
    for value in result.results.values():
        if isinstance(value, dict) and isinstance(value.get("rows"), list):
            return value["rows"]
    return []


def _close(a: float, b: float, tol: float) -> bool:
    return abs(float(a) - float(b)) <= tol


def score_case(case: dict, use_ollama: bool) -> dict:
    brain = get_brain(CONFIG) if use_ollama else FakeEdaBrain(mode=case.get("mode", "normal"))
    result = ask(case["question"], brain=brain)
    checks: list[tuple[str, bool, str]] = []

    def check(metric: str, ok: bool, detail: str = "") -> None:
        checks.append((metric, bool(ok), detail))

    # ---- outcome: the status itself ---------------------------------------
    want = case["expect_status"]
    status_ok = result.status == want
    metric = {"clarification": "ambiguity_clarification",
              "rejected": "unsupported_question"}.get(want, "numerical_correctness")
    check(metric, status_ok, f"status={result.status} want={want}")

    plan_ops = (result.plan or {}).get("operations", [])
    used = [op["tool"] for op in plan_ops]

    # ---- trajectory --------------------------------------------------------
    if "expect_tools" in case:
        check("tool_selection", all(t in used for t in case["expect_tools"]),
              f"used={used}")

    # Column and aggregation choice are only meaningful on a plan that survived.
    if plan_ops and want == "answered":
        args = [op.get("arguments", {}) for op in plan_ops]
        from eda_lab.tools import load_data, schema_summary
        known = set(schema_summary(load_data()))
        named = [v for a in args for k, v in a.items()
                 if k in ("column", "group_by", "metric", "date_column")
                 and isinstance(v, str)]
        check("column_selection", all(n in known for n in named), f"named={named}")
        aggs = [a.get("aggregation") for a in args if a.get("aggregation")]
        check("aggregation_choice",
              all(a in ("mean", "median", "sum", "count", "min", "max", "std")
                  for a in aggs), f"aggs={aggs}")

    # ---- outcome: pinned numbers ------------------------------------------
    expected = case.get("expect_values")
    if expected and status_ok:
        tol = expected.get("tolerance", 0.01)
        rows = _rows(result)
        ok, detail = True, ""
        if "top_group" in expected and rows:
            first = rows[0]
            group_val = next(iter(first.values()))
            metric_val = [v for v in first.values() if isinstance(v, (int, float))]
            ok = (str(group_val) == expected["top_group"]
                  and bool(metric_val) and _close(metric_val[0], expected["top_value"], tol))
            detail = f"top={group_val}:{metric_val[:1]}"
        else:
            table = {}
            for row in rows:
                values = list(row.values())
                numeric = [v for v in values[1:] if isinstance(v, (int, float))]
                if numeric:
                    table[str(values[0])] = numeric[0]
            for key, want_value in expected.items():
                if key in ("tolerance",) or key.startswith("ratio_"):
                    continue
                if key in ("refund_true", "refund_false"):
                    key_lookup = "True" if key.endswith("true") else "False"
                elif key == "worst_channel":
                    ok = ok and bool(rows) and str(next(iter(rows[0].values()))) == want_value
                    continue
                elif key == "worst_value":
                    numeric = [v for v in rows[0].values() if isinstance(v, (int, float))]
                    ok = ok and bool(numeric) and _close(numeric[0], want_value, tol)
                    continue
                else:
                    key_lookup = key
                if key_lookup not in table:
                    ok, detail = False, f"missing group {key_lookup}; have {list(table)}"
                elif not _close(table[key_lookup], want_value, tol):
                    ok, detail = False, f"{key_lookup}={table[key_lookup]} want {want_value}"
        check("numerical_correctness", ok, detail or "values match")

    # ---- outcome: caveats survive to the surface ---------------------------
    if "expect_warning_contains" in case and status_ok:
        needle = case["expect_warning_contains"].lower()
        blob = " ".join(result.warnings).lower()
        metric = ("unsafe_rejection" if case.get("kind") == "unsafe"
                  else "missing_data_handling")
        check(metric, needle in blob, f"warnings={result.warnings}")

    if "expect_answer_contains" in case:
        check("unsupported_question" if want == "rejected" else "ambiguity_clarification",
              case["expect_answer_contains"].lower() in result.answer.lower(),
              result.answer[:80])

    if "expect_repairs" in case:
        check("unsupported_question", result.repairs == case["expect_repairs"],
              f"repairs={result.repairs}")

    # ---- the capability boundary, asserted per-case ------------------------
    if case.get("expect_no_execution"):
        ran = [entry.tool for entry in result.trace]
        check("unsafe_rejection",
              all(t in REGISTRY for t in ran) and set(REGISTRY) == set(ToolName.__args__),
              f"ran={ran}")

    # ---- outcome: faithfulness --------------------------------------------
    if status_ok and want == "answered":
        computed = _numbers_in(result)
        quoted = set()
        for token in result.answer.replace(",", " ").split():
            stripped = token.strip("()[]{}:;%.$")
            try:
                quoted.add(round(float(stripped), 2))
            except ValueError:
                pass
        # Small integers appear in ordinary prose ("the top 3"); only figures
        # that look like measurements are worth checking.
        invented = {n for n in quoted if n > 10 and n not in computed
                    and round(n) not in {round(c) for c in computed}}
        check("faithfulness", not invented, f"not in results: {sorted(invented)[:4]}")

    check("latency", result.duration_ms < 60_000, f"{result.duration_ms}ms")

    failed = [f"{m}: {d}" for m, ok, d in checks if not ok]
    return {
        "id": case["id"],
        "kind": case["kind"],
        "passed": not failed,
        "checks": len(checks),
        "failures": failed,
        "status": result.status,
        "duration_ms": result.duration_ms,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--ollama", action="store_true",
                        help="score the real model instead of the deterministic fake")
    parser.add_argument("--case", help="run a single case by id")
    args = parser.parse_args()

    spec = json.loads(GOLDEN.read_text(encoding="utf-8"))
    cases = spec["cases"]
    if args.case:
        cases = [c for c in cases if c["id"] == args.case]
        if not cases:
            print(f"no case with id {args.case!r}")
            return 2

    if args.ollama:
        from eda_lab.runner import preflight
        ok, detail = preflight()
        if not ok:
            print(f"backend not ready: {detail}")
            return 2
        print("scoring against the live model -- expect variation between runs\n")

    print(f"{'case':34} {'kind':16} {'result':8} checks")
    print("-" * 78)
    results = [score_case(c, args.ollama) for c in cases]
    for r in results:
        mark = "PASS" if r["passed"] else "FAIL"
        print(f"{r['id']:34} {r['kind']:16} {mark:8} {r['checks']:>2}  "
              f"({r['duration_ms']}ms)")
        for f in r["failures"]:
            print(f"    - {f}")

    passed = sum(1 for r in results if r["passed"])
    print("-" * 78)
    print(f"{passed}/{len(results)} cases passed   "
          f"({sum(r['checks'] for r in results)} individual checks)")

    by_kind: dict[str, list[bool]] = {}
    for r in results:
        by_kind.setdefault(r["kind"], []).append(r["passed"])
    print("  " + "   ".join(f"{k}: {sum(v)}/{len(v)}" for k, v in sorted(by_kind.items())))

    if passed < len(results):
        print("\nFAILED -- do not ship this change.")
        return 1
    print("\nAll cases passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
