import React from 'react';
import { motion } from 'framer-motion';
import { Target, Sparkles, Rocket, Eye, Brain, BarChart3, Map, Zap, BookOpen, Calculator, FlaskConical, ExternalLink } from 'lucide-react';
import Footer from '../components/Footer';

const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (i) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1] }
    })
};

const GlassCard = ({ children, className = '', index = 0 }) => (
    <motion.div
        custom={index}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={fadeUp}
        className={`relative group ${className}`}
    >
        <div className="relative p-6 sm:p-8 rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm hover:bg-white/[0.05] hover:border-emerald-500/20 transition-all duration-500 h-full">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">{children}</div>
        </div>
    </motion.div>
);

const DifferentiatorCard = ({ icon: Icon, title, description, index }) => (
    <GlassCard index={index}>
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 mb-4">
            <Icon size={22} className="text-emerald-400" />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
        <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
    </GlassCard>
);

const UpcomingCard = ({ icon: Icon, title, description, index }) => (
    <GlassCard index={index}>
        <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-teal-500/10 border border-teal-500/20">
                <Icon size={18} className="text-teal-400" />
            </div>
            <div>
                <h3 className="text-base font-bold text-white">{title}</h3>
                <span className="text-[10px] font-medium text-teal-400 bg-teal-400/10 px-2 py-0.5 rounded-full">Coming Soon</span>
            </div>
        </div>
        <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
    </GlassCard>
);

const SocialLink = ({ href, label, children }) => (
    <motion.a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        className="group relative flex items-center gap-3 px-6 py-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm hover:bg-white/[0.05] hover:border-emerald-500/30 transition-all duration-300"
    >
        {/* Hover glow */}
        <div className="absolute inset-0 rounded-2xl bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl" />
        <div className="relative z-10 flex items-center gap-3">
            {children}
            <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">{label}</span>
            <ExternalLink size={14} className="text-gray-500 group-hover:text-emerald-400 transition-colors" />
        </div>
    </motion.a>
);

