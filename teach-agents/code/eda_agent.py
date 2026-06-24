"""
EDA Agent — an "evolved" Exploratory Data Analysis agent (EnM scenario #6).

EnM #6 asks for an EDA that does NOT just analyze a dataset, but correlates findings to the
process context (P&ID / SOPs) and suggests "nuances of operations which are potential candidates
for digital intervention."

This file models exactly that, as an orchestration of three specialists (Lesson 4 pattern):

   EDA Engine        -> classical statistics on the dataset (the "simple EDA")
   P&ID Engine       -> joins each statistical finding to process_context.md (the "nuances")
   Insight/LLM layer -> turns process-aware findings into intervention candidates

As in every EnM scenario, the heavy lifting is CLASSICAL (correlations, missing-value checks,
group comparisons). The LLM's job is to reason over the joined findings and phrase the insights.
An offline fallback "insight" function runs with no API key so the whole pipeline works for free;
set GEMINI_API_KEY to have a real model write the narrative instead.

Run:  python eda_agent.py
"""

import os
import csv
import statistics

DATA_FILE = "batch_data.csv"
CONTEXT_FILE = "process_context.md"

NUMERIC = ["reactor_temp", "catalyst_conc", "feed_moisture", "yield_pct", "quality_defects"]
TARGET = "yield_pct"


# ----------------------------------------------------------------------------- #
#  Helpers
# ----------------------------------------------------------------------------- #
def load_rows(path=DATA_FILE):
    with open(path, newline="") as f:
        return list(csv.DictReader(f))


def _to_float(x):
    try:
        return float(x)
    except (TypeError, ValueError):
        return None


def _pearson(xs, ys):
    """Correlation coefficient over paired values (skipping any None)."""
    pairs = [(x, y) for x, y in zip(xs, ys) if x is not None and y is not None]
    if len(pairs) < 3:
        return None
    xs2, ys2 = zip(*pairs)
    mx, my = statistics.mean(xs2), statistics.mean(ys2)
    num = sum((x - mx) * (y - my) for x, y in pairs)
    den = (sum((x - mx) ** 2 for x in xs2) * sum((y - my) ** 2 for y in ys2)) ** 0.5
    return None if den == 0 else round(num / den, 3)


# ----------------------------------------------------------------------------- #
#  AGENT 1 — EDA Engine (classical statistics)
# ----------------------------------------------------------------------------- #
def eda_engine():
    rows = load_rows()
    cols = {c: [_to_float(r[c]) for r in rows] for c in NUMERIC}

    # data-quality: missing values + simple outliers
    missing = {c: sum(1 for v in cols[c] if v is None) for c in NUMERIC}
    missing = {c: n for c, n in missing.items() if n}
    outliers = []
    for c in NUMERIC:
        vals = [v for v in cols[c] if v is not None]
        if len(vals) < 3:
            continue
        m, sd = statistics.mean(vals), statistics.pstdev(vals) or 1e-9
        for r in rows:
            v = _to_float(r[c])
            if v is not None and abs((v - m) / sd) >= 3:
                outliers.append({"batch_id": r["batch_id"], "col": c, "value": v})

    # correlations of every numeric driver with the target
    correlations = {}
    for c in NUMERIC:
        if c == TARGET:
            continue
        correlations[c] = _pearson(cols[c], cols[TARGET])

    # group comparison: yield by shift (a categorical driver)
    by_shift = {}
    for r in rows:
        y = _to_float(r[TARGET])
        if y is not None:
            by_shift.setdefault(r["shift"], []).append(y)
    shift_means = {s: round(statistics.mean(v), 2) for s, v in sorted(by_shift.items())}

    return {
        "n_rows": len(rows),
        "missing": missing,
        "outliers": outliers,
        "correlations": correlations,
        "yield_by_shift": shift_means,
    }


