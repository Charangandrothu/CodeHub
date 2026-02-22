const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
    plan_id: { type: String, required: true }, // references plan.id
    discount_type: { type: String, enum: ['flat', 'percentage'], required: true },
    discount_value: { type: Number, required: true }, // Flat amount in paise/cents, or percentage e.g., 20
    start_date: { type: Date, required: true },
    end_date: { type: Date, required: true },
    active: { type: Boolean, default: true }
});

module.exports = mongoose.model('Offer', offerSchema);
