const mongoose = require('mongoose');
const AdminUser = require('./src/models/AdminUser');
require('dotenv').config({ path: '.env' });

const test = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const adminEmail = process.env.INITIAL_ADMIN_EMAIL;
        const admin = await AdminUser.findOne({ email: adminEmail });
        console.log("Found admin:", admin);

        // Also let's try calling step 2 of the API
        const http = require('http');
        // generate a valid OTP via service
        const OtpService = require('./src/services/otpService');
        const otp = OtpService.generateOtp(adminEmail);
        console.log("Generated valid OTP:", otp);

        const req = http.request({
            hostname: 'localhost',
            port: 5000,
            path: '/api/admin/auth/login/verify',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }, res => {
            let body = '';
            res.on('data', d => body += d);
            res.on('end', () => console.log('Verify Response:', res.statusCode, body));
        });
        req.write(JSON.stringify({ email: adminEmail, otp }));
        req.end();

    } catch (err) {
        console.error(err);
    }
};
test();
