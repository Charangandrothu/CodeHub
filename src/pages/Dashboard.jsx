import React from 'react';
import { useAuth } from '../context/AuthContext';
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
    Zap
} from 'lucide-react';
import { Button } from '../components/ui/Button';

const Dashboard = () => {
    const { currentUser } = useAuth();

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
                                    <span className="text-[10px] font-semibold text-orange-400 uppercase tracking-wide">12 Day Streak</span>
                                </div>
                            </div>
                            <h1 className="text-2xl font-bold text-white tracking-tight">
                                Welcome back, <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">{currentUser?.displayName || 'Developer'}</span> 👋
                            </h1>
                            <p className="text-gray-400 text-sm mt-1">Continue your structured placement preparation</p>
                        </div>

                        <div className="hidden md:flex items-center gap-6">
                            <div className="text-right">
                                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Weekly Rank</p>
                                <div className="flex items-end justify-end gap-2">
                                    <span className="text-xl font-bold text-white">Top 5%</span>
                                    <Trophy size={16} className="text-yellow-500 mb-1" />
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Main Content Area (2 Cols) */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Continue Learning CTA - Primary Focus */}
                        <motion.div
                            variants={itemVariants}
                            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-blue-900/10 via-white/[0.02] to-transparent p-6 hover:border-blue-500/30 transition-all duration-300"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                                <div className="flex items-start gap-4">
                                    <div className="p-3.5 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/20">
                                        <Code2 size={24} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-blue-400 font-medium uppercase tracking-wider mb-1">Coming Next</p>
                                        <h3 className="text-lg font-bold text-white mb-1 group-hover:text-blue-300 transition-colors">Arrays & Hashing</h3>
                                        <p className="text-sm text-gray-400 mb-2 flex items-center gap-2">
                                            <span>Topic: Binary Search</span>
                                            <span className="w-1 h-1 rounded-full bg-gray-600" />
                                            <span>25 mins remaining</span>
                                        </p>
                                        <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
                                            <div className="h-full w-[65%] bg-blue-500 rounded-full" />
                                        </div>
                                    </div>
                                </div>

                                <Button className="shrink-0 w-full sm:w-auto" icon={ArrowRight}>
                                    Continue Practice
                                </Button>
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
                                    stats="42/150 Solved"
                                    percentage={28}
                                />
                                <DashboardCard
                                    title="Mock Tests"
                                    icon={Target}
                                    color="purple"
                                    stats="3/10 Completed"
                                    percentage={30}
                                />
                                <DashboardCard
                                    title="Aptitude"
                                    icon={Zap}
                                    color="orange"
                                    stats="15/50 Topics"
                                    percentage={30}
                                />
                                <DashboardCard
                                    title="System Design"
                                    icon={Layout}
                                    color="emerald"
                                    stats="5/20 Concepts"
                                    percentage={25}
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
                                    value="12 Days"
                                />
                                <StatRow
                                    icon={CheckCircle2}
                                    color="text-green-500"
                                    bg="bg-green-500/10"
                                    label="Problems Solved"
                                    value="148"
                                />
                                <StatRow
                                    icon={Clock}
                                    color="text-blue-500"
                                    bg="bg-blue-500/10"
                                    label="Time Spent"
                                    value="42h 15m"
                                />
                            </div>

                            <div className="mt-6 pt-5 border-t border-white/5">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-500">Global Rank</span>
                                    <span className="text-white font-mono font-medium">#1,248</span>
                                </div>
                            </div>
                        </div>

                        {/* Mini Motivation */}
                        <div className="p-5 rounded-2xl border border-white/5 bg-gradient-to-br from-purple-900/10 to-blue-900/10">
                            <BookOpen size={20} className="text-purple-400 mb-3" />
                            <p className="text-gray-300 text-sm italic leading-relaxed">
                                "Code is like humor. When you have to explain it, it’s bad."
                            </p>
                            <p className="text-xs text-gray-500 mt-2">— Cory House</p>
                        </div>
                    </motion.div>

                </div>
            </motion.div>
        </div>
    );
};

const DashboardCard = ({ title, icon: Icon, color, stats, percentage }) => {
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
        <div className="group p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300 cursor-pointer">
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

