/* =========================================================================
   transitions-preview.js — SANDBOX ONLY
   =========================================================================

   Companion to transitions-preview.css. Two jobs that CSS cannot do alone:

     1  Speculation Rules — prefetch same-origin pages on hover, so the
        document is already in memory by the time the click lands.
     2  Wrap the theme toggle in a same-document view transition, so light↔dark
        crossfades the whole rendered page instead of re-colouring element by
        element.

   Loaded last, after app.js / sitenav.js / enhance.js / genai-motion.js.
   Nothing here modifies those files — the theme hook works by intercepting the
   click before their handler sees it, then handing the click straight back.
   ========================================================================= */
(function () {
  "use strict";

  var REDUCED = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  /* -----------------------------------------------------------------------
     1 · Prefetch on hover
     -----------------------------------------------------------------------
     `eagerness: "moderate"` is the browser's own hover/pointerdown heuristic —
     it decides when a hover looks committed, rather than us firing a request on
     every stray pointer movement. Cheap: prefetch fetches the document only,
     not subresources, and the cap keeps a long sidebar from stampeding.

     Chromium only. Other browsers ignore the script tag entirely — the JSON is
     inert to them, so there is no fallback to write. Needs an HTTP origin;
     over file:// it is silently skipped.
     --------------------------------------------------------------------- */
  function addSpeculationRules() {
    if (!HTMLScriptElement.supports || !HTMLScriptElement.supports("speculationrules")) return;

    var script = document.createElement("script");
    script.type = "speculationrules";
    script.textContent = JSON.stringify({
      prefetch: [{
        source: "document",
        where: { and: [{ href_matches: "/*" }, { not: { selector_matches: "[download]" } }] },
        eagerness: "moderate"
      }]
    });
    document.head.appendChild(script);
  }

  /* -----------------------------------------------------------------------
     2 · Theme switch as a view transition
     -----------------------------------------------------------------------
     The listener is on `document` in the capture phase deliberately. Listeners
     attached to the button itself fire in registration order regardless of the
     capture flag, and app.js registers its handler first — so a listener on the
     button could never run before the theme had already flipped. Document
     capture runs before any listener on the target.

     Rather than reimplementing the toggle (which also swaps the button's icon
     and writes localStorage), it re-dispatches the same click inside the view
     transition's update callback, with a flag so the interceptor lets that one
     through to app.js. The real logic stays the only copy of the logic.
     --------------------------------------------------------------------- */
  function wrapThemeToggle() {
    if (REDUCED || !document.startViewTransition) return;   // falls back to the atomic flip
    var root = document.documentElement;
    var passthrough = false;

    document.addEventListener("click", function (event) {
      if (passthrough) return;                              // our own re-dispatch — let it run
      var button = event.target.closest && event.target.closest("[data-theme-toggle]");
      if (!button) return;

      event.preventDefault();
      event.stopImmediatePropagation();                     // app.js must not flip it yet

      // Scopes the CSS to a fade-in-place instead of the navigation slide.
      root.classList.add("vt-theme");

      var transition = document.startViewTransition(function () {
        passthrough = true;
        button.click();                                     // app.js flips theme + icon here
        passthrough = false;
      });

      transition.finished.then(cleanup, cleanup);
      function cleanup() { root.classList.remove("vt-theme"); }
    }, true);
  }

  function init() {
    addSpeculationRules();
    wrapThemeToggle();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
