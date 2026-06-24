/* =========================================================================
   GenAI Mastery — shared page enhancements
   (1) A persistent "Home" button in every page's top bar (desktop + mobile)
       that returns to the hub home — works whether the page is standalone
       or loaded inside the hub iframe.
   (2) Scroll-triggered animation for flow diagrams: nodes reveal in sequence,
       connector arrows draw in, and a pulse travels along the flow.
       Honors prefers-reduced-motion.
   Pure vanilla JS, no deps. Safe to load on any genai-portal page.
   ========================================================================= */
(function () {
  "use strict";

  var REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- shared styles ---------- */
  var css = document.createElement("style");
  css.textContent = [
    /* Home button matches the existing .icon-btn look; label hides on mobile */
    ".home-btn{ display:inline-flex; align-items:center; gap:7px; height:38px; padding:0 12px;",
    "  border-radius:9px; border:1px solid var(--border); background:var(--bg-elevated);",
    "  color:var(--text-secondary); cursor:pointer; font:600 13px/1 var(--font-sans); text-decoration:none;",
    "  transition:all .15s; white-space:nowrap; }",
    ".home-btn:hover{ border-color:var(--accent); color:var(--accent); text-decoration:none; }",
    ".home-btn svg{ flex:none; }",
    "@media (max-width:860px){ .home-btn .home-lbl{ display:none; } .home-btn{ width:38px; padding:0; justify-content:center; } }",

    /* ---- animated flow diagrams ---- */
    /* nodes/arrows start hidden; .flow-in reveals them */
    ".flow-anim .fnode, .flow-anim .rf, .flow-anim .farrow, .flow-anim .arr{",
    "  opacity:0; transform:translateY(8px); transition:opacity .45s ease, transform .45s ease; }",
    ".flow-anim.flow-in .fnode, .flow-anim.flow-in .rf,",
    ".flow-anim.flow-in .farrow, .flow-anim.flow-in .arr{ opacity:1; transform:none; }",
    /* arrows: animate the connector growing from 0 height */
    ".flow-anim .farrow, .flow-anim .arr{ transform-origin:top center; }",
    ".flow-anim .farrow{ height:0!important; transition:height .35s ease, opacity .35s ease; }",
    ".flow-anim.flow-in .farrow{ height:26px!important; }",
    ".ragflow.flow-anim .arr{ height:0!important; transition:height .3s ease, opacity .3s ease; }",
    ".ragflow.flow-anim.flow-in .arr{ height:18px!important; }",
    /* a soft pulse that travels down an active flow node */
    "@keyframes flowpulse{ 0%{ box-shadow:0 0 0 0 var(--accent-ring, rgba(217,119,87,.35)); }",
    "  70%{ box-shadow:0 0 0 8px transparent; } 100%{ box-shadow:0 0 0 0 transparent; } }",
    ".flow-anim.flow-in .fnode.accent, .flow-anim.flow-in .rf.accent{ animation:flowpulse 2.2s ease-out 1; }",
    /* monospace/ascii diagrams + svg diagrams: gentle fade-up on reveal */
    ".fade-anim{ opacity:0; transform:translateY(10px); transition:opacity .5s ease, transform .5s ease; }",
    ".fade-anim.flow-in{ opacity:1; transform:none; }",
    /* SVG connector draw-in (for diagrams that opt in via .draw-anim on paths) */
    ".draw-anim path.ln, .draw-anim .flow-arrow{ stroke-dasharray:var(--dash,400); stroke-dashoffset:var(--dash,400);",
    "  transition:stroke-dashoffset 1s ease; }",
    ".draw-anim.flow-in path.ln, .draw-anim.flow-in .flow-arrow{ stroke-dashoffset:0; }",
    REDUCED ? "*{animation:none!important; transition:none!important;}" : ""
  ].join("\n");
  document.head.appendChild(css);

  /* ---------- (1) Home button ---------- */
  function homeHref() {
    // From inside the hub iframe, the page sits in genai-portal/ alongside index.html.
    // Standalone, index.html is also the sibling. Either way "index.html" relative to
    // this page is the hub home — but we navigate the TOP window so the iframe is replaced.
    return "index.html";
  }
  function addHomeButton() {
    var bar = document.querySelector(".topbar");
    if (!bar || bar.querySelector(".home-btn")) return;
    var btn = document.createElement("a");
    btn.className = "home-btn";
    btn.setAttribute("aria-label", "Go to home");
    btn.innerHTML =
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
      '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h5v-6h4v6h5V10"/></svg><span class="home-lbl">Home</span>';
    btn.href = homeHref();
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      var inIframe = window.top !== window.self;
      if (inIframe) {
        // Ask the hub (parent) to switch to the home tab — reliable cross-frame.
        try { window.parent.postMessage({ type: "genai-hub-home" }, "*"); return; } catch (err) {}
      }
      window.location.href = homeHref();
    });
    // place just before the theme toggle if present, else at the end
    var theme = bar.querySelector("[data-theme-toggle]");
    if (theme) bar.insertBefore(btn, theme); else bar.appendChild(btn);
  }

  /* ---------- (2) Diagram animation ---------- */
  function setupDiagramAnimation() {
    // CSS-flow diagrams get sequenced node reveal; ascii/svg get a fade-up.
    var flows = [].slice.call(document.querySelectorAll(".cssflow, .ragflow"));
    flows.forEach(function (el) { el.classList.add("flow-anim"); });

    var fades = [].slice.call(document.querySelectorAll(".lg-graph, .loop-fig, .lf-tree, .diagram svg"));
    fades.forEach(function (el) {
      // don't double-wrap an svg already inside an animated cssflow
      if (!el.closest(".cssflow, .ragflow")) el.classList.add("fade-anim");
    });

    if (REDUCED || !window.IntersectionObserver) {
      // reveal everything immediately
      flows.concat(fades).forEach(function (el) { el.classList.add("flow-in"); });
      return;
    }

    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        obs.unobserve(el);
        if (el.classList.contains("flow-anim")) {
          // stagger the children so the flow "builds" top-to-bottom
          var kids = [].slice.call(el.querySelectorAll(".fnode, .rf, .farrow, .arr"));
          el.classList.add("flow-in");
          kids.forEach(function (k, i) {
            k.style.transitionDelay = (i * 110) + "ms";
          });
        } else {
          el.classList.add("flow-in");
        }
      });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.15 });

    flows.concat(fades).forEach(function (el) { obs.observe(el); });
  }

  function init() { addHomeButton(); setupDiagramAnimation(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
