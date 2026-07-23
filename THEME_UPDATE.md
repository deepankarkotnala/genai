# Glass Learning UI — July 2026

The full GenAI learning portal has been redesigned as a neutral, modern glass interface with a focused purple action system. The update remains dependency-free and works offline.

## What changed

- Responsive glass navigation, floating top bar, contextual table of contents and layered learning cards
- Neutral off-white light canvas and deep charcoal dark theme; purple is reserved for hierarchy and actions
- Topic-aware animated SVG explainers automatically added to every lesson
- Dedicated visual models for LLMs, Transformers, Embeddings, Vector DBs, RAG, Agents, MCP, LangGraph, memory, guardrails, observability and projects
- Animated signal paths, node entrances, flow particles and connector drawing for existing diagrams
- Reader controls for text size, reading width and contrast, persisted locally
- Distraction-free Focus mode with the `F` keyboard shortcut
- Reading progress, active-section guidance and a responsive back-to-top control
- Pointer-responsive glass highlights and calmer content reveal animations
- Strong responsive behavior for desktop, tablet and mobile; SVG explainers become readable step cards on small screens
- Full `prefers-reduced-motion` support and no external libraries, fonts or CDNs

## Main implementation files

- `genai-portal/assets/styles.css` — design system, responsive layout and animation layer
- `genai-portal/assets/enhance.js` — topic-aware SVG diagrams, reader tools and motion behavior
- `genai-portal/assets/sitenav.js` — shared grouped navigation

## Existing source references

Two links in `teach-agents/lessons/0006-mapping-any-enm-row.html` still point to source materials that were not present in the original project archive:

- `EnM Agents.xlsx`
- `enm_dump.txt`

- Refined all hover states to avoid underlines; inline links now use a soft glass highlight and linked cards use elevation, title color, and action-chip motion.
