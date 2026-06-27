const mongoose = require('mongoose');

const leaderboardSchema = new mongoose.Schema({
    month: {
        type: String,
        required: true,
        unique: true,
        index: true
    }, // "YYYY-MM"
    rankings: [{
        userId: String,
        username: String,
        displayName: String,
        photoURL: String,
        referralsCount: Number,
        badge: String,
        rank: Number
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('ReferralLeaderboard', leaderboardSchema);
