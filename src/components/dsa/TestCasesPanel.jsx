import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Code2 } from 'lucide-react';

const TestCasesPanel = ({
    testCases, // problem.examples
    activeTestCase,
    setActiveTestCase,
    testCaseResults,
    runStatus
}) => {

    if (!testCases || testCases.length === 0) {
        return (
            <div className="flex items-center justify-center h-full text-zinc-500 text-xs">
                No test cases available
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-transparent">
            {/* Tabs for Cases */}
            <div className="flex gap-2 mb-1 overflow-x-auto pb-1 shrink-0 custom-scrollbar px-1 pt-1">
                {testCases.map((_, i) => {
                    const result = testCaseResults ? testCaseResults[i] : null;
                    const isSelected = i === activeTestCase;

                    // Premium Color Logic - Visibility Restored
                    let statusClasses = "text-zinc-500 border-transparent hover:bg-white/5";
                    if (result) {
                        if (result.status === "Accepted") {
                            statusClasses = isSelected
                                ? "text-green-400 border-green-500/50 bg-green-500/10"
                                : "text-green-600/70 border-green-900/30 bg-green-900/10";
                        } else {
                            statusClasses = isSelected
                                ? "text-red-400 border-red-500/50 bg-red-500/10"
                                : "text-red-600/70 border-red-900/30 bg-red-900/10";
                        }
                    } else if (isSelected) {
                        statusClasses = "text-blue-400 border-blue-500/50 bg-blue-500/10";
                    }

                    return (
                        <motion.button
                            key={i}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setActiveTestCase(i)}
                            className={`relative flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all shrink-0 ${statusClasses}`}
                        >
                            <span>Case {i + 1}</span>
                            {result && (
                                result.status === "Accepted"
                                    ? <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)]" />
                                    : <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)]" />
                            )}
                            {isSelected && (
                                <motion.div
                                    layoutId="activeTestCaseParams"
                                    className={`absolute inset-0 rounded-lg ring-1 ring-inset ${result?.status === "Accepted" ? "ring-green-500/30" : result?.status ? "ring-red-500/30" : "ring-blue-500/30"}`}
                                    initial={false}
                                />
                            )}
                        </motion.button>
                    );
                })}
            </div>

            {/* Results / Input Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-1 pb-2">
                <AnimatePresence mode="wait">
                    {testCaseResults && testCaseResults[activeTestCase] ? (
                        <motion.div
                            key={`result-${activeTestCase}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-4"
                        >
                            {/* Verdict Badge - Visible Colors */}
                            <div className={`p-4 rounded-xl border flex items-center gap-4 relative overflow-hidden group ${testCaseResults[activeTestCase].status === "Accepted"
                                ? "bg-green-500/10 border-green-500/20 text-green-400"
                                : "bg-red-500/10 border-red-500/20 text-red-400"
                                }`}>

                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${testCaseResults[activeTestCase].status === "Accepted"
                                    ? "bg-green-500/20 border-green-500/30"
                                    : "bg-red-500/20 border-red-500/30"
                                    }`}>
                                    {testCaseResults[activeTestCase].status === "Accepted"
                                        ? <CheckCircle2 size={20} className="drop-shadow-sm" />
                                        : <AlertCircle size={20} className="drop-shadow-sm" />
                                    }
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-bold tracking-tight truncate">{testCaseResults[activeTestCase].status}</h4>
                                    <p className="text-[10px] opacity-80 mt-0.5 font-bold uppercase tracking-wider">
                                        {testCaseResults[activeTestCase].status === "Accepted" ? "Correct Answer" : "Incorrect Answer"}
                                    </p>
                                </div>
                            </div>

                            {/* Runtime Error Message */}
                            {testCaseResults[activeTestCase].error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="bg-red-500/5 border border-red-500/30 rounded-xl p-3"
                                >
                                    <div className="text-[10px] text-red-400 font-bold mb-2 uppercase tracking-wider flex items-center gap-2">
                                        <AlertCircle size={12} />
                                        Error Logs
                                    </div>
                                    <pre className="text-red-300 text-xs font-mono whitespace-pre-wrap leading-relaxed opacity-90">{testCaseResults[activeTestCase].error}</pre>
                                </motion.div>
                            )}

                            {/* Input Section */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider pl-1">Input</label>
                                <div className="group relative">
                                    <pre className="bg-[#0F1219] rounded-xl p-3 text-[11px] font-mono text-zinc-300 border border-white/10 whitespace-pre-wrap shadow-inner">
                                        {testCaseResults[activeTestCase].input}
                                    </pre>
                                </div>
                            </div>

                            {/* Split View for Output */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider pl-1">Your Output</label>
                                    <div className="relative group">
                                        <pre className={`bg-[#0F1219] rounded-xl p-3 text-[11px] font-mono border min-h-[3.5rem] whitespace-pre-wrap transition-all shadow-inner ${testCaseResults[activeTestCase].status === "Accepted" || !testCaseResults[activeTestCase].actual
                                            ? "text-zinc-300 border-white/10"
                                            : "text-red-400 border-red-500/30 bg-red-500/5"
                                            }`}>
                                            {testCaseResults[activeTestCase].actual || (testCaseResults[activeTestCase].error ? <span className="text-zinc-600 italic">No Output</span> : "")}
                                        </pre>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider pl-1">Expected Output</label>
                                    <pre className="bg-[#0F1219] rounded-xl p-3 text-[11px] font-mono text-green-400/90 border border-white/10 whitespace-pre-wrap shadow-inner">
                                        {testCaseResults[activeTestCase].expected}
                                    </pre>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        // No run results yet - Show standard view
                        <motion.div
                            key={`initial-${activeTestCase}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="space-y-4"
                        >
                            {runStatus === 'running' ? (
                                <div className="h-40 flex flex-col items-center justify-center space-y-4 opacity-50">
                                    <div className="relative">
                                        <div className="w-12 h-12 border-2 border-zinc-800 border-t-white rounded-full animate-spin" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Code2 size={16} className="text-white animate-pulse" />
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider animate-pulse">Running Code...</p>
                                </div>
                            ) : (
                                <>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider pl-1">Input</label>
                                        <pre className="bg-black/40 rounded-xl p-3 text-[11px] font-mono text-zinc-300 border border-white/5 whitespace-pre-wrap shadow-inner">
                                            {testCases[activeTestCase]?.input || ""}
                                        </pre>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider pl-1">Expected Output</label>
                                        <pre className="bg-black/40 rounded-xl p-3 text-[11px] font-mono text-zinc-400 border border-white/5 whitespace-pre-wrap shadow-inner">
                                            {testCases[activeTestCase]?.output || ""}
                                        </pre>
                                    </div>
                                </>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default TestCasesPanel;
