const User = require('../models/User');
const Referral = require('../models/Referral');
const ReferralReward = require('../models/ReferralReward');
const ReferralLeaderboard = require('../models/ReferralLeaderboard');

class ReferralService {
    /**
     * Checks if a referred user meets the activity requirements and transitions status to Active.
     * Triggered when a user syncs/performs activity.
     */
    static async checkAndUpdateReferrals(referredUid) {
        try {
            const referredUser = await User.findOne({ uid: referredUid });
            if (!referredUser) return null;

            // Find the pending referral for this user
            const referral = await Referral.findOne({ referredId: referredUid, status: 'Pending' });
            if (!referral) return null;

            // Anti-fraud: self referral check (should have been checked on creation, but guard it here too)
            if (referral.referrerId === referredUid) {
                referral.status = 'Rejected';
                await referral.save();
                await this.updateUserReferralStats(referral.referrerId);
                return referral;
            }

            // Extract metrics
            const emailVerified = referredUser.email ? true : false; // Default true if they have synced firebase email
            const profileCompleted = referredUser.profileCompleted === true;
            const daysActive = referredUser.activeDates ? referredUser.activeDates.length : 0;
            const problemsSolved = referredUser.stats ? (referredUser.stats.solvedProblems || 0) : 0;

            // Update stats on the referral document
            referral.emailVerified = emailVerified;
            referral.profileCompleted = profileCompleted;
            referral.daysActive = daysActive;
            referral.problemsSolved = problemsSolved;

            // Verification heuristics
            if (profileCompleted && daysActive >= 3 && problemsSolved >= 3) {
                referral.status = 'Active';
                referral.activatedAt = new Date();
                await referral.save();

                // Alert the referrer
                const referrer = await User.findOne({ uid: referral.referrerId });
                if (referrer) {
                    // Reward referrer 10 XP per active referral
                    referrer.xp = (referrer.xp || 0) + 10;
                    referrer.notifications.push({
                        message: `🔥 Your referral for @${referredUser.username || 'friend'} is now Active! +10 XP earned.`,
                        read: false,
                        createdAt: new Date()
                    });
                    await referrer.save();
                }

                // Process milestones for the referrer
                await this.processMilestones(referral.referrerId);
            } else {
                // Just save the updated progress metrics
                await referral.save();
            }

            // Update stats on the referrer user profile
            await this.updateUserReferralStats(referral.referrerId);

            return referral;
        } catch (err) {
            console.error("Error in checkAndUpdateReferrals:", err);
            throw err;
        }
    }

    /**
     * Updates the referral stats counters (active, pending, rejected) stored on the user document.
     */
    static async updateUserReferralStats(referrerUid) {
        try {
            const stats = await Referral.aggregate([
                { $match: { referrerId: referrerUid } },
                { $group: { _id: "$status", count: { $sum: 1 } } }
            ]);

            const referralStats = {
                totalReferrals: 0,
                activeReferrals: 0,
                pendingReferrals: 0,
                rejectedReferrals: 0
            };

            stats.forEach(item => {
                const count = item.count;
                referralStats.totalReferrals += count;
                if (item._id === 'Active') referralStats.activeReferrals = count;
                if (item._id === 'Pending') referralStats.pendingReferrals = count;
                if (item._id === 'Rejected') referralStats.rejectedReferrals = count;
            });

            await User.findOneAndUpdate(
                { uid: referrerUid },
                { $set: { referralStats } }
            );
        } catch (err) {
            console.error("Error updating user referral stats:", err);
        }
    }

