const mongoose = require('mongoose');

const referralSchema = new mongoose.Schema({
    referrerId: {
        type: String,
        required: true,
        index: true
    }, // Firebase UID of the referrer
    referredId: {
        type: String,
        required: true,
        unique: true,
        index: true
    }, // Firebase UID of the referred user
    referredUsername: {
        type: String,
        default: ''
    },
    referredEmail: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Active', 'Rejected'],
        default: 'Pending',
        index: true
    },
    emailVerified: {
        type: Boolean,
        default: false
    },
    profileCompleted: {
        type: Boolean,
        default: false
    },
    daysActive: {
        type: Number,
        default: 0
    },
    problemsSolved: {
        type: Number,
        default: 0
    },
    joinedAt: {
        type: Date,
        default: Date.now
    },
    activatedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Referral', referralSchema);
