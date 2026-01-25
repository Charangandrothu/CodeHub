const express = require('express');
const router = express.Router();
const User = require('../models/User');

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
