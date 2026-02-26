import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Star, ArrowRight, Lock, Crown, Zap, TrendingUp, Trophy, Sparkles, Loader2 } from 'lucide-react';
import { API_URL } from '../config';
import logo_img from '../assets/logo_img.png';
import PaymentSuccessScreen from './PaymentSuccessScreen';

const Pricing = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [billingCycle, setBillingCycle] = useState('yearly'); // 'monthly' | 'yearly'
    const [selectedPlan, setSelectedPlan] = useState('pro'); // 'starter' | 'pro' | 'elite'
    const [pricingData, setPricingData] = useState(null);
    const [isPaymentSuccess, setIsPaymentSuccess] = useState(false);
    const [processingPlan, setProcessingPlan] = useState(null);
    useEffect(() => {
        const fetchPricing = async () => {
            try {
                const response = await fetch(`${API_URL}/api/payment/pricing`);
                const data = await response.json();
                if (data.success) {
                    setPricingData(data.pricing);
                }
            } catch (error) {
                console.error("Failed to fetch dynamic pricing:", error);
            }
        };
        fetchPricing();
    }, []);

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            if (window.Razorpay) {
                resolve(true);
                return;
            }
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleGetStarted = async (planId) => {
        setSelectedPlan(planId);

        if (!currentUser) {
            navigate('/login', { state: { from: '/pricing', plan: planId } });
            return;
        }

        if (planId === 'starter') {
            navigate('/dashboard');
            return;
        }

        setProcessingPlan(planId);

        try {
            const isLoaded = await loadRazorpayScript();
            if (!isLoaded) {
                alert("Failed to load Razorpay SDK. Check your connection.");
                setProcessingPlan(null);
                return;
            }

            // Call Backend to generate order
            // Assuming API_URL is imported from config or using relative path if proxied
            const uid = currentUser?.uid;

            // Adjust the URL based on your API setup if needed
            const response = await fetch(`${API_URL}/api/payment/create-order`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-uid': uid
                },
                body: JSON.stringify({
                    plan_id: planId,
                    billing_cycle: billingCycle
                })
            });

            const data = await response.json();

            if (!data.success) {
                alert("Failed to create order: " + (data.error || 'Unknown error'));
                setProcessingPlan(null);
                return;
            }

            // Open Razorpay Checkout Window
            const options = {
                key: data.key_id,
                amount: data.amount,
                currency: data.currency,
                name: "CodeHub",
                description: `CodeHub ${planId} Subscription`,
                order_id: data.order_id,
                prefill: {
                    name: currentUser.displayName,
                    email: currentUser.email,
                },
                theme: {
                    color: "#3B82F6"
                },
                handler: function (response) {
                    // Payment successful locally (webhook handles backend activation)
                    setIsPaymentSuccess(true);
                    setTimeout(() => {
                        navigate('/dashboard');
                    }, 3000);
                },
                modal: {
                    ondismiss: function () {
                        setProcessingPlan(null);
                    }
                }
            };

            const rzp = new window.Razorpay(options);

            rzp.on('payment.failed', function (response) {
                alert("Payment Failed: " + response.error.description);
                setProcessingPlan(null);
            });

            rzp.open();

        } catch (error) {
            console.error("Payment initiation error:", error);
            alert("Something went wrong during checkout.");
            setProcessingPlan(null);
        }
    };

    const handleSelectPlan = (planId) => {
        setSelectedPlan(planId);
    };

    return (
        <>
            <AnimatePresence>
                {isPaymentSuccess && <PaymentSuccessScreen key="payment-success" />}
            </AnimatePresence>
            <section id="pricing" className="relative min-h-screen bg-[#0B0F1A] font-sans text-white overflow-hidden selection:bg-blue-500/30">

                {/* Optional Top Strip */}
                {/* <div className="bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-blue-600/20 border-b border-white/5 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-4 py-2 text-center">
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="text-xs sm:text-sm font-medium text-blue-200 flex items-center justify-center gap-2"
                    >
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                        🎉 Launch Offer — First 500 Users Get Pro at <span className="font-bold text-white">{pricingData ? pricingData.pro.currencySymbol : '₹'}{pricingData ? pricingData.pro.yearly : '999'}/year</span>
                    </motion.p>
                </div>
            </div> */}

                {/* Background Ambient Effects */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-purple-900/10 rounded-full blur-[120px] opacity-60" />
                    <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-emerald-900/5 rounded-full blur-[120px] opacity-40" />
                    {/* Grid Pattern Overlay */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] opacity-20" />
                </div>

                <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">

                    {/* Section Header */}
                    <div className="text-center mb-16 space-y-4">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="text-4xl md:text-5xl font-bold tracking-tight text-white drop-shadow-lg"
                        >
                            Choose Your Growth Plan
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="text-gray-400 text-lg max-w-2xl mx-auto"
                        >
                            Structured DSA. Real Interview Preparation. AI-Powered Practice.
                        </motion.p>

                        {/* Toggle */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="flex items-center justify-center mt-8"
                        >
                            <div className="p-1 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm flex items-center relative">
                                <button
                                    onClick={() => setBillingCycle('monthly')}
                                    className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300 relative z-10 ${billingCycle === 'monthly' ? 'text-white' : 'text-gray-400 hover:text-gray-200'}`}
                                >
                                    Monthly
                                </button>
                                <button
                                    onClick={() => setBillingCycle('yearly')}
                                    className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300 relative z-10 ${billingCycle === 'yearly' ? 'text-white' : 'text-gray-400 hover:text-gray-200'}`}
                                >
                                    Yearly
                                </button>

                                {/* Sliding Background */}
                                <motion.div
                                    className="absolute top-1 bottom-1 bg-white/10 rounded-lg shadow-sm border border-white/5"
                                    initial={false}
                                    animate={{
                                        left: billingCycle === 'monthly' ? '4px' : '50%',
                                        right: billingCycle === 'monthly' ? '50%' : '4px',
                                        width: 'calc(50% - 6px)'
                                    }}
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            </div>
                            {billingCycle === 'yearly' && (
                                <span className="ml-3 text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/20">
                                    Save up to 44%
                                </span>
                            )}
                        </motion.div>
                    </div>

                    {/* Cards Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start max-w-6xl mx-auto">

                        {/* STARTER CARD */}
                        <PricingCard
                            className="order-2 lg:order-1"
                            id="starter"
                            isSelected={selectedPlan === 'starter'}
                            onSelect={() => handleSelectPlan('starter')}
                            title="Starter"
                            subtitle="Perfect to begin your journey."
                            price="0"
                            period="forever"
                            description="Forever Free"
                            features={[
                                "Access to Easy Problems",
                                "3 Submissions per Day",
                                "Limited AI Debug",
                                "Sample Test Cases",
                                "Community Access"
                            ]}
                            lockedFeatures={[
                                "Full DSA Library",
                                "Hidden Test Cases",
                                "Placement Tools"
                            ]}
                            buttonText="Start Free"
                            buttonVariant="outline"
                            delay={0.1}
                            onClick={() => handleGetStarted('starter')}
                            isProcessing={processingPlan === 'starter'}
                            cardStyle="dark"
                        />

                        {/* PRO CARD - Highlighted */}
                        <PricingCard
                            className="order-1 lg:order-2"
                            id="pro"
                            isSelected={selectedPlan === 'pro'}
                            onSelect={() => handleSelectPlan('pro')}
                            title="Pro"
                            subtitle="Serious DSA Preparation with AI Support."
                            price={pricingData ? pricingData.pro[billingCycle] : (billingCycle === 'yearly' ? "999" : "199")}
                            currencySymbol={pricingData ? pricingData.pro.currencySymbol : "₹"}
                            period={billingCycle === 'yearly' ? "year" : "month"}
                            originalPrice={pricingData ? pricingData.pro[billingCycle === 'yearly' ? 'originalYearly' : 'originalMonthly'] : (billingCycle === 'yearly' ? "1788" : "399")}
                            saveText={billingCycle === 'yearly' ? "Save 44%" : ""}
                            subPriceLabel={billingCycle === 'yearly' ? (pricingData ? `Just ${pricingData.pro.currencySymbol}${Math.floor(pricingData.pro.yearly / 12)}/month` : "Just ₹83/month") : ""}
                            features={[
                                "Full DSA Library (Easy → Hard)",
                                "AI Debug & Step-by-Step Explanations",
                                "Hidden & Edge Test Cases",
                                "Complexity Analysis",
                                "Weekly Ranking Competitions",
                                "100% Ad-Free Experience",
                                "Premium Completion Certificate"
                            ]}
                            buttonText="Unlock Pro"
                            buttonVariant="gradient"
                            delay={0.2}
                            onClick={() => handleGetStarted('pro')}
                            isProcessing={processingPlan === 'pro'}
                            featureIcons={{
                                "AI Debug": Zap,
                                "Complexity Analysis": TrendingUp,
                                "Weekly Rankings": Trophy,
                                "Ad-Free": Sparkles,
                                "Certificate": Crown
                            }}
                        />

                        {/* ELITE CARD */}
                        <PricingCard
                            className="order-3 lg:order-3"
                            id="elite"
                            isSelected={selectedPlan === 'elite'}
                            onSelect={() => handleSelectPlan('elite')}
                            title="Elite"
                            subtitle="Complete Placement Acceleration Pack."
                            price={pricingData ? pricingData.elite[billingCycle] : (billingCycle === 'yearly' ? "1999" : "399")}
                            currencySymbol={pricingData ? pricingData.elite.currencySymbol : "₹"}
                            period={billingCycle === 'yearly' ? "year" : "month"}
                            features={[
                                "Everything in Pro, plus:",
                                "Placement Readiness Score",
                                "Company-Specific Question Sets",
                                "Resume Builder",
                                "Priority Support",
                                "Advanced Performance Analytics",
                                "Verified Premium Certificate",
                                "Early Access to Mock Interviews"
                            ]}
                            buttonText="Go Elite"
                            buttonVariant="solid" // Dark solid button as per prompt
                            badge="🚀 For Placement Aspirants"
                            delay={0.3}
                            onClick={() => handleGetStarted('elite')}
                            isProcessing={processingPlan === 'elite'}
                            cardStyle="dark"
                            featureIcons={{
                                "Placement Readiness": Trophy,
                                "Company-Specific": TrendingUp,
                                "Resume Builder": Sparkles,
                                "Priority Support": Zap,
                                "Certificate": Crown
                            }}
                        />

                    </div>

                </div>
            </section>
        </>
    );
};

