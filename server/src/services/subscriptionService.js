const Subscription = require('../models/Subscription');
const User = require('../models/User');

class SubscriptionService {
    /**
     * Activates a subscription for a user after successful payment.
     */
    static async activateSubscription(userId, planId, billingCycle, orderId) {

        // Setup Date correctly based on cycle
        const startDate = new Date();
        const endDate = new Date(startDate);

        if (billingCycle === 'yearly') {
            endDate.setFullYear(endDate.getFullYear() + 1);
        } else {
            endDate.setMonth(endDate.getMonth() + 1);
        }

        // Upsert the subscription (one active per user)
        const subscription = await Subscription.findOneAndUpdate(
            { user_id: userId },
            {
                plan_id: planId,
                billing_cycle: billingCycle,
                status: 'active',
                start_date: startDate,
                end_date: endDate,
                razorpay_order_id: orderId
            },
            { new: true, upsert: true }
        );

        // Update User profile (We assume we track "isPro" on user for easy frontend access)
        await User.findOneAndUpdate(
            { uid: userId },
            {
                $set: {
                    isPro: true,
                    plan: planId,
                    billingCycle: billingCycle,
                    subscriptionStartDate: startDate,
                    subscriptionEndDate: endDate
                }
            }
        );

        return subscription;
    }
}

module.exports = SubscriptionService;
