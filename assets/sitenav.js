/* =========================================================================
   GenAI Learning Hub — Unified site navigation (Option C)
   ONE sidebar shared by every page across all folders. Content stays grouped
   and visually distinct by source folder; nothing is flattened into a single
   mixed list. No iframes — every link is a normal navigation.

   This module owns the sidebar (.nav) and the cross-site search box. It builds
   from a single central registry of GROUPS → pages, each page carrying a
   canonical path relative to the SITE ROOT (the folder that contains
   modules/, interview-prep/ and teach-agents/). At run time it detects how
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
      id: "studyplan",
      label: "Study Plan",
      mark: "P",
      blurb: "Hours, order and weekly cadence",
      home: "study-plan.html",
      direct: true,
      pages: [
        { path: "study-plan.html", title: "Study Plan", num: "P", kw: "study plan roadmap hours schedule time weekly daily ai engineer interview route" }
      ]
    },
    {
      id: "mastery",
      label: "GenAI Mastery",
      mark: "G",
      blurb: "DS → Senior GenAI Engineer",
      home: "index.html",
      pages: [
        // Foundations. Module 00 ("The Basics") is deliberately not listed: it
        // is no longer part of the reading path, so it is out of the sidebar,
        // the search index and the reading order on the hub. Its file stays on
        // disk — the same treatment the retired RAG modules and the old
        // teach-agents lessons get above — so nothing 404s for a bookmark.
        { path: "modules/01_foundations.html", title: "Foundations of LLMs", num: "01", track: "Foundations", kw: "llm token transformer attention prompt context window temperature decoding next token prediction" },
        { path: "modules/02_transformers.html", title: "Transformers Deep Dive", num: "02", track: "Foundations", kw: "transformer attention self-attention multi-head positional encoding qkv softmax feedforward residual layernorm" },
        { path: "modules/03_local_llms.html", title: "Local LLMs & Ollama", num: "03", track: "Foundations", kw: "ollama local llama qwen gemma quantization gguf gpu vram modelfile" },
        // Retrieval
        { path: "modules/04_embeddings.html", title: "Embeddings", num: "04", track: "Retrieval", kw: "embedding vector cosine similarity semantic dense sparse sentence-transformers" },
        { path: "modules/05_vector_databases.html", title: "Vector Databases", num: "05", track: "Retrieval", kw: "vector database faiss qdrant pgvector hnsw ann index recall" },
        // RAG lives in exactly one place in this portal — this page. It is the
        // full sequence: what RAG is, then chunking, hybrid retrieval,
        // reranking and evaluation. The old 06_rag_basics / 07_advanced_rag
        // modules and the learn-rag-mcp guide said the same things again in
        // different words, so they are no longer part of the reading path.
        { path: "rag-deep-dive.html", title: "RAG, End-to-End", num: "06", track: "Retrieval", kw: "rag retrieval augmented generation basics chunking context grounding citations hybrid search reranking query expansion parent document graph rag agentic rag evaluation pipeline end to end" },
        // Agents
        { path: "modules/08_agents.html", title: "Agentic AI", num: "08", track: "Agents", kw: "agent react tool calling planning reflection memory loop" },
        { path: "modules/09_mcp.html", title: "Model Context Protocol", num: "09", track: "Agents", kw: "mcp model context protocol server client tool resource prompt" },
        // Frameworks
        { path: "modules/10_langchain.html", title: "LangChain", num: "10", track: "Frameworks", kw: "langchain lcel chains runnable retriever memory" },
        { path: "modules/11_llamaindex.html", title: "LlamaIndex", num: "11", track: "Frameworks", kw: "llamaindex index node document query engine" },
        { path: "modules/12_langgraph.html", title: "LangGraph", num: "12", track: "Frameworks", kw: "langgraph state node edge conditional routing parallel human in the loop asyncio pydantic" },
        { path: "langgraph-asyncio.html", title: "AsyncIO for LangGraph", num: "12A", track: "Frameworks", kw: "python asyncio event loop coroutine task taskgroup gather cancellation timeout semaphore backpressure ainvoke astream async node interview" },
        { path: "langgraph-pydantic.html", title: "Pydantic for LangGraph", num: "12B", track: "Frameworks", kw: "pydantic v2 basemodel field validator model validator configdict strict schema discriminated union langgraph state interview" },
        { path: "modules/13_multi_agents.html", title: "Multi-Agent Systems", num: "13", track: "Frameworks", kw: "crewai multi agent orchestration supervisor handoff" },
        // Production
        { path: "modules/14_production_genai.html", title: "Production GenAI", num: "14", track: "Production", kw: "observability tracing cost guardrails rate limiting evaluation testing security" },
        { path: "modules/15_capstone_projects.html", title: "Capstone Projects", num: "15", track: "Production", kw: "capstone project pdf rag sql agent elasticsearch mcp multi-agent enterprise" }
      ]
    },
    {
      id: "agents",
      label: "Understanding AI Agents",
      mark: "A",
      blurb: "Interview-focused agent course",
      home: "teach-agents/index.html",
      /* The complete 15-lesson course. The previous industrial-domain version
         was removed in full -- its lessons, code and fixtures are gone, and the
         two pieces of reusable prose were carried into CURRICULUM.md. */
      pages: [
        { path: "teach-agents/index.html", title: "Course index", num: "✦", kw: "agents course overview index start" },
        { path: "teach-agents/lessons/0001-llm-mechanics.html", title: "LLM mechanics", num: "01", kw: "llm messages roles context window tokens temperature determinism structured output tool calling brain abstraction support triage" },
        { path: "teach-agents/lessons/0002-agent-loop.html", title: "The agent loop", num: "02", kw: "agent loop observe decide act termination max steps workflow chain prompt when not to search_kb trace" },
        { path: "teach-agents/lessons/0003-tool-calling.html", title: "Tools & validation", num: "03", kw: "tool schema validation arguments typed unknown tool parallel sequential read_ticket lookup_order trusted untrusted injection" },
        { path: "teach-agents/lessons/0004-reasoning-patterns.html", title: "Reasoning patterns", num: "04", kw: "react plan and execute reflection routing orchestration patterns draft_reply cost model calls" },
        { path: "teach-agents/lessons/0005-retrieval.html", title: "Retrieval as a tool", num: "05", kw: "retrieval rag chunking bm25 rerank citations grounding relevance floor hybrid embeddings" },
        { path: "teach-agents/lessons/0006-context-memory.html", title: "Context & memory", num: "06", kw: "context window token budget compaction summarisation truncation state versus memory recall long term" },
        { path: "teach-agents/lessons/0007-reliability.html", title: "Reliability", num: "07", kw: "timeout retry budget exponential backoff loop detection oscillation partial failure escalate safe termination circuit breaker" },
        { path: "teach-agents/lessons/0008-irreversible-actions.html", title: "Irreversible actions", num: "08", kw: "refund idempotency key approval token human in the loop audit log policy dry run duplicate payment money" },
        { path: "teach-agents/lessons/0009-security.html", title: "Security & guardrails", num: "09", kw: "prompt injection indirect retrieval poisoning least privilege argument authorisation confused deputy exfiltration output validation" },
        { path: "teach-agents/lessons/0010-evaluation.html", title: "Agent evaluation", num: "10", kw: "golden set outcome trajectory evaluation regression suite llm as judge rubric adversarial unsafe trajectory coverage" },
        { path: "teach-agents/lessons/0011-tracing-cost.html", title: "Tracing, latency & cost", num: "11", kw: "trace span correlation id token accounting cost per run quadratic prompt caching model routing p99 debug" },
        { path: "teach-agents/lessons/0012-mcp.html", title: "MCP & the tool boundary", num: "12", kw: "mcp model context protocol host client server json rpc capability discovery allowlist withheld tool trust boundary" },
        { path: "teach-agents/lessons/0013-multi-agent.html", title: "Multi-agent & A2A", num: "13", kw: "multi agent supervisor specialist a2a agent card task lifecycle artifact delegation handoff brief cost measured" },
        { path: "teach-agents/lessons/0014-deployment.html", title: "Deployment & operations", num: "14", kw: "framework comparison langgraph checkpointer stateless service durable run state resume versioning prompt rollout slo runbook" },
        { path: "teach-agents/lessons/0015-capstone.html", title: "Interview capstone", num: "15", kw: "capstone deliverables architecture threat model eval report drills whiteboard rapid fire coding round behavioural framing" }
      ]
    },
    {
      id: "deepdives",
      label: "Deep Dives",
      mark: "D",
      blurb: "Focused topic guides",
      home: "agent-protocols.html",
      pages: [
        // RAG, End-to-End is deliberately NOT listed here. It is the single
        // RAG page and it lives in the GenAI Mastery reading sequence above,
        // at step 06, so there is exactly one place to learn RAG.
        { path: "agent-protocols.html", title: "Agent Protocols — MCP · A2A · A2UI", num: "🔗", kw: "agent protocols mcp model context protocol a2a agent2agent agent to agent a2ui agent to ui agent user interface generative ui ag-ui copilotkit interoperability agent card well-known task lifecycle input required auth required artifact message part skill json-rpc grpc rest streaming push notification webhook surface component catalog data model json pointer declarative mcp apps extensions stateless 2026-07-28 tools resources prompts linux foundation ap2 agent payments protocol comparison interview" },
        { path: "llm-evals.html", title: "LLM Evals", num: "✅", kw: "llm evals evaluation vibe testing golden dataset llm as judge faithfulness groundedness rag agent safety operational benchmarks mmlu ragas deepeval interview ai engineer" },
        { path: "llmops.html", title: "LLMOps", num: "⚙️", kw: "llmops mlops lifecycle prompt versioning experiment tracking deployment observability tracing cost token latency optimization guardrails feedback loop tooling langfuse langsmith interview" },
        { path: "langfuse.html", title: "Langfuse — Observability", num: "📡", kw: "langfuse observability trace cost latency quality scores" },
        { path: "guardrails.html", title: "Guardrails", num: "🛡️", kw: "guardrails safety scope pii hallucination policy" },
        { path: "memory.html", title: "Memory in LLMs", num: "🧠", kw: "memory context window stateless chat history" },
        { path: "langgraph.html", title: "LangGraph & components", num: "🕸️", kw: "langgraph state node edge checkpointer human in the loop asyncio pydantic" },
        { path: "claude-agent.html", title: "How a Claude Agent Works", num: "🤖", kw: "claude agent sdk tool runner loop context safety" },
        { path: "hermes.html", title: "Hermes — open local models", num: "🔱", kw: "hermes nous ollama open function calling local models" }
      ]
    },
    /* ===================================================================
       ONE interview section. Everything an interview round can ask now sits
       in a single group, split into three sub-sections by what it covers:
       the GenAI question bank, the Python & AI/ML question bank, and the
       per-technology drills. Before this there were separate top-level
       sections for each, which made the sidebar look like four different
       courses about the same interview.
       =================================================================== */
    /* PYTHON_INTERVIEW_START */
    /* INTERVIEW_PREP_START */
    {
      id: "interviewquestions", label: "Interview Questions", mark: "Q",
      blurb: "GenAI · Python · per-tool drills", home: "interview-prep/index.html",
      pages: [
        /* --- Sub-section 1: GenAI --- */
        { path: "interview-prep/index.html", title: "GenAI bank — overview", num: "✦", track: "GenAI Interview Prep", kw: "interview questions india genai preparation answers overview" },
        { path: "interview-prep/00-neural-networks.html", title: "Neural Networks", num: "G0", track: "GenAI Interview Prep", kw: "neural network neuron weights bias activation forward pass loss backpropagation optimizer gradients pytorch ai engineer interview" },
        { path: "interview-prep/01-llm-foundations-prompting.html", title: "Foundations & prompting", num: "G1", track: "GenAI Interview Prep", kw: "llm transformer tokens context temperature hallucination prompt structured output function calling fine tuning" },
        { path: "interview-prep/02-embeddings-rag.html", title: "Embeddings & RAG", num: "G2", track: "GenAI Interview Prep", kw: "embeddings cosine vector database pgvector hnsw chunking hybrid search reranking retrieval evaluation" },
        { path: "interview-prep/03-agents-mcp.html", title: "Agents, LangGraph & MCP", num: "G3", track: "GenAI Interview Prep", kw: "agents workflows react tool calling langgraph mcp memory multi agent human in loop idempotency" },
        { path: "interview-prep/04-evaluation-llmops.html", title: "Evaluation & LLMOps", num: "G4", track: "GenAI Interview Prep", kw: "evaluation golden dataset llm judge tracing langfuse prompt version drift release gate monitoring" },
        { path: "interview-prep/05-production-performance.html", title: "Production, latency & cost", num: "G5", track: "GenAI Interview Prep", kw: "model selection latency streaming caching concurrency batching tokens cost backpressure deployment slo" },
        { path: "interview-prep/06-security-responsible-ai.html", title: "Security & responsible AI", num: "G6", track: "GenAI Interview Prep", kw: "prompt injection rbac rag sql injection pii tools secrets responsible ai bias guardrails" },
        { path: "interview-prep/07-python-backend-cloud.html", title: "Python, backend & cloud", num: "G7", track: "GenAI Interview Prep", kw: "python async fastapi pydantic celery temporal idempotency multi tenancy docker kubernetes rate limit testing" },
        { path: "interview-prep/08-project-behavioral.html", title: "Project & behavioural", num: "G8", track: "GenAI Interview Prep", kw: "project architecture stack failure optimization tradeoff stakeholder ownership day to day current 90 days" },
        { path: "interview-prep/09-sql-for-genai.html", title: "SQL for GenAI roles", num: "G9", track: "GenAI Interview Prep", kw: "sql joins window functions row_number rank lag lead moving average cte recursive cte order of execution having indexing explain query plan transactions upsert merge on conflict materialized view postgres jsonb pgvector vector search text to sql rls multi tenant practice queries topics 2026 interview" },
        { path: "interview-prep/10-system-design.html", title: "GenAI system design", num: "G10", track: "GenAI Interview Prep", kw: "system design permissions retrieval filter freshness sla multi tenant model gateway sql agent governance row level security code agent sandbox multi agent supervisor cost routing caching deflection escalation" },
        { path: "interview-prep/11-mock-rounds.html", title: "Mock interview rounds", num: "G11", track: "GenAI Interview Prep", kw: "mock interview rounds timed rag debugging agents python coding recall at k asyncio semaphore rate limit validated json pydantic system design behavioural star failure" },

        /* --- Sub-section 2: Python & AI/ML --- */
        { path: "python-interview/index.html", title: "Python bank — overview", num: "✦", track: "Python & AI/ML Interviews", kw: "python ai ml interview questions bank overview 2026 india validated simple answers" },
        { path: "python-interview/01-python-core.html", title: "Python Core & How It Runs", num: "P1", track: "Python & AI/ML Interviews", kw: "python interpreter compiled bytecode cpython dynamic typing duck typing mutable immutable is vs equals operators truthiness numbers pep8 typecast type casting type conversion implicit explicit int str float shallow deep copy interview" },
        { path: "python-interview/02-data-structures.html", title: "Strings, Collections & Data Structures", num: "P2", track: "Python & AI/ML Interviews", kw: "string bytes formatting f-string regex list tuple set dictionary collections counter defaultdict deque namedtuple slicing sorting interview" },
        { path: "python-interview/03-functions-scope.html", title: "Functions, Scope & Functional Python", num: "P3", track: "Python & AI/ML Interviews", kw: "function args kwargs default mutable argument closure lambda scope legb global nonlocal map filter reduce partial recursion interview" },
        { path: "python-interview/04-iterators-generators.html", title: "Iterators, Generators & Comprehensions", num: "P4", track: "Python & AI/ML Interviews", kw: "iterator iterable generator yield lazy evaluation comprehension itertools generator expression memory streaming interview" },
        { path: "python-interview/05-decorators-context.html", title: "Decorators, Context Managers & Descriptors", num: "P5", track: "Python & AI/ML Interviews", kw: "decorator functools wraps decorator with arguments context manager with statement contextlib property descriptor caching retry timing interview" },
        { path: "python-interview/06-oop-data-model.html", title: "OOP & the Python Data Model", num: "P6", track: "Python & AI/ML Interviews", kw: "oop class inheritance polymorphism encapsulation abstraction mro super dunder double underscore magic methods special methods operator overloading name mangling private attributes str repr dataclass slots metaclass abc interview" },
        { path: "python-interview/07-exceptions-packaging.html", title: "Exceptions, Modules & Packaging", num: "P7", track: "Python & AI/ML Interviews", kw: "exception try except finally else custom exception raise from import module package virtual environment pip poetry uv requirements packaging interview" },
        { path: "python-interview/08-memory-performance.html", title: "Memory, Garbage Collection & Performance", num: "P8", track: "Python & AI/ML Interviews", kw: "memory management reference counting garbage collector cycles weakref memory leak profiling cprofile optimization slots interning interview" },
        { path: "python-interview/09-concurrency.html", title: "Threads, Processes & Asyncio", num: "P9", track: "Python & AI/ML Interviews", kw: "gil global interpreter lock thread process multiprocessing asyncio event loop coroutine await gather taskgroup cancellation cpu bound io bound interview" },
        { path: "python-interview/10-typing-stdlib-testing.html", title: "Type Hints, Standard Library & Testing", num: "P10", track: "Python & AI/ML Interviews", kw: "type hints typing optional union generic protocol mypy pytest fixture mock patch parametrize coverage logging json datetime pathlib linting ruff interview" },
        { path: "python-interview/11-backend-apis.html", title: "Backend Python, APIs & Databases", num: "P11", track: "Python & AI/ML Interviews", kw: "fastapi django flask rest api pydantic sqlalchemy orm n+1 transaction index caching redis celery queue rate limit scaling wsgi asgi interview" },
        { path: "python-interview/12-numpy-pandas-data.html", title: "NumPy, Pandas & Data Engineering", num: "P12", track: "Python & AI/ML Interviews", kw: "numpy array vectorization broadcasting pandas dataframe groupby merge join missing values apply memory pyspark airflow etl pipeline partitioning interview" },
        { path: "python-interview/13-ml-ai-llm.html", title: "ML, Deep Learning, LLMs & MLOps", num: "P13", track: "Python & AI/ML Interviews", kw: "machine learning scikit-learn overfitting bias variance cross validation precision recall imbalanced pytorch backpropagation transformer llm rag embeddings agents mlops drift deployment interview" },
        { path: "python-interview/14-coding-behavioural.html", title: "Coding Round & Project Discussion", num: "P14", track: "Python & AI/ML Interviews", kw: "python coding round live coding two sum palindrome anagram fibonacci decorator implementation k means from scratch project walkthrough behavioural architecture tradeoff interview" },
        { path: "python-interview/15-practical-scenarios.html", title: "Practical Questions", num: "P15", track: "Python & AI/ML Interviews", kw: "practical scenario questions crore csv 10 million rows large file streaming chunksize polars duckdb pyarrow parquet batching concurrency asyncio semaphore rate limit backoff retry 1000 pdfs folder rag ingestion ocr scanned tables chunking overlap metadata incremental upsert reindex embeddings at scale dedupe vector database pgvector qdrant milvus weaviate pinecone hnsw ef_search hybrid search reranking latency time to first token ttft p95 streaming semantic caching prompt caching model routing cost optimization batch api prompt injection indirect injection sql injection text to sql guardrails owasp least privilege row level security pii redaction dpdp gdpr hipaa agent tools exfiltration hallucination groundedness citations evals llm as judge recall at k monitoring observability tracing long context interview" },

        /* --- Sub-section 3: one page per technology, interview-shaped --- */
        { path: "interview-labs/index.html", title: "Drills — overview", num: "✦", track: "Technology Drills — one tool at a time", kw: "focused interview labs technology drills python backend fastapi websocket langchain rag mcp overview" },
        { path: "interview-labs/python-sync-async-interview.html", title: "Sync vs Async Python", num: "T1", track: "Technology Drills — one tool at a time", kw: "python synchronous asynchronous asyncio event loop coroutine task thread process gil timeout cancellation backpressure interview" },
        { path: "interview-labs/fastapi-interview.html", title: "FastAPI", num: "T2", track: "Technology Drills — one tool at a time", kw: "fastapi asgi starlette pydantic dependency injection request lifecycle def async def testing security deployment interview" },
        { path: "interview-labs/websockets-interview.html", title: "WebSockets", num: "T3", track: "Technology Drills — one tool at a time", kw: "websocket web socket handshake frames fastapi real time heartbeat reconnect backpressure broker scaling interview" },
        { path: "interview-labs/langchain-interview.html", title: "LangChain", num: "T4", track: "Technology Drills — one tool at a time", kw: "langchain create agent tools middleware runtime runnable lcel structured output streaming testing interview" },
        { path: "interview-labs/rag-interview.html", title: "RAG", num: "T5", track: "Technology Drills — one tool at a time", kw: "rag retrieval chunking hybrid reranking evaluation security debugging system design interview" },
        { path: "interview-labs/mcp-interview.html", title: "MCP", num: "T6", track: "Technology Drills — one tool at a time", kw: "mcp model context protocol host client server tools resources prompts transport security interview" }
      ]
    },
    /* PYTHON_INTERVIEW_END */
    /* INTERVIEW_PREP_END */

    {
      id: "scenariopractice", label: "Scenario Design Studio", mark: "S", blurb: "Architecture interview practice", home: "scenario-practice/index.html",
      pages: [
        { path: "scenario-practice/index.html", title: "Scenario studio overview", num: "✦", kw: "system design scenario practice genai architecture" },
        { path: "scenario-practice/framework.html", title: "Answer framework", num: "00", kw: "clarify design scale secure measure framework" },
        { path: "scenario-practice/01-enterprise-knowledge-assistant.html", title: "Enterprise knowledge assistant", num: "01", kw: "enterprise rag chatbot permissions citations hybrid retrieval latency" },
        { path: "scenario-practice/02-customer-support-agent.html", title: "Customer support agent", num: "02", kw: "customer support agent tools workflow human handoff pii latency load" },
        { path: "scenario-practice/03-secure-text-to-sql.html", title: "Secure text-to-SQL", num: "03", kw: "text to sql analytics semantic layer read only parameterized ast injection rbac" },
        { path: "scenario-practice/04-ats-recruiter-copilot.html", title: "ATS recruiter copilot", num: "04", kw: "ats recruiter resume screening matching interview scheduling bias human review audit" },
        { path: "scenario-practice/05-multilingual-voice-assistant.html", title: "Multilingual voice assistant", num: "05", kw: "voice assistant speech streaming multilingual latency barge in agent tools" },
        { path: "scenario-practice/06-invoice-document-workflow.html", title: "Invoice document workflow", num: "06", kw: "invoice document ai ocr extraction validation workflow human review queue" },
        { path: "scenario-practice/07-high-scale-shopping-assistant.html", title: "High-scale shopping assistant", num: "07", kw: "shopping assistant recommendations catalog search agent high scale personalization latency cache" },
        { path: "scenario-practice/08-regulated-financial-research.html", title: "Financial research copilot", num: "08", kw: "financial research copilot compliance citations audit human approval market data secure rag" },
      ]
    },

    {
      id: "dsa",
      label: "DSA Interview Preparation",
      mark: "C",
      blurb: "Python · Patterns · Coding Rounds",
      home: "dsa-prep/index.html",
      pages: [
        { path: "dsa-prep/index.html", title: "Contents", num: "✦", kw: "dsa data structures algorithms interview python leetcode patterns coding round overview contents textbook" },
        { path: "dsa-prep/top-50.html", title: "Top 50 Questions", num: "★", track: "Priority lists", kw: "top 50 dsa questions interview preparation must do essential shortlist all patterns easy medium blind curated priority high frequency leetcode" },
        { path: "dsa-prep/top-150.html", title: "High-Frequency Questions", num: "★", track: "Priority lists", kw: "top 150 dsa questions high frequency faang maang india product companies full set blind 75 neetcode pattern defining leetcode" },
        { path: "dsa-prep/complexity.html", title: "Time & Space Complexity", num: "0", track: "Foundations", kw: "big o time complexity space complexity auxiliary memory constant linear logarithmic quadratic exponential factorial worst average best amortized in place growth rate operations counting recursion stack two sum trade off" },
        { path: "dsa-prep/00-interview-strategy.html", title: "Interview Strategy", num: "00", track: "Foundations", kw: "interview strategy umpire clarify brute force optimize test complexity study route diagnostic think aloud coding round process" },
        { path: "dsa-prep/01-python-dsa-foundations.html", title: "Python DSA Foundations", num: "01", track: "Foundations", kw: "python objects references mutability aliasing list deque heapq dict set amortized append timsort recursion limit big o auxiliary space copy" },
        { path: "dsa-prep/02-arrays.html", title: "Arrays", num: "02", track: "Core structures", kw: "array list numpy prefix suffix kadane in-place marking rotation matrix two pointers subarray product except self maximum subarray spiral set matrix zeroes" },
        { path: "dsa-prep/03-linked-lists.html", title: "Linked Lists", num: "03", track: "Core structures", kw: "linked list node pointer dummy sentinel fast slow reversal cycle floyd merge reorder lru cache k-group random pointer intersection palindrome" },
        { path: "dsa-prep/04-hashing.html", title: "Hashing", num: "04", track: "Core structures", kw: "hash map set frequency complement prefix sum group anagrams top k" },
        { path: "dsa-prep/05-strings.html", title: "Strings", num: "05", track: "Core structures", kw: "string immutability palindrome parsing kmp expand around center decode" },
        { path: "dsa-prep/06-two-pointers.html", title: "Two Pointers", num: "06", track: "Core patterns", kw: "two pointers opposite ends compaction 3sum container water sort colors subsequence" },
        { path: "dsa-prep/07-sliding-window-prefix-sums.html", title: "Sliding Window & Prefix Sums", num: "07", track: "Core patterns", kw: "sliding window fixed variable monotonic deque prefix sum difference array subarray" },
        { path: "dsa-prep/08-stacks-queues-deques.html", title: "Stacks, Queues & Deques", num: "08", track: "Core patterns", kw: "stack queue deque monotonic delimiters expression evaluation circular buffer" },
        { path: "dsa-prep/09-sorting-intervals-selection.html", title: "Sorting, Intervals & Selection", num: "09", track: "Core patterns", kw: "sorting timsort quickselect merge sort intervals stability counting bucket" },
        { path: "dsa-prep/10-binary-search.html", title: "Binary Search", num: "10", track: "Core patterns", kw: "binary search lower upper bound rotated array peak monotonic answer koko" },
        { path: "dsa-prep/11-recursion-backtracking.html", title: "Recursion & Backtracking", num: "11", track: "Core patterns", kw: "recursion backtracking choice tree pruning subsets permutations combination sum n queens" },
        { path: "dsa-prep/12-trees-bst.html", title: "Trees & BST", num: "12", track: "Non-linear structures", kw: "tree bst dfs bfs level order lca serialize validate diameter path sum" },
        { path: "dsa-prep/13-heaps-priority-queues.html", title: "Heaps & Priority Queues", num: "13", track: "Non-linear structures", kw: "heap priority queue top k two heaps k way merge median stream scheduling" },
        { path: "dsa-prep/14-tries.html", title: "Tries", num: "14", track: "Non-linear structures", kw: "trie prefix search wildcard binary trie word search suggestions" },
        { path: "dsa-prep/15-graphs-grids.html", title: "Graphs & Grids", num: "15", track: "Non-linear structures", kw: "graph grid bfs dfs connected components multi source shortest path islands clone" },
        { path: "dsa-prep/16-advanced-graphs.html", title: "Advanced Graphs", num: "16", track: "Non-linear structures", kw: "topological sort union find dijkstra bellman ford mst weighted shortest path" },
        { path: "dsa-prep/17-greedy.html", title: "Greedy", num: "17", track: "Optimization", kw: "greedy exchange argument interval scheduling reachability partition jump game gas station" },
        { path: "dsa-prep/18-dynamic-programming-1d.html", title: "Dynamic Programming — 1D", num: "18", track: "Optimization", kw: "dynamic programming 1d state recurrence memoization tabulation rolling house robber coin change lis" },
        { path: "dsa-prep/19-dynamic-programming-2d.html", title: "Dynamic Programming — 2D", num: "19", track: "Optimization", kw: "dynamic programming 2d grid knapsack edit distance interval dp path counting lcs" },
        { path: "dsa-prep/20-bit-math-matrix.html", title: "Bit, Math & Matrix", num: "20", track: "Optimization", kw: "bit manipulation xor mask math gcd sieve modular matrix rotate image game of life" },
        { path: "dsa-prep/21-data-structure-design.html", title: "Data Structure Design", num: "21", track: "Applied interview work", kw: "data structure design lru lfu min stack median stream twitter time based key value snapshot" },
        { path: "dsa-prep/22-python-numpy-pandas-performance.html", title: "Python, NumPy & Pandas Performance", num: "22", track: "Applied interview work", kw: "numpy pandas vectorization broadcasting memory contiguity itertuples apply categorical chunked cosine similarity top k" },
        { path: "dsa-prep/23-role-tracks-mocks-revision.html", title: "Role Tracks, Mocks & Revision", num: "23", track: "Study tracks", kw: "role tracks mocks revision signal structure map 30 60 90 spaced repetition flashcards readiness" },
        { path: "dsa-prep/24-advanced-dsa-optional.html", title: "Advanced DSA — Optional", num: "24", track: "Study tracks", kw: "advanced fenwick tree segment tree coordinate compression sweep line reservoir sampling meet in the middle" }
      ]
    },
    {
      id: "jobsearch",
      label: "Job Search & Remote Work",
      mark: "J",
      blurb: "Roles abroad, from India",
      home: "job-search/index.html",
      direct: true,
      pages: [
        { path: "job-search/index.html", title: "Where to Find Remote Roles", num: "🌐", kw: "remote jobs work from home abroad india job portals boards job search weworkremotely remoteok wellfound himalayas remotive workatastartup turing uplers arc dev toptal braintrust deel employer of record eor contractor overseas international hiring worldwide scam check linkedin ai jobs hugging face salary" }
      ]
    }
  ];

  /* ---------- Resolve the repository root from this script URL ---------- */
  // This makes navigation independent of the GitHub repository name. It works
  // at username.github.io/repository/, on a custom domain, and from local files.
  var navScript = document.currentScript;
  if (!navScript || !/\/sitenav\.js(?:[?#].*)?$/.test(navScript.src || "")) {
    var scripts = document.getElementsByTagName("script");
    for (var si = scripts.length - 1; si >= 0; si -= 1) {
      if (/\/sitenav\.js(?:[?#].*)?$/.test(scripts[si].src || "")) { navScript = scripts[si]; break; }
    }
  }
  var SITE_ROOT = navScript && navScript.src
    ? new URL("../", navScript.src)
    : new URL("./", document.baseURI);

  function pageURL(pagePath) { return new URL(pagePath, SITE_ROOT); }
  function href(pagePath) { return pageURL(pagePath).href; }
  function normalizedPath(pathname) {
    var p = decodeURIComponent(pathname || "").replace(/\\/g, "/");
    if (p.endsWith("/")) p += "index.html";
    return p.replace(/\/{2,}/g, "/");
  }

  var currentPath = normalizedPath(location.pathname);
  var current = null, currentGroup = null;
  function isCurrent(pagePath) {
    return currentPath === normalizedPath(pageURL(pagePath).pathname);
  }
  GROUPS.forEach(function (g) {
    g.pages.forEach(function (p) {
      if (isCurrent(p.path)) { current = p; currentGroup = g; }
    });
  });

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
      if (g.direct) {
        html += '<div class="navgroup navgroup-direct' + (open ? " open" : "") + '" data-group="' + g.id + '">' +
                '<a class="navgroup-head" href="' + href(g.pages[0].path) + '">' +
                '<span class="ng-mk">' + g.mark + '</span>' +
                '<span class="ng-copy"><span class="ng-label">' + g.label + '</span><span class="ng-blurb">' + g.blurb + '</span></span>' +
                '</a></div>';
        return;
      }
      html += '<div class="navgroup' + (open ? " open" : "") + '" data-group="' + g.id + '">';
      html += '<button class="navgroup-head" aria-expanded="' + (open ? "true" : "false") + '">' +
                '<span class="ng-mk">' + g.mark + '</span>' +
                '<span class="ng-copy"><span class="ng-label">' + g.label + '</span><span class="ng-blurb">' + g.blurb + '</span></span>' +
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
    nav.querySelectorAll(".navgroup:not(.navgroup-direct) > .navgroup-head").forEach(function (btn) {
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

  /* ---------- Mobile drawer chrome ---------- */
  function buildMobileDrawerChrome() {
    var sidebar = document.querySelector(".sidebar");
    var brand = sidebar && sidebar.querySelector(".brand");
    if (!sidebar || !brand || sidebar.querySelector(".mobile-nav-intro")) return;

    var close = document.createElement("button");
    close.className = "mobile-nav-close";
    close.type = "button";
    close.setAttribute("aria-label", "Close navigation");
    close.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';
    brand.appendChild(close);

    var intro = document.createElement("section");
    intro.className = "mobile-nav-intro";
    var currentLabel = currentGroup ? currentGroup.label : "Switch job Learning Platform";
    var currentCount = currentGroup ? currentGroup.pages.length : GROUPS.length;
    var countLabel = currentGroup ? (currentCount + (currentCount === 1 ? " page" : " pages") + " in this path") : (currentCount + " learning paths");
    intro.innerHTML =
      '<span class="mobile-nav-eyebrow"><i></i> Learning workspace</span>' +
      '<strong>' + currentLabel + '</strong>' +
      '<p>Jump between focused lessons, labs and interview practice without losing your place.</p>' +
      '<div class="mobile-nav-meta"><span>' + countLabel + '</span><span>Search ready</span></div>';
    brand.insertAdjacentElement("afterend", intro);
  }

  /* ---------- Cross-site search (searches ALL groups) ---------- */
  function setupSearch() {
    var input = document.querySelector("[data-search]") || document.querySelector("[data-secsearch]");
    var out = document.querySelector(".search-results") || document.querySelector("[data-secresults]");
    if (!input || !out) return;
    input.placeholder = "Find chapter or topic…  ( / )";
    input.setAttribute("aria-label", "Find a chapter or topic");
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
    if (brandLink) brandLink.setAttribute("href", href("index.html"));
  }

  /* ---------- Footer credit (subtle, on every page) ---------- */
  function injectFooter() {
    var content = document.querySelector(".content");
    if (!content || content.querySelector(".site-footer")) return;
    var year = new Date().getFullYear();
    var f = document.createElement("footer");
    f.className = "site-footer";
    f.innerHTML =
      '<span>© ' + year + ' Switch job</span>' +
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
    var sidebar = document.querySelector(".sidebar");
    var backdrop = document.querySelector(".backdrop");
    var close = document.querySelector(".mobile-nav-close");
    if (!app) return;

    function setMobileDrawer(open, restoreFocus) {
      open = Boolean(open && isMobile());
      app.classList.toggle("nav-open", open);
      document.body.classList.toggle("nav-drawer-open", open);
      if (menu) menu.setAttribute("aria-expanded", open ? "true" : "false");
      if (sidebar) {
        var hidden = !open && isMobile();
        sidebar.setAttribute("aria-hidden", hidden ? "true" : "false");
        sidebar.inert = hidden;
      }
      if (!open && restoreFocus && menu) menu.focus();
    }

    // Restore the saved desktop state (only affects desktop; mobile uses the drawer).
    try {
      if (localStorage.getItem(LS_SIDEBAR) === "collapsed") app.classList.add("sidebar-collapsed");
    } catch (e) {}

    if (sidebar && !sidebar.id) sidebar.id = "site-navigation";
    if (menu) {
      menu.setAttribute("aria-label", "Toggle navigation");
      menu.setAttribute("aria-controls", sidebar ? sidebar.id : "site-navigation");
      menu.setAttribute("aria-expanded", "false");
      menu.addEventListener("click", function () {
        if (isMobile()) {
          setMobileDrawer(!app.classList.contains("nav-open"));
        } else {
          var collapsed = app.classList.toggle("sidebar-collapsed");
          try { localStorage.setItem(LS_SIDEBAR, collapsed ? "collapsed" : "open"); } catch (e) {}
        }
      });
    }

    if (backdrop) backdrop.addEventListener("click", function () { setMobileDrawer(false); });
    if (close) close.addEventListener("click", function () { setMobileDrawer(false, true); });
    if (sidebar) sidebar.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () { setMobileDrawer(false); });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && app.classList.contains("nav-open")) setMobileDrawer(false, true);
    });

    // Keep drawer state and accessibility attributes correct across the breakpoint.
    window.addEventListener("resize", function () {
      setMobileDrawer(isMobile() && app.classList.contains("nav-open"));
    });
    setMobileDrawer(false);
  }

  /* ---------- Resizable navigation drawer ----------
     The existing width is the minimum. Users can drag wider, shrink back to
     that baseline, use the arrow keys, or double-click the handle to reset. */
  var LS_SIDEBAR_WIDTH = "gp.sidebar.width";
  var LS_MOBILE_SIDEBAR_WIDTH = "gp.sidebar.mobile.width";
  var SIDEBAR_MAX_WIDTH = 480;
  var SIDEBAR_KEY_STEP = 16;

  function setupSidebarResize() {
    var app = document.querySelector(".app");
    var sidebar = document.querySelector(".sidebar");
    if (!app || !sidebar || app.querySelector(".sidebar-resizer")) return;

    var handle = document.createElement("div");
    handle.className = "sidebar-resizer";
    handle.setAttribute("role", "separator");
    handle.setAttribute("aria-orientation", "vertical");
    handle.setAttribute("aria-label", "Resize navigation drawer");
    handle.setAttribute("aria-controls", sidebar.id || "site-navigation");
    handle.setAttribute("title", "Drag to resize navigation. Double-click to reset.");
    handle.tabIndex = 0;
    app.appendChild(handle);

    /* The shell renders the desktop sidebar at `--density` (0.9) via `zoom`, so
       a layout width of W is only 0.9W on screen. The handle is `position:
       fixed` and therefore outside the zoomed subtree — it moves 1:1 with the
       pointer while the edge it is dragging moves at 0.9. Dividing the pointer
       delta by the factor makes the visible edge track the cursor exactly.
       Read from the computed value rather than hard-coded so the stylesheet
       stays the single source of truth (and mobile, where it is 1, needs no
       special case). */
    function density() {
      var raw = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--density"));
      return raw > 0 ? raw : 1;
    }

    /* Read once, here, before apply() ever writes an inline --sidebar-w on
       <html>: after that the computed value is whatever the reader last dragged
       to, and a minimum derived from it would rise to meet the current width and
       make the panel impossible to shrink.

       The old comment said this "mirrors the compact desktop --sidebar-w token
       in styles.css" and mirrored clamp(220px, 15vw, 252px) — one of five
       competing declarations, and not the one that actually won. There is a
       single token now, so take the floor from it and keep the literals only for
       the case where it is missing entirely. */
    var STYLESHEET_DESKTOP_W = (function () {
      var declared = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--sidebar-w"));
      return declared > 0 ? Math.round(declared) : 0;
    })();

    function desktopMinimum() {
      if (STYLESHEET_DESKTOP_W) return STYLESHEET_DESKTOP_W;
      return Math.round(Math.max(220, Math.min(252, window.innerWidth * 0.15)));
    }

    function mobileMinimum() {
      var ratio = window.innerWidth <= 430 ? 0.94 : 0.91;
      return Math.round(Math.min(window.innerWidth * ratio, 344));
    }

    var desktopCurrent = desktopMinimum();
    var mobileCurrent = mobileMinimum();
    var dragging = false;
    var startX = 0;
    var startWidth = 0;

    function activeMinimum() {
      return isMobile() ? mobileMinimum() : desktopMinimum();
    }

    function activeMaximum() {
      var minimum = activeMinimum();
      if (isMobile()) return Math.max(minimum, Math.floor(window.innerWidth * 0.98));
      /* Keep a useful reading area even on smaller desktop windows. The 560px
         budget is screen space but the value returned is a layout width, so it
         has to be divided back out by the density factor — otherwise the cap
         reserves 10% less for the article than it reads as. */
      var budget = (window.innerWidth - 560) / density();
      return Math.max(minimum, Math.min(SIDEBAR_MAX_WIDTH, Math.floor(budget)));
    }

    function activeCurrent() {
      return isMobile() ? mobileCurrent : desktopCurrent;
    }

    function clamp(value) {
      return Math.max(activeMinimum(), Math.min(activeMaximum(), Math.round(value)));
    }

    function apply(value, persist) {
      var next = clamp(value);
      if (isMobile()) {
        mobileCurrent = next;
        document.documentElement.style.setProperty("--mobile-sidebar-w", next + "px");
        if (persist) {
          try { localStorage.setItem(LS_MOBILE_SIDEBAR_WIDTH, String(next)); } catch (e) {}
        }
      } else {
        desktopCurrent = next;
        document.documentElement.style.setProperty("--sidebar-w", next + "px");
        if (persist) {
          try { localStorage.setItem(LS_SIDEBAR_WIDTH, String(next)); } catch (e) {}
        }
      }
      handle.setAttribute("aria-valuemin", String(activeMinimum()));
      handle.setAttribute("aria-valuemax", String(activeMaximum()));
      handle.setAttribute("aria-valuenow", String(next));
      handle.setAttribute("aria-valuetext", next + " pixels wide");
    }

    try {
      var savedDesktop = parseInt(localStorage.getItem(LS_SIDEBAR_WIDTH), 10);
      var savedMobile = parseInt(localStorage.getItem(LS_MOBILE_SIDEBAR_WIDTH), 10);
      if (Number.isFinite(savedDesktop)) desktopCurrent = savedDesktop;
      if (Number.isFinite(savedMobile)) mobileCurrent = savedMobile;
    } catch (e) {}
    apply(activeCurrent(), false);

    handle.addEventListener("pointerdown", function (event) {
      if (event.button !== 0) return;
      dragging = true;
      startX = event.clientX;
      startWidth = activeCurrent();
      handle.setPointerCapture(event.pointerId);
      document.body.classList.add("sidebar-resizing");
      event.preventDefault();
    });

    handle.addEventListener("pointermove", function (event) {
      if (!dragging) return;
      // Pointer travel is in screen pixels; --sidebar-w is a layout width that
      // the shell then scales by --density. Divide so the edge follows the
      // cursor 1:1 instead of lagging it by the factor.
      apply(startWidth + (event.clientX - startX) / density(), false);
    });

    function finishResize(event) {
      if (!dragging) return;
      dragging = false;
      document.body.classList.remove("sidebar-resizing");
      try { handle.releasePointerCapture(event.pointerId); } catch (e) {}
      apply(activeCurrent(), true);
    }

    handle.addEventListener("pointerup", finishResize);
    handle.addEventListener("pointercancel", finishResize);
    handle.addEventListener("dblclick", function () { apply(activeMinimum(), true); });
    handle.addEventListener("keydown", function (event) {
      var next = activeCurrent();
      if (event.key === "ArrowLeft") next -= SIDEBAR_KEY_STEP;
      else if (event.key === "ArrowRight") next += SIDEBAR_KEY_STEP;
      else if (event.key === "Home") next = activeMinimum();
      else if (event.key === "End") next = activeMaximum();
      else return;
      event.preventDefault();
      apply(next, true);
    });

    window.addEventListener("resize", function () {
      apply(activeCurrent(), false);
    });
  }

  /* ---------- Navigation feedback ----------
     There is no page transition any more (removed 2026-08-04; the reasoning is
     in styles.css). A click navigates immediately. What remains below is the
     slow-navigation loading ring and the link test that decides which clicks
     count as a same-site navigation worth arming it for. */
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

  /* ---------- The loading ring ----------
     Shown only when a navigation is actually slow. The browser keeps painting
     the *old* document until the new one is ready, so the wait belongs to the
     page being left — which is why this lives here and not in the arriving
     page's markup, where it could only ever appear after the wait was over.

     GRACE is the whole design: on a warm cache a page swap is tens of
     milliseconds, and a spinner that appears and vanishes inside that window
     is itself the flicker we are removing. Nothing is built or shown until a
     navigation has been outstanding that long, so the common case renders
     no loader at all. */
  var GRACE = 220;
  // A navigation the user abandons — Escape, a cancelled prompt, a link that
  // resolves to a download — never fires pagehide, and the ring would spin on a
  // page that is going nowhere. It gives up rather than lying.
  var MAX_VISIBLE = 12000;
  var loaderTimer = null;
  var loaderGiveUp = null;
  var loaderEl = null;

  function buildLoader() {
    if (loaderEl) return loaderEl;
    loaderEl = document.createElement("div");
    loaderEl.className = "page-loader";
    loaderEl.setAttribute("role", "status");
    loaderEl.setAttribute("aria-live", "polite");
    loaderEl.innerHTML =
      '<svg width="30" height="30" viewBox="0 0 40 40" aria-hidden="true">' +
        '<circle class="pl-track" cx="20" cy="20" r="16" fill="none" stroke-width="3.5"/>' +
        '<circle class="pl-arc" cx="20" cy="20" r="16" fill="none" stroke-width="3.5" stroke-linecap="round"/>' +
      '</svg><span class="sr-only">Loading…</span>';
    document.body.appendChild(loaderEl);
    return loaderEl;
  }

  function armLoader() {
    clearTimeout(loaderTimer);
    loaderTimer = window.setTimeout(function () {
      buildLoader();
      // Same tick as the insert: the fade is a keyframe (see styles.css), so it
      // does not need the element to have rendered a frame first. That matters
      // — a page slow enough to earn a spinner is a page whose frames may not
      // be running.
      document.documentElement.classList.add("is-loading");
      loaderGiveUp = window.setTimeout(disarmLoader, MAX_VISIBLE);
    }, GRACE);
  }

  function disarmLoader() {
    clearTimeout(loaderTimer);
    clearTimeout(loaderGiveUp);
    document.documentElement.classList.remove("is-loading");
  }

  function setupPageTransitions() {
    /* Page transitions were removed on 2026-08-04 (see styles.css). This function
       keeps its name because init() calls it, and because what remains is still
       navigation-adjacent: arming the loading ring.

       No click is intercepted any more. The old code called preventDefault(),
       added `.is-leaving`, waited for a fade and then set location.href — that
       wait was pure latency in front of every navigation, on top of an animation
       that read as jitter. Now the browser navigates on the click, immediately,
       and the ring appears only if the new document takes longer than GRACE. */
    window.addEventListener("pagehide", disarmLoader);
    window.addEventListener("pageshow", function () {
      // Restored from the back/forward cache: never leave the ring spinning, and
      // clear the legacy leaving state in case a cached document still carries it.
      disarmLoader();
      document.documentElement.classList.remove("is-leaving");
    });

    document.addEventListener("click", function (e) {
      var a = e.target.closest && e.target.closest("a[href]");
      if (shouldIntercept(a, e)) armLoader();
    });
  }

  function init() { buildSidebar(); buildMobileDrawerChrome(); setupSearch(); fixBrand(); injectFooter(); setupSidebarToggle(); setupSidebarResize(); setupPageTransitions(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();

  // expose for debugging / other scripts
  window.SiteNav = { groups: GROUPS, href: href, current: current, currentGroup: currentGroup };
})();
