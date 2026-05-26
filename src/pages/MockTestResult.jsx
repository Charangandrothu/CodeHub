import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';
import { 
    CheckCircle2, XCircle, Timer, Target, Award, Sparkles, 
    BookOpen, TrendingUp, ChevronDown, ArrowLeft, RefreshCw, 
    BookOpenCheck, ShieldAlert, Code2, AlertTriangle, Lightbulb
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MockTestResult = () => {
    const { attemptId } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();

    // Data States
    const [attempt, setAttempt] = useState(null);
    const [loading, setLoading] = useState(true);

    // Accordions state for review mode
    const [reviewTab, setReviewTab] = useState('aptitude'); // 'aptitude' or 'dsa'
    const [expandedQuestion, setExpandedQuestion] = useState(null);

    useEffect(() => {
        if (currentUser && attemptId) {
            fetchAttemptDetails();
        }
    }, [currentUser, attemptId]);

    const fetchAttemptDetails = async () => {
        setLoading(true);
        try {
            const headers = { 'x-user-uid': currentUser.uid };
            const res = await fetch(`${API_URL}/api/mock-tests/attempts/${attemptId}`, { headers });
            if (!res.ok) throw new Error("Failed to fetch mock test results");

            const data = await res.json();
            setAttempt(data);
        } catch (error) {
            console.error("Error fetching attempt result:", error);
            alert("Failed to load mock test results.");
            navigate('/mock-tests');
        } finally {
            setLoading(false);
        }
    };

    const getScoreGrade = (score) => {
        if (score >= 80) return { label: 'Elite Level', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
        if (score >= 60) return { label: 'Good Progress', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' };
        if (score >= 40) return { label: 'Needs Practice', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' };
        return { label: 'Critical Revision', color: 'text-red-400 bg-red-500/10 border-red-500/20' };
    };

    const formatDuration = (secs) => {
        const mins = Math.floor(secs / 60);
        const seconds = secs % 60;
        return `${mins}m ${seconds}s`;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <RefreshCw size={32} className="text-purple-400 animate-spin" />
                    <p className="text-zinc-400 text-sm">Aggregating test metrics & building review analysis...</p>
                </div>
            </div>
        );
    }

    if (!attempt) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <p className="text-zinc-500">Attempt data is unavailable.</p>
            </div>
        );
    }

    const { label: gradeLabel, color: gradeColor } = getScoreGrade(attempt.score);

    return (
        <div className="min-h-screen bg-[#050505] text-white pt-24 pb-16 px-4 sm:px-6 lg:px-8 relative selection:bg-purple-500/20 overflow-hidden">
            {/* Background Glows */}
            <div className="fixed top-20 left-1/4 w-96 h-96 bg-purple-600/5 rounded-full blur-[128px] pointer-events-none hidden sm:block" />
            <div className="fixed bottom-20 right-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-[128px] pointer-events-none hidden sm:block" />

            <div className="max-w-5xl mx-auto space-y-8 relative z-10">
                
                {/* Back button */}
                <button 
                    onClick={() => navigate('/mock-tests')}
                    className="flex items-center gap-2 text-zinc-400 hover:text-white transition-all group bg-white/5 px-4 py-2 rounded-full border border-white/10 hover:border-white/20 text-xs font-semibold"
                >
                    <ArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform" />
                    Back to Mock Dashboard
                </button>

                {/* Score Header Card */}
                <motion.div 
                    initial={{ opacity: 0, y: 15 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    className="p-6 md:p-8 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Mock Examination Result</span>
                            <span className={`text-[9px] px-2.5 py-0.5 rounded-full border font-bold uppercase tracking-wider ${gradeColor}`}>
                                {gradeLabel}
                            </span>
                        </div>
                        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">{attempt.testName}</h1>
                        <p className="text-zinc-500 text-xs sm:text-sm leading-relaxed max-w-lg">
                            Placement performance review. Explore accuracy metrics, section analysis, and targeted revision subjects below.
                        </p>
                    </div>

                    {/* Overall Score Rings */}
                    <div className="flex items-center gap-6 shrink-0 bg-white/[0.01] border border-white/[0.03] p-4 rounded-xl">
                        <div className="flex flex-col items-center">
                            <div className="relative w-16 h-16 flex items-center justify-center">
                                <svg className="w-full h-full -rotate-90">
                                    <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="4" />
                                    <circle cx="32" cy="32" r="28" fill="none" stroke="#a855f7" strokeWidth="4" strokeDasharray="176" strokeDashoffset={176 - (176 * attempt.score) / 100} strokeLinecap="round" />
                                </svg>
                                <span className="absolute text-sm font-black text-white">{attempt.score}%</span>
                            </div>
                            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider mt-1.5">Score</span>
                        </div>

                        <div className="flex flex-col items-center">
                            <div className="relative w-16 h-16 flex items-center justify-center">
                                <svg className="w-full h-full -rotate-90">
                                    <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="4" />
                                    <circle cx="32" cy="32" r="28" fill="none" stroke="#10b981" strokeWidth="4" strokeDasharray="176" strokeDashoffset={176 - (176 * attempt.accuracy) / 100} strokeLinecap="round" />
                                </svg>
                                <span className="absolute text-sm font-black text-white">{attempt.accuracy}%</span>
                            </div>
                            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider mt-1.5">Accuracy</span>
                        </div>
                    </div>
                </motion.div>

                {/* Score Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-xl border border-white/5 bg-white/[0.01] flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400"><TrendingUp size={16} /></div>
                        <div>
                            <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Estimated Rank</span>
                            <span className="text-sm font-bold text-white mt-0.5">#{attempt.rankEstimated || '15'}</span>
                        </div>
                    </div>
                    <div className="p-4 rounded-xl border border-white/5 bg-white/[0.01] flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400"><Timer size={16} /></div>
                        <div>
                            <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Time Taken</span>
                            <span className="text-sm font-bold text-white mt-0.5">{formatDuration(attempt.timeTaken || 0)}</span>
                        </div>
                    </div>
                    <div className="p-4 rounded-xl border border-white/5 bg-white/[0.01] flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400"><BookOpenCheck size={16} /></div>
                        <div>
                            <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Aptitude Score</span>
                            <span className="text-sm font-bold text-white mt-0.5">{attempt.aptitudeScore}%</span>
                        </div>
                    </div>
                    <div className="p-4 rounded-xl border border-white/5 bg-white/[0.01] flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400"><Code2 size={16} /></div>
                        <div>
                            <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">DSA Score</span>
                            <span className="text-sm font-bold text-white mt-0.5">{attempt.dsaScore}%</span>
                        </div>
                    </div>
                </div>

                {/* Weak Areas warning */}
                {attempt.weakAreas && attempt.weakAreas.length > 0 && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.98 }} 
                        animate={{ opacity: 1, scale: 1 }} 
                        className="p-5 rounded-xl border border-red-500/20 bg-red-500/[0.01] flex items-start gap-3.5"
                    >
                        <ShieldAlert size={20} className="text-red-400 shrink-0 mt-0.5" />
                        <div>
                            <h4 className="text-sm font-bold text-red-400">Weak Area Revision Required</h4>
                            <p className="text-zinc-400 text-xs mt-1 leading-relaxed">
                                Our evaluation system identified below-par performance in: <span className="text-white font-bold">{attempt.weakAreas.join(', ')}</span>. Practice these subjects individually in the general prep tab to master them.
                            </p>
                        </div>
                    </motion.div>
                )}

                {/* Topic Wise Accuracy Breakdown */}
                {attempt.topicAnalysis && Object.keys(attempt.topicAnalysis).length > 0 && (
                    <div className="p-6 rounded-2xl border border-white/5 bg-[#0a0a0a]/50">
                        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-6">Syllabus Topic Performance Analysis</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                            {Object.entries(attempt.topicAnalysis).map(([topic, stats]) => {
                                const acc = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
                                return (
                                    <div key={topic} className="space-y-1.5 p-3 rounded-lg border border-white/[0.03] bg-white/[0.01]">
                                        <div className="flex justify-between font-semibold text-zinc-300">
                                            <span>{topic}</span>
                                            <span>{acc}% ({stats.correct}/{stats.total})</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full rounded-full transition-all duration-500 ${
                                                    acc >= 75 ? 'bg-emerald-500' : acc >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                                                }`}
                                                style={{ width: `${acc}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* REVIEW MODE CONTAINER */}
                <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
                        <div>
                            <h2 className="text-base font-bold text-white tracking-tight">Question Review Mode</h2>
                            <p className="text-zinc-500 text-xs">Inspect correct answers, your choices, and step-by-step explanations.</p>
                        </div>

                        {/* Review section toggler */}
                        <div className="flex gap-2 p-1 bg-white/[0.02] border border-white/5 rounded-xl text-[10px] font-bold">
                            <button 
                                onClick={() => { setReviewTab('aptitude'); setExpandedQuestion(null); }}
                                className={`px-4 py-1.5 rounded-lg transition-colors cursor-pointer ${
                                    reviewTab === 'aptitude' ? 'bg-purple-600 text-white' : 'text-zinc-400 hover:text-white'
                                }`}
                            >
                                Aptitude MCQs ({attempt.questionsList?.aptitude?.length || 0})
                            </button>
                            <button 
                                onClick={() => { setReviewTab('dsa'); setExpandedQuestion(null); }}
                                className={`px-4 py-1.5 rounded-lg transition-colors cursor-pointer ${
                                    reviewTab === 'dsa' ? 'bg-purple-600 text-white' : 'text-zinc-400 hover:text-white'
                                }`}
                            >
                                DSA Coding ({attempt.questionsList?.dsa?.length || 0})
                            </button>
                        </div>
                    </div>

                    {/* Accordion Questions Lists */}
                    <div className="space-y-4">
                        {reviewTab === 'aptitude' ? (
                            attempt.questionsList?.aptitude?.map((q, idx) => {
                                // MongoDB Map is serialized as key-value pairs inside object
                                const userAns = attempt.answers?.[q.id] || attempt.answers?.get?.(q.id);
                                const isCorrect = userAns === q.correctAnswer;
                                const isExpanded = expandedQuestion === q.id;

                                return (
                                    <div key={q.id} className="border border-white/5 rounded-2xl bg-[#0e0e0e] overflow-hidden">
                                        <button 
                                            onClick={() => setExpandedQuestion(isExpanded ? null : q.id)}
                                            className="w-full p-5 text-left flex items-start justify-between gap-4 cursor-pointer hover:bg-white/[0.01] transition-colors"
                                        >
                                            <div className="flex items-start gap-3">
                                                {isCorrect ? (
                                                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                                                ) : (
                                                    <XCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
                                                )}
                                                <div>
                                                    <h4 className="text-xs font-semibold text-zinc-300">
                                                        Question {idx + 1} · <span className="text-[10px] text-zinc-500 uppercase">{q.topic}</span>
                                                    </h4>
                                                    <p className="text-white text-xs mt-1 line-clamp-1 leading-relaxed">{q.questionText}</p>
                                                </div>
                                            </div>
                                            <ChevronDown size={14} className={`text-zinc-500 shrink-0 mt-1 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                        </button>

                                        <AnimatePresence>
                                            {isExpanded && (
                                                <motion.div 
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="border-t border-white/5 bg-zinc-950 p-5 space-y-4 text-xs"
                                                >
                                                    <p className="text-zinc-200 leading-relaxed whitespace-pre-wrap">{q.questionText}</p>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                        {q.options?.map(opt => {
                                                            const isUserChosen = userAns === opt.key;
                                                            const isCorrectOpt = q.correctAnswer === opt.key;
                                                            
                                                            let optStyle = 'border-white/5 bg-white/[0.01]';
                                                            if (isCorrectOpt) optStyle = 'border-emerald-500/30 bg-emerald-500/5 text-emerald-300';
                                                            else if (isUserChosen && !isCorrect) optStyle = 'border-red-500/30 bg-red-500/5 text-red-300';

                                                            return (
                                                                <div key={opt.key} className={`p-3 rounded-lg border flex items-center gap-2.5 ${optStyle}`}>
                                                                    <span className={`w-6 h-6 rounded flex items-center justify-center font-bold text-[10px] border shrink-0 ${
                                                                        isCorrectOpt ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                                                                        isUserChosen ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                                                                        'bg-white/5 border-white/10 text-zinc-500'
                                                                    }`}>
                                                                        {opt.key}
                                                                    </span>
                                                                    <span>{opt.text}</span>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>

                                                    <div className="space-y-3 pt-3 border-t border-white/5">
                                                        {q.formulaHint && (
                                                            <div className="flex gap-2 text-[11px] text-yellow-400/90 font-medium">
                                                                <Lightbulb className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                                                <span>Formula Hint: {q.formulaHint}</span>
                                                            </div>
                                                        )}
                                                        {q.explanation && (
                                                            <div className="p-3.5 rounded-lg border border-white/5 bg-[#0c0c0c] text-zinc-400 leading-relaxed whitespace-pre-wrap">
                                                                <span className="font-bold text-white block mb-1">Step-by-step Solution:</span>
                                                                {q.explanation}
                                                            </div>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                );
                            })
                        ) : (
                            attempt.questionsList?.dsa?.map((q, idx) => {
                                const userCode = attempt.answers?.[q.id] || attempt.answers?.get?.(q.id);
                                const isExpanded = expandedQuestion === q.id;

                                return (
                                    <div key={q.id} className="border border-white/5 rounded-2xl bg-[#0e0e0e] overflow-hidden">
                                        <button 
                                            onClick={() => setExpandedQuestion(isExpanded ? null : q.id)}
                                            className="w-full p-5 text-left flex items-start justify-between gap-4 cursor-pointer hover:bg-white/[0.01] transition-colors"
                                        >
                                            <div className="flex items-start gap-3">
                                                <Code2 size={16} className="text-purple-400 shrink-0 mt-0.5" />
                                                <div>
                                                    <h4 className="text-xs font-semibold text-zinc-300">
                                                        Problem {idx + 1} · <span className="text-[10px] text-zinc-500 uppercase">{q.topic}</span>
                                                    </h4>
                                                    <p className="text-white text-xs mt-1 font-bold">{q.title}</p>
                                                </div>
                                            </div>
                                            <ChevronDown size={14} className={`text-zinc-500 shrink-0 mt-1 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                        </button>

                                        <AnimatePresence>
                                            {isExpanded && (
                                                <motion.div 
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="border-t border-white/5 bg-zinc-950 p-5 space-y-4 text-xs"
                                                >
                                                    <p className="text-zinc-400 leading-relaxed whitespace-pre-wrap">{q.description}</p>

                                                    <div className="space-y-1.5">
                                                        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Your Coded Answer</span>
                                                        <pre className="p-4 rounded-xl border border-white/5 bg-[#080808] font-mono text-[11px] text-zinc-300 overflow-x-auto max-h-64 whitespace-pre">
                                                            {userCode || '// No code submitted.'}
                                                        </pre>
                                                    </div>

                                                    {q.solutionCode && (
                                                        <div className="space-y-2 pt-3 border-t border-white/5">
                                                            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Optimal Solution Reference</span>
                                                            <pre className="p-4 rounded-xl border border-emerald-500/10 bg-emerald-500/[0.01] font-mono text-[11px] text-emerald-300/80 overflow-x-auto max-h-64 whitespace-pre">
                                                                {q.solutionCode.javascript || q.solutionCode.python || q.solutionCode.cpp || q.solutionCode.java || '// Solution code not available.'}
                                                            </pre>
                                                        </div>
                                                    )}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MockTestResult;
