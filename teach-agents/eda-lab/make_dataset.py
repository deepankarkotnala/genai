"""
make_dataset.py — the synthetic support-operations dataset.

    python make_dataset.py --seed 20260731

SYNTHETIC. No real customers, no PII. Every value is generated.

Byte-for-byte reproducibility is *enforced*, not hoped for. Five things have to
be pinned or the file differs between machines and the golden numbers rot:

    1. the RNG            numpy default_rng(seed), never the global one
    2. category order     fixed tuples, so codes never depend on dict order
    3. row order          sorted by ticket_id before writing
    4. float formatting   float_format="%.2f"
    5. line endings       lineterminator="\\n", encoding="utf-8"

Planted signals are documented in DATA_DICTIONARY.md and asserted in
tests/test_golden.py, so the data and the expectations cannot drift apart.
"""

from __future__ import annotations

import argparse
from pathlib import Path

import numpy as np
import pandas as pd

DATA_DIR = Path(__file__).resolve().parent / "data"
OUT = DATA_DIR / "support_ops_synthetic.csv"

N_ROWS = 800
START = pd.Timestamp("2025-08-01")
DAYS = 365

# Fixed order. Never sort these, never build them from a set.
CATEGORIES = ("Billing", "Shipping", "Returns", "Technical", "Account", "Other")
PRIORITIES = ("Low", "Normal", "High", "Urgent")
CHANNELS = ("Email", "Chat", "Phone", "Web")
TIERS = ("Free", "Pro", "Enterprise")
STATUSES = ("Open", "Pending", "Resolved", "Closed")

# --- planted signals ------------------------------------------------------
# STRONG: Returns take longest; Enterprise escalates ~2x Free.
CATEGORY_RESOLUTION_BASE = {
    "Returns": 520, "Billing": 300, "Technical": 380,
    "Shipping": 260, "Account": 150, "Other": 200,
}
TIER_ESCALATION_RATE = {"Free": 0.05, "Pro": 0.12, "Enterprise": 0.20}
# WEAK: Phone has the lowest CSAT, but the gap is small and noisy on purpose --
# a signal that survives a t-test but not a glance is the interesting case.
CHANNEL_CSAT_BASE = {"Phone": 3.5, "Email": 3.8, "Web": 3.9, "Chat": 4.0}
# CONFOUNDER: priority drives BOTH escalation and resolution time, so the naive
# "Enterprise tickets take longer" reading is partly priority, not tier.
PRIORITY_MULTIPLIER = {"Low": 0.8, "Normal": 1.0, "High": 1.35, "Urgent": 1.7}
PRIORITY_ESCALATION_BONUS = {"Low": -0.04, "Normal": 0.0, "High": 0.08, "Urgent": 0.18}


