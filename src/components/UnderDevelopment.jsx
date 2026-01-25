import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Rocket, Construction, Sparkles } from 'lucide-react';

const UnderDevelopment = ({ title = "Coming Soon", description = "We are working hard to bring you this feature. Stay tuned!" }) => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-[#0a0a0a] pt-20">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 container mx-auto px-4 text-center">
                {/* Animated Icon */}
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, type: "spring" }}
                    className="relative inline-block mb-8"
                >
                    <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full blur-2xl opacity-30 animate-pulse" />
                    <div className="relative w-24 h-24 sm:w-32 sm:h-32 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl flex items-center justify-center shadow-2xl">
                        <Construction className="w-12 h-12 sm:w-16 sm:h-16 text-white/80" />

                        {/* Floating Elements */}
                        <motion.div
                            animate={{ y: [-5, 5, -5], rotate: [0, 5, -5, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute -top-4 -right-4 bg-blue-500 p-2 rounded-xl shadow-lg border border-white/20"
                        >
                            <Rocket className="w-5 h-5 text-white" />
                        </motion.div>

                        <motion.div
                            animate={{ y: [5, -5, 5], rotate: [0, -5, 5, 0] }}
                            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                            className="absolute -bottom-2 -left-4 bg-purple-500 p-2 rounded-xl shadow-lg border border-white/20"
                        >
                            <Sparkles className="w-5 h-5 text-white" />
                        </motion.div>
                    </div>
                </motion.div>

                {/* Text Content */}
                <motion.h1
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-4xl sm:text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-400 mb-6 tracking-tight"
                >
                    {title}
                </motion.h1>

                <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-lg text-gray-400 max-w-lg mx-auto mb-10 leading-relaxed"
                >
                    {description}
                </motion.p>

                {/* Buttons */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4"
                >
                    <button
                        onClick={() => navigate('/')}
                        className="group relative px-6 py-3 bg-white text-black font-semibold rounded-xl overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]"
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                            Back to Dashboard
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                </motion.div>
            </div>
        </div>
    );
};

export default UnderDevelopment;
