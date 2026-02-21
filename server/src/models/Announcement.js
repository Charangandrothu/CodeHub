const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
    message: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        enum: ['offer', 'maintenance', 'feature', 'alert'],
        default: 'offer'
    },
    audience: {
        type: String,
        enum: ['all', 'free', 'pro', 'elite'],
        default: 'all'
    },
    bgStyle: {
        type: String,
        enum: ['blue', 'red', 'green', 'purple'],
        default: 'blue'
    },
    ctaText: {
        type: String,
        trim: true,
        default: ""
    },
    ctaLink: {
        type: String,
        trim: true,
        default: ""
    },
    startAt: {
        type: Date,
        default: Date.now
    },
    endAt: {
        type: Date,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    priority: {
        type: Number,
        default: 1 // Higher number = Higher priority
    }
}, {
    timestamps: true
});

// Index for efficient querying of active announcements
announcementSchema.index({ isActive: 1, startAt: 1, endAt: 1, priority: -1 });

module.exports = mongoose.model('Announcement', announcementSchema);
