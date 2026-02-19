const Queue = require('bull');
const Problem = require("../models/Problem");
const User = require("../models/User");
const Submission = require("../models/Submission");
const redis = require("../config/redis");
const { generateDriverCode, executeWithPolling, normalizeOutput, languageIds } = require("../utils/judgeHelpers");

// Create Queue
const submissionQueue = new Queue('submission-queue', process.env.REDIS_URL || 'redis://127.0.0.1:6379');

// Process Jobs
submissionQueue.process(async (job) => {
    const { code, language, problemId, userId } = job.data;

    try {
        // 1. Fetch User & Check Credits
        const user = await User.findOne({ uid: userId });

        if (!user) throw new Error("User not found");

        if (!user.isPro) {
            if (user.stats.submissionCredits <= 0) {
                throw new Error("Submission Limit Exceeded");
            }
        }

        // 2. Fetch Problem
        const problem = await Problem.findById(problemId);
        if (!problem) throw new Error("Problem not found");

        const hiddenCases = problem.testCases?.hidden;
        if (!hiddenCases || hiddenCases.length === 0) {
            throw new Error("No hidden test cases defined");
        }

        // 3. Sequential Execution with Early Exit
        let finalVerdict = "Accepted";
        let finalError = "";
        let failedTestCase = null;
        let passedCount = 0;
        let maxTime = 0;
        let maxMemory = 0;

        for (let i = 0; i < hiddenCases.length; i++) {
            const testCase = hiddenCases[i];
            const finalSourceCode = generateDriverCode(code, language, testCase.input);
            const shouldUseStdin = (finalSourceCode === code);

            try {
                const result = await executeWithPolling(
                    finalSourceCode,
                    languageIds[language],
                    shouldUseStdin ? testCase.input : ""
                );

                // Track Max Time/Memory
                const t = parseFloat(result.time) || 0;
                const m = parseFloat(result.memory) || 0;
                if (t > maxTime) maxTime = t;
                if (m > maxMemory) maxMemory = m;

                const expectedOutput = normalizeOutput(testCase.output);
                const statusId = result.status?.id;

                // Check for Errors
                if (statusId === 6 || result.compile_output) {
                    finalVerdict = "Compilation Error";
                    finalError = result.compile_output || result.stderr;
                    break;
                }

                if (statusId === 5) {
                    finalVerdict = "Time Limit Exceeded";
                    finalError = "Time limit exceeded";
                    failedTestCase = { input: testCase.input, expected: testCase.output, actual: "Time Limit Exceeded" };
                    break;
                }

                if (result.stderr || (statusId >= 7 && statusId <= 12)) {
                    finalVerdict = "Runtime Error";
                    finalError = result.stderr || result.status?.description;
                    failedTestCase = { input: testCase.input, expected: testCase.output, actual: "Runtime Error" };
                    break;
                }

                const actualOutput = normalizeOutput(result.stdout);
                if (actualOutput !== expectedOutput) {
                    finalVerdict = "Wrong Answer";
                    failedTestCase = { input: testCase.input, expected: testCase.output, actual: actualOutput };
                    break;
                }

                passedCount++;

            } catch (err) {
                finalVerdict = "Runtime Error";
                finalError = "System Error: " + err.message;
                break;
            }
        }

        // 5. Update User Stats & Credits (If Accepted)
        if (finalVerdict === "Accepted") {
            const userUpdate = await User.findOne({ uid: userId });
            if (userUpdate) {
                if (!userUpdate.stats) userUpdate.stats = {};
                if (!userUpdate.stats.solvedProblemIds) userUpdate.stats.solvedProblemIds = [];

                // Add to history
                const existingHistoryIndex = userUpdate.submissionHistory.findIndex(s => s.problemId === problemId);
                const historyEntry = {
                    problemId: problemId,
                    problemTitle: problem.title || "Unknown Problem",
                    verdict: "Accepted",
                    submittedAt: new Date()
                };

                if (existingHistoryIndex !== -1) {
                    userUpdate.submissionHistory[existingHistoryIndex] = historyEntry;
                } else {
                    userUpdate.submissionHistory.push(historyEntry);
                }

                if (!userUpdate.stats.solvedProblemIds.includes(problemId)) {
                    userUpdate.stats.solvedProblemIds.push(problemId);
                    userUpdate.stats.solvedProblems = userUpdate.stats.solvedProblemIds.length;

                    // Streak
                    const now = new Date();
                    const lastDate = userUpdate.stats.lastSolvedDate ? new Date(userUpdate.stats.lastSolvedDate) : null;
                    const todayMid = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                    const lastMid = lastDate ? new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate()) : null;

                    if (!lastMid) {
                        userUpdate.stats.streak = 1;
                    } else {
                        const diffTime = Math.abs(todayMid - lastMid);
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        if (diffDays === 1) {
                            userUpdate.stats.streak = (userUpdate.stats.streak || 0) + 1;
                        } else if (diffDays > 1) {
                            userUpdate.stats.streak = 1;
                        }
                    }
                    userUpdate.stats.lastSolvedDate = now;
                }

                await userUpdate.save();

                // Invalidate cache
                await redis.del(`cache:/api/users/${userId}`);
                if (userUpdate.username) {
                    await redis.del(`cache:/api/users/handle/${userUpdate.username}`);
                }
            }
        }

        // Deduct Credit (If not Pro)
        if (!user.isPro) {
            await User.findOneAndUpdate(
                { uid: userId, "stats.submissionCredits": { $gt: 0 } },
                { $inc: { "stats.submissionCredits": -1 } }
            );
        }

        // 6. Save Submission Record
        const submission = await Submission.findOneAndUpdate(
            { userId: userId, problemId: problemId },
            {
                code: code,
                language: language,
                verdict: finalVerdict,
                runtime: maxTime,
                memory: maxMemory,
                submittedAt: new Date(),
                passedTestCases: passedCount,
                totalTestCases: hiddenCases.length,
                stderr: finalError,
                failedTestCase: failedTestCase ? {
                    input: failedTestCase.input,
                    expected: failedTestCase.expected,
                    actual: failedTestCase.actual
                } : null
            },
            { upsert: true, new: true }
        );

        return {
            success: true,
            submissionId: submission._id,
            verdict: finalVerdict,
            passedTestCases: passedCount,
            totalTestCases: hiddenCases.length
        };

    } catch (error) {
        console.error("Queue Processing Error:", error);
        // Save Failed Submission Record for visibility?
        // Or just let Bull handle failure
        throw error;
    }
});

const addJob = (data) => {
    return submissionQueue.add(data);
};

module.exports = { addJob };
