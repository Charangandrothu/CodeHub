const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/paymentController');
const { detectCurrency } = require('../middleware/geoLocation');
const User = require('../models/User');

// Assuming x-user-uid header is sent from frontend
const verifyAuth = async (req, res, next) => {
    const uid = req.headers['x-user-uid'];
    if (!uid) return res.status(401).json({ error: "Unauthorized" });

    try {
        const user = await User.findOne({ uid });
        if (!user) return res.status(401).json({ error: "User not found" });
        req.user = user;
        next();
    } catch (err) {
        return res.status(500).json({ error: "Server error verifying user" });
    }
}

// Create new order (with currency detection)
router.post('/create-order', verifyAuth, detectCurrency, PaymentController.createOrder);

// Fetch dynamic pricing
router.get('/pricing', detectCurrency, PaymentController.getPricing);

module.exports = router;
