/* =========================================================================
   GenAI Mastery Portal - App Logic
   Theme toggle · search · quizzes · copy · demos · TOC
   Pure vanilla JS. No dependencies. Works offline.
   ========================================================================= */
(function () {
  "use strict";

  /* ---------- Module registry (used by search + sidebar + progress) ---------- */
  const MODULES = [
    { id: "00", file: "index.html", title: "Home", track: "", path: "index.html" },
    { id: "01", file: "01_foundations.html", title: "Foundations of LLMs", track: "Foundations",
      kw: "llm large language model token transformer attention prompt context window temperature decoding sampling next token prediction" },
    { id: "02", file: "02_transformers.html", title: "Transformers Deep Dive", track: "Foundations",
      kw: "transformer attention self-attention multi-head positional encoding qkv softmax feedforward residual layernorm" },
    { id: "03", file: "03_local_llms.html", title: "Local LLMs & Ollama", track: "Foundations",
      kw: "ollama local llama qwen gemma quantization gguf gpu vram modelfile" },
    { id: "04", file: "04_embeddings.html", title: "Embeddings", track: "Retrieval",
      kw: "embedding vector cosine similarity semantic dense sparse sentence-transformers" },
    { id: "05", file: "05_vector_databases.html", title: "Vector Databases", track: "Retrieval",
      kw: "vector database faiss qdrant pgvector hnsw ann index recall" },
    // One RAG page, and it lives at the site root rather than under modules/.
    // `atRoot` tells the grid and the fallback sidebar not to resolve it
    // relative to the modules folder. See buildIndexGrid / buildSidebar.
    { id: "06", file: "rag-deep-dive.html", title: "RAG, End-to-End", track: "Retrieval", atRoot: true,
      kw: "rag retrieval augmented generation chunking context grounding citations hybrid search reranking query expansion parent document graph rag agentic rag evaluation" },
    { id: "08", file: "08_agents.html", title: "Agentic AI", track: "Agents",
      kw: "agent react tool calling planning reflection memory loop" },
    { id: "09", file: "09_mcp.html", title: "Model Context Protocol", track: "Agents",
      kw: "mcp model context protocol server client tool resource prompt fastapi elasticsearch" },
    { id: "10", file: "10_langchain.html", title: "LangChain", track: "Frameworks",
      kw: "langchain lcel chains runnable retriever memory" },
    { id: "11", file: "11_llamaindex.html", title: "LlamaIndex", track: "Frameworks",
      kw: "llamaindex index node document query engine" },
    { id: "12", file: "12_langgraph.html", title: "LangGraph", track: "Frameworks",
      kw: "langgraph state node edge conditional routing parallel human in the loop asyncio pydantic ainvoke astream taskgroup validation" },
    { id: "13", file: "13_multi_agents.html", title: "Multi-Agent Systems", track: "Agents",
      kw: "crewai multi agent orchestration supervisor handoff" },
    { id: "14", file: "14_production_genai.html", title: "Production GenAI", track: "Production",
      kw: "observability tracing cost guardrails rate limiting evaluation testing security" },
    { id: "15", file: "15_capstone_projects.html", title: "Capstone Projects", track: "Production",
      kw: "capstone project pdf rag sql agent elasticsearch mcp multi-agent enterprise" },
  ];

  const TRACKS = ["Foundations", "Retrieval", "Agents", "Frameworks", "Production"];
  const LS_THEME = "gp.theme";

  function safeGet(key) { try { return localStorage.getItem(key); } catch (e) { return null; } }
  function safeSet(key, value) { try { localStorage.setItem(key, value); } catch (e) {} }

  /* ---------- Theme ---------- */
  function getTheme() {
    return safeGet(LS_THEME) || "light";
  }
  function applyTheme(t) {
    document.documentElement.setAttribute("data-theme", t);
    safeSet(LS_THEME, t);
    const btn = document.querySelector("[data-theme-toggle]");
    if (btn) btn.innerHTML = t === "dark"
      ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/></svg>'
      : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';
  }
  // apply ASAP
  document.documentElement.setAttribute("data-theme", getTheme());

  /* ---------- Build sidebar ----------
     The unified sidebar is now owned by sitenav.js (shared across the whole
     site). When it is present we skip app.js's own module-only sidebar so the
     two don't fight over .nav. Kept as a fallback for any page without sitenav. */
  function buildSidebar() {
    if (window.SiteNav) return;                       // unified nav present → it owns .nav
    const nav = document.querySelector(".nav");
    if (!nav) return;
    const cur = document.body.getAttribute("data-page") || "";
    let html = `<a href="index.html" class="${cur === '00' ? 'active' : ''}"><span class="num">＊</span> Overview</a>`;
    TRACKS.forEach(track => {
      html += `<div class="nav-group-label">${track}</div>`;
      MODULES.filter(m => m.track === track).forEach(m => {
        const active = m.id === cur ? "active" : "";
        const file = m.atRoot ? `../${m.file}` : m.file;   // this fallback runs from modules/
        html += `<a href="${file}" class="${active}"><span class="num">${m.id}</span> ${m.title}</a>`;
      });
    });
    nav.innerHTML = html;
  }

  /* ---------- Search ----------
     sitenav.js provides cross-site search; defer to it when present. */
  function setupSearch() {
    if (window.SiteNav) return;                       // unified search present
    const input = document.querySelector("[data-search]");
    const out = document.querySelector(".search-results");
    if (!input || !out) return;
    function render(q) {
      q = q.trim().toLowerCase();
      if (!q) { out.innerHTML = ""; return; }
      const hits = MODULES.filter(m => m.id !== "00").map(m => {
        const hay = (m.title + " " + (m.kw || "")).toLowerCase();
        let score = 0;
        if (m.title.toLowerCase().includes(q)) score += 10;
        q.split(/\s+/).forEach(w => { if (hay.includes(w)) score += 1; });
        return { m, score };
      }).filter(x => x.score > 0).sort((a, b) => b.score - a.score).slice(0, 7);
      if (!hits.length) { out.innerHTML = `<div class="search-empty">No results for "${q}"</div>`; return; }
      out.innerHTML = hits.map(({ m }) => {
        const t = m.title.replace(new RegExp("(" + q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "i"), "<b>$1</b>");
        return `<a class="search-result" href="${m.file}"><b style="color:var(--text-muted);font-family:var(--font-mono);font-size:11px">${m.id}</b> &nbsp;${t}</a>`;
      }).join("");
    }
    input.addEventListener("input", e => render(e.target.value));
    // keyboard: / focuses search
    document.addEventListener("keydown", e => {
      if (e.key === "/" && document.activeElement !== input && !/input|textarea/i.test(document.activeElement.tagName)) {
        e.preventDefault(); input.focus();
      }
      if (e.key === "Escape") { input.blur(); out.innerHTML = ""; }
    });
  }

  /* ---------- Textbook-style chapter contents (auto from h2) ---------- */
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
      .replace(/mini project\s*[ - –-].*$/i, "Mini project")
      .replace(/real project connection/i, "Project context")
      .replace(/executive summary/i, "Summary")
      .trim();
  }

  function escapeTOCText(text) {
    return text.replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
  }

  function buildTOC() {
    const rail = document.querySelector(".toc");
    const content = document.querySelector(".content");
    if (!rail || !content) return;
    /* A term dialog carries an <h2> for its accessible name, and those dialogs
       live inside .content - so an unfiltered query lists every definition as a
       chapter section. Section headings are the ones in the document flow. */
    const heads = [...content.querySelectorAll("h2[id]")].filter(h => !h.closest("dialog"));
    if (!heads.length) { const r = document.querySelector(".toc-rail"); if (r) r.style.display = "none"; return; }

    rail.classList.add("toc-textbook");
    rail.innerHTML = `
      <div class="toc-book-head">
        <div><span class="toc-kicker">On this page</span><strong>${heads.length} ${heads.length === 1 ? "section" : "sections"}</strong></div>
        <button class="toc-top" type="button" aria-label="Back to chapter top" title="Back to top">↑</button>
      </div>
      <label class="toc-filter">
        <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"></circle><path d="m16 16 4 4"></path></svg>
        <input type="search" placeholder="Find on this page" aria-label="Find on this page">
      </label>
      <div class="toc-list">${heads.map((h, index) => {
        const full = h.textContent.trim();
        const match = full.match(/^\s*(\d+)\s*[.·)]\s*/);
        const num = String(match ? match[1] : index + 1).padStart(2, "0");
        const label = compactTOCLabel(full);
        return `<a href="#${h.id}" data-toc="${h.id}" title="${escapeTOCText(full)}"><span class="toc-num">${num}</span><span class="toc-label">${escapeTOCText(label)}</span></a>`;
      }).join("")}<div class="toc-empty" hidden>No matching topic</div></div>`;

    // Compact "Jump to section" toggle - only shown on narrow screens (CSS).
    // Turns the section list into a tap-to-open dropdown instead of a
    // horizontal side-scrolling strip that blocks the page on mobile.
    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "toc-toggle";
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Jump to a section on this page");
    toggle.innerHTML =
      '<svg class="toc-toggle-ico" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>' +
      '<span class="toc-toggle-label">Jump to section</span>' +
      '<svg class="toc-toggle-caret" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>';
    rail.insertBefore(toggle, rail.firstChild);

    const links = [...rail.querySelectorAll("[data-toc]")];
    const filter = rail.querySelector(".toc-filter input");
    const empty = rail.querySelector(".toc-empty");
    const top = rail.querySelector(".toc-top");

    function setTocOpen(open) {
      rail.classList.toggle("toc-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    }
    toggle.addEventListener("click", event => {
      event.stopPropagation();
      setTocOpen(!rail.classList.contains("toc-open"));
    });
    /* Smooth jump, as in interview_prep: the page keeps scroll-behavior auto
       (so find-in-page and restored positions stay instant) and a rail click
       glides to its section instead. The heading's scroll-margin-top keeps it
       clear of the sticky bar. */
    const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)");
    links.forEach(link => link.addEventListener("click", event => {
      setTocOpen(false);
      flash(link);
      const target = document.getElementById(link.getAttribute("data-toc"));
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ block: "start", behavior: reduceMotion && reduceMotion.matches ? "auto" : "smooth" });
      // Keep the URL shareable; a history error (sandboxed file://) must not block the scroll.
      try { history.replaceState(null, "", "#" + target.id); } catch (err) {}
    }));
    document.addEventListener("click", event => { if (!rail.contains(event.target)) setTocOpen(false); });
    document.addEventListener("keydown", event => { if (event.key === "Escape") setTocOpen(false); });

    if (top) top.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
    if (filter) filter.addEventListener("input", () => {
      const query = filter.value.trim().toLowerCase();
      let shown = 0;
      links.forEach(link => {
        const visible = !query || link.textContent.toLowerCase().includes(query) || (link.title || "").toLowerCase().includes(query);
        link.hidden = !visible;
        if (visible) shown += 1;
      });
      if (empty) empty.hidden = shown !== 0;
    });

    // No scroll spy - matched to the interview_prep portal: reading the page
    // never lights up the rail. A click flashes the chosen row: it eases in,
    // holds briefly, then fades out (the slower fade lives on .toc-fade in
    // office-theme.css).
    let flashTimer = null, fadeTimer = null;
    function flash(link) {
      clearTimeout(flashTimer); clearTimeout(fadeTimer);
      links.forEach(l => l.classList.remove("active", "toc-fade"));
      void link.offsetWidth; // restart the ease-in on a repeat click
      link.classList.add("active");
      flashTimer = setTimeout(() => {
        link.classList.add("toc-fade");
        link.classList.remove("active");
        fadeTimer = setTimeout(() => link.classList.remove("toc-fade"), 1000);
      }, 1600);
    }
    /* Mobile auto-hide: a downward scroll slides the "Jump to section" bar away,
       and the first pixel of upward scroll brings it back. Near the top of the
       page it always shows. The class only has an effect at <=980px (CSS). */
    (function () {
      var mq = window.matchMedia ? window.matchMedia("(max-width: 980px)") : null;
      var lastY = Math.max(0, window.scrollY || 0), down = 0, ticking = false, hidden = false;
      function setHidden(h) {
        if (h === hidden) return;
        hidden = h;
        (rail.closest(".toc-rail") || rail).classList.toggle("toc-rail-hidden", h);
        if (h) setTocOpen(false);
      }
      function evaluate() {
        ticking = false;
        var max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
        var y = Math.min(max, Math.max(0, window.scrollY || 0)); /* ignore iOS overscroll bounce */
        var delta = y - lastY;
        lastY = y;
        if (mq && !mq.matches) { down = 0; setHidden(false); return; }
        if (y <= 80 || delta < 0) { down = 0; setHidden(false); return; }
        if (delta > 0) { down += delta; if (down > 12) setHidden(true); }
      }
      window.addEventListener("scroll", function () {
        if (!ticking) { ticking = true; window.requestAnimationFrame(evaluate); }
      }, { passive: true });
    })();
    initTocResizer();
  }

  /* ---------- right rail resizer ----------
     Matches interview_prep portal: mounted on document.body as .sidebar-resizer.right-resizer
     Operates on --toc-w, clamped between 160px and 500px. */
  function initTocResizer() {
    var rail = document.querySelector(".toc-rail");
    if (!rail) return;
    if (document.querySelector(".sidebar-resizer.right-resizer, .toc-resizer")) return;

    var handle = document.createElement("div");
    handle.className = "sidebar-resizer right-resizer toc-resizer";
    handle.setAttribute("role", "separator");
    handle.setAttribute("aria-orientation", "vertical");
    handle.setAttribute("aria-label", "Resize table of contents");
    handle.setAttribute("title", "Drag to resize table of contents. Double-click to reset.");
    handle.tabIndex = 0;
    document.body.appendChild(handle);

    var LS_KEY = "gp.toc.width";
    var MIN_W = 160;
    var MAX_W = 500;
    var DEFAULT_W = 250; // 15.625rem
    var KEY_STEP = 16;
    var current = DEFAULT_W;
    var isResizingRight = false;

    function clampW(v) { return Math.max(MIN_W, Math.min(MAX_W, Math.round(v))); }

    function applyW(value, persist) {
      current = clampW(value);
      document.documentElement.style.setProperty("--toc-w", current + "px");
      handle.setAttribute("aria-valuenow", String(current));
      handle.setAttribute("aria-valuetext", current + " pixels wide");
      if (persist) {
        try { localStorage.setItem(LS_KEY, String(current)); } catch (e) {}
      }
    }

    try {
      var saved = parseInt(localStorage.getItem(LS_KEY), 10);
      if (Number.isFinite(saved)) current = saved;
    } catch (e) {}
    applyW(current, false);

    handle.addEventListener("mousedown", function (e) {
      if (e.button !== 0) return;
      isResizingRight = true;
      document.body.classList.add("resizing-right", "resizing-toc");
      e.preventDefault();
    });

    window.addEventListener("mousemove", function (e) {
      if (isResizingRight) {
        var w = window.innerWidth - e.clientX;
        applyW(w, false);
      }
    });

    window.addEventListener("mouseup", function () {
      if (isResizingRight) {
        isResizingRight = false;
        document.body.classList.remove("resizing-right", "resizing-toc");
        applyW(current, true);
      }
    });

    handle.addEventListener("dblclick", function () {
      applyW(DEFAULT_W, true);
    });

    handle.addEventListener("keydown", function (ev) {
      var next = current;
      if (ev.key === "ArrowLeft") next += KEY_STEP;
      else if (ev.key === "ArrowRight") next -= KEY_STEP;
      else if (ev.key === "Home") next = MAX_W;
      else if (ev.key === "End") next = MIN_W;
      else return;
      ev.preventDefault();
      applyW(next, true);
    });
  }

  /* ---------- Copy buttons ---------- */
  function setupCopy() {
    document.querySelectorAll(".code-block").forEach(block => {
      const btn = block.querySelector(".copy-btn");
      const code = block.querySelector("code");
      if (!btn || !code) return;
      btn.addEventListener("click", () => {
        const text = code.innerText;
        navigator.clipboard.writeText(text).then(() => {
          btn.textContent = "Copied!"; btn.classList.add("copied");
          setTimeout(() => { btn.textContent = "Copy"; btn.classList.remove("copied"); }, 1600);
        }).catch(() => {
          const ta = document.createElement("textarea"); ta.value = text; document.body.appendChild(ta);
          ta.select(); try { document.execCommand("copy"); } catch (e) {} ta.remove();
          btn.textContent = "Copied!"; btn.classList.add("copied");
          setTimeout(() => { btn.textContent = "Copy"; btn.classList.remove("copied"); }, 1600);
        });
      });
    });
  }

  /* ---------- Quizzes ---------- */
  function setupQuizzes() {
    document.querySelectorAll(".quiz").forEach(quiz => {
      const opts = [...quiz.querySelectorAll(".opt")];
      const explain = quiz.querySelector(".explain");
      let answered = false;
      opts.forEach(opt => {
        opt.addEventListener("click", () => {
          if (answered) return;
          answered = true;
          const correct = opt.dataset.correct === "true";
          opt.classList.add(correct ? "correct" : "wrong");
          if (!correct) {
            const right = opts.find(o => o.dataset.correct === "true");
            if (right) right.classList.add("correct");
          }
          if (explain) explain.classList.add("show");
        });
      });
    });
  }

  /* ---------- Mobile nav ----------
     The ☰ button itself is wired by sitenav.js (it collapses the sidebar on
     desktop and opens the drawer on mobile). Here we only handle the backdrop
     and closing the drawer when a nav link is clicked. When sitenav is present
     it owns the menu button entirely. */
  function setupMobileNav() {
    const app = document.querySelector(".app");
    if (!app) return;
    const menu = document.querySelector(".menu-btn");
    const backdrop = document.querySelector(".backdrop");
    if (menu && !window.SiteNav) menu.addEventListener("click", () => app.classList.toggle("nav-open"));
    if (backdrop) backdrop.addEventListener("click", () => app.classList.remove("nav-open"));
    document.querySelectorAll(".nav a").forEach(a => a.addEventListener("click", () => app.classList.remove("nav-open")));
  }

  /* ---------- Generic interactive demos (data-demo) ---------- */
  function setupDemos() {
    // Step reveal demo: button reveals chips one by one
    document.querySelectorAll("[data-stepdemo]").forEach(demo => {
      const btn = demo.querySelector("[data-run]");
      const chips = [...demo.querySelectorAll(".chip")];
      const reset = demo.querySelector("[data-reset]");
      function run() {
        chips.forEach((c, i) => { c.classList.remove("show"); setTimeout(() => c.classList.add("show"), 180 * (i + 1)); });
      }
      if (btn) btn.addEventListener("click", run);
      if (reset) reset.addEventListener("click", () => chips.forEach(c => c.classList.remove("show")));
    });

    // Embedding demo: text -> tokens -> vector bars
    document.querySelectorAll("[data-embed-demo]").forEach(demo => {
      const input = demo.querySelector("input");
      const btn = demo.querySelector("[data-run]");
      const stage = demo.querySelector("[data-stage]");
      function hash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0); }
      btn.addEventListener("click", () => {
        const text = (input.value || input.placeholder || "machine learning").trim();
        const tokens = text.toLowerCase().split(/\s+/).slice(0, 8);
        stage.innerHTML = "";
        // tokens
        const tokRow = document.createElement("div"); tokRow.className = "demo-stage";
        tokens.forEach((t, i) => { const c = document.createElement("span"); c.className = "chip tok"; c.textContent = t; tokRow.appendChild(c); setTimeout(() => c.classList.add("show"), 120 * i); });
        stage.appendChild(document.createElement("div")).innerHTML = "<small style='color:var(--text-muted)'>1 · Tokenize</small>";
        stage.appendChild(tokRow);
        // vector
        setTimeout(() => {
          const vlabel = document.createElement("div"); vlabel.innerHTML = "<small style='color:var(--text-muted)'>2 · Embed → vector (first 12 of 768 dims)</small>"; vlabel.style.marginTop = "14px"; stage.appendChild(vlabel);
          const seed = hash(text);
          const wrap = document.createElement("div"); wrap.style.maxWidth = "320px";
          for (let i = 0; i < 12; i++) {
            const v = ((Math.sin(seed * 0.001 + i * 1.3) + 1) / 2);
            const bar = document.createElement("div"); bar.className = "vecbar"; bar.style.width = "0";
            wrap.appendChild(bar); setTimeout(() => bar.style.width = (10 + v * 90).toFixed(0) + "%", 60 * i + 50);
          }
          stage.appendChild(wrap);
          const vlabel2 = document.createElement("div"); vlabel2.innerHTML = "<small style='color:var(--green)'>3 · Ready for cosine similarity search ✓</small>"; vlabel2.style.marginTop = "10px"; stage.appendChild(vlabel2);
        }, 120 * tokens.length + 200);
      });
    });
  }

  /* ---------- Reveal on scroll ---------- */
  function setupReveal() {
    const els = document.querySelectorAll("[data-reveal]");
    if (!els.length) return;
    const obs = new IntersectionObserver((entries, o) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("reveal"); o.unobserve(e.target); } });
    }, { threshold: 0.08 });
    els.forEach(el => obs.observe(el));
  }

  /* ---------- Theme toggle binding ---------- */
  function setupTheme() {
    applyTheme(getTheme());
    const btn = document.querySelector("[data-theme-toggle]");
    if (btn) btn.addEventListener("click", () => applyTheme(getTheme() === "dark" ? "light" : "dark"));
  }

  /* ---------- Index page: render module grid ---------- */
  function buildIndexGrid() {
    const host = document.querySelector("[data-module-grid]");
    if (!host) return;
    const descs = {
      "01": "How LLMs predict the next token, context windows, decoding, and where they fit in your stack.",
      "02": "Self-attention, multi-head attention, positional encoding - the engine inside every LLM.",
      "03": "Run models on your own hardware with Ollama. Qwen, Gemma, Llama, quantization & Modelfiles.",
      "04": "Turn text into vectors that capture meaning. The foundation of all semantic retrieval.",
      "05": "Store and search millions of vectors fast. FAISS, Qdrant, pgvector, HNSW & ANN tradeoffs.",
      "06": "The one RAG page: chunk → embed → retrieve → augment → generate, then hybrid search, reranking and evaluation.",
      "08": "ReAct, tool calling, planning, reflection, memory and the agent loop - with failure modes.",
      "09": "The USB-C of AI tooling. Build MCP servers/clients, expose tools, resources & prompts.",
      "10": "Compose LLM apps with LCEL, runnables, retrievers and memory the production way.",
      "11": "The data framework for RAG: indexes, nodes, query engines and retrievers.",
      "12": "Build stateful, cyclic agent graphs: state, nodes, edges, routing & human-in-the-loop.",
      "13": "Coordinate teams of agents with CrewAI and supervisor patterns. Handoffs & orchestration.",
      "14": "Observability, tracing, cost, guardrails, rate limiting, evaluation, security & testing.",
      "15": "Ten end-to-end builds from a local ChatGPT clone to an enterprise GenAI platform.",
    };
    let html = "";
    TRACKS.forEach(track => {
      html += `<div class="track-label"><span>${track}</span><div class="line"></div></div><div class="module-grid">`;
      MODULES.filter(m => m.track === track).forEach(m => {
        // data-root keeps index.html's path fixer from prefixing "modules/".
        html += `<a href="${m.file}" class="card hover module-card"${m.atRoot ? " data-root=\"1\"" : ""} data-reveal>
          <div class="mc-top"><span class="mc-num">Module ${m.id}</span><span class="pill">Open →</span></div>
          <h3>${m.title}</h3><p>${descs[m.id] || ""}</p></a>`;
      });
      html += `</div>`;
    });
    host.innerHTML = html;
  }

  /* ---------- Hub-home links (iframe-aware) ----------
     Single-topic pages (langfuse, guardrails, memory, langgraph, claude-agent,
     hermes, rag-deep-dive) are shown inside the hub's iframe. Their "Hub home"
     links point at the sibling index.html - but following that *inside* the
     iframe would load the whole hub nested inside itself. So when we're in an
     iframe, ask the parent hub to switch to its Home tab instead. When loaded
     directly (not iframed), the link navigates normally. Module pages use
     ../index.html and are never iframed, so this leaves them untouched. */
  function setupHubHome() {
    var inIframe = window.parent !== window.self;
    if (!inIframe) return;                       // direct load → normal navigation
    document.addEventListener("click", function (e) {
      var a = e.target.closest ? e.target.closest("a[href='index.html']") : null;
      if (!a) return;
      e.preventDefault();
      try { window.parent.postMessage({ type: "genai-hub-home" }, "*"); }
      catch (err) { location.href = "index.html"; }
    });
  }

  /* ---------- Init ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    setupTheme();
    buildSidebar();
    buildIndexGrid();
    setupSearch();
    buildTOC();
    initTocResizer();
    setupCopy();
    setupQuizzes();
    setupMobileNav();
    setupDemos();
    setupReveal();
    setupHubHome();
  });
})();
