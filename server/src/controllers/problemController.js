const Problem = require("../models/Problem");
const mongoose = require("mongoose");
const redis = require("../config/redis");

const clearCache = (pattern) => {
  return new Promise((resolve, reject) => {
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
        resolve();
      });

      stream.on("error", (err) => {
        console.error("Cache scan stream error:", err);
        resolve(); // resolve anyway to not block
      });
    } catch (err) {
      console.error("Cache clear error:", err);
      resolve();
    }
  });
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
    const { uid } = req.query; // Check UID from query params

    let query = { slug };

    // Allow lookup by ID if it's a valid ObjectId
    if (mongoose.Types.ObjectId.isValid(slug)) {
      query = { $or: [{ slug }, { _id: slug }] };
    }

    // Exclude hidden test cases and internal fields like __v
    const problem = await Problem.findOne(query).select('-testCases.hidden -__v').lean();

    if (!problem) {
      return res.status(404).json({ message: "Problem not found" });
    }

    // Check user pro status
    let isPro = false;
    if (uid) {
      const User = require("../models/User"); // Import locally to avoid circular deps if any
      const user = await User.findOne({ uid });
      if (user && user.isPro) {
        isPro = true;
      }
    }

    // Sanitize theory for non-pro users — hide content but expose enough structure
    // so the frontend can show the blurred lock overlay (not "Coming Soon")
    if (!isPro && problem.theory) {
      const hasBrute = !!(problem.theory.bruteForce?.explanation || problem.theory.bruteForce?.solutionCode?.javascript);
      const hasOptimal = !!(problem.theory.optimal?.explanation || problem.theory.optimal?.solutionCode?.javascript);
      const hasLegacy = !!(problem.theory.videoUrl || problem.theory.explanation);

      if (hasBrute || hasOptimal || hasLegacy) {
        // Return minimal stub so IIFE detects content and shows lock overlay
        problem.theory = {
          videoUrl: problem.theory.videoUrl ? "LOCKED" : null,
          videoTitle: problem.theory.videoTitle || null,
          bruteForce: hasBrute ? { explanation: "LOCKED", solutionCode: { javascript: "// LOCKED" } } : null,
          optimal: hasOptimal ? { explanation: "LOCKED", solutionCode: { javascript: "// LOCKED" } } : null,
          // Legacy flat fields
          explanation: hasLegacy ? "LOCKED" : null,
          solutionCode: hasLegacy ? { javascript: "// LOCKED" } : null,
        };
      } else {
        problem.theory = null;
      }
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

// GET /api/problems/admin-edit/:id  — full data, no sanitization, no cache (admin panel use only)
exports.getFullProblemForAdmin = async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id).select('-__v').lean();
    if (!problem) return res.status(404).json({ message: "Problem not found" });
    res.json(problem);
  } catch (error) {
    console.error("Error fetching full problem for admin:", error);
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
    delete updates.__v;

    // Use explicit $set so nested subdocuments (theory.bruteForce, theory.optimal etc.)
    // are saved correctly regardless of Mongoose strict mode behaviour
    const problem = await Problem.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
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
