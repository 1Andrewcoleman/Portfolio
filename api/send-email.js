const express = require("express");
const nodemailer = require("nodemailer");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Simple in-memory rate limiter: max 3 submissions per IP per 10 minutes
const rateLimitMap = new Map();
const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;

function isRateLimited(ip) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip) || { count: 0, windowStart: now };

  if (now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    entry.count = 0;
    entry.windowStart = now;
  }

  entry.count += 1;
  rateLimitMap.set(ip, entry);
  return entry.count > RATE_LIMIT_MAX;
}

// Strip characters that could be used for email header injection (\r, \n)
function sanitizeHeader(value) {
  return String(value).replace(/[\r\n\t]/g, " ").trim();
}

// Validate that a string looks like an email address
function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value));
}

app.post("/api/send-email", async (req, res) => {
  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
    req.socket.remoteAddress;

  if (isRateLimited(ip)) {
    return res.status(429).send("Too many requests. Please try again later.");
  }

  const { name, email, message, website } = req.body;

  // Honeypot check — bots fill the hidden "website" field, humans don't
  if (website && website.trim() !== "") {
    // Silently accept so bots don't know they were caught
    return res.status(200).send("Email sent successfully");
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

  const mailOptions = {
    from: process.env.ICLOUD_EMAIL,
    replyTo: safeEmail,
    to: process.env.ICLOUD_EMAIL,
    subject: `Website Email from: ${safeName}`,
    text: `Message from: ${safeName} <${safeEmail}>\n\n${message}`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
    res.status(200).send("Email sent successfully");
  } catch (error) {
    console.error("Email error:", error.message);
    res.status(500).send("Error sending email");
  }
});

app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});
