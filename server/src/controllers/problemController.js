const Problem = require("../models/Problem");

// GET /api/problems
exports.getAllProblems = async (req, res) => {
  try {
    const problems = await Problem.find().select("title slug difficulty tags");
    res.json(problems);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// GET /api/problems/:slug
exports.getProblemBySlug = async (req, res) => {
  try {
    const problem = await Problem.findOne({ slug: req.params.slug });
    if (!problem) {
      return res.status(404).json({ message: "Problem not found" });
    }
    res.json(problem);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};
