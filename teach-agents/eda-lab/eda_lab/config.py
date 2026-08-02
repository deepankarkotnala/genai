"""
config.py — every knob, read from the environment, in one place.

The model name is never hardcoded anywhere else. That is not tidiness: this lab
runs on whatever Gemma variant fits your machine, and a hardcoded tag would send
someone with 8 GB of RAM hunting through source files.

`.env.example` is DOCUMENTATION ONLY. No dotenv loader is included, so nothing
is read from a file automatically -- see the README for how to set these in
bash/zsh and in Windows Command Prompt.
"""

from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path

PACKAGE_ROOT = Path(__file__).resolve().parent
LAB_ROOT = PACKAGE_ROOT.parent
DATA_DIR = LAB_ROOT / "data"
OUT_DIR = LAB_ROOT / "out"
DATASET = DATA_DIR / "support_ops_synthetic.csv"


def _int(name: str, default: int) -> int:
    try:
        return int(os.environ.get(name, default))
    except ValueError:
        return default


@dataclass(frozen=True)
class Config:
    # -- backend ----------------------------------------------------------
    # Default is "ollama": the local model is the NORMAL backend for this lab.
    # The deterministic stub is for tests and explicit development only, and
    # selecting it needs EDA_DEV=1 as well -- a silent fallback would let you
    # believe you had tested against a model when you had not.
    brain: str = os.environ.get("EDA_BRAIN", "ollama").strip().lower()
    dev_mode: bool = os.environ.get("EDA_DEV", "") == "1"

    ollama_base_url: str = os.environ.get("OLLAMA_BASE_URL", "http://localhost:11434")
    ollama_model: str = os.environ.get("OLLAMA_MODEL", "gemma3:4b")
    ollama_timeout_s: int = _int("OLLAMA_TIMEOUT_SECONDS", 120)

    # -- resource limits (defence in depth; see guards.py) ----------------
    max_operations: int = _int("EDA_MAX_OPERATIONS", 5)
    max_rows_scanned: int = _int("EDA_MAX_ROWS_SCANNED", 200_000)
    max_rows_returned: int = _int("EDA_MAX_ROWS_RETURNED", 200)
    max_groups: int = _int("EDA_MAX_GROUPS", 50)
    max_unique_values: int = _int("EDA_MAX_UNIQUE", 1_000)
    max_charts: int = _int("EDA_MAX_CHARTS", 3)
    chart_max_px: int = _int("EDA_CHART_MAX_PX", 1600)
    chart_max_dpi: int = _int("EDA_CHART_MAX_DPI", 150)

    # Exactly one repair attempt for malformed structured output. Not a loop:
    # a model that cannot satisfy the schema will not satisfy it on attempt six,
    # and the bill grows while you wait.
    max_repairs: int = 1

    def describe(self) -> str:
        return (
            f"backend={self.brain} model={self.ollama_model} "
            f"url={self.ollama_base_url} timeout={self.ollama_timeout_s}s"
        )


CONFIG = Config()

# Models known to work, with the trade-off stated. gemma3:7b deliberately absent
# -- that tag does not exist. Gemma 3 ships at 1b, 4b, 12b and 27b.
KNOWN_MODELS = {
    "gemma3:1b":  "~815 MB · fastest · weakest at strict JSON plans",
    "gemma3:4b":  "~3.3 GB · the default · good structured-output reliability",
    "gemma3:12b": "~8.1 GB · best quality · needs ~9 GB free RAM",
}
