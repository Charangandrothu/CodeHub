const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true }, // 'pro' or 'elite'
    name: { type: String, required: true },
    monthly_inr_base: { type: Number, required: true },
    monthly_inr_offer: { type: Number, required: true },
    yearly_inr_base: { type: Number, required: true },
    yearly_inr_offer: { type: Number, required: true },
    monthly_usd_base: { type: Number, required: true },
    monthly_usd_offer: { type: Number, required: true },
    yearly_usd_base: { type: Number, required: true },
    yearly_usd_offer: { type: Number, required: true }
});

module.exports = mongoose.model('Plan', planSchema);
