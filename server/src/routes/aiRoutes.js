const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { checkCooldown, checkProRateLimit, routeAIRequest, getHealthyProviders } = require('../services/aiRouter');
const { PROVIDER_CONFIG, getAvailableProviders } = require('../services/providers');

// ─── Auth Middleware ───
const verifyUser = async (req, res, next) => {
    try {
        const { userId } = req.body;
        if (!userId) return res.status(401).json({ message: "Unauthorized: Missing userId" });

        const user = await User.findOne({ uid: userId });
        if (!user) return res.status(404).json({ message: "User not found" });

        req.user = user;
        next();
    } catch (err) {
        console.error("Auth Error:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// ─── System Prompt Builder ───
function buildSystemPrompt(isPro) {
    return `You are the AI coding assistant inside CodeHubX — a premium competitive programming platform.

RULES:
- Be concise and precise. No filler text.
- If greeting → respond briefly and warmly.
- If debugging → analyze only the relevant code section, explain the bug, suggest the fix.
- If asking for a hint → give a conceptual approach without full code.
- If asking for full solution → provide clean, commented code block only.
- If asking about time/space complexity → analyze clearly with Big-O notation.
- Use markdown code blocks with language tags for any code.
- Keep responses under 300 words unless user asks for detail.

ACCESS LEVEL: ${isPro ? "PRO (full access, detailed analysis)" : "FREE (concise responses)"}`;
}

// ─── User Prompt Builder ───
function buildUserPrompt(data) {
    const { problemTitle, problemDescription, userCode, language, userQuestion } = data;
    const shortDesc = problemDescription?.length > 500 ? problemDescription.substring(0, 500) + "..." : (problemDescription || "");
    const shortCode = userCode?.length > 1500 ? userCode.substring(0, 1500) + "..." : (userCode || "");

    return `Problem: ${problemTitle}
Description: ${shortDesc}
Language: ${language}
User Code:
\`\`\`${language}
${shortCode}
\`\`\`
Question: ${userQuestion}`;
}

// ─── Quick Response for Casual Queries ───
function getQuickResponse(question) {
    const q = question.trim().toLowerCase();
    if (q.length < 10 && ['hi', 'hello', 'hii', 'hey'].includes(q)) {
        return "Hello 👋 How can I help you with this problem?";
    }
    if (q.length < 15 && q.includes('help')) {
        return "I'm here to help! Ask me about your approach, debug your code, or request hints for the problem.";
    }
    return null;
}

// ─── GET /api/ai/providers — Available providers list with health ───
router.get('/providers', async (req, res) => {
    try {
        const available = getAvailableProviders();
        const healthStatuses = await getHealthyProviders();
        const healthMap = {};
        healthStatuses.forEach(h => { healthMap[h.id] = h.healthy; });

        const providers = available.map(key => ({
            id: key,
            name: PROVIDER_CONFIG[key].name,
            model: PROVIDER_CONFIG[key].model,
            healthy: healthMap[key] !== false
        }));
        res.json({ providers });
    } catch (err) {
        console.error('Provider list error:', err);
        res.status(500).json({ providers: [] });
    }
});

// ─── GET /api/ai/usage — User's AI usage info ───
router.get('/usage/:uid', async (req, res) => {
    try {
        const user = await User.findOne({ uid: req.params.uid });
        if (!user) return res.status(404).json({ message: "User not found" });

        // Reset daily counter for free users if new day
        const now = new Date();
        const lastReset = user.lastAiResetDate ? new Date(user.lastAiResetDate) : new Date(0);
        const isNewDay = now.toDateString() !== lastReset.toDateString();

        if (isNewDay && !user.isPro) {
            user.aiUsage = 0;
            user.lastAiResetDate = now;
            await user.save();
        }

        res.json({
            isPro: user.isPro,
            aiUsage: user.aiUsage,
            maxUsage: user.isPro ? null : 3, // null = unlimited (rate-limited instead)
            plan: user.isPro ? 'PRO' : 'FREE'
        });
    } catch (err) {
        console.error("Usage fetch error:", err);
        res.status(500).json({ message: "Failed to fetch usage" });
    }
});

// ─── POST /api/ai/chat — Main AI Chat Endpoint ───
router.post('/chat', verifyUser, async (req, res) => {
    try {
        const {
            problemTitle, problemDescription, userCode,
            language, userQuestion, selectedProvider
        } = req.body;

        if (!userQuestion?.trim()) {
            return res.status(400).json({ message: "Message cannot be empty" });
        }

        // Quick response for greetings (no credits used)
        const quick = getQuickResponse(userQuestion);
        if (quick) return res.json({ answer: quick, provider: selectedProvider || 'nvidia' });

        // ── 1. Cooldown check (3s between requests) ──
        const cooldown = await checkCooldown(req.user.uid);
        if (!cooldown.allowed) {
            return res.status(429).json({
                message: `Please wait ${cooldown.retryAfter}s between requests.`,
                retryAfter: cooldown.retryAfter,
                type: 'cooldown'
            });
        }

        // ── 2. Rate limit check ──
        const now = new Date();
        const lastReset = req.user.lastAiResetDate ? new Date(req.user.lastAiResetDate) : new Date(0);
        const isNewDay = now.toDateString() !== lastReset.toDateString();

        if (!req.user.isPro) {
            // Free user: 3 total per day
            if (isNewDay) {
                req.user.aiUsage = 0;
                req.user.lastAiResetDate = now;
                await req.user.save();
            }

            if (req.user.aiUsage >= 3) {
                return res.status(403).json({
                    message: "Daily AI limit reached. Upgrade to Pro for unlimited access.",
                    type: 'limit'
                });
            }
        } else {
            // Pro user: 5 per 5 min sliding window
            const rateCheck = await checkProRateLimit(req.user.uid);
            if (!rateCheck.allowed) {
                return res.status(429).json({
                    message: `Pro rate limit reached. Try again in ${rateCheck.retryAfter}s.`,
                    retryAfter: rateCheck.retryAfter,
                    remaining: 0,
                    type: 'rate_limit'
                });
            }
        }

        // ── 3. Atomically increment usage for free users ──
        if (!req.user.isPro) {
            const updated = await User.findOneAndUpdate(
                { _id: req.user._id, aiUsage: { $lt: 3 } },
                { $inc: { aiUsage: 1 } },
                { new: true }
            );
            if (!updated) {
                return res.status(403).json({
                    message: "Daily AI limit reached. Upgrade to Pro.",
                    type: 'limit'
                });
            }
        } else {
            await User.findByIdAndUpdate(req.user._id, { $inc: { aiUsage: 1 } });
        }

        // ── 4. Build prompts ──
        const systemPrompt = buildSystemPrompt(req.user.isPro);
        const userPrompt = buildUserPrompt({
            problemTitle, problemDescription, userCode, language, userQuestion
        });

        // ── 5. Route to provider with fallback ──
        const provider = selectedProvider && PROVIDER_CONFIG[selectedProvider]
            ? selectedProvider
            : 'nvidia'; // default

        try {
            const result = await routeAIRequest(provider, systemPrompt, userPrompt);

            res.json({
                answer: result.response,
                provider: result.provider,
                remaining: req.user.isPro ? undefined : Math.max(0, 2 - (req.user.aiUsage || 0))
            });
        } catch (aiErr) {
            // Refund credit on failure
            await User.findByIdAndUpdate(req.user._id, { $inc: { aiUsage: -1 } });

            if (aiErr.message === 'ALL_PROVIDERS_BUSY') {
                return res.status(503).json({
                    message: "All AI providers are currently busy. Please try again in a moment.",
                    type: 'providers_busy'
                });
            }
            throw aiErr;
        }

    } catch (err) {
        console.error("[AI Chat Error]:", err);
        res.status(500).json({ message: "AI failed to generate response." });
    }
});

// ─── Legacy endpoint redirect (backward compatibility) ───
router.post('/problem-help', verifyUser, async (req, res) => {
    // Forward to new /chat endpoint logic
    req.body.selectedProvider = 'nvidia';
    req.body.userQuestion = req.body.userQuestion || req.body.message;

    // Re-use the chat handler by calling the route
    const chatHandler = router.stack.find(r => r.route?.path === '/chat');
    if (chatHandler) {
        return chatHandler.route.stack[1].handle(req, res);
    }
    res.status(500).json({ message: "Route forwarding failed" });
});

module.exports = router;
