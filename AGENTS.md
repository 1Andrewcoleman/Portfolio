# AGENTS.md

## Project overview

Personal portfolio website for Andrew Coleman (Atmospheric Scientist). Static HTML/CSS/JS frontend with an Express.js API endpoint for sending contact-form emails via iCloud SMTP.

## Cursor Cloud specific instructions

### Architecture

- **Frontend**: Single-page scroll-based site (`index.html`, `style.css`, `main.js`). Self-hosted Lato font and inline SVG icons (zero external CDN dependencies). No build step.
- **Backend**: Express.js API at `api/send-email.js` — handles `POST /api/send-email` to send emails via Nodemailer + iCloud SMTP.

### File structure

- `index.html` — All markup. No inline scripts (uses `main.js` via `defer`).
- `style.css` — All styles. Uses CSS custom properties (`:root` variables) for theming.
- `main.js` — All client-side JavaScript: starfield canvas, navigation, portfolio modals, contact form.
- `assets/images/` — All image assets with descriptive filenames.
- `assets/favicon.svg` — SVG favicon (AC monogram).
- `assets/fonts/` — Self-hosted Lato WOFF2 font files (300, 400, 400i, 700).
- `api/send-email.js` — Serverless email endpoint (Vercel-compatible).

### Running the dev server

```sh
npm run dev # serves static files on port 3000
npm run start # starts the Express API on port 3001 (needs ICLOUD_EMAIL + ICLOUD_APP_SPECIFIC_PASSWORD env vars)
```

The site is fully functional for browsing without the API. The contact form's email submission requires the Express API and iCloud SMTP credentials.

### Notable caveats

- No linter, test framework, or build step is configured.
- `api/send-email.js` is designed for Vercel-style serverless deployment; locally it runs as a standalone Express server on port 3001.
- jQuery and Bootstrap have been removed — all styling/interaction is custom.
- Zero external CDN dependencies — fonts self-hosted, icons inline SVGs, fog procedural.
- The site uses scroll-based navigation with IntersectionObserver for active nav state and entrance animations.
- CSS uses custom properties defined in `:root` for colors, fonts, radii, and blur values.
- Atmospheric canvas system (`#atmosphere`): requestAnimationFrame loop with twinkling stars, shooting stars, procedural simplex-noise fog, scroll-driven background shifts, cursor mist trail, and idle weather behavior.
- Hero fog canvas (`#hero-fog`): separate procedural fog overlay positioned within the hero section.
- Respects `prefers-reduced-motion` and pauses when tab is hidden via visibility API.
