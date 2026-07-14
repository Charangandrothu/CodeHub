const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Referral = require('../models/Referral');
const ReferralReward = require('../models/ReferralReward');
const ReferralLeaderboard = require('../models/ReferralLeaderboard');
const ReferralService = require('../services/referralService');

// User Auth Middleware - reads UID from custom header x-user-uid
const verifyUser = async (req, res, next) => {
    const uid = req.headers['x-user-uid'];
    if (!uid) return res.status(401).json({ error: 'Unauthorized: Missing user header' });
    try {
        const user = await User.findOne({ uid });
        if (!user) return res.status(404).json({ error: 'User not found' });
        req.user = user;
        next();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Admin Auth Middleware
const verifyAdmin = async (req, res, next) => {
    const uid = req.headers['x-user-uid'];
    if (!uid) return res.status(401).json({ error: 'Unauthorized: Missing user header' });
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

// GET /api/referrals/stats - Get user's referral stats
router.get('/stats', verifyUser, async (req, res) => {
    try {
        const user = req.user;

        // Auto-generate referral code if missing (guard/migration case)
        if (!user.referralCode) {
            const baseCode = (user.username || user.displayName || user.email.split('@')[0]).toUpperCase().replace(/[^A-Z0-9]/g, '');
            let referralCode = baseCode || 'USER';
            // Unique check
            const codeExists = await User.exists({ referralCode });
            if (codeExists) {
                referralCode = `${referralCode}${Math.floor(10 + Math.random() * 90)}`;
            }
            user.referralCode = referralCode;
            await user.save();
        }

        const activeCount = await Referral.countDocuments({ referrerId: user.uid, status: 'Active' });
        const pendingCount = await Referral.countDocuments({ referrerId: user.uid, status: 'Pending' });
        const rejectedCount = await Referral.countDocuments({ referrerId: user.uid, status: 'Rejected' });

        const stats = {
            referralCode: user.referralCode,
            totalReferrals: activeCount + pendingCount + rejectedCount,
            activeReferrals: activeCount,
            pendingReferrals: pendingCount,
            rejectedReferrals: rejectedCount,
            xp: user.xp || 0,
            badges: user.badges || [],
            notifications: user.notifications || []
        };

        res.json(stats);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/referrals/history - Get user's referred history
router.get('/history', verifyUser, async (req, res) => {
    try {
        const user = req.user;
        const referrals = await Referral.find({ referrerId: user.uid }).sort({ createdAt: -1 });

        const history = [];
        for (const ref of referrals) {
            // Find the referred user details
            const referredUser = await User.findOne({ uid: ref.referredId }, 'displayName username photoURL');
            history.push({
                _id: ref._id,
                username: referredUser ? referredUser.username : ref.referredUsername || 'user',
                displayName: referredUser ? referredUser.displayName : 'Student',
                photoURL: referredUser ? referredUser.photoURL : null,
                joinedAt: ref.joinedAt,
                status: ref.status,
                problemsSolved: ref.problemsSolved,
                daysActive: ref.daysActive,
                emailVerified: ref.emailVerified,
                profileCompleted: ref.profileCompleted,
                rewardEligible: ref.profileCompleted && ref.daysActive >= 3 && ref.problemsSolved >= 3
            });
        }

        res.json(history);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/referrals/leaderboard - Get monthly top referrers
router.get('/leaderboard', verifyUser, async (req, res) => {
    try {
        const now = new Date();
        const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

        let leaderboard = await ReferralLeaderboard.findOne({ month: currentMonth });

        // If leaderboard snapshot doesn't exist for this month yet, trigger update first
        if (!leaderboard) {
            await ReferralService.updateLeaderboard();
            leaderboard = await ReferralLeaderboard.findOne({ month: currentMonth });
        }

        res.json(leaderboard ? leaderboard.rankings : []);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/referrals/check-status - On-demand evaluation of pending referrals
router.post('/check-status', verifyUser, async (req, res) => {
    try {
        const user = req.user;

        // Find all pending referrals for this referrer
        const pending = await Referral.find({ referrerId: user.uid, status: 'Pending' });

        // Run validation check on each pending referral
        for (const ref of pending) {
            await ReferralService.checkAndUpdateReferrals(ref.referredId);
        }

        // Return updated stats
        const activeCount = await Referral.countDocuments({ referrerId: user.uid, status: 'Active' });
        const pendingCount = await Referral.countDocuments({ referrerId: user.uid, status: 'Pending' });
        const rejectedCount = await Referral.countDocuments({ referrerId: user.uid, status: 'Rejected' });

        res.json({
            success: true,
            stats: {
                totalReferrals: activeCount + pendingCount + rejectedCount,
                activeReferrals: activeCount,
                pendingReferrals: pendingCount,
                rejectedReferrals: rejectedCount
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/referrals/clear-notifications - Mark user notifications as read
router.post('/clear-notifications', verifyUser, async (req, res) => {
    try {
        const user = req.user;
        user.notifications.forEach(n => n.read = true);
        await user.save();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ══════════════════════════════════════════════════════════════════════════════
//  ADMIN ENDPOINTS
// ══════════════════════════════════════════════════════════════════════════════

// GET /api/referrals/admin/analytics - Admin referral stats
router.get('/admin/analytics', verifyAdmin, async (req, res) => {
    try {
        const total = await Referral.countDocuments();
        const active = await Referral.countDocuments({ status: 'Active' });
        const pending = await Referral.countDocuments({ status: 'Pending' });
        const rejected = await Referral.countDocuments({ status: 'Rejected' });

        // Conversion Rate
        const conversionRate = total > 0 ? Math.round((active / total) * 100) : 0;

        // Most successful referrer list
        const referrers = await Referral.aggregate([
            { $group: { _id: "$referrerId", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        const topReferrers = [];
        for (const item of referrers) {
            const user = await User.findOne({ uid: item._id }, 'username displayName email');
            if (user) {
                topReferrers.push({
                    username: user.username,
                    displayName: user.displayName,
                    email: user.email,
                    count: item.count
                });
            }
        }

        res.json({
            total,
            active,
            pending,
            rejected,
            conversionRate,
            topReferrers
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/referrals/admin/list - Admin paginated list
router.get('/admin/list', verifyAdmin, async (req, res) => {
    try {
        const { status, search, page = 1, limit = 50 } = req.query;
        const filter = {};
        if (status) filter.status = status;

        if (search) {
            filter.$or = [
                { referredEmail: { $regex: search, $options: 'i' } },
                { referrerId: search },
                { referredId: search }
            ];
        }

        const list = await Referral.find(filter)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const formatted = [];
        for (const ref of list) {
            const referrer = await User.findOne({ uid: ref.referrerId }, 'username email');
            const referred = await User.findOne({ uid: ref.referredId }, 'username email activeDates stats');
            formatted.push({
                ...ref.toObject(),
                referrerUsername: referrer ? referrer.username : 'Deleted User',
                referrerEmail: referrer ? referrer.email : '',
                referredUsername: referred ? referred.username : 'Deleted User',
                referredEmail: referred ? referred.email : ref.referredEmail,
                referredDaysActive: referred && referred.activeDates ? referred.activeDates.length : ref.daysActive,
                referredProblemsSolved: referred && referred.stats ? referred.stats.solvedProblems : ref.problemsSolved
            });
        }

        const total = await Referral.countDocuments(filter);

        res.json({
            referrals: formatted,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit)
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/referrals/admin/:id/action - Admin approve/reject
router.post('/admin/:id/action', verifyAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { action } = req.body; // 'Active' or 'Rejected' or 'Pending'

        if (!['Active', 'Rejected', 'Pending'].includes(action)) {
            return res.status(400).json({ error: 'Invalid action state' });
        }

        const referral = await Referral.findById(id);
        if (!referral) return res.status(404).json({ error: 'Referral record not found' });

        referral.status = action;
        if (action === 'Active') {
            referral.activatedAt = new Date();
        } else {
            referral.activatedAt = null;
        }
        await referral.save();

        // If activating, trigger milestones checks
        if (action === 'Active') {
            await ReferralService.processMilestones(referral.referrerId);
        } else {
            await ReferralService.updateUserReferralStats(referral.referrerId);
        }

        res.json({ success: true, message: `Referral updated to ${action}` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
