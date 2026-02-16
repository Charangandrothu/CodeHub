import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ArrowRight, BrainCircuit, Code, Construction, FileText } from 'lucide-react';
import DSARoadmap from './RoadmapDSA';

const RoadmapPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [activeView, setActiveView] = useState('menu');

    useEffect(() => {
        if (location.pathname.includes('/roadmap/dsa')) {
            setActiveView('dsa');
        } else if (location.pathname.includes('/roadmap/mock')) {
            setActiveView('mock');
        } else if (location.pathname.includes('/roadmap/aptitude')) {
            setActiveView('aptitude');
        } else {
            setActiveView('menu');
        }
    }, [location.pathname]);

    const handleNavigate = (view) => {
        if (view === 'menu') navigate('/roadmap');
        else navigate(`/roadmap/${view}`);
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white pt-20 pb-20 px-4 sm:px-6 overflow-hidden selection:bg-purple-500/30">
            {/* Ambient Background Glows - Global */}
            <div className="fixed top-20 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[128px] pointer-events-none" />
            <div className="fixed bottom-20 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[128px] pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10">
                <AnimatePresence mode="wait">
                    {activeView === 'menu' && (
                        <SelectionMenu onSelect={handleNavigate} key="menu" />
                    )}
                    {activeView === 'dsa' && (
                        <DSARoadmap onBack={() => handleNavigate('menu')} key="dsa" />
                    )}
                    {(activeView === 'mock' || activeView === 'aptitude') && (
                        <MaintenanceView title={activeView === 'mock' ? 'Mock Tests' : 'Aptitude'} onBack={() => handleNavigate('menu')} key="maintenance" />
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

const SelectionMenu = ({ onSelect }) => {
    const cards = [
        {
            id: 'dsa',
            title: 'DSA Roadmap',
            icon: Code,
            desc: 'Master Data Structures & Algorithms with a personalized day-by-day plan.',
            styles: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400', glow: 'from-blue-500/5' }
        },
        {
            id: 'mock',
            title: 'Mock Tests',
            icon: FileText,
            desc: 'Real-world interview simulations to test your readiness.',
            styles: { bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-400', glow: 'from-purple-500/5' }
        },
        {
            id: 'aptitude',
            title: 'Aptitude',
            icon: BrainCircuit,
            desc: 'Enhance your logical reasoning and problem-solving speed.',
            styles: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', glow: 'from-emerald-500/5' }
        },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-12 py-10"
        >
            <div className="text-center space-y-4">
                <h1 className="text-5xl md:text-6xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/50">
                    Choose Your Path
                </h1>
                <p className="text-zinc-400 text-lg">Select a module to begin your journey to mastery.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {cards.map((card, idx) => (
                    <motion.button
                        key={card.id}
                        onClick={() => onSelect(card.id)}
                        whileHover={{ y: -5 }}
                        whileTap={{ scale: 0.98 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="relative group text-left p-8 rounded-3xl bg-[#0A0A0A]/80 backdrop-blur-xl border border-white/10 overflow-hidden hover:border-white/20 transition-all shadow-2xl"
                    >
                        <div className={`absolute inset-0 bg-gradient-to-br ${card.styles.glow} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                        <div className="relative z-10 space-y-6">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${card.styles.bg} border ${card.styles.border} ${card.styles.text} group-hover:scale-110 transition-transform duration-300`}>
                                <card.icon size={28} />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-bold text-white group-hover:text-purple-300 transition-colors">{card.title}</h3>
                                <p className="text-sm text-zinc-400 leading-relaxed font-medium">
                                    {card.desc}
                                </p>
                            </div>
                            <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-wider group-hover:text-white transition-colors">
                                <span>Explore</span>
                                <ArrowRight size={14} />
                            </div>
                        </div>
                    </motion.button>
                ))}
            </div>
        </motion.div>
    );
};

const MaintenanceView = ({ title, onBack }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="max-w-2xl mx-auto text-center space-y-12 pt-16 relative"
    >
        {/* Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-yellow-500/10 rounded-full blur-[100px] pointer-events-none" />

        <button
            onClick={onBack}
            className="relative z-10 flex items-center gap-2 text-zinc-400 hover:text-white transition-all mx-auto bg-white/5 px-5 py-2.5 rounded-full border border-white/10 hover:border-white/20 hover:bg-white/10 group"
        >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium text-sm">Back to Modules</span>
        </button>

        <div className="relative z-10 space-y-6">
            <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center mx-auto border border-yellow-500/30 text-yellow-400 shadow-[0_0_40px_rgba(234,179,8,0.2)]">
                <Construction size={48} className="animate-pulse" />
            </div>

            <div className="space-y-4 max-w-lg mx-auto">
                <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white">
                    {title} <br />
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-400">
                        Under Construction
                    </span>
                </h2>
                <p className="text-zinc-400 text-lg leading-relaxed">
                    We're currently crafting a premium experience for this module.
                    Expect high-quality content and interactive features coming soon.
                </p>
            </div>

            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/20">
                <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-yellow-500"></span>
                </span>
                <span className="text-xs font-bold text-yellow-500 tracking-wider uppercase">
                    Development in Progress
                </span>
            </div>
        </div>
    </motion.div>
);

export default RoadmapPage;
