const express = require("express");
const router = express.Router();

const {
  getAllProblems,
  getProblemBySlug,
  createProblem,
  updateProblem,
  deleteProblem
} = require("../controllers/problemController");

const cacheMiddleware = require("../middleware/cache");

// Cache the list of problems for 60 seconds
router.get("/", cacheMiddleware(60), getAllProblems);

router.post("/", createProblem);
router.put("/:id", updateProblem);
router.delete("/:id", deleteProblem);

// Cache individual problem details for 5 minutes (300 seconds)
router.get("/:slug", cacheMiddleware(300), getProblemBySlug);

module.exports = router;