    /**
     * Checks if referrer crossed any milestones and awards badges, XP, and subscription access.
     */
    static async processMilestones(referrerUid) {
        try {
            const referrer = await User.findOne({ uid: referrerUid });
            if (!referrer) return;

            // Fetch total active referrals
            const activeCount = await Referral.countDocuments({ referrerId: referrerUid, status: 'Active' });

            // Milestone rewards list
            const MILESTONES = [
                {
                    limit: 5,
                    rewardType: 'PRO_ACCESS',
                    rewardDetails: '7 Days Pro Access',
                    xp: 50,
                    badge: 'Bronze Recruiter',
                    days: 7
                },
                {
                    limit: 10,
                    rewardType: 'PRO_ACCESS',
                    rewardDetails: '15 Days Pro Access',
                    xp: 150,
                    badge: 'Silver Recruiter',
                    days: 15
                },
                {
                    limit: 20,
                    rewardType: 'PRO_ACCESS',
                    rewardDetails: '1 Month Pro Access',
                    xp: 500,
                    badge: 'Gold Recruiter',
                    days: 30
                },
                {
                    limit: 50,
                    rewardType: 'ELITE_ACCESS',
                    rewardDetails: '1 Month Elite Access',
                    xp: 2000,
                    badge: 'Elite Recruiter',
                    days: 30
                },
                {
                    limit: 100,
                    rewardType: 'AMBASSADOR',
                    rewardDetails: 'Campus Ambassador Status & Certificate',
                    xp: 5000,
                    badge: 'Campus Ambassador',
                    days: 0
                }
            ];

            for (const milestone of MILESTONES) {
                if (activeCount >= milestone.limit) {
                    // Check if already rewarded
                    const alreadyAwarded = await ReferralReward.exists({ userId: referrerUid, milestone: milestone.limit });
                    if (!alreadyAwarded) {
                        // Create reward history
                        const reward = new ReferralReward({
                            userId: referrerUid,
                            milestone: milestone.limit,
                            rewardType: milestone.rewardType,
                            rewardDetails: milestone.rewardDetails,
                            xpAwarded: milestone.xp,
                            badgeAwarded: milestone.badge
                        });
                        await reward.save();

                        // Award XP
                        referrer.xp = (referrer.xp || 0) + milestone.xp;

                        // Grant Badge
                        if (milestone.badge && !referrer.badges.includes(milestone.badge)) {
                            referrer.badges.push(milestone.badge);
                        }

                        // Activate Subscription
                        if (milestone.days > 0) {
                            const now = new Date();
                            let newEndDate = new Date(now);

                            // Extend if already Pro
                            if (referrer.isPro && referrer.subscriptionEndDate && referrer.subscriptionEndDate > now) {
                                newEndDate = new Date(referrer.subscriptionEndDate);
                            }
                            newEndDate.setDate(newEndDate.getDate() + milestone.days);

                            referrer.isPro = true;
                            referrer.plan = milestone.rewardType === 'ELITE_ACCESS' ? 'elite' : 'pro';
                            referrer.subscriptionEndDate = newEndDate;
                            if (!referrer.subscriptionStartDate) {
                                referrer.subscriptionStartDate = now;
                            }
                        }

                        // Add notification
                        referrer.notifications.push({
                            message: `🎉 Congratulations! You unlocked the milestone of ${milestone.limit} active referrals! Unlocked: ${milestone.rewardDetails} and earned the "${milestone.badge}" Badge!`,
                            read: false,
                            createdAt: new Date()
                        });

                        await referrer.save();

                        // Triggers dynamic updates for next milestone notifications
                        const nextMilestone = MILESTONES.find(m => m.limit > milestone.limit);
                        if (nextMilestone) {
                            const remaining = nextMilestone.limit - activeCount;
                            referrer.notifications.push({
                                message: `🔥 Only ${remaining} referrals away from ${nextMilestone.rewardDetails}.`,
                                read: false,
                                createdAt: new Date()
                            });
                            await referrer.save();
                        }
                    }
                }
            }

            // Sync stats to make sure dashboard stats are consistent
            await this.updateUserReferralStats(referrerUid);
            // Regenerate monthly leaderboard snapshot in the background
            this.updateLeaderboard().catch(console.error);

        } catch (err) {
            console.error("Error in processMilestones:", err);
        }
    }

    /**
     * Recalculates leaderboard rankings for the current month.
     */
    static async updateLeaderboard() {
        try {
            const now = new Date();
            const year = now.getFullYear();
            const monthStr = String(now.getMonth() + 1).padStart(2, '0');
            const currentMonth = `${year}-${monthStr}`;

            // Aggregate active referrals grouped by referrer
            const startOfMonth = new Date(year, now.getMonth(), 1);
            const endOfMonth = new Date(year, now.getMonth() + 1, 0, 23, 59, 59);

            const activeReferrals = await Referral.aggregate([
                {
                    $match: {
                        status: 'Active',
                        activatedAt: { $gte: startOfMonth, $lte: endOfMonth }
                    }
                },
                {
                    $group: {
                        _id: "$referrerId",
                        count: { $sum: 1 }
                    }
                },
                { $sort: { count: -1 } },
                { $limit: 10 }
            ]);

            const rankings = [];
            for (let i = 0; i < activeReferrals.length; i++) {
                const item = activeReferrals[i];
                const user = await User.findOne({ uid: item._id }, 'username displayName photoURL badges');
                if (user) {
                    // Determine their recruiter badge
                    let highestBadge = 'Free User';
                    if (user.badges.includes('Campus Ambassador')) highestBadge = 'Campus Ambassador';
                    else if (user.badges.includes('Elite Recruiter')) highestBadge = 'Elite Recruiter';
                    else if (user.badges.includes('Gold Recruiter')) highestBadge = 'Gold Recruiter';
                    else if (user.badges.includes('Silver Recruiter')) highestBadge = 'Silver Recruiter';
                    else if (user.badges.includes('Bronze Recruiter')) highestBadge = 'Bronze Recruiter';

                    rankings.push({
                        userId: item._id,
                        username: user.username || 'user',
                        displayName: user.displayName || user.username || 'Student',
                        photoURL: user.photoURL,
                        referralsCount: item.count,
                        badge: highestBadge,
                        rank: i + 1
                    });
                }
            }

            await ReferralLeaderboard.findOneAndUpdate(
                { month: currentMonth },
                { $set: { rankings } },
                { upsert: true, new: true }
            );

        } catch (err) {
            console.error("Error in updateLeaderboard:", err);
        }
    }
}

module.exports = ReferralService;
