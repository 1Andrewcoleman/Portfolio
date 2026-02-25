# AGENTS.md

## Project overview

Personal portfolio website for Andrew Coleman (Atmospheric Scientist). Static HTML/CSS/JS frontend with an Express.js API endpoint for sending contact-form emails via iCloud SMTP.

## Cursor Cloud specific instructions

### Architecture

- **Frontend**: Single-page static site (`index.html`, `style.css`, inline JS). Uses Lato via Google Fonts and Font Awesome 6.5.1 via CDN. No build step.
- **Backend**: Express.js API at `api/send-email.js` — handles `POST /api/send-email` to send emails via Nodemailer + iCloud SMTP.

### Running the dev server

```sh
npm run dev          # serves static files on port 3000
npm run start        # starts the Express API on port 3001 (needs ICLOUD_EMAIL + ICLOUD_APP_SPECIFIC_PASSWORD env vars)
```

The site is fully functional for browsing without the API. The contact form's email submission requires the Express API and iCloud SMTP credentials.

### Notable caveats

- No linter, test framework, or build step is configured.
- `api/send-email.js` is designed for Vercel-style serverless deployment; locally it runs as a standalone Express server on port 3001.
- jQuery and Bootstrap have been removed — all styling/interaction is custom.
