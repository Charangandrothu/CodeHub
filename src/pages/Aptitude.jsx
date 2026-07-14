import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, ArrowRight, BarChart2, Brain, MessageSquare,
    Percent, DollarSign, Timer, Gauge, Layers, Hash, LineChart,
    TrendingUp, Shuffle, Anchor, Binary, Compass, KeyRound,
    GitBranch, Lightbulb, CircleDot, PuzzleIcon, Database,
    AlarmClock, AlertTriangle, BookMarked, PenLine, SpellCheck,
    ListOrdered, MessageCircle, Link2, Repeat, BookOpen, Users,
    Target, Zap, Star, Menu, X, Settings, Shield, Crown, Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logo_img from '../assets/logo_img.png';

const colorMap = {
    blue: { accent: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', active: 'bg-blue-500/15 border-blue-500/30 text-blue-300', bar: 'bg-blue-500', hex: '#3b82f6' },
    purple: { accent: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20', active: 'bg-purple-500/15 border-purple-500/30 text-purple-300', bar: 'bg-purple-500', hex: '#a855f7' },
    emerald: { accent: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', active: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300', bar: 'bg-emerald-500', hex: '#10b981' },
};

const priorityColors = {
    'Very High': 'text-red-400 bg-red-500/10 border-red-500/20',
    'High': 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    'Medium': 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
    'Low': 'text-gray-400 bg-white/5 border-white/10',
};

const SECTIONS = [
    { key: 'aptitude', label: 'Quantitative Aptitude', icon: BarChart2, color: 'blue', totalQuestions: 180, totalTopics: 14, description: 'Numerical ability, arithmetic, equations, formulas, and data interpretation.' },
    { key: 'reasoning', label: 'Logical Reasoning', icon: Brain, color: 'purple', totalQuestions: 130, totalTopics: 10, description: 'Cognitive reasoning, logical relationships, puzzles, and arrangements.' },
    { key: 'verbal', label: 'Verbal Ability', icon: MessageSquare, color: 'emerald', totalQuestions: 130, totalTopics: 8, description: 'Reading comprehension, grammar rules, vocabulary, and paragraph logic.' }
];

const TOPICS = {
    aptitude: [
        { name: 'Percentages', count: 20, priority: 'Very High', icon: Percent, slug: 'percentages' },
        { name: 'Profit & Loss', count: 18, priority: 'Very High', icon: DollarSign, slug: 'profit-loss' },
        { name: 'Time & Work', count: 16, priority: 'High', icon: Timer, slug: 'time-work' },
        { name: 'Time, Speed & Distance', count: 15, priority: 'High', icon: Gauge, slug: 'time-speed-distance' },
        { name: 'Averages', count: 12, priority: 'Medium', icon: BarChart2, slug: 'averages' },
        { name: 'Ratio & Proportion', count: 12, priority: 'Medium', icon: Layers, slug: 'ratio-proportion' },
        { name: 'Number Series', count: 14, priority: 'High', icon: Hash, slug: 'number-series' },
        { name: 'Data Interpretation', count: 16, priority: 'High', icon: LineChart, slug: 'data-interpretation' },
        { name: 'Simple & Compound Interest', count: 10, priority: 'Medium', icon: TrendingUp, slug: 'interest' },
        { name: 'Permutations & Combinations', count: 10, priority: 'Medium', icon: Shuffle, slug: 'permutations-combinations' },
        { name: 'Probability', count: 10, priority: 'Medium', icon: CircleDot, slug: 'probability' },
        { name: 'Mixtures & Alligation', count: 8, priority: 'Low', icon: Anchor, slug: 'mixtures' },
        { name: 'Boats & Streams', count: 8, priority: 'Low', icon: Gauge, slug: 'boats-streams' },
        { name: 'Number System', count: 11, priority: 'Medium', icon: Binary, slug: 'number-systems' },
    ],
    reasoning: [
        { name: 'Seating Arrangements', count: 18, priority: 'Very High', icon: Users, slug: 'seating-arrangements' },
        { name: 'Direction Sense', count: 12, priority: 'High', icon: Compass, slug: 'direction-sense' },
        { name: 'Coding-Decoding', count: 16, priority: 'Very High', icon: KeyRound, slug: 'coding-decoding' },
        { name: 'Blood Relations', count: 12, priority: 'High', icon: GitBranch, slug: 'blood-relations' },
        { name: 'Syllogisms', count: 14, priority: 'High', icon: Lightbulb, slug: 'syllogisms' },
        { name: 'Analogies', count: 10, priority: 'Medium', icon: Link2, slug: 'analogies' },
        { name: 'Odd One Out', count: 10, priority: 'Medium', icon: CircleDot, slug: 'odd-one-out' },
        { name: 'Puzzles', count: 14, priority: 'High', icon: PuzzleIcon, slug: 'puzzles' },
        { name: 'Data Sufficiency', count: 12, priority: 'Medium', icon: Database, slug: 'data-sufficiency' },
        { name: 'Clocks & Calendars', count: 12, priority: 'Medium', icon: AlarmClock, slug: 'clocks-calendars' },
    ],
    verbal: [
        { name: 'Error Identification', count: 20, priority: 'Very High', icon: AlertTriangle, slug: 'error-identification' },
        { name: 'Reading Comprehension', count: 25, priority: 'Very High', icon: BookMarked, slug: 'reading-comprehension' },
        { name: 'Sentence Completion', count: 15, priority: 'High', icon: PenLine, slug: 'sentence-completion' },
        { name: 'Synonyms & Antonyms', count: 20, priority: 'High', icon: SpellCheck, slug: 'synonyms-antonyms' },
        { name: 'Para Jumbles', count: 12, priority: 'Medium', icon: ListOrdered, slug: 'para-jumbles' },
        { name: 'Idioms & Phrases', count: 10, priority: 'Medium', icon: MessageCircle, slug: 'idioms-phrases' },
        { name: 'Prepositions & Conjunctions', count: 10, priority: 'Medium', icon: Link2, slug: 'prepositions-conjunctions' },
        { name: 'Active & Passive Voice', count: 18, priority: 'High', icon: Repeat, slug: 'active-passive' },
    ],
};

const Aptitude = () => {
    const navigate = useNavigate();
    const { currentUser, userData } = useAuth();
    const [activeTab, setActiveTab] = useState('aptitude');
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 1024);

    useEffect(() => {
        const mq = window.matchMedia('(min-width: 1024px)');
        const handler = (e) => setIsDesktop(e.matches);
        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    }, []);

    const activeSection = SECTIONS.find(s => s.key === activeTab);
    const colors = colorMap[activeSection.color] || colorMap.blue;
    const SectionIcon = activeSection.icon;
    const topics = TOPICS[activeTab] || [];

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.04
            }
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 15 },
        show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 25 } }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white">
            {/* Mobile overlay backdrop */}
            <div
                className={`lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[54] transition-opacity duration-300 ${mobileSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setMobileSidebarOpen(false)}
            />

            {/* Premium Left Sidebar */}
            <motion.aside
                initial={{ x: -288, opacity: 0 }}
                animate={{
                    x: isDesktop ? 0 : (mobileSidebarOpen ? 0 : -288),
                    opacity: isDesktop ? 1 : (mobileSidebarOpen ? 1 : 0)
                }}
                transition={{ type: "spring", stiffness: 260, damping: 28 }}
                className="w-72 h-screen fixed top-0 left-0 flex flex-col bg-[#0a0a0a] border-r border-white/5 z-[55] lg:z-50 p-4 sm:p-6 lg:p-6"
            >
                <div className="lg:hidden flex justify-end mb-2">
                    <button
                        onClick={() => setMobileSidebarOpen(false)}
                        className="h-9 w-9 inline-flex items-center justify-center rounded-lg border border-white/10 bg-white/5 text-gray-200"
                        aria-label="Close sidebar"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Logo Section */}
                <div
                    className="flex items-center gap-3 mb-10 px-2 shrink-0 cursor-pointer group"
                    onClick={() => {
                        setMobileSidebarOpen(false);
                        navigate('/dashboard');
                    }}
                >
                    <img
                        src={logo_img}
                        alt="CodeHubx Logo"
                        className="w-9 h-9 rounded-xl shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300 object-cover"
                    />
                    <div>
                        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-400 tracking-tight">
                            CodeHubx
                        </h1>
                        <p className={`text-[10px] font-medium tracking-wider uppercase transition-colors ${userData?.isElite ? 'text-emerald-500' :
                                userData?.isPro ? 'text-blue-500' :
                                    'text-gray-500'
                            }`}>
                            {userData?.isElite ? 'Elite' : userData?.isPro ? 'Pro' : 'Free'}
                        </p>
                    </div>
                </div>

                {/* Pro Upgrade Promotion */}
                {userData && !userData.isPro && (
                    <div className="px-2 mb-6 shrink-0">
                        <motion.button
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => navigate('/pricing')}
                            className="relative w-full flex items-center justify-center gap-2 px-3 py-2 rounded-full bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-amber-500/10 border border-amber-500/30 shadow-[0_0_15px_-3px_rgba(245,158,11,0.2)] group overflow-hidden cursor-pointer"
                        >
                            <motion.div
                                animate={{ x: ['-200%', '200%'] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "linear", repeatDelay: 2 }}
                                className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-amber-400/20 to-transparent skew-x-12 blur-sm"
                            />
                            <Sparkles size={14} className="text-amber-400" />
                            <span className="text-xs font-semibold bg-gradient-to-r from-amber-200 to-yellow-400 bg-clip-text text-transparent group-hover:text-yellow-300 transition-colors">
                                Upgrade to Pro
                            </span>
                            <Crown size={14} className="text-amber-400 fill-amber-400/20" />
                        </motion.button>
                    </div>
                )}

                {/* Section Lists */}
                <div className="flex-1 overflow-y-auto custom-scrollbar -mx-2 px-2 space-y-1">
                    <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-4 px-2">
                        Practice Sections
                    </h3>
                    {SECTIONS.map((section) => {
                        const active = activeTab === section.key;
                        const Icon = section.icon;
                        const c = colorMap[section.color] || colorMap.blue;
                        const activeStyle = active ? {
                            color: c.hex,
                            borderColor: `${c.hex}40`,
                        } : {};

                        return (
                            <button
                                key={section.key}
                                onClick={() => {
                                    setMobileSidebarOpen(false);
                                    setActiveTab(section.key);
                                }}
                                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-300 group relative overflow-hidden ${active
                                    ? 'text-white border'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                                    }`}
                                style={activeStyle}
                            >
                                {active && (
                                    <motion.div
                                        layoutId="active-aptitude-bg"
                                        className="absolute inset-0 rounded-xl"
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                        style={{ backgroundColor: `${c.hex}15` }}
                                    />
                                )}
                                <Icon
                                    size={18}
                                    className="relative z-10 transition-colors duration-300"
                                    style={{ color: active ? c.hex : undefined }}
                                />
                                <span className="relative z-10 truncate flex-1 text-left">{section.label}</span>
                                {active && (
                                    <div
                                        className="ml-2 w-1.5 h-1.5 rounded-full relative z-10 shadow-[0_0_8px]"
                                        style={{
                                            backgroundColor: c.hex,
                                            boxShadow: `0 0 8px ${c.hex}`
                                        }}
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* User Profile Footer */}
                <div className="mt-6 pt-6 border-t border-white/10 shrink-0">
                    <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group">
                        <img
                            src={userData?.photoURL || currentUser?.photoURL || `https://api.dicebear.com/9.x/adventurer/svg?seed=${userData?.username || currentUser?.email?.split('@')[0] || 'User'}`}
                            alt="Profile"
                            className="w-10 h-10 rounded-full border-2 border-white/10 group-hover:border-blue-500/50 transition-colors object-cover cursor-pointer"
                            onClick={() => {
                                setMobileSidebarOpen(false);
                                if (!userData?.profileCompleted) {
                                    navigate('/complete-profile');
                                } else {
                                    navigate(`/profile/${userData?.username}`);
                                }
                            }}
                        />
                        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => {
                            setMobileSidebarOpen(false);
                            if (!userData?.profileCompleted) {
                                navigate('/complete-profile');
                            } else {
                                navigate(`/profile/${userData?.username}`);
                            }
                        }}>
                            <h4 className="text-sm font-semibold text-white truncate group-hover:text-blue-400 transition-colors">
                                {userData?.displayName || currentUser?.displayName || 'User'}
                            </h4>
                            <p className="text-xs text-gray-500 truncate">@{userData?.username || 'user'}</p>
                        </div>
                        {userData?.role === 'admin' && (
                            <button
                                onClick={() => {
                                    setMobileSidebarOpen(false);
                                    navigate('/admin');
                                }}
                                className="p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg transition-all cursor-pointer"
                                title="Admin Dashboard"
                            >
                                <Shield size={18} />
                            </button>
                        )}
                        <button
                            onClick={() => {
                                setMobileSidebarOpen(false);
                                navigate('/settings');
                            }}
                            className="p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg transition-all cursor-pointer"
                            title="Settings"
                        >
                            <Settings size={18} />
                        </button>
                    </div>
                </div>
            </motion.aside>

            {/* Mobile Header Bar */}
            <div className="lg:hidden flex items-center justify-between p-4 bg-[#0a0a0a] border-b border-white/5 sticky top-0 z-40">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setMobileSidebarOpen(prev => !prev)}
                        className="h-9 w-9 inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white"
                        aria-label={mobileSidebarOpen ? 'Close menu' : 'Open menu'}
                    >
                        {mobileSidebarOpen ? <X size={16} /> : <Menu size={16} />}
                    </button>
                    <span className="text-sm font-bold text-white">Aptitude & Reasoning</span>
                </div>
                <img
                    src={logo_img}
                    alt="CodeHubx"
                    className="w-7 h-7 rounded-lg"
                    onClick={() => navigate('/dashboard')}
                />
            </div>

            {/* Main Content Area */}
            <div className="lg:ml-72 p-6 lg:p-8 max-w-[1920px] max-lg:p-4 sm:max-lg:p-6 overflow-hidden">
                {/* Background glows */}
                <div className="fixed top-20 left-1/3 w-96 h-96 bg-blue-600/5 rounded-full blur-[128px] pointer-events-none hidden sm:block animate-pulse duration-10000" />
                <div className="fixed bottom-20 right-1/4 w-96 h-96 bg-purple-600/5 rounded-full blur-[128px] pointer-events-none hidden sm:block animate-pulse duration-10000" />

                <motion.div
                    className="relative z-10 space-y-6"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {/* Header Details Card */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                        whileHover={{ borderColor: `${colors.hex}30` }}
                        className="relative overflow-hidden p-6 rounded-2xl border border-white/[0.05] bg-[#0A0A0A]/40 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl transition-all duration-500"
                    >
                        {/* Premium SaaS Grid Overlay */}
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />
                        
                        {/* Dynamic Glow */}
                        <div 
                            className="absolute top-0 right-0 w-64 h-64 rounded-full blur-[80px] pointer-events-none transition-all duration-700" 
                            style={{ 
                                background: `radial-gradient(circle, ${colors.hex}0f 0%, transparent 70%)` 
                            }}
                        />

                        <div className="relative z-10 flex items-center gap-4">
                            <motion.div 
                                whileHover={{ scale: 1.05, rotate: 5 }}
                                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-inner relative transition-colors duration-500"
                                style={{
                                    background: `${colors.hex}15`,
                                    border: `1px solid ${colors.hex}30`
                                }}
                            >
                                <BookOpen size={20} style={{ color: colors.hex }} className="transition-colors duration-500 relative z-10" />
                                <div className="absolute inset-0 rounded-xl blur-sm opacity-20 transition-colors duration-500" style={{ backgroundColor: colors.hex }} />
                            </motion.div>
                            <div>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="text-[9px] font-bold tracking-widest uppercase text-zinc-500">
                                        Learning Paths
                                    </span>
                                    <span className="w-1 h-1 rounded-full bg-zinc-700" />
                                    <span 
                                        className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest border transition-colors duration-500"
                                        style={{
                                            backgroundColor: `${colors.hex}10`,
                                            borderColor: `${colors.hex}25`,
                                            color: colors.hex,
                                        }}
                                    >
                                        Premium Suite
                                    </span>
                                </div>
                                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight mt-1 flex items-center gap-2">
                                    Aptitude & Reasoning
                                </h2>
                                <p className="text-zinc-400 text-[11px] sm:text-xs mt-0.5 leading-relaxed max-w-xl font-medium">
                                    Master quantitative ability, logical reasoning, and verbal aptitude designed for placements and competitive exams.
                                </p>
                            </div>
                        </div>

                        {/* Stats Panel */}
                        <div className="relative z-10 flex items-center gap-3 shrink-0 border-t border-white/[0.04] pt-4 md:pt-0 md:border-t-0 text-xs">
                            <motion.div 
                                whileHover={{ y: -2, borderColor: `${colors.hex}30` }}
                                className="px-4 py-2 rounded-xl bg-white/[0.01] border border-white/[0.05] transition-all duration-300 flex items-center gap-3 min-w-[120px]"
                            >
                                <div className="p-1.5 rounded-lg bg-white/[0.02]" style={{ color: colors.hex }}>
                                    <Target size={14} />
                                </div>
                                <div>
                                    <span className="text-zinc-500 font-semibold uppercase tracking-wider text-[8px] block">Questions</span>
                                    <span className="text-xs font-bold text-white">440+ Qs</span>
                                </div>
                            </motion.div>
                            <motion.div 
                                whileHover={{ y: -2, borderColor: `${colors.hex}30` }}
                                className="px-4 py-2 rounded-xl bg-white/[0.01] border border-white/[0.05] transition-all duration-300 flex items-center gap-3 min-w-[120px]"
                            >
                                <div className="p-1.5 rounded-lg bg-white/[0.02]" style={{ color: colors.hex }}>
                                    <Layers size={14} />
                                </div>
                                <div>
                                    <span className="text-zinc-500 font-semibold uppercase tracking-wider text-[8px] block">Topics</span>
                                    <span className="text-xs font-bold text-white">32 Areas</span>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* Active Section Header Card */}
                    <motion.div
                        key={`${activeTab}-header`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ type: 'spring', stiffness: 220, damping: 22 }}
                        whileHover={{ borderColor: `${colors.hex}25` }}
                        className={`relative overflow-hidden p-4 rounded-xl border border-white/[0.05] bg-[#0A0A0A]/40 backdrop-blur-md flex flex-col sm:flex-row sm:items-center gap-4 shadow-lg transition-colors duration-300`}
                    >
                        <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] pointer-events-none transition-all duration-500`} style={{ background: `radial-gradient(circle, ${colors.hex}12 0%, transparent 70%)` }} />
                        <div 
                            className={`relative z-10 w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border transition-all duration-500`}
                            style={{
                                backgroundColor: `${colors.hex}15`,
                                borderColor: `${colors.hex}30`,
                                color: colors.hex
                            }}
                        >
                            <SectionIcon size={16} />
                        </div>
                        <div className="relative z-10 flex-1">
                            <h3 className="text-white font-bold text-xs sm:text-sm">{activeSection.label}</h3>
                            <p className="text-[11px] text-zinc-500 mt-0.5">{activeSection.description} · {activeSection.totalQuestions} questions across {topics.length} topics</p>
                        </div>
                        <span 
                            className={`relative z-10 w-fit px-3 py-1 rounded-xl text-xs font-bold border transition-colors duration-500`}
                            style={{
                                backgroundColor: `${colors.hex}15`,
                                borderColor: `${colors.hex}30`,
                                color: colors.hex
                            }}
                        >
                            {activeSection.totalQuestions} Qs
                        </span>
                    </motion.div>

                    {/* Topics Grid with Framer Motion staggered child animations */}
                    <motion.div
                        key={`${activeTab}-grid`}
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3"
                    >
                        {topics.map((topic) => {
                            const TopicIcon = topic.icon;
                            return (
                                <motion.div
                                    key={topic.name}
                                    variants={cardVariants}
                                    whileHover={{ 
                                        y: -4, 
                                        scale: 1.01,
                                        borderColor: `${colors.hex}30`,
                                        boxShadow: `0 10px 30px -10px ${colors.hex}25`
                                    }}
                                    transition={{ duration: 0.3 }}
                                    className="group relative overflow-hidden p-5 rounded-2xl border border-white/[0.06] bg-[#0a0a0a]/85 cursor-pointer shadow-lg"
                                >
                                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: `radial-gradient(circle at 50% 120%, ${colors.hex}15 0%, transparent 60%)` }} />
                                    <div className="relative z-10 flex flex-col h-full justify-between">
                                        <div>
                                            <div className="flex items-start justify-between mb-4">
                                                <div 
                                                    className="w-9 h-9 rounded-xl flex items-center justify-center border transition-all duration-500"
                                                    style={{
                                                        backgroundColor: `${colors.hex}15`,
                                                        borderColor: `${colors.hex}30`,
                                                        color: colors.hex
                                                    }}
                                                >
                                                    <TopicIcon size={16} />
                                                </div>
                                                <span className={`text-[9px] px-2 py-0.5 rounded-full border font-bold uppercase tracking-wide ${priorityColors[topic.priority]}`}>
                                                    {topic.priority}
                                                </span>
                                            </div>
                                            <h4 className="text-white text-sm font-semibold mb-1 group-hover:text-white transition-colors duration-300">{topic.name}</h4>
                                            <p className="text-xs text-zinc-500 mb-4">{topic.count} questions</p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                navigate(`/companies/all/practice/${activeTab}/${topic.slug}`);
                                            }}
                                            style={{
                                                backgroundColor: `${colors.hex}15`,
                                                borderColor: `${colors.hex}30`,
                                                color: colors.hex
                                            }}
                                            className="w-full py-2.5 rounded-xl text-xs font-semibold border hover:brightness-125 transition-all flex items-center justify-center gap-1.5 shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
                                        >
                                            Practice Now <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
                                        </button>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
};

export default Aptitude;
