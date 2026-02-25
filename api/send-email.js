const express = require("express");
const nodemailer = require("nodemailer");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

/* ── In-memory rate limiter ──
   Limits each IP to MAX_REQUESTS per WINDOW_MS.
   Note: in serverless environments (Vercel), state resets between
   cold starts so this provides partial protection only. */
const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 3;
const requestCounts = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  const record = requestCounts.get(ip);

  if (!record || now - record.start > WINDOW_MS) {
    requestCounts.set(ip, { start: now, count: 1 });
    return false;
  }

  record.count++;
  return record.count > MAX_REQUESTS;
}

setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of requestCounts) {
    if (now - record.start > WINDOW_MS) requestCounts.delete(ip);
  }
}, WINDOW_MS);

/* ── Validation ── */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateInput(name, email, message) {
  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return "Name is required";
  }
  if (name.length > 200) return "Name is too long";

  if (!email || typeof email !== "string" || !EMAIL_RE.test(email)) {
    return "A valid email is required";
  }
  if (email.length > 320) return "Email is too long";

  if (!message || typeof message !== "string" || message.trim().length === 0) {
    return "Message is required";
  }
  if (message.length > 5000) return "Message is too long (max 5000 characters)";

  return null;
}

/* ── Route ── */
app.post("/api/send-email", async (req, res) => {
  const clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  if (isRateLimited(clientIp)) {
    return res.status(429).send("Too many requests. Please try again later.");
  }

  const { name, email, message, _honeypot } = req.body;

  if (_honeypot) {
    return res.status(200).send("Email sent successfully");
  }

  const error = validateInput(name, email, message);
  if (error) return res.status(400).send(error);

  const transporter = nodemailer.createTransport({
    host: "smtp.mail.me.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.ICLOUD_EMAIL,
      pass: process.env.ICLOUD_APP_SPECIFIC_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.ICLOUD_EMAIL,
    replyTo: email.trim(),
    to: process.env.ICLOUD_EMAIL,
    subject: `Website Email from: ${name.trim()}`,
    text: `Message from: ${name.trim()} <${email.trim()}>\n\n${message.trim()}`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
    res.status(200).send("Email sent successfully");
  } catch (err) {
    console.error("Email error:", err.message);
    res.status(500).send("Error sending email");
  }
});

module.exports = app;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}`);
  });
}
