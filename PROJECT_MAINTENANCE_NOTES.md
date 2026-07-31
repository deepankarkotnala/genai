# Project maintenance notes

Consolidation of design, navigation and validation decisions previously spread
across four update logs (`THEME_UPDATE.md`, `MOBILE_NAV_SQL_UPDATE.md`,
`INTERVIEW_PREP_UPDATE.md`, `LINK_AUDIT_REPORT.md`). Those files also documented
the retired Energy & Materials course and have been removed; everything below is
the part that still describes the live portal.

## Design system

Dependency-free and offline-capable. No external libraries, fonts or CDNs.

- Responsive navigation, floating top bar, contextual table of contents
- Neutral off-white light canvas and deep charcoal dark theme; the accent colour
  is reserved for hierarchy and actions
- Topic-aware animated SVG explainers on lesson pages, covering LLMs,
  transformers, embeddings, vector databases, RAG, agents, MCP, LangGraph,
  memory, guardrails, observability and projects
- Reader controls for text size and width, persisted locally
- Focus mode, bound to the `F` key
- Reading progress, active-section guidance, back-to-top
- Full `prefers-reduced-motion` support
- Hover states avoid underlines: inline links use a soft highlight; linked cards
  use elevation, title colour and action-chip motion

Implementation files (paths corrected — the former `genai-portal/` wrapper was
removed and should not be reintroduced):

- `assets/styles.css` — design system, responsive layout, animation layer
- `assets/office-theme.css` — final normalisation layer, loaded last
- `assets/enhance.js` — SVG diagrams, reader tools, motion behaviour
- `assets/sitenav.js` — shared grouped navigation registry

## Mobile navigation

- Contextual drawer header highlighting the current learning path
- Dedicated close control and improved drawer accessibility
- Short descriptions beneath every navigation group
- Navigation groups as cards with colour accents and clear active states
- Blurred backdrop, restrained entrance motion, reduced-motion support
- Desktop sidebar behaviour intentionally unchanged

## Learning sections

**GenAI interview question bank** — 107 questions across 10 topics, with concise
answers, 30-second versions and likely follow-ups; topic filtering, open/close
all, keyboard navigation and saved progress.

**Scenario design studio** — the C-D-S-S-M framework (Clarify, Design, Scale,
Secure, Measure) across 8 architecture exercises. Each covers assumptions,
requirements, agent fit, stack, latency and cost optimisation, load handling,
prompt-injection defences, application security, metrics, trade-offs, a Python
sketch and a two-minute answer structure. Includes a 20-minute practice timer.

**SQL for GenAI roles** — `interview-prep/09-sql-for-genai.html`, 12 questions
covering joins, window functions, deduplication, CTEs, top-N, indexing, query
plans, transactions, JSONB, pgvector, tenant isolation, safe text-to-SQL and
generated-query evaluation.

**Understanding AI Agents** — 15-lesson interview course built around one
support-ticket triage agent. See `teach-agents/CURRICULUM.md`.

## Link and asset validation

Repeat after any structural change:

- Resolve every static local reference in every HTML page
- Resolve every target in the `assets/sitenav.js` navigation registry
- Resolve every `file:` entry in each page's `window.PORTAL` registry
- Syntax-check all portal asset scripts
- Validate CSS brace balance
- Confirm the shared brand block is present on every page

An earlier audit measured 108 HTML pages, 2,020 static references and 105
navigation targets, all resolving. **Those figures are historical** — the
repository has grown well beyond them, so re-measure rather than cite them.

Removed during that audit and not to be reintroduced: the `genai-portal/`
wrapper paths, Windows `file:///C:/...` paths, and hard-coded repository-root
links.
