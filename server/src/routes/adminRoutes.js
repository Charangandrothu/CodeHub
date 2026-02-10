const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Problem = require('../models/Problem');
const Category = require('../models/Category');
const Payment = require('../models/Payment');

// Middleware: Check Admin (Assuming header passed with uid, or session - for simplicity, passing uid in query or header)
// In a real app, use JWT verification. Here we'll trust the client passing a UID and verify against DB.
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

// Apply verifyAdmin to all routes here
router.use(verifyAdmin);

// === DASHBOARD STATS ===
router.get('/stats', async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const proUsers = await User.countDocuments({ role: 'pro' }); // or 'isPro': true
        const activeProblems = await Problem.countDocuments();
        const payments = await Payment.find();
        const totalRevenue = payments.reduce((acc, p) => acc + (p.amount || 0), 0);

        res.json({
            totalUsers,
            proUsers,
            activeProblems,
            totalRevenue
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// === USERS MANAGEMENT ===
router.get('/users', async (req, res) => {
    try {
        const users = await User.find().select('uid email displayName role isPro createdAt');
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/users/:uid/role', async (req, res) => {
    try {
        const { role } = req.body;
        const user = await User.findOneAndUpdate({ uid: req.params.uid }, { role }, { new: true });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/users/:uid', async (req, res) => {
    try {
        await User.findOneAndDelete({ uid: req.params.uid });
        res.json({ message: "User deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// === CATEGORIES MANAGEMENT ===
router.get('/categories', async (req, res) => {
    try {
        const cats = await Category.find().sort({ order: 1 });
        res.json(cats);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/categories', async (req, res) => {
    try {
        const cat = new Category(req.body);
        await cat.save();
        res.json(cat);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/categories/:id', async (req, res) => {
    try {
        const cat = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(cat);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/categories/:id', async (req, res) => {
    try {
        await Category.findByIdAndDelete(req.params.id);
        res.json({ message: "Category deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// === PAYMENTS MANAGEMENT ===
router.get('/payments', async (req, res) => {
    try {
        const payments = await Payment.find().sort({ createdAt: -1 }).limit(100);
        res.json(payments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// === PROBLEMS MANAGEMENT (Bulk/Specific Admin) ===
// Re-using general problem controller for individual CRUD, but maybe bulk ops here?
// For now, individual CRUD is handled by /api/problems. Admin check should be added there too or just trust the frontend for now
// But actually, update problemController to allow full updates.

module.exports = router;