const About = () => {
    return (
        <div className="relative min-h-screen bg-[#0a0a0a] pt-28 pb-20 overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/3 w-[800px] h-[500px] bg-emerald-900/15 rounded-full blur-[120px] opacity-60" />
                <div className="absolute bottom-1/4 right-0 w-[600px] h-[600px] bg-teal-900/10 rounded-full blur-[120px] opacity-40" />
                <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-cyan-900/10 rounded-full blur-[100px] opacity-30" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]" />
            </div>

            <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6">
                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                    className="text-center mb-20"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
                        <Sparkles size={14} className="text-emerald-400" />
                        <span className="text-xs font-medium text-emerald-300">Placement Preparation Platform</span>
                    </div>
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-emerald-100 to-emerald-300">
                            About CodeHubX
                        </span>
                    </h1>
                    <p className="text-gray-400 text-base sm:text-lg max-w-3xl mx-auto leading-relaxed">
                        CodeHubX is a structured placement preparation platform focused on helping students improve
                        problem-solving skills through curated DSA problems, AI-powered solution analysis, performance
                        analytics, and structured learning paths.
                    </p>
                </motion.div>

                {/* Our Mission */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                    className="mb-20"
                >
                    <div className="relative p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-emerald-500/[0.07] to-teal-500/[0.03] border border-emerald-500/[0.12] backdrop-blur-sm">
                        <div className="absolute top-6 right-8 opacity-10">
                            <Target size={80} className="text-emerald-400" />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/25">
                                    <Target size={24} className="text-emerald-400" />
                                </div>
                                <h2 className="text-2xl sm:text-3xl font-bold text-white">Our Mission</h2>
                            </div>
                            <p className="text-gray-300 text-base sm:text-lg leading-relaxed max-w-3xl">
                                To provide structured, measurable, and optimization-driven placement preparation — empowering
                                every student to build confidence, track their progress, and crack their dream placements
                                with data-backed insights and AI-powered guidance.
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* What Makes Us Different */}
                <div className="mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-10"
                    >
                        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">What Makes Us Different</h2>
                        <p className="text-gray-500 text-sm max-w-xl mx-auto">Empowering your preparation with cutting-edge technology</p>
                    </motion.div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <DifferentiatorCard
                            icon={Brain}
                            title="AI-Powered Complexity Insights"
                            description="Get real-time analysis of your solution's time and space complexity with detailed explanations, powered by multiple AI providers."
                            index={0}
                        />
                        <DifferentiatorCard
                            icon={BarChart3}
                            title="Performance Analytics"
                            description="Track your progress with comprehensive analytics — submission heatmaps, accuracy trends, topic-wise performance, and coding streak metrics."
                            index={1}
                        />
                        <DifferentiatorCard
                            icon={Map}
                            title="Structured Learning Roadmap"
                            description="Follow a curated, topic-wise learning path designed to systematically build your problem-solving skills from beginner to advanced."
                            index={2}
                        />
                        <DifferentiatorCard
                            icon={Zap}
                            title="Premium Optimization Guidance"
                            description="Pro users get advanced hints, optimal solution breakdowns, and detailed performance optimization suggestions tailored to their skill level."
                            index={3}
                        />
                    </div>
                </div>

                {/* Upcoming Features */}
                <div className="mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-10"
                    >
                        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Upcoming Features</h2>
                        <p className="text-gray-500 text-sm max-w-xl mx-auto">Building the complete placement ecosystem</p>
                    </motion.div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                        <UpcomingCard
                            icon={BookOpen}
                            title="Mock Tests"
                            description="Company-specific mock tests simulating real placement exam patterns with timed assessments."
                            index={0}
                        />
                        <UpcomingCard
                            icon={FlaskConical}
                            title="SQL Practice"
                            description="Interactive SQL query challenges with real-time evaluation and performance scoring."
                            index={1}
                        />
                        <UpcomingCard
                            icon={Calculator}
                            title="Aptitude Prep"
                            description="Comprehensive aptitude preparation covering quantitative, logical reasoning, and verbal ability."
                            index={2}
                        />
                    </div>
                </div>

                {/* Vision for the Future */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                    className="mb-20"
                >
                    <div className="relative p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-teal-500/[0.05] to-cyan-500/[0.03] border border-teal-500/[0.1] backdrop-blur-sm">
                        <div className="absolute bottom-6 right-8 opacity-10">
                            <Eye size={80} className="text-teal-400" />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-teal-500/15 border border-teal-500/25">
                                    <Eye size={24} className="text-teal-400" />
                                </div>
                                <h2 className="text-2xl sm:text-3xl font-bold text-white">Vision for the Future</h2>
                            </div>
                            <p className="text-gray-300 text-base sm:text-lg leading-relaxed max-w-3xl">
                                Our vision is to become a complete placement ecosystem — combining coding practice, aptitude
                                preparation, advanced analytics, AI mentorship, and company-specific mock tests into a single,
                                unified platform that guides students from day one to their dream placement offer.
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Connect With Us */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                    className="text-center"
                >
                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Connect With Us</h2>
                    <p className="text-gray-500 text-sm mb-8">Follow us for updates, tips, and community highlights</p>

                    <div className="flex flex-wrap items-center justify-center gap-4">
                        <SocialLink href="https://x.com/CodeHubx" label="Follow on X (Twitter)">
                            {/* X/Twitter Icon */}
                            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 border border-white/10 group-hover:bg-emerald-500/10 group-hover:border-emerald-500/20 transition-all duration-300">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-gray-400 group-hover:text-emerald-400 transition-colors">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                </svg>
                            </div>
                        </SocialLink>

                        <SocialLink href="https://www.linkedin.com/company/111519342/" label="Connect on LinkedIn">
                            {/* LinkedIn Icon */}
                            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 border border-white/10 group-hover:bg-emerald-500/10 group-hover:border-emerald-500/20 transition-all duration-300">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-gray-400 group-hover:text-emerald-400 transition-colors">
                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                </svg>
                            </div>
                        </SocialLink>
                    </div>
                </motion.div>
            </div>
            <Footer />
        </div>
    );
};

export default About;
