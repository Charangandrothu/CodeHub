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
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get User Status
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
                    solvedProblemIds: [], // Added missing field
                    totalProblems: 150,
                    timeSpent: "0h 0m",
                    globalRank: 0
                }
            });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update User Profile
router.put('/:uid', async (req, res) => {
    try {
        const { role, college, portfolio, github, linkedin, leetcode, codeforces, skills, email } = req.body;

        console.log(`Updating profile for UID: ${req.params.uid}`);

        const updatedUser = await User.findOneAndUpdate(
            { uid: req.params.uid },
            {
                $set: {
                    ...(email && { email }), // Only update email if provided (it should be)
                    role,
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

module.exports = router;
