const mongoose = require('mongoose');

const PlatformSettingsSchema = new mongoose.Schema({
    _id: { type: String, default: 'PLATFORM_SETTINGS' }, // Single document
    maintenanceMode: { type: Boolean, default: false },
    allowRegistrations: { type: Boolean, default: true },
    motd: { type: String, default: '' }, // Message of the Day (optional future use)
}, { timestamps: true });

module.exports = mongoose.model('PlatformSettings', PlatformSettingsSchema);
