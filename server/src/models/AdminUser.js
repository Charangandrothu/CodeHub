const mongoose = require('mongoose');

const adminUserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password_hash: { type: String, required: true },
    role: { type: String, enum: ['admin', 'super_admin'], default: 'admin' },
    is_active: { type: Boolean, default: true },
    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

module.exports = mongoose.model('AdminUser', adminUserSchema);
