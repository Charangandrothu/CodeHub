const Plan = require('../models/Plan');
const Offer = require('../models/Offer');

class PricingService {
    /**
     * Calculate the final amount for a given plan, billing cycle, and currency.
     * @returns {Promise<{finalAmount: number, basePrice: number, appliedOffer: object|null}>}
     */
    static async calculatePrice(planId, billingCycle, currency) {
        // 1. Fetch Plan
        const plan = await Plan.findOne({ id: planId });
        if (!plan) throw new Error("Invalid plan selected");

        // 2. Determine base and offer price based on currency and billing cycle
        let basePrice = 0;
        let finalAmount = 0;

        if (currency === 'INR') {
            basePrice = billingCycle === 'yearly' ? plan.yearly_inr_base : plan.monthly_inr_base;
            finalAmount = billingCycle === 'yearly' ? plan.yearly_inr_offer : plan.monthly_inr_offer;
        } else {
            basePrice = billingCycle === 'yearly' ? plan.yearly_usd_base : plan.monthly_usd_base;
            finalAmount = billingCycle === 'yearly' ? plan.yearly_usd_offer : plan.monthly_usd_offer;
        }

        // 3. Fetch active offers for this plan
        const now = new Date();
        const activeOffer = await Offer.findOne({
            plan_id: planId,
            active: true,
            start_date: { $lte: now },
            end_date: { $gte: now }
        });

        // 4. Apply extra dynamic offers if exists (flat or percentage decrement from finalAmount)
        if (activeOffer) {
            if (activeOffer.discount_type === 'flat') {
                finalAmount -= activeOffer.discount_value;
            } else if (activeOffer.discount_type === 'percentage') {
                const discountAmount = (basePrice * activeOffer.discount_value) / 100;
                finalAmount -= Math.floor(discountAmount); // Rounded for paise/cents
            }
        }

        // 5. Ensure final price is not negative
        finalAmount = Math.max(0, finalAmount);

        return {
            basePrice,
            finalAmount,
            appliedOffer: activeOffer ? activeOffer._id : null
        };
    }
}

module.exports = PricingService;
