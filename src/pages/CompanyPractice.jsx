import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, ArrowRight, CheckCircle2, XCircle, SkipForward,
    Clock, Target, Zap, Trophy, ChevronDown, ChevronRight, Lightbulb,
    BarChart2, Loader2, Hash, Flame, RotateCcw, BookOpen
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';

/* ─── Accuracy Ring (SVG donut) ────────────────────── */
const AccuracyRing = ({ correct, total, size = 80 }) => {
    const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
    const r = (size - 10) / 2;
    const circ = 2 * Math.PI * r;
    const offset = circ - (pct / 100) * circ;
    const color = pct >= 70 ? '#34d399' : pct >= 40 ? '#facc15' : pct > 0 ? '#f87171' : '#3f3f46';

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="-rotate-90">
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={6} />
                <motion.circle
                    cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={6}
                    strokeLinecap="round" strokeDasharray={circ}
                    initial={{ strokeDashoffset: circ }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-black text-white leading-none">{pct}%</span>
                <span className="text-[9px] text-zinc-500 font-semibold uppercase tracking-wider mt-0.5">Accuracy</span>
            </div>
        </div>
    );
};

const QuestionNav = ({ questions, currentIndex, onSelect, results, selectedAnswers }) => (
    <div className="grid grid-cols-5 gap-2">
        {questions.map((q, i) => {
            const r = results[q._id];
            const isSelected = selectedAnswers[q._id] !== undefined;
            const isCurrent = i === currentIndex;
            let pillStyle = 'bg-white/5 border-white/10 text-zinc-500 hover:bg-white/10'; // Not visited

            if (r) {
                if (r.skipped) pillStyle = 'bg-red-500/15 border-red-500/30 text-red-500 hover:bg-red-500/20'; // Skipped
                else pillStyle = 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'; // Submitted
            } else if (isSelected) {
                pillStyle = 'bg-yellow-500/15 border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/20'; // Attempted
            }
            if (isCurrent) pillStyle += ' ring-2 ring-blue-500/50 ring-offset-1 ring-offset-[#0A0A0A] scale-110 z-10';

            return (
                <button
                    key={q._id}
                    onClick={() => onSelect(i)}
                    className={`h-9 rounded-lg border text-[11px] font-bold transition-all duration-200 flex items-center justify-center ${pillStyle}`}
                >
                    {i + 1}
                </button>
            );
        })}
    </div>
);

