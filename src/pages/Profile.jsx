import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProfileSidebar from '../components/profile/ProfileSidebar';
import SubmissionHeatmap from '../components/profile/SubmissionHeatmap';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Flame, Trophy, Calendar, MapPin, Briefcase, Activity, CheckCircle2, XCircle, Clock, X, Plus } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { API_URL } from '../config';
import AdBanner from '../components/AdBanner';

const Profile = () => {
    const { currentUser, userData: authUser, refreshUserData } = useAuth();
    const { username } = useParams();
    const navigate = useNavigate();
    const [fetchedUser, setFetchedUser] = useState(null);
    const [notFound, setNotFound] = useState(false);

    // Fetch user if username param exists
    useEffect(() => {
        if (username) {
            fetch(`${API_URL}/api/users/handle/${username}`)
                .then(res => {
                    if (!res.ok) throw new Error("User not found");
                    return res.json();
                })
                .then(data => {
                    setFetchedUser(data);
                    setNotFound(false);
                })
                .catch(err => {
                    console.error(err);
                    setNotFound(true);
                });
        } else {
            setFetchedUser(null);
            setNotFound(false);
        }
    }, [username]);

    const userData = username ? fetchedUser : authUser;
    const isOwner = !username || (currentUser && userData?.uid === currentUser.uid);

    const [isEditing, setIsEditing] = useState(false);

    // Local State for Editing Forms
    const [formData, setFormData] = useState({
        role: "Student",
        college: "",
        github: "",
        linkedin: "",
        portfolio: "",
        leetcode: "",
        codeforces: "",
        photoURL: "",
        skills: []
    });

    // Update local state when user data loads (only if owner)
    useEffect(() => {
        if (userData && isOwner) {
            setFormData({
                role: userData.role || "Student",
                college: userData.college || "University of Code",
                github: userData.github || "",
                linkedin: userData.linkedin || "",
                portfolio: userData.portfolio || "",
                leetcode: userData.leetcode || "",
                codeforces: userData.codeforces || "",
                photoURL: userData.photoURL || currentUser?.photoURL || "",
                skills: userData.skills || []
            });
        }
    }, [userData, currentUser, isOwner]);

    // Weekly Rank State
    const [weeklyRank, setWeeklyRank] = useState(null);
    const [weeklySolved, setWeeklySolved] = useState(0);

    // Fetch Weekly Rank
    useEffect(() => {
        const fetchWeeklyStats = async () => {
            if (!userData) return;

            try {
                const res = await fetch(`${API_URL}/api/users/leaderboard/weekly`);
                if (res.ok) {
                    const data = await res.json();
                    const index = data.findIndex(u => u.uid === userData.uid);

                    if (index !== -1) {
                        setWeeklyRank(index + 1);
                        setWeeklySolved(data[index].weeklySolvedCount);
                    } else {
                        setWeeklyRank(null);
                        setWeeklySolved(0);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch weekly rank", err);
            }
        };

        fetchWeeklyStats();
    }, [userData]);

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

                // If we are currently viewing the profile via the username route,
                // we need to manually update the local fetchedUser state to reflect changes immediately.
                if (username) {
                    setFetchedUser(data);
                }

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

    const [avatars, setAvatars] = useState([
        // Boys - Trendy Modern (Adventurer Style)
        "https://api.dicebear.com/9.x/adventurer/svg?seed=Felix&backgroundColor=b6e3f4",
        "https://api.dicebear.com/9.x/adventurer/svg?seed=Mathew&backgroundColor=c0aede",
        "https://api.dicebear.com/9.x/adventurer/svg?seed=Avery&backgroundColor=ffdfbf",
        "https://api.dicebear.com/9.x/adventurer/svg?seed=Brian&backgroundColor=d1d4f9",
        // Girls - Trendy Modern (Adventurer Style)
        "https://api.dicebear.com/9.x/adventurer/svg?seed=Liza&backgroundColor=b6e3f4",
        "https://api.dicebear.com/9.x/adventurer/svg?seed=Maria&backgroundColor=c0aede",
        "https://api.dicebear.com/9.x/adventurer/svg?seed=Sophia&backgroundColor=ffdfbf",
        "https://api.dicebear.com/9.x/adventurer/svg?seed=Emery&backgroundColor=d1d4f9"
    ]);

    useEffect(() => {
        if (currentUser?.photoURL) {
            setAvatars(prev => {
                if (!prev.includes(currentUser.photoURL)) {
                    return [currentUser.photoURL, ...prev];
                }
                return prev;
            });
        }
    }, [currentUser]);

    // Dynamic User Props from Auth Context + Placeholders where data missing
    const userProps = {
        profileImageUrl: userData?.photoURL || "https://api.dicebear.com/9.x/adventurer/svg?seed=" + (userData?.uid || "User"),
        isVerified: userData?.isPro || false,
        username: userData?.username || userData?.displayName || userData?.fullName || "User",
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
        { label: "Weekly Rank", value: weeklyRank ? `#${weeklyRank}` : "Unranked", icon: Trophy, color: "text-yellow-500", bg: "bg-yellow-500/10" },
        { label: "Problems Solved", value: userData?.stats?.solvedProblems || 0, icon: Calendar, color: "text-blue-500", bg: "bg-blue-500/10" },
    ];

    if (notFound) {
        if (currentUser && (!authUser?.profileCompleted)) {
            return <Navigate to="/complete-profile" replace />;
        }
        return (
            <div className="min-h-screen bg-[#0a0a0a] pt-28 flex flex-col items-center justify-center text-white">
                <h1 className="text-4xl font-bold mb-4">User Not Found</h1>
                <p className="text-gray-400">The requested profile does not exist.</p>
                <Button className="mt-6" onClick={() => window.history.back()}>Go Back</Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-[#0a0a0a] to-[#0a0a0a] overflow-x-hidden">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Left Sidebar Column - Profile Card */}
                <div className="lg:col-span-4 xl:col-span-3 lg:sticky lg:top-10 h-fit">
                    <ProfileSidebar
                        user={userProps}
                        className="w-full"
                        onEdit={isOwner ? () => setIsEditing(true) : undefined}
                    />
                </div>

                {/* Right Content Column */}
                <div className="lg:col-span-8 xl:col-span-9 space-y-6">

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-4">
                        {stats.map((stat, idx) => (
                            <div
                                key={stat.label}
                                className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-xl flex items-center gap-4 hover:bg-white/[0.04] transition-colors"
                            >
                                <div className={`p-3 rounded-xl ${stat.bg}`}>
                                    <stat.icon size={20} className={stat.color} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-gray-400 text-xs uppercase tracking-wider font-medium truncate">{stat.label}</p>
                                    <p className="text-white text-xl font-bold font-mono mt-0.5">{stat.value}</p>
                                </div>
                            </div>
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
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 rounded-lg bg-pink-500/10 text-pink-500">
                                <Activity size={20} />
                            </div>
                            <h2 className="text-lg font-bold text-white">Recent Activity</h2>
                        </div>

                        {userData?.submissionHistory && userData.submissionHistory.length > 0 ? (
                            <div className="space-y-4">
                                {[...userData.submissionHistory].reverse().slice(0, 10).map((sub, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => sub.problemId && navigate(`/problem/${sub.problemId}`)}
                                        className="group flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.08] hover:border-white/10 transition-all duration-300 cursor-pointer"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`p-2 rounded-full ${sub.verdict === 'Accepted' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                                {sub.verdict === 'Accepted' ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-200 group-hover:text-white transition-colors">{sub.problemTitle || "Unknown Problem"}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${sub.verdict === 'Accepted'
                                                        ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                                        }`}>
                                                        {sub.verdict}
                                                    </span>
                                                    <span className="text-xs text-gray-500 flex items-center gap-1">
                                                        <Clock size={12} />
                                                        {new Date(sub.submittedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} • {new Date(sub.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                                <Activity size={48} className="mb-4 opacity-20" />
                                <p>No recent activity</p>
                            </div>
                        )}
                    </div>

                    {/* Non-intrusive Ad at the bottom of profile content */}
                    <div className="mt-6">
                        <AdBanner adSlot="5678901234" className="rounded-2xl overflow-hidden" />
                    </div>


                    {/* Edit Profile Modal */}
                    {isEditing && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="bg-[#0f0f0f] border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl relative flex flex-col max-h-[90vh]"
                            >
                                {/* Header */}
                                <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5 rounded-t-2xl">
                                    <div>
                                        <h2 className="text-xl font-bold text-white">Edit Profile</h2>
                                        <p className="text-gray-400 text-sm mt-1">Customize your public presence on CodeHub.</p>
                                    </div>
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                {/* Content - Scrollable */}
                                <div className="p-6 overflow-y-auto space-y-8 custom-scrollbar">

                                    {/* Avatar Section */}
                                    <div className="space-y-4">
                                        <label className="block text-sm font-medium text-gray-300">Choose Avatar</label>
                                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-4">
                                            {avatars.map((avatar, index) => (
                                                <div
                                                    key={index}
                                                    onClick={() => setFormData({ ...formData, photoURL: avatar })}
                                                    className={`cursor-pointer group relative rounded-full p-1 transition-all hover:scale-105 aspect-square flex items-center justify-center ${formData.photoURL === avatar ? 'bg-gradient-to-tr from-blue-500 to-indigo-500 ring-2 ring-blue-500/50 ring-offset-2 ring-offset-[#0f0f0f]' : 'bg-transparent hover:bg-white/5'}`}
                                                >
                                                    <img
                                                        src={avatar}
                                                        alt={`Avatar ${index + 1}`}
                                                        className="w-full h-full rounded-full object-cover group-hover:opacity-90 transition-opacity"
                                                    />
                                                    {formData.photoURL === avatar && (
                                                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full animate-in fade-in zoom-in duration-200">
                                                            <div className="bg-blue-500 rounded-full p-1.5 shadow-lg">
                                                                <CheckCircle2 size={14} className="text-white" />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Personal Details */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-300">Role</label>
                                            <div className="relative">
                                                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                                <select
                                                    value={formData.role}
                                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 appearance-none transition-all placeholder:text-gray-600"
                                                >
                                                    <option value="Student">Student</option>
                                                    <option value="Full Stack Developer">Full Stack Developer</option>
                                                    <option value="Frontend Developer">Frontend Developer</option>
                                                    <option value="Backend Developer">Backend Developer</option>
                                                    {userData?.role === 'admin' && <option value="admin">CodeHub Admin</option>}
                                                    <option value="Data Scientist">Data Scientist</option>
                                                    <option value="Competitive Programmer">Competitive Programmer</option>
                                                </select>
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-300">College / University</label>
                                            <div className="relative">
                                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                                <input
                                                    type="text"
                                                    value={formData.college}
                                                    onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                                                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-gray-600"
                                                    placeholder="e.g. Stanford University"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Skills Section */}
                                    <div className="space-y-3">
                                        <label className="block text-sm font-medium text-gray-300">Skills</label>
                                        <div className="flex flex-wrap gap-2 p-4 bg-black/20 border border-white/5 rounded-xl min-h-[100px]">
                                            {formData.skills.map((skill, index) => (
                                                <span key={index} className="inline-flex items-center px-2.5 py-1 rounded-lg text-sm bg-blue-500/10 text-blue-400 border border-blue-500/20 group animate-in fade-in zoom-in duration-200">
                                                    {skill}
                                                    <button
                                                        onClick={() => {
                                                            const newSkills = formData.skills.filter((_, i) => i !== index);
                                                            setFormData({ ...formData, skills: newSkills });
                                                        }}
                                                        className="ml-1.5 hover:text-white transition-colors"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </span>
                                            ))}
                                            <div className="relative flex-1 min-w-[120px]">
                                                <input
                                                    type="text"
                                                    placeholder="Type skill & press Enter..."
                                                    className="w-full bg-transparent border-none text-white text-sm focus:outline-none placeholder:text-gray-600 py-1"
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            const val = e.target.value.trim();
                                                            if (val && !formData.skills.includes(val)) {
                                                                setFormData({
                                                                    ...formData,
                                                                    skills: [...formData.skills, val]
                                                                });
                                                                e.target.value = '';
                                                            }
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-500">Press Enter to add tags. Click 'x' to remove.</p>
                                    </div>

                                    {/* Social Links Grid */}
                                    <div className="space-y-4">
                                        <label className="block text-sm font-medium text-gray-300">Social Profiles</label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {['github', 'linkedin', 'leetcode', 'codeforces'].map((platform) => (
                                                <div key={platform} className="relative group">
                                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 capitalize text-xs font-bold pointer-events-none">
                                                        {platform}
                                                    </div>
                                                    <input
                                                        type="text"
                                                        value={formData[platform]}
                                                        onChange={(e) => setFormData({ ...formData, [platform]: e.target.value })}
                                                        className="w-full bg-black/40 border border-white/10 rounded-xl pl-24 pr-4 py-2.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-gray-700 font-mono text-sm"
                                                        placeholder="username"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Portfolio */}
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-300">Portfolio</label>
                                        <input
                                            type="text"
                                            value={formData.portfolio}
                                            onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-gray-600 font-mono text-sm"
                                            placeholder="https://yourportfolio.com"
                                        />
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="p-6 border-t border-white/10 bg-white/5 rounded-b-2xl flex justify-end gap-3">
                                    <Button
                                        variant="ghost"
                                        onClick={() => setIsEditing(false)}
                                        className="hover:bg-white/10 text-gray-300"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleSaveProfile}
                                        className="bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20"
                                    >
                                        Save Changes
                                    </Button>
                                </div>
                            </motion.div>
                        </div>
                    )}

                </div>

            </div>
        </div>
    );
};

export default Profile;
