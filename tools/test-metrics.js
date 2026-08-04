#!/usr/bin/env node
/* Stage 2e tests for assets/metric-checks.js.
 *
 * Exercises the metric computation against the real manifest, the failure modes
 * against synthetic ones, and the DOM contract against a stub that records any
 * attempt to write. No framework, no dependencies.
 *
 * Usage: node tools/test-metrics.js
 */
"use strict";

const path = require("path");
const CURRICULUM = require(path.join(__dirname, "..", "assets", "curriculum.js"));
const MetricChecks = require(path.join(__dirname, "..", "assets", "metric-checks.js"));

let pass = 0;
const failures = [];
const section = (n) => console.log("\n" + n + "\n" + "-".repeat(n.length));
const ok = (label, cond, detail) => {
  if (cond) { pass += 1; console.log("  ok   " + label); }
  else { failures.push(label + (detail ? "  [" + detail + "]" : "")); console.log("  FAIL " + label + (detail ? "  [" + detail + "]" : "")); }
};
const eq = (label, a, b) => {
  const x = JSON.stringify(a), y = JSON.stringify(b);
  ok(label, x === y, x === y ? "" : "got " + x + " want " + y);
};

const H = (v) => (v ? [v[0] / 60, v[1] / 60] : v);
const checker = MetricChecks.createChecker({ curriculum: CURRICULUM, doc: {}, logger: { error() {} } });

/* ===================================================================== */
section("1 · The named metrics");
{
  // basics-preflight-minutes is published in minutes, not hours, and is
  // asserted separately in section 8.
  const expected = {
    "full-spine-hours": [428, 664],
    "python-rail-hours": [36, 54],
    "full-program-hours": [464, 718],
    "genai-mastery-hours": [201, 330],
    "deep-dives-hours": [67, 107],
    "genai-bank-hours": [71, 110],
    "tech-drills-hours": [23, 35],
    "scenarios-hours": [18, 27],
    "interview-questions-hours": [130, 199]
  };
  eq("the manifest declares exactly these metrics",
    Object.keys(CURRICULUM.metrics).sort(),
    Object.keys(expected).concat("basics-preflight-minutes").sort());
  Object.keys(expected).forEach((name) => {
    const r = checker.compute(name);
    ok(name + " computes without error", !r.error, r.error);
    eq(name + " = " + expected[name].join("–") + " h", H(r.value), expected[name]);
    eq(name + " matches the manifest's own expect", r.value, CURRICULUM.metrics[name].expect);
  });
}

section("2 · Collection aggregates");
{
  const agents = CURRICULUM.collections["agents-course"].durations;
  const python = CURRICULUM.collections["python-bank"].durations;
  eq("agents-course aggregate is 46–52 h", H(agents.full), [46, 52]);
  eq("agents-course is a published aggregate", agents.source, "published-aggregate");
  eq("agents-course includeIndex", agents.includeIndex, true);
  eq("python-bank aggregate is 36–54 h", H(python.full), [36, 54]);
  eq("python-bank includeIndex", python.includeIndex, true);

  eq("python-rail-hours reads the aggregate, not member sums",
    H(checker.compute("python-rail-hours").value), [36, 54]);
  const direct = checker.compute({ source: { collectionAggregate: "agents-course", mode: "full" } });
  eq("an agents aggregate can be read directly", H(direct.value), [46, 52]);

  // the 16 agents pages carry no per-page duration -- the aggregate is the source
  const members = ["agents-course"].concat(CURRICULUM.collections["agents-course"].members);
  ok("all 16 agents pages have a null full duration",
    members.every((id) => (CURRICULUM.pages[id].durations || {}).full == null),
    members.filter((id) => (CURRICULUM.pages[id].durations || {}).full).join(","));
}

