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
  },
  { timestamps: true }
);

module.exports = mongoose.model("Problem", problemSchema);
