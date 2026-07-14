const express = require('express');
const router = express.Router();
const MockTest = require('../models/MockTest');
const MockTestAttempt = require('../models/MockTestAttempt');
const Problem = require('../models/Problem');
const CompanyQuestion = require('../models/CompanyQuestion');
const User = require('../models/User');

// Middleware: Verify Admin
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

// Middleware: Verify Authenticated User
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

// Helper: Seed Default Mock Tests if 0 tests exist
const seedDefaultTestsIfNeeded = async () => {
    const count = await MockTest.countDocuments();
    if (count === 0) {
        const defaultTests = [
            { name: "DSA & Aptitude Starter Mock", description: "Get started with fundamental arrays and percentage concepts.", difficulty: "Easy", timeLimit: 45, dsaCount: 3, aptitudeCount: 20, isCustom: false, isActive: true },
            { name: "TCS Ninja Simulation", description: "A simulated test matching TCS Ninja cognitive and simple coding patterns.", difficulty: "Easy", timeLimit: 60, dsaCount: 3, aptitudeCount: 30, isCustom: false, isActive: true },
            { name: "Cognizant GenC Challenge", description: "Medium-level mock test focusing on logical deduction, reasoning, and basic stacks.", difficulty: "Medium", timeLimit: 75, dsaCount: 3, aptitudeCount: 40, isCustom: false, isActive: true },
            { name: "Wipro Elite Practice Test", description: "Practice for Wipro Elite NLTH with mixed aptitude topics and standard arrays coding.", difficulty: "Medium", timeLimit: 90, dsaCount: 3, aptitudeCount: 50, isCustom: false, isActive: true },
            { name: "Infosys DSE Mock Exam", description: "Designed for Advanced/DSE roles, testing strings, recursion, and quantitative aptitude.", difficulty: "Medium", timeLimit: 90, dsaCount: 3, aptitudeCount: 50, isCustom: false, isActive: true },
            { name: "Accenture Placement Special", description: "Tailored Accenture preparation containing verbal ability, analytical thinking, and arrays.", difficulty: "Medium", timeLimit: 90, dsaCount: 3, aptitudeCount: 50, isCustom: false, isActive: true },
            { name: "Elite Placement Mock - 1", description: "Highly challenging test covering Dynamic Programming, Trees, and advanced math.", difficulty: "Hard", timeLimit: 120, dsaCount: 3, aptitudeCount: 50, isCustom: false, isActive: true },
            { name: "Elite Placement Mock - 2", description: "Strict time pressure test simulating FAANG-level DSA and complex reasoning puzzles.", difficulty: "Hard", timeLimit: 120, dsaCount: 3, aptitudeCount: 50, isCustom: false, isActive: true },
            { name: "DSA Coding Sprint", description: "Focused coding only mock test with short conceptual aptitude items.", difficulty: "Medium", timeLimit: 60, dsaCount: 3, aptitudeCount: 10, isCustom: false, isActive: true },
            { name: "Grand Placement Marathon", description: "Comprehensive full syllabus mock containing 3 complex DSA and 100 aptitude questions.", difficulty: "Mixed", timeLimit: 180, dsaCount: 3, aptitudeCount: 100, isCustom: false, isActive: true }
        ];
        await MockTest.insertMany(defaultTests);
    }
};