section("3 · Composed totals");
{
  const spine = checker.compute("full-spine-hours").value;
  const rail = checker.compute("python-rail-hours").value;
  const program = checker.compute("full-program-hours").value;
  eq("program = spine + rail", program, [spine[0] + rail[0], spine[1] + rail[1]]);

  // the spine itself composes a route subtotal with a collection aggregate
  const withoutAgents = checker.compute({
    source: { route: "full", excludeCollections: ["agents-course"] } });
  const agents = checker.compute({
    source: { collectionAggregate: "agents-course", mode: "full" } });
  eq("53 non-agents route pages sum to 382–612 h", H(withoutAgents.value), [382, 612]);
  eq("spine = those plus the agents aggregate",
    spine, [withoutAgents.value[0] + agents.value[0], withoutAgents.value[1] + agents.value[1]]);

  const iq = checker.compute("interview-questions-hours").value;
  const bank = checker.compute("genai-bank-hours").value;
  const drills = checker.compute("tech-drills-hours").value;
  eq("interview questions = bank + rail + drills",
    iq, [bank[0] + rail[0] + drills[0], bank[1] + rail[1] + drills[1]]);
}

section("4 · Tag-filtered totals");
{
  const tagged = {};
  Object.keys(CURRICULUM.pages).forEach((id) => {
    (CURRICULUM.pages[id].tags || []).forEach((t) => { tagged[t] = (tagged[t] || 0) + 1; });
  });
  // sorted entries, because JSON.stringify key order follows insertion order
  eq("tag populations", Object.entries(tagged).sort(),
    Object.entries({ "genai-mastery": 14, "deep-dive": 11, "genai-bank": 12,
      "tech-drill": 6, scenario: 9 }).sort());

  eq("genai-mastery filter", H(checker.compute("genai-mastery-hours").value), [201, 330]);
  eq("deep-dive filter", H(checker.compute("deep-dives-hours").value), [67, 107]);
  eq("an unknown tag sums to zero",
    H(checker.compute({ source: { route: "full", includeTags: ["no-such-tag"] } }).value), [0, 0]);

  // the five tagged groups plus job-search account for all 53 estimated pages
  const parts = ["genai-mastery-hours", "deep-dives-hours", "genai-bank-hours",
    "tech-drills-hours", "scenarios-hours"].map((n) => checker.compute(n).value);
  const sum = parts.reduce((a, b) => [a[0] + b[0], a[1] + b[1]], [0, 0]);
  const job = CURRICULUM.pages["job-search"].durations.full;
  eq("tagged groups + job-search = the non-agents route total",
    [sum[0] + job[0], sum[1] + job[1]], checker.compute({
      source: { route: "full", excludeCollections: ["agents-course"] } }).value);
}

section("5 · Failure modes");
{
  eq("unknown metric id", checker.compute("no-such-metric").error, "unknown metric: no-such-metric");
  eq("unknown route", checker.compute({ source: { route: "ghost" } }).error, "unknown route ghost");
  eq("unknown collection aggregate",
    checker.compute({ source: { collectionAggregate: "ghost" } }).error,
    "no aggregate on collection ghost");
  ok("malformed definition", /neither/.test(checker.compute({}).error));

  // cyclic definitions
  const cyclic = MetricChecks.createChecker({
    curriculum: Object.assign({}, CURRICULUM, {
      metrics: { a: { sum: ["b"] }, b: { sum: ["a"] }, selfie: { sum: ["selfie"] } }
    }), doc: {}, logger: { error() {} } });
  ok("two-metric cycle detected", /metric cycle/.test(cyclic.compute("a").error),
    cyclic.compute("a").error);
  ok("self-reference detected", /metric cycle/.test(cyclic.compute("selfie").error),
    cyclic.compute("selfie").error);

  // a null duration inside a metric's scope must fail loudly, never count as zero
  const holed = JSON.parse(JSON.stringify(CURRICULUM));
  holed.pages["embeddings"].durations.full = null;
  const nullChecker = MetricChecks.createChecker({ curriculum: holed, doc: {}, logger: { error() {} } });
  const r = nullChecker.compute("genai-mastery-hours");
  ok("a null duration fails the metric", Boolean(r.error), JSON.stringify(r));
  ok("the failing page is named", /embeddings/.test(r.error || ""), r.error);
  ok("no value is returned alongside the error", r.value === undefined);
}

