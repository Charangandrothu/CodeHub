import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Clock, ShieldCheck, ChevronDown, CheckCircle, RefreshCcw, Send, Building2, HelpCircle, MapPin } from 'lucide-react';
import Footer from '../components/Footer';

const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (i = 0) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }
    })
};

const Contact = () => {
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [focusedField, setFocusedField] = useState(null);
    const [status, setStatus] = useState('idle'); // idle, loading, success
    const [activeFaq, setActiveFaq] = useState(null);

    const faqs = [
        { q: "How fast do you respond to inquiries?", a: "We provide email-based support with an average response time of under 24 hours on business days. Priority handling is given to Pro and Elite users. Please note we do not offer 24/7 live chat." },
        { q: "Do you offer technical support?", a: "Yes, technical support is available for all tiers. Pro and Elite users benefit from a priority queue. All support is email-based, with direct escalation to our core engineering team when necessary." },
        { q: "Can I request custom integrations?", a: "Custom integrations are available for Elite tier subscribers, subject to technical feasibility. Please discuss your requirements with us via our support email." },
        { q: "Where is my data stored?", a: "CodeHubX backend and database infrastructure runs on DigitalOcean. Our MongoDB database is securely hosted in the India region. All data is encrypted in transit via HTTPS and benefits from provider-level encryption at rest." },
        { q: "How is my code secured?", a: "Code submissions are executed inside isolated Docker containers with no cross-user environment access. Every container is automatically and securely destroyed immediately after execution completes." }
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        setStatus('loading');
        setTimeout(() => {
            setStatus('success');
            setTimeout(() => {
                setStatus('idle');
                setFormData({ name: '', email: '', message: '' });
            }, 3000);
        }, 1500);
    };

    return (
        <div className="relative min-h-screen bg-[#03040B] font-sans selection:bg-indigo-500/30 overflow-hidden text-gray-200">
            {/* Ambient Lighting */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[20%] left-[-10%] w-[60%] h-[60%] bg-indigo-900/10 rounded-full blur-[140px] animate-[pulse_12s_ease-in-out_infinite]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-violet-900/10 rounded-full blur-[160px] animate-[pulse_14s_ease-in-out_infinite_reverse]" />
            </div>

            <div className="max-w-7xl mx-auto px-6 pt-32 pb-24 relative z-10 w-full">

                {/* 1. Hero Section */}
                <motion.div
                    initial="hidden" animate="visible" variants={fadeUp}
                    className="text-center max-w-3xl mx-auto mb-20"
                >
                    <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-white via-indigo-100 to-indigo-400 mb-6 tracking-tight">
                        We’d Love to Hear From You.
                    </h1>
                    <p className="text-lg text-gray-400 leading-[1.7] font-medium">
                        Whether you need technical support, enterprise licensing arrangements, or simply have a product inquiry, our team is equipped and ready to assist.
                    </p>
                </motion.div>

                {/* 2. Main Two-Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start mb-32">

                    {/* LEFT: Elevated Glass Contact Form */}
                    <motion.div
                        custom={1} initial="hidden" animate="visible" variants={fadeUp}
                        className="lg:col-span-7 relative"
                    >
                        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-3xl blur-md opacity-30" />
                        <div className="relative p-8 sm:p-10 rounded-3xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-[20px] shadow-2xl">
                            <h3 className="text-2xl font-bold text-white mb-8 tracking-tight flex items-center gap-2">
                                <Send size={24} className="text-indigo-400" /> Drop a Message
                            </h3>

                            <form onSubmit={handleSubmit} className="space-y-6 relative">
                                {/* Success Overlay */}
                                <AnimatePresence>
                                    {status === 'success' && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }}
                                            className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#070912]/80 backdrop-blur-md rounded-2xl"
                                        >
                                            <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center border-2 border-emerald-500/50 mb-4 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                                                <CheckCircle size={32} className="text-emerald-400" />
                                            </div>
                                            <h4 className="text-xl font-bold text-white mb-2">Message Sent Successfully</h4>
                                            <p className="text-sm text-emerald-300 font-medium">We'll be in touch shortly.</p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Form Fields */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="relative group">
                                        <label className={`absolute left-4 transition-all duration-200 pointer-events-none ${focusedField === 'name' || formData.name ? 'top-2 text-[10px] text-indigo-400 uppercase font-bold tracking-wider' : 'top-4 text-sm text-gray-500 font-medium'}`}>
                                            Full Name
                                        </label>
                                        <input
                                            type="text" required
                                            value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            onFocus={() => setFocusedField('name')} onBlur={() => setFocusedField(null)}
                                            className={`w-full bg-white/[0.03] border rounded-xl px-4 pt-6 pb-2 text-white outline-none transition-all duration-300 shadow-inner ${focusedField === 'name' ? 'border-indigo-500/50 bg-indigo-500/5 ring-1 ring-indigo-500/20' : 'border-white/[0.1] hover:border-white/[0.2]'}`}
                                        />
                                    </div>
                                    <div className="relative group">
                                        <label className={`absolute left-4 transition-all duration-200 pointer-events-none ${focusedField === 'email' || formData.email ? 'top-2 text-[10px] text-indigo-400 uppercase font-bold tracking-wider' : 'top-4 text-sm text-gray-500 font-medium'}`}>
                                            Email Address
                                        </label>
                                        <input
                                            type="email" required
                                            value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField(null)}
                                            className={`w-full bg-white/[0.03] border rounded-xl px-4 pt-6 pb-2 text-white outline-none transition-all duration-300 shadow-inner ${focusedField === 'email' ? 'border-indigo-500/50 bg-indigo-500/5 ring-1 ring-indigo-500/20' : 'border-white/[0.1] hover:border-white/[0.2]'}`}
                                        />
                                    </div>
                                </div>

                                <div className="relative group">
                                    <label className={`absolute left-4 transition-all duration-200 pointer-events-none ${focusedField === 'message' || formData.message ? 'top-2 text-[10px] text-indigo-400 uppercase font-bold tracking-wider' : 'top-4 text-sm text-gray-500 font-medium'}`}>
                                        How can we help?
                                    </label>
                                    <textarea
                                        rows="5" required
                                        value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        onFocus={() => setFocusedField('message')} onBlur={() => setFocusedField(null)}
                                        className={`w-full bg-white/[0.03] border rounded-xl px-4 pt-8 pb-3 text-white outline-none transition-all duration-300 shadow-inner resize-none ${focusedField === 'message' ? 'border-indigo-500/50 bg-indigo-500/5 ring-1 ring-indigo-500/20' : 'border-white/[0.1] hover:border-white/[0.2]'}`}
                                    />
                                </div>

                                <button
                                    type="submit" disabled={status === 'loading'}
                                    className="w-full relative h-12 flex items-center justify-center rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-[0_4px_15px_rgba(79,70,229,0.3)] hover:shadow-[0_6px_25px_rgba(79,70,229,0.5)] active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none"
                                >
                                    {status === 'loading' ? (
                                        <RefreshCcw size={20} className="animate-spin" />
                                    ) : (
                                        "Send Message"
                                    )}
                                </button>
                            </form>
                        </div>
                    </motion.div>

                    {/* RIGHT: Information Blocks */}
                    <motion.div
                        custom={2} initial="hidden" animate="visible" variants={fadeUp}
                        className="lg:col-span-5 space-y-6"
                    >
                        {/* Response Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2">
                            <Clock size={14} className="animate-pulse" /> Average response time: {'<'} 24 hours (Business Days)
                        </div>

                        {/* Info Blocks */}
                        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-colors relative overflow-hidden group">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500/50 group-hover:w-full transition-all duration-500 opacity-10 group-hover:opacity-5" />
                            <div className="flex items-start gap-4 relative z-10">
                                <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                                    <Mail size={24} />
                                </div>
                                <div>
                                    <h4 className="text-white font-bold mb-1">General Inquiries & Technical Support</h4>
                                    <p className="text-sm font-medium text-gray-400 mb-2">Technical difficulties, account issues, or bug reports.</p>
                                    <a href="mailto:support@codehubx.in" className="text-sm text-indigo-400 font-semibold hover:text-indigo-300 hover:underline">support@codehubx.in</a>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-colors relative overflow-hidden group">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-500/50 group-hover:w-full transition-all duration-500 opacity-10 group-hover:opacity-5" />
                            <div className="flex items-start gap-4 relative z-10">
                                <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                                    <Building2 size={24} />
                                </div>
                                <div>
                                    <h4 className="text-white font-bold mb-1">Enterprise & Elite Discussions</h4>
                                    <p className="text-sm font-medium text-gray-400 mb-2">Custom integrations, bulk licensing, and Elite tier inquiries.</p>
                                    <a href="mailto:support@codehubx.in" className="text-sm text-purple-400 font-semibold hover:text-purple-300 hover:underline">support@codehubx.in</a>
                                </div>
                            </div>
                        </div>

                        {/* Trust Badges */}
                        <div className="pt-4 flex flex-wrap gap-4">
                            <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 bg-white/[0.03] border border-white/[0.05] px-3 py-1.5 rounded-full">
                                <ShieldCheck size={14} className="text-indigo-400" /> Data Secure
                            </div>
                            <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 bg-white/[0.03] border border-white/[0.05] px-3 py-1.5 rounded-full">
                                <ShieldCheck size={14} className="text-indigo-400" /> Isolated Execution
                            </div>
                            <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 bg-white/[0.03] border border-white/[0.05] px-3 py-1.5 rounded-full">
                                <ShieldCheck size={14} className="text-indigo-400" /> Privacy Protected
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* 3. FAQ Accordion + Map block */}
                <motion.div
                    custom={3} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeUp}
                    className="grid grid-cols-1 md:grid-cols-2 gap-12"
                >
                    {/* FAQs */}
                    <div>
                        <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-2 tracking-tight">
                            <HelpCircle size={24} className="text-indigo-400" /> Frequently Asked
                        </h3>
                        <div className="space-y-4">
                            {faqs.map((faq, idx) => (
                                <div key={idx} className="rounded-2xl bg-white/[0.02] border border-white/[0.05] backdrop-blur-md overflow-hidden">
                                    <button
                                        onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                                        className="w-full flex items-center justify-between p-5 text-left text-white font-semibold hover:bg-white/[0.02] transition-colors"
                                    >
                                        {faq.q}
                                        <ChevronDown size={18} className={`text-gray-400 transition-transform duration-300 ${activeFaq === idx ? "rotate-180 text-indigo-400" : ""}`} />
                                    </button>
                                    <AnimatePresence>
                                        {activeFaq === idx && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden bg-black/20"
                                            >
                                                <p className="p-5 pt-0 text-sm text-gray-400 leading-[1.7] font-medium border-t border-white/[0.02]">
                                                    {faq.a}
                                                </p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Trust Block */}
                    <div className="relative rounded-3xl bg-white/[0.02] border border-white/[0.05] backdrop-blur-md p-8 flex flex-col justify-center items-center text-center overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/10 to-transparent pointer-events-none" />
                        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

                        <div className="relative z-10 w-16 h-16 bg-white/[0.05] border border-white/[0.1] backdrop-blur-xl rounded-full flex items-center justify-center mb-6 shadow-2xl">
                            <ShieldCheck size={28} className="text-indigo-400" />
                        </div>
                        <h4 className="text-2xl font-bold text-white mb-2">Core Engineering Support</h4>
                        <p className="text-gray-400 text-sm font-medium leading-[1.7] max-w-sm">
                            Your inquiries are handled by our core engineering and support team. We explicitly value transparent communication without automated bots or exaggerated corporate SLAs.
                        </p>
                    </div>
                </motion.div>

            </div>

            <Footer />
        </div>
    );
};

export default Contact;
