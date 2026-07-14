const express = require("express");
const axios = require("axios");
const redis = require("../config/redis");
const { addJob } = require("./queue");
const { generateDriverCode, buildJavaDriver, executeWithPolling, normalizeOutput, languageIds, timeLimits, buildBatchDriver, buildBatchCombinedStdin, getFunctionSignature } = require("../utils/judgeHelpers");

const router = express.Router();

const Problem = require("../models/Problem");
const User = require("../models/User");
const Submission = require("../models/Submission");



// Helper to generate driver code locally for /run
const generateLocalDriverCode = (userCode, language, testCaseInput) => {
    // C++ passes through as-is
    if (language === 'cpp') return userCode;

    // Java: build a Main wrapper around the user's class
    if (language === 'java') {
        const normalizedInput = testCaseInput.replace(/,\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*=/g, '\n$1 =');
        const inputLines = normalizedInput.split('\n').filter(line => line.trim());
        const inputValues = inputLines.map(line => {
            const match = line.match(/^\s*[a-zA-Z_][a-zA-Z0-9_]*\s*=\s*(.*)/);
            return match ? match[1] : line.trim();
        });
        return buildJavaDriver(userCode, inputValues) || userCode;
    }

    const signature = getFunctionSignature(userCode, language);
    if (!signature) return userCode;

    const { name, args } = signature;
    const normalizedInput = testCaseInput.replace(/,\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*=/g, '\n$1 =');
    const inputLines = normalizedInput.split('\n').filter(line => line.trim());
    const inputValues = inputLines.map(line => {
        const match = line.match(/^\s*[a-zA-Z_][a-zA-Z0-9_]*\s*=\s*(.*)/);
        return match ? match[1] : line.trim();
    });

    const argDefinitions = args.map((arg, i) => {
        const val = inputValues[i] || 'undefined';
        return { name: arg, value: val };
    });

    if (language === 'python') {
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
    
    # Print result
    if result is not None:
        if isinstance(result, bool):
            print("true" if result else "false")
        elif isinstance(result, str):
            print(result)
        else:
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

// RUN Route - Executes code with given stdin
router.post("/run", async (req, res) => {
    const { code, language, stdin, userId } = req.body;

    try {
        let user = null;
        if (userId) {
            user = await User.findOne({ uid: userId });
            if (user) {
                // Check Daily Reset Logic
                const now = new Date();
                const lastReset = user.stats.lastRunResetDate ? new Date(user.stats.lastRunResetDate) : new Date(0);

                const isSameDay = now.getDate() === lastReset.getDate() &&
                    now.getMonth() === lastReset.getMonth() &&
                    now.getFullYear() === lastReset.getFullYear();

                if (!isSameDay) {
                    user.stats.runCredits = 3;
                    user.stats.lastRunResetDate = now;
                    await user.save();
                }

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

        // Use local logic or helper if available
        let finalSourceCode = generateLocalDriverCode(code, language, stdin || "");
        let effectiveStdin = (finalSourceCode !== code) ? "" : (stdin || "");

        if (language === 'cpp' && !code.includes('main')) {
            const batchDriver = buildBatchDriver(code, language);
            if (batchDriver) {
                finalSourceCode = batchDriver;
                effectiveStdin = "1\n" + (stdin || "");
            }
        }

        const cpuTimeLimit = timeLimits[language] || 2;

        // Execute with polling
        const result = await executeWithPolling(
            finalSourceCode,
            languageIds[language],
            effectiveStdin,
            cpuTimeLimit
        );

        if (user && !user.isPro) {
            await User.findOneAndUpdate(
                { uid: userId, "stats.runCredits": { $gt: 0 } },
                { $inc: { "stats.runCredits": -1 } }
            );
        }

        // If it's a batch execution generated strictly for local testcases, remove the batch separator from console
        let cleanStdout = result.stdout;
        if (cleanStdout) {
            cleanStdout = cleanStdout.split(/\n?~---~\n?/)[0];
        }

        res.json({
            stdout: cleanStdout,
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


// SUBMIT Route - Inline execution (no queue, instant result)
router.post("/submit", async (req, res) => {
    const { code, language, problemId, userId } = req.body;

    if (!code || !language || !problemId || !userId) {
        return res.status(400).json({ error: "Missing required fields (including userId)" });
    }

    try {
        // 1. Check user & credits
        const user = await User.findOne({ uid: userId });

        if (!user) return res.status(404).json({ error: "User not found" });

        if (!user.stats) {
            user.stats = { runCredits: 3, submissionCredits: 3, dailyTarget: 3 };
            await user.save();
        }

        const isProUser = user.isPro || user.plan === 'pro' || user.plan === 'elite';

        if (!isProUser && user.stats.submissionCredits <= 0) {
            return res.status(403).json({
                error: "Submission Limit Exceeded",
                verdict: "Limit Exceeded",
                details: "You have used all your free submissions. Upgrade to Pro for unlimited submissions.",
                isLimitError: true
            });
        }

        // 2. Fetch problem + hidden test cases
        const problem = await Problem.findById(problemId);
        if (!problem) return res.status(404).json({ error: "Problem not found" });

        const hiddenCases = problem.testCases?.hidden;
        if (!hiddenCases || hiddenCases.length === 0) {
            return res.status(400).json({ error: "No hidden test cases defined" });
        }

        // 3. Execute all test cases — single batch submission when possible, parallel fallback for C++
        const cpuTimeLimit = timeLimits[language] || 2;

        let finalVerdict = "Accepted";
        let finalError = "";
        let failedTestCase = null;
        let passedCount = 0;
        let maxTime = 0;
        let maxMemory = 0;

        const batchDriver = buildBatchDriver(code, language);

        if (batchDriver) {
            // ── SINGLE EXECUTION PATH (JS / Python / Java) ──────────────────
            // cpu_time_limit is generous: per-case limit × num cases, capped at 15 s
            const batchCpuLimit = Math.min(cpuTimeLimit * hiddenCases.length, 15);
            const combinedStdin = buildBatchCombinedStdin(hiddenCases);

            const result = await executeWithPolling(
                batchDriver,
                languageIds[language],
                combinedStdin,
                batchCpuLimit
            );

            maxTime = parseFloat(result.time) || 0;
            maxMemory = parseFloat(result.memory) || 0;

            const statusId = result.status?.id;

            if (statusId === 6 || result.compile_output) {
                finalVerdict = "Compilation Error";
                finalError = result.compile_output || result.stderr || "";
            } else if (statusId === 5) {
                finalVerdict = "Time Limit Exceeded";
                finalError = "Time limit exceeded";
                failedTestCase = { input: hiddenCases[0]?.input, expected: hiddenCases[0]?.output, actual: "TLE" };
            } else if (result.stderr || (statusId >= 7 && statusId <= 12)) {
                finalVerdict = "Runtime Error";
                finalError = result.stderr || result.status?.description || "";
            } else {
                const rawOutputs = (result.stdout || "").split(/\n?~---~\n?/);

                for (let i = 0; i < hiddenCases.length; i++) {
                    const expectedNorm = normalizeOutput(hiddenCases[i].output);
                    let actualRaw = rawOutputs[i] || "";

                    const actual = normalizeOutput(actualRaw);
                    const expected = expectedNorm;

                    if (actual !== expected) {
                        finalVerdict = "Wrong Answer";
                        failedTestCase = { input: hiddenCases[i].input, expected: hiddenCases[i].output, actual: actualRaw.trim() };
                        break;
                    }
                    passedCount++;
                }
            }
        } else {
            // ── PARALLEL FALLBACK (C++ or unrecognised signature) ────────────
            const settled = await Promise.allSettled(
                hiddenCases.map(tc => {
                    const src = generateLocalDriverCode(code, language, tc.input);
                    const useStdin = (src === code);
                    return executeWithPolling(src, languageIds[language], useStdin ? tc.input : "", cpuTimeLimit);
                })
            );

            for (let i = 0; i < hiddenCases.length; i++) {
                const s = settled[i];
                const testCase = hiddenCases[i];

                if (s.status === 'rejected') {
                    finalVerdict = "Runtime Error";
                    finalError = "System Error: " + s.reason?.message;
                    failedTestCase = { input: testCase.input, expected: testCase.output, actual: "Runtime Error" };
                    break;
                }

                const result = s.value;
                const t = parseFloat(result.time) || 0;
                const mem = parseFloat(result.memory) || 0;
                if (t > maxTime) maxTime = t;
                if (mem > maxMemory) maxMemory = mem;

                const statusId = result.status?.id;
                if (statusId === 6 || result.compile_output) {
                    finalVerdict = "Compilation Error";
                    finalError = result.compile_output || result.stderr;
                    break;
                }
                if (statusId === 5) {
                    finalVerdict = "Time Limit Exceeded";
                    finalError = "Time limit exceeded";
                    failedTestCase = { input: testCase.input, expected: testCase.output, actual: "TLE" };
                    break;
                }
                if (result.stderr || (statusId >= 7 && statusId <= 12)) {
                    finalVerdict = "Runtime Error";
                    finalError = result.stderr || result.status?.description;
                    failedTestCase = { input: testCase.input, expected: testCase.output, actual: "Runtime Error" };
                    break;
                }

                const actual = normalizeOutput(result.stdout);
                const expected = normalizeOutput(testCase.output);
                if (actual !== expected) {
                    finalVerdict = "Wrong Answer";
                    failedTestCase = { input: testCase.input, expected: testCase.output, actual };
                    break;
                }
                passedCount++;
            }
        }

        // 4. Save submission record
        const now = new Date();
        const submission = await Submission.findOneAndUpdate(
            { userId, problemId },
            {
                code,
                language,
                verdict: finalVerdict,
                runtime: maxTime,
                memory: maxMemory,
                submittedAt: now,
                passedTestCases: passedCount,
                totalTestCases: hiddenCases.length,
                stderr: finalError,
                failedTestCase: failedTestCase || null
            },
            { upsert: true, new: true }
        );

        // 5. Update user stats
        const userUpdate = await User.findOne({ uid: userId });
        if (userUpdate) {
            if (!userUpdate.stats) userUpdate.stats = {};
            if (!userUpdate.stats.solvedProblemIds) userUpdate.stats.solvedProblemIds = [];

            userUpdate.submissionHistory = userUpdate.submissionHistory || [];
            userUpdate.submissionHistory.push({
                problemId,
                problemTitle: problem.title || "Unknown Problem",
                verdict: finalVerdict,
                submittedAt: now
            });
            if (userUpdate.submissionHistory.length > 2000) {
                userUpdate.submissionHistory = userUpdate.submissionHistory.slice(-2000);
            }

            if (finalVerdict === "Accepted" && !userUpdate.stats.solvedProblemIds.includes(problemId)) {
                userUpdate.stats.solvedProblemIds.push(problemId);
                userUpdate.stats.solvedProblems = userUpdate.stats.solvedProblemIds.length;

                const todayMid = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                const lastDate = userUpdate.stats.lastSolvedDate ? new Date(userUpdate.stats.lastSolvedDate) : null;
                const lastMid = lastDate ? new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate()) : null;
                if (!lastMid) {
                    userUpdate.stats.streak = 1;
                } else {
                    const diffDays = Math.ceil(Math.abs(todayMid - lastMid) / (1000 * 60 * 60 * 24));
                    userUpdate.stats.streak = diffDays === 1 ? (userUpdate.stats.streak || 0) + 1 : 1;
                }
                userUpdate.stats.lastSolvedDate = now;
            }

            await userUpdate.save();
            await redis.del(`cache:/api/users/${userId}`);
            if (userUpdate.username) await redis.del(`cache:/api/users/handle/${userUpdate.username}`);

            // Trigger referral checks in the background
            const ReferralService = require('../services/referralService');
            ReferralService.checkAndUpdateReferrals(userId).catch(err => {
                console.error("Error updating referrals (non-fatal):", err);
            });
        }

        // 6. Deduct credit for free users
        if (!isProUser) {
            await User.findOneAndUpdate(
                { uid: userId, "stats.submissionCredits": { $gt: 0 } },
                { $inc: { "stats.submissionCredits": -1 } }
            );
        }

        // 7. Return result directly
        return res.json({
            verdict: finalVerdict,
            stderr: finalError,
            failedTestCase: failedTestCase || null,
            runtime: maxTime,
            memory: maxMemory,
            passedTestCases: passedCount,
            totalTestCases: hiddenCases.length,
            submittedAt: now
        });

    } catch (error) {
        console.error("Submit error:", error);
        res.status(500).json({ error: "Submission failed", details: error.message });
    }
});

// MOCK TEST RUN Route - POST /api/execute
// Used by MockTestWindow to run DSA code against visible test cases
router.post("/", async (req, res) => {
    const { code, language, problemSlug } = req.body;

    if (!code || !language || !problemSlug) {
        return res.status(400).json({ error: "Missing required fields: code, language, problemSlug" });
    }

    try {
        // Fetch the problem by slug to get visible test cases
        const problem = await Problem.findOne({ slug: problemSlug });
        if (!problem) {
            return res.status(404).json({ error: "Problem not found" });
        }

        const visibleCases = problem.testCases?.visible || [];
        if (visibleCases.length === 0) {
            return res.json({ results: [], message: "No visible test cases defined for this problem." });
        }

        const cpuTimeLimit = timeLimits[language] || 2;
        const results = [];

        // Try batch execution first
        const batchDriver = buildBatchDriver(code, language);
        if (batchDriver) {
            const batchCpuLimit = Math.min(cpuTimeLimit * visibleCases.length, 10);
            const combinedStdin = buildBatchCombinedStdin(visibleCases);

            const result = await executeWithPolling(batchDriver, languageIds[language], combinedStdin, batchCpuLimit);

            const statusId = result.status?.id;
            if (statusId === 6 || result.compile_output) {
                return res.json({ compileError: result.compile_output || result.stderr || "Compilation Error" });
            }
            if (result.stderr && (statusId >= 7 && statusId <= 12)) {
                return res.json({ runtimeError: result.stderr || result.status?.description });
            }

            const rawOutputs = (result.stdout || "").split(/\n?~---~\n?/);
            for (let i = 0; i < visibleCases.length; i++) {
                const expected = normalizeOutput(visibleCases[i].output);
                const actual = normalizeOutput(rawOutputs[i] || "");
                results.push({
                    passed: actual === expected,
                    input: visibleCases[i].input,
                    expected: visibleCases[i].output,
                    actual: (rawOutputs[i] || "").trim(),
                    stdout: (rawOutputs[i] || "").trim()
                });
            }
        } else {
            // Parallel fallback for C++ / unrecognized signatures
            const settled = await Promise.allSettled(
                visibleCases.map(tc => {
                    const src = generateLocalDriverCode(code, language, tc.input);
                    const useStdin = (src === code);
                    return executeWithPolling(src, languageIds[language], useStdin ? tc.input : "", cpuTimeLimit);
                })
            );

            for (let i = 0; i < visibleCases.length; i++) {
                const s = settled[i];
                const tc = visibleCases[i];
                if (s.status === "rejected") {
                    results.push({ passed: false, input: tc.input, expected: tc.output, actual: "Runtime Error", stdout: "" });
                    continue;
                }
                const result = s.value;
                const statusId = result.status?.id;
                if (statusId === 6 || result.compile_output) {
                    return res.json({ compileError: result.compile_output || result.stderr });
                }
                if (result.stderr || (statusId >= 7 && statusId <= 12)) {
                    return res.json({ runtimeError: result.stderr || result.status?.description });
                }
                const expected = normalizeOutput(tc.output);
                const actual = normalizeOutput(result.stdout || "");
                results.push({
                    passed: actual === expected,
                    input: tc.input,
                    expected: tc.output,
                    actual: (result.stdout || "").trim(),
                    stdout: (result.stdout || "").trim()
                });
            }
        }

        return res.json({ results });
    } catch (error) {
        console.error("Mock test execute error:", error);
        res.status(500).json({ error: "Execution failed", details: error.message });
    }
});

// GET Submission Route (Unique per user/problem)
router.get("/submission/:problemId", async (req, res) => {
    const { problemId } = req.params;
    const { userId } = req.query;

    if (!problemId || !userId) {
        return res.status(400).json({ error: "Missing problemId or userId" });
    }

    try {
        const submission = await Submission.findOne({ userId, problemId });
        res.json(submission || null); // Return null if no submission found
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch submission", details: error.message });
    }
});

module.exports = router;
