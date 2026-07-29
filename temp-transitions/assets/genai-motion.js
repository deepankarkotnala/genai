/* =========================================================================
   genai-motion.js — the one piece of motion CSS cannot express
   =========================================================================

   Toggles `body.is-scrolled` once the page has moved off the top, which
   genai-motion.css uses to lift a shadow under the sticky topbar. At rest the
   header is flat and quiet; while scrolling it separates from the content it
   is now covering.

   A CSS-only version is not possible: `animation-timeline: scroll()` can drive
   a box-shadow, but the property is not compositable, and Safari has no
   scroll-driven animations at all — so the header would stay flat on iOS, the
   platform where the distinction matters most.

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
    body.classList.toggle("is-scrolled", scrolled);
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(apply);
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  // Scroll position restored on back/forward navigation.
  window.addEventListener("pageshow", apply);
  apply();
})();
