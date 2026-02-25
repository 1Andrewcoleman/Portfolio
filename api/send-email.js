const express = require("express");
const nodemailer = require("nodemailer");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.post("/api/send-email", async (req, res) => {
  const { name, email, message } = req.body;

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
    replyTo: email,
    to: process.env.ICLOUD_EMAIL,
    subject: `Website Email from: ${name}`,
    text: `Message from: ${name} <${email}>\n\n${message}`,
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
