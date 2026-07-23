# Process Context — Polymer Reactor Unit (reference for the EDA agent)

This is a tiny stand-in for the kind of process knowledge an EnM "P&ID Engine" /
Contextualization Agent would hold (P&IDs, SOPs, design envelopes). The EDA agent reads
this to turn raw statistical findings into *process-aware* insights.

## Tags
- `reactor_temp` (°C): main reaction temperature. Design envelope 295–320. Higher temp raises
  reaction rate (and yield) up to ~320, beyond which side-reactions and fouling rise.
- `catalyst_conc` (g/L): catalyst dosing. Design range 1.6–2.6. Yield is sensitive to this.
- `feed_moisture` (%): moisture in the feedstock. SPEC: keep below 1.4. Above spec, moisture
  poisons the catalyst and drives quality defects.
- `yield_pct` (%): batch yield. Target ≥ 72.
- `quality_defects`: defect index per batch. Target ≤ 3.0.
- `shift`: operating crew (A / B / C). Should not, by itself, affect yield — if it does, it
  points to a procedural / training gap, not a process one.

## Known relationships (design intent)
- Yield should rise with `reactor_temp` and `catalyst_conc`.
- Quality defects should rise when `feed_moisture` exceeds its 1.4 spec.
- Shift should be yield-neutral. A shift-linked yield gap is a *digital intervention candidate*
  (e.g. an SOP-adherence nudge or operator decision-support agent).

## Data-quality rules
- Missing values in `yield_pct` or `catalyst_conc` must be flagged, not silently dropped.
- `yield_pct` above 95 is physically implausible for this unit → treat as a sensor/entry error.
