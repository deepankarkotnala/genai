/* =========================================================================
   GenAI Learning Hub — shared sub-site page controller
   Used by the sub-sites (learn-rag-mcp, teach-agents) so they share the exact
   look + behaviour of the GenAI Mastery module pages, while keeping their own
   navigation. app.js is hard-wired to the Mastery module registry, so those
   sub-sites use THIS controller instead.

   Each page declares its own nav before loading this file:

     window.PORTAL = {
       brand:    "RAG · MCP · Agents · LLMs",     // sidebar wordmark
       tagline:  "Hands-on guide",
       mark:     "R",                              // letter in the brand square
       here:     "02-rag.html",                    // current page (matches a page.file)
       base:     "",                               // path prefix to reach sibling pages ("" or "../")
       pages: [ { file, title, num, kw } , ... ]   // sidebar + search registry
     };

   Provides: theme toggle (shared gp.theme key) · sidebar (site pages) ·
   search over the site's pages · auto right-rail TOC from h2[id] ·
   copy buttons · quizzes · mobile nav. Diagram animation + the Home button
   come from enhance.js (loaded alongside this file).
   Pure vanilla JS, no deps, offline-safe.
   ========================================================================= */
(function () {
  "use strict";
  var P = window.PORTAL || { pages: [] };
  var base = P.base || "";
  var LS_THEME = "gp.theme";   // share the hub's theme preference

  function safeGet(key) { try { return localStorage.getItem(key); } catch (e) { return null; } }
  function safeSet(key, value) { try { localStorage.setItem(key, value); } catch (e) {} }

  /* ---------- Theme (mirrors app.js so the choice persists across the hub) ---------- */
  function getTheme() {
    return safeGet(LS_THEME) || "light";
  }
  function applyTheme(t) {
    document.documentElement.setAttribute("data-theme", t);
    safeSet(LS_THEME, t);
    var btn = document.querySelector("[data-theme-toggle]");
    if (btn) btn.innerHTML = t === "dark"
      ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/></svg>'
      : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';
  }
  document.documentElement.setAttribute("data-theme", getTheme());

  function setupTheme() {
    applyTheme(getTheme());
    var btn = document.querySelector("[data-theme-toggle]");
    if (btn) btn.addEventListener("click", function () { applyTheme(getTheme() === "dark" ? "light" : "dark"); });
  }

  /* ---------- Sidebar ----------
     The unified grouped sidebar (sitenav.js) now owns .nav across the whole
     site. When present, defer to it instead of building this site's own list. */
  function buildSidebar() {
    if (window.SiteNav) return;
    var nav = document.querySelector(".nav");
    if (!nav) return;
    var html = "";
    if (P.navLabel) html += '<div class="nav-group-label">' + P.navLabel + "</div>";
    (P.pages || []).forEach(function (pg) {
      var active = pg.file === P.here ? "active" : "";
      html += '<a href="' + base + pg.file + '" class="' + active + '">' +
        '<span class="num">' + pg.num + "</span> " + pg.title + "</a>";
    });
    nav.innerHTML = html;
  }

  /* ---------- Search ----------
     sitenav.js provides cross-site search; defer to it when present. */
  function setupSearch() {
    if (window.SiteNav) return;
    var input = document.querySelector("[data-search]");
    var out = document.querySelector(".search-results");
    if (!input || !out) return;
    function esc(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
    function render(q) {
      q = q.trim().toLowerCase();
      if (!q) { out.innerHTML = ""; return; }
      var hits = (P.pages || []).map(function (m) {
        var hay = (m.title + " " + (m.kw || "")).toLowerCase();
        var score = 0;
        if (m.title.toLowerCase().indexOf(q) > -1) score += 10;
        q.split(/\s+/).forEach(function (w) { if (hay.indexOf(w) > -1) score += 1; });
        return { m: m, score: score };
      }).filter(function (x) { return x.score > 0; })
        .sort(function (a, b) { return b.score - a.score; }).slice(0, 7);
      if (!hits.length) { out.innerHTML = '<div class="search-empty">No results for "' + q + '"</div>'; return; }
      out.innerHTML = hits.map(function (h) {
        var m = h.m;
        var t = m.title.replace(new RegExp("(" + esc(q) + ")", "i"), "<b>$1</b>");
        return '<a class="search-result" href="' + base + m.file + '">' +
          '<b style="color:var(--text-muted);font-family:var(--font-mono);font-size:11px">' + m.num + "</b> &nbsp;" + t + "</a>";
      }).join("");
    }
    input.addEventListener("input", function (e) { render(e.target.value); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "/" && document.activeElement !== input && !/input|textarea/i.test(document.activeElement.tagName)) {
        e.preventDefault(); input.focus();
      }
      if (e.key === "Escape") { input.blur(); out.innerHTML = ""; }
    });
  }

  /* ---------- Textbook-style chapter contents from h2[id] ---------- */
  function slug(t) {
    return t.toLowerCase().replace(/[^\w]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 50) || "section";
  }
  function compactTOCLabel(text) {
    return text
      .replace(/^\s*\d+\s*[.·)]\s*/, "")
      .replace(/first-principles breakdown/i, "First principles")
      .replace(/deep technical explanation/i, "Technical detail")
      .replace(/interactive:\s*/i, "")
      .replace(/watch generation happen/i, "Watch generation")
      .replace(/practical python/i, "Python practice")
      .replace(/ollama implementation/i, "Ollama setup")
      .replace(/industry perspective/i, "Industry view")
      .replace(/top mistakes engineers make/i, "Common mistakes")
      .replace(/interview preparation/i, "Interview prep")
      .replace(/mini project\s*[—–-].*$/i, "Mini project")
      .replace(/real project connection/i, "Project context")
      .replace(/executive summary/i, "Summary")
      .trim();
  }
  function escapeTOCText(text) {
    return text.replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }
  function buildTOC() {
    var rail = document.querySelector(".toc");
    var content = document.querySelector(".content");
    if (!rail || !content) return;
    var heads = [].slice.call(content.querySelectorAll("h2"));
    var used = {};
    heads.forEach(function (h) {
      if (!h.id) { var s = slug(h.textContent), b = s, i = 2; while (used[s] || document.getElementById(s)) s = b + "-" + (i++); used[s] = 1; h.id = s; }
    });
    if (!heads.length) { var r = document.querySelector(".toc-rail"); if (r) r.style.display = "none"; return; }

    rail.classList.add("toc-textbook");
    var rows = heads.map(function (h, index) {
      var full = h.textContent.trim();
      var match = full.match(/^\s*(\d+)\s*[.·)]\s*/);
      var num = String(match ? match[1] : index + 1).padStart(2, "0");
      return '<a href="#' + h.id + '" data-toc="' + h.id + '" title="' + escapeTOCText(full) + '">' +
        '<span class="toc-num">' + num + '</span><span class="toc-label">' + escapeTOCText(compactTOCLabel(full)) + '</span></a>';
    }).join("");
    rail.innerHTML =
      '<div class="toc-book-head"><div><span class="toc-kicker">Chapter contents</span><strong>' + heads.length + ' topics</strong></div>' +
      '<button class="toc-top" type="button" aria-label="Back to chapter top" title="Back to top">↑</button></div>' +
      '<label class="toc-filter"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"></circle><path d="m16 16 4 4"></path></svg>' +
      '<input type="search" placeholder="Find topic" aria-label="Find a topic in this chapter"></label>' +
      '<div class="toc-list">' + rows + '<div class="toc-empty" hidden>No matching topic</div></div>';

    var links = [].slice.call(rail.querySelectorAll("[data-toc]"));
    var list = rail.querySelector(".toc-list");
    var filter = rail.querySelector(".toc-filter input");
    var empty = rail.querySelector(".toc-empty");
    var top = rail.querySelector(".toc-top");
    if (top) top.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });
    if (filter) filter.addEventListener("input", function () {
      var query = filter.value.trim().toLowerCase();
      var shown = 0;
      links.forEach(function (link) {
        var visible = !query || link.textContent.toLowerCase().indexOf(query) > -1 || (link.title || "").toLowerCase().indexOf(query) > -1;
        link.hidden = !visible;
        if (visible) shown += 1;
      });
      if (empty) empty.hidden = shown !== 0;
    });
    if (window.IntersectionObserver) {
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            links.forEach(function (l) { l.classList.toggle("active", l.getAttribute("data-toc") === en.target.id); });
            var active = links.find(function (l) { return l.getAttribute("data-toc") === en.target.id; });
            if (active && list) active.scrollIntoView({ block: "nearest" });
          }
        });
      }, { rootMargin: "-72px 0px -72% 0px" });
      heads.forEach(function (h) { obs.observe(h); });
    }
  }

  /* ---------- Copy buttons ---------- */
  function setupCopy() {
    document.querySelectorAll(".code-block").forEach(function (block) {
      var btn = block.querySelector(".copy-btn");
      var code = block.querySelector("code");
      if (!btn || !code) return;
      btn.addEventListener("click", function () {
        var text = code.innerText;
        function ok() { btn.textContent = "Copied!"; btn.classList.add("copied"); setTimeout(function () { btn.textContent = "Copy"; btn.classList.remove("copied"); }, 1600); }
        if (navigator.clipboard) navigator.clipboard.writeText(text).then(ok).catch(function () {
          var ta = document.createElement("textarea"); ta.value = text; document.body.appendChild(ta); ta.select();
          try { document.execCommand("copy"); } catch (e) {} ta.remove(); ok();
        }); else ok();
      });
    });
  }

  /* ---------- Quizzes (house markup: .quiz > .opt[data-correct], .explain) ---------- */
  function setupQuizzes() {
    document.querySelectorAll(".quiz").forEach(function (quiz) {
      var opts = [].slice.call(quiz.querySelectorAll(".opt"));
      var explain = quiz.querySelector(".explain");
      var answered = false;
      opts.forEach(function (opt) {
        opt.addEventListener("click", function () {
          if (answered) return; answered = true;
          var correct = opt.dataset.correct === "true";
          opt.classList.add(correct ? "correct" : "wrong");
          if (!correct) { var right = opts.find(function (o) { return o.dataset.correct === "true"; }); if (right) right.classList.add("correct"); }
          if (explain) explain.classList.add("show");
        });
      });
    });
  }

  /* ---------- Reveal on scroll (cards) ---------- */
  function setupReveal() {
    var els = document.querySelectorAll("[data-reveal]");
    if (!els.length || !window.IntersectionObserver) return;
    var obs = new IntersectionObserver(function (entries, o) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("reveal"); o.unobserve(e.target); } });
    }, { threshold: 0.08 });
    els.forEach(function (el) { obs.observe(el); });
  }

  /* ---------- Mobile nav ----------
     The ☰ button is wired by sitenav.js (desktop collapse + mobile drawer).
     Here we only handle the backdrop and closing the drawer on link click. */
  function setupMobileNav() {
    var app = document.querySelector(".app");
    if (!app) return;
    var menu = document.querySelector(".menu-btn");
    var backdrop = document.querySelector(".backdrop");
    if (menu && !window.SiteNav) menu.addEventListener("click", function () { app.classList.toggle("nav-open"); });
    if (backdrop) backdrop.addEventListener("click", function () { app.classList.remove("nav-open"); });
    document.querySelectorAll(".nav a").forEach(function (a) { a.addEventListener("click", function () { app.classList.remove("nav-open"); }); });
  }

  function init() {
    setupTheme(); buildSidebar(); setupSearch(); buildTOC();
    setupCopy(); setupQuizzes(); setupReveal(); setupMobileNav();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
