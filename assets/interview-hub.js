/* ==========================================================================
   Complete GenAI Interview Hub integration
   - Discovers every HTML page in dk175n/genai_int (with a complete fallback)
   - Fetches the original semantic HTML from raw.githubusercontent.com
   - Re-renders it inside the Learning Hub UI without source-site chrome
   - Rewrites internal navigation so the entire source remains in this section
   - Adds small, topic-aware diagrams to selected interview answers
   - Can cache every page for resilient repeat reading
   ========================================================================== */
(function () {
  "use strict";

  var REPO = "dk175n/genai_int";
  var BRANCH = "main";
  var RAW_BASE = "https://raw.githubusercontent.com/" + REPO + "/" + BRANCH + "/";
  var SITE_BASE = "https://dk175n.github.io/genai_int/";
  var API_TREE = "https://api.github.com/repos/" + REPO + "/git/trees/" + BRANCH + "?recursive=1";
  var CACHE_NAME = "genai-interview-hub-v1";
  var ALLOWED_DIRS = ["pages", "projects", "qbank", "systemdesign", "mocks"];

  var GROUPS = [
    {
      id: "start",
      label: "Start Here",
      icon: "✦",
      blurb: "The source hub overview and recommended entry point.",
      pages: [
        { path: "index.html", title: "GenAI Interview Hub — Home", desc: "Interview-first preparation for senior GenAI, Applied AI, LLM and architecture roles." }
      ]
    },
    {
      id: "core",
      label: "Core Track",
      icon: "C",
      blurb: "Foundations through production system design, with 60-second and senior-level answers.",
      pages: [
        { path: "pages/start-here.html", title: "Start Here", desc: "Position your experience and understand the interview-first learning path." },
        { path: "pages/role-roadmap.html", title: "Role Roadmap", desc: "Map your background to GenAI engineer, Applied AI, platform and architect roles." },
        { path: "pages/30-60-90-plan.html", title: "30 / 60 / 90 Day Plan", desc: "A staged preparation plan that moves from foundations to defensible projects." },
        { path: "pages/core-foundations.html", title: "Core Foundations", desc: "LLM internals, tokens, context, inference and the mental models interviewers test." },
        { path: "pages/prompting-llm-apis.html", title: "Prompting & LLM APIs", desc: "Prompt design, structured output, function calling and reliable API integration." },
        { path: "pages/embeddings-vector-search.html", title: "Embeddings & Vector Search", desc: "Dense and sparse retrieval, ANN/HNSW, hybrid search, reranking and database choices." },
        { path: "pages/rag-mastery.html", title: "RAG Mastery", desc: "Chunk, embed, retrieve, rerank, ground, cite and evaluate a production RAG system." },
        { path: "pages/agentic-ai.html", title: "Agentic AI", desc: "Tools, ReAct, planning, memory, orchestration, state and human control." },
        { path: "pages/llm-evaluation.html", title: "LLM Evaluation", desc: "Golden datasets, groundedness, LLM-as-judge, calibration and eval as CI." },
        { path: "pages/llmops-observability.html", title: "LLMOps & Observability", desc: "Tracing, latency, cost, caching, monitoring, fallbacks and release gates." },
        { path: "pages/guardrails-security.html", title: "Guardrails & Security", desc: "Prompt-injection defense, PII, access control, tool safety and auditability." },
        { path: "pages/genai-system-design.html", title: "GenAI System Design", desc: "A senior framework for requirements, architecture, trade-offs, scale and failure modes." }
      ]
    },
    {
      id: "projects",
      label: "Hands-on Projects",
      icon: "P",
      blurb: "Buildable projects and real production stories you can explain and defend.",
      pages: [
        { path: "projects/build-first-rag.html", title: "Build Your First RAG App", desc: "A compact RAG project with citations, evaluation and an interview explanation." },
        { path: "projects/pdf-qna.html", title: "PDF Q&A", desc: "Ingest, chunk and query PDF documents with grounded answers." },
        { path: "projects/document-qna-rag-app.html", title: "Document Q&A RAG App", desc: "A fuller document assistant with retrieval, grounding and production seams." },
        { path: "projects/customer-support-rag.html", title: "Customer Support RAG", desc: "A support assistant with enterprise knowledge, citations and escalation." },
        { path: "projects/resume-screening-rag.html", title: "Resume Screening RAG", desc: "Evidence-grounded candidate screening with explainable matches." },
        { path: "projects/ats-resume-screening-assistant.html", title: "ATS Resume Screening Assistant", desc: "A practical recruitment copilot and the trade-offs behind its design." },
        { path: "projects/build-first-agent.html", title: "Build Your First Agent", desc: "A bounded tool-using agent with state, validation and failure handling." },
        { path: "projects/email-triage.html", title: "Email Triage Agent", desc: "Classify, route and draft actions while keeping risky steps controlled." },
        { path: "projects/research-assistant.html", title: "Research Assistant", desc: "Plan, retrieve, synthesize and cite across a multi-step research workflow." },
        { path: "projects/sql-agent.html", title: "SQL Agent", desc: "Natural-language analytics with schema grounding and strict SQL safety." },
        { path: "projects/monitoring-dashboard.html", title: "Monitoring Dashboard", desc: "Trace quality, latency and cost with a production-oriented dashboard." },
        { path: "projects/indorama-digitization.html", title: "Indorama Digitization Project", desc: "A real industrial ML/API project mapped to modern GenAI engineering signals." },
        { path: "projects/indorama-interview-questions.html", title: "Indorama Interview Questions", desc: "Questions and strong answers based on the industrial digitization project." },
        { path: "projects/my-real-project-stories.html", title: "My Real Project Stories", desc: "Reusable STAR narratives and architecture stories for project rounds." }
      ]
    },
    {
      id: "design",
      label: "System Design",
      icon: "S",
      blurb: "Worked enterprise architectures with clarifying questions, layers and failure modes.",
      pages: [
        { path: "systemdesign/enterprise-knowledge-assistant.html", title: "Enterprise Knowledge Assistant", desc: "Secure, permission-aware RAG with citations, freshness and observability." },
        { path: "systemdesign/production-rag-platform.html", title: "Production RAG Platform", desc: "A reusable ingestion and serving platform with evaluation and multi-tenancy." },
        { path: "systemdesign/customer-support-bot.html", title: "Customer Support Bot", desc: "Knowledge retrieval, tool use, escalation and customer-safe responses." },
        { path: "systemdesign/document-qa-regulated.html", title: "Regulated Document Q&A", desc: "Audit-ready document intelligence for high-trust domains." },
        { path: "systemdesign/sql-data-agent.html", title: "SQL Data Agent", desc: "Semantic grounding, safe query execution, authorization and result validation." },
        { path: "systemdesign/code-assistant-agent.html", title: "Code Assistant Agent", desc: "Repository context, tools, sandboxing, review loops and evaluation." },
        { path: "systemdesign/multi-agent-workflow.html", title: "Multi-Agent Workflow", desc: "Supervisor, specialist agents, shared state, handoffs and recovery." }
      ]
    },
    {
      id: "mocks",
      label: "Mocks & Revision",
      icon: "M",
      blurb: "Round-specific practice, weekly planning, portfolio preparation and final revision.",
      pages: [
        { path: "mocks/rag-mock.html", title: "RAG Mock Interview", desc: "A realistic RAG deep-dive with probing follow-ups." },
        { path: "mocks/agent-mock.html", title: "Agent Mock Interview", desc: "Tool use, orchestration, safety and failure-mode questioning." },
        { path: "mocks/system-design-mock.html", title: "System Design Mock", desc: "Clarify, estimate, design, trade off and defend a GenAI architecture." },
        { path: "mocks/python-coding-mock.html", title: "Python Coding Mock", desc: "Backend and LLM application coding patterns under interview constraints." },
        { path: "mocks/behavioral-mock.html", title: "Behavioral Mock", desc: "Leadership, ownership, ambiguity, failure and stakeholder stories." },
        { path: "mocks/resume-portfolio.html", title: "Resume & Portfolio", desc: "Turn projects into evidence-rich bullets, demos and interview narratives." },
        { path: "mocks/weekly-plan.html", title: "Weekly Preparation Plan", desc: "A repeatable schedule for study, building, mocks and active recall." },
        { path: "mocks/final-revision.html", title: "Final Revision", desc: "High-signal sheets and last-mile preparation before interviews." }
      ]
    },
    {
      id: "qbank",
      label: "Question Bank",
      icon: "Q",
      blurb: "The complete metadata-tagged bank of model and senior-level answers.",
      pages: [
        { path: "qbank/index.html", title: "Question Bank — All Categories", desc: "Browse the complete question bank by topic, seniority and interview round." },
        { path: "qbank/llm-basics.html", title: "LLM Basics", desc: "Tokens, transformers, context windows, inference, decoding and limitations." },
        { path: "qbank/prompt-engineering.html", title: "Prompt Engineering", desc: "Prompt structure, few-shot patterns, structured output and reliability." },
        { path: "qbank/embeddings-vector-db.html", title: "Embeddings & Vector Databases", desc: "Similarity, ANN/HNSW, metadata filtering, hybrid retrieval and reranking." },
        { path: "qbank/rag.html", title: "RAG", desc: "Chunking, retrieval, grounding, citations, evaluation and failure diagnosis." },
        { path: "qbank/agentic-ai.html", title: "Agentic AI", desc: "Tools, planning, memory, state, orchestration, guardrails and recovery." },
        { path: "qbank/frameworks.html", title: "Frameworks", desc: "LangChain, LlamaIndex, LangGraph and framework-selection trade-offs." },
        { path: "qbank/llm-evaluation.html", title: "LLM Evaluation", desc: "Golden sets, judges, faithfulness, relevance, calibration and CI." },
        { path: "qbank/llmops.html", title: "LLMOps", desc: "Tracing, monitoring, prompt versions, releases, cost and performance." },
        { path: "qbank/security-guardrails.html", title: "Security & Guardrails", desc: "Injection defense, authorization, PII, secrets, tool safety and governance." },
        { path: "qbank/system-design.html", title: "System Design", desc: "Architecture, scalability, availability, tenancy and operational trade-offs." },
        { path: "qbank/python-coding.html", title: "Python Coding", desc: "Async services, APIs, retries, validation, queues and testable LLM code." },
        { path: "qbank/behavioral.html", title: "Behavioral", desc: "Ownership, leadership, conflict, impact, failure and stakeholder management." }
      ]
    }
  ];

  var diagramTemplates = {
    rag: {
      title: "RAG answer map",
      note: "Name both halves and evaluate retrieval separately from generation.",
      nodes: [
        ["Index", "load · chunk · embed"],
        ["Retrieve", "hybrid · filters · rerank"],
        ["Ground", "context · citations · abstain"],
        ["Generate", "answer · validate"],
        ["Evaluate", "recall@k · faithfulness"]
      ]
    },
    agent: {
      title: "Bounded agent loop",
      note: "A senior answer includes stop conditions, tool validation and recovery—not only planning.",
      nodes: [
        ["Goal", "task + constraints"],
        ["Plan", "choose next action"],
        ["Tool", "scoped execution"],
        ["Observe", "validate result"],
        ["Loop / Stop", "recover or answer"]
      ]
    },
    eval: {
      title: "Evaluation and release gate",
      note: "Split offline regression tests from sampled production monitoring.",
      nodes: [
        ["Golden set", "queries + expected evidence"],
        ["Retrieval", "recall · MRR · nDCG"],
        ["Generation", "faithfulness · relevance"],
        ["Release gate", "threshold + review"],
        ["Production", "sample · drift · feedback"]
      ]
    },
    security: {
      title: "Defense-in-depth path",
      note: "Treat retrieved text and tool output as untrusted data, not instructions.",
      nodes: [
        ["Input", "auth · rate limits"],
        ["Inspect", "injection · PII · policy"],
        ["Scope", "ACL retrieval · least privilege"],
        ["Validate", "tool args · output"],
        ["Audit", "trace · approve · alert"]
      ]
    },
    embedding: {
      title: "Vector retrieval path",
      note: "Dense semantic search is commonly paired with sparse search and reranking.",
      nodes: [
        ["Text", "query or chunk"],
        ["Embed", "dense vector"],
        ["Search", "ANN + metadata"],
        ["Hybrid", "dense + sparse"],
        ["Rerank", "best evidence"]
      ]
    },
    llmops: {
      title: "LLMOps feedback loop",
      note: "Trace every model, retrieval and tool span so quality, cost and latency are diagnosable.",
      nodes: [
        ["Request", "user + context"],
        ["Trace", "retrieval · model · tools"],
        ["Measure", "quality · cost · latency"],
        ["Alert", "SLO · drift · failure"],
        ["Improve", "prompt · model · data"]
      ]
    },
    system: {
      title: "GenAI system layers",
      note: "A strong system-design answer connects serving, data, safety, evaluation and operations.",
      nodes: [
        ["Clients", "web · API · channels"],
        ["Gateway", "auth · quotas · routing"],
        ["Orchestrate", "prompt · state · policy"],
        ["Intelligence", "LLM · RAG · tools"],
        ["Operate", "eval · trace · fallback"]
      ]
    },
    python: {
      title: "Production Python request path",
      note: "Keep handlers thin; isolate providers, validate boundaries and make retries idempotent.",
      nodes: [
        ["FastAPI", "schema + auth"],
        ["Service", "business policy"],
        ["Async I/O", "LLM · DB · tools"],
        ["Validate", "Pydantic + guards"],
        ["Observe", "logs · traces · tests"]
      ]
    }
  };

  var els = {};
  var currentPath = "";
  var currentGroup = "all";
  var searchTerm = "";
  var forceRefreshNext = false;

  function $(selector, root) { return (root || document).querySelector(selector); }
  function $all(selector, root) { return Array.prototype.slice.call((root || document).querySelectorAll(selector)); }
  function escapeHTML(value) {
    return String(value == null ? "" : value).replace(/[&<>'"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[c];
    });
  }
  function humanize(path) {
    var file = path.split("/").pop().replace(/\.html?$/i, "");
    if (file === "index") return "Overview";
    return file.split(/[-_]+/).map(function (word) {
      if (/^(rag|llm|llmops|q&a|sql|ats|api|pdf|ai|mcp)$/i.test(word)) return word.toUpperCase();
      return word.charAt(0).toUpperCase() + word.slice(1);
    }).join(" ");
  }
  function sourceURL(path) { return SITE_BASE + path; }
  function rawURL(path) { return RAW_BASE + path.split("/").map(encodeURIComponent).join("/"); }
  function isSupportedPath(path) {
    if (path === "index.html") return true;
    return ALLOWED_DIRS.some(function (dir) { return path.indexOf(dir + "/") === 0; }) && /\.html?$/i.test(path);
  }
  function groupForPath(path) {
    if (path === "index.html") return GROUPS[0];
    var dir = path.split("/")[0];
    var id = { pages: "core", projects: "projects", qbank: "qbank", systemdesign: "design", mocks: "mocks" }[dir];
    return GROUPS.find(function (group) { return group.id === id; }) || GROUPS[0];
  }
  function allPages() {
    return GROUPS.reduce(function (out, group) {
      group.pages.forEach(function (page) {
        page.groupId = group.id;
        page.groupLabel = group.label;
        page.icon = group.icon;
        out.push(page);
      });
      return out;
    }, []);
  }
  function pageForPath(path) { return allPages().find(function (page) { return page.path === path; }); }

  function setStatus(text, state) {
    if (!els.status) return;
    els.status.textContent = text;
    var note = els.status.closest(".ih-source-note");
    if (note) {
      note.classList.toggle("is-working", state === "working");
      note.classList.toggle("is-error", state === "error");
    }
  }

  function mergeDiscoveredPaths(paths) {
    var known = {};
    allPages().forEach(function (page) { known[page.path] = true; });
    paths.filter(isSupportedPath).forEach(function (path) {
      if (known[path]) return;
      var group = groupForPath(path);
      group.pages.push({ path: path, title: humanize(path), desc: "Newly discovered source page from the complete interview repository." });
      known[path] = true;
    });
  }

  async function discoverPages() {
    try {
      var response = await fetch(API_TREE, { headers: { Accept: "application/vnd.github+json" }, cache: "no-store" });
      if (!response.ok) throw new Error("GitHub tree returned " + response.status);
      var data = await response.json();
      var paths = (data.tree || []).filter(function (item) { return item.type === "blob" && /\.html?$/i.test(item.path); }).map(function (item) { return item.path; });
      mergeDiscoveredPaths(paths);
      return { live: true, count: allPages().length };
    } catch (error) {
      return { live: false, count: allPages().length, error: error };
    }
  }

  function renderCategoryStrip() {
    var items = [{ id: "all", label: "All", icon: "◎", pages: allPages() }].concat(GROUPS);
    els.categoryStrip.innerHTML = items.map(function (group) {
      var count = group.id === "all" ? allPages().length : group.pages.length;
      return '<button class="ih-category-chip' + (currentGroup === group.id ? " active" : "") + '" type="button" data-ih-category="' + escapeHTML(group.id) + '">' +
        '<span>' + escapeHTML(group.icon || "•") + '</span><span>' + escapeHTML(group.label) + '</span><span class="count">' + count + '</span></button>';
    }).join("");
  }

  function pageMatches(page, group) {
    if (currentGroup !== "all" && page.groupId !== currentGroup) return false;
    if (!searchTerm) return true;
    var haystack = [page.title, page.path, page.desc, group.label, group.blurb].join(" ").toLowerCase();
    return searchTerm.split(/\s+/).every(function (word) { return !word || haystack.indexOf(word) !== -1; });
  }

  function renderCatalog() {
    var visible = 0;
    var html = "";
    GROUPS.forEach(function (group) {
      var pages = group.pages.map(function (page) {
        page.groupId = group.id;
        page.groupLabel = group.label;
        page.icon = group.icon;
        return page;
      }).filter(function (page) { return pageMatches(page, group); });
      if (!pages.length) return;
      visible += pages.length;
      html += '<section class="ih-group" id="ih-group-' + escapeHTML(group.id) + '">';
      html += '<div class="ih-group-head"><div><div class="eyebrow"><span class="dot"></span>' + escapeHTML(group.label) + '</div><h2>' + escapeHTML(group.label) + '</h2></div><p>' + escapeHTML(group.blurb) + '</p></div>';
      html += '<div class="ih-page-grid">';
      pages.forEach(function (page) {
        html += '<a class="ih-page-card" href="?page=' + encodeURIComponent(page.path) + '" data-ih-page="' + escapeHTML(page.path) + '">' +
          '<div class="pc-top"><span class="pc-icon">' + escapeHTML(group.icon) + '</span><span class="pc-path">' + escapeHTML(page.path) + '</span></div>' +
          '<h3>' + escapeHTML(page.title) + '</h3><p>' + escapeHTML(page.desc || "Open the complete source page.") + '</p><span class="pc-arrow">→</span></a>';
      });
      html += "</div></section>";
    });
    if (!visible) html = '<div class="ih-empty"><strong>No matching interview content</strong><p>Try a broader topic such as RAG, agents, evaluation, security or system design.</p></div>';
    els.catalog.innerHTML = html;
    renderCategoryStrip();
  }

  function showCatalog(options) {
    options = options || {};
    currentPath = "";
    els.reader.hidden = true;
    els.catalog.hidden = false;
    els.hero.hidden = false;
    els.crumb.textContent = "Complete Interview Hub";
    document.title = "Complete GenAI Interview Hub — GenAI Learning Hub";
    if (options.push !== false) history.pushState({ page: "" }, "", location.pathname);
    renderCatalog();
    if (options.scroll !== false) window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function chooseDiagramType(text, path) {
    var value = (text + " " + path).toLowerCase();
    if (/prompt injection|guardrail|security|pii|rbac|access control|authorization|secret|jailbreak/.test(value)) return "security";
    if (/evaluation|evaluate|metric|golden|judge|faithful|recall@|mrr|ndcg|release gate/.test(value)) return "eval";
    if (/embedding|vector|hnsw|ann|cosine|hybrid search|rerank/.test(value)) return "embedding";
    if (/agent|tool calling|react|planner|orchestrat|langgraph|multi-agent|workflow/.test(value)) return "agent";
    if (/rag|retriev|chunk|ground|citation|fine-tun/.test(value)) return "rag";
    if (/llmops|observab|trace|latency|cost|cache|monitor|slo|production/.test(value)) return "llmops";
    if (/python|fastapi|async|pydantic|celery|queue|backend|api/.test(value)) return "python";
    if (/system design|architecture|scale|multi-tenant|availability|platform|design/.test(value)) return "system";
    return "";
  }

  function diagramHTML(type, label) {
    var diagram = diagramTemplates[type];
    if (!diagram) return "";
    var nodes = diagram.nodes.map(function (node, index) {
      return (index ? '<span class="ihd-arrow" aria-hidden="true">→</span>' : "") +
        '<div class="ihd-node' + (index === 1 || index === diagram.nodes.length - 1 ? " accent" : "") + '"><strong>' + escapeHTML(node[0]) + '</strong>' + escapeHTML(node[1]) + '</div>';
    }).join("");
    return '<div class="ih-answer-diagram" role="figure" aria-label="' + escapeHTML(label || diagram.title) + '">' +
      '<div class="ihd-head"><span class="ihd-title">' + escapeHTML(diagram.title) + '</span><span class="ihd-badge">Generated explainer</span></div>' +
      '<div class="ihd-flow">' + nodes + '</div><p class="ihd-note">' + escapeHTML(diagram.note) + '</p></div>';
  }

  function injectQuestionDiagrams(root, path) {
    var used = {};
    var inserted = 0;
    $all("details.qcard", root).forEach(function (card, index) {
      if (inserted >= 5) return;
      var question = ($("summary", card) || card).textContent.trim();
      var type = chooseDiagramType(question, path);
      if (!type && index === 0) type = chooseDiagramType("", path);
      if (!type || used[type]) return;
      var body = $(".q-body", card);
      if (!body) return;
      var senior = $(".senioranswer", body);
      var anchor = senior || $("p", body) || body.firstElementChild;
      var wrapper = document.createElement("div");
      wrapper.innerHTML = diagramHTML(type, question);
      var diagram = wrapper.firstElementChild;
      if (!diagram) return;
      if (anchor && anchor.parentNode) anchor.insertAdjacentElement("afterend", diagram);
      else body.appendChild(diagram);
      used[type] = true;
      inserted += 1;
    });
  }

  function renderSimpleMermaidDiagrams(root) {
    $all(".mermaid-src pre code", root).forEach(function (code) {
      var source = code.textContent || "";
      if (!/flowchart|graph\s+(TD|LR)/i.test(source)) return;
      var labels = [];
      var seen = {};
      var regex = /\b([A-Za-z][\w-]*)\s*[\[({]{1,2}([^\]\)}]+)[\]\)}]{1,2}/g;
      var match;
      while ((match = regex.exec(source)) && labels.length < 7) {
        var text = match[2].replace(/["']/g, "").replace(/<br\s*\/?\s*>/gi, " · ").trim();
        if (!text || seen[text]) continue;
        seen[text] = true;
        labels.push(text);
      }
      if (labels.length < 3) return;
      var custom = { title: "Rendered architecture flow", note: "A visual reading aid generated from the Mermaid source on this page.", nodes: labels.map(function (text) { return [text, ""]; }) };
      var old = diagramTemplates.__mermaid;
      diagramTemplates.__mermaid = custom;
      var wrapper = document.createElement("div");
      wrapper.innerHTML = diagramHTML("__mermaid", custom.title);
      diagramTemplates.__mermaid = old;
      var block = code.closest(".code-block");
      if (block && wrapper.firstElementChild) block.insertAdjacentElement("beforebegin", wrapper.firstElementChild);
    });
  }

  function setupDynamicCopy(root) {
    $all(".code-block", root).forEach(function (block) {
      var button = $(".copy-btn", block);
      var code = $("code", block);
      if (!code) return;
      if (!button) {
        button = document.createElement("button");
        button.className = "copy-btn";
        button.type = "button";
        button.textContent = "Copy";
        var head = $(".code-head", block);
        if (head) head.appendChild(button);
      }
      if (!button || button.dataset.ihCopyReady) return;
      button.dataset.ihCopyReady = "true";
      button.addEventListener("click", function () {
        var text = code.innerText;
        var done = function () {
          button.textContent = "Copied!";
          button.classList.add("copied");
          window.setTimeout(function () { button.textContent = "Copy"; button.classList.remove("copied"); }, 1500);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done).catch(function () {});
        else {
          var area = document.createElement("textarea");
          area.value = text;
          document.body.appendChild(area);
          area.select();
          try { document.execCommand("copy"); } catch (error) {}
          area.remove();
          done();
        }
      });
    });
  }

  function normalizeSourcePath(href, fromPath) {
    if (!href || href.charAt(0) === "#" || /^(mailto:|tel:|javascript:|data:)/i.test(href)) return null;
    try {
      var absolute = new URL(href, sourceURL(fromPath));
      if (absolute.hostname === "dk175n.github.io" && absolute.pathname.indexOf("/genai_int/") === 0) {
        var sitePath = decodeURIComponent(absolute.pathname.slice("/genai_int/".length));
        if (isSupportedPath(sitePath)) return { path: sitePath || "index.html", hash: absolute.hash };
      }
      if (absolute.hostname === "raw.githubusercontent.com" && absolute.pathname.indexOf("/dk175n/genai_int/main/") === 0) {
        var rawPath = decodeURIComponent(absolute.pathname.slice("/dk175n/genai_int/main/".length));
        if (isSupportedPath(rawPath)) return { path: rawPath, hash: absolute.hash };
      }
    } catch (error) {}
    return null;
  }

  function sanitizeAndRewrite(root, fromPath) {
    $all("script, style, link[rel='stylesheet'], meta, base", root).forEach(function (node) { node.remove(); });
    $all("*", root).forEach(function (node) {
      Array.prototype.slice.call(node.attributes || []).forEach(function (attr) {
        if (/^on/i.test(attr.name)) node.removeAttribute(attr.name);
      });
    });

    $all("a[href]", root).forEach(function (link) {
      var href = link.getAttribute("href");
      if (!href || href.charAt(0) === "#") return;
      var internal = normalizeSourcePath(href, fromPath);
      if (internal) {
        link.setAttribute("href", "?page=" + encodeURIComponent(internal.path) + (internal.hash || ""));
        link.dataset.ihInternal = internal.path;
        if (internal.hash) link.dataset.ihHash = internal.hash;
      } else {
        try { link.href = new URL(href, sourceURL(fromPath)).href; } catch (error) {}
        link.target = "_blank";
        link.rel = "noopener noreferrer";
      }
    });

    [["img", "src"], ["source", "src"], ["video", "poster"]].forEach(function (pair) {
      $all(pair[0] + "[" + pair[1] + "]", root).forEach(function (node) {
        var value = node.getAttribute(pair[1]);
        try { node.setAttribute(pair[1], new URL(value, sourceURL(fromPath)).href); } catch (error) {}
      });
    });

    $all("form", root).forEach(function (form) {
      form.addEventListener("submit", function (event) { event.preventDefault(); });
    });
  }

  async function networkText(path, force) {
    var url = rawURL(path);
    var options = { mode: "cors", credentials: "omit", cache: force ? "reload" : "default" };
    var response = await fetch(url, options);
    if (!response.ok) throw new Error("Source returned HTTP " + response.status);
    if ("caches" in window) {
      try {
        var cache = await caches.open(CACHE_NAME);
        await cache.put(url, response.clone());
      } catch (error) {}
    }
    return response.text();
  }

  async function cachedText(path) {
    if (!("caches" in window)) return null;
    try {
      var cache = await caches.open(CACHE_NAME);
      var response = await cache.match(rawURL(path));
      return response ? response.text() : null;
    } catch (error) { return null; }
  }

  async function fetchSource(path, force) {
    try {
      return { html: await networkText(path, force), cached: false };
    } catch (networkError) {
      var cached = await cachedText(path);
      if (cached) return { html: cached, cached: true, networkError: networkError };
      throw networkError;
    }
  }

  function sourceMainFromHTML(html) {
    var parsed = new DOMParser().parseFromString(html, "text/html");
    return parsed.querySelector("main.content") || parsed.querySelector("main") || parsed.body;
  }

  function renderFetchError(path, error) {
    els.imported.innerHTML = '<div class="ih-fetch-error"><h3>Could not load this source page</h3>' +
      '<p>The page remains available at the original interview hub. This usually means the browser is offline or a network policy blocked the raw GitHub request.</p>' +
      '<p><button class="btn" type="button" data-ih-retry>Retry</button><a class="btn ghost" href="' + escapeHTML(sourceURL(path)) + '" target="_blank" rel="noopener">Open original ↗</a></p>' +
      '<small>' + escapeHTML(error && error.message ? error.message : String(error)) + '</small></div>';
    var retry = $("[data-ih-retry]", els.imported);
    if (retry) retry.addEventListener("click", function () { openPage(path, { push: false, force: true }); });
  }

  function bindImportedLinks(root) {
    if (root.dataset.ihLinksReady) return;
    root.dataset.ihLinksReady = "true";
    root.addEventListener("click", function (event) {
      var link = event.target.closest && event.target.closest("a[data-ih-internal]");
      if (!link) return;
      event.preventDefault();
      openPage(link.dataset.ihInternal, { hash: link.dataset.ihHash || "" });
    });
  }

  async function openPage(path, options) {
    options = options || {};
    if (!isSupportedPath(path)) {
      showCatalog();
      return;
    }
    currentPath = path;
    var fallbackPage = pageForPath(path) || { title: humanize(path), path: path, groupLabel: groupForPath(path).label };
    els.catalog.hidden = true;
    els.reader.hidden = false;
    els.hero.hidden = true;
    els.loading.hidden = false;
    els.imported.innerHTML = "";
    els.sourcePath.textContent = path;
    els.original.href = sourceURL(path);
    els.crumb.textContent = fallbackPage.groupLabel + " / " + fallbackPage.title;
    setStatus("Fetching the latest complete source page…", "working");

    if (options.push !== false) {
      var url = location.pathname + "?page=" + encodeURIComponent(path) + (options.hash || "");
      history.pushState({ page: path }, "", url);
    }

    try {
      var result = await fetchSource(path, options.force || forceRefreshNext);
      forceRefreshNext = false;
      var sourceMain = sourceMainFromHTML(result.html);
      var imported = document.createElement("div");
      imported.innerHTML = sourceMain.innerHTML;
      sanitizeAndRewrite(imported, path);
      renderSimpleMermaidDiagrams(imported);
      injectQuestionDiagrams(imported, path);
      els.imported.replaceChildren.apply(els.imported, Array.prototype.slice.call(imported.childNodes));
      setupDynamicCopy(els.imported);
      bindImportedLinks(els.imported);

      var titleNode = $("h1", els.imported);
      var title = titleNode ? titleNode.textContent.trim() : fallbackPage.title;
      els.crumb.textContent = (fallbackPage.groupLabel || groupForPath(path).label) + " / " + title;
      document.title = title + " — GenAI Learning Hub";
      setStatus((result.cached ? "Offline cache loaded" : "Live source loaded") + " · complete page · " + path, result.cached ? "working" : "ok");
      els.loading.hidden = true;

      var hash = options.hash || location.hash;
      if (hash) {
        window.setTimeout(function () {
          var target = document.getElementById(hash.replace(/^#/, ""));
          if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 50);
      } else if (options.scroll !== false) {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (error) {
      els.loading.hidden = true;
      renderFetchError(path, error);
      setStatus("Unable to fetch the source page · use Retry or Open original", "error");
    }
  }

  async function cacheAllPages() {
    var pages = allPages();
    var button = els.sync;
    var complete = 0;
    var failed = 0;
    var cursor = 0;
    button.disabled = true;
    setStatus("Caching 0 / " + pages.length + " interview pages…", "working");

    async function worker() {
      while (cursor < pages.length) {
        var index = cursor++;
        try { await networkText(pages[index].path, false); }
        catch (error) { failed += 1; }
        complete += 1;
        button.textContent = "Caching " + complete + "/" + pages.length;
        setStatus("Caching " + complete + " / " + pages.length + " interview pages" + (failed ? " · " + failed + " failed" : "") + "…", "working");
      }
    }

    await Promise.all([worker(), worker(), worker(), worker()]);
    button.disabled = false;
    button.textContent = failed ? "Retry cache" : "Cached ✓";
    setStatus(failed ? (pages.length - failed) + " pages cached · " + failed + " could not be fetched" : "All " + pages.length + " interview pages cached for repeat reading", failed ? "error" : "ok");
  }

  function bindControls() {
    els.categoryStrip.addEventListener("click", function (event) {
      var button = event.target.closest && event.target.closest("[data-ih-category]");
      if (!button) return;
      currentGroup = button.dataset.ihCategory;
      renderCatalog();
      var first = currentGroup === "all" ? null : document.getElementById("ih-group-" + currentGroup);
      if (first) first.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    els.catalog.addEventListener("click", function (event) {
      var card = event.target.closest && event.target.closest("[data-ih-page]");
      if (!card) return;
      event.preventDefault();
      openPage(card.dataset.ihPage);
    });

    els.search.addEventListener("input", function () {
      searchTerm = els.search.value.trim().toLowerCase();
      if (currentPath) showCatalog({ push: false, scroll: false });
      renderCatalog();
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "/" && !/input|textarea|select/i.test(document.activeElement.tagName)) {
        event.preventDefault();
        els.search.focus();
      }
      if (event.key === "Escape" && document.activeElement === els.search) {
        els.search.value = "";
        searchTerm = "";
        els.search.blur();
        renderCatalog();
      }
    });

    els.home.addEventListener("click", function () { showCatalog(); });
    els.back.addEventListener("click", function () { showCatalog(); });
    els.refresh.addEventListener("click", function () {
      if (currentPath) openPage(currentPath, { push: false, force: true, scroll: false });
      else discoverPages().then(function (result) {
        renderCatalog();
        setStatus((result.live ? "Live repository refreshed" : "Using the complete built-in catalog") + " · " + result.count + " pages", result.live ? "ok" : "error");
      });
    });
    els.sync.addEventListener("click", cacheAllPages);

    window.addEventListener("popstate", function () {
      var params = new URLSearchParams(location.search);
      var path = params.get("page");
      if (path) openPage(path, { push: false, hash: location.hash, scroll: false });
      else showCatalog({ push: false, scroll: false });
    });
  }

  async function init() {
    els.hero = $("[data-ih-landing-hero]");
    els.search = $("[data-ih-search]");
    els.catalog = $("[data-ih-catalog]");
    els.reader = $("[data-ih-reader]");
    els.imported = $("[data-ih-imported]");
    els.loading = $("[data-ih-loading]");
    els.status = $("[data-ih-status]");
    els.categoryStrip = $("[data-ih-category-strip]");
    els.pageCount = $("[data-ih-page-count]");
    els.crumb = $("[data-ih-crumb]");
    els.sourcePath = $("[data-ih-source-path]");
    els.original = $("[data-ih-original]");
    els.home = $("[data-ih-home]");
    els.back = $("[data-ih-back]");
    els.refresh = $("[data-ih-refresh]");
    els.sync = $("[data-ih-sync]");
    if (!els.catalog || !els.reader) return;

    bindControls();
    renderCatalog();
    setStatus("Checking the live repository for every interview page…", "working");
    var discovery = await discoverPages();
    els.pageCount.textContent = discovery.count + " source pages";
    renderCatalog();
    setStatus(discovery.live ? "Complete live catalog ready · " + discovery.count + " source pages discovered" : "Complete built-in catalog ready · live discovery unavailable", discovery.live ? "ok" : "error");

    var params = new URLSearchParams(location.search);
    var path = params.get("page");
    if (path) openPage(path, { push: false, hash: location.hash, scroll: false });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
