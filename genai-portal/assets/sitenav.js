/* =========================================================================
   GenAI Learning Hub — Unified site navigation (Option C)
   ONE sidebar shared by every page across all folders. Content stays grouped
   and visually distinct by source folder; nothing is flattened into a single
   mixed list. No iframes — every link is a normal navigation.

   This module owns the sidebar (.nav) and the cross-site search box. It builds
   from a single central registry of GROUPS → pages, each page carrying a
   canonical path relative to the SITE ROOT (the folder that contains
   genai-portal/, learn-rag-mcp/ and teach-agents/). At run time it detects how
   deep the current page sits and rewrites every href with the right number of
   "../" hops, so the same registry works from any folder.

   The page's existing controller (app.js or portal-page.js) still handles
   theme, right-rail TOC, copy buttons, quizzes and the mobile drawer — they
   just no longer build the sidebar (this does).
   Pure vanilla JS, no deps, offline-safe.
   ========================================================================= */
(function () {
  "use strict";

  /* ---------- Central registry (paths are relative to the SITE ROOT) ---------- */
  var GROUPS = [
    {
      id: "mastery",
      label: "GenAI Mastery",
      mark: "G",
      blurb: "DS → Senior GenAI Engineer",
      home: "genai-portal/index.html",
      pages: [
        { path: "genai-portal/index.html", title: "Overview", num: "✦", kw: "home overview curriculum start hub" },
        // Foundations
        { path: "genai-portal/modules/01_foundations.html", title: "Foundations of LLMs", num: "01", track: "Foundations", kw: "llm token transformer attention prompt context window temperature decoding next token prediction" },
        { path: "genai-portal/modules/02_transformers.html", title: "Transformers Deep Dive", num: "02", track: "Foundations", kw: "transformer attention self-attention multi-head positional encoding qkv softmax feedforward residual layernorm" },
        { path: "genai-portal/modules/03_local_llms.html", title: "Local LLMs & Ollama", num: "03", track: "Foundations", kw: "ollama local llama qwen gemma quantization gguf gpu vram modelfile" },
        // Retrieval
        { path: "genai-portal/modules/04_embeddings.html", title: "Embeddings", num: "04", track: "Retrieval", kw: "embedding vector cosine similarity semantic dense sparse sentence-transformers" },
        { path: "genai-portal/modules/05_vector_databases.html", title: "Vector Databases", num: "05", track: "Retrieval", kw: "vector database faiss qdrant pgvector hnsw ann index recall" },
        { path: "genai-portal/modules/06_rag_basics.html", title: "RAG Basics", num: "06", track: "Retrieval", kw: "rag retrieval augmented generation chunking context grounding" },
        { path: "genai-portal/modules/07_advanced_rag.html", title: "Advanced RAG", num: "07", track: "Retrieval", kw: "hybrid search reranking query expansion parent document graph rag agentic rag context compression" },
        // Agents
        { path: "genai-portal/modules/08_agents.html", title: "Agentic AI", num: "08", track: "Agents", kw: "agent react tool calling planning reflection memory loop" },
        { path: "genai-portal/modules/09_mcp.html", title: "Model Context Protocol", num: "09", track: "Agents", kw: "mcp model context protocol server client tool resource prompt" },
        { path: "genai-portal/modules/13_multi_agents.html", title: "Multi-Agent Systems", num: "13", track: "Agents", kw: "crewai multi agent orchestration supervisor handoff" },
        // Frameworks
        { path: "genai-portal/modules/10_langchain.html", title: "LangChain", num: "10", track: "Frameworks", kw: "langchain lcel chains runnable retriever memory" },
        { path: "genai-portal/modules/11_llamaindex.html", title: "LlamaIndex", num: "11", track: "Frameworks", kw: "llamaindex index node document query engine" },
        { path: "genai-portal/modules/12_langgraph.html", title: "LangGraph", num: "12", track: "Frameworks", kw: "langgraph state node edge conditional routing parallel human in the loop" },
        // Production
        { path: "genai-portal/modules/14_production_genai.html", title: "Production GenAI", num: "14", track: "Production", kw: "observability tracing cost guardrails rate limiting evaluation testing security" },
        { path: "genai-portal/modules/15_capstone_projects.html", title: "Capstone Projects", num: "15", track: "Production", kw: "capstone project pdf rag sql agent elasticsearch mcp multi-agent enterprise" }
      ]
    },
    {
      id: "agents",
      label: "Understanding AI Agents",
      mark: "A",
      blurb: "Agent Literacy course",
      home: "teach-agents/index.html",
      pages: [
        { path: "teach-agents/index.html", title: "Course index", num: "✦", kw: "agents course overview index start" },
        { path: "teach-agents/lessons/0001-what-is-an-agent.html", title: "What is an agent?", num: "01", kw: "agent definition loop tools chatbot" },
        { path: "teach-agents/lessons/0002-run-your-first-agent.html", title: "Run your first agent", num: "02", kw: "run agent python gemini hands-on first" },
        { path: "teach-agents/lessons/0003-prediction-vs-threshold.html", title: "Prediction vs. threshold", num: "03", kw: "prediction threshold forecast z-score anomaly" },
        { path: "teach-agents/lessons/0004-orchestration.html", title: "Orchestration", num: "04", kw: "orchestration chain anomaly rca remediation multi-agent" },
        { path: "teach-agents/lessons/0005-workflow-vs-agent.html", title: "Workflow vs. agent", num: "05", kw: "workflow autonomous agent shape decide" },
        { path: "teach-agents/lessons/0006-mapping-any-enm-row.html", title: "Mapping any EnM row", num: "06", kw: "mapping enm row decompose capstone method" },
        { path: "teach-agents/reference/agent-glossary.html", title: "Agent glossary", num: "📖", kw: "glossary reference terms lookup" }
      ]
    },
    {
      id: "ragmcp",
      label: "RAG · MCP · Agents · LLMs",
      mark: "R",
      blurb: "Hands-on guide",
      home: "learn-rag-mcp/index.html",
      pages: [
        { path: "learn-rag-mcp/index.html", title: "Guide home", num: "✦", kw: "rag mcp guide overview home index" },
        { path: "learn-rag-mcp/01-llms.html", title: "LLMs — The Foundation", num: "01", kw: "llm token context window prediction hallucination temperature prompt" },
        { path: "learn-rag-mcp/02-rag.html", title: "RAG — Retrieval-Augmented Generation", num: "02", kw: "rag retrieval embedding chunk vector grounding" },
        { path: "learn-rag-mcp/03-agents.html", title: "Agents & Tool Use", num: "03", kw: "agent tool loop react planning function calling" },
        { path: "learn-rag-mcp/04-mcp.html", title: "MCP — Model Context Protocol", num: "04", kw: "mcp protocol server client tools resources" },
        { path: "learn-rag-mcp/05-build-simple-rag.html", title: "Build: A Simple RAG App", num: "05", kw: "build rag project simple embeddings" },
        { path: "learn-rag-mcp/06-build-pdf-qna.html", title: "Build: PDF Q&A RAG App", num: "06", kw: "pdf qna question answering rag chunk" },
        { path: "learn-rag-mcp/07-eda-agent-ollama.html", title: "Build: EDA Agent with Ollama", num: "07", kw: "eda agent ollama local pandas analysis" }
      ]
    },
    {
      id: "deepdives",
      label: "Deep Dives",
      mark: "D",
      blurb: "Focused topic guides",
      home: "genai-portal/rag-deep-dive.html",
      pages: [
        { path: "genai-portal/rag-deep-dive.html", title: "RAG, End-to-End", num: "📚", kw: "rag pipeline chunking reranking retrieval evaluation end to end" },
        { path: "genai-portal/langfuse.html", title: "Langfuse — Observability", num: "📡", kw: "langfuse observability trace cost latency quality scores" },
        { path: "genai-portal/guardrails.html", title: "Guardrails", num: "🛡️", kw: "guardrails safety scope pii hallucination policy" },
        { path: "genai-portal/memory.html", title: "Memory in LLMs", num: "🧠", kw: "memory context window stateless chat history" },
        { path: "genai-portal/langgraph.html", title: "LangGraph & components", num: "🕸️", kw: "langgraph state node edge checkpointer human in the loop" },
        { path: "genai-portal/claude-agent.html", title: "How a Claude Agent Works", num: "🤖", kw: "claude agent sdk tool runner loop context safety" },
        { path: "genai-portal/hermes.html", title: "Hermes — open local models", num: "🔱", kw: "hermes nous ollama open function calling local models" }
      ]
    }
  ];

  /* ---------- Locate this page within the registry & compute depth ---------- */
  // Normalise the current path to a site-root-relative form by matching the
  // tail against known registry paths. We compare by the last 1-3 segments.
  var loc = location.pathname.replace(/\\/g, "/");
  var here = loc.substring(loc.lastIndexOf("/") + 1) || "index.html";
  // segments after the site root are unknown, so identify the current page by
  // matching folder + file against registry entries.
  var folder = (function () {
    var parts = loc.split("/").filter(Boolean);
    return parts.length >= 2 ? parts[parts.length - 2] : "";
  })();

  function isCurrent(pagePath) {
    var segs = pagePath.split("/");
    var file = segs[segs.length - 1];
    var dir = segs.length >= 2 ? segs[segs.length - 2] : "";
    if (file !== here) return false;
    // disambiguate index.html (exists in 3 folders) by the parent folder
    if (file === "index.html") return dir === folder;
    return true;
  }

  // How many "../" to reach the site root from the current page.
  // Depth = number of path segments below the site root - 1 (for the file).
  // We can't know the absolute root, so derive it from the matched current page.
  var current = null, currentGroup = null;
  GROUPS.forEach(function (g) {
    g.pages.forEach(function (p) { if (isCurrent(p.path)) { current = p; currentGroup = g; } });
  });
  // Fallback: if not found (new/unknown page), assume genai-portal/ depth.
  var currentPathFromRoot = current ? current.path : (folder ? folder + "/" + here : here);
  var depth = currentPathFromRoot.split("/").length - 1;   // dirs above the file
  var UP = depth > 0 ? new Array(depth + 1).join("../") : "";

  function href(pagePath) { return UP + pagePath; }

  /* ---------- Build the grouped sidebar ---------- */
  function trackChunks(pages) {
    // group a section's pages by their optional `track`, preserving order
    var out = [], seen = {};
    pages.forEach(function (p) {
      var t = p.track || "";
      if (!seen[t]) { seen[t] = { track: t, items: [] }; out.push(seen[t]); }
      seen[t].items.push(p);
    });
    return out;
  }

  function buildSidebar() {
    var nav = document.querySelector(".nav");
    if (!nav) return;
    var html = "";
    GROUPS.forEach(function (g) {
      var open = (g === currentGroup);
      html += '<div class="navgroup' + (open ? " open" : "") + '" data-group="' + g.id + '">';
      html += '<button class="navgroup-head" aria-expanded="' + (open ? "true" : "false") + '">' +
                '<span class="ng-mk">' + g.mark + '</span>' +
                '<span class="ng-label">' + g.label + '</span>' +
                '<svg class="ng-chev" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 6l6 6-6 6"/></svg>' +
                '</button>';
      html += '<div class="navgroup-body">';
      trackChunks(g.pages).forEach(function (chunk) {
        if (chunk.track) html += '<div class="nav-track">' + chunk.track + '</div>';
        chunk.items.forEach(function (p) {
          var active = isCurrent(p.path) ? " active" : "";
          html += '<a class="nav-item' + active + '" href="' + href(p.path) + '">' +
                  '<span class="num">' + p.num + '</span><span class="nt">' + p.title + '</span></a>';
        });
      });
      html += '</div></div>';
    });
    nav.innerHTML = html;
    nav.classList.add("sitenav");

    // collapse/expand
    nav.querySelectorAll(".navgroup-head").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var grp = btn.closest(".navgroup");
        var nowOpen = grp.classList.toggle("open");
        btn.setAttribute("aria-expanded", nowOpen ? "true" : "false");
      });
    });

    // close mobile drawer when a link is chosen (app.js/portal-page.js read .app.nav-open)
    var app = document.querySelector(".app");
    if (app) nav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { app.classList.remove("nav-open"); });
    });
  }

  /* ---------- Cross-site search (searches ALL groups) ---------- */
  function setupSearch() {
    var input = document.querySelector("[data-search]") || document.querySelector("[data-secsearch]");
    var out = document.querySelector(".search-results") || document.querySelector("[data-secresults]");
    if (!input || !out) return;
    // flatten registry for searching, remembering each page's group label
    var index = [];
    GROUPS.forEach(function (g) {
      g.pages.forEach(function (p) { index.push({ p: p, group: g.label }); });
    });
    function esc(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
    function render(q) {
      q = q.trim().toLowerCase();
      if (!q) { out.innerHTML = ""; return; }
      var hits = index.map(function (rec) {
        var hay = (rec.p.title + " " + rec.group + " " + (rec.p.kw || "")).toLowerCase();
        var score = 0;
        if (rec.p.title.toLowerCase().indexOf(q) > -1) score += 10;
        q.split(/\s+/).forEach(function (w) { if (w && hay.indexOf(w) > -1) score += 1; });
        return { rec: rec, score: score };
      }).filter(function (x) { return x.score > 0; })
        .sort(function (a, b) { return b.score - a.score; }).slice(0, 8);
      if (!hits.length) { out.innerHTML = '<div class="search-empty">No results for "' + q + '"</div>'; return; }
      out.innerHTML = hits.map(function (h) {
        var p = h.rec.p;
        var t = p.title.replace(new RegExp("(" + esc(q) + ")", "i"), "<b>$1</b>");
        return '<a class="search-result" href="' + href(p.path) + '">' +
               '<span class="sr-group">' + h.rec.group + '</span>' + t + "</a>";
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

  /* ---------- Brand link → this section's home (or hub root) ---------- */
  function fixBrand() {
    var brandLink = document.querySelector(".brand a, a.brand");
    if (brandLink) brandLink.setAttribute("href", href("genai-portal/index.html"));
  }

  /* ---------- Footer credit (subtle, on every page) ---------- */
  function injectFooter() {
    var content = document.querySelector(".content");
    if (!content || content.querySelector(".site-footer")) return;
    var year = new Date().getFullYear();
    var f = document.createElement("footer");
    f.className = "site-footer";
    f.innerHTML =
      '<span>© ' + year + ' GenAI Learning Hub</span>' +
      '<span class="sep">·</span>' +
      '<span>Developed by Deepankar Kotnala</span>';
    content.appendChild(f);
  }

  /* ---------- ☰ button: collapse the sidebar on desktop, open the drawer on
     mobile. The desktop collapse choice is remembered across pages/visits. ---- */
  var LS_SIDEBAR = "gp.sidebar";        // "collapsed" | "open"
  var MOBILE_BP = 860;                  // matches the CSS breakpoint

  function isMobile() { return window.matchMedia("(max-width: " + MOBILE_BP + "px)").matches; }

  function setupSidebarToggle() {
    var app = document.querySelector(".app");
    var menu = document.querySelector(".menu-btn");
    if (!app) return;

    // Restore the saved desktop state (only affects desktop; mobile uses the drawer).
    try {
      if (localStorage.getItem(LS_SIDEBAR) === "collapsed") app.classList.add("sidebar-collapsed");
    } catch (e) {}

    if (menu) {
      menu.setAttribute("aria-label", "Toggle navigation");
      menu.addEventListener("click", function () {
        if (isMobile()) {
          app.classList.toggle("nav-open");        // slide-in drawer
        } else {
          var collapsed = app.classList.toggle("sidebar-collapsed");
          try { localStorage.setItem(LS_SIDEBAR, collapsed ? "collapsed" : "open"); } catch (e) {}
        }
      });
    }

    // If the user crosses the breakpoint, make sure the mobile drawer isn't left open.
    window.addEventListener("resize", function () {
      if (!isMobile()) app.classList.remove("nav-open");
    });
  }

  /* ---------- Smooth page transitions ----------
     A subtle fade-out → navigate → fade-in between same-site pages. Where the
     browser supports the View Transitions API we use a true crossfade; elsewhere
     we fall back to fading the content out (CSS .is-leaving) before navigating,
     and the CSS page-enter animation fades the next page in. Honors
     prefers-reduced-motion and never interferes with normal browser behaviour. */
  var REDUCED_MOTION = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function isPlainLeftClick(e) {
    return e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;
  }

  function shouldIntercept(a, e) {
    if (!a || !isPlainLeftClick(e) || e.defaultPrevented) return false;
    if (a.target && a.target !== "" && a.target !== "_self") return false;   // new tab/window
    if (a.hasAttribute("download")) return false;
    var href = a.getAttribute("href");
    if (!href || href.charAt(0) === "#") return false;                       // in-page anchor
    if (/^(mailto:|tel:|javascript:)/i.test(href)) return false;
    // resolve to compare origin + path
    var url;
    try { url = new URL(a.href, location.href); } catch (e2) { return false; }
    if (url.origin !== location.origin) return false;                        // external site
    // same document (only the hash differs) → let the browser handle it
    if (url.pathname === location.pathname && url.search === location.search) return false;
    // only animate navigations to our own .html pages (or directory roots)
    if (!/\.html?$|\/$/.test(url.pathname)) return false;
    return url.href;
  }

  function setupPageTransitions() {
    if (REDUCED_MOTION) return;   // respect the user's preference — no transitions

    // Any browser with the View Transitions API handles the transition via CSS
    // (`@view-transition`), and the CSS gates the JS-fallback styling behind
    // `@supports not (view-transition-name)`. So if VT is supported at all, the
    // JS fade would either double up or have no styling to apply — skip it and
    // keep the two paths perfectly aligned with the CSS.
    var hasVT = (window.CSS && CSS.supports && CSS.supports("view-transition-name: none"));
    if (hasVT) return;

    document.addEventListener("click", function (e) {
      var a = e.target.closest && e.target.closest("a[href]");
      var dest = shouldIntercept(a, e);
      if (!dest) return;
      e.preventDefault();
      // Fade the content out, then navigate; the next page's CSS page-enter
      // animation fades it in — giving a smooth out→in between pages.
      document.documentElement.classList.add("is-leaving");
      window.setTimeout(function () { window.location.href = dest; }, 180);
    });

    // Safety net: if navigation is somehow cancelled, or the page is restored
    // from the back/forward cache, clear the leaving state so it isn't stuck
    // faded out.
    window.addEventListener("pageshow", function () {
      document.documentElement.classList.remove("is-leaving");
    });
  }

  function init() { buildSidebar(); setupSearch(); fixBrand(); injectFooter(); setupSidebarToggle(); setupPageTransitions(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();

  // expose for debugging / other scripts
  window.SiteNav = { groups: GROUPS, href: href, current: current, currentGroup: currentGroup };
})();
