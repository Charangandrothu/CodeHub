const geoip = require('geoip-lite');

const detectCurrency = (req, res, next) => {
    // Basic IP detection, accommodating standard forwarded headers
    let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    // Strip multiple IPs if behind proxy
    if (ip && ip.includes(',')) {
        ip = ip.split(',')[0].trim();
    }

    // Default for Localhost / loopback IPv4/IPv6
    if (ip === '::1' || ip === '127.0.0.1' || !ip) {
        req.currency = 'INR';
        return next();
    }

    try {
        const geo = geoip.lookup(ip);
        if (geo && geo.country === 'IN') {
            req.currency = 'INR';
        } else {
            req.currency = 'USD';
        }
    } catch (err) {
        console.error("GeoIP Error, defaulting to USD:", err);
        req.currency = 'USD'; // Fallback to USD for safety
    }

    next();
};

module.exports = { detectCurrency };
