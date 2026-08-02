"""
Command line for the EDA lab.

    python -m eda_lab.cli "Which categories take longest to resolve?"
    python -m eda_lab.cli --check         backend preflight only
    python -m eda_lab.cli --examples      the six worked questions
    python -m eda_lab.cli --schema        the dataset, without a model
"""

from __future__ import annotations

import sys

from .config import CONFIG, KNOWN_MODELS
from .runner import ask, preflight
from .tools import load_data, schema_summary

EXAMPLES = [
    "Which ticket categories have the longest resolution times?",
    "Does escalation rate differ by customer tier?",
    "Which channels receive the lowest CSAT scores?",
    "Are refund requests associated with longer resolution times?",
    "How has ticket volume changed over time?",
    "Which variables appear related to escalation?",
]


def main(argv: list[str]) -> int:
    if "--schema" in argv:
        frame = load_data()
        print(f"{len(frame)} rows · {len(frame.columns)} columns (SYNTHETIC)\n")
        for name, dtype in schema_summary(frame).items():
            missing = frame[name].isna().sum()
            flag = f"  ({missing} missing)" if missing else ""
            print(f"  {name:24} {dtype:16}{flag}")
        return 0

    print(f"config: {CONFIG.describe()}")
    ok, detail = preflight()
    if not ok:
        print(f"\nBackend unavailable.\n\n{detail}\n")
        print("Known-good models:")
        for name, note in KNOWN_MODELS.items():
            print(f"  {name:12} {note}")
        print("\nThis lab does NOT fall back to a stub: a silent fallback would let")
        print("you believe you had tested against a model when you had not.")
        return 1
    print(f"backend ready: {detail}\n")

    if "--check" in argv:
        return 0

    questions = EXAMPLES if "--examples" in argv else [a for a in argv if not a.startswith("--")]
    if not questions:
        print('Usage: python -m eda_lab.cli "your question"   (or --examples)')
        return 2

    for question in questions:
        print("=" * 78)
        print(ask(question).render())
        print()
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
