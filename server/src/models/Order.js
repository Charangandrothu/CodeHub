const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user_id: { type: String, required: true }, // uid of the user purchasing
    plan_id: { type: String, required: true }, // 'pro' or 'elite'
    billing_cycle: { type: String, enum: ['monthly', 'yearly'], required: true },
    currency: { type: String, enum: ['INR', 'USD'], required: true },
    amount: { type: Number, required: true }, // Total amount they need to pay
    razorpay_order_id: { type: String, required: true, unique: true },
    status: { type: String, enum: ['created', 'paid', 'expired'], default: 'created' },
    expireAt: { type: Date } // Used to automatically delete unpaid orders
}, { timestamps: true });

// TTL index: expireAfterSeconds = 0 tells mongo to delete the doc exactly when expireAt is reached.
orderSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Order', orderSchema);
