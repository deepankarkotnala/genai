/* =========================================================================
   GenAI Learning Hub — Glass Learning UI enhancements
   - Wide, distraction-free reading layout
   - Reading progress, section guidance and scroll-to-top
   - Topic-aware animated SVG explainers on every lesson
   - Choreographed existing diagrams and calm reveal motion
   - Pointer-responsive glass highlights
   - Reduced-motion and offline-safe by design
   ========================================================================= */
(function () {
  "use strict";

  var motionQuery = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)");
  var REDUCED = !!(motionQuery && motionQuery.matches);
  var FOCUS_KEY = "genai-focus-mode";
  var READER_KEY = "genai-reader-settings-v2";

  function getStored(key, fallback) {
    try {
      var value = localStorage.getItem(key);
      return value === null ? fallback : value;
    } catch (error) {
      return fallback;
    }
  }

  function setStored(key, value) {
    try { localStorage.setItem(key, value); } catch (error) {}
  }

  function esc(value) {
    return String(value).replace(/[&<>"']/g, function (char) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[char];
    });
  }

  function homeHref() {
    if (window.SiteNav && typeof window.SiteNav.href === "function") {
      return window.SiteNav.href("index.html");
    }
    return (window.PORTAL && window.PORTAL.homeHref) || "index.html";
  }

  function iconHome() {
    return '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 11l9-8 9 8"/><path d="M5 10v10h5v-6h4v6h5V10"/></svg>';
  }

  function iconFocus(active) {
    if (active) {
      return '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M8 21H5a2 2 0 0 1-2-2v-3M16 21h3a2 2 0 0 0 2-2v-3"/><circle cx="12" cy="12" r="3"/></svg>';
    }
    return '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M3 12h3M18 12h3M12 3v3M12 18v3"/></svg>';
  }

  function iconReader() {
    return '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 19V5h10"/><path d="M4 12h8"/><path d="M16 8l4 11M14.7 15h6.6"/></svg>';
  }

  function isDsaPage() {
    var page = document.body ? (document.body.dataset.page || "") : "";
    return page.indexOf("dsa-") === 0;
  }

  // True while a modal <dialog> is on screen. Page-level keyboard shortcuts
  // must stand down for it, or they steal keys the dialog needs.
  function modalOpen() {
    return !!document.querySelector("dialog[open]");
  }

  function addDsaWorkspaceNav() {
    var bar = document.querySelector(".topbar");
    if (!bar || !isDsaPage() || bar.querySelector(".dsa-workspace-nav")) return;

    var home;
    try { home = new URL(homeHref(), window.location.href); }
    catch (error) { home = new URL("index.html", window.location.href); }
    var base = new URL("./", home.href);
    var path = window.location.pathname.toLowerCase();

    function item(label, relative, active) {
      var href = relative === "index.html" ? home.href : new URL(relative, base).href;
      return '<a href="' + href + '"' + (active ? ' class="active" aria-current="page"' : '') + '>' + label + '</a>';
    }

    var isHome = path.replace(/\/$/, "/index.html") === home.pathname.toLowerCase().replace(/\/$/, "/index.html");
    var isLearn = /\/(?:modules|learn-rag-mcp|teach-agents)\//.test(path) || /\/(?:memory|rag-deep-dive|langgraph|langfuse|guardrails|hermes|claude-agent)\.html$/.test(path);
    var isPractice = /\/(?:scenario-practice|interview-labs|ats-agent-lab)\//.test(path);
    var isInterview = /\/(?:dsa-prep|interview-prep|interview-hub|google-prep)\//.test(path);
    var isProgress = /\/(?:progress|study-plan)\.html$/.test(path);

    var nav = document.createElement("nav");
    nav.className = "dsa-workspace-nav";
    nav.setAttribute("aria-label", "Workspace sections");
    nav.innerHTML =
      item("Home", "index.html", isHome) +
      item("Learn", "modules/01_foundations.html", isLearn) +
      item("Practice", "scenario-practice/index.html", isPractice) +
      item("Interview", "interview-hub/index.html", isInterview);

    var crumbs = bar.querySelector(".crumbs");
    if (crumbs) crumbs.insertAdjacentElement("beforebegin", nav);
    else {
      var theme = bar.querySelector("[data-theme-toggle]");
      if (theme) bar.insertBefore(nav, theme);
      else bar.appendChild(nav);
    }
  }

  function addOfficeRibbon() {
    var bar = document.querySelector(".topbar");
    if (!bar || document.querySelector(".office-ribbon") || isDsaPage()) return;

    var home;
    try { home = new URL(homeHref(), window.location.href); }
    catch (error) { home = new URL("index.html", window.location.href); }
    var base = new URL("./", home.href);
    var path = window.location.pathname.toLowerCase();

    function item(label, relative, active) {
      var href = relative === "index.html" ? home.href : new URL(relative, base).href;
      return '<a href="' + href + '"' + (active ? ' class="active" aria-current="page"' : '') + '>' + label + '</a>';
    }

    var isHome = path.replace(/\/$/, "/index.html") === home.pathname.toLowerCase().replace(/\/$/, "/index.html");
    var isLearn = /\/(?:modules|learn-rag-mcp|teach-agents)\//.test(path) || /\/(?:memory|rag-deep-dive|langgraph|langfuse|guardrails|hermes|claude-agent)\.html$/.test(path);
    var isPractice = /\/(?:scenario-practice|interview-labs|ats-agent-lab)\//.test(path);
    var isInterview = /\/(?:interview-prep|interview-hub|google-prep)\//.test(path);
    var isProgress = /\/(?:progress|study-plan)\.html$/.test(path);

    var ribbon = document.createElement("nav");
    ribbon.className = "office-ribbon";
    ribbon.setAttribute("aria-label", "Workspace sections");
    ribbon.innerHTML =
      item("Home", "index.html", isHome) +
      item("Learn", "modules/01_foundations.html", isLearn) +
      item("Practice", "scenario-practice/index.html", isPractice) +
      item("Interview", "interview-hub/index.html", isInterview) +
      '<span class="ribbon-spacer"></span>' +
      '<span class="ribbon-status"><i aria-hidden="true"></i>Offline-ready workspace</span>';

    bar.insertAdjacentElement("afterend", ribbon);
    document.body.classList.add("has-ribbon");
  }

  function addHomeButton() {
    var bar = document.querySelector(".topbar");
    if (!bar || isDsaPage() || bar.querySelector(".home-btn")) return;

    var button = document.createElement("a");
    button.className = "home-btn";
    button.setAttribute("aria-label", "Go to learning hub home");
    button.href = homeHref();
    button.innerHTML = iconHome() + '<span class="home-lbl">Home</span>';
    button.addEventListener("click", function (event) {
      event.preventDefault();
      if (window.top !== window.self) {
        try {
          window.parent.postMessage({ type: "genai-hub-home" }, "*");
          return;
        } catch (error) {}
      }
      window.location.href = homeHref();
    });

    var theme = bar.querySelector("[data-theme-toggle]");
    if (theme) bar.insertBefore(button, theme);
    else bar.appendChild(button);
  }

  function addFocusButton() {
    var bar = document.querySelector(".topbar");
    var studyContent = document.querySelector(".content-wrap > .content");
    if (!bar || !studyContent || bar.querySelector(".focus-btn")) return;

    var button = document.createElement("button");
    button.type = "button";
    button.className = "focus-btn";
    button.setAttribute("aria-label", "Toggle distraction-free focus mode");

    /* ---------- Reading-width control ----------
       Focus mode hides both rails, which on a wide monitor left the text
       running the full width of the screen — well past a readable line length.
       The canvas is now capped by --focus-measure in office-theme.css, and
       this control lets the reader choose that cap. The choice is stored, so
       it carries across pages and sessions. */
    var WIDTH_KEY = "genai-focus-width";
    var WIDTHS = [
      { id: "narrow", label: "Narrow", hint: "Narrow reading width (~800px)" },
      { id: "medium", label: "Medium", hint: "Medium reading width (~1000px)" },
      { id: "wide", label: "Wide", hint: "Wide reading width (~1360px)" },
      { id: "full", label: "Full", hint: "Use the full screen width" }
    ];

    function validWidth(value) {
      for (var i = 0; i < WIDTHS.length; i++) if (WIDTHS[i].id === value) return value;
      return "medium";
    }

    var widthWrap = document.createElement("div");
    widthWrap.className = "focus-width";
    widthWrap.setAttribute("role", "group");
    widthWrap.setAttribute("aria-label", "Reading width");

    function applyWidth(value, persist) {
      value = validWidth(value);
      document.body.setAttribute("data-focus-width", value);
      var buttons = widthWrap.children;
      for (var i = 0; i < buttons.length; i++) {
        buttons[i].setAttribute("aria-pressed", buttons[i].dataset.width === value ? "true" : "false");
      }
      if (persist) setStored(WIDTH_KEY, value);
    }

    WIDTHS.forEach(function (option) {
      var choice = document.createElement("button");
      choice.type = "button";
      choice.dataset.width = option.id;
      choice.textContent = option.label;
      choice.title = option.hint;
      choice.setAttribute("aria-label", option.hint);
      choice.addEventListener("click", function () { applyWidth(option.id, true); });
      widthWrap.appendChild(choice);
    });

    applyWidth(getStored(WIDTH_KEY, "medium"), false);

    // In focus mode a single navigation bar is pinned to the top of the
    // viewport and the exit control plus the theme toggle live inside it, so
    // nothing floats above the lesson. Which element becomes that bar depends
    // on where the page keeps its workspace links: the injected ribbon on
    // portal pages, or the top bar itself on DSA chapters. Marking the winner
    // with `.focus-nav` lets office-theme.css style one selector instead of
    // one rule set per page family, which is what kept the two drifting apart.
    function navBar() {
      return document.querySelector(".office-ribbon") || bar;
    }

    function dock(active) {
      var nav = navBar();
      var theme = document.querySelector(".topbar [data-theme-toggle], .office-ribbon [data-theme-toggle]");
      var host = active ? nav : bar;

      // Only ever one bar is marked, and the mark is cleared on exit so the
      // page returns to its two-row breadcrumb + ribbon layout.
      var marked = document.querySelectorAll(".focus-nav");
      for (var i = 0; i < marked.length; i++) {
        if (!active || marked[i] !== nav) marked[i].classList.remove("focus-nav");
      }
      if (active) nav.classList.add("focus-nav");

      if (theme) {
        if (theme.parentNode !== host) host.appendChild(theme);
        host.insertBefore(button, theme);
      } else {
        host.appendChild(button);
      }
      // The width control only makes sense while the rails are hidden, so it
      // rides along with the exit button and sits just before it.
      if (active) host.insertBefore(widthWrap, button);
      else if (widthWrap.parentNode) widthWrap.parentNode.removeChild(widthWrap);
    }

    function apply(active, persist) {
      document.body.classList.toggle("focus-mode", active);
      dock(active);
      button.setAttribute("aria-pressed", active ? "true" : "false");
      button.setAttribute("aria-label", active ? "Exit focus mode" : "Enter focus mode");
      button.title = active ? "Exit focus mode (Esc)" : "Enter focus mode (F)";
      button.innerHTML = iconFocus(active) + '<span class="focus-lbl">' + (active ? "Exit focus" : "Focus") + "</span>";

      if (active) {
        var app = document.querySelector(".app");
        if (app) app.classList.remove("nav-open");
      }
      if (persist) setStored(FOCUS_KEY, active ? "1" : "0");
    }

    apply(getStored(FOCUS_KEY, "0") === "1", false);
    button.addEventListener("click", function () {
      apply(!document.body.classList.contains("focus-mode"), true);
    });

    document.addEventListener("keydown", function (event) {
      // A modal dialog owns the keyboard while it is open: Esc must close the
      // dialog (the browser's own behaviour) rather than exit focus mode, and
      // typing "f" while reading must not toggle the layout underneath it.
      if (modalOpen()) return;

      if (event.key === "Escape" && document.body.classList.contains("focus-mode")) {
        event.preventDefault();
        apply(false, true);
        button.focus();
        return;
      }
      if (event.key.toLowerCase() !== "f" || event.metaKey || event.ctrlKey || event.altKey) return;
      var tag = document.activeElement && document.activeElement.tagName;
      if (/INPUT|TEXTAREA|SELECT/.test(tag || "")) return;
      event.preventDefault();
      button.click();
    });
  }

  function readReaderSettings() {
    try {
      var settings = JSON.parse(getStored(READER_KEY, "{}"));
      return {
        size: ["small", "default", "large", "xl"].indexOf(settings.size) >= 0 ? settings.size : "default",
        width: ["narrow", "default", "wide"].indexOf(settings.width) >= 0 ? settings.width : "default",
        contrast: settings.contrast === true
      };
    } catch (error) {
      return { size: "default", width: "default", contrast: false };
    }
  }

  function applyReaderSettings(settings) {
    var body = document.body;
    var root = document.documentElement;
    var stateClasses = ["reader-text-small", "reader-text-large", "reader-text-xl", "reader-narrow", "reader-wide", "reader-high-contrast"];

    stateClasses.forEach(function (name) {
      body.classList.remove(name);
      root.classList.remove(name);
    });

    root.dataset.readingSize = settings.size;
    root.dataset.readingWidth = settings.width;
    root.dataset.readingContrast = settings.contrast ? "high" : "soft";

    if (settings.size !== "default") {
      body.classList.add("reader-text-" + settings.size);
      root.classList.add("reader-text-" + settings.size);
    }
    if (settings.width !== "default") {
      body.classList.add("reader-" + settings.width);
      root.classList.add("reader-" + settings.width);
    }
    if (settings.contrast) {
      body.classList.add("reader-high-contrast");
      root.classList.add("reader-high-contrast");
    }
  }

  function addReaderControls() {
    var bar = document.querySelector(".topbar");
    if (!bar || bar.querySelector(".reader-wrap")) return;

    var settings = readReaderSettings();
    applyReaderSettings(settings);

    var wrap = document.createElement("div");
    wrap.className = "reader-wrap";
    wrap.innerHTML =
      '<button class="reader-btn" type="button" aria-expanded="false" aria-label="Open reading comfort settings">' +
        iconReader() + '<span class="reader-lbl">Reader</span>' +
      "</button>" +
      '<div class="reader-popover" role="dialog" aria-label="Reading comfort settings">' +
        "<h3>Reading comfort</h3>" +
        "<p>Adjust the lesson without changing its content.</p>" +
        '<div class="reader-row"><span>Text size</span><div class="reader-segment" data-reader-size>' +
          '<button type="button" data-value="small" aria-label="Small text">A−</button>' +
          '<button type="button" data-value="default" aria-label="Default text">A</button>' +
          '<button type="button" data-value="large" aria-label="Large text">A+</button>' +
          '<button type="button" data-value="xl" aria-label="Extra large text">A++</button>' +
        "</div></div>" +
        '<div class="reader-row"><span>Line width</span><div class="reader-segment" data-reader-width>' +
          '<button type="button" data-value="narrow">Narrow</button>' +
          '<button type="button" data-value="default">Auto</button>' +
          '<button type="button" data-value="wide">Wide</button>' +
        "</div></div>" +
        '<div class="reader-row"><span>Contrast</span><div class="reader-segment" data-reader-contrast>' +
          '<button type="button" data-value="false">Soft</button>' +
          '<button type="button" data-value="true">High</button>' +
        "</div></div>" +
      "</div>";

    var theme = bar.querySelector("[data-theme-toggle]");
    if (theme) bar.insertBefore(wrap, theme);
    else bar.appendChild(wrap);

    var trigger = wrap.querySelector(".reader-btn");
    var panel = wrap.querySelector(".reader-popover");

    var live = document.createElement("span");
    live.className = "sr-only reader-live";
    live.setAttribute("aria-live", "polite");
    wrap.appendChild(live);

    function refreshButtons() {
      wrap.querySelectorAll("[data-reader-size] button").forEach(function (button) {
        var active = button.dataset.value === settings.size;
        button.classList.toggle("active", active);
        button.setAttribute("aria-pressed", active ? "true" : "false");
      });
      wrap.querySelectorAll("[data-reader-width] button").forEach(function (button) {
        var active = button.dataset.value === settings.width;
        button.classList.toggle("active", active);
        button.setAttribute("aria-pressed", active ? "true" : "false");
      });
      wrap.querySelectorAll("[data-reader-contrast] button").forEach(function (button) {
        var active = button.dataset.value === String(settings.contrast);
        button.classList.toggle("active", active);
        button.setAttribute("aria-pressed", active ? "true" : "false");
      });
    }

    function announce() {
      var sizeNames = { small: "small", default: "standard", large: "large", xl: "extra large" };
      var widthNames = { narrow: "narrow", default: "automatic", wide: "wide" };
      live.textContent = "Reading settings applied: " + sizeNames[settings.size] + " text, " + widthNames[settings.width] + " line width, " + (settings.contrast ? "high" : "soft") + " contrast.";
    }

    function save() {
      applyReaderSettings(settings);
      refreshButtons();
      setStored(READER_KEY, JSON.stringify(settings));
      announce();
    }

    function close() {
      panel.classList.remove("open");
      trigger.setAttribute("aria-expanded", "false");
    }

    trigger.addEventListener("click", function () {
      var open = !panel.classList.contains("open");
      panel.classList.toggle("open", open);
      trigger.setAttribute("aria-expanded", open ? "true" : "false");
    });

    wrap.querySelector("[data-reader-size]").addEventListener("click", function (event) {
      var button = event.target.closest("button[data-value]");
      if (!button) return;
      settings.size = button.dataset.value;
      save();
    });
    wrap.querySelector("[data-reader-width]").addEventListener("click", function (event) {
      var button = event.target.closest("button[data-value]");
      if (!button) return;
      settings.width = button.dataset.value;
      save();
    });
    wrap.querySelector("[data-reader-contrast]").addEventListener("click", function (event) {
      var button = event.target.closest("button[data-value]");
      if (!button) return;
      settings.contrast = button.dataset.value === "true";
      save();
    });

    document.addEventListener("click", function (event) {
      if (!wrap.contains(event.target)) close();
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") close();
    });

    refreshButtons();
  }

  function setupReadingProgress() {
    var content = document.querySelector(".content");
    if (!content || document.querySelector(".reading-progress")) return;

    var line = document.createElement("div");
    line.className = "reading-progress";
    line.setAttribute("aria-hidden", "true");
    document.body.appendChild(line);

    var ticking = false;
    function update() {
      ticking = false;
      var rect = content.getBoundingClientRect();
      var start = window.scrollY + rect.top - window.innerHeight * .25;
      var end = start + Math.max(content.scrollHeight - window.innerHeight * .55, 1);
      var progress = Math.max(0, Math.min(1, (window.scrollY - start) / (end - start)));
      line.style.transform = "scaleX(" + progress.toFixed(4) + ")";
    }
    function request() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    }
    update();
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);
  }

  function setupSectionGuidance() {
    var headings = Array.prototype.slice.call(document.querySelectorAll(".content h2[id]"));
    if (!headings.length || !window.IntersectionObserver) return;

    var visible = new Map();
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) { visible.set(entry.target, entry.isIntersecting ? entry.boundingClientRect.top : Infinity); });
      var current = null;
      var min = Infinity;
      visible.forEach(function (top, heading) {
        if (top < min) { min = top; current = heading; }
      });
      if (!current) return;
      headings.forEach(function (heading) { heading.classList.toggle("is-current", heading === current); });
    }, { rootMargin: "-18% 0px -66% 0px", threshold: 0 });

    headings.forEach(function (heading) { observer.observe(heading); });
  }

  function topicSpec() {
    var path = location.pathname.toLowerCase();
    var title = (document.title + " " + ((document.querySelector("h1") || {}).textContent || "")).toLowerCase();
    var source = path + " " + title;

    if (((document.body && document.body.dataset.page === "00") || /learning hub/.test(title)) && document.querySelector(".hero")) {
      return {
        kicker: "Learning system",
        title: "A path that compounds",
        description: "Each layer turns the previous one into a practical engineering capability. Move left to right, then return with deeper projects.",
        chips: ["First principles", "Hands-on", "Production ready"],
        steps: [
          ["Foundations", "Models, tokens and attention"],
          ["Retrieval", "Embeddings, vectors and RAG"],
          ["Agency", "Tools, memory and orchestration"],
          ["Production", "Evaluate, secure and operate"]
        ],
        loop: true,
        accent: 3
      };
    }
    if (/transformer|attention|qkv/.test(source)) {
      return {
        kicker: "Mental model",
        title: "How a transformer moves information",
        description: "Attention mixes relevant context; the feed-forward block transforms it; residual paths preserve useful signal.",
        chips: ["Context", "Attention", "Residuals"],
        steps: [["Tokens", "Represent the input"], ["Attention", "Mix relevant context"], ["MLP", "Transform each position"], ["Output", "Predict the next token"]],
        loop: false,
        accent: 1
      };
    }
    if (/embedding|vector database|vector_databases|similarity|faiss|qdrant|pgvector/.test(source)) {
      return {
        kicker: "Semantic geometry",
        title: "Meaning becomes searchable space",
        description: "An embedding model maps content into vectors. Nearby points share meaning, so similarity search can retrieve useful context.",
        chips: ["Encode", "Index", "Similarity"],
        steps: [["Content", "Text, image or record"], ["Embed", "Convert meaning to numbers"], ["Index", "Organize vector space"], ["Retrieve", "Find the closest meaning"]],
        loop: false,
        accent: 2
      };
    }
    if (/rag|retrieval-augmented|pdf q&a|simple rag/.test(source)) {
      return {
        kicker: "Retrieval loop",
        title: "Ground the model before it answers",
        description: "The user query retrieves relevant evidence. That evidence becomes context, so generation is specific and traceable.",
        chips: ["Grounded", "Current", "Traceable"],
        steps: [["Question", "Express the information need"], ["Retrieve", "Find relevant evidence"], ["Augment", "Build focused context"], ["Generate", "Answer from the evidence"]],
        loop: true,
        accent: 1
      };
    }
    if (/mcp|model context protocol/.test(source)) {
      return {
        kicker: "Protocol map",
        title: "A standard bridge from AI to capabilities",
        description: "The host coordinates an MCP client. The client speaks a common protocol to servers that expose tools, resources and prompts.",
        chips: ["Discoverable", "Composable", "Permissioned"],
        steps: [["Host", "The AI application"], ["Client", "Maintains the connection"], ["Server", "Describes capabilities"], ["Tools + data", "Execute and return results"]],
        loop: true,
        accent: 2
      };
    }
    if (/langgraph|state graph|checkpointer/.test(source)) {
      return {
        kicker: "Stateful graph",
        title: "Make agent behavior explicit",
        description: "State flows through nodes. Edges choose the next action, while checkpoints make the process resumable and inspectable.",
        chips: ["State", "Routing", "Checkpoints"],
        steps: [["State", "Shared working memory"], ["Node", "Run one operation"], ["Route", "Choose the next edge"], ["Checkpoint", "Persist and resume"]],
        loop: true,
        accent: 2
      };
    }
    if (/agent|orchestration|workflow|claude|crewai|tool use|tool calling/.test(source)) {
      return {
        kicker: "Agent loop",
        title: "Reason, act, observe, improve",
        description: "An agent does not answer once. It selects an action, uses a tool, observes the result and updates its next decision.",
        chips: ["Goal-directed", "Tool-using", "Iterative"],
        steps: [["Goal", "Define the desired outcome"], ["Reason", "Choose the next action"], ["Act", "Call the right tool"], ["Observe", "Use the result to continue"]],
        loop: true,
        accent: 1
      };
    }
    if (/guardrail|safety|security|policy/.test(source)) {
      return {
        kicker: "Safety pipeline",
        title: "Trust is built in layers",
        description: "Inputs are checked before generation, outputs are validated after it, and policy decides whether the result may ship.",
        chips: ["Scope", "Privacy", "Verification"],
        steps: [["Input", "Classify intent and risk"], ["Constrain", "Apply policy and context"], ["Validate", "Check facts and format"], ["Release", "Allow, revise or block"]],
        loop: true,
        accent: 2
      };
    }
    if (/langfuse|observability|production|evaluation|monitor|trace/.test(source)) {
      return {
        kicker: "Production feedback",
        title: "Observe the system, not just the answer",
        description: "Traces connect prompts, retrieval, model calls and tools. Evaluation converts those traces into quality and reliability signals.",
        chips: ["Trace", "Evaluate", "Improve"],
        steps: [["Run", "Serve a real request"], ["Trace", "Capture every step"], ["Evaluate", "Score quality and safety"], ["Improve", "Tune prompts, data and tools"]],
        loop: true,
        accent: 2
      };
    }
    if (/memory|context window|chat history/.test(source)) {
      return {
        kicker: "Memory model",
        title: "Bring the right past into the present",
        description: "The model is stateless. Useful memory is selected, compressed and placed back into the active context for the next turn.",
        chips: ["Select", "Compress", "Recall"],
        steps: [["Experience", "Conversation or event"], ["Store", "Preserve useful signals"], ["Retrieve", "Select what matters now"], ["Context", "Reintroduce it to the model"]],
        loop: true,
        accent: 2
      };
    }
    if (/local llm|ollama|hermes|foundation|llm|token|next-token/.test(source)) {
      return {
        kicker: "Language model",
        title: "From text to the next useful token",
        description: "Text becomes tokens, tokens enter a context, the network scores possible continuations and decoding chooses what comes next.",
        chips: ["Tokens", "Context", "Prediction"],
        steps: [["Text", "Human-readable input"], ["Tokens", "Discrete model units"], ["Model", "Score possible continuations"], ["Decode", "Choose the next token"]],
        loop: true,
        accent: 2
      };
    }
    if (/capstone|build|project/.test(source)) {
      return {
        kicker: "Build loop",
        title: "Turn knowledge into an engineered system",
        description: "Start with a real need, prototype the smallest useful flow, measure behavior and harden what works.",
        chips: ["Problem", "Prototype", "Evidence"],
        steps: [["Frame", "Define user and outcome"], ["Prototype", "Build the thinnest path"], ["Evaluate", "Measure real behavior"], ["Harden", "Secure, scale and operate"]],
        loop: true,
        accent: 1
      };
    }
    return {
      kicker: "Learning loop",
      title: "Understand, practice, connect, build",
      description: "A durable mental model forms when explanation is followed by retrieval, application and reflection.",
      chips: ["Understand", "Practice", "Transfer"],
      steps: [["See", "Build the mental model"], ["Explain", "State it in your own words"], ["Practice", "Apply it to a small task"], ["Build", "Use it in a real system"]],
      loop: true,
      accent: 2
    };
  }

  function linkPath(index, nodes) {
    var from = nodes[index];
    var to = nodes[index + 1];
    return "M " + (from.x + from.w) + " " + (from.y + from.h / 2) + " C " + (from.x + from.w + 28) + " " + (from.y + from.h / 2) + ", " + (to.x - 28) + " " + (to.y + to.h / 2) + ", " + to.x + " " + (to.y + to.h / 2);
  }

  function buildTopicDiagram(spec) {
    var uid = "concept-" + Math.random().toString(36).slice(2, 9);
    var nodes = [
      { x: 18, y: 79, w: 145, h: 82 },
      { x: 190, y: 79, w: 145, h: 82 },
      { x: 362, y: 79, w: 145, h: 82 },
      { x: 534, y: 79, w: 145, h: 82 }
    ];
    var links = [linkPath(0, nodes), linkPath(1, nodes), linkPath(2, nodes)];
    var returnPath = "M 607 162 C 607 219, 262 219, 262 163";

    var svg =
      '<svg viewBox="0 0 700 250" role="img" aria-labelledby="' + uid + '-title ' + uid + '-desc">' +
        "<title id=\"" + uid + "-title\">" + esc(spec.title) + "</title>" +
        "<desc id=\"" + uid + "-desc\">" + esc(spec.description) + "</desc>" +
        "<defs>" +
          '<filter id="conceptShadow" x="-30%" y="-30%" width="160%" height="180%"><feDropShadow dx="0" dy="8" stdDeviation="8" flood-color="#0b2016" flood-opacity=".12"/></filter>' +
          '<marker id="' + uid + '-arrow" viewBox="0 0 10 10" refX="8.4" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#107c41" opacity=".78"/></marker>' +
        "</defs>" +
        '<circle class="concept-orb" cx="' + (nodes[spec.accent].x + nodes[spec.accent].w / 2) + '" cy="120" r="61"/>';

    links.forEach(function (path, index) {
      svg += '<path class="concept-link" style="--link-index:' + index + '" pathLength="1" d="' + path + '" marker-end="url(#' + uid + '-arrow)"/>';
      if (!REDUCED) {
        svg += '<circle class="concept-signal" r="3.7"><animateMotion dur="' + (3 + index * .28) + 's" begin="' + (index * .62) + 's" repeatCount="indefinite" path="' + path + '"/></circle>';
      }
    });
    if (spec.loop) {
      svg += '<path class="concept-link concept-return" style="--link-index:3" pathLength="1" d="' + returnPath + '" marker-end="url(#' + uid + '-arrow)"/>';
      if (!REDUCED) svg += '<circle class="concept-signal" r="3"><animateMotion dur="4.4s" begin="1.8s" repeatCount="indefinite" path="' + returnPath + '"/></circle>';
    }

    spec.steps.forEach(function (step, index) {
      var node = nodes[index];
      var cx = node.x + node.w / 2;
      svg +=
        '<g class="concept-node' + (index === spec.accent ? " is-accent" : "") + '" style="--node-index:' + index + '" transform="translate(' + node.x + " " + node.y + ')">' +
          '<rect class="node-shell" width="' + node.w + '" height="' + node.h + '" rx="17"/>' +
          '<circle class="node-badge" cx="20" cy="20" r="11"/>' +
          '<text class="node-index" x="20" y="20">' + (index + 1) + "</text>" +
          '<text class="node-title" x="' + (node.w / 2) + '" y="39">' + esc(step[0]) + "</text>" +
          '<text class="node-sub" x="' + (node.w / 2) + '" y="58">' + esc(step[1]) + "</text>" +
        "</g>";
    });
    svg += "</svg>";

    var chips = spec.chips.map(function (chip) {
      return '<span class="concept-chip"><i></i>' + esc(chip) + "</span>";
    }).join("");
    var mobile = spec.steps.map(function (step, index) {
      return '<div class="concept-step-mobile"><b>' + (index + 1) + '</b><div><strong>' + esc(step[0]) + "</strong><span>" + esc(step[1]) + "</span></div></div>";
    }).join("");

    var section = document.createElement("section");
    section.className = "concept-lab soft-reveal glass-spotlight";
    section.setAttribute("aria-label", "Animated topic overview");
    section.innerHTML =
      '<div class="concept-copy">' +
        '<div class="concept-kicker">' + esc(spec.kicker) + "</div>" +
        "<h3>" + esc(spec.title) + "</h3>" +
        "<p>" + esc(spec.description) + "</p>" +
        '<div class="concept-chips">' + chips + "</div>" +
      "</div>" +
      '<div class="concept-canvas">' + svg + "</div>" +
      '<div class="concept-mobile-steps">' + mobile + "</div>";
    return section;
  }

  function injectTopicDiagram() {
    var content = document.querySelector(".content");
    if (!content || content.querySelector(".concept-lab")) return;
    // Pages can opt out of the auto topic diagram when it isn't relevant to them.
    if (document.body && document.body.hasAttribute("data-no-concept-lab")) return;

    var section = buildTopicDiagram(topicSpec());
    var hero = content.querySelector(".hero");
    if (hero) {
      hero.insertAdjacentElement("afterend", section);
      return;
    }

    var heading = content.querySelector("h1");
    if (!heading) {
      content.insertBefore(section, content.firstChild);
      return;
    }

    var anchor = heading;
    var cursor = heading.nextElementSibling;
    var walked = 0;
    while (cursor && cursor.tagName !== "H2" && walked < 4) {
      anchor = cursor;
      cursor = cursor.nextElementSibling;
      walked += 1;
    }
    anchor.insertAdjacentElement("afterend", section);
  }

  function addFlowParticles(svg) {
    if (REDUCED || svg.dataset.particlesAdded === "true") return;
    svg.dataset.particlesAdded = "true";

    var paths = Array.prototype.slice.call(svg.querySelectorAll("path.flow-arrow, path.ln"))
      .filter(function (path) { return path.getAttribute("d"); })
      .slice(0, 5);

    paths.forEach(function (path, index) {
      var circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circle.setAttribute("r", index === 0 ? "3.2" : "2.5");
      circle.setAttribute("class", "concept-particle");
      circle.setAttribute("opacity", "0");

      var motion = document.createElementNS("http://www.w3.org/2000/svg", "animateMotion");
      motion.setAttribute("path", path.getAttribute("d"));
      motion.setAttribute("dur", (3 + index * .42) + "s");
      motion.setAttribute("begin", (.25 + index * .45) + "s");
      motion.setAttribute("repeatCount", "indefinite");
      motion.setAttribute("calcMode", "spline");
      motion.setAttribute("keyTimes", "0;1");
      motion.setAttribute("keySplines", ".2 .72 .2 1");

      var fade = document.createElementNS("http://www.w3.org/2000/svg", "animate");
      fade.setAttribute("attributeName", "opacity");
      fade.setAttribute("values", "0;1;1;0");
      fade.setAttribute("keyTimes", "0;.12;.82;1");
      fade.setAttribute("dur", (3 + index * .42) + "s");
      fade.setAttribute("begin", (.25 + index * .45) + "s");
      fade.setAttribute("repeatCount", "indefinite");

      circle.appendChild(motion);
      circle.appendChild(fade);
      svg.appendChild(circle);
    });
  }

  function setupDiagramAnimation() {
    var flows = Array.prototype.slice.call(document.querySelectorAll(".cssflow, .ragflow"));
    flows.forEach(function (element) {
      element.classList.add("flow-anim");
      Array.prototype.slice.call(element.querySelectorAll(".fnode, .rf, .farrow, .arr")).forEach(function (child, index) {
        child.style.transitionDelay = (index * 92) + "ms";
      });
    });

    var svgList = Array.prototype.slice.call(document.querySelectorAll(".diagram svg"));
    svgList.forEach(function (svg) {
      svg.classList.add("concept-svg", "fade-anim");
      var wrapper = svg.closest(".diagram");
      if (wrapper) wrapper.classList.add("draw-anim");

      Array.prototype.slice.call(svg.querySelectorAll(".flow-node, .flow-node-accent")).forEach(function (node, index) {
        node.style.setProperty("--node-index", index);
      });
      Array.prototype.slice.call(svg.querySelectorAll("path.ln, path.flow-arrow")).forEach(function (path) {
        try { path.style.setProperty("--dash", Math.ceil(path.getTotalLength()) + 4); } catch (error) {}
      });
    });

    var fades = Array.prototype.slice.call(document.querySelectorAll(".lg-graph, .loop-fig, .lf-tree"));
    fades.forEach(function (element) {
      if (!element.closest(".cssflow, .ragflow")) element.classList.add("fade-anim");
    });

    var targets = flows.concat(svgList, fades);
    if (REDUCED || !window.IntersectionObserver) {
      targets.forEach(function (element) { element.classList.add("flow-in"); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        entry.target.classList.add("flow-in");
        if (entry.target.matches("svg.concept-svg")) addFlowParticles(entry.target);
      });
    }, { rootMargin: "0px 0px -10% 0px", threshold: .12 });

    targets.forEach(function (element) { observer.observe(element); });
  }

  function setupSoftReveal() {
    var selector = [
      ".content > .callout", ".content > .grid", ".content > .demo", ".content > .timeline",
      ".content > .progress-card", ".content > .table-wrap", ".content > .collapse",
      ".content > .diagram", ".content > .readmap", ".content > .concept-lab"
    ].join(",");
    var elements = Array.prototype.slice.call(document.querySelectorAll(selector));

    if (REDUCED || !window.IntersectionObserver) {
      elements.forEach(function (element) { element.classList.add("in-view"); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("in-view");
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -7% 0px", threshold: .08 });

    elements.forEach(function (element, index) {
      element.classList.add("soft-reveal");
      element.style.transitionDelay = Math.min(index % 3, 2) * 40 + "ms";
      observer.observe(element);
    });
  }

  function setupGlassSpotlight() {
    var selectors = ".card, .callout, .quiz, .demo, .diagram, .readmap, .concept-lab, .progress-card, .collapse";
    document.querySelectorAll(selectors).forEach(function (element) {
      element.classList.add("glass-spotlight");
      element.addEventListener("pointermove", function (event) {
        var rect = element.getBoundingClientRect();
        element.style.setProperty("--spot-x", (event.clientX - rect.left) + "px");
        element.style.setProperty("--spot-y", (event.clientY - rect.top) + "px");
      }, { passive: true });
    });
  }

  function addScrollTop() {
    if (document.querySelector(".scroll-top")) return;
    var button = document.createElement("button");
    button.type = "button";
    button.className = "scroll-top";
    button.setAttribute("aria-label", "Back to top");
    button.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
    document.body.appendChild(button);

    var ticking = false;
    function update() {
      ticking = false;
      button.classList.toggle("show", window.scrollY > 620);
    }
    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    }, { passive: true });
    button.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: REDUCED ? "auto" : "smooth" });
    });
    update();
  }

  function setupThemeColor() {
    var meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "theme-color";
      document.head.appendChild(meta);
    }
    function update() {
      meta.content = document.documentElement.getAttribute("data-theme") === "dark" ? "#17191e" : "#f3f4f6";
    }
    update();
    new MutationObserver(update).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  }

  /* ---------- Light↔dark switching, without the stagger ----------
     Every surface, border and text colour is a `var(--…)` that changes the
     instant `data-theme` changes on <html>. Left alone the flip arrives in
     pieces: each component carries its own transition (`all .15s`, `.2s`,
     `border-color .3s`…) so each starts and finishes re-colouring on its own
     clock, while gradients, glass and shadows — which cannot interpolate
     between themes — snap over immediately.

     So the switch is made atomic instead: `.theme-switching` suppresses every
     transition on the page (see styles.css), the new colours paint in a single
     frame, and the class comes straight back off. Nothing animates, so there is
     nothing left to fall out of step. This is the fallback path; where view
     transitions exist, setupThemeCrossfade below fades it properly.

     Driven by a MutationObserver rather than by the toggle handler, so it covers
     the theme however it was set. Observer callbacks run before the browser
     paints, so the class is in place for the same frame that applies the new
     colours. */
  function setupThemeTransition() {
    var root = document.documentElement;
    var release = null;

    new MutationObserver(function () {
      root.classList.add("theme-switching");
      // Two frames: the first paints the new theme with transitions off, the
      // second is when it is safe to hand hover/focus transitions back. A
      // timeout backs this up in case the tab is hidden and rAF never fires.
      if (release) window.clearTimeout(release);
      release = window.setTimeout(drop, 300);
      window.requestAnimationFrame(function () {
        window.requestAnimationFrame(drop);
      });
    }).observe(root, { attributes: true, attributeFilter: ["data-theme"] });

    function drop() {
      if (release) { window.clearTimeout(release); release = null; }
      root.classList.remove("theme-switching");
    }
  }

  /* ---------- Light↔dark as a crossfade ----------
     The atomic flip above is correct but abrupt. A view transition is the one
     way to fade it without the stagger: it crossfades a *snapshot* of the
     rendered page, so the gradients, `backdrop-filter` glass and shadows that
     cannot interpolate between themes are carried along with everything else.
     There is no per-element colour animation involved, so nothing can arrive
     late. Where the API is missing (Firefox today) this does nothing and the
     atomic flip above remains the behaviour.

     The listener is on `document` in the capture phase deliberately. Listeners
     added to the button itself run in registration order regardless of the
     capture flag, and app.js registers its handler first — so a listener on the
     button could never run before the theme had already flipped. Document
     capture runs ahead of any listener on the target.

     Rather than reimplementing the toggle (it also swaps the button's icon and
     writes localStorage), the same click is re-dispatched inside the update
     callback, with a flag so the interceptor lets that one through. app.js
     stays the only copy of the logic. */
  function setupThemeCrossfade() {
    if (REDUCED || !document.startViewTransition) return;
    var passthrough = false;
    var busy = false;

    document.addEventListener("click", function (event) {
      if (passthrough) return;                     // our own re-dispatch — let it through
      var button = event.target.closest && event.target.closest("[data-theme-toggle]");
      if (!button) return;

      event.preventDefault();
      event.stopImmediatePropagation();            // app.js must not flip it yet

      // Rapid double-clicks would otherwise queue transitions and skip frames;
      // flipping straight through keeps the toggle honest under a fast tap.
      if (busy) { flip(); return; }
      busy = true;

      /* A theme change is one crossfade of the whole page — that is the point
         of routing it through a view transition at all. Page navigation names
         the sidebar, top bar, ribbon and contents rail as separate groups and
         holds them still (see "Page transitions" in styles.css), which is right
         when the chrome is genuinely unchanged either side, and wrong here:
         every one of those surfaces is repainted by the theme. Left named, the
         chrome would snap to the new theme while the reading column faded, so
         the names are withdrawn for the duration and the root snapshot carries
         the whole page again. Set before the capture, cleared after finish. */
      document.documentElement.classList.add("vt-theme");
      document.startViewTransition(flip).finished.then(done, done);

      function done() {
        busy = false;
        document.documentElement.classList.remove("vt-theme");
      }
    }, true);

    function flip() {
      var button = document.querySelector("[data-theme-toggle]");
      if (!button) return;
      passthrough = true;
      button.click();                              // app.js flips the theme + icon here
      passthrough = false;
    }
  }

  function clearLegacyReadingClasses() {
    var body = document.body;
    var root = document.documentElement;
    ["reader-text-small", "reader-text-large", "reader-text-xl",
      "reader-narrow", "reader-wide", "reader-high-contrast"].forEach(function (name) {
      body.classList.remove(name);
      root.classList.remove(name);
    });
  }

  // An "additional read" for a single term in the prose: a `.term-link` button
  // opens the <dialog> named by its data-term-dialog. The native dialog gives us
  // the backdrop, Esc to close, the focus trap and top-layer stacking for free,
  // so this only wires the click and a click-outside-to-dismiss.
  function setupTermDialogs() {
    var triggers = document.querySelectorAll("[data-term-dialog]");

    for (var i = 0; i < triggers.length; i++) {
      (function (trigger) {
        var dialog = document.getElementById(trigger.getAttribute("data-term-dialog"));
        if (!dialog || typeof dialog.showModal !== "function") return;

        trigger.addEventListener("click", function () {
          dialog.showModal();
        });

        // Returning focus to the word keeps keyboard reading position.
        dialog.addEventListener("close", function () {
          trigger.focus();
        });

        // A click on the backdrop lands on the dialog itself, never on its
        // children, so comparing the target is enough to tell them apart.
        dialog.addEventListener("click", function (event) {
          if (event.target === dialog) dialog.close();
        });

        var close = dialog.querySelector("[data-term-close]");
        if (close) {
          close.addEventListener("click", function () {
            dialog.close();
          });
        }
      })(triggers[i]);
    }
  }

  function init() {
    clearLegacyReadingClasses();
    addDsaWorkspaceNav();
    // The Home / Learn / Practice / Interview ribbon is NOT injected in the ML
    // portal. Its links are resolved against this folder (ml-sitenav.js makes
    // machine-learning/ the site root so the directory stays deployable on its
    // own), and machine-learning/ has no modules/, scenario-practice/ or
    // interview-hub/ — so three of the four tabs pointed at nothing. The
    // sidebar, the topbar Home button and the mobile "Jump to section" bar
    // already cover navigation here.
    // addOfficeRibbon();
    addHomeButton();
    addFocusButton();
    setupTermDialogs();
    // injectTopicDiagram();  // Learning-loop concept diagram removed site-wide (felt unnecessary).
    setupReadingProgress();
    setupSectionGuidance();
    setupDiagramAnimation();
    setupSoftReveal();
    addScrollTop();
    setupThemeColor();
    setupThemeTransition();
    setupThemeCrossfade();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
