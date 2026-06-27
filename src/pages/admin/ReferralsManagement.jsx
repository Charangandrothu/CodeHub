import React, { useEffect, useState, useCallback } from 'react';
import { Search, CheckCircle, XCircle, RefreshCw, Users, Award, Percent, AlertCircle, HelpCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../config';
import { motion } from 'framer-motion';

const AnalyticsCard = ({ title, value, icon: Icon, colorTheme, subtitle, loading }) => (
    <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/[0.02] p-6 rounded-xl border border-white/5 shadow-md relative overflow-hidden"
    >
        <div className="flex justify-between items-start mb-4 relative z-10">
            <div className={`p-2.5 rounded-lg border ${colorTheme}`}>
                <Icon className="w-5 h-5" />
            </div>
        </div>
        <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1 relative z-10">{title}</h3>
        {loading ? (
            <div className="h-7 w-24 bg-white/5 rounded animate-pulse mb-1.5" />
        ) : (
            <div className="text-2xl font-bold text-white mb-1 relative z-10">{value}</div>
        )}
        <p className="text-[11px] text-gray-500 relative z-10">{subtitle}</p>
    </motion.div>
);

const ReferralsManagement = () => {
    const { currentUser } = useAuth();
    const [analytics, setAnalytics] = useState({
        total: 0,
        active: 0,
        pending: 0,
        rejected: 0,
        conversionRate: 0,
        topReferrers: []
    });
    const [referrals, setReferrals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [analyticsLoading, setAnalyticsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [actionLoadingId, setActionLoadingId] = useState(null);

    const fetchAnalytics = useCallback(async () => {
        setAnalyticsLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/referrals/admin/analytics`, {
                headers: { 'x-user-uid': currentUser?.uid }
            });
            if (!res.ok) throw new Error("Failed to fetch referral analytics");
            const data = await res.json();
            setAnalytics(data);
        } catch (error) {
            console.error("Error fetching admin referral stats:", error);
            toast.error("Failed to load analytics");
        } finally {
            setAnalyticsLoading(false);
        }
    }, [currentUser]);

    const fetchReferrals = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: currentPage,
                limit: 20,
                status: statusFilter,
                search: searchTerm
            });
            const res = await fetch(`${API_URL}/api/referrals/admin/list?${params.toString()}`, {
                headers: { 'x-user-uid': currentUser?.uid }
            });
            if (!res.ok) throw new Error("Failed to fetch referral list");
            const data = await res.json();
            setReferrals(data.referrals);
            setTotalPages(data.pages);
            setTotalItems(data.total);
        } catch (error) {
            console.error("Error fetching referrals:", error);
            toast.error("Failed to load referral list");
        } finally {
            setLoading(false);
        }
    }, [currentUser, currentPage, statusFilter, searchTerm]);

    const handleAction = async (id, action) => {
        if (!window.confirm(`Are you sure you want to change this referral status to "${action}"?`)) return;

        setActionLoadingId(id);
        try {
            const res = await fetch(`${API_URL}/api/referrals/admin/${id}/action`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-uid': currentUser?.uid
                },
                body: JSON.stringify({ action })
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || "Action failed");
            }

            toast.success(`Referral updated to ${action}`);
            fetchReferrals();
            fetchAnalytics();
        } catch (error) {
            console.error("Error performing admin action:", error);
            toast.error(error.message || "Failed to update referral");
        } finally {
            setActionLoadingId(null);
        }
    };

    useEffect(() => {
        if (currentUser) {
            fetchAnalytics();
        }
    }, [currentUser, fetchAnalytics]);

    useEffect(() => {
        if (currentUser) {
            fetchReferrals();
        }
    }, [currentUser, fetchReferrals]);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const handleFilterChange = (e) => {
        setStatusFilter(e.target.value);
        setCurrentPage(1);
    };

    return (
        <div className="space-y-8 text-zinc-300">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-white mb-1">Referral Operations</h1>
                    <p className="text-gray-500 text-xs font-medium">Manage active referrers, monitor verification metrics, and override referral states manually.</p>
                </div>

                <button
                    onClick={() => { fetchAnalytics(); fetchReferrals(); }}
                    disabled={loading || analyticsLoading}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-semibold text-gray-300 hover:text-white transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
                >
                    <RefreshCw className={`w-3.5 h-3.5 ${(loading || analyticsLoading) ? 'animate-spin' : ''}`} />
                    <span>Sync Database</span>
                </button>
            </div>

            {/* Analytics Dashboard Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <AnalyticsCard
                    title="Total Invitations"
                    value={analytics.total}
                    subtitle="Direct candidate sync events"
                    icon={Users}
                    colorTheme="bg-indigo-500/10 border-indigo-500/20 text-indigo-400"
                    loading={analyticsLoading}
                />
                <AnalyticsCard
                    title="Converted Referrals"
                    value={analytics.active}
                    subtitle="Users meeting all preparation rules"
                    icon={Award}
                    colorTheme="bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                    loading={analyticsLoading}
                />
                <AnalyticsCard
                    title="Conversion Rate"
                    value={`${analytics.conversionRate}%`}
                    subtitle="Sync to Active user ratio"
                    icon={Percent}
                    colorTheme="bg-purple-500/10 border-purple-500/20 text-purple-400"
                    loading={analyticsLoading}
                />
                <AnalyticsCard
                    title="Pending Verification"
                    value={`${analytics.pending} users`}
                    subtitle="Currently working on requirements"
                    icon={AlertCircle}
                    colorTheme="bg-orange-500/10 border-orange-500/20 text-orange-400"
                    loading={analyticsLoading}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Referrals Database Table */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Filter by email address or UID..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                                className="w-full bg-white/[0.02] border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-white/10"
                            />
                        </div>

                        <select
                            value={statusFilter}
                            onChange={handleFilterChange}
                            className="bg-white/[0.02] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-white/10 cursor-pointer min-w-[140px]"
                        >
                            <option value="">All Statuses</option>
                            <option value="Pending">Pending</option>
                            <option value="Active">Active</option>
                            <option value="Rejected">Rejected</option>
                        </select>
                    </div>

                    <div className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden shadow-lg">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-white/[0.03] border-b border-white/5">
                                    <tr>
                                        <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Referrer</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Referred Candidate</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Activity Metrics</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">State</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {loading ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-12 text-center text-zinc-500">
                                                <div className="flex flex-col items-center justify-center gap-2">
                                                    <div className="w-5 h-5 border border-white/10 border-t-blue-500 rounded-full animate-spin" />
                                                    <span className="text-xs">Querying database...</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : referrals.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-12 text-center text-xs text-gray-600">
                                                No referral records match the query.
                                            </td>
                                        </tr>
                                    ) : (
                                        referrals.map((ref) => {
                                            const isPending = ref.status === 'Pending';
                                            const isActive = ref.status === 'Active';
                                            const isRejected = ref.status === 'Rejected';

                                            return (
                                                <tr key={ref._id} className="hover:bg-white/[0.01] transition-colors text-xs">
                                                    {/* Referrer Details */}
                                                    <td className="px-6 py-4">
                                                        <div className="font-semibold text-white">@{ref.referrerUsername}</div>
                                                        <div className="text-[10px] text-gray-500 truncate max-w-[150px]">{ref.referrerEmail}</div>
                                                        <div className="text-[9px] text-gray-650 font-mono mt-0.5 truncate max-w-[150px]" title={ref.referrerId}>
                                                            UID: {ref.referrerId.substring(0, 8)}...
                                                        </div>
                                                    </td>

                                                    {/* Referred details */}
                                                    <td className="px-6 py-4">
                                                        <div className="font-semibold text-white">@{ref.referredUsername}</div>
                                                        <div className="text-[10px] text-gray-500 truncate max-w-[150px]">{ref.referredEmail}</div>
                                                        <div className="text-[9px] text-gray-650 font-mono mt-0.5 truncate max-w-[150px]" title={ref.referredId}>
                                                            UID: {ref.referredId.substring(0, 8)}...
                                                        </div>
                                                    </td>

                                                    {/* Metrics */}
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col gap-1 text-[10px] text-gray-400">
                                                            <div className="flex items-center gap-1.5">
                                                                <span className={`w-1.5 h-1.5 rounded-full ${ref.profileCompleted ? 'bg-emerald-500' : 'bg-white/10'}`} />
                                                                <span>Profile Sync</span>
                                                            </div>
                                                            <div>
                                                                Active Days: <span className={`font-mono font-bold ${ref.referredDaysActive >= 3 ? 'text-white' : 'text-gray-500'}`}>{ref.referredDaysActive}/3</span>
                                                            </div>
                                                            <div>
                                                                Solved Problems: <span className={`font-mono font-bold ${ref.referredProblemsSolved >= 3 ? 'text-white' : 'text-gray-500'}`}>{ref.referredProblemsSolved}/3</span>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Status Badge */}
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${
                                                            isActive
                                                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_8px_rgba(16,185,129,0.05)]'
                                                                : isRejected
                                                                    ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                                                    : 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_8px_rgba(245,158,11,0.05)]'
                                                        }`}>
                                                            {ref.status}
                                                        </span>
                                                    </td>

                                                    {/* Administrative actions */}
                                                    <td className="px-6 py-4 text-right">
                                                        {actionLoadingId === ref._id ? (
                                                            <div className="w-4 h-4 border border-white/10 border-t-blue-500 rounded-full animate-spin ml-auto" />
                                                        ) : (
                                                            <div className="flex items-center justify-end gap-1.5">
                                                                {!isActive && (
                                                                    <button
                                                                        onClick={() => handleAction(ref._id, 'Active')}
                                                                        className="p-1 text-gray-500 hover:text-emerald-400 transition-colors cursor-pointer"
                                                                        title="Approve & Force Reward"
                                                                    >
                                                                        <CheckCircle size={15} />
                                                                    </button>
                                                                )}
                                                                {!isRejected && (
                                                                    <button
                                                                        onClick={() => handleAction(ref._id, 'Rejected')}
                                                                        className="p-1 text-gray-500 hover:text-red-400 transition-colors cursor-pointer"
                                                                        title="Flag Suspicious"
                                                                    >
                                                                        <XCircle size={15} />
                                                                    </button>
                                                                )}
                                                                {(isActive || isRejected) && (
                                                                    <button
                                                                        onClick={() => handleAction(ref._id, 'Pending')}
                                                                        className="p-1 text-gray-500 hover:text-gray-300 transition-colors cursor-pointer"
                                                                        title="Reset to Pending"
                                                                    >
                                                                        <RefreshCw size={12} />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Footer */}
                        {totalPages > 1 && (
                            <div className="bg-white/[0.01] px-6 py-4 flex items-center justify-between border-t border-white/5">
                                <span className="text-xs text-gray-550">
                                    Page <span className="text-white font-semibold">{currentPage}</span> of <span className="text-white font-semibold">{totalPages}</span> ({totalItems} total)
                                </span>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1 || loading}
                                        className="px-3 py-1.5 bg-white/5 border border-white/10 hover:bg-white/10 text-[10px] font-semibold text-white rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages || loading}
                                        className="px-3 py-1.5 bg-white/5 border border-white/10 hover:bg-white/10 text-[10px] font-semibold text-white rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Side: Leaderboard Top Performers */}
                <div className="space-y-6">
                    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6 shadow-md">
                        <h2 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Award className="text-purple-400 w-4 h-4" />
                            Top Promoters
                        </h2>

                        {analyticsLoading ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-10 bg-white/5 rounded animate-pulse" />
                                ))}
                            </div>
                        ) : analytics.topReferrers?.length === 0 ? (
                            <div className="text-gray-500 text-xs">No referrals active.</div>
                        ) : (
                            <div className="space-y-3">
                                {analytics.topReferrers?.map((ref, idx) => {
                                    const isFirst = idx === 0;
                                    const isSecond = idx === 1;
                                    const isThird = idx === 2;

                                    return (
                                        <div
                                            key={ref.username}
                                            className={`flex items-center justify-between p-3 rounded-lg border ${
                                                isFirst 
                                                    ? 'border-amber-500/20 bg-amber-500/[0.02]' 
                                                    : isSecond 
                                                        ? 'border-indigo-500/20 bg-indigo-500/[0.02]' 
                                                        : 'border-white/5 bg-white/[0.01]'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                                                    isFirst 
                                                        ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-black shadow-md shadow-amber-500/20' 
                                                        : isSecond 
                                                            ? 'bg-gradient-to-br from-slate-300 to-slate-500 text-black shadow-md shadow-slate-500/10' 
                                                            : 'bg-gradient-to-br from-amber-700 to-amber-900 text-white shadow-md'
                                                }`}>
                                                    {idx + 1}
                                                </div>
                                                <div className="overflow-hidden">
                                                    <div className="font-semibold text-xs text-white truncate">
                                                        {ref.displayName || ref.username}
                                                    </div>
                                                    <div className="text-[9px] text-gray-500 truncate">
                                                        @{ref.username}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="text-right shrink-0 font-mono">
                                                <div className="font-bold text-xs text-white">
                                                    {ref.count} refs
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Conversion Rules Cheat-sheet */}
                    <div className="bg-white/[0.01] border border-white/5 rounded-xl p-6">
                        <h2 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                            <HelpCircle className="text-gray-500 w-4 h-4" />
                            Activity Rules
                        </h2>
                        <ul className="space-y-3 text-xs text-gray-500 leading-relaxed font-medium">
                            <li className="flex items-start gap-2">
                                <span className="text-gray-600 mt-0.5">•</span>
                                <span>Initial sync places candidate registration details into <strong className="text-gray-400">Pending</strong> states.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-gray-600 mt-0.5">•</span>
                                <span>The status auto-updates to <strong className="text-emerald-400">Active</strong> once profile completions are validated and activity metrics exceed 3 active days + 3 resolved challenges.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-gray-600 mt-0.5">•</span>
                                <span>Bypasses or manual unlocks can be completed via the <strong className="text-white">Approve</strong> button.</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReferralsManagement;
