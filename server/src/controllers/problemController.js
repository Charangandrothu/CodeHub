const Problem = require("../models/Problem");

// GET /api/problems
exports.getAllProblems = async (req, res) => {
  try {
    const { topic } = req.query;
    let query = {};

    if (topic) {
      // Case-insensitive match for the topic
      query.topic = { $regex: new RegExp(`^${topic}$`, "i") };
    }

    const problems = await Problem.find(query).select("title slug difficulty tags topic");
    res.json(problems);
  } catch (error) {
    console.error("Error fetching problems:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
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

// POST /api/problems
exports.createProblem = async (req, res) => {
  try {
    console.log("Received POST request body:", req.body);
    const newProblem = new Problem(req.body);
    const savedProblem = await newProblem.save();
    res.status(201).json(savedProblem);
  } catch (error) {
    console.error("Error creating problem:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// PUT /api/problems/:id
exports.updateProblem = async (req, res) => {
  try {
    const problem = await Problem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!problem) {
      return res.status(404).json({ message: "Problem not found" });
    }

    res.json(problem);
  } catch (error) {
    console.error("Error updating problem:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
