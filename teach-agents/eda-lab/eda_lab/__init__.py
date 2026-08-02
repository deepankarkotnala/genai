"""
Supplementary interview lab: an EDA agent on a local Gemma model.

Not part of the 15-lesson main course. It exists to teach one contrast that
comes up constantly in interviews: an LLM that *plans* analysis, with
deterministic code that *performs* it -- and why the alternative (letting a
model write and run Python) is a capability you should not grant.

    python -m eda_lab.cli "Which ticket categories have the longest resolution times?"
"""

from .runner import RunResult, ask, preflight

__all__ = ["ask", "preflight", "RunResult"]
