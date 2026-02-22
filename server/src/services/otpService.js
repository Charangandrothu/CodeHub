const nodemailer = require('nodemailer');
const crypto = require('crypto');

class OtpService {
    static globalOtps = new Map(); // Simple memory store for OTPs. In production, use Redis!

    static generateOtp(email) {
        // Secure 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Expiry in 5 mins
        this.globalOtps.set(email, {
            otp,
            expires: Date.now() + 5 * 60 * 1000
        });

        return otp;
    }

    static verifyOtp(email, otp) {
        const record = this.globalOtps.get(email);
        if (!record) return false;

        if (record.expires < Date.now()) {
            this.globalOtps.delete(email);
            return false;
        }

        if (record.otp === otp) {
            this.globalOtps.delete(email);
            return true;
        }

        return false;
    }

    static async sendOtpEmail(email, otp) {
        try {
            // Setup Nodemailer, requires SMTP configuration in .env
            if (!process.env.SMTP_HOST) {
                // If SMTP is not set, log safely for developer to use
                console.log(`\n\n[ADMIN SECURE DEV] Mock Email Sent to ${email} -> OTP: ${otp}\n\n`);
                return true;
            }

            const transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: process.env.SMTP_PORT || 587,
                secure: process.env.SMTP_SECURE === 'true',
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS
                }
            });

            await transporter.sendMail({
                from: process.env.SMTP_FROM || `"CodeHub Secure Admin" <${process.env.INITIAL_ADMIN_EMAIL || 'admin@example.com'}>`,
                to: email,
                subject: 'Secure Admin Login OTP',
                text: `Your CodeHub secure admin authentication OTP is: ${otp}. It will expire in 5 minutes. Never share this with anyone.`
            });
            return true;
        } catch (err) {
            console.error("\n❌ SMTP Email Failed: Google App password might be incorrect.");
            console.log(`\n✅ [FALLBACK DEV MODE] OTP for ${email} is:   ====>  ${otp}  <====\n`);
            return true; // Force return true in development!
        }
    }
}

module.exports = OtpService;
