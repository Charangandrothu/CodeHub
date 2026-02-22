const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const AdminUser = require('../models/AdminUser');
const AdminSession = require('../models/AdminSession');
const OtpService = require('../services/otpService');

class AdminAuthController {

    // 1. Initial Login - Validates hash and sends OTP
    static async loginStepOne(req, res) {
        try {
            const { email, password } = req.body;

            const admin = await AdminUser.findOne({ email });

            // Using generic error messages to prevent email enumeration
            if (!admin) {
                return res.status(401).json({ error: "Invalid credentials" });
            }

            // Check lockout
            if (admin.lockUntil && admin.lockUntil > Date.now()) {
                return res.status(403).json({ error: "Account temporary locked. Try again later." });
            }

            if (!admin.is_active) {
                return res.status(403).json({ error: "Account disabled." });
            }

            const validPass = await bcrypt.compare(password, admin.password_hash);

            if (!validPass) {
                admin.failedLoginAttempts += 1;
                // Lockout user if > 5 failed
                if (admin.failedLoginAttempts >= 5) {
                    admin.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 mins lock
                }
                await admin.save();
                return res.status(401).json({ error: "Invalid credentials" });
            }

            // Reset failed attempts on valid pass
            admin.failedLoginAttempts = 0;
            admin.lockUntil = undefined;
            await admin.save();

            // Generate and Send OTP
            const otp = OtpService.generateOtp(admin.email);
            const sent = await OtpService.sendOtpEmail(admin.email, otp);

            if (!sent) {
                return res.status(500).json({ error: "Failed to securely deliver 2FA OTP." });
            }

            return res.json({ success: true, message: "OTP sent securely via email", step: 2 });
        } catch (err) {
            console.error("Login Phase 1 Error", err);
            return res.status(500).json({ error: "Server error" });
        }
    }

    // 2. Verify OTP and Issue Tokens
    static async loginStepTwo(req, res) {
        try {
            const { email, otp } = req.body;

            const admin = await AdminUser.findOne({ email });
            if (!admin || !admin.is_active) return res.status(401).json({ error: "Unauthorized" });

            const validOtp = OtpService.verifyOtp(email, otp);

            if (!validOtp) {
                return res.status(400).json({ error: "Invalid or expired OTP" });
            }

            const ip_address = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

            if (!process.env.ADMIN_JWT_SECRET) {
                return res.status(500).json({ error: "Configuration missing. Contact super-admin." });
            }

            // Generate JWT (15 mins)
            const accessToken = jwt.sign(
                { id: admin._id, role: admin.role },
                process.env.ADMIN_JWT_SECRET,
                { expiresIn: '15m' }
            );

            // Generate Refresh Token (7 days)
            const refreshToken = crypto.randomBytes(40).toString('hex');
            const expires_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

            // Store session securely
            await new AdminSession({
                admin_id: admin._id,
                refresh_token: refreshToken,
                ip_address,
                user_agent: req.headers['user-agent'],
                expires_at
            }).save();

            // Generate CSRF Token for state mutation protection
            const csrfToken = crypto.randomBytes(32).toString('hex');

            const isProd = process.env.NODE_ENV === 'production';

            // Send strictly secured HttpOnly cookie for refresh token and session correlation
            res.cookie('admin_refresh', refreshToken, {
                httpOnly: true,
                secure: isProd,
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });

            // Send standard cookie for CSRF token value readable by frontend
            res.cookie('csrf_token', csrfToken, {
                httpOnly: false, // Must be readable by frontend to attach to headers
                secure: isProd,
                sameSite: 'strict',
                maxAge: 15 * 60 * 1000 // Match JWT lifetime
            });

            return res.json({ success: true, accessToken, csrfToken, role: admin.role });

        } catch (err) {
            console.error("OTP Verification Error", err);
            return res.status(500).json({ error: "Server error" });
        }
    }

    // 3. Refresh Access Token using HttpOnly Secure Refresh Token Cookie
    static async refresh(req, res) {
        try {
            const refreshToken = req.cookies.admin_refresh;
            if (!refreshToken) return res.status(401).json({ error: "Session missing." });

            const session = await AdminSession.findOne({ refresh_token: refreshToken, revoked: false });
            if (!session || session.expires_at < Date.now()) {
                return res.status(401).json({ error: "Session invalid or expired. Re-authenticate." });
            }

            const admin = await AdminUser.findById(session.admin_id);
            if (!admin || !admin.is_active) {
                return res.status(403).json({ error: "Admin disabled or deleted" });
            }

            // Rotate token (Refresh Token Rotation Security)
            const newRefreshToken = crypto.randomBytes(40).toString('hex');
            session.refresh_token = newRefreshToken;
            await session.save();

            const accessToken = jwt.sign(
                { id: admin._id, role: admin.role },
                process.env.ADMIN_JWT_SECRET,
                { expiresIn: '15m' }
            );

            const csrfToken = crypto.randomBytes(32).toString('hex');
            const isProd = process.env.NODE_ENV === 'production';

            res.cookie('admin_refresh', newRefreshToken, {
                httpOnly: true,
                secure: isProd,
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000
            });

            res.cookie('csrf_token', csrfToken, {
                httpOnly: false,
                secure: isProd,
                sameSite: 'strict',
                maxAge: 15 * 60 * 1000
            });

            return res.json({ success: true, accessToken, csrfToken });

        } catch (err) {
            console.error("Refresh Logic Error", err);
            return res.status(500).json({ error: "Server error" });
        }
    }

    // 4. Secure complete logout
    static async logout(req, res) {
        try {
            const refreshToken = req.cookies.admin_refresh;
            if (refreshToken) {
                // Instantly kill token in the database against refresh abuse
                await AdminSession.findOneAndUpdate({ refresh_token: refreshToken }, { revoked: true });
            }
            res.clearCookie('admin_refresh');
            res.clearCookie('csrf_token');
            return res.json({ success: true, message: "Logged out securely" });
        } catch (err) {
            return res.status(500).json({ error: "Logout execution error" });
        }
    }
}

module.exports = AdminAuthController;
