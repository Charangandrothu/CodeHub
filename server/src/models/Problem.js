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
    difficulty: { type: String, enum: ["Easy", "Medium", "Hard"] },
    topic: { type: String, required: true }, // e.g., 'arrays-strings', 'beginner'
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
