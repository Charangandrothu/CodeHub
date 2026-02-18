const express = require("express");
const axios = require("axios");
const redis = require("../config/redis");
const { addJob } = require("./queue");
const { generateDriverCode, executeWithPolling, languageIds } = require("../utils/judgeHelpers");

const router = express.Router();

const Problem = require("../models/Problem");
const User = require("../models/User");
const Submission = require("../models/Submission");

// Helper to extract function signature locally for /run
const getLocalFunctionSignature = (code, language) => {
    if (language === 'python') {
        const match = code.match(/def\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(([^)]*)\):/);
        if (match) return { name: match[1], args: match[2].split(',').map(arg => arg.trim()).filter(a => a) };
    } else if (language === 'javascript') {
        const matchFunc = code.match(/function\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(([^)]*)\)/);
        if (matchFunc) return { name: matchFunc[1], args: matchFunc[2].split(',').map(arg => arg.trim()).filter(a => a) };
        const matchArrow = code.match(/(?:const|let|var)\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*\(?([^)=]*)\)?\s*=>/);
        if (matchArrow) return { name: matchArrow[1], args: matchArrow[2].split(',').map(arg => arg.trim()).filter(a => a) };
    }
    return null;
};

// Helper to generate driver code locally for /run
const generateLocalDriverCode = (userCode, language, testCaseInput) => {
    const signature = getLocalFunctionSignature(userCode, language);
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
        const finalSourceCode = generateLocalDriverCode(code, language, stdin || "");
        const effectiveStdin = (finalSourceCode !== code) ? "" : (stdin || "");

        // Execute with polling
        const result = await executeWithPolling(
            finalSourceCode,
            languageIds[language],
            effectiveStdin
        );

        if (user && !user.isPro) {
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


// SUBMIT Route - Queues execution
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

        await addJob({
            code,
            language,
            userId,
            problemId
        });

        res.json({ message: "Submission queued" });

    } catch (error) {
        res.status(500).json({
            error: "Failed to queue submission",
            details: error.message
        });
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