section("6 · Formatting and parsing");
{
  eq("range", MetricChecks.formatHours([428 * 60, 664 * 60]), "428–664 h");
  eq("equal bounds collapse", MetricChecks.formatHours([180, 180]), "3 h");
  eq("null in, null out", MetricChecks.formatHours(null), null);

  eq("plain range", MetricChecks.parseHours("428–664 hours"), [428, 664]);
  eq("range with trailing prose",
    MetricChecks.parseHours("71–110 h in the full study plan"), [71, 110]);
  eq("hyphen instead of en dash", MetricChecks.parseHours("18-27 h"), [18, 27]);
  eq("single value", MetricChecks.parseHours("49 h"), [49, 49]);
  eq("no figure at all", MetricChecks.parseHours("no numbers here"), null);
}

section("7 · DOM contract - detect, never repair");
{
  function el(attr, text) {
    return {
      textContent: text,
      writes: [],
      getAttribute: (k) => (k === "data-metric-hours" ? attr : null),
      set innerHTML(v) { this.writes.push(["innerHTML", v]); },
      setAttribute(k, v) { this.writes.push(["setAttribute", k, v]); }
    };
  }
  function runOn(nodes) {
    const errs = [];
    const c = MetricChecks.createChecker({
      curriculum: CURRICULUM,
      doc: { querySelectorAll: (sel) => (sel === "[data-metric-hours]" ? nodes : []) },
      logger: { error: (m) => errs.push(m) }
    });
    return { report: c.run(), errs };
  }

  const good = el("full-program-hours", "464–718 hours");
  let out = runOn([good]);
  eq("a matching literal is checked", out.report.checked, 1);
  eq("a matching literal matches", out.report.matched, 1);
  eq("a matching literal logs nothing", out.errs.length, 0);
  eq("a matching literal is not touched", good.writes.length, 0);
  eq("its text is unchanged", good.textContent, "464–718 hours");

  const bad = el("full-program-hours", "999–1000 hours");
  out = runOn([bad]);
  eq("a mismatched literal is reported", out.report.mismatched.length, 1);
  eq("the report carries both values",
    [out.report.mismatched[0].shown, out.report.mismatched[0].computed], [[999, 1000], [464, 718]]);
  eq("exactly one error is logged", out.errs.length, 1);
  ok("the error names the metric and both values",
    /full-program-hours/.test(out.errs[0]) && /999/.test(out.errs[0]) && /464/.test(out.errs[0]),
    out.errs[0]);
  eq("the mismatched text is left as written", bad.textContent, "999–1000 hours");
  eq("nothing was written to the element", bad.writes.length, 0);

  const unknown = el("no-such-metric", "1–2 h");
  out = runOn([unknown]);
  eq("an unregistered marker is an error", out.report.errors.length, 1);
  eq("and is not counted as matched", out.report.matched, 0);
  eq("and the element is untouched", unknown.writes.length, 0);

  const textless = el("full-program-hours", "no figure");
  out = runOn([textless]);
  eq("an element with no range is an error", out.report.errors.length, 1);
  eq("still no write", textless.writes.length, 0);

  // generic attributes are never interpreted
  const generic = {
    textContent: "10 hours",
    getAttribute: () => null,
    writes: []
  };
  const c = MetricChecks.createChecker({
    curriculum: CURRICULUM,
    doc: { querySelectorAll: (sel) => (
      sel === "[data-metric-hours]" || sel === "[data-metric-minutes]" ? [] : [generic]) },
    logger: { error() {} }
  });
  eq("a bare data-hours element is never selected", c.run().checked, 0);

  // every real marker on disk resolves and matches
  const fs = require("fs");
  const cfg = JSON.parse(fs.readFileSync(path.join(__dirname, "metrics.config.json"), "utf8"));
  const mismatches = [];
  cfg.claims.forEach((claim) => {
    const src = fs.readFileSync(path.join(__dirname, "..", claim.file), "utf8");
    // Copy is written in hours unless the metric declares unit "minutes".
    const minutes = (CURRICULUM.metrics[claim.metric] || {}).unit === "minutes";
    const attr = minutes ? "data-metric-minutes" : "data-metric-hours";
    const divisor = minutes ? 1 : 60;
    const marked = new RegExp(attr + '="' + claim.metric + '"').test(src);
    if (!marked) mismatches.push(claim.id + ": not marked in " + claim.file);
    const r = checker.compute(claim.metric);
    const shown = MetricChecks.parseHours(claim.text);
    if (r.error) mismatches.push(claim.id + ": " + r.error);
    else if (!shown || shown[0] !== r.value[0] / divisor || shown[1] !== r.value[1] / divisor) {
      mismatches.push(claim.id + ": page " + JSON.stringify(shown) +
        " vs computed " + JSON.stringify([r.value[0] / divisor, r.value[1] / divisor]));
    }
  });
  ok("all " + cfg.claims.length + " registered duration claims are marked and agree",
    mismatches.length === 0, mismatches.join("; "));
}