// --- Sub-Components ---

const AnimatedPrice = ({ price, currencySymbol, gradientClass, normalClass, className }) => {
    const chars = String(price).split('');
    const [startAnim, setStartAnim] = useState(false);
    const [isFinished, setIsFinished] = useState(false);

    useEffect(() => {
        setStartAnim(false);
        setIsFinished(false);
        const t = setTimeout(() => setStartAnim(true), 50);
        const maxDuration = (1.2 + ((chars.length - 1) * 0.4)) * 1000;
        const finishT = setTimeout(() => setIsFinished(true), 50 + maxDuration);
        return () => { clearTimeout(t); clearTimeout(finishT); };
    }, [price]);

    return (
        <motion.div
            className={`flex items-baseline gap-[1px] ${className}`}
            animate={isFinished ? { scale: [1, 1.05, 0.98, 1] } : { scale: 1 }}
            transition={isFinished ? { duration: 0.5, ease: "easeOut" } : { duration: 0 }}
        >
            <span className={`mr-1 ${gradientClass || normalClass}`}>{currencySymbol}</span>
            {chars.map((char, index) => (
                <AnimatedDigit
                    key={`${index}-${char}`}
                    targetChar={char}
                    index={index}
                    startAnim={startAnim}
                    textClass={gradientClass || normalClass}
                />
            ))}
        </motion.div>
    );
};

