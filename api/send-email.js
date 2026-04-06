const nodemailer = require("nodemailer");
const crypto = require("crypto");

/*
 * Rate-limiting note
 * ──────────────────
 * In-memory rate limiting (e.g. a Map counting requests per IP) does NOT work
 * on serverless platforms like Vercel — every cold-start gets a fresh process
 * and the counter resets.  Effective rate limiting for this endpoint should be
 * configured at the edge:
 *
 *   • Vercel WAF / Firewall Rules (Settings → Firewall)
 *   • Cloudflare Rate Limiting Rules
 *
 * The honeypot field, PoW challenge, input validation, and length limits below
 * still provide meaningful protection against casual abuse.
 */

/* ── Proof-of-Work ──────────────────────────────────────────────────────────
 * Every submission must include a SHA-256 proof-of-work. The client generates
 * a challenge (timestamp + random), brute-forces a nonce until the hash has
 * N leading zero bits, then sends {challenge, nonce, hash, difficulty}.
 *
 * This makes automated loops economically unviable — each request costs ~1-2s
 * of real CPU time to produce, but verification is instant.
 * ────────────────────────────────────────────────────────────────────────── */
const POW_MIN_DIFFICULTY = 18;
const POW_MAX_AGE_MS = 120000;

function verifyProofOfWork(pow) {
  if (!pow || typeof pow !== "object") return "Missing proof-of-work.";
  const { challenge, nonce, hash, difficulty } = pow;

  if (!challenge || nonce === undefined || !hash || !difficulty) {
    return "Incomplete proof-of-work.";
  }

  if (difficulty < POW_MIN_DIFFICULTY) {
    return "Proof-of-work difficulty too low.";
  }

  const timestamp = parseInt(String(challenge).split(":")[0], 10);
  if (isNaN(timestamp) || Date.now() - timestamp > POW_MAX_AGE_MS) {
    return "Proof-of-work challenge expired.";
  }

  const input = challenge + ":" + nonce;
  const computed = crypto.createHash("sha256").update(input).digest("hex");

  if (computed !== hash) {
    return "Proof-of-work hash mismatch.";
  }

  let leadingZeroBits = 0;
  for (let i = 0; i < computed.length; i++) {
    const nibble = parseInt(computed[i], 16);
    if (nibble === 0) {
      leadingZeroBits += 4;
    } else {
      if (nibble < 2) leadingZeroBits += 3;
      else if (nibble < 4) leadingZeroBits += 2;
      else if (nibble < 8) leadingZeroBits += 1;
      break;
    }
  }

  if (leadingZeroBits < POW_MIN_DIFFICULTY) {
    return "Proof-of-work does not meet difficulty.";
  }

  return null;
}

/* ── CORS ────────────────────────────────────────────────────────────────────
 * Set ALLOWED_ORIGIN in your Vercel environment variables to your production
 * domain (e.g. "https://andrewcoleman.dev").  When the variable is present
 * the API will include Access-Control-Allow-Origin for that origin only;
 * when absent no CORS header is sent (same-origin requests still work).
 * ──────────────────────────────────────────────────────────────────────────── */
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "";

function setCorsHeaders(res) {
  if (ALLOWED_ORIGIN) {
    res.setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  }
}

// Strip characters that could be used for email header injection (\r, \n)
function sanitizeHeader(value) {
  return String(value).replace(/[\r\n\t]/g, " ").trim();
}

// Validate that a string looks like an email address
function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value));
}

