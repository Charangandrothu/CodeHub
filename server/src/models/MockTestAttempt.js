const mongoose = require('mongoose');

const mockTestAttemptSchema = new mongoose.Schema({
    userId: { type: String, required: true, index: true }, // Firebase UID
    userName: { type: String, default: '' },
    userEmail: { type: String, default: '' },
    testId: { type: mongoose.Schema.Types.ObjectId, ref: 'MockTest', required: true },
    testName: { type: String, required: true },
    score: { type: Number, default: 0 },
    accuracy: { type: Number, default: 0 },
    timeTaken: { type: Number, default: 0 }, // seconds
    timeLimit: { type: Number, default: 90 }, // minutes
    isCompleted: { type: Boolean, default: false },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
    questionsList: {
        aptitude: { type: Array, default: [] }, // snapshots of loaded questions
        dsa: { type: Array, default: [] }      // snapshots of loaded questions
    },
    answers: { type: Map, of: String, default: {} },
    questionStatuses: { type: Map, of: String, default: {} },
    dsaScore: { type: Number, default: 0 },
    aptitudeScore: { type: Number, default: 0 },
    topicAnalysis: { type: mongoose.Schema.Types.Mixed, default: {} },
    weakAreas: [{ type: String }],
    rankEstimated: { type: Number }
}, { timestamps: true });

module.exports = mongoose.model('MockTestAttempt', mockTestAttemptSchema);
