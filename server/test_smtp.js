require('dotenv').config();
const nodemailer = require('nodemailer');

async function testMail() {
    try {
        console.log("Configuring with:", process.env.SMTP_HOST, process.env.SMTP_PORT, process.env.SMTP_USER);
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT || 587,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });

        const info = await transporter.sendMail({
            from: process.env.SMTP_FROM,
            to: process.env.SMTP_USER, // Send to self
            subject: 'Test connection',
            text: 'Testing SMTP...'
        });
        console.log("Success! MsgID:", info.messageId);
    } catch (err) {
        console.error("Error occurred:", err.message);
    }
}
testMail();
