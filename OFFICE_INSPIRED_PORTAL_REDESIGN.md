# Office-Inspired Portal Redesign

The complete portal now uses the approved minimal Microsoft 365 / Excel-inspired reading workspace.

## Applied across the portal

- Compact title bar and section ribbon
- Dense workbook-style sidebar and global search
- Wider central reading column with a smaller chapter contents rail
- Flat cards with subtle borders and restrained shadows
- No glow, spotlight, hover lift, or decorative glass effects
- Softer dark mode with off-white text and low-contrast charcoal surfaces
- Existing educational SVG diagrams and animations retained and recolored to match the theme
- Responsive horizontal chapter contents on tablets and phones
- Simplified mobile drawer with no translucent overflow card
- Responsive tables, code blocks, cards, quizzes, labs, and navigation
- Focus mode, theme persistence, search, quizzes, progress, and navigation preserved

## Shared implementation

- `genai-portal/assets/office-theme.css` contains the portal-wide final design layer.
- `genai-portal/assets/enhance.js` now creates the Office-style workspace ribbon.
- Every portal HTML page loads the final theme after its section-specific CSS.

## Validation

- 82 HTML pages inspected
- 81 content pages connected to the shared theme
- JavaScript syntax validated with Node
- Desktop and mobile layouts checked at 1440 px and 390 px
- No horizontal page overflow found in representative core, interview, lab, scenario, RAG/MCP, and agent pages
- Final ZIP archive tested successfully
