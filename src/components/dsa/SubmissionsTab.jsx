import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckCircle2, XCircle, AlertCircle, Clock, Database,
    ListChecks, Lock, Check, X, ChevronRight, History, Zap
} from 'lucide-react';

const isAccepted = (v) => ['Accepted', 'Passed'].includes(v);

const LANG_LABELS = { python: 'Python', javascript: 'JavaScript', java: 'Java', cpp: 'C++' };

const verdictMeta = (verdict) => {
    if (isAccepted(verdict))            return { color: 'emerald', sub: 'Solution meets all constraints' };
    if (verdict === 'Wrong Answer')     return { color: 'red',     sub: 'Failed on hidden test cases' };
    if (verdict === 'Compilation Error')return { color: 'red',     sub: 'Code failed to compile' };
    if (verdict === 'Time Limit Exceeded') return { color: 'amber', sub: 'Execution exceeded the time limit' };
    return                                     { color: 'red',     sub: 'Runtime error during execution' };
};

const colorMap = {
    emerald: { text: 'text-emerald-400', bg: 'bg-emerald-500/[0.06]', border: 'border-emerald-500/20', icon: 'bg-emerald-500/20', bar: 'bg-emerald-500', pill: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    red:     { text: 'text-red-400',     bg: 'bg-red-500/[0.06]',     border: 'border-red-500/20',     icon: 'bg-red-500/20',     bar: 'bg-red-500',     pill: 'bg-red-500/10 text-red-400 border-red-500/20' },
    amber:   { text: 'text-amber-400',   bg: 'bg-amber-500/[0.06]',   border: 'border-amber-500/20',   icon: 'bg-amber-500/20',   bar: 'bg-amber-500',   pill: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
};

export default function SubmissionsTab({ submissionResult, runStatus, userData, language, onLoadCode }) {
    const [expandedRow, setExpandedRow] = useState(false);

    /* ─── Loading ─────────────────────────────────────────────────── */
    if (runStatus === 'submitting') {
        return (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 gap-5">
                <div className="relative">
                    <div className="w-12 h-12 border-[3px] border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Zap size={14} className="text-emerald-500" />
                    </div>
                </div>
                <div>
                    <p className="text-sm font-semibold text-white">Evaluating Submission</p>
                    <p className="text-xs text-zinc-500 mt-1">Running against hidden test cases…</p>
                </div>
            </div>
        );
    }

    /* ─── Queued flash ────────────────────────────────────────────── */
    if (submissionResult?.verdict === 'Queued') {
        return (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 gap-4">
                <div className="w-10 h-10 border-[3px] border-zinc-700 border-t-zinc-400 rounded-full animate-spin" />
                <p className="text-sm text-zinc-400">Processing…</p>
            </div>
        );
    }

    /* ─── Empty state ─────────────────────────────────────────────── */
    if (!submissionResult || submissionResult.type !== 'submit') {
        return (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 gap-3">
                <History size={28} className="text-zinc-700" />
                <p className="text-sm font-medium text-zinc-500">No submission yet</p>
                <p className="text-xs text-zinc-600">Submit your code to see results here</p>
            </div>
        );
    }

    const verdict = submissionResult.verdict;
    const accepted = isAccepted(verdict);
    const { color, sub } = verdictMeta(verdict);
    const c = colorMap[color] || colorMap.red;
    const passed = submissionResult.passedTestCases ?? (accepted ? submissionResult.totalTestCases ?? 0 : 0);
    const total  = submissionResult.totalTestCases ?? 0;
    const progress = total > 0 ? Math.round((passed / total) * 100) : (accepted ? 100 : 0);

    /* Breakdown rows */
    const breakdown = [
        { label: 'Compilation',  desc: 'Code parsed and compiled without errors', status: verdict === 'Compilation Error' ? 'fail' : 'pass' },
        { label: 'Sample Tests', desc: 'Visible example test cases',              status: ['Runtime Error','Compilation Error','Time Limit Exceeded'].includes(verdict) ? 'fail' : 'pass' },
        { label: 'Hidden Tests', desc: 'Full judge hidden test suite',             status: accepted ? 'pass' : 'fail' },
    ];

    return (
        <div className="flex flex-col gap-4 p-1">

            {/* ── 1. VERDICT CARD ──────────────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.26, ease: [0.25, 0.46, 0.45, 0.94] }}
                className={`rounded-2xl border p-5 ${c.bg} ${c.border}`}
                style={{ backdropFilter: 'blur(14px)' }}
            >
                <div className="flex items-start gap-5">
                    {/* LEFT — Verdict (60%) */}
                    <div className="flex-[6] min-w-0">
                        <div className="flex items-start gap-3">
                            <motion.div
                                initial={{ scale: 0.4, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${c.icon}`}
                            >
                                {accepted
                                    ? <Check size={15} strokeWidth={2.5} className={c.text} />
                                    : verdict === 'Wrong Answer'
                                        ? <X size={15} strokeWidth={2.5} className={c.text} />
                                        : verdict === 'Time Limit Exceeded'
                                            ? <Clock size={13} className={c.text} />
                                            : <AlertCircle size={14} className={c.text} />
                                }
                            </motion.div>
                            <div>
                                <p className={`text-[17px] font-semibold leading-tight ${c.text}`}>{verdict}</p>
                                <p className="text-[11px] text-zinc-500 mt-0.5">{sub}</p>
                            </div>
                        </div>

                        {/* Progress bar */}
                        <div className="mt-4">
                            <div className="flex items-center justify-between mb-1.5">
                                <span className="text-[9px] text-zinc-500 font-semibold uppercase tracking-wider">Progress</span>
                                <span className="text-[9px] font-mono text-zinc-500">{passed} / {total} test cases</span>
                            </div>
                            <div className="h-[3px] bg-white/[0.06] rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 0.9, ease: 'easeOut', delay: 0.15 }}
                                    className={`h-full rounded-full ${c.bar}`}
                                />
                            </div>
                        </div>
                    </div>

                    {/* RIGHT — Metrics (40%) */}
                    <div className="flex-[4] flex flex-col gap-2 items-stretch">
                        {[
                            { label: 'Runtime',  value: submissionResult.time   ? `${submissionResult.time}ms`   : '—', icon: Clock,      pro: true },
                            { label: 'Memory',   value: submissionResult.memory ? `${submissionResult.memory}MB` : '—', icon: Database,   pro: true },
                            { label: 'Tests',    value: `${passed}/${total}`,                                            icon: ListChecks, pro: false },
                        ].map(({ label, value, icon: IconComp, pro }) => (
                            <motion.div
                                key={label}
                                whileHover={{ scale: 1.02, boxShadow: '0 0 12px rgba(255,255,255,0.04)' }}
                                transition={{ duration: 0.15 }}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(14px)' }}
                            >
                                <IconComp size={11} className="text-zinc-500 flex-shrink-0" />
                                <span className="text-[9px] text-zinc-500 font-semibold uppercase tracking-wider w-10">{label}</span>
                                {pro && !userData?.isPro ? (
                                    <div className="flex items-center gap-1 ml-auto">
                                        <Lock size={9} className="text-amber-500" />
                                        <span className="text-[9px] text-amber-500 font-bold uppercase">Pro</span>
                                    </div>
                                ) : (
                                    <span className="text-xs font-semibold font-mono text-zinc-200 ml-auto">{value}</span>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* ── 2. EXECUTION BREAKDOWN ───────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.26, delay: 0.06, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="rounded-xl overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(14px)' }}
            >
                <div className="px-4 py-2 border-b border-white/[0.05]">
                    <p className="text-[9px] font-semibold text-zinc-500 uppercase tracking-wider">Execution Breakdown</p>
                </div>
                {breakdown.map((row, i) => (
                    <div
                        key={row.label}
                        title={row.desc}
                        className={`flex items-center justify-between px-4 py-2.5 hover:bg-white/[0.02] transition-colors ${i < breakdown.length - 1 ? 'border-b border-white/[0.04]' : ''}`}
                    >
                        <span className="text-xs text-zinc-400 font-medium">{row.label}</span>
                        <div className="flex items-center gap-1.5">
                            {row.status === 'pass' ? (
                                <>
                                    <Check size={10} strokeWidth={2.5} className="text-emerald-500" />
                                    <span className="text-[10px] font-semibold text-emerald-500">Passed</span>
                                </>
                            ) : (
                                <>
                                    <X size={10} strokeWidth={2.5} className="text-red-500" />
                                    <span className="text-[10px] font-semibold text-red-500">Failed</span>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </motion.div>

            {/* ── 3. FAILED TEST CASE ──────────────────────────────────────── */}
            {!accepted && submissionResult.failedTestCase && (
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.26, delay: 0.09 }}
                    className="rounded-xl overflow-hidden"
                    style={{ border: '1px solid rgba(239,68,68,0.18)', background: 'rgba(239,68,68,0.03)' }}
                >
                    <div className="px-4 py-2 border-b border-red-500/10 flex items-center gap-2">
                        <AlertCircle size={11} className="text-red-400" />
                        <p className="text-[9px] font-semibold text-red-400 uppercase tracking-wider">Failed Input</p>
                    </div>
                    <div className="p-4 space-y-3">
                        <div>
                            <p className="text-[9px] text-zinc-500 font-semibold uppercase tracking-wider mb-1.5">Input</p>
                            <pre className="bg-black/25 border border-white/5 rounded-lg px-3 py-2 text-xs font-mono text-zinc-300 whitespace-pre-wrap">{submissionResult.failedTestCase.input}</pre>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <p className="text-[9px] text-zinc-500 font-semibold uppercase tracking-wider mb-1.5">Expected</p>
                                <pre className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg px-3 py-2 text-xs font-mono text-emerald-400 whitespace-pre-wrap">{submissionResult.failedTestCase.expected}</pre>
                            </div>
                            <div>
                                <p className="text-[9px] text-zinc-500 font-semibold uppercase tracking-wider mb-1.5">Actual</p>
                                <pre className="bg-red-500/5 border border-red-500/20 rounded-lg px-3 py-2 text-xs font-mono text-red-400 whitespace-pre-wrap">{submissionResult.failedTestCase.actual}</pre>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Error log (compilation / runtime, no failedTestCase) */}
            {!accepted && submissionResult.error && !submissionResult.failedTestCase && verdict !== 'Restricted' && (
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.26, delay: 0.09 }}
                    className="rounded-xl overflow-hidden"
                    style={{ border: '1px solid rgba(239,68,68,0.18)', background: 'rgba(239,68,68,0.03)' }}
                >
                    <div className="px-4 py-2 border-b border-red-500/10">
                        <p className="text-[9px] font-semibold text-red-400 uppercase tracking-wider">Error Log</p>
                    </div>
                    <pre className="p-4 text-xs font-mono text-red-400 whitespace-pre-wrap overflow-x-auto">{submissionResult.error}</pre>
                </motion.div>
            )}

            {/* Restricted (Pro locked) */}
            {verdict === 'Restricted' && (
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.26, delay: 0.09 }}
                    className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-6 flex flex-col items-center text-center gap-3"
                >
                    <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center">
                        <Lock size={22} className="text-amber-500" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-white mb-1">Pro Subscription Required</p>
                        <p className="text-xs text-zinc-400">{submissionResult.details || 'Submissions are locked for free users.'}</p>
                    </div>
                </motion.div>
            )}

            {/* ── 4. SUBMISSION HISTORY TABLE ──────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.26, delay: 0.13, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="rounded-xl overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(14px)' }}
            >
                {/* Header */}
                <div className="px-4 py-2 border-b border-white/[0.05] flex items-center gap-1.5">
                    <History size={10} className="text-zinc-500" />
                    <p className="text-[9px] font-semibold text-zinc-500 uppercase tracking-wider">Submission History</p>
                </div>

                {/* Column headers */}
                <div className="grid items-center px-4 py-1.5 border-b border-white/[0.04]"
                    style={{ gridTemplateColumns: '1.8fr 0.7fr 0.7fr 0.7fr 1.4fr 16px' }}>
                    {['Status', 'Language', 'Runtime', 'Memory', 'Submitted', ''].map(h => (
                        <span key={h} className="text-[8px] font-semibold text-zinc-600 uppercase tracking-wider">{h}</span>
                    ))}
                </div>

                {/* Row */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="grid items-center px-4 py-2.5 hover:bg-white/[0.025] transition-colors cursor-pointer group"
                    style={{ gridTemplateColumns: '1.8fr 0.7fr 0.7fr 0.7fr 1.4fr 16px' }}
                    onClick={() => setExpandedRow(v => !v)}
                >
                    {/* Status pill */}
                    <div>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold border ${c.pill}`}>
                            {accepted ? <Check size={7} strokeWidth={3}/> : <X size={7} strokeWidth={3}/>}
                            {verdict}
                        </span>
                    </div>
                    {/* Language */}
                    <span className="text-[10px] font-mono text-zinc-400">{LANG_LABELS[language] ?? language ?? '—'}</span>
                    {/* Runtime */}
                    <span className="text-[10px] font-mono text-zinc-400">
                        {!userData?.isPro ? <span className="text-amber-600/70 text-[9px] font-semibold">Pro</span> : `${submissionResult.time}ms`}
                    </span>
                    {/* Memory */}
                    <span className="text-[10px] font-mono text-zinc-400">
                        {!userData?.isPro ? <span className="text-amber-600/70 text-[9px] font-semibold">Pro</span> : `${submissionResult.memory}MB`}
                    </span>
                    {/* Submitted */}
                    <span className="text-[10px] text-zinc-500 truncate">
                        {submissionResult.submittedAt
                            ? new Date(submissionResult.submittedAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                            : 'Just now'}
                    </span>
                    {/* Expand chevron */}
                    <ChevronRight size={11} className={`text-zinc-600 group-hover:text-zinc-400 transition-transform duration-200 ${expandedRow ? 'rotate-90' : ''}`} />
                </motion.div>

                {/* Expanded code view */}
                <AnimatePresence initial={false}>
                    {expandedRow && (
                        <motion.div
                            key="expand"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2, ease: 'easeInOut' }}
                            className="overflow-hidden border-t border-white/[0.04]"
                        >
                            <div className="px-4 py-3 space-y-2">
                                <div className="flex items-center justify-between">
                                    <p className="text-[9px] font-semibold text-zinc-500 uppercase tracking-wider">Submitted Code</p>
                                    {submissionResult.code && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onLoadCode?.(submissionResult.code); }}
                                            className="text-[9px] text-emerald-500 hover:text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/20 transition-colors"
                                        >
                                            Load into editor ↑
                                        </button>
                                    )}
                                </div>
                                {submissionResult.code ? (
                                    <pre className="bg-black/25 border border-white/5 rounded-lg p-3 text-[10px] font-mono text-zinc-300 whitespace-pre-wrap overflow-x-auto max-h-52 custom-scrollbar">
                                        {submissionResult.code}
                                    </pre>
                                ) : (
                                    <p className="text-xs text-zinc-600 italic">No code available</p>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
