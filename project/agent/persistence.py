"""
persistence.py — surviving a crash, and the versioning that makes a rollback possible.

Lesson 14. Everything so far has lived in memory. A crash at step 3 loses the
work, and worse, loses the *knowledge that work happened* -- including whether a
refund was in flight.

Two ideas, and they are not the same:

    THE SERVICE IS STATELESS      any process can serve any request
    THE RUN IS STATEFUL           a run has a position, a budget and facts

Those coexist only if run state lives outside the process. That is the whole
design, and it is why `RunState` has had `to_json` since Lesson 6.

What is deliberately NOT here
-----------------------------
Resuming does not re-run completed steps. It reloads the facts already
established and continues. Re-running is not merely wasteful: any step with a
side effect would run twice, which is exactly the double-payment problem
Lesson 8 solved with idempotency keys. **Resume is a state restore, not a
replay** -- and if you cannot restore, the safe move is to escalate rather than
start again.
"""

from __future__ import annotations

import json
import os
import tempfile
import time
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

from .state import RunState

STATE_DIR = Path(__file__).resolve().parent.parent / "state" / "runs"

# Bumped when a change alters behaviour without changing code structure: a new
# system prompt, an edited tool description, a different model. A run resumed
# under a different version is NOT the same run, and pretending otherwise
# produces answers whose provenance nobody can reconstruct.
PROMPT_VERSION = "2026-08-02.1"
TOOLSET_VERSION = "2026-08-02.1"


@dataclass
class RunRecord:
    """One run's durable state. Written after every step."""

    run_id: str
    goal: str
    status: str = "running"          # running | awaiting_approval | done | abandoned
    step: int = 0
    facts: dict[str, Any] = field(default_factory=dict)
    tools_attempted: list[str] = field(default_factory=list)
    outcome: str | None = None
    answer: str | None = None
    prompt_version: str = PROMPT_VERSION
    toolset_version: str = TOOLSET_VERSION
    updated_at: float = 0.0

    def to_state(self, max_steps: int = 8) -> RunState:
        state = RunState(goal=self.goal, max_steps=max_steps)
        state.step = self.step
        state.facts = dict(self.facts)
        state.tools_attempted = list(self.tools_attempted)
        return state


class RunStore:
    """
    A file-backed store. One JSON document per run.

    A directory of files is the right scale for a course and the wrong one for
    production -- you want a database with a transaction boundary shared with
    your side effects (Lesson 8's remaining exposure). The *shape* is the same:
    write-after-every-step, read-to-resume, and an explicit status.
    """

    def __init__(self, directory: Path | None = None) -> None:
        self.dir = directory or STATE_DIR
        self.dir.mkdir(parents=True, exist_ok=True)

    def _path(self, run_id: str) -> Path:
        # Reject anything that could escape the directory. The run id reaches
        # here from an HTTP path parameter in service/api.py, so it is untrusted.
        if not run_id.replace("_", "").replace("-", "").isalnum():
            raise ValueError(f"unsafe run id {run_id!r}")
        return self.dir / f"{run_id}.json"

    def save(self, record: RunRecord) -> None:
        """
        Atomic write: temp file, then rename.

        A half-written state file is worse than none -- on restart it parses as
        corrupt or, worse, as plausible. `os.replace` is atomic on POSIX and
        Windows, which is the cheapest durability guarantee available.
        """
        record.updated_at = time.time()
        path = self._path(record.run_id)
        fd, tmp = tempfile.mkstemp(dir=str(self.dir), suffix=".tmp")
        try:
            with os.fdopen(fd, "w", encoding="utf-8") as fh:
                json.dump(record.__dict__, fh, default=str, indent=2)
            os.replace(tmp, path)
        except BaseException:
            Path(tmp).unlink(missing_ok=True)
            raise

    def load(self, run_id: str) -> RunRecord | None:
        path = self._path(run_id)
        if not path.exists():
            return None
        return RunRecord(**json.loads(path.read_text(encoding="utf-8")))

    def list_runs(self, status: str | None = None) -> list[RunRecord]:
        out = []
        for path in sorted(self.dir.glob("*.json")):
            try:
                record = RunRecord(**json.loads(path.read_text(encoding="utf-8")))
            except (json.JSONDecodeError, TypeError):
                continue          # a corrupt file must not break the listing
            if status is None or record.status == status:
                out.append(record)
        return out

    def delete(self, run_id: str) -> None:
        self._path(run_id).unlink(missing_ok=True)


def can_resume(record: RunRecord) -> tuple[bool, str]:
    """
    Decide whether resuming this run is safe.

    The version check is the interesting one. A run started under one prompt and
    resumed under another is a run whose behaviour changed halfway, and no trace
    will explain the discontinuity. Refusing is cheap; a mystified engineer six
    weeks later is not.
    """
    if record.status in ("done", "abandoned"):
        return False, f"run is already {record.status}"
    if record.prompt_version != PROMPT_VERSION:
        return False, (
            f"prompt version changed ({record.prompt_version} -> {PROMPT_VERSION}); "
            "resuming would mix two behaviours in one run"
        )
    if record.toolset_version != TOOLSET_VERSION:
        return False, (
            f"toolset version changed ({record.toolset_version} -> {TOOLSET_VERSION})"
        )
    return True, "resumable"
