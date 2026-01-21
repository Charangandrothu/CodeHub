import React from 'react';
import { motion } from 'framer-motion';
import {
    Code2,
    Trophy,
    BrainCircuit,
    Target,
    Activity,
    Sparkles,
    CheckCircle2,
    Zap,
    BarChart2,
    PieChart,
    MessageSquare,
    Lock,
    ArrowRight
} from 'lucide-react';

const Features = () => {
    return (
        <section id="features" className="relative min-h-screen bg-[#0a0a0a] overflow-hidden py-12 sm:py-16">

            {/* Ambient Background */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[10%] left-[-10%] w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[20%] right-[-5%] w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[120px]" />
                <div className="absolute top-[40%] left-[20%] w-[300px] h-[300px] bg-emerald-900/5 rounded-full blur-[80px]" />

                {/* Floating Icons Background */}
                <FloatingIcon icon={Code2} top="15%" left="15%" delay={0} color="text-blue-500/20" />
                <FloatingIcon icon={Trophy} top="25%" right="15%" delay={2} color="text-yellow-500/20" />
                <FloatingIcon icon={BrainCircuit} bottom="20%" left="20%" delay={4} color="text-purple-500/20" />
            </div>

            {/* Features Hero Section */}
            <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 mb-32 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.3 }}
                    transition={{ duration: 0.6 }}
                >
                    <span className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-semibold tracking-wide mb-6">
                        PLATFORM FEATURES
                    </span>
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-6">
                        Everything You Need for <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400">
                            Placement Success
                        </span>
                    </h2>
                    <p className="text-lg text-gray-400 max-w-2xl mx-auto flex flex-wrap justify-center gap-x-6 gap-y-2">
                        <span>🔹 DSA</span>
                        <span>🔹 Contests</span>
                        <span>🔹 Aptitude</span>
                        <span>🔹 Mock Tests</span>
                        <span>🔹 Analytics</span>
                    </p>
                </motion.div>
            </div>

            {/* Feature Sections */}
            <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-32">

                {/* 1. DSA Practice & Learning */}
                <FeatureSection
                    title="Master Data Structures & Algorithms"
                    description="Comprehensive topic-wise practice with curated problems from top product-based companies. Track your mastery across Arrays, Graphs, DP, and more."
                    icon={Code2}
                    gradient="from-blue-600 to-cyan-500"
                    align="left"
                >
                    <div className="space-y-4">
                        <div className="flex gap-3">
                            <TopicCard name="Dynamic Programming" count={145} color="bg-blue-500" />
                            <TopicCard name="Graphs" count={82} color="bg-purple-500" />
                        </div>
                        <div className="flex gap-3">
                            <TopicCard name="Trees & BST" count={96} color="bg-emerald-500" />
                            <TopicCard name="Arrays & Hashing" count={210} color="bg-orange-500" />
                        </div>

                        {/* Fake Code Editor Preview */}
                        <div className="mt-4 rounded-xl bg-[#111] border border-white/10 p-4 font-mono text-xs text-gray-400 shadow-2xl">
                            <div className="flex items-center gap-1.5 mb-3 border-b border-white/5 pb-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-red-500/20" />
                                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20" />
                                <div className="w-2.5 h-2.5 rounded-full bg-green-500/20" />
                            </div>
                            <motion.div
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: false, amount: 0.3 }}
                                variants={{
                                    visible: { transition: { staggerChildren: 0.1 } }
                                }}
                            >
                                <motion.p variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }}><span className="text-purple-400">def</span> <span className="text-blue-400">solve</span>(nums, target):</motion.p>
                                <motion.p variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }} className="pl-4">seen = { }</motion.p>
                                <motion.p variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }} className="pl-4"><span className="text-purple-400">for</span> i, num <span className="text-purple-400">in</span> enumerate(nums):</motion.p>
                                <motion.p variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }} className="pl-8">diff = target - num</motion.p>
                                <motion.p variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }} className="pl-8"><span className="text-purple-400">if</span> diff <span className="text-purple-400">in</span> seen:</motion.p>
                                <motion.p variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }} className="pl-12"><span className="text-purple-400">return</span> [seen[diff], i]</motion.p>
                                <motion.p variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }} className="pl-8">seen[num] = i<span className="animate-pulse inline-block w-1.5 h-3 bg-blue-400 ml-0.5 align-middle"></span></motion.p>
                            </motion.div>
                        </div>
                    </div>
                </FeatureSection>

                {/* 2. DSA Contests */}
                <FeatureSection
                    title="Compete in Live Contests"
                    description="Experience real interview pressure with bi-weekly contests. Climb the global leaderboard and earn badges to showcase your competitive programming skills."
                    icon={Trophy}
                    gradient="from-yellow-500 to-orange-500"
                    align="right"
                >
                    <div className="relative rounded-2xl bg-[#0F0F0F] border border-white/10 p-6 overflow-hidden">
                        {/* Leaderboard Entries */}
                        <div className="space-y-3">
                            <LeaderboardRow rank={1} name="Charan Gandrothu" score={1200} country="🇺🇸" />
                            <LeaderboardRow rank={2} name="Priya Sharma" score={1180} country="🇮🇳" />
                            <LeaderboardRow rank={3} name="Jordan Lee" score={1150} country="🇬🇧" />
                        </div>

                        {/* Countdown Overlay */}
                        <div className="mt-6 flex justify-between items-center bg-white/5 rounded-xl p-3 border border-white/5">
                            <div className="text-xs text-gray-400">Next Contest Starts In:</div>
                            <div className="font-mono text-orange-400 font-bold">04 : 12 : 36</div>
                        </div>
                    </div>
                </FeatureSection>

                {/* 3. Aptitude & Reasoning */}
                <FeatureSection
                    title="Aptitude & Logical Reasoning"
                    description="Don't let aptitude be the bottleneck. Dedicated modules for Quantitative, Logical, and Verbal ability with theory, practice, and timed tests."
                    icon={BrainCircuit}
                    gradient="from-pink-500 to-rose-500"
                    align="left"
                >
                    <div className="grid grid-cols-1 gap-4">
                        <ProgressRing label="Quantitative" percent={75} color="text-pink-500" />
                        <ProgressRing label="Logical Reasoning" percent={60} color="text-purple-500" />
                        <ProgressRing label="Verbal Ability" percent={85} color="text-indigo-500" />
                    </div>
                    <div className="mt-4 flex justify-between text-xs text-gray-500 font-mono px-2">
                        <span>Theory</span>
                        <span>→</span>
                        <span>Practice</span>
                        <span>→</span>
                        <span>Test</span>
                    </div>
                </FeatureSection>

                {/* 4. Mock Tests */}
                <FeatureSection
                    title="Company-Specific Mock Tests"
                    description="Simulate the actual placement drive environment. Full-stack tests including Coding, Aptitude, and MCQs tailored for specific companies."
                    icon={Target}
                    gradient="from-emerald-500 to-green-400"
                    align="right"
                >
                    <div className="relative rounded-2xl bg-[#111] border border-white/10 p-5 shadow-xl">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Mock Assessment</div>
                                <h4 className="text-lg font-bold text-white">Full Stack Developer</h4>
                                <div className="flex gap-2 mt-2">
                                    <span className="px-2 py-0.5 rounded text-[10px] bg-white/10 text-gray-300">Amazon Style</span>
                                    <span className="px-2 py-0.5 rounded text-[10px] bg-red-500/10 text-red-300">Hard</span>
                                </div>
                            </div>
                            <div className="w-12 h-12 rounded-full border-4 border-emerald-500/30 border-t-emerald-500 flex items-center justify-center">
                                <span className="text-[10px] font-bold text-emerald-400">90m</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full w-2/3 bg-emerald-500" />
                            </div>
                            <div className="flex justify-between text-[10px] text-gray-500">
                                <span>Progress</span>
                                <span>66%</span>
                            </div>
                        </div>
                    </div>
                </FeatureSection>

                {/* 5. Analytics */}
                <FeatureSection
                    title="Deep Performance Analytics"
                    description="Understand your strengths and weaknesses with detailed visual reports. Get an 'Interview Readiness Score' to know exactly when you're ready."
                    icon={Activity}
                    gradient="from-violet-500 to-purple-600"
                    align="left"
                >
                    <div className="relative rounded-2xl bg-[#0A0A0A] border border-white/10 p-5 flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-400 font-medium">Readiness Score</span>
                            <span className="text-xl font-bold text-purple-400">84/100</span>
                        </div>
                        {/* Simple Bar Chart */}
                        <div className="flex items-end justify-between h-24 gap-2">
                            {[40, 65, 30, 85, 55, 90, 70].map((h, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ height: 0 }}
                                    whileInView={{ height: `${h}%` }}
                                    transition={{ duration: 0.8, delay: i * 0.1 }}
                                    className="bg-white/10 hover:bg-purple-500/50 w-full rounded-t-sm transition-colors"
                                />
                            ))}
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                            <div className="bg-white/5 rounded p-2 text-center">
                                <div className="text-xs text-gray-500">Strongest</div>
                                <div className="text-sm font-bold text-green-400">Arrays</div>
                            </div>
                            <div className="bg-white/5 rounded p-2 text-center">
                                <div className="text-xs text-gray-500">Weakest</div>
                                <div className="text-sm font-bold text-red-400">Graphs</div>
                            </div>
                        </div>
                    </div>
                </FeatureSection>

                {/* 6. AI Assistance */}
                <FeatureSection
                    title="AI-Powered Assistance"
                    description="Stuck on a problem? Get intelligent hints, complexity analysis, and step-by-step explanations without seeing the full solution."
                    icon={Sparkles}
                    gradient="from-indigo-400 to-cyan-400"
                    align="right"
                >
                    <div className="space-y-3">
                        <div className="flex gap-3 items-end">
                            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                                <Sparkles size={14} />
                            </div>
                            <div className="bg-white/10 rounded-2xl rounded-bl-sm p-3 text-sm text-gray-300 max-w-[80%]">
                                Try using a Hash Map to store the complements. This reduces lookup time to O(1).
                            </div>
                        </div>
                        <div className="flex gap-3 items-end flex-row-reverse">
                            <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
                                <div className="text-[10px] font-bold">You</div>
                            </div>
                            <div className="bg-purple-500/20 rounded-2xl rounded-br-sm p-3 text-sm text-white max-w-[80%]">
                                Oh, right! That makes it O(n) total time?
                            </div>
                        </div>
                        <div className="flex gap-3 items-end">
                            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                                <Sparkles size={14} />
                            </div>
                            <div className="bg-white/10 rounded-2xl rounded-bl-sm p-3 text-sm text-gray-300 max-w-[80%]">
                                Exactly! Would you like to see the code snippet for the map implementation?
                            </div>
                        </div>
                    </div>
                </FeatureSection>
            </div>


        </section>
    );
};

