/* =========================================================================
   GenAI Learning Portal - curriculum manifest (Release 2, Stage 2a)

   THE single source of truth for page identity, local collection order,
   global route order and published metrics. Nothing renders from this file
   yet: Stage 2a ships the manifest and the validator only.

   Dual-consumable on purpose. Browsers load it as a classic deferred script
   and read window.CURRICULUM; tools/curriculum-export.js requires() it and
   prints JSON, which is how tools/validate.py reads it. There is exactly one
   copy of this data and Python never parses JavaScript.

   Invariants the validator enforces, so they cannot rot:
     - no next/prev/nextByRoute anywhere; order comes from array position
     - no duration value inside a route step; durations live on the page
     - route steps use `page`, never `item`
     - every referenced id is a registered page
     - only status:"active" routes are resolvable
   ========================================================================= */
(function (root, factory) {
  var curriculum = factory();
  if (typeof module === "object" && module.exports) module.exports = curriculum;
  if (root) root.CURRICULUM = curriculum;
})(typeof window !== "undefined" ? window : null, function () {
  return {
  "schema": 2,
  "version": "2026-11-23",
  "schemaRules": {
    "allowedStepKeys": [
      "page",
      "mode",
      "sections"
    ],
    "allowedModes": [
      "full",
      "core"
    ],
    "forbiddenStepKeys": [
      "item",
      "next",
      "prev",
      "nextByRoute",
      "minutes",
      "hours",
      "duration"
    ],
    "routeEligibleTypes": [
      "content",
      "index",
      "reference",
      "migration"
    ],
    "pageTypes": [
      "content",
      "index",
      "migration",
      "reference",
      "private",
      "optional-track"
    ],
    "contentRoles": [
      "learn",
      "build",
      "drill",
      "reference",
      "assessment"
    ]
  },
  "pages": {
    "guardrails": {
      "path": "guardrails.html",
      "title": "Guardrails",
      "type": "content",
      "contentRole": "learn",
      "tags": [
        "genai-mastery"
      ],
      "durations": {
        "full": [
          15,
          30
        ],
        "core": null,
        "sections": {}
      }
    },
    "hub-home": {
      "path": "index.html",
      "title": "Learn GenAI engineering in a clear topic sequence",
      "type": "index"
    },
    "drill-fastapi": {
      "path": "interview-labs/fastapi-interview.html",
      "title": "FastAPI",
      "type": "content",
      "contentRole": "drill",
      "tags": [
        "tech-drill"
      ],
      "durations": {
        "full": [
          240,
          360
        ],
        "core": null,
        "sections": {}
      }
    },
    "drills-index": {
      "path": "interview-labs/index.html",
      "title": "Drills - overview",
      "type": "index"
    },
    "drill-langchain": {
      "path": "interview-labs/langchain-interview.html",
      "title": "LangChain",
      "type": "content",
      "contentRole": "drill",
      "tags": [
        "tech-drill"
      ],
      "durations": {
        "full": [
          240,
          360
        ],
        "core": null,
        "sections": {}
      }
    },
    "drill-mcp": {
      "path": "interview-labs/mcp-interview.html",
      "title": "MCP",
      "type": "content",
      "contentRole": "drill",
      "tags": [
        "tech-drill"
      ],
      "durations": {
        "full": [
          240,
          360
        ],
        "core": null,
        "sections": {}
      }
    },
    "drill-python-sync-async": {
      "path": "interview-labs/python-sync-async-interview.html",
      "title": "Sync vs Async Python",
      "type": "content",
      "contentRole": "drill",
      "tags": [
        "tech-drill"
      ],
      "durations": {
        "full": [
          240,
          360
        ],
        "core": null,
        "sections": {}
      }
    },
    "drill-rag": {
      "path": "interview-labs/rag-interview.html",
      "title": "RAG",
      "type": "content",
      "contentRole": "drill",
      "tags": [
        "tech-drill"
      ],
      "durations": {
        "full": [
          240,
          360
        ],
        "core": null,
        "sections": {}
      }
    },
    "drill-websockets": {
      "path": "interview-labs/websockets-interview.html",
      "title": "WebSockets",
      "type": "content",
      "contentRole": "drill",
      "tags": [
        "tech-drill"
      ],
      "durations": {
        "full": [
          180,
          300
        ],
        "core": null,
        "sections": {}
      }
    },
    "genai-g0": {
      "path": "interview-prep/00-neural-networks.html",
      "title": "Neural Networks",
      "type": "content",
      "contentRole": "learn",
      "tags": [
        "genai-bank"
      ],
      "durations": {
        "full": [
          720,
          1080
        ],
        "core": null,
        "sections": {}
      }
    },
    "genai-g1": {
      "path": "interview-prep/01-llm-foundations-prompting.html",
      "title": "Foundations & prompting",
      "type": "content",
      "contentRole": "drill",
      "tags": [
        "genai-bank"
      ],
      "durations": {
        "full": [
          240,
          360
        ],
        "core": null,
        "sections": {}
      }
    },
    "genai-g2": {
      "path": "interview-prep/02-embeddings-rag.html",
      "title": "Embeddings & RAG",
      "type": "content",
      "contentRole": "drill",
      "tags": [
        "genai-bank"
      ],
      "durations": {
        "full": [
          300,
          480
        ],
        "core": null,
        "sections": {}
      }
    },
    "genai-g3": {
      "path": "interview-prep/03-agents-mcp.html",
      "title": "Agents, LangGraph & MCP",
      "type": "content",
      "contentRole": "drill",
      "tags": [
        "genai-bank"
      ],
      "durations": {
        "full": [
          360,
          540
        ],
        "core": null,
        "sections": {}
      }
    },
    "genai-g4": {
      "path": "interview-prep/04-evaluation-llmops.html",
      "title": "Evaluation & LLMOps",
      "type": "content",
      "contentRole": "drill",
      "tags": [
        "genai-bank"
      ],
      "durations": {
        "full": [
          300,
          480
        ],
        "core": null,
        "sections": {}
      }
    },
    "genai-g5": {
      "path": "interview-prep/05-production-performance.html",
      "title": "Production, latency & cost",
      "type": "content",
      "contentRole": "drill",
      "tags": [
        "genai-bank"
      ],
      "durations": {
        "full": [
          300,
          480
        ],
        "core": null,
        "sections": {}
      }
    },
    "genai-g6": {
      "path": "interview-prep/06-security-responsible-ai.html",
      "title": "Security & responsible AI",
      "type": "content",
      "contentRole": "drill",
      "tags": [
        "genai-bank"
      ],
      "durations": {
        "full": [
          240,
          420
        ],
        "core": null,
        "sections": {}
      }
    },
    "genai-g7": {
      "path": "interview-prep/07-python-backend-cloud.html",
      "title": "Python, backend & cloud",
      "type": "content",
      "contentRole": "drill",
      "tags": [
        "genai-bank"
      ],
      "durations": {
        "full": [
          360,
          540
        ],
        "core": null,
        "sections": {}
      }
    },
    "genai-g8": {
      "path": "interview-prep/08-project-behavioral.html",
      "title": "Project & behavioural",
      "type": "content",
      "contentRole": "drill",
      "tags": [
        "genai-bank"
      ],
      "durations": {
        "full": [
          300,
          480
        ],
        "core": null,
        "sections": {}
      }
    },
    "genai-g9": {
      "path": "interview-prep/09-sql-for-genai.html",
      "title": "SQL for GenAI roles",
      "type": "content",
      "contentRole": "drill",
      "tags": [
        "genai-bank"
      ],
      "durations": {
        "full": [
          300,
          480
        ],
        "core": null,
        "sections": {}
      }
    },
    "genai-g10": {
      "path": "interview-prep/10-system-design.html",
      "title": "GenAI system design",
      "type": "content",
      "contentRole": "drill",
      "tags": [
        "genai-bank"
      ],
      "durations": {
        "full": [
          360,
          540
        ],
        "core": null,
        "sections": {}
      }
    },
    "genai-g11": {
      "path": "interview-prep/11-mock-rounds.html",
      "title": "Mock interview rounds",
      "type": "content",
      "contentRole": "assessment",
      "tags": [
        "genai-bank"
      ],
      "durations": {
        "full": [
          480,
          720
        ],
        "core": null,
        "sections": {}
      }
    },
    "genai-bank-index": {
      "path": "interview-prep/index.html",
      "title": "GenAI bank - overview",
      "type": "index"
    },
    "llm-evals": {
      "path": "llm-evals.html",
      "title": "LLM Evals",
      "type": "content",
      "contentRole": "learn",
      "tags": [
        "genai-mastery"
      ],
      "durations": {
        "full": [
          15,
          30
        ],
        "core": null,
        "sections": {}
      }
    },
    "llmops": {
      "path": "llmops.html",
      "title": "LLMOps & Observability",
      "type": "content",
      "contentRole": "learn",
      "tags": [
        "genai-mastery"
      ],
      "durations": {
        "full": [
          15,
          30
        ],
        "core": null,
        "sections": {}
      }
    },
    "memory": {
      "path": "memory.html",
      "title": "Memory",
      "type": "content",
      "contentRole": "learn",
      "tags": [
        "genai-mastery"
      ],
      "durations": {
        "full": [
          15,
          30
        ],
        "core": null,
        "sections": {}
      }
    },
    "beginner-basics": {
      "path": "modules/00_basics.html",
      "title": "The basics: models, tokens and transformers",
      "type": "content",
      "contentRole": "learn",
      "durations": {
        "full": [
          30,
          45
        ],
        "core": null,
        "sections": {}
      }
    },
    "llm-foundations": {
      "path": "modules/01_foundations.html",
      "title": "Foundations of LLMs",
      "type": "content",
      "contentRole": "learn",
      "tags": [
        "genai-mastery"
      ],
      "durations": {
        "full": [
          120,
          180
        ],
        "core": null,
        "sections": {}
      }
    },
    "transformers": {
      "path": "modules/02_transformers.html",
      "title": "Transformers",
      "type": "content",
      "contentRole": "learn",
      "tags": [
        "genai-mastery"
      ],
      "durations": {
        "full": [
          150,
          240
        ],
        "core": null,
        "sections": {}
      }
    },
    "embeddings": {
      "path": "modules/04_embeddings.html",
      "title": "Embeddings",
      "type": "content",
      "contentRole": "learn",
      "tags": [
        "genai-mastery"
      ],
      "durations": {
        "full": [
          120,
          180
        ],
        "core": null,
        "sections": {}
      }
    },
    "vector-databases": {
      "path": "modules/05_vector_databases.html",
      "title": "Vector Databases",
      "type": "content",
      "contentRole": "learn",
      "tags": [
        "genai-mastery"
      ],
      "durations": {
        "full": [
          120,
          180
        ],
        "core": null,
        "sections": {}
      }
    },
    "rag-basics-moved": {
      "path": "modules/06_rag_basics.html",
      "title": "Module 06 · RAG Basics is now part of RAG, End-to-End",
      "type": "migration",
      "movedTo": "rag-deep-dive",
      "anchor": "pipeline"
    },
    "adv-rag-moved": {
      "path": "modules/07_advanced_rag.html",
      "title": "Module 07 · Advanced RAG is now part of RAG, End-to-End",
      "type": "migration",
      "movedTo": "rag-deep-dive",
      "anchor": "retrieval"
    },
    "agentic-ai": {
      "path": "modules/08_agents.html",
      "title": "Agentic AI",
      "type": "content",
      "contentRole": "learn",
      "tags": [
        "genai-mastery"
      ],
      "durations": {
        "full": [
          180,
          300
        ],
        "core": null,
        "sections": {}
      }
    },
    "mcp-module": {
      "path": "modules/09_mcp.html",
      "title": "Model Context Protocol",
      "type": "content",
      "contentRole": "learn",
      "tags": [
        "genai-mastery"
      ],
      "durations": {
        "full": [
          120,
          180
        ],
        "core": null,
        "sections": {}
      }
    },
    "langchain": {
      "path": "modules/10_langchain.html",
      "title": "LangChain",
      "type": "content",
      "contentRole": "learn",
      "tags": [
        "genai-mastery"
      ],
      "durations": {
        "full": [
          120,
          180
        ],
        "core": null,
        "sections": {}
      }
    },
    "langgraph-module": {
      "path": "modules/12_langgraph.html",
      "title": "LangGraph",
      "type": "content",
      "contentRole": "learn",
      "tags": [
        "genai-mastery"
      ],
      "durations": {
        "full": [
          120,
          180
        ],
        "core": null,
        "sections": {}
      }
    },
    "multi-agent-systems": {
      "path": "modules/13_multi_agents.html",
      "title": "Multi-Agent Systems",
      "type": "content",
      "contentRole": "learn",
      "tags": [
        "genai-mastery"
      ],
      "durations": {
        "full": [
          90,
          180
        ],
        "core": null,
        "sections": {}
      }
    },
    "production-genai": {
      "path": "modules/14_production_genai.html",
      "title": "Production GenAI",
      "type": "content",
      "contentRole": "learn",
      "tags": [
        "genai-mastery"
      ],
      "durations": {
        "full": [
          120,
          180
        ],
        "core": null,
        "sections": {}
      }
    },
    "progress-moved": {
      "path": "progress.html",
      "title": "The progress tracker has been retired",
      "type": "migration",
      "movedTo": "study-plan"
    },
    "py-p1": {
      "path": "python-interview/01-python-core.html",
      "title": "Python Core & How It Runs",
      "type": "content",
      "contentRole": "drill",
      "durations": {
        "full": null,
        "core": null,
        "sections": {}
      }
    },
    "py-p2": {
      "path": "python-interview/02-data-structures.html",
      "title": "Strings, Collections & Data Structures",
      "type": "content",
      "contentRole": "drill",
      "durations": {
        "full": null,
        "core": null,
        "sections": {}
      }
    },
    "py-p3": {
      "path": "python-interview/03-functions-scope.html",
      "title": "Functions, Scope & Functional Python",
      "type": "content",
      "contentRole": "drill",
      "durations": {
        "full": null,
        "core": null,
        "sections": {}
      }
    },
    "py-p4": {
      "path": "python-interview/04-iterators-generators.html",
      "title": "Iterators, Generators & Comprehensions",
      "type": "content",
      "contentRole": "drill",
      "durations": {
        "full": null,
        "core": null,
        "sections": {}
      }
    },
    "py-p5": {
      "path": "python-interview/05-decorators-context.html",
      "title": "Decorators, Context Managers & Descriptors",
      "type": "content",
      "contentRole": "drill",
      "durations": {
        "full": null,
        "core": null,
        "sections": {}
      }
    },
    "py-p6": {
      "path": "python-interview/06-oop-data-model.html",
      "title": "OOP & the Python Data Model",
      "type": "content",
      "contentRole": "drill",
      "durations": {
        "full": null,
        "core": null,
        "sections": {}
      }
    },
    "py-p7": {
      "path": "python-interview/07-exceptions-packaging.html",
      "title": "Exceptions, Modules & Packaging",
      "type": "content",
      "contentRole": "drill",
      "durations": {
        "full": null,
        "core": null,
        "sections": {}
      }
    },
    "py-p8": {
      "path": "python-interview/08-memory-performance.html",
      "title": "Memory, Garbage Collection & Performance",
      "type": "content",
      "contentRole": "drill",
      "durations": {
        "full": null,
        "core": null,
        "sections": {}
      }
    },
    "py-p9": {
      "path": "python-interview/09-concurrency.html",
      "title": "Threads, Processes & Asyncio",
      "type": "content",
      "contentRole": "drill",
      "durations": {
        "full": null,
        "core": null,
        "sections": {}
      }
    },
    "py-p10": {
      "path": "python-interview/10-typing-stdlib-testing.html",
      "title": "Type Hints, Standard Library & Testing",
      "type": "content",
      "contentRole": "drill",
      "durations": {
        "full": null,
        "core": null,
        "sections": {}
      }
    },
    "py-p11": {
      "path": "python-interview/11-backend-apis.html",
      "title": "Backend Python, APIs & Databases",
      "type": "content",
      "contentRole": "drill",
      "durations": {
        "full": null,
        "core": null,
        "sections": {}
      }
    },
    "py-p12": {
      "path": "python-interview/12-numpy-pandas-data.html",
      "title": "NumPy, Pandas & Data Engineering",
      "type": "content",
      "contentRole": "drill",
      "durations": {
        "full": null,
        "core": null,
        "sections": {}
      }
    },
    "py-p13": {
      "path": "python-interview/13-ml-ai-llm.html",
      "title": "ML, Deep Learning, LLMs & MLOps",
      "type": "content",
      "contentRole": "drill",
      "durations": {
        "full": null,
        "core": null,
        "sections": {}
      }
    },
    "py-p14": {
      "path": "python-interview/14-coding-behavioural.html",
      "title": "Coding Round & Project Discussion",
      "type": "content",
      "contentRole": "drill",
      "durations": {
        "full": null,
        "core": null,
        "sections": {}
      }
    },
    "py-p15": {
      "path": "python-interview/15-practical-scenarios.html",
      "title": "Practical Questions",
      "type": "content",
      "contentRole": "drill",
      "durations": {
        "full": null,
        "core": null,
        "sections": {}
      }
    },
    "python-bank-index": {
      "path": "python-interview/index.html",
      "title": "Python bank - overview",
      "type": "index"
    },
    "rag-deep-dive": {
      "path": "rag-deep-dive.html",
      "title": "RAG, End-to-End",
      "type": "content",
      "contentRole": "learn",
      "tags": [
        "genai-mastery"
      ],
      "durations": {
        "full": [
          180,
          300
        ],
        "core": null,
        "sections": {}
      }
    },
    "scn-01": {
      "path": "scenario-practice/01-enterprise-knowledge-assistant.html",
      "title": "Enterprise knowledge assistant",
      "type": "content",
      "contentRole": "drill",
      "tags": [
        "scenario"
      ],
      "durations": {
        "full": [
          120,
          180
        ],
        "core": null,
        "sections": {}
      }
    },
    "scn-02": {
      "path": "scenario-practice/02-customer-support-agent.html",
      "title": "Customer support agent",
      "type": "content",
      "contentRole": "drill",
      "tags": [
        "scenario"
      ],
      "durations": {
        "full": [
          120,
          180
        ],
        "core": null,
        "sections": {}
      }
    },
    "scn-03": {
      "path": "scenario-practice/03-secure-text-to-sql.html",
      "title": "Secure text-to-SQL",
      "type": "content",
      "contentRole": "drill",
      "tags": [
        "scenario"
      ],
      "durations": {
        "full": [
          120,
          180
        ],
        "core": null,
        "sections": {}
      }
    },
    "scn-04": {
      "path": "scenario-practice/04-ats-recruiter-copilot.html",
      "title": "ATS recruiter copilot",
      "type": "content",
      "contentRole": "drill",
      "tags": [
        "scenario"
      ],
      "durations": {
        "full": [
          120,
          180
        ],
        "core": null,
        "sections": {}
      }
    },
    "scn-05": {
      "path": "scenario-practice/05-multilingual-voice-assistant.html",
      "title": "Multilingual voice assistant",
      "type": "content",
      "contentRole": "drill",
      "tags": [
        "scenario"
      ],
      "durations": {
        "full": [
          120,
          180
        ],
        "core": null,
        "sections": {}
      }
    },
    "scn-06": {
      "path": "scenario-practice/06-invoice-document-workflow.html",
      "title": "Invoice document workflow",
      "type": "content",
      "contentRole": "drill",
      "tags": [
        "scenario"
      ],
      "durations": {
        "full": [
          120,
          180
        ],
        "core": null,
        "sections": {}
      }
    },
    "scn-07": {
      "path": "scenario-practice/07-high-scale-shopping-assistant.html",
      "title": "High-scale shopping assistant",
      "type": "content",
      "contentRole": "drill",
      "tags": [
        "scenario"
      ],
      "durations": {
        "full": [
          120,
          180
        ],
        "core": null,
        "sections": {}
      }
    },
    "scn-08": {
      "path": "scenario-practice/08-regulated-financial-research.html",
      "title": "Financial research copilot",
      "type": "content",
      "contentRole": "drill",
      "tags": [
        "scenario"
      ],
      "durations": {
        "full": [
          120,
          180
        ],
        "core": null,
        "sections": {}
      }
    },
    "scn-framework": {
      "path": "scenario-practice/framework.html",
      "title": "Answer framework",
      "type": "content",
      "contentRole": "learn",
      "tags": [
        "scenario"
      ],
      "durations": {
        "full": [
          120,
          180
        ],
        "core": null,
        "sections": {}
      }
    },
    "scenarios-index": {
      "path": "scenario-practice/index.html",
      "title": "Scenario studio overview",
      "type": "index"
    },
    "study-plan": {
      "path": "study-plan.html",
      "title": "Study Plan",
      "type": "index"
    },
    "review": {
      "path": "review.html",
      "title": "Review cards",
      "type": "reference",
      "contentRole": "reference"
    }
  },
  "collections": {
    "mastery": {
      "label": "GenAI Mastery",
      "index": "hub-home",
      "members": [
        "llm-foundations",
        "transformers",
        "embeddings",
        "vector-databases",
        "rag-deep-dive",
        "agentic-ai",
        "mcp-module",
        "memory",
        "langchain",
        "langgraph-module",
        "multi-agent-systems",
        "production-genai",
        "guardrails",
        "llm-evals",
        "llmops"
      ]
    },
    "genai-bank": {
      "label": "GenAI Interview Bank",
      "index": "genai-bank-index",
      "members": [
        "genai-g0",
        "genai-g1",
        "genai-g2",
        "genai-g3",
        "genai-g4",
        "genai-g5",
        "genai-g6",
        "genai-g7",
        "genai-g8",
        "genai-g9",
        "genai-g10",
        "genai-g11"
      ]
    },
    "python-bank": {
      "label": "Python & AI/ML Bank",
      "index": "python-bank-index",
      "members": [
        "py-p1",
        "py-p2",
        "py-p3",
        "py-p4",
        "py-p5",
        "py-p6",
        "py-p7",
        "py-p8",
        "py-p9",
        "py-p10",
        "py-p11",
        "py-p12",
        "py-p13",
        "py-p14",
        "py-p15"
      ],
      "pacing": "parallel-rail",
      "durations": {
        "full": [
          2160,
          3240
        ],
        "source": "published-aggregate",
        "includeIndex": true
      }
    },
    "tech-drills": {
      "label": "Technology Drills",
      "index": "drills-index",
      "members": [
        "drill-python-sync-async",
        "drill-fastapi",
        "drill-websockets",
        "drill-langchain",
        "drill-rag",
        "drill-mcp"
      ]
    },
    "scenarios": {
      "label": "Scenario Design Studio",
      "index": "scenarios-index",
      "members": [
        "scn-framework",
        "scn-01",
        "scn-02",
        "scn-03",
        "scn-04",
        "scn-05",
        "scn-06",
        "scn-07",
        "scn-08"
      ]
    }
  },
  "routes": {
    "full": {
      "status": "active",
      "label": "Full-Depth Curriculum",
      "blurb": "Every kept topic, in order, with its interview questions, drills and design scenarios.",
      "preflight": [
        "beginner-basics"
      ],
      "controlPages": [
        "study-plan"
      ],
      "finish": {
        "page": "study-plan"
      },
      "steps": [
        {
          "page": "llm-foundations",
          "mode": "full"
        },
        {
          "page": "genai-g0",
          "mode": "full"
        },
        {
          "page": "transformers",
          "mode": "full"
        },
        {
          "page": "genai-g1",
          "mode": "full"
        },
        {
          "page": "embeddings",
          "mode": "full"
        },
        {
          "page": "vector-databases",
          "mode": "full"
        },
        {
          "page": "rag-deep-dive",
          "mode": "full"
        },
        {
          "page": "drill-rag",
          "mode": "full"
        },
        {
          "page": "genai-g2",
          "mode": "full"
        },
        {
          "page": "agentic-ai",
          "mode": "full"
        },
        {
          "page": "mcp-module",
          "mode": "full"
        },
        {
          "page": "memory",
          "mode": "full"
        },
        {
          "page": "drill-mcp",
          "mode": "full"
        },
        {
          "page": "genai-g3",
          "mode": "full"
        },
        {
          "page": "langchain",
          "mode": "full"
        },
        {
          "page": "drill-langchain",
          "mode": "full"
        },
        {
          "page": "langgraph-module",
          "mode": "full"
        },
        {
          "page": "multi-agent-systems",
          "mode": "full"
        },
        {
          "page": "production-genai",
          "mode": "full"
        },
        {
          "page": "guardrails",
          "mode": "full"
        },
        {
          "page": "llm-evals",
          "mode": "full"
        },
        {
          "page": "llmops",
          "mode": "full"
        },
        {
          "page": "genai-g4",
          "mode": "full"
        },
        {
          "page": "genai-g5",
          "mode": "full"
        },
        {
          "page": "genai-g6",
          "mode": "full"
        },
        {
          "page": "drill-python-sync-async",
          "mode": "full"
        },
        {
          "page": "drill-fastapi",
          "mode": "full"
        },
        {
          "page": "drill-websockets",
          "mode": "full"
        },
        {
          "page": "genai-g9",
          "mode": "full"
        },
        {
          "page": "genai-g7",
          "mode": "full"
        },
        {
          "page": "scn-framework",
          "mode": "full"
        },
        {
          "page": "scn-01",
          "mode": "full"
        },
        {
          "page": "scn-02",
          "mode": "full"
        },
        {
          "page": "scn-03",
          "mode": "full"
        },
        {
          "page": "scn-04",
          "mode": "full"
        },
        {
          "page": "scn-05",
          "mode": "full"
        },
        {
          "page": "scn-06",
          "mode": "full"
        },
        {
          "page": "scn-07",
          "mode": "full"
        },
        {
          "page": "scn-08",
          "mode": "full"
        },
        {
          "page": "genai-g10",
          "mode": "full"
        },
        {
          "page": "genai-g8",
          "mode": "full"
        },
        {
          "page": "genai-g11",
          "mode": "full"
        }
      ]
    }
  },
  "metrics": {
    "full-spine-hours": {
      "source": {
        "route": "full"
      },
      "expect": [
        8220,
        12720
      ]
    },
    "python-rail-hours": {
      "source": {
        "collectionAggregate": "python-bank",
        "mode": "full"
      },
      "expect": [
        2160,
        3240
      ]
    },
    "full-program-hours": {
      "sum": [
        "full-spine-hours",
        "python-rail-hours"
      ],
      "expect": [
        10380,
        15960
      ]
    },
    "genai-mastery-hours": {
      "source": {
        "route": "full",
        "includeTags": [
          "genai-mastery"
        ]
      },
      "expect": [
        1500,
        2400
      ]
    },
    "genai-bank-hours": {
      "source": {
        "route": "full",
        "includeTags": [
          "genai-bank"
        ]
      },
      "expect": [
        4260,
        6600
      ]
    },
    "tech-drills-hours": {
      "source": {
        "route": "full",
        "includeTags": [
          "tech-drill"
        ]
      },
      "expect": [
        1380,
        2100
      ]
    },
    "scenarios-hours": {
      "source": {
        "route": "full",
        "includeTags": [
          "scenario"
        ]
      },
      "expect": [
        1080,
        1620
      ]
    },
    "basics-preflight-minutes": {
      "source": {
        "page": "beginner-basics",
        "mode": "full"
      },
      "expect": [
        30,
        45
      ],
      "unit": "minutes",
      "note": "The Basics preflight is stated in minutes, not hours. The range is the one already published on study-plan.html; the page duration was back-filled from it in Release 3.1 rather than estimated."
    },
    "interview-questions-hours": {
      "sum": [
        "genai-bank-hours",
        "python-rail-hours",
        "tech-drills-hours"
      ],
      "expect": [
        7800,
        11940
      ]
    }
  }
}
});
