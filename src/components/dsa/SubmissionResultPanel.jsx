import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Terminal, XCircle, Clock, Database } from 'lucide-react';

const SubmissionResultPanel = ({ submissionResult, output }) => {
    if (!submissionResult) return null;

    // Handle Queued State
    if (submissionResult.verdict === "Queued") {
        return (
            <div className="h-full flex flex-col items-center justify-center gap-4 text-center p-8">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full"
                />
                <div>
                    <h3 className="text-lg font-bold text-white mb-1">Processing Submission...</h3>
                    <p className="text-sm text-zinc-500">Your code is being evaluated in the background.</p>
                </div>
            </div>
        );
    }

    const isSuccess = ['Accepted', 'Passed'].includes(submissionResult.verdict);
    const isError = ['Runtime Error', 'Compilation Error', 'Time Limit Exceeded'].includes(submissionResult.verdict);
    const isWrong = submissionResult.verdict === 'Wrong Answer';

    // Animation variants
    const container = {
        hidden: { opacity: 0, scale: 0.95 },
        show: {
            opacity: 1,
            scale: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="h-full flex flex-col gap-6 p-2"
        >
            {/* Hero Verdict Banner - Visible Colors */}
            <motion.div
                variants={item}
                className={`relative overflow-hidden rounded-2xl p-6 border ${isSuccess
                    ? 'bg-green-500/10 border-green-500/20'
                    : 'bg-red-500/10 border-red-500/20'
                    }`}
            >
                <div className="relative flex flex-col items-center justify-center text-center space-y-4 z-10">
                    <motion.div
                        initial={{ scale: 0, rotate: -45 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", bounce: 0.5, duration: 0.8 }}
                        className={`w-16 h-16 rounded-full flex items-center justify-center border ${isSuccess
                            ? 'bg-green-500/20 text-green-500 border-green-500/30'
                            : 'bg-red-500/20 text-red-500 border-red-500/30'
                            }`}
                    >
                        {isSuccess ? (
                            <CheckCircle2 size={32} strokeWidth={2.5} />
                        ) : (
                            isWrong ? <XCircle size={32} strokeWidth={2.5} />
                                : <AlertCircle size={32} strokeWidth={2.5} />
                        )}
                    </motion.div>

                    <div>
                        <h2 className={`text-2xl font-bold tracking-tight ${isSuccess ? 'text-green-500' : 'text-red-500'
                            }`}>
                            {submissionResult.verdict}
                        </h2>
                        <p className="text-zinc-400 text-sm font-medium mt-1">
                            {isSuccess
                                ? "All test cases passed."
                                : (isWrong ? "Failed on some test cases." : "Runtime Error.")}
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Error or Success Details */}
            <motion.div variants={item} className="space-y-4">
                {submissionResult.error ? (
                    <div className="space-y-2">
                        <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-2">
                            <AlertCircle size={12} />
                            Error Log
                        </h3>
                        <pre className="bg-red-500/5 border border-red-500/20 text-red-400 p-4 rounded-xl text-xs font-mono shadow-inner whitespace-pre-wrap overflow-x-auto">
                            {submissionResult.error}
                        </pre>
                    </div>
                ) : (
                    <>
                        {/* Stats Row */}
                        {(submissionResult.time || submissionResult.memory) && (
                            <div className="flex gap-4">
                                <div className="flex-1 bg-[#0F1219] border border-white/10 rounded-xl p-3 flex items-center gap-3">
                                    <div className="p-2 bg-white/5 rounded-lg text-zinc-400">
                                        <Clock size={16} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Runtime</p>
                                        <p className="text-sm font-mono text-zinc-300">{submissionResult.time} ms</p>
                                    </div>
                                </div>
                                <div className="flex-1 bg-[#0F1219] border border-white/10 rounded-xl p-3 flex items-center gap-3">
                                    <div className="p-2 bg-white/5 rounded-lg text-zinc-400">
                                        <Database size={16} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Memory</p>
                                        <p className="text-sm font-mono text-zinc-300">{submissionResult.memory} MB</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Only show details if they exist and aren't just redundant success messages */}
                        {submissionResult.details && (
                            <div className="space-y-2">
                                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                                    <Terminal size={12} />
                                    Execution Details
                                </h3>
                                <div className="relative group">
                                    <pre className={`font-mono text-xs p-4 rounded-xl border whitespace-pre-wrap overflow-x-auto custom-scrollbar relative bg-[#0F1219] shadow-inner ${isSuccess
                                        ? 'text-green-400/90 border-green-500/20'
                                        : 'text-red-400/90 border-red-500/20'
                                        }`}>
                                        {submissionResult.details}
                                    </pre>
                                </div>
                            </div>
                        )}

                        {/* Show Stdout if it exists and is different from details */}
                        {output && (!submissionResult.details || !submissionResult.details.includes(output)) && (
                            <div className="space-y-2">
                                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                                    <Terminal size={12} />
                                    Standard Output
                                </h3>
                                <pre className="bg-[#0F1219] border border-white/10 text-zinc-300 p-4 rounded-xl text-xs font-mono shadow-inner whitespace-pre-wrap overflow-x-auto">
                                    {output}
                                </pre>
                            </div>
                        )}
                    </>
                )}
            </motion.div>
        </motion.div>
    );
};

export default SubmissionResultPanel;
