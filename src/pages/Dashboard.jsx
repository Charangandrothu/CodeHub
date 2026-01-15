import React from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const Dashboard = () => {
    const { currentUser } = useAuth();

    return (
        <div className="min-h-screen bg-[#0a0a0a] pt-24 px-6 text-white">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Warning Banner */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 flex items-center gap-3"
                >
                    <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                    <p className="text-yellow-200 text-sm">
                        This is a demo dashboard. Connect your backend to see real data.
                    </p>
                </motion.div>

                {/* Welcome Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                        Welcome back, {currentUser?.displayName || 'User'}!
                    </h1>
                    <p className="text-gray-400 mt-2">Pick up where you left off in your learning journey.</p>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { label: 'Courses in Progress', value: '3', color: 'from-blue-500 to-cyan-500' },
                        { label: 'Hours Spent', value: '12.5', color: 'from-purple-500 to-pink-500' },
                        { label: 'Certificates Earned', value: '1', color: 'from-emerald-500 to-green-500' }
                    ].map((stat, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + (index * 0.1) }}
                            className="p-6 rounded-2xl bg-white/5 border border-white/10 relative overflow-hidden group"
                        >
                            <div className={`absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br ${stat.color} rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity`} />
                            <h3 className="text-4xl font-bold text-white mb-1 relative z-10">{stat.value}</h3>
                            <p className="text-gray-400 text-sm relative z-10">{stat.label}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Recent Activity Placeholder */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-8 p-6 rounded-2xl bg-white/5 border border-white/10"
                >
                    <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
                    <div className="space-y-4">
                        {[1, 2, 3].map((_, i) => (
                            <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer">
                                <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center text-xs text-gray-400">
                                    DEV
                                </div>
                                <div>
                                    <h4 className="font-medium text-sm">Completed Module {i + 1}</h4>
                                    <p className="text-xs text-gray-500">2 hours ago</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Dashboard;
