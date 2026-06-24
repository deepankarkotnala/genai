/* =========================================================================
   teach-agents — Side navigation injector
   Adds a persistent left sidebar (all pages in this course) + a sticky
   right-rail "On this page" TOC built from headings. Self-contained, no deps.
   Adopts the course's existing serif look via assets/style.css variables.
   Works on both full HTML docs and bare HTML fragments (lessons).
   ========================================================================= */
(function () {
  "use strict";

  /* ---- Course map (relative to folder root) ---- */
  var PAGES = [
    { group: "Start",     href: "index.html",                              title: "Course index", num: "*" },
    { group: "Lessons",   href: "lessons/0001-what-is-an-agent.html",      title: "What is an agent?", num: "01" },
    { group: "Lessons",   href: "lessons/0002-run-your-first-agent.html",  title: "Run your first agent", num: "02" },
    { group: "Lessons",   href: "lessons/0003-prediction-vs-threshold.html", title: "Prediction vs. threshold", num: "03" },
    { group: "Lessons",   href: "lessons/0004-orchestration.html",         title: "Orchestration", num: "04" },
    { group: "Lessons",   href: "lessons/0005-workflow-vs-agent.html",     title: "Workflow vs. agent", num: "05" },
    { group: "Lessons",   href: "lessons/0006-mapping-any-enm-row.html",   title: "Mapping any EnM row", num: "06" },
    { group: "Reference", href: "reference/agent-glossary.html",           title: "Agent glossary", num: "📖" }
  ];

  /* ---- Figure out how deep we are so links resolve from any folder ---- */
  var path = location.pathname.replace(/\\/g, "/");
  var inSub = /\/(lessons|reference)\//.test(path);
  var prefix = inSub ? "../" : "";
  function rel(href) { return prefix + href; }

  /* Identify the current page by its filename. */
  var here = path.substring(path.lastIndexOf("/") + 1) || "index.html";

  /* ---- Styles (scoped, theme-matched) ---- */
  var css = document.createElement("style");
  css.textContent = [
    ":root{--ta-sidebar:264px;--ta-toc:226px}",
    /* push the existing centered body over to leave room for rails */
    "body{max-width:none!important;margin:0!important;",
    "  padding-left:calc(var(--ta-sidebar) + 2.5rem)!important;",
    "  padding-right:calc(var(--ta-toc) + 2.5rem)!important;",
    "  padding-top:2.5rem!important;padding-bottom:5rem!important}",
    ".ta-main{max-width:800px;margin:0 auto}",
    /* sidebar */
    ".ta-sidebar{position:fixed;left:0;top:0;bottom:0;width:var(--ta-sidebar);overflow-y:auto;",
    "  background:var(--accent-soft,#f4ece6);border-right:1px solid var(--rule,#e2e0db);",
    "  font-family:-apple-system,'Segoe UI',system-ui,sans-serif;z-index:50;padding:0 0 2rem}",
    ".ta-brand{display:flex;align-items:center;gap:.6rem;padding:1.1rem 1.2rem;",
    "  border-bottom:1px solid var(--rule,#e2e0db);position:sticky;top:0;background:var(--accent-soft,#f4ece6)}",
    ".ta-brand .mk{width:30px;height:30px;border-radius:8px;flex:none;background:var(--accent,#9a3b1b);",
    "  color:#fff;font-weight:800;display:flex;align-items:center;justify-content:center;font-size:15px}",
    ".ta-brand b{font-size:.92rem;color:var(--ink,#1a1a1a);line-height:1.1}",
    ".ta-brand span{display:block;font-size:.68rem;color:var(--muted,#6b6b6b);font-weight:400}",
    ".ta-home{display:flex;align-items:center;gap:.5rem;margin:.8rem 1.1rem .2rem;padding:.5rem .8rem;",
    "  border:1px solid var(--rule,#e2e0db);border-radius:8px;background:#fff;color:var(--ink,#1a1a1a);",
    "  font-size:.82rem;font-weight:600;text-decoration:none}",
    ".ta-home:hover{border-color:var(--accent,#9a3b1b);color:var(--accent,#9a3b1b);text-decoration:none}",
    ".ta-glabel{font-size:.66rem;letter-spacing:.12em;text-transform:uppercase;color:var(--muted,#6b6b6b);",
    "  font-weight:700;padding:1.1rem 1.3rem .35rem}",
    ".ta-link{display:flex;gap:.55rem;align-items:center;padding:.45rem 1.3rem;font-size:.86rem;",
    "  color:var(--ink,#1a1a1a);text-decoration:none;line-height:1.25}",
    ".ta-link:hover{background:rgba(154,59,27,.08);text-decoration:none}",
    ".ta-link.active{color:var(--accent,#9a3b1b);font-weight:700;box-shadow:inset 3px 0 0 var(--accent,#9a3b1b);background:#fff}",
    ".ta-link .n{font-size:.68rem;min-width:1.7rem;text-align:center;color:var(--muted,#6b6b6b);",
    "  background:#fff;border:1px solid var(--rule,#e2e0db);border-radius:5px;padding:1px 4px;flex:none}",
    ".ta-link.active .n{color:var(--accent,#9a3b1b);border-color:var(--accent,#9a3b1b)}",
    /* toc */
    ".ta-tocrail{position:fixed;right:0;top:0;width:var(--ta-toc);padding:2.6rem 1.2rem;z-index:40;",
    "  font-family:-apple-system,'Segoe UI',system-ui,sans-serif}",
    ".ta-tocrail .t{font-size:.66rem;letter-spacing:.12em;text-transform:uppercase;color:var(--muted,#6b6b6b);font-weight:700;margin-bottom:.6rem}",
    ".ta-tocrail a{display:block;padding:.22rem 0 .22rem .7rem;font-size:.8rem;color:var(--muted,#6b6b6b);",
    "  border-left:2px solid var(--rule,#e2e0db);text-decoration:none;line-height:1.35}",
    ".ta-tocrail a.lvl3{padding-left:1.4rem;font-size:.76rem}",
    ".ta-tocrail a:hover{color:var(--ink,#1a1a1a)}",
    ".ta-tocrail a.active{color:var(--accent,#9a3b1b);border-left-color:var(--accent,#9a3b1b);font-weight:600}",
    /* hide the page's own inline toc to avoid duplication */
    "body > .toc, .ta-main > .toc{display:none}",
    /* mobile toggle */
    ".ta-menu{display:none;position:fixed;left:12px;top:12px;z-index:60;width:42px;height:42px;",
    "  border-radius:10px;border:1px solid var(--rule,#e2e0db);background:#fff;font-size:20px;cursor:pointer;color:var(--ink,#1a1a1a)}",
    ".ta-backdrop{display:none;position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:45}",
    "@media(max-width:1180px){.ta-tocrail{display:none}body{padding-right:2.5rem!important}}",
    "@media(max-width:880px){",
    "  body{padding-left:1.3rem!important;padding-right:1.3rem!important;padding-top:4.5rem!important}",
    "  .ta-sidebar{transform:translateX(-100%);transition:transform .25s ease;box-shadow:0 0 40px rgba(0,0,0,.2)}",
    "  body.ta-open .ta-sidebar{transform:none}",
    "  body.ta-open .ta-backdrop{display:block}",
    "  .ta-menu{display:flex;align-items:center;justify-content:center}",
    /* let wide tables scroll inside themselves instead of stretching the page */
    "  .ta-main table{display:block;overflow-x:auto;-webkit-overflow-scrolling:touch;white-space:nowrap}",
    "}",
    "@media print{.ta-sidebar,.ta-tocrail,.ta-menu,.ta-backdrop{display:none!important}body{padding:0!important;max-width:none!important}}"
  ].join("\n");
  document.head.appendChild(css);

  var built = false;
  document.addEventListener("DOMContentLoaded", build);
  if (document.readyState !== "loading") build();

  function build() {
    if (built) return; built = true;

    /* wrap existing body content so we can center it independently of the rails */
    var main = document.createElement("div");
    main.className = "ta-main";
    while (document.body.firstChild) main.appendChild(document.body.firstChild);
    document.body.appendChild(main);

    /* ---- sidebar ---- */
    var side = document.createElement("aside");
    side.className = "ta-sidebar";
    var html = '<a class="ta-brand" href="' + rel("index.html") + '" style="text-decoration:none">' +
      '<span class="mk">A</span><span><b>Understanding AI Agents</b><span>Agent Literacy course</span></span></a>' +
      '<a class="ta-home" data-hubhome href="#"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 11l9-8 9 8"/><path d="M5 10v10h5v-6h4v6h5V10"/></svg> Hub home</a>';
    var lastGroup = null;
    PAGES.forEach(function (p) {
      if (p.group !== lastGroup) { html += '<div class="ta-glabel">' + p.group + "</div>"; lastGroup = p.group; }
      var file = p.href.substring(p.href.lastIndexOf("/") + 1);
      var active = file === here ? " active" : "";
      html += '<a class="ta-link' + active + '" href="' + rel(p.href) + '">' +
        '<span class="n">' + p.num + "</span><span>" + p.title + "</span></a>";
    });
    side.innerHTML = html;
    document.body.appendChild(side);

    /* "Hub home" → navigate the top window back to the hub home (this page may be in an iframe) */
    var homeLink = side.querySelector("[data-hubhome]");
    if (homeLink) homeLink.addEventListener("click", function (e) {
      e.preventDefault();
      if (window.parent !== window.self) {
        try { window.parent.postMessage({ type: "genai-hub-home" }, "*"); return; } catch (err) {}
      }
      location.href = "../genai-portal/index.html";
    });

    /* mobile menu + backdrop */
    var menu = document.createElement("button");
    menu.className = "ta-menu"; menu.setAttribute("aria-label", "Menu"); menu.textContent = "☰";
    var backdrop = document.createElement("div"); backdrop.className = "ta-backdrop";
    menu.addEventListener("click", function () { document.body.classList.toggle("ta-open"); });
    backdrop.addEventListener("click", function () { document.body.classList.remove("ta-open"); });
    document.body.appendChild(menu); document.body.appendChild(backdrop);

    /* ---- right-rail TOC from h2/h3 ---- */
    buildToc(main);
  }

  function slug(t) {
    return t.toLowerCase().replace(/[^\w]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 50) || "section";
  }

  function buildToc(main) {
    var heads = [].slice.call(main.querySelectorAll("h2, h3"));
    if (!heads.length) return;
    var rail = document.createElement("nav");
    rail.className = "ta-tocrail";
    var items = '<div class="t">On this page</div>';
    var used = {};
    heads.forEach(function (h) {
      if (!h.id) {
        var s = slug(h.textContent); var base = s, i = 2;
        while (used[s] || document.getElementById(s)) { s = base + "-" + i++; }
        used[s] = 1; h.id = s;
      }
      h.style.scrollMarginTop = "70px";
      var txt = h.textContent.replace(/^\s*\d+[\.\)]\s*/, "");
      items += '<a href="#' + h.id + '" data-toc="' + h.id + '"' +
        (h.tagName === "H3" ? ' class="lvl3"' : "") + ">" + txt + "</a>";
    });
    rail.innerHTML = items;
    document.body.appendChild(rail);

    /* scroll-spy */
    var links = [].slice.call(rail.querySelectorAll("[data-toc]"));
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          links.forEach(function (l) { l.classList.toggle("active", l.getAttribute("data-toc") === en.target.id); });
        }
      });
    }, { rootMargin: "-70px 0px -72% 0px" });
    heads.forEach(function (h) { obs.observe(h); });
  }
})();
