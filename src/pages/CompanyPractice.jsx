import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, ArrowRight, CheckCircle2, XCircle, SkipForward,
    Clock, Target, Zap, Trophy, ChevronDown, Lightbulb, RotateCcw,
    BarChart2, Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';

const QuestionCard = ({ question, index, company, section, currentUser, onSessionStatsUpdate }) => {
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [result, setResult] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [showExplanation, setShowExplanation] = useState(false);

    const handleSubmit = async () => {
        if (!selectedAnswer || submitting) return;
        setSubmitting(true);
        try {
            const res = await fetch(`${API_URL}/api/company-questions/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-user-uid': currentUser.uid },
                body: JSON.stringify({
                    company, section,
                    questionId: question._id,
                    selectedAnswer,
                }),
            });
            if (!res.ok) throw new Error('Submit failed');
            const data = await res.json();
            setResult(data);
            setSubmitted(true);
            onSessionStatsUpdate(data.isCorrect ? 'correct' : 'wrong');
        } catch (err) {
            console.error('Submit error:', err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleSkip = async () => {
        if (submitting) return;
        setSubmitting(true);
        try {
            await fetch(`${API_URL}/api/company-questions/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-user-uid': currentUser.uid },
                body: JSON.stringify({
                    company, section,
                    questionId: question._id,
                    skipped: true,
                }),
            });
            onSessionStatsUpdate('skipped');
            setSubmitted(true);
            setResult({ skipped: true, isCorrect: false });
        } catch (err) {
            console.error('Skip error:', err);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="rounded-2xl border border-white/[0.07] bg-[#0A0A0A]/80 overflow-hidden shadow-2xl relative mb-8"
        >
            <div className="absolute top-4 left-4 w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold text-zinc-400">
                {index + 1}
            </div>

            {/* Question header */}
            <div className="p-5 sm:p-6 sm:pl-14 border-b border-white/[0.05]">
                <div className="flex items-start justify-between gap-3 mb-3 pl-2 sm:pl-0">
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full border font-bold uppercase tracking-wider ${question.difficulty === 'Easy' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' :
                            question.difficulty === 'Medium' ? 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' :
                                'text-red-400 bg-red-500/10 border-red-500/20'
                        }`}>
                        {question.difficulty}
                    </span>
                    {question.timeLimit && (
                        <span className="flex items-center gap-1 text-[10px] text-zinc-500">
                            <Clock size={10} /> {question.timeLimit}s
                        </span>
                    )}
                </div>
                <p className="text-white text-base sm:text-lg font-medium leading-relaxed whitespace-pre-wrap pl-2 sm:pl-0">
                    {question.questionText}
                </p>
            </div>

            {/* Options */}
            <div className="p-5 sm:p-6 space-y-3">
                {question.options?.map((opt) => {
                    const isSelected = selectedAnswer === opt.key;
                    let optStyle = 'border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.15]';

                    if (submitted && result && !result.skipped) {
                        if (opt.key === result.correctAnswer) {
                            optStyle = 'border-emerald-500/40 bg-emerald-500/10';
                        } else if (isSelected && !result.isCorrect) {
                            optStyle = 'border-red-500/40 bg-red-500/10';
                        }
                    } else if (isSelected) {
                        optStyle = 'border-blue-500/40 bg-blue-500/10';
                    }

                    return (
                        <button
                            key={opt.key}
                            onClick={() => !submitted && setSelectedAnswer(opt.key)}
                            disabled={submitted}
                            className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-start gap-3 group ${optStyle} ${submitted ? 'cursor-default' : 'cursor-pointer'}`}
                        >
                            <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 border transition-all ${submitted && !result?.skipped && opt.key === result?.correctAnswer
                                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                                    : submitted && !result?.skipped && isSelected && !result?.isCorrect
                                        ? 'bg-red-500/20 border-red-500/40 text-red-400'
                                        : isSelected
                                            ? 'bg-blue-500/20 border-blue-500/40 text-blue-400'
                                            : 'bg-white/5 border-white/10 text-zinc-500 group-hover:text-white group-hover:border-white/20'
                                }`}>
                                {opt.key}
                            </span>
                            <span className={`text-sm leading-relaxed ${submitted && !result?.skipped && opt.key === result?.correctAnswer ? 'text-emerald-300' :
                                    submitted && !result?.skipped && isSelected && !result?.isCorrect ? 'text-red-300' :
                                        isSelected ? 'text-blue-300' : 'text-zinc-300'
                                }`}>
                                {opt.text}
                            </span>

                            {submitted && !result?.skipped && opt.key === result?.correctAnswer && (
                                <CheckCircle2 size={18} className="text-emerald-400 ml-auto shrink-0 mt-0.5" />
                            )}
                            {submitted && !result?.skipped && isSelected && !result?.isCorrect && (
                                <XCircle size={18} className="text-red-400 ml-auto shrink-0 mt-0.5" />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Result + Explanation */}
            <AnimatePresence>
                {submitted && result && !result.skipped && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        <div className={`mx-5 sm:mx-6 mb-3 p-4 rounded-xl border ${result.isCorrect
                                ? 'border-emerald-500/20 bg-emerald-500/5'
                                : 'border-red-500/20 bg-red-500/5'
                            }`}>
                            <div className="flex items-center gap-2 mb-1">
                                {result.isCorrect
                                    ? <CheckCircle2 size={16} className="text-emerald-400" />
                                    : <XCircle size={16} className="text-red-400" />
                                }
                                <span className={`text-sm font-bold ${result.isCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {result.isCorrect ? 'Correct! 🎉' : 'Incorrect'}
                                </span>
                            </div>
                            {!result.isCorrect && (
                                <p className="text-xs text-zinc-400 mt-1">
                                    The correct answer is <span className="text-emerald-400 font-bold">{result.correctAnswer}</span>
                                </p>
                            )}
                        </div>

                        {(result.explanation || result.formulaHint) && (
                            <div className="mx-5 sm:mx-6 mb-5">
                                <button
                                    onClick={() => setShowExplanation(!showExplanation)}
                                    className="flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 font-semibold mb-2 transition-colors"
                                >
                                    <Lightbulb size={12} />
                                    {showExplanation ? 'Hide Explanation' : 'Show Explanation'}
                                    <ChevronDown size={12} className={`transition-transform ${showExplanation ? 'rotate-180' : ''}`} />
                                </button>
                                <AnimatePresence>
                                    {showExplanation && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden"
                                        >
                                            {result.formulaHint && (
                                                <div className="p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/15 mb-2">
                                                    <p className="text-xs text-yellow-300 font-medium">💡 {result.formulaHint}</p>
                                                </div>
                                            )}
                                            {result.explanation && (
                                                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                                                    <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">{result.explanation}</p>
                                                </div>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}
                    </motion.div>
                )}
                {submitted && result && result.skipped && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        <div className="mx-5 sm:mx-6 mb-3 p-4 rounded-xl border border-zinc-500/20 bg-zinc-500/5">
                            <div className="flex items-center gap-2 mb-1">
                                <SkipForward size={16} className="text-zinc-400" />
                                <span className="text-sm font-bold text-zinc-400">
                                    Skipped
                                </span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Action buttons */}
            <div className="p-5 sm:p-6 border-t border-white/[0.05] flex items-center gap-3">
                {!submitted && (
                    <>
                        <button
                            onClick={handleSkip}
                            disabled={submitting}
                            className="px-4 py-2.5 rounded-xl text-sm font-medium text-zinc-400 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white transition-all flex items-center gap-2"
                        >
                            <SkipForward size={14} /> Skip
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={!selectedAnswer || submitting}
                            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${selectedAnswer
                                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20'
                                    : 'bg-white/5 text-zinc-600 cursor-not-allowed border border-white/10'
                                }`}
                        >
                            {submitting ? <Loader2 size={16} className="animate-spin" /> : <Target size={14} />}
                            {submitting ? 'Checking...' : 'Submit Answer'}
                        </button>
                    </>
                )}
            </div>
        </motion.div>
    );
};

const CompanyPractice = () => {
    const { company, section, topic } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();

    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ totalQuestions: 0, totalAnswered: 0, totalRemaining: 0, progressPercent: 0 });
    const [sessionStats, setSessionStats] = useState({ correct: 0, wrong: 0, skipped: 0 });
    const [error, setError] = useState(null);

    const fetchQuestions = useCallback(async () => {
        if (!currentUser) return;
        setLoading(true);
        setError(null);
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
            });
        } catch (err) {
            console.error('Fetch error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [currentUser, company, section, topic]);

    useEffect(() => {
        fetchQuestions();
    }, [fetchQuestions]);

    const topicDisplay = topic
        .split('-')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');

    const sectionDisplay = section.charAt(0).toUpperCase() + section.slice(1);

    // Loading state
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

    // Error state
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

    // No questions
    if (questions.length === 0) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center space-y-6 max-w-md"
                >
                    <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto">
                        <Trophy size={36} className="text-emerald-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-white mb-2">All Done! 🎉</h2>
                        <p className="text-zinc-400 text-sm">You've completed all available questions for <span className="text-white font-semibold">{topicDisplay}</span>.</p>
                    </div>
                    {sessionStats.correct + sessionStats.wrong > 0 && (
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
                    <button
                        onClick={() => navigate(`/companies/${company}`)}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 border border-white/15 rounded-2xl text-white text-sm font-semibold hover:bg-white/15 transition-all"
                    >
                        <ArrowLeft size={14} /> Back to {company.toUpperCase()}
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] pt-12 pb-20 px-4 sm:px-6 lg:px-8 selection:bg-purple-500/30">
            {/* Ambient glows */}
            <div className="fixed top-20 left-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-[128px] pointer-events-none hidden sm:block" />
            <div className="fixed bottom-20 right-1/4 w-96 h-96 bg-purple-600/5 rounded-full blur-[128px] pointer-events-none hidden sm:block" />

            <motion.div
                className="max-w-3xl mx-auto relative z-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={() => navigate(`/companies/${company}`)}
                        className="flex items-center gap-2 text-zinc-400 hover:text-white transition-all group bg-white/5 px-4 py-2 rounded-full border border-white/10 hover:border-white/20 text-sm font-medium"
                    >
                        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                        Back
                    </button>
                    <div className="text-right">
                        <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">{company.toUpperCase()} · {sectionDisplay}</p>
                        <p className="text-white font-bold text-sm">{topicDisplay}</p>
                    </div>
                </div>

                {/* Progress bar */}
                <div className="mb-6 p-4 rounded-2xl border border-white/[0.07] bg-white/[0.02]">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-zinc-500 font-medium">Overall Progress</span>
                        <span className="text-xs text-zinc-400 font-bold">{stats.totalAnswered}/{stats.totalQuestions}</span>
                    </div>
                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${stats.progressPercent}%` }}
                            transition={{ duration: 0.8 }}
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                        />
                    </div>
                    <div className="flex items-center gap-4 mt-3">
                        <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                            <CheckCircle2 size={12} /> {sessionStats.correct} correct
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-red-400">
                            <XCircle size={12} /> {sessionStats.wrong} wrong
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                            <SkipForward size={12} /> {sessionStats.skipped} skipped
                        </div>
                    </div>
                </div>

                {/* Question Cards */}
                <div className="space-y-6">
                    {questions.map((q, i) => (
                        <QuestionCard
                            key={q._id}
                            question={q}
                            index={i}
                            company={company}
                            section={section}
                            currentUser={currentUser}
                            onSessionStatsUpdate={(type) => {
                                setSessionStats(prev => ({
                                    ...prev,
                                    [type]: prev[type] + 1
                                }));
                            }}
                        />
                    ))}
                </div>

                <div className="mt-8 mb-12 flex justify-center">
                    <button
                        onClick={fetchQuestions}
                        disabled={loading}
                        className="px-6 py-3 rounded-xl text-sm font-bold bg-white/10 hover:bg-white/15 text-white border border-white/10 transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : 'Load More Questions'}
                        {!loading && <ArrowRight size={14} />}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default CompanyPractice;
