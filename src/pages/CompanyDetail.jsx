import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, ArrowRight, BookOpen, Brain, MessageSquare, Code2,
    FileText, Users, Target, Clock, Zap, Trophy, CheckCircle2,
    TrendingUp, Calendar, Star, Construction, Building2, BarChart2,
    DollarSign, Timer, Gauge, Layers, Hash, LineChart, Percent,
    Shuffle, Anchor, Binary, Compass, KeyRound, GitBranch, Lightbulb,
    CircleDot, PuzzleIcon, Database, AlarmClock, AlertTriangle,
    BookMarked, PenLine, SpellCheck, ListOrdered, MessageCircle, Link2,
    Info, ShieldCheck, Repeat, Flame, Rocket, Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/* ─── Letter-mark logo ──────────────────────────── */
const CompanyLogo = ({ abbr, gradient, size = 'md', image }) => {
    const sz = size === 'lg' ? 'w-16 h-16 rounded-2xl text-sm' : 'w-12 h-12 rounded-xl text-xs';
    if (image) {
        return (
            <div className={`${sz} flex items-center justify-center shrink-0 shadow-lg overflow-hidden bg-white`}>
                <img src={image} alt={abbr} className="w-full h-full object-contain p-1" />
            </div>
        );
    }
    return (
        <div className={`${sz} bg-gradient-to-br ${gradient} flex items-center justify-center shrink-0 shadow-lg`}>
            <span className="font-black text-white tracking-tight leading-none">{abbr}</span>
        </div>
    );
};

