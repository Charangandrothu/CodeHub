import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Play, Send, RefreshCw, AlertCircle, CheckCircle2, Copy, FileText, LayoutList, History, Code2, Check, X, Zap, Clock, Cpu, TrendingUp, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CodeEditor from '../components/dsa/CodeEditor';
import TestCasesPanel from '../components/dsa/TestCasesPanel';
import SubmissionResultPanel from '../components/dsa/SubmissionResultPanel';
import { useAuth } from '../context/AuthContext';
import logo_img from '../assets/logo_img.png';
import { API_URL } from '../config';

export default function QuestionPage() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { currentUser, userData, refreshUserData } = useAuth(); // userData contains isPro status
    const [problem, setProblem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('description');
    const [language, setLanguage] = useState(() => localStorage.getItem("codehub-language") || "javascript");
    const [code, setCode] = useState(() => {
        if (!slug) return '';
        const saved = localStorage.getItem(`codehub-code-${slug}-${localStorage.getItem("codehub-language") || "javascript"}`);
        return saved || '';
    });
    const [output, setOutput] = useState(null);
    const [runStatus, setRunStatus] = useState('idle');
    const [activeBottomTab, setActiveBottomTab] = useState('testcases');
    const [activeTestCase, setActiveTestCase] = useState(0);
    const [submissionResult, setSubmissionResult] = useState(null);
    const [testCaseResults, setTestCaseResults] = useState(null); // Stores results for sample cases

    const handleLanguageChange = (e) => {
        const newLang = e.target.value;
        setLanguage(newLang);

        // Immediately load code for the new language to prevent saving old code to new language key
        if (slug) {
            const savedCode = localStorage.getItem(`codehub-code-${slug}-${newLang}`);
            if (savedCode) {
                setCode(savedCode);
            } else if (problem && problem.starterCode) {
                setCode(problem.starterCode[newLang] || problem.starterCode.javascript || '');
            } else {
                setCode('');
            }
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
        // Switch to Test Cases tab to show results
        setActiveBottomTab('testcases');
        setRunStatus("running");
        setTestCaseResults(null);

        // Prepare promises for all examples
        const examples = problem?.examples || [];
        if (examples.length === 0) {
            setRunStatus("idle");
            return;
        }

        try {
            const promises = examples.map(async (example, index) => {
                try {
                    const res = await fetch(`${API_URL}/api/execute/run`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            code,
                            language,
                            stdin: example.input
                        })
                    });

                    const data = await res.json();

                    // Helper to normalize strings for comparison
                    const normalize = (str) => str ? str.trim().replace(/\r\n/g, "\n") : "";
                    const actualOutput = normalize(data.stdout || "");
                    const expectedOutput = normalize(example.output);

                    let status = "Accepted";
                    if (data.stderr || data.compile_output) {
                        status = "Runtime Error";
                    } else if (actualOutput !== expectedOutput) {
                        status = "Wrong Answer";
                    }

                    return {
                        status,
                        input: example.input,
                        expected: example.output,
                        actual: data.stdout || "",
                        error: data.stderr || data.compile_output || null
                    };

                } catch (err) {
                    return {
                        status: "Error",
                        input: example.input,
                        expected: example.output,
                        actual: "",
                        error: err.message
                    };
                }
            });

            const results = await Promise.all(promises);
            setTestCaseResults(results);
            setRunStatus("idle");

        } catch (err) {
            console.error(err);
            setRunStatus("idle");
        }
    };

    const submitCode = async () => {
        // Optimistic Pro Check (Fast)
        if (currentUser && userData && !userData.isPro) {
            navigate('/pricing');
            return;
        }

        setRunStatus("submitting");
        setActiveTab("submissions");
        setSubmissionResult(null);

        try {
            const res = await fetch(`${API_URL}/api/execute/submit`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    code,
                    language,
                    problemId: problem._id,
                    userId: currentUser?.uid // Pass Firebase UID
                })
            });

            const data = await res.json();

            if (!res.ok) {
                // Handle Pro Restriction (403) or other errors
                if (res.status === 403) {
                    setSubmissionResult({
                        verdict: "Restricted", // Custom verdict for UI
                        details: data.details || data.error,
                        type: 'submit'
                    });
                } else {
                    setSubmissionResult({ verdict: "Error", details: data.error || "Submission failed", type: 'submit' });
                }
                setRunStatus("idle");
                return;
            }

            // If Accepted/Passed, refresh user data to update 'Solved' status in DSA page
            if (['Accepted', 'Passed'].includes(data.verdict)) {
                if (refreshUserData) refreshUserData();
            }

            setSubmissionResult({
                verdict: data.verdict,
                details: data.stderr || "",
                failedTestCase: data.failedTestCase,
                time: data.time ? `${(parseFloat(data.time) * 1000).toFixed(0)}` : "N/A", // Send pure number string
                memory: data.memory ? `${(parseFloat(data.memory) / 1024).toFixed(1)}` : "N/A", // Send pure number string
                passedTestCases: data.passedTestCases,
                totalTestCases: data.totalTestCases,
                type: 'submit'
            });

            setRunStatus("idle");

        } catch (err) {
            setSubmissionResult({ verdict: "Error", details: err.message, type: 'submit' });
            setRunStatus("idle");
        }
    };


    // Save code and language changes
    useEffect(() => {
        if (slug) {
            localStorage.setItem(`codehub-code-${slug}-${language}`, code);
        }
        localStorage.setItem("codehub-language", language);
    }, [code, language, slug]);

    useEffect(() => {
        const fetchProblem = async () => {
            try {
                // If we already have the problem and it matches the slug, just update code for language
                if (problem && problem.slug === slug) {
                    const savedCode = localStorage.getItem(`codehub-code-${slug}-${language}`);
                    if (savedCode) {
                        setCode(savedCode);
                    } else if (problem.starterCode) {
                        setCode(problem.starterCode[language] || problem.starterCode.javascript || '');
                    }
                    return;
                }

                setLoading(true);
                const response = await fetch(`${API_URL}/api/problems/${slug}`);

                if (!response.ok) {
                    throw new Error('Problem not found');
                }

                const data = await response.json();
                setProblem(data);

                // Set code from storage or starter
                const savedCode = localStorage.getItem(`codehub-code-${slug}-${language}`);
                if (savedCode) {
                    setCode(savedCode);
                } else if (data.starterCode) {
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

    // Refs to hold latest runCode/submitCode functions to avoid stale closures in event listener
    const runCodeRef = useRef(runCode);
    const submitCodeRef = useRef(submitCode);

    useEffect(() => {
        runCodeRef.current = runCode;
        submitCodeRef.current = submitCode;
    }, [runCode, submitCode]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            // CTRL + '
            if (e.ctrlKey && e.key === "'") {
                e.preventDefault();
                runCodeRef.current();
            }

            // CTRL + Enter
            if (e.ctrlKey && e.key === "Enter") {
                e.preventDefault();
                submitCodeRef.current();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    // --- Server Wake-up & Time Tracking ---
    useEffect(() => {
        // 0. Wake up server immediately on load (Fire & Forget)
        // This ensures Render/Heroku is awake by the time we need to sync data
        fetch(`${API_URL}/api/health`).catch(() => { });

        if (!currentUser) return;

        const SYNC_INTERVAL = 5 * 60 * 1000; // Sync every 5 minutes
        const ONE_MINUTE = 60 * 1000;

        // Ref to track unsynced minutes locally
        let unsyncedMinutes = 0;
        let intervalId;

        // Function to push data to server
        const syncTime = async () => {
            if (unsyncedMinutes > 0 && document.visibilityState === 'visible') {
                const minutesToSend = unsyncedMinutes;
                unsyncedMinutes = 0; // Reset immediately to avoid double sending

                try {
                    // Use fetch with keepalive for reliability on page exit
                    fetch(`${API_URL}/api/users/update-time`, {
                        method: 'POST',
                        body: JSON.stringify({
                            uid: currentUser.uid,
                            minutes: minutesToSend
                        }),
                        headers: { 'Content-Type': 'application/json' },
                        keepalive: true
                    });
                } catch (err) {
                    // If fail, add back (simple retry logic)
                    unsyncedMinutes += minutesToSend;
                    console.error("Failed to sync time:", err);
                }
            }
        };

        // 1. Tick every minute to update local counter
        intervalId = setInterval(() => {
            if (!document.hidden) {
                unsyncedMinutes += 1;

                // If we hit the batch size (5 mins), sync
                if (unsyncedMinutes >= 5) {
                    syncTime();
                }
            }
        }, ONE_MINUTE);

        // 2. Sync on tab close / navigation
        const handleVisibilityChange = () => {
            if (document.hidden) {
                syncTime();
            }
        };

        // 3. Sync on component unmount
        return () => {
            clearInterval(intervalId);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            syncTime(); // Final sync attempt
        };
    }, [currentUser]);

    // Add listener separately to ensure clean mount/unmount logic for events
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                // We reference the logic inside the main effect via event listener, 
                // but simpler to just auto-save on hide here if needed or let the main interval handle it.
                // The main effect handles visibility logic via the interval check.
            }
        };
        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
    }, []);

    // --- Smart Loading State ---
    const [longLoading, setLongLoading] = useState(false);

    useEffect(() => {
        let timer;
        if (loading) {
            timer = setTimeout(() => setLongLoading(true), 3000); // If loading > 3s, show "Waking up"
        } else {
            setLongLoading(false);
        }
        return () => clearTimeout(timer);
    }, [loading]);

    if (loading) {
        return (
            <div className="min-h-screen pt-20 flex flex-col items-center justify-center bg-[#0a0a0a] gap-4">
                <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                <div className="text-center">
                    <p className="text-gray-300 font-medium text-lg">Loading problem...</p>
                    {longLoading && (
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-gray-500 text-sm mt-2 max-w-xs mx-auto"
                        >
                            Server is waking up from sleep mode.<br />This may take up to 60 seconds.
                        </motion.p>
                    )}
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
                    <img
                        src={logo_img}
                        alt="CodeHubx"
                        className="w-8 h-8 rounded-lg object-contain"
                    />
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold text-[#e5e5e5] tracking-tight group-hover:text-white transition-colors">CodeHubx</span>
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

                    {/* Fixed Title Section - Hidden on Submissions Tab */}
                    {activeTab !== 'submissions' && (
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
                    )}

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-5">
                        {activeTab === 'description' && (
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
                                                        <span className="text-[#525252] w-12 font-semibold select-none pt-1">Input:</span>
                                                        <pre className="text-[#d4d4d4] flex-1 font-mono whitespace-pre-wrap font-sans">{ex.input}</pre>
                                                    </div>
                                                    <div className="flex gap-3">
                                                        <span className="text-[#525252] w-12 font-semibold select-none pt-1">Output:</span>
                                                        <pre className="text-[#d4d4d4] flex-1 font-mono whitespace-pre-wrap text-emerald-400">{ex.output}</pre>
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
                        )}

                        {activeTab === 'submissions' && (
                            <div className="h-full flex flex-col">
                                {runStatus === 'submitting' ? (
                                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                                        <div className="relative mb-6">
                                            <div className="w-16 h-16 border-4 border-[#22c55e]/20 border-t-[#22c55e] rounded-full animate-spin" />
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <Zap size={20} className="text-[#22c55e] animate-pulse" />
                                            </div>
                                        </div>
                                        <h3 className="text-white font-bold text-lg mb-2">Evaluating Submission</h3>
                                        <p className="text-zinc-500 text-xs">Running your code against hidden test cases...</p>
                                    </div>
                                ) : submissionResult && submissionResult.type === 'submit' ? (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="flex-1 flex flex-col"
                                    >
                                        <div className={`relative overflow-hidden rounded-2xl p-6 mb-6 border ${['Accepted', 'Passed'].includes(submissionResult.verdict)
                                            ? 'bg-gradient-to-br from-emerald-500/10 to-emerald-900/5 border-emerald-500/20'
                                            : 'bg-gradient-to-br from-red-500/10 to-red-900/5 border-red-500/20'
                                            }`}>

                                            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br rounded-full blur-3xl opacity-20 -mr-16 -mt-16 pointer-events-none ${['Accepted', 'Passed'].includes(submissionResult.verdict) ? 'from-emerald-400 to-green-300' : 'from-red-400 to-orange-300'}`} />

                                            <div className="relative z-10">
                                                <div className="flex items-center justify-between mb-8">
                                                    <div className="flex items-center gap-5">
                                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl ${['Accepted', 'Passed'].includes(submissionResult.verdict)
                                                            ? 'bg-emerald-500 text-white shadow-emerald-500/30'
                                                            : 'bg-red-500 text-white shadow-red-500/30'
                                                            }`}>
                                                            {['Accepted', 'Passed'].includes(submissionResult.verdict) ? <Check size={32} strokeWidth={3} /> : <X size={32} strokeWidth={3} />}
                                                        </div>
                                                        <div>
                                                            <h2 className={`text-3xl font-bold tracking-tight ${['Accepted', 'Passed'].includes(submissionResult.verdict) ? 'text-white' : 'text-red-100'}`}>
                                                                {submissionResult.verdict}
                                                            </h2>
                                                            <div className="flex flex-col mt-1">
                                                                <span className="text-zinc-400 text-sm font-medium">Execution completed successfully</span>
                                                                {['Accepted', 'Passed'].includes(submissionResult.verdict) && (
                                                                    <span className="text-emerald-400 text-xs mt-0.5">Solution meets all constraints</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {['Accepted', 'Passed'].includes(submissionResult.verdict) && (
                                                        <motion.button
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            className="flex items-center gap-2 px-5 py-2.5 bg-white text-black rounded-xl text-sm font-bold hover:bg-zinc-200 transition-colors shadow-lg shadow-white/5"
                                                        >
                                                            <Zap size={18} className="fill-current" />
                                                            Analyze Solution
                                                        </motion.button>
                                                    )}
                                                </div>

                                                {['Accepted', 'Passed'].includes(submissionResult.verdict) && (
                                                    <div className="grid grid-cols-3 gap-4 mb-6">
                                                        {/* Runtime Gauge */}
                                                        <div className="bg-black/40 rounded-2xl p-4 border border-white/5 backdrop-blur-md relative overflow-hidden group">
                                                            <div className="absolute top-0 right-0 p-3 opacity-30 group-hover:opacity-50 transition-opacity"><TrendingUp size={16} className="text-emerald-400" /></div>
                                                            <div className="flex flex-col items-center justify-center p-2">
                                                                <div className="relative w-16 h-16 flex items-center justify-center mb-2">
                                                                    <svg className="w-full h-full -rotate-90 text-emerald-900" viewBox="0 0 100 100">
                                                                        <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="8" fill="none" className="opacity-30" />
                                                                        <motion.circle
                                                                            initial={{ pathLength: 0 }}
                                                                            animate={{ pathLength: 0.94 }}
                                                                            transition={{ duration: 1, delay: 0.2 }}
                                                                            cx="50" cy="50" r="42"
                                                                            stroke="#34d399" strokeWidth="8"
                                                                            fill="none" strokeLinecap="round"
                                                                        />
                                                                    </svg>
                                                                    <span className="absolute text-sm font-bold text-white">{submissionResult.time || 45}ms</span>
                                                                </div>
                                                                <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Runtime</span>
                                                                <span className="text-[10px] text-emerald-400 mt-1">Beats 94%</span>
                                                            </div>
                                                        </div>

                                                        {/* Memory Gauge */}
                                                        <div className="bg-black/40 rounded-2xl p-4 border border-white/5 backdrop-blur-md relative overflow-hidden group">
                                                            <div className="absolute top-0 right-0 p-3 opacity-30 group-hover:opacity-50 transition-opacity"><Cpu size={16} className="text-blue-400" /></div>
                                                            <div className="flex flex-col items-center justify-center p-2">
                                                                <div className="relative w-16 h-16 flex items-center justify-center mb-2">
                                                                    <svg className="w-full h-full -rotate-90 text-blue-900" viewBox="0 0 100 100">
                                                                        <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="8" fill="none" className="opacity-30" />
                                                                        <motion.circle
                                                                            initial={{ pathLength: 0 }}
                                                                            animate={{ pathLength: 0.82 }}
                                                                            transition={{ duration: 1, delay: 0.4 }}
                                                                            cx="50" cy="50" r="42"
                                                                            stroke="#60a5fa" strokeWidth="8"
                                                                            fill="none" strokeLinecap="round"
                                                                        />
                                                                    </svg>
                                                                    <span className="absolute text-sm font-bold text-white">{submissionResult.memory || 3.2}MB</span>
                                                                </div>
                                                                <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Memory</span>
                                                                <span className="text-[10px] text-blue-400 mt-1">Optimal</span>
                                                            </div>
                                                        </div>

                                                        {/* Test Cases Card */}
                                                        <div className="bg-black/40 rounded-2xl p-4 border border-white/5 backdrop-blur-md flex flex-col items-center justify-center relative group">
                                                            <div className="absolute top-0 right-0 p-3 opacity-30 group-hover:opacity-50 transition-opacity"><CheckCircle2 size={16} className="text-purple-400" /></div>
                                                            <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mb-3 text-purple-400">
                                                                <LayoutList size={20} />
                                                            </div>
                                                            <div className="text-xl font-bold text-white tracking-tight">
                                                                {submissionResult.passedTestCases !== undefined ? submissionResult.passedTestCases : '-'} / {submissionResult.totalTestCases !== undefined ? submissionResult.totalTestCases : '-'}
                                                            </div>
                                                            <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider mt-1">Test Cases</span>
                                                            <span className={`text-[10px] mt-1 ${['Accepted', 'Passed'].includes(submissionResult.verdict) ? 'text-zinc-500' : 'text-red-400'}`}>
                                                                {['Accepted', 'Passed'].includes(submissionResult.verdict) ? 'All Passed' : 'Incomplete'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Error Details if Failed */}
                                                {!['Accepted', 'Passed'].includes(submissionResult.verdict) && (
                                                    <div className="space-y-4">
                                                        {submissionResult.failedTestCase ? (
                                                            <div className="bg-[#1A1A1A] rounded-xl border border-red-500/20 overflow-hidden">
                                                                <div className="px-4 py-3 bg-red-500/5 border-b border-red-500/10 flex items-center gap-2">
                                                                    <AlertCircle size={16} className="text-red-400" />
                                                                    <h3 className="text-sm font-semibold text-red-200">Failed Input</h3>
                                                                </div>
                                                                <div className="p-4 space-y-4">
                                                                    <div>
                                                                        <div className="text-xs text-zinc-500 font-semibold mb-1.5 uppercase tracking-wider">Input</div>
                                                                        <div className="bg-black/30 p-3 rounded-lg border border-white/5 font-mono text-sm text-zinc-300 whitespace-pre-wrap">
                                                                            {submissionResult.failedTestCase.input}
                                                                        </div>
                                                                    </div>
                                                                    <div className="grid grid-cols-2 gap-4">
                                                                        <div>
                                                                            <div className="text-xs text-zinc-500 font-semibold mb-1.5 uppercase tracking-wider">Expected</div>
                                                                            <div className="bg-emerald-500/5 p-3 rounded-lg border border-emerald-500/20 font-mono text-sm text-emerald-400 whitespace-pre-wrap">
                                                                                {submissionResult.failedTestCase.expected}
                                                                            </div>
                                                                        </div>
                                                                        <div>
                                                                            <div className="text-xs text-zinc-500 font-semibold mb-1.5 uppercase tracking-wider">Actual</div>
                                                                            <div className="bg-red-500/5 p-3 rounded-lg border border-red-500/20 font-mono text-sm text-red-400 whitespace-pre-wrap">
                                                                                {submissionResult.failedTestCase.actual}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ) : submissionResult.verdict === 'Restricted' ? (
                                                            <div className="bg-[#1A1A1A] rounded-xl border border-yellow-500/20 p-6 flex flex-col items-center justify-center text-center gap-4">
                                                                <div className="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center">
                                                                    <Lock size={32} className="text-yellow-500" />
                                                                </div>
                                                                <div>
                                                                    <h3 className="text-lg font-bold text-white mb-2">Pro Subscription Required</h3>
                                                                    <p className="text-zinc-400 text-sm max-w-sm mx-auto mb-6">
                                                                        {submissionResult.details || "Submissions are locked for free users."}
                                                                    </p>
                                                                    <button className="px-6 py-2 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400 transition-colors">
                                                                        Unlock Pro
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="bg-[#1A1A1A] rounded-xl border border-red-500/20 p-4">
                                                                <div className="text-xs text-red-400 font-mono whitespace-pre-wrap">
                                                                    {submissionResult.stderr || submissionResult.details || "Unknown Error"}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <div className="flex-1 flex flex-col items-center justify-center text-center text-zinc-500 p-8">
                                        <History size={32} className="mb-3 opacity-20" />
                                        <p className="text-sm font-medium">No submission selected</p>
                                        <p className="text-xs mt-1">Submit your code to see the results here</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </motion.div >

                {/* Resizer Handle (Horizontal) */}
                < div
                    className="w-4 hover:bg-blue-500/20 active:bg-blue-500/40 cursor-col-resize transition-colors flex items-center justify-center -ml-2 -mr-2 z-50 group"
                    onMouseDown={startResizingLeft}
                >
                    <div className="w-1 h-8 rounded-full bg-[#333333] group-hover:bg-blue-500/50 transition-colors" />
                </div >

                {/* Right Panel: Code Editor */}
                < motion.div
                    ref={rightPanelRef}
                    initial={{ opacity: 0, x: 10 }
                    }
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
                    className="relative flex-1 flex flex-col bg-[#1A1A1A] rounded-xl border border-[#262626] overflow-hidden shadow-sm min-w-0"
                >
                    {/* Top Section: Editor (Flexible Percent Height) */}
                    < div
                        style={{ height: `${editorHeightPercent}%` }}
                        className={`w-full flex flex-col min-h-0 bg-[#1A1A1A] overflow-hidden ${isDragging ? 'pointer-events-none' : ''}`}
                    >
                        {/* Editor Toolbar */}
                        < div className="h-10 bg-[#1A1A1A] border-b border-[#262626] flex items-center justify-between px-3 shrink-0" >
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-[#262626] border border-[#333333]">
                                    <div className="w-2 h-2 rounded-full bg-[#22c55e]" />
                                    <select
                                        value={language}
                                        onChange={handleLanguageChange}
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
                        </div >

                        {/* Editor Area */}
                        < div className="flex-1 relative group bg-[#141414]" >
                            <CodeEditor
                                language={languageMap[language]}
                                code={code}
                                setCode={setCode}
                            />
                        </div >
                    </div >

                    {/* Resizer Handle (Vertical) */}
                    < div
                        className="absolute left-0 right-0 h-4 z-50 cursor-row-resize flex items-center justify-center hover:bg-blue-500/10 active:bg-blue-500/20 transition-colors group"
                        style={{ top: `${editorHeightPercent}%`, transform: 'translateY(-50%)' }}
                        onMouseDown={startResizingBottom}
                    >
                        <div className="h-1 w-12 rounded-full bg-[#333333] group-hover:bg-blue-500/50 transition-colors" />
                    </div >

                    {/* Bottom Panel: Test Cases (Remaining Percent Height) */}
                    < div
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
                                <div className="h-full relative overflow-hidden flex flex-col">
                                    {runStatus === 'running' ? (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#111111] z-10 space-y-4">
                                            <div className="relative">
                                                <div className="w-16 h-16 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <Code2 size={20} className="text-purple-500 animate-pulse" />
                                                </div>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-white font-medium mb-1">Running Code...</p>
                                                <p className="text-zinc-500 text-xs">Analyzing complexity & correctness</p>
                                            </div>
                                        </div>
                                    ) : submissionResult ? (
                                        <SubmissionResultPanel
                                            submissionResult={submissionResult}
                                            output={output}
                                        />
                                    ) : (
                                        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-zinc-500">
                                            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4 transition-transform hover:scale-110">
                                                <Play size={32} className="opacity-50" />
                                            </div>
                                            <p className="text-sm font-medium text-zinc-400">Ready to execute</p>
                                            <p className="text-xs mt-1">Run or Submit your code to see the results here</p>
                                        </div>
                                    )
                                    }
                                </div >
                            ) : (
                                <TestCasesPanel
                                    testCases={problem.examples}
                                    activeTestCase={activeTestCase}
                                    setActiveTestCase={setActiveTestCase}
                                    testCaseResults={testCaseResults}
                                    runStatus={runStatus}
                                />
                            )}
                        </div >
                    </div >
                </motion.div >
            </div >
        </div >
    );
}
