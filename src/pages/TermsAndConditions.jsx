import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scale, AlertTriangle, UserCheck, ScrollText, Check, FileCheck, ChevronDown, CreditCard, Shield, Clock, Globe, Pencil, Mail, Building2, Code2, Ban } from 'lucide-react';
import Footer from '../components/Footer';

const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (i = 0) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] }
    })
};

const TermsAndConditions = () => {
    const [expandedClause, setExpandedClause] = useState('acceptance');
    const [agreed, setAgreed] = useState(false);

    const clauses = [
        {
            id: 'acceptance',
            icon: UserCheck,
            title: '1. Acceptance of Terms',
            content: `By accessing or using CodeHubX ("the Platform"), you confirm that you have read, understood, and agree to be bound by these Terms & Conditions. If you do not agree with any part of these terms, please discontinue use of the platform immediately.`
        },
        {
            id: 'eligibility',
            icon: Shield,
            title: '2. Eligibility',
            content: `The Platform is intended for users who are 13 years of age or older. By using CodeHubX, you confirm that you meet this age requirement. We do not knowingly permit users under 13 to register or use the platform.`
        },
        {
            id: 'account',
            icon: UserCheck,
            title: '3. Account Registration & Security',
            content: `You register using Google Login powered by Firebase Authentication. You are responsible for all activity that occurs under your account. Do not share your account credentials or access with others. Account sharing is a violation of these terms and may result in immediate termination. If you suspect unauthorized access to your account, contact us promptly at support@codehubx.in.`
        },
        {
            id: 'acceptable-use',
            icon: Ban,
            title: '4. Acceptable Use Policy',
            content: `You agree not to use the platform to submit malicious, harmful, or disruptive code. The following are expressly prohibited: attempting to exploit or attack our execution infrastructure, using containers for cryptocurrency mining or unauthorized network scanning, automated scraping of content or problem sets without written authorization, and impersonating any person, company, or entity. Violations will result in immediate account suspension or permanent termination without refund.`
        },
        {
            id: 'billing',
            icon: CreditCard,
            title: '5. Subscription & Billing',
            highlight: false,
            content: `CodeHubX offers Free, Pro, and Elite subscription tiers. Paid subscriptions are available on monthly and annual billing cycles. Subscriptions auto-renew at the end of each billing period unless you cancel before the renewal date. All payments are securely processed through Razorpay. We do not collect, store, or access your payment card details. All payments are non-refundable, including partial months. You may cancel your subscription at any time; access will continue until the end of your current paid period.`
        },
        {
            id: 'termination',
            icon: AlertTriangle,
            title: '6. Account Termination',
            highlight: true,
            content: `We reserve the right to suspend or permanently terminate your account, with or without prior notice, if you are found to be in violation of these Terms. Grounds for termination include but are not limited to: abusing the code execution environment, account sharing, submitting malicious code, or any other conduct harmful to the platform or its users. Termination does not entitle you to a refund.`
        },
        {
            id: 'ip',
            icon: Code2,
            title: '7. Intellectual Property — Your Code',
            content: `You retain full ownership of all source code and solutions you submit to CodeHubX. We do not claim intellectual property rights over your submissions. By submitting code, you grant CodeHubX a limited, non-exclusive license solely to execute that code for the purpose of providing you with results and evaluation. We do not use your code for training AI models or share it with third parties.`
        },
        {
            id: 'platform-ip',
            icon: Building2,
            title: '8. Platform Ownership',
            content: `All platform content, design, UI, editorial problems, and editorial solutions created by CodeHubX remain the exclusive intellectual property of CodeHubX. You may not reproduce, resell, redistribute, or create derivative works from CodeHubX's proprietary content without explicit written permission.`
        },
        {
            id: 'availability',
            icon: Clock,
            title: '9. Service Availability',
            content: `CodeHubX is currently in active development. The platform is provided on a best-effort basis. We do not guarantee uninterrupted access, uptime, or availability of any specific feature. Scheduled or unscheduled maintenance may occur at any time. Features may be added, removed, or modified during the development phase without prior notice.`
        },
        {
            id: 'liability',
            icon: Scale,
            title: '10. Limitation of Liability',
            highlight: true,
            content: `To the maximum extent permitted by applicable law, CodeHubX shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the platform. Our total aggregate liability to you shall not exceed the total amount you have paid to CodeHubX in the twelve (12) months preceding the claim. For users on the Free tier, our aggregate liability is zero. The platform is provided "as-is" without warranties of any kind, express or implied.`
        },
        {
            id: 'modifications',
            icon: Pencil,
            title: '11. Modifications to Service',
            content: `We reserve the right to modify, suspend, or discontinue any part of the platform at any time. As CodeHubX is under active development, features, pricing, and availability are subject to change. We will make reasonable efforts to communicate significant changes through the platform or via email.`
        },
        {
            id: 'terms-changes',
            icon: ScrollText,
            title: '12. Changes to These Terms',
            content: `We may update these Terms & Conditions periodically. When changes are made, the "Last Updated" date at the top will reflect the revision. Continued use of the platform after a revision constitutes your acceptance of the updated terms. We encourage you to review this page regularly.`
        },
        {
            id: 'governing-law',
            icon: Globe,
            title: '13. Governing Law',
            content: `These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising from or related to these Terms shall be subject to the exclusive jurisdiction of courts in India. If you are accessing the platform from outside India, you agree that Indian law governs this agreement.`
        },
        {
            id: 'contact',
            icon: Mail,
            title: '14. Contact Information',
            content: `If you have any questions, concerns, or legal inquiries regarding these Terms, please reach out to our team at support@codehubx.in. We are a small engineering team and will respond within 24 hours on business days.`
        }
    ];

    return (
        <div className="relative min-h-screen bg-[#03040B] font-sans selection:bg-indigo-500/30 overflow-hidden text-gray-200">
            {/* Ambient Lighting */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[0%] left-[50%] -translate-x-1/2 w-[80%] h-[50%] bg-indigo-900/10 rounded-[100%] blur-[180px] opacity-60" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-900/10 rounded-full blur-[150px]" />
            </div>

            <div className="max-w-7xl mx-auto px-6 py-32 relative z-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">

                {/* Left Area - Content */}
                <div className="lg:col-span-8 order-2 lg:order-1">
                    <motion.div initial="hidden" animate="visible" variants={fadeUp} className="mb-14">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] text-xs font-semibold text-gray-400 w-max mb-6">
                            Last Updated: October 2026
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-white via-indigo-100 to-indigo-400 mb-6 tracking-tight">
                            Terms & Conditions
                        </h1>
                        <p className="text-lg text-gray-400 font-medium leading-[1.7] max-w-2xl">
                            These terms govern your access to and use of CodeHubX. We have written them to be clear and honest. Please read them before using the platform.
                        </p>

                        {/* TL;DR Box */}
                        <div className="mt-8 p-6 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex gap-4">
                            <FileCheck size={22} className="text-indigo-400 shrink-0 mt-0.5" />
                            <p className="text-sm font-medium text-indigo-100/80 leading-[1.7]">
                                <strong className="text-indigo-300">TL;DR:</strong> You own your code. Subscriptions auto-renew and are non-refundable. Do not abuse the execution environment. The platform is provided as-is with no uptime guarantee. Governing law is India.
                            </p>
                        </div>
                    </motion.div>

                    {/* Clauses */}
                    <div className="space-y-4">
                        {clauses.map((clause, idx) => (
                            <motion.div
                                key={clause.id}
                                custom={idx}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, margin: "-50px" }}
                                variants={fadeUp}
                                layout
                                onClick={() => setExpandedClause(expandedClause === clause.id ? null : clause.id)}
                                className={`rounded-3xl cursor-pointer transition-all duration-300 overflow-hidden backdrop-blur-xl ${clause.highlight
                                        ? 'bg-amber-500/5 border border-amber-500/20 hover:bg-amber-500/10'
                                        : 'bg-white/[0.02] border border-white/[0.06] shadow-lg hover:bg-white/[0.04]'
                                    }`}
                            >
                                <div className="p-5 md:p-6 flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2.5 rounded-xl border ${clause.highlight ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-white/[0.03] border-white/[0.08] text-indigo-400'}`}>
                                            <clause.icon size={18} />
                                        </div>
                                        <div>
                                            <h3 className={`text-[17px] font-bold tracking-tight ${clause.highlight ? 'text-amber-300' : 'text-white'}`}>
                                                {clause.title}
                                            </h3>
                                        </div>
                                    </div>
                                    <ChevronDown
                                        size={18}
                                        className={`text-gray-500 transition-transform duration-300 shrink-0 ${expandedClause === clause.id ? 'rotate-180 text-indigo-400' : ''}`}
                                    />
                                </div>

                                <AnimatePresence>
                                    {expandedClause === clause.id && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3, ease: 'easeOut' }}
                                        >
                                            <div className="px-6 pb-7 pt-0">
                                                <div className={`pl-12 text-[16px] leading-[1.9] font-medium border-t pt-5 ${clause.highlight ? 'text-amber-100/70 border-amber-500/10' : 'text-gray-400 border-white/[0.04]'}`}>
                                                    {clause.content}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Right Area — Sticky Summary */}
                <div className="lg:col-span-4 order-1 lg:order-2 relative z-20">
                    <div className="sticky top-28 space-y-6">

                        {/* Summary Card */}
                        <div className="bg-[#070912]/80 backdrop-blur-2xl rounded-3xl border border-white/[0.08] overflow-hidden shadow-2xl p-8">
                            <h3 className="text-xl font-bold text-white mb-2 tracking-tight flex items-center gap-2">
                                <Scale size={20} className="text-indigo-400" /> Key Points
                            </h3>
                            <p className="text-sm font-medium text-gray-400 mb-6 leading-[1.6]">
                                A quick summary of what you're agreeing to when using CodeHubX.
                            </p>

                            <ul className="space-y-3 mb-8">
                                {[
                                    'You retain ownership of your submitted code',
                                    'Subscriptions auto-renew each billing cycle',
                                    'All payments are non-refundable',
                                    'Platform provided as-is, best-effort basis',
                                    'Misuse results in account termination',
                                    'Governing law: India',
                                ].map((point, i) => (
                                    <li key={i} className="flex items-start gap-3 text-sm font-medium text-gray-300">
                                        <Check size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                                        {point}
                                    </li>
                                ))}
                            </ul>

                            {/* Agree Checkbox */}
                            <div className="pt-6 border-t border-white/[0.06] flex flex-col gap-4">
                                <label className="flex items-start gap-3 cursor-pointer group">
                                    <button
                                        type="button"
                                        onClick={() => setAgreed(!agreed)}
                                        className={`relative mt-1 w-5 h-5 flex-shrink-0 rounded flex items-center justify-center transition-all duration-300 outline-none border ${agreed
                                                ? 'bg-indigo-500 border-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]'
                                                : 'bg-white/[0.05] border-white/[0.2] group-hover:border-indigo-500/50'
                                            }`}
                                    >
                                        <AnimatePresence>
                                            {agreed && (
                                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                                                    <Check size={13} strokeWidth={3} className="text-white" />
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </button>
                                    <span className="text-sm font-medium text-gray-400 leading-snug select-none group-hover:text-gray-300 transition-colors">
                                        I have read and agree to the Terms & Conditions of CodeHubX.
                                    </span>
                                </label>

                                <AnimatePresence>
                                    {agreed && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 8 }}
                                            className="px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3 text-emerald-400 text-sm font-bold tracking-tight"
                                        >
                                            <FileCheck size={16} /> Agreement Confirmed
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Contact Box */}
                        <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-[20px]">
                            <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                                <Mail size={15} className="text-indigo-400" /> Questions?
                            </h4>
                            <p className="text-xs font-medium text-gray-400 leading-[1.6]">
                                Reach us at{' '}
                                <a href="mailto:support@codehubx.in" className="text-indigo-400 hover:underline font-semibold">
                                    support@codehubx.in
                                </a>
                                . We respond within 24 hours on business days.
                            </p>
                        </div>

                    </div>
                </div>

            </div>

            <Footer />
        </div>
    );
};

export default TermsAndConditions;
