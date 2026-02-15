const express = require('express');
const PlatformSettings = require('../models/PlatformSettings');
const User = require('../models/User');

const router = express.Router();

// Admin verification (same pattern as adminRoutes)
const verifyAdmin = async (req, res, next) => {
    const uid = req.headers['x-user-uid'];
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

// Helper: Ensure settings document exists
const ensureSettings = async () => {
    let settings = await PlatformSettings.findById('PLATFORM_SETTINGS');
    if (!settings) {
        settings = new PlatformSettings({ _id: 'PLATFORM_SETTINGS' });
        await settings.save();
    }
    return settings;
};

// GET /api/platform (Public)
router.get('/', async (req, res) => {
    try {
        const settings = await ensureSettings();
        res.json({
            maintenanceMode: settings.maintenanceMode,
            allowRegistrations: settings.allowRegistrations,
            motd: settings.motd
        });
    } catch (err) {
        console.error("Error fetching platform settings:", err);
        res.status(500).json({ error: "Failed to fetch settings" });
    }
});

// PUT /api/platform (Admin Only)
router.put('/', verifyAdmin, async (req, res) => {
    try {
        const { maintenanceMode, allowRegistrations, motd } = req.body;

        let settings = await ensureSettings();

        if (maintenanceMode !== undefined) settings.maintenanceMode = maintenanceMode;
        if (allowRegistrations !== undefined) settings.allowRegistrations = allowRegistrations;
        if (motd !== undefined) settings.motd = motd;

        await settings.save();
        res.json({ message: "Platform settings updated", settings });
    } catch (err) {
        console.error("Error updating platform settings:", err);
        res.status(500).json({ error: "Failed to update settings" });
    }
});

module.exports = router;
