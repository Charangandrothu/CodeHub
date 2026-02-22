const Plan = require('../models/Plan');
const Offer = require('../models/Offer');
const AuditService = require('../services/auditService');

class PricingAdminController {

    static async getPlans(req, res) {
        try {
            const plans = await Plan.find({});
            return res.json({ success: true, plans });
        } catch (err) {
            return res.status(500).json({ error: "Failed fetching plans" });
        }
    }

    static async updatePlan(req, res) {
        try {
            const { plan_id } = req.params;
            const {
                monthly_inr_base, monthly_inr_offer,
                yearly_inr_base, yearly_inr_offer,
                monthly_usd_base, monthly_usd_offer,
                yearly_usd_base, yearly_usd_offer
            } = req.body;

            const existingPlan = await Plan.findOne({ id: plan_id });
            if (!existingPlan) {
                return res.status(404).json({ error: "Plan not found" });
            }

            // Validation: Ensure integers and no negative prices
            const fields = [
                monthly_inr_base, monthly_inr_offer,
                yearly_inr_base, yearly_inr_offer,
                monthly_usd_base, monthly_usd_offer,
                yearly_usd_base, yearly_usd_offer
            ];
            if (fields.some(val => val < 0 || !Number.isInteger(Number(val)))) {
                return res.status(400).json({ error: "Prices must be positive integers (paise/cents)." });
            }

            // Validation: Offer must not exceed base price
            if (Number(monthly_inr_offer) > Number(monthly_inr_base) ||
                Number(yearly_inr_offer) > Number(yearly_inr_base) ||
                Number(monthly_usd_offer) > Number(monthly_usd_base) ||
                Number(yearly_usd_offer) > Number(yearly_usd_base)) {
                return res.status(400).json({ error: "Offer price cannot exceed Base price." });
            }

            // Snapshot old state for audit trails
            const old_value = existingPlan.toObject();

            existingPlan.monthly_inr_base = Number(monthly_inr_base);
            existingPlan.monthly_inr_offer = Number(monthly_inr_offer);

            existingPlan.yearly_inr_base = Number(yearly_inr_base);
            existingPlan.yearly_inr_offer = Number(yearly_inr_offer);

            existingPlan.monthly_usd_base = Number(monthly_usd_base);
            existingPlan.monthly_usd_offer = Number(monthly_usd_offer);

            existingPlan.yearly_usd_base = Number(yearly_usd_base);
            existingPlan.yearly_usd_offer = Number(yearly_usd_offer);

            await existingPlan.save();

            // Record full security audit inside database
            await AuditService.logAction({
                admin_id: req.admin._id, // Verified admin fetched via middleware
                action_type: 'UPDATE',
                entity_type: 'plan',
                entity_id: plan_id,
                old_value,
                new_value: existingPlan.toObject(),
                ip_address: req.headers['x-forwarded-for'] || req.socket.remoteAddress
            });

            return res.json({ success: true, message: "Subscription Plan updated securely.", plan: existingPlan });

        } catch (err) {
            console.error("Plan update error", err);
            return res.status(500).json({ error: "Server error configuring plan." });
        }
    }

    static async getOffers(req, res) {
        try {
            const offers = await Offer.find({});
            return res.json({ success: true, offers });
        } catch (err) {
            return res.status(500).json({ error: "Failed fetching active offers" });
        }
    }

    static async createOffer(req, res) {
        try {
            const { plan_id, discount_type, discount_value, start_date, end_date, active } = req.body;

            const newOffer = new Offer({
                plan_id, discount_type, discount_value, start_date, end_date, active
            });

            await newOffer.save();

            await AuditService.logAction({
                admin_id: req.admin._id,
                action_type: 'CREATE',
                entity_type: 'offer',
                entity_id: newOffer._id.toString(),
                old_value: null,
                new_value: newOffer.toObject(),
                ip_address: req.headers['x-forwarded-for'] || req.socket.remoteAddress
            });

            return res.status(201).json({ success: true, offer: newOffer });

        } catch (err) {
            return res.status(500).json({ error: "Failed provisioning active offer" });
        }
    }

    static async updateOffer(req, res) {
        try {
            const { id } = req.params;
            const existingOffer = await Offer.findById(id);

            if (!existingOffer) {
                return res.status(404).json({ error: "Pricing Offer tracking not found" });
            }

            const old_value = existingOffer.toObject();
            const updates = req.body;

            Object.assign(existingOffer, updates);
            await existingOffer.save();

            // Store updates persistently
            await AuditService.logAction({
                admin_id: req.admin._id,
                action_type: 'UPDATE_OFFER',
                entity_type: 'offer',
                entity_id: existingOffer._id.toString(),
                old_value,
                new_value: existingOffer.toObject(),
                ip_address: req.headers['x-forwarded-for'] || req.socket.remoteAddress
            });

            return res.json({ success: true, offer: existingOffer });
        } catch (err) {
            console.error("Pricing Admin Controller Update error", err);
            return res.status(500).json({ error: "Internal update failure" });
        }
    }
}

module.exports = PricingAdminController;
