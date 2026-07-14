const mongoose = require('mongoose');

const referralRewardSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true
    }, // Firebase UID of the referrer
    milestone: {
        type: Number,
        required: true
    }, // 5, 10, 20, 50, 100 referrals
    rewardType: {
        type: String,
        required: true
    }, // 'PRO_ACCESS' | 'ELITE_ACCESS' | 'AMBASSADOR'
    rewardDetails: {
        type: String,
        required: true
    }, // Description e.g., "7 Days Pro Access"
    xpAwarded: {
        type: Number,
        required: true
    },
    badgeAwarded: {
        type: String
    },
    grantedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Avoid duplicate milestone rewards per user
referralRewardSchema.index({ userId: 1, milestone: 1 }, { unique: true });

module.exports = mongoose.model('ReferralReward', referralRewardSchema);
