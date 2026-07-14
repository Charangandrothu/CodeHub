import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';
import { 
    Flame, Trophy, Search, ArrowRight, Clock, Brain, Code2, 
    CheckCircle2, Zap, Sparkles, BookMarked, Calendar, Award, 
    Activity, Play, HelpCircle, AlertTriangle, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MockTests = () => {
    const navigate = useNavigate();
    const { currentUser, userData } = useAuth();

    // Data States
    const [mockTests, setMockTests] = useState([]);
    const [attempts, setAttempts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Search and Filter States
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDifficulty, setSelectedDifficulty] = useState('All');

    // Active/Incomplete Attempt to Resume
    const [activeAttempt, setActiveAttempt] = useState(null);
    const [pendingTestId, setPendingTestId] = useState(null);
    const [showWarningModal, setShowWarningModal] = useState(false);

    useEffect(() => {
        if (currentUser) {
            fetchDashboardData();
        }
    }, [currentUser]);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const headers = { 'x-user-uid': currentUser.uid };

            // 1. Fetch mock tests from Node API
            const testsRes = await fetch(`${API_URL}/api/mock-tests`, { headers });
            if (!testsRes.ok) throw new Error("Failed to fetch mock tests");
            const testsList = await testsRes.json();
            setMockTests(testsList.filter(t => t.isActive !== false));

            // 2. Fetch User attempts from Node API
            const attemptsRes = await fetch(`${API_URL}/api/mock-tests/attempts/user/${currentUser.uid}`, { headers });
            if (!attemptsRes.ok) throw new Error("Failed to fetch user attempts");
            const attemptsList = await attemptsRes.json();
            setAttempts(attemptsList);

            // 3. Find if there's any active incomplete test to resume
            const activeTest = attemptsList.find(a => a.isCompleted === false);
            if (activeTest) {
                setActiveAttempt(activeTest);
            } else {
                setActiveAttempt(null);
            }

        } catch (error) {
            console.error("Error fetching mock tests:", error);
        } finally {
            setLoading(false);
        }
    };

    // Calculate User Statistics
    const completedAttempts = attempts.filter(a => a.isCompleted);
    const completedCount = completedAttempts.length;
    const bestScore = completedAttempts.length > 0 
        ? Math.max(...completedAttempts.map(a => a.score || 0)) 
        : 0;
    const avgAccuracy = completedAttempts.length > 0 
        ? Math.round(completedAttempts.reduce((s, a) => s + (a.accuracy || 0), 0) / completedAttempts.length) 
        : 0;

    // Filter & Search Logic
    const filteredMockTests = mockTests.filter(test => {
        const matchesSearch = test.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              test.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesDifficulty = selectedDifficulty === 'All' || test.difficulty === selectedDifficulty;
        return matchesSearch && matchesDifficulty;
    });

    const getDifficultyColor = (diff) => {
        switch(diff) {
            case 'Easy': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
            case 'Medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
            case 'Hard': return 'text-red-400 bg-red-500/10 border-red-500/20';
            default: return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
        }
    };

    // Daily Challenge Mock Test (Always select the first test as default, or random)
    const dailyChallenge = mockTests.length > 0 ? mockTests[0] : null;

    const handleStartTest = (testId) => {
        if (activeAttempt) {
            setPendingTestId(testId);
            setShowWarningModal(true);
        } else {
            navigate(`/mock-tests/test/${testId}`);
        }
    };

    const handleConfirmStart = () => {
        setShowWarningModal(false);
        if (pendingTestId) {
            navigate(`/mock-tests/test/${pendingTestId}`);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 15 },
        visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 25 } }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white pt-24 pb-16 px-4 sm:px-6 lg:px-8 relative selection:bg-purple-500/30 overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="fixed top-20 left-1/4 w-96 h-96 bg-purple-600/5 rounded-full blur-[128px] pointer-events-none hidden sm:block animate-pulse duration-10000" />
            <div className="fixed bottom-20 right-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-[128px] pointer-events-none hidden sm:block animate-pulse duration-10000" />

            <div className="max-w-7xl mx-auto space-y-8 relative z-10">
                {/* Dashboard Welcome Header */}
                <motion.div 
                    initial={{ opacity: 0, y: -10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-xl"
                >
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center gap-1.5">
                                <Sparkles size={11} className="text-purple-400 animate-pulse" />
                                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">Placement Simulation</span>
                            </div>
                            <div className="px-2.5 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center gap-1.5">
                                <Flame size={11} className="text-orange-500" />
                                <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider">
                                    {userData?.stats?.streak > 0 ? `${userData.stats.streak} Day Streak` : "0 Day Streak"}
                                </span>
                            </div>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Placement Mock Arena</h1>
                        <p className="text-zinc-400 text-xs sm:text-sm max-w-xl leading-relaxed">
                            Simulate real placement exams under strict constraints. Test your DSA coding and Aptitude skills simultaneously.
                        </p>
                    </div>

                    {/* Quick Stats Summary Panel */}
                    <div className="flex items-center gap-3 text-xs">
                        <div className="px-4 py-2.5 rounded-xl bg-white/[0.01] border border-white/[0.05] min-w-[100px]">
                            <span className="text-zinc-500 font-bold uppercase tracking-wider text-[8px] block">Completed</span>
                            <span className="text-base font-black text-white mt-0.5">{completedCount} Tests</span>
                        </div>
                        <div className="px-4 py-2.5 rounded-xl bg-white/[0.01] border border-white/[0.05] min-w-[100px]">
                            <span className="text-zinc-500 font-bold uppercase tracking-wider text-[8px] block">Best Score</span>
                            <span className="text-base font-black text-purple-400 mt-0.5">{bestScore}%</span>
                        </div>
                        <div className="px-4 py-2.5 rounded-xl bg-white/[0.01] border border-white/[0.05] min-w-[100px]">
                            <span className="text-zinc-500 font-bold uppercase tracking-wider text-[8px] block">Avg Accuracy</span>
                            <span className="text-base font-black text-emerald-400 mt-0.5">{avgAccuracy}%</span>
                        </div>
                    </div>
                </motion.div>

                {/* Resume Incomplete Active Attempt Banner */}
                {activeAttempt && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-5 rounded-2xl bg-gradient-to-r from-purple-900/20 via-blue-900/10 to-transparent border border-purple-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg shadow-purple-500/5 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-purple-500/5 blur-[80px] pointer-events-none" />
                        <div className="flex items-center gap-4 relative z-10">
                            <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 animate-pulse">
                                <Zap size={20} />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-white">Active Test In Progress!</h4>
                                <p className="text-zinc-400 text-[11px] mt-0.5">
                                    You have an active session for <span className="text-purple-300 font-semibold">{activeAttempt.testName}</span>. Your answers and remaining time are saved.
                                </p>
                            </div>
                        </div>
                        <button 
                            onClick={() => navigate(`/mock-tests/test/${activeAttempt.testId}`)}
                            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer relative z-10 shrink-0"
                        >
                            Resume Session <Play size={10} className="fill-white" />
                        </button>
                    </motion.div>
                )}

                {/* Main Content Grid: Left tests, Right widgets */}
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
                    
                    {/* Left Panel: Search, filters, tests grid */}
                    <div className="space-y-6">
                        
                        {/* Search & Difficulty Filter controls */}
                        <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl border border-white/5 bg-white/[0.01]">
                            <div className="w-full sm:flex-1 relative">
                                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                                <input 
                                    type="text" 
                                    placeholder="Search mock tests by name or target placement..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-zinc-950 border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition-colors"
                                />
                            </div>
                            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto shrink-0 py-1">
                                {['All', 'Easy', 'Medium', 'Hard', 'Mixed'].map(diff => {
                                    const active = selectedDifficulty === diff;
                                    return (
                                        <button
                                            key={diff}
                                            onClick={() => setSelectedDifficulty(diff)}
                                            className={`px-3 py-2 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                                                active 
                                                    ? 'bg-purple-500/10 border-purple-500/30 text-purple-300' 
                                                    : 'bg-transparent border-white/5 text-zinc-400 hover:text-white hover:bg-white/5'
                                            }`}
                                        >
                                            {diff}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Loading Skeletons or Grid */}
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="h-44 rounded-2xl border border-white/5 bg-white/[0.01] animate-pulse" />
                                ))}
                            </div>
                        ) : (
                            <motion.div 
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                className="grid grid-cols-1 md:grid-cols-2 gap-6"
                            >
                                {filteredMockTests.map(test => {
                                    const userAttempts = attempts.filter(a => a.testId === test._id && a.isCompleted);
                                    const hasCompleted = userAttempts.length > 0;
                                    const bestScoreOnTest = hasCompleted ? Math.max(...userAttempts.map(a => a.score)) : null;

                                    return (
                                        <motion.div
                                            key={test._id}
                                            variants={cardVariants}
                                            whileHover={{ y: -4, borderColor: 'rgba(139, 92, 246, 0.25)' }}
                                            className="p-6 rounded-2xl border border-white/[0.06] bg-[#0A0A0A]/85 hover:bg-[#0c0c0c] transition-all duration-300 flex flex-col justify-between group shadow-lg"
                                        >
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <span className={`text-[9px] px-2.5 py-0.5 rounded-full border font-bold uppercase tracking-wider ${getDifficultyColor(test.difficulty)}`}>
                                                        {test.difficulty}
                                                    </span>
                                                    {hasCompleted && (
                                                        <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                                                            <CheckCircle2 size={12} /> Best: {bestScoreOnTest}%
                                                        </span>
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="text-base font-bold text-white tracking-tight group-hover:text-purple-400 transition-colors duration-300">
                                                        {test.name}
                                                    </h3>
                                                    <p className="text-zinc-500 text-[11px] mt-1.5 leading-relaxed line-clamp-2">
                                                        {test.description}
                                                    </p>
                                                </div>

                                                <div className="flex items-center gap-4 border-t border-white/[0.04] pt-4">
                                                    <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-medium">
                                                        <Code2 size={13} className="text-purple-400" />
                                                        <span>{test.dsaCount} Coding Qs</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-medium">
                                                        <Brain size={13} className="text-blue-400" />
                                                        <span>{test.aptitudeCount} Aptitude Qs</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-medium ml-auto">
                                                        <Clock size={12} className="text-zinc-500" />
                                                        <span>{test.timeLimit} mins</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => handleStartTest(test._id)}
                                                className="w-full mt-6 py-2.5 rounded-xl border border-purple-500/20 bg-purple-500/5 group-hover:bg-purple-600 group-hover:text-white transition-all text-xs font-semibold text-purple-400 flex items-center justify-center gap-1.5 shadow-md cursor-pointer hover:brightness-110"
                                            >
                                                Start Practice Test <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
                                            </button>
                                        </motion.div>
                                    );
                                })}

                                {filteredMockTests.length === 0 && (
                                    <div className="col-span-full py-16 text-center text-zinc-500 border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-4">
                                        <BookMarked size={36} className="text-zinc-600" />
                                        <div>
                                            <h4 className="text-sm font-bold text-zinc-400">No mock tests found</h4>
                                            <p className="text-xs text-zinc-600 mt-1">Try adjusting your filters or search keywords.</p>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </div>

                    {/* Right Panel: Daily Challenge, Leaderboard, bookmark suggestions */}
                    <div className="space-y-6">
                        
                        {/* Daily Challenge Card */}
                        {dailyChallenge && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="p-5 rounded-2xl border border-amber-500/20 bg-amber-500/[0.02] flex flex-col justify-between group relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 to-transparent pointer-events-none" />
                                <div className="space-y-3 relative z-10">
                                    <div className="flex items-center justify-between">
                                        <div className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 flex items-center gap-1 text-amber-400 font-bold text-[8px] uppercase tracking-wider">
                                            <Calendar size={10} /> Daily Challenge
                                        </div>
                                        <span className="text-[10px] text-amber-300 font-bold flex items-center gap-0.5">
                                            <Award size={11} className="fill-amber-400/20" /> +50 Streak XP
                                        </span>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-white">{dailyChallenge.name}</h4>
                                        <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed line-clamp-2">{dailyChallenge.description}</p>
                                    </div>
                                    <div className="flex items-center gap-3 text-[10px] text-zinc-400 py-1">
                                        <span className="flex items-center gap-1"><Clock size={11} /> {dailyChallenge.timeLimit}m</span>
                                        <span className="flex items-center gap-1"><Activity size={11} /> {dailyChallenge.difficulty}</span>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handleStartTest(dailyChallenge._id)}
                                    className="w-full mt-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                                >
                                    Attempt Challenge <ArrowRight size={11} />
                                </button>
                            </motion.div>
                        )}

                        {/* Recent History / Recently Attempted */}
                        <div className="p-5 rounded-2xl border border-white/5 bg-white/[0.01]">
                            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Recently Attempted</h3>
                            <div className="space-y-3">
                                {completedAttempts.slice(0, 4).map(att => (
                                    <div key={att._id} className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                                        <div className="min-w-0 flex-1 pr-2">
                                            <h4 className="text-[11px] font-bold text-white truncate">{att.testName}</h4>
                                            <p className="text-[9px] text-zinc-500 mt-0.5">
                                                {att.completedAt ? new Date(att.completedAt).toLocaleDateString() : 'Recent'}
                                            </p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <span className="text-xs font-black text-purple-400 block">{att.score}%</span>
                                            <span className="text-[8px] text-zinc-500 font-medium">Accuracy: {att.accuracy}%</span>
                                        </div>
                                    </div>
                                ))}
                                {completedAttempts.length === 0 && (
                                    <p className="text-xs text-zinc-600 text-center py-4">No recently completed tests.</p>
                                )}
                            </div>
                        </div>

                        {/* AI suggestions based on weak areas */}
                        {completedAttempts.length > 0 && (
                            <div className="p-5 rounded-2xl border border-purple-500/10 bg-purple-500/[0.01]">
                                <div className="flex items-center gap-1.5 text-purple-400 mb-3">
                                    <Sparkles size={13} className="animate-pulse" />
                                    <h3 className="text-xs font-bold uppercase tracking-wider">AI Weak Spot Insights</h3>
                                </div>
                                <p className="text-[10px] text-zinc-400 leading-relaxed mb-3">
                                    Based on your last {completedAttempts.length} attempts, focus on practicing these topics to improve accuracy:
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                    {Array.from(new Set(
                                        completedAttempts.flatMap(a => a.weakAreas || [])
                                    )).slice(0, 3).map(area => (
                                        <span key={area} className="px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[9px] font-semibold uppercase tracking-wider">
                                            {area}
                                        </span>
                                    ))}
                                    {Array.from(new Set(
                                        completedAttempts.flatMap(a => a.weakAreas || [])
                                    )).length === 0 && (
                                        <span className="text-[10px] text-zinc-500 italic">Looking great! No weak areas detected yet.</span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ACTIVE TEST WARNING MODAL */}
            <AnimatePresence>
                {showWarningModal && (
                    <div className="fixed inset-0 flex items-center justify-center z-[150] p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="w-full max-w-md bg-[#0D0F12]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl space-y-6"
                        >
                            <div className="flex items-center justify-between pb-2 border-b border-white/5">
                                <h3 className="text-base font-bold text-white flex items-center gap-2">
                                    <AlertTriangle className="text-amber-500 w-5 h-5" /> Active Test In Progress
                                </h3>
                                <button onClick={() => setShowWarningModal(false)} className="p-1 hover:bg-white/5 rounded-lg text-zinc-400 hover:text-white cursor-pointer"><X className="w-5 h-5" /></button>
                            </div>
                            <div className="text-xs text-zinc-400 space-y-3 leading-relaxed">
                                <p>
                                    You currently have another mock test in progress: <strong className="text-purple-300 font-bold">{activeAttempt.testName}</strong>.
                                </p>
                                <p>
                                    Starting a new test will <strong className="text-amber-400 font-semibold">automatically submit</strong> your active session and calculate its results.
                                </p>
                                <p>Are you sure you want to continue?</p>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-4 border-t border-white/5">
                                <button
                                    onClick={() => setShowWarningModal(false)}
                                    className="px-4 py-2 border border-white/10 rounded-lg hover:bg-white/5 text-zinc-300 cursor-pointer font-medium text-xs transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirmStart}
                                    className="px-4 py-2 bg-white hover:bg-zinc-100 text-zinc-950 font-bold rounded-lg text-[10px] uppercase tracking-wider cursor-pointer transition-all shadow-md"
                                >
                                    Yes, Continue
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MockTests;