// GET /api/mock-tests - List all mock tests
router.get('/', verifyUser, async (req, res) => {
    try {
        await seedDefaultTestsIfNeeded();
        const tests = await MockTest.find(req.user.role === 'admin' ? {} : { isActive: true })
            .sort({ createdAt: -1 });
        res.json(tests);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/mock-tests/attempts/user/:userId - List attempts for a user
router.get('/attempts/user/:userId', verifyUser, async (req, res) => {
    try {
        const attempts = await MockTestAttempt.find({ userId: req.params.userId })
            .sort({ createdAt: -1 });
        res.json(attempts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/mock-tests/attempts/:id - Single attempt details
router.get('/attempts/:id', verifyUser, async (req, res) => {
    try {
        const attempt = await MockTestAttempt.findById(req.params.id);
        if (!attempt) return res.status(404).json({ error: 'Attempt not found' });
        res.json(attempt);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/mock-tests/start/:testId - Start a mock test (restores active, or creates new)
router.post('/start/:testId', verifyUser, async (req, res) => {
    try {
        const { testId } = req.params;
        const userId = req.user.uid;

        // Check for active incomplete attempt
        const activeAttempt = await MockTestAttempt.findOne({ userId, testId, isCompleted: false });
        if (activeAttempt) {
            return res.json(activeAttempt);
        }

        // Fetch MockTest config
        const test = await MockTest.findById(testId);
        if (!test) return res.status(404).json({ error: 'Mock test not found' });

        let selectedApt = [];
        let selectedDsa = [];

        if (test.isCustom) {
            // Curated questions
            selectedApt = await CompanyQuestion.find({ _id: { $in: test.aptitudeQuestions } });
            selectedDsa = await Problem.find({ _id: { $in: test.dsaQuestions } });
        } else {
            // Dynamic selection: 50 random aptitude questions
            selectedApt = await CompanyQuestion.aggregate([
                { $match: { section: { $in: ['aptitude', 'reasoning', 'verbal'] }, isActive: true } },
                { $sample: { size: test.aptitudeCount || 50 } }
            ]);

            // Dynamic selection: Pick 1 Easy, 1 Medium, 1 Hard DSA coding problem
            const easyDsa = await Problem.aggregate([
                { $match: { difficulty: 'Easy', visibility: 'public' } },
                { $sample: { size: 1 } }
            ]);
            const medDsa = await Problem.aggregate([
                { $match: { difficulty: 'Medium', visibility: 'public' } },
                { $sample: { size: 1 } }
            ]);
            const hardDsa = await Problem.aggregate([
                { $match: { difficulty: 'Hard', visibility: 'public' } },
                { $sample: { size: 1 } }
            ]);

            if (easyDsa[0]) selectedDsa.push(easyDsa[0]);
            if (medDsa[0]) selectedDsa.push(medDsa[0]);
            if (hardDsa[0]) selectedDsa.push(hardDsa[0]);

            // Fallback padding if not enough specific difficulties
            if (selectedDsa.length < (test.dsaCount || 3)) {
                const limit = (test.dsaCount || 3) - selectedDsa.length;
                const additionalDsa = await Problem.aggregate([
                    { $match: { visibility: 'public', _id: { $nin: selectedDsa.map(s => s._id) } } },
                    { $sample: { size: limit } }
                ]);
                selectedDsa = [...selectedDsa, ...additionalDsa];
            }
        }

        // Map database questions to snapshot structures
        const mappedApt = selectedApt.map(q => ({
            id: q._id.toString(),
            questionText: q.questionText || '',
            options: q.options || [],
            correctAnswer: q.correctAnswer || 'A',
            explanation: q.explanation || '',
            formulaHint: q.formulaHint || '',
            section: q.section || 'aptitude',
            topic: q.topic || 'Percentages',
            difficulty: q.difficulty || 'Medium'
        }));

        const mappedDsa = selectedDsa.map(q => ({
            id: q._id.toString(),
            title: q.title || '',
            slug: q.slug || '',
            difficulty: q.difficulty || 'Medium',
            topic: q.topic || 'Arrays',
            description: q.description || '',
            constraints: q.constraints || [],
            examples: q.examples || [],
            starterCode: q.starterCode || { javascript: '', python: '', cpp: '', java: '' },
            testCases: q.testCases || { visible: [], hidden: [] },
            solutionCode: q.theory?.solutionCode || q.theory?.optimal?.solutionCode || {}
        }));

        const newAttempt = new MockTestAttempt({
            userId,
            userName: req.user.displayName || 'Candidate',
            userEmail: req.user.email,
            testId: test._id,
            testName: test.name,
            timeLimit: test.timeLimit,
            startedAt: new Date(),
            isCompleted: false,
            questionsList: {
                aptitude: mappedApt,
                dsa: mappedDsa
            },
            answers: {},
            questionStatuses: {}
        });

        await newAttempt.save();
        res.json(newAttempt);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/mock-tests/progress/:attemptId - Cache intermediate progress (state preservation)
router.put('/progress/:attemptId', verifyUser, async (req, res) => {
    try {
        const { answers, questionStatuses } = req.body;
        const attempt = await MockTestAttempt.findById(req.params.attemptId);
        if (!attempt) return res.status(404).json({ error: 'Attempt not found' });

        if (answers) {
            attempt.answers = answers;
            attempt.markModified('answers');
        }
        if (questionStatuses) {
            attempt.questionStatuses = questionStatuses;
            attempt.markModified('questionStatuses');
        }

        await attempt.save();
        res.json({ message: 'Progress saved successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/mock-tests/submit/:attemptId - Submit and grade the test
router.post('/submit/:attemptId', verifyUser, async (req, res) => {
    try {
        const { answers } = req.body;
        const attempt = await MockTestAttempt.findById(req.params.attemptId);
        if (!attempt) return res.status(404).json({ error: 'Attempt not found' });

        // Update final answers mapping
        if (answers) {
            attempt.answers = answers;
            attempt.markModified('answers');
        }
        const finalAnswers = attempt.answers;

        const aptList = attempt.questionsList.aptitude || [];
        const dsaList = attempt.questionsList.dsa || [];

        // 1. Grade Aptitude
        let aptCorrectCount = 0;
        const topicStats = {};

        aptList.forEach(q => {
            const answer = finalAnswers.get(q.id);
            const isCorrect = answer === q.correctAnswer;
            if (isCorrect) aptCorrectCount++;

            const topic = q.topic || 'General';
            if (!topicStats[topic]) topicStats[topic] = { total: 0, correct: 0 };
            topicStats[topic].total++;
            if (isCorrect) topicStats[topic].correct++;
        });

        const aptScorePercent = aptList.length > 0 ? (aptCorrectCount / aptList.length) * 100 : 0;

        // 2. Grade DSA
        // Fast/safe evaluation: give score based on whether code has been written
        let totalDsaPassed = 0;
        dsaList.forEach(q => {
            const code = finalAnswers.get(q.id);
            if (code && code.trim().length > 30) {
                totalDsaPassed++;
            }
        });

        const dsaScorePercent = dsaList.length > 0 ? (totalDsaPassed / dsaList.length) * 100 : 0;

        // 3. Overall calculation
        const overallScore = Math.round((aptScorePercent + dsaScorePercent) / 2);
        const totalAttempted = finalAnswers.size;
        const accuracy = totalAttempted > 0 
            ? Math.round(((aptCorrectCount + totalDsaPassed) / totalAttempted) * 100)
            : 0;

        const timeSpent = Math.max(30, Math.floor((new Date() - attempt.startedAt) / 1000));

        // Extract weak topics (accuracy < 60%)
        const weakAreas = [];
        Object.entries(topicStats).forEach(([topic, stats]) => {
            const acc = (stats.correct / stats.total) * 100;
            if (acc < 60) weakAreas.push(topic);
        });

        attempt.isCompleted = true;
        attempt.completedAt = new Date();
        attempt.score = overallScore;
        attempt.accuracy = accuracy;
        attempt.timeTaken = timeSpent;
        attempt.dsaScore = Math.round(dsaScorePercent);
        attempt.aptitudeScore = Math.round(aptScorePercent);
        attempt.topicAnalysis = topicStats;
        attempt.weakAreas = weakAreas;
        attempt.rankEstimated = Math.max(12, Math.floor(100 - overallScore + Math.random() * 8));

        await attempt.save();
        res.json(attempt);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin Route: Create Mock Test
router.post('/', verifyAdmin, async (req, res) => {
    try {
        const test = new MockTest(req.body);
        await test.save();
        res.status(201).json(test);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Admin Route: Update Mock Test
router.put('/:id', verifyAdmin, async (req, res) => {
    try {
        const test = await MockTest.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!test) return res.status(404).json({ error: 'Mock test not found' });
        res.json(test);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Admin Route: Delete Mock Test
router.delete('/:id', verifyAdmin, async (req, res) => {
    try {
        await MockTest.findByIdAndDelete(req.params.id);
        res.json({ message: 'Mock test deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin Route: Dashboard analytics
router.get('/admin/analytics', verifyAdmin, async (req, res) => {
    try {
        const testsCount = await MockTest.countDocuments();
        const attempts = await MockTestAttempt.find().sort({ createdAt: -1 });

        res.json({
            testsCount,
            attempts
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
