import React, { useState, useEffect } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { Search, Info, Clock, Calendar, ShieldCheck, FileText, Share2, Lock, ChevronRight, Activity, User, Terminal, Server, CreditCard, Globe, Archive, UserX, ShieldAlert, Mail, Check } from 'lucide-react';
import Footer from '../components/Footer';

const PrivacyPolicy = () => {
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
    const [searchQuery, setSearchQuery] = useState("");
    const [activeSection, setActiveSection] = useState("");
    const [feedbackGiven, setFeedbackGiven] = useState(false);

    const sections = [
        {
            id: 'information-collection',
            icon: User,
            title: 'Information We Collect & Authentication',
            content: `We collect minimal personal data required to operate CodeHubX. We utilize Firebase Authentication for secure Google Login. When you authenticate, we receive and safely store your name, email address, and Google profile image. We do not require or collect additional personal demographics.`
        },
        {
            id: 'code-submission',
            icon: Terminal,
            title: 'Code Submission Handling',
            content: `When you submit code to solve a problem on our platform, the submission is stored in our database. If you submit a new solution for the exact same problem, your previous submission is safely overwritten. We explicitly do not train AI models on your private source code.`
        },
        {
            id: 'data-storage',
            icon: Server,
            title: 'Data Storage & Cloud Infrastructure',
            content: `Our frontend is hosted on Vercel. All platform data, including user profiles and code submissions, is stored securely within a MongoDB database hosted on DigitalOcean in the India region. Information is transmitted securely over HTTPS.`
        },
        {
            id: 'payments',
            icon: CreditCard,
            title: 'Payments',
            content: `If you upgrade or make a purchase on our platform, payment processing is handled entirely by Razorpay. CodeHubX does not collect, process, or store your credit card or payment routing data on our servers.`
        },
        {
            id: 'analytics',
            icon: Activity,
            title: 'Analytics & Usage Tracking',
            content: `We use Google Analytics to monitor platform performance and usage trends. This includes non-personally identifiable information such as browser type, device type, and page navigation paths. This telemetry helps us debug issues and improve the developer experience.`
        },
        {
            id: 'advertising',
            icon: Share2,
            title: 'Advertising & Cookies',
            content: `CodeHubX displays advertisements served by third-party vendors, including Google AdSense. These vendors use cookies to serve personalized ads based on your prior visits. You can manage or opt out of personalized advertising by visiting Google's Ads Settings.`
        },
        {
            id: 'ip-usage',
            icon: Globe,
            title: 'IP Usage for Currency Detection',
            content: `We briefly check your IP address solely to detect your region for displaying the appropriate currency pricing (₹ for users in India, $ for international users). We do not permanently log IP addresses for tracking or identification purposes.`
        },
        {
            id: 'data-retention',
            icon: Archive,
            title: 'Data Retention Policy',
            content: `We retain your account data and most recent code submissions for as long as your account remains active. Because we overwrite previous code submissions for the same problem, historical code iteration data is not retained.`
        },
        {
            id: 'account-deletion',
            icon: UserX,
            title: 'Account Deletion & User Rights',
            content: `You have the right to request the deletion of your account at any time. Upon confirming your identity (via password or authentication confirmation), your account and all associated data, including code submissions, will be permanently removed from our active database.`
        },
        {
            id: 'childrens-privacy',
            icon: ShieldAlert,
            title: 'Children’s Privacy (13+)',
            content: `CodeHubX is an educational platform intended for users who are 13 years of age or older. We do not knowingly collect personal information from individuals under 13. If we become aware of such data collection, we will delete it immediately.`
        },
        {
            id: 'international-users',
            icon: Globe,
            title: 'International Users',
            content: `While our database is securely hosted in India, CodeHubX is accessible globally. By using the platform, you acknowledge that your data will be transferred to and processed on our infrastructure located in India.`
        },
        {
            id: 'security-practices',
            icon: Lock,
            title: 'Security Practices',
            content: `Code submissions are executed inside isolated Docker-based containers. Each container is securely and automatically destroyed immediately after the execution completes, preventing cross-user environment exposure. Our platform employs industry-standard cloud security practices including HTTPS in transit and provider-level security at rest.`
        },
        {
            id: 'contact',
            icon: Mail,
            title: 'Contact Information',
            content: `If you have questions, concerns, or requests regarding this policy or how your data is handled, please contact our team directly at privacy@codehubx.in.`
        }
    ];

    const filteredSections = sections.filter(sec =>
        sec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sec.content.toLowerCase().includes(searchQuery.toLowerCase())
    );

    useEffect(() => {
        const handleScroll = () => {
            const offsets = sections.map(sec => {
                const el = document.getElementById(sec.id);
                return el ? { id: sec.id, top: el.offsetTop - 200 } : null;
            }).filter(Boolean);

            const scrollPosition = window.scrollY;
            let current = "";
            for (let i = offsets.length - 1; i >= 0; i--) {
                if (scrollPosition >= offsets[i].top) {
                    current = offsets[i].id;
                    break;
                }
            }
            setActiveSection(current);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (id) => {
        const el = document.getElementById(id);
        if (el) {
            window.scrollTo({ top: el.offsetTop - 120, behavior: 'smooth' });
        }
    };

    return (
        <div className="relative min-h-screen bg-[#03040B] font-sans text-gray-200 selection:bg-indigo-500/30 overflow-hidden">
            {/* Scroll Progress Bar */}
            <motion.div
                className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 transform origin-left z-50"
                style={{ scaleX }}
            />

            {/* Ambient Lighting */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[10%] left-[-10%] w-[50%] h-[50%] bg-indigo-900/10 rounded-full blur-[150px] animate-[pulse_10s_ease-in-out_infinite]" />
            </div>

            <div className="max-w-7xl mx-auto px-6 pt-32 pb-24 relative z-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-12">

                {/* Main Content Area */}
                <div className="lg:col-span-8 order-2 lg:order-1">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                        <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-white via-indigo-100 to-indigo-400 mb-6 tracking-tight">
                            Privacy Policy
                        </h1>

                        {/* Meta Badges */}
                        <div className="flex flex-wrap items-center gap-3 mb-10">
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] text-xs font-medium text-gray-400">
                                <Calendar size={14} className="text-indigo-400" /> Last Updated: October 2026
                            </div>
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] text-xs font-medium text-gray-400">
                                <Clock size={14} className="text-indigo-400" /> 5 min read
                            </div>
                        </div>

                        {/* High-level Info Box */}
                        <div className="mb-12 p-6 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex gap-4">
                            <Info size={24} className="text-indigo-400 shrink-0" />
                            <div className="text-sm font-medium text-indigo-100/80 leading-[1.7] space-y-2">
                                <p><strong className="text-indigo-300">TL;DR:</strong> We do not sell your personal data. We explicitly do not train AI models on your private source code.</p>
                                <p>We collect what is absolutely necessary via Google Login (name/email), serve standard ads (AdSense) to support the platform, and track basic anonymous telemetry. Code is executed safely inside isolated container environments that are instantly destroyed after use.</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Policy Sections */}
                    <div className="space-y-8">
                        {filteredSections.length === 0 ? (
                            <div className="p-8 text-center text-gray-500 border border-white/5 rounded-2xl bg-white/[0.01]">
                                No sections found matching "{searchQuery}"
                            </div>
                        ) : (
                            filteredSections.map((sec, idx) => (
                                <motion.section
                                    key={sec.id} id={sec.id}
                                    initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }}
                                    className="p-8 rounded-3xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-[20px] shadow-lg group hover:border-indigo-500/30 transition-colors"
                                    onClick={() => setActiveSection(sec.id)}
                                >
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="p-3 bg-white/[0.03] rounded-xl border border-white/[0.08] group-hover:bg-indigo-500/10 group-hover:border-indigo-500/30 transition-colors">
                                            <sec.icon size={20} className="text-indigo-400" />
                                        </div>
                                        <h2 className="text-2xl font-bold text-white tracking-tight">{sec.title}</h2>
                                    </div>
                                    <p className="text-[17px] text-gray-400 leading-[1.8] font-medium">
                                        {sec.content}
                                    </p>
                                </motion.section>
                            ))
                        )}
                    </div>

                    {/* Feedback Widget */}
                    <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mt-16 pt-8 border-t border-white/[0.08] flex items-center justify-between h-20">
                        {feedbackGiven ? (
                            <motion.p
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="text-sm font-bold text-emerald-400 flex items-center gap-2"
                            >
                                <Check size={18} /> Thank you for your feedback!
                            </motion.p>
                        ) : (
                            <>
                                <p className="text-sm font-medium text-gray-400">Was this policy helpful?</p>
                                <div className="flex gap-2">
                                    <button onClick={() => setFeedbackGiven(true)} className="px-4 py-2 text-xs font-bold rounded-lg bg-white/[0.03] border border-white/[0.08] hover:bg-emerald-500/10 hover:border-emerald-500/30 hover:text-emerald-400 transition-colors">Yes</button>
                                    <button onClick={() => setFeedbackGiven(true)} className="px-4 py-2 text-xs font-bold rounded-lg bg-white/[0.03] border border-white/[0.08] hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 transition-colors">No</button>
                                </div>
                            </>
                        )}
                    </motion.div>
                </div>

                {/* Right Sidebar (Sticky ToC + Search) */}
                <div className="lg:col-span-4 order-1 lg:order-2">
                    <div className="sticky top-28 space-y-6">

                        {/* Search Input */}
                        <div className="relative">
                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                            <input
                                type="text" placeholder="Search policy..."
                                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white/[0.02] border border-white/[0.08] rounded-2xl pl-12 pr-4 py-4 text-sm text-white focus:bg-white/[0.04] focus:border-indigo-500/50 outline-none transition-all shadow-inner"
                            />
                        </div>

                        {/* Table of Contents Box */}
                        <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-[20px] hidden lg:block">
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Contents</h3>
                            <ul className="space-y-2">
                                {sections.map(sec => (
                                    <li key={sec.id}>
                                        <button
                                            onClick={() => scrollToSection(sec.id)}
                                            className={`text-sm w-full text-left font-medium flex items-center gap-2 py-2 px-3 rounded-xl transition-all ${activeSection === sec.id ? 'bg-indigo-500/10 text-indigo-400' : 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.03]'}`}
                                        >
                                            <ChevronRight size={14} className={`transition-transform ${activeSection === sec.id ? 'translate-x-1 opacity-100' : 'opacity-0'}`} />
                                            {sec.title}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>

                    </div>
                </div>

            </div>

            <Footer />
        </div>
    );
};

export default PrivacyPolicy;
