const express = require("express");
const axios = require("axios");

const router = express.Router();

// Judge0 language IDs
const languageIds = {
    javascript: 63,
    python: 71,
    cpp: 54,
    java: 62
};

const Problem = require("../models/Problem");

// Helper to normalize output for comparison
const normalizeOutput = (str) => {
    if (!str) return "";
    // Trim leading/trailing whitespace and normalize newlines
    return str.trim().replace(/\r\n/g, "\n");
};

router.post("/run", async (req, res) => {
    const { code, language, stdin } = req.body;

    try {
        const response = await axios.post(
            "https://ce.judge0.com/submissions?wait=true",
            {
                source_code: code,
                language_id: languageIds[language],
                stdin: stdin || ""
            },
            {
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );

        res.json({
            stdout: response.data.stdout,
            stderr: response.data.stderr,
            status: response.data.status.description,
            compile_output: response.data.compile_output
        });

    } catch (error) {
        res.status(500).json({
            error: "Execution failed",
            details: error.message
        });
    }
});

// SUBMIT Route - Judges correctness
router.post("/submit", async (req, res) => {
    const { code, language, problemId } = req.body;

    if (!code || !language || !problemId) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        const problem = await Problem.findById(problemId);
        if (!problem) {
            return res.status(404).json({ error: "Problem not found" });
        }

        const hiddenCases = problem.testCases?.hidden;

        if (!hiddenCases || hiddenCases.length === 0) {
            return res.status(400).json({ error: "No hidden test cases defined for this problem" });
        }

        // Sequential execution - Stop immediately on failure
        for (let i = 0; i < hiddenCases.length; i++) {
            const testCase = hiddenCases[i];

            // Execute code against hidden test case
            const response = await axios.post(
                "https://ce.judge0.com/submissions?wait=true",
                {
                    source_code: code,
                    language_id: languageIds[language],
                    stdin: testCase.input
                },
                {
                    headers: { "Content-Type": "application/json" }
                }
            );

            const result = response.data;

            // 1. Check for Compilation Errors (usually status ID 6)
            if (result.compile_output) {
                return res.json({
                    verdict: "Compilation Error",
                    details: result.compile_output
                });
            }

            // 2. Check for Runtime Errors (stderr present, usually statuses 7-12)
            if (result.stderr) {
                return res.json({
                    verdict: "Runtime Error",
                    details: result.stderr
                });
            }

            // 3. Normalize & Compare Output
            const normalizedActual = normalizeOutput(result.stdout);
            const normalizedExpected = normalizeOutput(testCase.output);

            // Strict comparison: Mismatch or Empty Output when expected is not empty -> Wrong Answer
            if (normalizedActual !== normalizedExpected) {
                return res.json({
                    verdict: "Wrong Answer",
                    // We DO NOT expose the hidden failing case, strictly verdict only.
                });
            }
        }

        // If and only if ALL hidden cases pass
        res.json({ verdict: "Accepted" });

    } catch (error) {
        console.error("Submission error:", error);
        res.status(500).json({
            error: "Submission processing failed",
            details: error.message
        });
    }
});

module.exports = router;
