import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { TOPICS } from './Sidebar';
import { AlertCircle, CheckCircle2, FileCode2, Terminal, RefreshCw, ArrowRight, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';
import { API_URL } from '../../config';
import { useAuth } from '../../context/AuthContext';

export default function ContentArea() {
    const { topicId } = useParams();
    const { userData } = useAuth();
    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Default to 'patterns' if no topic is selected
    const activeTopicId = topicId || 'patterns';
    const currentTopic = TOPICS.find(t => t.id === activeTopicId) || TOPICS[0];
    const accentColor = currentTopic?.color || '#3b82f6';

    useEffect(() => {
        fetchProblems();
    }, [activeTopicId]);

    const fetchProblems = async () => {
        try {
            setLoading(true);
            setError(null);
            // Fetch problems filtered by topic
            const response = await fetch(`${API_URL}/api/problems?topic=${activeTopicId}`);

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            setProblems(data || []);
        } catch (err) {
            console.error("Error fetching problems:", err);
            setError("Failed to load problems. Please check if the server is running.");
        } finally {
            setLoading(false);
        }
    };

    const getDifficultyColor = (difficulty) => {
        switch (difficulty?.toLowerCase()) {
            case 'easy':
                return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
            case 'medium':
                return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
            case 'hard':
                return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
            default:
                return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
        }
    };

    const isProblemSolved = (problemId) => {
        return userData?.stats?.solvedProblemIds?.includes(problemId);
    };

    if (loading) {
        return (
            <div className="flex-1 min-w-0 space-y-6">
                <div className="flex items-center justify-between mb-8">
                    <div className="h-8 w-48 bg-white/5 rounded animate-pulse" />
                    <div className="h-8 w-24 bg-white/5 rounded animate-pulse" />
                </div>

                <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="h-20 w-full bg-white/5 rounded-xl animate-pulse border border-white/5" />
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex-1 min-w-0 flex flex-col items-center justify-center p-12 text-center rounded-2xl bg-red-500/5 border border-red-500/10 mt-8">
                <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                    <AlertCircle className="text-red-500" size={24} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Connection Error</h3>
                <p className="text-slate-400 mb-6 max-w-sm">{error}</p>
                <button
                    onClick={fetchProblems}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-all border border-white/10"
                >
                    <RefreshCw size={16} />
                    Try Again
                </button>
            </div>
        );
    }

    const solvedCount = problems.filter(p => userData?.stats?.solvedProblemIds?.includes(p._id)).length;
    const progress = problems.length > 0 ? Math.round((solvedCount / problems.length) * 100) : 0;

    return (
        <div className="flex-1 min-w-0 space-y-8">
            {/* Premium Header Card */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-[#0a0a0a] to-[#111] border border-white/5 rounded-2xl p-5 relative overflow-hidden group"
            >
                <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                    style={{ backgroundColor: `${accentColor}10` }} // 10% opacity
                />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-white mb-1 tracking-tight">
                            <span style={{ color: accentColor }}>{currentTopic.label}</span> Problems
                        </h1>
                        <p className="text-slate-400 text-xs mb-3">Browse and practice coding problems</p>
                        <div className="inline-flex items-center gap-2 text-[10px] font-medium text-slate-500 bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
                            <Terminal size={10} />
                            <span>{problems.length} problems available</span>
                        </div>
                    </div>

                    {/* Progress Stats */}
                    {problems.length > 0 && (
                        <div className="bg-white/5 border border-white/10 rounded-xl p-3 min-w-[200px] backdrop-blur-sm">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                                    <Trophy size={12} className="text-yellow-500" />
                                    Progress
                                </span>
                                <span className="text-lg font-bold text-white leading-none">
                                    {solvedCount} <span className="text-gray-500 text-xs font-normal">/ {problems.length}</span>
                                </span>
                            </div>
                            <div className="relative w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                    className="h-full rounded-full"
                                    style={{ backgroundColor: accentColor, boxShadow: `0 0 10px ${accentColor}40` }}
                                />
                            </div>
                            <div className="flex justify-end mt-1">
                                <span className="text-[10px] font-bold" style={{ color: accentColor }}>{progress}% Completed</span>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Problems List */}
            <div className="space-y-4">
                {problems.length === 0 ? (
                    /* Empty State */
                    <div className="flex flex-col items-center justify-center py-20 bg-[#0a0a0a]/40 rounded-2xl border border-white/5 border-dashed">
                        <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4 rotate-3 transform transition-transform hover:rotate-6">
                            <FileCode2 className="text-slate-400" size={32} />
                        </div>
                        <h3 className="text-xl font-medium text-white mb-2">No problems found</h3>
                        <p className="text-slate-500 text-center max-w-md px-4">
                            We couldn't find any problems at the moment. Check back later or add some via the backend API.
                        </p>
                    </div>
                ) : (
                    /* Problem Rows */
                    problems.map((problem) => (
                        <Link
                            key={problem._id || problem.slug}
                            to={`/problem/${problem.slug}`}
                            className="group relative flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-xl bg-[#0a0a0a]/60 hover:bg-[#0a0a0a] border border-white/5 hover:border-purple-500/20 hover:shadow-[0_0_20px_rgba(168,85,247,0.05)] transition-all duration-300"
                        >
                            <div className="flex-1 min-w-0 mb-4 sm:mb-0">
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-lg font-semibold text-slate-200 group-hover:text-white truncate transition-colors">
                                        {problem.title}
                                    </h3>
                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider border ${getDifficultyColor(problem.difficulty)}`}>
                                        {problem.difficulty}
                                    </span>
                                </div>

                                <div className="flex items-center flex-wrap gap-2">
                                    {problem.tags && problem.tags.map((tag, idx) => (
                                        <span
                                            key={idx}
                                            className="px-2 py-1 text-xs text-slate-500 bg-white/5 rounded-md border border-white/5 group-hover:border-white/10 transition-colors"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center gap-4 sm:ml-6">
                                {isProblemSolved(problem._id) && (
                                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold animate-in fade-in duration-500">
                                        <CheckCircle2 size={14} />
                                        <span>Solved</span>
                                    </div>
                                )}
                                <div className="flex -space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-x-2 group-hover:translate-x-0">
                                    {/* Subtle avatar pile or similar visual for premium feel could go here */}
                                </div>
                                <div className="flex items-center text-sm font-medium text-slate-500 group-hover:text-purple-400 transition-colors">
                                    Solve
                                    <ArrowRight size={16} className="ml-1 transform group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}