// Sub-components for cleaner code
const FeatureSection = ({ title, description, icon: Icon, gradient, align, children }) => {
    return (
        <div className={`flex flex-col lg:flex-row items-center gap-12 ${align === 'right' ? 'lg:flex-row-reverse' : ''}`}>
            {/* Text Content */}
            <div className="flex-1 space-y-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, margin: "-50px" }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                >
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} p-[1px]`}>
                        <div className="w-full h-full bg-[#0a0a0a] rounded-[15px] flex items-center justify-center">
                            <Icon size={28} className="text-white" />
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: align === 'right' ? 50 : -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: false, margin: "-50px" }}
                    transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
                >
                    <h3 className="text-3xl font-bold text-white mb-4">{title}</h3>
                    <p className="text-gray-400 text-lg leading-relaxed">
                        {description}
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: align === 'right' ? 40 : -40 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: false, margin: "-50px" }}
                    transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
                    className="flex items-center gap-2 text-sm font-medium text-white/50 group cursor-pointer hover:text-white transition-colors"
                >
                    <span>Learn more</span>
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </motion.div>
            </div>

            {/* Visual Content */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: false, margin: "-50px" }}
                transition={{ duration: 0.8, delay: 0.2, type: "spring", bounce: 0.2 }}
                className="flex-1 w-full"
            >
                <div className="relative group perspective-1000">
                    <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-20 blur-3xl group-hover:opacity-30 transition-opacity duration-500`} />
                    <div className="relative bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl hover:border-white/20 transition-colors">
                        {children}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