/* ─── Main Page ────────────────────────────────────── */
const CompanyPractice = () => {
    const { company, section, topic } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();

    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [stats, setStats] = useState({ totalQuestions: 0, totalAnswered: 0, totalRemaining: 0, progressPercent: 0 });
    const [sessionStats, setSessionStats] = useState({ correct: 0, wrong: 0, skipped: 0 });
    const [error, setError] = useState(null);
    const [direction, setDirection] = useState(1); // 1=forward, -1=back

    // Per-question state, keyed by question _id
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [results, setResults] = useState({});
    const [showExplanations, setShowExplanations] = useState({});
    const [reviewMode, setReviewMode] = useState(false);

    const isSessionCompleted = questions.length > 0 && Object.keys(results).length === questions.length;

    const STATE_KEY = `quizState_${company}_${section}_${topic}`;

    // Auto-save to localStorage
    useEffect(() => {
        if (questions.length > 0) {
            localStorage.setItem(STATE_KEY, JSON.stringify({
                questions, currentIndex, selectedAnswers, results, sessionStats, stats, showExplanations, reviewMode
            }));
        }
    }, [questions, currentIndex, selectedAnswers, results, sessionStats, stats, showExplanations, reviewMode, STATE_KEY]);

    const fetchQuestions = useCallback(async (force = false) => {
        if (!currentUser) return;
        setLoading(true);
        setError(null);

        if (force) {
            localStorage.removeItem(STATE_KEY);
        } else {
            try {
                const savedState = localStorage.getItem(STATE_KEY);
                if (savedState) {
                    const parsed = JSON.parse(savedState);
                    if (parsed.questions && parsed.questions.length > 0) {
                        setQuestions(parsed.questions);
                        setCurrentIndex(parsed.currentIndex || 0);
                        setSelectedAnswers(parsed.selectedAnswers || {});
                        setResults(parsed.results || {});
                        setSessionStats(parsed.sessionStats || { correct: 0, wrong: 0, skipped: 0 });
                        setStats(parsed.stats || { totalQuestions: 0, totalAnswered: 0, totalRemaining: 0, progressPercent: 0 });
                        setShowExplanations(parsed.showExplanations || {});
                        setReviewMode(parsed.reviewMode || false);
                        setLoading(false);
                        return;
                    }
                }
            } catch (e) {
                console.error("Failed to restore state", e);
            }
        }

        try {
            const res = await fetch(
                `${API_URL}/api/company-questions/practice/${company}/${section}/${topic}?limit=20`,
                { headers: { 'x-user-uid': currentUser.uid } }
            );
            if (!res.ok) throw new Error('Failed to fetch questions');
            const data = await res.json();

            setQuestions(data.questions || []);
            setStats({
                totalQuestions: data.totalQuestions || 0,
                totalAnswered: data.totalAnswered || 0,
                totalRemaining: data.totalRemaining || 0,
                progressPercent: data.progressPercent || 0,
                initialAnswered: data.totalAnswered || 0,
            });
            setCurrentIndex(0);
            setSelectedAnswers({});
            setResults({});
            setShowExplanations({});
            setReviewMode(false);
            setDirection(1);
        } catch (err) {
            console.error('Fetch error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [currentUser, company, section, topic, STATE_KEY]);

    useEffect(() => { fetchQuestions(); }, [fetchQuestions]);

    // Keyboard nav
    useEffect(() => {
        const handler = (e) => {
            if (e.key === 'ArrowRight' && currentIndex < questions.length - 1) {
                setDirection(1);
                setCurrentIndex(i => i + 1);
            } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
                setDirection(-1);
                setCurrentIndex(i => i - 1);
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [currentIndex, questions.length]);

    const topicDisplay = topic.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    const sectionDisplay = section.charAt(0).toUpperCase() + section.slice(1);
    const currentQ = questions[currentIndex];
    const currentSelected = currentQ ? selectedAnswers[currentQ._id] || null : null;
    const currentResult = currentQ ? results[currentQ._id] || null : null;
    const currentShowExp = currentQ ? showExplanations[currentQ._id] || false : false;
    const totalAttempted = sessionStats.correct + sessionStats.wrong + sessionStats.skipped;

    const handleSubmit = async () => {
        if (!currentSelected || submitting || !currentQ) return;
        setSubmitting(true);
        try {
            const res = await fetch(`${API_URL}/api/company-questions/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-user-uid': currentUser.uid },
                body: JSON.stringify({ company, section, questionId: currentQ._id, selectedAnswer: currentSelected }),
            });
            if (!res.ok) throw new Error('Submit failed');
            const data = await res.json();
            setResults(prev => {
                const map = { ...prev, [currentQ._id]: data };
                setTimeout(() => {
                    let nextIdx = -1;
                    for (let i = currentIndex + 1; i < questions.length; i++) {
                        if (!map[questions[i]._id]) { nextIdx = i; break; }
                    }
                    if (nextIdx === -1) {
                        for (let i = 0; i < currentIndex; i++) {
                            if (!map[questions[i]._id]) { nextIdx = i; break; }
                        }
                    }
                    if (nextIdx !== -1) {
                        setDirection(nextIdx > currentIndex ? 1 : -1);
                        setCurrentIndex(nextIdx);
                    }
                }, 1500);
                return map;
            });
            setSessionStats(prev => ({ ...prev, [data.isCorrect ? 'correct' : 'wrong']: prev[data.isCorrect ? 'correct' : 'wrong'] + 1 }));

            // Dynamically update topic overall progress
            setStats(prev => {
                const newAnswered = prev.totalAnswered + 1;
                const newRemaining = Math.max(0, prev.totalRemaining - 1);
                const newPercent = prev.totalQuestions > 0 ? Math.round((newAnswered / prev.totalQuestions) * 100) : 0;
                return { ...prev, totalAnswered: newAnswered, totalRemaining: newRemaining, progressPercent: newPercent };
            });
        } catch (err) {
            console.error('Submit error:', err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleSkip = async () => {
        if (submitting || !currentQ) return;
        setSubmitting(true);
        try {
            await fetch(`${API_URL}/api/company-questions/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-user-uid': currentUser.uid },
                body: JSON.stringify({ company, section, questionId: currentQ._id, skipped: true }),
            });
            setResults(prev => {
                const map = { ...prev, [currentQ._id]: { skipped: true, isCorrect: false } };
                setTimeout(() => {
                    let nextIdx = -1;
                    for (let i = currentIndex + 1; i < questions.length; i++) {
                        if (!map[questions[i]._id]) { nextIdx = i; break; }
                    }
                    if (nextIdx === -1) {
                        for (let i = 0; i < currentIndex; i++) {
                            if (!map[questions[i]._id]) { nextIdx = i; break; }
                        }
                    }
                    if (nextIdx !== -1) {
                        setDirection(nextIdx > currentIndex ? 1 : -1);
                        setCurrentIndex(nextIdx);
                    }
                }, 400); // Shorter delay for skipping
                return map;
            });
            setSessionStats(prev => ({ ...prev, skipped: prev.skipped + 1 }));
        } catch (err) {
            console.error('Skip error:', err);
        } finally {
            setSubmitting(false);
        }
    };

    const goNext = () => {
        if (currentIndex < questions.length - 1) {
            setDirection(1);
            setCurrentIndex(i => i + 1);
        } else {
            fetchQuestions(true); // Load more natively, bypassing localStorage
        }
    };

    const goPrev = () => {
        if (currentIndex > 0) {
            setDirection(-1);
            setCurrentIndex(i => i - 1);
        }
    };

    const handleResetTopic = async () => {
        if (submitting) return;
        if (!window.confirm('Are you sure you want to reset all progress for this topic?')) return;
        setSubmitting(true);
        try {
            const res = await fetch(`${API_URL}/api/company-questions/progress/reset`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json', 'x-user-uid': currentUser.uid },
                body: JSON.stringify({ company, section, topic })
            });
            if (!res.ok) throw new Error('Failed to reset progress');
            // Reset local states and re-fetch
            setSessionStats({ correct: 0, wrong: 0, skipped: 0 });
            localStorage.removeItem(STATE_KEY);
            await fetchQuestions(true);
        } catch (err) {
            console.error('Reset error:', err);
        } finally {
            setSubmitting(false);
        }
    };

    /* ─── Loading / Error / Empty states ──────────── */
    if (loading && questions.length === 0) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 size={32} className="text-blue-400 animate-spin" />
                    <p className="text-zinc-400 text-sm">Loading questions...</p>
                </div>
            </div>
        );
    }

    if (error && questions.length === 0) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4">
                <div className="text-center space-y-4">
                    <XCircle size={48} className="text-red-400 mx-auto" />
                    <h2 className="text-xl font-bold text-white">Something went wrong</h2>
                    <p className="text-zinc-400 text-sm">{error}</p>
                    <button onClick={fetchQuestions} className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (questions.length === 0) {
        if (stats.totalQuestions === 0) {
            // Empy State: No questions inside the DB
            return (
                <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4">
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-6 max-w-md">
                        <div className="w-20 h-20 rounded-3xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto">
                            <BookOpen size={36} className="text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-white mb-2">Coming Soon</h2>
                            <p className="text-zinc-400 text-sm">We are still adding questions for <span className="text-white font-semibold">{topicDisplay}</span>. Check back later!</p>
                        </div>
                        <div className="flex justify-center mt-6">
                            <button onClick={() => navigate(`/companies/${company}`)} className="inline-flex justify-center items-center gap-2 px-6 py-3 bg-white/10 border border-white/15 rounded-2xl text-white text-sm font-semibold hover:bg-white/15 transition-all">
                                <ArrowLeft size={14} /> Back to {company.toUpperCase()}
                            </button>
                        </div>
                    </motion.div>
                </div>
            );
        }

        // Completed State
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-6 max-w-md">
                    <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto">
                        <Trophy size={36} className="text-emerald-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-white mb-2">All Done! 🎉</h2>
                        <p className="text-zinc-400 text-sm">You've completed all {stats.totalQuestions} questions for <span className="text-white font-semibold">{topicDisplay}</span>.</p>
                    </div>
                    {totalAttempted > 0 && (
                        <div className="flex justify-center gap-4">
                            <div className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                                <p className="text-emerald-400 font-bold text-lg">{sessionStats.correct}</p>
                                <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Correct</p>
                            </div>
                            <div className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20">
                                <p className="text-red-400 font-bold text-lg">{sessionStats.wrong}</p>
                                <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Wrong</p>
                            </div>
                            <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10">
                                <p className="text-zinc-300 font-bold text-lg">{sessionStats.skipped}</p>
                                <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Skipped</p>
                            </div>
                        </div>
                    )}
                    <div className="flex flex-col gap-3 mt-6">
                        <button onClick={handleResetTopic} disabled={submitting} className="inline-flex justify-center items-center gap-2 px-6 py-3 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm font-semibold hover:bg-red-500/20 transition-all">
                            {submitting ? <Loader2 size={16} className="animate-spin" /> : <RotateCcw size={16} />} Reset Topic Progress
                        </button>
                        <button
                            onClick={() => navigate(`/companies/${company}/${section}`)}
                            className="inline-flex justify-center items-center gap-2 px-6 py-3 bg-white/10 border border-white/15 rounded-2xl text-white text-sm font-semibold hover:bg-white/15 transition-all"
                        >
                            <ArrowLeft size={14} /> Back to {company.toUpperCase()}
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    /* ─── Slide animation variants ────────────────── */
    const slideVariants = {
        enter: (dir) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
        center: { x: 0, opacity: 1 },
        exit: (dir) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
    };

    /* ─── Main Render ─────────────────────────────── */
    return (
        <div className="min-h-screen bg-[#050505] pt-10 pb-20 px-4 sm:px-6 lg:px-8 selection:bg-purple-500/30">
            {/* Ambient glows */}
            <div className="fixed top-20 left-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-[128px] pointer-events-none hidden sm:block" />
            <div className="fixed bottom-20 right-1/4 w-96 h-96 bg-purple-600/5 rounded-full blur-[128px] pointer-events-none hidden sm:block" />

            <motion.div
                className="max-w-6xl mx-auto relative z-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                {/* ── Breadcrumb Header ──────────────────────── */}
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={() => navigate(`/companies/${company}/${section}`)}
                        className="flex items-center gap-2 text-zinc-400 hover:text-white transition-all group bg-white/5 px-4 py-2 rounded-full border border-white/10 hover:border-white/20 text-sm font-medium"
                    >
                        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                        Back
                    </button>
                    <div className="hidden sm:flex items-center gap-1.5 text-xs text-zinc-500 font-medium">
                        <span className="text-zinc-400 hover:text-white cursor-pointer transition-colors" onClick={() => navigate(`/companies/${company}`)}>{company.toUpperCase()}</span>
                        <ChevronRight size={12} />
                        <span className="text-zinc-400">{sectionDisplay}</span>
                        <ChevronRight size={12} />
                        <span className="text-white font-semibold">{topicDisplay}</span>
                    </div>
                    <div className="sm:hidden text-right">
                        <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">{company.toUpperCase()} · {sectionDisplay}</p>
                        <p className="text-white font-bold text-sm">{topicDisplay}</p>
                    </div>
                </div>

                {/* ── Two-column Layout ──────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">

                    {/* ═══ LEFT: Question Card ═══════════════════ */}
                    <div className="space-y-4">
                        {/* Progress bar (compact) */}
                        <div className="flex items-center gap-4 p-3 rounded-2xl border border-white/[0.07] bg-white/[0.02]">
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-[11px] text-zinc-500 font-medium">Overall Progress</span>
                                    <span className="text-[11px] text-zinc-400 font-bold">{stats.totalAnswered}/{stats.totalQuestions}</span>
                                </div>
                                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${stats.progressPercent}%` }}
                                        transition={{ duration: 0.8 }}
                                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-[11px] shrink-0">
                                <span className="text-emerald-400 font-semibold">{sessionStats.correct}✓</span>
                                <span className="text-red-400 font-semibold">{sessionStats.wrong}✗</span>
                                <span className="text-zinc-500 font-semibold">{sessionStats.skipped}⊘</span>
                            </div>
                        </div>

                        {/* Question counter + navigation */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={goPrev}
                                    disabled={currentIndex === 0}
                                    className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    <ArrowLeft size={15} />
                                </button>
                                <span className="text-sm font-bold text-white">
                                    Question <span className="text-blue-400">{(stats.initialAnswered || 0) + currentIndex + 1}</span>
                                    <span className="text-zinc-500 font-normal"> / {stats.totalQuestions}</span>
                                </span>
                                <button
                                    onClick={goNext}
                                    disabled={currentIndex >= questions.length - 1 && loading}
                                    className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    <ArrowRight size={15} />
                                </button>
                            </div>
                            <div className="flex items-center gap-2">
                                {currentQ?.difficulty && (
                                    <span className={`text-[10px] px-2.5 py-1 rounded-full border font-bold uppercase tracking-wider ${currentQ.difficulty === 'Easy' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' :
                                        currentQ.difficulty === 'Medium' ? 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' :
                                            'text-red-400 bg-red-500/10 border-red-500/20'
                                        }`}>
                                        {currentQ.difficulty}
                                    </span>
                                )}
                                {currentQ?.timeLimit && (
                                    <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] text-zinc-500">
                                        <Clock size={10} /> {currentQ.timeLimit}s
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* The Question Card (with slide animation) or Completion Summary */}
                        <AnimatePresence mode="wait" custom={direction}>
                            {isSessionCompleted && !reviewMode ? (
                                <motion.div
                                    key="summary"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="rounded-2xl border border-white/[0.07] bg-[#0A0A0A]/80 p-8 text-center shadow-2xl space-y-6"
                                >
                                    <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto">
                                        <Trophy size={36} className="text-emerald-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-white mb-2">Practice Session Complete! 🎉</h2>
                                        <p className="text-zinc-400 text-sm">You've attempted all {questions.length} loaded questions.</p>
                                    </div>
                                    
                                    <div className="flex justify-center gap-4">
                                        <div className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                                            <p className="text-emerald-400 font-bold text-lg">{sessionStats.correct}</p>
                                            <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Correct</p>
                                        </div>
                                        <div className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20">
                                            <p className="text-red-400 font-bold text-lg">{sessionStats.wrong}</p>
                                            <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Wrong</p>
                                        </div>
                                        <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10">
                                            <p className="text-zinc-300 font-bold text-lg">{sessionStats.skipped}</p>
                                            <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Skipped</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col justify-center mt-6">
                                        <button
                                            onClick={() => setReviewMode(true)}
                                            className="px-6 py-3 mb-3 bg-white/10 border border-white/15 rounded-2xl text-white text-sm font-semibold hover:bg-white/15 transition-all"
                                        >
                                            Review Mode
                                        </button>
                                        {stats.totalRemaining > 0 && (
                                            <button
                                                onClick={() => fetchQuestions(true)}
                                                className="px-6 py-3 bg-blue-600 border border-blue-500/20 rounded-2xl text-white text-sm font-semibold hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                                            >
                                                Load More Questions <ArrowRight size={14} />
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            ) : currentQ && (
                                <motion.div
                                    key={currentQ._id}
                                    custom={direction}
                                    variants={slideVariants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                                    className="rounded-2xl border border-white/[0.07] bg-[#0A0A0A]/80 overflow-hidden shadow-2xl"
                                >
                                    {/* Question text */}
                                    <div className="p-4 sm:p-6 border-b border-white/[0.05]">
                                        <p className="text-white text-base md:text-lg font-medium leading-relaxed whitespace-pre-wrap">
                                            {currentQ.questionText}
                                        </p>
                                    </div>

                                    {/* Options */}
                                    <div className="p-4 sm:p-6 space-y-3">
                                        {currentQ.options?.map((opt) => {
                                            const isSelected = currentSelected === opt.key;
                                            let optStyle = 'border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.15]';

                                            if (currentResult && !currentResult.skipped) {
                                                if (opt.key === currentResult.correctAnswer) {
                                                    optStyle = 'border-emerald-500/40 bg-emerald-500/10';
                                                } else if (isSelected && !currentResult.isCorrect) {
                                                    optStyle = 'border-red-500/40 bg-red-500/10';
                                                } else {
                                                    optStyle = 'border-white/[0.04] bg-white/[0.01] opacity-60';
                                                }
                                            } else if (isSelected) {
                                                optStyle = 'border-blue-500/40 bg-blue-500/10 shadow-lg shadow-blue-500/5';
                                            }

                                            return (
                                                <button
                                                    key={opt.key}
                                                    onClick={() => !currentResult && setSelectedAnswers(prev => ({ ...prev, [currentQ._id]: opt.key }))}
                                                    disabled={!!currentResult}
                                                    className={`w-full text-left p-3 sm:p-4 rounded-xl border transition-all duration-200 flex items-center gap-3.5 group ${optStyle} ${currentResult ? 'cursor-default' : 'cursor-pointer'}`}
                                                >
                                                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 border transition-all ${currentResult && !currentResult.skipped && opt.key === currentResult.correctAnswer
                                                        ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                                                        : currentResult && !currentResult.skipped && isSelected && !currentResult.isCorrect
                                                            ? 'bg-red-500/20 border-red-500/40 text-red-400'
                                                            : isSelected
                                                                ? 'bg-blue-500/20 border-blue-500/40 text-blue-400'
                                                                : 'bg-white/5 border-white/10 text-zinc-500 group-hover:text-white group-hover:border-white/20'
                                                        }`}>
                                                        {opt.key}
                                                    </span>
                                                    <span className={`text-base sm:text-lg leading-relaxed ${currentResult && !currentResult.skipped && opt.key === currentResult.correctAnswer ? 'text-emerald-300 font-medium' :
                                                        currentResult && !currentResult.skipped && isSelected && !currentResult.isCorrect ? 'text-red-300' :
                                                            isSelected ? 'text-blue-300' : 'text-zinc-300'
                                                        }`}>
                                                        {opt.text}
                                                    </span>
                                                    {currentResult && !currentResult.skipped && opt.key === currentResult.correctAnswer && (
                                                        <CheckCircle2 size={20} className="text-emerald-400 ml-auto shrink-0" />
                                                    )}
                                                    {currentResult && !currentResult.skipped && isSelected && !currentResult.isCorrect && (
                                                        <XCircle size={20} className="text-red-400 ml-auto shrink-0" />
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Result Banner */}
                                    <AnimatePresence>
                                        {currentResult && !currentResult.skipped && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3 }}
                                                className="overflow-hidden"
                                            >
                                                <div className={`mx-6 sm:mx-8 mb-3 p-4 rounded-xl border ${currentResult.isCorrect ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-red-500/20 bg-red-500/5'
                                                    }`}>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        {currentResult.isCorrect
                                                            ? <CheckCircle2 size={16} className="text-emerald-400" />
                                                            : <XCircle size={16} className="text-red-400" />
                                                        }
                                                        <span className={`text-sm font-bold ${currentResult.isCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
                                                            {currentResult.isCorrect ? 'Correct! 🎉' : 'Incorrect'}
                                                        </span>
                                                    </div>
                                                    {!currentResult.isCorrect && (
                                                        <p className="text-xs text-zinc-400 mt-1">
                                                            The correct answer is <span className="text-emerald-400 font-bold">{currentResult.correctAnswer}</span>
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Explanation */}
                                                {(currentResult.explanation || currentResult.formulaHint) && (
                                                    <div className="mx-6 sm:mx-8 mb-5">
                                                        <button
                                                            onClick={() => setShowExplanations(prev => ({ ...prev, [currentQ._id]: !currentShowExp }))}
                                                            className="flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 font-semibold mb-2 transition-colors"
                                                        >
                                                            <Lightbulb size={12} />
                                                            {currentShowExp ? 'Hide Explanation' : 'Show Explanation'}
                                                            <ChevronDown size={12} className={`transition-transform ${currentShowExp ? 'rotate-180' : ''}`} />
                                                        </button>
                                                        <AnimatePresence>
                                                            {currentShowExp && (
                                                                <motion.div
                                                                    initial={{ height: 0, opacity: 0 }}
                                                                    animate={{ height: 'auto', opacity: 1 }}
                                                                    exit={{ height: 0, opacity: 0 }}
                                                                    className="overflow-hidden"
                                                                >
                                                                    {currentResult.formulaHint && (
                                                                        <div className="p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/15 mb-2">
                                                                            <p className="text-xs text-yellow-300 font-medium">💡 {currentResult.formulaHint}</p>
                                                                        </div>
                                                                    )}
                                                                    {currentResult.explanation && (
                                                                        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                                                                            <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">{currentResult.explanation}</p>
                                                                        </div>
                                                                    )}
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>
                                                )}
                                            </motion.div>
                                        )}
                                        {currentResult && currentResult.skipped && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="mx-6 sm:mx-8 mb-3 p-4 rounded-xl border border-zinc-500/20 bg-zinc-500/5">
                                                    <div className="flex items-center gap-2">
                                                        <SkipForward size={16} className="text-zinc-400" />
                                                        <span className="text-sm font-bold text-zinc-400">Skipped</span>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Action buttons */}
                                    <div className="p-6 sm:p-8 border-t border-white/[0.05] flex items-center gap-3">
                                        {!currentResult ? (
                                            <>
                                                <button
                                                    onClick={handleSkip}
                                                    disabled={submitting}
                                                    className="px-5 py-2.5 rounded-xl text-sm font-medium text-zinc-400 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white transition-all flex items-center gap-2"
                                                >
                                                    <SkipForward size={14} /> Skip
                                                </button>
                                                <button
                                                    onClick={handleSubmit}
                                                    disabled={!currentSelected || submitting}
                                                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${currentSelected
                                                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20'
                                                        : 'bg-white/5 text-zinc-600 cursor-not-allowed border border-white/10'
                                                        }`}
                                                >
                                                    {submitting ? <Loader2 size={16} className="animate-spin" /> : <Target size={14} />}
                                                    {submitting ? 'Checking...' : 'Submit Answer'}
                                                </button>
                                            </>
                                        ) : (
                                            <button
                                                onClick={goNext}
                                                className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-white/10 hover:bg-white/15 text-white border border-white/10 transition-all flex items-center justify-center gap-2"
                                            >
                                                {currentIndex < questions.length - 1 ? 'Next Question' : 'Load More'}
                                                <ArrowRight size={14} />
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* ═══ RIGHT: Sidebar ═════════════════════════ */}
                    <div className="space-y-4 lg:sticky lg:top-28 lg:self-start">
                        {/* Topic Info Card */}
                        <div className="p-5 rounded-2xl border border-white/[0.07] bg-[#0A0A0A]/80 shadow-lg">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                                    <BookOpen size={18} className="text-blue-400" />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-sm">{topicDisplay}</h3>
                                    <p className="text-[11px] text-zinc-500">{company.toUpperCase()} · {sectionDisplay}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] text-center">
                                    <p className="text-lg font-black text-white">{stats.totalQuestions}</p>
                                    <p className="text-[9px] text-zinc-500 uppercase tracking-wider font-semibold">Total</p>
                                </div>
                                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] text-center">
                                    <p className="text-lg font-black text-blue-400">{stats.totalRemaining}</p>
                                    <p className="text-[9px] text-zinc-500 uppercase tracking-wider font-semibold">Remaining</p>
                                </div>
                            </div>
                        </div>

                        {/* Session Stats Card */}
                        <div className="p-5 rounded-2xl border border-white/[0.07] bg-[#0A0A0A]/80 shadow-lg">
                            <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <Flame size={12} className="text-orange-400" /> Session Stats
                            </h4>
                            <div className="flex items-center gap-4 mb-4">
                                <AccuracyRing correct={sessionStats.correct} total={sessionStats.correct + sessionStats.wrong} />
                                <div className="space-y-2 flex-1">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-emerald-400" />
                                            <span className="text-xs text-zinc-400">Correct</span>
                                        </div>
                                        <span className="text-xs font-bold text-emerald-400">{sessionStats.correct}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-red-400" />
                                            <span className="text-xs text-zinc-400">Wrong</span>
                                        </div>
                                        <span className="text-xs font-bold text-red-400">{sessionStats.wrong}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-zinc-500" />
                                            <span className="text-xs text-zinc-400">Skipped</span>
                                        </div>
                                        <span className="text-xs font-bold text-zinc-500">{sessionStats.skipped}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="pt-3 border-t border-white/[0.06]">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-zinc-500 font-medium">Attempted</span>
                                    <span className="text-white font-bold">{totalAttempted} / {stats.totalQuestions}</span>
                                </div>
                            </div>
                        </div>

                        {/* Question Navigator */}
                        <div className="p-5 rounded-2xl border border-white/[0.07] bg-[#0A0A0A]/80 shadow-lg">
                            <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <Hash size={12} className="text-purple-400" /> Questions
                            </h4>
                            <QuestionNav
                                questions={questions}
                                currentIndex={currentIndex}
                                onSelect={(i) => { setDirection(i > currentIndex ? 1 : -1); setCurrentIndex(i); }}
                                results={results}
                                selectedAnswers={selectedAnswers}
                            />
                        </div>

                        {/* Load more button in sidebar */}
                        <button
                            onClick={() => fetchQuestions(true)}
                            disabled={loading}
                            className="w-full py-2.5 rounded-xl text-xs font-bold bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white border border-white/10 transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={13} />}
                            {loading ? 'Loading...' : 'Refresh Questions'}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default CompanyPractice;
