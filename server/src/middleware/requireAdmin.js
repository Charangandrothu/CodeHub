const jwt = require('jsonwebtoken');
const AdminUser = require('../models/AdminUser');

const requireAdmin = async (req, res, next) => {
    try {
        // Enforce IP whitelist if enabled
        if (process.env.ADMIN_IP_WHITELIST) {
            const allowedIps = process.env.ADMIN_IP_WHITELIST.split(',');
            const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
            if (!allowedIps.some(ip => clientIp.includes(ip.trim()))) {
                return res.status(403).json({ error: "Access Denied: IP not whitelisted." });
            }
        }

        // Verify CSRF Protection
        if (process.env.NODE_ENV === 'production') {
            const csrfToken = req.headers['x-csrf-token'];
            if (!csrfToken || csrfToken !== req.cookies['csrf_token']) {
                return res.status(403).json({ error: "Access Denied: CSRF attack mitigated" });
            }
        }

        // Verify Authentication Header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: "Unauthorized: Token missing" });
        }

        const token = authHeader.split(' ')[1];

        // Strict Secret check
        if (!process.env.ADMIN_JWT_SECRET) {
            throw new Error("Missing ADMIN_JWT_SECRET");
        }

        const decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET);

        const admin = await AdminUser.findById(decoded.id);
        if (!admin || !admin.is_active) {
            return res.status(401).json({ error: "Unauthorized: Account disabled" });
        }

        if (admin.role !== 'admin' && admin.role !== 'super_admin') {
            return res.status(403).json({ error: "Forbidden: Not permitted" });
        }

        req.admin = admin; // Push verified admin to next request context
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ error: "Unauthorized: Token expired" });
        }
        return res.status(403).json({ error: "Access Denied" });
    }
};

module.exports = { requireAdmin };
