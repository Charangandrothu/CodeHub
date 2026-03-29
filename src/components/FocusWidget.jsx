import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFocus } from '../context/FocusContext';
import { useLocation } from 'react-router-dom';
import { 
    Timer, Play, Square, Target, Zap, 
    Trophy, ChevronUp, ChevronDown, AlertCircle, CheckCircle2 
} from 'lucide-react';

const formatTime = (totalSeconds) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

const FocusWidget = () => {
    const location = useLocation();
    const { 
        isActive, showSummary, timeElapsed, questionsAttempted, 
        accuracy, averageTime, startSprint, endSprint, closeSummary 
    } = useFocus();

    const [expanded, setExpanded] = useState(false);

    // Only show the widget if we are in the companies prep section OR a sprint is currently active globally
    const isPrepRoute = location.pathname.startsWith('/companies');
    const shouldShowWidget = isPrepRoute || isActive;

    if (!shouldShowWidget && !showSummary) return null;

    return (
        <>
            {/* The Floating Widget */}
            <AnimatePresence>
                {!showSummary && (
                    <motion.div 
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3"
                    >
                        {/* Expanded details panel */}
                        <AnimatePresence>
                            {isActive && expanded && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 20, height: 0 }}
                                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                                    exit={{ opacity: 0, y: 10, height: 0 }}
                                    className="bg-[#0A0A0A]/90 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-4 w-64 shadow-2xl overflow-hidden"
                                >
                                    <h4 className="text-white text-sm font-bold flex items-center gap-2 mb-3">
                                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" /> Live Stats
                                    </h4>
                                    
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-zinc-400">
                                                <Target size={14} className="text-emerald-400" />
                                                <span className="text-xs">Accuracy</span>
                                            </div>
                                            <span className="text-white font-bold text-sm">{accuracy}%</span>
                                        </div>
                                        
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-zinc-400">
                                                <Zap size={14} className="text-yellow-400" />
                                                <span className="text-xs">Average Speed</span>
                                            </div>
                                            <span className="text-white font-bold text-sm">{averageTime}s <span className="text-[10px] text-zinc-500 font-normal">/Q</span></span>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-zinc-400">
                                                <CheckCircle2 size={14} className="text-blue-400" />
                                                <span className="text-xs">Attempted</span>
                                            </div>
                                            <span className="text-white font-bold text-sm">{questionsAttempted}</span>
                                        </div>
                                    </div>
                                    
                                    <button 
                                        onClick={endSprint}
                                        className="w-full mt-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                                    >
                                        <Square size={12} fill="currentColor" /> End sprint
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* The Pill Button */}
                        <div className="bg-[#0A0A0A]/80 backdrop-blur-xl border border-white/[0.1] shadow-2xl rounded-full p-1.5 flex items-center gap-2">
                            {!isActive ? (
                                <button
                                    onClick={startSprint}
                                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-blue-600 hover:text-white hover:border-blue-500 border border-transparent transition-all group"
                                >
                                    <Play size={14} className="text-blue-400 group-hover:text-white" fill="currentColor" />
                                    <span className="text-sm font-bold text-zinc-300 group-hover:text-white">Start Sprint</span>
                                </button>
                            ) : (
                                <div className="flex items-center gap-3 pl-3 pr-1">
                                    <div className="flex items-center gap-2 text-blue-400">
                                        <Timer size={16} />
                                        <span className="font-mono text-sm font-bold tracking-wider">{formatTime(timeElapsed)}</span>
                                    </div>
                                    <div className="w-px h-4 bg-white/10" />
                                    <button 
                                        onClick={() => setExpanded(!expanded)}
                                        className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-400 transition-colors"
                                    >
                                        {expanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* End Session Summary Modal */}
            <AnimatePresence>
                {showSummary && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-[#050505]/80 backdrop-blur-md"
                            onClick={closeSummary}
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -20 }}
                            className="relative z-10 w-full max-w-sm bg-[#0A0A0A] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500" />
                            
                            <div className="flex flex-col items-center text-center space-y-2 mb-8">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center mb-2">
                                    <Trophy size={32} className="text-blue-400" />
                                </div>
                                <h2 className="text-2xl font-black text-white">Sprint Complete!</h2>
                                <p className="text-zinc-400 text-sm">Great job. Here's a breakdown of your focus session.</p>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-8">
                                <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-4 text-center">
                                    <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider mb-1">Time</p>
                                    <p className="text-xl font-bold text-white">{formatTime(timeElapsed)}</p>
                                </div>
                                <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-4 text-center">
                                    <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider mb-1">Attempted</p>
                                    <p className="text-xl font-bold text-white">{questionsAttempted}</p>
                                </div>
                                <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-4 text-center">
                                    <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider mb-1">Accuracy</p>
                                    <p className="text-xl font-bold text-emerald-400">{accuracy}%</p>
                                </div>
                                <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-4 text-center">
                                    <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider mb-1">Pace</p>
                                    <p className="text-xl font-bold text-yellow-400">{averageTime}s <span className="text-[10px] text-zinc-500">/Q</span></p>
                                </div>
                            </div>

                            <button
                                onClick={closeSummary}
                                className="w-full py-3 rounded-xl bg-white hover:bg-gray-100 text-black font-bold text-sm transition-colors"
                            >
                                Continue Practicing
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};

export default FocusWidget;
