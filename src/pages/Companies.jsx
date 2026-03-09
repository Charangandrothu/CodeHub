import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Building2, Users, Zap, ArrowRight, Clock,
    BookOpen, Trophy, Target, Flame, Plus, Sparkles
} from 'lucide-react';

/* ─── Data ─────────────────────────────────────── */
const COMPANIES = [
    {
        slug: 'tcs', name: 'TCS', fullName: 'Tata Consultancy Services',
        abbr: 'TCS', logoGradient: 'from-blue-500 to-blue-700', accentColor: 'blue',
        description: "India's largest IT company. Hires 30,000+ freshers/year via TCS NQT.",
        package: '₹3.36 – 9 LPA', roles: ['Ninja', 'Digital', 'Prime'], totalQuestions: 500,
        sections: ['Numerical Ability', 'Verbal Ability', 'Reasoning', 'Coding'],
        difficulty: 'Moderate', hiringPattern: 'Mass Hiring', badge: 'Most Popular',
        badgeColor: 'blue', isLive: true,
    },
    {
        slug: 'infosys', name: 'Infosys', fullName: 'Infosys Limited',
        abbr: 'INFY', logoGradient: 'from-emerald-500 to-emerald-700', accentColor: 'emerald',
        description: 'Hires via InfyTQ. Known for strong academic requirements & InfysQA tests.',
        package: '₹3.6 – 8 LPA', roles: ['DSE', 'SP', 'PP'], totalQuestions: 0,
        sections: ['Aptitude', 'Verbal', 'Reasoning', 'Pseudocode'],
        difficulty: 'Moderate', hiringPattern: 'Mass Hiring', badge: 'Coming Soon',
        badgeColor: 'emerald', isLive: false,
    },
    {
        slug: 'wipro', name: 'Wipro', fullName: 'Wipro Limited',
        abbr: 'WIP', logoGradient: 'from-purple-500 to-purple-700', accentColor: 'purple',
        description: 'Competitive tests via WILP/NLTH. Strong focus on aptitude and coding.',
        package: '₹3.5 – 6.5 LPA', roles: ['Project Engineer', 'Turbo'], totalQuestions: 0,
        sections: ['Aptitude', 'Written Communication', 'Coding'],
        difficulty: 'Moderate', hiringPattern: 'Mass Hiring', badge: 'Coming Soon',
        badgeColor: 'purple', isLive: false,
    },
    {
        slug: 'cognizant', name: 'Cognizant', fullName: 'Cognizant Technology Solutions',
        abbr: 'CTS', logoGradient: 'from-sky-500 to-sky-700', accentColor: 'sky',
        description: 'Hires via GenC & GenC Elevate. Aptitude + communication focused tests.',
        package: '₹4 – 6.5 LPA', roles: ['GenC', 'GenC Elevate', 'GenC Pro'], totalQuestions: 0,
        sections: ['Aptitude', 'Cognitive', 'Verbal', 'Coding'],
        difficulty: 'Moderate', hiringPattern: 'Mass Hiring', badge: 'Coming Soon',
        badgeColor: 'sky', isLive: false,
    },
    {
        slug: 'accenture', name: 'Accenture', fullName: 'Accenture India',
        abbr: 'ACC', logoGradient: 'from-pink-500 to-pink-700', accentColor: 'pink',
        description: 'No negative marking. Strong focus on abstract reasoning & cognitive skills.',
        package: '₹4.5 – 8 LPA', roles: ['ASE', 'SE', 'Packaged App Associate'], totalQuestions: 0,
        sections: ['Cognitive', 'Technical', 'Coding'],
        difficulty: 'Easy–Moderate', hiringPattern: 'Mass Hiring', badge: 'Coming Soon',
        badgeColor: 'pink', isLive: false,
    },
];

