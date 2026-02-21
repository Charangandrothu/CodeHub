const express = require('express');
const router = express.Router();
const Announcement = require('../models/Announcement');
const User = require('../models/User');

// Middleware to verify admin (Same logic as adminRoutes.js)
const verifyAdmin = async (req, res, next) => {
    const uid = req.headers['x-user-uid'];

    // Allow non-admin for public GET routes inside this router?
    // No, this middleware is specifically for admin actions. 
    // We will apply it only to specific routes.

    if (!uid) return res.status(401).json({ error: "Unauthorized" });

    try {
        const user = await User.findOne({ uid });
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ error: "Forbidden: Admins only" });
        }
        req.user = user;
        next();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// --- PUBLIC ROUTES ---

// Get Active Announcement
router.get('/active', async (req, res) => {
    try {
        const now = new Date();

        const announcement = await Announcement.findOne({
            isActive: true,
            startAt: { $lte: now },
            endAt: { $gte: now }
        }).sort({ priority: -1, createdAt: -1 });

        res.json(announcement || null);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- ADMIN ROUTES ---

// Create Announcement
router.post('/create', verifyAdmin, async (req, res) => {
    try {
        const announcement = new Announcement(req.body);
        await announcement.save();
        res.json({ success: true, announcement });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get All Announcements (for Admin Dashboard)
router.get('/all', verifyAdmin, async (req, res) => {
    try {
        const announcements = await Announcement.find().sort({ createdAt: -1 });
        res.json(announcements);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update Announcement
router.put('/:id', verifyAdmin, async (req, res) => {
    try {
        const announcement = await Announcement.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true } // Return updated doc
        );
        if (!announcement) return res.status(404).json({ error: "Announcement not found" });
        res.json(announcement);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete Announcement
router.delete('/:id', verifyAdmin, async (req, res) => {
    try {
        const announcement = await Announcement.findByIdAndDelete(req.params.id);
        if (!announcement) return res.status(404).json({ error: "Announcement not found" });
        res.json({ success: true, message: "Announcement deleted" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
