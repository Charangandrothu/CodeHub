const express = require("express");
const router = express.Router();

const {
  getAllProblems,
  getProblemBySlug,
  createProblem,
} = require("../controllers/problemController");

router.get("/", getAllProblems);
router.post("/", createProblem);
router.get("/:slug", getProblemBySlug);

module.exports = router;
