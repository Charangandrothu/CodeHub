import React from 'react';
import { motion } from 'framer-motion';

const LoginSuccessScreen = () => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0a0a0a]/90 backdrop-blur-3xl overflow-hidden"
        >
            {/* Dark Glassmorphism Container */}
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative bg-black/60 border border-white/5 p-8 rounded-3xl shadow-2xl backdrop-blur-md max-w-sm w-full mx-4 flex flex-col items-center ring-1 ring-white/10"
            >
                {/* Soft inner glow */}
                <div className="absolute inset-0 rounded-3xl shadow-[inset_0_0_20px_rgba(255,255,255,0.02)] pointer-events-none" />

                {/* Success Icon */}
                <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{
                        type: "spring",
                        stiffness: 260,
                        damping: 20,
                        delay: 0.2
                    }}
                    className="w-16 h-16 bg-gradient-to-tr from-green-400 to-emerald-600 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.4)] mb-6"
                >
                    <motion.svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-8 h-8 text-white"
                    >
                        <motion.path
                            d="M20 6L9 17l-5-5"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 1 }}
                            transition={{ delay: 0.5, duration: 0.4, ease: "easeOut" }}
                        />
                    </motion.svg>
                </motion.div>

                {/* Headings */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-center space-y-2"
                >
                    <h1 className="text-2xl font-bold text-white tracking-tight">
                        You're In <span className="inline-block animate-bounce text-xl">🚀</span>
                    </h1>
                    <p className="text-sm text-gray-400 font-medium">
                        Authentication successful.
                    </p>
                </motion.div>

                {/* Redirecting Indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-8 flex items-center gap-2 bg-white/5 py-1.5 px-3 rounded-full border border-white/5"
                >
                    <div className="flex gap-1">
                        {[0, 1, 2].map((i) => (
                            <motion.div
                                key={i}
                                className="w-1 h-1 bg-emerald-500 rounded-full"
                                animate={{
                                    scale: [1, 1.5, 1],
                                    opacity: [0.4, 1, 0.4]
                                }}
                                transition={{
                                    duration: 1,
                                    repeat: Infinity,
                                    delay: i * 0.2,
                                    ease: "easeInOut"
                                }}
                            />
                        ))}
                    </div>
                    <span className="text-[10px] uppercase tracking-widest text-gray-400 font-medium ml-1">
                        Redirecting
                    </span>
                </motion.div>
            </motion.div>
        </motion.div>
    );
};

export default LoginSuccessScreen;
