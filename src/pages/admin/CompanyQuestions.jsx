import React, { useEffect, useState, useCallback } from 'react';
import {
    Plus, Edit2, Trash2, Save, X, Search,
    Building2, BookOpen, AlertCircle, CheckCircle2, FileJson,
    UploadCloud, FileUp, AlertTriangle, ChevronRight
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../config';

// ─── Topic catalog (mirrors COMPANY_PREP_ARCHITECTURE.md) ─────────────────────
const COMPANY_TAXONOMY = {
    tcs: { label: 'TCS', color: 'text-blue-400' },
    infosys: { label: 'Infosys', color: 'text-emerald-400' },
    wipro: { label: 'Wipro', color: 'text-purple-400' },
    cognizant: { label: 'Cognizant', color: 'text-sky-400' },
    accenture: { label: 'Accenture', color: 'text-pink-400' },
};

const SECTIONS_MAP = {
    aptitude: { label: 'Numerical Ability', icon: '🔢' },
    reasoning: { label: 'Reasoning Ability', icon: '🧩' },
    verbal: { label: 'Verbal Ability', icon: '📖' },
    coding: { label: 'Coding', icon: '💻' },
    cognizantCommunication: { label: 'Communication Assessment', icon: '🗣️' },
    cognizantGames: { label: 'Game-Based Aptitude', icon: '🎮' },
    cognizantTechnical: { label: 'Technical Assessment', icon: '⚙️' },
    accentureCognitive: { label: 'Cognitive Assessment', icon: '🧠' },
    accentureTechnical: { label: 'Technical Assessment', icon: '⚙️' },
    accentureCommunication: { label: 'Communication Assessment', icon: '🗣️' },
};

const TOPICS_BY_SECTION = {
    aptitude: [
        { id: 'percentages', label: 'Percentages' },
        { id: 'profit-loss', label: 'Profit & Loss' },
        { id: 'time-work', label: 'Time & Work' },
        { id: 'time-speed-distance', label: 'Time, Speed & Distance' },
        { id: 'interest', label: 'Simple & Compound Interest' },
        { id: 'averages', label: 'Averages' },
        { id: 'ratio-proportion', label: 'Ratio & Proportion' },
        { id: 'mixtures', label: 'Mixtures & Alligations' },
        { id: 'data-interpretation', label: 'Data Interpretation' },
        { id: 'lcm-hcf', label: 'LCM & HCF' },
        { id: 'number-series', label: 'Number Series' },
        { id: 'permutations-combinations', label: 'Permutations & Combinations' },
        { id: 'probability', label: 'Probability' },
        { id: 'number-systems', label: 'Number Systems' },
    ],
    reasoning: [
        { id: 'seating-arrangements', label: 'Seating Arrangements' },
        { id: 'blood-relations', label: 'Blood Relations' },
        { id: 'coding-decoding', label: 'Coding-Decoding' },
        { id: 'syllogisms', label: 'Syllogisms' },
        { id: 'data-sufficiency', label: 'Data Sufficiency' },
        { id: 'letter-number-series', label: 'Number/Letter Series' },
        { id: 'logical-reasoning', label: 'Logical Reasoning' },
        { id: 'analogies', label: 'Analogies' },
        { id: 'puzzles', label: 'Puzzles' },
        { id: 'direction-sense', label: 'Direction Sense' },
    ],
    verbal: [
        { id: 'sentence-completion', label: 'Sentence Completion' },
        { id: 'error-identification', label: 'Error Identification' },
        { id: 'reading-comprehension', label: 'Reading Comprehension' },
        { id: 'synonyms-antonyms', label: 'Synonyms & Antonyms' },
        { id: 'sentence-rearrangement', label: 'Sentence Rearrangement' },
        { id: 'para-jumbles', label: 'Para Jumbles' },
        { id: 'active-passive', label: 'Active & Passive Voice' },
        { id: 'prepositions', label: 'Prepositions & Conjunctions' },
    ],
    coding: [
        { id: 'arrays', label: 'Arrays' },
        { id: 'strings', label: 'Strings' },
        { id: 'patterns', label: 'Pattern Problems' },
        { id: 'basic-algorithms', label: 'Basic Algorithms' },
    ],
    cognizantCommunication: [
        { id: 'reading', label: 'Reading Comprehension' },
        { id: 'listening', label: 'Listening Comprehension' },
        { id: 'speaking', label: 'Speaking Assessment' },
        { id: 'writing', label: 'Writing Assessment' },
        { id: 'typing', label: 'Typing Speed Test' },
    ],
    cognizantGames: [
        { id: 'numerical-games', label: 'Numerical Games' },
        { id: 'logical-games', label: 'Logical Games' },
        { id: 'verbal-games', label: 'Verbal Games' },
        { id: 'spatial-games', label: 'Spatial Games' },
    ],
    cognizantTechnical: [
        { id: 'java', label: 'Java Programming' },
        { id: 'sql', label: 'ANSI SQL' },
        { id: 'web', label: 'HTML, CSS, JavaScript' },
        { id: 'python', label: 'Python Programming' },
        { id: 'cloud', label: 'Cloud Fundamentals' },
        { id: 'csharp', label: 'C# Programming' },
    ],
    accentureCognitive: [
        { id: 'english', label: 'English Ability' },
        { id: 'critical-reasoning', label: 'Critical Reasoning & Problem Solving' },
        { id: 'abstract-reasoning', label: 'Abstract Reasoning' },
    ],
    accentureTechnical: [
        { id: 'ms-office', label: 'Common Applications & MS Office' },
        { id: 'pseudocode', label: 'Pseudocode' },
        { id: 'networking-cloud', label: 'Networking, Security & Cloud' },
    ],
    accentureCommunication: [
        { id: 'reading', label: 'Reading Comprehension' },
        { id: 'listening', label: 'Listening Comprehension' },
        { id: 'speaking', label: 'Speaking Assessment' },
        { id: 'writing', label: 'Writing Assessment' },
    ],
};

const DIFF_COLORS = {
    Easy: 'bg-green-500/10 text-green-400 border-green-500/30',
    Medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
    Hard: 'bg-red-500/10 text-red-400 border-red-500/30',
};
const PRIORITY_COLORS = {
    'Very High': 'bg-red-500/10 text-red-400',
    High: 'bg-orange-500/10 text-orange-400',
    Medium: 'bg-blue-500/10 text-blue-400',
    Low: 'bg-gray-500/10 text-gray-400',
};

// ─── Empty form state ──────────────────────────────────────────────────────────
const emptyForm = () => ({
    company: 'tcs',
    section: 'aptitude',
    topic: '',
    subtopic: '',
    type: 'mcq',
    questionText: '',
    options: [
        { key: 'A', text: '' },
        { key: 'B', text: '' },
        { key: 'C', text: '' },
        { key: 'D', text: '' },
    ],
    correctAnswer: 'A',
    explanation: '',
    formulaHint: '',
    // passage-group fields
    passage: '',
    questions: [],
    // meta
    difficulty: 'Medium',
    priority: 'High',
    tags: '',
    timeLimit: 90,
    isActive: true,
    order: 0,
});

// ─── Passage sub-question manager (for RC type) ────────────────────────────────
const SubQuestionManager = ({ subQs, onChange }) => {
    const add = () => onChange([
        ...subQs,
        {
            subId: `sq-${Date.now()}`,
            questionText: '',
            options: [{ key: 'A', text: '' }, { key: 'B', text: '' }, { key: 'C', text: '' }, { key: 'D', text: '' }],
            correctAnswer: 'A',
            explanation: ''
        }
    ]);
    const remove = (i) => onChange(subQs.filter((_, idx) => idx !== i));
    const update = (i, patch) => {
        const next = [...subQs];
        next[i] = { ...next[i], ...patch };
        onChange(next);
    };
    const updateOption = (qi, oi, text) => {
        const next = [...subQs];
        next[qi].options[oi] = { ...next[qi].options[oi], text };
        onChange(next);
    };

    return (
        <div className="space-y-4">
            {subQs.map((sq, qi) => (
                <div key={qi} className="bg-[#0a0a0a] border border-gray-800 rounded-lg p-4 relative">
                    <button
                        onClick={() => remove(qi)}
                        className="absolute top-3 right-3 p-1 text-gray-600 hover:text-red-400 transition"
                    >
                        <X size={14} />
                    </button>
                    <p className="text-xs font-bold text-gray-500 uppercase mb-3">Sub-Question {qi + 1}</p>
                    <textarea
                        value={sq.questionText}
                        onChange={e => update(qi, { questionText: e.target.value })}
                        className="w-full bg-[#161616] border border-gray-800 rounded p-2 text-sm text-white mb-3 h-20 resize-none"
                        placeholder="Sub-question text..."
                    />
                    <div className="grid grid-cols-2 gap-2 mb-3">
                        {sq.options.map((opt, oi) => (
                            <div key={opt.key} className="flex items-center gap-2">
                                <span className="text-xs font-bold text-gray-500 w-4">{opt.key}</span>
                                <input
                                    type="text"
                                    value={opt.text}
                                    onChange={e => updateOption(qi, oi, e.target.value)}
                                    className="flex-1 bg-[#161616] border border-gray-800 rounded px-2 py-1 text-sm text-white"
                                    placeholder={`Option ${opt.key}`}
                                />
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center gap-3">
                        <label className="text-xs text-gray-500">Correct:</label>
                        {['A', 'B', 'C', 'D'].map(k => (
                            <label key={k} className="flex items-center gap-1 cursor-pointer">
                                <input
                                    type="radio"
                                    name={`sq-${qi}-ans`}
                                    value={k}
                                    checked={sq.correctAnswer === k}
                                    onChange={() => update(qi, { correctAnswer: k })}
                                    className="accent-blue-500"
                                />
                                <span className="text-xs text-gray-300">{k}</span>
                            </label>
                        ))}
                    </div>
                    <textarea
                        value={sq.explanation}
                        onChange={e => update(qi, { explanation: e.target.value })}
                        className="w-full mt-3 bg-[#161616] border border-gray-800 rounded p-2 text-sm text-white h-16 resize-none"
                        placeholder="Explanation for this sub-question..."
                    />
                </div>
            ))}
            <button
                onClick={add}
                className="w-full py-2 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-600/20 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2"
            >
                <Plus size={14} /> Add Sub-Question
            </button>
        </div>
    );
};

// ─── Main Component ────────────────────────────────────────────────────────────
const CompanyQuestions = () => {
    const { currentUser } = useAuth();
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('list'); // 'list' | 'edit' | 'bulk'
    const [editingId, setEditingId] = useState(null);

    // Bulk upload state
    const [bulkText, setBulkText] = useState('');
    const [bulkParsed, setBulkParsed] = useState(null); // parsed array before upload
    const [bulkParseError, setBulkParseError] = useState('');
    const [bulkResult, setBulkResult] = useState(null); // { insertedCount, skippedCount, errors }
    const [bulkUploading, setBulkUploading] = useState(false);
    const [bulkDragOver, setBulkDragOver] = useState(false);

    // Filters
    const [filterCompany, setFilterCompany] = useState('');
    const [filterSection, setFilterSection] = useState('');
    const [filterTopic, setFilterTopic] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    // Form
    const [formData, setFormData] = useState(emptyForm());

    // JSON import modal
    const [showJsonImport, setShowJsonImport] = useState(false);
    const [jsonImportText, setJsonImportText] = useState('');
    const [jsonImportError, setJsonImportError] = useState('');

    const headers = { 'Content-Type': 'application/json', 'x-user-uid': currentUser?.uid };

    // ── Fetch ──────────────────────────────────────────────────────────────────
    const fetchQuestions = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filterCompany) params.set('company', filterCompany);
            if (filterSection) params.set('section', filterSection);
            if (filterTopic) params.set('topic', filterTopic);
            if (searchQuery) params.set('search', searchQuery);

            const res = await fetch(`${API_URL}/api/company-questions/admin?${params}`, { headers });
            if (!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();
            setQuestions(data);
        } catch (err) {
            toast.error('Failed to load questions');
        } finally {
            setLoading(false);
        }
    }, [filterCompany, filterSection, filterTopic, searchQuery, currentUser?.uid]);

    useEffect(() => {
        if (view === 'list') fetchQuestions();
    }, [view, fetchQuestions]);

    // ── Bulk Parse ─────────────────────────────────────────────────────────────
    const handleBulkParse = (text) => {
        setBulkParseError('');
        setBulkResult(null);
        try {
            const parsed = JSON.parse(text.trim());
            // Accept array directly OR { questions: [...] } wrapper
            const arr = Array.isArray(parsed) ? parsed : parsed?.questions;
            if (!Array.isArray(arr)) throw new Error('Root must be a JSON array [ ] or an object with a "questions" key');
            if (arr.length === 0) throw new Error('Array is empty');
            setBulkParsed(arr);
        } catch (e) {
            setBulkParseError(e.message);
            setBulkParsed(null);
        }
    };

    const handleBulkFileUpload = (file) => {
        if (!file || !file.name.endsWith('.json')) {
            setBulkParseError('Please upload a .json file');
            return;
        }
        const reader = new FileReader();
        reader.onload = (ev) => {
            const text = ev.target.result;
            setBulkText(text);
            handleBulkParse(text);
        };
        reader.readAsText(file);
    };

    const handleBulkUpload = async () => {
        if (!bulkParsed || bulkParsed.length === 0) return;
        setBulkUploading(true);
        setBulkResult(null);
        try {
            const res = await fetch(`${API_URL}/api/company-questions/admin/bulk`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ questions: bulkParsed }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Upload failed');
            setBulkResult(data);
            setBulkParsed(null);
            setBulkText('');
            toast.success(`✅ Inserted ${data.insertedCount} questions!`);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setBulkUploading(false);
        }
    };

    // ── Save ───────────────────────────────────────────────────────────────────
    const handleSave = async () => {
        // Validate required fields
        if (!formData.questionText && formData.type === 'mcq') {
            toast.error('Question text is required');
            return;
        }
        if (!formData.topic) {
            toast.error('Topic is required');
            return;
        }
        if (formData.type === 'mcq' && formData.options.some(o => !o.text.trim())) {
            toast.error('All four options must have text');
            return;
        }
        if (!formData.explanation.trim()) {
            toast.error('Explanation is required (shown to user after answering)');
            return;
        }

        const payload = {
            ...formData,
            tags: typeof formData.tags === 'string'
                ? formData.tags.split(',').map(t => t.trim()).filter(Boolean)
                : formData.tags,
        };

        try {
            const method = editingId ? 'PUT' : 'POST';
            const url = editingId
                ? `${API_URL}/api/company-questions/admin/${editingId}`
                : `${API_URL}/api/company-questions/admin`;

            const res = await fetch(url, { method, headers, body: JSON.stringify(payload) });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Save failed');
            }
            toast.success(editingId ? 'Question updated' : 'Question created');
            setView('list');
            setEditingId(null);
            setFormData(emptyForm());
        } catch (err) {
            toast.error(err.message);
        }
    };

    // ── Edit ───────────────────────────────────────────────────────────────────
    const handleEdit = (q) => {
        setEditingId(q._id);
        setFormData({
            ...q,
            tags: Array.isArray(q.tags) ? q.tags.join(', ') : (q.tags || ''),
            options: q.options?.length === 4 ? q.options : emptyForm().options,
        });
        setView('edit');
    };

    // ── Delete ─────────────────────────────────────────────────────────────────
    const handleDelete = async (id) => {
        if (!window.confirm('Delete this question permanently?')) return;
        try {
            const res = await fetch(`${API_URL}/api/company-questions/admin/${id}`, {
                method: 'DELETE', headers
            });
            if (!res.ok) throw new Error();
            toast.success('Deleted');
            fetchQuestions();
        } catch {
            toast.error('Failed to delete');
        }
    };

    // ── JSON Import Modal ──────────────────────────────────────────────────────
    const handleJsonImport = () => {
        setJsonImportError('');
        try {
            const parsed = JSON.parse(jsonImportText.trim());
            if (typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('Must be a single question JSON object');
            setFormData(prev => ({
                ...prev,
                ...parsed,
                tags: Array.isArray(parsed.tags) ? parsed.tags.join(', ') : (parsed.tags || prev.tags || ''),
                options: parsed.options?.length === 4 ? parsed.options : prev.options,
            }));
            setShowJsonImport(false);
            setJsonImportText('');
            toast.success('JSON imported — review and save');
        } catch (e) {
            setJsonImportError(e.message);
        }
    };

    // ── Update helper ──────────────────────────────────────────────────────────
    const set = (patch) => setFormData(prev => ({ ...prev, ...patch }));
    const setOption = (idx, text) => setFormData(prev => {
        const opts = [...prev.options];
        opts[idx] = { ...opts[idx], text };
        return { ...prev, options: opts };
    });

    const availableTopics = TOPICS_BY_SECTION[formData.section] || [];
    const filterTopics = TOPICS_BY_SECTION[filterSection] || [];

    // ══ EDIT VIEW ═══════════════════════════════════════════════════════════════
    if (view === 'edit') {
        return (
            <div className="space-y-6">
                {/* JSON Import Modal */}
                {showJsonImport && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                        <div className="bg-[#111] border border-gray-700 rounded-2xl p-6 w-full max-w-2xl space-y-4 shadow-2xl">
                            <h2 className="text-lg font-bold text-white">Import Question JSON</h2>
                            <p className="text-xs text-gray-400">Paste a full question JSON object to populate all fields automatically.</p>
                            <textarea
                                className="w-full h-64 bg-[#0a0a0a] border border-gray-700 rounded-lg p-3 text-xs font-mono text-zinc-300 outline-none focus:border-blue-500/50"
                                placeholder='{"company":"tcs","section":"aptitude","topic":"percentages","questionText":"...","options":[...],"correctAnswer":"B","explanation":"..."}'
                                value={jsonImportText}
                                onChange={e => { setJsonImportText(e.target.value); setJsonImportError(''); }}
                                autoFocus
                            />
                            {jsonImportError && <p className="text-xs text-red-400">{jsonImportError}</p>}
                            <div className="flex gap-3">
                                <button onClick={handleJsonImport} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg font-medium">Import & Populate</button>
                                <button onClick={() => { setShowJsonImport(false); setJsonImportText(''); setJsonImportError(''); }} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg font-medium">Cancel</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-white">{editingId ? 'Edit Question' : 'New Question'}</h1>
                        <p className="text-sm text-gray-500 mt-0.5">Company → Section → Topic → Question + Options + Answer</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setShowJsonImport(true)} className="px-4 py-2 bg-purple-600/20 text-purple-400 border border-purple-600/30 rounded-lg hover:bg-purple-600/30 transition text-sm font-medium flex items-center gap-2">
                            <FileJson size={14} /> Import JSON
                        </button>
                        <button onClick={() => { setView('list'); setEditingId(null); setFormData(emptyForm()); }} className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition text-sm">
                            Cancel
                        </button>
                        <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 text-sm font-medium">
                            <Save size={14} /> {editingId ? 'Update' : 'Create'} Question
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-12">

                    {/* ── LEFT COLUMN: Classification + Question text ── */}
                    <div className="space-y-4">

                        {/* Classification */}
                        <div className="bg-[#111] p-6 rounded-xl border border-gray-800 space-y-4">
                            <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider border-b border-gray-800 pb-2">
                                Classification
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                {/* Company */}
                                <div>
                                    <label className="text-xs text-gray-500 font-medium block mb-1.5 uppercase tracking-wide">Company</label>
                                    <select
                                        value={formData.company}
                                        onChange={e => set({ company: e.target.value })}
                                        className="w-full bg-[#1a1a1a] border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                                    >
                                        {Object.entries(COMPANY_TAXONOMY).map(([slug, { label }]) => (
                                            <option key={slug} value={slug}>{label}</option>
                                        ))}
                                    </select>
                                </div>
                                {/* Section */}
                                <div>
                                    <label className="text-xs text-gray-500 font-medium block mb-1.5 uppercase tracking-wide">Section</label>
                                    <select
                                        value={formData.section}
                                        onChange={e => set({ section: e.target.value, topic: '' })}
                                        className="w-full bg-[#1a1a1a] border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                                    >
                                        {Object.entries(SECTIONS_MAP).map(([slug, { label }]) => (
                                            <option key={slug} value={slug}>{label}</option>
                                        ))}
                                    </select>
                                </div>
                                {/* Topic */}
                                <div>
                                    <label className="text-xs text-gray-500 font-medium block mb-1.5 uppercase tracking-wide">Topic</label>
                                    <select
                                        value={formData.topic}
                                        onChange={e => set({ topic: e.target.value })}
                                        className="w-full bg-[#1a1a1a] border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                                    >
                                        <option value="">— Select Topic —</option>
                                        {availableTopics.map(t => (
                                            <option key={t.id} value={t.id}>{t.label}</option>
                                        ))}
                                    </select>
                                </div>
                                {/* Subtopic */}
                                <div>
                                    <label className="text-xs text-gray-500 font-medium block mb-1.5 uppercase tracking-wide">Subtopic (optional)</label>
                                    <input
                                        type="text"
                                        value={formData.subtopic}
                                        onChange={e => set({ subtopic: e.target.value })}
                                        className="w-full bg-[#1a1a1a] border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                                        placeholder="e.g. successive-change"
                                    />
                                </div>
                                {/* Type */}
                                <div>
                                    <label className="text-xs text-gray-500 font-medium block mb-1.5 uppercase tracking-wide">Question Type</label>
                                    <select
                                        value={formData.type}
                                        onChange={e => set({ type: e.target.value })}
                                        className="w-full bg-[#1a1a1a] border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                                    >
                                        <option value="mcq">MCQ (Single Question)</option>
                                        <option value="passage-group">Passage Group (RC)</option>
                                    </select>
                                </div>
                                {/* Active */}
                                <div className="flex items-end">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <div
                                            onClick={() => set({ isActive: !formData.isActive })}
                                            className={`w-10 h-5 rounded-full transition-colors relative ${formData.isActive ? 'bg-blue-600' : 'bg-gray-700'}`}
                                        >
                                            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${formData.isActive ? 'translate-x-5' : 'translate-x-0.5'}`} />
                                        </div>
                                        <span className="text-sm text-gray-300">Active (visible to users)</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Metadata */}
                        <div className="bg-[#111] p-6 rounded-xl border border-gray-800 space-y-4">
                            <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider border-b border-gray-800 pb-2">
                                Metadata
                            </h3>
                            <div className="grid grid-cols-3 gap-4">
                                {/* Difficulty */}
                                <div>
                                    <label className="text-xs text-gray-500 font-medium block mb-1.5 uppercase tracking-wide">Difficulty</label>
                                    <select
                                        value={formData.difficulty}
                                        onChange={e => set({ difficulty: e.target.value })}
                                        className="w-full bg-[#1a1a1a] border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                                    >
                                        <option>Easy</option><option>Medium</option><option>Hard</option>
                                    </select>
                                </div>
                                {/* Priority */}
                                <div>
                                    <label className="text-xs text-gray-500 font-medium block mb-1.5 uppercase tracking-wide">Priority</label>
                                    <select
                                        value={formData.priority}
                                        onChange={e => set({ priority: e.target.value })}
                                        className="w-full bg-[#1a1a1a] border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                                    >
                                        <option>Very High</option><option>High</option><option>Medium</option><option>Low</option>
                                    </select>
                                </div>
                                {/* Time Limit */}
                                <div>
                                    <label className="text-xs text-gray-500 font-medium block mb-1.5 uppercase tracking-wide">Time Limit (sec)</label>
                                    <input
                                        type="number"
                                        value={formData.timeLimit}
                                        min={30} max={300}
                                        onChange={e => set({ timeLimit: parseInt(e.target.value) || 90 })}
                                        className="w-full bg-[#1a1a1a] border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                            </div>
                            {/* Tags */}
                            <div>
                                <label className="text-xs text-gray-500 font-medium block mb-1.5 uppercase tracking-wide">Tags (comma separated)</label>
                                <input
                                    type="text"
                                    value={formData.tags}
                                    onChange={e => set({ tags: e.target.value })}
                                    className="w-full bg-[#1a1a1a] border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                                    placeholder="e.g. successive-percentage, net-change"
                                />
                            </div>
                            {/* Order */}
                            <div>
                                <label className="text-xs text-gray-500 font-medium block mb-1.5 uppercase tracking-wide">Display Order</label>
                                <input
                                    type="number"
                                    value={formData.order}
                                    onChange={e => set({ order: parseInt(e.target.value) || 0 })}
                                    className="w-full bg-[#1a1a1a] border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                                    placeholder="0 = default order"
                                />
                            </div>
                        </div>

                        {/* Question Text (MCQ) or Passage (RC) */}
                        {formData.type === 'mcq' ? (
                            <div className="bg-[#111] p-6 rounded-xl border border-gray-800 space-y-3">
                                <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider border-b border-gray-800 pb-2">
                                    Question Text
                                </h3>
                                <textarea
                                    value={formData.questionText}
                                    onChange={e => set({ questionText: e.target.value })}
                                    className="w-full h-36 bg-[#1a1a1a] border border-gray-800 rounded-lg p-3 text-sm text-white font-mono focus:outline-none focus:border-blue-500 resize-none"
                                    placeholder="Type the full question here. Markdown is supported — use **bold** for emphasis, etc."
                                />
                                <p className="text-xs text-gray-600">Supports markdown. Mathematical expressions: use plain text like (35/100) × 480 = 168.</p>
                            </div>
                        ) : (
                            <div className="bg-[#111] p-6 rounded-xl border border-gray-800 space-y-3">
                                <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider border-b border-gray-800 pb-2">
                                    Reading Comprehension Passage
                                </h3>
                                <textarea
                                    value={formData.passage}
                                    onChange={e => set({ passage: e.target.value })}
                                    className="w-full h-48 bg-[#1a1a1a] border border-gray-800 rounded-lg p-3 text-sm text-white font-mono focus:outline-none focus:border-blue-500 resize-none"
                                    placeholder="Paste the RC passage here..."
                                />
                            </div>
                        )}
                    </div>

                    {/* ── RIGHT COLUMN: Options + Answer + Explanation ── */}
                    <div className="space-y-4">

                        {formData.type === 'mcq' ? (
                            <>
                                {/* Options A–D */}
                                <div className="bg-[#111] p-6 rounded-xl border border-gray-800 space-y-4">
                                    <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider border-b border-gray-800 pb-2">
                                        Answer Options
                                    </h3>
                                    <div className="space-y-3">
                                        {formData.options.map((opt, idx) => (
                                            <div key={opt.key} className={`flex items-start gap-3 p-3 rounded-lg border transition ${formData.correctAnswer === opt.key ? 'border-green-500/40 bg-green-500/5' : 'border-gray-800 bg-[#0a0a0a]'}`}>
                                                {/* Radio */}
                                                <label className="flex items-center gap-2 cursor-pointer mt-1 shrink-0">
                                                    <input
                                                        type="radio"
                                                        name="correct-answer"
                                                        value={opt.key}
                                                        checked={formData.correctAnswer === opt.key}
                                                        onChange={() => set({ correctAnswer: opt.key })}
                                                        className="accent-green-500 w-4 h-4"
                                                    />
                                                    <span className={`text-sm font-bold ${formData.correctAnswer === opt.key ? 'text-green-400' : 'text-gray-400'}`}>
                                                        {opt.key}
                                                    </span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={opt.text}
                                                    onChange={e => setOption(idx, e.target.value)}
                                                    className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder-gray-700"
                                                    placeholder={`Option ${opt.key} text...`}
                                                />
                                                {formData.correctAnswer === opt.key && (
                                                    <CheckCircle2 size={16} className="text-green-400 shrink-0 mt-0.5" />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-xs text-gray-600 flex items-center gap-1">
                                        <AlertCircle size={11} /> Click the radio button next to the correct option to mark it as the answer.
                                    </p>
                                </div>

                                {/* Explanation + Hint */}
                                <div className="bg-[#111] p-6 rounded-xl border border-gray-800 space-y-4">
                                    <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider border-b border-gray-800 pb-2">
                                        Explanation & Hint
                                    </h3>
                                    <div>
                                        <label className="text-xs text-gray-500 font-medium block mb-1.5 uppercase tracking-wide">
                                            Step-by-step Explanation <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            value={formData.explanation}
                                            onChange={e => set({ explanation: e.target.value })}
                                            className="w-full h-36 bg-[#1a1a1a] border border-gray-800 rounded-lg p-3 text-sm text-white font-mono focus:outline-none focus:border-blue-500 resize-none"
                                            placeholder="Show the full working. E.g.: 35% of 480 = (35/100) × 480 = 168. Quick method: 10% = 48, 30% = 144, 5% = 24. Total = 168."
                                        />
                                        <p className="text-xs text-gray-600 mt-1">Shown to user after they submit their answer. Must include the complete step-by-step derivation.</p>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 font-medium block mb-1.5 uppercase tracking-wide">
                                            Formula Hint (optional)
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.formulaHint}
                                            onChange={e => set({ formulaHint: e.target.value })}
                                            className="w-full bg-[#1a1a1a] border border-gray-800 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-blue-500"
                                            placeholder="e.g. Net successive change = a + b + (ab/100)"
                                        />
                                        <p className="text-xs text-gray-600 mt-1">One-line formula shown as a collapsible hint. Keep it concise.</p>
                                    </div>
                                </div>
                            </>
                        ) : (
                            /* Passage Group: Sub-questions */
                            <div className="bg-[#111] p-6 rounded-xl border border-gray-800 space-y-4">
                                <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider border-b border-gray-800 pb-2">
                                    Sub-Questions (RC)
                                </h3>
                                <SubQuestionManager
                                    subQs={formData.questions}
                                    onChange={qs => set({ questions: qs })}
                                />
                            </div>
                        )}

                        {/* Preview Card */}
                        <div className="bg-[#0a0a0a] border border-gray-800 rounded-xl p-5 space-y-3">
                            <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">Preview</p>
                            <div className="flex flex-wrap gap-2">
                                <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-500/10 text-blue-400">{COMPANY_TAXONOMY[formData.company]?.label}</span>
                                <span className="px-2 py-0.5 rounded text-xs font-medium bg-purple-500/10 text-purple-400">{SECTIONS_MAP[formData.section]?.label}</span>
                                {formData.topic && <span className="px-2 py-0.5 rounded text-xs font-medium bg-[#1a1a1a] text-gray-400">{availableTopics.find(t => t.id === formData.topic)?.label || formData.topic}</span>}
                                <span className={`px-2 py-0.5 rounded text-xs font-medium border ${DIFF_COLORS[formData.difficulty]}`}>{formData.difficulty}</span>
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${PRIORITY_COLORS[formData.priority]}`}>⚡ {formData.priority}</span>
                                <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-800 text-gray-400">⏱ {formData.timeLimit}s</span>
                            </div>
                            {formData.questionText && (
                                <p className="text-sm text-white leading-relaxed">{formData.questionText}</p>
                            )}
                            {formData.type === 'mcq' && formData.options.some(o => o.text) && (
                                <div className="space-y-1.5">
                                    {formData.options.filter(o => o.text).map(o => (
                                        <div key={o.key} className={`flex gap-2 text-xs p-2 rounded ${o.key === formData.correctAnswer ? 'bg-green-500/10 text-green-400' : 'text-gray-400'}`}>
                                            <span className="font-bold">{o.key}.</span> {o.text}
                                            {o.key === formData.correctAnswer && <span className="ml-auto">✓ Correct</span>}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ══ BULK UPLOAD VIEW ═════════════════════════════════════════════════════════
    if (view === 'bulk') {
        const questionCount = bulkParsed?.length ?? null;
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Bulk Upload Questions</h1>
                        <p className="text-sm text-gray-500 mt-0.5">Paste a JSON array or upload a .json file — up to 2,000 questions at once</p>
                    </div>
                    <button onClick={() => { setView('list'); setBulkText(''); setBulkParsed(null); setBulkParseError(''); setBulkResult(null); }} className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition text-sm">
                        ← Back to List
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

                    {/* ── Left: Input ── */}
                    <div className="lg:col-span-3 space-y-4">

                        {/* File drop zone */}
                        <div
                            onDragOver={e => { e.preventDefault(); setBulkDragOver(true); }}
                            onDragLeave={() => setBulkDragOver(false)}
                            onDrop={e => { e.preventDefault(); setBulkDragOver(false); handleBulkFileUpload(e.dataTransfer.files[0]); }}
                            className={`border-2 border-dashed rounded-xl p-6 text-center transition cursor-pointer ${bulkDragOver ? 'border-blue-500 bg-blue-500/5' : 'border-gray-700 hover:border-gray-600'}`}
                            onClick={() => document.getElementById('bulk-file-input').click()}
                        >
                            <FileUp size={28} className="mx-auto text-gray-600 mb-2" />
                            <p className="text-sm text-gray-400">Drag & drop a <span className="text-blue-400 font-mono">.json</span> file here, or click to browse</p>
                            <p className="text-xs text-gray-600 mt-1">Max 2,000 questions per upload</p>
                            <input id="bulk-file-input" type="file" accept=".json" className="hidden" onChange={e => handleBulkFileUpload(e.target.files[0])} />
                        </div>

                        {/* Or paste JSON */}
                        <div className="relative">
                            <div className="absolute top-3 right-3 flex items-center gap-2">
                                {bulkText && <button onClick={() => { setBulkText(''); setBulkParsed(null); setBulkParseError(''); setBulkResult(null); }} className="text-xs text-gray-600 hover:text-gray-400 flex items-center gap-1"><X size={12} /> Clear</button>}
                            </div>
                            <textarea
                                value={bulkText}
                                onChange={e => { setBulkText(e.target.value); if (e.target.value.trim()) handleBulkParse(e.target.value); else { setBulkParsed(null); setBulkParseError(''); } }}
                                className="w-full h-80 bg-[#0a0a0a] border border-gray-800 rounded-xl p-4 text-xs font-mono text-zinc-300 focus:outline-none focus:border-blue-500/50 resize-none"
                                placeholder={'[\n  {\n    "company": "tcs",\n    "section": "aptitude",\n    "topic": "percentages",\n    "questionText": "...",\n    "options": [{"key":"A","text":"..."},{"key":"B","text":"..."},{"key":"C","text":"..."},{"key":"D","text":"..."}],\n    "correctAnswer": "B",\n    "explanation": "...",\n    "difficulty": "Medium",\n    "priority": "High"\n  },\n  { ... }\n]'}
                            />
                        </div>

                        {/* Parse error */}
                        {bulkParseError && (
                            <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                                <AlertTriangle size={14} className="text-red-400 mt-0.5 shrink-0" />
                                <p className="text-xs text-red-400">{bulkParseError}</p>
                            </div>
                        )}

                        {/* Upload button */}
                        <button
                            onClick={handleBulkUpload}
                            disabled={!bulkParsed || bulkUploading}
                            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-800 disabled:text-gray-600 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2"
                        >
                            {bulkUploading ? (
                                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Uploading...</>
                            ) : (
                                <><UploadCloud size={16} /> Upload {questionCount ? `${questionCount} Questions` : 'Questions'}</>
                            )}
                        </button>
                    </div>

                    {/* ── Right: Status + Instructions ── */}
                    <div className="lg:col-span-2 space-y-4">

                        {/* Parse status */}
                        {bulkParsed && !bulkParseError && (
                            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl space-y-2">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 size={16} className="text-green-400" />
                                    <p className="text-sm font-semibold text-green-400">Valid JSON — {bulkParsed.length} questions ready</p>
                                </div>
                                <div className="grid grid-cols-2 gap-2 pt-1">
                                    {Object.keys(COMPANY_TAXONOMY).map(slug => {
                                        const count = bulkParsed.filter(q => q.company === slug).length;
                                        return count > 0 ? (
                                            <div key={slug} className="flex items-center justify-between bg-[#111] rounded-lg px-3 py-1.5">
                                                <span className={`text-xs font-bold ${COMPANY_TAXONOMY[slug].color}`}>{COMPANY_TAXONOMY[slug].label}</span>
                                                <span className="text-xs text-gray-400">{count}</span>
                                            </div>
                                        ) : null;
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Upload result */}
                        {bulkResult && (
                            <div className="p-4 bg-[#111] border border-gray-800 rounded-xl space-y-3">
                                <p className="text-sm font-bold text-white">Upload Complete</p>
                                <div className="flex gap-4">
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-green-400">{bulkResult.insertedCount}</p>
                                        <p className="text-xs text-gray-500">Inserted</p>
                                    </div>
                                    {bulkResult.skippedCount > 0 && (
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-yellow-400">{bulkResult.skippedCount}</p>
                                            <p className="text-xs text-gray-500">Skipped</p>
                                        </div>
                                    )}
                                </div>
                                {bulkResult.errors && bulkResult.errors.length > 0 && (
                                    <div className="space-y-1">
                                        <p className="text-xs font-semibold text-yellow-400">Skipped (missing required fields):</p>
                                        {bulkResult.errors.map((e, i) => (
                                            <div key={i} className="text-xs text-gray-500 bg-[#0a0a0a] rounded p-2">
                                                <span className="text-gray-400">#{e.index + 1}</span> missing: <span className="text-red-400">{e.missing.join(', ')}</span>
                                                {e.questionText && <> — {e.questionText}&hellip;</>}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Quick reference */}
                        <div className="p-4 bg-[#111] border border-gray-800 rounded-xl space-y-3">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Required fields per question</p>
                            <div className="space-y-1.5">
                                {[
                                    ['company', '"tcs" | "infosys" | "wipro" | "cognizant" | "accenture"'],
                                    ['section', '"aptitude" | "reasoning" | "verbal" | "coding"'],
                                    ['topic', 'e.g. "percentages", "profit-loss", "syllogisms"'],
                                    ['difficulty', '"Easy" | "Medium" | "Hard"'],
                                    ['questionText', 'Full question string'],
                                    ['options', '[{key:"A",text:"..."}, {key:"B",...}, {key:"C",...}, {key:"D",...}]'],
                                    ['correctAnswer', '"A" | "B" | "C" | "D"'],
                                    ['explanation', 'Step-by-step solution text'],
                                ].map(([field, desc]) => (
                                    <div key={field} className="flex gap-2">
                                        <code className="text-xs text-blue-300 shrink-0 w-28">{field}</code>
                                        <span className="text-xs text-gray-600">{desc}</span>
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs text-gray-600 pt-1">Optional: <code className="text-gray-500">priority, formulaHint, subtopic, tags, timeLimit, order</code></p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ══ LIST VIEW ════════════════════════════════════════════════════════════════
    const filteredQs = questions.filter(q => {
        if (searchQuery) {
            const s = searchQuery.toLowerCase();
            if (!q.questionText?.toLowerCase().includes(s) && !q.topic?.includes(s)) return false;
        }
        return true;
    });

    // Stats grouped by company
    const companyCounts = Object.keys(COMPANY_TAXONOMY).reduce((acc, slug) => {
        acc[slug] = questions.filter(q => q.company === slug).length;
        return acc;
    }, {});

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white">Company Questions</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Add & manage MCQ questions for company prep sections</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => { setBulkText(''); setBulkParsed(null); setBulkParseError(''); setBulkResult(null); setView('bulk'); }}
                        className="bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 border border-purple-600/30 px-4 py-2 rounded-lg flex items-center gap-2 transition text-sm font-medium"
                    >
                        <UploadCloud size={16} /> Bulk Upload
                    </button>
                    <button
                        onClick={() => { setEditingId(null); setFormData(emptyForm()); setView('edit'); }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition text-sm font-medium"
                    >
                        <Plus size={16} /> Add Question
                    </button>
                </div>
            </div>

            {/* Company stats pills */}
            <div className="flex flex-wrap gap-2">
                {Object.entries(COMPANY_TAXONOMY).map(([slug, { label, color }]) => (
                    <button
                        key={slug}
                        onClick={() => setFilterCompany(prev => prev === slug ? '' : slug)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${filterCompany === slug ? 'border-white/20 bg-white/10 text-white' : 'border-gray-800 bg-[#111] text-gray-400 hover:border-gray-600'}`}
                    >
                        <span className={color}>{label}</span>
                        <span className="ml-1.5 text-gray-600">{companyCounts[slug] || 0}</span>
                    </button>
                ))}
                <span className="px-3 py-1.5 rounded-full text-xs font-medium border border-dashed border-gray-800 text-gray-600">
                    Total: {questions.length}
                </span>
            </div>

            {/* Filter bar */}
            <div className="flex flex-wrap gap-3 items-center">
                {/* Search */}
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search question text or topic..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full bg-[#1a1a1a] border border-gray-800 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-600"
                    />
                </div>
                {/* Company */}
                <select value={filterCompany} onChange={e => { setFilterCompany(e.target.value); setFilterSection(''); setFilterTopic(''); }}
                    className="bg-[#1a1a1a] border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-600">
                    <option value="">All Companies</option>
                    {Object.entries(COMPANY_TAXONOMY).map(([slug, { label }]) => (
                        <option key={slug} value={slug}>{label}</option>
                    ))}
                </select>
                {/* Section */}
                <select value={filterSection} onChange={e => { setFilterSection(e.target.value); setFilterTopic(''); }}
                    className="bg-[#1a1a1a] border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-600">
                    <option value="">All Sections</option>
                    {Object.entries(SECTIONS_MAP).map(([slug, { label }]) => (
                        <option key={slug} value={slug}>{label}</option>
                    ))}
                </select>
                {/* Topic (cascades from section filter) */}
                {filterSection && (
                    <select value={filterTopic} onChange={e => setFilterTopic(e.target.value)}
                        className="bg-[#1a1a1a] border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-600">
                        <option value="">All Topics</option>
                        {filterTopics.map(t => (
                            <option key={t.id} value={t.id}>{t.label}</option>
                        ))}
                    </select>
                )}
                {(filterCompany || filterSection || filterTopic || searchQuery) && (
                    <button
                        onClick={() => { setFilterCompany(''); setFilterSection(''); setFilterTopic(''); setSearchQuery(''); }}
                        className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-400 hover:text-white bg-[#1a1a1a] border border-gray-800 rounded-lg transition"
                    >
                        <X size={14} /> Clear
                    </button>
                )}
            </div>

            {/* Table */}
            <div className="bg-[#111] border border-gray-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-[#1a1a1a] border-b border-gray-800">
                            <tr>
                                <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase">Company</th>
                                <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase">Section / Topic</th>
                                <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase">Question</th>
                                <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase">Difficulty</th>
                                <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase">Priority</th>
                                <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase">Status</th>
                                <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/60">
                            {loading ? (
                                <tr><td colSpan="7" className="text-center py-8 text-gray-500">Loading...</td></tr>
                            ) : filteredQs.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-12">
                                        <div className="flex flex-col items-center gap-3">
                                            <BookOpen size={32} className="text-gray-700" />
                                            <p className="text-gray-500 text-sm">No questions yet.</p>
                                            <button
                                                onClick={() => { setEditingId(null); setFormData(emptyForm()); setView('edit'); }}
                                                className="px-4 py-2 bg-blue-600/20 text-blue-400 border border-blue-600/30 rounded-lg text-sm hover:bg-blue-600/30 transition"
                                            >
                                                Add your first question
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredQs.map(q => (
                                <tr key={q._id} className="hover:bg-[#1a1a1a]/50 transition-colors">
                                    <td className="px-5 py-3">
                                        <span className={`text-xs font-bold uppercase ${COMPANY_TAXONOMY[q.company]?.color || 'text-gray-400'}`}>
                                            {COMPANY_TAXONOMY[q.company]?.label || q.company}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3">
                                        <p className="text-xs text-gray-400 capitalize">{SECTIONS_MAP[q.section]?.label || q.section}</p>
                                        <p className="text-xs text-gray-600 mt-0.5">
                                            {TOPICS_BY_SECTION[q.section]?.find(t => t.id === q.topic)?.label || q.topic}
                                        </p>
                                    </td>
                                    <td className="px-5 py-3 max-w-xs">
                                        <p className="text-sm text-white truncate">
                                            {q.type === 'passage-group' ? `[RC] ${q.passage?.slice(0, 60)}…` : q.questionText?.slice(0, 80)}
                                            {(q.questionText?.length > 80 || q.passage?.length > 60) ? '…' : ''}
                                        </p>
                                    </td>
                                    <td className="px-5 py-3">
                                        <span className={`px-2 py-0.5 rounded text-xs font-medium border ${DIFF_COLORS[q.difficulty]}`}>
                                            {q.difficulty}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3">
                                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${PRIORITY_COLORS[q.priority]}`}>
                                            {q.priority}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3">
                                        <span className={`w-2 h-2 rounded-full inline-block ${q.isActive ? 'bg-green-500' : 'bg-gray-600'}`} />
                                        <span className="text-xs text-gray-500 ml-1.5">{q.isActive ? 'Active' : 'Hidden'}</span>
                                    </td>
                                    <td className="px-5 py-3 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <button onClick={() => handleEdit(q)} className="p-2 text-gray-500 hover:text-blue-400 transition">
                                                <Edit2 size={14} />
                                            </button>
                                            <button onClick={() => handleDelete(q._id)} className="p-2 text-gray-500 hover:text-red-400 transition">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CompanyQuestions;
