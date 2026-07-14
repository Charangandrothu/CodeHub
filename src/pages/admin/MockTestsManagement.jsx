import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../config';
import { 
    Plus, Edit, Trash2, Database, UploadCloud, CheckCircle2, 
    TrendingUp, X, Check, Eye, HelpCircle, Layers, FileCode,
    Sparkles, AlertCircle, RefreshCw, BarChart2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../../components/ui/Button';

const MockTestsManagement = () => {
    const { currentUser } = useAuth();
    
    // Active Tab State
    const [activeTab, setActiveTab] = useState('tests');

    // Data States
    const [mockTests, setMockTests] = useState([]);
    const [dsaQuestions, setDsaQuestions] = useState([]);
    const [aptitudeQuestions, setAptitudeQuestions] = useState([]);
    const [attempts, setAttempts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Modal & Form States
    const [isTestModalOpen, setIsTestModalOpen] = useState(false);
    const [editingTest, setEditingTest] = useState(null);
    const [testForm, setTestForm] = useState({
        name: '',
        description: '',
        difficulty: 'Medium',
        timeLimit: 90,
        dsaCount: 3,
        aptitudeCount: 50,
        isCustom: false,
        dsaQuestions: [],
        aptitudeQuestions: [],
        isActive: true
    });

    const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
    const [questionType, setQuestionType] = useState('dsa'); // 'dsa' or 'aptitude'
    const [editingQuestion, setEditingQuestion] = useState(null);
    
    const [dsaForm, setDsaForm] = useState({
        title: '',
        slug: '',
        difficulty: 'Medium',
        topic: 'Arrays',
        description: '',
        constraints: '',
        examples: [{ input: '', output: '', explanation: '' }],
        starterCode: { javascript: '', python: '', cpp: '', java: '' },
        testCases: { visible: [{ input: '', output: '' }], hidden: [{ input: '', output: '' }] },
        isActive: true,
        tags: ''
    });

    const [aptForm, setAptForm] = useState({
        questionText: '',
        options: [
            { key: 'A', text: '' },
            { key: 'B', text: '' },
            { key: 'C', text: '' },
            { key: 'D', text: '' }
        ],
        correctAnswer: 'A',
        explanation: '',
        formulaHint: '',
        section: 'aptitude',
        topic: 'Percentages',
        difficulty: 'Medium',
        isActive: true
    });

    const [bulkPaste, setBulkPaste] = useState('');
    const [bulkType, setBulkType] = useState('aptitude');
    const [bulkMessage, setBulkMessage] = useState('');

    useEffect(() => {
        if (currentUser) {
            fetchInitialData();
        }
    }, [currentUser]);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const headers = { 'x-user-uid': currentUser.uid };

            // 1. Fetch Mock Tests from backend API
            const testsRes = await fetch(`${API_URL}/api/mock-tests`, { headers });
            if (testsRes.ok) {
                const data = await testsRes.json();
                setMockTests(data);
            }

            // 2. Fetch DSA Problems from backend API
            const dsaRes = await fetch(`${API_URL}/api/problems`, { headers });
            if (dsaRes.ok) {
                const data = await dsaRes.json();
                setDsaQuestions(data);
            }

            // 3. Fetch Company Prep MCQs (Aptitude) from backend API
            const aptRes = await fetch(`${API_URL}/api/company-questions/admin?limit=1000`, { headers });
            if (aptRes.ok) {
                const data = await aptRes.json();
                setAptitudeQuestions(data);
            }

            // 4. Fetch Analytics and Attempts
            const analyticsRes = await fetch(`${API_URL}/api/mock-tests/admin/analytics`, { headers });
            if (analyticsRes.ok) {
                const data = await analyticsRes.json();
                setAttempts(data.attempts || []);
            }

        } catch (error) {
            console.error("Error fetching admin mock tests data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchInitialData();
        setRefreshing(false);
    };

    // CRUD Mock Test
    const handleOpenTestModal = (test = null) => {
        if (test) {
            setEditingTest(test);
            setTestForm({
                name: test.name || '',
                description: test.description || '',
                difficulty: test.difficulty || 'Medium',
                timeLimit: test.timeLimit || 90,
                dsaCount: test.dsaCount || 3,
                aptitudeCount: test.aptitudeCount || 50,
                isCustom: test.isCustom || false,
                dsaQuestions: test.dsaQuestions || [],
                aptitudeQuestions: test.aptitudeQuestions || [],
                isActive: test.isActive !== false
            });
        } else {
            setEditingTest(null);
            setTestForm({
                name: '',
                description: '',
                difficulty: 'Medium',
                timeLimit: 90,
                dsaCount: 3,
                aptitudeCount: 50,
                isCustom: false,
                dsaQuestions: [],
                aptitudeQuestions: [],
                isActive: true
            });
        }
        setIsTestModalOpen(true);
    };

    const handleSaveTest = async (e) => {
        e.preventDefault();
        try {
            const method = editingTest ? 'PUT' : 'POST';
            const url = editingTest 
                ? `${API_URL}/api/mock-tests/${editingTest._id}` 
                : `${API_URL}/api/mock-tests`;

            const res = await fetch(url, {
                method,
                headers: {
                    'x-user-uid': currentUser.uid,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(testForm)
            });

            if (!res.ok) throw new Error("Failed to save mock test");

            setIsTestModalOpen(false);
            await fetchInitialData();
        } catch (err) {
            console.error("Error saving mock test:", err);
            alert("Failed to save mock test.");
        }
    };

    const handleDeleteTest = async (id) => {
        if (!window.confirm("Are you sure you want to delete this Mock Test?")) return;
        try {
            const res = await fetch(`${API_URL}/api/mock-tests/${id}`, {
                method: 'DELETE',
                headers: { 'x-user-uid': currentUser.uid }
            });
            if (!res.ok) throw new Error("Failed to delete test");
            await fetchInitialData();
        } catch (err) {
            console.error("Error deleting mock test:", err);
        }
    };

    // CRUD Questions (Connects to backend problems/company-prep routes)
    const handleOpenQuestionModal = (type, q = null) => {
        setQuestionType(type);
        setEditingQuestion(q);

        if (type === 'dsa') {
            if (q) {
                setDsaForm({
                    title: q.title || '',
                    slug: q.slug || '',
                    difficulty: q.difficulty || 'Medium',
                    topic: q.topic || 'Arrays',
                    description: q.description || '',
                    constraints: Array.isArray(q.constraints) ? q.constraints.join('\n') : q.constraints || '',
                    examples: q.examples || [{ input: '', output: '', explanation: '' }],
                    starterCode: q.starterCode || { javascript: '', python: '', cpp: '', java: '' },
                    testCases: q.testCases || { visible: [{ input: '', output: '' }], hidden: [{ input: '', output: '' }] },
                    isActive: q.visibility === 'public',
                    tags: Array.isArray(q.tags) ? q.tags.join(', ') : q.tags || ''
                });
            } else {
                setDsaForm({
                    title: '',
                    slug: '',
                    difficulty: 'Medium',
                    topic: 'Arrays',
                    description: '',
                    constraints: '',
                    examples: [{ input: '', output: '', explanation: '' }],
                    starterCode: { javascript: '', python: '', cpp: '', java: '' },
                    testCases: { visible: [{ input: '', output: '' }], hidden: [{ input: '', output: '' }] },
                    isActive: true,
                    tags: ''
                });
            }
        } else {
            if (q) {
                setAptForm({
                    questionText: q.questionText || '',
                    options: q.options || [
                        { key: 'A', text: '' },
                        { key: 'B', text: '' },
                        { key: 'C', text: '' },
                        { key: 'D', text: '' }
                    ],
                    correctAnswer: q.correctAnswer || 'A',
                    explanation: q.explanation || '',
                    formulaHint: q.formulaHint || '',
                    section: q.section || 'aptitude',
                    topic: q.topic || 'Percentages',
                    difficulty: q.difficulty || 'Medium',
                    isActive: q.isActive !== false
                });
            } else {
                setAptForm({
                    questionText: '',
                    options: [
                        { key: 'A', text: '' },
                        { key: 'B', text: '' },
                        { key: 'C', text: '' },
                        { key: 'D', text: '' }
                    ],
                    correctAnswer: 'A',
                    explanation: '',
                    formulaHint: '',
                    section: 'aptitude',
                    topic: 'Percentages',
                    difficulty: 'Medium',
                    isActive: true
                });
            }
        }
        setIsQuestionModalOpen(true);
    };

    const handleSaveQuestion = async (e) => {
        e.preventDefault();
        try {
            const headers = {
                'x-user-uid': currentUser.uid,
                'Content-Type': 'application/json'
            };

            if (questionType === 'dsa') {
                const formattedDsa = {
                    ...dsaForm,
                    constraints: dsaForm.constraints.split('\n').filter(c => c.trim()),
                    tags: dsaForm.tags.split(',').map(t => t.trim()).filter(t => t),
                    visibility: dsaForm.isActive ? 'public' : 'hidden',
                    slug: dsaForm.slug || dsaForm.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
                };

                const method = editingQuestion ? 'PUT' : 'POST';
                const url = editingQuestion 
                    ? `${API_URL}/api/problems/${editingQuestion._id}` 
                    : `${API_URL}/api/problems`;

                const res = await fetch(url, {
                    method,
                    headers,
                    body: JSON.stringify(formattedDsa)
                });
                if (!res.ok) throw new Error("Failed to save coding problem");

            } else {
                const method = editingQuestion ? 'PUT' : 'POST';
                const url = editingQuestion 
                    ? `${API_URL}/api/company-questions/admin/${editingQuestion._id}` 
                    : `${API_URL}/api/company-questions/admin`;

                const res = await fetch(url, {
                    method,
                    headers,
                    body: JSON.stringify(aptForm)
                });
                if (!res.ok) throw new Error("Failed to save aptitude MCQ");
            }

            setIsQuestionModalOpen(false);
            await fetchInitialData();
        } catch (err) {
            console.error("Error saving question:", err);
            alert("Failed to save question.");
        }
    };

    const handleDeleteQuestion = async (type, id) => {
        if (!window.confirm("Delete this question from MongoDB?")) return;
        try {
            const url = type === 'dsa' 
                ? `${API_URL}/api/problems/${id}` 
                : `${API_URL}/api/company-questions/admin/${id}`;

            const res = await fetch(url, {
                method: 'DELETE',
                headers: { 'x-user-uid': currentUser.uid }
            });
            if (!res.ok) throw new Error("Failed to delete question");
            await fetchInitialData();
        } catch (err) {
            console.error("Error deleting question:", err);
        }
    };

    // Bulk Paste Uploader to MongoDB APIs
    const handleBulkUpload = async () => {
        if (!bulkPaste.trim()) {
            setBulkMessage("Please paste valid JSON questions.");
            return;
        }

        try {
            const list = JSON.parse(bulkPaste);
            if (!Array.isArray(list)) throw new Error("JSON must be an array of objects.");

            const url = bulkType === 'dsa' 
                ? `${API_URL}/api/problems/bulk` 
                : `${API_URL}/api/company-questions/admin/bulk`;

            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'x-user-uid': currentUser.uid,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(bulkType === 'dsa' ? list : { questions: list })
            });

            if (!res.ok) throw new Error("Bulk upload failed on backend");
            const resData = await res.json();

            setBulkMessage(`Processed: Loaded ${resData.insertedCount || list.length} questions into MongoDB successfully!`);
            setBulkPaste('');
            await fetchInitialData();
        } catch (err) {
            setBulkMessage(`Upload error: ${err.message}`);
        }
    };

    // Analytics calculations
    const totalAttempts = attempts.length;
    const avgScore = totalAttempts > 0 
        ? Math.round(attempts.reduce((s, a) => s + (a.score || 0), 0) / totalAttempts) 
        : 0;
    const avgAccuracy = totalAttempts > 0 
        ? Math.round(attempts.reduce((s, a) => s + (a.accuracy || 0), 0) / totalAttempts) 
        : 0;

    return (
        <div className="space-y-8 pb-12">
            {/* Header section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <h1 className="text-3xl font-extrabold text-white tracking-tight">Mock Tests Management</h1>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">MONGODB DATABASE</span>
                    </div>
                    <p className="text-zinc-400 text-sm">Configure, create, and review placement mock tests for candidates.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-800 bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white transition-all font-semibold text-xs cursor-pointer"
                    >
                        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                        Refresh Data
                    </button>
                    <button 
                        onClick={() => handleOpenTestModal()}
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white text-black hover:bg-zinc-200 transition-all font-semibold text-xs cursor-pointer"
                    >
                        <Plus className="w-4 h-4" />
                        Create Mock Test
                    </button>
                </div>
            </div>

            {/* Admin Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl border border-white/5 bg-white/[0.01] backdrop-blur-md">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Mock Tests</span>
                    <span className="text-2xl font-bold text-white mt-1 block">{mockTests.length}</span>
                </div>
                <div className="p-4 rounded-xl border border-white/5 bg-white/[0.01] backdrop-blur-md">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">DSA Problems</span>
                    <span className="text-2xl font-bold text-white mt-1 block">{dsaQuestions.length}</span>
                </div>
                <div className="p-4 rounded-xl border border-white/5 bg-white/[0.01] backdrop-blur-md">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Aptitude Qs</span>
                    <span className="text-2xl font-bold text-white mt-1 block">{aptitudeQuestions.length}</span>
                </div>
                <div className="p-4 rounded-xl border border-white/5 bg-white/[0.01] backdrop-blur-md">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Total Attempts</span>
                    <span className="text-2xl font-bold text-white mt-1 block">{totalAttempts}</span>
                </div>
            </div>

            {/* Tabs Selector */}
            <div className="flex border-b border-white/5 space-x-6 text-sm font-medium">
                {[
                    { key: 'tests', label: 'Mock Tests', icon: Layers },
                    { key: 'dsa', label: 'DSA Database', icon: FileCode },
                    { key: 'aptitude', label: 'Aptitude Database', icon: HelpCircle },
                    { key: 'bulk', label: 'Bulk Uploader', icon: UploadCloud },
                    { key: 'analytics', label: 'Attempt Analytics', icon: BarChart2 }
                ].map(tab => {
                    const active = activeTab === tab.key;
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex items-center gap-2 py-3 border-b-2 font-semibold transition-colors duration-200 cursor-pointer ${
                                active ? 'border-purple-500 text-purple-400' : 'border-transparent text-zinc-400 hover:text-white'
                            }`}
                        >
                            <Icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Loader / Content Area */}
            {loading ? (
                <div className="h-64 flex items-center justify-center">
                    <RefreshCw className="w-8 h-8 text-purple-500 animate-spin" />
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Tab 1: Mock Tests list */}
                    {activeTab === 'tests' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {mockTests.map(test => (
                                <div key={test._id} className="p-6 rounded-2xl border border-white/5 bg-[#0e0e0e] flex flex-col justify-between group hover:border-white/10 transition-all duration-300 relative overflow-hidden">
                                    <div className="space-y-4">
                                        <div className="flex items-start justify-between">
                                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                                                test.difficulty === 'Easy' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                                                test.difficulty === 'Medium' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' :
                                                test.difficulty === 'Hard' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                                                'bg-purple-500/10 border-purple-500/20 text-purple-400'
                                            }`}>
                                                {test.difficulty}
                                            </span>
                                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                                                test.isActive ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-zinc-800 border-zinc-700 text-zinc-400'
                                            }`}>
                                                {test.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                        <div>
                                            <h3 className="text-base font-bold text-white tracking-tight">{test.name}</h3>
                                            <p className="text-zinc-500 text-xs mt-1.5 line-clamp-2 leading-relaxed">{test.description}</p>
                                        </div>
                                        <div className="flex items-center gap-4 text-xs text-zinc-400">
                                            <div>
                                                <span className="text-[10px] text-zinc-600 block font-semibold">DSA Qs</span>
                                                <span className="font-bold text-white">{test.dsaCount}</span>
                                            </div>
                                            <div>
                                                <span className="text-[10px] text-zinc-600 block font-semibold">Aptitude Qs</span>
                                                <span className="font-bold text-white">{test.aptitudeCount}</span>
                                            </div>
                                            <div>
                                                <span className="text-[10px] text-zinc-600 block font-semibold">Time</span>
                                                <span className="font-bold text-white">{test.timeLimit}m</span>
                                            </div>
                                            <div>
                                                <span className="text-[10px] text-zinc-600 block font-semibold">Type</span>
                                                <span className="font-bold text-white">{test.isCustom ? 'Custom' : 'Dynamic'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 mt-6 pt-4 border-t border-white/5">
                                        <button 
                                            onClick={() => handleOpenTestModal(test)}
                                            className="flex-1 py-2 rounded-xl border border-white/5 hover:border-white/15 text-xs font-semibold text-zinc-300 hover:text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                                        >
                                            <Edit className="w-3.5 h-3.5" /> Edit Test
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteTest(test._id)}
                                            className="p-2 rounded-xl border border-red-500/10 hover:border-red-500/30 text-red-500/60 hover:text-red-400 hover:bg-red-500/5 transition-all cursor-pointer"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Tab 2: DSA list */}
                    {activeTab === 'dsa' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-base font-bold text-white">DSA Problems database ({dsaQuestions.length} Questions)</h3>
                                <button 
                                    onClick={() => handleOpenQuestionModal('dsa')}
                                    className="px-3 py-1.5 rounded-xl border border-white/10 text-xs font-semibold hover:bg-white/5 cursor-pointer"
                                >
                                    + Add DSA Question
                                </button>
                            </div>
                            <div className="border border-white/5 rounded-xl overflow-hidden bg-zinc-950">
                                <table className="w-full text-left border-collapse text-xs">
                                    <thead>
                                        <tr className="border-b border-white/5 text-zinc-500 font-bold bg-white/[0.01]">
                                            <th className="p-3">Title</th>
                                            <th className="p-3">Topic</th>
                                            <th className="p-3">Difficulty</th>
                                            <th className="p-3">Visibility</th>
                                            <th className="p-3 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {dsaQuestions.map(q => (
                                            <tr key={q._id} className="border-b border-white/5 hover:bg-white/[0.02]">
                                                <td className="p-3 font-semibold text-white">{q.title}</td>
                                                <td className="p-3 text-zinc-400 capitalize">{q.topic}</td>
                                                <td className="p-3">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                                        q.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400' :
                                                        q.difficulty === 'Medium' ? 'bg-yellow-500/10 text-yellow-400' :
                                                        'bg-red-500/10 text-red-400'
                                                    }`}>
                                                        {q.difficulty}
                                                    </span>
                                                </td>
                                                <td className="p-3 text-zinc-400 capitalize">{q.visibility || 'public'}</td>
                                                <td className="p-3 text-right space-x-2">
                                                    <button onClick={() => handleOpenQuestionModal('dsa', q)} className="p-1 hover:text-blue-400 transition-colors cursor-pointer"><Edit className="w-3.5 h-3.5 inline" /></button>
                                                    <button onClick={() => handleDeleteQuestion('dsa', q._id)} className="p-1 hover:text-red-400 transition-colors cursor-pointer"><Trash2 className="w-3.5 h-3.5 inline" /></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Tab 3: Aptitude MCQs */}
                    {activeTab === 'aptitude' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-base font-bold text-white">Aptitude MCQ database ({aptitudeQuestions.length} Questions)</h3>
                                <button 
                                    onClick={() => handleOpenQuestionModal('aptitude')}
                                    className="px-3 py-1.5 rounded-xl border border-white/10 text-xs font-semibold hover:bg-white/5 cursor-pointer"
                                >
                                    + Add MCQ Question
                                </button>
                            </div>
                            <div className="border border-white/5 rounded-xl overflow-hidden bg-zinc-950">
                                <table className="w-full text-left border-collapse text-xs">
                                    <thead>
                                        <tr className="border-b border-white/5 text-zinc-500 font-bold bg-white/[0.01]">
                                            <th className="p-3">Question Text</th>
                                            <th className="p-3">Topic</th>
                                            <th className="p-3">Section</th>
                                            <th className="p-3">Ans</th>
                                            <th className="p-3 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {aptitudeQuestions.slice(0, 100).map(q => (
                                            <tr key={q._id} className="border-b border-white/5 hover:bg-white/[0.02]">
                                                <td className="p-3 font-medium text-white truncate max-w-xs">{q.questionText}</td>
                                                <td className="p-3 text-zinc-400 capitalize">{q.topic}</td>
                                                <td className="p-3 text-zinc-400 capitalize">{q.section}</td>
                                                <td className="p-3 text-emerald-400 font-bold">{q.correctAnswer}</td>
                                                <td className="p-3 text-right space-x-2">
                                                    <button onClick={() => handleOpenQuestionModal('aptitude', q)} className="p-1 hover:text-blue-400 transition-colors cursor-pointer"><Edit className="w-3.5 h-3.5 inline" /></button>
                                                    <button onClick={() => handleDeleteQuestion('aptitude', q._id)} className="p-1 hover:text-red-400 transition-colors cursor-pointer"><Trash2 className="w-3.5 h-3.5 inline" /></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {aptitudeQuestions.length > 100 && (
                                    <div className="p-3 text-center text-zinc-500 border-t border-white/5 text-[11px]">
                                        Showing top 100 of {aptitudeQuestions.length} questions.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Tab 4: Bulk Paste */}
                    {activeTab === 'bulk' && (
                        <div className="space-y-4 max-w-3xl">
                            <div>
                                <h3 className="text-base font-bold text-white">Bulk Paste Uploader</h3>
                                <p className="text-zinc-500 text-xs mt-1">Upload array list into MongoDB collection directly.</p>
                            </div>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-1 text-xs text-zinc-400 cursor-pointer">
                                    <input 
                                        type="radio" 
                                        name="bulkType" 
                                        checked={bulkType === 'aptitude'} 
                                        onChange={() => setBulkType('aptitude')} 
                                    /> Aptitude (MCQs)
                                </label>
                                <label className="flex items-center gap-1 text-xs text-zinc-400 cursor-pointer">
                                    <input 
                                        type="radio" 
                                        name="bulkType" 
                                        checked={bulkType === 'dsa'} 
                                        onChange={() => setBulkType('dsa')} 
                                    /> DSA Coding
                                </label>
                            </div>
                            <textarea
                                value={bulkPaste}
                                onChange={(e) => setBulkPaste(e.target.value)}
                                placeholder={`[\n  {\n    "questionText": "What is 15% of 200?",\n    "options": [\n      {"key": "A", "text": "25"},\n      {"key": "B", "text": "30"}\n    ],\n    "correctAnswer": "B",\n    "topic": "Percentages",\n    "difficulty": "Easy"\n  }\n]`}
                                className="w-full h-80 bg-zinc-900 border border-white/10 rounded-xl p-4 text-xs font-mono text-zinc-300 focus:outline-none focus:border-purple-500"
                            />
                            {bulkMessage && (
                                <p className="text-xs text-yellow-400">{bulkMessage}</p>
                            )}
                            <button 
                                onClick={handleBulkUpload}
                                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs transition-colors cursor-pointer"
                            >
                                Process Bulk Upload
                            </button>
                        </div>
                    )}

                    {/* Tab 5: Analytics */}
                    {activeTab === 'analytics' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                                <div className="p-5 rounded-2xl border border-white/5 bg-white/[0.01]">
                                    <h4 className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Average Attempt Score</h4>
                                    <div className="text-3xl font-extrabold text-purple-400 mt-2">{avgScore}%</div>
                                </div>
                                <div className="p-5 rounded-2xl border border-white/5 bg-white/[0.01]">
                                    <h4 className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Average Accuracy</h4>
                                    <div className="text-3xl font-extrabold text-emerald-400 mt-2">{avgAccuracy}%</div>
                                </div>
                                <div className="p-5 rounded-2xl border border-white/5 bg-white/[0.01]">
                                    <h4 className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Active Candidates</h4>
                                    <div className="text-3xl font-extrabold text-blue-400 mt-2">
                                        {new Set(attempts.map(a => a.userId)).size} Users
                                    </div>
                                </div>
                            </div>

                            <div className="border border-white/5 rounded-2xl p-6 bg-[#0a0a0a]">
                                <h3 className="text-sm font-bold text-white mb-4">Attempt History Logs</h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse text-xs">
                                        <thead>
                                            <tr className="border-b border-white/5 text-zinc-500 font-bold">
                                                <th className="pb-3">Candidate</th>
                                                <th className="pb-3">Mock Test</th>
                                                <th className="pb-3 text-center">Score</th>
                                                <th className="pb-3 text-center">Accuracy</th>
                                                <th className="pb-3 text-center">Time Taken</th>
                                                <th className="pb-3 text-right">Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {attempts.map(att => (
                                                <tr key={att._id} className="border-b border-white/5 hover:bg-white/[0.01]">
                                                    <td className="py-3 font-semibold text-white">
                                                        {att.userName || 'Anonymous'}
                                                        <span className="text-[10px] text-zinc-500 block">@{att.userEmail || 'email'}</span>
                                                    </td>
                                                    <td className="py-3 text-zinc-300">{att.testName}</td>
                                                    <td className="py-3 text-center font-bold text-purple-400">{att.score}%</td>
                                                    <td className="py-3 text-center font-bold text-emerald-400">{att.accuracy}%</td>
                                                    <td className="py-3 text-center text-zinc-400">{Math.round(att.timeTaken / 60)} min</td>
                                                    <td className="py-3 text-right text-zinc-500">
                                                        {att.completedAt ? new Date(att.completedAt).toLocaleDateString() : 'Active'}
                                                    </td>
                                                </tr>
                                            ))}
                                            {attempts.length === 0 && (
                                                <tr>
                                                    <td colSpan="6" className="py-8 text-center text-zinc-500">No mock test attempts recorded yet.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* MODALS */}
            {/* Modal 1: Create / Edit Mock Test */}
            <AnimatePresence>
                {isTestModalOpen && (
                    <div className="fixed inset-0 flex items-center justify-center z-[100] p-4 bg-black/70 backdrop-blur-sm">
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="w-full max-w-xl bg-zinc-900 border border-white/10 rounded-2xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]"
                        >
                            <div className="flex items-center justify-between mb-6 pb-2 border-b border-white/5">
                                <h3 className="text-lg font-bold text-white">{editingTest ? 'Modify Mock Test' : 'New Mock Test'}</h3>
                                <button onClick={() => setIsTestModalOpen(false)} className="p-1 hover:bg-white/5 rounded-lg text-zinc-400 hover:text-white cursor-pointer"><X className="w-5 h-5" /></button>
                            </div>
                            <form onSubmit={handleSaveTest} className="space-y-4 text-xs text-zinc-300">
                                <div className="space-y-1">
                                    <label className="text-zinc-400 font-medium">Mock Test Name</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={testForm.name} 
                                        onChange={(e) => setTestForm({...testForm, name: e.target.value})}
                                        className="w-full bg-zinc-950 border border-white/15 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500" 
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-zinc-400 font-medium">Description</label>
                                    <textarea 
                                        value={testForm.description} 
                                        onChange={(e) => setTestForm({...testForm, description: e.target.value})}
                                        className="w-full h-20 bg-zinc-950 border border-white/15 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500" 
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-zinc-400 font-medium">Difficulty</label>
                                        <select 
                                            value={testForm.difficulty} 
                                            onChange={(e) => setTestForm({...testForm, difficulty: e.target.value})}
                                            className="w-full bg-zinc-950 border border-white/15 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                                        >
                                            <option value="Easy">Easy</option>
                                            <option value="Medium">Medium</option>
                                            <option value="Hard">Hard</option>
                                            <option value="Mixed">Mixed</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-zinc-400 font-medium">Duration (minutes)</label>
                                        <input 
                                            type="number" 
                                            required
                                            value={testForm.timeLimit} 
                                            onChange={(e) => setTestForm({...testForm, timeLimit: parseInt(e.target.value) || 60})}
                                            className="w-full bg-zinc-950 border border-white/15 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500" 
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-zinc-400 font-medium">DSA Questions Count</label>
                                        <input 
                                            type="number" 
                                            required
                                            value={testForm.dsaCount} 
                                            onChange={(e) => setTestForm({...testForm, dsaCount: parseInt(e.target.value) || 3})}
                                            className="w-full bg-zinc-950 border border-white/15 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500" 
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-zinc-400 font-medium">Aptitude Questions Count</label>
                                        <input 
                                            type="number" 
                                            required
                                            value={testForm.aptitudeCount} 
                                            onChange={(e) => setTestForm({...testForm, aptitudeCount: parseInt(e.target.value) || 50})}
                                            className="w-full bg-zinc-950 border border-white/15 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500" 
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-6 py-2">
                                    <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
                                        <input 
                                            type="checkbox" 
                                            checked={testForm.isActive} 
                                            onChange={(e) => setTestForm({...testForm, isActive: e.target.checked})} 
                                        /> Active test (Visible to users)
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
                                        <input 
                                            type="checkbox" 
                                            checked={testForm.isCustom} 
                                            onChange={(e) => setTestForm({...testForm, isCustom: e.target.checked})} 
                                        /> Custom selection (curated ID mapping)
                                    </label>
                                </div>

                                {testForm.isCustom && (
                                    <div className="p-3 border border-purple-500/20 bg-purple-500/5 rounded-lg text-[10px] text-purple-300 flex items-start gap-2">
                                        <Sparkles className="w-4 h-4 flex-shrink-0" />
                                        <span>Custom curation allows linking specific Mongoose problem IDs. When left blank, it dynamically pulls random questions during test initialization.</span>
                                    </div>
                                )}

                                <div className="flex items-center justify-end gap-2 pt-4 border-t border-white/5">
                                    <button 
                                        type="button" 
                                        onClick={() => setIsTestModalOpen(false)}
                                        className="px-4 py-2 border border-white/10 rounded-lg hover:bg-white/5 text-zinc-300 cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg cursor-pointer"
                                    >
                                        Save Test
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modal 2: Create / Edit Question (DSA / Aptitude) */}
            <AnimatePresence>
                {isQuestionModalOpen && (
                    <div className="fixed inset-0 flex items-center justify-center z-[100] p-4 bg-black/70 backdrop-blur-sm">
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="w-full max-w-2xl bg-zinc-900 border border-white/10 rounded-2xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]"
                        >
                            <div className="flex items-center justify-between mb-6 pb-2 border-b border-white/5">
                                <h3 className="text-lg font-bold text-white">
                                    {editingQuestion ? 'Edit' : 'Create'} {questionType === 'dsa' ? 'DSA Question' : 'Aptitude MCQ'}
                                </h3>
                                <button onClick={() => setIsQuestionModalOpen(false)} className="p-1 hover:bg-white/5 rounded-lg text-zinc-400 hover:text-white cursor-pointer"><X className="w-5 h-5" /></button>
                            </div>
                            <form onSubmit={handleSaveQuestion} className="space-y-4 text-xs text-zinc-300">
                                {questionType === 'dsa' ? (
                                    <div className="space-y-3">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-zinc-400 font-medium">Question Title</label>
                                                <input 
                                                    type="text" 
                                                    required 
                                                    value={dsaForm.title}
                                                    onChange={(e) => setDsaForm({ ...dsaForm, title: e.target.value })}
                                                    className="w-full bg-zinc-950 border border-white/15 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500" 
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-zinc-400 font-medium">Slug (URL string)</label>
                                                <input 
                                                    type="text" 
                                                    value={dsaForm.slug}
                                                    placeholder="auto-generated-from-title"
                                                    onChange={(e) => setDsaForm({ ...dsaForm, slug: e.target.value })}
                                                    className="w-full bg-zinc-950 border border-white/15 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500" 
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-zinc-400 font-medium">Difficulty</label>
                                                <select 
                                                    value={dsaForm.difficulty}
                                                    onChange={(e) => setDsaForm({ ...dsaForm, difficulty: e.target.value })}
                                                    className="w-full bg-zinc-950 border border-white/15 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                                                >
                                                    <option value="Easy">Easy</option>
                                                    <option value="Medium">Medium</option>
                                                    <option value="Hard">Hard</option>
                                                </select>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-zinc-400 font-medium">Topic Category</label>
                                                <select 
                                                    value={dsaForm.topic}
                                                    onChange={(e) => setDsaForm({ ...dsaForm, topic: e.target.value })}
                                                    className="w-full bg-zinc-950 border border-white/15 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                                                >
                                                    {['Arrays', 'Strings', 'Linked List', 'Stack', 'Queue', 'Trees', 'Graphs', 'DP', 'Greedy', 'Bit Manipulation'].map(t => (
                                                        <option key={t} value={t.toLowerCase()}>{t}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-zinc-400 font-medium">Tags (comma separated)</label>
                                                <input 
                                                    type="text" 
                                                    value={dsaForm.tags}
                                                    onChange={(e) => setDsaForm({ ...dsaForm, tags: e.target.value })}
                                                    placeholder="Arrays, Sorting, Two Pointers"
                                                    className="w-full bg-zinc-950 border border-white/15 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500" 
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-zinc-400 font-medium">Problem Description (HTML/Text)</label>
                                            <textarea 
                                                required 
                                                value={dsaForm.description}
                                                onChange={(e) => setDsaForm({ ...dsaForm, description: e.target.value })}
                                                className="w-full h-32 bg-zinc-950 border border-white/15 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500" 
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-zinc-400 font-medium">Constraints (One per line)</label>
                                            <textarea 
                                                value={dsaForm.constraints}
                                                onChange={(e) => setDsaForm({ ...dsaForm, constraints: e.target.value })}
                                                placeholder={`1 <= nums.length <= 10^5`}
                                                className="w-full h-16 bg-zinc-950 border border-white/15 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500" 
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <div className="space-y-1">
                                            <label className="text-zinc-400 font-medium">MCQ Question Text</label>
                                            <textarea 
                                                required 
                                                value={aptForm.questionText}
                                                onChange={(e) => setAptForm({ ...aptForm, questionText: e.target.value })}
                                                className="w-full h-24 bg-zinc-950 border border-white/15 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500" 
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-zinc-400 font-medium">Option A</label>
                                                <input 
                                                    type="text" 
                                                    required 
                                                    value={aptForm.options[0].text}
                                                    onChange={(e) => {
                                                        const opts = [...aptForm.options];
                                                        opts[0].text = e.target.value;
                                                        setAptForm({ ...aptForm, options: opts });
                                                    }}
                                                    className="w-full bg-zinc-950 border border-white/15 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500" 
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-zinc-400 font-medium">Option B</label>
                                                <input 
                                                    type="text" 
                                                    required 
                                                    value={aptForm.options[1].text}
                                                    onChange={(e) => {
                                                        const opts = [...aptForm.options];
                                                        opts[1].text = e.target.value;
                                                        setAptForm({ ...aptForm, options: opts });
                                                    }}
                                                    className="w-full bg-zinc-950 border border-white/15 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500" 
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-zinc-400 font-medium">Option C</label>
                                                <input 
                                                    type="text" 
                                                    required 
                                                    value={aptForm.options[2].text}
                                                    onChange={(e) => {
                                                        const opts = [...aptForm.options];
                                                        opts[2].text = e.target.value;
                                                        setAptForm({ ...aptForm, options: opts });
                                                    }}
                                                    className="w-full bg-zinc-950 border border-white/15 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500" 
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-zinc-400 font-medium">Option D</label>
                                                <input 
                                                    type="text" 
                                                    required 
                                                    value={aptForm.options[3].text}
                                                    onChange={(e) => {
                                                        const opts = [...aptForm.options];
                                                        opts[3].text = e.target.value;
                                                        setAptForm({ ...aptForm, options: opts });
                                                    }}
                                                    className="w-full bg-zinc-950 border border-white/15 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500" 
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-4 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-zinc-400 font-medium">Correct Answer</label>
                                                <select 
                                                    value={aptForm.correctAnswer}
                                                    onChange={(e) => setAptForm({ ...aptForm, correctAnswer: e.target.value })}
                                                    className="w-full bg-zinc-950 border border-white/15 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                                                >
                                                    <option value="A">A</option>
                                                    <option value="B">B</option>
                                                    <option value="C">C</option>
                                                    <option value="D">D</option>
                                                </select>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-zinc-400 font-medium">Section</label>
                                                <select 
                                                    value={aptForm.section}
                                                    onChange={(e) => setAptForm({ ...aptForm, section: e.target.value })}
                                                    className="w-full bg-zinc-950 border border-white/15 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                                                >
                                                    <option value="aptitude">Quantitative Aptitude</option>
                                                    <option value="reasoning">Logical Reasoning</option>
                                                    <option value="verbal">Verbal Ability</option>
                                                </select>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-zinc-400 font-medium">Topic Slug</label>
                                                <input 
                                                    type="text" 
                                                    required 
                                                    value={aptForm.topic}
                                                    onChange={(e) => setAptForm({ ...aptForm, topic: e.target.value })}
                                                    placeholder="percentages, puzzles"
                                                    className="w-full bg-zinc-950 border border-white/15 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500" 
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-zinc-400 font-medium">Difficulty</label>
                                                <select 
                                                    value={aptForm.difficulty}
                                                    onChange={(e) => setAptForm({ ...aptForm, difficulty: e.target.value })}
                                                    className="w-full bg-zinc-950 border border-white/15 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                                                >
                                                    <option value="Easy">Easy</option>
                                                    <option value="Medium">Medium</option>
                                                    <option value="Hard">Hard</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-zinc-400 font-medium">Formula Hint</label>
                                            <input 
                                                type="text" 
                                                value={aptForm.formulaHint}
                                                onChange={(e) => setAptForm({ ...aptForm, formulaHint: e.target.value })}
                                                className="w-full bg-zinc-950 border border-white/15 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500" 
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-zinc-400 font-medium">Explanation</label>
                                            <textarea 
                                                value={aptForm.explanation}
                                                onChange={(e) => setAptForm({ ...aptForm, explanation: e.target.value })}
                                                className="w-full h-24 bg-zinc-950 border border-white/15 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500" 
                                            />
                                        </div>
                                    </div>
                                )}
                                <div className="flex items-center justify-end gap-2 pt-4 border-t border-white/5">
                                    <button 
                                        type="button" 
                                        onClick={() => setIsQuestionModalOpen(false)}
                                        className="px-4 py-2 border border-white/10 rounded-lg hover:bg-white/5 text-zinc-300 cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg cursor-pointer"
                                    >
                                        Save Question
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MockTestsManagement;
