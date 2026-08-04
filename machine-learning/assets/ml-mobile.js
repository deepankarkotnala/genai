/* =========================================================================
   ml-mobile.js — the one piece of mobile behaviour CSS cannot express
   =========================================================================

   Toggles `body.ml-scrolled` once the page has moved off the top, which
   ml-mobile.css uses to lift a shadow under the sticky chrome. At rest the
   header is flat and quiet; while scrolling it separates from the content.

   A CSS-only version is not possible here: `animation-timeline: scroll()` can
   drive a shadow, but the property is not animatable on the compositor and
   Safari does not support scroll-driven animations, so the header would stay
   flat on iOS — the platform this matters most on.

   Passive listener, rAF-coalesced, one class write per state change.
   ========================================================================= */
(function () {
  "use strict";

  var THRESHOLD = 8;
  var body = document.body;
  if (!body) return;

  var scrolled = false;
  var ticking = false;

  function apply() {
    ticking = false;
    var next = window.scrollY > THRESHOLD;
    if (next === scrolled) return;
    scrolled = next;
    body.classList.toggle("ml-scrolled", scrolled);
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(apply);
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  // Restored scroll position on back/forward navigation.
  window.addEventListener("pageshow", apply);
  apply();
})();
