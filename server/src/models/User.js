const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    uid: { type: String, required: true, unique: true }, // Firebase UID
    email: { type: String, required: true, unique: true },
    username: { type: String, unique: true, sparse: true }, // Added username (handle)
    photoURL: { type: String, default: "https://api.dicebear.com/9.x/adventurer/svg?seed=Emery&backgroundColor=d1d4f9" }, // Added photoURL
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
    dsaRoadmap: { type: Object, default: null }, // Store roadmap state (isLocked, days, sections, etc.)
    aptitudeRoadmap: { type: Object, default: null }, // Store aptitude roadmap state (isLocked, days, sections, etc.)
    mockRoadmap: { type: Object, default: null }, // Store mock tests roadmap state (isLocked, days, sections, etc.)

    // Company Prep Progress — key: "company_section" (e.g. "tcs_aptitude")
    // Each value tracks answered/correct/skipped question IDs for no-repeat filtering
    companyPrep: {
        type: Map,
        of: new mongoose.Schema({
            answeredIds: { type: [String], default: [] }, // never shown again
            correctIds: { type: [String], default: [] }, // subset: answered correctly
            skippedIds: { type: [String], default: [] }, // shown again at end of session
            lastPracticed: { type: Date, default: null }
        }, { _id: false }),
        default: {}
    },

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
    plan: { type: String, default: 'FREE' }, // 'FREE', 'pro', 'elite'
    paymentStatus: { type: String, default: 'inactive' },
    subscriptionId: { type: String },
    subscriptionStartDate: { type: Date, default: null },
    subscriptionEndDate: { type: Date, default: null },
    billingCycle: { type: String, default: 'monthly' }, // 'monthly' or 'yearly'
    billingHistory: [{
        date: { type: Date, default: Date.now },
        amount: String,
        status: String,
        invoiceId: String,
        plan: String // e.g. "Pro Monthly"
    }],
    profileCompleted: { type: Boolean, default: false }, // New field

    // AI Usage
    aiUsage: { type: Number, default: 0 },
    lastAiResetDate: { type: Date, default: Date.now },

    // Certificate Data (stored on user profile, not separate collection)
    certificate: {
        certificateId: { type: String, default: null },
        name: { type: String, default: null },
        course: { type: String, default: "DSA Coding Experience" },
        progress: { type: Number, default: null },
        issuedAt: { type: Date, default: null }
    },

    // Referral and Rewards System additions
    referralCode: { type: String, unique: true, sparse: true },
    referredBy: { type: String, default: null },
    referralStats: {
        totalReferrals: { type: Number, default: 0 },
        activeReferrals: { type: Number, default: 0 },
        pendingReferrals: { type: Number, default: 0 },
        rejectedReferrals: { type: Number, default: 0 }
    },
    xp: { type: Number, default: 0 },
    badges: { type: [String], default: [] },
    activeDates: { type: [String], default: [] },
    notifications: [{
        message: { type: String, required: true },
        read: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now }
    }],

    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
