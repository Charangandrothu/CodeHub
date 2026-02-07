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
const User = require("../models/User");

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
    
    # Print result ensuring no 'null' is printed if function returns None (e.g. implies void/print-based function)
    if result is not None:
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
    
    if (result !== undefined) {
        if (typeof result === 'object' && result !== null) {
            console.log(JSON.stringify(result));
        } else {
            console.log(result);
        }
    }
} catch (error) {
    console.error(error.message);
    process.exit(1);
}
`;
    }
    return userCode;
};

// Helper: Execute with Optimized Polling (wait=true)
const executeWithPolling = async (source_code, language_id, stdin) => {
    try {
        // 1. Create Submission with wait=true (tries to get result immediately)
        const createRes = await axios.post(
            "https://ce.judge0.com/submissions?base64_encoded=false&wait=true",
            {
                source_code,
                language_id,
                stdin
            },
            { headers: { "Content-Type": "application/json" } }
        );

        // If we got the result immediately, return it
        if (createRes.data.status && createRes.data.status.id > 2) {
            return createRes.data;
        }

        const token = createRes.data.token;
        if (!token) throw new Error("Failed to get submission token from Judge0");

        // 2. Poll for results (Fallback if wait=true timed out but returned token)
        let attempts = 0;
        const maxAttempts = 60; // 60 seconds max

        while (attempts < maxAttempts) {
            attempts++;
            await new Promise(r => setTimeout(r, 200)); // Wait 200ms (faster polling)

            const getRes = await axios.get(
                `https://ce.judge0.com/submissions/${token}?base64_encoded=false&fields=stdout,stderr,status,compile_output`,
                { headers: { "Content-Type": "application/json" } }
            );

            const statusId = getRes.data.status?.id;

            // statusId 1 (In Queue) or 2 (Processing) -> continue polling
            if (statusId && statusId > 2) {
                return getRes.data; // Finished
            }
        }
        throw new Error("Execution timed out (polling limit exceeded)");

    } catch (err) {
        throw new Error(`Judge0 Error: ${err.message}`);
    }
};

