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

    // If no function found, run raw code (fallback)
    if (!signature) return userCode;

    const { name, args } = signature;

    // 1. Normalize Input: separate "var=val, var2=val2" into distinct lines
    // Regex matches ", varname =" and replaces with "\nvarname ="
    const normalizedInput = testCaseInput.replace(/,\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*=/g, '\n$1 =');

    // 2. Extract Values: strip "var =" if present, keep just the value
    const inputLines = normalizedInput.split('\n').filter(line => line.trim());
    const inputValues = inputLines.map(line => {
        // Match "var = value", capture value. If not match, return line as is.
        // Be careful not to match inside strings/arrays if possible, but this simple regex looks provided assignments.
        const match = line.match(/^\s*[a-zA-Z_][a-zA-Z0-9_]*\s*=\s*(.*)/);
        return match ? match[1] : line.trim();
    });

    // 3. Map Values to Function Arguments
    // We strictly assume input order matches argument order
    // slice to safe bounds
    const argDefinitions = args.map((arg, i) => {
        const val = inputValues[i] || 'undefined'; // fallback
        return { name: arg, value: val };
    });


    if (language === 'python') {
        // Construct Python Definitions
        const pythonDefs = argDefinitions.map(def => `${def.name} = ${def.value}`).join('\n');

        return `
import sys
import json
from typing import *

${userCode}

# Driver Code
try:
    # Prepare inputs
${pythonDefs.split('\n').map(l => '    ' + l).join('\n')}
    
    # Call solution
    result = ${name}(${args.join(', ')})
    
    # Print result using JSON for consistency
    if isinstance(result, bool):
         # JSON uses 'true'/'false', Python uses 'True'/'False'
        print("true" if result else "false")
    elif isinstance(result, str):
        print(result)
    else:
        # json.dumps handles lists, dicts, strings, and nums perfectly
        print(json.dumps(result))
        
except Exception as e:
    sys.stderr.write(str(e))
    exit(1)
`;
    } else if (language === 'javascript') {
        const jsDefs = argDefinitions.map(def => `let ${def.name} = ${def.value};`).join('\n');

        return `
${userCode}

// Driver Code
try {
    ${jsDefs}
    
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
