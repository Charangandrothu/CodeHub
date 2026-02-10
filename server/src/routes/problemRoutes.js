const express = require("express");
const router = express.Router();

const {
  getAllProblems,
  getProblemBySlug,
  createProblem,
  updateProblem,
  deleteProblem
} = require("../controllers/problemController");

router.get("/", getAllProblems);
router.post("/", createProblem);
router.put("/:id", updateProblem);
router.delete("/:id", deleteProblem);
router.get("/:slug", getProblemBySlug);

module.exports = router;
