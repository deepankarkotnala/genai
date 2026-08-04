# Mobile navigation drawer overflow fix

## Issue

The mobile drawer inherited the desktop sidebar's fixed `::after` glass outline. Because the drawer scrolls independently, that viewport-height pseudo-element stayed in place while the navigation moved underneath it. Its rounded lower edge could therefore overlap rows around the Agentic AI section.

## Fix

- Removed the desktop-only inset glass pseudo-element on screens up to 860px.
- Moved the rounded edge and subtle border onto the mobile drawer itself.
- Hid horizontal overflow so drawer content cannot bleed beyond the panel edge.
- Kept the desktop glass outline and all existing mobile navigation behavior intact.
