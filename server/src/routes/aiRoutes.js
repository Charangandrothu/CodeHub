const express = require('express');
const axios = require('axios');
const router = express.Router();
const User = require('../models/User');

// Middleware to verify user (Adapted for existing app pattern)
const verifyUser = async (req, res, next) => {
    try {
        const { userId } = req.body;

        // Fallback to checking headers if userId not in body (though Frontend should send it)
        // In a real app we'd verify the token. Here we trust the client's UID for now as per app pattern.
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized: Missing userId" });
        }

        const user = await User.findOne({ uid: userId });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        req.user = user;
        next();
    } catch (err) {
        console.error("Auth Error:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// 4️⃣ 🔥 VERY IMPORTANT — Smart Prompt (Use This)
// 4️⃣ 🔥 PREMIUM SYSTEM PROMPT (Fixed for Natural Chat)
// 4️⃣ 🔥 ULTRA-FAST PREMIUM PROMPT (Optimized)
function buildPrompt(data) {
    const {
        problemTitle,
        problemDescription,
        userCode,
        language,
        userQuestion,
        isPro
    } = data;

    // Truncate logic to save tokens
    const shortDesc = problemDescription.length > 500 ? problemDescription.substring(0, 500) + "..." : problemDescription;
    const shortCode = userCode.length > 1000 ? userCode.substring(0, 1000) + "..." : userCode;

    return `
You are the AI assistant inside CodeHubX.

Be concise and natural.
No decorative formatting.
No headings.
No unnecessary markdown.
No repeating the full problem.

If greeting → respond briefly.
If debugging → analyze only relevant part.
If hint → guide conceptually.
If full solution → provide clean code block only.

Keep responses short unless user asks for detail.

ACCESS: ${isPro ? "PRO" : "FREE"}

Context:
Title: ${problemTitle}
Problem: ${shortDesc}
Code:
${shortCode}

Language: ${language}
Question: ${userQuestion}
`;
}

// 5️⃣ Kimi Service (Kimi 2.5)
const generateKimiResponse = async (prompt) => {
    try {
        const response = await axios.post(
            "https://integrate.api.nvidia.com/v1/chat/completions",
            {
                model: "meta/llama-3.1-405b-instruct", // Fallback to Llama 3.1 405B (Kimi not found)
                messages: [
                    {
                        role: "system",
                        content: "You are a friendly, concise coding assistant."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.2, // Reduced for precision
                max_tokens: 350,   // Reduced for speed
                stream: false      // Streaming handled on frontend if implemented, but here we return full response for now
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.NVIDIA_API_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        return response.data.choices[0].message.content;
    } catch (err) {
        if (err.response) {
            console.error("Kimi API Error Status:", err.response.status);
            console.error("Kimi API Error Data:", JSON.stringify(err.response.data, null, 2));
        } else {
            console.error("Kimi API Error Message:", err.message);
        }
        throw new Error("AI Service Failed: " + (err.response?.data?.error?.message || err.message));
    }
};

// 3️⃣ Backend Route
router.post("/problem-help", verifyUser, async (req, res) => {
    try {
        const {
            problemTitle,
            problemDescription,
            userCode,
            language,
            userQuestion
        } = req.body;

        // 💰 Monetization Logic (Check Limit)
        // Check reset logic for daily limit (assuming standard daily reset logic if absent)
        const now = new Date();
        const lastReset = req.user.lastAiResetDate ? new Date(req.user.lastAiResetDate) : new Date(0);
        const isSameDay = now.getDate() === lastReset.getDate() &&
            now.getMonth() === lastReset.getMonth() &&
            now.getFullYear() === lastReset.getFullYear();

        if (!isSameDay) {
            req.user.aiUsage = 0;
            req.user.lastAiResetDate = now;
            await req.user.save();
        }

        if (!req.user.isPro && req.user.aiUsage >= 3) {
            return res.status(403).json({
                message: "Daily AI limit reached. Upgrade to Pro."
            });
        }

        // 🔥 Instant Response for Short/Casual Queries
        const cleanQuestion = userQuestion.trim().toLowerCase();
        if (cleanQuestion.length < 10 && (
            cleanQuestion === 'hi' ||
            cleanQuestion === 'hello' ||
            cleanQuestion === 'hii' ||
            cleanQuestion === 'hey' ||
            cleanQuestion.includes('help')
        )) {
            return res.json({ answer: "Hello 👋\nHow can I help you with this problem?" });
        }

        // 🔒 Secure Atomic Limit Check & Increment
        // This prevents race conditions where users could send 100 requests at once
        if (!req.user.isPro) {
            const updatedUser = await User.findOneAndUpdate(
                { _id: req.user._id, aiUsage: { $lt: 3 } },
                { $inc: { aiUsage: 1 } },
                { new: true }
            );

            if (!updatedUser) {
                return res.status(403).json({ message: "Daily AI limit reached. Upgrade to Pro." });
            }
        } else {
            // Just track usage for Pro users
            await User.findByIdAndUpdate(req.user._id, { $inc: { aiUsage: 1 } });
        }

        const prompt = buildPrompt({
            problemTitle,
            problemDescription,
            userCode,
            language,
            userQuestion,
            isPro: req.user.isPro
        });

        let answer;
        try {
            answer = await generateKimiResponse(prompt);
        } catch (apiError) {
            // ↩️ Refund credit/stat if the AI fails
            await User.findByIdAndUpdate(req.user._id, { $inc: { aiUsage: -1 } });
            throw apiError;
        }

        res.json({ answer });

    } catch (err) {
        console.error("AI Route Error:", err);
        res.status(500).json({ message: "AI failed to generate response." });
    }
});

module.exports = router;