const TopicCard = ({ name, count, color }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: false, amount: 0.5 }}
        transition={{ duration: 0.5 }}
        className="flex-1 bg-white/5 rounded-lg p-3 border border-white/5 hover:bg-white/10 transition-colors"
    >
        <div className="flex justify-between items-start mb-2">
            <div className={`w-2 h-2 rounded-full ${color}`} />
            <span className="text-[10px] text-gray-500 font-mono">{count}</span>
        </div>
        <div className="text-xs font-medium text-gray-300">{name}</div>
    </motion.div>
);

const LeaderboardRow = ({ rank, name, score, country }) => (
    <motion.div
        initial={{ opacity: 0, x: -10 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: false, amount: 0.5 }}
        transition={{ duration: 0.5, delay: rank * 0.1 }}
        className="flex items-center justify-between text-sm p-2 rounded hover:bg-white/5 transition-colors"
    >
        <div className="flex items-center gap-3">
            <span className={`font-mono font-bold w-4 ${rank === 1 ? 'text-yellow-400' : rank === 2 ? 'text-gray-400' : 'text-orange-400'}`}>#{rank}</span>
            <span className="text-gray-300">{name}</span>
        </div>
        <div className="flex items-center gap-3">
            <span className="font-mono text-white">{score}</span>
            <span>{country}</span>
        </div>
    </motion.div>
);

const ProgressRing = ({ label, percent, color }) => (
    <div className="flex items-center gap-4">
        <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
            <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${percent}%` }}
                transition={{ duration: 1, delay: 0.2 }}
                className={`h-full rounded-full bg-current ${color}`}
            />
        </div>
        <span className={`text-xs font-bold w-12 text-right ${color}`}>{percent}%</span>
        <span className="text-xs text-gray-400 w-24 text-right">{label}</span>
    </div>
);

const CheckItem = ({ text, muted }) => (
    <div className="flex items-center gap-3">
        <div className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${muted ? 'bg-white/10' : 'bg-purple-500/20'}`}>
            <CheckCircle2 size={12} className={muted ? 'text-gray-500' : 'text-purple-400'} />
        </div>
        <span className={`text-sm ${muted ? 'text-gray-500' : 'text-gray-300'}`}>{text}</span>
    </div>
);


const FloatingIcon = ({ icon: Icon, top, left, right, bottom, delay, color }) => (
    <motion.div
        initial={{ y: 0, opacity: 0 }}
        animate={{ y: [-10, 10, -10], opacity: 1 }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay }}
        className={`absolute ${color}`}
        style={{ top, left, right, bottom }}
    >
        <Icon size={40} />
    </motion.div>
);

export default Features;
