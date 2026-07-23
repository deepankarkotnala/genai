"""
Lesson 3 — a FORECASTING tool, to contrast with threshold detection.

In Lesson 2's agent, detect_anomalies uses a z-score: it only fires AFTER a value
is already far from normal. That missed the slow temperature ramp in our data,
because a gradual rise inflates the standard deviation and hides itself.

A reliability agent (EnM scenario #2) needs to PREDICT: "this trend, extrapolated,
crosses a safe limit in ~N steps." This file adds that as a tool.

This is the EnM phrase "time-series prediction/extrapolation ... predict if an anomaly
is going to happen and if yes, in what time-frame" -- as ~25 lines of classical code.

Run:  python forecast_tool.py
"""

import csv
import statistics

DATA_FILE = "sensor_data.csv"


def load_data(path=DATA_FILE):
    with open(path, newline="") as f:
        return list(csv.DictReader(f))


def _linear_fit(ys):
    """Least-squares slope & intercept for y vs. index 0..n-1. Pure stdlib."""
    n = len(ys)
    xs = list(range(n))
    mx = statistics.mean(xs)
    my = statistics.mean(ys)
    denom = sum((x - mx) ** 2 for x in xs) or 1e-9
    slope = sum((x - mx) * (y - my) for x, y in zip(xs, ys)) / denom
    intercept = my - slope * mx
    return slope, intercept


def forecast_breach(tag, limit, window=15, horizon=20):
    """TOOL: fit a trend to the LAST `window` readings of `tag`, extrapolate, and
    report whether/when it will cross `limit`.

    Returns: trend slope, current value, and steps-until-breach (or None if no breach
    is forecast within `horizon` steps).
    """
    rows = load_data()
    ys = [float(r[tag]) for r in rows][-window:]
    slope, intercept = _linear_fit(ys)
    current = ys[-1]
    last_idx = len(ys) - 1

    steps_to_breach = None
    if slope > 0:  # rising toward an upper limit
        for k in range(1, horizon + 1):
            projected = slope * (last_idx + k) + intercept
            if projected >= limit:
                steps_to_breach = k
                break

    return {
        "tag": tag,
        "current_value": round(current, 2),
        "limit": limit,
        "trend_per_step": round(slope, 3),
        "forecast": ("rising" if slope > 0.05 else "falling" if slope < -0.05 else "stable"),
        "steps_until_breach": steps_to_breach,
        "verdict": (f"Predicted to breach {limit} in ~{steps_to_breach} steps"
                    if steps_to_breach else f"No breach of {limit} forecast within {horizon} steps"),
    }


if __name__ == "__main__":
    # The reactor temperature has a slow upward ramp the z-score missed.
    # Suppose the safe operating limit is 420 C.
    print("Threshold detection looks backward. Forecasting looks forward:\n")
    result = forecast_breach("T101_reactor_temp", limit=420)
    for k, v in result.items():
        print(f"  {k:18} {v}")
