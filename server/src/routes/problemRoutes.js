const express = require("express");
const router = express.Router();

const {
  getAllProblems,
  getProblemBySlug,
} = require("../controllers/problemController");

router.get("/", getAllProblems);
router.get("/:slug", getProblemBySlug);

module.exports = router;
