const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const User = require('./src/models/User');
const Referral = require('./src/models/Referral');
const ReferralReward = require('./src/models/ReferralReward');
const ReferralLeaderboard = require('./src/models/ReferralLeaderboard');
const ReferralService = require('./src/services/referralService');

const runTest = async () => {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected successfully.");

        const referrerUid = "referrer-test-uid-999";
        const referredUid = "referred-test-uid-888";

        // Cleanup previous tests if any
        console.log("Cleaning up old test users/referrals...");
        await User.deleteMany({ uid: { $in: [referrerUid, referredUid] } });
        await Referral.deleteMany({ referrerId: referrerUid });
        await ReferralReward.deleteMany({ userId: referrerUid });

        // 1. Create Referrer
        console.log("1. Creating Referrer user...");
        const referrer = new User({
            uid: referrerUid,
            email: "referrer@codehubx.test",
            username: "referrer_test",
            displayName: "Test Referrer",
            photoURL: "https://api.dicebear.com/9.x/adventurer/svg?seed=referrer",
            referralCode: "TESTREFCODE",
            xp: 0,
            badges: [],
            activeDates: [],
            referralStats: {
                totalReferrals: 0,
                activeReferrals: 0,
                pendingReferrals: 0,
                rejectedReferrals: 0
            }
        });
        await referrer.save();
        console.log("Referrer created with code: TESTREFCODE");

        // 2. Simulate Sign Up of Referred User via referral link
        console.log("2. Simulating referred user sync with referredBy='TESTREFCODE'...");
        // Match the logic in userRoutes.js /sync:
        const referredCode = "REFERRED_TEST";
        const referredEmail = "referred@codehubx.test";
        
        let referrerUser = await User.findOne({ referralCode: "TESTREFCODE" });
        let finalReferredBy = null;
        if (referrerUser && referrerUser.uid !== referredUid) {
            finalReferredBy = referrerUser.referralCode;
        }

        const todayStr = new Date().toISOString().split('T')[0];
        const referredUser = new User({
            uid: referredUid,
            email: referredEmail,
            username: referredCode.toLowerCase(),
            displayName: "Referred Friend",
            photoURL: "https://api.dicebear.com/9.x/adventurer/svg?seed=referred",
            referralCode: referredCode,
            referredBy: finalReferredBy,
            activeDates: [todayStr],
            profileCompleted: false, // Starts as false
            stats: {
                streak: 0,
                solvedProblems: 0,
                solvedProblemIds: [],
                totalProblems: 150,
                timeSpent: '0h 0m'
            }
        });
        await referredUser.save();

        // Create the Referral document
        const refDoc = new Referral({
            referrerId: referrerUser.uid,
            referredId: referredUid,
            referredUsername: referredUser.username,
            referredEmail: referredEmail,
            status: 'Pending',
            emailVerified: true,
            profileCompleted: false,
            daysActive: 1,
            problemsSolved: 0
        });
        await refDoc.save();

        // Update referrer user stats
        referrerUser.referralStats.totalReferrals += 1;
        referrerUser.referralStats.pendingReferrals += 1;
        await referrerUser.save();
        
        console.log("Referred user & Referral relation (Pending) created successfully.");

        // Verify state is Pending
        let refCheck = await Referral.findOne({ referredId: referredUid });
        console.log("Initial Referral Status:", refCheck.status);
        if (refCheck.status !== 'Pending') throw new Error("Referral should be Pending initially!");

        // 3. Simulate Referred User updating metrics (but NOT meeting full criteria yet)
        console.log("3. Updating referred user metrics partially (solved 2 problems, active 2 days)...");
        referredUser.activeDates = [todayStr, "2026-05-30"];
        referredUser.stats.solvedProblems = 2;
        referredUser.profileCompleted = true; // completed profile
        await referredUser.save();

        // Run check
        await ReferralService.checkAndUpdateReferrals(referredUid);

        refCheck = await Referral.findOne({ referredId: referredUid });
        console.log("Status after partial update:", refCheck.status);
        console.log("Days Active in Ref Doc:", refCheck.daysActive);
        console.log("Problems Solved in Ref Doc:", refCheck.problemsSolved);
        if (refCheck.status !== 'Pending') throw new Error("Referral should still be Pending!");

        // 4. Simulate Referred User meeting ALL requirements
        console.log("4. Simulating referred user meeting ALL criteria (solved 3 problems, active 3 days)...");
        referredUser.activeDates = [todayStr, "2026-05-30", "2026-05-31"];
        referredUser.stats.solvedProblems = 3;
        await referredUser.save();

        // Run check
        await ReferralService.checkAndUpdateReferrals(referredUid);

        refCheck = await Referral.findOne({ referredId: referredUid });
        console.log("Status after full update:", refCheck.status);
        if (refCheck.status !== 'Active') throw new Error("Referral should now be Active!");

        let updatedReferrer = await User.findOne({ uid: referrerUid });
        console.log("Referrer XP:", updatedReferrer.xp);
        console.log("Referrer ReferralStats:", updatedReferrer.referralStats);
        if (updatedReferrer.xp !== 10) throw new Error("Referrer should have earned 10 XP!");
        if (updatedReferrer.referralStats.activeReferrals !== 1) throw new Error("Active count should be 1!");
        if (updatedReferrer.referralStats.pendingReferrals !== 0) throw new Error("Pending count should be 0!");

        // 5. Test Milestones: Simulate 5 active referrals for referrer
        console.log("5. Simulating 4 additional active referrals to hit Milestone 5...");
        // Add 4 more active referrals
        for (let i = 1; i <= 4; i++) {
            const tempUid = `referred-test-uid-extra-${i}`;
            const tempEmail = `referred-extra-${i}@codehubx.test`;
            
            const extraRef = new Referral({
                referrerId: referrerUid,
                referredId: tempUid,
                referredUsername: `referred_extra_${i}`,
                referredEmail: tempEmail,
                status: 'Active',
                emailVerified: true,
                profileCompleted: true,
                daysActive: 3,
                problemsSolved: 3,
                activatedAt: new Date()
            });
            await extraRef.save();
        }

        // Run processMilestones directly
        await ReferralService.processMilestones(referrerUid);

        updatedReferrer = await User.findOne({ uid: referrerUid });
        console.log("Referrer Pro Status:", updatedReferrer.isPro);
        console.log("Referrer Plan:", updatedReferrer.plan);
        console.log("Referrer Badges:", updatedReferrer.badges);
        console.log("Referrer XP after milestone:", updatedReferrer.xp);
        console.log("Referrer Notifications count:", updatedReferrer.notifications.length);

        if (!updatedReferrer.isPro) throw new Error("Referrer should be Pro!");
        if (updatedReferrer.plan !== 'pro') throw new Error("Referrer plan should be 'pro'!");
        if (!updatedReferrer.badges.includes('Bronze Recruiter')) throw new Error("Referrer should have 'Bronze Recruiter' badge!");
        // XP should be: 10 (from first active referral) + 50 (from milestone 5 reward) = 60 XP
        if (updatedReferrer.xp !== 60) throw new Error("Referrer XP should be 60!");

        // 6. Test Leaderboard Snapshot
        console.log("6. Updating leaderboard snapshot...");
        await ReferralService.updateLeaderboard();
        const now = new Date();
        const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        const leaderboard = await ReferralLeaderboard.findOne({ month: currentMonth });
        console.log("Leaderboard snapshot for month:", currentMonth);
        console.log("Rankings in leaderboard:", leaderboard ? leaderboard.rankings : "None");
        if (!leaderboard || leaderboard.rankings.length === 0) {
            throw new Error("Leaderboard snapshot should not be empty!");
        }

        // Cleanup test data
        console.log("Cleaning up test users, referrals, rewards, and leaderboard Snapshots...");
        await User.deleteMany({ uid: { $in: [referrerUid, referredUid] } });
        for (let i = 1; i <= 4; i++) {
            await User.deleteOne({ uid: `referred-test-uid-extra-${i}` });
        }
        await Referral.deleteMany({ referrerId: referrerUid });
        await ReferralReward.deleteMany({ userId: referrerUid });
        await ReferralLeaderboard.deleteMany({ month: currentMonth });

        console.log("✅ All referral system integration test scenarios PASSED successfully!");
    } catch (err) {
        console.error("❌ Test Failed:", err);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected from MongoDB.");
    }
};

runTest();
