import React from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Target, Shield, Brain, Zap, Users, ArrowRight, Github, Twitter, Linkedin, Activity, ChevronRight, Code2, Globe, Sparkles, Terminal } from 'lucide-react';
import Footer from '../components/Footer';

const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: (i = 0) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }
    })
};

const About = () => {
    const { scrollYProgress } = useScroll();
    const yTransform = useTransform(scrollYProgress, [0, 1], [0, -100]);
    const opacityTransform = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

    const stats = [
        { label: "Development", value: "Active", icon: Activity, desc: "Building the core execution engine." },
        { label: "Architecture", value: "Secure", icon: Shield, desc: "Docker-based container isolation." },
        { label: "Platform Readiness", value: "Pre-Launch", icon: Sparkles, desc: "Final load-testing and infrastructure optimizations." },
        { label: "Target Tiers", value: "Free & Pro", icon: Target, desc: "Structuring plans for public release." }
    ];

    const timeline = [
        { year: "2023", title: "Concept", desc: "Idea formed around secure technical assessment and execution." },
        { year: "2024", title: "Architecture Design", desc: "Execution engine prototyping and infrastructure setup." },
        { year: "2025", title: "Private Build Phase", desc: "Container isolation, analytics foundation, and tier structuring." },
        { year: "2026", title: "Public Launch (Planned)", desc: "Opening platform for Free, Pro, and Elite tiers." }
    ];

    const coreValues = [
        { icon: Shield, title: "Security First", desc: "We prioritize isolated execution and the safe handling of user code." },
        { icon: Zap, title: "Performance Focused", desc: "We aim for efficient execution pipelines and minimal overhead." },
        { icon: Terminal, title: "Developer Experience", desc: "Clear workflows. No unnecessary friction in the testing loop." },
        { icon: Globe, title: "Transparent Growth", desc: "We build in public and evolve based on real engineering feedback." },
        { icon: Code2, title: "Continuous Improvement", desc: "Iterative releases and structured feature refinement." }
    ];

    return (
        <div className="relative min-h-screen bg-[#03040B] selection:bg-indigo-500/30 font-sans text-gray-200 overflow-hidden">

            {/* Ambient Background Glows */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-900/10 rounded-full blur-[150px] animate-[pulse_10s_ease-in-out_infinite]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-violet-900/10 rounded-full blur-[150px] animate-[pulse_12s_ease-in-out_infinite_reverse]" />
                {/* SVG Noise */}
                <div className="absolute inset-0 opacity-[0.015] mix-blend-overlay" style={{ backgroundImage: "url('data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PScwIDAgMjAwIDIwMCcgeG1sbnM9J2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJz48ZmlsdGVyIGlkPSdub2lzZUZpbHRlcic+PGZlVHVyYnVsZW5jZSB0eXBlPSdmcmFjdGFsTm9pc2UnIGJhc2VGcmVxdWVuY3k9JzAuOCcgbnVtT2N0YXZlcz0nNCcgc3RpdGNoVGlsZXM9J3N0aXRjaCcvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPScxMDAlJyBoZWlnaHQ9JzEwMCUnIGZpbHRlcj0ndXJsKCNub2lzZUZpbHRlciknLz48L3N2Zz4=')" }} />
            </div>

            <div className="max-w-7xl mx-auto px-6 pt-32 pb-24 relative z-10">

                {/* 1. Hero Glass Panel */}
                <motion.div
                    initial="hidden" animate="visible" variants={fadeUp}
                    className="relative text-center max-w-4xl mx-auto mb-32"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-sm font-bold tracking-wide mb-8">
                        <Activity size={14} className="animate-pulse" />
                        Currently in Active Development (Launcheds)
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-white via-indigo-100 to-indigo-400 mb-8 tracking-tight">
                        Engineering Simplicity <br className="hidden md:block" /> at Scale.
                    </h1>
                    <p className="text-lg md:text-xl text-gray-400 leading-[1.7] max-w-2xl mx-auto font-medium">
                        We are building a secure execution environment for developer assessments. Designed with Docker-based isolation, powered by modern cloud infrastructure (Vercel & DigitalOcean), and focused on a frictionless core experience.
                    </p>
                    <div className="mt-8 flex justify-center">
                        <div className="w-24 h-1 rounded-full bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
                    </div>
                </motion.div>

                {/* 2. Development Roadmap / Status Section */}
                <motion.div
                    custom={1} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-32"
                >
                    {stats.map((stat, idx) => (
                        <div key={idx} className="group relative p-8 rounded-3xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-[20px] hover:border-indigo-500/30 hover:bg-white/[0.04] transition-all duration-500 overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <stat.icon size={24} className="text-indigo-400 mb-6 relative z-10" />
                            <h3 className="text-2xl font-bold text-white mb-2 relative z-10">
                                {stat.value}
                            </h3>
                            <p className="text-xs font-bold text-indigo-300 uppercase tracking-wider relative z-10 mb-3 block">
                                {stat.label}
                            </p>
                            <p className="text-sm font-medium text-gray-400 relative z-10">
                                {stat.desc}
                            </p>
                        </div>
                    ))}
                </motion.div>

                {/* 3. Company Journey Timeline */}
                <motion.div
                    custom={2} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp}
                    className="mb-32"
                >
                    <h2 className="text-3xl font-bold text-white mb-12 text-center tracking-tight">The Journey</h2>

                    <div className="relative">
                        {/* Connecting Line */}
                        <div className="absolute top-1/2 -translate-y-1/2 left-0 w-full h-px bg-white/10 hidden md:block" />

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
                            {timeline.map((item, idx) => (
                                <motion.div
                                    key={idx}
                                    whileHover={{ y: -5 }}
                                    className="relative p-6 rounded-2xl bg-[#080B14] border border-white/[0.08] backdrop-blur-md shadow-2xl group"
                                >
                                    <div className="absolute -top-3 left-6 px-3 py-1 bg-indigo-500/20 border border-indigo-500/30 rounded-full text-xs font-bold text-indigo-200 backdrop-blur-md">
                                        {item.year}
                                    </div>
                                    <h4 className="text-lg font-bold text-white mt-4 mb-2">{item.title}</h4>
                                    <p className="text-sm text-gray-400 leading-relaxed font-medium">{item.desc}</p>
                                    <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/0 group-hover:ring-indigo-500/50 transition-all duration-300" />
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* 4. Core Values Section */}
                <motion.div
                    custom={3} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp}
                    className="mb-32"
                >
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 tracking-tight">Core Values</h2>
                        <p className="text-gray-400 max-w-2xl mx-auto leading-relaxed font-medium">The principles that dictate our engineering decisions and product philosophy.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-center">
                        {coreValues.map((val, idx) => (
                            <div key={idx} className={`group relative p-8 rounded-3xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-xl hover:-translate-y-1 transition-all duration-300 ${idx === 4 ? "lg:col-span-1 lg:col-start-2" : ""}`}>
                                {/* Hover Glow Light */}
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl" />

                                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6 relative z-10 group-hover:scale-110 transition-transform duration-300">
                                    <val.icon size={22} className="text-indigo-400" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3 relative z-10">{val.title}</h3>
                                <p className="text-gray-400 text-sm leading-[1.7] relative z-10 font-medium">
                                    {val.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </motion.div>


            </div>

            <Footer />
        </div>
    );
};

export default About;
