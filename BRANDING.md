# Interview Preparation branding

The site now uses a responsive glass-style brand system:

- `assets/brand/logo-glass.svg` — full two-line wordmark
- `assets/brand/favicon.svg`, `favicon.ico`, and PNG favicons — browser tab icons
- `assets/brand/apple-touch-icon.png` — iPhone and iPad Add to Home Screen icon
- `assets/brand/icon-192.png`, `icon-512.png`, and `icon-maskable-512.png` — installable web app icons
- `assets/brand/social-card.png` — Open Graph and social sharing artwork (1200 × 630)
- `assets/brand/site.webmanifest` — installable web app metadata

All HTML pages include the favicon, Apple icon, manifest, Open Graph, and Twitter card metadata using repository-relative paths, so the project works when published from a GitHub Pages repository subpath.

For platforms that strictly require an absolute Open Graph image URL, replace each relative `og:image` and `twitter:image` value with the final deployed URL after the production domain is known.
