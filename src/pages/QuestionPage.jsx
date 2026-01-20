import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Play, Send, RefreshCw, AlertCircle, CheckCircle2, Copy, FileText, LayoutList, History, Code2 } from 'lucide-react';
import { motion } from 'framer-motion';
import CodeEditor from '../components/dsa/CodeEditor';

export default function QuestionPage() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [problem, setProblem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('description');
    const [code, setCode] = useState('');
    const [language, setLanguage] = useState('javascript');
    const [output, setOutput] = useState(null);
    const [runStatus, setRunStatus] = useState('idle');
    const [activeBottomTab, setActiveBottomTab] = useState('testcases');
    const [submissionResult, setSubmissionResult] = useState(null);

    const submitCode = async () => {
        setActiveBottomTab('console');
        setOutput(null); // Clear previous output
        setSubmissionResult(null); // Clear previous result
        setRunStatus("running");

        try {
            const res = await fetch("http://localhost:5000/api/execute/submit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    code,
                    language,
                    problemId: problem._id
                })
            });

            const data = await res.json();
            setSubmissionResult(data);
            setRunStatus("idle");

        } catch (err) {
            setSubmissionResult({ verdict: "Error", details: err.message });
            setRunStatus("idle");
        }
    };

    // --- Resizing Logic ---
    const [leftWidth, setLeftWidth] = useState(550); // Default approx 45%
    const [editorHeightPercent, setEditorHeightPercent] = useState(65); // Editor uses 65%, Testcases use 35%
    const [isDragging, setIsDragging] = useState(false);

    // Refs for constraints
    const containerRef = useRef(null);
    const rightPanelRef = useRef(null);

    // Constraints
    const MIN_LEFT_WIDTH = 380;
    const MAX_LEFT_WIDTH = 650;

    const startResizingLeft = useCallback((e) => {
        e.preventDefault();
        setIsDragging(true);
        const startX = e.clientX;
        const startWidth = leftWidth;

        const onMouseMove = (moveEvent) => {
            const delta = moveEvent.clientX - startX;
            const newWidth = Math.min(Math.max(startWidth + delta, MIN_LEFT_WIDTH), MAX_LEFT_WIDTH);
            setLeftWidth(newWidth);
        };

        const onMouseUp = () => {
            setIsDragging(false);
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    }, [leftWidth]);

    const startResizingBottom = useCallback((e) => {
        e.preventDefault();
        setIsDragging(true);
        const startY = e.clientY;
        const panelHeight = rightPanelRef.current ? rightPanelRef.current.getBoundingClientRect().height : 800;
        const startPercent = editorHeightPercent;

        const onMouseMove = (moveEvent) => {
            const deltaY = moveEvent.clientY - startY;
            const deltaPercent = (deltaY / panelHeight) * 100;
            const newPercent = Math.min(Math.max(startPercent + deltaPercent, 20), 90);
            setEditorHeightPercent(newPercent);
        };

        const onMouseUp = () => {
            setIsDragging(false);
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    }, [editorHeightPercent]);

    const runCode = async () => {
        setActiveBottomTab('console');
        setOutput(null);
        setSubmissionResult(null);
        setRunStatus("running");

        try {
            const res = await fetch("http://localhost:5000/api/execute/run", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    code,
                    language,
                    stdin: problem?.examples?.[0]?.input || ""
                })
            });

            const data = await res.json();
            const actualOutput = data.stdout || "";
            const rawError = data.stderr || data.compile_output || data.message || data.status;

            // Normalize for comparison
            const normalize = (str) => str ? str.trim().replace(/\r\n/g, "\n") : "";
            const normalizedActual = normalize(actualOutput);
            const normalizedExpected = normalize(problem?.examples?.[0]?.output);

            let verdict = "Accepted";
            let details = "";

            if (rawError) {
                verdict = "Runtime Error";
                details = rawError;
            } else if (normalizedActual !== normalizedExpected) {
                verdict = "Wrong Answer";
                details = `Input: ${problem?.examples?.[0]?.input}\nExpected: ${problem?.examples?.[0]?.output}\nActual: ${actualOutput}`;
            } else {
                details = `Input: ${problem?.examples?.[0]?.input}\nOutput: ${actualOutput}`;
            }

            // Reuse the same submissionResult state for "Run" to get the premium UI
            setSubmissionResult({
                verdict: verdict === "Accepted" ? "Passed" : verdict, // visual distinction for Run
                details: details,
                type: 'run' // distinguish if needed used for styling nuance
            });

            setOutput(actualOutput); // Keep raw output available if needed
            setRunStatus("idle");

        } catch (err) {
            setSubmissionResult({ verdict: "Error", details: "Execution failed: " + err.message });
            setRunStatus("idle");
        }
    };


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
    const languageMap = {
        javascript: "javascript",
        python: "python",
        java: "java",
        cpp: "cpp"
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
                        onClick={runCode}
                        disabled={runStatus === 'running'}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all border ${runStatus === 'running'
                            ? 'bg-[#262626]/50 text-[#737373] border-[#333333] cursor-not-allowed'
                            : 'bg-[#262626] hover:bg-[#333333] text-[#e5e5e5] border-[#333333] hover:border-[#404040]'}`}
                    >
                        {runStatus === 'running' ? (
                            <div className="w-3.5 h-3.5 border-2 border-[#e5e5e5]/30 border-t-[#e5e5e5] rounded-full animate-spin" />
                        ) : (
                            <Play size={14} className="fill-current text-[#e5e5e5]" />
                        )}
                        Run
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={submitCode}
                        disabled={runStatus === 'running'}
                        className="flex items-center gap-2 px-3 py-1.5 bg-[#22c55e]/10 hover:bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/20 hover:border-[#22c55e]/30 rounded-md text-xs font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send size={14} />
                        Submit
                    </motion.button>
                </div>
            </header>

            {/* Main Content Split */}
            <div
                ref={containerRef}
                className={`flex-1 flex overflow-hidden p-2 ${isDragging ? 'select-none' : ''}`}
            >

                {/* Left Panel: Problem Description */}
                <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    style={{ width: leftWidth, flexShrink: 0 }}
                    className="flex flex-col bg-[#1A1A1A] rounded-xl border border-[#262626] overflow-hidden shadow-sm"
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

                    {/* Fixed Title Section */}
                    <div className="px-5 py-4 border-b border-[#262626] bg-[#1A1A1A] shrink-0">
                        <div className="flex items-center justify-between gap-4 mb-3">
                            <h2 className="text-2xl font-bold text-white m-0 tracking-tight leading-tight">
                                {problem.title}
                            </h2>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
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
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-5">
                        <div className="prose prose-invert max-w-none">
                            <div className="text-[#d4d4d4] text-[15px] leading-relaxed space-y-4 font-normal">
                                {problem.description}
                            </div>

                            {problem.examples && problem.examples.length > 0 && (
                                <div className="space-y-4 mt-8">
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
                                <div className="mt-10 pt-4 border-t border-[#262626]">
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

                {/* Resizer Handle (Horizontal) */}
                <div
                    className="w-4 hover:bg-blue-500/20 active:bg-blue-500/40 cursor-col-resize transition-colors flex items-center justify-center -ml-2 -mr-2 z-50 group"
                    onMouseDown={startResizingLeft}
                >
                    <div className="w-1 h-8 rounded-full bg-[#333333] group-hover:bg-blue-500/50 transition-colors" />
                </div>

                {/* Right Panel: Code Editor */}
                <motion.div
                    ref={rightPanelRef}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
                    className="relative flex-1 flex flex-col bg-[#1A1A1A] rounded-xl border border-[#262626] overflow-hidden shadow-sm min-w-0"
                >
                    {/* Top Section: Editor (Flexible Percent Height) */}
                    <div
                        style={{ height: `${editorHeightPercent}%` }}
                        className={`w-full flex flex-col min-h-0 bg-[#1A1A1A] overflow-hidden ${isDragging ? 'pointer-events-none' : ''}`}
                    >
                        {/* Editor Toolbar */}
                        <div className="h-10 bg-[#1A1A1A] border-b border-[#262626] flex items-center justify-between px-3 shrink-0">
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
                            <CodeEditor
                                language={languageMap[language]}
                                code={code}
                                setCode={setCode}
                            />
                        </div>
                    </div>

                    {/* Resizer Handle (Vertical) */}
                    <div
                        className="absolute left-0 right-0 h-4 z-50 cursor-row-resize flex items-center justify-center hover:bg-blue-500/10 active:bg-blue-500/20 transition-colors group"
                        style={{ top: `${editorHeightPercent}%`, transform: 'translateY(-50%)' }}
                        onMouseDown={startResizingBottom}
                    >
                        <div className="h-1 w-12 rounded-full bg-[#333333] group-hover:bg-blue-500/50 transition-colors" />
                    </div>

                    {/* Bottom Panel: Test Cases (Remaining Percent Height) */}
                    <div
                        style={{ height: `${100 - editorHeightPercent}%` }}
                        className={`border-t border-[#262626] bg-[#1A1A1A] flex flex-col shrink-0 overflow-hidden ${isDragging ? 'pointer-events-none' : ''}`}
                    >
                        <div className="flex items-center border-b border-[#262626] px-2 bg-[#1A1A1A] shrink-0">
                            <button
                                onClick={() => setActiveBottomTab('testcases')}
                                className={`px-3 py-2 text-[11px] font-bold border-b-2 flex items-center gap-1.5 transition-colors ${activeBottomTab === 'testcases' ? 'text-white border-[#22c55e]' : 'text-[#737373] border-transparent hover:text-[#a3a3a3]'}`}
                            >
                                <CheckCircle2 size={12} className={activeBottomTab === 'testcases' ? "text-[#22c55e]" : "text-[#737373]"} />
                                Test Cases
                            </button>
                            <button
                                onClick={() => setActiveBottomTab('console')}
                                className={`px-3 py-2 text-[11px] font-bold border-b-2 transition-colors ${activeBottomTab === 'console' ? 'text-white border-[#22c55e]' : 'text-[#737373] border-transparent hover:text-[#a3a3a3]'}`}
                            >
                                Console
                            </button>
                        </div>

                        <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
                            {activeBottomTab === 'console' ? (
                                <div className="font-mono text-[13px] h-full">
                                    {runStatus === 'running' ? (
                                        <div className="flex flex-col items-center justify-center h-full gap-3">
                                            <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                                            <div className="text-[#a3a3a3] italic">Executing test cases...</div>
                                        </div>
                                    ) : submissionResult ? (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={`p-4 rounded-lg border flex flex-col gap-3 ${['Accepted', 'Passed'].includes(submissionResult.verdict)
                                                ? 'bg-green-500/10 border-green-500/20'
                                                : 'bg-red-500/10 border-red-500/20'
                                                }`}
                                        >
                                            <div className="flex items-center gap-2">
                                                {['Accepted', 'Passed'].includes(submissionResult.verdict) ? (
                                                    <CheckCircle2 size={18} className="text-green-500" />
                                                ) : (
                                                    <AlertCircle size={18} className="text-red-500" />
                                                )}
                                                <span className={`text-lg font-bold ${['Accepted', 'Passed'].includes(submissionResult.verdict) ? 'text-green-400' : 'text-red-400'
                                                    }`}>
                                                    {submissionResult.verdict}
                                                </span>
                                            </div>

                                            {submissionResult.details && (
                                                <div className="bg-black/30 p-3 rounded border border-white/5 text-[#e5e5e5] whitespace-pre-wrap font-mono text-xs">
                                                    {submissionResult.details}
                                                </div>
                                            )}
                                        </motion.div>
                                    ) : (
                                        <div className="text-[#525252] italic h-full flex items-center justify-center">
                                            Run or Submit your code to see the output here.
                                        </div>
                                    )}
                                </div>
                            ) : (
                                problem.examples && problem.examples.length > 0 && (
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
                                                <div className="bg-[#141414] rounded-md p-2 max-h-20 overflow-y-auto custom-scrollbar text-[11px] font-mono text-[#d4d4d4] border border-[#262626]">
                                                    {problem.examples[0].input}
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-semibold text-[#737373] uppercase">Expected Output</label>
                                                <div className="bg-[#141414] rounded-md p-2 max-h-20 overflow-y-auto custom-scrollbar text-[11px] font-mono text-[#d4d4d4] border border-[#262626]">
                                                    {problem.examples[0].output}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
