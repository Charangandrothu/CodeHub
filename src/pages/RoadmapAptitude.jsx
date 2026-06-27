import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { generateAptitudeRoadmap } from '../utils/aptitudeRoadmapGenerator';
import { ChevronDown, Check, ArrowRight, Play, RefreshCw, Layers, Zap, Trophy, Flame, Calendar, Lock, Unlock, Clock, BarChart2, Brain, MessageSquare, Shield, Settings, Menu, X, Crown, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getAuth, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import logo_img from '../assets/logo_img.png';

import FractionalPicker from '../components/FractionalPicker';
import { API_URL } from '../config';

// --- Preset Goals matching Aptitude Days ---
const GOALS = {
    expert: 30,
    medium: 60,
    beginner: 90
};

// --- Utility Components ---
const getSectionGradient = (level) => {
    if (level === 'Beginner') return 'from-emerald-500/20 to-teal-600/20 border border-emerald-500/30';
    if (level === 'Intermediate') return 'from-blue-500/20 to-indigo-600/20 border border-blue-500/30';
    return 'from-rose-500/20 to-orange-600/20 border border-rose-500/30';
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
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
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
            staggerChildren: 0.08,
            delayChildren: 0.1,
            when: "beforeChildren"
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.98 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            type: "spring",
            stiffness: 80,
            damping: 15,
            mass: 0.8
        }
    }
};

const sidebarItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { type: "spring", stiffness: 100, damping: 18 }
    }
};

// Theme Color Mapping
const TOPIC_COLORS = {
    'aptitude': '#3b82f6',   // Quantitative Aptitude
    'reasoning': '#a855f7',  // Logical Reasoning
    'verbal': '#10b981',     // Verbal Ability
    'default': '#3b82f6'
};

const TOPIC_ICONS = {
    'aptitude': BarChart2,
    'reasoning': Brain,
    'verbal': MessageSquare,
};

