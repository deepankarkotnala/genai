"""
Mini Anomaly Detector — your first agent.

A hands-on, free version of EnM scenario #2 (Anomaly Prediction).

The point of this file is to make the AGENT LOOP visible:

    PERCEIVE  ->  REASON  ->  ACT (call a tool)  ->  OBSERVE  ->  repeat

Design choices that mirror real industrial agents:
  * The anomaly *math* is a plain Python TOOL (detect_anomalies). The heavy lifting is
    classical, deterministic code -- exactly like EnM's simulations/solvers.
  * The LLM is the BRAIN that decides which tags to inspect and writes the diagnosis.
  * If you have no API key yet, an OFFLINE fallback brain runs so you can still watch
    the loop. Add GEMINI_API_KEY later to swap in a real LLM.

Run:  python agent.py
"""

import os
import csv
import json
import statistics

DATA_FILE = "sensor_data.csv"


# ----------------------------------------------------------------------------- #
#  TOOLS  -- the things the agent can DO. The agent's power = the sum of these.
# ----------------------------------------------------------------------------- #

def load_data(path=DATA_FILE):
    with open(path, newline="") as f:
        return list(csv.DictReader(f))


def list_tags():
    """TOOL: return the sensor tag names available."""
    rows = load_data()
    return [c for c in rows[0].keys() if c != "timestamp"]


def detect_anomalies(tag, z_threshold=3.0):
    """TOOL: classical anomaly detection on one tag using a z-score.

    Returns the rows whose value is more than `z_threshold` standard deviations
    from the mean. This is the 'classical model wrapped as a tool' idea.
    """
    rows = load_data()
    vals = [float(r[tag]) for r in rows]
    mean = statistics.mean(vals)
    sd = statistics.pstdev(vals) or 1e-9
    hits = []
    for r in rows:
        v = float(r[tag])
        z = (v - mean) / sd
        if abs(z) >= z_threshold:
            hits.append({"timestamp": r["timestamp"], "value": v, "z": round(z, 2)})
    return {"tag": tag, "mean": round(mean, 2), "stddev": round(sd, 2),
            "anomaly_count": len(hits), "anomalies": hits}


# Registry the "brain" can call. (In a real Gemini/OpenAI agent these become
# function-calling 'tool' declarations; here we keep it simple and explicit.)
TOOLS = {
    "list_tags": list_tags,
    "detect_anomalies": detect_anomalies,
}


# ----------------------------------------------------------------------------- #
#  THE BRAIN  -- decides the next action given the goal + history so far.
# ----------------------------------------------------------------------------- #

SYSTEM_PROMPT = """You are a plant reliability agent. Goal: find anomalies in sensor data
and explain them like a console engineer. You can call tools. Respond ONLY with JSON:
either  {"action":"list_tags"}  or  {"action":"detect_anomalies","tag":"<tag>"}
or, when finished,  {"action":"finish","report":"<plain-english findings>"}."""


def llm_brain(history):
    """Real brain via Google Gemini (free tier). Returns a dict action."""
    import google.generativeai as genai
    genai.configure(api_key=os.environ["GEMINI_API_KEY"])
    model = genai.GenerativeModel("gemini-1.5-flash")
    convo = SYSTEM_PROMPT + "\n\nHistory so far:\n" + json.dumps(history, indent=2)
    convo += "\n\nWhat is your next action? Respond with one JSON object only."
    resp = model.generate_content(convo)
    text = resp.text.strip().strip("`")
    if text.startswith("json"):
        text = text[4:]
    return json.loads(text)


def offline_brain(history):
    """Fallback brain (no API key needed). A tiny hard-coded policy so you can
    SEE the loop run end-to-end before wiring up a real LLM."""
    actions_taken = [h["action"] for h in history if "action" in h]
    if "list_tags" not in actions_taken:
        return {"action": "list_tags"}
    # inspect each known tag once
    tags = next((h["result"] for h in history if h.get("action") == "list_tags"), [])
    inspected = [h.get("tag") for h in history if h.get("action") == "detect_anomalies"]
    for t in tags:
        if t not in inspected:
            return {"action": "detect_anomalies", "tag": t}
    # all inspected -> summarize
    findings = [h["result"] for h in history if h.get("action") == "detect_anomalies"]
    flagged = [f for f in findings if f["anomaly_count"] > 0]
    if flagged:
        lines = [f"- {f['tag']}: {f['anomaly_count']} anomaly point(s); "
                 f"worst z={max(a['z'] for a in f['anomalies']):.1f} "
                 f"at {max(f['anomalies'], key=lambda a: abs(a['z']))['timestamp']}"
                 for f in flagged]
        report = "Anomalies detected:\n" + "\n".join(lines)
    else:
        report = "No anomalies detected across the monitored tags."
    return {"action": "finish", "report": report}


def get_brain():
    if os.environ.get("GEMINI_API_KEY"):
        print("[brain] Using Google Gemini (live LLM).\n")
        return llm_brain
    print("[brain] No GEMINI_API_KEY found -> using OFFLINE fallback brain.")
    print("        (Add a free key from https://aistudio.google.com/apikey to go live.)\n")
    return offline_brain


# ----------------------------------------------------------------------------- #
#  THE AGENT LOOP  -- this is the whole idea of an agent, in ~15 lines.
# ----------------------------------------------------------------------------- #

def run(max_steps=12):
    brain = get_brain()
    history = []  # the agent's memory: every action + observation
    for step in range(1, max_steps + 1):
        print(f"--- STEP {step} ---")

        # REASON: ask the brain what to do next, given everything so far
        decision = brain(history)
        print(f"  REASON  -> {decision}")

        action = decision["action"]
        if action == "finish":
            print("\n=== AGENT REPORT ===")
            print(decision["report"])
            return decision["report"]

        # ACT: call the chosen tool
        if action == "list_tags":
            result = TOOLS["list_tags"]()
        elif action == "detect_anomalies":
            result = TOOLS["detect_anomalies"](decision["tag"])
        else:
            print(f"  unknown action: {action}; stopping.")
            return None

        # OBSERVE: record the result; it becomes part of the next PERCEIVE
        print(f"  ACT     -> called {action}({decision.get('tag','')})")
        print(f"  OBSERVE -> {json.dumps(result)[:120]}{'...' if len(json.dumps(result))>120 else ''}\n")
        record = {"action": action, "result": result}
        if "tag" in decision:
            record["tag"] = decision["tag"]
        history.append(record)

    print("Hit max_steps without finishing.")
    return None


if __name__ == "__main__":
    run()
