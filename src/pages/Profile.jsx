import React, { useState, useEffect } from 'react';
import ProfileSidebar from '../components/profile/ProfileSidebar';
import SubmissionHeatmap from '../components/profile/SubmissionHeatmap';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Flame, Trophy, Calendar, MapPin, Briefcase } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { API_URL } from '../config';

const Profile = () => {
    const { currentUser, userData, refreshUserData } = useAuth();
    const [isEditing, setIsEditing] = useState(false);

    // Local State for Editing Forms
    const [formData, setFormData] = useState({
        role: "Full Stack Developer",
        college: "University of Code",
        github: "",
        linkedin: "",
        portfolio: "",
        leetcode: "",
        codeforces: "",
        photoURL: ""
    });

    const AVATARS = [
        // Boys - Verified Hex Codes
        "https://api.dicebear.com/7.x/avataaars/svg?seed=Alexander&skinColor=ffdbb4&backgroundColor=c0aede",
        "https://api.dicebear.com/7.x/avataaars/svg?seed=Mason&skinColor=edb98a&backgroundColor=b6e3f4",
        "https://api.dicebear.com/7.x/avataaars/svg?seed=Ethan&skinColor=ffdbb4&backgroundColor=d1d4f9",
        "https://api.dicebear.com/7.x/avataaars/svg?seed=Ryan&skinColor=edb98a&backgroundColor=ffdfbf",
        // Girls - Verified Hex Codes
        "https://api.dicebear.com/7.x/avataaars/svg?seed=Jessica&skinColor=ffdbb4&backgroundColor=b6e3f4",
        "https://api.dicebear.com/7.x/avataaars/svg?seed=Lily&skinColor=edb98a&backgroundColor=c0aede",
        "https://api.dicebear.com/7.x/avataaars/svg?seed=Sophie&skinColor=ffdbb4&backgroundColor=ffdfbf",
        "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah&skinColor=edb98a&backgroundColor=d1d4f9"
    ];

    // Update local state when user data loads
    useEffect(() => {
        if (userData) {
            setFormData({
                role: userData.role || "Full Stack Developer",
                college: userData.college || "University of Code",
                github: userData.github || "",
                linkedin: userData.linkedin || "",
                portfolio: userData.portfolio || "",
                leetcode: userData.leetcode || "",
                codeforces: userData.codeforces || "",
                photoURL: userData.photoURL || currentUser?.photoURL || ""
            });
        }
    }, [userData, currentUser]);

    // Dynamic User Props from Auth Context + Placeholders where data missing
    const userProps = {
        profileImageUrl: userData?.photoURL || currentUser?.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + (currentUser?.uid || "User"),
        isVerified: userData?.isPro || false,
        username: currentUser?.displayName || currentUser?.email?.split('@')[0] || "User",
        role: userData?.role || "Full Stack Developer",
        status: userData?.isPro ? "Pro Member" : "Community Member",
        college: userData?.college || "University of Code",
        portfolioUrl: userData?.portfolio || "",
        github: userData?.github || "",
        linkedin: userData?.linkedin || "",
        leetcode: userData?.leetcode || "",
        codeforces: userData?.codeforces || "",
        skills: userData?.skills || ["JavaScript", "React", "Problem Solving", "Data Structures", "Algorithms"]
    };

    // Stats for the "Premium" look
    const stats = [
        { label: "Current Streak", value: userData?.stats?.streak || 0, icon: Flame, color: "text-orange-500", bg: "bg-orange-500/10" },
        { label: "Global Rank", value: userData?.stats?.globalRank ? `#${userData.stats.globalRank}` : "Unranked", icon: Trophy, color: "text-yellow-500", bg: "bg-yellow-500/10" },
        { label: "Problems Solved", value: userData?.stats?.solvedProblems || 0, icon: Calendar, color: "text-blue-500", bg: "bg-blue-500/10" },
    ];

    const handleSaveProfile = async () => {
        if (!currentUser) return;

        console.log("Updating profile for user:", currentUser.uid);
        console.log("Data being sent:", formData);

        try {
            const res = await fetch(`${API_URL}/api/users/${currentUser.uid}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    email: currentUser.email // Send email just in case user needs to be created
                })
            });

            const data = await res.json();
            console.log("Update response:", res.status, data);

            if (res.ok) {
                await refreshUserData(); // Refresh context
                console.log("User data refreshed");
                setIsEditing(false);
            } else {
                console.error("Update failed:", data);
                alert(`Failed to update profile: ${data.error || "Unknown error"}`);
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("Error updating profile");
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] pt-28 pb-12 px-4 sm:px-6 lg:px-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-[#0a0a0a] to-[#0a0a0a]">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Left Sidebar Column - Profile Card */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="lg:col-span-4 xl:col-span-3 lg:sticky lg:top-28 h-fit"
                >
                    <ProfileSidebar
                        user={userProps}
                        className="w-full"
                        onEdit={() => setIsEditing(true)}
                    />
                </motion.div>

                {/* Right Content Column */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="lg:col-span-8 xl:col-span-9 space-y-8"
                >

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {stats.map((stat, idx) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 + idx * 0.1 }}
                                className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-xl flex items-center gap-4 hover:bg-white/[0.04] transition-colors"
                            >
                                <div className={`p-3 rounded-xl ${stat.bg}`}>
                                    <stat.icon size={20} className={stat.color} />
                                </div>
                                <div>
                                    <p className="text-gray-400 text-xs uppercase tracking-wider font-medium">{stat.label}</p>
                                    <p className="text-white text-xl font-bold font-mono mt-0.5">{stat.value}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Submission Heatmap Section */}
                    <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-white">Submission History</h2>
                            <div className="text-xs text-gray-500">
                                {new Date().getFullYear()} Submissions
                            </div>
                        </div>
                        <SubmissionHeatmap submissions={userData?.submissionHistory || []} />
                    </div>

                    {/* Recent Activity / Solved Problems */}
                    <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 backdrop-blur-xl min-h-[300px]">
                        <h2 className="text-lg font-bold text-white mb-4">Recent Activity</h2>

                        {userData?.submissionHistory && userData.submissionHistory.length > 0 ? (
                            <div className="space-y-3">
                                {[...userData.submissionHistory].reverse().slice(0, 10).map((sub, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2 h-2 rounded-full ${sub.verdict === 'Accepted' ? 'bg-green-500' : 'bg-red-500'}`} />
                                            <div>
                                                <p className="text-sm font-medium text-white">{sub.problemTitle || "Unknown Problem"}</p>
                                                <p className="text-xs text-gray-500 font-mono">
                                                    {new Date(sub.submittedAt).toLocaleDateString()} • {new Date(sub.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className={`text-xs font-semibold px-2 py-1 rounded-md border ${sub.verdict === 'Accepted'
                                            ? 'text-green-400 bg-green-400/10 border-green-400/20'
                                            : 'text-red-400 bg-red-400/10 border-red-400/20'
                                            }`}>
                                            {sub.verdict}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-48 text-center text-gray-500">
                                <p className="mb-2">No activity recorded yet.</p>
                                <Button
                                    variant="ghost"
                                    className="text-blue-400 hover:text-blue-300"
                                    onClick={() => window.location.href = '/dsa'}
                                >
                                    Browse Problems
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Edit Profile Modal */}
                    {isEditing && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/80 backdrop-blur-sm">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-[#0f0f0f] border border-white/10 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto"
                            >
                                <h2 className="text-xl font-bold text-white mb-4">Edit Profile</h2>
                                <p className="text-gray-400 text-sm mb-6">Update your personal details and avatar.</p>

                                <div className="space-y-6">
                                    {/* Avatar Selection - Added as per request */}
                                    <div>
                                        <label className="block text-xs font-medium text-gray-400 mb-3">Choose Avatar</label>
                                        <div className="grid grid-cols-4 gap-4">
                                            {AVATARS.map((avatar, index) => (
                                                <div
                                                    key={index}
                                                    onClick={() => setFormData({ ...formData, photoURL: avatar })}
                                                    className={`cursor-pointer relative rounded-full p-1 transition-all hover:scale-105 aspect-square flex items-center justify-center ${formData.photoURL === avatar ? 'bg-blue-500 ring-2 ring-blue-500 ring-offset-2 ring-offset-black' : 'bg-transparent hover:bg-white/10'}`}
                                                >
                                                    <img
                                                        src={avatar}
                                                        alt={`Avatar ${index + 1}`}
                                                        className="w-full h-full rounded-full object-cover"
                                                    />
                                                    {formData.photoURL === avatar && (
                                                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full">
                                                            <div className="bg-blue-500 rounded-full p-1">
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-white"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-400 mb-1">Role</label>
                                        <select
                                            value={formData.role}
                                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 appearance-none"
                                        >
                                            <option value="Full Stack Developer">Full Stack Developer</option>
                                            <option value="Frontend Developer">Frontend Developer</option>
                                            <option value="Backend Developer">Backend Developer</option>
                                            <option value="Student">Student</option>
                                            <option value="Data Scientist">Data Scientist</option>
                                            <option value="Competitive Programmer">Competitive Programmer</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-400 mb-1">College / University</label>
                                        <input
                                            type="text"
                                            value={formData.college}
                                            onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                                            placeholder="e.g. Stanford University"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-400 mb-1">GitHub Username</label>
                                            <input
                                                type="text"
                                                value={formData.github}
                                                onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                                                placeholder="username"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-400 mb-1">LinkedIn Username</label>
                                            <input
                                                type="text"
                                                value={formData.linkedin}
                                                onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                                                placeholder="username"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-400 mb-1">LeetCode Username</label>
                                            <input
                                                type="text"
                                                value={formData.leetcode}
                                                onChange={(e) => setFormData({ ...formData, leetcode: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                                                placeholder="username"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-400 mb-1">CodeForces Username</label>
                                            <input
                                                type="text"
                                                value={formData.codeforces}
                                                onChange={(e) => setFormData({ ...formData, codeforces: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                                                placeholder="username"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-400 mb-1">Portfolio URL (optional)</label>
                                        <input
                                            type="text"
                                            value={formData.portfolio}
                                            onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                                            placeholder="https://my-portfolio.com"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 mt-8">
                                    <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                                    <Button onClick={handleSaveProfile}>Save Changes</Button>
                                </div>
                            </motion.div>
                        </div>
                    )}

                </motion.div>

            </div>
        </div>
    );
};

export default Profile;
