const mongoose = require('mongoose');

const adminSessionSchema = new mongoose.Schema({
    admin_id: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser', required: true },
    refresh_token: { type: String, required: true },
    ip_address: { type: String },
    user_agent: { type: String },
    expires_at: { type: Date, required: true },
    revoked: { type: Boolean, default: false }
}, { timestamps: true });

adminSessionSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('AdminSession', adminSessionSchema);
