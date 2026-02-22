const AuditLog = require('../models/AuditLog');

class AuditService {
    static async logAction({ admin_id, action_type, entity_type, entity_id, old_value, new_value, ip_address }) {
        try {
            const audit = new AuditLog({
                admin_id,
                action_type,
                entity_type,
                entity_id,
                old_value,
                new_value,
                ip_address
            });
            await audit.save();
        } catch (err) {
            console.error("Failed to persist security audit log!", err);
        }
    }
}

module.exports = AuditService;
