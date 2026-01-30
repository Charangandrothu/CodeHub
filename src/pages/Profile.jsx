import React from 'react';
import ProfileSidebar from '../components/profile/ProfileSidebar';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const Profile = () => {
    const { currentUser, userData } = useAuth();

    // Map auth data to component props
    // We try to pull real data where possible, falling back to placeholders
    const userProps = {
        profileImageUrl: currentUser?.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + (currentUser?.uid || "User"),
        isVerified: userData?.isPro || false,
        username: currentUser?.displayName || currentUser?.email?.split('@')[0] || "User",
        role: "Full Stack Developer", // Placeholder as we don't know the role field yet
        status: userData?.isPro ? "Pro Member" : "Community Member",
        college: userData?.college || "University of Code",
        portfolioUrl: userData?.portfolio || "",
        github: userData?.github || currentUser?.displayName || "",
        linkedin: userData?.linkedin || "",
        skills: userData?.skills || ["JavaScript", "React", "Problem Solving"]
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] pt-28 pb-12 px-4 sm:px-6 lg:px-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-[#0a0a0a] to-[#0a0a0a]">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Left Sidebar Column */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="lg:col-span-4 xl:col-span-3 flex justify-center lg:justify-start"
                >
                    <ProfileSidebar user={userProps} className="w-full" />
                </motion.div>

                {/* Right Content Placeholder */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="lg:col-span-8 xl:col-span-9 space-y-6"
                >
                    {/* Placeholder for future profile sections */}
                    <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-8 backdrop-blur-xl min-h-[400px] flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                            <span className="text-4xl">🚧</span>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Profile Details</h2>
                        <p className="text-gray-400 max-w-md">
                            Your detailed activity, solved problems, and account settings will appear here.
                            Currently viewing the new sidebar design.
                        </p>
                    </div>
                </motion.div>

            </div>
        </div>
    );
};

export default Profile;