const RoadmapSection = ({ section, isOpen, onToggle, delay, onToggleTask, roadmapStartDate, isMobile = false }) => {
    const activeDayRef = useRef(null);
    const progress = Math.round((section.completed / section.totalProblems) * 100) || 0;
    const isCompleted = section.completed === section.totalProblems;
    const topicColor = TOPIC_COLORS[section.slug] || TOPIC_COLORS.default;
    const Icon = TOPIC_ICONS[section.slug] || Layers;

    const getDayLabel = (dayNum) => {
        if (!roadmapStartDate) return `Day ${dayNum}`;

        const start = new Date(roadmapStartDate);
        start.setHours(0, 0, 0, 0);

        const targetDate = new Date(start);
        targetDate.setDate(targetDate.getDate() + (dayNum - 1));

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const diffTime = targetDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return `Day ${dayNum} • Today`;
        if (diffDays === 1) return `Day ${dayNum} • Tomorrow`;
        if (diffDays === -1) return `Day ${dayNum} • Yesterday`;

        return `Day ${dayNum} • ${targetDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}`;
    };

    const isToday = (dayNum) => {
        if (!roadmapStartDate) return false;
        const start = new Date(roadmapStartDate);
        start.setHours(0, 0, 0, 0);
        const targetDate = new Date(start);
        targetDate.setDate(targetDate.getDate() + (dayNum - 1));
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return targetDate.getTime() === today.getTime();
    };

    const getCurrentDay = () => {
        if (!roadmapStartDate) return Infinity;
        const start = new Date(roadmapStartDate);
        start.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return Math.floor((today - start) / (1000 * 60 * 60 * 24)) + 1;
    };

    const currentDay = getCurrentDay();

    useEffect(() => {
        if (isOpen && activeDayRef.current) {
            setTimeout(() => {
                activeDayRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 500);
        }
    }, [isOpen]);

    return (
        <motion.div
            layout
            variants={isMobile ? {
                hidden: { opacity: 0, y: 20, scale: 0.99 },
                visible: {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    transition: {
                        type: "spring",
                        stiffness: 80,
                        damping: 15,
                        mass: 0.8
                    }
                }
            } : itemVariants}
            initial="hidden"
            whileInView="visible"
            whileHover={!isOpen ? { y: -5, scale: 1.005, transition: { duration: 0.2 } } : {}}
            viewport={{ once: true, margin: "-50px" }}
            className={`relative border transition-all duration-500 group ${isMobile ? 'ml-0 w-full' : '-ml-16 w-[calc(100%+12px)]'} overflow-hidden rounded-2xl ${isOpen
                ? `bg-gradient-to-b from-[#151515] to-[#050505] shadow-2xl`
                : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04] hover:border-white/10'
                }`}
            style={{
                borderColor: isOpen ? `${topicColor}40` : '',
                boxShadow: isOpen ? `0 20px 50px -10px ${topicColor}15` : ''
            }}
        >
            {isOpen && (
                <motion.div
                    layoutId="active-glow"
                    className="absolute inset-0 z-0 pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" style={{ borderColor: topicColor }} />
                    <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />
                    <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />
                </motion.div>
            )}

            <div className={`absolute inset-0 pointer-events-none transition-opacity duration-700 ${isOpen ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'}`}>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
            </div>

            {/* Progress Bar */}
            <div className="absolute bottom-0 left-0 h-[2px] bg-zinc-800/50 w-full z-0">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1.5, ease: "circOut", delay: 0.5 }}
                    className={`h-full relative overflow-hidden ${isCompleted ? 'bg-emerald-500' : ''}`}
                    style={{ backgroundColor: isCompleted ? '' : topicColor }}
                >
                    <div className="absolute right-0 top-0 bottom-0 w-[4px] bg-white/50 blur-[2px]" />
                    <motion.div
                        animate={{ x: ["-100%", "100%"] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
                        className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent`}
                    />
                </motion.div>
            </div>

            <button
                onClick={onToggle}
                className="relative z-10 w-full p-4 flex items-center justify-between outline-none transition-colors duration-300"
            >
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <motion.div
                            whileHover={{ rotate: 180, scale: 1.1 }}
                            transition={{ type: "spring", stiffness: 200, damping: 10 }}
                            className={`w-12 h-12 rounded-xl flex items-center justify-center border shadow-lg ${isCompleted
                                ? 'bg-emerald-500/10 border-emerald-500/20 shadow-emerald-500/10 text-emerald-400'
                                : 'bg-gradient-to-br from-white/5 to-white/0 border-white/10 text-white/90 shadow-black/20'
                                }`}
                            style={!isCompleted ? {
                                borderColor: `${topicColor}30`,
                                color: topicColor,
                                backgroundColor: `${topicColor}10`
                            } : {}}
                        >
                            {isCompleted ? <Check size={20} strokeWidth={3} /> : <Icon size={20} />}
                        </motion.div>
                    </div>

                    <div className="text-left space-y-1">
                        <h3 className={`text-xl font-bold font-sans tracking-tight transition-colors ${isCompleted ? 'text-zinc-500 line-through decoration-zinc-700' : 'text-white'}`}
                            style={!isCompleted && isOpen ? { color: topicColor } : {}}
                        >
                            {section.title}
                        </h3>
                        <div className="flex items-center gap-3 text-[10px] font-medium text-zinc-500">
                            <span className={`px-2 py-0.5 rounded-full border flex items-center gap-1.5 transition-all ${isCompleted
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                : 'bg-white/5 border-white/5 text-zinc-400'
                                }`}>
                                <Trophy size={10} className={isCompleted ? "text-emerald-400" : "text-zinc-500"} />
                                {section.completed}/{section.totalProblems}
                            </span>
                            <span className="w-1 h-1 rounded-full bg-zinc-800" />
                            <span className="flex items-center gap-1.5 text-zinc-400">
                                <Calendar size={10} />
                                Days {section.startDay}–{section.endDay}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="hidden sm:flex flex-col items-end gap-0.5">
                        <span className={`text-lg font-bold font-mono tracking-tighter ${isCompleted ? 'text-emerald-400' : 'text-zinc-300'}`}>
                            {progress}<span className="text-[10px] text-zinc-600 ml-0.5">%</span>
                        </span>
                    </div>
                    <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ type: "spring", stiffness: 200, damping: 20 }}
                        className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-300 ${isOpen
                            ? 'text-white border-transparent'
                            : 'bg-white/5 text-zinc-400 border-white/10 group-hover:border-white/20 group-hover:text-white'
                            }`}
                        style={isOpen ? { backgroundColor: topicColor, boxShadow: `0 0 15px ${topicColor}40` } : {}}
                    >
                        <ChevronDown size={14} />
                    </motion.div>
                </div>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.5, ease: [0.04, 0.62, 0.23, 0.98] }}
                        className="border-t border-white/5 bg-[#080808]"
                    >
                        <div className="p-6 md:p-8 grid gap-8 sm:grid-cols-[auto_1fr]">
                            <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: "100%" }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                                className="hidden sm:block w-[1px] bg-gradient-to-b from-transparent via-zinc-800 to-transparent relative mx-auto left-2 h-full opacity-50"
                                style={{
                                    backgroundImage: `linear-gradient(to bottom, ${topicColor}, #27272a, transparent)`
                                }}
                            />

                            <div className="space-y-8">
                                {section.tasks.map((dayTask, dayIdx) => {
                                    const isLocked = false;
                                    return (
                                        <motion.div
                                            key={dayIdx}
                                            ref={isToday(dayTask.day) ? activeDayRef : null}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{
                                                delay: 0.2 + (dayIdx * 0.1),
                                                type: "spring",
                                                stiffness: 50,
                                                damping: 15
                                            }}
                                            className={`relative ${isLocked ? 'opacity-80 grayscale-[0.5]' : ''}`}
                                        >
                                            <div className={`absolute -left-[3.15rem] top-2.5 w-3 h-3 rounded-full border-2 hidden sm:block transition-all duration-500 z-10 ${dayTask.items.every(i => i.completed)
                                                ? 'bg-emerald-500 border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                                                : isLocked ? 'bg-zinc-800 border-zinc-700' : 'bg-[#0a0a0a] border-zinc-700'
                                                }`}
                                            />

                                            <h4 className="flex items-center gap-3 text-xs font-bold text-white mb-4 uppercase tracking-wider">
                                                <span
                                                    className={`px-2.5 py-1 rounded border transition-colors ${isToday(dayTask.day)
                                                        ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400 ring-1 ring-emerald-500/30"
                                                        : isLocked
                                                            ? "bg-zinc-800/50 border-zinc-700/50 text-zinc-500"
                                                            : "bg-white/5 border-white/10"
                                                        }`}
                                                    style={{ color: !isToday(dayTask.day) && !isLocked ? topicColor : undefined }}
                                                >
                                                    {isLocked && <Lock size={10} className="inline mr-1.5 -mt-0.5" />}
                                                    {getDayLabel(dayTask.day)}
                                                </span>
                                                {isLocked && (
                                                    <span className="text-[10px] text-zinc-600 font-medium normal-case tracking-normal">
                                                        Unlocks in {dayTask.day - currentDay} day{dayTask.day - currentDay > 1 ? 's' : ''}
                                                    </span>
                                                )}
                                                <span className="h-[1px] flex-1 bg-gradient-to-r from-white/10 to-transparent" />
                                            </h4>

                                            <div className={`grid gap-3 md:grid-cols-2 relative`}>
                                                {dayTask.items.map((item, itemIdx) => (
                                                    <motion.div
                                                        key={itemIdx}
                                                        whileHover={!isLocked ? { scale: 1.01, y: -2 } : {}}
                                                        whileTap={!isLocked ? { scale: 0.99 } : {}}
                                                        className={`group/card relative flex items-start gap-3 p-4 rounded-xl border transition-all duration-300 ${item.completed
                                                            ? 'bg-emerald-950/20 border-emerald-500/20'
                                                            : 'bg-white/[0.03] border-white/5 hover:bg-white/[0.05]'
                                                            }`}
                                                        style={!item.completed ? {
                                                            borderColor: 'rgba(255,255,255,0.05)',
                                                        } : {}}
                                                    >
                                                        <button
                                                            onClick={() => !isLocked && onToggleTask(dayIdx, itemIdx)}
                                                            className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-300 ${item.completed
                                                                ? 'bg-emerald-500 border-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                                                                : 'bg-transparent border-zinc-600 group-hover/card:border-white/40'
                                                                }`}
                                                        >
                                                            {item.completed && <Check size={12} strokeWidth={4} />}
                                                        </button>

                                                        <div className="flex-1 min-w-0">
                                                            <a href={item.link} className="block cursor-pointer">
                                                                <div className="flex justify-between items-start gap-2">
                                                                    <p className={`font-semibold font-sans text-sm leading-snug transition-all duration-300 ${item.completed
                                                                        ? 'text-zinc-500 line-through decoration-zinc-700'
                                                                        : 'text-zinc-300 group-hover/card:text-white'
                                                                        }`}>
                                                                        {item.text}
                                                                    </p>
                                                                </div>
                                                                <div className="flex items-center gap-3 mt-3">
                                                                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold tracking-wide border ${item.difficulty === 'Easy' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                                                                        item.difficulty === 'Hard' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' :
                                                                            'bg-blue-500/10 border-blue-500/20 text-blue-400'
                                                                        }`}>
                                                                        {item.difficulty || "Medium"}
                                                                    </span>
                                                                    <div className="h-px bg-white/10 flex-1" />
                                                                    <motion.span
                                                                        className="text-[10px] text-zinc-500 flex items-center gap-1 group-hover/card:text-white transition-colors font-medium"
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
                                    )
                                })}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

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
    onSectionClick,
    isMobile = false,
    isOpen = false,
    onClose = () => { }
}) => {
    const navigate = useNavigate();
    const { currentUser, userData } = useAuth();
    const [isUnlockHovered, setIsUnlockHovered] = useState(false);

    const levelStyles = {
        rose: {
            bgGradient: "from-rose-500/10",
            border: "border-rose-500/20",
            iconBg: "bg-rose-500/20",
            iconText: "text-rose-400",
            ring: "ring-rose-500/30",
            shadow: "shadow-rose-500/10",
            blur: "bg-rose-500/20"
        },
        amber: {
            bgGradient: "from-amber-500/10",
            border: "border-amber-500/20",
            iconBg: "bg-amber-500/20",
            iconText: "text-amber-400",
            ring: "ring-amber-500/30",
            shadow: "shadow-amber-500/10",
            blur: "bg-amber-500/20"
        },
        purple: {
            bgGradient: "from-purple-500/10",
            border: "border-purple-500/20",
            iconBg: "bg-purple-500/20",
            iconText: "text-purple-400",
            ring: "ring-purple-500/30",
            shadow: "shadow-purple-500/10",
            blur: "bg-purple-500/20"
        }
    };

    const currentStyle = levelStyles[levelInfo.color] || levelStyles.purple;

    return (
        <motion.div
            initial={isMobile ? false : { x: -60, opacity: 0 }}
            animate={isMobile ? { opacity: 1 } : { x: 0, opacity: 1 }}
            transition={isMobile ? { duration: 0 } : { duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className={`h-full flex flex-col bg-[#050505] border-r border-white/10 shrink-0 z-30 transition-[left] duration-300 ${isMobile ? `fixed top-0 w-[85vw] max-w-80 ${isOpen ? 'left-0' : '-left-[85vw]'}` : 'w-80'}`}
        >
            {isMobile && (
                <div className="absolute top-4 right-4 z-50">
                    <button
                        onClick={onClose}
                        className="h-9 w-9 inline-flex items-center justify-center rounded-lg border border-white/10 bg-white/5 text-gray-200"
                        aria-label="Close roadmap sidebar"
                    >
                        <X size={16} />
                    </button>
                </div>
            )}
            
            <motion.div
                className="flex items-center gap-4 p-6 mb-2 cursor-pointer group border-b border-white/5 relative overflow-hidden"
                onClick={() => navigate('/dashboard')}
                whileHover="hover"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <motion.img
                    src={logo_img}
                    alt="CodeHubx Logo"
                    className="w-10 h-10 rounded-xl shadow-lg shadow-purple-500/10 z-10 object-cover border border-white/5"
                    variants={{ hover: { rotate: [0, -5, 5, 0], scale: 1.05 } }}
                    transition={{ duration: 0.4 }}
                />
                <div className="z-10">
                    <h1 className="text-xl font-bold font-sans bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-200 to-zinc-400 tracking-tight">
                        CodeHubx
                    </h1>
                    <p className={`text-[10px] font-medium tracking-widest uppercase transition-colors ${userData?.isElite ? 'text-emerald-500' : userData?.isPro ? 'text-blue-500' : 'text-zinc-500'}`}>
                        {userData?.isElite ? 'Elite' : userData?.isPro ? 'Pro' : 'Free'}
                    </p>
                </div>
            </motion.div>

            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-10 custom-scrollbar">
                <motion.div
                    variants={sidebarItemVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-5"
                >
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                            <Clock size={12} /> Duration
                        </span>
                    </div>

                    <div className={isLocked ? "opacity-30 grayscale cursor-not-allowed pointer-events-none transition-all duration-500" : "transition-all duration-500"}>
                        <FractionalPicker
                            min={30}
                            max={90}
                            value={days}
                            onChange={(val) => !isLocked && setDays(val)}
                            disabled={isLocked}
                            className="bg-white/5 border border-white/10 shadow-inner rounded-xl"
                        />
                        <div className="flex justify-between items-center px-1 mt-2 min-h-[1.25rem]">
                            <motion.span
                                key={days}
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-[10px] text-zinc-500 font-medium w-full text-center"
                            >
                                {days === 90 && "Recommended for Beginner"}
                                {days === 60 && "Recommended for Medium"}
                                {days === 30 && "Recommended for Expert"}
                                {![30, 60, 90].includes(days) && "Custom Duration"}
                            </motion.span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                        {!isLocked ? (
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => onToggleLock(true)}
                                className="w-full px-4 py-3 bg-emerald-500 text-black rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_-5px_rgba(16,185,129,0.5)] hover:bg-emerald-400 hover:shadow-emerald-500/30 z-50 relative border border-transparent cursor-pointer"
                            >
                                <Play size={14} fill="currentColor" />
                                Generate & Lock Plan
                            </motion.button>
                        ) : (
                            <motion.button
                                onHoverStart={() => setIsUnlockHovered(true)}
                                onHoverEnd={() => setIsUnlockHovered(false)}
                                onClick={() => onToggleLock(false)}
                                className={`w-full px-4 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all duration-300 border cursor-pointer ${isUnlockHovered
                                    ? "bg-red-500/10 border-red-500/30 text-red-400 shadow-[0_0_20px_-5px_rgba(239,68,68,0.3)]"
                                    : "bg-emerald-500/5 border-emerald-500/20 text-emerald-400 shadow-[0_0_20px_-5px_rgba(16,185,129,0.2)]"
                                    }`}
                            >
                                <AnimatePresence mode="wait" initial={false}>
                                    {isUnlockHovered ? (
                                        <motion.span
                                            key="unlock"
                                            initial={{ opacity: 0, y: 5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -5 }}
                                            transition={{ duration: 0.15 }}
                                            className="flex items-center gap-2"
                                        >
                                            <Unlock size={14} />
                                            Unlock to Edit
                                        </motion.span>
                                    ) : (
                                        <motion.span
                                            key="locked"
                                            initial={{ opacity: 0, y: -5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 5 }}
                                            transition={{ duration: 0.15 }}
                                            className="flex items-center gap-2"
                                        >
                                            <Lock size={14} />
                                            Plan Active
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </motion.button>
                        )}
                    </div>
                </motion.div>

                {/* Modules navigation */}
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
                        {roadmap?.sections.map((section) => (
                            <motion.button
                                key={section.slug}
                                onClick={() => {
                                    onSectionClick(section.slug);
                                    if (isMobile) onClose();
                                }}
                                whileHover={{ x: 4 }}
                                className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all group border ${activeSection === section.slug
                                    ? 'bg-purple-500/10 border-purple-500/20 text-white shadow-[0_0_20px_-5px_rgba(168,85,247,0.15)]'
                                    : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                                    }`}
                            >
                                <div className={`w-2 h-2 rounded-full ring-2 ring-offset-2 ring-offset-[#050505] transition-all duration-300 ${section.completed === section.totalProblems ? 'bg-emerald-500 ring-emerald-500/20' : activeSection === section.slug ? 'bg-purple-500 ring-purple-500/20' : 'bg-zinc-700 ring-transparent'}`} />
                                <span className="text-xs font-medium truncate flex-1">{section.title}</span>
                                {section.completed > 0 && (
                                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-500">
                                        {Math.round((section.completed / section.totalProblems) * 100)}%
                                    </span>
                                )}
                            </motion.button>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Profile Footer */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="mt-auto pt-4 pb-6 px-4 border-t border-white/5 shrink-0 bg-[#050505]"
            >
                <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group border border-transparent">
                    <img
                        src={userData?.photoURL || currentUser?.photoURL || `https://api.dicebear.com/9.x/adventurer/svg?seed=${userData?.username || currentUser?.email?.split('@')[0] || 'User'}`}
                        alt="Profile"
                        className="w-10 h-10 rounded-lg border border-white/10 group-hover:border-purple-500/50 transition-colors object-cover"
                        onClick={() => navigate(`/profile/${userData?.username}`)}
                    />
                    <div className="flex-1 min-w-0" onClick={() => navigate(`/profile/${userData?.username}`)}>
                        <h4 className="text-sm font-semibold text-white truncate group-hover:text-purple-400 transition-colors">
                            {userData?.displayName || currentUser?.displayName || 'User'}
                        </h4>
                        <p className="text-xs text-zinc-500 truncate">@{userData?.username || 'user'}</p>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

const RoadmapAptitude = ({ onBack }) => {
    const navigate = useNavigate();
    const { currentUser, userData, refreshUserData } = useAuth();
    const [roadmap, setRoadmap] = useState(null);
    const [days, setDays] = useState(60);
    const [selectedGoal, setSelectedGoal] = useState("medium");
    const [isGenerating, setIsGenerating] = useState(false);
    const [loadingRoadmap, setLoadingRoadmap] = useState(true);
    const [expandedSection, setExpandedSection] = useState("aptitude");
    const [showResetModal, setShowResetModal] = useState(false);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(() => window.innerWidth < 1024);
    const hasInitialized = useRef(false);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const saveRoadmap = async (newRoadmap) => {
        setRoadmap(newRoadmap);

        if (currentUser) {
            try {
                const res = await fetch(`${API_URL}/api/users/roadmap-aptitude/${currentUser.uid}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ roadmap: newRoadmap })
                });

                if (res.ok) {
                    await refreshUserData();
                }
            } catch (err) {
                console.error("Failed to sync aptitude roadmap:", err);
            }
        }
    };

    useEffect(() => {
        if (!userData) return;
        if (hasInitialized.current) return;
        hasInitialized.current = true;

        if (userData.aptitudeRoadmap) {
            setRoadmap(userData.aptitudeRoadmap);
            if (userData.aptitudeRoadmap.daysSelected) {
                setDays(userData.aptitudeRoadmap.daysSelected);
                const matchedGoal = Object.keys(GOALS).find(key => GOALS[key] === userData.aptitudeRoadmap.daysSelected);
                setSelectedGoal(matchedGoal || null);
            }
            setLoadingRoadmap(false);
        } else {
            handleGenerate(60, false);
            setSelectedGoal("medium");
            setLoadingRoadmap(false);
        }
    }, [userData]);

    const handleDaysChange = (d) => {
        setDays(d);
        const matchedGoal = Object.keys(GOALS).find(key => GOALS[key] === d);
        setSelectedGoal(matchedGoal || null);
    };

    const handleGoalSelect = (goal) => {
        setSelectedGoal(goal);
        const newDays = GOALS[goal];
        setDays(newDays);
    };

    useEffect(() => {
        if (roadmap?.daysSelected === days) return;

        const timer = setTimeout(() => {
            handleGenerate(days, true);
        }, 600);

        return () => clearTimeout(timer);
    }, [days]);

    const handleGenerate = async (selectedDays, mergeProgress = false) => {
        setIsGenerating(true);
        try {
            const baseRoadmap = generateAptitudeRoadmap(selectedDays);
            const newRoadmap = { ...baseRoadmap, daysSelected: selectedDays, isLocked: roadmap?.isLocked || false };

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

            saveRoadmap(newRoadmap);
        } catch (error) {
            console.error(error);
        } finally {
            setTimeout(() => setIsGenerating(false), 500);
        }
    };

    const toggleTask = (sectionSlug, dayIdx, itemIdx) => {
        if (!roadmap) return;

        const updatedSections = roadmap.sections.map(section => {
            if (section.slug === sectionSlug) {
                const updatedTasks = section.tasks.map((day, dIndex) => {
                    if (dIndex === dayIdx) {
                        return {
                            ...day,
                            items: day.items.map((item, iIndex) => {
                                if (iIndex === itemIdx) {
                                    return { ...item, completed: !item.completed };
                                }
                                return item;
                            })
                        };
                    }
                    return day;
                });

                const newCompletedCount = updatedTasks.reduce((acc, day) => {
                    return acc + day.items.filter(i => i.completed).length;
                }, 0);

                return { ...section, tasks: updatedTasks, completed: newCompletedCount };
            }
            return section;
        });

        const newRoadmap = { ...roadmap, sections: updatedSections };
        saveRoadmap(newRoadmap);
    };

    const toggleLock = (isLocked) => {
        if (isLocked) {
            const updatedRoadmap = {
                ...roadmap,
                isLocked: true,
                startDate: roadmap.startDate || new Date().toISOString()
            };
            saveRoadmap(updatedRoadmap);
        } else {
            setShowResetModal(true);
        }
    };

    const confirmUnlock = () => {
        const updatedRoadmap = { ...roadmap, isLocked: false };
        saveRoadmap(updatedRoadmap);
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
        if (d <= 45) return { label: 'Aptitude revision', color: 'rose', icon: <Flame size={16} /> };
        if (d <= 75) return { label: 'Aptitude intermediate', color: 'amber', icon: <Zap size={16} /> };
        return { label: 'Aptitude foundation', color: 'emerald', icon: <Trophy size={16} /> };
    };

    const levelInfo = getLevelInfo(days);

    if (loadingRoadmap) {
        return (
            <div className="fixed inset-0 z-10 flex items-center justify-center bg-[#030303] text-white font-sans">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center gap-6"
                >
                    <div className="relative w-20 h-20">
                        <motion.span
                            className="absolute inset-0 border-2 border-emerald-500/30 rounded-full"
                            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        />
                        <motion.span
                            className="absolute inset-2 border-2 border-emerald-500/60 rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        />
                        <motion.span
                            className="absolute inset-0 border-t-2 border-emerald-500 rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        />
                    </div>
                    <span className="text-sm font-medium text-zinc-400 font-mono tracking-wide">
                        Loading your aptitude roadmap...
                    </span>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 top-0 z-10 flex bg-[#030303] text-white overflow-hidden font-sans">
            {isMobile && (
                <>
                    <div className="fixed top-24 left-4 z-[60]">
                        <button
                            onClick={() => setMobileSidebarOpen((prev) => !prev)}
                            className="h-10 w-10 inline-flex items-center justify-center rounded-xl border border-white/15 bg-[#0a0a0a]/90 text-white cursor-pointer"
                            aria-label={mobileSidebarOpen ? 'Close roadmap menu' : 'Open roadmap menu'}
                        >
                            {mobileSidebarOpen ? <X size={18} /> : <Menu size={18} />}
                        </button>
                    </div>
                    <div
                        className={`fixed inset-0 bg-black/60 z-[40] transition-opacity duration-300 ${mobileSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                        onClick={() => setMobileSidebarOpen(false)}
                    />
                </>
            )}

            <RoadmapSidebar
                onBack={onBack}
                days={days}
                setDays={handleDaysChange}
                isLocked={roadmap?.isLocked}
                onToggleLock={toggleLock}
                onGenerate={() => handleGenerate(days, true)}
                isGenerating={isGenerating}
                levelInfo={levelInfo}
                roadmap={roadmap}
                activeSection={expandedSection}
                onSectionClick={scrollToSection}
                isMobile={isMobile}
                isOpen={mobileSidebarOpen}
                onClose={() => setMobileSidebarOpen(false)}
            />

            <div className="flex-1 h-full overflow-y-auto custom-scrollbar relative bg-[#030303]">
                {/* Glows */}
                <div className="fixed inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] bg-emerald-900/10 rounded-full blur-[120px]" />
                    <div className="absolute bottom-0 left-20 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[120px]" />
                </div>

                <div className="px-4 sm:px-8 lg:px-10 py-6 sm:py-10 max-w-5xl mx-auto space-y-6 sm:space-y-8 pb-28 sm:pb-40">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-6 mb-8 sm:mb-12 border-b border-white/5 pb-6 sm:pb-8"
                    >
                        <div className="relative z-10 w-full sm:w-auto text-left ml-0 sm:-ml-14">
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-200 to-emerald-400 mb-2 block pb-1">
                                Aptitude Curriculum
                            </h1>
                            <p className="text-zinc-500 text-sm max-w-md leading-relaxed">
                                Master Quantitative, Logical & Verbal Aptitude, one planned day at a time.
                            </p>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                            {!roadmap?.isLocked ? (
                                <>
                                    <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mr-1">Select your goal</span>
                                    <div className="flex flex-wrap justify-end items-center gap-2 sm:gap-4">
                                        {[
                                            { label: 'Beginner', goal: 'beginner', questions: '180Q', color: 'text-purple-400', border: 'border-purple-500/20' },
                                            { label: 'Medium', goal: 'medium', questions: '120Q', color: 'text-amber-400', border: 'border-amber-500/20' },
                                            { label: 'Expert', goal: 'expert', questions: '60Q', color: 'text-rose-400', border: 'border-rose-500/20' }
                                        ].map((preset) => {
                                            const isSelected = selectedGoal === preset.goal;
                                            return (
                                                <button
                                                    key={preset.label}
                                                    onClick={() => handleGoalSelect(preset.goal)}
                                                    className={`px-4 py-2.5 rounded-xl border transition-all duration-300 flex flex-col items-center justify-center gap-0.5 group min-w-[90px] relative overflow-hidden cursor-pointer
                                                        ${isSelected
                                                            ? `bg-white/10 ring-1 ring-white/20 shadow-lg scale-105 ${preset.border}`
                                                            : `bg-white/5 border-white/10 hover:bg-white/10 hover:scale-105 hover:border-white/20`
                                                        }`}
                                                >
                                                    <span className={`text-[10px] font-bold uppercase tracking-wider relative z-10 ${preset.color}`}>{preset.label}</span>
                                                    <div className="flex items-center gap-1 relative z-10">
                                                        <span className="text-xs font-mono font-bold text-zinc-200">{GOALS[preset.goal]}d</span>
                                                        <span className="text-[9px] font-medium text-zinc-500">({preset.questions})</span>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4 sm:gap-6">
                                    <div className="hidden md:flex flex-col items-end">
                                        {(() => {
                                            const startDate = roadmap?.startDate;
                                            let currentDay = 1;

                                            if (startDate) {
                                                const start = new Date(startDate);
                                                start.setHours(0, 0, 0, 0);
                                                const today = new Date();
                                                today.setHours(0, 0, 0, 0);
                                                const diffTime = today - start;
                                                currentDay = Math.max(1, Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1);
                                            }

                                            const totalDays = days || 120;
                                            const progressPercent = Math.min((currentDay / totalDays) * 100, 100);

                                            return (
                                                <>
                                                    <div className="flex items-baseline gap-2 mb-1.5">
                                                        <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Day {currentDay}</span>
                                                        <span className="text-[10px] text-zinc-600 font-medium">of {totalDays}</span>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-1.5 w-32 bg-zinc-800/50 rounded-full overflow-hidden border border-white/5">
                                                            <div
                                                                className="h-full bg-gradient-to-r from-amber-600 via-amber-500 to-emerald-600 relative"
                                                                style={{ width: `${progressPercent}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-xs font-bold text-white">{Math.round(progressPercent)}%</span>
                                                    </div>
                                                </>
                                            );
                                        })()}
                                    </div>

                                    <div className="px-4 py-1.5 bg-gradient-to-r from-zinc-900 to-black border border-white/10 rounded-full text-zinc-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg">
                                        <Lock size={12} className="text-amber-500" />
                                        <span>Plan Active</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    <AnimatePresence mode="wait">
                        {isGenerating ? (
                            <motion.div
                                key="loader"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="h-64 flex flex-col items-center justify-center text-zinc-500 gap-6"
                            >
                                <div className="relative w-20 h-20">
                                    <motion.span
                                        className="absolute inset-0 border-2 border-emerald-500/30 rounded-full"
                                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                    />
                                    <motion.span
                                        className="absolute inset-2 border-2 border-emerald-500/60 rounded-full"
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                    />
                                </div>
                                <span className="text-sm font-medium text-zinc-400 font-mono tracking-wide">
                                    Optimizing your path...
                                </span>
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
                                            onToggleTask={(dayIdx, itemIdx) => toggleTask(section.slug, dayIdx, itemIdx)}
                                            delay={idx * 0.1}
                                            roadmapStartDate={roadmap?.isLocked ? roadmap.startDate : null}
                                            isMobile={isMobile}
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

export default RoadmapAptitude;
