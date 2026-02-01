const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    uid: { type: String, required: true, unique: true }, // Firebase UID
    email: { type: String, required: true, unique: true },
    isPro: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    stats: {
        streak: { type: Number, default: 0 },
        solvedProblems: { type: Number, default: 0 },
        solvedProblemIds: { type: [String], default: [] }, // Array of Problem IDs
        totalProblems: { type: Number, default: 150 },
        timeSpent: { type: String, default: "0h 0m" },
        globalRank: { type: Number, default: 0 }
    },
    // Subscription Details
    plan: { type: String, default: 'FREE' }, // 'FREE' or 'PRO'
    paymentStatus: { type: String, default: 'inactive' },
    subscriptionId: { type: String },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
