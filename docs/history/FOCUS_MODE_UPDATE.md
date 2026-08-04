# Focus Mode Update

## What changed

- Focus mode now removes the left navigation, sidebar resizer, backdrop, reading progress, scroll-to-top control, footer, and the full **On this page** rail.
- The lesson expands into a centered, wide reading canvas with a maximum content width of 1220px.
- The full top navigation collapses to a small floating **Exit focus** control in the upper-right corner.
- On narrow screens, that exit control becomes icon-only to avoid covering lesson headings.
- Entering focus mode closes an open mobile navigation drawer.
- The focus button now exposes clearer accessible labels and keyboard hints.
- `Esc` exits focus mode, while `F` continues to toggle it when the user is not typing in a form field.

## Files changed

- `genai-portal/assets/styles.css`
- `genai-portal/assets/enhance.js`

## Validation

Tested representative portal pages at 1600px desktop and 390px mobile widths. Confirmed that the sidebar and table-of-contents rail are hidden, only the focus exit control remains visible, horizontal overflow is absent, and Escape exits focus mode.
