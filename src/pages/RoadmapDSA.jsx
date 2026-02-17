import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { generateRoadmap } from '../utils/roadmapGenerator';
import { ChevronDown, Check, ArrowRight, Play, RefreshCw, Layers, Zap, Trophy, Flame, Target, Calendar, Lock, Unlock, Clock, AlertTriangle, ArrowLeft, Code, Settings, Shield, LogOut, Crown, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getAuth, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import logo_img from '../assets/logo_img.png';

import FractionalPicker from '../components/FractionalPicker';

// --- Utility Components ---

const getSectionGradient = (level) => {
    if (level === 'Beginner') return 'from-emerald-500/15 to-teal-600/10 border border-emerald-500/25';
    if (level === 'Intermediate') return 'from-amber-500/20 to-yellow-600/15 border border-amber-500/30';
    return 'from-rose-500/15 to-orange-600/10 border border-rose-500/25';
};

const ResetRoadmapModal = ({ isOpen, onClose, onConfirm }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { currentUser } = useAuth();
    const auth = getAuth();

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const isPasswordUser = currentUser?.providerData?.some(p => p.providerId === 'password');

            if (isPasswordUser) {
                const credential = EmailAuthProvider.credential(currentUser.email, password);
                await reauthenticateWithCredential(auth.currentUser, credential);
                onConfirm();
            } else {
                if (password === 'RESET') {
                    onConfirm();
                } else {
                    throw new Error('Please type RESET to confirm.');
                }
            }
        } catch (err) {
            console.error(err);
            if (err.code === 'auth/wrong-password') {
                setError('Incorrect password.');
            } else {
                setError(err.message || 'Verification failed.');
            }
        } finally {
            setLoading(false);
        }
    };

    const isPasswordUser = currentUser?.providerData?.some(p => p.providerId === 'password');

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative z-10 bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4"
            >
                <div className="flex items-center gap-3 text-red-400 mb-2">
                    <div className="p-2 bg-red-500/10 rounded-lg">
                        <Unlock size={20} />
                    </div>
                    <h3 className="text-lg font-bold text-white">Unlock & Reset Plan?</h3>
                </div>

                <p className="text-zinc-400 text-sm leading-relaxed">
                    Unlocking allows you to modify the duration but will reset your plan settings. <br className="hidden sm:block" />
                    <span className="text-zinc-500 italic">Progress will be preserved where possible.</span>
                </p>

                <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                            {isPasswordUser ? 'Enter Password to Verify' : 'Type "RESET" to Confirm'}
                        </label>
                        <input
                            type={isPasswordUser ? "password" : "text"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500 transition-colors"
                            placeholder={isPasswordUser ? "Your password" : "RESET"}
                            required
                        />
                        {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 text-zinc-300 rounded-lg text-sm font-medium transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !password}
                            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-bold shadow-lg shadow-red-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                            {loading ? <RefreshCw size={14} className="animate-spin" /> : 'Confirm Unlock'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

// --- Animation Variants ---
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20, filter: 'blur(10px)' },
    visible: {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        transition: {
            type: "spring",
            stiffness: 100,
            damping: 15
        }
    }
};

const sidebarItemVariants = {
    hidden: { opacity: 0, x: -20, filter: 'blur(5px)' },
    visible: {
        opacity: 1,
        x: 0,
        filter: 'blur(0px)',
        transition: { type: "spring", stiffness: 120, damping: 20 }
    }
};

// --- Updated RoadmapSection ---

