const mongoose = require('mongoose');
const Plan = require('./src/models/Plan');
require('dotenv').config({ path: '.env' });

const migrate = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        // Ensure pro
        let pro = await Plan.findOne({ id: 'pro' });
        if (!pro) pro = new Plan({ id: 'pro', name: 'Pro' });

        pro.set('monthly_inr_base', 29900);
        pro.set('monthly_inr_offer', 19900);
        pro.set('yearly_inr_base', 149900);
        pro.set('yearly_inr_offer', 99900);

        pro.set('monthly_usd_base', 699);
        pro.set('monthly_usd_offer', 499);
        pro.set('yearly_usd_base', 5999);
        pro.set('yearly_usd_offer', 3999);

        // Save using lean or updateOne to bypass schema strict checks temporarily if any
        await Plan.updateOne({ id: 'pro' }, {
            $set: {
                monthly_inr_base: 29900, monthly_inr_offer: 19900,
                yearly_inr_base: 149900, yearly_inr_offer: 99900,
                monthly_usd_base: 699, monthly_usd_offer: 499,
                yearly_usd_base: 5999, yearly_usd_offer: 3999
            }
        }, { upsert: true });

        // Ensure elite
        let elite = await Plan.findOne({ id: 'elite' });
        if (!elite) elite = new Plan({ id: 'elite', name: 'Elite' });

        await Plan.updateOne({ id: 'elite' }, {
            $set: {
                monthly_inr_base: 49900, monthly_inr_offer: 39900,
                yearly_inr_base: 249900, yearly_inr_offer: 199900,
                monthly_usd_base: 1299, monthly_usd_offer: 899,
                yearly_usd_base: 8999, yearly_usd_offer: 6999
            }
        }, { upsert: true });

        console.log("Migration complete!");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
migrate();
