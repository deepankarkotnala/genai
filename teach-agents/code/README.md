# Mini Anomaly Detector — your first agent (free)

A tiny, runnable version of **EnM scenario #2 (Anomaly Prediction)**. It demonstrates the
**agent loop**: the LLM is given a *tool* to read sensor data, it decides which tags to inspect,
reads them, reasons about anomalies, and reports — looping until done.

This is for **Lesson 2**. You can read the code now; we'll run it together next session.

## Why this design teaches the right thing
- The **anomaly math is a plain Python tool** (`detect_anomalies`) — mirroring the EnM truth that
  the heavy lifting is classical, and the LLM *orchestrates and explains*.
- The **LLM is the brain in the loop** — it chooses which tags to investigate and writes the
  human-readable diagnosis, the way a "Digital Console Engineer" would.

## Free LLM setup (recommended: Google Gemini)
Gemini has a genuinely free API tier — no credit card, generous limits, perfect for learning.

1. Go to **https://aistudio.google.com/apikey** and create a free API key.
2. Install the SDK:
   ```
   pip install google-generativeai pandas
   ```
3. Set the key (PowerShell):
   ```
   $env:GEMINI_API_KEY = "your-key-here"
   ```
4. Run it:
   ```
   python agent.py
   ```

### No key yet? It still runs.
`agent.py` has an **offline fallback** "brain" so you can watch the agent loop work *before* you
get a key. Run `python agent.py` and you'll see each loop step printed. Add the key later to swap
in a real LLM brain.

## Files
- `agent.py` — the agent (the loop + the LLM brain).
- `sensor_data.csv` — fake plant sensor readings with a couple of injected anomalies.
- `forecast_tool.py` — trend-extrapolation tool (Lesson 3) that catches the slow temperature ramp.
- `orchestrator.py` — the Anomaly → RCA → Remediation chain (Lesson 4 / Worked Example 1).
- `eda_agent.py` — the EDA agent: EDA Engine → P&ID Engine → Insight layer (Lesson 6 / Worked Example 2).
- `batch_data.csv` — synthetic polymer-batch dataset with baked-in patterns + data-quality issues.
- `process_context.md` — process knowledge the EDA agent correlates findings against (stand-in for P&ID/SOPs).

All scripts read their data files relatively — run them from inside this `code/` directory.
The two agents that call an LLM (`agent.py`, `eda_agent.py`) both have offline fallbacks, so every
file runs with no API key; set `GEMINI_API_KEY` to swap in a real model.

## What to look for when you run it
Watch the printed loop: **PERCEIVE → REASON → ACT (tool call) → OBSERVE → repeat**.
That cycle *is* the agent. Everything else in this course is variations on it.
