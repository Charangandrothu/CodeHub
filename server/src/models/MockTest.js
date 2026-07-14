const mongoose = require('mongoose');

const mockTestSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, default: '' },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard', 'Mixed'], default: 'Medium' },
    timeLimit: { type: Number, default: 90 }, // minutes
    dsaCount: { type: Number, default: 3 },
    aptitudeCount: { type: Number, default: 50 },
    isCustom: { type: Boolean, default: false },
    dsaQuestions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Problem' }],
    aptitudeQuestions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'CompanyQuestion' }],
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('MockTest', mockTestSchema);