const colorMap = {
    blue: { accent: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', hover: 'hover:border-blue-500/40', glow: 'from-blue-500/10', badge: 'bg-blue-500/20 border-blue-500/30 text-blue-300', bar: 'bg-blue-500', glowShadow: 'shadow-blue-500/10' },
    emerald: { accent: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', hover: 'hover:border-emerald-500/40', glow: 'from-emerald-500/10', badge: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300', bar: 'bg-emerald-500', glowShadow: 'shadow-emerald-500/10' },
    purple: { accent: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20', hover: 'hover:border-purple-500/40', glow: 'from-purple-500/10', badge: 'bg-purple-500/20 border-purple-500/30 text-purple-300', bar: 'bg-purple-500', glowShadow: 'shadow-purple-500/10' },
    sky: { accent: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/20', hover: 'hover:border-sky-500/40', glow: 'from-sky-500/10', badge: 'bg-sky-500/20 border-sky-500/30 text-sky-300', bar: 'bg-sky-500', glowShadow: 'shadow-sky-500/10' },
    pink: { accent: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/20', hover: 'hover:border-pink-500/40', glow: 'from-pink-500/10', badge: 'bg-pink-500/20 border-pink-500/30 text-pink-300', bar: 'bg-pink-500', glowShadow: 'shadow-pink-500/10' },
};

/* ─── Letter-mark logo (no emojis) ─────────────── */
const CompanyLogo = ({ abbr, gradient, size = 'md' }) => {
    const sz = size === 'lg' ? 'w-16 h-16 rounded-2xl text-sm' : 'w-14 h-14 rounded-2xl text-xs';
    return (
        <div className={`${sz} bg-gradient-to-br ${gradient} flex items-center justify-center shrink-0 shadow-lg`}>
            <span className="font-black text-white tracking-tight leading-none">{abbr}</span>
        </div>
    );
};

const MetaChip = ({ icon: Icon, label }) => (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/[0.08]">
        <Icon size={11} className="text-gray-500" />
        <span className="text-[11px] text-gray-400 font-medium">{label}</span>
    </div>
);

/* ─── Page ──────────────────────────────────────── */
const Companies = () => {
    const navigate = useNavigate();
    const [filter, setFilter] = useState('all');

    const displayed = filter === 'live' ? COMPANIES.filter(c => c.isLive) : COMPANIES;

    return (
        <div className="min-h-screen bg-[#050505] pt-24 pb-20 px-4 sm:px-6 lg:px-8 selection:bg-purple-500/30 overflow-hidden">
            {/* Ambient background blobs — matching RoadmapPage exactly */}
            <div className="fixed top-20 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[128px] pointer-events-none hidden sm:block" />
            <div className="fixed bottom-20 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[128px] pointer-events-none hidden sm:block" />

            <motion.div
                className="max-w-7xl mx-auto relative z-10 space-y-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                {/* ── Hero Header ───────────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-center space-y-5 sm:space-y-6 pt-4 sm:pt-8"
                >
                    {/* Top badge row */}
                    <div className="flex items-center justify-center gap-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-xs font-semibold text-gray-300 uppercase tracking-wide">Live Now</span>
                        </div>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
                            <Flame size={10} className="text-blue-400" />
                            <span className="text-xs font-semibold text-blue-400 uppercase tracking-wide">5 Companies</span>
                        </div>
                    </div>

                    {/* Main title — matching RoadmapPage scale & style */}
                    <motion.h1
                        initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                        className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight"
                    >
                        <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/60">
                            Company-Wise
                        </span>
                        {' '}
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400">
                            Interview Prep
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-zinc-400 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto"
                    >
                        Targeted preparation for mass-hiring companies. Aptitude, reasoning, verbal, and coding
                        questions curated exactly for each company's exam pattern.
                    </motion.p>
                </motion.div>

                {/* ── Stats Row ─────────────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto"
                >
                    {[
                        { icon: Building2, label: 'Companies', value: '5', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/15' },
                        { icon: BookOpen, label: 'Questions', value: '1000+', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/15' },
                        { icon: Users, label: 'Hiring / Year', value: '1L+', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/15' },
                        { icon: Trophy, label: 'Success Rate', value: '78%', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/15' },
                    ].map(({ icon: Icon, label, value, color, bg, border }, i) => (
                        <motion.div
                            key={label}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 + i * 0.06 }}
                            className={`flex items-center gap-3 p-3.5 rounded-2xl border ${border} ${bg}/50 backdrop-blur-xl`}
                        >
                            <div className={`w-9 h-9 rounded-xl ${bg} border ${border} flex items-center justify-center ${color} shrink-0`}>
                                <Icon size={16} />
                            </div>
                            <div>
                                <p className="text-white font-bold text-base leading-none">{value}</p>
                                <p className="text-gray-500 text-xs mt-0.5">{label}</p>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* ── Filter Tabs ───────────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.55 }}
                    className="flex items-center justify-center gap-2"
                >
                    {['all', 'live'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${filter === f
                                    ? 'bg-white/10 text-white border border-white/20 shadow-lg'
                                    : 'text-gray-500 hover:text-gray-300 border border-transparent hover:border-white/10'
                                }`}
                        >
                            {f === 'all' ? 'All Companies' : '⚡ Live Now'}
                        </button>
                    ))}
                </motion.div>

                {/* ── Company Cards ─────────────────────────────── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {displayed.map((company, idx) => {
                        const colors = colorMap[company.accentColor] || colorMap.blue;
                        return (
                            <motion.div
                                key={company.slug}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 + idx * 0.1 }}
                                whileHover={company.isLive ? { y: -5 } : {}}
                                whileTap={{ scale: 0.99 }}
                                className={`group relative overflow-hidden rounded-3xl border bg-[#0A0A0A]/80 backdrop-blur-xl transition-all duration-300 shadow-2xl ${company.isLive
                                        ? `${colors.border} ${colors.hover} cursor-pointer`
                                        : 'border-white/5 cursor-default opacity-70'
                                    }`}
                                onClick={() => company.isLive && navigate(`/companies/${company.slug}`)}
                            >
                                {/* Hover glow overlay */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${colors.glow} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />
                                {/* Top edge highlight */}
                                <div className="absolute inset-0 rounded-3xl pointer-events-none" style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.06), transparent 40%)' }} />

                                <div className="relative z-10 p-6 sm:p-8">
                                    {/* Logo + Badge row */}
                                    <div className="flex items-start justify-between mb-5">
                                        <CompanyLogo abbr={company.abbr} gradient={company.logoGradient} />
                                        <div className="flex flex-col items-end gap-1.5">
                                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${colors.badge}`}>
                                                {company.badge}
                                            </span>
                                            {company.isLive && (
                                                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                                    Live
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Name */}
                                    <h3 className="text-xl font-bold text-white mb-0.5">{company.name}</h3>
                                    <p className="text-xs text-gray-500 font-medium mb-3">{company.fullName}</p>
                                    <p className="text-sm text-zinc-400 leading-relaxed mb-5">{company.description}</p>

                                    {/* Meta chips */}
                                    <div className="flex flex-wrap gap-2 mb-5">
                                        <MetaChip icon={Zap} label={company.difficulty} />
                                        <MetaChip icon={Clock} label={company.hiringPattern} />
                                        <MetaChip icon={Target} label={company.package} />
                                    </div>

                                    {/* Sections */}
                                    <div className="flex flex-wrap gap-1.5 mb-5">
                                        {company.sections.map(s => (
                                            <span key={s} className="text-[10px] px-2.5 py-1 rounded-lg bg-white/5 border border-white/[0.08] text-gray-400 font-medium">
                                                {s}
                                            </span>
                                        ))}
                                    </div>

                                    {/* Progress bar */}
                                    <div className="border-t border-white/[0.06] pt-4 mb-5">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs text-gray-500">
                                                {company.totalQuestions > 0 ? `${company.totalQuestions} questions` : 'Questions: Generating...'}
                                            </span>
                                            <span className={`text-xs font-semibold ${colors.accent}`}>
                                                {company.totalQuestions > 0 ? 'Ready' : '—'}
                                            </span>
                                        </div>
                                        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: company.totalQuestions > 0 ? '100%' : '0%' }}
                                                transition={{ duration: 1.2, delay: 0.6 + idx * 0.1 }}
                                                className={`h-full rounded-full ${colors.bar}`}
                                            />
                                        </div>
                                    </div>

                                    {/* CTA */}
                                    <button
                                        disabled={!company.isLive}
                                        onClick={(e) => { e.stopPropagation(); company.isLive && navigate(`/companies/${company.slug}`); }}
                                        className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 ${company.isLive
                                                ? `${colors.bg} border ${colors.border} ${colors.accent} hover:brightness-125 group-hover:shadow-lg`
                                                : 'bg-white/[0.03] border border-white/[0.07] text-gray-600 cursor-not-allowed'
                                            }`}
                                        style={company.isLive ? { boxShadow: '0 4px 14px rgba(0,0,0,0.4)' } : {}}
                                    >
                                        {company.isLive ? (
                                            <>Start Preparation <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" /></>
                                        ) : (
                                            'Coming Soon'
                                        )}
                                    </button>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* ── Bottom Callout ────────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.1 }}
                    className="mt-4 p-5 sm:p-6 rounded-3xl border border-white/[0.08] bg-[#0A0A0A]/60 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-4"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center text-blue-400 shrink-0">
                            <Plus size={18} />
                        </div>
                        <div>
                            <p className="text-white font-semibold text-sm">Want more companies?</p>
                            <p className="text-gray-500 text-xs mt-0.5">Capgemini, HCL, Tech Mahindra & more are coming soon.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
                        <Sparkles size={12} className="text-purple-400" />
                        <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Roadmap: Q2 2026</span>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default Companies;
