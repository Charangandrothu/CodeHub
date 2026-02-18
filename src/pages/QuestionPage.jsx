import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronDown, Play, Send, RefreshCw, AlertCircle, CheckCircle2, Copy, FileText, LayoutList, History, Code2, Check, X, Zap, Clock, Cpu, TrendingUp, Lock, Move, Database, Brain, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import CodeEditor from '../components/dsa/CodeEditor';
import TestCasesPanel from '../components/dsa/TestCasesPanel';
import SubmissionResultPanel from '../components/dsa/SubmissionResultPanel';
import { useAuth } from '../context/AuthContext';
import logo_img from '../assets/logo_img.png';
import { API_URL } from '../config';
import { sendAIMessage, fetchAIUsage, AI_PROVIDERS, fetchAvailableProviders } from '../services/aiService';
import AdBanner from '../components/AdBanner';
import Editor from '@monaco-editor/react';

// Editorial Code Viewer sub-component
function EditorialCodeViewer({ solutionCode, defaultLang = 'javascript' }) {
    const [activeLang, setActiveLang] = React.useState(defaultLang);
    const [copied, setCopied] = React.useState(false);

    const languages = [
        { id: 'javascript', label: 'JavaScript', monacoLang: 'javascript', icon: 'JS', color: 'from-yellow-500 to-amber-600', textColor: 'text-yellow-400', bgColor: 'bg-yellow-500/10', borderColor: 'border-yellow-500/20' },
        { id: 'python', label: 'Python', monacoLang: 'python', icon: 'PY', color: 'from-blue-500 to-cyan-500', textColor: 'text-blue-400', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/20' },
        { id: 'java', label: 'Java', monacoLang: 'java', icon: 'JV', color: 'from-orange-500 to-red-500', textColor: 'text-orange-400', bgColor: 'bg-orange-500/10', borderColor: 'border-orange-500/20' },
        { id: 'cpp', label: 'C++', monacoLang: 'cpp', icon: 'C+', color: 'from-cyan-500 to-blue-600', textColor: 'text-cyan-400', bgColor: 'bg-cyan-500/10', borderColor: 'border-cyan-500/20' },
    ].filter(lang => solutionCode[lang.id]?.trim());

    if (languages.length === 0) return null;

    const currentLang = languages.find(l => l.id === activeLang) || languages[0];
    const currentCode = solutionCode[currentLang.id] || '';
    const lineCount = currentCode.split('\n').length;

    const handleCopy = () => {
        navigator.clipboard.writeText(currentCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl border border-[#262626] overflow-hidden relative group"
        >
            {/* Gradient glow effect on hover */}
            <div className={`absolute -inset-[1px] bg-gradient-to-r ${currentLang.color} rounded-2xl opacity-0 group-hover:opacity-[0.08] transition-opacity duration-500 pointer-events-none blur-sm`} />

            {/* Header */}
            <div className="relative bg-gradient-to-r from-[#1a1a2e] to-[#16161a] px-5 py-3.5 flex items-center justify-between border-b border-[#262626]">
                {/* Decorative dots */}
                <div className="absolute top-0 right-0 w-32 h-full overflow-hidden pointer-events-none opacity-30">
                    <div className="absolute top-2 right-4 w-1 h-1 rounded-full bg-purple-400/40" />
                    <div className="absolute top-5 right-10 w-0.5 h-0.5 rounded-full bg-blue-400/40" />
                    <div className="absolute bottom-3 right-6 w-1 h-1 rounded-full bg-cyan-400/30" />
                </div>

                <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${currentLang.color} flex items-center justify-center shadow-lg`}>
                        <Code2 size={16} className="text-white" />
                    </div>
                    <div>
                        <span className="text-[13px] font-bold text-white tracking-tight">Solution Code</span>
                        <span className="text-[10px] text-zinc-500 ml-2 font-mono">{lineCount} lines</span>
                    </div>
                </div>

                <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={handleCopy}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-300 border backdrop-blur-sm ${copied
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 shadow-emerald-500/10 shadow-lg'
                        : 'bg-white/5 text-zinc-400 border-white/10 hover:bg-white/10 hover:text-white hover:border-white/20'
                        }`}
                >
                    {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                    {copied ? 'Copied!' : 'Copy'}
                </motion.button>
            </div>

            {/* Language Pills */}
            <div className="flex items-center gap-1.5 px-4 py-2.5 bg-[#111]/80 border-b border-[#262626] overflow-x-auto">
                {languages.map(lang => (
                    <motion.button
                        key={lang.id}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setActiveLang(lang.id)}
                        className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-300 border ${currentLang.id === lang.id
                            ? `${lang.bgColor} ${lang.textColor} ${lang.borderColor} shadow-sm`
                            : 'bg-transparent text-zinc-500 border-transparent hover:bg-white/5 hover:text-zinc-300'
                            }`}
                    >
                        <span className={`text-[9px] font-black ${currentLang.id === lang.id ? lang.textColor : 'text-zinc-600'} transition-colors`}>
                            {lang.icon}
                        </span>
                        {lang.label}
                    </motion.button>
                ))}
            </div>

            {/* Code Editor (read-only) */}
            <div className="h-[320px] bg-[#0d1117]">
                <Editor
                    height="100%"
                    language={currentLang.monacoLang}
                    theme="vs-dark"
                    value={currentCode}
                    options={{
                        readOnly: true,
                        minimap: { enabled: false },
                        fontSize: 13,
                        fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Menlo, monospace",
                        scrollBeyondLastLine: false,
                        lineNumbers: 'on',
                        renderLineHighlight: 'none',
                        padding: { top: 16, bottom: 16 },
                        smoothScrolling: true,
                        cursorBlinking: 'smooth',
                        lineDecorationsWidth: 0,
                        overviewRulerBorder: false,
                        scrollbar: {
                            verticalScrollbarSize: 6,
                            horizontalScrollbarSize: 6,
                        },
                    }}
                />
            </div>
        </motion.div>
    );
}

export default function QuestionPage() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { currentUser, userData, refreshUserData } = useAuth(); // userData contains isPro status
    const [problem, setProblem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState(() => localStorage.getItem("codehub-activeTab") || 'description');
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

    // AI State
    const [showAI, setShowAI] = useState(false);
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState([]);
    const [loadingAI, setLoadingAI] = useState(false);
    const [selectedProvider, setSelectedProvider] = useState('nvidia');
    const [showProviderDropdown, setShowProviderDropdown] = useState(false);
    const [cooldownToast, setCooldownToast] = useState(null);
    const [aiUsageData, setAiUsageData] = useState(null);
    const [availableProviders, setAvailableProviders] = useState(AI_PROVIDERS);
    const messagesEndRef = useRef(null);
    const dragControls = useDragControls();
    const providerDropdownRef = useRef(null);

    // Fetch available providers from backend on mount
    useEffect(() => {
        fetchAvailableProviders().then(providers => {
            setAvailableProviders(providers);
            // If current selection isn't available, switch to first available
            if (providers.length > 0 && !providers.find(p => p.id === selectedProvider)) {
                setSelectedProvider(providers[0].id);
            }
        });
    }, []);

    // Fetch AI usage on mount and after each message
    useEffect(() => {
        if (currentUser?.uid) {
            fetchAIUsage(currentUser.uid).then(data => {
                if (data) setAiUsageData(data);
            });
        }
    }, [currentUser?.uid, messages.length]);

    // Close provider dropdown on outside click
    useEffect(() => {
        const handleClick = (e) => {
            if (providerDropdownRef.current && !providerDropdownRef.current.contains(e.target)) {
                setShowProviderDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, loadingAI, showAI]);

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

    // Limit Modal State
    const [limitModal, setLimitModal] = useState({ show: false, type: 'run', message: '' });

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
            // First check run locally (optimistic)
            if (currentUser && userData && !userData.isPro && (userData.stats?.runCredits <= 0)) {
                setLimitModal({
                    show: true,
                    type: 'run',
                    message: "You have exhausted today's run credits."
                });
                setRunStatus("idle");
                return;
            }

            const promises = examples.map(async (example, index) => {
                try {
                    const res = await fetch(`${API_URL}/api/execute/run`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            code,
                            language,
                            stdin: example.input,
                            userId: currentUser?.uid // Pass User ID for credit tracking
                        })
                    });

                    const data = await res.json();

                    if (res.status === 403 && data.isLimitError) {
                        throw new Error("LIMIT_EXCEEDED");
                    }

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
                    if (err.message === "LIMIT_EXCEEDED") throw err;
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

            // Refund credits locally? No, refresh user data to sync credits
            if (refreshUserData) refreshUserData();

            setRunStatus("idle");

        } catch (err) {
            console.error(err);
            setRunStatus("idle");
            if (err.message === "LIMIT_EXCEEDED") {
                setLimitModal({
                    show: true,
                    type: 'run',
                    message: "You have exhausted today's run credits."
                });
            }
        }
        setRunStatus("idle");
    };

    const handleAskAI = async () => {
        if (!input.trim() || loadingAI) return;

        // Optimistic check for free users
        if (currentUser && userData && !userData.isPro && (aiUsageData?.aiUsage >= 3 || userData.aiUsage >= 3)) {
            setLimitModal({
                show: true,
                type: 'ai',
                message: "You have reached your daily AI limit."
            });
            return;
        }

        const userMessage = { role: "user", content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput("");
        setLoadingAI(true);

        try {
            const data = await sendAIMessage({
                userId: currentUser?.uid,
                problemTitle: problem?.title,
                problemDescription: problem?.description,
                userCode: code,
                language,
                userQuestion: userMessage.content,
                selectedProvider
            });

            const providerLabel = availableProviders.find(p => p.id === data.provider)?.name || data.provider;
            setMessages(prev => [...prev, {
                role: "assistant",
                content: data.answer,
                provider: providerLabel
            }]);

            // Update usage
            if (data.remaining !== undefined && aiUsageData) {
                setAiUsageData(prev => ({ ...prev, aiUsage: (prev?.maxUsage || 3) - data.remaining }));
            }
            if (refreshUserData) refreshUserData();

        } catch (err) {
            if (err.status === 429 && err.type === 'cooldown') {
                // Cooldown toast
                setMessages(prev => prev.filter(m => m !== userMessage));
                setCooldownToast(`Please wait ${err.retryAfter || 3}s between messages`);
                setTimeout(() => setCooldownToast(null), 3000);
            } else if (err.status === 403 || err.type === 'limit') {
                setMessages(prev => prev.filter(m => m !== userMessage));
                setLimitModal({
                    show: true,
                    type: 'ai',
                    message: err.message || "Daily AI limit reached. Upgrade to Pro."
                });
            } else if (err.status === 429 && err.type === 'rate_limit') {
                setMessages(prev => [...prev, {
                    role: "assistant",
                    content: `⏳ Rate limit reached. Try again in ${err.retryAfter || 60}s.`,
                    isError: true
                }]);
            } else if (err.status === 503) {
                setMessages(prev => [...prev, {
                    role: "assistant",
                    content: "🔄 All AI providers are busy right now. Please try again in a moment.",
                    isError: true
                }]);
            } else {
                setMessages(prev => [...prev, {
                    role: "assistant",
                    content: "❌ " + (err.message || "Failed to connect."),
                    isError: true
                }]);
            }
        } finally {
            setLoadingAI(false);
        }
    };


    const submitCode = async () => {
        setRunStatus("submitting");
        setActiveTab("submissions");
        setSubmissionResult({
            verdict: "Queued",
            details: "Submission queued for processing...",
            type: 'submit',
            submittedAt: new Date().toISOString()
        });

        try {
            // Optimistic Check
            if (currentUser && userData && !userData.isPro && (userData.stats?.submissionCredits <= 0)) {
                setLimitModal({
                    show: true,
                    type: 'submit',
                    message: "You have used all your free submissions."
                });
                setRunStatus("idle");
                setSubmissionResult(null);
                return;
            }

            // 1. Trigger Submission (Queued)
            const res = await fetch(`${API_URL}/api/execute/submit`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    code,
                    language,
                    problemId: problem._id,
                    userId: currentUser?.uid
                })
            });

            const data = await res.json();

            if (!res.ok) {
                // Handle Pro Restriction (403) or Limit Exceeded
                if (res.status === 403) {
                    if (data.isLimitError) {
                        setLimitModal({
                            show: true,
                            type: 'submit',
                            message: data.details
                        });
                        setSubmissionResult(null);
                        setRunStatus("idle");
                        return;
                    }

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

            // 2. Poll for Result
            const pollInterval = setInterval(async () => {
                try {
                    const pollRes = await fetch(`${API_URL}/api/execute/submission/${problem._id}?userId=${currentUser.uid}`);
                    if (pollRes.ok) {
                        const submissionData = await pollRes.json();

                        // Check if we have a valid result (not null/pending if that was a state)
                        // Our backend currently creates the submission record ONLY when done or failed.
                        // So if we get a record, it's likely done. 
                        // However, if we eventually add "Processing" state to DB, this needs a check.
                        // For now, existence implies done.

                        if (submissionData) {
                            clearInterval(pollInterval);

                            // If Accepted/Passed, refresh user data
                            if (['Accepted', 'Passed'].includes(submissionData.verdict)) {
                                if (refreshUserData) refreshUserData();
                            } else {
                                if (refreshUserData) refreshUserData(); // Refresh for credits deduction
                            }

                            setSubmissionResult({
                                verdict: submissionData.verdict,
                                details: submissionData.stderr || "", // Assuming stderr is helpful
                                failedTestCase: null, // Queued logic might not return detailed failed case inGET yet, or we need to ensure GET returns it. 
                                // UPDATE: The GET endpoint returns the whole submission document. 
                                // The Submission model generally has: verdict, runtime, memory.
                                // It MIGHT NOT have failedTestCase details if the model doesn't store them.
                                // If we need failedTestCase, we might need to store it in Submission model or return it differently.
                                // For now, we map what we have.
                                time: submissionData.runtime ? (parseFloat(submissionData.runtime) * 1000).toFixed(2) : "N/A",
                                memory: submissionData.memory ? (parseFloat(submissionData.memory) / 1024).toFixed(2) : "N/A",
                                passedTestCases: submissionData.passedTestCases || 0, // Ensure these are saved in DB if needed
                                totalTestCases: submissionData.totalTestCases || 0,
                                type: 'submit',
                                submittedAt: submissionData.submittedAt
                            });
                            setRunStatus("idle");
                        }
                    }
                } catch (pollErr) {
                    console.error("Polling error:", pollErr);
                    // Don't clear immediately, retry
                }
            }, 2000); // Check every 2 seconds

            // Timeout after 30 seconds
            setTimeout(() => {
                clearInterval(pollInterval);
                if (runStatus === "submitting") { // If still running
                    setRunStatus("idle");
                    // Optional: set timed out status
                }
            }, 30000);

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
                const response = await fetch(`${API_URL}/api/problems/${slug}?uid=${currentUser?.uid || ''}`);

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
    }, [slug, language, currentUser?.uid]);

    // Fetch latest submission when tab changes to 'submissions'
    useEffect(() => {
        const fetchLatestSubmission = async () => {
            if (activeTab === 'submissions' && !submissionResult && currentUser && problem) {
                try {
                    const res = await fetch(`${API_URL}/api/execute/submission/${problem._id}?userId=${currentUser.uid}`);
                    if (res.ok) {
                        const data = await res.json();
                        if (data) {
                            setSubmissionResult({
                                verdict: data.verdict,
                                details: "",
                                time: data.runtime ? (parseFloat(data.runtime) * 1000).toFixed(2) : "N/A",
                                memory: data.memory ? (parseFloat(data.memory) / 1024).toFixed(2) : "N/A",
                                passedTestCases: problem.testCases?.hidden?.length || 0,
                                totalTestCases: problem.testCases?.hidden?.length || 0,
                                type: 'submit',
                                submittedAt: data.submittedAt,
                                code: data.code // Store code to restore later
                            });
                        }
                    }
                } catch (err) {
                    console.error("Failed to fetch submission:", err);
                }
            }
        };

        fetchLatestSubmission();
    }, [activeTab, currentUser, problem, submissionResult]);

    // Save code and language changes
    useEffect(() => {
        if (slug) {
            localStorage.setItem(`codehub-code-${slug}-${language}`, code);
        }
        localStorage.setItem("codehub-language", language);
    }, [code, language, slug]);

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
                    {/* Run Button with Credits */}
                    <div className="flex flex-col items-end">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={runCode}
                            disabled={runStatus === 'running'}
                            title={(!userData?.isPro && userData?.stats?.runCredits <= 0) ? "Upgrade to continue" : ""}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all border cursor-pointer ${runStatus === 'running'
                                ? 'bg-[#262626]/50 text-[#737373] border-[#333333] cursor-not-allowed'
                                : (!userData?.isPro && userData?.stats?.runCredits <= 0)
                                    ? 'bg-[#262626] text-[#525252] border-[#333333] opacity-75 hover:opacity-100 hover:border-purple-500/30'
                                    : 'bg-[#262626] hover:bg-[#333333] text-[#e5e5e5] border-[#333333] hover:border-[#404040]'}`}
                        >
                            {runStatus === 'running' ? (
                                <div className="w-3.5 h-3.5 border-2 border-[#e5e5e5]/30 border-t-[#e5e5e5] rounded-full animate-spin" />
                            ) : (
                                <Play size={14} className="fill-current text-[#e5e5e5]" />
                            )}
                            Run
                        </motion.button>
                        {!userData?.isPro && userData?.stats && (
                            <span className="text-[9px] text-zinc-500 font-medium mr-1 mt-0.5">
                                {userData.stats.runCredits}/3 left
                            </span>
                        )}
                    </div>

                    {/* Submit Button with Credits */}
                    <div className="flex flex-col items-end">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={submitCode}
                            disabled={runStatus === 'running'}
                            title={(!userData?.isPro && userData?.stats?.submissionCredits <= 0) ? "Upgrade to continue" : ""}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all border cursor-pointer ${(!userData?.isPro && userData?.stats?.submissionCredits <= 0)
                                ? 'bg-red-500/10 text-red-500/50 border-red-500/10 opacity-75 hover:opacity-100 hover:border-red-500/30'
                                : 'bg-[#22c55e]/10 hover:bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/20 hover:border-[#22c55e]/30'
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            <Send size={14} />
                            Submit
                        </motion.button>
                        {!userData?.isPro && userData?.stats && (
                            <span className="text-[9px] text-zinc-500 font-medium mr-1 mt-0.5">
                                {userData.stats.submissionCredits}/3 left
                            </span>
                        )}
                    </div>

                </div>
            </header>

            {/* Limit Modal */}
            <AnimatePresence>
                {limitModal.show && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
                        onClick={() => setLimitModal({ ...limitModal, show: false })}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-[#1A1A1A] border border-[#262626] rounded-xl p-6 max-w-sm w-full shadow-2xl relative"
                        >
                            <button
                                onClick={() => setLimitModal({ ...limitModal, show: false })}
                                className="absolute top-4 right-4 text-zinc-500 hover:text-white cursor-pointer"
                            >
                                <X size={18} />
                            </button>

                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mb-4 mx-auto border border-purple-500/20">
                                <Lock size={20} className="text-purple-400" />
                            </div>

                            <h3 className="text-lg font-bold text-white text-center mb-2">
                                {limitModal.type === 'run' ? 'Daily Run Limit Reached' :
                                    limitModal.type === 'ai' ? 'Daily AI Limit Reached' :
                                        limitModal.type === 'analyze' ? 'Premium Analysis Locked' :
                                            'Submission Limit Reached'}
                            </h3>

                            <p className="text-zinc-400 text-sm text-center mb-6 leading-relaxed">
                                {limitModal.message || "You have used all your free credits. Upgrade to Pro for unlimited access."}
                            </p>

                            <button
                                onClick={() => navigate('/pricing')}
                                className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-lg font-medium text-sm transition-all shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <Zap size={16} className="fill-current" />
                                Upgrade to Pro
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

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
                                onClick={() => { setActiveTab(tab.id); localStorage.setItem("codehub-activeTab", tab.id); }}
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

                    {/* Fixed Title Section - Only on Description Tab */}
                    {activeTab === 'description' && (
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

                                {/* Ad placement — below problem description, safe location */}
                                {!userData?.isPro && (
                                    <div className="mt-8 pt-4 border-t border-[#262626]">
                                        <AdBanner adSlot="2786354821" className="py-1" />
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'editorial' && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-5"
                            >
                                {/* No editorial content fallback */}
                                {(!problem.theory || (!problem.theory.videoUrl && !problem.theory.explanation && !problem.theory.timeComplexity?.value && !problem.theory.spaceComplexity?.value && !problem.theory.solutionCode?.javascript && !problem.theory.solutionCode?.python)) ? (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="flex-1 flex flex-col items-center justify-center text-center py-20"
                                    >
                                        <div className="relative mb-5">
                                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-yellow-500/10 to-orange-500/5 border border-yellow-500/10 flex items-center justify-center">
                                                <LayoutList size={32} className="text-yellow-500/40" />
                                            </div>
                                            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-yellow-500/20 animate-ping" />
                                        </div>
                                        <p className="text-[15px] font-semibold text-zinc-300 mb-1">Editorial Coming Soon</p>
                                        <p className="text-xs text-zinc-600 max-w-[200px]">The detailed editorial for this problem is being prepared</p>
                                    </motion.div>
                                ) : (
                                    <div className="relative w-full">
                                        <div className={`space-y-5 ${!userData?.isPro ? "blur-sm opacity-50 pointer-events-none select-none filter transition-all duration-700" : ""}`}>
                                            {/* Video Section — Premium YouTube Card */}
                                            {problem.theory?.videoUrl && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 8 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.05 }}
                                                >
                                                    <a
                                                        href={problem.theory.videoUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="block group relative rounded-2xl overflow-hidden border border-[#262626] hover:border-red-500/30 transition-all duration-500"
                                                    >
                                                        {/* Background gradient */}
                                                        <div className="absolute inset-0 bg-gradient-to-br from-red-950/30 via-[#141414] to-[#141414] group-hover:from-red-950/50 transition-all duration-500" />

                                                        {/* Subtle glow */}
                                                        <div className="absolute -top-10 -left-10 w-40 h-40 bg-red-500/5 rounded-full blur-3xl group-hover:bg-red-500/10 transition-all duration-700 pointer-events-none" />

                                                        <div className="relative p-5 flex items-center gap-5">
                                                            {/* Play Button */}
                                                            <div className="relative shrink-0">
                                                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-xl shadow-red-500/20 group-hover:shadow-red-500/40 group-hover:scale-105 transition-all duration-300">
                                                                    <Play size={26} className="text-white ml-1 fill-white" />
                                                                </div>
                                                                {/* Pulse ring */}
                                                                <div className="absolute inset-0 rounded-2xl border-2 border-red-500/30 animate-ping opacity-0 group-hover:opacity-100 transition-opacity" style={{ animationDuration: '2s' }} />
                                                            </div>

                                                            {/* Text */}
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2 mb-1.5">
                                                                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-red-500 shrink-0">
                                                                        <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0C.488 3.45.029 5.804 0 12c.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0C23.512 20.55 23.971 18.196 24 12c-.029-6.185-.484-8.549-4.385-8.816zM9 16.5v-9l7.5 4.5L9 16.5z" />
                                                                    </svg>
                                                                    <span className="text-[10px] font-bold text-red-400/70 uppercase tracking-widest">Video Explanation</span>
                                                                </div>
                                                                <h3 className="text-[15px] font-bold text-white group-hover:text-red-200 transition-colors truncate leading-tight">
                                                                    {problem.theory.videoTitle || 'Watch Video Explanation'}
                                                                </h3>
                                                                <p className="text-[10px] text-zinc-600 font-mono truncate mt-1.5 group-hover:text-zinc-500 transition-colors">
                                                                    youtube.com • Opens in new tab
                                                                </p>
                                                            </div>

                                                            {/* Arrow */}
                                                            <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 text-zinc-600 group-hover:bg-red-500/10 group-hover:text-red-400 transition-all duration-300 shrink-0">
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                                                    <polyline points="15 3 21 3 21 9" />
                                                                    <line x1="10" y1="14" x2="21" y2="3" />
                                                                </svg>
                                                            </div>
                                                        </div>
                                                    </a>
                                                </motion.div>
                                            )}

                                            {/* Explanation Section — Rich Text */}
                                            {problem.theory?.explanation && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 8 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.15 }}
                                                    className="rounded-2xl border border-[#262626] overflow-hidden relative"
                                                >
                                                    {/* Header with accent */}
                                                    <div className="relative bg-gradient-to-r from-[#141420] to-[#141414] px-5 py-3.5 border-b border-[#262626]">
                                                        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-blue-500 to-cyan-500 rounded-r" />
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/10 border border-blue-500/20 flex items-center justify-center">
                                                                <Brain size={16} className="text-blue-400" />
                                                            </div>
                                                            <div>
                                                                <span className="text-[13px] font-bold text-white tracking-tight">Approach & Explanation</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Content */}
                                                    <div className="p-5 bg-[#111]/60">
                                                        <div className="text-[13px] leading-[1.85] text-[#c4c4c4] whitespace-pre-wrap font-sans selection:bg-blue-500/20">
                                                            {problem.theory.explanation}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}

                                            {/* Solution Code Section */}
                                            {problem.theory?.solutionCode && (
                                                <EditorialCodeViewer solutionCode={problem.theory.solutionCode} defaultLang={language} />
                                            )}

                                            {/* Complexity Badges */}
                                            {(problem.theory?.timeComplexity?.value || problem.theory?.spaceComplexity?.value) && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 8 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.2 }}
                                                    className="grid grid-cols-2 gap-3"
                                                >
                                                    {problem.theory.timeComplexity?.value && (
                                                        <div className="relative rounded-2xl border border-[#262626] overflow-hidden group hover:border-emerald-500/20 transition-colors duration-300">
                                                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                                            <div className="relative p-4">
                                                                <div className="flex items-center gap-3.5 mb-2">
                                                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/15 to-emerald-600/5 border border-emerald-500/15 flex items-center justify-center shrink-0">
                                                                        <Clock size={18} className="text-emerald-400" />
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-0.5">Time</p>
                                                                        <p className="text-[15px] font-bold text-emerald-400 font-mono tracking-tight truncate">{problem.theory.timeComplexity.value}</p>
                                                                    </div>
                                                                </div>
                                                                {problem.theory.timeComplexity.explanation && (
                                                                    <p className="text-[11px] leading-relaxed text-zinc-500 mt-2 pl-[3.375rem]">{problem.theory.timeComplexity.explanation}</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                    {problem.theory.spaceComplexity?.value && (
                                                        <div className="relative rounded-2xl border border-[#262626] overflow-hidden group hover:border-violet-500/20 transition-colors duration-300">
                                                            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                                            <div className="relative p-4">
                                                                <div className="flex items-center gap-3.5 mb-2">
                                                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/15 to-violet-600/5 border border-violet-500/15 flex items-center justify-center shrink-0">
                                                                        <Database size={18} className="text-violet-400" />
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-0.5">Space</p>
                                                                        <p className="text-[15px] font-bold text-violet-400 font-mono tracking-tight truncate">{problem.theory.spaceComplexity.value}</p>
                                                                    </div>
                                                                </div>
                                                                {problem.theory.spaceComplexity.explanation && (
                                                                    <p className="text-[11px] leading-relaxed text-zinc-500 mt-2 pl-[3.375rem]">{problem.theory.spaceComplexity.explanation}</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </motion.div>
                                            )}
                                        </div>
                                        {!userData?.isPro && (
                                            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6">
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                                    className="relative bg-black/80 backdrop-blur-3xl border border-white/10 p-8 rounded-[2rem] flex flex-col items-center text-center shadow-2xl shadow-black/90 max-w-sm mx-auto overflow-hidden group"
                                                >
                                                    {/* Animated Background Glow */}
                                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-purple-500/20 rounded-full blur-[80px] pointer-events-none" />
                                                    <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-[60px] pointer-events-none" />

                                                    {/* Gradient Border Animation */}
                                                    <div className="absolute inset-0 rounded-[2rem] p-[1px] bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />

                                                    {/* Icon */}
                                                    <div className="relative mb-6">
                                                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-yellow-400/10 to-orange-500/5 border border-yellow-500/20 flex items-center justify-center shadow-[0_0_30px_-5px_rgba(234,179,8,0.15)] group-hover:scale-105 transition-transform duration-500">
                                                            <div className="absolute inset-0 bg-gradient-to-tr from-yellow-500/5 to-transparent rounded-2xl opacity-50" />
                                                            <Lock size={32} className="text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.3)]" />
                                                        </div>
                                                        <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-yellow-400 animate-ping" />
                                                    </div>

                                                    <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">
                                                        Premium <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">Analysis</span>
                                                    </h3>

                                                    <div className="w-full max-w-[320px] mb-8 text-left">
                                                        <p className="text-zinc-300 text-sm font-medium mb-4 pb-3 border-b border-white/5">
                                                            Unlock the complete editorial experience:
                                                        </p>
                                                        <ul className="space-y-3 mb-5">
                                                            {[
                                                                "In-depth intuition & pattern recognition",
                                                                "Detailed explanation from brute force to optimized",
                                                                "Complexity analysis (Time & Space)",
                                                                "Clean, interview-ready code implementations",
                                                                "Guided video explanation"
                                                            ].map((item, index) => (
                                                                <li key={index} className="flex items-start gap-3 text-xs text-zinc-400">
                                                                    <div className="mt-0.5 p-0.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 shrink-0">
                                                                        <Check size={10} className="text-yellow-500" />
                                                                    </div>
                                                                    <span className="leading-snug">{item}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                        <div className="text-center pt-2">
                                                            <span className="text-xs font-semibold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-500">
                                                                Turn problem solving into placement-level mastery.
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <button
                                                        onClick={() => navigate('/pricing')}
                                                        className="relative w-full py-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-bold rounded-xl shadow-[0_0_20px_-5px_rgba(234,179,8,0.3)] transition-all duration-300 transform active:scale-[0.98] flex items-center justify-center gap-2 group/btn cursor-pointer overflow-hidden"
                                                    >
                                                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
                                                        <span className="relative z-10">Unlock Pro Access</span>
                                                        <ArrowRight size={18} className="relative z-10 group-hover/btn:translate-x-1 transition-transform" />
                                                    </button>

                                                    <div className="mt-4 text-[10px] font-medium text-zinc-600 uppercase tracking-widest">
                                                        Try Pro Risk-Free
                                                    </div>
                                                </motion.div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </motion.div>
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
                                                            onClick={() => {
                                                                if (!userData?.isPro) {
                                                                    setLimitModal({
                                                                        show: true,
                                                                        type: 'analyze',
                                                                        message: "Unlock detailed complexity analysis with Pro."
                                                                    });
                                                                } else {
                                                                    // Navigate to analysis
                                                                }
                                                            }}
                                                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-lg ${!userData?.isPro
                                                                ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-200 border border-amber-500/30 hover:bg-amber-500/30'
                                                                : 'bg-white text-black hover:bg-zinc-200 shadow-white/5'
                                                                }`}
                                                        >
                                                            {!userData?.isPro ? <Lock size={14} /> : <Brain size={16} className="fill-current" />}
                                                            Analyze Complexities
                                                        </motion.button>
                                                    )}
                                                </div>

                                                {['Accepted', 'Passed'].includes(submissionResult.verdict) && (
                                                    <div className="grid grid-cols-3 gap-4 mb-6">
                                                        {/* Runtime Gauge */}
                                                        <div className="bg-black/40 rounded-2xl p-4 border border-white/5 backdrop-blur-md relative overflow-hidden group">
                                                            {!userData?.isPro && (
                                                                <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center p-2 text-center">
                                                                    <div className="p-1.5 rounded-full bg-yellow-500/20 mb-1">
                                                                        <Lock size={14} className="text-yellow-500" />
                                                                    </div>
                                                                    <span className="text-[10px] font-bold text-yellow-500 uppercase tracking-wider">Premium</span>
                                                                </div>
                                                            )}
                                                            <div className="absolute top-0 right-0 p-3 opacity-30 group-hover:opacity-50 transition-opacity"><TrendingUp size={16} className="text-emerald-400" /></div>
                                                            <div className={`flex flex-col items-center justify-center p-2 ${!userData?.isPro ? 'opacity-20 blur-[1px]' : ''}`}>
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
                                                                    <span className="absolute text-sm font-bold text-white">{submissionResult.time}ms</span>
                                                                </div>
                                                                <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Runtime</span>
                                                                <span className="text-[10px] text-emerald-400 mt-1">Beats 94%</span>
                                                            </div>
                                                        </div>

                                                        {/* Memory Gauge */}
                                                        <div className="bg-black/40 rounded-2xl p-4 border border-white/5 backdrop-blur-md relative overflow-hidden group">
                                                            {!userData?.isPro && (
                                                                <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center p-2 text-center">
                                                                    <div className="p-1.5 rounded-full bg-yellow-500/20 mb-1">
                                                                        <Lock size={14} className="text-yellow-500" />
                                                                    </div>
                                                                    <span className="text-[10px] font-bold text-yellow-500 uppercase tracking-wider">Premium</span>
                                                                </div>
                                                            )}
                                                            <div className="absolute top-0 right-0 p-3 opacity-30 group-hover:opacity-50 transition-opacity"><Cpu size={16} className="text-blue-400" /></div>
                                                            <div className={`flex flex-col items-center justify-center p-2 ${!userData?.isPro ? 'opacity-20 blur-[1px]' : ''}`}>
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
                                                                    <span className="absolute text-sm font-bold text-white">{submissionResult.memory}MB</span>
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

                                {/* Recent Submissions List (Only 1 per problem as per new logic) */}
                                {submissionResult && submissionResult.type === 'submit' && (
                                    <div className="mt-auto pt-4 border-t border-[#262626]">
                                        <h4 className="text-xs font-bold text-white mb-3 flex items-center gap-2">
                                            <History size={12} className="text-zinc-500" />
                                            Submission History
                                        </h4>
                                        <div
                                            onClick={() => {
                                                if (submissionResult.code) setCode(submissionResult.code);
                                            }}
                                            className="bg-[#1A1A1A] hover:bg-[#262626] border border-[#262626] rounded-lg p-3 flex items-center justify-between cursor-pointer transition-colors group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`p-1.5 rounded-md ${['Accepted', 'Passed'].includes(submissionResult.verdict) ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                                    {['Accepted', 'Passed'].includes(submissionResult.verdict) ? <Check size={14} /> : <X size={14} />}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className={`text-xs font-bold ${['Accepted', 'Passed'].includes(submissionResult.verdict) ? 'text-white' : 'text-red-400'}`}>
                                                        {submissionResult.verdict}
                                                    </span>
                                                    <span className="text-[10px] text-zinc-500 font-mono">
                                                        {submissionResult.submittedAt ? new Date(submissionResult.submittedAt).toLocaleString() : 'Just now'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right hidden sm:block">
                                                    <div className="text-[10px] text-zinc-400">Time</div>
                                                    {!userData?.isPro ? (
                                                        <div className="flex items-center justify-end gap-1 mt-0.5">
                                                            <Lock size={10} className="text-yellow-500" />
                                                            <span className="text-[10px] font-bold text-yellow-500 uppercase">Premium</span>
                                                        </div>
                                                    ) : (
                                                        <div className="text-xs font-mono text-zinc-300">{submissionResult.time}ms</div>
                                                    )}
                                                </div>
                                                <div className="text-right hidden sm:block">
                                                    <div className="text-[10px] text-zinc-400">Memory</div>
                                                    {!userData?.isPro ? (
                                                        <div className="flex items-center justify-end gap-1 mt-0.5">
                                                            <Lock size={10} className="text-yellow-500" />
                                                            <span className="text-[10px] font-bold text-yellow-500 uppercase">Premium</span>
                                                        </div>
                                                    ) : (
                                                        <div className="text-xs font-mono text-zinc-300">{submissionResult.memory}MB</div>
                                                    )}
                                                </div>
                                                <ChevronLeft size={14} className="text-zinc-600 group-hover:text-zinc-400 rotate-180 transition-colors" />
                                            </div>
                                        </div>
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
            {/* Premium AI Assistant UI */}
            <AnimatePresence>
                {showAI && (
                    <motion.div
                        initial={{ y: "100%", opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: "100%", opacity: 0 }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed bottom-24 right-6 w-[400px] h-[620px] max-h-[80vh] bg-[#111827]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-[60] flex flex-col overflow-hidden font-sans origin-bottom-right"
                    >
                        {/* Header with Model Selector */}
                        <div className="flex items-center justify-between px-5 py-3 border-b border-white/5 bg-gradient-to-r from-indigo-500/5 to-transparent">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 overflow-hidden">
                                    <img src={logo_img} alt="CodeHub AI" className="w-full h-full object-cover opacity-90" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-[15px] tracking-tight">AI Assistant</h3>
                                    {/* Model Selector */}
                                    <div className="relative" ref={providerDropdownRef}>
                                        <button
                                            onClick={() => setShowProviderDropdown(!showProviderDropdown)}
                                            className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-gray-200 transition-colors font-medium"
                                        >
                                            <span
                                                className="w-1.5 h-1.5 rounded-full"
                                                style={{ backgroundColor: availableProviders.find(p => p.id === selectedProvider)?.color || '#6366F1' }}
                                            />
                                            {availableProviders.find(p => p.id === selectedProvider)?.name || 'NVIDIA'}
                                            <ChevronDown size={10} className={`transition-transform ${showProviderDropdown ? 'rotate-180' : ''}`} />
                                        </button>
                                        <AnimatePresence>
                                            {showProviderDropdown && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: -5 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -5 }}
                                                    className="absolute top-6 left-0 w-52 bg-[#1a1f2e] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden"
                                                >
                                                    {availableProviders.map(provider => (
                                                        <button
                                                            key={provider.id}
                                                            onClick={() => {
                                                                if (provider.healthy !== false) {
                                                                    setSelectedProvider(provider.id);
                                                                    setShowProviderDropdown(false);
                                                                }
                                                            }}
                                                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-xs transition-colors ${provider.healthy === false
                                                                ? 'opacity-40 cursor-not-allowed'
                                                                : selectedProvider === provider.id
                                                                    ? 'bg-indigo-500/10 text-white'
                                                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                                                }`}
                                                            disabled={provider.healthy === false}
                                                        >
                                                            <span
                                                                className={`w-2 h-2 rounded-full shrink-0 ${provider.healthy === false ? 'bg-red-500' : ''}`}
                                                                style={provider.healthy !== false ? { backgroundColor: provider.color } : {}}
                                                            />
                                                            <div className="flex-1">
                                                                <div className="font-semibold flex items-center gap-1.5">
                                                                    {provider.name}
                                                                    {provider.healthy === false && (
                                                                        <span className="text-[9px] text-red-400 font-normal">(unavailable)</span>
                                                                    )}
                                                                </div>
                                                                <div className="text-[10px] text-gray-500">{provider.model}</div>
                                                            </div>
                                                            {selectedProvider === provider.id && provider.healthy !== false && (
                                                                <Check size={12} className="ml-auto text-indigo-400" />
                                                            )}
                                                        </button>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowAI(false)}
                                className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Cooldown Toast */}
                        <AnimatePresence>
                            {cooldownToast && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="mx-4 mt-2 px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-300 text-xs font-medium text-center flex items-center justify-center gap-2"
                                >
                                    <Clock size={12} />
                                    {cooldownToast}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Chat Area */}
                        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar space-y-5 bg-gradient-to-b from-[#111827] to-[#0f1117]">
                            {messages.length === 0 && (
                                <div className="flex flex-col items-center justify-center h-full text-center px-8">
                                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500/10 to-blue-500/10 rounded-2xl flex items-center justify-center mb-6 border border-indigo-500/20 shadow-[0_0_30px_rgba(99,102,241,0.1)]">
                                        <Code2 size={28} className="text-indigo-400" />
                                    </div>
                                    <h4 className="text-white font-semibold mb-2">How can I help you?</h4>
                                    <p className="text-sm text-gray-500 leading-relaxed max-w-[240px]">
                                        Debug your code, explain logic, analyze complexity, or optimize your solution.
                                    </p>
                                    <div className="mt-4 flex flex-wrap gap-2 justify-center">
                                        {['Explain approach', 'Debug my code', 'Time complexity?'].map(q => (
                                            <button
                                                key={q}
                                                onClick={() => { setInput(q); }}
                                                className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[11px] text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                                            >
                                                {q}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {messages.map((msg, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[85%] rounded-2xl p-3.5 text-sm leading-relaxed shadow-sm relative group ${msg.role === 'user'
                                            ? 'bg-[#2563eb] text-white rounded-tr-sm shadow-blue-900/20'
                                            : msg.isError
                                                ? 'bg-red-500/10 border border-red-500/20 text-red-200 rounded-tl-sm'
                                                : 'bg-[#1f2937] text-gray-200 rounded-tl-sm border border-white/5'
                                            }`}
                                    >
                                        <div className="whitespace-pre-wrap font-sans text-[13.5px]">
                                            {msg.content}
                                        </div>
                                        {/* Provider label on AI messages */}
                                        {msg.role === 'assistant' && msg.provider && !msg.isError && (
                                            <div className="mt-2 text-[9px] text-gray-500 font-medium uppercase tracking-wider">
                                                via {msg.provider}
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}

                            {loadingAI && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex justify-start"
                                >
                                    <div className="bg-[#1f2937] rounded-2xl rounded-tl-sm p-4 border border-white/5 flex gap-1.5 items-center w-fit shadow-lg">
                                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" />
                                        <span className="ml-2 text-[10px] text-gray-500">
                                            {availableProviders.find(p => p.id === selectedProvider)?.name}
                                        </span>
                                    </div>
                                </motion.div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 border-t border-white/5 bg-[#111827]">
                            <div className={`relative flex items-center bg-[#1f2937] border border-white/5 rounded-xl transition-all duration-300 focus-within:ring-2 focus-within:ring-indigo-500/50 focus-within:border-indigo-500/50 focus-within:shadow-[0_0_15px_rgba(99,102,241,0.15)]`}>
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Ask about this problem..."
                                    className="w-full bg-transparent border-none text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-0 px-4 py-3.5"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleAskAI();
                                        }
                                    }}
                                    disabled={loadingAI}
                                />
                                <button
                                    onClick={handleAskAI}
                                    disabled={loadingAI || !input.trim()}
                                    className="mr-2 p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-500/20 shrink-0 group relative"
                                >
                                    <Send size={15} className={`group-hover:translate-x-0.5 transition-transform ${loadingAI ? "opacity-0" : "opacity-100"}`} />
                                    {loadingAI && <div className="absolute inset-0 flex items-center justify-center"><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /></div>}
                                </button>
                            </div>

                            {/* Usage Indicator */}
                            <div className="mt-2.5 flex items-center justify-between px-1 text-[10px] font-medium tracking-wide">
                                {!userData?.isPro ? (
                                    <>
                                        <span className="text-gray-500">
                                            Daily: <span className={(aiUsageData?.aiUsage || userData?.aiUsage || 0) >= 3 ? "text-red-400 font-bold" : "text-gray-300"}>
                                                {3 - (aiUsageData?.aiUsage || userData?.aiUsage || 0)} remaining
                                            </span>
                                        </span>
                                        {(aiUsageData?.aiUsage || userData?.aiUsage || 0) >= 2 && (
                                            <span
                                                className="text-indigo-400 cursor-pointer hover:text-indigo-300 transition-colors flex items-center gap-1"
                                                onClick={() => navigate('/pricing')}
                                            >
                                                Upgrade to Pro <Zap size={10} className="fill-current" />
                                            </span>
                                        )}
                                    </>
                                ) : (
                                    <span className="text-gray-500">
                                        Pro: <span className="text-indigo-400">5 requests / 5 min</span>
                                    </span>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )
                }
            </AnimatePresence>

            {/* Floating Action Button (FAB) Container */}
            < motion.div
                className="fixed bottom-6 right-6 z-50 flex flex-col items-center gap-2 group pointer-events-auto"
                drag
                dragListener={false}
                dragMomentum={false}
                dragConstraints={containerRef}
                dragControls={dragControls}
                style={{ touchAction: "none" }}
            >
                {/* Drag Handle - Only visible on hover */}
                < div
                    className="cursor-move p-2 bg-[#1f2937]/90 backdrop-blur-md border border-white/10 rounded-full text-zinc-400 hover:text-white hover:bg-indigo-500/20 hover:border-indigo-500/30 transition-all duration-300 opacity-0 group-hover:opacity-100 absolute -top-10 shadow-lg"
                    onPointerDown={(e) => dragControls.start(e)}
                    title="Drag to move"
                >
                    <Move size={14} />
                </div >

                {/* Main Clickable Button */}
                < motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowAI(!showAI)}
                    className="w-[56px] h-[56px] bg-gradient-to-tr from-indigo-600 to-blue-600 rounded-full shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:shadow-[0_0_30px_rgba(79,70,229,0.6)] flex items-center justify-center transition-all duration-300 border border-white/10 relative"
                >
                    {/* Pulsing Ring Animation */}
                    < div className="absolute inset-0 rounded-full border border-indigo-400/50 animate-ping opacity-20" />

                    <div className="absolute inset-0 bg-white blur-lg opacity-20 rounded-full group-hover:opacity-40 transition-opacity" />
                    <span className="text-2xl relative z-10 drop-shadow-md">🤖</span>
                </motion.button >

                {/* Tooltip Label */}
                < div className="absolute right-16 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[#1f2937]/90 backdrop-blur-md border border-white/10 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none shadow-xl" >
                    <span className="text-xs font-medium text-white">Ask AI Assistant</span>
                    <div className="absolute right-[-4px] top-1/2 -translate-y-1/2 w-2 h-2 bg-[#1f2937]/90 rotate-45 border-r border-t border-white/10" />
                </div >
            </motion.div >
        </div >
    );
}
0