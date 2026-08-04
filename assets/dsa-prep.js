/* =========================================================================
   DSA Interview Preparation — progress, filters, practice mode
   Pure vanilla JS. Offline-safe. All content is meaningful without JS;
   this layer only adds progress tracking, filtering and practice tooling.

   Progress is keyed by a stable problem id (e.g. "lc-121") so a problem's
   state is shared across every chapter it appears in (canonical ownership).
   ========================================================================= */
(function () {
  "use strict";

  var LS_KEY = "dsa.progress.v1";
  var STATES = ["unseen", "learning", "solved", "review"];
  var STATE_LABEL = { learning: "Learning", solved: "Solved", review: "Review" };

  function load() {
    try { return JSON.parse(localStorage.getItem(LS_KEY)) || {}; }
    catch (e) { return {}; }
  }
  function save(data) {
    try { localStorage.setItem(LS_KEY, JSON.stringify(data)); } catch (e) {}
  }
  var store = load();
  store.problems = store.problems || {};
  store.checklist = store.checklist || {};

  function problemState(pid) {
    var p = store.problems[pid];
    return (p && p.state) || "unseen";
  }
  function setProblemState(pid, state) {
    if (!store.problems[pid]) store.problems[pid] = {};
    if (state === "unseen") delete store.problems[pid].state;
    else store.problems[pid].state = state;
    save(store);
  }

  /* ---------- Per-problem state controls (chapter pages) ---------- */
  function mountProblemControls() {
    var probs = document.querySelectorAll(".dsa-prob[data-pid]");
    if (!probs.length) return;

    probs.forEach(function (prob) {
      var pid = prob.getAttribute("data-pid");
      var badges = prob.querySelector(".p-badges");
      if (!badges) return;

      // completion dot
      var dot = document.createElement("span");
      dot.className = "dsa-state-dot";
      badges.insertBefore(dot, badges.firstChild);

      // state control
      var ctl = document.createElement("span");
      ctl.className = "dsa-state-ctl";
      ctl.setAttribute("role", "group");
      ctl.setAttribute("aria-label", "Mark study status");
      ["learning", "solved", "review"].forEach(function (st) {
        var b = document.createElement("button");
        b.type = "button";
        b.setAttribute("data-state", st);
        b.textContent = STATE_LABEL[st];
        b.addEventListener("click", function (e) {
          e.preventDefault(); e.stopPropagation();
          var cur = problemState(pid);
          var next = cur === st ? "unseen" : st;
          setProblemState(pid, next);
          syncProblem(prob);
          updateProgressLine();
        });
        ctl.appendChild(b);
      });
      // keep summary toggle from firing when using the control
      ctl.addEventListener("click", function (e) { e.preventDefault(); e.stopPropagation(); });
      badges.appendChild(ctl);

      syncProblem(prob);
    });
    updateProgressLine();
  }

  function syncProblem(prob) {
    var pid = prob.getAttribute("data-pid");
    var st = problemState(pid);
    var dot = prob.querySelector(".dsa-state-dot");
    if (dot) dot.className = "dsa-state-dot" + (st !== "unseen" ? " " + st : "");
    prob.querySelectorAll(".dsa-state-ctl button").forEach(function (b) {
      b.classList.toggle("on", b.getAttribute("data-state") === st);
    });
    prob.setAttribute("data-state", st);
  }

  function updateProgressLine() {
    var line = document.querySelector("[data-dsa-progress]");
    if (!line) return;
    var probs = document.querySelectorAll(".dsa-prob[data-pid]");
    var total = probs.length, solved = 0, learning = 0, review = 0;
    probs.forEach(function (p) {
      var st = problemState(p.getAttribute("data-pid"));
      if (st === "solved") solved++;
      else if (st === "learning") learning++;
      else if (st === "review") review++;
    });
    line.textContent = solved + " / " + total + " solved · " + learning + " learning · " + review + " to review";
  }

  /* ---------- Practice mode (hide solutions) ---------- */
  function setupPractice() {
    var btn = document.querySelector("[data-dsa-practice]");
    if (!btn) return;
    var LS_P = "dsa.practice";
    function apply(on) {
      document.body.classList.toggle("dsa-practice", on);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
      btn.textContent = on ? "👁 Solutions hidden" : "🙈 Practice mode";
      try { localStorage.setItem(LS_P, on ? "1" : "0"); } catch (e) {}
    }
    var initial = false;
    try { initial = localStorage.getItem(LS_P) === "1"; } catch (e) {}
    apply(initial);
    btn.addEventListener("click", function () {
      apply(!document.body.classList.contains("dsa-practice"));
    });
  }

  /* ---------- Reset progress ---------- */
  function setupReset() {
    var btn = document.querySelector("[data-dsa-reset]");
    if (!btn) return;
    btn.addEventListener("click", function () {
      if (!window.confirm("Reset study progress and checklist on this page's problems? This clears saved state for all chapters.")) return;
      store = { problems: {}, checklist: {} };
      save(store);
      document.querySelectorAll(".dsa-prob[data-pid]").forEach(syncProblem);
      document.querySelectorAll(".dsa-check input[data-check]").forEach(function (i) {
        i.checked = false; i.closest("li").classList.remove("done");
      });
      updateProgressLine();
      refreshContents();
    });
  }

  /* ---------- Mastery checklist persistence ---------- */
  function setupChecklist() {
    document.querySelectorAll(".dsa-check input[data-check]").forEach(function (input) {
      var id = input.getAttribute("data-check");
      input.checked = !!store.checklist[id];
      input.closest("li").classList.toggle("done", input.checked);
      input.addEventListener("change", function () {
        store.checklist[id] = input.checked;
        if (!input.checked) delete store.checklist[id];
        save(store);
        input.closest("li").classList.toggle("done", input.checked);
      });
    });
  }

  /* ---------- High-frequency interview indicator (★) ----------
     Marks the pattern-defining problems most asked at FAANG/MAANG and major
     India companies, so learners can prioritise the highest-leverage practice.
     The curated set lives in dsa-question-bank.js (window.DSA_INTERVIEW_MUST). */
  var MUST_TIP = "High-frequency interview problem — commonly asked at FAANG/MAANG and major India companies. Prioritise these to learn the core patterns fast.";
  function markInterviewMust() {
    var must = window.DSA_INTERVIEW_MUST;
    if (!must || !must.length) return;
    var set = {};
    must.forEach(function (n) { set["lc-" + n] = true; });

    var marked = 0;
    document.querySelectorAll(".dsa-prob[data-pid]").forEach(function (prob) {
      if (!set[prob.getAttribute("data-pid")]) return;
      var badges = prob.querySelector(".p-badges");
      if (!badges || badges.querySelector(".p-must")) return;
      prob.classList.add("is-must");
      var star = document.createElement("span");
      star.className = "p-must";
      star.textContent = "★";
      star.setAttribute("title", MUST_TIP);
      star.setAttribute("aria-label", "High-frequency interview problem");
      var diff = badges.querySelector(".diff");
      if (diff) badges.insertBefore(star, diff);
      else badges.insertBefore(star, badges.firstChild);
      marked++;
    });

    // One-line legend above the problem list so the star is self-explanatory.
    var ladder = document.querySelector(".dsa-ladder");
    if (marked && ladder && !document.querySelector(".dsa-must-legend")) {
      var legend = document.createElement("p");
      legend.className = "dsa-must-legend";
      legend.innerHTML = '<span class="p-must" aria-hidden="true">★</span> marks <strong>high-frequency interview problems</strong> — the pattern-defining questions most asked at FAANG/MAANG and major India companies. Short on time? Start with these.';
      ladder.insertAdjacentElement("beforebegin", legend);
    }
  }

  /* ---------- Contents page: filters + per-chapter progress ---------- */
  function chapterProgress(chapterId, bank) {
    if (!bank) return null;
    var list = bank.filter(function (q) { return q.canonicalChapter === chapterId; });
    if (!list.length) return { solved: 0, total: 0 };
    var solved = 0;
    list.forEach(function (q) { if (problemState(q.id) === "solved") solved++; });
    return { solved: solved, total: list.length };
  }

  function refreshContents() {
    var bank = window.DSA_QUESTION_BANK;
    document.querySelectorAll(".dsa-crow[data-chapter]").forEach(function (row) {
      var cp = chapterProgress(row.getAttribute("data-chapter"), bank);
      var badge = row.querySelector("[data-chapter-progress]");
      var dot = row.querySelector(".dsa-state-dot");
      if (cp && badge) badge.textContent = cp.total ? (cp.solved + "/" + cp.total + " solved") : "—";
      if (cp && dot) {
        dot.className = "dsa-state-dot" + (cp.total && cp.solved === cp.total ? " solved" : (cp.solved > 0 ? " learning" : ""));
      }
    });
  }

  function setupFilters() {
    var rows = Array.prototype.slice.call(document.querySelectorAll(".dsa-crow[data-chapter]"));
    if (!rows.length) return;
    var role = document.querySelector("[data-dsa-filter=role]");
    var track = document.querySelector("[data-dsa-filter=track]");
    var text = document.querySelector("[data-dsa-filter=text]");
    var status = document.querySelector("[data-dsa-filter-status]");

    function apply() {
      var r = role ? role.value : "all";
      var t = track ? track.value : "all";
      var q = text ? text.value.trim().toLowerCase() : "";
      var shown = 0;
      rows.forEach(function (row) {
        var roles = (row.getAttribute("data-roles") || "").toLowerCase();
        var rowTrack = (row.getAttribute("data-track") || "").toLowerCase();
        var hay = (row.textContent + " " + (row.getAttribute("data-kw") || "")).toLowerCase();
        var ok = true;
        if (r !== "all" && roles.indexOf(r) === -1) ok = false;
        if (t !== "all" && rowTrack !== t) ok = false;
        if (q && hay.indexOf(q) === -1) ok = false;
        row.hidden = !ok;
        // also hide the section label if a whole section empties? keep simple.
        if (ok) shown++;
      });
      if (status) status.textContent = shown + " of " + rows.length + " sections shown";
    }
    [role, track].forEach(function (el) { if (el) el.addEventListener("change", apply); });
    if (text) text.addEventListener("input", apply);
    apply();
  }

  /* ---------- Deep links to a single problem ----------
     The Top 50 and high-frequency lists link straight at a problem, e.g.
     `02-arrays.html#lc-217`. Each problem is a <details> that is closed by
     default, so the browser's native anchor jump lands on a collapsed element
     and the reader sees a summary line with no write-up. This opens the match
     first, then scrolls — and it runs on `hashchange` as well as at load so the
     browser's Back and Forward buttons behave the same as a fresh visit.

     `scrollIntoView` (not `location.hash =`) because the hash is already set by
     the time we run, and reassigning it would push a duplicate history entry
     that Back would then have to step through twice. The header offset comes
     from `html { scroll-padding-top }` in styles.css, which scrollIntoView
     honours, so there is no offset arithmetic to keep in sync here. */
  function openHashProblem() {
    var raw = window.location.hash;
    if (!raw || raw.length < 2) return;

    // A hash is author-controlled text, not a selector. Look the problem up by
    // attribute rather than interpolating into querySelector, so a malformed or
    // hostile fragment can only ever miss.
    var id = raw.slice(1);
    // A hand-typed or truncated escape sequence ("#lc-%A") makes
    // decodeURIComponent throw; the raw fragment is still worth matching.
    try { id = decodeURIComponent(id); } catch (e) {}
    var probs = document.querySelectorAll(".dsa-prob[data-pid]");
    var target = null;
    for (var i = 0; i < probs.length; i += 1) {
      if (probs[i].getAttribute("data-pid") === id) { target = probs[i]; break; }
    }
    // Not a problem id — a section anchor, a stale link, or nothing at all.
    // Leave the browser's own handling alone rather than guessing.
    if (!target) return;

    // A problem can sit inside a collapsed ancestor (a hint block, or a future
    // grouping); opening only the problem would still leave it hidden.
    var node = target;
    while (node && node !== document.body) {
      if (node.tagName === "DETAILS") node.open = true;
      node = node.parentElement;
    }

    // Opening the <details> reflows everything below it, so scroll on the next
    // frame — measuring before the reflow scrolls to where the element *was*.
    window.requestAnimationFrame(function () {
      target.scrollIntoView({ block: "start", behavior: "auto" });
    });
  }

  function setupDeepLinks() {
    if (!document.querySelector(".dsa-prob[data-pid]")) return;
    openHashProblem();
    // Covers Back/Forward between two problems on the same page, and any
    // in-page link to a problem.
    window.addEventListener("hashchange", openHashProblem);
    // Back/Forward that restores this page from the browser's cache re-runs
    // neither DOMContentLoaded nor hashchange, so the hash has to be re-read.
    window.addEventListener("pageshow", function (e) { if (e.persisted) openHashProblem(); });
  }

  /* ---------- Init ---------- */
  function init() {
    markInterviewMust();
    mountProblemControls();
    setupPractice();
    setupReset();
    setupChecklist();
    setupFilters();
    refreshContents();
    // Last: the problem controls and ★ markers are already mounted, so opening
    // and scrolling to a deep-linked problem lands on its final layout.
    setupDeepLinks();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();

  window.DSAProgress = { state: problemState, set: setProblemState, store: function () { return store; } };
})();