const RoadmapSection = ({ section, isOpen, onToggle, delay, onToggleTask }) => {
    const progress = Math.round((section.completed / section.totalProblems) * 100) || 0;
    const isCompleted = section.completed === section.totalProblems;

    return (
        <motion.div
            layout
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className={`relative bg-[#11161C] border ${isOpen ? 'border-white/12 shadow-[0_10px_24px_-18px_rgba(0,0,0,0.9)]' : 'border-white/5 shadow-[0_10px_20px_-18px_rgba(0,0,0,0.8)]'} rounded-[18px] overflow-hidden transition-all duration-300 group`}
        >
            <div className="absolute bottom-0 left-0 h-[2px] bg-zinc-800 w-full z-0">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.45, ease: 'easeOut', delay: 0.05 }}
                    className={`h-full ${isCompleted ? 'bg-emerald-500/90' : 'bg-amber-400/90'}`}
                />
            </div>

            <button
                onClick={onToggle}
                className="relative z-10 w-full p-6 flex items-center justify-between outline-none group-hover:bg-white/[0.015] transition-colors duration-300"
            >
                <div className="flex items-center gap-6">
                    <div className="relative">
                        <motion.div
                            whileHover={{ rotate: 180, scale: 1.1 }}
                            transition={{ type: "spring", stiffness: 200, damping: 10 }}
                            className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br ${getSectionGradient(section.level)} shadow-lg border border-white/5 ring-1 ring-white/5`}
                        >
                            {isCompleted ? <Code size={24} className="text-emerald-200" /> : <Layers size={24} className="text-white" />}
                        </motion.div>
                        {isOpen && <motion.div layoutId="glow" className="absolute -inset-3 bg-white/5 blur-xl rounded-full -z-10" />}
                    </div>

                    <div className="text-left space-y-1.5">
                        <h3 className={`text-xl font-bold font-sans text-white transition-colors ${isCompleted ? 'line-through decoration-zinc-600 text-zinc-500' : ''}`}>
                            {section.title}
                        </h3>
                        <div className="flex items-center gap-4 text-xs font-medium text-zinc-500">
                            <span className={`px-2.5 py-1 rounded-md bg-white/5 border border-white/5 flex items-center gap-2 ${isCompleted ? 'text-green-400 bg-green-500/10 border-green-500/20' : 'group-hover:border-white/10 transition-colors'}`}>
                                <Trophy size={11} className={isCompleted ? "text-green-500" : "text-zinc-400"} />
                                {section.completed}/{section.totalProblems}
                            </span>
                            <span className="w-1 h-1 rounded-full bg-zinc-700" />
                            <span className="flex items-center gap-2 text-zinc-400">
                                <Calendar size={11} />
                                Days {section.startDay}–{section.endDay}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="hidden sm:flex flex-col items-end gap-0.5">
                        <span className={`text-sm font-bold font-mono ${isCompleted ? 'text-green-400' : 'text-zinc-300'}`}>{progress}%</span>
                        <span className="text-[10px] text-zinc-600 uppercase tracking-wider font-semibold">Completed</span>
                    </div>
                    <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ type: "spring", stiffness: 200, damping: 20 }}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-300 ${isOpen ? 'bg-white/10 text-white border-white/20' : 'bg-white/5 text-zinc-400 border-white/10 group-hover:border-white/20 group-hover:text-white'}`}
                    >
                        <ChevronDown size={18} />
                    </motion.div>
                </div>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }} // Premium ease
                        className="border-t border-white/5 bg-[#11161C]"
                    >
                        <div className="p-8 grid gap-8 sm:grid-cols-[auto_1fr]">
                            <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: "100%" }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                                className="hidden sm:block w-px bg-gradient-to-b from-white/20 via-white/10 to-transparent relative mx-auto left-2 min-h-[50px]"
                            />

                            <div className="space-y-10">
                                {section.tasks.map((dayTask, dayIdx) => (
                                    <motion.div
                                        key={dayIdx}
                                        initial={{ opacity: 0, x: -20, filter: 'blur(5px)' }}
                                        animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                                        transition={{ delay: 0.1 + (dayIdx * 0.1), type: "spring", stiffness: 100 }}
                                        className="relative"
                                    >
                                        <div className={`absolute -left-[3.25rem] top-1.5 w-3 h-3 rounded-full border-2 border-[#0A0A0A] ring-1 hidden sm:block transition-all duration-500 ${dayTask.items.every(i => i.completed) ? 'bg-green-500 ring-green-500/50 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-amber-400 ring-amber-500/30'}`} />

                                        <h4 className="flex items-center gap-3 text-sm font-bold text-white mb-5 uppercase tracking-wider">
                                            <span className="text-amber-200">Day {dayTask.day}</span>
                                            <span className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
                                        </h4>

                                        <div className="grid gap-4 md:grid-cols-2">
                                            {dayTask.items.map((item, itemIdx) => (
                                                <motion.div
                                                    key={itemIdx}
                                                    whileHover={{ scale: 1.02, y: -1, backgroundColor: 'rgba(255, 255, 255, 0.035)' }}
                                                    whileTap={{ scale: 0.98 }}
                                                    className={`group/card relative flex items-start gap-4 p-4 rounded-2xl border transition-all duration-300 ${item.completed ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-[#0F141A] border-white/5 hover:border-white/10'} `}
                                                >
                                                    <button
                                                        onClick={() => onToggleTask(dayIdx, itemIdx)}
                                                        className={`mt-1 flex-shrink-0 w-5 h-5 rounded-md border flex items-center justify-center transition-all duration-300 ${item.completed
                                                            ? 'bg-green-500 border-green-500 text-black scale-100 shadow-[0_0_10px_rgba(34,197,94,0.4)]'
                                                            : 'bg-transparent border-zinc-600 hover:border-white/30 text-transparent scale-95 hover:scale-105 hover:bg-white/5'
                                                            }`}
                                                    >
                                                        <motion.div
                                                            initial={false}
                                                            animate={{ scale: item.completed ? 1 : 0 }}
                                                        >
                                                            <Check size={14} strokeWidth={3} />
                                                        </motion.div>
                                                    </button>

                                                    <div className="flex-1 min-w-0">
                                                        <a href={item.link} className="block cursor-pointer">
                                                            <div className="flex justify-between items-start gap-2">
                                                                <p className={`font-semibold font-sans text-sm transition-all duration-300 ${item.completed ? 'text-zinc-500 line-through decoration-zinc-700 decoration-2' : 'text-zinc-200 group-hover/card:text-white'}`}>
                                                                    {item.text}
                                                                </p>
                                                            </div>
                                                            <div className="flex items-center gap-2 mt-3">
                                                                <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium tracking-wide ${item.type === 'Easy' ? 'bg-green-500/10 border-green-500/20 text-green-400' :
                                                                    item.type === 'Hard' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                                                                        'bg-blue-500/10 border-blue-500/20 text-blue-400'
                                                                    }`}>
                                                                    {item.difficulty || "Mixed"}
                                                                </span>
                                                                <motion.span
                                                                    className="text-[10px] text-zinc-500 flex items-center gap-1 group-hover/card:text-amber-300 transition-colors ml-auto font-medium"
                                                                    whileHover={{ x: 2 }}
                                                                >
                                                                    Solve <ArrowRight size={10} />
                                                                </motion.span>
                                                            </div>
                                                        </a>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

// --- Updated Sidebar Component ---

const RoadmapSidebar = ({
    onBack,
    days,
    setDays,
    isLocked,
    onToggleLock,
    onGenerate,
    isGenerating,
    levelInfo,
    roadmap,
    activeSection,
    onSectionClick
}) => {
    const navigate = useNavigate();
    const { currentUser, userData, logout } = useAuth(); // Added hooks

    return (
        <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="w-80 h-full flex flex-col bg-[#0B0F14] border-r border-white/5 shrink-0 z-30"
        >
            {/* Logo Section - Replaces Header */}
            <motion.div
                className="flex items-center gap-4 p-6 mb-2 cursor-pointer group border-b border-white/5 relative overflow-hidden bg-[#0B0F14]"
                onClick={() => navigate('/dashboard')}
                whileHover="hover"
            >
                <div className="absolute inset-0 bg-white/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <motion.img
                    src={logo_img}
                    alt="CodeHubx Logo"
                    className="w-10 h-10 rounded-xl z-10 object-cover"
                    variants={{ hover: { rotate: [0, -5, 5, 0], scale: 1.05 } }}
                    transition={{ duration: 0.4 }}
                />
                <div className="z-10">
                    <h1 className="text-xl font-bold font-sans bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-200 to-zinc-400 tracking-tight">
                        CodeHubx
                    </h1>
                    <p className="text-[10px] text-zinc-500 font-medium tracking-widest uppercase transition-colors">Pro Dashboard</p>
                </div>
            </motion.div>

            {/* Controls - Scrollable part of sidebar */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8 custom-scrollbar">

                {/* Timeline Control */}
                <motion.div
                    variants={sidebarItemVariants}
                    initial="hidden"
                    animate="visible"
                    delay={0.1}
                    className="space-y-5"
                >
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                            <Clock size={12} /> Duration
                        </span>
                    </div>

                    <FractionalPicker
                        min={30}
                        max={365}
                        value={days}
                        onChange={(val) => !isLocked && setDays(val)}
                        disabled={isLocked}
                    />

                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className={`p-4 rounded-2xl border flex items-center gap-4 transition-all duration-300 ${isLocked ? 'bg-[#11161C] border-white/5 opacity-60 grayscale' : 'bg-[linear-gradient(135deg,rgba(245,158,11,0.10),rgba(245,158,11,0.03))] border-amber-500/25'}`}
                    >
                        <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/30">
                            {levelInfo.icon}
                        </div>
                        <div>
                            <p className="text-sm font-bold font-sans text-white tracking-tight">{levelInfo.label}</p>
                            <p className="text-[10px] font-sans text-amber-200/80 uppercase tracking-wide mt-0.5">Recommended Pace</p>
                        </div>
                    </motion.div>

                    <div className="grid grid-cols-1 gap-3">
                        {!isLocked ? (
                            <motion.button
                                whileHover={{ scale: 1.02, y: -1, backgroundColor: '#f3f4f6' }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => onToggleLock(true)}
                                className="w-full px-4 py-3 bg-[#F3F4F6] text-[#111827] rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all z-50 relative border border-white/40"
                            >
                                <Play size={14} fill="currentColor" />
                                Generate & Lock Plan
                            </motion.button>
                        ) : (
                            <motion.button
                                whileHover={{ scale: 1.02, backgroundColor: "rgba(220, 38, 38, 0.15)", borderColor: "rgba(220, 38, 38, 0.4)" }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => onToggleLock(false)}
                                className="w-full px-4 py-3 bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all"
                            >
                                <Unlock size={14} />
                                Unlock to Edit
                            </motion.button>
                        )}
                    </div>
                </motion.div>

                {/* Navigation / TOC */}
                <motion.div
                    width="100%"
                    initial="visible"
                    animate="visible"
                    className="space-y-4"
                >
                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider block mb-2 flex items-center gap-2">
                        <Layers size={12} /> Modules
                    </span>
                    <div className="space-y-1">
                        {roadmap?.sections.map((section, idx) => (
                            <motion.button
                                key={section.slug}
                                onClick={() => onSectionClick(section.slug)}
                                variants={{
                                    hidden: { opacity: 0, x: -10 },
                                    visible: { opacity: 1, x: 0 }
                                }}
                                whileHover={{ x: 2, backgroundColor: 'rgba(255, 255, 255, 0.02)' }}
                                className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-all group ${activeSection === section.slug
                                    ? 'bg-white/10 border border-white/10 text-white shadow-none'
                                    : 'border border-transparent text-zinc-400 hover:text-zinc-200'
                                    }`}
                            >
                                <div className={`w-2 h-2 rounded-full ring-2 ring-offset-1 ring-offset-[#0B0F14] transition-all duration-300 ${section.completed === section.totalProblems ? 'bg-green-500 ring-green-500/20' : activeSection === section.slug ? 'bg-amber-400 ring-amber-500/30' : 'bg-zinc-700 ring-transparent'}`} />
                                <span className={`text-xs font-medium font-sans truncate flex-1 ${activeSection === section.slug ? 'text-zinc-100' : ''}`}>{section.title}</span>
                                {section.completed > 0 && (
                                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${activeSection === section.slug ? 'bg-white/10 text-zinc-200' : 'bg-zinc-800 text-zinc-500'}`}>
                                        {Math.round((section.completed / section.totalProblems) * 100)}%
                                    </span>
                                )}
                            </motion.button>
                        ))}
                    </div>
                </motion.div>
            </div >

            {/* User Profile Footer */}
            < motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-auto pt-4 pb-6 px-4 border-t border-white/5 shrink-0 bg-[#0B0F14]"
            >
                <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group border border-transparent hover:border-white/5">
                    <img
                        src={userData?.photoURL || currentUser?.photoURL || `https://api.dicebear.com/9.x/adventurer/svg?seed=${userData?.username || currentUser?.email?.split('@')[0] || 'User'}`}
                        alt="Profile"
                        className="w-9 h-9 rounded-lg border border-white/10 transition-colors object-cover"
                        onClick={() => {
                            if (!userData?.profileCompleted) {
                                navigate('/complete-profile');
                            } else {
                                navigate(`/${userData?.username}`);
                            }
                        }}
                    />
                    <div className="flex-1 min-w-0" onClick={() => {
                        if (!userData?.profileCompleted) {
                            navigate('/complete-profile');
                        } else {
                            navigate(`/${userData?.username}`);
                        }
                    }}>
                        <h4 className="text-sm font-semibold font-sans text-white truncate transition-colors">
                            {userData?.displayName || currentUser?.displayName || 'User'}
                        </h4>
                        <p className="text-[10px] text-zinc-500 truncate font-medium">@{userData?.username || 'user'}</p>
                    </div>
                    <motion.button
                        whileHover={{ rotate: 90 }}
                        transition={{ type: "spring", stiffness: 200 }}
                        onClick={() => navigate('/settings')}
                        className="p-2 text-zinc-500 hover:text-white hover:bg-white/10 rounded-lg transition-all cursor-pointer"
                        title="Settings"
                    >
                        <Settings size={16} />
                    </motion.button>
                </div>
            </motion.div >
        </motion.div >
    );
};

// --- Main Component ---

const DSARoadmap = ({ onBack }) => {
    const [days, setDays] = useState(90);
    const [roadmap, setRoadmap] = useState(null);
    const [expandedSection, setExpandedSection] = useState(null);
    const [showResetModal, setShowResetModal] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem('dsa-roadmap');
        if (saved) {
            const parsed = JSON.parse(saved);
            setRoadmap(parsed);
            if (parsed.daysSelected) setDays(parsed.daysSelected);
        } else {
            handleGenerate(90, false);
        }
    }, []);

    const handleGenerate = (selectedDays, mergeProgress = false) => {
        setIsGenerating(true);
        setTimeout(() => {
            const newRoadmap = generateRoadmap(selectedDays);
            if (mergeProgress && roadmap) {
                newRoadmap.sections = newRoadmap.sections.map(newSec => {
                    const oldSec = roadmap.sections.find(s => s.slug === newSec.slug);
                    if (oldSec && oldSec.completed > 0) {
                        let toMark = oldSec.completed;
                        const newTasks = newSec.tasks.map(day => ({
                            ...day,
                            items: day.items.map(item => {
                                if (toMark > 0) {
                                    toMark--;
                                    return { ...item, completed: true };
                                }
                                return item;
                            })
                        }));
                        return { ...newSec, completed: oldSec.completed, tasks: newTasks };
                    }
                    return newSec;
                });
            }
            setRoadmap(newRoadmap);
            localStorage.setItem('dsa-roadmap', JSON.stringify(newRoadmap));
            setIsGenerating(false);
        }, 800); // Increased slightly for effect
    };

    const toggleTask = (sectionSlug, dayIdx, itemIdx) => {
        if (!roadmap) return;
        const updatedSections = roadmap.sections.map(section => {
            if (section.slug === sectionSlug) {
                const updatedTasks = [...section.tasks];
                const day = { ...updatedTasks[dayIdx] };
                const items = [...day.items];
                const item = { ...items[itemIdx] };
                const wasCompleted = item.completed;
                item.completed = !wasCompleted;
                items[itemIdx] = item;
                day.items = items;
                updatedTasks[dayIdx] = day;
                const completedCount = section.completed + (wasCompleted ? -1 : 1);
                return { ...section, tasks: updatedTasks, completed: completedCount };
            }
            return section;
        });
        const newRoadmap = { ...roadmap, sections: updatedSections };
        setRoadmap(newRoadmap);
        localStorage.setItem('dsa-roadmap', JSON.stringify(newRoadmap));
    };

    const toggleLock = (isLocked) => {
        if (isLocked) {
            const updatedRoadmap = { ...roadmap, isLocked: true };
            setRoadmap(updatedRoadmap);
            localStorage.setItem('dsa-roadmap', JSON.stringify(updatedRoadmap));
        } else {
            setShowResetModal(true);
        }
    };

    const confirmUnlock = () => {
        const updatedRoadmap = { ...roadmap, isLocked: false };
        setRoadmap(updatedRoadmap);
        localStorage.setItem('dsa-roadmap', JSON.stringify(updatedRoadmap));
        setShowResetModal(false);
    };

    const scrollToSection = (slug) => {
        setExpandedSection(slug);
        setTimeout(() => {
            const element = document.getElementById(`section-${slug}`);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 450);
    };

    const getLevelInfo = (d) => {
        if (d <= 60) return { label: 'Quick Revision', color: 'rose', icon: <Flame size={16} /> };
        if (d <= 159) return { label: 'Intermediate', color: 'amber', icon: <Zap size={16} /> };
        return { label: 'Expert Mastery', color: 'purple', icon: <Trophy size={16} /> };
    };

    const levelInfo = getLevelInfo(days);

    return (
        <div className="fixed inset-0 top-0 z-10 flex bg-[#0B0F14] text-white overflow-hidden font-sans">
            {/* Left Sidebar */}
            <RoadmapSidebar
                onBack={onBack}
                days={days}
                setDays={(d) => { setDays(d); handleGenerate(d, true); }}
                isLocked={roadmap?.isLocked}
                onToggleLock={toggleLock}
                onGenerate={() => handleGenerate(days, true)}
                isGenerating={isGenerating}
                levelInfo={levelInfo}
                roadmap={roadmap}
                activeSection={expandedSection}
                onSectionClick={scrollToSection}
            />

            {/* Main Content Area */}
            <div className="flex-1 h-full overflow-y-auto custom-scrollbar relative bg-[#0B0F14]">

                {/* Enhanced Background Ambient Effects */}
                
                <div className="p-10 max-w-5xl mx-auto space-y-8 pb-40">
                    {/* Header for Content Area */}
                    <motion.div
                        initial={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="flex items-end justify-between mb-10 border-b border-white/5 pb-8"
                    >
                        <div>
                            <h1 className="text-4xl md:text-5xl font-bold font-sans tracking-tight text-white mb-2">
                                Your Curriculum
                            </h1>
                            <p className="text-[#9CA3AF] font-sans text-base">Master Data Structures & Algorithms, one planned day at a time.</p>
                        </div>
                        {roadmap?.isLocked && (
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-emerald-300 text-xs font-bold uppercase tracking-wider flex items-center gap-2"
                            >
                                <Lock size={12} /> Plan Active
                            </motion.div>
                        )}
                    </motion.div>

                    <AnimatePresence mode="wait">
                        {isGenerating ? (
                            <motion.div
                                key="loader"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.05 }}
                                transition={{ duration: 0.3 }}
                                className="h-64 flex flex-col items-center justify-center text-zinc-500 gap-6"
                            >
                                <div className="relative w-16 h-16">
                                    <motion.span
                                        className="absolute top-0 left-0 w-full h-full border-2 border-white/15 rounded-full"
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                    />
                                    <motion.span
                                        className="absolute top-0 left-0 w-full h-full border-t-2 border-amber-400/70 rounded-full"
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    />
                                </div>
                                <span className="text-sm font-medium animate-pulse text-zinc-400 font-mono tracking-wide">Optimizing your path...</span>
                            </motion.div>
                        ) : (
                            <motion.div
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                className="space-y-6"
                            >
                                {roadmap?.sections.map((section, idx) => (
                                    <div id={`section-${section.slug}`} key={section.slug} className="scroll-mt-8">
                                        <RoadmapSection
                                            section={section}
                                            isOpen={expandedSection === section.slug}
                                            onToggle={() => setExpandedSection(expandedSection === section.slug ? null : section.slug)}
                                            delay={idx * 0.05}
                                            onToggleTask={(dayIdx, itemIdx) => toggleTask(section.slug, dayIdx, itemIdx)}
                                        />
                                    </div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <ResetRoadmapModal
                isOpen={showResetModal}
                onClose={() => setShowResetModal(false)}
                onConfirm={confirmUnlock}
            />
        </div>
    );
};

export default DSARoadmap;