/* ─── Company config ────────────────────────────── */
const COMPANY_CONFIG = {
    tcs: {
        name: 'TCS', fullName: 'Tata Consultancy Services', abbr: 'TCS',
        logoGradient: 'from-blue-500 to-blue-700', accentColor: 'blue', image: '/tcs.jpg',
        description: "India's largest IT company hiring 30,000+ freshers annually via TCS NQT. Two sections — Foundation (easy-moderate) and Advanced (for Digital/Prime roles).",
        hiringPattern: 'Mass Hiring — 30,000+ freshers/year',
        package: '₹3.36 LPA (Ninja) · ₹7–9 LPA (Digital/Prime)',
        eligibility: '60% in 10th, 12th & Graduation · Max 1 backlog · All branches',
        examPattern: 'TCS National Qualifier Test (NQT)',
        rounds: ['NQT Online Test', 'TR Interview', 'MR Interview', 'HR Interview'],
        sections: [
            { key: 'aptitude', label: 'Numerical Ability', icon: BarChart2, color: 'blue', totalTopics: 14, totalQuestions: 200, description: 'Percentages, Profit & Loss, Time & Work, Data Interpretation', isLive: true },
            { key: 'reasoning', label: 'Reasoning Ability', icon: Brain, color: 'purple', totalTopics: 10, totalQuestions: 150, description: 'Seating Arrangements, Syllogisms, Coding-Decoding, Blood Relations', isLive: true },
            { key: 'verbal', label: 'Verbal Ability', icon: MessageSquare, color: 'emerald', totalTopics: 8, totalQuestions: 150, description: 'Reading Comprehension, Error Identification, Sentence Completion', isLive: true },
            { key: 'coding', label: 'Coding Problems', icon: Code2, color: 'orange', totalTopics: 5, totalQuestions: 30, description: 'Arrays, Strings, Math, Recursion — 2 problems in 90 min', isLive: false },
            { key: 'mocks', label: 'Mock Tests', icon: FileText, color: 'pink', totalTopics: 0, totalQuestions: 0, description: 'Full-length simulated TCS NQT tests with detailed analysis', isLive: false },
            { key: 'experiences', label: 'Interview Experiences', icon: Users, color: 'yellow', totalTopics: 0, totalQuestions: 0, description: 'Real interview stories from students placed in TCS', isLive: false },
        ],
        sprintDays: 30,
        keyFacts: [
            { icon: ShieldCheck, text: 'No negative marking in Foundation Section' },
            { icon: Timer, text: '75 min for Foundation · 115 min for Advanced' },
            { icon: Lightbulb, text: 'Attempt all questions — no penalty for wrong answers' },
            { icon: Target, text: 'Cut-off: ~70–75% in each section' },
            { icon: Calendar, text: 'Held 4–5 times per year nationally' },
        ],
    },
    infosys: {
        name: 'Infosys', fullName: 'Infosys Limited', abbr: 'INFY',
        logoGradient: 'from-emerald-500 to-emerald-700', accentColor: 'emerald', image: '/infosys.jpg',
        description: "Global IT leader hiring 50,000+ freshers. Unique selection process including a notorious Pseudo Code section.",
        hiringPattern: 'Mass Hiring — 50,000+ freshers/year',
        package: '₹4.0–4.5 LPA (SE) · ₹6.5–10.5 LPA (DSE/SP)',
        eligibility: '60% or 6.0 CGPA throughout · 0 active backlogs · All branches',
        examPattern: 'Infosys Recruitment Test (IRT)',
        rounds: ['Online Assessment (IRT)', 'Technical Interview', 'HR Interview'],
        sections: [
            { key: 'infosysAptitude', label: 'Quantitative Aptitude', icon: BarChart2, color: 'blue', totalTopics: 10, totalQuestions: 150, description: 'Percentages, Profit & Loss, Time & Work, Data Interpretation', isLive: true },
            { key: 'infosysReasoning', label: 'Logical Reasoning', icon: Brain, color: 'purple', totalTopics: 9, totalQuestions: 150, description: 'Syllogisms, Puzzles, Data Interpretation, Blood Relations', isLive: true },
            { key: 'infosysVerbal', label: 'Verbal Ability', icon: MessageSquare, color: 'emerald', totalTopics: 6, totalQuestions: 100, description: 'Reading Comprehension, Sentence Correction, Para Jumbles', isLive: true },
            { key: 'pseudocode', label: 'Pseudo Code', icon: Code2, color: 'pink', totalTopics: 4, totalQuestions: 100, description: 'Trace & Output, Loop Tracing, Array Operations, String Manipulation', isLive: true },
            { key: 'coding', label: 'Coding Problems', icon: Code2, color: 'orange', totalTopics: 5, totalQuestions: 30, description: 'Arrays, Strings, Greedy, Recursion — 2 problems in 58 min', isLive: false },
            { key: 'mocks', label: 'Mock Tests', icon: FileText, color: 'yellow', totalTopics: 0, totalQuestions: 0, description: 'Full-length simulated IRT tests with detailed analysis', isLive: false },
            { key: 'experiences', label: 'Interview Experiences', icon: Users, color: 'blue', totalTopics: 0, totalQuestions: 0, description: 'Real interview stories from students placed in Infosys', isLive: false },
        ],
        sprintDays: 30,
        keyFacts: [
            { icon: ShieldCheck, text: 'No negative marking — attempt ALL questions' },
            { icon: Timer, text: 'Strict section-wise time limits' },
            { icon: Target, text: 'Must clear sectional cut-offs (~70-80%ile)' },
            { icon: AlertTriangle, text: 'Logical Reasoning & Pseudo Code are very hard' },
            { icon: Calendar, text: 'Results typically within 2-3 weeks' },
        ],
    },
    wipro: {
        name: 'Wipro', fullName: 'Wipro Limited', abbr: 'WIPRO',
        logoGradient: 'from-purple-500 to-purple-700', accentColor: 'purple', image: '/wipro.jpg',
        description: "Hires 15,000+ freshers via the Elite National Talent Hunt (NLTH). Features a unique and mandatory 20-minute Essay Writing section.",
        hiringPattern: 'Mass Hiring — 15,000+ freshers/year',
        package: '₹3.5 LPA (Project Engineer)',
        eligibility: '60% or 6.0 CGPA throughout · Max 1 active backlog · All branches',
        examPattern: 'Elite National Talent Hunt (NLTH)',
        rounds: ['NLTH Online Test', 'Voice Assessment', 'Business Discussion (Interview)'],
        sections: [
            { key: 'wiproAptitude', label: 'Quantitative Aptitude', icon: BarChart2, color: 'blue', totalTopics: 11, totalQuestions: 150, description: 'Percentages, Profit & Loss, Time & Work, Data Interpretation', isLive: true },
            { key: 'wiproReasoning', label: 'Logical Reasoning', icon: Brain, color: 'purple', totalTopics: 8, totalQuestions: 150, description: 'Seating Arrangements, Puzzles, Blood Relations, Series', isLive: true },
            { key: 'wiproVerbal', label: 'Verbal Ability', icon: MessageSquare, color: 'emerald', totalTopics: 6, totalQuestions: 100, description: 'Reading Comprehension, Sentence Correction, Para Jumbles', isLive: true },
            { key: 'wiproEssay', label: 'Essay Writing', icon: PenLine, color: 'pink', totalTopics: 4, totalQuestions: 20, description: 'Technology, Social Issues, Education, and Professional Topics', isLive: true },
            { key: 'coding', label: 'Coding Problems', icon: Code2, color: 'orange', totalTopics: 5, totalQuestions: 30, description: 'Arrays, Strings, Mathematics, Sorting — 2 problems in 60 min', isLive: false },
            { key: 'mocks', label: 'Mock Tests', icon: FileText, color: 'yellow', totalTopics: 0, totalQuestions: 0, description: 'Full-length simulated NLTH tests with detailed analysis', isLive: false },
            { key: 'experiences', label: 'Interview Experiences', icon: Users, color: 'blue', totalTopics: 0, totalQuestions: 0, description: 'Real interview stories from students placed in Wipro', isLive: false },
        ],
        sprintDays: 30,
        keyFacts: [
            { icon: ShieldCheck, text: 'No negative marking — attempt ALL questions' },
            { icon: Timer, text: 'Essay writing is strictly 20 minutes' },
            { icon: Target, text: 'Must clear both overall and sectional cut-offs' },
            { icon: AlertTriangle, text: 'Only 1 active backlog allowed' },
            { icon: Calendar, text: 'Role requires 12 months service agreement' },
        ],
    },
};

