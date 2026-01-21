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

// Helper to extract function signature
const getFunctionSignature = (code, language) => {
    if (language === 'python') {
        const match = code.match(/def\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(([^)]*)\):/);
        if (match) {
            return {
                name: match[1],
                args: match[2].split(',').map(arg => arg.trim()).filter(a => a)
            };
        }
    } else if (language === 'javascript') {
        // Matches "function twoSum(a, b)" or "const twoSum = (a, b) =>" or "var twoSum = function(a, b)"
        const matchFunc = code.match(/function\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(([^)]*)\)/);
        if (matchFunc) {
            return {
                name: matchFunc[1],
                args: matchFunc[2].split(',').map(arg => arg.trim()).filter(a => a)
            };
        }
        const matchArrow = code.match(/(?:const|let|var)\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*\(?([^)=]*)\)?\s*=>/);
        if (matchArrow) {
            return {
                name: matchArrow[1],
                args: matchArrow[2].split(',').map(arg => arg.trim()).filter(a => a)
            };
        }
    }
    return null;
};

// Helper to generate full executable code (Driver Code)
const generateDriverCode = (userCode, language, testCaseInput) => {
    const signature = getFunctionSignature(userCode, language);

    // If no function found, run raw code (fallback for script-based submissions)
    if (!signature) return userCode;

    const { name, args } = signature;

    if (language === 'python') {
        // Prepend imports just in case
        return `
import sys
import json
from typing import *

${userCode}

# Driver Code Injected by Backend
try:
    # Prepare inputs directly from the string assignments
${testCaseInput.split('\n').map(line => '    ' + line).join('\n')}
    
    # Call the solution function
    result = ${name}(${args.join(', ')})
    
    # Print the result formatted as JSON-like string if complex, or direct str
    # LeetCode usually prints formatted list/dict. 
    # Valid output format for comparison:
    if isinstance(result, (list, dict, tuple)):
        print(str(result).replace(" ", "")) # Compact format for easier comparison
    else:
        print(result)
        
except Exception as e:
    sys.stderr.write(str(e))
    exit(1)
`;
    } else if (language === 'javascript') {
        // Format input lines to be valid JS assignments if they aren't
        // Assuming input is "varName = value"
        // We add 'let' if it's not present to avoid strict mode errors, or just run it.
        const formattedInput = testCaseInput.split('\n').map(line => {
            if (!line.trim()) return '';
            // If line starts with variable name and =, prepend let
            if (/^[a-zA-Z_$][a-zA-Z0-9_$]*\s*=/.test(line)) {
                return 'let ' + line + ';';
            }
            return line + ';';
        }).join('\n');

        return `
${userCode}

// Driver Code
try {
    ${formattedInput}
    
    const result = ${name}(${args.join(', ')});
    
    if (typeof result === 'object' && result !== null) {
        console.log(JSON.stringify(result));
    } else {
        console.log(result);
    }
} catch (error) {
    console.error(error.message);
    process.exit(1);
}
`;
    }
    return userCode;
};

// RUN Route - Executes code with given stdin
router.post("/run", async (req, res) => {
    const { code, language, stdin } = req.body;

    try {
        // Apply Driver Code logic if applicable
        const finalSourceCode = generateDriverCode(code, language, stdin || "");

        // Determine if we need to pass stdin (fallback mode)
        // If driver code execution was applied, inputs are embedded, so stdin is empty.
        // If raw code is returned, pass original stdin.
        const effectiveStdin = (finalSourceCode !== code) ? "" : (stdin || "");

        const response = await axios.post(
            "https://ce.judge0.com/submissions?wait=true",
            {
                source_code: finalSourceCode,
                language_id: languageIds[language],
                stdin: effectiveStdin
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

        // Sequential execution
        for (let i = 0; i < hiddenCases.length; i++) {
            const testCase = hiddenCases[i];
            const expectedOutput = normalizeOutput(testCase.output);

            // Generate Driver Code wrapping the user's function
            const finalSourceCode = generateDriverCode(code, language, testCase.input);

            // Check if we modified the code (embedded input)
            const shouldUseStdin = (finalSourceCode === code);

            const response = await axios.post(
                "https://ce.judge0.com/submissions?wait=true",
                {
                    source_code: finalSourceCode,
                    language_id: languageIds[language],
                    stdin: shouldUseStdin ? testCase.input : ""
                },
                {
                    headers: { "Content-Type": "application/json" }
                }
            );

            const result = response.data;
            const statusId = result.status?.id;

            // ... (Same verification logic as before)
            if (statusId === 6 || result.compile_output) {
                return res.json({
                    verdict: "Compilation Error",
                    stdout: "",
                    stderr: result.compile_output || result.stderr,
                    failedTestCase: null
                });
            }

            if (statusId === 5) {
                return res.json({
                    verdict: "Time Limit Exceeded",
                    stdout: result.stdout || "",
                    stderr: result.stderr || "Time limit exceeded",
                    failedTestCase: {
                        input: testCase.input,
                        expected: testCase.output,
                        actual: "Time Limit Exceeded"
                    }
                });
            }

            if (result.stderr || (statusId >= 7 && statusId <= 12)) {
                return res.json({
                    verdict: "Runtime Error",
                    stdout: result.stdout || "",
                    stderr: result.stderr || result.status?.description,
                    failedTestCase: {
                        input: testCase.input,
                        expected: testCase.output,
                        actual: "Runtime Error" // stderr describes the error
                    }
                });
            }

            const actualOutput = normalizeOutput(result.stdout);

            if (actualOutput !== expectedOutput) {
                return res.json({
                    verdict: "Wrong Answer",
                    stdout: result.stdout || "",
                    stderr: "",
                    failedTestCase: {
                        input: testCase.input,
                        expected: testCase.output,
                        actual: result.stdout || ""
                    }
                });
            }
        }

        res.json({
            verdict: "Accepted",
            stdout: "All test cases passed",
            stderr: "",
            failedTestCase: null
        });

    } catch (error) {
        console.error("Submission error:", error);
        res.status(500).json({
            verdict: "Runtime Error",
            stdout: "",
            stderr: error.message,
            failedTestCase: null
        });
    }
});

module.exports = router;
