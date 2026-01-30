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

module.exports = router;
