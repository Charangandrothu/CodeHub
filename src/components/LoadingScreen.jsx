import React from 'react';
import { motion } from 'framer-motion';

const LoadingScreen = () => {
    // Memoize random values or just plain static array for symbols since we don't need re-renders
    const floatingSymbols = React.useMemo(() => {
        return [...Array(10)].map((_, i) => ({
            id: i,
            icon: ['{', '}', '</>', '01', '//', ';;', '()', '[]'][i % 8],
            initialX: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
            initialY: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
            duration: Math.random() * 8 + 8, // Slower duration for minimal feel
            delay: Math.random() * 2
        }));
    }, []);

    const text = "CodeHub";

    return (
        <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#050505] overflow-hidden"
        >
            {/* Background Texture */}
            <div className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(circle at 50% 50%, #1a1a1a 1px, transparent 1px)',
                    backgroundSize: '24px 24px'
                }}
            />

            {/* Subtle Floating Symbols */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {floatingSymbols.map((symbol) => (
                    <motion.div
                        key={symbol.id}
                        className="absolute text-white/5 font-mono text-xl font-bold"
                        initial={{
                            x: symbol.initialX,
                            y: symbol.initialY,
                            opacity: 0
                        }}
                        animate={{
                            y: [symbol.initialY, symbol.initialY - 50],
                            opacity: [0, 0.1, 0] // Lower opacity for subtleness
                        }}
                        transition={{
                            duration: symbol.duration,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: symbol.delay
                        }}
                    >
                        {symbol.icon}
                    </motion.div>
                ))}
            </div>

            {/* Main Content */}
            <div className="relative z-10 flex flex-col items-center">
                {/* Logo & Brand */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    className="flex flex-col items-center mb-10"
                >
                    <div className="flex items-center gap-1 mb-4">
                        {/* Logo Icon */}
                        <motion.div
                            animate={{
                                scale: [1, 1.05, 1],
                                opacity: [0.8, 1, 0.8]
                            }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                            className="relative"
                        >
                            <img src="/logopng111.png" alt="CodeHub Logo" className="w-16 h-16 md:w-20 md:h-20 object-contain drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                        </motion.div>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white flex items-center">
                        {text.split('').map((char, i) => (
                            <motion.span
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 + 0.2, duration: 0.5 }}
                            >
                                {char}
                            </motion.span>
                        ))}
                        <motion.span
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.6, duration: 0.5 }}
                            className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 ml-0.5 drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                        >
                            X
                        </motion.span>
                    </h1>
                </motion.div>

                {/* Minimal Loading Indicator */}
                <div className="flex flex-col items-center gap-4">
                    <div className="flex gap-1.5">
                        {[0, 1, 2].map((i) => (
                            <motion.div
                                key={i}
                                className="w-1.5 h-1.5 bg-blue-500 rounded-full"
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

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.6 }}
                        transition={{ delay: 0.5 }}
                        className="text-[10px] uppercase tracking-[0.3em] text-white font-medium"
                    >
                        Loading
                    </motion.p>
                </div>
            </div>
        </motion.div>
    );
};

export default LoadingScreen;
