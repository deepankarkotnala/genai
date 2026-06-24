/* =========================================================================
   learn-rag-mcp — Side navigation injector
   Adds a persistent left sidebar (all parts of the guide) + a sticky
   right-rail "On this page" TOC built from headings. Self-contained, no deps.
   Adopts the guide's existing Apple-ish look via style.css variables.
   ========================================================================= */
(function () {
  "use strict";

  var PAGES = [
    { href: "index.html",                title: "Guide home",        num: "*" },
    { href: "01-llms.html",              title: "LLMs — The Foundation", num: "01" },
    { href: "02-rag.html",               title: "RAG — Retrieval-Augmented Generation", num: "02" },
    { href: "03-agents.html",            title: "Agents & Tool Use", num: "03" },
    { href: "04-mcp.html",               title: "MCP — Model Context Protocol", num: "04" },
    { href: "05-build-simple-rag.html",  title: "Build: A Simple RAG App", num: "05" },
    { href: "06-build-pdf-qna.html",     title: "Build: PDF Q&A RAG App", num: "06" },
    { href: "07-eda-agent-ollama.html",  title: "Build: EDA Agent with Ollama", num: "07" }
  ];

  var path = location.pathname.replace(/\\/g, "/");
  var here = path.substring(path.lastIndexOf("/") + 1) || "index.html";

  var css = document.createElement("style");
  css.textContent = [
    ":root{--lr-sidebar:280px;--lr-toc:230px}",
    /* make room for both rails; the guide centers via .wrap / .hero with max-width */
    "body{padding-left:var(--lr-sidebar)!important;padding-right:var(--lr-toc)!important}",
    /* keep the existing centered widths but allow them to use the new viewport */
    ".wrap,.hero{max-width:920px!important}",
    /* the page's own sticky top nav must clear the sidebar */
    ".nav .inner{padding-left:24px!important}",
    /* sidebar */
    ".lr-sidebar{position:fixed;left:0;top:0;bottom:0;width:var(--lr-sidebar);overflow-y:auto;z-index:60;",
    "  background:var(--bg-soft,#f5f5f7);border-right:1px solid var(--border,#e3e3e8);",
    "  font:15px/1.5 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif}",
    ".lr-brand{display:flex;align-items:center;gap:10px;padding:18px 18px;text-decoration:none;",
    "  border-bottom:1px solid var(--border-soft,#ededf0);position:sticky;top:0;background:var(--bg-soft,#f5f5f7)}",
    ".lr-brand .mk{width:30px;height:30px;border-radius:8px;flex:none;color:#fff;font-weight:800;",
    "  display:flex;align-items:center;justify-content:center;font-size:15px;",
    "  background:linear-gradient(135deg,var(--accent2,#6e56cf),var(--accent,#0071e3))}",
    ".lr-brand b{font-size:14px;color:var(--ink,#1d1d1f);line-height:1.15}",
    ".lr-brand span{display:block;font-size:11px;color:var(--muted,#6e6e73);font-weight:400}",
    ".lr-glabel{font-size:11px;letter-spacing:.07em;text-transform:uppercase;color:var(--muted,#6e6e73);",
    "  font-weight:700;padding:18px 20px 6px}",
    ".lr-link{display:flex;gap:10px;align-items:center;padding:8px 20px;color:var(--ink-2,#424245);",
    "  text-decoration:none;font-size:13.5px;line-height:1.3}",
    ".lr-link:hover{background:rgba(110,86,207,.07);text-decoration:none}",
    ".lr-link.active{color:var(--accent-ink,#0066cc);font-weight:650;background:#fff;",
    "  box-shadow:inset 3px 0 0 var(--accent,#0071e3)}",
    ".lr-link .n{font-size:11px;min-width:24px;text-align:center;flex:none;color:var(--muted,#6e6e73);",
    "  background:#fff;border:1px solid var(--border,#e3e3e8);border-radius:5px;padding:1px 5px}",
    ".lr-link.active .n{color:var(--accent-ink,#0066cc);border-color:var(--accent,#0071e3)}",
    /* right rail */
    ".lr-tocrail{position:fixed;right:0;top:64px;width:var(--lr-toc);padding:24px 18px;z-index:50;",
    "  font:13px/1.5 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif}",
    ".lr-tocrail .t{font-size:11px;letter-spacing:.07em;text-transform:uppercase;color:var(--muted,#6e6e73);font-weight:700;margin-bottom:10px}",
    ".lr-tocrail a{display:block;padding:4px 0 4px 12px;color:var(--muted,#6e6e73);",
    "  border-left:2px solid var(--border,#e3e3e8);text-decoration:none;font-size:12.5px;line-height:1.4}",
    ".lr-tocrail a.lvl3{padding-left:22px;font-size:12px}",
    ".lr-tocrail a:hover{color:var(--ink,#1d1d1f)}",
    ".lr-tocrail a.active{color:var(--accent-ink,#0066cc);border-left-color:var(--accent,#0071e3);font-weight:600}",
    /* hide the page's own inline .toc card to avoid duplication */
    ".wrap > .toc{display:none}",
    /* mobile */
    ".lr-menu{display:none;position:fixed;left:12px;top:11px;z-index:80;width:40px;height:40px;border-radius:10px;",
    "  border:1px solid var(--border,#e3e3e8);background:#fff;font-size:19px;cursor:pointer;color:var(--ink,#1d1d1f)}",
    ".lr-backdrop{display:none;position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:55}",
    "@media(max-width:1240px){.lr-tocrail{display:none}body{padding-right:0!important}}",
    "@media(max-width:900px){",
    "  body{padding-left:0!important}",
    "  .lr-sidebar{transform:translateX(-100%);transition:transform .25s ease;box-shadow:0 0 40px rgba(0,0,0,.2)}",
    "  body.lr-open .lr-sidebar{transform:none}",
    "  body.lr-open .lr-backdrop{display:block}",
    "  .lr-menu{display:flex;align-items:center;justify-content:center}",
    "  .nav .inner{padding-left:60px!important}",
    "}",
    "@media print{.lr-sidebar,.lr-tocrail,.lr-menu,.lr-backdrop{display:none!important}body{padding:0!important}}"
  ].join("\n");
  document.head.appendChild(css);

  var built = false;
  document.addEventListener("DOMContentLoaded", build);
  if (document.readyState !== "loading") build();

  function build() {
    if (built) return; built = true;

    var side = document.createElement("aside");
    side.className = "lr-sidebar";
    var html = '<a class="lr-brand" href="index.html"><span class="mk">R</span>' +
      '<span><b>RAG · MCP · Agents · LLMs</b><span>Hands-on guide</span></span></a>' +
      '<div class="lr-glabel">Your learning path</div>';
    PAGES.forEach(function (p) {
      var active = p.href === here ? " active" : "";
      html += '<a class="lr-link' + active + '" href="' + p.href + '">' +
        '<span class="n">' + p.num + "</span><span>" + p.title + "</span></a>";
    });
    side.innerHTML = html;
    document.body.appendChild(side);

    var menu = document.createElement("button");
    menu.className = "lr-menu"; menu.setAttribute("aria-label", "Menu"); menu.textContent = "☰";
    var backdrop = document.createElement("div"); backdrop.className = "lr-backdrop";
    menu.addEventListener("click", function () { document.body.classList.toggle("lr-open"); });
    backdrop.addEventListener("click", function () { document.body.classList.remove("lr-open"); });
    document.body.appendChild(menu); document.body.appendChild(backdrop);

    buildToc();
  }

  function slug(t) {
    return t.toLowerCase().replace(/[^\w]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 50) || "section";
  }

  function buildToc() {
    var scope = document.querySelector(".wrap") || document.body;
    var heads = [].slice.call(scope.querySelectorAll("h2, h3"));
    if (!heads.length) return;
    var rail = document.createElement("nav");
    rail.className = "lr-tocrail";
    var items = '<div class="t">On this page</div>';
    var used = {};
    heads.forEach(function (h) {
      if (!h.id) {
        var s = slug(h.textContent); var base = s, i = 2;
        while (used[s] || document.getElementById(s)) { s = base + "-" + i++; }
        used[s] = 1; h.id = s;
      }
      h.style.scrollMarginTop = "72px";
      var txt = h.textContent.replace(/^\s*\d+[\.\)]\s*/, "");
      items += '<a href="#' + h.id + '" data-toc="' + h.id + '"' +
        (h.tagName === "H3" ? ' class="lvl3"' : "") + ">" + txt + "</a>";
    });
    rail.innerHTML = items;
    document.body.appendChild(rail);

    var links = [].slice.call(rail.querySelectorAll("[data-toc]"));
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          links.forEach(function (l) { l.classList.toggle("active", l.getAttribute("data-toc") === en.target.id); });
        }
      });
    }, { rootMargin: "-72px 0px -72% 0px" });
    heads.forEach(function (h) { obs.observe(h); });
  }
})();
