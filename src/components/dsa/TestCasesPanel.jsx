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
        <div className="flex flex-col h-full bg-[#1A1A1A]">
            {/* Tabs for Cases */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2 shrink-0 custom-scrollbar px-1 pt-2">
                {testCases.map((_, i) => {
                    const result = testCaseResults ? testCaseResults[i] : null;
                    const isSelected = i === activeTestCase;

                    // Premium Color Logic
                    let statusClasses = "text-zinc-500 border-transparent hover:bg-zinc-800/50";
                    if (result) {
                        if (result.status === "Accepted") {
                            statusClasses = isSelected
                                ? "text-green-400 border-green-500/50 bg-green-500/10 shadow-[0_0_15px_rgba(74,222,128,0.15)]"
                                : "text-green-500/70 border-green-500/20 bg-green-500/5";
                        } else {
                            statusClasses = isSelected
                                ? "text-red-400 border-red-500/50 bg-red-500/10 shadow-[0_0_15px_rgba(248,113,113,0.15)]"
                                : "text-red-500/70 border-red-500/20 bg-red-500/5";
                        }
                    } else if (isSelected) {
                        statusClasses = "text-white border-white/20 bg-white/5 shadow-lg shadow-white/5";
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
                                    ? <div className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_8px_#4ade80]" />
                                    : <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]" />
                            )}
                            {isSelected && (
                                <motion.div
                                    layoutId="activeTestCaseParams"
                                    className="absolute inset-0 rounded-lg ring-1 ring-inset ring-white/10"
                                    initial={false}
                                />
                            )}
                        </motion.button>
                    );
                })}
            </div>

            {/* Results / Input Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-5 px-1 pb-2">
                <AnimatePresence mode="wait">
                    {testCaseResults && testCaseResults[activeTestCase] ? (
                        <motion.div
                            key={`result-${activeTestCase}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-6"
                        >
                            {/* Verdict Badge */}
                            <div className={`p-4 rounded-xl border flex items-center gap-4 relative overflow-hidden group ${testCaseResults[activeTestCase].status === "Accepted"
                                    ? "bg-gradient-to-r from-green-500/10 to-green-900/10 border-green-500/20 text-green-400"
                                    : "bg-gradient-to-r from-red-500/10 to-red-900/10 border-red-500/20 text-red-400"
                                }`}>
                                {/* Glow Effect */}
                                <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl opacity-20 -mr-10 -mt-10 ${testCaseResults[activeTestCase].status === "Accepted" ? "bg-green-400" : "bg-red-500"
                                    }`} />

                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${testCaseResults[activeTestCase].status === "Accepted" ? "bg-green-500/20" : "bg-red-500/20"
                                    }`}>
                                    {testCaseResults[activeTestCase].status === "Accepted"
                                        ? <CheckCircle2 size={20} className="drop-shadow-[0_0_5px_rgba(74,222,128,0.5)]" />
                                        : <AlertCircle size={20} className="drop-shadow-[0_0_5px_rgba(239,68,68,0.5)]" />
                                    }
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold tracking-tight">{testCaseResults[activeTestCase].status}</h4>
                                    <p className="text-[10px] opacity-70 mt-0.5 font-medium uppercase tracking-wider">
                                        {testCaseResults[activeTestCase].status === "Accepted" ? "Correct Answer" : "Incorrect Answer"}
                                    </p>
                                </div>
                            </div>

                            {/* Runtime Error Message */}
                            {testCaseResults[activeTestCase].error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="bg-red-500/5 border border-red-500/20 rounded-xl p-4"
                                >
                                    <div className="text-[10px] text-red-400 font-bold mb-2 uppercase tracking-wider flex items-center gap-2">
                                        <AlertCircle size={12} />
                                        Error Logs
                                    </div>
                                    <pre className="text-red-300 text-xs font-mono whitespace-pre-wrap leading-relaxed opacity-90">{testCaseResults[activeTestCase].error}</pre>
                                </motion.div>
                            )}

                            {/* Input Section */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider pl-1">Input</label>
                                <div className="group relative">
                                    <div className="absolute inset-0 bg-gradient-to-r from-zinc-800 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl pointer-events-none" />
                                    <pre className="bg-[#0a0a0a] rounded-xl p-4 text-[11px] font-mono text-zinc-300 border border-zinc-800/50 whitespace-pre-wrap transition-colors group-hover:border-zinc-700/50 shadow-inner">
                                        {testCaseResults[activeTestCase].input}
                                    </pre>
                                </div>
                            </div>

                            {/* Split View for Output */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider pl-1">Your Output</label>
                                    <div className="relative group">
                                        <pre className={`bg-[#0a0a0a] rounded-xl p-4 text-[11px] font-mono border min-h-[3rem] whitespace-pre-wrap transition-all shadow-inner ${testCaseResults[activeTestCase].status === "Accepted" || !testCaseResults[activeTestCase].actual
                                                ? "text-zinc-300 border-zinc-800/50"
                                                : "text-red-400 border-red-500/20 bg-red-900/5"
                                            }`}>
                                            {testCaseResults[activeTestCase].actual || (testCaseResults[activeTestCase].error ? <span className="text-zinc-600 italic">No Output</span> : "")}
                                        </pre>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider pl-1">Expected Output</label>
                                    <pre className="bg-[#0a0a0a] rounded-xl p-4 text-[11px] font-mono text-green-400 border border-zinc-800/50 whitespace-pre-wrap shadow-inner">
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
                            className="space-y-6"
                        >
                            {runStatus === 'running' ? (
                                <div className="h-40 flex flex-col items-center justify-center space-y-4 opacity-50">
                                    <div className="relative">
                                        <div className="w-12 h-12 border-4 border-zinc-800 border-t-green-500 rounded-full animate-spin" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Code2 size={16} className="text-green-500 animate-pulse" />
                                        </div>
                                    </div>
                                    <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider animate-pulse">Running Code...</p>
                                </div>
                            ) : (
                                <>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider pl-1">Input</label>
                                        <pre className="bg-[#0a0a0a] rounded-xl p-4 text-[11px] font-mono text-zinc-300 border border-zinc-800/50 whitespace-pre-wrap shadow-inner">
                                            {testCases[activeTestCase]?.input || ""}
                                        </pre>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider pl-1">Expected Output</label>
                                        <pre className="bg-[#0a0a0a] rounded-xl p-4 text-[11px] font-mono text-green-400 border border-zinc-800/50 whitespace-pre-wrap shadow-inner">
                                            {testCases[activeTestCase]?.output || ""}
                                        </pre>
                                    </div>
                                    <div className="pt-10 flex flex-col items-center justify-center text-zinc-700 space-y-3">
                                        <motion.div
                                            whileHover={{ scale: 1.1, rotate: 10 }}
                                            className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 shadow-xl"
                                        >
                                            <Code2 size={24} className="text-zinc-600" />
                                        </motion.div>
                                        <p className="text-xs font-bold uppercase tracking-widest opacity-60">Ready to Compile</p>
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