const AnimatedDigit = ({ targetChar, index, startAnim, textClass }) => {
    const numericTarget = parseInt(targetChar, 10);
    if (isNaN(numericTarget)) {
        return <span className={textClass}>{targetChar}</span>;
    }

    const numbers = React.useMemo(() => {
        const nums = [numericTarget];
        for (let j = numericTarget - 1; j >= 0; j--) nums.push(j);
        const sequences = 2 + index;
        for (let i = 0; i < sequences; i++) {
            for (let j = 9; j >= 0; j--) nums.push(j);
        }
        return nums;
    }, [numericTarget, index]);

    return (
        <span className="relative inline-flex overflow-hidden align-middle tracking-normal" style={{ height: "1.1em", lineHeight: "1.1em" }}>
            <span className="invisible inline-flex items-center tracking-normal font-bold">{targetChar}</span>
            <motion.span
                initial={{ y: `-${((numbers.length - 1) / numbers.length) * 100}%` }}
                animate={{ y: startAnim ? "0%" : `-${((numbers.length - 1) / numbers.length) * 100}%` }}
                transition={{ duration: 1.2 + (index * 0.4), ease: [0.15, 1, 0.3, 1] }}
                className="absolute top-0 left-0 flex flex-col w-full font-bold"
                style={{ height: `${numbers.length * 100}%` }}
            >
                {numbers.map((num, i) => (
                    <span key={i} className={`flex items-center justify-center font-bold pb-[0.05em] ${textClass}`} style={{ height: `${100 / numbers.length}%` }}>{num}</span>
                ))}
            </motion.span>
        </span>
    );
};

