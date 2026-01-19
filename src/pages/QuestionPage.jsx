import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Play, Send, RefreshCw, AlertCircle, CheckCircle2, Copy, FileText, LayoutList, History, Code2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function QuestionPage() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [problem, setProblem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('description');
    const [code, setCode] = useState('');
    const [language, setLanguage] = useState('javascript');

    useEffect(() => {
        const fetchProblem = async () => {
            try {
                setLoading(true);
                const response = await fetch(`http://localhost:5000/api/problems/${slug}`);

                if (!response.ok) {
                    throw new Error('Problem not found');
                }

                const data = await response.json();
                setProblem(data);

                // Set starter code
                if (data.starterCode) {
                    setCode(data.starterCode[language] || data.starterCode.javascript || '');
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (slug) {
            fetchProblem();
        }
    }, [slug, language]);

    if (loading) {
        return (
            <div className="min-h-screen pt-20 flex items-center justify-center bg-[#0a0a0a]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                    <p className="text-gray-400 font-medium">Loading problem...</p>
                </div>
            </div>
        );
    }

    if (error || !problem) {
        return (
            <div className="min-h-screen pt-20 flex flex-col items-center justify-center bg-[#0a0a0a] gap-6">
                <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
                    <AlertCircle size={32} className="text-red-500" />
                </div>
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-white mb-2">Problem Not Found</h1>
                    <p className="text-gray-400">The problem you are looking for does not exist or has been removed.</p>
                </div>
                <button
                    onClick={() => navigate('/dsa')}
                    className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-all border border-white/10 font-medium"
                >
                    Back to Problems
                </button>
            </div>
        );
    }

    const getDifficultyColor = (diff) => {
        switch (diff?.toLowerCase()) {
            case 'easy': return 'text-green-400 bg-green-400/10 border-green-400/20';
            case 'medium': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
            case 'hard': return 'text-red-400 bg-red-400/10 border-red-400/20';
            default: return 'text-gray-400';
        }
    };

    return (
        <div className="h-screen pt-0 bg-[#111111] flex flex-col overflow-hidden text-[#e5e5e5] font-sans selection:bg-neutral-700/30">
            {/* Background Gradients - Very Subtle */}
            <div className="fixed inset-0 pointer-events-none opacity-40">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-neutral-900/20 blur-[120px]" />
            </div>

            {/* Top Bar - Neutral & Clean */}
            <header className="h-14 border-b border-[#262626] bg-[#111111]/90 backdrop-blur-xl flex items-center px-5 justify-between flex-shrink-0 z-50 relative">
                <motion.div
                    onClick={() => navigate('/dsa')}
                    className="flex items-center gap-3 cursor-pointer group"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                >
                    <div className="relative w-8 h-8 flex items-center justify-center rounded-lg bg-[#262626] border border-[#333333] group-hover:border-[#404040] transition-all duration-300">
                        <span className="text-white font-bold text-lg leading-none">C</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold text-[#e5e5e5] tracking-tight group-hover:text-white transition-colors">CodeHub</span>
                    </div>
                    <div className="h-4 w-[1px] bg-[#333333] mx-1" />
                    <span className="text-xs text-[#a3a3a3] font-medium transition-colors">Problem Solving</span>
                </motion.div>

                <div className="flex items-center gap-3">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center gap-2 px-3 py-1.5 bg-[#262626] hover:bg-[#333333] rounded-md text-xs font-medium text-[#e5e5e5] transition-all border border-[#333333] hover:border-[#404040]"
                    >
                        <Play size={14} className="fill-current text-[#e5e5e5]" />
                        Run
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center gap-2 px-3 py-1.5 bg-[#22c55e]/10 hover:bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/20 hover:border-[#22c55e]/30 rounded-md text-xs font-semibold transition-all"
                    >
                        <Send size={14} />
                        Submit
                    </motion.button>
                </div>
            </header>

            {/* Main Content Split */}
            <div className="flex-1 flex overflow-hidden p-3 gap-3">

                {/* Left Panel: Problem Description */}
                <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="w-1/2 flex flex-col min-w-[450px] bg-[#1A1A1A] rounded-xl border border-[#262626] overflow-hidden shadow-sm"
                >
                    {/* Tabs */}
                    <div className="flex items-center border-b border-[#262626] px-1 bg-[#1A1A1A]">
                        {[
                            { id: 'description', label: 'Description', icon: FileText, color: 'text-blue-400' },
                            { id: 'editorial', label: 'Editorial', icon: LayoutList, color: 'text-yellow-400' },
                            { id: 'submissions', label: 'Submissions', icon: History, color: 'text-green-400' }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`relative px-4 py-3 text-xs font-medium transition-colors flex items-center gap-2 group ${activeTab === tab.id
                                    ? 'text-white'
                                    : 'text-[#737373] hover:text-[#a3a3a3]'
                                    }`}
                            >
                                <tab.icon size={14} className={activeTab === tab.id ? tab.color : 'text-[#525252] group-hover:text-[#737373] transition-colors'} />
                                {tab.label}
                                {activeTab === tab.id && (
                                    <motion.div
                                        layoutId="activeTabProblem"
                                        className="absolute bottom-0 left-0 right-0 h-[2px] bg-white"
                                    />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-5">
                        <div className="prose prose-invert max-w-none">
                            <div className="flex items-center justify-between gap-4 mb-4">
                                <h2 className="text-xl font-bold text-white m-0 tracking-tight">
                                    {problem.title}
                                </h2>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 mb-6">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-medium border flex items-center gap-1.5 ${problem.difficulty === 'Easy' ? 'text-[#22c55e] bg-[#22c55e]/10 border-[#22c55e]/20' :
                                    problem.difficulty === 'Medium' ? 'text-[#f59e0b] bg-[#f59e0b]/10 border-[#f59e0b]/20' :
                                        'text-[#ef4444] bg-[#ef4444]/10 border-[#ef4444]/20'
                                    }`}>
                                    {problem.difficulty}
                                </span>
                                {problem.tags && problem.tags.map(tag => (
                                    <span key={tag} className="px-2 py-0.5 bg-[#262626] rounded text-[10px] font-medium text-[#a3a3a3] border border-[#333333]">
                                        {tag}
                                    </span>
                                ))}
                            </div>

                            <div className="text-[#a3a3a3] leading-6 text-sm space-y-3 font-normal">
                                {problem.description}
                            </div>

                            {problem.examples && problem.examples.length > 0 && (
                                <div className="space-y-3 mt-6">
                                    {problem.examples.map((ex, idx) => (
                                        <div key={idx} className="bg-[#141414] rounded-lg p-3 border border-[#262626]">
                                            <h4 className="text-[11px] font-bold text-white mb-2 flex items-center gap-2">
                                                <div className="p-0.5 rounded bg-purple-500/10 border border-purple-500/20">
                                                    <Code2 size={12} className="text-purple-400" />
                                                </div>
                                                Example {idx + 1}
                                            </h4>

                                            <div className="space-y-2 font-mono text-[11px] leading-relaxed">
                                                <div className="flex gap-3">
                                                    <span className="text-[#525252] w-12 font-semibold select-none">Input:</span>
                                                    <span className="text-[#d4d4d4] flex-1">{ex.input}</span>
                                                </div>
                                                <div className="flex gap-3">
                                                    <span className="text-[#525252] w-12 font-semibold select-none">Output:</span>
                                                    <span className="text-[#d4d4d4] flex-1">{ex.output}</span>
                                                </div>
                                                {ex.explanation && (
                                                    <div className="flex gap-3">
                                                        <span className="text-[#525252] w-12 font-semibold select-none">Expl:</span>
                                                        <span className="text-[#a3a3a3] flex-1 font-sans">{ex.explanation}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {problem.constraints && problem.constraints.length > 0 && (
                                <div className="mt-8 pt-4 border-t border-[#262626]">
                                    <h3 className="text-[11px] font-bold text-white mb-2 flex items-center gap-1.5">
                                        Constraints
                                    </h3>
                                    <ul className="grid grid-cols-1 gap-1">
                                        {problem.constraints.map((c, i) => (
                                            <li key={i} className="bg-[#262626]/50 px-2 py-1.5 rounded text-[11px] font-mono text-[#a3a3a3] border border-[#262626] flex items-center gap-2">
                                                <div className="w-1 h-1 rounded-full bg-[#525252]" />
                                                {c}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Right Panel: Code Editor */}
                <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
                    className="w-1/2 flex flex-col bg-[#1A1A1A] rounded-xl border border-[#262626] overflow-hidden shadow-sm"
                >
                    {/* Editor Toolbar */}
                    <div className="h-10 bg-[#1A1A1A] border-b border-[#262626] flex items-center justify-between px-3">
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-[#262626] border border-[#333333]">
                                <div className="w-2 h-2 rounded-full bg-[#22c55e]" />
                                <select
                                    value={language}
                                    onChange={(e) => setLanguage(e.target.value)}
                                    className="bg-transparent text-[11px] font-medium text-[#e5e5e5] focus:outline-none cursor-pointer"
                                >
                                    <option value="javascript">JavaScript</option>
                                    <option value="python">Python</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <button className="p-1.5 hover:bg-[#262626] rounded-md text-[#737373] hover:text-white transition-colors">
                                <Copy size={13} />
                            </button>
                            <button className="p-1.5 hover:bg-[#262626] rounded-md text-[#737373] hover:text-white transition-colors" title="Reset Code">
                                <RefreshCw size={13} />
                            </button>
                        </div>
                    </div>

                    {/* Editor Area */}
                    <div className="flex-1 relative group bg-[#141414]">
                        <div className="absolute left-0 top-0 bottom-0 w-10 border-r border-[#262626] bg-[#1A1A1A] flex flex-col items-end pr-2 pt-4 text-[10px] font-mono text-[#525252] select-none">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map(n => <div key={n} className="leading-6">{n}</div>)}
                        </div>
                        <textarea
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            className="w-full h-full bg-transparent text-[#e5e5e5] pl-14 pr-4 py-4 font-mono text-[13px] resize-none focus:outline-none leading-6 selection:bg-[#262626]"
                            spellCheck="false"
                        />
                    </div>

                    {/* Bottom Panel: Test Cases */}
                    <div className="h-[35%] border-t border-[#262626] bg-[#1A1A1A] flex flex-col">
                        <div className="flex items-center border-b border-[#262626] px-2 bg-[#1A1A1A]">
                            <button className="px-3 py-2 text-[11px] font-bold text-white border-b-2 border-[#22c55e] flex items-center gap-1.5">
                                <CheckCircle2 size={12} className="text-[#22c55e]" />
                                Test Cases
                            </button>
                            <button className="px-3 py-2 text-[11px] font-bold text-[#737373] hover:text-[#a3a3a3] transition-colors">
                                Console
                            </button>
                        </div>

                        <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
                            {problem.examples && problem.examples.length > 0 && (
                                <div className="space-y-4">
                                    {/* Example Tabs (Visual Only for now) */}
                                    {problem.examples.length > 1 && (
                                        <div className="flex gap-2 mb-2">
                                            {problem.examples.map((_, i) => (
                                                <div key={i} className={`px-3 py-1 border rounded-md text-[10px] font-medium cursor-pointer transition-colors ${i === 0 ? 'bg-[#262626] border-[#333333] text-white' : 'border-transparent hover:bg-[#262626] text-[#737373]'}`}>
                                                    Case {i + 1}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="space-y-3">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-semibold text-[#737373] uppercase">Input</label>
                                            <div className="bg-[#141414] rounded-md p-2.5 text-[11px] font-mono text-[#d4d4d4] border border-[#262626]">
                                                {problem.examples[0].input}
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-semibold text-[#737373] uppercase">Expected Output</label>
                                            <div className="bg-[#141414] rounded-md p-2.5 text-[11px] font-mono text-[#d4d4d4] border border-[#262626]">
                                                {problem.examples[0].output}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
