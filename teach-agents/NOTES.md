# Teaching Notes — preferences & working notes

## Learner profile
- **Coding:** comfortable in Python. → Use real code, skip programming basics.
- **Mission:** general agent literacy first; EnM (Energy & Materials) is the recurring concrete example.
- **First agent chosen:** mini anomaly detector (tiny version of EnM scenario #2). Built & verified working.
- **Free LLM:** Google Gemini free tier (aistudio.google.com/apikey). Code has offline fallback so it
  runs with no key.

## How to teach this learner
- Keep each lesson to ONE tangible win; tie every concept back to a row in `EnM Agents.xlsx`.
- Emphasize the recurring EnM nuance: many "agents" are simulations/solvers/ML wrapped as tools, not LLM calls.
  This is the highest-value mental model for judging the EnM proposals.

## Source-of-truth files
- Business scenarios: `../EnM Agents.xlsx` (and the plain dump `../enm_dump.txt`).
- 8 EnM outcomes; #3 and #5 are explicitly marked "need to think through" → good design exercises later.

## Course status — FULL COURSE GENERATED UP FRONT (learner request)
All 6 lessons + 3 verified code files generated in one session at learner's request (not the
usual one-per-session cadence). Lessons are self-contained; later ones (esp. 5 & 6 decompositions)
are explicitly framed as sketches to revise as the learner progresses.
- L1 ✅ What is an agent (concept)
- L2 ✅ Run first agent live + Gemini brain swap (hands-on; agent.py)
- L3 ✅ Prediction vs threshold (concept+code; forecast_tool.py — catches the temp ramp z-score missed)
- L4 ✅ Orchestration: Anomaly→RCA→Remediation chain (concept+code; orchestrator.py)
- L5 ✅ Workflow vs autonomous; decision rule; sketched #3 & #5 decompositions
- L6 ✅ Capstone: 5-step method to map any row; worked example #1; learner fills template for #4/#6/#7
- index.html is the course entry point.

## Lessons expanded to textbook depth (learner request)
All 6 lesson HTML rewritten from outlines into full study material: learning objectives, inline
table of contents, inline definitions, "in plain English" recaps, step-by-step instructions,
section recaps, 3 quizzes each, and LINE-BY-LINE annotated code walkthroughs (agent.py L2,
forecast_tool.py L3, orchestrator.py L4). Reading times: L1 ~15m, L2 ~25m, L3 ~20m, L4 ~25m,
L5 ~20m, L6 ~25m. style.css extended with detailed-lesson components (.objectives, .toc, .def,
.annotated/.annot-list, .plain, .recap, .steps); content column widened 720->800px.

## Verified
- All 3 code files run clean from teach-agents/code/ (cwd matters — they read sensor_data.csv relatively).
- All internal HTML links resolve (xlsx is at Desktop root = ../../ from lessons/).

## Next live-session candidates (when learner returns)
- Grade a row the learner maps with the L6 template (#4/#6/#7) → tight feedback loop.
- Wire one orchestrator agent to a real Gemini brain (promised in L4).
- Real Gemini function calling instead of hand-parsed JSON (promised in L2).
- Exponential smoothing forecaster instead of linear fit (promised in L3).

## housekeeping
- `../enm_dump.txt` is a scratch extract of the xlsx I created — fine to delete; xlsx is the source of truth.
