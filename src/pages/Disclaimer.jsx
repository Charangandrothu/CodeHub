import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, FileWarning, ExternalLink, Activity, BookOpen, Handshake, ChevronDown } from 'lucide-react';
import Footer from '../components/Footer';

const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (i = 0) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }
    })
};

const Disclaimer = () => {
    const [expandedClause, setExpandedClause] = useState('general');

    const clauses = [
        {
            id: 'general',
            icon: BookOpen,
            title: 'General Information',
            content: `The information provided by CodeHubX ("we," "us," or "our") on our platform is for general informational and educational purposes only. All code snippets, solutions, and tutorials are provided in good faith. However, we make no representation or warranty of any kind, express or implied, regarding the accuracy, adequacy, validity, reliability, or completeness of any information on the Site.`
        },
        {
            id: 'liability',
            icon: AlertCircle,
            title: 'Liability Disclaimer',
            content: `Under no circumstance shall we have any liability to you for any loss or damage of any kind incurred as a result of the use of the platform or reliance on any information provided on the platform. Your use of the platform and your reliance on any information on the site is solely at your own risk. Remote code execution environments are provided "as is" without SLA for free-tier users.`
        },
        {
            id: 'external',
            icon: ExternalLink,
            title: 'External Links & Third Parties',
            content: `The platform may contain links to other websites or content belonging to or originating from third parties. Such external links are not investigated, monitored, or checked for accuracy by us. We do not warrant, endorse, or assume responsibility for the accuracy or reliability of any information offered by third-party websites linked through the platform.`
        },
        {
            id: 'accuracy',
            icon: Activity,
            title: 'System Accuracy & Uptime',
            content: `While we strive for 99.9% uptime, we do not guarantee that the application, code compilation servers, or analytics dashboards will be available at all times. Service interruptions may occur due to maintenance, system updates, or factors beyond our control.`
        }
    ];

    return (
        <div className="relative min-h-screen bg-[#03040B] font-sans selection:bg-rose-500/30 overflow-hidden text-gray-200">
            {/* Ambient Lighting */}
            <div className="fixed inset-0 pointer-events-none z-0">
                {/* Red/Amber subtle glows for disclaimer theme */}
                <div className="absolute top-[0%] right-[-10%] w-[50%] h-[50%] bg-rose-900/10 rounded-[100%] blur-[160px] opacity-70" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-900/10 rounded-[100%] blur-[160px] opacity-80" />
                <div className="absolute inset-0 opacity-[0.015] mix-blend-overlay" style={{ backgroundImage: "url('data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PScwIDAgMjAwIDIwMCcgeG1sbnM9J2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJz48ZmlsdGVyIGlkPSdub2lzZUZpbHRlcic+PGZlVHVyYnVsZW5jZSB0eXBlPSdmcmFjdGFsTm9pc2UnIGJhc2VGcmVxdWVuY3k9JzAuOCcgbnVtT2N0YXZlcz0nNCcgc3RpdGNoVGlsZXM9J3N0aXRjaCcvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPScxMDAlJyBoZWlnaHQ9JzEwMCUnIGZpbHRlcj0ndXJsKCNub2lzZUZpbHRlciknLz48L3N2Zz4=')" }} />
            </div>

            <div className="max-w-4xl mx-auto px-6 pt-32 pb-24 relative z-10 w-full">

                {/* Hero / Warning Banner */}
                <motion.div
                    initial="hidden" animate="visible" variants={fadeUp}
                    className="mb-16 relative"
                >
                    <div className="absolute -inset-1 bg-gradient-to-r from-rose-500/20 to-orange-500/20 rounded-3xl blur-md opacity-30" />
                    <div className="relative p-10 rounded-3xl bg-rose-950/20 border border-rose-500/30 backdrop-blur-2xl shadow-2xl flex flex-col md:flex-row items-center md:items-start gap-8 text-center md:text-left overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 rounded-full blur-[80px]" />

                        <div className="w-16 h-16 shrink-0 bg-rose-500/20 border border-rose-500/40 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(244,63,94,0.3)] relative z-10">
                            <FileWarning size={32} className="text-rose-400 animate-pulse" />
                        </div>

                        <div className="relative z-10 flex-1">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-[10px] font-bold text-rose-300 uppercase tracking-widest mb-4">
                                Legal Disclaimer
                            </div>
                            <h1 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-white to-rose-200 mb-4 tracking-tight">
                                Important Notice
                            </h1>
                            <p className="text-[17px] text-rose-100/70 leading-[1.8] font-medium">
                                The information and code execution services on this platform are provided "as-is". Please read the following carefully to understand our specific liability limitations, service guarantees, and data accuracy policies.
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Quick Summary Section */}
                <motion.div
                    custom={1} initial="hidden" animate="visible" variants={fadeUp}
                    className="mb-16 p-8 rounded-3xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-[20px] shadow-lg"
                >
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2 tracking-tight">
                        <Activity size={20} className="text-indigo-400" /> Executive Summary
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-[15px] font-medium text-gray-400 leading-[1.8]">
                        <div className="pl-4 border-l-2 border-indigo-500/30">
                            <strong>No Warranties:</strong> All code execution and platform functionality is provided strictly without express warranties of performance or uptime, unless explicitly stated in an SLA contract.
                        </div>
                        <div className="pl-4 border-l-2 border-indigo-500/30">
                            <strong>Educational Use:</strong> Solutions and editorial content are meant for educational insight. They may not represent the absolute optimal production-level pattern.
                        </div>
                    </div>
                </motion.div>

                {/* Expandable Detailed Clauses */}
                <div className="space-y-4 mb-20">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6 ml-2">Detailed Clauses</h3>
                    {clauses.map((clause, idx) => (
                        <motion.div
                            custom={idx + 2} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeUp}
                            key={clause.id}
                            className="rounded-2xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-xl hover:bg-white/[0.04] transition-colors overflow-hidden"
                        >
                            <button
                                onClick={() => setExpandedClause(expandedClause === clause.id ? null : clause.id)}
                                className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                                        <clause.icon size={18} />
                                    </div>
                                    <h4 className="text-[17px] font-bold text-white tracking-tight">{clause.title}</h4>
                                </div>
                                <ChevronDown
                                    size={20}
                                    className={`text-gray-500 transition-transform duration-300 ${expandedClause === clause.id ? 'rotate-180 text-indigo-400' : ''}`}
                                />
                            </button>

                            <AnimatePresence>
                                {expandedClause === clause.id && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: 'easeOut' }}
                                    >
                                        <div className="px-6 pb-6 pt-2">
                                            <div className="pl-14 text-[16px] text-gray-400 leading-[1.8] font-medium border-t border-white/[0.03] pt-6">
                                                {clause.content}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>

                {/* Trust Reinforcement Section */}
                <motion.div
                    custom={8} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeUp}
                    className="p-10 rounded-3xl bg-gradient-to-br from-indigo-900/20 to-transparent border border-indigo-500/20 text-center relative overflow-hidden backdrop-blur-2xl"
                >
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
                    <div className="flex justify-center mb-6">
                        <div className="w-14 h-14 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
                            <Handshake size={28} />
                        </div>
                    </div>
                    <h3 className="text-2xl font-bold tracking-tight text-white mb-4">Our Commitment to Transparency</h3>
                    <p className="text-gray-400 text-sm font-medium leading-[1.8] max-w-xl mx-auto">
                        While legalese is necessary to protect our platform and community, CodeHubX remains fundamentally committed to transparent, fair, and reliable engineering practices. If you spot a discrepancy or have concerns regarding our policies, please reach out to our legal team.
                    </p>
                </motion.div>

            </div>

            <Footer />
        </div>
    );
};

export default Disclaimer;