# ----------------------------------------------------------------------------- #
#  AGENT 2 — P&ID Engine (join findings to process context)
# ----------------------------------------------------------------------------- #
def pid_engine(eda):
    """Turn raw stats into PROCESS-AWARE findings using process_context.md."""
    context = open(CONTEXT_FILE, encoding="utf-8").read()  # available to an LLM layer too
    findings = []

    # strong correlations -> expected vs. surprising per design intent
    expected_positive = {"reactor_temp", "catalyst_conc"}      # should raise yield
    expected_negative = {"feed_moisture", "quality_defects"}   # should lower yield
    for driver, r in eda["correlations"].items():
        if r is None:
            continue
        if abs(r) >= 0.3:
            direction = "positive" if r > 0 else "negative"
            if driver in expected_positive and r > 0:
                note = "matches design intent (higher should raise yield)"
            elif driver in expected_negative and r < 0:
                note = "matches design intent (higher should lower yield)"
            else:
                note = "review -- NOT the expected direction"
            findings.append(f"{driver} has a {direction} correlation with yield (r={r}); {note}.")

    # shift-linked yield gap -> procedural intervention candidate
    sm = eda["yield_by_shift"]
    if sm:
        worst = min(sm, key=sm.get); best = max(sm, key=sm.get)
        gap = round(sm[best] - sm[worst], 2)
        if gap >= 2.0:
            findings.append(
                f"Shift {worst} averages {sm[worst]}% yield vs {sm[best]}% for shift {best} "
                f"(gap {gap}pp). Context says shift should be yield-neutral -> procedural/training gap, "
                f"a candidate for an operator decision-support intervention.")

    # data quality
    for col, n in eda["missing"].items():
        findings.append(f"{n} missing value(s) in '{col}' -- context requires these be flagged, not dropped.")
    for o in eda["outliers"]:
        findings.append(f"Batch {o['batch_id']}: {o['col']}={o['value']} is a statistical outlier "
                        f"(context: yield>95 is implausible -> likely entry/sensor error).")
    return {"context_chars": len(context), "process_aware_findings": findings}


# ----------------------------------------------------------------------------- #
#  AGENT 3 — Insight layer (LLM, with offline fallback)
# ----------------------------------------------------------------------------- #
def insight_layer(joined):
    findings = joined["process_aware_findings"]
    if os.environ.get("GEMINI_API_KEY"):
        import google.generativeai as genai
        genai.configure(api_key=os.environ["GEMINI_API_KEY"])
        model = genai.GenerativeModel("gemini-1.5-flash")
        prompt = ("You are a process EDA agent. Given these process-aware findings, write a short "
                  "ranked list of 'digital intervention candidates' for an engineering team:\n- "
                  + "\n- ".join(findings))
        return model.generate_content(prompt).text.strip()
    # offline fallback: rank findings, intervention candidates first
    priority = [f for f in findings if "candidate" in f or "review" in f]
    rest = [f for f in findings if f not in priority]
    out = ["DIGITAL INTERVENTION CANDIDATES (ranked):"]
    for i, f in enumerate(priority + rest, 1):
        out.append(f"  {i}. {f}")
    return "\n".join(out)


# ----------------------------------------------------------------------------- #
#  ORCHESTRATOR
# ----------------------------------------------------------------------------- #
def run():
    print("=" * 64)
    print("EDA AGENT (EnM #6): EDA Engine -> P&ID Engine -> Insight layer")
    print("=" * 64)

    print("\n[EDA Engine] computing statistics...")
    eda = eda_engine()
    print(f"    rows={eda['n_rows']}  missing={eda['missing']}  outliers={len(eda['outliers'])}")
    print(f"    correlations with yield: {eda['correlations']}")
    print(f"    yield by shift: {eda['yield_by_shift']}")

    print("\n[P&ID Engine] correlating findings to process context...")
    joined = pid_engine(eda)
    for f in joined["process_aware_findings"]:
        print(f"    - {f}")

    print("\n[Insight layer] turning findings into intervention candidates...")
    print()
    print(insight_layer(joined))


if __name__ == "__main__":
    run()
