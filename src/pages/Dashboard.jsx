import React, { useMemo, useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Trophy,
    Flame,
    CheckCircle2,
    ArrowRight,
    Code2,
    Target,
    BookOpen,
    Activity,
    BrainCircuit,
    Layout,
    Clock,
    Zap,
    Crown
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import DailyQuote from '../components/dsa/DailyQuote';
import { API_URL } from '../config';

const Dashboard = () => {
    const { currentUser, userData } = useAuth();
    const navigate = useNavigate();

    // Weekly Leaderboard State
    const [weeklyLeaderboard, setWeeklyLeaderboard] = useState([]);
    const [myWeeklyStats, setMyWeeklyStats] = useState({ rank: null, count: 0 });
    const [nextTask, setNextTask] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!currentUser) return;

            try {
                // Fetch Leaderboard
                const lbRes = await fetch(`${API_URL}/api/users/leaderboard/weekly`);
                if (lbRes.ok) {
                    const data = await lbRes.json();
                    setWeeklyLeaderboard(data);
                    const myIndex = data.findIndex(u => u.uid === currentUser.uid);
                    if (myIndex !== -1) {
                        setMyWeeklyStats({ rank: myIndex + 1, count: data[myIndex].weeklySolvedCount });
                    } else {
                        setMyWeeklyStats({ rank: null, count: 0 });
                    }
                }

                // Fetch Next Task
                const taskRes = await fetch(`${API_URL}/api/users/next-task/${currentUser.uid}`);
                if (taskRes.ok) {
                    setNextTask(await taskRes.json());
                }
            } catch (err) {
                console.error("Failed to fetch dashboard data", err);
            }
        };
        fetchData();
    }, [currentUser]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 }
    };

    // Calculate Dynamic Dashboard State
    const dashboardState = useMemo(() => {
        const solvedCount = userData?.stats?.solvedProblems || 0;
        const isNewUser = solvedCount === 0;

        // Condition 1: New User
        if (isNewUser) {
            return {
                isNewUser: true,
                title: "Start Learning",
                subtitle: "Begin your placement journey with structured patterns",
                buttonText: "Start Learning",
                roadmapPreview: ["Arrays & Hashing", "Two Pointers", "Sliding Window", "Stacks", "Binary Search"]
            };
        }

        // Condition 2: Existing User - Roadmap Logic
        const roadmap = [
            { threshold: 5, section: "Arrays & Hashing", topic: "Basics & Arrays", time: "30 mins" },
            { threshold: 10, section: "Arrays & Hashing", topic: "Hash Maps & Sets", time: "25 mins" },
            { threshold: 20, section: "Two Pointers", topic: "String Manipulation", time: "30 mins" },
            { threshold: 30, section: "Sliding Window", topic: "Dynamic Windows", time: "40 mins" },
            { threshold: 45, section: "Stack", topic: "LIFO Operations", time: "35 mins" },
            { threshold: 60, section: "Binary Search", topic: "Search Spaces", time: "45 mins" },
            { threshold: 80, section: "Linked List", topic: "Pointer Management", time: "50 mins" },
            { threshold: 100, section: "Trees", topic: "DFS & BFS", time: "60 mins" },
            { threshold: 150, section: "Graphs", topic: "Advanced Traversal", time: "90 mins" }
        ];

        // Find next milestone
        const nextMilestone = roadmap.find(milestone => solvedCount < milestone.threshold) || roadmap[roadmap.length - 1];

        return {
            isNewUser: false,
            section: nextMilestone.section,
            topic: nextMilestone.topic,
            time: nextMilestone.time,
            buttonText: "Continue Practice"
        };
    }, [userData]);


    return (
        <div className="min-h-screen bg-[#0a0a0a] pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-[#0a0a0a] to-[#0a0a0a]">
            <motion.div
                className="max-w-7xl mx-auto space-y-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >

                {/* Compact Welcome Section */}
                <motion.div variants={itemVariants} className="w-full">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-xl">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wide">Online & Ready</span>
                                </div>
                                <div className="px-2.5 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center gap-1.5">
                                    <Flame size={10} className="text-orange-500" />
                                    <span className="text-[10px] font-semibold text-orange-400 uppercase tracking-wide">
                                        {userData?.stats?.streak > 0 ? `${userData.stats.streak} Day Streak` : "0 Day Streak"}
                                    </span>
                                </div>
                            </div>
                            <h1 className="text-2xl font-bold text-white tracking-tight">
                                {dashboardState.isNewUser ? "Welcome" : "Welcome back"}, <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">{currentUser?.displayName || 'Developer'}</span> 👋
                            </h1>
                            <p className="text-gray-400 text-sm mt-1">Continue your structured placement preparation</p>
                        </div>

                        <div className="hidden md:flex items-center gap-6">
                            <div className="text-right">
                                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-0.5">Weekly Rank</p>
                                {myWeeklyStats.rank ? (
                                    <>
                                        <div className="flex items-end justify-end gap-2">
                                            <span className="text-2xl font-bold text-white">#{myWeeklyStats.rank}</span>
                                            <Trophy size={20} className="text-yellow-500 mb-1" />
                                        </div>
                                        <p className="text-[10px] text-emerald-400 font-medium">
                                            {myWeeklyStats.count} solved • Top {Math.round(((weeklyLeaderboard.length - myWeeklyStats.rank + 1) / weeklyLeaderboard.length) * 100)}% 🚀
                                        </p>
                                    </>
                                ) : userData?.stats?.solvedProblems === 0 ? (
                                    <>
                                        <div className="flex items-end justify-end gap-2">
                                            <span className="text-sm font-bold text-blue-400">New Challenger ⚡</span>
                                        </div>
                                        <p className="text-[10px] text-gray-500 mt-1">Solve 1 to join! 💪</p>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex items-end justify-end gap-2">
                                            <span className="text-sm font-bold text-gray-400">Unranked 😴</span>
                                        </div>
                                        <p className="text-[10px] text-orange-400 font-medium mt-1">Wake up & solve! 🔥</p>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Main Content Area (2 Cols) */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Dynamic Main Action Card */}
                        <motion.div
                            variants={itemVariants}
                            className={`group relative overflow-hidden rounded-2xl border ${dashboardState.isNewUser ? 'border-purple-500/30' : 'border-white/10'} bg-gradient-to-br from-blue-900/10 via-white/[0.02] to-transparent p-6 hover:border-blue-500/30 transition-all duration-300`}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            <div className="relative z-10 flex flex-col gap-6">
                                <div className="flex flex-col sm:flex-row w-full items-start sm:items-center justify-between gap-6">
                                    <div className="flex items-start gap-4">
                                        <div className={`p-3.5 rounded-xl ${dashboardState.isNewUser ? 'bg-gradient-to-br from-purple-600 to-blue-600' : 'bg-gradient-to-br from-blue-600 to-blue-700'} text-white shadow-lg shadow-blue-500/20 shrink-0`}>
                                            <Code2 size={24} />
                                        </div>
                                        <div className="space-y-1">
                                            {dashboardState.isNewUser ? (
                                                <>
                                                    <h3 className="text-xl font-bold text-white">Start Learning</h3>
                                                    <p className="text-sm text-gray-400 mb-3">Begin your placement journey with structured patterns</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {dashboardState.roadmapPreview.map((tag, i) => (
                                                            <span key={i} className="text-[10px] px-2 py-1 rounded-md bg-white/5 border border-white/10 text-gray-400">
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <p className="text-xs text-blue-400 font-medium uppercase tracking-wider mb-1">
                                                        {nextTask?.progress >= 80 ? "ALMOST THERE! 🔥" : "COMING NEXT"}
                                                    </p>
                                                    <h3 className="text-lg font-bold text-white mb-1 group-hover:text-blue-300 transition-colors">
                                                        {nextTask?.topic || "Loading..."}
                                                    </h3>
                                                    <p className="text-sm text-gray-400 mb-2 flex items-center gap-2">
                                                        <span>{nextTask?.solvedCount || 0} / {nextTask?.totalProblems || '?'} Solved</span>
                                                        <span className="w-1 h-1 rounded-full bg-gray-600" />
                                                        <span>{nextTask?.progress || 0}% Complete</span>
                                                    </p>
                                                    <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${nextTask?.progress || 0}%` }}
                                                            transition={{ duration: 1 }}
                                                            className="h-full bg-blue-500 rounded-full"
                                                        />
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <Button
                                        className={`w-full sm:w-auto shrink-0 ${dashboardState.isNewUser ? 'bg-white text-black hover:bg-gray-100' : ''}`}
                                        icon={ArrowRight}
                                        onClick={() => {
                                            if (dashboardState.isNewUser) {
                                                navigate('/dsa');
                                            } else if (nextTask?.slug) {
                                                navigate(`/dsa/${nextTask.slug}`);
                                            } else {
                                                navigate('/dsa');
                                            }
                                        }}
                                    >
                                        {nextTask?.progress >= 80 ? "Finish It 💪" : "Continue Practice"}
                                    </Button>
                                </div>
                            </div>
                        </motion.div>

                        {/* Progress Cards Grid */}
                        <motion.div variants={itemVariants}>
                            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <Activity size={18} className="text-blue-400" />
                                Preparation Overview
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <DashboardCard
                                    title="DSA Progress"
                                    icon={BrainCircuit}
                                    color="blue"
                                    stats={`${userData?.stats?.solvedProblems || 0}/${userData?.stats?.totalProblems || 150} Solved`}
                                    percentage={Math.round(((userData?.stats?.solvedProblems || 0) / (userData?.stats?.totalProblems || 150)) * 100) || 0}
                                    onClick={() => navigate('/dsa')}
                                />
                                <DashboardCard
                                    title="Mock Tests"
                                    icon={Target}
                                    color="purple"
                                    stats="0/10 Completed"
                                    percentage={0}
                                    onClick={() => navigate('/mock-tests')}
                                />
                                <DashboardCard
                                    title="Aptitude"
                                    icon={Zap}
                                    color="orange"
                                    stats="0/50 Topics"
                                    percentage={0}
                                    onClick={() => navigate('/aptitude')}
                                />
                            </div>
                        </motion.div>
                    </div>

                    {/* Sidebar (1 Col) - Activity & Stats */}
                    <motion.div variants={itemVariants} className="space-y-6">

                        {/* Compact Stats Panel */}
                        <div className="rounded-2xl border border-white/10 bg-[#0a0a0a]/50 backdrop-blur-xl p-5">
                            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">You at a glance</h3>

                            <div className="space-y-4">
                                <StatRow
                                    icon={Flame}
                                    color="text-orange-500"
                                    bg="bg-orange-500/10"
                                    label="Current Streak"
                                    value={userData?.stats?.streak > 0 ? `${userData.stats.streak} Days` : "0 Days"}
                                />
                                <StatRow
                                    icon={CheckCircle2}
                                    color="text-green-500"
                                    bg="bg-green-500/10"
                                    label="Problems Solved"
                                    value={userData?.stats?.solvedProblems || 0}
                                />
                                <StatRow
                                    icon={Clock}
                                    color="text-blue-500"
                                    bg="bg-blue-500/10"
                                    label="Time Spent"
                                    value={userData?.stats?.timeSpent || "0h 0m"}
                                />
                            </div>

                            <div className="mt-6 pt-5 border-t border-white/5">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-500">Global Rank</span>
                                    <span className="text-white font-mono font-medium">{userData?.stats?.globalRank ? `#${userData.stats.globalRank}` : 'Unranked'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Top Solvers Widget */}
                        <div className="rounded-2xl border border-white/10 bg-[#0a0a0a]/50 backdrop-blur-xl p-5">
                            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <Trophy size={14} className="text-yellow-500" /> Weekly Top 3
                            </h3>
                            <div className="space-y-3">
                                {weeklyLeaderboard.slice(0, 3).map((user, idx) => (
                                    <div
                                        key={user.uid}
                                        onClick={() => navigate(`/${user.username || user.uid}`)}
                                        className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-lg ${idx === 0 ? "bg-gradient-to-br from-yellow-400 to-amber-600 text-white shadow-yellow-500/20" :
                                                idx === 1 ? "bg-gradient-to-br from-gray-300 to-gray-500 text-white shadow-gray-500/20" :
                                                    "bg-gradient-to-br from-orange-400 to-red-500 text-white shadow-orange-500/20"
                                                }`}>
                                                {idx + 1}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-white max-w-[120px] truncate group-hover:text-blue-400 transition-colors">
                                                    {user.username || "User"}
                                                </p>
                                                <p className="text-[10px] text-gray-500">{user.weeklySolvedCount} solved</p>
                                            </div>
                                        </div>
                                        {idx === 0 && <Crown size={14} className="text-yellow-500" />}
                                    </div>
                                ))}
                                {weeklyLeaderboard.length === 0 && (
                                    <div className="text-center py-4 text-xs text-gray-500">
                                        No submissions this week by anyone yet.<br />Be the first!
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Mini Motivation - Dynamic */}
                        <DailyQuote />
                    </motion.div>

                </div>
            </motion.div>
        </div>
    );
};

const DashboardCard = ({ title, icon: Icon, color, stats, percentage, onClick }) => {
    const colors = {
        blue: "text-blue-400 group-hover:text-blue-300",
        purple: "text-purple-400 group-hover:text-purple-300",
        orange: "text-orange-400 group-hover:text-orange-300",
        emerald: "text-emerald-400 group-hover:text-emerald-300",
    };

    const bgs = {
        blue: "bg-blue-500",
        purple: "bg-purple-500",
        orange: "bg-orange-500",
        emerald: "bg-emerald-500",
    };

    return (
        <div
            onClick={onClick}
            className="group p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300 cursor-pointer"
        >
            <div className="flex justify-between items-start mb-3">
                <div className={`p-2 rounded-lg bg-white/5 ${colors[color]} transition-colors`}>
                    <Icon size={18} />
                </div>
                <span className="text-xs font-mono text-gray-500 group-hover:text-gray-300 transition-colors">{percentage}%</span>
            </div>

            <h4 className="text-white font-medium text-sm mb-1">{title}</h4>
            <p className="text-xs text-gray-500 mb-3">{stats}</p>

            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className={`h-full rounded-full ${bgs[color]}`}
                />
            </div>
        </div>
    );
};

const StatRow = ({ icon: Icon, color, bg, label, value }) => (
    <div className="flex items-center justify-between group">
        <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center ${color} group-hover:scale-105 transition-transform`}>
                <Icon size={14} />
            </div>
            <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">{label}</span>
        </div>
        <span className="text-white font-medium text-sm font-mono">{value}</span>
    </div>
);

export default Dashboard;

