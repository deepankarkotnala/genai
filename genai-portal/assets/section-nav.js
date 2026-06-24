/* =========================================================================
   Standalone-page section navigation
   Builds the left sidebar from this page's own <h2 id> sections (instead of
   the module list), wires section search + scroll-spy, and lets app.js build
   the right-rail "On this page" TOC. Used by single-topic pages like
   langfuse.html, guardrails.html, memory.html, rag-deep-dive.html.
   ========================================================================= */
(function () {
  function build() {
    // The unified sidebar (sitenav.js) now owns .nav across the whole site, so
    // this page's section list moves to the right-rail TOC instead. If sitenav
    // is present, don't overwrite the shared sidebar.
    if (window.SiteNav) return;
    var content = document.querySelector(".content");
    var nav = document.querySelector(".nav");
    if (!content || !nav) return;
    var heads = [].slice.call(content.querySelectorAll("h2[id]"));

    var html = '<a href="index.html"><span class="num">＊</span> Hub home</a>' +
               '<div class="nav-group-label">On this page</div>';
    heads.forEach(function (h) {
      var txt = h.textContent.trim();
      var m = txt.match(/^(\d+)\s*·\s*(.*)$/);
      var num = m ? m[1] : "•";
      var label = m ? m[2] : txt;
      html += '<a href="#' + h.id + '" data-sec="' + h.id + '">' +
              '<span class="num sec-num">' + num + '</span> ' + label + '</a>';
    });
    nav.innerHTML = html;

    var links = [].slice.call(nav.querySelectorAll("[data-sec]"));
    if (window.IntersectionObserver) {
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            links.forEach(function (l) { l.classList.toggle("active", l.getAttribute("data-sec") === en.target.id); });
          }
        });
      }, { rootMargin: "-80px 0px -70% 0px" });
      heads.forEach(function (h) { obs.observe(h); });
    }

    var app = document.querySelector(".app");
    links.forEach(function (a) { a.addEventListener("click", function () { if (app) app.classList.remove("nav-open"); }); });

    var input = document.querySelector("[data-secsearch]");
    var out = document.querySelector("[data-secresults]");
    if (input && out) {
      input.addEventListener("input", function () {
        var q = input.value.trim().toLowerCase();
        if (!q) { out.innerHTML = ""; return; }
        var hits = heads.filter(function (h) { return h.textContent.toLowerCase().indexOf(q) > -1; }).slice(0, 8);
        out.innerHTML = hits.length
          ? hits.map(function (h) { return '<a class="search-result" href="#' + h.id + '">' + h.textContent.trim() + '</a>'; }).join("")
          : '<div class="search-empty">No section matches "' + q + '"</div>';
      });
      document.addEventListener("keydown", function (e) {
        if (e.key === "/" && document.activeElement !== input && !/input|textarea/i.test(document.activeElement.tagName)) {
          e.preventDefault(); input.focus();
        }
        if (e.key === "Escape") { input.blur(); out.innerHTML = ""; }
      });
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", build);
  else build();
})();
