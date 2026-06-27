import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';
import { 
    Clock, CheckCircle, AlertTriangle, Play, ChevronLeft, 
    ChevronRight, Bookmark, ArrowRight, Loader2, Maximize2, 
    Minimize2, HelpCircle, Code2, Cpu, Check, AlertCircle, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Editor from '@monaco-editor/react';
import logo_img from '../assets/logo_img.png';

const MockTestWindow = () => {
    const { testId } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();

    // Loading states
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [testName, setTestName] = useState('');

    // Question lists
    const [aptQuestions, setAptQuestions] = useState([]);
    const [dsaQuestions, setDsaQuestions] = useState([]);
    const [currentSection, setCurrentSection] = useState('aptitude'); // 'aptitude' or 'dsa'
    const [currentIndex, setCurrentIndex] = useState(0); // Index within active section

    // Test session states
    const [attemptId, setAttemptId] = useState('');
    const [answers, setAnswers] = useState({}); // { qId: answerValue }
    const [questionStatuses, setQuestionStatuses] = useState({}); // { qId: 'answered' | 'skipped' | 'review' | 'visited' }
    const [remainingSeconds, setRemainingSeconds] = useState(0);
    const [timeLimit, setTimeLimit] = useState(90); // minutes
    const [startedAtTime, setStartedAtTime] = useState(null);

    // Coding states
    const [selectedLanguage, setSelectedLanguage] = useState('javascript');
    const [runOutputs, setRunOutputs] = useState({}); // { qId: outputString }
    const [runningCode, setRunningCode] = useState(false);

    // Fullscreen state
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Confirmation Modal
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showExitModal, setShowExitModal] = useState(false);

    // References
    const timerRef = useRef(null);

    // 1. Initial Load: Resume or Start test via Node API
    useEffect(() => {
        if (currentUser) {
            initializeTest();
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [currentUser, testId]);

    // 2. Anti-Refresh beforeunload Listener
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            e.preventDefault();
            e.returnValue = 'Warning: Leaving this page will not pause the timer. Resume from dashboard.';
            return e.returnValue;
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, []);

    // 3. Auto-save answers dynamically
    useEffect(() => {
        if (attemptId) {
            const cacheKey = `mock_test_cache_${currentUser.uid}_${testId}`;
            localStorage.setItem(cacheKey, JSON.stringify({
                answers,
                questionStatuses,
                attemptId
            }));
            
            // Sync with backend API
            saveProgressToBackend();
        }
    }, [answers, questionStatuses, attemptId]);

    const initializeTest = async () => {
        setLoading(true);
        try {
            const headers = { 
                'x-user-uid': currentUser.uid,
                'Content-Type': 'application/json'
            };

            // Call start test API (MongoDB controller does the dynamic selection / session restoring)
            const res = await fetch(`${API_URL}/api/mock-tests/start/${testId}`, {
                method: 'POST',
                headers
            });

            if (!res.ok) throw new Error("Failed to start/resume placement mock test");
            const attemptData = await res.json();
            const limit = Number(attemptData.timeLimit) || 90;

            setAttemptId(attemptData._id);
            setTestName(attemptData.testName);
            setAptQuestions(attemptData.questionsList.aptitude || []);
            setDsaQuestions(attemptData.questionsList.dsa || []);
            setTimeLimit(limit);
            setStartedAtTime(new Date(attemptData.startedAt));

            // Load any existing answers
            setAnswers(attemptData.answers || {});
            setQuestionStatuses(attemptData.questionStatuses || {});

            // Calculate remaining seconds
            const elapsedSeconds = Math.floor((new Date() - new Date(attemptData.startedAt)) / 1000) || 0;
            const remaining = (limit * 60) - elapsedSeconds;
            if (remaining <= 0) {
                // Auto-submit immediately if expired
                setRemainingSeconds(0);
                submitTest(attemptData._id, attemptData.answers);
            } else {
                setRemainingSeconds(remaining);
                startTimer(remaining, attemptData._id);
            }

        } catch (error) {
            console.error("Error initializing test window:", error);
            alert("Failed to load test session.");
            navigate('/mock-tests');
        } finally {
            setLoading(false);
        }
    };

    const startTimer = (seconds, attId) => {
        if (timerRef.current) clearInterval(timerRef.current);
        let time = seconds;

        timerRef.current = setInterval(() => {
            time -= 1;
            setRemainingSeconds(time);

            if (time <= 0) {
                clearInterval(timerRef.current);
                submitTest(attId, answers);
            }
        }, 1000);
    };

    const saveProgressToBackend = async () => {
        if (!attemptId) return;
        try {
            await fetch(`${API_URL}/api/mock-tests/progress/${attemptId}`, {
                method: 'PUT',
                headers: {
                    'x-user-uid': currentUser.uid,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ answers, questionStatuses })
            });
        } catch (err) {
            console.warn("Failed to sync progress to server:", err);
        }
    };

    // Fullscreen toggle
    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(err => {});
        } else {
            document.exitFullscreen().then(() => setIsFullscreen(false));
        }
    };

    // Format Remaining Time
    const formatTime = (secs) => {
        const totalSecs = Number(secs) || 0;
        const hrs = Math.floor(totalSecs / 3600);
        const mins = Math.floor((totalSecs % 3600) / 60);
        const seconds = totalSecs % 60;
        return `${hrs > 0 ? hrs + ':' : ''}${mins.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    // Question selection
    const activeQuestions = currentSection === 'aptitude' ? aptQuestions : dsaQuestions;
    const currentQ = activeQuestions[currentIndex];

    const markQuestionStatus = (qId, status) => {
        setQuestionStatuses(prev => ({
            ...prev,
            [qId]: status
        }));
    };

    const handleSelectOption = (qId, optionKey) => {
        setAnswers(prev => ({
            ...prev,
            [qId]: optionKey
        }));
        markQuestionStatus(qId, 'answered');
    };

    const handleCodeChange = (qId, value) => {
        setAnswers(prev => ({
            ...prev,
            [qId]: value
        }));
        markQuestionStatus(qId, 'answered');
    };

    // Run Code via backend execution engine
    const handleRunCode = async () => {
        if (!currentQ || runningCode) return;
        setRunningCode(true);
        const code = answers[currentQ.id] || currentQ.starterCode?.[selectedLanguage] || '';

        try {
            const res = await fetch(`${API_URL}/api/execute`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    language: selectedLanguage,
                    code: code,
                    problemSlug: currentQ.slug
                })
            });

            if (!res.ok) throw new Error("Compilation server error");
            const data = await res.json();

            let outputText = '';
            if (data.compileError) {
                outputText = `Compilation Error:\n${data.compileError}`;
            } else if (data.runtimeError) {
                outputText = `Runtime Error:\n${data.runtimeError}`;
            } else {
                const passedCount = data.results?.filter(r => r.passed).length || 0;
                const totalCount = data.results?.length || 0;
                outputText = `Test Results: ${passedCount}/${totalCount} Passed\n\n`;

                data.results?.forEach((r, idx) => {
                    outputText += `Case ${idx + 1}: ${r.passed ? '✅ PASSED' : '❌ FAILED'}\n`;
                    outputText += `Input: ${r.input}\n`;
                    outputText += `Expected: ${r.expected}\n`;
                    outputText += `Actual: ${r.actual}\n`;
                    if (r.stdout) outputText += `Stdout: ${r.stdout}\n`;
                    outputText += `--------------------------------\n`;
                });
            }

            setRunOutputs(prev => ({ ...prev, [currentQ.id]: outputText }));
        } catch (error) {
            setRunOutputs(prev => ({ ...prev, [currentQ.id]: `Execution Failed: ${error.message}` }));
        } finally {
            setRunningCode(false);
        }
    };

    // Navigation Controls
    const handleNext = () => {
        if (!questionStatuses[currentQ.id]) {
            markQuestionStatus(currentQ.id, 'visited');
        }

        if (currentIndex < activeQuestions.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else if (currentSection === 'aptitude') {
            setCurrentSection('dsa');
            setCurrentIndex(0);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        } else if (currentSection === 'dsa') {
            setCurrentSection('aptitude');
            setCurrentIndex(aptQuestions.length - 1);
        }
    };

    const handleMarkForReview = () => {
        markQuestionStatus(currentQ.id, 'review');
        handleNext();
    };

    const handleSaveAndNext = () => {
        if (answers[currentQ.id]) {
            markQuestionStatus(currentQ.id, 'answered');
        } else {
            markQuestionStatus(currentQ.id, 'visited');
        }
        handleNext();
    };

    // Submitting mock test to MongoDB
    const handleConfirmSubmit = () => {
        setShowConfirmModal(true);
    };

    const submitTest = async (attId = attemptId, testAnswers = answers) => {
        if (submitting) return;
        setSubmitting(true);
        setShowConfirmModal(false);

        try {
            const res = await fetch(`${API_URL}/api/mock-tests/submit/${attId}`, {
                method: 'POST',
                headers: {
                    'x-user-uid': currentUser.uid,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ answers: testAnswers })
            });

            if (!res.ok) throw new Error("Failed to submit exam session");
            const finalAttempt = await res.json();

            // Clear cache
            const cacheKey = `mock_test_cache_${currentUser.uid}_${testId}`;
            localStorage.removeItem(cacheKey);

            if (timerRef.current) clearInterval(timerRef.current);

            // Navigate to results
            navigate(`/mock-tests/result/${finalAttempt._id}`);

        } catch (error) {
            console.error("Error submitting test:", error);
            alert("An error occurred during submission. Your progress is saved.");
        } finally {
            setSubmitting(false);
        }
    };

    // Palette count calculation
    const paletteCounts = () => {
        let answered = 0;
        let review = 0;
        let visited = 0;
        let unvisited = 0;

        aptQuestions.forEach(q => {
            const status = questionStatuses[q.id];
            if (status === 'answered') answered++;
            else if (status === 'review') review++;
            else if (status === 'visited') visited++;
            else unvisited++;
        });

        dsaQuestions.forEach(q => {
            const status = questionStatuses[q.id];
            if (status === 'answered') answered++;
            else if (status === 'review') review++;
            else if (status === 'visited') visited++;
            else unvisited++;
        });

        return { answered, review, visited, unvisited };
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 size={32} className="text-indigo-400 animate-spin" />
                    <p className="text-zinc-400 text-sm">Building fullscreen environment & loading MongoDB problems...</p>
                </div>
            </div>
        );
    }

    if (submitting) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 size={32} className="text-indigo-400 animate-spin" />
                    <p className="text-zinc-400 text-sm">Evaluating answers & compiling DSA results matrix...</p>
                </div>
            </div>
        );
    }

    const { answered, review, visited: visCount, unvisited } = paletteCounts();

    return (
        <div className="min-h-screen bg-[#070707] text-white flex flex-col justify-between selection:bg-indigo-500/20 relative overflow-hidden">
            {/* SaaS grid backdrop */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808003_1px,transparent_1px),linear-gradient(to_bottom,#80808003_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

            {/* HEADER */}
            <header className="px-6 py-4 border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-md relative z-10 flex items-center justify-between shrink-0">
                <div 
                    onClick={() => setShowExitModal(true)}
                    className="flex items-center gap-3 cursor-pointer group"
                    title="Exit and return to Mock Tests"
                >
                    <img
                        src={logo_img}
                        alt="CodeHubx Logo"
                        className="w-8 h-8 rounded-xl shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300 object-cover"
                    />
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-zinc-400 group-hover:text-white transition-colors flex items-center gap-1">
                            <ChevronLeft size={12} className="inline group-hover:-translate-x-0.5 transition-transform" /> Exit Test
                        </span>
                        <span className="text-[10px] text-zinc-500 max-w-[120px] md:max-w-none truncate">{testName}</span>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    {/* Timer visualization */}
                    <div className="flex items-center gap-3">
                        <Clock size={16} className={remainingSeconds < 300 ? 'text-rose-500 animate-pulse' : 'text-indigo-400'} />
                        <span className={`font-mono text-sm font-extrabold tracking-wider ${remainingSeconds < 300 ? 'text-rose-500' : 'text-indigo-300'}`}>
                            {formatTime(remainingSeconds)}
                        </span>
                    </div>

                    {/* Window Controls */}
                    <button 
                        onClick={toggleFullscreen}
                        className="p-2 hover:bg-white/5 rounded-xl border border-transparent hover:border-white/10 text-zinc-400 hover:text-white transition-all cursor-pointer hidden sm:inline-flex"
                        title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                    >
                        {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
                    </button>

                    <button 
                        onClick={handleConfirmSubmit}
                        className="px-3.5 py-1.5 bg-white hover:bg-zinc-100 text-zinc-950 font-bold rounded-lg text-[10px] uppercase tracking-wider cursor-pointer transition-all shadow-md shrink-0"
                    >
                        Submit Test
                    </button>
                </div>
            </header>

            {/* MAIN CORE WINDOW */}
            <main className="flex-1 flex flex-col lg:flex-row relative z-10 overflow-hidden min-h-0">
                
                {/* LEFT COLUMN: Question display area */}
                <div className="flex-1 flex flex-col min-w-0 bg-[#070707] p-6 overflow-y-auto">
                    
                    {/* Topic display */}
                    {currentQ && (
                        <div className="mb-4 flex items-center justify-between">
                            <span className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold">
                                {currentSection === 'aptitude' ? `Aptitude · ${currentQ.topic}` : `DSA Coding · ${currentQ.topic}`}
                            </span>
                            <span className={`text-[9px] px-2 py-0.5 rounded-full border font-bold uppercase tracking-wider ${
                                currentQ.difficulty === 'Easy' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                                currentQ.difficulty === 'Medium' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' :
                                'bg-red-500/10 border-red-500/20 text-red-400'
                            }`}>
                                {currentQ.difficulty}
                            </span>
                        </div>
                    )}

                    {currentQ ? (
                        <div className="space-y-6 flex-1 flex flex-col min-h-0">
                            {currentSection === 'aptitude' ? (
                                // MCQ DISPLAY
                                <div className="space-y-6">
                                    <div className="p-5 rounded-2xl border border-white/5 bg-[#0a0a0a]">
                                        <p className="text-zinc-200 text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                                            {currentQ.questionText}
                                        </p>
                                    </div>

                                    {/* MCQ Options list */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {currentQ.options?.map((opt) => {
                                            const isSelected = answers[currentQ.id] === opt.key;
                                            return (
                                                <button
                                                    key={opt.key}
                                                    onClick={() => handleSelectOption(currentQ.id, opt.key)}
                                                    className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-center gap-3.5 group cursor-pointer ${
                                                        isSelected
                                                            ? 'border-indigo-500/40 bg-indigo-500/10 shadow-lg shadow-indigo-500/5'
                                                            : 'border-white/5 bg-white/[0.01] hover:bg-white/5 hover:border-white/10'
                                                    }`}
                                                >
                                                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 border transition-all ${
                                                        isSelected
                                                            ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-400'
                                                            : 'bg-white/5 border-white/10 text-zinc-500 group-hover:text-white group-hover:border-white/20'
                                                    }`}>
                                                        {opt.key}
                                                    </span>
                                                    <span className={`text-xs md:text-sm leading-relaxed ${isSelected ? 'text-indigo-300 font-medium' : 'text-zinc-300 group-hover:text-white'}`}>
                                                        {opt.text}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ) : (
                                // DSA CODING DISPLAY
                                <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
                                    {/* Left: Problem statement */}
                                    <div className="w-full lg:w-1/2 flex flex-col space-y-4 max-h-[70vh] lg:max-h-[80vh] overflow-y-auto pr-2">
                                        <div className="p-5 rounded-2xl border border-white/5 bg-[#0a0a0a] space-y-4">
                                            <h3 className="text-sm font-bold text-white">{currentQ.title}</h3>
                                            <p className="text-zinc-400 text-xs leading-relaxed whitespace-pre-wrap">
                                                {currentQ.description}
                                            </p>
                                        </div>

                                        {currentQ.examples && currentQ.examples.map((ex, idx) => (
                                            <div key={idx} className="p-4 rounded-xl border border-white/5 bg-white/[0.01] text-[11px] font-mono space-y-1">
                                                <div className="text-zinc-500 font-bold uppercase tracking-wider text-[9px] mb-1">Example {idx + 1}</div>
                                                <div className="text-zinc-300"><span className="text-zinc-500">Input:</span> {ex.input}</div>
                                                <div className="text-zinc-300"><span className="text-zinc-500">Output:</span> {ex.output}</div>
                                                {ex.explanation && <div className="text-zinc-400 text-[10px] mt-1 italic"><span className="text-zinc-500 font-bold">Explanation:</span> {ex.explanation}</div>}
                                            </div>
                                        ))}

                                        {currentQ.constraints && currentQ.constraints.length > 0 && (
                                            <div className="p-4 rounded-xl border border-white/5 bg-white/[0.01]">
                                                <div className="text-zinc-500 font-bold uppercase tracking-wider text-[9px] mb-1.5">Constraints</div>
                                                <ul className="list-disc list-inside text-[11px] text-zinc-400 space-y-1 font-mono">
                                                    {currentQ.constraints.map((c, i) => <li key={i}>{c}</li>)}
                                                </ul>
                                            </div>
                                        )}
                                    </div>

                                    {/* Right: Monaco Editor */}
                                    <div className="flex-1 flex flex-col space-y-4 min-h-[50vh] lg:min-h-0">
                                        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-zinc-950 border border-white/5 text-xs">
                                            <div className="flex items-center gap-1.5 text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                                                <Code2 size={14} className="text-indigo-400" /> Coding Editor
                                            </div>
                                            <select
                                                value={selectedLanguage}
                                                onChange={(e) => setSelectedLanguage(e.target.value)}
                                                className="bg-transparent border-none text-zinc-300 focus:outline-none font-bold"
                                            >
                                                <option value="javascript">JavaScript</option>
                                                <option value="python">Python</option>
                                                <option value="cpp">C++</option>
                                                <option value="java">Java</option>
                                            </select>
                                        </div>

                                        <div className="flex-1 rounded-xl overflow-hidden border border-white/5 min-h-[300px]">
                                            <Editor
                                                height="100%"
                                                theme="vs-dark"
                                                language={selectedLanguage}
                                                value={answers[currentQ.id] || currentQ.starterCode?.[selectedLanguage] || ''}
                                                onChange={(val) => handleCodeChange(currentQ.id, val)}
                                                options={{
                                                    fontSize: 13,
                                                    minimap: { enabled: false },
                                                    automaticLayout: true,
                                                    scrollbar: { verticalScrollbarSize: 8 },
                                                    padding: { top: 12 }
                                                }}
                                            />
                                        </div>

                                        {/* Compiler console */}
                                        <div className="flex flex-col space-y-2">
                                            <div className="flex items-center justify-between">
                                                <button
                                                    onClick={handleRunCode}
                                                    disabled={runningCode}
                                                    className="px-4 py-2 bg-white text-black hover:bg-zinc-200 transition-colors rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                                                >
                                                    {runningCode ? <Loader2 size={12} className="animate-spin" /> : <Play size={10} className="fill-black" />}
                                                    Run Code
                                                </button>
                                            </div>
                                            
                                            {runOutputs[currentQ.id] && (
                                                <div className="p-4 rounded-xl bg-zinc-950 border border-white/5 text-[11px] font-mono text-zinc-300 whitespace-pre-wrap max-h-44 overflow-y-auto">
                                                    {runOutputs[currentQ.id]}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-zinc-500 py-12 text-center">No active questions loaded.</div>
                    )}
                </div>

                {/* RIGHT COLUMN: Sidebar controls / palette */}
                <div className="w-full lg:w-76 border-t lg:border-t-0 lg:border-l border-white/5 bg-[#0a0a0a]/50 p-6 flex flex-col justify-between shrink-0 overflow-y-auto">
                    
                    {/* Navigation palettes */}
                    <div className="space-y-6">
                        {/* Section tabs */}
                        <div className="flex gap-2 p-1 bg-white/[0.02] border border-white/5 rounded-xl text-[10px] font-bold">
                            <button 
                                onClick={() => { setCurrentSection('aptitude'); setCurrentIndex(0); }}
                                className={`flex-1 py-1.5 rounded-lg transition-colors cursor-pointer ${
                                    currentSection === 'aptitude' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-white'
                                }`}
                            >
                                Aptitude ({aptQuestions.length})
                            </button>
                            <button 
                                onClick={() => { setCurrentSection('dsa'); setCurrentIndex(0); }}
                                className={`flex-1 py-1.5 rounded-lg transition-colors cursor-pointer ${
                                    currentSection === 'dsa' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-white'
                                }`}
                            >
                                DSA Coding ({dsaQuestions.length})
                            </button>
                        </div>

                        {/* Palette Grid */}
                        <div className="space-y-3">
                            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Question Navigator</span>
                            <div className="grid grid-cols-5 gap-2">
                                {activeQuestions.map((q, idx) => {
                                    const status = questionStatuses[q.id];
                                    const isCurrent = idx === currentIndex;
                                    
                                    let btnStyle = 'border-white/5 bg-white/[0.01] text-zinc-500 hover:bg-white/5';
                                    if (status === 'answered') btnStyle = 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
                                    else if (status === 'review') btnStyle = 'bg-indigo-500/15 border-indigo-500/30 text-indigo-400';
                                    else if (status === 'visited') btnStyle = 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400';

                                    if (isCurrent) btnStyle += ' ring-2 ring-indigo-500/50 ring-offset-2 ring-offset-zinc-950 scale-105 font-black text-white';

                                    return (
                                        <button
                                            key={q.id}
                                            onClick={() => setCurrentIndex(idx)}
                                            className={`h-9 rounded-xl border text-[11px] font-bold flex items-center justify-center transition-all cursor-pointer ${btnStyle}`}
                                        >
                                            {idx + 1}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Legend */}
                        <div className="pt-2 grid grid-cols-2 gap-2 text-[9px] text-zinc-400 font-semibold border-t border-white/5">
                            <div className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded bg-emerald-500/20 border border-emerald-500/30 inline-block" /> Answered
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded bg-indigo-500/20 border border-indigo-500/30 inline-block" /> Review
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded bg-yellow-500/20 border border-yellow-500/30 inline-block" /> Skipped
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded bg-white/5 border border-white/10 inline-block" /> Unvisited
                            </div>
                        </div>
                    </div>

                    {/* Submit statistics / button */}
                    <div className="pt-6 border-t border-white/5 mt-6 space-y-4">
                        <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Session Overview</div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="p-2.5 rounded-lg border border-white/[0.04] bg-white/[0.01]">
                                <span className="text-[9px] text-zinc-600 block uppercase">Answered</span>
                                <span className="font-bold text-emerald-400">{answered}</span>
                            </div>
                            <div className="p-2.5 rounded-lg border border-white/[0.04] bg-white/[0.01]">
                                <span className="text-[9px] text-zinc-600 block uppercase">Unsolved</span>
                                <span className="font-bold text-zinc-400">{unvisited + visCount + review}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* BOTTOM NAV BAR */}
            <footer className="px-6 py-4 border-t border-white/5 bg-[#0a0a0a] flex items-center justify-between shrink-0 relative z-10">
                <button
                    onClick={handlePrev}
                    className="px-4 py-2 border border-white/10 hover:bg-white/5 text-zinc-300 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                    <ChevronLeft size={14} /> Previous
                </button>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleMarkForReview}
                        className="px-4 py-2 border border-indigo-500/25 hover:bg-indigo-500/10 text-indigo-400 hover:text-indigo-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                        <Bookmark size={13} /> Mark for Review
                    </button>
                    <button
                        onClick={handleSaveAndNext}
                        className="px-5 py-2 bg-white text-black hover:bg-zinc-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                        Save & Next <ChevronRight size={14} />
                    </button>
                </div>
            </footer>

            {/* SUBMISSION CONFIRMATION MODAL */}
            <AnimatePresence>
                {showConfirmModal && (
                    <div className="fixed inset-0 flex items-center justify-center z-[150] p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-2xl p-6 shadow-2xl space-y-6"
                        >
                            <div className="flex items-center justify-between pb-2 border-b border-white/5">
                                <h3 className="text-base font-bold text-white flex items-center gap-2">
                                    <AlertTriangle className="text-yellow-400 w-5 h-5" /> Submit Exam?
                                </h3>
                                <button onClick={() => setShowConfirmModal(false)} className="p-1 hover:bg-white/5 rounded-lg text-zinc-400 hover:text-white cursor-pointer"><X className="w-5 h-5" /></button>
                            </div>
                            <div className="text-xs text-zinc-400 space-y-3">
                                <p>Are you sure you want to finish the mock test? Once submitted, you cannot edit your answers or resume this attempt.</p>
                                <div className="p-4 rounded-xl bg-zinc-950 border border-white/5 space-y-2 font-semibold">
                                    <div className="flex justify-between">
                                        <span>Total Questions:</span>
                                        <span className="text-white">{aptQuestions.length + dsaQuestions.length}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-emerald-400">Answered:</span>
                                        <span className="text-emerald-400">{answered}</span>
                                    </div>
                                    <div className="flex justify-between text-yellow-500">
                                        <span>Skipped / Visited:</span>
                                        <span>{paletteCounts().visited}</span>
                                    </div>
                                    <div className="flex justify-between text-indigo-400">
                                        <span>Marked for Review:</span>
                                        <span>{review}</span>
                                    </div>
                                    <div className="flex justify-between text-zinc-500">
                                        <span>Unvisited:</span>
                                        <span>{unvisited}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-4 border-t border-white/5">
                                <button
                                    onClick={() => setShowConfirmModal(false)}
                                    className="px-4 py-2 border border-white/10 rounded-lg hover:bg-white/5 text-zinc-300 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                 <button
                                    onClick={() => submitTest(attemptId, answers)}
                                    className="px-4 py-2 bg-white hover:bg-zinc-100 text-zinc-950 font-bold rounded-lg text-[10px] uppercase tracking-wider cursor-pointer transition-all shadow-md"
                                >
                                    Yes, Submit Exam
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* EXIT CONFIRMATION MODAL */}
            <AnimatePresence>
                {showExitModal && (
                    <div className="fixed inset-0 flex items-center justify-center z-[150] p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-2xl p-6 shadow-2xl space-y-6"
                        >
                            <div className="flex items-center justify-between pb-2 border-b border-white/5">
                                <h3 className="text-base font-bold text-white flex items-center gap-2">
                                    <AlertTriangle className="text-yellow-400 w-5 h-5" /> Exit Mock Test?
                                </h3>
                                <button onClick={() => setShowExitModal(false)} className="p-1 hover:bg-white/5 rounded-lg text-zinc-400 hover:text-white cursor-pointer"><X className="w-5 h-5" /></button>
                            </div>
                            <div className="text-xs text-zinc-400 space-y-3">
                                <p>Are you sure you want to exit the exam screen? Your current answers are saved, but the timer will <strong className="text-red-400">continue to run</strong> in the background.</p>
                                <p>You can resume the test anytime from the Mock Tests dashboard until the time expires.</p>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-4 border-t border-white/5">
                                <button
                                    onClick={() => setShowExitModal(false)}
                                    className="px-4 py-2 border border-white/10 rounded-lg hover:bg-white/5 text-zinc-300 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        setShowExitModal(false);
                                        navigate('/mock-tests');
                                    }}
                                    className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg cursor-pointer transition-colors"
                                >
                                    Yes, Exit Test
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MockTestWindow;
