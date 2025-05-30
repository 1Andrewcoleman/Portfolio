const express = require('express');
const nodemailer = require('nodemailer');

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// POST endpoint to handle form submission
app.post('/api/send-email', async (req, res) => {

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

    console.log('Transporter created');

    let mailOptions = {
        from: process.env.ICLOUD_EMAIL,
        replyTo: req.body.email, // The submitter's email address
        to: process.env.ICLOUD_EMAIL, // Your personal email where you want to receive the contact form info
        subject: `Website Email from: ${req.body.name}`, // Subject line including the submitter's name
        text: `Message from: ${req.body.name} <${req.body.email}>\n\n${req.body.message}` // The actual message from the submitter
    };

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

app.listen();




