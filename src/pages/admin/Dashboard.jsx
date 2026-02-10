import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../config';
import { Users, CreditCard, Award, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

const StatsCard = ({ title, value, icon: Icon, color, loading }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#111] p-6 rounded-xl border border-gray-800 hover:border-gray-700 transition-all"
    >
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-lg ${color} bg-opacity-10`}>
                <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
            </div>
            {/* <span className="text-xs font-medium text-green-400 flex items-center gap-1">
                +12% <ArrowUpRight className="w-3 h-3" />
            </span> */}
        </div>
        <h3 className="text-gray-400 text-sm font-medium mb-1">{title}</h3>
        {loading ? (
            <div className="h-8 w-24 bg-gray-800 rounded animate-pulse" />
        ) : (
            <div className="text-3xl font-bold text-white">{value}</div>
        )}
    </motion.div>
);

const AdminDashboard = () => {
    const { currentUser } = useAuth();
    const [stats, setStats] = useState({
        totalUsers: 0,
        proUsers: 0,
        totalRevenue: 0,
        activeProblems: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch(`${API_URL}/api/admin/stats`, {
                    headers: {
                        'x-user-uid': currentUser?.uid // In real app use token
                    }
                });
                if (!res.ok) throw new Error("Failed to fetch stats");
                const data = await res.json();

                setStats({
                    totalUsers: data.totalUsers,
                    proUsers: data.proUsers,
                    totalRevenue: data.totalRevenue,
                    activeProblems: data.activeProblems
                });
            } catch (error) {
                console.error("Error fetching stats:", error);
            } finally {
                setLoading(false);
            }
        };

        if (currentUser) fetchStats();
    }, [currentUser]);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-white mb-2">Dashboard Overview</h1>
                <p className="text-gray-400">Welcome back, Admin. Here's what's happening today.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Total Users"
                    value={stats.totalUsers}
                    icon={Users}
                    color="bg-blue-500"
                    loading={loading}
                />
                <StatsCard
                    title="Pro Users"
                    value={stats.proUsers}
                    icon={Award}
                    color="bg-purple-500"
                    loading={loading}
                />
                <StatsCard
                    title="Total Revenue"
                    value={`$${stats.totalRevenue}`}
                    icon={CreditCard}
                    color="bg-green-500"
                    loading={loading}
                />
                <StatsCard
                    title="Total Problems"
                    value={stats.activeProblems}
                    icon={Activity}
                    color="bg-orange-500"
                    loading={loading}
                />
            </div>

            {/* Recent Activity Section could go here */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-[#111] border border-gray-800 rounded-xl p-6">
                    <h2 className="text-lg font-bold text-white mb-4">Recent Users</h2>
                    {/* Placeholder for recent users list */}
                    <div className="text-gray-500 text-sm">No recent activity</div>
                </div>
                <div className="bg-[#111] border border-gray-800 rounded-xl p-6">
                    <h2 className="text-lg font-bold text-white mb-4">Recent Transactions</h2>
                    {/* Placeholder for recent transactions */}
                    <div className="text-gray-500 text-sm">No recent transactions</div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