const PricingCard = ({
    id, isSelected, onSelect, title, subtitle, price, period, originalPrice, saveText, subPriceLabel,
    features, lockedFeatures, buttonText, buttonVariant, badge, delay, onClick, isProcessing, className, cardStyle, featureIcons, currencySymbol = "₹"
}) => {
    // Determine active styling based on selection and ID
    const isPro = id === 'pro';
    const isElite = id === 'elite';
    const isActive = isSelected;

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay }}
            whileHover={{ y: -8 }}
            onClick={onSelect}
            className={`
                relative p-7 rounded-[22px] flex flex-col h-full transition-all duration-300 group cursor-pointer
                ${isActive && isPro
                    ? 'bg-[#151925] border-2 border-blue-500/60 shadow-2xl shadow-blue-900/40 z-10 lg:scale-[1.03]' // Active Pro
                    : isActive && isElite
                        ? 'bg-[#151925] border-2 border-emerald-500/60 shadow-2xl shadow-emerald-900/40 z-10 lg:scale-[1.03]' // Active Elite
                        : 'bg-[#121620] border border-white/5 shadow-xl hover:border-white/10 opacity-80 hover:opacity-100 scale-95 hover:scale-[0.98]' // Inactive / Standard
                }
                ${className || ''}
            `}
        >
            {/* Background Spotlight for Pro (Blue) - Active Only */}
            {isActive && isPro && (
                <div className="absolute inset-0 bg-blue-500/5 rounded-[22px] pointer-events-none" />
            )}

            {/* Background Spotlight for Elite (Green) - Active Only */}
            {isActive && isElite && (
                <div className="absolute inset-0 bg-emerald-500/5 rounded-[22px] pointer-events-none" />
            )}

            {/* Badges - Pro Only (but show even if inactive to indicate value) */}
            {isPro && (
                <div className={`absolute -top-4 left-0 right-0 flex justify-center z-20 transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-70'}`}>
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 whitespace-nowrap">
                        <Star size={10} className="fill-current" /> LIMITED OFFER
                    </div>
                </div>
            )}
            {isPro && (
                <div className={`absolute top-4 right-4 z-20 transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-60'}`}>
                    <span className="bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[10px] font-bold px-2 py-1 rounded-md">
                        Only for First 500 Users
                    </span>
                </div>
            )}

            {/* Badges - Elite Only */}
            {badge && (
                <div className={`absolute -top-3 left-0 right-0 flex justify-center z-20 transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-70'}`}>
                    <div className={`
                        text-[11px] font-bold uppercase tracking-wider px-4 py-1.5 rounded-full shadow-lg ring-4 ring-[#0B1020]
                        ${isElite
                            ? "bg-[#1a1f2e] border border-emerald-500/30 text-emerald-400"
                            : "bg-[#1a1f2e] border border-purple-500/30 text-emerald-400"} // Fallback
                    `}>
                        {badge}
                    </div>
                </div>
            )}

            {/* Content */}
            <div className="mb-5 relative z-10 mt-2">
                <h3 className={`text-2xl font-bold mb-2 ${isActive ? "text-white" : "text-white/70"}`}>{title}</h3>
                <p className="text-gray-500 text-sm min-h-[30px] leading-relaxed">{subtitle}</p>
            </div>

            {/* Pricing Section */}
            <div className="mb-7 relative z-10">
                <div className="flex items-baseline gap-1">
                    <AnimatedPrice
                        price={price}
                        currencySymbol={price === '0' ? '' : currencySymbol}
                        className="text-4xl lg:text-5xl font-bold tracking-tight"
                        gradientClass={isActive && isPro ? 'text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400' : isActive && isElite ? 'text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400' : ''}
                        normalClass="text-white"
                    />
                    {period && <span className="text-gray-500 text-sm font-medium">/{period}</span>}
                </div>

                {subPriceLabel && (
                    <p className={`${isActive && isElite ? 'text-emerald-400' : isActive && isPro ? 'text-blue-400' : 'text-gray-500'} text-sm mt-1 font-medium`}>{subPriceLabel}</p>
                )}

                {originalPrice && (
                    <div className="flex items-center gap-2 mt-2 text-sm">
                        <span className="text-gray-500 line-through">{currencySymbol}{originalPrice}</span>
                        {saveText && <span className="text-red-400 bg-red-400/10 px-2 py-0.5 rounded text-[10px] font-bold">{saveText}</span>}
                        {isPro && <span className="text-amber-400 text-[10px] bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20">POPULAR</span>}
                    </div>
                )}
                {/* For Starter card specifically */}
                {title === "Starter" && (
                    <p className="text-gray-500 text-sm mt-2">Forever Free</p>
                )}
            </div>

            {/* Features */}
            <div className="space-y-3.5 mb-8 flex-1 relative z-10">
                {features.map((feature, i) => (
                    <FeatureItem key={i} text={feature} isPro={isPro} isElite={isElite} isActive={isActive} featureIcons={featureIcons} />
                ))}

                {lockedFeatures && (
                    <div className="pt-4 mt-4 border-t border-white/5 space-y-3.5">
                        {lockedFeatures.map((feature, i) => (
                            <FeatureItem key={i} text={feature} locked />
                        ))}
                    </div>
                )}
            </div>

            {/* CTA Button */}
            <div className="relative z-10 mt-auto w-full">
                <button
                    disabled={isProcessing}
                    onClick={(e) => {
                        e.stopPropagation(); // Prevent card select click
                        onClick();
                    }}
                    className={`
                        w-full py-3.5 rounded-[18px] font-bold text-sm tracking-wide transition-all duration-300 flex items-center justify-center gap-2 group
                        ${isProcessing ? 'opacity-75 cursor-wait' : 'cursor-pointer'}
                        ${buttonVariant === 'outline'
                            ? 'bg-transparent border border-white/10 text-gray-300 hover:bg-white/5 hover:text-white'
                            : ''}
                        ${buttonVariant === 'gradient'
                            ? isActive
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:shadow-[0_0_30px_rgba(79,70,229,0.6)] hover:scale-[1.02]'
                                : 'bg-[#1a1f2e] border border-blue-500/30 text-blue-400 hover:bg-blue-500/10'
                            : ''}
                        ${buttonVariant === 'solid'
                            ? isActive
                                ? 'bg-[#1a1f2e] border border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10 shadow-lg shadow-emerald-900/20'
                                : 'bg-[#1a1f2e] border border-white/10 text-gray-300 hover:bg-white/5'
                            : ''}
                    `}
                >
                    {isProcessing ? (
                        <>
                            <Loader2 size={16} className="animate-spin" /> Processing...
                        </>
                    ) : (
                        <>
                            {buttonText} <ArrowRight size={16} className={`transition-transform duration-300 ${buttonVariant !== 'outline' ? 'group-hover:translate-x-1' : ''}`} />
                        </>
                    )}
                </button>
            </div>

        </motion.div>
    );
};

