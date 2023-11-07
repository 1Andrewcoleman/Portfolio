const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();

// Body parser middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// POST endpoint to handle form submission
app.post('/api/send-email', (req, res) => {
  const { name, email, message } = req.body;

// Nodemailer transporter
let transporter = nodemailer.createTransport({
  host: 'smtp.mail.me.com',
  port: 587,
  secure: false, // false for port 587, true for everything else
  auth: {
    user: process.env.ICLOUD_EMAIL, 
    pass: process.env.ICLOUD_APP_SPECIFIC_PASSWORD
  }
});

  let mailOptions = {
    from: `"${name}" <${email}>`,
    to: process.env.ICLOUD_EMAIL, // Your iCloud email
    subject: `New Contact from ${name}`,
    text: message
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      res.status(500).send('Error sending email');
    } else {
      console.log('Email sent: ' + info.response);
      res.status(200).send('Email sent successfully');
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


