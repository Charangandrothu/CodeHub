const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema(
    {
        key: { type: String, enum: ['A', 'B', 'C', 'D'], required: true },
        text: { type: String, required: true },
    },
    { _id: false }
);

// Sub-question schema for Reading Comprehension passage groups
const subQuestionSchema = new mongoose.Schema(
    {
        subId: { type: String, required: true },
        questionText: { type: String, required: true },
        options: { type: [optionSchema], required: true },
        correctAnswer: { type: String, enum: ['A', 'B', 'C', 'D'], required: true },
        explanation: { type: String, default: '' },
    },
    { _id: false }
);

const companyQuestionSchema = new mongoose.Schema(
    {
        // ── Categorisation
        company: { type: String, required: true, index: true, lowercase: true, trim: true }, // "tcs"
        section: { type: String, required: true, index: true, lowercase: true, trim: true }, // "aptitude"
        topic: { type: String, required: true, index: true, lowercase: true, trim: true }, // "percentages"
        subtopic: { type: String, default: '', trim: true },
        type: { type: String, enum: ['mcq', 'passage-group'], default: 'mcq' },

        // ── MCQ content
        questionText: { type: String, default: '' },
        options: { type: [optionSchema], default: [] },         // always A, B, C, D for MCQ
        correctAnswer: { type: String, enum: ['A', 'B', 'C', 'D'] }, // only for MCQ
        explanation: { type: String, default: '' },                 // step-by-step solution
        formulaHint: { type: String, default: '' },                 // one-line collapsible hint

        // ── Passage-group content (Reading Comprehension)
        passage: { type: String, default: '' },
        questions: { type: [subQuestionSchema], default: [] }, // sub-questions for passage group

        // ── Metadata
        difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
        priority: { type: String, enum: ['Very High', 'High', 'Medium', 'Low'], default: 'Medium' },
        tags: { type: [String], default: [] },
        timeLimit: { type: Number, default: 90 }, // seconds
        isActive: { type: Boolean, default: true },
        order: { type: Number, default: 0 },  // manual ordering within a topic
    },
    { timestamps: true }
);

// Compound index for fast topic-level queries (used in practice filtering)
companyQuestionSchema.index({ company: 1, section: 1, topic: 1 });
// Full-text search on question text
companyQuestionSchema.index({ questionText: 'text' });

module.exports = mongoose.model('CompanyQuestion', companyQuestionSchema);
