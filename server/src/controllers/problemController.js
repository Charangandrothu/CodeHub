const Problem = require("../models/Problem");
const mongoose = require("mongoose");
const redis = require("../config/redis");

const clearCache = async (pattern) => {
  try {
    const stream = redis.scanStream({
      match: pattern,
      count: 100
    });

    stream.on("data", (keys) => {
      if (keys.length) {
        const pipeline = redis.pipeline();
        keys.forEach((key) => {
          pipeline.del(key);
        });
        pipeline.exec();
      }
    });

    stream.on("end", () => {
      console.log(`Cache cleared for pattern: ${pattern}`);
    });
  } catch (err) {
    console.error("Cache clear error:", err);
  }
};

// GET /api/problems
exports.getAllProblems = async (req, res) => {
  try {
    const { topic } = req.query;
    let query = {};

    if (topic) {
      // Create a regex that allows hyphens in twhy he query to match spaces in the DB
      // e.g., "binary-search" will match "Binary Search" or "Binary-Search"
      const pattern = topic.split('-').join('[\\s-]');
      query.topic = { $regex: new RegExp(`^${pattern}$`, "i") };
    }

    const problems = await Problem.find(query).sort({ order: 1 }).select("title slug difficulty tags topic order");
    res.json(problems);
  } catch (error) {
    console.error("Error fetching problems:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// GET /api/problems/:slug
exports.getProblemBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    let query = { slug };

    // Allow lookup by ID if it's a valid ObjectId
    if (mongoose.Types.ObjectId.isValid(slug)) {
      query = { $or: [{ slug }, { _id: slug }] };
    }

    // Exclude hidden test cases and internal fields like __v
    const problem = await Problem.findOne(query).select('-testCases.hidden -__v');

    if (!problem) {
      return res.status(404).json({ message: "Problem not found" });
    }
    res.json(problem);
  } catch (error) {
    console.error("Error fetching problem:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// POST /api/problems
exports.createProblem = async (req, res) => {
  try {
    console.log("Received POST request body:", req.body);
    const newProblem = new Problem(req.body);
    const savedProblem = await newProblem.save();

    // Invalidate cache for problem lists
    await clearCache("cache:/api/problems*");

    res.status(201).json(savedProblem);
  } catch (error) {
    console.error("Error creating problem:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// DELETE /api/problems/:id
exports.deleteProblem = async (req, res) => {
  try {
    const deletedProblem = await Problem.findByIdAndDelete(req.params.id);
    if (!deletedProblem) return res.status(404).json({ message: "Problem not found" });

    // Invalidate cache
    await clearCache("cache:/api/problems*");
    if (deletedProblem.slug) {
      await redis.del(`cache:/api/problems/${deletedProblem.slug}`);
    }

    res.json({ message: "Problem deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// PUT /api/problems/:id
exports.updateProblem = async (req, res) => {
  try {
    const updates = { ...req.body };

    // Prevent updating immutable fields
    delete updates.slug;
    delete updates._id;
    delete updates.createdAt;

    const problem = await Problem.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!problem) {
      return res.status(404).json({ message: "Problem not found" });
    }

    // Invalidate cache
    await clearCache("cache:/api/problems*");
    if (problem.slug) {
      await redis.del(`cache:/api/problems/${problem.slug}`);
    }

    res.json(problem);
  } catch (error) {
    console.error("Error updating problem:", error);
    if (error.code === 11000) {
      return res.status(400).json({ message: "Duplicate key error", error: error.message });
    }
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
