# Complete Interview Hub integration

A new **Complete Interview Hub** section has been added at:

- `genai-portal/interview-hub/index.html`

## What it does

- Includes a complete built-in catalog of all 55 HTML pages currently published in `dk175n/genai_int`.
- Checks the GitHub repository tree at runtime and automatically adds newly discovered HTML pages.
- Fetches the complete source HTML from `raw.githubusercontent.com` and renders only the page content inside the existing GenAI Learning Hub shell.
- Keeps source-site internal links inside the new section, so readers can move through core topics, projects, question banks, system designs and mocks without leaving the unified UI.
- Reuses the existing theme, responsive sidebar, reader controls, typography, cards, tables and code styling.
- Adds topic-aware explainer diagrams to selected interview answers and renders a visual aid for supported Mermaid flowchart source blocks.
- Offers **Cache all pages** for repeat reading through the browser Cache API.
- Falls back to the catalog and original-source links if live fetching is unavailable.

## Files added

- `genai-portal/interview-hub/index.html`
- `genai-portal/assets/interview-hub.css`
- `genai-portal/assets/interview-hub.js`

## Files updated

- `genai-portal/index.html` — new homepage card, reading-order entry and hub counts.
- `genai-portal/assets/sitenav.js` — new grouped sidebar/search entry.

## Deployment note

The core site remains static. The new section needs browser access to GitHub's public API and `raw.githubusercontent.com` for its first live load. Readers can use **Cache all pages** to save the source pages in supported browsers for repeat access.
