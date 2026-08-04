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
  "version": "2026-08-03",
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
    "agent-protocols": {
      "path": "agent-protocols.html",
      "title": "Agent Protocols — MCP · A2A · A2UI",
      "type": "content",
      "contentRole": "learn",
      "tags": [
        "deep-dive"
      ],
      "durations": {
        "full": [
          360,
          600
        ],
        "core": null,
        "sections": {}
      }
    },
    "claude-agent": {
      "path": "claude-agent.html",
      "title": "How a Claude Agent Works",
      "type": "content",
      "contentRole": "learn",
      "tags": [
        "deep-dive"
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
    "dsa-00": {
      "path": "dsa-prep/00-interview-strategy.html",
      "title": "Interview Strategy",
      "type": "content",
      "contentRole": "learn",
      "durations": {
        "full": null,
        "core": null,
        "sections": {}
      }
    },
    "dsa-01": {
      "path": "dsa-prep/01-python-dsa-foundations.html",
      "title": "Python DSA Foundations",
      "type": "content",
      "contentRole": "learn",
      "durations": {
        "full": null,
        "core": null,
        "sections": {}
      }
    },
    "dsa-02": {
      "path": "dsa-prep/02-arrays.html",
      "title": "Arrays",
      "type": "content",
      "contentRole": "learn",
      "durations": {
        "full": null,
        "core": null,
        "sections": {}
      }
    },
    "dsa-03": {
      "path": "dsa-prep/03-linked-lists.html",
      "title": "Linked Lists",
      "type": "content",
      "contentRole": "learn",
      "durations": {
        "full": null,
        "core": null,
        "sections": {}
      }
    },
    "dsa-04": {
      "path": "dsa-prep/04-hashing.html",
      "title": "Hashing",
      "type": "content",
      "contentRole": "learn",
      "durations": {
        "full": null,
        "core": null,
        "sections": {}
      }
    },
    "dsa-05": {
      "path": "dsa-prep/05-strings.html",
      "title": "Strings",
      "type": "content",
      "contentRole": "learn",
      "durations": {
        "full": null,
        "core": null,
        "sections": {}
      }
    },
    "dsa-06": {
      "path": "dsa-prep/06-two-pointers.html",
      "title": "Two Pointers",
      "type": "content",
      "contentRole": "learn",
      "durations": {
        "full": null,
        "core": null,
        "sections": {}
      }
    },
    "dsa-07": {
      "path": "dsa-prep/07-sliding-window-prefix-sums.html",
      "title": "Sliding Window & Prefix Sums",
      "type": "content",
      "contentRole": "learn",
      "durations": {
        "full": null,
        "core": null,
        "sections": {}
      }
    },
    "dsa-08": {
      "path": "dsa-prep/08-stacks-queues-deques.html",
      "title": "Stacks, Queues & Deques",
      "type": "content",
      "contentRole": "learn",
      "durations": {
        "full": null,
        "core": null,
        "sections": {}
      }
    },
    "dsa-09": {
      "path": "dsa-prep/09-sorting-intervals-selection.html",
      "title": "Sorting, Intervals & Selection",
      "type": "content",
      "contentRole": "learn",
      "durations": {
        "full": null,
        "core": null,
        "sections": {}
      }
    },
    "dsa-10": {
      "path": "dsa-prep/10-binary-search.html",
      "title": "Binary Search",
      "type": "content",
      "contentRole": "learn",
      "durations": {
        "full": null,
        "core": null,
        "sections": {}
      }
    },
    "dsa-11": {
      "path": "dsa-prep/11-recursion-backtracking.html",
      "title": "Recursion & Backtracking",
      "type": "content",
      "contentRole": "learn",
      "durations": {
        "full": null,
        "core": null,
        "sections": {}
      }
    },
    "dsa-12": {
      "path": "dsa-prep/12-trees-bst.html",
      "title": "Trees & BST",
      "type": "content",
      "contentRole": "learn",
      "durations": {
        "full": null,
        "core": null,
        "sections": {}
      }
    },
    "dsa-13": {
      "path": "dsa-prep/13-heaps-priority-queues.html",
      "title": "Heaps & Priority Queues",
      "type": "content",
      "contentRole": "learn",
      "durations": {
        "full": null,
        "core": null,
        "sections": {}
      }
    },
    "dsa-14": {
      "path": "dsa-prep/14-tries.html",
      "title": "Tries",
      "type": "content",
      "contentRole": "learn",
      "durations": {
        "full": null,
        "core": null,
        "sections": {}
      }
    },
    "dsa-15": {
      "path": "dsa-prep/15-graphs-grids.html",
      "title": "Graphs & Grids",
      "type": "content",
      "contentRole": "learn",
      "durations": {
        "full": null,
        "core": null,
        "sections": {}
      }
    },
    "dsa-16": {
      "path": "dsa-prep/16-advanced-graphs.html",
      "title": "Advanced Graphs",
      "type": "content",
      "contentRole": "learn",
      "durations": {
        "full": null,
        "core": null,
        "sections": {}
      }
    },
    "dsa-17": {
      "path": "dsa-prep/17-greedy.html",
      "title": "Greedy",
      "type": "content",
      "contentRole": "learn",
      "durations": {
        "full": null,
        "core": null,
        "sections": {}
      }
    },
    "dsa-18": {
      "path": "dsa-prep/18-dynamic-programming-1d.html",
      "title": "Dynamic Programming — 1D",
      "type": "content",
      "contentRole": "learn",
      "durations": {
        "full": null,
        "core": null,
        "sections": {}
      }
    },
    "dsa-19": {
      "path": "dsa-prep/19-dynamic-programming-2d.html",
      "title": "Dynamic Programming — 2D",
      "type": "content",
      "contentRole": "learn",
      "durations": {
        "full": null,
        "core": null,
        "sections": {}
      }
    },
    "dsa-20": {
      "path": "dsa-prep/20-bit-math-matrix.html",
      "title": "Bit, Math & Matrix",
      "type": "content",
      "contentRole": "learn",
      "durations": {
        "full": null,
        "core": null,
        "sections": {}
      }
    },
    "dsa-21": {
      "path": "dsa-prep/21-data-structure-design.html",
      "title": "Data Structure Design",
      "type": "content",
      "contentRole": "learn",
      "durations": {
        "full": null,
        "core": null,
        "sections": {}
      }
    },
    "dsa-22": {
      "path": "dsa-prep/22-python-numpy-pandas-performance.html",
      "title": "Python, NumPy & Pandas Performance",
      "type": "content",
      "contentRole": "learn",
      "durations": {
        "full": null,
        "core": null,
        "sections": {}
      }
    },
    "dsa-23": {
      "path": "dsa-prep/23-role-tracks-mocks-revision.html",
      "title": "Role Tracks, Mocks & Revision",
      "type": "content",
      "contentRole": "learn",
      "durations": {
        "full": null,
        "core": null,
        "sections": {}
      }
    },
    "dsa-24": {
      "path": "dsa-prep/24-advanced-dsa-optional.html",
      "title": "Advanced DSA — Optional",
      "type": "content",
      "contentRole": "learn",
      "durations": {
        "full": null,
        "core": null,
        "sections": {}
      }
    },
    "dsa-complexity": {
      "path": "dsa-prep/complexity.html",
      "title": "Time & Space Complexity",
      "type": "content",
      "contentRole": "learn",
      "durations": {
        "full": null,
        "core": null,
        "sections": {}
      }
    },
    "dsa-index": {
      "path": "dsa-prep/index.html",
      "title": "Contents",
      "type": "index"
    },
    "dsa-high-freq": {
      "path": "dsa-prep/top-150.html",
      "title": "High-Frequency Questions",
      "type": "reference",
      "contentRole": "reference",
      "durations": {
        "full": null,
        "core": null,
        "sections": {}
      }
    },
    "dsa-top-50": {
      "path": "dsa-prep/top-50.html",
      "title": "Top 50 Questions",
      "type": "reference",
      "contentRole": "reference",
      "durations": {
        "full": null,
        "core": null,
        "sections": {}
      }
    },
    "google-prep": {
      "path": "google-prep/index.html",
      "title": "Build the skills to clear Google interviews",
      "type": "private"
    },
    "guardrails": {
      "path": "guardrails.html",
      "title": "Guardrails",
      "type": "content",
      "contentRole": "learn",
      "tags": [
        "deep-dive"
      ],
      "durations": {
        "full": [
          360,
          600
        ],
        "core": null,
        "sections": {}
      }
    },
    "hermes": {
      "path": "hermes.html",
      "title": "Hermes — open local models",
      "type": "content",
      "contentRole": "learn",
      "tags": [
        "deep-dive"
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
      "title": "Drills — overview",
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
      "title": "GenAI bank — overview",
      "type": "index"
    },
    "job-search": {
      "path": "job-search/index.html",
      "title": "Where to Find Remote Roles",
      "type": "reference",
      "contentRole": "reference",
      "durations": {
        "full": [
          120,
          180
        ],
        "core": null,
        "sections": {}
      }
    },
    "langfuse": {
      "path": "langfuse.html",
      "title": "Langfuse — Observability",
      "type": "content",
      "contentRole": "learn",
      "tags": [
        "deep-dive"
      ],
      "durations": {
        "full": [
          360,
          600
        ],
        "core": null,
        "sections": {}
      }
    },
    "langgraph-asyncio": {
      "path": "langgraph-asyncio.html",
      "title": "AsyncIO for LangGraph",
      "type": "content",
      "contentRole": "learn",
      "tags": [
        "deep-dive"
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
    "langgraph-pydantic": {
      "path": "langgraph-pydantic.html",
      "title": "Pydantic for LangGraph",
      "type": "content",
      "contentRole": "learn",
      "tags": [
        "deep-dive"
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
    "langgraph-deep-dive": {
      "path": "langgraph.html",
      "title": "LangGraph & components",
      "type": "content",
      "contentRole": "learn",
      "tags": [
        "deep-dive"
      ],
      "durations": {
        "full": [
          600,
          960
        ],
        "core": null,
        "sections": {}
      }
    },
    "llm-evals": {
      "path": "llm-evals.html",
      "title": "LLM Evals",
      "type": "content",
      "contentRole": "learn",
      "tags": [
        "deep-dive"
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
    "llmops": {
      "path": "llmops.html",
      "title": "LLMOps",
      "type": "content",
      "contentRole": "learn",
      "tags": [
        "deep-dive"
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
    "ml-00": {
      "path": "machine-learning/00-interview-landscape.html",
      "title": "ML Interview Landscape & Study Setup",
      "type": "optional-track",
      "contentRole": "learn",
      "durations": {
        "full": null,
        "core": null,
        "sections": {}
      },
      "track": "classical-ml"
    },
    "ml-01": {
      "path": "machine-learning/01-math-statistics.html",
      "title": "Math & Statistics Prerequisites",
      "type": "optional-track",
      "contentRole": "learn",
      "durations": {
        "full": null,
        "core": null,
        "sections": {}
      },
      "track": "classical-ml"
    },
    "ml-02": {
      "path": "machine-learning/02-algorithm-taxonomy.html",
      "title": "The ML Landscape & Algorithm Taxonomy",
      "type": "optional-track",
      "contentRole": "learn",
      "durations": {
        "full": null,
        "core": null,
        "sections": {}
      },
      "track": "classical-ml"
    },
    "ml-03": {
      "path": "machine-learning/03-classification-vs-regression.html",
      "title": "Classification vs Regression",
      "type": "optional-track",
      "contentRole": "learn",
      "durations": {
        "full": null,
        "core": null,
        "sections": {}
      },
      "track": "classical-ml"
    },
    "ml-04": {
      "path": "machine-learning/04-data-prep-feature-engineering.html",
      "title": "Data Preparation, EDA & Feature Engineering",
      "type": "optional-track",
      "contentRole": "learn",
      "durations": {
        "full": null,
        "core": null,
        "sections": {}
      },
      "track": "classical-ml"
    },
    "ml-05": {
      "path": "machine-learning/05-bias-variance-cross-validation.html",
      "title": "Bias–Variance, Splits & Cross-Validation",
      "type": "optional-track",
      "contentRole": "learn",
      "durations": {
        "full": null,
        "core": null,
        "sections": {}
      },
      "track": "classical-ml"
    },
    "ml-06": {
      "path": "machine-learning/06-linear-regression.html",
      "title": "Linear Regression",
      "type": "optional-track",
      "contentRole": "learn",
      "durations": {
        "full": null,
        "core": null,
        "sections": {}
      },
      "track": "classical-ml"
    },
    "ml-07": {
      "path": "machine-learning/07-logistic-regression-log-odds.html",
      "title": "Logistic Regression & Log Odds",
      "type": "optional-track",
      "contentRole": "learn",
      "durations": {
        "full": null,
        "core": null,
        "sections": {}
      },
      "track": "classical-ml"
    },
    "ml-08": {
      "path": "machine-learning/08-regularization.html",
      "title": "Regularization: Ridge, Lasso & Elastic Net",
      "type": "optional-track",
      "contentRole": "learn",
      "durations": {
        "full": null,
        "core": null,
        "sections": {}
      },
      "track": "classical-ml"
    },
    "ml-09": {
      "path": "machine-learning/09-gradient-descent-optimization.html",
      "title": "Gradient Descent & Optimization",
      "type": "optional-track",
      "contentRole": "learn",
      "durations": {
        "full": null,
        "core": null,
        "sections": {}
      },
      "track": "classical-ml"
    },
    "ml-10": {
      "path": "machine-learning/10-classification-metrics.html",
      "title": "Classification Metrics & the Confusion Matrix",
      "type": "optional-track",
      "contentRole": "learn",
      "durations": {
        "full": null,
        "core": null,
        "sections": {}
      },
      "track": "classical-ml"
    },
    "ml-11": {
      "path": "machine-learning/11-regression-metrics.html",
      "title": "Regression Metrics",
      "type": "optional-track",
      "contentRole": "learn",
      "durations": {
        "full": null,
        "core": null,
        "sections": {}
      },
      "track": "classical-ml"
    },
    "ml-12": {
      "path": "machine-learning/12-imbalanced-data.html",
      "title": "Imbalanced Data",
      "type": "optional-track",
      "contentRole": "learn",
      "durations": {
        "full": null,
        "core": null,
        "sections": {}
      },
      "track": "classical-ml"
    },
    "ml-13": {
      "path": "machine-learning/13-knn-naive-bayes.html",
      "title": "KNN, Naive Bayes & Discriminant Analysis",
      "type": "optional-track",
      "contentRole": "learn",
      "durations": {
        "full": null,
        "core": null,
        "sections": {}
      },
      "track": "classical-ml"
    },
    "ml-14": {
      "path": "machine-learning/14-svm-kernels.html",
      "title": "Support Vector Machines & Kernels",
      "type": "optional-track",
      "contentRole": "learn",
      "durations": {
        "full": null,
        "core": null,
        "sections": {}
      },
      "track": "classical-ml"
    },
    "ml-15": {
      "path": "machine-learning/15-decision-trees.html",
      "title": "Decision Trees",
      "type": "optional-track",
      "contentRole": "learn",
      "durations": {
        "full": null,
        "core": null,
        "sections": {}
      },
      "track": "classical-ml"
    },
    "ml-16": {
      "path": "machine-learning/16-bagging-random-forest.html",
      "title": "Bagging & Random Forest",
      "type": "optional-track",
      "contentRole": "learn",
      "durations": {
        "full": null,
        "core": null,
        "sections": {}
      },
      "track": "classical-ml"
    },
    "ml-17": {
      "path": "machine-learning/17-boosting-gradient-boosting.html",
      "title": "Boosting I: AdaBoost & Gradient Boosting",
      "type": "optional-track",
      "contentRole": "learn",
      "durations": {
        "full": null,
        "core": null,
        "sections": {}
      },
      "track": "classical-ml"
    },
    "ml-18": {
      "path": "machine-learning/18-xgboost-lightgbm-catboost.html",
      "title": "Boosting II: XGBoost, LightGBM & CatBoost",
      "type": "optional-track",
      "contentRole": "learn",
      "durations": {
        "full": null,
        "core": null,
        "sections": {}
      },
      "track": "classical-ml"
    },
    "ml-19": {
      "path": "machine-learning/19-clustering-dimensionality-reduction.html",
      "title": "Clustering & Dimensionality Reduction",
      "type": "optional-track",
      "contentRole": "learn",
      "durations": {
        "full": null,
        "core": null,
        "sections": {}
      },
      "track": "classical-ml"
    },
    "ml-20": {
      "path": "machine-learning/20-hyperparameter-tuning.html",
      "title": "Hyperparameter Tuning & Model Selection",
      "type": "optional-track",
      "contentRole": "learn",
      "durations": {
        "full": null,
        "core": null,
        "sections": {}
      },
      "track": "classical-ml"
    },
    "ml-21": {
      "path": "machine-learning/21-interpretability-explainability.html",
      "title": "Interpretability & Explainability",
      "type": "optional-track",
      "contentRole": "learn",
      "durations": {
        "full": null,
        "core": null,
        "sections": {}
      },
      "track": "classical-ml"
    },
    "ml-22": {
      "path": "machine-learning/22-ml-system-design.html",
      "title": "ML System Design, Deployment & Monitoring",
      "type": "optional-track",
      "contentRole": "learn",
      "durations": {
        "full": null,
        "core": null,
        "sections": {}
      },
      "track": "classical-ml"
    },
    "ml-23": {
      "path": "machine-learning/23-bridge-neural-networks-genai.html",
      "title": "Bridge: Classical ML → Neural Networks → GenAI",
      "type": "optional-track",
      "contentRole": "learn",
      "durations": {
        "full": null,
        "core": null,
        "sections": {}
      },
      "track": "classical-ml"
    },
    "ml-24": {
      "path": "machine-learning/24-mocks-revision.html",
      "title": "Mock Interview Drills & Revision",
      "type": "optional-track",
      "contentRole": "learn",
      "durations": {
        "full": null,
        "core": null,
        "sections": {}
      },
      "track": "classical-ml"
    },
    "ml-index": {
      "path": "machine-learning/index.html",
      "title": "Machine Learning Interview Preparation",
      "type": "index"
    },
    "memory": {
      "path": "memory.html",
      "title": "Memory in LLMs",
      "type": "content",
      "contentRole": "learn",
      "tags": [
        "deep-dive"
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
          480,
          720
        ],
        "core": null,
        "sections": {}
      }
    },
    "transformers": {
      "path": "modules/02_transformers.html",
      "title": "Transformers Deep Dive",
      "type": "content",
      "contentRole": "learn",
      "tags": [
        "genai-mastery"
      ],
      "durations": {
        "full": [
          840,
          1320
        ],
        "core": null,
        "sections": {}
      }
    },
    "local-llms": {
      "path": "modules/03_local_llms.html",
      "title": "Local LLMs & Ollama",
      "type": "content",
      "contentRole": "learn",
      "tags": [
        "genai-mastery"
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
          480,
          720
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
          540,
          840
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
          720,
          1080
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
          480,
          720
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
          600,
          960
        ],
        "core": null,
        "sections": {}
      }
    },
    "llamaindex": {
      "path": "modules/11_llamaindex.html",
      "title": "LlamaIndex",
      "type": "content",
      "contentRole": "learn",
      "tags": [
        "genai-mastery"
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
          960,
          1440
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
          600,
          960
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
          960,
          1440
        ],
        "core": null,
        "sections": {}
      }
    },
    "capstone-projects": {
      "path": "modules/15_capstone_projects.html",
      "title": "Capstone Projects",
      "type": "content",
      "contentRole": "build",
      "tags": [
        "genai-mastery"
      ],
      "durations": {
        "full": [
          3000,
          6000
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
      "title": "Python bank — overview",
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
          1440,
          2160
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
    "agents-course": {
      "path": "teach-agents/index.html",
      "title": "Course index",
      "type": "index",
      "navSlot": true
    },
    "ta-l01": {
      "path": "teach-agents/lessons/0001-llm-mechanics.html",
      "title": "LLM mechanics",
      "type": "content",
      "contentRole": "build",
      "durations": {
        "full": null,
        "core": null,
        "sections": {}
      }
    },
    "ta-l02": {
      "path": "teach-agents/lessons/0002-agent-loop.html",
      "title": "The agent loop",
      "type": "content",
      "contentRole": "build",
      "durations": {
        "full": null,
        "core": null,
        "sections": {}
      }
    },
    "ta-l03": {
      "path": "teach-agents/lessons/0003-tool-calling.html",
      "title": "Tools & validation",
      "type": "content",
      "contentRole": "build",
      "durations": {
        "full": null,
        "core": null,
        "sections": {}
      }
    },
    "ta-l04": {
      "path": "teach-agents/lessons/0004-reasoning-patterns.html",
      "title": "Reasoning patterns",
      "type": "content",
      "contentRole": "build",
      "durations": {
        "full": null,
        "core": null,
        "sections": {}
      }
    },
    "ta-l05": {
      "path": "teach-agents/lessons/0005-retrieval.html",
      "title": "Retrieval as a tool",
      "type": "content",
      "contentRole": "build",
      "durations": {
        "full": null,
        "core": null,
        "sections": {}
      }
    },
    "ta-l06": {
      "path": "teach-agents/lessons/0006-context-memory.html",
      "title": "Context & memory",
      "type": "content",
      "contentRole": "build",
      "durations": {
        "full": null,
        "core": null,
        "sections": {}
      }
    },
    "ta-l07": {
      "path": "teach-agents/lessons/0007-reliability.html",
      "title": "Reliability",
      "type": "content",
      "contentRole": "build",
      "durations": {
        "full": null,
        "core": null,
        "sections": {}
      }
    },
    "ta-l08": {
      "path": "teach-agents/lessons/0008-irreversible-actions.html",
      "title": "Irreversible actions",
      "type": "content",
      "contentRole": "build",
      "durations": {
        "full": null,
        "core": null,
        "sections": {}
      }
    },
    "ta-l09": {
      "path": "teach-agents/lessons/0009-security.html",
      "title": "Security & guardrails",
      "type": "content",
      "contentRole": "build",
      "durations": {
        "full": null,
        "core": null,
        "sections": {}
      }
    },
    "ta-l10": {
      "path": "teach-agents/lessons/0010-evaluation.html",
      "title": "Agent evaluation",
      "type": "content",
      "contentRole": "build",
      "durations": {
        "full": null,
        "core": null,
        "sections": {}
      }
    },
    "ta-l11": {
      "path": "teach-agents/lessons/0011-tracing-cost.html",
      "title": "Tracing, latency & cost",
      "type": "content",
      "contentRole": "build",
      "durations": {
        "full": null,
        "core": null,
        "sections": {}
      }
    },
    "ta-l12": {
      "path": "teach-agents/lessons/0012-mcp.html",
      "title": "MCP & the tool boundary",
      "type": "content",
      "contentRole": "build",
      "durations": {
        "full": null,
        "core": null,
        "sections": {}
      }
    },
    "ta-l13": {
      "path": "teach-agents/lessons/0013-multi-agent.html",
      "title": "Multi-agent & A2A",
      "type": "content",
      "contentRole": "build",
      "durations": {
        "full": null,
        "core": null,
        "sections": {}
      }
    },
    "ta-l14": {
      "path": "teach-agents/lessons/0014-deployment.html",
      "title": "Deployment & operations",
      "type": "content",
      "contentRole": "build",
      "durations": {
        "full": null,
        "core": null,
        "sections": {}
      }
    },
    "ta-l15": {
      "path": "teach-agents/lessons/0015-capstone.html",
      "title": "Interview capstone",
      "type": "content",
      "contentRole": "build",
      "durations": {
        "full": null,
        "core": null,
        "sections": {}
      }
    }
  },
  "collections": {
    "mastery": {
      "label": "GenAI Mastery",
      "index": "hub-home",
      "members": [
        "llm-foundations",
        "transformers",
        "local-llms",
        "embeddings",
        "vector-databases",
        "rag-deep-dive",
        "agentic-ai",
        "mcp-module",
        "langchain",
        "llamaindex",
        "langgraph-module",
        "multi-agent-systems",
        "production-genai",
        "capstone-projects"
      ]
    },
    "deep-dives": {
      "label": "Deep Dives",
      "index": "hub-home",
      "members": [
        "agent-protocols",
        "llm-evals",
        "llmops",
        "langfuse",
        "guardrails",
        "memory",
        "langgraph-deep-dive",
        "claude-agent",
        "hermes",
        "langgraph-asyncio",
        "langgraph-pydantic"
      ]
    },
    "agents-course": {
      "label": "Understanding AI Agents",
      "index": "agents-course",
      "members": [
        "ta-l01",
        "ta-l02",
        "ta-l03",
        "ta-l04",
        "ta-l05",
        "ta-l06",
        "ta-l07",
        "ta-l08",
        "ta-l09",
        "ta-l10",
        "ta-l11",
        "ta-l12",
        "ta-l13",
        "ta-l14",
        "ta-l15"
      ],
      "durations": {
        "full": [
          2760,
          3120
        ],
        "source": "published-aggregate",
        "includeIndex": true
      }
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
    },
    "dsa": {
      "label": "DSA Interview Preparation",
      "index": "dsa-index",
      "members": [
        "dsa-complexity",
        "dsa-00",
        "dsa-01",
        "dsa-02",
        "dsa-03",
        "dsa-04",
        "dsa-05",
        "dsa-06",
        "dsa-07",
        "dsa-08",
        "dsa-09",
        "dsa-10",
        "dsa-11",
        "dsa-12",
        "dsa-13",
        "dsa-14",
        "dsa-15",
        "dsa-16",
        "dsa-17",
        "dsa-18",
        "dsa-19",
        "dsa-20",
        "dsa-21",
        "dsa-22",
        "dsa-23",
        "dsa-24"
      ],
      "appendix": [
        "dsa-top-50",
        "dsa-high-freq"
      ]
    },
    "classical-ml": {
      "label": "Classical ML & ML Interviews",
      "index": "ml-index",
      "members": [
        "ml-00",
        "ml-01",
        "ml-02",
        "ml-03",
        "ml-04",
        "ml-05",
        "ml-06",
        "ml-07",
        "ml-08",
        "ml-09",
        "ml-10",
        "ml-11",
        "ml-12",
        "ml-13",
        "ml-14",
        "ml-15",
        "ml-16",
        "ml-17",
        "ml-18",
        "ml-19",
        "ml-20",
        "ml-21",
        "ml-22",
        "ml-23",
        "ml-24"
      ],
      "visibility": "hidden"
    }
  },
  "routes": {
    "full": {
      "status": "active",
      "label": "Full-Depth Curriculum",
      "blurb": "The complete theory-and-engineering path, in the published study-plan order.",
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
          "page": "local-llms",
          "mode": "full"
        },
        {
          "page": "hermes",
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
          "page": "agents-course",
          "mode": "full"
        },
        {
          "page": "ta-l01",
          "mode": "full"
        },
        {
          "page": "ta-l02",
          "mode": "full"
        },
        {
          "page": "ta-l03",
          "mode": "full"
        },
        {
          "page": "ta-l04",
          "mode": "full"
        },
        {
          "page": "ta-l05",
          "mode": "full"
        },
        {
          "page": "ta-l06",
          "mode": "full"
        },
        {
          "page": "ta-l07",
          "mode": "full"
        },
        {
          "page": "ta-l08",
          "mode": "full"
        },
        {
          "page": "ta-l09",
          "mode": "full"
        },
        {
          "page": "ta-l10",
          "mode": "full"
        },
        {
          "page": "ta-l11",
          "mode": "full"
        },
        {
          "page": "ta-l12",
          "mode": "full"
        },
        {
          "page": "ta-l13",
          "mode": "full"
        },
        {
          "page": "ta-l14",
          "mode": "full"
        },
        {
          "page": "ta-l15",
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
          "page": "llamaindex",
          "mode": "full"
        },
        {
          "page": "langgraph-asyncio",
          "mode": "full"
        },
        {
          "page": "langgraph-pydantic",
          "mode": "full"
        },
        {
          "page": "langgraph-module",
          "mode": "full"
        },
        {
          "page": "langgraph-deep-dive",
          "mode": "full"
        },
        {
          "page": "multi-agent-systems",
          "mode": "full"
        },
        {
          "page": "agent-protocols",
          "mode": "full"
        },
        {
          "page": "drill-mcp",
          "mode": "full"
        },
        {
          "page": "claude-agent",
          "mode": "full"
        },
        {
          "page": "genai-g3",
          "mode": "full"
        },
        {
          "page": "production-genai",
          "mode": "full"
        },
        {
          "page": "llm-evals",
          "mode": "full"
        },
        {
          "page": "langfuse",
          "mode": "full"
        },
        {
          "page": "llmops",
          "mode": "full"
        },
        {
          "page": "guardrails",
          "mode": "full"
        },
        {
          "page": "memory",
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
          "page": "capstone-projects",
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
        },
        {
          "page": "job-search",
          "mode": "full"
        }
      ]
    },
    "interview-sprint": {
      "status": "active",
      "label": "Interview Sprint",
      "blurb": "Focused preparation when interviews are close.",
      "preflight": [],
      "controlPages": [
        "study-plan"
      ],
      "finish": {
        "page": "study-plan"
      },
      "steps": [
        {
          "page": "beginner-basics",
          "mode": "full"
        },
        {
          "page": "llm-foundations",
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
          "page": "ta-l02",
          "mode": "full"
        },
        {
          "page": "ta-l03",
          "mode": "full"
        },
        {
          "page": "ta-l07",
          "mode": "full"
        },
        {
          "page": "ta-l08",
          "mode": "full"
        },
        {
          "page": "ta-l09",
          "mode": "full"
        },
        {
          "page": "mcp-module",
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
          "page": "production-genai",
          "mode": "full"
        },
        {
          "page": "llm-evals",
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
    },
    "job-ready": {
      "status": "active",
      "label": "Job-Ready Core",
      "blurb": "Build the practical foundation for projects, interviews and production work.",
      "preflight": [],
      "controlPages": [
        "study-plan"
      ],
      "finish": {
        "page": "study-plan"
      },
      "steps": [
        {
          "page": "beginner-basics",
          "mode": "full"
        },
        {
          "page": "llm-foundations",
          "mode": "full"
        },
        {
          "page": "transformers",
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
          "page": "agentic-ai",
          "mode": "full"
        },
        {
          "page": "ta-l02",
          "mode": "full"
        },
        {
          "page": "ta-l03",
          "mode": "full"
        },
        {
          "page": "ta-l05",
          "mode": "full"
        },
        {
          "page": "ta-l06",
          "mode": "full"
        },
        {
          "page": "ta-l07",
          "mode": "full"
        },
        {
          "page": "ta-l08",
          "mode": "full"
        },
        {
          "page": "ta-l09",
          "mode": "full"
        },
        {
          "page": "ta-l10",
          "mode": "full"
        },
        {
          "page": "ta-l11",
          "mode": "full"
        },
        {
          "page": "ta-l14",
          "mode": "full"
        },
        {
          "page": "mcp-module",
          "mode": "full"
        },
        {
          "page": "langgraph-asyncio",
          "mode": "full"
        },
        {
          "page": "langgraph-pydantic",
          "mode": "full"
        },
        {
          "page": "langgraph-module",
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
          "page": "langfuse",
          "mode": "full"
        },
        {
          "page": "drill-fastapi",
          "mode": "full"
        },
        {
          "page": "drill-python-sync-async",
          "mode": "full"
        },
        {
          "page": "capstone-projects",
          "mode": "full"
        }
      ]
    }
  },
  "metrics": {
    "full-spine-hours": {
      "sum": [
        {
          "source": {
            "route": "full",
            "excludeCollections": [
              "agents-course"
            ]
          }
        },
        {
          "source": {
            "collectionAggregate": "agents-course",
            "mode": "full"
          }
        }
      ],
      "expect": [
        25680,
        39840
      ],
      "note": "The 16 agents-course pages are covered by a published collection aggregate; their own per-page chips sum to 46-47 h against a published 46-52 h."
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
        27840,
        43080
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
        12060,
        19800
      ]
    },
    "deep-dives-hours": {
      "source": {
        "route": "full",
        "includeTags": [
          "deep-dive"
        ]
      },
      "expect": [
        4020,
        6420
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
