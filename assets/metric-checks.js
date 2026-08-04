/* =========================================================================
   GenAI Learning Portal - published-metric verification (Release 2, Stage 2e)

   Recomputes the hour figures a page claims and compares them with the text
   already written there. It is a DETECTOR, not a repairer:

     - match    -> silence
     - mismatch -> console.error naming the metric, the page value and the
                   computed value

   It never writes to the DOM. The authored literal is the no-JavaScript truth
   and the build validator is the gate that stops a mismatch reaching
   deployment; repairing a number in one visitor's browser would only hide
   source drift from everyone else.

   Only `data-metric-hours` is interpreted. The generic `data-hours` and
   `data-count` attributes are deliberately ignored: google-prep/index.html has
   used `data-hours` on a study-capacity <select> since before Release 2, so the
   generic names are unsafe as selectors. Count claims spread across many pages
   are validated at build time, where the whole corpus is visible.
   ========================================================================= */
(function (root, factory) {
  "use strict";

  var api = factory();

  if (typeof module === "object" && module.exports) {
    module.exports = api;                 // Node: pure computation, no DOM
    return;
  }
  if (!root) return;
  root.MetricChecks = api;

  try {
    if (!root.CURRICULUM) throw new Error("curriculum.js did not load before metric-checks.js");
    var checker = api.createChecker({
      curriculum: root.CURRICULUM,
      doc: document,
      logger: root.console
    });
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", function () { checker.run(); });
    } else {
      checker.run();
    }
  } catch (err) {
    if (root.console) root.console.error("[metric-checks] not run.", err);
  }
})(typeof window !== "undefined" ? window : null, function () {
  "use strict";

  var MINUTES_PER_HOUR = 60;
  var EN_DASH = "–";

  /* Values are [minMinutes, maxMinutes]; copy is written in hours. */
  function formatHours(value) {
    if (!value) return null;
    var lo = Math.round(value[0] / MINUTES_PER_HOUR);
    var hi = Math.round(value[1] / MINUTES_PER_HOUR);
    return lo === hi ? lo + " h" : lo + EN_DASH + hi + " h";
  }

  /* The authored text carries words around the figure -- "428-664 hours",
     "71-110 h in the full study plan" -- so the range is read out of it rather
     than compared as a whole string. */
  function parseHours(text) {
    if (!text) return null;
    var m = String(text).match(/(\d[\d,]*)\s*[–—-]\s*(\d[\d,]*)/);
    if (m) {
      return [parseInt(m[1].replace(/,/g, ""), 10), parseInt(m[2].replace(/,/g, ""), 10)];
    }
    var single = String(text).match(/(\d[\d,]*)\s*(?:h\b|hours?\b)/i);
    if (single) {
      var n = parseInt(single[1].replace(/,/g, ""), 10);
      return [n, n];
    }
    return null;
  }

  function createChecker(env) {
    var C = env.curriculum;
    var doc = env.doc;
    var logger = env.logger || { error: function () {} };

    function collectionOwner() {
      var out = {};
      Object.keys(C.collections || {}).forEach(function (cid) {
        (C.collections[cid].members || []).forEach(function (pid) { out[pid] = cid; });
        if (C.collections[cid].index) {
          if (!(C.collections[cid].index in out)) out[C.collections[cid].index] = cid;
        }
      });
      return out;
    }

    /* Returns { value: [lo,hi] } or { error: "..." }. Mirrors the validator's
       semantics exactly: route totals with optional tag and collection filters,
       collection aggregates, and sums of either metric names or inline sources. */
    function compute(nameOrSpec, trail) {
      trail = trail || [];
      var spec = nameOrSpec;

      if (typeof nameOrSpec === "string") {
        if (trail.indexOf(nameOrSpec) !== -1) {
          return { error: "metric cycle: " + trail.concat(nameOrSpec).join(" -> ") };
        }
        spec = (C.metrics || {})[nameOrSpec];
        if (!spec) return { error: "unknown metric: " + nameOrSpec };
        return compute(spec, trail.concat(nameOrSpec));
      }
      if (!spec || typeof spec !== "object") return { error: "malformed metric definition" };

      if (spec.sum) {
        var total = [0, 0];
        for (var i = 0; i < spec.sum.length; i += 1) {
          var part = compute(spec.sum[i], trail);
          if (part.error) return part;
          total = [total[0] + part.value[0], total[1] + part.value[1]];
        }
        return { value: total };
      }

      var source = spec.source;
      if (!source) return { error: "metric has neither `sum` nor `source`" };

      if (source.collectionAggregate) {
        var col = (C.collections || {})[source.collectionAggregate];
        if (!col || !col.durations) {
          return { error: "no aggregate on collection " + source.collectionAggregate };
        }
        var agg = col.durations[source.mode || "full"];
        if (!agg) return { error: "collection aggregate has no " + (source.mode || "full") };
        return { value: [agg[0], agg[1]] };
      }

      if (source.route) {
        var route = (C.routes || {})[source.route];
        if (!route) return { error: "unknown route " + source.route };
        var owner = collectionOwner();
        var include = source.includeTags || [];
        var exclude = source.excludeCollections || [];
        var sum = [0, 0];
        for (var s = 0; s < route.steps.length; s += 1) {
          var pid = route.steps[s].page;
          var page = (C.pages || {})[pid] || {};
          if (include.length) {
            var tags = page.tags || [];
            var hit = false;
            for (var t = 0; t < include.length; t += 1) {
              if (tags.indexOf(include[t]) !== -1) { hit = true; break; }
            }
            if (!hit) continue;
          }
          if (exclude.indexOf(owner[pid]) !== -1) continue;
          var dur = (page.durations || {}).full;
          if (!dur) return { error: "page " + pid + " has no full duration" };
          sum = [sum[0] + dur[0], sum[1] + dur[1]];
        }
        return { value: sum };
      }

      if (source.page) {
        var pg = (C.pages || {})[source.page];
        if (!pg) return { error: "unknown page " + source.page };
        var pd = (pg.durations || {})[source.mode || "full"];
        if (!pd) return { error: "page " + source.page + " has no " + (source.mode || "full") };
        return { value: [pd[0], pd[1]] };
      }

      return { error: "unrecognised metric source" };
    }

    /* Most published copy is written in hours. A few figures -- the Basics
       preflight -- are published in minutes, and are marked with
       `data-metric-minutes` so they are compared in the unit they are written
       in rather than rounded to "0-1 h". */
    var UNITS = [
      { attr: "data-metric-hours", divisor: MINUTES_PER_HOUR, label: "h" },
      { attr: "data-metric-minutes", divisor: 1, label: "min" }
    ];

    /* Read-only. Returns a report; the DOM is never modified. */
    function run() {
      var report = { checked: 0, matched: 0, mismatched: [], errors: [] };

      for (var u = 0; u < UNITS.length; u += 1) {
        var unit = UNITS[u];
        var nodes = doc.querySelectorAll ? doc.querySelectorAll("[" + unit.attr + "]") : [];

        for (var i = 0; i < nodes.length; i += 1) {
          var el = nodes[i];
          var name = el.getAttribute(unit.attr);
          report.checked += 1;

          var computed = compute(name, []);
          if (computed.error) {
            report.errors.push({ metric: name, error: computed.error });
            logger.error("[metric-checks] " + name + ": " + computed.error);
            continue;
          }
          var shown = parseHours(el.textContent);
          if (!shown) {
            report.errors.push({ metric: name, error: "no range found in the element text" });
            logger.error("[metric-checks] " + name + ": no range in " +
              JSON.stringify(String(el.textContent).slice(0, 60)));
            continue;
          }
          var want = [Math.round(computed.value[0] / unit.divisor),
            Math.round(computed.value[1] / unit.divisor)];
          if (shown[0] === want[0] && shown[1] === want[1]) {
            report.matched += 1;
            continue;                                 // match: say nothing, do nothing
          }
          report.mismatched.push({ metric: name, shown: shown, computed: want });
          logger.error("[metric-checks] " + name + " disagrees with the page: shown " +
            shown[0] + EN_DASH + shown[1] + " " + unit.label + ", computed " +
            want[0] + EN_DASH + want[1] + " " + unit.label +
            ". The authored text is left as written; fix the source, not the browser.");
        }
      }
      return report;
    }

    return { compute: compute, run: run, formatHours: formatHours, parseHours: parseHours };
  }

  return { createChecker: createChecker, formatHours: formatHours, parseHours: parseHours };
});