// RUN Route - Executes code with given stdin
router.post("/run", async (req, res) => {
    const { code, language, stdin, userId } = req.body; // Added userId

    try {
        let user = null;
        if (userId) {
            user = await User.findOne({ uid: userId });
            if (user) {
                // Check Daily Reset Logic
                const now = new Date();
                const lastReset = user.stats.lastRunResetDate ? new Date(user.stats.lastRunResetDate) : new Date(0);

                // Compare dates (ignoring time)
                const isSameDay = now.getDate() === lastReset.getDate() &&
                    now.getMonth() === lastReset.getMonth() &&
                    now.getFullYear() === lastReset.getFullYear();

                if (!isSameDay) {
                    user.stats.runCredits = 3;
                    user.stats.lastRunResetDate = now;
                    await user.save();
                }

                // Check Credits
                if (!user.isPro && user.stats.runCredits <= 0) {
                    return res.status(403).json({
                        error: "Daily Run Limit Exceeded",
                        verdict: "Limit Exceeded",
                        details: "You have exhausted your daily run credits. Upgrade to Pro for unlimited runs.",
                        isLimitError: true
                    });
                }
            }
        }

        // Apply Driver Code logic if applicable
        const finalSourceCode = generateDriverCode(code, language, stdin || "");

        // Determine if we need to pass stdin (fallback mode)
        const effectiveStdin = (finalSourceCode !== code) ? "" : (stdin || "");

        // Execute with polling
        const result = await executeWithPolling(
            finalSourceCode,
            languageIds[language],
            effectiveStdin
        );

        // Deduct Run Credit ONLY on success
        if (user && !user.isPro) {
            // Re-fetch to ensure we don't overwrite concurrent updates (though simplistic here)
            // Ideally use $inc, but we need to check bounds. 
            // Since we checked before, we can just decrement.
            await User.findOneAndUpdate(
                { uid: userId, "stats.runCredits": { $gt: 0 } },
                { $inc: { "stats.runCredits": -1 } }
            );
        }



        res.json({
            stdout: result.stdout,
            stderr: result.stderr,
            status: result.status?.description,
            compile_output: result.compile_output
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
    const { code, language, problemId, userId } = req.body;


    if (!code || !language || !problemId || !userId) {
        return res.status(400).json({ error: "Missing required fields (including userId)" });
    }

    try {
        // Check Pro Status & Submission Credits
        const user = await User.findOne({ uid: userId });

        // Ensure stats exist
        if (user && !user.stats) {
            user.stats = {
                runCredits: 3,
                submissionCredits: 3,
                dailyTarget: 3
            };
            await user.save();
        }

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        if (!user.isPro) {
            // Check submission credits for free users
            if (user.stats.submissionCredits <= 0) {
                return res.status(403).json({
                    error: "Submission Limit Exceeded",
                    verdict: "Limit Exceeded",
                    details: "You have used all your free submissions. Upgrade to Pro for unlimited submissions.",
                    isLimitError: true
                });
            }
        }

        const problem = await Problem.findById(problemId);
        if (!problem) {
            return res.status(404).json({ error: "Problem not found" });
        }

        const hiddenCases = problem.testCases?.hidden;

        if (!hiddenCases || hiddenCases.length === 0) {
            return res.status(400).json({ error: "No hidden test cases defined for this problem" });
        }

        // Parallel Execution
        // Parallel Execution

        const promises = hiddenCases.map(async (testCase, index) => {
            // Generate Driver Code wrapping the user's function
            const finalSourceCode = generateDriverCode(code, language, testCase.input);
            // Check if we modified the code (embedded input)
            const shouldUseStdin = (finalSourceCode === code);

            try {
                const result = await executeWithPolling(
                    finalSourceCode,
                    languageIds[language],
                    shouldUseStdin ? testCase.input : ""
                );
                return { index, result, testCase, success: true };
            } catch (err) {
                return { index, error: err.message, testCase, success: false };
            }
        });

        const results = await Promise.all(promises);

        // Process Results
        // Find first failure
        for (const res of results) {
            if (!res.success) {
                return res.json({
                    verdict: "Runtime Error",
                    stdout: "",
                    stderr: "Execution failed: " + res.error,
                    failedTestCase: null,
                    totalTestCases: hiddenCases.length,
                    passedTestCases: 0
                });
            }

            const { result, testCase, index } = res;
            const expectedOutput = normalizeOutput(testCase.output);
            const statusId = result.status?.id;

            if (statusId === 6 || result.compile_output) {
                return res.json({
                    verdict: "Compilation Error",
                    stdout: "",
                    stderr: result.compile_output || result.stderr,
                    failedTestCase: null,
                    totalTestCases: hiddenCases.length,
                    passedTestCases: index // This is approximate in parallel
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
                    },
                    totalTestCases: hiddenCases.length,
                    passedTestCases: index
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
                        actual: "Runtime Error"
                    },
                    totalTestCases: hiddenCases.length,
                    passedTestCases: index
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
                    },
                    totalTestCases: hiddenCases.length,
                    passedTestCases: index
                });
            }
        }


        // Update User Solved Problems
        try {
            const userUpdate = await User.findOne({ uid: userId });
            if (userUpdate) {
                // Ensure stats object structure exists (just in case)
                if (!userUpdate.stats) userUpdate.stats = {};
                if (!userUpdate.stats.solvedProblemIds) userUpdate.stats.solvedProblemIds = [];

                // Add to submission history
                userUpdate.submissionHistory.push({
                    problemId: problemId,
                    problemTitle: problem.title || "Unknown Problem",
                    verdict: "Accepted",
                    submittedAt: new Date()
                });

                if (!userUpdate.stats.solvedProblemIds.includes(problemId)) {
                    userUpdate.stats.solvedProblemIds.push(problemId);
                    userUpdate.stats.solvedProblems = userUpdate.stats.solvedProblemIds.length;

                    // Advanced Streak Logic
                    const now = new Date();
                    const lastDate = userUpdate.stats.lastSolvedDate ? new Date(userUpdate.stats.lastSolvedDate) : null;

                    // Reset time to midnight for accurate day comparison
                    const todayMid = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                    const lastMid = lastDate ? new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate()) : null;

                    if (!lastMid) {
                        // First problem ever solved
                        userUpdate.stats.streak = 1;
                    } else {
                        const diffTime = Math.abs(todayMid - lastMid);
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                        if (diffDays === 1) {
                            // Solved yesterday -> Increment streak
                            userUpdate.stats.streak = (userUpdate.stats.streak || 0) + 1;
                        } else if (diffDays > 1) {
                            // Missed one or more days -> Reset streak to 1 (for today)
                            userUpdate.stats.streak = 1;
                        }
                        // If diffDays === 0 (solved previously today), do NOT increment
                    }

                    // Update last solved date to now
                    userUpdate.stats.lastSolvedDate = now;
                }

                await userUpdate.save();
            }
        } catch (updateErr) {
            console.error("Failed to update user stats:", updateErr);
        }

        // Calculate Stats
        let maxTime = 0;
        let maxMemory = 0;

        for (const res of results) {
            if (res.result) {
                const t = parseFloat(res.result.time) || 0;
                const m = parseFloat(res.result.memory) || 0;
                if (t > maxTime) maxTime = t;
                if (m > maxMemory) maxMemory = m;
            }
        }

        res.json({
            verdict: "Accepted",
            stdout: "All test cases passed",
            stderr: "",
            failedTestCase: null,
            totalTestCases: hiddenCases.length,
            passedTestCases: hiddenCases.length,
            time: maxTime,
            memory: maxMemory
        });

        // Deduct Submission Credit ONLY on success (and if not Pro)
        if (!user.isPro) {
            await User.findOneAndUpdate(
                { uid: userId, "stats.submissionCredits": { $gt: 0 } },
                { $inc: { "stats.submissionCredits": -1 } }
            );
        }

    } catch (error) {
        res.status(500).json({
            verdict: "Runtime Error",
            stdout: "",
            stderr: "Execution timed out or server error: " + error.message,
            failedTestCase: null,
            totalTestCases: 0,
            passedTestCases: 0
        });
    }
});

module.exports = router;