def build(seed: int) -> pd.DataFrame:
    rng = np.random.default_rng(seed)

    category = rng.choice(CATEGORIES, N_ROWS, p=[0.26, 0.16, 0.14, 0.22, 0.14, 0.08])
    priority = rng.choice(PRIORITIES, N_ROWS, p=[0.22, 0.46, 0.24, 0.08])
    channel = rng.choice(CHANNELS, N_ROWS, p=[0.34, 0.30, 0.16, 0.20])
    tier = rng.choice(TIERS, N_ROWS, p=[0.50, 0.34, 0.16])

    # Volume grows mildly over the year, so a trend question has an answer.
    day_weights = np.linspace(0.7, 1.3, DAYS)
    day_weights = day_weights / day_weights.sum()
    offsets = rng.choice(DAYS, N_ROWS, p=day_weights)
    created = [START + pd.Timedelta(days=int(d),
                                    hours=int(rng.integers(7, 20)),
                                    minutes=int(rng.integers(0, 60)))
               for d in offsets]

    base = np.array([CATEGORY_RESOLUTION_BASE[c] for c in category], dtype=float)
    mult = np.array([PRIORITY_MULTIPLIER[p] for p in priority], dtype=float)
    # Lognormal noise: resolution times are right-skewed in every real dataset.
    resolution = base * mult * rng.lognormal(0.0, 0.45, N_ROWS)

    # ~12 deliberate outliers -- tickets that sat over a weekend and a holiday.
    outlier_idx = rng.choice(N_ROWS, 12, replace=False)
    resolution[outlier_idx] *= rng.uniform(6.0, 11.0, 12)

    first_response = resolution * rng.uniform(0.04, 0.22, N_ROWS) + rng.uniform(2, 25, N_ROWS)

    esc_p = np.array([TIER_ESCALATION_RATE[t] for t in tier]) + \
            np.array([PRIORITY_ESCALATION_BONUS[p] for p in priority])
    escalated = rng.random(N_ROWS) < np.clip(esc_p, 0.01, 0.95)

    refund_requested = (
        (category == "Returns") & (rng.random(N_ROWS) < 0.72)
    ) | ((category == "Billing") & (rng.random(N_ROWS) < 0.28))
    # Refund-requested tickets resolve slower: another planted, checkable signal.
    resolution = np.where(refund_requested, resolution * 1.25, resolution)

    refund_amount = np.where(refund_requested,
                             np.round(rng.uniform(9.99, 480.00, N_ROWS), 2),
                             np.nan)

    csat_base = np.array([CHANNEL_CSAT_BASE[c] for c in channel])
    csat = np.clip(np.round(csat_base + rng.normal(0, 0.9, N_ROWS)), 1, 5)
    # ~22% missing: only surveyed tickets have a score. NOT missing at random --
    # escalated tickets are surveyed less, which is the honest awkward case.
    survey_p = np.where(escalated, 0.62, 0.82)
    csat = np.where(rng.random(N_ROWS) < survey_p, csat, np.nan)

    # ~4% missing first_response: tickets auto-closed before anyone replied.
    first_response = np.where(rng.random(N_ROWS) < 0.96, first_response, np.nan)

    status = rng.choice(STATUSES, N_ROWS, p=[0.10, 0.12, 0.38, 0.40])

    frame = pd.DataFrame({
        "ticket_id": [f"TCK-{10000 + i}" for i in range(N_ROWS)],
        "created_at": created,
        "category": category,
        "priority": priority,
        "channel": channel,
        "customer_tier": tier,
        "first_response_minutes": np.round(first_response, 2),
        "resolution_minutes": np.round(resolution, 2),
        "status": status,
        "escalated": escalated,
        "refund_requested": refund_requested,
        "refund_amount": refund_amount,
        "csat_score": csat,
    })
    return frame.sort_values("ticket_id").reset_index(drop=True)


def write(frame: pd.DataFrame, path: Path = OUT) -> Path:
    path.parent.mkdir(parents=True, exist_ok=True)
    frame.to_csv(
        path,
        index=False,
        lineterminator="\n",              # not os.linesep
        encoding="utf-8",
        float_format="%.2f",
        date_format="%Y-%m-%dT%H:%M:%S",
    )
    return path


def main() -> int:
    ap = argparse.ArgumentParser(description="Generate the synthetic dataset.")
    ap.add_argument("--seed", type=int, default=20260731)
    ap.add_argument("--check", action="store_true",
                    help="regenerate and confirm the file is unchanged")
    args = ap.parse_args()

    frame = build(args.seed)
    if args.check:
        import hashlib
        before = hashlib.sha256(OUT.read_bytes()).hexdigest() if OUT.exists() else None
        tmp = OUT.with_suffix(".check.csv")
        write(frame, tmp)
        after = hashlib.sha256(tmp.read_bytes()).hexdigest()
        tmp.unlink()
        print(f"stored:      {before}")
        print(f"regenerated: {after}")
        print("reproducible" if before == after else "MISMATCH")
        return 0 if before == after else 1

    path = write(frame)
    print(f"wrote {len(frame)} rows -> {path}")
    print(f"  missing csat_score            {frame['csat_score'].isna().mean():.1%}")
    print(f"  missing first_response        {frame['first_response_minutes'].isna().mean():.1%}")
    print(f"  refund_requested              {frame['refund_requested'].mean():.1%}")
    print(f"  escalated                     {frame['escalated'].mean():.1%}")
    slowest = frame.groupby("category")["resolution_minutes"].mean().idxmax()
    print(f"  slowest category              {slowest}")
    rates = frame.groupby("customer_tier")["escalated"].mean()
    print(f"  escalation Enterprise/Free    {rates['Enterprise'] / rates['Free']:.2f}x")
    worst = frame.groupby("channel")["csat_score"].mean().idxmin()
    print(f"  lowest-CSAT channel           {worst}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
