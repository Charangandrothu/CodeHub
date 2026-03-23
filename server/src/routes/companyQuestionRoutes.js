const express = require('express');
const router = express.Router();
const CompanyQuestion = require('../models/CompanyQuestion');
const User = require('../models/User');

// ─── Admin guard (same pattern as adminRoutes.js) ──────────────────────────────
const verifyAdmin = async (req, res, next) => {
    const uid = req.headers['x-user-uid'];
    if (!uid) return res.status(401).json({ error: 'Unauthorized' });
    try {
        const user = await User.findOne({ uid });
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ error: 'Forbidden: Admins only' });
        }
        req.admin = user;
        next();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ─── User auth guard (for practice endpoints) ─────────────────────────────────
const verifyUser = async (req, res, next) => {
    const uid = req.headers['x-user-uid'];
    if (!uid) return res.status(401).json({ error: 'Unauthorized' });
    try {
        const user = await User.findOne({ uid });
        if (!user) return res.status(401).json({ error: 'User not found' });
        req.user = user;
        next();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ══════════════════════════════════════════════════════════════════════════════
//  ADMIN ROUTES — all protected by verifyAdmin
// ══════════════════════════════════════════════════════════════════════════════

// GET /api/company-questions/admin
// List all questions with optional filters (company, section, topic, search)
router.get('/admin', verifyAdmin, async (req, res) => {
    try {
        const { company, section, topic, difficulty, search } = req.query;
        const filter = {};
        if (company) filter.company = company;
        if (section) filter.section = section;
        if (topic) filter.topic = topic;
        if (difficulty) filter.difficulty = difficulty;
        if (search) filter.$or = [
            { questionText: { $regex: search, $options: 'i' } },
            { tags: { $in: [new RegExp(search, 'i')] } }
        ];

        const questions = await CompanyQuestion.find(filter)
            .sort({ company: 1, section: 1, topic: 1, order: 1, createdAt: -1 })
            .limit(500);

        res.json(questions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/company-questions/admin/:id  — single question for editing
router.get('/admin/:id', verifyAdmin, async (req, res) => {
    try {
        const q = await CompanyQuestion.findById(req.params.id);
        if (!q) return res.status(404).json({ error: 'Not found' });
        res.json(q);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/company-questions/admin — create
router.post('/admin', verifyAdmin, async (req, res) => {
    try {
        const q = new CompanyQuestion(req.body);
        await q.save();
        res.status(201).json(q);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// PUT /api/company-questions/admin/:id — update
router.put('/admin/:id', verifyAdmin, async (req, res) => {
    try {
        const q = await CompanyQuestion.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!q) return res.status(404).json({ error: 'Not found' });
        res.json(q);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// DELETE /api/company-questions/admin/:id
router.delete('/admin/:id', verifyAdmin, async (req, res) => {
    try {
        await CompanyQuestion.findByIdAndDelete(req.params.id);
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/company-questions/admin/bulk — insert many questions at once
router.post('/admin/bulk', verifyAdmin, async (req, res) => {
    try {
        const { questions } = req.body;

        if (!Array.isArray(questions) || questions.length === 0) {
            return res.status(400).json({ error: '"questions" must be a non-empty array' });
        }
        if (questions.length > 2000) {
            return res.status(400).json({ error: 'Max 2000 questions per bulk upload' });
        }

        // Light validation — flag missing required fields without bailing
        const REQUIRED = ['company', 'section', 'topic', 'difficulty'];
        const errors = [];
        const valid = [];

        questions.forEach((q, i) => {
            const missing = REQUIRED.filter(f => !q[f]);
            if (missing.length) {
                errors.push({ index: i, missing, questionText: q.questionText?.slice(0, 60) });
            } else {
                // Normalise options: accept both array [{key,text}] and object {A:'',B:'',C:'',D:''}
                if (q.options && !Array.isArray(q.options)) {
                    q.options = Object.entries(q.options).map(([key, text]) => ({ key, text }));
                }
                valid.push(q);
            }
        });

        let inserted = [];
        if (valid.length > 0) {
            inserted = await CompanyQuestion.insertMany(valid, { ordered: false });
        }

        res.status(201).json({
            insertedCount: inserted.length,
            skippedCount: errors.length,
            errors: errors.length > 0 ? errors : undefined,
        });
    } catch (err) {
        // MongoDB duplicate key or validation error — still return partial info
        res.status(400).json({ error: err.message });
    }
});

// GET /api/company-questions/admin/stats — counts per company/section for dashboard
router.get('/admin/stats', verifyAdmin, async (req, res) => {
    try {
        const stats = await CompanyQuestion.aggregate([
            { $match: { isActive: true } },
            { $group: { _id: { company: '$company', section: '$section' }, count: { $sum: 1 } } },
            { $sort: { '_id.company': 1, '_id.section': 1 } }
        ]);
        res.json(stats);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ══════════════════════════════════════════════════════════════════════════════
//  USER / PUBLIC ROUTES
// ══════════════════════════════════════════════════════════════════════════════

// GET /api/company-questions/practice/:company/:section/:topic
// Returns unseen questions for this user (filters out already-answered IDs)
// correctAnswer is NEVER sent here — only after submitting
router.get('/practice/:company/:section/:topic', verifyUser, async (req, res) => {
    try {
        const { company, section, topic: topicSlug } = req.params;
        const { page = 1, limit = 10 } = req.query;

        // Convert URL slug back to regex for flexible DB matching
        // Make it robust against "profit-and-loss" vs "profit-loss"
        const topicPattern = topicSlug
            .replace(/(-and-|-)/g, '[\\s\\-&]*(and|&)*[\\s\\-&]*');
        const topicRegex = new RegExp(`^${topicPattern}$`, 'i');

        // Also try exact match first (for simple topics like "percentages")
        const topicFilter = topicSlug.includes('-') ? topicRegex : { $in: [topicSlug, topicRegex] };

        // Get user's answered IDs. Map key pattern: "company.section"
        const mapKey = `${company}.${section}`;
        const answeredIds = req.user.companyPrep?.get?.(mapKey)?.answeredIds || [];

        const filter = {
            company, section, topic: topicFilter,
            isActive: true,
            _id: { $nin: answeredIds }
        };

        const total = await CompanyQuestion.countDocuments(filter);
        const questions = await CompanyQuestion
            .find(filter)
            .sort({ priority: -1, order: 1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .select('-correctAnswer -questions.correctAnswer'); // never leak answer

        // Total questions in topic (including answered)
        const topicTotal = await CompanyQuestion.countDocuments({ company, section, topic: topicFilter, isActive: true });

        res.json({
            questions,
            totalRemaining: total,
            totalAnswered: topicTotal - total,
            totalQuestions: topicTotal,
            progressPercent: topicTotal > 0 ? Math.round(((topicTotal - total) / topicTotal) * 100) : 0,
            currentPage: parseInt(page)
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/company-questions/submit
// User submits an answer. Returns correctness + explanation.
router.post('/submit', verifyUser, async (req, res) => {
    try {
        const { company, section, questionId, selectedAnswer, skipped } = req.body;

        const q = await CompanyQuestion.findById(questionId);
        if (!q) return res.status(404).json({ error: 'Question not found' });

        const mapKey = `${company}.${section}`;
        const existing = req.user.companyPrep?.get?.(mapKey) || {
            answeredIds: [],
            correctIds: [],
            skippedIds: [],
            lastPracticed: null
        };

        let isCorrect = false;

        if (skipped) {
            // Add to skippedIds but NOT answeredIds — will be reshown later
            if (!existing.skippedIds.includes(questionId)) {
                existing.skippedIds.push(questionId);
            }
        } else {
            isCorrect = q.correctAnswer === selectedAnswer;

            // Mark as answered (won't be shown again)
            if (!existing.answeredIds.includes(questionId)) {
                existing.answeredIds.push(questionId);
            }
            if (isCorrect && !existing.correctIds.includes(questionId)) {
                existing.correctIds.push(questionId);
            }
            // Remove from skipped if it was there
            existing.skippedIds = existing.skippedIds.filter(id => id !== questionId);
        }
        existing.lastPracticed = new Date();

        req.user.companyPrep.set(mapKey, existing);
        await req.user.save();

        const response = { skipped: !!skipped };
        if (!skipped) {
            response.isCorrect = isCorrect;
            response.correctAnswer = q.correctAnswer;
            response.explanation = q.explanation;
            response.formulaHint = q.formulaHint;
            response.stats = {
                totalAnswered: existing.answeredIds.length,
                totalCorrect: existing.correctIds.length,
                accuracy: existing.answeredIds.length > 0
                    ? Math.round((existing.correctIds.length / existing.answeredIds.length) * 100)
                    : 0
            };
        }
        res.json(response);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/company-questions/overview/:company
// Returns per-section progress for the current user for a company
router.get('/overview/:company', verifyUser, async (req, res) => {
    try {
        const { company } = req.params;
        const sections = ['aptitude', 'reasoning', 'verbal', 'coding'];
        const result = {};

        for (const section of sections) {
            const mapKey = `${company}.${section}`;
            const progress = req.user.companyPrep?.get?.(mapKey) || { answeredIds: [], correctIds: [] };
            const totalQs = await CompanyQuestion.countDocuments({ company, section, isActive: true });
            const answered = progress.answeredIds.length;
            const correct = progress.correctIds.length;

            result[section] = {
                totalQs,
                answered,
                correct,
                accuracy: answered > 0 ? Math.round((correct / answered) * 100) : 0,
                progressPercent: totalQs > 0 ? Math.round((answered / totalQs) * 100) : 0
            };
        }

        const totalQsAll = Object.values(result).reduce((s, v) => s + v.totalQs, 0);
        const answeredAll = Object.values(result).reduce((s, v) => s + v.answered, 0);

        res.json({
            company,
            sections: result,
            overallProgress: totalQsAll > 0 ? Math.round((answeredAll / totalQsAll) * 100) : 0
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/company-questions/progress/reset
// Resets user's progress for a company (full), company+section, or company+section+topic
router.delete('/progress/reset', verifyUser, async (req, res) => {
    try {
        const { company, section, topic } = req.body;
        if (!company) return res.status(400).json({ error: 'company is required' });

        if (topic && section) {
            // Find all question IDs for this topic
            const mapKey = `${company}.${section}`;
            const topicPattern = topic
                .replace(/(-and-|-)/g, '[\\s\\-&]*(and|&)*[\\s\\-&]*');
            const topicRegex = new RegExp(`^${topicPattern}$`, 'i');
            const topicFilter = topic.includes('-') ? topicRegex : { $in: [topic, topicRegex] };
            
            const topicQs = await CompanyQuestion.find({ company, section, topic: topicFilter }, '_id');
            const topicIdStrings = topicQs.map(q => q._id.toString());
            
            const existing = req.user.companyPrep?.get?.(mapKey);
            if (existing) {
                existing.answeredIds = existing.answeredIds.filter(id => !topicIdStrings.includes(id.toString()));
                existing.correctIds = existing.correctIds.filter(id => !topicIdStrings.includes(id.toString()));
                existing.skippedIds = existing.skippedIds.filter(id => !topicIdStrings.includes(id.toString()));
                
                req.user.companyPrep.set(mapKey, existing);
                await req.user.save();
            }
        } else if (section) {
            // Reset just this section entirely
            const mapKey = `${company}.${section}`;
            req.user.companyPrep.delete(mapKey);
            await req.user.save();
        } else {
            // Reset entire company (all sections)
            const sections = ['aptitude', 'reasoning', 'verbal', 'coding'];
            sections.forEach(s => { req.user.companyPrep.delete(`${company}.${s}`); });
            await req.user.save();
        }
        res.json({ message: 'Progress reset' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
