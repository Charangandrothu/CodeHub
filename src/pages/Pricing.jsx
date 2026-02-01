import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SubscriptionButton from '../components/SubscriptionButton';

const Pricing = () => {
    const navigate = useNavigate();
    const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' or 'yearly'

    const features = [
        "Unlimited Code Submissions",
        "Access to All Problems",
        "Premium Solution Analysis",
        "Mock Tests & Contests",
        "Placement Assessment",
        "Detailed Performance Analytics",
        "Priority Support"
    ];

    return (
        <div className="min-h-screen bg-[#0a0a0a] pt-24 pb-12 px-4 relative overflow-hidden font-sans">
            {/* Background Effects */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[500px] bg-purple-500/10 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-4xl mx-auto relative z-10">
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold uppercase tracking-wider mb-4"
                    >
                        <Zap size={12} className="fill-current" />
                        Go Pro
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight"
                    >
                        Upgrade to <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">CodeHub Pro</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-gray-400 text-lg max-w-xl mx-auto"
                    >
                        Unlock your full potential with unlimited access to premium problems, improved compiler speeds, and detailed coding analytics.
                    </motion.p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
                    {/* Free Plan */}
                    <div className="bg-[#111] border border-[#262626] rounded-2xl p-8 relative opacity-50 hover:opacity-100 transition-opacity">
                        <div className="text-xl font-bold text-white mb-2">Free</div>
                        <div className="text-3xl font-bold text-white mb-6">₹0<span className="text-sm font-normal text-gray-500">/mo</span></div>
                        <button disabled className="w-full py-2.5 rounded-lg bg-[#262626] text-gray-400 text-sm font-semibold mb-8 cursor-not-allowed">
                            Current Plan
                        </button>
                        <ul className="space-y-4">
                            <li className="flex items-center gap-3 text-gray-400 text-sm">
                                <Check size={16} className="text-green-500" />
                                Limited Problems
                            </li>
                            <li className="flex items-center gap-3 text-gray-400 text-sm">
                                <Check size={16} className="text-green-500" />
                                Basic Compilation
                            </li>
                            <li className="flex items-center gap-3 text-gray-500 text-sm line-through decoration-gray-700">
                                <X size={16} />
                                Submissions
                            </li>
                        </ul>
                    </div>

                    {/* Pro Plan */}
                    <motion.div
                        whileHover={{ y: -5 }}
                        className="bg-[#111] border border-purple-500/30 rounded-2xl p-8 relative relative group"
                    >
                        <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent rounded-2xl pointer-events-none" />
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-[10px] font-bold text-white uppercase tracking-wider shadow-lg shadow-purple-500/20">
                            Recommended
                        </div>

                        <div className="text-xl font-bold text-white mb-2">Pro</div>
                        <div className="text-3xl font-bold text-white mb-6">₹99<span className="text-sm font-normal text-gray-500">/mo</span></div>

                        <div className="mb-8">
                            <SubscriptionButton />
                        </div>

                        <ul className="space-y-4">
                            {features.map((feature, i) => (
                                <li key={i} className="flex items-center gap-3 text-gray-300 text-sm">
                                    <div className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0">
                                        <Check size={12} className="text-purple-400" />
                                    </div>
                                    {feature}
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Pricing;
