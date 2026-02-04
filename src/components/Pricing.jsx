import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Check, X, Zap, Crown, Sparkles, Box, Rocket } from 'lucide-react';
import SubscriptionButton from './SubscriptionButton';

const Pricing = () => {
    // Pricing data
    const features = [
        { name: "DSA Problem Library", free: "Basic (Easy)", pro: "Full Access (Easy → Hard)" },
        { name: "Daily Submissions", free: "Limited (5/day)", pro: "Unlimited ⚡" },
        { name: "Code Editor", free: "Basic Features", pro: "Advanced + AI Hints 🤖" },
        { name: "Test Cases", free: "Sample Only", pro: "Hidden & Edge Cases 🧪" },
        { name: "Mock Tests", free: <X size={18} className="text-gray-600" />, pro: "Full Company Sets 📝" },
        { name: "Contest Participation", free: <X size={18} className="text-gray-600" />, pro: "Weekly Live Contests 🏆" },
        { name: "Aptitude & Reasoning", free: <X size={18} className="text-gray-600" />, pro: "Theory + Practice 📐" },
        { name: "Analytics", free: "Basic Stats", pro: "Interview Readiness Score 📊" },
        { name: "Company Tags", free: <X size={18} className="text-gray-600" />, pro: "Access All Tags 💼" },
    ];

    const [isYearly, setIsYearly] = useState(false);
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const handleGetStarted = () => {
        if (currentUser) {
            navigate('/dashboard');
        } else {
            navigate('/login');
        }
    };

    return (
        <section id="pricing" className="relative min-h-screen bg-[#0a0a0a] py-24 sm:py-32 overflow-hidden">

            {/* Background Effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[20%] left-[50%] -translate-x-1/2 w-[800px] h-[800px] bg-blue-900/10 rounded-full blur-[150px]" />
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-900/5 rounded-full blur-[100px]" />

                {/* Floating Particles */}
                <Particle top="10%" left="10%" delay={0} />
                <Particle top="40%" right="10%" delay={2} />
                <Particle bottom="20%" left="20%" delay={4} />
            </div>

            <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

                {/* Header */}
                <div className="text-center mb-16 space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full mb-6 relative hover:bg-white/10 transition-colors">
                        <Rocket size={14} className="text-purple-400" />
                        <span className="text-xs font-bold text-purple-400 uppercase tracking-wide">Premium Plans</span>
                    </div>
                    <motion.h2
                        initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
                        whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        viewport={{ once: false, amount: 0.3 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight"
                    >
                        Choose Your <br className="md:hidden" />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400">
                            Placement Journey
                        </span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: false, amount: 0.3 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-gray-400 text-lg mt-6 max-w-2xl mx-auto"
                    >
                        Start building your foundation for free, or fast-track your success with professional tools and guidance.
                    </motion.p>

                    {/* Toggle (Optional if you want monthly/yearly, kept static for now) */}
                    {/* <div className="flex justify-center mt-8">
                        <div className="flex items-center bg-white/5 rounded-full p-1 border border-white/10 relative">
                             ... Toggle Implementation ...
                        </div>
                    </div> */}
                </div>

                {/* Pricing Cards */}
                <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto items-center">

                    {/* Free Plan */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: false, amount: 0.3 }}
                        transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
                        className="relative bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 md:p-10 flex flex-col hover:border-white/20 transition-colors group"
                    >
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gray-500/0 via-gray-500/50 to-gray-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />

                        <div className="mb-8">
                            <div className="w-12 h-12 rounded-2xl bg-gray-800/50 flex items-center justify-center mb-6">
                                <Box className="text-gray-400" size={24} />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Free Plan</h3>
                            <p className="text-gray-400 text-sm">Essential for beginners getting started.</p>
                        </div>

                        <div className="mb-8">
                            <span className="text-4xl font-bold text-white">₹0</span>
                            <span className="text-gray-500 ml-2">/ forever</span>
                        </div>

                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: false, amount: 0.3 }}
                            variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
                            className="flex-1 space-y-4 mb-10"
                        >
                            {/* Subset of features for display */}
                            <FeatureRow text="Basic DSA Problems (Easy)" icon={Check} disabled={false} />
                            <FeatureRow text="Limited Daily Submissions" icon={Check} disabled={false} />
                            <FeatureRow text="Basic Code Editor" icon={Check} disabled={false} />
                            <FeatureRow text="Sample Test Cases Only" icon={Check} disabled={false} />
                            <FeatureRow text="Basic Progress Stats" icon={Check} disabled={false} />
                            <FeatureRow text="Community Discussions" icon={Check} disabled={false} />
                        </motion.div>

                        <button
                            onClick={handleGetStarted}
                            className="w-full py-4 rounded-xl border border-white/10 text-white font-semibold hover:bg-white/5 hover:border-white/20 transition-all flex items-center justify-center gap-2 group-hover:tracking-wide">
                            Start for Free
                        </button>
                    </motion.div>

                    {/* Pro Plan */}
                    <motion.div
                        initial={{ opacity: 0, x: 50, scale: 0.95 }}
                        whileInView={{ opacity: 1, x: 0, scale: 1 }}
                        viewport={{ once: false, amount: 0.3 }}
                        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                        className="relative bg-[#0f0f0f] border-2 border-purple-500/30 rounded-[2rem] p-8 md:p-12 flex flex-col shadow-2xl shadow-purple-900/20 lg:-my-8"
                    >
                        {/* Glowing Border Animation */}
                        <div className="absolute inset-0 rounded-[2rem] bg-purple-500/5 pointer-events-none" />

                        {/* Badge */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-1.5 rounded-full text-xs font-bold text-white uppercase tracking-wider shadow-lg flex items-center gap-2">
                            <Sparkles size={12} className="fill-current" /> Most Popular
                        </div>

                        <div className="mb-8 relative z-10">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-6 shadow-lg shadow-purple-500/30">
                                <Crown className="text-white fill-white" size={28} />
                            </div>
                            <h3 className="text-3xl font-bold text-white mb-2">CodeHubx <span className="text-purple-400">Pro</span></h3>
                            <p className="text-gray-400">Complete placement preparation suite.</p>
                        </div>

                        <div className="mb-8 relative z-10">
                            <div className="flex items-end gap-2">
                                <span className="text-5xl font-bold text-white">₹99</span>
                                <span className="text-gray-500 mb-1">/ month</span>
                            </div>
                            <p className="text-xs text-green-400 mt-2 font-medium">✨ 7-day money-back guarantee</p>
                        </div>

                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: false, amount: 0.3 }}
                            variants={{ visible: { transition: { staggerChildren: 0.05, delayChildren: 0.2 } } }}
                            className="flex-1 space-y-4 mb-10 relative z-10"
                        >
                            <FeatureRow text="Full DSA Library (Easy → Hard)" icon={Check} highlight />
                            <FeatureRow text="Weekly Live Contests & Leaderboards" icon={Check} highlight />
                            <FeatureRow text="Aptitude & Reasoning Modules" icon={Check} highlight />
                            <FeatureRow text="Full-Length Mock Tests (FAANG)" icon={Check} highlight />
                            <FeatureRow text="Hidden & Edge Test Cases" icon={Check} highlight />
                            <FeatureRow text="AI Hints & Explanations" icon={Zap} highlightColor="text-yellow-400" highlight />
                            <FeatureRow text="Advanced Analytics & Readiness" icon={Check} highlight />
                            <FeatureRow text="Verified Pro Certificate" icon={Crown} highlightColor="text-orange-400" highlight />
                        </motion.div>

                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="relative z-10 w-full"
                        >
                            <SubscriptionButton
                                className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-shadow flex items-center justify-center gap-2"
                            >
                                Upgrade to Pro <ArrowRight size={18} />
                            </SubscriptionButton>
                        </motion.div>
                    </motion.div>
                </div>

                {/* Comparison Table Link (Optional) */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="mt-20 text-center"
                >
                    <p className="text-gray-500 mb-6">Need more details? Compare features side-by-side.</p>
                </motion.div>

                {/* Footer CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.5 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="mt-24 text-center pb-10"
                >
                    <h3 className="text-2xl font-bold text-white mb-6">Crack Placements with Confidence 🚀</h3>
                    <motion.button
                        onClick={handleGetStarted}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        animate={{ boxShadow: ["0 0 0 0 rgba(255, 255, 255, 0)", "0 0 0 10px rgba(255, 255, 255, 0)"] }}
                        transition={{
                            scale: { duration: 0.2 },
                            boxShadow: { duration: 2, repeat: Infinity, repeatType: "loop" }
                        }}
                        className="px-8 py-3 bg-white/10 hover:bg-white/15 text-white rounded-full font-medium border border-white/5"
                    >
                        Start Your Pro Journey
                    </motion.button>
                </motion.div>

            </div>
        </section>
    );
};

// --- Sub-components ---

const FeatureRow = ({ text, icon: Icon, disabled, highlight, highlightColor }) => (
    <motion.div
        variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }}
        className={`flex items-center gap-3 ${disabled ? 'opacity-50' : 'opacity-100'} group`}
    >
        <div className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${highlight ? 'bg-purple-500/20' : 'bg-white/10'}`}>
            <Icon size={14} className={highlight ? (highlightColor || 'text-purple-400') : 'text-gray-400'} />
        </div>
        <span className={`text-sm ${highlight ? 'text-gray-200 font-medium' : 'text-gray-400'}`}>{text}</span>
    </motion.div>
);

const Particle = ({ top, left, right, bottom, delay }) => (
    <motion.div
        animate={{
            y: [0, -20, 0],
            opacity: [0.2, 0.5, 0.2]
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay }}
        className="absolute w-1 h-1 bg-white rounded-full blur-[1px]"
        style={{ top, left, right, bottom }}
    />
);

import { ArrowRight } from 'lucide-react';

export default Pricing;
