"""
Lesson 4 — ORCHESTRATION: many specialized agents, one business outcome.

This is the heart of the EnM doc: "individual agents may not work -- need orchestration
of multiple agents to achieve an outcome."

We model EnM scenario #2 (Reliability & Anomaly Detection) as a CHAIN of three agents
that hand off to each other:

    Anomaly Agent  ->  RCA Agent  ->  Remediation Agent
    (what's wrong?)    (why?)         (what do we do?)

Each agent is the same loop idea from Lesson 1, but with a narrow goal and its own tools.
The ORCHESTRATOR is the conductor: it runs each agent and passes results along (a HANDOFF).

To keep the lesson free and deterministic, the per-agent "brains" here are small explicit
policies + classical tools (z-score, trend forecast, a tiny knowledge base). Swapping in a
real LLM brain (Gemini) is a drop-in change -- see code/README.md and Lesson 2.

Run:  python orchestrator.py
"""

import csv
import statistics
from forecast_tool import forecast_breach  # reuse Lesson 3's tool

DATA_FILE = "sensor_data.csv"

# Operating limits per tag (the "constraints" an EnM Constraint Agent would own).
LIMITS = {
    "T101_reactor_temp": 420,
    "P201_pump_pressure": 9.0,
    "F301_feed_flow": 170,
    "V401_vibration": 4.0,
}

# A tiny stand-in for the "Contextualized Knowledge Base" (SOPs / FMEA / remediation).
# In real EnM this is a knowledge graph built by the Contextualization Agent.
KNOWLEDGE_BASE = {
    "T101_reactor_temp": {
        "failure_mode": "Thermal runaway / catalyst degradation (FMEA: FM-07)",
        "likely_causes": ["Feed composition shift", "Coolant flow loss", "Fouled heat exchanger"],
        "remediation": ["Verify coolant loop F-CW flow", "Reduce feed rate 10%", "Schedule HX inspection"],
    },
    "V401_vibration": {
        "failure_mode": "Bearing wear / shaft misalignment (FMEA: FM-12)",
        "likely_causes": ["Bearing fatigue", "Imbalance", "Looseness"],
        "remediation": ["Trigger vibration spectrum analysis", "Inspect bearing lubrication", "Plan alignment check"],
    },
}


# ----------------------------------------------------------------------------- #
#  TOOLS shared by the agents
# ----------------------------------------------------------------------------- #
def load_data(path=DATA_FILE):
    with open(path, newline="") as f:
        return list(csv.DictReader(f))


def z_anomalies(tag, z_threshold=3.0):
    rows = load_data()
    vals = [float(r[tag]) for r in rows]
    mean, sd = statistics.mean(vals), (statistics.pstdev(vals) or 1e-9)
    hits = [{"timestamp": r["timestamp"], "value": float(r[tag]),
             "z": round((float(r[tag]) - mean) / sd, 2)}
            for r in rows if abs((float(r[tag]) - mean) / sd) >= z_threshold]
    return hits


# ----------------------------------------------------------------------------- #
#  AGENT 1 — Anomaly Agent.  Goal: find tags in trouble (now OR soon).
# ----------------------------------------------------------------------------- #
def anomaly_agent():
    print("[Anomaly Agent] scanning tags (threshold + forecast)...")
    findings = []
    for tag, limit in LIMITS.items():
        spikes = z_anomalies(tag)
        forecast = forecast_breach(tag, limit)
        if spikes or forecast["steps_until_breach"] is not None:
            findings.append({
                "tag": tag,
                "spikes": len(spikes),
                "forecast": forecast["verdict"],
                "steps_until_breach": forecast["steps_until_breach"],
            })
            kind = "spike" if spikes else "trend"
            print(f"    -> {tag}: flagged ({kind}); {forecast['verdict']}")
    return findings  # HANDOFF to RCA Agent


# ----------------------------------------------------------------------------- #
#  AGENT 2 — RCA Agent.  Goal: for each finding, name the failure mode + causes,
#  rank by an RPN-style score (here: urgency from how soon it breaches / how big the spike).
# ----------------------------------------------------------------------------- #
def rca_agent(findings):
    print("\n[RCA Agent] mapping failure modes and ranking (RPN-style)...")
    diagnoses = []
    for f in findings:
        kb = KNOWLEDGE_BASE.get(f["tag"], {})
        # crude RPN: sooner breach = higher; spikes add severity
        urgency = 0
        if f["steps_until_breach"] is not None:
            urgency += max(1, 30 - f["steps_until_breach"])
        urgency += f["spikes"] * 5
        diagnoses.append({
            "tag": f["tag"],
            "failure_mode": kb.get("failure_mode", "Unmapped (no FMEA entry)"),
            "likely_causes": kb.get("likely_causes", ["unknown"]),
            "rpn": urgency,
        })
        print(f"    -> {f['tag']}: {diagnoses[-1]['failure_mode']} | RPN={urgency}")
    diagnoses.sort(key=lambda d: d["rpn"], reverse=True)
    return diagnoses  # HANDOFF to Remediation Agent


# ----------------------------------------------------------------------------- #
#  AGENT 3 — Remediation Agent.  Goal: recommend guided steps from the knowledge base.
# ----------------------------------------------------------------------------- #
def remediation_agent(diagnoses):
    print("\n[Remediation Agent] recommending guided steps (highest RPN first)...")
    plan = []
    for d in diagnoses:
        kb = KNOWLEDGE_BASE.get(d["tag"], {})
        steps = kb.get("remediation", ["No SOP found — escalate to LT/LD engineer"])
        plan.append({"tag": d["tag"], "rpn": d["rpn"], "steps": steps})
    return plan


# ----------------------------------------------------------------------------- #
#  THE ORCHESTRATOR — runs the agents in order, passing results along (handoffs).
# ----------------------------------------------------------------------------- #
def orchestrate():
    print("=" * 64)
    print("ORCHESTRATING EnM #2: Anomaly -> RCA -> Remediation")
    print("=" * 64)
    findings = anomaly_agent()
    if not findings:
        print("\nNo issues found. Nothing to hand off.")
        return
    diagnoses = rca_agent(findings)
    plan = remediation_agent(diagnoses)

    print("\n" + "=" * 64)
    print("FINAL REMEDIATION PLAN (orchestrated outcome)")
    print("=" * 64)
    for p in plan:
        print(f"\n* {p['tag']}  (priority RPN={p['rpn']})")
        for i, step in enumerate(p["steps"], 1):
            print(f"    {i}. {step}")


if __name__ == "__main__":
    orchestrate()
