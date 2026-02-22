const express = require('express');
const router = express.Router();
const AdminAuthController = require('../controllers/adminAuthController');
const rateLimit = require('express-rate-limit');

// Rate limiting constraint strictly for brute-force tracking
const loginLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes limit
    max: 5, // Limit 5 attempts per window per IP
    message: { error: "Security enforcement triggered: Too many failing attempts. IP paused for 10 minutes." },
    standardHeaders: true,
    legacyHeaders: false,
});

router.post('/login', loginLimiter, AdminAuthController.loginStepOne);
router.post('/login/verify', loginLimiter, AdminAuthController.loginStepTwo);
router.post('/refresh', AdminAuthController.refresh);
router.post('/logout', AdminAuthController.logout);

module.exports = router; // server restart for rate limit reset
