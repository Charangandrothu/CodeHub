import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Check, X, Zap, Crown, Sparkles, Box, Rocket, ShieldCheck, Star, ArrowRight, TrendingUp, Trophy, LayoutDashboard, Lock } from 'lucide-react';
import SubscriptionButton from './SubscriptionButton';

const Pricing = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [selectedPlan, setSelectedPlan] = useState('monthly'); // 'monthly' or 'sixmonth'

    const handleGetStarted = () => {
        if (currentUser) {
            navigate('/dashboard');
        } else {
            navigate('/login');
        }
    };

    return (
        <section id="pricing" className="relative min-h-screen bg-[#0B0F1A] py-24 sm:py-32 overflow-hidden font-sans selection:bg-purple-500/30">

            {/* Background Aesthetic */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-purple-900/10 rounded-full blur-[120px] opacity-60" />
                <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-emerald-900/5 rounded-full blur-[120px] opacity-40" />
                {/* Grid Pattern Overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] opacity-20" />
            </div>

            <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

                {/* Header Section */}
                <div className="text-center mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-6 backdrop-blur-md"
                    >
                        <Sparkles size={14} className="text-amber-400 fill-amber-400" />
                        <span className="text-xs font-bold text-amber-100 tracking-wider uppercase">Premium Access</span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-6"
                    >
                        Choose Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Placement Journey</span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed"
                    >
                        Unlock structured preparation with premium tools and AI assistance.
                        <br className="hidden md:block" /> Start for free or upgrade for professional guidance.
                    </motion.p>
                </div>

                {/* Pricing Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto items-stretch">

                    {/* PLAN 1: Free Plan */}
                    <PricingCard
                        delay={0.1}
                        className="border border-white/5 bg-[#121620]"
                    >
                        <div className="mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-[#1a1f2e] flex items-center justify-center mb-4 text-gray-400">
                                <Box size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Free Plan</h3>
                            <p className="text-sm text-gray-500">Essential for beginners.</p>
                        </div>

                        <div className="mb-6">
                            <span className="text-4xl font-bold text-white">₹0</span>
                            <span className="text-gray-500 text-sm ml-2">/ forever</span>
                        </div>

                        <div className="space-y-3 mb-6 flex-1">
                            <Feature text="Basic DSA Problems (Easy only)" />
                            <Feature text="Daily Run Limit (3/day)" />
                            <Feature text="Limited Submissions (3)" />
                            <Feature text="Limited AI Debug & Explanations" />
                            <Feature text="Sample Test Cases Only" />


                            {/* Disabled Features */}
                            <div className="pt-4 border-t border-white/5 space-y-3">

                                <Feature text="Mock Tests" disabled />
                                <Feature text="Aptitude & Reasoning" disabled />

                                <Feature text="Premium Certificate" disabled />
                            </div>
                        </div>

                        <button
                            onClick={handleGetStarted}
                            className="w-full py-3 rounded-[18px] border border-white/10 text-gray-300 font-medium hover:bg-white/5 hover:text-white transition-all text-sm"
                        >
                            Start Free
                        </button>
                    </PricingCard>


                    {/* PLAN 2: Pro Monthly (Highlighted) */}
                    <PricingCard
                        delay={0.2}
                        popular
                        isSelected={selectedPlan === 'monthly'}
                        onClick={() => setSelectedPlan('monthly')}
                        className={`relative shadow-2xl transition-all duration-300 ${selectedPlan === 'monthly'
                            ? 'border-2 border-blue-500/60 bg-[#151925] shadow-blue-900/40 scale-[1.03] z-20'
                            : 'border border-white/5 bg-[#121620] saturate-50 hover:saturate-100 scale-100 z-10'
                            }`}
                    >
                        {/* Glow Effect behind */}
                        {selectedPlan === 'monthly' && (
                            <div className="absolute inset-0 bg-blue-500/10 rounded-[22px] blur-xl -z-10" />
                        )}

                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-lg flex items-center gap-1.5 whitespace-nowrap">
                            <Star size={10} className="fill-current" /> Limited Offer
                        </div>

                        <div className={`absolute top-4 right-4 px-2 py-0.5 rounded text-[10px] font-bold border ${selectedPlan === 'monthly' ? 'bg-blue-500/10 text-blue-300 border-blue-500/20' : 'bg-white/5 text-gray-500 border-white/10'}`}>
                            Only for First 500 users
                        </div>

                        <div className="mb-4 mt-2">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 text-white shadow-lg ${selectedPlan === 'monthly' ? 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-500/30' : 'bg-[#1a1f2e]'}`}>
                                <Crown size={24} className={selectedPlan === 'monthly' ? "fill-white/20" : "text-gray-500"} />
                            </div>
                            <h3 className={`text-xl font-bold mb-2 ${selectedPlan === 'monthly' ? 'text-white' : 'text-gray-300'}`}>Pro Monthly</h3>
                            <p className="text-sm text-gray-400">Most popular choice.</p>
                        </div>

                        <div className="mb-6">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-gray-500 text-sm line-through">₹199</span>
                                <span className="text-red-400 text-[10px] bg-red-400/10 px-1.5 py-0.5 rounded">50% OFF</span>
                                <span className="text-amber-400 text-[10px] bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20">POPULAR</span>
                            </div>
                            <div className="flex items-end gap-1">
                                <span className={`text-5xl font-bold tracking-tight ${selectedPlan === 'monthly' ? 'text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400' : 'text-white'}`}>₹99</span>
                                <span className="text-gray-400 text-sm mb-1">/ month</span>
                            </div>
                        </div>

                        <div className="space-y-3 mb-6 flex-1">
                            <Feature text="Full DSA Library (Easy → Hard)" highlight={selectedPlan === 'monthly'} />

                            <Feature text="AI Debug & Explanations" icon={Zap} highlightColor="text-amber-400" highlight={selectedPlan === 'monthly'} />
                            <Feature text="Hidden & Edge Test Cases" highlight={selectedPlan === 'monthly'} />
                            <Feature text="Complexity Analysis" icon={TrendingUp} highlightColor="text-blue-400" highlight={selectedPlan === 'monthly'} />
                            <Feature text="Weekly Rankings Competition" icon={Trophy} highlightColor="text-yellow-400" highlight={selectedPlan === 'monthly'} />

                            <Feature text="Aptitude & Reasoning Modules" badge="Coming Soon" highlight={selectedPlan === 'monthly'} />
                            <Feature text="Premium Certificate" icon={Crown} highlightColor="text-orange-400" highlight={selectedPlan === 'monthly'} />
                        </div>

                        <SubscriptionButton
                            className={`w-full py-3.5 rounded-[18px] font-bold text-sm transition-all flex items-center justify-center gap-2 group ${selectedPlan === 'monthly'
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:shadow-[0_0_30px_rgba(79,70,229,0.6)] ring-1 ring-white/20 hover:scale-[1.02]'
                                : 'bg-[#1a1f2e] text-gray-300 border border-white/10 hover:bg-white/5'
                                }`}
                        >
                            {selectedPlan === 'monthly' ? 'Upgrade Now' : 'Select Plan'} <ArrowRight size={16} className={`transition-transform ${selectedPlan === 'monthly' ? 'group-hover:translate-x-1' : ''}`} />
                        </SubscriptionButton>

                        <div className="mt-4 flex items-center justify-center gap-1.5 text-[10px] text-gray-500">
                            <ShieldCheck size={12} className="text-green-500" />
                            7-day money-back guarantee
                        </div>
                    </PricingCard>


                    {/* PLAN 3: Pro 6-Month */}
                    <PricingCard
                        delay={0.3}
                        isSelected={selectedPlan === 'sixmonth'}
                        onClick={() => setSelectedPlan('sixmonth')}
                        className={`relative transition-all duration-300 ${selectedPlan === 'sixmonth'
                            ? 'border-2 border-emerald-500/60 bg-[#121620] shadow-2xl shadow-emerald-900/40 scale-[1.03] z-20'
                            : 'border border-white/5 bg-[#121620] saturate-50 hover:saturate-100 scale-100 z-10'
                            }`}
                    >
                        {selectedPlan === 'sixmonth' && (
                            <div className="absolute inset-0 bg-emerald-500/10 rounded-[22px] blur-xl -z-10" />
                        )}

                        <div className="absolute top-0 right-0 p-4">
                            <div className={`px-2 py-0.5 rounded text-[10px] font-bold border ${selectedPlan === 'sixmonth' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-white/5 text-gray-500 border-white/10'}`}>
                                Save 58%
                            </div>
                        </div>

                        <div className="mb-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 shadow-lg ${selectedPlan === 'sixmonth' ? 'bg-[#1a1f2e] border border-emerald-500/20 text-emerald-400 shadow-emerald-500/10' : 'bg-[#1a1f2e] text-gray-500'}`}>
                                <Rocket size={24} />
                            </div>
                            <h3 className={`text-xl font-bold mb-2 ${selectedPlan === 'sixmonth' ? 'text-white' : 'text-gray-300'}`}>Pro (6 Months)</h3>
                            <p className="text-sm text-gray-500">Best for serious aspirants.</p>
                        </div>

                        <div className="mb-6">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-gray-500 text-sm line-through">₹1199</span>
                            </div>
                            <div className="flex items-end gap-1">
                                <span className={`text-4xl font-bold tracking-tight ${selectedPlan === 'sixmonth' ? 'text-emerald-400' : 'text-white'}`}>₹499</span>
                                <span className="text-gray-400 text-sm mb-1">/ 6 mo</span>
                            </div>
                        </div>

                        <div className="space-y-3 mb-6 flex-1">
                            <Feature text="Everything in Pro Monthly" highlight={selectedPlan === 'sixmonth'} />
                            <Feature text="Placement Readiness Score" highlight={selectedPlan === 'sixmonth'} />
                            <Feature text="Company-Specific Question Sets" highlight={selectedPlan === 'sixmonth'} />
                            <Feature text="Priority Support" />
                            <Feature text="Resume Builder" badge="Coming Soon" />
                            <Feature text="Advanced Analytics Dashboard" highlight={selectedPlan === 'sixmonth'} />
                            <Feature text="Verified Premium Certificate" icon={Crown} highlightColor="text-orange-400" highlight={selectedPlan === 'sixmonth'} />
                        </div>

                        <div className="w-full">
                            <button
                                className={`w-full py-3 rounded-[18px] font-semibold text-sm transition-all flex items-center justify-center gap-2 ${selectedPlan === 'sixmonth'
                                    ? 'bg-[#1a1f2e] border border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/80 shadow-lg shadow-emerald-900/20'
                                    : 'bg-[#1a1f2e] text-gray-300 border border-white/10 hover:bg-white/5'
                                    }`}
                            >
                                {selectedPlan === 'sixmonth' ? 'Get 6-Month Plan' : 'Select Plan'}
                            </button>
                        </div>
                    </PricingCard>

                </div>
            </div>
        </section>
    );
};

// --- Helper Components ---

const PricingCard = ({ children, className, popular, delay, isSelected, onClick }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5, delay, ease: "easeOut" }}
        whileHover={{ y: -8, transition: { duration: 0.3 } }}
        onClick={onClick}
        className={`p-5 md:p-6 rounded-[22px] flex flex-col h-full cursor-pointer ${className}`}
    >
        {children}
    </motion.div>
);

const Feature = ({ text, highlight, icon: Icon = Check, highlightColor, disabled, badge }) => (
    <div className={`flex items-start gap-3 ${disabled ? 'opacity-40 grayscale' : 'opacity-100'}`}>
        <div className={`mt-0.5 shrink-0 w-4 h-4 rounded-full flex items-center justify-center ${highlight ? 'bg-purple-500/20' : disabled ? 'bg-white/5' : 'bg-white/10'}`}>
            {disabled ? <Lock size={10} className="text-gray-500" /> : <Icon size={10} className={highlight ? (highlightColor || 'text-purple-400') : 'text-gray-400'} />}
        </div>
        <div className="flex-1">
            <span className={`text-[13px] leading-tight ${highlight ? 'text-gray-200 font-medium' : 'text-gray-400'} ${disabled ? 'line-through decoration-white/20' : ''}`}>
                {text}
            </span>
            {badge && (
                <span className="ml-2 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 uppercase tracking-wide">
                    {badge}
                </span>
            )}
        </div>
    </div>
);

export default Pricing;
