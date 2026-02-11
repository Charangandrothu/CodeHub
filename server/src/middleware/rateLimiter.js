const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes window
    max: 5000, // Limit each IP to 5000 requests per windowMs for dev
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: {
        success: false,
        message: "Too many requests from this IP, please try again later."
    }
});

// A stricter limiter for specific, sensitive endpoints (like login/signup)
const strictLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour window
    max: 1000, // Limit each IP to 1000 requests per windowMs for dev
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many attempts, please try again later."
    }
});

module.exports = { limiter, strictLimiter };
