const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
    userId: { type: String, required: true }, // Firebase UID
    problemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', required: true },
    code: { type: String, required: true },
    language: { type: String, required: true },
    verdict: { type: String, required: true },
    runtime: { type: Number, default: 0 },
    memory: { type: Number, default: 0 },
    submittedAt: { type: Date, default: Date.now }
});

// Compound index to ensure one submission per problem per user
submissionSchema.index({ userId: 1, problemId: 1 }, { unique: true });

module.exports = mongoose.model('Submission', submissionSchema);
