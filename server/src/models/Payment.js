const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    userId: { type: String, required: true }, // UID
    email: { type: String },
    amount: { type: Number, required: true },
    plan: { type: String }, // 'monthly', 'yearly'
    status: { type: String, enum: ['success', 'failed'], default: 'success' },
    razorpayPaymentId: { type: String },
    razorpayOrderId: { type: String },
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
