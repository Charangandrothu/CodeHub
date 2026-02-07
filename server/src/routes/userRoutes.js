const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Sync User (Create if not exists)
router.post('/sync', async (req, res) => {
    const { uid, email, displayName, photoURL } = req.body;

    if (!uid || !email) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        let user = await User.findOne({ uid });

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
router.get('/handle/:username', async (req, res) => {
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
router.get('/:uid', async (req, res) => {
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

// Update User Profile
router.put('/:uid', async (req, res) => {
    try {
        const { role, college, portfolio, github, linkedin, leetcode, codeforces, skills, email, photoURL } = req.body;

        console.log(`Updating profile for UID: ${req.params.uid}`);

        const updatedUser = await User.findOneAndUpdate(
            { uid: req.params.uid },
            {
                $set: {
                    ...(email && { email }), // Only update email if provided (it should be)
                    ...(photoURL && { photoURL }), // Update photoURL if provided
                    role,
                    displayName: req.body.displayName, // Allow updating displayName
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
            { new: true, upsert: true, setDefaultsOnInsert: true } // Create if not exists
        );

        if (!updatedUser) {
            return res.status(404).json({ error: "User not found" });
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
        res.json(user);
    } catch (err) {
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

module.exports = router;
