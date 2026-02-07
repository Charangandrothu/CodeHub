import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Terminal, XCircle, Clock, Database } from 'lucide-react';

const SubmissionResultPanel = ({ submissionResult, output }) => {
    if (!submissionResult) return null;

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
            {/* Hero Verdict Banner */}
            <motion.div
                variants={item}
                className={`relative overflow-hidden rounded-2xl p-6 border ${isSuccess
                    ? 'bg-gradient-to-br from-green-500/10 via-green-500/5 to-transparent border-green-500/20'
                    : 'bg-gradient-to-br from-red-500/10 via-red-500/5 to-transparent border-red-500/20'
                    }`}
            >
                {/* Background Glow */}
                <div className={`absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl opacity-20 ${isSuccess ? 'bg-green-400' : 'bg-red-500'
                    }`} />

                <div className="relative flex flex-col items-center justify-center text-center space-y-4 z-10">
                    <motion.div
                        initial={{ scale: 0, rotate: -45 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", bounce: 0.5, duration: 0.8 }}
                        className={`w-20 h-20 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(0,0,0,0.3)] ${isSuccess
                            ? 'bg-green-500/10 text-green-400 border border-green-500/50 shadow-[0_0_20px_rgba(74,222,128,0.3)]'
                            : 'bg-red-500/10 text-red-500 border border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.3)]'
                            }`}
                    >
                        {isSuccess ? (
                            <CheckCircle2 size={40} strokeWidth={2.5} className="drop-shadow-[0_0_10px_rgba(74,222,128,0.8)]" />
                        ) : (
                            isWrong ? <XCircle size={40} strokeWidth={2.5} className="drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
                                : <AlertCircle size={40} strokeWidth={2.5} className="drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
                        )}
                    </motion.div>

                    <div>
                        <h2 className={`text-3xl font-bold tracking-tight ${isSuccess ? 'text-green-400 drop-shadow-[0_0_10px_rgba(74,222,128,0.3)]' : 'text-red-400 drop-shadow-[0_0_10px_rgba(239,68,68,0.3)]'
                            }`}>
                            {submissionResult.verdict}
                        </h2>
                        <p className="text-zinc-500 text-sm font-medium mt-2">
                            {isSuccess
                                ? "All test cases passed successfully!"
                                : (isWrong ? "Your code failed on some test cases." : "Verify your logic and try again.")}
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Details Section */}
            {(submissionResult.details || output) && (
                <motion.div variants={item} className="space-y-4 flex-1 overflow-visible">

                    {/* Only show details if they exist and aren't just redundant success messages */}
                    {submissionResult.details && (
                        <div className="space-y-2">
                            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                                <Terminal size={12} />
                                Execution Details
                            </h3>
                            <div className="relative group">
                                <div className="absolute inset-0 bg-gradient-to-r from-zinc-800 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl pointer-events-none" />
                                <pre className={`font-mono text-xs p-4 rounded-xl border whitespace-pre-wrap overflow-x-auto custom-scrollbar relative bg-[#0a0a0a] shadow-inner ${isSuccess
                                    ? 'text-green-300/90 border-green-500/20'
                                    : 'text-red-300/90 border-red-500/20'
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
                            <pre className="bg-[#0a0a0a] border border-zinc-800/50 text-zinc-300 p-4 rounded-xl text-xs font-mono shadow-inner whitespace-pre-wrap overflow-x-auto">
                                {output}
                            </pre>
                        </div>
                    )}
                </motion.div>
            )}

        </motion.div>
    );
};

export default SubmissionResultPanel;
