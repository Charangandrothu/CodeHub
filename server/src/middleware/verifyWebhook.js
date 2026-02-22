const crypto = require('crypto');

const verifyWebhook = (req, res, next) => {
    try {
        const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

        if (!secret) {
            console.error("Webhook secret missing!");
            return res.status(500).send("Webhook secret is missing from environment variables.");
        }

        // Razorpay sends standard headers with signature
        const signature = req.headers['x-razorpay-signature'];

        if (!signature) {
            return res.status(400).send("Signature missing from headers.");
        }

        // Generate expected signature
        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(JSON.stringify(req.body))
            .digest('hex');

        // Compare safely
        if (expectedSignature === signature) {
            next();
        } else {
            console.error('Invalid signature alert!');
            return res.status(403).json({ success: false, message: 'Invalid signature. Webhook rejected.' });
        }
    } catch (err) {
        console.error("Webhook verification error", err);
        return res.status(500).json({ success: false, message: 'Server error parsing webhook' });
    }
};

module.exports = { verifyWebhook };
