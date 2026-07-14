import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, Trophy, Gift, Copy, Share2, Check,
    AlertTriangle, ArrowRight, Mail,
    CheckCircle, Clock, X, Award, Flame, ExternalLink, Sparkles
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { API_URL } from '../config';

const Referrals = () => {
    const { currentUser } = useAuth();
    const [stats, setStats] = useState({
        referralCode: '',
        totalReferrals: 0,
        activeReferrals: 0,
        pendingReferrals: 0,
        rejectedReferrals: 0,
        xp: 0,
        badges: [],
        notifications: []
    });
    const [history, setHistory] = useState([]);
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const refLink = `${window.location.origin}/login?ref=${stats.referralCode}`;

    const fetchReferralData = async () => {
        if (!currentUser) return;
        try {
            setLoading(true);
            const headers = { 'x-user-uid': currentUser.uid };

            // Fetch Stats
            const statsRes = await fetch(`${API_URL}/api/referrals/stats`, { headers });
            if (statsRes.ok) {
                const statsData = await statsRes.json();
                setStats(statsData);
            }

            // Fetch History
            const historyRes = await fetch(`${API_URL}/api/referrals/history`, { headers });
            if (historyRes.ok) {
                setHistory(await historyRes.json());
            }

            // Fetch Leaderboard
            const lbRes = await fetch(`${API_URL}/api/referrals/leaderboard`, { headers });
            if (lbRes.ok) {
                setLeaderboard(await lbRes.json());
            }
        } catch (err) {
            console.error("Error fetching referral data:", err);
            toast.error("Failed to load referral data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReferralData();
    }, [currentUser]);

    const handleCheckStatus = async () => {
        try {
            setRefreshing(true);
            const headers = { 'x-user-uid': currentUser.uid };
            const res = await fetch(`${API_URL}/api/referrals/check-status`, {
                method: 'POST',
                headers
            });
            if (res.ok) {
                toast.success("Referrals verified");
                await fetchReferralData();
            } else {
                toast.error("Failed to sync stats");
            }
        } catch (err) {
            console.error("Status check error:", err);
            toast.error("Verification failed");
        } finally {
            setRefreshing(false);
        }
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(refLink);
        toast.success("Link copied!");
    };

    const handleCopyCode = () => {
        navigator.clipboard.writeText(stats.referralCode);
        toast.success("Code copied!");
    };

    const shareMessage = `Prepare for placements with me on CodeHubX! Solve problems, earn XP, and unlock rewards. Use my link: ${refLink}`;

    const handleShare = (platform) => {
        let url = '';
        if (platform === 'whatsapp') {
            url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`;
        } else if (platform === 'linkedin') {
            url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(refLink)}`;
        } else if (platform === 'telegram') {
            url = `https://t.me/share/url?url=${encodeURIComponent(refLink)}&text=${encodeURIComponent(shareMessage)}`;
        }
        window.open(url, '_blank', 'width=600,height=400');
    };

    // Milestones definitions
    const MILESTONES = [
        { level: 1, limit: 5, reward: '7 Days Pro Access', badge: 'Bronze Recruiter', xp: '50 XP', desc: 'Core roadmap modules and compiler credits' },
        { level: 2, limit: 10, reward: '15 Days Pro Access', badge: 'Silver Recruiter', xp: '150 XP', desc: 'Extended question preparation sets' },
        { level: 3, limit: 20, reward: '1 Month Pro Access', badge: 'Gold Recruiter', xp: '500 XP', desc: 'Full premium experience and analytics' },
        { level: 4, limit: 50, reward: '1 Month Elite Access', badge: 'Elite Recruiter', xp: '2000 XP', desc: 'Elite mock tests and verified company guides' },
        { level: 5, limit: 100, reward: 'Ambassador Access & Commission', badge: 'Ambassador', xp: '5000 XP', desc: 'Direct commissions and certificate unlock' }
    ];

    // Find next milestone
    const nextMilestone = MILESTONES.find(m => stats.activeReferrals < m.limit) || MILESTONES[MILESTONES.length - 1];
    const prevMilestoneLimit = MILESTONES.find(m => stats.activeReferrals < m.limit)?.level > 1
        ? MILESTONES[MILESTONES.indexOf(nextMilestone) - 1].limit
        : 0;

    const progressPercent = nextMilestone
        ? Math.min(100, Math.round(((stats.activeReferrals - prevMilestoneLimit) / (nextMilestone.limit - prevMilestoneLimit)) * 100))
        : 100;

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
                <div className="relative w-10 h-10">
                    <div className="absolute inset-0 rounded-full border-2 border-white/5" />
                    <div className="absolute inset-0 rounded-full border-2 border-t-blue-500 animate-spin" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] pt-24 pb-20 px-4 sm:px-6 lg:px-8 text-zinc-300 relative overflow-hidden bg-grid-white/[0.015] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-[#0a0a0a] to-[#0a0a0a]">
            {/* Ambient Lighting matching other pages */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[400px] bg-gradient-to-b from-blue-500/5 to-transparent blur-[120px] pointer-events-none" />

            <motion.div
                className="max-w-6xl mx-auto space-y-10 relative z-10"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
            >
                {/* ── Page Header ── */}
                <div className="text-center max-w-2xl mx-auto space-y-4 pt-6">
                    <motion.div
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 backdrop-blur-sm shadow-[0_2px_10px_rgba(99,102,241,0.1)]"
                        whileHover={{ scale: 1.05 }}
                    >
                        <Sparkles size={11} className="text-indigo-400 animate-pulse" />
                        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Referral Campaign</span>
                    </motion.div>

                    <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                        Invite Colleagues.<br />
                        <span className="bg-gradient-to-r from-white via-indigo-200 to-purple-400 bg-clip-text text-transparent">
                            Unlock Premium Rewards.
                        </span>
                    </h1>
                    <p className="text-gray-400 text-xs sm:text-sm leading-relaxed max-w-lg mx-auto font-medium">
                        Invite your friends to CodeHubX. Earn developer XP, exclusive badges, and free Pro/Elite subscription periods.
                    </p>
                </div>

                {/* ── Notification Banner (Unread Alerts) ── */}
                {stats.notifications && stats.notifications.filter(n => !n.read).length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-4 rounded-xl border border-indigo-500/20 bg-indigo-950/10 backdrop-blur-md flex items-center justify-between gap-4 shadow-lg"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                            <p className="text-xs text-zinc-300 font-semibold">
                                {stats.notifications.filter(n => !n.read)[0].message}
                            </p>
                        </div>
                        <button
                            onClick={async () => {
                                const headers = { 'x-user-uid': currentUser.uid };
                                await fetch(`${API_URL}/api/referrals/clear-notifications`, { method: 'POST', headers });
                                setStats(prev => ({
                                    ...prev,
                                    notifications: prev.notifications.map(n => ({ ...n, read: true }))
                                }));
                            }}
                            className="text-[10px] font-black text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-widest cursor-pointer"
                        >
                            Mark Read
                        </button>
                    </motion.div>
                )}

                {/* ── Main Dashboard Cards Grid ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Invite Sharing Card */}
                    <motion.div
                        whileHover={{ y: -2 }}
                        className="lg:col-span-2 p-6 sm:p-8 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-xl flex flex-col justify-between space-y-6 relative overflow-hidden group shadow-lg hover:border-indigo-500/20 transition-all duration-300"
                    >
                        {/* Shimmer Effect overlay */}
                        <div className="absolute top-0 -left-[100%] w-1/2 h-full bg-gradient-to-r from-transparent via-indigo-500/[0.03] to-transparent skew-x-12 group-hover:animate-[shimmer_1.8s_ease-in-out_infinite]" />

                        <div className="space-y-4">
                            <h3 className="text-xs font-black text-white uppercase tracking-widest">Share Invitation Links</h3>
                            <p className="text-xs text-gray-400 leading-relaxed font-medium">
                                Copy and share your unique signup link or code. When candidates sign up and meet activity requirements, rewards are unlocked automatically on your profile.
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                                {/* Referral Code Box */}
                                <div className="p-4 rounded-xl bg-black/40 border border-white/5 flex flex-col justify-between space-y-2 group/code hover:border-indigo-500/20 transition-colors">
                                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Referral Code</span>
                                    <div className="flex items-center justify-between bg-white/5 px-3 py-2.5 rounded-lg border border-white/5">
                                        <span className="font-mono text-sm font-bold text-white tracking-widest">{stats.referralCode || 'CODE'}</span>
                                        <button onClick={handleCopyCode} className="p-1 text-gray-400 hover:text-white transition-colors cursor-pointer" title="Copy Code">
                                            <Copy size={13} />
                                        </button>
                                    </div>
                                </div>

                                {/* Referral Link Box */}
                                <div className="p-4 rounded-xl bg-black/40 border border-white/5 flex flex-col justify-between space-y-2 group/link hover:border-indigo-500/20 transition-colors">
                                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Signup Link</span>
                                    <div className="flex items-center justify-between bg-white/5 px-3 py-2.5 rounded-lg border border-white/5">
                                        <span className="text-xs text-gray-400 truncate max-w-[155px] font-mono">{refLink}</span>
                                        <button onClick={handleCopyLink} className="p-1 text-gray-400 hover:text-white transition-colors cursor-pointer" title="Copy Link">
                                            <Copy size={13} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Social Share Buttons */}
                        <div className="pt-5 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Share Channels</span>
                            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                                <button
                                    onClick={() => handleShare('whatsapp')}
                                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4.5 py-2.5 rounded-xl text-xs font-bold bg-emerald-500/5 border border-emerald-500/25 text-emerald-400 hover:border-emerald-500/40 hover:bg-emerald-500/10 hover:text-emerald-300 transition-all cursor-pointer shadow-[0_2px_10px_rgba(16,185,129,0.05)] hover:-translate-y-px active:scale-[0.98]"
                                >
                                    WhatsApp
                                </button>
                                <button
                                    onClick={() => handleShare('linkedin')}
                                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4.5 py-2.5 rounded-xl text-xs font-bold bg-blue-500/5 border border-blue-500/25 text-blue-400 hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-blue-300 transition-all cursor-pointer shadow-[0_2px_10px_rgba(59,130,246,0.05)] hover:-translate-y-px active:scale-[0.98]"
                                >
                                    LinkedIn
                                </button>
                                <button
                                    onClick={() => handleShare('telegram')}
                                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4.5 py-2.5 rounded-xl text-xs font-bold bg-sky-500/5 border border-sky-500/25 text-sky-400 hover:border-sky-500/40 hover:bg-sky-500/10 hover:text-sky-300 transition-all cursor-pointer shadow-[0_2px_10px_rgba(14,165,233,0.05)] hover:-translate-y-px active:scale-[0.98]"
                                >
                                    Telegram
                                </button>
                            </div>
                        </div>
                    </motion.div>
                               {/* Right Column: Progress Card */}
                    <motion.div
                        whileHover={{ y: -2 }}
                        className="p-6 rounded-2xl border border-white/5 bg-gradient-to-br from-indigo-950/10 via-white/[0.02] to-transparent flex flex-col justify-between space-y-6 relative overflow-hidden group shadow-lg hover:border-indigo-500/20 transition-all duration-300"
                    >
                        {/* Define gradients for progress rings */}
                        <svg className="absolute w-0 h-0">
                            <defs>
                                <linearGradient id="ringBluePurple" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#818cf8" />
                                    <stop offset="100%" stopColor="#a78bfa" />
                                </linearGradient>
                            </defs>
                        </svg>

                        <div className="space-y-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest block">Milestone Ring</span>
                                    <span className="text-gray-550 text-[10px] font-bold block mt-0.5">Active Referred Users</span>
                                </div>
                                <div className="p-2 rounded-lg bg-white/5 border border-white/5 text-gray-400">
                                    <Users size={15} />
                                </div>
                            </div>

                            {/* Circular Premium Gradient Progress Ring */}
                            <div className="flex items-center justify-center pt-2">
                                <div className="relative w-28 h-28 flex items-center justify-center">
                                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                        <circle
                                            cx="50"
                                            cy="50"
                                            r="40"
                                            className="stroke-white/5"
                                            strokeWidth="5"
                                            fill="transparent"
                                        />
                                        <motion.circle
                                            cx="50"
                                            cy="50"
                                            r="40"
                                            stroke="url(#ringBluePurple)"
                                            strokeWidth="5.5"
                                            fill="transparent"
                                            strokeDasharray="251.2"
                                            initial={{ strokeDashoffset: 251.2 }}
                                            animate={{ strokeDashoffset: 251.2 - (251.2 * progressPercent) / 100 }}
                                            transition={{ duration: 1.0, ease: "easeOut" }}
                                            strokeLinecap="round"
                                            style={{ filter: 'drop-shadow(0 0 6px rgba(129,140,248,0.25))' }}
                                        />
                                    </svg>
                                    <div className="absolute flex flex-col items-center justify-center text-center">
                                        <span className="text-2xl font-bold text-white leading-none">{stats.activeReferrals}</span>
                                        <span className="text-[8px] text-indigo-400 font-black uppercase tracking-widest mt-1">Active</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Reward status */}
                        <div className="p-3 rounded-xl border border-white/5 bg-black/40 text-xs">
                            <div className="flex items-center gap-3">
                                <div className="p-1.5 rounded-lg bg-white/5 border border-white/5 text-indigo-400 shrink-0">
                                    <Award size={14} />
                                </div>
                                <div className="min-w-0">
                                    <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest block">Next Milestone Reward</span>
                                    <span className="font-bold text-white truncate block mt-0.5">{nextMilestone?.reward}</span>
                                </div>
                            </div>
                        </div>

                        {/* On-Demand status check / refresh button */}
                        <button
                            onClick={handleCheckStatus}
                            disabled={refreshing}
                            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold cursor-pointer transition-all duration-200 bg-white text-black hover:bg-zinc-200 border border-transparent shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:-translate-y-px active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {refreshing ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-3.5 h-3.5 rounded-full border-2 border-black/30 border-transparent border-t-black animate-spin" />
                                    <span className="text-zinc-700 font-semibold">Verifying...</span>
                                </div>
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    <Flame size={13} className="text-amber-600 fill-amber-600" />
                                    Verify Referral Stats
                                </span>
                            )}
                        </button>
                    </motion.div>
                </div>

                {/* ── Referral Milestones & Rewards Timeline ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <motion.div
                        className="lg:col-span-2 p-6 sm:p-8 rounded-2xl border border-white/5 bg-[#0a0a0a]/50 backdrop-blur-xl space-y-6"
                    >
                        <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                            <Trophy size={15} className="text-indigo-400" />
                            Milestones Schedule
                        </h3>

                        <div className="relative border-l border-white/5 pl-6 space-y-6 ml-2.5 pt-2">
                            {MILESTONES.map((milestone) => {
                                const isUnlocked = stats.activeReferrals >= milestone.limit;
                                return (
                                    <div key={milestone.level} className="relative group/item">
                                        {/* Node indicator */}
                                        <div className={`absolute -left-[30px] top-2.5 w-2.5 h-2.5 rounded-full border transition-all duration-300 ${isUnlocked
                                            ? 'bg-indigo-400 border-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.35)] scale-110'
                                            : 'bg-[#0a0a0a] border-white/10'
                                            }`}>
                                        </div>

                                        <div className={`p-4 rounded-xl border transition-all duration-300 ${isUnlocked
                                            ? 'border-indigo-500/20 bg-gradient-to-br from-indigo-950/10 via-white/[0.02] to-transparent shadow-md hover:border-indigo-500/30'
                                            : 'border-white/5 bg-transparent opacity-50'
                                            } flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4`}>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Level {milestone.level}</span>
                                                    <span className="w-1 h-1 rounded-full bg-white/5" />
                                                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${isUnlocked
                                                        ? 'bg-purple-500/10 border border-purple-500/20 text-purple-400'
                                                        : 'bg-white/5 border-white/10 text-gray-500'
                                                        }`}>
                                                        {milestone.limit} referrals
                                                    </span>
                                                </div>
                                                <h4 className={`text-sm font-bold ${isUnlocked ? 'text-white' : 'text-gray-400'}`}>{milestone.reward}</h4>
                                                <p className="text-xs text-gray-500">{milestone.desc}</p>
                                            </div>

                                            <div className="flex items-center gap-2 self-end sm:self-center">
                                                <span className="text-[10px] px-2 py-1 rounded bg-black/40 border border-white/5 text-gray-400 font-semibold">{milestone.xp}</span>
                                                <span className={`text-[10px] px-2 py-1 rounded border font-semibold ${isUnlocked
                                                    ? 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shadow-sm'
                                                    : 'bg-white/5 border-white/10 text-gray-500'
                                                    }`}>
                                                    {milestone.badge}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>

                    {/* How it works / Validation rules sidebar */}
                    <div className="space-y-6">
                        <div className="p-6 rounded-2xl border border-white/5 bg-[#0a0a0a]/50 backdrop-blur-xl space-y-5 shadow-lg">
                            <h3 className="text-xs font-black text-white uppercase tracking-widest">Activity Walkthrough</h3>

                            <div className="space-y-4">
                                {[
                                    { step: 1, text: "Friend logs in via your invitation link" },
                                    { step: 2, text: "Friend registers account and completes profile details" },
                                    { step: 3, text: "Friend remains active on 3 separate days" },
                                    { step: 4, text: "Friend achieves 3 correct coding submissions" },
                                    { step: 5, text: "Invite converts to active status and unlocks rewards" }
                                ].map((step) => (
                                    <div key={step.step} className="flex items-start gap-3">
                                        <div className="w-5 h-5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-[10px] font-bold text-indigo-400 shrink-0 mt-0.5">
                                            {step.step}
                                        </div>
                                        <p className="text-xs text-zinc-300 leading-relaxed font-medium">{step.text}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Muted validation metrics */}
                        <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] space-y-4">
                            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                                <AlertTriangle size={13} className="text-gray-500" />
                                Anti-Fraud Verification
                            </h4>
                            <p className="text-xs text-gray-500 leading-relaxed font-medium">
                                System verification queries automatically reject duplicate logins, self-invites, or inactive registrations.
                            </p>
                            <div className="grid grid-cols-2 gap-2 text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                                <div className="flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                                    <span>Unique Email</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                                    <span>Profile Complete</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                                    <span>3 Active Days</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                                    <span>3 Solved Tasks</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Leaderboard Section ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Top Promoters list card */}
                    <motion.div
                        className="p-6 rounded-2xl border border-white/5 bg-[#0a0a0a]/50 backdrop-blur-xl space-y-5 shadow-lg"
                    >
                        <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-1.5">
                            <Trophy size={13} className="text-indigo-400" />
                            Monthly Rankings
                        </h3>

                        <div className="space-y-3">
                            {leaderboard.slice(0, 3).map((item, idx) => {
                                const isFirst = idx === 0;
                                const isSecond = idx === 1;
                                const isThird = idx === 2;

                                return (
                                    <div
                                        key={item.userId}
                                        className={`p-3.5 rounded-xl border ${
                                            isFirst 
                                                ? 'border-amber-500/20 bg-amber-500/[0.02] shadow-[0_4px_20px_rgba(245,158,11,0.03)]' 
                                                : isSecond
                                                    ? 'border-indigo-500/10 bg-indigo-500/[0.02]'
                                                    : 'border-white/5 bg-white/[0.01]'
                                        } flex items-center justify-between gap-4 transition-all`}
                                    >
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            {/* Podium Indicators */}
                                            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black ${
                                                isFirst 
                                                    ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-black shadow-[0_2px_10px_rgba(245,158,11,0.25)]' 
                                                    : isSecond
                                                        ? 'bg-gradient-to-br from-slate-300 to-slate-500 text-black shadow-[0_2px_8px_rgba(203,213,225,0.2)]'
                                                        : 'bg-gradient-to-br from-amber-700 to-amber-900 text-white shadow-[0_2px_6px_rgba(180,83,9,0.15)]'
                                            }`}>
                                                {idx + 1}
                                            </div>

                                            <div className="flex items-center gap-2 min-w-0">
                                                <img
                                                    src={item.photoURL || `https://api.dicebear.com/9.x/adventurer/svg?seed=${item.username}`}
                                                    alt={item.username}
                                                    className="w-7 h-7 rounded-full object-cover border border-white/5"
                                                />
                                                <div className="min-w-0">
                                                    <p className={`text-xs font-bold truncate ${isFirst ? 'text-amber-300' : 'text-zinc-300'}`}>{item.displayName}</p>
                                                    <p className="text-[9px] text-gray-500 truncate">@{item.username}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="text-right shrink-0">
                                            <p className="text-xs font-bold text-white font-mono">{item.referralsCount} active</p>
                                            <span className={`text-[8px] font-black uppercase tracking-widest block mt-0.5 ${isFirst ? 'text-amber-400' : 'text-indigo-400'}`}>{item.badge}</span>
                                        </div>
                                    </div>
                                );
                            })}

                            {leaderboard.length === 0 && (
                                <div className="text-center py-6 text-xs text-gray-500 font-medium">
                                    Awaiting monthly activations.
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* History Table */}
                    <motion.div
                        className="lg:col-span-2 p-6 sm:p-8 rounded-2xl border border-white/5 bg-[#0a0a0a]/50 backdrop-blur-xl space-y-6 shadow-lg"
                    >
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div>
                                <h3 className="text-sm font-black text-white uppercase tracking-widest">Referral History</h3>
                                <p className="text-xs text-gray-500 mt-1">Audit statuses and candidate activity benchmarks below.</p>
                            </div>
                            <div className="flex gap-2 text-[9px] font-black uppercase tracking-widest">
                                <div className="px-2.5 py-1 rounded bg-black/40 border border-white/5 text-gray-400">
                                    <span>{stats.pendingReferrals} Pending</span>
                                </div>
                                <div className="px-2.5 py-1 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                                    <span>{stats.activeReferrals} Active</span>
                                </div>
                            </div>
                        </div>

                        {history.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 bg-black/20 rounded-xl border border-white/5 border-dashed">
                                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-3.5 text-gray-400">
                                    <Users size={16} />
                                </div>
                                <h4 className="text-xs font-bold text-white mb-0.5">Invite candidates to prepare together</h4>
                                <p className="text-xs text-gray-500 text-center max-w-xs px-4 leading-normal">
                                    Copy and share your invitation links.
                                </p>
                                <button
                                    onClick={handleCopyLink}
                                    className="mt-4 px-4 py-2 bg-white text-black hover:bg-gray-100 text-xs font-bold rounded-lg transition-all cursor-pointer shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                                >
                                    Copy Invite Link
                                </button>
                            </div>
                        ) : (
                            <div className="overflow-x-auto w-full -mx-4 sm:mx-0">
                                <div className="inline-block min-w-full align-middle px-4 sm:px-0">
                                    <table className="min-w-full divide-y divide-white/5 text-left text-xs">
                                        <thead>
                                            <tr className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">
                                                <th className="py-3 px-3">Candidate</th>
                                                <th className="py-3 px-3">Registered</th>
                                                <th className="py-3 px-3">Status</th>
                                                <th className="py-3 px-3 text-center">Submissions</th>
                                                <th className="py-3 px-3 text-center">Active Days</th>
                                                <th className="py-3 px-3 text-right">Eligible</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {history.map((row) => (
                                                <tr key={row._id} className="hover:bg-white/[0.01] transition-colors">
                                                    <td className="py-3 px-3">
                                                        <div className="flex items-center gap-2.5">
                                                            <img
                                                                src={row.photoURL || `https://api.dicebear.com/9.x/adventurer/svg?seed=${row.username}`}
                                                                alt={row.username}
                                                                className="w-7 h-7 rounded-full border border-white/5 shrink-0"
                                                            />
                                                            <div className="min-w-0">
                                                                <p className="font-bold text-white truncate max-w-[110px]">{row.displayName}</p>
                                                                <p className="text-[9px] text-gray-500 truncate max-w-[110px]">@{row.username}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-3 text-gray-500 font-mono text-[10px]">
                                                        {new Date(row.joinedAt).toLocaleDateString(undefined, {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric'
                                                        })}
                                                    </td>
                                                    <td className="py-3 px-3">
                                                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[9px] font-black border uppercase tracking-wider ${row.status === 'Active'
                                                            ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.05)]'
                                                            : row.status === 'Rejected'
                                                                ? 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
                                                                : 'bg-amber-500/10 border border-amber-500/20 text-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.05)]'
                                                            }`}>
                                                            {row.status === 'Active' ? (
                                                                <CheckCircle size={9} className="shrink-0" />
                                                            ) : row.status === 'Rejected' ? (
                                                                <X size={9} className="shrink-0" />
                                                            ) : (
                                                                <Clock size={9} className="shrink-0" />
                                                            )}
                                                            {row.status}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-3 text-center font-mono text-xs text-white">
                                                        {row.problemsSolved} <span className="text-white/30">/ 3</span>
                                                    </td>
                                                    <td className="py-3 px-3 text-center font-mono text-xs text-white">
                                                        {row.daysActive} <span className="text-white/30">/ 3</span>
                                                    </td>
                                                    <td className="py-3 px-3 text-right">
                                                        <span className={`inline-flex h-1.5 w-1.5 rounded-full ${row.rewardEligible ? 'bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.5)]' : 'bg-white/10'}`} />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
};

export default Referrals;
