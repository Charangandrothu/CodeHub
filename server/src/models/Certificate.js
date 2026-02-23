const mongoose = require("mongoose");

const certificateSchema = new mongoose.Schema({
    certificateId: { type: String, unique: true },
    userId: String,
    name: String,
    course: String,
    progress: Number,
    issuedAt: { type: Date, default: Date.now },
    pdfUrl: String
});

module.exports = mongoose.model("Certificate", certificateSchema);
