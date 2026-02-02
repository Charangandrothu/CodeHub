import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Code2, Server, Loader2 } from 'lucide-react';

const LoadingScreen = () => {
    const [showLongWaitMessage, setShowLongWaitMessage] = useState(false);

    useEffect(() => {
        // If loading takes more than 2.5 seconds, we assume the server is waking up
        const timer = setTimeout(() => {
            setShowLongWaitMessage(true);
        }, 2500);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="fixed inset-0 bg-[#0a0a0a] flex flex-col items-center justify-center z-[100] text-white p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center max-w-md text-center"
            >
                <div className="relative mb-8">
                    {/* Glow effect */}
                    <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full" />

                    <div className="relative bg-[#111] p-5 rounded-2xl border border-white/10 shadow-2xl z-10">
                        <Code2 className="w-10 h-10 text-blue-500" />
                    </div>

                    {/* Animated rings */}
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        className="absolute -inset-2 border border-blue-500/20 rounded-full border-t-blue-500/60 z-0"
                    />
                    <motion.div
                        animate={{ rotate: -360 }}
                        transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                        className="absolute -inset-4 border border-purple-500/10 rounded-full border-b-purple-500/40 z-0"
                    />
                </div>

                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-6">
                    CodeHub
                </h2>

                <div className="min-h-[60px] flex flex-col items-center justify-center w-full">
                    <AnimatePresence mode="wait">
                        {showLongWaitMessage ? (
                            <motion.div
                                key="long-wait"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="flex flex-col items-center gap-3"
                            >
                                <div className="flex items-center gap-2 text-amber-400 bg-amber-400/10 px-4 py-2 rounded-full border border-amber-400/20">
                                    <Server className="w-4 h-4 animate-pulse" />
                                    <span className="text-sm font-medium">Waking up server...</span>
                                </div>
                                <p className="text-xs text-gray-500 max-w-[250px] leading-relaxed">
                                    This may take up to 60 seconds as our backend services spin up from cold start.
                                </p>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="loading"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="flex items-center gap-2 text-gray-400"
                            >
                                <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                                <span className="text-sm">Initializing application...</span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};

export default LoadingScreen;
