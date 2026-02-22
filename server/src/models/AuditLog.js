const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    admin_id: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser', required: true },
    action_type: { type: String, required: true },
    entity_type: { type: String, enum: ['plan', 'offer'], required: true },
    entity_id: { type: String, required: true },
    old_value: { type: mongoose.Schema.Types.Mixed },
    new_value: { type: mongoose.Schema.Types.Mixed },
    ip_address: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', auditLogSchema);
