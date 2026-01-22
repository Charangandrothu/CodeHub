const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Get User Status
router.get('/:uid', async (req, res) => {
    try {
        const user = await User.findOne({ uid: req.params.uid });
        if (!user) {
            // If user doesn't exist in MongoDB yet, they are definitely not Pro
            return res.json({ isPro: false });
        }
        res.json({ isPro: user.isPro });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
