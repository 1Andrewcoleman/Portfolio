# AGENTS.md

## Project overview

Personal portfolio website for Andrew Coleman (Atmospheric Scientist). Static HTML/CSS/JS frontend with an Express.js API endpoint for sending contact-form emails via iCloud SMTP.

## Cursor Cloud specific instructions

### Architecture

- **Frontend**: Single-page static site (`index.html`, `style.css`, inline JS). Uses Bootstrap 3.3.7, jQuery 3.6.0, and Font Awesome 4.5.0 via CDN.
- **Backend**: Express.js API at `api/send-email.js` — handles `POST /api/send-email` to send emails via Nodemailer + iCloud SMTP. Designed as a Vercel-style serverless function.

### Running the dev server

Serve static files from the project root:

```sh
npx serve -l 3000
```

The site is fully functional for browsing without the API. The contact form's email submission requires the Express API and iCloud SMTP credentials (`ICLOUD_EMAIL`, `ICLOUD_APP_SPECIFIC_PASSWORD` env vars), which are optional for frontend development.

### Notable caveats

- `package.json` has **no `scripts` block** — there is no `npm start`, `npm run dev`, `npm test`, or `npm run lint` command.
- `api/send-email.js` calls `app.listen()` with **no port argument**, so it listens on a random port. This file is designed for Vercel serverless deployment, not standalone local use.
- **No linter, test framework, or build step** is configured in this project.
- `node_modules/` is committed to the repo (no `.gitignore`).