section("8 · Release 3.1 - the Basics preflight, published in minutes");
{
  const basics = CURRICULUM.pages["beginner-basics"].durations;
  eq("beginner-basics carries the published 30-45 minute range", basics.full, [30, 45]);
  eq("the metric reads the page duration",
    checker.compute("basics-preflight-minutes").value, [30, 45]);
  eq("the metric declares its unit", CURRICULUM.metrics["basics-preflight-minutes"].unit,
    "minutes");
  eq("a page source resolves", checker.compute(
    { source: { page: "llm-foundations", mode: "full" } }).value, [480, 720]);
  ok("an unknown page is an error",
    /unknown page/.test(checker.compute({ source: { page: "ghost" } }).error));
  ok("a page with no duration is an error",
    /has no full/.test(checker.compute({ source: { page: "ta-l02" } }).error || "no error"));

  // Basics is Full's preflight, not a step, so giving it a duration must not
  // move any published total.
  eq("full-spine-hours is unmoved", H(checker.compute("full-spine-hours").value), [428, 664]);
  eq("full-program-hours is unmoved", H(checker.compute("full-program-hours").value), [464, 718]);
  ok("beginner-basics is still absent from the Full step list",
    !CURRICULUM.routes.full.steps.some((s) => s.page === "beginner-basics"));

  // the minute path through run(), against the same write-recording stub
  function el(attr, text) {
    return { textContent: text, writes: [],
      getAttribute: (k) => (k === "data-metric-minutes" ? attr : null),
      set innerHTML(v) { this.writes.push(["innerHTML", v]); } };
  }
  function runMinutes(nodes) {
    const errs = [];
    const c = MetricChecks.createChecker({ curriculum: CURRICULUM,
      doc: { querySelectorAll: (sel) => (sel === "[data-metric-minutes]" ? nodes : []) },
      logger: { error: (m) => errs.push(m) } });
    return { report: c.run(), errs };
  }
  const good = el("basics-preflight-minutes", "about 30–45 minutes");
  let out = runMinutes([good]);
  eq("a matching minute literal matches", [out.report.checked, out.report.matched], [1, 1]);
  eq("and logs nothing", out.errs.length, 0);
  eq("and is not rewritten", good.writes.length, 0);

  const bad = el("basics-preflight-minutes", "90–120 minutes");
  out = runMinutes([bad]);
  eq("a mismatched minute literal is reported", out.report.mismatched.length, 1);
  eq("the report carries both minute values",
    [out.report.mismatched[0].shown, out.report.mismatched[0].computed], [[90, 120], [30, 45]]);
  ok("the error is denominated in minutes, not hours", /min/.test(out.errs[0]), out.errs[0]);
  eq("the mismatched text is left as written", bad.textContent, "90–120 minutes");
  eq("nothing was written", bad.writes.length, 0);
}

/* ===================================================================== */
console.log("\n" + "=".repeat(60));
console.log(pass + " assertion(s) passed, " + failures.length + " failed");
if (failures.length) {
  failures.forEach((f) => console.log("  FAIL " + f));
  process.exit(1);
}
process.exit(0);