// ── Core handler (Vercel serverless + local Express) ────────────────────────
async function handler(req, res) {
  setCorsHeaders(res);

  // Preflight
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).send("Method not allowed.");
  }

  const { name, email, message, website, pow } = req.body || {};

  // Honeypot check — bots fill the hidden "website" field, humans don't
  if (website && website.trim() !== "") {
    return res.status(200).send("Email sent successfully");
  }

  // Proof-of-work verification
  const powError = verifyProofOfWork(pow);
  if (powError) {
    return res.status(403).send(powError);
  }

  // Input presence checks
  if (!name || !email || !message) {
    return res.status(400).send("Missing required fields.");
  }

  // Length limits
  if (String(name).length > 100) {
    return res.status(400).send("Name is too long.");
  }
  if (String(email).length > 254) {
    return res.status(400).send("Email address is too long.");
  }
  if (String(message).length > 5000) {
    return res.status(400).send("Message is too long.");
  }

  // Email format validation
  if (!isValidEmail(email)) {
    return res.status(400).send("Invalid email address.");
  }

  // Sanitize values used in headers / subject line
  const safeName = sanitizeHeader(name);
  const safeEmail = sanitizeHeader(email);

  const transporter = nodemailer.createTransport({
    host: "smtp.mail.me.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.ICLOUD_EMAIL,
      pass: process.env.ICLOUD_APP_SPECIFIC_PASSWORD,
    },
  });

  const textBody = [
    `New message from your portfolio contact form`,
    ``,
    `From:    ${safeName}`,
    `Email:   ${safeEmail}`,
    `Date:    ${new Date().toLocaleString("en-US", { timeZone: "America/New_York", dateStyle: "full", timeStyle: "short" })}`,
    ``,
    `─────────────────────────────────────`,
    ``,
    message,
    ``,
    `─────────────────────────────────────`,
    `This message was sent via andrewcoleman.dev`,
  ].join("\n");

  const htmlBody = `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f4f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7;padding:32px 0">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06)">
        <tr>
          <td style="background:linear-gradient(135deg,#0f1117 0%,#1a1d2e 100%);padding:28px 32px">
            <h1 style="margin:0;font-size:18px;font-weight:600;color:#ffffff;letter-spacing:0.5px">New Contact Form Message</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:28px 32px">
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px">
              <tr>
                <td style="padding:8px 0;color:#6b7280;font-size:13px;width:60px;vertical-align:top">From</td>
                <td style="padding:8px 0;color:#111827;font-size:15px;font-weight:600">${safeName}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;color:#6b7280;font-size:13px;vertical-align:top">Email</td>
                <td style="padding:8px 0"><a href="mailto:${safeEmail}" style="color:#2563eb;font-size:15px;text-decoration:none">${safeEmail}</a></td>
              </tr>
              <tr>
                <td style="padding:8px 0;color:#6b7280;font-size:13px;vertical-align:top">Date</td>
                <td style="padding:8px 0;color:#111827;font-size:14px">${new Date().toLocaleString("en-US", { timeZone: "America/New_York", dateStyle: "full", timeStyle: "short" })}</td>
              </tr>
            </table>
            <div style="border-top:1px solid #e5e7eb;padding-top:20px">
              <p style="margin:0 0 8px;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px">Message</p>
              <div style="color:#1f2937;font-size:15px;line-height:1.7;white-space:pre-wrap">${message.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}</div>
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 32px;background:#f9fafb;border-top:1px solid #e5e7eb">
            <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center">Sent via <a href="https://andrewcoleman.dev" style="color:#6b7280;text-decoration:none">andrewcoleman.dev</a> contact form</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  const mailOptions = {
    from: process.env.ICLOUD_EMAIL,
    replyTo: safeEmail,
    to: process.env.ICLOUD_EMAIL,
    subject: `${safeName} — via andrewcoleman.dev`,
    text: textBody,
    html: htmlBody,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
    res.status(200).send("Email sent successfully");
  } catch (error) {
    console.error("Email error:", error.message);
    res.status(500).send("Error sending email");
  }
}

// ── Vercel serverless export ────────────────────────────────────────────────
module.exports = handler;

// ── Local development server ────────────────────────────────────────────────
if (require.main === module) {
  const express = require("express");
  const app = express();
  const PORT = process.env.PORT || 3001;

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.all("/api/send-email", handler);

  app.listen(PORT, () => {
    console.log(`API server running on http://localhost:${PORT}`);
  });
}
