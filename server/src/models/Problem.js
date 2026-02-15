const mongoose = require("mongoose");

const exampleSchema = new mongoose.Schema({
  input: String,
  output: String,
  explanation: String,
});

const problemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    order: { type: Number, default: 0 },
    difficulty: { type: String, enum: ["Easy", "Medium", "Hard"] },
    topic: { type: String, required: true }, // e.g., 'arrays-strings', 'beginner'
    category: { type: String }, // General category if needed
    visibility: { type: String, default: 'public', enum: ['public', 'hidden'] },
    tags: [String],
    description: String,
    examples: [exampleSchema],
    constraints: [String],
    starterCode: {
      javascript: String,
      python: String,
    },
    testCases: {
      visible: [{ input: String, output: String }],
      hidden: [{ input: String, output: String }],
    },
    // Theory / Editorial
    theory: {
      videoTitle: { type: String, default: '' },
      videoUrl: { type: String, default: '' },   // YouTube link
      explanation: { type: String, default: '' }, // Rich text / markdown explanation
      timeComplexity: {
        value: { type: String, default: '' },       // e.g. "O(n)"
        explanation: { type: String, default: '' },  // e.g. "We iterate through the array once"
      },
      spaceComplexity: {
        value: { type: String, default: '' },       // e.g. "O(1)"
        explanation: { type: String, default: '' },  // e.g. "Only constant extra space used"
      },
      solutionCode: {
        javascript: { type: String, default: '' },
        python: { type: String, default: '' },
        java: { type: String, default: '' },
        cpp: { type: String, default: '' },
      }
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Problem", problemSchema);
