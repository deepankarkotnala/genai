/* =========================================================================
   GenAI Learning Hub - Glass Learning UI enhancements
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

  /* Two letters at two sizes is the universal mark for type size, and it reads
     at 15px where a line-art glyph turns to mush. Text rather than an SVG so
     it inherits the button's colour and the theme's font. */
  function glyphType() {
    return '<span class="reader-glyph" aria-hidden="true">A<i>a</i></span>';
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
    var isLearn = /\/(?:modules|teach-agents)\//.test(path) || /\/(?:memory|rag-deep-dive|agent-protocols|llm-evals|llmops|langgraph|langgraph-asyncio|langgraph-pydantic|langfuse|guardrails|hermes|claude-agent)\.html$/.test(path);
    var isPractice = /\/scenario-practice\//.test(path);
    var isInterview = /\/(?:dsa-prep|interview-prep|python-interview|interview-labs|google-prep)\//.test(path);
    var isProgress = /\/(?:progress|study-plan)\.html$/.test(path);

    var nav = document.createElement("nav");
    nav.className = "dsa-workspace-nav";
    nav.setAttribute("aria-label", "Workspace sections");
    nav.innerHTML =
      item("Home", "index.html", isHome) +
      item("Learn", "modules/01_foundations.html", isLearn) +
      item("Practice", "scenario-practice/index.html", isPractice) +
      item("Interview", "interview-prep/index.html", isInterview);

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
    var isLearn = /\/(?:modules|teach-agents)\//.test(path) || /\/(?:memory|rag-deep-dive|agent-protocols|llm-evals|llmops|langgraph|langgraph-asyncio|langgraph-pydantic|langfuse|guardrails|hermes|claude-agent)\.html$/.test(path);
    var isPractice = /\/scenario-practice\//.test(path);
    var isInterview = /\/(?:interview-prep|python-interview|interview-labs|google-prep)\//.test(path);
    var isProgress = /\/(?:progress|study-plan)\.html$/.test(path);

    var ribbon = document.createElement("nav");
    ribbon.className = "office-ribbon";
    ribbon.setAttribute("aria-label", "Workspace sections");
    /* "Overview" rather than "Home": the top bar now carries a Home button of
       its own, and two controls with the same label pointing at the same page
       read as a bug. The status chip moved to the top bar as well, so the
       ribbon is nothing but tabs - which is what lets it scroll cleanly on a
       phone. The spacer stays: focus mode reuses it to push the exit control
       to the far end of the bar. */
    ribbon.innerHTML =
      item("Overview", "index.html", isHome) +
      item("Learn", "modules/01_foundations.html", isLearn) +
      item("Practice", "scenario-practice/index.html", isPractice) +
      item("Interview", "interview-prep/index.html", isInterview) +
      '<span class="ribbon-spacer"></span>';

    bar.insertAdjacentElement("afterend", ribbon);
    document.body.classList.add("has-ribbon");
  }

  /* ---------- Breadcrumb structure ----------
     The bar ships its trail as one text node ("Foundations / <b>01 · …</b>"),
     which leaves the stylesheet nothing to target when the row has to shed
     weight on a phone - the whole string can only be truncated mid-word.
     Splitting it into trail / separator / current parts lets the narrow
     breakpoints drop the ancestor and keep the chapter title (the part the
     reader actually needs), and gives the slash its own colour instead of
     inheriting the muted trail. Runs on every page family: some crumbs carry
     a <b> for the current page, DSA chapters are plain text, and hub pages
     are a <b> with no trail at all. */
  function structureCrumbs() {
    var crumbs = document.querySelector(".topbar .crumbs");
    if (!crumbs || crumbs.querySelector(".crumb-current")) return;

    var bold = crumbs.querySelector("b");
    var full = crumbs.textContent.replace(/\s+/g, " ").trim();
    var current = bold ? bold.textContent.replace(/\s+/g, " ").trim() : "";
    var trail;

    if (current) {
      trail = full.slice(0, full.lastIndexOf(current));
    } else {
      var segments = full.split("/");
      current = segments.pop().trim();
      trail = segments.join("/");
    }

    var ancestors = trail.split("/").map(function (part) { return part.trim(); })
      .filter(function (part) { return part.length > 0; });

    var html = "";
    for (var i = 0; i < ancestors.length; i++) {
      html += '<span class="crumb-trail">' + esc(ancestors[i]) + "</span>" +
        '<span class="crumb-sep" aria-hidden="true">/</span>';
    }
    html += '<b class="crumb-current">' + esc(current) + "</b>";

    crumbs.innerHTML = html;
    // The current page can still be clipped on a very narrow phone, so the
    // untruncated trail stays reachable as a tooltip.
    crumbs.title = ancestors.concat([current]).join(" / ");
  }

  function addHomeButton() {
    var bar = document.querySelector(".topbar");
    if (!bar || bar.querySelector(".home-btn")) return;

    var button = document.createElement("a");
    button.className = "home-btn";
    button.setAttribute("aria-label", "Go to learning hub home");
    button.href = homeHref();
    button.innerHTML = iconHome() + '<span class="home-lbl">Home</span>';
    button.addEventListener("click", function (event) {
      if (window.top !== window.self) {
        event.preventDefault();
        try {
          window.parent.postMessage({ type: "genai-hub-home" }, "*");
          return;
        } catch (error) {}
      }
    });

    var focusBtn = bar.querySelector(".focus-btn");
    var theme = bar.querySelector("[data-theme-toggle]");
    if (focusBtn) bar.insertBefore(button, focusBtn);
    else if (theme) bar.insertBefore(button, theme);
    else bar.appendChild(button);
  }

  function addFocusButton() {
    var bar = document.querySelector(".topbar");
    if (!bar || bar.querySelector(".focus-btn")) return;

    var button = document.createElement("button");
    button.type = "button";
    button.className = "focus-btn";
    button.setAttribute("aria-label", "Toggle distraction-free focus mode");
    button.setAttribute("aria-pressed", "false");

    function apply(active, persist) {
      document.body.classList.toggle("focus-mode", active);
      button.setAttribute("aria-pressed", active ? "true" : "false");
      button.setAttribute("aria-label", active ? "Exit focus mode" : "Enter focus mode");
      button.title = active ? "Exit focus mode (Esc)" : "Focus mode (F)";
      button.innerHTML = iconFocus(active) + '<span class="focus-lbl">' + (active ? "Exit focus" : "Focus") + "</span>";

      if (active) {
        var app = document.querySelector(".app");
        if (app) app.classList.remove("nav-open");
        document.body.classList.remove("nav-open");
      }
      if (persist) setStored(FOCUS_KEY, active ? "1" : "0");
      document.dispatchEvent(new CustomEvent("genai-focus-change", { detail: { active: active, focus: active } }));
      document.dispatchEvent(new CustomEvent("ir-focus-change", { detail: { active: active, focus: active } }));
    }

    var reader = bar.querySelector(".reader-wrap");
    var theme = bar.querySelector("[data-theme-toggle]");
    if (reader) bar.insertBefore(button, reader);
    else if (theme) bar.insertBefore(button, theme);
    else bar.appendChild(button);

    apply(getStored(FOCUS_KEY, "0") === "1", false);
    button.addEventListener("click", function () {
      apply(!document.body.classList.contains("focus-mode"), true);
    });

    document.addEventListener("keydown", function (event) {
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

  /* =======================================================================
     Display settings - text size, alignment and reading width
     Matches interview_prep portal exactly: one step smaller on desktop,
     justified by default, and focus mode remembers its own width
     (`focusWidth`) separately from the regular layout's (`width`). The
     inline pre-paint script in every page's <head> mirrors these defaults.
     ======================================================================= */
  var READING_KEY = "gp.reading";
  var SIZES = ["xs", "s", "m", "l", "xl"];
  var WIDTHS = ["default", "wide", "full"];
  var ALIGNS = ["left", "justify"];

  function defaultSize() {
    return window.matchMedia && window.matchMedia("(max-width: 860px)").matches ? "m" : "s";
  }

  function readReadingSettings() {
    var stored = {};
    try { stored = JSON.parse(getStored(READING_KEY, "{}")) || {}; } catch (error) { stored = {}; }
    return {
      size: SIZES.indexOf(stored.size) >= 0 ? stored.size : defaultSize(),
      width: WIDTHS.indexOf(stored.width) >= 0 ? stored.width : "wide",
      focusWidth: WIDTHS.indexOf(stored.focusWidth) >= 0 ? stored.focusWidth : "default",
      align: ALIGNS.indexOf(stored.align) >= 0 ? stored.align : "justify"
    };
  }

  // Full is a focus-mode measure; outside it the widest column is Wide.
  function effectiveWidth(settings) {
    if (document.body.classList.contains("focus-mode")) return settings.focusWidth || "default";
    return settings.width === "full" ? "wide" : settings.width;
  }

  function applyReadingSettings(settings) {
    var root = document.documentElement;
    var width = effectiveWidth(settings);

    root.setAttribute("data-reading-size", settings.size);
    root.setAttribute("data-reading-width", width);
    root.setAttribute("data-reading-align", settings.align);
    document.body.setAttribute("data-focus-width", {
      default: "standard", standard: "standard", wide: "wide", full: "full"
    }[settings.focusWidth] || "standard");
  }

  function addReaderControls() {
    var bar = document.querySelector(".topbar");
    if (!bar || bar.querySelector(".reader-wrap")) return;

    var settings = readReadingSettings();
    applyReadingSettings(settings);

    var SIZE_CHOICES = [
      { value: "xs", label: "A", cls: "sz-1", name: "Smallest text" },
      { value: "s", label: "A", cls: "sz-2", name: "Compact text" },
      { value: "m", label: "A", cls: "sz-3", name: "Standard text" },
      { value: "l", label: "A", cls: "sz-4", name: "Large text" },
      { value: "xl", label: "A", cls: "sz-5", name: "Extra large text" }
    ];
    var ALIGN_CHOICES = [
      { value: "left", label: "Left", name: "Ragged right edge - even word spacing" },
      { value: "justify", label: "Justified", name: "Flush right edge - word spacing varies per line" }
    ];
    var WIDTH_CHOICES = [
      { value: "default", label: "Standard", name: "Optimal reading line-length (70–80 chars)" },
      { value: "wide", label: "Wide", name: "Wider column for diagrams and wide code" },
      { value: "full", label: "Full", name: "Expand to fill the reading pane" }
    ];

    function segment(group, choices) {
      var html = '<div class="reader-segment" data-reader-' + group + ' role="group">';
      choices.forEach(function (choice) {
        html += '<button type="button" data-value="' + choice.value + '"' +
          (choice.cls ? ' class="' + choice.cls + '"' : "") +
          ' title="' + esc(choice.name) + '" aria-label="' + esc(choice.name) + '">' +
          esc(choice.label) + "</button>";
      });
      return html + "</div>";
    }

    var wrap = document.createElement("div");
    wrap.className = "reader-wrap";
    wrap.innerHTML =
      '<button class="reader-btn" type="button" aria-expanded="false" aria-haspopup="dialog" ' +
        'title="Display settings" aria-label="Reading and display settings">' +
        glyphType() + '<span class="reader-lbl">Display</span>' +
      "</button>";

    var panel = document.createElement("div");
    panel.className = "reader-popover";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-label", "Reading and display settings");
    panel.innerHTML =
      '<div class="reader-head"><h3>Display</h3>' +
      '<button type="button" class="reader-close" aria-label="Close display settings">&times;</button>' +
      "</div>" +
      "<p>Customize font size, line width and text alignment for comfortable reading.</p>" +
      '<div class="reader-row"><span>Text size</span>' + segment("size", SIZE_CHOICES) + "</div>" +
      '<div class="reader-row"><span>Alignment</span>' + segment("align", ALIGN_CHOICES) + "</div>" +
      '<div class="reader-row reader-row-width"><span>Reading width</span>' + segment("width", WIDTH_CHOICES) + "</div>" +
      '<button type="button" class="reader-reset">Reset to default</button>';

    var scrim = document.createElement("div");
    scrim.className = "reader-scrim";

    var theme = bar.querySelector("[data-theme-toggle]");
    if (theme) bar.insertBefore(wrap, theme);
    else bar.appendChild(wrap);

    document.body.appendChild(scrim);
    document.body.appendChild(panel);

    var trigger = wrap.querySelector(".reader-btn");

    function refreshButtons() {
      var groups = { size: settings.size, align: settings.align, width: effectiveWidth(settings) };
      Object.keys(groups).forEach(function (group) {
        var buttons = panel.querySelectorAll("[data-reader-" + group + "] button");
        for (var i = 0; i < buttons.length; i++) {
          var active = buttons[i].getAttribute("data-value") === groups[group];
          buttons[i].classList.toggle("active", active);
          buttons[i].setAttribute("aria-pressed", active ? "true" : "false");
        }
      });
    }

    function save() {
      applyReadingSettings(settings);
      refreshButtons();
      setStored(READING_KEY, JSON.stringify(settings));
    }

    var sheetQuery = window.matchMedia("(max-width: 620px)");

    function place() {
      if (sheetQuery.matches) {
        panel.style.top = "";
        panel.style.right = "";
        return;
      }
      var rect = trigger.getBoundingClientRect();
      panel.style.top = Math.round(rect.bottom + 8) + "px";
      panel.style.right = Math.max(12, Math.round(window.innerWidth - rect.right)) + "px";
    }

    function open(value) {
      if (value) {
        settings = readReadingSettings();
        refreshButtons();
        place();
      }
      panel.classList.toggle("open", value);
      scrim.classList.toggle("open", value);
      document.body.classList.toggle("reader-open", value);
      trigger.setAttribute("aria-expanded", value ? "true" : "false");
    }

    function isOpen() { return panel.classList.contains("open"); }

    trigger.addEventListener("click", function (e) {
      e.stopPropagation();
      open(!isOpen());
    });
    panel.querySelector(".reader-close").addEventListener("click", function () {
      open(false);
      trigger.focus();
    });
    scrim.addEventListener("click", function () { open(false); });

    ["size", "align", "width"].forEach(function (group) {
      panel.querySelector("[data-reader-" + group + "]").addEventListener("click", function (event) {
        var button = event.target.closest("button[data-value]");
        if (!button) return;
        var value = button.getAttribute("data-value");
        // Width is remembered per layout: focus mode keeps its own measure.
        if (group === "width" && document.body.classList.contains("focus-mode")) settings.focusWidth = value;
        else settings[group] = value;
        save();
      });
    });

    panel.querySelector(".reader-reset").addEventListener("click", function () {
      settings.size = defaultSize();
      settings.align = "justify";
      if (document.body.classList.contains("focus-mode")) settings.focusWidth = "default";
      else settings.width = "wide";
      save();
    });

    document.addEventListener("click", function (event) {
      if (!isOpen() || wrap.contains(event.target) || panel.contains(event.target)) return;
      open(false);
    });
    document.addEventListener("keydown", function (event) {
      if (event.key !== "Escape" || !isOpen()) return;
      open(false);
      trigger.focus();
    });

    window.addEventListener("resize", function () { if (isOpen()) place(); });
    window.addEventListener("scroll", function () { if (isOpen()) place(); }, { passive: true });
    document.addEventListener("genai-focus-change", function () {
      applyReadingSettings(settings);
      refreshButtons();
      if (isOpen()) place();
    });
    document.addEventListener("ir-focus-change", function () {
      applyReadingSettings(settings);
      refreshButtons();
      if (isOpen()) place();
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
    /* A term dialog carries an <h2> for its accessible name, and those dialogs
       live inside .content - so an unfiltered query lists every definition as a
       chapter section. Section headings are the ones in the document flow. */
    var headings = Array.prototype.slice.call(document.querySelectorAll(".content h2[id]"))
      .filter(function (h) { return !h.closest("dialog"); });
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

  /* The pointer position each spotlight-capable surface publishes as
     --spot-x/--spot-y, for `.glass-spotlight::before` to place its gradient.

     This used to attach one `pointermove` listener per element - on a page with
     forty cards, callouts, quizzes and collapses, that is forty listeners and
     two inline-style writes on every single mouse move, each one invalidating
     that element's style. Now it is one delegated listener that resolves the
     surface under the pointer and writes at most once per frame.

     Gated on a real pointer. A touch device has no hover, so the gradient it
     would feed can never be seen, and the listener is pure cost there. */
  var SPOTLIGHT_SELECTOR = ".card, .callout, .quiz, .demo, .diagram, .readmap, .concept-lab, .progress-card, .collapse";

  function setupGlassSpotlight() {
    document.querySelectorAll(SPOTLIGHT_SELECTOR).forEach(function (element) {
      element.classList.add("glass-spotlight");
    });

    if (REDUCED) return;
    if (window.matchMedia && !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    var pending = null;
    var queued = false;

    document.addEventListener("pointermove", function (event) {
      if (event.pointerType && event.pointerType !== "mouse") return;
      /* Copy what the frame needs. Holding the event itself would pin it, and
         its coordinates are all this reads. */
      pending = { x: event.clientX, y: event.clientY, target: event.target };
      if (queued) return;
      queued = true;
      window.requestAnimationFrame(function () {
        queued = false;
        var latest = pending;
        pending = null;
        if (!latest || !latest.target || !latest.target.closest) return;
        var surface = latest.target.closest(SPOTLIGHT_SELECTOR);
        if (!surface) return;
        var rect = surface.getBoundingClientRect();
        surface.style.setProperty("--spot-x", (latest.x - rect.left) + "px");
        surface.style.setProperty("--spot-y", (latest.y - rect.top) + "px");
      });
    }, { passive: true });
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
      meta.content = document.documentElement.getAttribute("data-theme") === "dark" ? "#1b1b1b" : "#f4f6fb";
    }
    update();
    new MutationObserver(update).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  }

  /* ---------- Light↔dark switching, without the stagger ----------
     Every surface, border and text colour is a `var(--…)` that changes the
     instant `data-theme` changes on <html>. Left alone the flip arrives in
     pieces: each component carries its own transition (`all .15s`, `.2s`,
     `border-color .3s`…) so each starts and finishes re-colouring on its own
     clock, while gradients, glass and shadows - which cannot interpolate
     between themes - snap over immediately.

     So the switch is made atomic instead: `.theme-switching` suppresses every
     transition on the page (see styles.css), the new colours paint in a single
     frame, and the class comes straight back off. Nothing animates, so there is
     nothing left to fall out of step.

     Driven by a MutationObserver rather than by the toggle handlers: the theme
     is set from several entry points (app.js, portal-page.js, the ribbon
     toggle), and observer callbacks run before the browser paints, so the class
     is in place for the same frame that applies the new colours. */
  function setupThemeTransition() {
    var root = document.documentElement;
    var release = null;
    var fade = null;
    var last = root.getAttribute("data-theme");

    new MutationObserver(function () {
      // Re-applying the current theme is still a mutation; it is not a switch.
      var now = root.getAttribute("data-theme");
      if (now === last) return;
      last = now;
      root.classList.add("theme-switching");
      if (release) window.clearTimeout(release);
      if (fade) { fade.cancel(); fade = null; }
      /* Interview Room's switch: the colours change once with every
         transition frozen, then the page plays one tiny compositor fade.
         No snapshots, clipping or per-component colour animation. A timeout
         backs the release up in case the tab is hidden and frames never run. */
      if (!REDUCED && document.body && typeof document.body.animate === "function") {
        fade = document.body.animate([{ opacity: 0.94 }, { opacity: 1 }], { duration: 90, easing: "linear" });
        fade.finished.then(drop, drop);
        release = window.setTimeout(drop, 300);
        return;
      }
      release = window.setTimeout(drop, 300);
      window.requestAnimationFrame(function () {
        window.requestAnimationFrame(drop);
      });
    }).observe(root, { attributes: true, attributeFilter: ["data-theme"] });

    function drop() {
      if (release) { window.clearTimeout(release); release = null; }
      fade = null;
      root.classList.remove("theme-switching");
    }
  }

  /* ---------- Light↔dark as a crossfade - RETIRED ----------
     No longer called from init(): Interview Room's single 90ms fade in
     setupThemeTransition replaced the view-transition snapshot, which cost a
     full-page capture on every toggle. Kept for reference.

     Original notes:
     The atomic flip above is correct but abrupt. A view transition is the one
     way to fade it without the stagger: it crossfades a *snapshot* of the
     rendered page, so the gradients, `backdrop-filter` glass and shadows that
     cannot interpolate between themes are carried along with everything else.
     There is no per-element colour animation involved, so nothing can arrive
     late. Where the API is missing (Firefox today) this does nothing and the
     atomic flip above remains the behaviour.

     The listener is on `document` in the capture phase deliberately. Listeners
     added to the button itself run in registration order regardless of the
     capture flag, and app.js registers its handler first - so a listener on the
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
      if (passthrough) return;                     // our own re-dispatch - let it through
      var button = event.target.closest && event.target.closest("[data-theme-toggle]");
      if (!button) return;

      event.preventDefault();
      event.stopImmediatePropagation();            // app.js must not flip it yet

      // Rapid double-clicks would otherwise queue transitions and skip frames;
      // flipping straight through keeps the toggle honest under a fast tap.
      if (busy) { flip(); return; }
      busy = true;

      /* A theme change is one crossfade of the whole page - that is the point
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

  /* ---------- Card open/close motion ----------
     Interview Room's question-card motion (portal.js setupQuestionCardMotion),
     applied to this portal's <details> components. One delegated listener
     animates the element's height with the Web Animations API - measure,
     animate, then hand back to native <details> - while the body fades on the
     compositor. Duration scales with distance, so a two-line answer is quick
     and a long one glides instead of whipping open. Both directions use a
     curve that moves on the first frame, so a close answers the click as
     quickly as an open does. */
  var CARD_SELECTOR = "details.prep-question, details.collapse, details.recall, details.dsa-prob, details.dsa-hint";

  function setupCardMotion() {
    if (!Element.prototype.animate) return;
    var EASE = "cubic-bezier(.22, 1, .36, 1)";

    function duration(dist, closing) {
      if (closing) return Math.min(420, Math.max(240, 200 + dist * 0.3));
      return Math.min(620, Math.max(260, 220 + dist * 0.32));
    }
    function bodies(d) {
      return Array.prototype.filter.call(d.children, function (c) { return c.tagName !== "SUMMARY"; }).slice(0, 4);
    }
    function barBottom() {
      var bar = document.querySelector(".topbar");
      return bar ? bar.getBoundingClientRect().bottom : 0;
    }
    function finish(d) {
      d._cardAnim = null;
      (d._cardFades || []).forEach(function (f) { f.cancel(); });
      d._cardFades = null;
      d.classList.remove("is-animating", "is-closing");
      d.style.height = "";
    }

    function run(d, s, opening) {
      var from = d.offsetHeight;
      if (d._cardAnim) { d._cardAnim.cancel(); (d._cardFades || []).forEach(function (f) { f.cancel(); }); }
      d.classList.add("is-animating");
      d.classList.toggle("is-closing", !opening);
      if (opening) d.open = true;
      d.style.height = "";
      var to = opening ? d.offsetHeight : s.offsetHeight + (d.offsetHeight - d.clientHeight);
      /* Closing something taller than the screen: start the collapse from the
         viewport's bottom edge. The part below the fold is invisible anyway,
         so the whole motion plays where it can be seen. */
      if (!opening) {
        var r = d.getBoundingClientRect();
        var visible = window.innerHeight - Math.max(r.top, barBottom()) + 24;
        if (from > visible) from = Math.max(to, visible);
      }
      var ms = duration(Math.abs(to - from), !opening);
      var anim = d.animate({ height: [from + "px", to + "px"] }, { duration: ms, easing: EASE });
      d._cardAnim = anim;
      d._cardFades = bodies(d).map(function (b) {
        return b.animate(
          opening ? { opacity: [0, 1], transform: ["translateY(-6px)", "none"] }
                  : { opacity: [1, 0], transform: ["none", "translateY(-4px)"] },
          { duration: opening ? ms * 0.9 : ms * 0.45, easing: opening ? EASE : "ease-out", fill: "both" }
        );
      });
      function done() {
        if (d._cardAnim !== anim) return; // superseded by a reverse click
        if (!opening) d.open = false;
        anim.cancel();
        finish(d);
      }
      anim.onfinish = done;
      // finish waits for a rendered frame; a hidden tab may never draw one.
      window.setTimeout(done, ms + 80);
    }

    document.addEventListener("click", function (e) {
      var s = e.target.closest && e.target.closest("summary");
      if (!s || e.defaultPrevented || e.button !== 0 || REDUCED) return;
      var d = s.parentElement;
      if (!d || !d.matches(CARD_SELECTOR) || s !== d.querySelector(":scope > summary")) return;
      // Links and buttons inside a summary keep their own behaviour.
      var control = e.target.closest("a, button, input, select, textarea");
      if (control && s.contains(control)) return;
      e.preventDefault();
      var opening = d._cardAnim ? d.classList.contains("is-closing") : !d.open;
      /* Closing a card you have scrolled deep into: bring its header back so
         you do not lose your place when the body folds away above you. */
      if (!opening && d.getBoundingClientRect().top < barBottom()) {
        d.scrollIntoView({ block: "start", behavior: "smooth" });
      }
      run(d, s, opening);
    });
  }

  /* ---------- Phone rendering of pipeline diagrams ----------
     Interview Room never makes a reader swipe sideways through a diagram:
     below 640px it swaps in a second, single-column rendering of the same
     drawing. The prep diagrams here are left-to-right pipelines drawn on a
     ~930-unit canvas, forced to min-width 650px - on a phone that read as a
     cut-off picture. This builds the narrow version from the wide one: nodes
     sharing a column (parallel branches) become one row, stages stack top to
     bottom, and every stage connects to the next. CSS decides which of the
     two is shown, so rotating a tablet needs no re-render. */
  var SVGNS = "http://www.w3.org/2000/svg";

  function buildNarrowDiagrams() {
    document.querySelectorAll(".prep-diagram > svg:not(.dg-narrow)").forEach(function (wide) {
      if (wide.nextElementSibling && wide.nextElementSibling.classList.contains("dg-narrow")) return;
      var nodes = [].map.call(wide.querySelectorAll("g.prep-node"), function (g) {
        var r = g.querySelector("rect");
        var texts = g.querySelectorAll("text");
        if (!r || !texts.length) return null;
        return {
          x: +r.getAttribute("x") + (+r.getAttribute("width") / 2),
          y: +r.getAttribute("y") + (+r.getAttribute("height") / 2),
          title: texts[0].textContent,
          sub: texts[1] ? texts[1].textContent : "",
          cls: g.getAttribute("class")
        };
      }).filter(Boolean);
      if (!nodes.length && wide.querySelector("g.prep-shield")) { narrowShields(wide); return; }
      if (nodes.length < 2) return;

      // Columns of the wide drawing become rows of the narrow one.
      nodes.sort(function (a, b) { return a.x - b.x || a.y - b.y; });
      var rows = [];
      nodes.forEach(function (n) {
        var row = rows[rows.length - 1];
        if (row && Math.abs(row[0].x - n.x) < 45 && row.length < 3) row.push(n);
        else rows.push([n]);
      });
      rows.forEach(function (row) { row.sort(function (a, b) { return a.y - b.y; }); });

      var W = 340, NODE_H = 60, GAP = 34, PAD = 8, COL_GAP = 12;
      var H = PAD * 2 + rows.length * NODE_H + (rows.length - 1) * GAP;
      var svg = document.createElementNS(SVGNS, "svg");
      svg.setAttribute("viewBox", "0 0 " + W + " " + H);
      svg.setAttribute("class", "dg-narrow");
      svg.setAttribute("role", "img");
      svg.setAttribute("aria-label", wide.getAttribute("aria-label") || "Diagram");
      wide.classList.add("dg-wide");

      function el(tag, attrs, text) {
        var e = document.createElementNS(SVGNS, tag);
        Object.keys(attrs).forEach(function (k) { e.setAttribute(k, attrs[k]); });
        if (text != null) e.textContent = text;
        return e;
      }
      // Text that fits its box: shrink rather than spill past the rect.
      function fitSize(text, width, base, weight) {
        var per = weight > 700 ? 0.58 : 0.54;
        return Math.max(10, Math.min(base, (width - 14) / Math.max(1, text.length * per)));
      }

      var boxes = rows.map(function (row, ri) {
        var w = row.length === 1 ? 236 : (W - PAD * 2 - COL_GAP * (row.length - 1)) / row.length;
        var total = w * row.length + COL_GAP * (row.length - 1);
        var x0 = (W - total) / 2;
        var y = PAD + ri * (NODE_H + GAP);
        return row.map(function (n, ci) { return { n: n, x: x0 + ci * (w + COL_GAP), y: y, w: w }; });
      });

      // Connectors first, so boxes sit on top of them.
      for (var i = 0; i < boxes.length - 1; i++) {
        boxes[i].forEach(function (a) {
          boxes[i + 1].forEach(function (b) {
            var x1 = a.x + a.w / 2, y1 = a.y + NODE_H, x2 = b.x + b.w / 2, y2 = b.y - 6;
            var my = (y1 + y2) / 2;
            svg.appendChild(el("path", { class: "dgn-edge", d: "M" + x1 + "," + y1 + " C" + x1 + "," + my + " " + x2 + "," + my + " " + x2 + "," + y2 }));
            svg.appendChild(el("path", { class: "dgn-head", d: "M" + (x2 - 4.5) + "," + (y2 - 1) + " L" + x2 + "," + (y2 + 6) + " L" + (x2 + 4.5) + "," + (y2 - 1) + " Z" }));
          });
        });
      }
      boxes.forEach(function (row) {
        row.forEach(function (b) {
          var g = el("g", { class: b.n.cls });
          var cx = b.x + b.w / 2;
          g.appendChild(el("rect", { x: b.x, y: b.y, width: b.w, height: NODE_H, rx: 14 }));
          var ts = fitSize(b.n.title, b.w, 15, 760);
          g.appendChild(el("text", { x: cx, y: b.y + (b.n.sub ? 26 : 35), "font-size": ts.toFixed(1), style: "font-size:" + ts.toFixed(1) + "px" }, b.n.title));
          if (b.n.sub) {
            var ss = fitSize(b.n.sub, b.w, 11.5, 600);
            g.appendChild(el("text", { class: "sub", x: cx, y: b.y + 45, style: "font-size:" + ss.toFixed(1) + "px" }, b.n.sub));
          }
          svg.appendChild(g);
        });
      });
      wide.insertAdjacentElement("afterend", svg);
    });
  }

  /* Defence-in-depth drawings are nested layers, not a pipeline. On a phone
     each layer becomes a band with its label on top and the next layer
     inset inside it, so the nesting still reads at a glance. */
  function narrowShields(wide) {
    var layers = [].map.call(wide.querySelectorAll("g.prep-shield"), function (g) {
      var t = g.querySelectorAll("text");
      return { cls: g.getAttribute("class"), title: t[0] ? t[0].textContent : "", sub: t[1] ? t[1].textContent : "" };
    });
    if (!layers.length) return;
    var W = 340, INSET = 14, LABEL = 44, CORE = 70;
    var H = layers.length * LABEL + CORE + (layers.length - 1) * INSET + 8;
    var svg = document.createElementNS(SVGNS, "svg");
    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    svg.setAttribute("class", "dg-narrow");
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", wide.getAttribute("aria-label") || "Diagram");
    wide.classList.add("dg-wide");
    layers.forEach(function (l, i) {
      var last = i === layers.length - 1;
      var x = 4 + i * INSET, y = 4 + i * LABEL, w = W - 8 - i * INSET * 2;
      var h = H - 8 - i * (LABEL + INSET);
      var g = document.createElementNS(SVGNS, "g");
      g.setAttribute("class", l.cls);
      var r = document.createElementNS(SVGNS, "rect");
      [["x", x], ["y", y], ["width", w], ["height", h], ["rx", 20]].forEach(function (a) { r.setAttribute(a[0], a[1]); });
      g.appendChild(r);
      // Wrap a long layer label onto two lines rather than shrinking it away.
      var words = l.title.split(" "), lines = [""], max = Math.floor((w - 24) / 6.4);
      words.forEach(function (wd) {
        var cur = lines[lines.length - 1];
        if ((cur + " " + wd).trim().length > max && cur) lines.push(wd); else lines[lines.length - 1] = (cur + " " + wd).trim();
      });
      lines.slice(0, 2).forEach(function (line, li) {
        var t = document.createElementNS(SVGNS, "text");
        t.setAttribute("x", last ? x + w / 2 : x + 14);
        t.setAttribute("y", last ? y + 30 + li * 16 : y + 20 + li * 15);
        t.setAttribute("style", "font-size:12px;" + (last ? "text-anchor:middle" : "text-anchor:start"));
        t.textContent = line;
        g.appendChild(t);
      });
      if (last && l.sub) {
        var s = document.createElementNS(SVGNS, "text");
        s.setAttribute("class", "sub");
        s.setAttribute("x", x + w / 2);
        s.setAttribute("y", y + 52);
        s.setAttribute("style", "font-size:11px;text-anchor:middle");
        s.textContent = l.sub;
        g.appendChild(s);
      }
      svg.appendChild(g);
    });
    wide.insertAdjacentElement("afterend", svg);
  }

  function normalizeMenuBtn() {
    var btn = document.querySelector(".menu-btn");
    if (!btn) return;
    if (!btn.querySelector("svg")) {
      btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg>';
    }
  }

  function ensureTopbarSpacer() {
    var bar = document.querySelector(".topbar");
    if (!bar || bar.querySelector(".topbar-spacer")) return;
    var spacer = document.createElement("div");
    spacer.className = "topbar-spacer";
    var homeBtn = bar.querySelector(".home-btn");
    var focusBtn = bar.querySelector(".focus-btn");
    var readerWrap = bar.querySelector(".reader-wrap");
    var themeBtn = bar.querySelector("[data-theme-toggle]");
    var firstAction = homeBtn || focusBtn || readerWrap || themeBtn;
    if (firstAction) bar.insertBefore(spacer, firstAction);
    else bar.appendChild(spacer);
  }

  function setupScrollClass() {
    var ticking = false;
    function update() {
      ticking = false;
      document.body.classList.toggle("is-scrolled", (window.scrollY || window.pageYOffset || 0) > 8);
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }

  function init() {
    clearLegacyReadingClasses();
    normalizeMenuBtn();
    structureCrumbs();
    // Order matters: each of these inserts itself before the theme toggle, so
    // calling them in reading order lays the bar out Home → Focus → Aa → ☾.
    addHomeButton();
    addFocusButton();
    addReaderControls();
    ensureTopbarSpacer();
    setupScrollClass();
    setupTermDialogs();
    // injectTopicDiagram();  // Learning-loop concept diagram removed site-wide (felt unnecessary).
    setupReadingProgress();
    setupSectionGuidance();
    setupDiagramAnimation();
    buildNarrowDiagrams();
    // setupSoftReveal();  // Interview Room has no entrance motion: content paints where it is.
    setupCardMotion();
    addScrollTop();
    setupThemeColor();
    setupThemeTransition();
    // setupThemeCrossfade();  // Retired - see setupThemeTransition.
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