const FeatureItem = ({ text, locked, isPro, isElite, isActive, featureIcons }) => {
    // Check if text indicates a "plus" feature list header
    if (text.includes("plus:")) {
        return <p className="text-sm text-white font-bold pt-2 border-t border-white/5 mt-2">{text}</p>;
    }

    let Icon = Check;
    let highlightColor = "";

    // Determine Highlight Color based on Plan
    if (isElite) highlightColor = "text-emerald-400";
    else if (isPro) highlightColor = "text-purple-400";

    // Dynamic Icon Lookup
    if (featureIcons) {
        if (text.includes("AI Debug")) { Icon = Zap; highlightColor = "text-amber-400"; }
        else if (text.includes("Complexity")) { Icon = TrendingUp; highlightColor = "text-blue-400"; }
        else if (text.includes("Ad-Free")) { Icon = Sparkles; highlightColor = "text-pink-400"; }
        else if (text.includes("Ranking")) { Icon = Trophy; highlightColor = "text-yellow-400"; }
        else if (text.includes("Certificate")) { Icon = Crown; highlightColor = "text-orange-400"; }
    }

    // Mute colors if not active
    const finalIconClass = isActive && !locked && (isPro || isElite) ? highlightColor : "text-gray-500";
    const finalWrapperClass = locked ? 'bg-white/5' : isActive && isPro ? 'bg-purple-900/30' : isActive && isElite ? 'bg-emerald-900/30' : 'bg-white/10';
    const finalTextClass = isActive && !locked && (isPro || isElite) ? 'text-gray-200 font-medium' : 'text-gray-500';


    return (
        <div className={`flex items-start gap-3 ${locked ? 'opacity-40 select-none' : 'opacity-100'}`}>
            <div className={`
                mt-0.5 shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-colors duration-300
                ${finalWrapperClass}
            `}>
                {locked
                    ? <Lock size={12} className="text-gray-500" />
                    : <Icon size={12} className={finalIconClass} />
                }
            </div>
            <span className={`text-[13px] sm:text-sm leading-tight transition-colors duration-300 ${finalTextClass} ${locked ? 'line-through decoration-white/20' : ''}`}>
                {text}
            </span>
        </div>
    );
};

export default Pricing;
