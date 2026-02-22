const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
    user_id: { type: String, required: true, unique: true }, // One active sub per user
    plan_id: { type: String, required: true },
    billing_cycle: { type: String, enum: ['monthly', 'yearly'], required: true },
    status: { type: String, enum: ['active', 'cancelled', 'expired'], default: 'active' },
    start_date: { type: Date, default: Date.now },
    end_date: { type: Date, required: true },
    razorpay_order_id: { type: String } // Tie back to order payment
}, { timestamps: true });

module.exports = mongoose.model('Subscription', subscriptionSchema);
