const express = require('express');
const router = express.Router();
const User = require('../models/User');
const redis = require('../config/redis');
const cacheMiddleware = require('../middleware/cache');

// Sync User (Create if not exists)
// Check Username Availability
router.get('/check-username/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const user = await User.findOne({ username: username.toLowerCase() });
        res.json({ available: !user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/sync', async (req, res) => {
    const { uid, email, displayName, photoURL } = req.body;

    if (!uid || !email) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        let user = await User.findOne({ uid });

        // Check if new user and registrations are allowed
        if (!user) {
            const PlatformSettings = require('../models/PlatformSettings');
            const settings = await PlatformSettings.findById('PLATFORM_SETTINGS');
            if (settings && settings.allowRegistrations === false) {
                return res.status(403).json({ error: "Registrations are currently closed by the administrator." });
            }
        }

        if (!user) {
            user = new User({
                uid,
                email,
                username: (displayName || email.split('@')[0]).toLowerCase().replace(/[^a-z0-9]/g, ''), // Default username sanitized
                displayName: displayName || "", // Save displayName
                photoURL: photoURL || "",
                isPro: false,
                stats: {
                    streak: 0,
                    solvedProblems: 0,
                    solvedProblemIds: [],
                    totalProblems: 150,
                    timeSpent: "0h 0m",
                    globalRank: 0
                }
            });
            await user.save();
        } else {
            // Update displayName and photoURL on sync if provided
            if (displayName || photoURL) {
                user.displayName = displayName || user.displayName;
                user.photoURL = photoURL || user.photoURL;
                await user.save();
            }
        }

        if (user) {
            // Invalidate cache
            await redis.del(`cache:/api/users/${uid}`);
            if (user.username) {
                await redis.del(`cache:/api/users/handle/${user.username}`);
            }
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Helper to calculate streak dynamically from history
const calculateStreak = (history) => {
    if (!history || history.length === 0) return 0;

    // Get unique normalized dates (Midnight timestamp)
    const uniqueDays = new Set();
    history.forEach(sub => {
        const d = new Date(sub.submittedAt);
        d.setHours(0, 0, 0, 0); // Normalize to midnight
        uniqueDays.add(d.getTime());
    });

    const sortedDays = Array.from(uniqueDays).sort((a, b) => b - a); // Descending (Newest first)

    if (sortedDays.length === 0) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTime = today.getTime();

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayTime = yesterday.getTime();

    const lastActiveDay = sortedDays[0];

    // If last active day is older than yesterday, streak is broken
    if (lastActiveDay < yesterdayTime) {
        return 0;
    }

    let streak = 0;
    let currentCheck = lastActiveDay;

    // Count consecutive days backward
    for (let day of sortedDays) {
        if (day === currentCheck) {
            streak++;
            // Move expectation to previous day
            const prev = new Date(currentCheck);
            prev.setDate(prev.getDate() - 1);
            currentCheck = prev.getTime();
        } else {
            // Gap found
            break;
        }
    }

    return streak;
};

// Get User by Username (Handle)
router.get('/handle/:username', cacheMiddleware(60), async (req, res) => {
    try {
        const handle = req.params.username.toLowerCase();

        // 1. Try finding by explicit username (Case Insensitive)
        let user = await User.findOne({
            username: { $regex: new RegExp(`^${handle}$`, 'i') }
        });

        // 2. Fallback: Try finding by Email Prefix (for legacy users)
        // Only works if handle matches the sanitized email prefix logic roughly, or exact prefix
        if (!user) {
            user = await User.findOne({
                email: { $regex: new RegExp(`^${handle}@`, 'i') }
            });

            // If found via email fallback and has no username, claim it
            if (user && !user.username) {
                user.username = handle;
                try {
                    await user.save();
                } catch (e) {
                    // Ignore save errors (collisions etc), just return user
                }
            }
        }

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Recalculate Streak Dynamically
        const dynamicStreak = calculateStreak(user.submissionHistory);
        if (user.stats.streak !== dynamicStreak) {
            user.stats.streak = dynamicStreak;
            await user.save();
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get User Status (by UID)
router.get('/:uid', cacheMiddleware(2), async (req, res) => {
    try {
        const user = await User.findOne({ uid: req.params.uid });
        if (!user) {
            // If user doesn't exist in MongoDB yet, return default free user structure
            return res.json({
                isPro: false,
                stats: {
                    streak: 0,
                    solvedProblems: 0,
                    solvedProblemIds: [],
                    totalProblems: 150,
                    timeSpent: "0h 0m",
                    globalRank: 0,
                    lastSolvedDate: null,
                    runCredits: 3,
                    submissionCredits: 3
                }
            });
        }

        // Backfill username if missing
        if (!user.username) {
            const baseName = (user.displayName || user.email.split('@')[0]).toLowerCase().replace(/[^a-z0-9]/g, '');
            user.username = baseName;
            try {
                await user.save();
            } catch (e) {
                // If duplicate, append random string
                user.username = baseName + Math.floor(Math.random() * 1000);
                await user.save().catch(() => { });
            }
        }

        // Recalculate Streak Dynamically to ensure consistency
        const dynamicStreak = calculateStreak(user.submissionHistory);

        // Update if different
        if (user.stats.streak !== dynamicStreak) {
            user.stats.streak = dynamicStreak;
            await user.save();
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Complete Profile (Set Username)
router.post('/complete-profile', async (req, res) => {
    try {
        const { uid, username } = req.body;

        if (!uid || !username) {
            return res.status(400).json({ error: "Missing uid or username" });
        }

        const sanitizedUsername = username.toLowerCase().trim();

        // 1. Check if username exists (globally)
        const existingUser = await User.findOne({ username: sanitizedUsername });
        if (existingUser && existingUser.uid !== uid) {
            return res.status(400).json({ error: "Username is already taken" });
        }

        // 2. Update User
        const user = await User.findOneAndUpdate(
            { uid },
            {
                $set: {
                    username: sanitizedUsername,
                    profileCompleted: true,
                    updatedAt: new Date()
                }
            },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Invalidate cache
        await redis.del(`cache:/api/users/${uid}`);

        res.json({ success: true, user });
    } catch (error) {
        console.error("Complete profile error:", error);
        res.status(500).json({ error: error.message });
    }
});

// Update User Profile
router.put('/:uid', async (req, res) => {
    try {
        const { college, portfolio, github, linkedin, leetcode, codeforces, skills, email, photoURL, displayName, role } = req.body;

        console.log(`Updating profile for UID: ${req.params.uid}`);

        const updatedUser = await User.findOneAndUpdate(
            { uid: req.params.uid },
            {
                $set: {
                    ...(email && { email }), // Only update email if provided
                    ...(photoURL && { photoURL }),
                    ...(role && role !== 'admin' && { role }), // Allow role update but prevent setting 'admin'
                    displayName: displayName || req.body.displayName,
                    college,
                    portfolio,
                    github,
                    linkedin,
                    leetcode,
                    codeforces,
                    skills,
                    updatedAt: new Date()
                },
                $setOnInsert: {
                    isPro: false,
                    profileCompleted: false, // Default if creating new
                    stats: {
                        streak: 0,
                        solvedProblems: 0,
                        solvedProblemIds: [],
                        totalProblems: 150,
                        timeSpent: "0h 0m",
                        globalRank: 0
                    }
                }
            },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ error: "User not found" });
        }

        // Invalidate cache
        await redis.del(`cache:/api/users/${req.params.uid}`);
        if (updatedUser.username) {
            await redis.del(`cache:/api/users/handle/${updatedUser.username}`);
        }

        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update User Time Spent
router.post('/update-time', async (req, res) => {
    const { uid, minutes } = req.body;

    if (!uid || !minutes) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        const user = await User.findOne({ uid });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Initialize totalMinutes if it doesn't exist
        if (typeof user.stats.totalMinutes !== 'number') {
            user.stats.totalMinutes = 0;
            // Try to parse existing string fallback (optional, but good for migration)
            // Assuming "Xh Ym" format
            const match = user.stats.timeSpent.match(/(\d+)h (\d+)m/);
            if (match) {
                user.stats.totalMinutes = parseInt(match[1]) * 60 + parseInt(match[2]);
            }
        }

        // Add new minutes
        user.stats.totalMinutes += parseInt(minutes);

        // Format to "Xh Ym"
        const h = Math.floor(user.stats.totalMinutes / 60);
        const m = user.stats.totalMinutes % 60;
        user.stats.timeSpent = `${h}h ${m}m`;

        await user.save();

        await user.save();

        await redis.del(`cache:/api/users/${uid}`);

        res.json({ success: true, timeSpent: user.stats.timeSpent });
    } catch (error) {
        console.error("Time update error:", error);
        res.status(500).json({ error: error.message });
    }
});

// Update User Preferences (Settings)
router.put('/preferences/:uid', async (req, res) => {
    try {
        const { preferences } = req.body;
        console.log(`Updating preferences for UID: ${req.params.uid}`, preferences);

        const user = await User.findOne({ uid: req.params.uid });
        if (!user) return res.status(404).json({ error: "User not found" });

        // Deep merge logic (or simple overwrite if structure matches)
        user.preferences = { ...user.preferences, ...preferences };

        // Ensure notifications object is merged correctly 
        if (preferences.notifications) {
            user.preferences.notifications = {
                ...user.preferences.notifications,
                ...preferences.notifications
            };
        }

        await user.save();

        await redis.del(`cache:/api/users/${req.params.uid}`);

        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update User Roadmap State
router.put('/roadmap/:uid', async (req, res) => {
    try {
        const { roadmap } = req.body;
        if (!roadmap) {
            return res.status(400).json({ error: "Missing roadmap data" });
        }

        console.log(`Saving roadmap for UID: ${req.params.uid}`);

        const user = await User.findOne({ uid: req.params.uid });
        if (!user) return res.status(404).json({ error: "User not found" });

        user.dsaRoadmap = roadmap;
        user.markModified('dsaRoadmap'); // Ensure mixed type changes are detected
        await user.save();

        await redis.del(`cache:/api/users/${req.params.uid}`);

        res.json({ success: true, roadmap: user.dsaRoadmap });
    } catch (err) {
        console.error("Roadmap save error:", err);
        res.status(500).json({ error: err.message });
    }
});

// Delete User
router.delete('/:uid', async (req, res) => {
    try {
        const result = await User.deleteOne({ uid: req.params.uid });
        if (result.deletedCount === 0) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Next Task (Topic Recommendation)
router.get('/next-task/:uid', async (req, res) => {
    try {
        const user = await User.findOne({ uid: req.params.uid });
        if (!user) return res.status(404).json({ error: "User not found" });

        const Problem = require('../models/Problem');

        const TOPIC_ORDER = [
            'patterns', 'beginner', 'sorting', 'arrays', 'strings', 'hashing',
            'binary-search', 'linked-list', 'stack-queue', 'recursion-backtracking',
            'greedy', 'heaps', 'trees', 'graphs', 'dynamic-programming'
        ];

        const TOPIC_NAMES = {
            'patterns': 'Patterns', 'beginner': 'Beginner', 'sorting': 'Sorting',
            'arrays': 'Arrays', 'strings': 'Strings', 'hashing': 'Hashing',
            'binary-search': 'Binary Search', 'linked-list': 'Linked List',
            'stack-queue': 'Stack & Queue', 'recursion-backtracking': 'Recursion & Backtracking',
            'greedy': 'Greedy', 'heaps': 'Heaps', 'trees': 'Trees', 'graphs': 'Graphs',
            'dynamic-programming': 'Dynamic Programming'
        };

        const getMatcher = (id) => {
            switch (id) {
                case 'patterns': return /pattern/i;
                case 'beginner': return /beginner/i;
                case 'sorting': return /sort/i;
                case 'arrays': return /array/i;
                case 'strings': return /string/i;
                case 'hashing': return /hash/i;
                case 'binary-search': return /binary\s*search/i;
                case 'linked-list': return /linked\s*list/i;
                case 'stack-queue': return /stack|queue/i;
                case 'recursion-backtracking': return /recursion|backtracking/i;
                case 'greedy': return /greedy/i;
                case 'heaps': return /heap|priority\s*queue/i;
                case 'trees': return /tree/i;
                case 'graphs': return /graph/i;
                case 'dynamic-programming': return /dynamic\s*programming|dp/i;
                default: return new RegExp(id.replace('-', '.*'), 'i');
            }
        };

        let currentTopicId = 'patterns';

        // 1. Detect Last Active Topic
        if (user.submissionHistory && user.submissionHistory.length > 0) {
            const lastSubmission = user.submissionHistory
                .filter(s => s.verdict === 'Accepted')
                .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))[0];

            if (lastSubmission) {
                const lastProblem = await Problem.findById(lastSubmission.problemId);
                if (lastProblem && lastProblem.topic) {
                    const foundId = TOPIC_ORDER.find(id => getMatcher(id).test(lastProblem.topic));
                    if (foundId) currentTopicId = foundId;
                }
            }
        }

        // 2. Find Next Unfinished Topic
        // Robust Solved Set
        const solvedSet = new Set();
        if (user.solvedProblemIds) user.solvedProblemIds.forEach(id => solvedSet.add(id.toString()));
        if (user.submissionHistory) user.submissionHistory.forEach(s => {
            if (s.verdict === 'Accepted' && s.problemId) solvedSet.add(s.problemId.toString());
        });

        let finalStats = { solved: 0, total: 0, id: currentTopicId };
        let startIdx = TOPIC_ORDER.indexOf(currentTopicId);
        if (startIdx === -1) startIdx = 0;

        for (let i = startIdx; i < TOPIC_ORDER.length; i++) {
            const id = TOPIC_ORDER[i];
            const matcher = getMatcher(id);
            const topicProblems = await Problem.find({ topic: matcher }).select('_id');

            const total = topicProblems.length;
            const solved = topicProblems.filter(p => solvedSet.has(p._id.toString())).length;

            finalStats = { total, solved, id };

            // If incomplete (and has problems), stop here. This is the recommendation.
            if (solved < total && total > 0) break;

            // If completed, loop continues to next topic
        }

        const progress = finalStats.total > 0 ? Math.round((finalStats.solved / finalStats.total) * 100) : 0;

        res.json({
            topic: TOPIC_NAMES[finalStats.id] || finalStats.id,
            slug: finalStats.id,
            solvedCount: finalStats.solved,
            totalProblems: finalStats.total,
            progress
        });

    } catch (error) {
        console.error("Next task error:", error);
        res.status(500).json({ error: error.message });
    }
});

// Get Topic Progress for Sidebar
router.get('/topic-progress/:uid', async (req, res) => {
    try {
        const user = await User.findOne({ uid: req.params.uid });
        if (!user) return res.status(404).json({ error: "User not found" });

        const Problem = require('../models/Problem');

        // Fetch all problems
        const problems = await Problem.find({}, 'topic _id');

        const SIDEBAR_TOPICS = [
            'patterns', 'beginner', 'sorting', 'arrays', 'strings', 'hashing',
            'binary-search', 'linked-list', 'stack-queue', 'recursion-backtracking',
            'greedy', 'heaps', 'trees', 'graphs', 'dynamic-programming'
        ];

        // Initialize stats
        const stats = {};
        SIDEBAR_TOPICS.forEach(id => stats[id] = { total: 0, solved: 0 });

        // Helper to get regex matcher for a topic ID
        const getMatcher = (id) => {
            switch (id) {
                case 'patterns': return /pattern/i;
                case 'beginner': return /beginner/i;
                case 'sorting': return /sort/i;
                case 'arrays': return /array/i;
                case 'strings': return /string/i;
                case 'hashing': return /hash/i;
                case 'binary-search': return /binary\s*search/i;
                case 'linked-list': return /linked\s*list/i;
                case 'stack-queue': return /stack|queue/i;
                case 'recursion-backtracking': return /recursion|backtracking/i;
                case 'greedy': return /greedy/i;
                case 'heaps': return /heap|priority\s*queue/i;
                case 'trees': return /tree/i;
                case 'graphs': return /graph/i;
                case 'dynamic-programming': return /dynamic\s*programming|dp/i;
                default: return new RegExp(id.replace('-', '.*'), 'i');
            }
        };

        // Calculate stats
        const solvedIds = new Set();

        // Add from optimized array
        if (user.solvedProblemIds) {
            user.solvedProblemIds.forEach(id => solvedIds.add(id.toString()));
        }

        // Add from history (fallback/robustness)
        if (user.submissionHistory) {
            user.submissionHistory.forEach(s => {
                if (s.verdict === 'Accepted' && s.problemId) {
                    solvedIds.add(s.problemId.toString());
                }
            });
        }

        SIDEBAR_TOPICS.forEach(id => {
            const matcher = getMatcher(id);
            problems.forEach(p => {
                // Check if problem.topic matches the regex
                // Note: user might be asking why "Linked List" problems (stored as 'linked-lists' in DB?) are not matching
                // The regex /linked\s*list/i should match "Linked List" or "linked-lists".
                if (p.topic && matcher.test(p.topic)) {
                    stats[id].total++;
                    if (solvedIds.has(p._id.toString())) {
                        stats[id].solved++;
                    }
                }
            });
        });

        res.json(stats);

    } catch (error) {
        console.error("Topic progress error:", error);
        res.status(500).json({ error: error.message });
    }
});

// Get Weekly Leaderboard
router.get('/leaderboard/weekly', cacheMiddleware(300), async (req, res) => {
    try {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const leaderboard = await User.aggregate([
            // Optimization: Filter users who have at least one recent submission
            {
                $match: {
                    "submissionHistory.submittedAt": { $gte: oneWeekAgo }
                }
            },
            { $unwind: "$submissionHistory" },
            // Filter specific submissions
            {
                $match: {
                    "submissionHistory.verdict": "Accepted",
                    "submissionHistory.submittedAt": { $gte: oneWeekAgo }
                }
            },
            // Group by User
            {
                $group: {
                    _id: "$uid",
                    username: { $first: "$username" },
                    displayName: { $first: "$displayName" },
                    photoURL: { $first: "$photoURL" },
                    email: { $first: "$email" },
                    weeklySolvedProblems: { $addToSet: "$submissionHistory.problemId" },
                    earliestSolveTime: { $min: "$submissionHistory.submittedAt" }
                }
            },
            // Project
            {
                $project: {
                    uid: "$_id",
                    username: 1,
                    displayName: 1,
                    photoURL: 1,
                    email: 1,
                    weeklySolvedCount: { $size: "$weeklySolvedProblems" },
                    earliestSolveTime: 1
                }
            },
            // Sort
            { $sort: { weeklySolvedCount: -1, earliestSolveTime: 1 } }
        ]);

        res.json(leaderboard);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
