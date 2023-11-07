console.log('Hello world this does indeed work. kind of');

const express = require('express');
const nodemailer = require('nodemailer');

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// POST endpoint to handle form submission
app.post('/api/send-email', async (req, res) => {
    console.log(req.rawHeaders);
    console.log(req.body);
    console.log('Received a request to /api/send-email');

    const { name, email, message } = req.body;

    console.log('Request Body:', req.body);

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

    console.log('Transporter created');

    let mailOptions = {
        from: `"${name}" <${email}>`,
        to: process.env.ICLOUD_EMAIL, // Your iCloud email
        subject: `New Contact from ${name}`,
        text: message
    };

    console.log('Mail options set:', mailOptions);

    // Try to send the email and await its completion
    try {
        let info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.response);
        res.status(200).send('Email sent successfully');
    } catch (error) {
        console.error('Error occurred while sending email:', error);
        res.status(500).send('Error sending email');
    }
});

// Make sure to listen on a port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});




