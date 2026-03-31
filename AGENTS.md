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
- `main.js` — All client-side JavaScript: starfield canvas, navigation, portfolio modals, contact form, PII rendering.
- `assets/images/` — All image assets with descriptive filenames.
- `assets/favicon.svg` — SVG favicon (AC monogram).
- `assets/fonts/` — Self-hosted Lato WOFF2 font files (300, 400, 400i, 700).
- `api/send-email.js` — Serverless email endpoint (Vercel-compatible). Exports handler for Vercel; runs standalone Express when executed directly.
- `vercel.json` — Deployment manifest with security headers (CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy).
- `robots.txt` — Crawler directives.
- `server.dev.js` — Local dev server with API proxy (port 3000 → 3001).

### Running the dev server

```sh
# Full dev workflow (static files + API proxy on :3000, API on :3001)
npm run dev:api  # Terminal 1 — starts the Express API on port 3001
npm run dev      # Terminal 2 — static server on port 3000 with /api proxy to :3001

# Static-only (no API)
npm run dev:static  # serves static files on port 3000 via npx serve

npm run start  # production: starts the Express API (needs ICLOUD_EMAIL + ICLOUD_APP_SPECIFIC_PASSWORD env vars)
```

The site is fully functional for browsing without the API. The contact form's email submission requires the Express API and iCloud SMTP credentials.

### Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ICLOUD_EMAIL` | For email sending | iCloud email address used as SMTP sender |
| `ICLOUD_APP_SPECIFIC_PASSWORD` | For email sending | iCloud app-specific password for SMTP auth |
| `ALLOWED_ORIGIN` | Optional | Production domain for CORS (e.g. `https://andrewcoleman.dev`). When unset, no CORS header is sent (same-origin only). |

### Notable caveats

- No linter, test framework, or build step is configured.
- `api/send-email.js` exports a handler function for Vercel serverless deployment; locally it runs as a standalone Express server on port 3001 (via `require.main === module` guard). Rate limiting is NOT handled in-app — configure it at the edge (Vercel WAF / Cloudflare).
- Phone and email in the contact section are rendered via JavaScript (PII obfuscation). They do not appear in the raw HTML source.
- jQuery and Bootstrap have been removed — all styling/interaction is custom.
- Zero external CDN dependencies — fonts self-hosted, icons inline SVGs, fog procedural.
- The site uses scroll-based navigation with IntersectionObserver for active nav state and scroll-linked section opacity (`--scroll-fade`). Optional **fog-reveal** experiment: add `?fog-reveal=1` to the URL (persists in `localStorage` as `fogReveal`; `?fog-reveal=0` clears). When enabled, `html` gets class `fog-reveal` and a mist veil uses the same scroll signal on `.section-scroll-layer` only (portfolio modals stay outside that wrapper).
- CSS uses custom properties defined in `:root` for colors, fonts, radii, and blur values.
- Atmospheric canvas system (`#atmosphere`): requestAnimationFrame loop with twinkling stars, shooting stars, procedural simplex-noise fog, scroll-driven background shifts, cursor mist trail, and idle weather behavior.
- Hero fog canvas (`#hero-fog`): separate procedural fog overlay positioned within the hero section.
- Respects `prefers-reduced-motion` and pauses when tab is hidden via visibility API.