const colorMap = {
    blue: { accent: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', active: 'bg-blue-500/15 border-blue-500/30 text-blue-300', bar: 'bg-blue-500' },
    purple: { accent: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20', active: 'bg-purple-500/15 border-purple-500/30 text-purple-300', bar: 'bg-purple-500' },
    emerald: { accent: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', active: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300', bar: 'bg-emerald-500' },
    orange: { accent: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', active: 'bg-orange-500/15 border-orange-500/30 text-orange-300', bar: 'bg-orange-500' },
    pink: { accent: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/20', active: 'bg-pink-500/15 border-pink-500/30 text-pink-300', bar: 'bg-pink-500' },
    yellow: { accent: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', active: 'bg-yellow-500/15 border-yellow-500/30 text-yellow-300', bar: 'bg-yellow-500' },
};

/* ─── Main Page ──────────────────────────────────── */
const CompanyDetail = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    useAuth(); // keep context alive
    const [activeTab, setActiveTab] = useState('overview');

    const company = COMPANY_CONFIG[slug];

    /* 404 state — premium, matches RoadmapPage maintenance view */
    if (!company) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center pt-20 px-4 selection:bg-purple-500/30 overflow-hidden">
                <div className="fixed top-20 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[128px] pointer-events-none hidden sm:block" />
                <div className="fixed bottom-20 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[128px] pointer-events-none hidden sm:block" />
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative z-10 max-w-lg mx-auto text-center space-y-6"
                >
                    <div className="relative mx-auto w-24 h-24">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-3xl blur-xl" />
                        <div className="relative w-full h-full rounded-3xl bg-white/[0.03] border border-white/10 flex items-center justify-center">
                            <Building2 size={36} className="text-gray-400" />
                        </div>
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-white mb-2">Company Not Found</h2>
                        <p className="text-zinc-400 text-base">This prep module doesn't exist or isn't available yet.</p>
                    </div>
                    <button
                        onClick={() => navigate('/companies')}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 border border-white/15 rounded-2xl text-white text-sm font-semibold hover:bg-white/15 transition-all hover:scale-105"
                    >
                        <ArrowLeft size={14} /> Back to Companies
                    </button>
                </motion.div>
            </div>
        );
    }

    const accentColors = colorMap[company.accentColor] || colorMap.blue;
    const tabs = [
        { key: 'overview', label: 'Overview', icon: Star },
        ...company.sections.map(s => ({ key: s.key, label: s.label.split(' ')[0], icon: s.icon })),
        { key: 'sprint', label: '30-Day Sprint', icon: Calendar },
    ];

    return (
        <div className="min-h-screen bg-[#050505] pt-24 pb-20 px-4 sm:px-6 lg:px-8 selection:bg-purple-500/30 overflow-hidden">
            <div className="fixed top-20 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[128px] pointer-events-none hidden sm:block" />
            <div className="fixed bottom-20 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[128px] pointer-events-none hidden sm:block" />

            <motion.div
                className="max-w-7xl mx-auto relative z-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                {/* Back button */}
                <motion.button
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    onClick={() => navigate('/companies')}
                    className="flex items-center gap-2 text-zinc-400 hover:text-white transition-all mb-8 group bg-white/5 px-5 py-2.5 rounded-full border border-white/10 hover:border-white/20 hover:bg-white/10 w-fit text-sm font-medium"
                >
                    <ArrowLeft size={15} className="group-hover:-translate-x-1 transition-transform" />
                    All Companies
                </motion.button>

                {/* Company Header card */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className={`relative overflow-hidden p-6 sm:p-8 rounded-3xl border ${accentColors.border} bg-[#0A0A0A]/80 backdrop-blur-xl mb-6 shadow-2xl`}
                >
                    {/* Ambient gradient */}
                    <div className={`absolute top-0 right-0 w-64 h-64 ${accentColors.bg} rounded-full blur-[80px] pointer-events-none`} />
                    <div className="absolute inset-0 rounded-3xl pointer-events-none" style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.05), transparent 40%)' }} />

                    <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-5">
                        <CompanyLogo abbr={company.abbr} gradient={company.logoGradient} size="lg" image={company.image} />
                        <div className="flex-1">
                            <div className="flex items-center gap-2.5 mb-1.5">
                                <h1 className="text-2xl sm:text-3xl font-black text-white">{company.name}</h1>
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${accentColors.active} flex items-center gap-1.5`}>
                                    <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" /> Live
                                </span>
                            </div>
                            <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-2">{company.fullName}</p>
                            <p className="text-zinc-400 text-sm leading-relaxed max-w-2xl">{company.description}</p>
                        </div>
                        <div className="flex sm:flex-col items-center sm:items-end gap-4 sm:gap-3 shrink-0">
                            <div className="text-right">
                                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-0.5">Package</p>
                                <p className={`text-sm font-bold ${accentColors.accent}`}>{company.package.split('·')[0].trim()}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-0.5">Exam</p>
                                <p className="text-sm font-semibold text-white">{company.examPattern}</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Tab Nav — pill style matching Dashboard pattern */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="mb-6 overflow-x-auto pb-1"
                >
                    <div className="flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/[0.08] w-fit min-w-max">
                        {tabs.map((tab) => {
                            const isActive = activeTab === tab.key;
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`relative flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium rounded-full transition-all duration-300 whitespace-nowrap ${isActive ? 'text-white' : 'text-gray-500 hover:text-gray-300'
                                        }`}
                                >
                                    {isActive && (
                                        <motion.span
                                            layoutId="company-tab-pill"
                                            className="absolute inset-0 rounded-full bg-white/10 border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)]"
                                            transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                                        />
                                    )}
                                    <Icon size={13} className="relative z-10 shrink-0" />
                                    <span className="relative z-10">{tab.label}</span>
                                    {isActive && (
                                        <motion.div
                                            layoutId="company-tab-dot"
                                            className={`relative z-10 w-1 h-1 rounded-full ${accentColors.bar}`}
                                        />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </motion.div>

                {/* Tab Content */}
                <AnimatePresence mode="wait">
                    {activeTab === 'overview' && (
                        <OverviewTab key="overview" company={company} accentColors={accentColors} colorMap={colorMap} onTabChange={setActiveTab} />
                    )}
                    {activeTab === 'sprint' && (
                        <SprintTab key="sprint" company={company} accentColors={accentColors} colorMap={colorMap} />
                    )}
                    {company.sections.map(section =>
                        activeTab === section.key && (
                            <SectionTab key={section.key} section={section} colorMap={colorMap} company={company} />
                        )
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

/* ─── Overview Tab ──────────────────────────────── */
const OverviewTab = ({ company, accentColors, colorMap, onTabChange }) => (
    <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.25 }}
        className="space-y-6"
    >
        {/* Key details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
                { icon: Target, label: 'Hiring Pattern', value: company.hiringPattern, color: 'blue' },
                { icon: Zap, label: 'Package Range', value: company.package, color: 'yellow' },
                { icon: CheckCircle2, label: 'Eligibility', value: company.eligibility, color: 'emerald' },
            ].map(({ icon: Icon, label, value, color }) => {
                const c = colorMap[color] || colorMap.blue;
                return (
                    <div key={label} className="group p-5 rounded-2xl border border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.12] transition-all">
                        <div className="flex items-center gap-2.5 mb-3">
                            <div className={`w-8 h-8 rounded-xl ${c.bg} border ${c.border} ${c.accent} flex items-center justify-center group-hover:scale-105 transition-transform`}>
                                <Icon size={15} />
                            </div>
                            <span className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider">{label}</span>
                        </div>
                        <p className="text-sm text-white font-medium leading-relaxed">{value}</p>
                    </div>
                );
            })}
        </div>

        {/* Key facts + Selection Process — side by side on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Key Facts */}
            <div className="p-6 rounded-2xl border border-white/[0.07] bg-white/[0.02]">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <TrendingUp size={13} className={accentColors.accent} /> Key Exam Facts
                </h3>
                <div className="space-y-3">
                    {company.keyFacts.map((fact, i) => {
                        const FactIcon = fact.icon;
                        return (
                            <div key={i} className="flex items-start gap-3">
                                <div className={`w-7 h-7 rounded-xl ${accentColors.bg} border ${accentColors.border} ${accentColors.accent} flex items-center justify-center shrink-0 mt-px`}>
                                    <FactIcon size={13} />
                                </div>
                                <p className="text-sm text-zinc-300 leading-relaxed">{fact.text}</p>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Selection Process */}
            <div className="p-6 rounded-2xl border border-white/[0.07] bg-white/[0.02]">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <ArrowRight size={13} className={accentColors.accent} /> Selection Process
                </h3>
                <div className="space-y-2">
                    {company.rounds.map((round, i) => (
                        <div key={round} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-colors">
                            <div className={`w-7 h-7 rounded-full ${accentColors.bg} border ${accentColors.border} ${accentColors.accent} flex items-center justify-center text-[11px] font-black shrink-0`}>
                                {i + 1}
                            </div>
                            <span className="text-sm text-zinc-300 font-medium">{round}</span>
                            {i < company.rounds.length - 1 && (
                                <ArrowRight size={12} className="text-gray-600 ml-auto shrink-0" />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Prep sections */}
        <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Prep Sections</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {company.sections.map((section, idx) => {
                    const c = colorMap[section.color] || colorMap.blue;
                    const Icon = section.icon;
                    return (
                        <motion.button
                            key={section.key}
                            onClick={() => onTabChange(section.key)}
                            whileHover={{ y: -3 }}
                            whileTap={{ scale: 0.98 }}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className={`group relative overflow-hidden text-left p-5 rounded-2xl border ${c.border} bg-[#0A0A0A]/80 hover:bg-white/[0.04] transition-all duration-300 shadow-lg`}
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br ${c.bg.replace('bg-', 'from-')}/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />
                            <div className="relative z-10 space-y-3">
                                <div className="flex items-start justify-between">
                                    <div className={`w-10 h-10 rounded-2xl ${c.bg} border ${c.border} ${c.accent} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                                        <Icon size={18} />
                                    </div>
                                    {section.isLive ? (
                                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 font-bold uppercase tracking-wide flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live
                                        </span>
                                    ) : (
                                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-500 font-bold uppercase tracking-wide">Soon</span>
                                    )}
                                </div>
                                <div>
                                    <h4 className="text-white text-sm font-semibold mb-1 group-hover:text-white transition-colors">{section.label}</h4>
                                    <p className="text-xs text-zinc-500 leading-relaxed">{section.description}</p>
                                </div>
                                {section.totalQuestions > 0 && (
                                    <p className={`text-xs ${c.accent} font-semibold`}>{section.totalQuestions} questions · {section.totalTopics} topics</p>
                                )}
                                <div className={`flex items-center gap-1.5 text-[11px] font-bold text-zinc-500 uppercase tracking-wider group-hover:text-white transition-colors`}>
                                    <span>Explore</span><ArrowRight size={11} />
                                </div>
                            </div>
                        </motion.button>
                    );
                })}
            </div>
        </div>
    </motion.div>
);

/* ─── Section Tab (Aptitude / Reasoning / Verbal) ── */
const TOPICS = {
    aptitude: [
        { name: 'Percentages', count: 20, priority: 'Very High', icon: Percent },
        { name: 'Profit & Loss', count: 18, priority: 'Very High', icon: DollarSign },
        { name: 'Time & Work', count: 16, priority: 'High', icon: Timer },
        { name: 'Time, Speed & Distance', count: 15, priority: 'High', icon: Gauge },
        { name: 'Averages', count: 12, priority: 'Medium', icon: BarChart2 },
        { name: 'Ratio & Proportion', count: 12, priority: 'Medium', icon: Layers },
        { name: 'Number Series', count: 14, priority: 'High', icon: Hash },
        { name: 'Data Interpretation', count: 16, priority: 'High', icon: LineChart },
        { name: 'Simple & Compound Interest', count: 10, priority: 'Medium', icon: TrendingUp },
        { name: 'Permutations & Combinations', count: 10, priority: 'Medium', icon: Shuffle },
        { name: 'Probability', count: 10, priority: 'Medium', icon: CircleDot },
        { name: 'Mixtures & Alligation', count: 8, priority: 'Low', icon: Anchor },
        { name: 'Boats & Streams', count: 8, priority: 'Low', icon: Gauge },
        { name: 'Number System', count: 11, priority: 'Medium', icon: Binary },
    ],
    reasoning: [
        { name: 'Seating Arrangements', count: 18, priority: 'Very High', icon: Users },
        { name: 'Direction Sense', count: 12, priority: 'High', icon: Compass },
        { name: 'Coding-Decoding', count: 16, priority: 'Very High', icon: KeyRound },
        { name: 'Blood Relations', count: 12, priority: 'High', icon: GitBranch },
        { name: 'Syllogisms', count: 14, priority: 'High', icon: Lightbulb },
        { name: 'Analogies', count: 10, priority: 'Medium', icon: Link2 },
        { name: 'Odd One Out', count: 10, priority: 'Medium', icon: CircleDot },
        { name: 'Puzzles', count: 14, priority: 'High', icon: PuzzleIcon },
        { name: 'Data Sufficiency', count: 12, priority: 'Medium', icon: Database },
        { name: 'Clocks & Calendars', count: 12, priority: 'Medium', icon: AlarmClock },
    ],
    verbal: [
        { name: 'Error Identification', count: 20, priority: 'Very High', icon: AlertTriangle },
        { name: 'Reading Comprehension', count: 25, priority: 'Very High', icon: BookMarked },
        { name: 'Sentence Completion', count: 15, priority: 'High', icon: PenLine },
        { name: 'Synonyms & Antonyms', count: 20, priority: 'High', icon: SpellCheck },
        { name: 'Para Jumbles', count: 12, priority: 'Medium', icon: ListOrdered },
        { name: 'Idioms & Phrases', count: 10, priority: 'Medium', icon: MessageCircle },
        { name: 'Prepositions & Conjunctions', count: 10, priority: 'Medium', icon: Link2 },
        { name: 'Active & Passive Voice', count: 18, priority: 'High', icon: Repeat },
    ],
    infosysAptitude: [
        { name: 'Percentages', count: 20, priority: 'High', icon: Percent },
        { name: 'Profit & Loss', count: 15, priority: 'Medium', icon: DollarSign },
        { name: 'Time & Work', count: 18, priority: 'High', icon: Timer },
        { name: 'Time, Speed & Distance', count: 16, priority: 'High', icon: Gauge },
        { name: 'Ratio & Proportion', count: 12, priority: 'High', icon: Layers },
        { name: 'Averages', count: 10, priority: 'Medium', icon: BarChart2 },
        { name: 'Probability', count: 10, priority: 'Low', icon: CircleDot },
        { name: 'Permutations & Combinations', count: 14, priority: 'Low', icon: Shuffle },
        { name: 'Number Systems', count: 15, priority: 'Medium', icon: Binary },
        { name: 'Data Interpretation', count: 20, priority: 'High', icon: LineChart },
    ],
    infosysReasoning: [
        { name: 'Syllogisms', count: 25, priority: 'Very High', icon: Lightbulb },
        { name: 'Data Interpretation', count: 20, priority: 'High', icon: LineChart },
        { name: 'Data Sufficiency', count: 15, priority: 'Medium', icon: Database },
        { name: 'Puzzles (Arrangement)', count: 25, priority: 'Very High', icon: PuzzleIcon },
        { name: 'Blood Relations', count: 16, priority: 'High', icon: GitBranch },
        { name: 'Coding-Decoding', count: 18, priority: 'High', icon: KeyRound },
        { name: 'Series (Number/Letter)', count: 15, priority: 'High', icon: Hash },
        { name: 'Direction Sense', count: 10, priority: 'Low', icon: Compass },
        { name: 'Venn Diagrams', count: 12, priority: 'Medium', icon: CircleDot },
    ],
    infosysVerbal: [
        { name: 'Reading Comprehension', count: 40, priority: 'Very High', icon: BookMarked },
        { name: 'Sentence Correction', count: 15, priority: 'High', icon: AlertTriangle },
        { name: 'Para Jumbles', count: 12, priority: 'High', icon: ListOrdered },
        { name: 'Synonyms & Antonyms', count: 15, priority: 'High', icon: SpellCheck },
        { name: 'Fill in the Blanks', count: 10, priority: 'Medium', icon: PenLine },
        { name: 'Idioms & Phrases', count: 10, priority: 'Low', icon: MessageCircle },
    ],
    pseudocode: [
        { name: 'Trace & Output', count: 40, priority: 'Very High', icon: Code2 },
        { name: 'Code Logic', count: 20, priority: 'High', icon: GitBranch },
        { name: 'Error Detection', count: 15, priority: 'High', icon: AlertTriangle },
        { name: 'Loop Tracing', count: 25, priority: 'High', icon: Repeat },
    ],
    wiproAptitude: [
        { name: 'Percentages', count: 20, priority: 'High', icon: Percent },
        { name: 'Profit & Loss', count: 18, priority: 'High', icon: DollarSign },
        { name: 'Time & Work', count: 18, priority: 'High', icon: Timer },
        { name: 'Ratio & Proportion', count: 16, priority: 'High', icon: Layers },
        { name: 'Data Interpretation', count: 20, priority: 'High', icon: LineChart },
        { name: 'Time, Speed & Distance', count: 15, priority: 'Medium', icon: Gauge },
        { name: 'Averages', count: 12, priority: 'Medium', icon: BarChart2 },
        { name: 'Number Systems', count: 15, priority: 'Medium', icon: Binary },
        { name: 'Simple & Compound Interest', count: 10, priority: 'Low', icon: TrendingUp },
        { name: 'Ages', count: 8, priority: 'Low', icon: Users },
        { name: 'Mixtures & Alligations', count: 10, priority: 'Low', icon: Anchor },
    ],
    wiproReasoning: [
        { name: 'Seating Arrangements', count: 25, priority: 'Very High', icon: Users },
        { name: 'Blood Relations', count: 20, priority: 'High', icon: GitBranch },
        { name: 'Coding-Decoding', count: 18, priority: 'High', icon: KeyRound },
        { name: 'Syllogisms', count: 18, priority: 'High', icon: Lightbulb },
        { name: 'Series (Number/Letter)', count: 20, priority: 'High', icon: Hash },
        { name: 'Puzzles', count: 22, priority: 'High', icon: PuzzleIcon },
        { name: 'Direction Sense', count: 12, priority: 'Medium', icon: Compass },
        { name: 'Clocks & Calendars', count: 10, priority: 'Low', icon: AlarmClock },
    ],
    wiproVerbal: [
        { name: 'Reading Comprehension', count: 40, priority: 'Very High', icon: BookMarked },
        { name: 'Sentence Correction', count: 25, priority: 'High', icon: AlertTriangle },
        { name: 'Synonyms & Antonyms', count: 20, priority: 'High', icon: SpellCheck },
        { name: 'Fill in the Blanks', count: 20, priority: 'Medium', icon: PenLine },
        { name: 'Para Jumbles', count: 15, priority: 'Medium', icon: ListOrdered },
        { name: 'Idioms & Phrases', count: 10, priority: 'Low', icon: MessageCircle },
    ],
    wiproEssay: [
        { name: 'Technology & AI', count: 15, priority: 'Very High', icon: Binary },
        { name: 'Social Issues', count: 12, priority: 'High', icon: Users },
        { name: 'Professional & Ethics', count: 10, priority: 'High', icon: CheckCircle2 },
        { name: 'Education & Environment', count: 10, priority: 'Medium', icon: BookOpen },
    ],
};

const priorityColors = {
    'Very High': 'text-red-400 bg-red-500/10 border-red-500/20',
    'High': 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    'Medium': 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
    'Low': 'text-gray-400 bg-white/5 border-white/10',
};

const SectionTab = ({ section, colorMap, company }) => {
    const navigate = useNavigate();
    const colors = colorMap[section.color] || colorMap.blue;
    const Icon = section.icon;

    /* "In Development" — matches UnderDevelopment component style exactly */
    if (!section.isLive) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="max-w-2xl mx-auto text-center space-y-8 pt-10 sm:pt-16 relative"
            >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-yellow-500/5 rounded-full blur-[100px] pointer-events-none" />

                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, type: 'spring' }}
                    className="relative inline-block"
                >
                    {/* Pulse glow */}
                    <div className={`absolute inset-0 ${colors.bg} rounded-3xl blur-2xl opacity-40 animate-pulse`} />
                    <div className={`relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl ${colors.bg} border ${colors.border} flex items-center justify-center mx-auto shadow-2xl`}>
                        <Construction size={40} className={`${colors.accent}`} />
                        {/* Floating badges */}
                        <motion.div
                            animate={{ y: [-5, 5, -5], rotate: [0, 5, -5, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                            className="absolute -top-4 -right-4 bg-blue-500 p-2 rounded-xl shadow-lg border border-white/20"
                        >
                            <Rocket className="w-4 h-4 text-white" />
                        </motion.div>
                        <motion.div
                            animate={{ y: [5, -5, 5], rotate: [0, -5, 5, 0] }}
                            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                            className="absolute -bottom-2 -left-4 bg-purple-500 p-2 rounded-xl shadow-lg border border-white/20"
                        >
                            <Sparkles className="w-4 h-4 text-white" />
                        </motion.div>
                    </div>
                </motion.div>

                <div className="relative z-10 space-y-4">
                    <h3 className="text-3xl sm:text-4xl font-black text-white">{section.label}</h3>
                    <p className="text-zinc-400 text-base leading-relaxed max-w-md mx-auto">{section.description}</p>
                </div>

                <div className="relative z-10 inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-yellow-500/10 border border-yellow-500/20">
                    <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-yellow-500" />
                    </span>
                    <span className="text-xs font-bold text-yellow-500 tracking-wider uppercase">Development in Progress</span>
                </div>
            </motion.div>
        );
    }

    const topics = TOPICS[section.key] || [];

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-5"
        >
            {/* Section header */}
            <div className={`relative overflow-hidden p-5 rounded-2xl border ${colors.border} bg-[#0A0A0A]/80 flex items-center gap-4 shadow-lg`}>
                <div className={`absolute top-0 right-0 w-32 h-32 ${colors.bg} rounded-full blur-[60px] pointer-events-none`} />
                <div className={`relative z-10 w-11 h-11 rounded-2xl ${colors.bg} border ${colors.border} ${colors.accent} flex items-center justify-center shrink-0`}>
                    <Icon size={20} />
                </div>
                <div className="relative z-10 flex-1">
                    <h3 className="text-white font-bold text-base">{section.label}</h3>
                    <p className="text-xs text-zinc-500">{section.description} · {section.totalQuestions} questions across {topics.length} topics</p>
                </div>
                <span className={`relative z-10 hidden sm:block px-3 py-1 rounded-full text-xs font-bold border ${colors.active}`}>
                    {section.totalQuestions} Qs
                </span>
            </div>

            {/* Topics grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {topics.map((topic, i) => {
                    const TopicIcon = topic.icon;
                    return (
                        <motion.div
                            key={topic.name}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.04 }}
                            whileHover={{ y: -3 }}
                            className={`group relative overflow-hidden p-5 rounded-2xl border border-white/[0.07] bg-[#0A0A0A]/80 hover:border-white/[0.15] hover:bg-white/[0.03] transition-all duration-300 cursor-pointer shadow-lg`}
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br ${colors.bg.replace('bg-', 'from-')}/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />
                            <div className="relative z-10">
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`w-9 h-9 rounded-xl ${colors.bg} border ${colors.border} ${colors.accent} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                                        <TopicIcon size={16} />
                                    </div>
                                    <span className={`text-[9px] px-2 py-0.5 rounded-full border font-bold uppercase tracking-wide ${priorityColors[topic.priority]}`}>
                                        {topic.priority}
                                    </span>
                                </div>
                                <h4 className="text-white text-sm font-semibold mb-1">{topic.name}</h4>
                                <p className="text-xs text-zinc-500 mb-4">{topic.count} questions</p>
                                <button
                                    onClick={() => {
                                        const topicSlug = topic.name.toLowerCase().replace(/[&]/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                                        navigate(`/companies/${company.name.toLowerCase()}/practice/${section.key}/${topicSlug}`);
                                    }}
                                    className={`w-full py-2.5 rounded-xl text-xs font-semibold ${colors.bg} border ${colors.border} ${colors.accent} hover:brightness-125 transition-all flex items-center justify-center gap-1.5`}
                                    style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.4)' }}
                                >
                                    Practice Now <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
                                </button>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </motion.div>
    );
};

/* ─── Sprint Tab ────────────────────────────────── */
const weeks = [
    {
        week: 1, title: 'Foundation Building', days: '1–7', focus: 'Numerical Ability + Basic Verbal', hours: 3, color: 'blue',
        tasks: ['Percentages + Profit & Loss', 'Time & Work + TSD', 'Averages + Ratios', 'Number Series', 'Error Identification', 'Vocabulary (50 words/day)', 'Mixed Practice Test'],
        target: '150 questions'
    },
    {
        week: 2, title: 'Reasoning + Advanced Verbal', days: '8–14', focus: 'Reasoning Ability + Reading Comprehension', hours: 3, color: 'purple',
        tasks: ['Seating Arrangements (linear + circular)', 'Blood Relations + Coding-Decoding', 'Syllogisms + Data Sufficiency', 'Puzzles', '1 RC Passage/day', 'Week 1 Revision', 'Practice Test'],
        target: '150 questions'
    },
    {
        week: 3, title: 'Advanced Topics + Coding', days: '15–21', focus: 'Advanced Aptitude + Coding Practice', hours: 4, color: 'emerald',
        tasks: ['Data Interpretation (complex charts)', 'Permutations + Probability', 'Mixtures + Advanced problems', 'Arrays practice (5/day)', 'Strings practice (5/day)', 'Math + Recursion', 'Mock Coding Test'],
        target: '100 aptitude + 30 coding'
    },
    {
        week: 4, title: 'Full Mocks + Revision', days: '22–30', focus: 'Full-length tests + Final revision', hours: 5, color: 'orange',
        tasks: ['Mock Test 1 + Review (3 hrs)', 'Mock Test 2 + Review (3 hrs)', 'Mock Test 3 (Full)', 'Weak Area Revision', 'Speed Practice (1.5 min/q)', 'Final Revision', 'Light revision + Rest'],
        target: '3 full mocks + 200 revision'
    },
];

const SprintTab = ({ company, accentColors, colorMap }) => (
    <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="space-y-6"
    >
        {/* Sprint Header */}
        <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl border border-white/[0.07] bg-[#0A0A0A]/80 shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute inset-0 rounded-3xl pointer-events-none" style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.05), transparent 40%)' }} />
            <div className="relative z-10">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center">
                        <Calendar size={22} />
                    </div>
                    <div>
                        <h3 className="text-white font-black text-xl">30-Day {company.abbr} Sprint</h3>
                        <p className="text-zinc-500 text-sm">Structured daily plan — 0 → job-ready in 30 days</p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-3">
                    {[
                        { label: '30 Days', icon: Calendar },
                        { label: '3–5 hrs/day', icon: Clock },
                        { label: '500+ questions', icon: BookOpen },
                        { label: '3 Full Mocks', icon: FileText },
                    ].map(({ label, icon: Icon }) => (
                        <div key={label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/[0.08] text-sm text-zinc-300 font-medium">
                            <Icon size={12} className="text-gray-500" /> {label}
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Week Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {weeks.map((week, i) => {
                const c = colorMap[week.color] || colorMap.blue;
                return (
                    <motion.div
                        key={week.week}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                        whileHover={{ y: -3 }}
                        className={`group relative overflow-hidden p-6 rounded-2xl border ${c.border} bg-[#0A0A0A]/80 shadow-lg transition-all duration-300`}
                    >
                        <div className={`absolute inset-0 bg-gradient-to-br from-${week.color}-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />
                        <div className="relative z-10">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`text-xs font-bold uppercase tracking-wider ${c.accent}`}>Week {week.week}</span>
                                        <span className="text-xs text-gray-500">· Days {week.days}</span>
                                    </div>
                                    <h4 className="text-white font-bold text-lg">{week.title}</h4>
                                    <p className="text-xs text-zinc-500 mt-0.5">{week.focus}</p>
                                </div>
                                <div className={`px-3 py-1.5 rounded-xl ${c.bg} border ${c.border} shrink-0`}>
                                    <p className={`text-sm font-bold ${c.accent}`}>{week.hours}h/day</p>
                                </div>
                            </div>

                            <div className="space-y-2 mb-4">
                                {week.tasks.map((task, ti) => (
                                    <div key={ti} className="flex items-center gap-2.5">
                                        <div className={`w-5 h-5 rounded-full shrink-0 flex items-center justify-center text-[9px] font-black ${c.bg} border ${c.border} ${c.accent}`}>
                                            {ti + 1}
                                        </div>
                                        <span className="text-xs text-zinc-400">{task}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-center gap-2 pt-3 border-t border-white/[0.06]">
                                <Trophy size={13} className={c.accent} />
                                <span className={`text-xs font-semibold ${c.accent}`}>Target: {week.target}</span>
                            </div>
                        </div>
                    </motion.div>
                );
            })}
        </div>

        {/* Exam Day tip */}
        <div className="p-5 rounded-2xl border border-yellow-500/20 bg-yellow-500/[0.05] flex items-start gap-4">
            <div className="w-9 h-9 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center shrink-0 mt-px">
                <Info size={16} className="text-yellow-400" />
            </div>
            <div>
                <p className="text-yellow-300 text-sm font-bold mb-1">Exam Day Strategy</p>
                <p className="text-zinc-400 text-sm leading-relaxed">
                    No negative marking → attempt ALL questions. Numerical: Easy first (5 min), Medium (15 min), skip Hard for later.
                    Coding: Read both problems first — solve the easier one first, then tackle harder one.
                </p>
            </div>
        </div>
    </motion.div>
);

export default CompanyDetail;
