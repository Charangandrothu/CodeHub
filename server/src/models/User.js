const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    uid: { type: String, required: true, unique: true }, // Firebase UID
    email: { type: String, required: true, unique: true },
    username: { type: String, unique: true, sparse: true }, // Added username (handle)
    photoURL: { type: String, default: "" }, // Added photoURL
    isPro: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    stats: {
        streak: { type: Number, default: 0 },
        solvedProblems: { type: Number, default: 0 },
        solvedProblemIds: { type: [String], default: [] }, // Array of Problem IDs
        totalProblems: { type: Number, default: 150 },
        timeSpent: { type: String, default: "0h 0m" },
        totalMinutes: { type: Number, default: 0 }, // For easier calculation
        globalRank: { type: Number, default: 0 },
        lastSolvedDate: { type: Date, default: null }, // Track last solved date for streak
        runCredits: { type: Number, default: 3 },
        submissionCredits: { type: Number, default: 3 },
        lastRunResetDate: { type: Date, default: Date.now }
    },
    submissionHistory: [{
        problemId: String,
        problemTitle: String,
        verdict: String,
        submittedAt: { type: Date, default: Date.now }
    }],
    // Profile Details
    displayName: { type: String, default: "" }, // Added displayName
    role: { type: String, default: "Student" },
    college: { type: String, default: "" },
    portfolio: { type: String, default: "" },
    github: { type: String, default: "" },
    linkedin: { type: String, default: "" },
    leetcode: { type: String, default: "" }, // Added
    codeforces: { type: String, default: "" }, // Added
    skills: { type: [String], default: [] },

    // User Preferences
    preferences: {
        goal: { type: String, default: "Placements" },
        difficulty: { type: String, default: "Medium" },
        topics: { type: [String], default: ["DSA", "Aptitude"] },
        dailyTarget: { type: Number, default: 3 },
        notifications: {
            dailyReminder: { type: Boolean, default: true },
            weeklyReport: { type: Boolean, default: true },
            newProblems: { type: Boolean, default: true },
            marketing: { type: Boolean, default: false }
        },
        theme: { type: String, default: "system" },
        language: { type: String, default: "English (United States)" }
    },

    // Subscription Details
    plan: { type: String, default: 'FREE' }, // 'FREE' or 'PRO'
    paymentStatus: { type: String, default: 'inactive' },
    subscriptionId: { type: String },
    billingHistory: [{
        date: { type: Date, default: Date.now },
        amount: String,
        status: String,
        invoiceId: String,
        plan: String // e.g. "Pro Monthly"
    }],
    profileCompleted: { type: Boolean, default: false }, // New field
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
