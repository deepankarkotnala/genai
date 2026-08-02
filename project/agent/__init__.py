"""
The support-triage agent, grown one capability per lesson.

Wave 1 (lessons 1-3) provides:
    schemas.py  tool declarations + the argument validator
    tools.py    read_ticket, lookup_order, search_kb, and the dispatch boundary
    loop.py     the explicit agent loop

Later lessons add retrieval, memory, reliability controls, the refund approval
path, guardrails, evaluation and tracing to this same package. The milestone
files in ../steps/ are thin entry points over it, not copies of it.
"""

from .loop import RunResult, Step, run
from .schemas import ArgumentError, ToolError, UnknownToolError, validate_arguments
from .tools import execute, tool_specs

__all__ = [
    "run",
    "RunResult",
    "Step",
    "execute",
    "tool_specs",
    "validate_arguments",
    "ToolError",
    "ArgumentError",
    "UnknownToolError",
]
