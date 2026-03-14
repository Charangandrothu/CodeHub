import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Save, X, Eye, EyeOff, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Editor from '@monaco-editor/react';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../config';
import { TOPICS } from '../../components/dsa/Sidebar';

const DynamicTestCaseManager = ({ testCases, setTestCases }) => {
    const safeTestCases = {
        visible: testCases?.visible || [],
        hidden: testCases?.hidden || []
    };

    const [activeTab, setActiveTab] = useState('visible');
    const [showJsonImport, setShowJsonImport] = useState(false);
    const [jsonImportText, setJsonImportText] = useState('');
    const [jsonImportError, setJsonImportError] = useState('');

    const addTestCase = () => {
        const currentCases = safeTestCases[activeTab];
        const newCase = activeTab === 'visible'
            ? { input: '', output: '', explanation: '' }
            : { input: '', output: '' };
        setTestCases({ ...safeTestCases, [activeTab]: [...currentCases, newCase] });
    };

    const updateTestCase = (index, field, value) => {
        const currentCases = safeTestCases[activeTab];
        const updated = [...currentCases];
        updated[index] = { ...updated[index], [field]: value };
        setTestCases({ ...safeTestCases, [activeTab]: updated });
    };

    const removeTestCase = (index) => {
        const currentCases = safeTestCases[activeTab];
        setTestCases({ ...safeTestCases, [activeTab]: currentCases.filter((_, i) => i !== index) });
    };

    const handleJsonImport = () => {
        setJsonImportError('');
        try {
            const parsed = JSON.parse(jsonImportText.trim());
            const arr = Array.isArray(parsed) ? parsed : null;
            if (!arr) throw new Error('Must be a JSON array');
            const valid = arr.every(tc => typeof tc.input === 'string' && typeof tc.output === 'string');
            if (!valid) throw new Error('Each item must have "input" (string) and "output" (string)');
            setTestCases({ ...safeTestCases, [activeTab]: arr });
            setShowJsonImport(false);
            setJsonImportText('');
        } catch (e) {
            setJsonImportError(e.message);
        }
    };

    return (
        <div className="flex flex-col h-full border border-gray-800 rounded-xl overflow-hidden bg-[#161616]">
            {/* Header Tabs */}
            <div className="flex border-b border-gray-800 bg-[#1a1a1a]">
                <button onClick={() => setActiveTab('visible')} className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'visible' ? 'text-white bg-[#222]' : 'text-gray-500 hover:text-gray-300'}`}>
                    Visible Cases ({safeTestCases.visible.length})
                </button>
                <button onClick={() => setActiveTab('hidden')} className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'hidden' ? 'text-white bg-[#222]' : 'text-gray-500 hover:text-gray-300'}`}>
                    Hidden Cases ({safeTestCases.hidden.length})
                </button>
            </div>

            {/* JSON Import panel */}
            {showJsonImport && (
                <div className="p-3 border-b border-gray-800 bg-[#111] space-y-2">
                    <p className="text-xs text-gray-400 font-medium">Paste JSON array — replaces current {activeTab} cases:</p>
                    <p className="text-[10px] text-gray-600 font-mono">{`[{"input":"nums = [1,2,3]","output":"3"}, ...]`}</p>
                    <textarea
                        value={jsonImportText}
                        onChange={e => { setJsonImportText(e.target.value); setJsonImportError(''); }}
                        className="w-full h-36 bg-[#0a0a0a] border border-gray-700 rounded p-2 text-xs font-mono text-zinc-300 outline-none focus:border-blue-500/50"
                        placeholder='[{"input": "...", "output": "..."}, ...]'
                    />
                    {jsonImportError && <p className="text-xs text-red-400">{jsonImportError}</p>}
                    <div className="flex gap-2">
                        <button onClick={handleJsonImport} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded font-medium transition-colors">Import & Replace</button>
                        <button onClick={() => { setShowJsonImport(false); setJsonImportText(''); setJsonImportError(''); }} className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded font-medium transition-colors">Cancel</button>
                    </div>
                </div>
            )}

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {safeTestCases[activeTab].map((tc, idx) => (
                    <div key={idx} className="bg-[#0a0a0a] rounded-lg border border-gray-800 p-4 relative group">
                        <button onClick={() => removeTestCase(idx)} className="absolute top-2 right-2 p-1.5 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Trash2 size={14} />
                        </button>
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1 block">Input</label>
                                <textarea value={tc.input} onChange={(e) => updateTestCase(idx, 'input', e.target.value)} className="w-full bg-[#161616] border border-gray-800 rounded p-2 text-sm font-mono text-zinc-300 focus:border-blue-500/50 outline-none transition-colors" rows={2} placeholder="e.g. nums = [2,7,11,15], target = 9" />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1 block">Output</label>
                                <textarea value={tc.output} onChange={(e) => updateTestCase(idx, 'output', e.target.value)} className="w-full bg-[#161616] border border-gray-800 rounded p-2 text-sm font-mono text-emerald-400/90 focus:border-emerald-500/30 outline-none transition-colors" rows={1} placeholder="e.g. [0,1]" />
                            </div>
                            {activeTab === 'visible' && (
                                <div>
                                    <label className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1 block">Explanation (Optional)</label>
                                    <input type="text" value={tc.explanation || ''} onChange={(e) => updateTestCase(idx, 'explanation', e.target.value)} className="w-full bg-[#161616] border border-gray-800 rounded p-2 text-sm text-zinc-400 focus:border-blue-500/50 outline-none transition-colors" placeholder="Explanation for the user..." />
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {safeTestCases[activeTab].length === 0 && (
                    <div className="text-center py-8 text-zinc-600 text-sm">No {activeTab} test cases added yet.</div>
                )}
            </div>

            {/* Footer Actions */}
            <div className="p-3 border-t border-gray-800 bg-[#1a1a1a] flex gap-2">
                <button onClick={addTestCase} className="flex-1 py-2 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-600/20 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2">
                    <Plus size={16} />
                    Add {activeTab === 'visible' ? 'Visible' : 'Hidden'} Case
                </button>
                <button onClick={() => setShowJsonImport(v => !v)} className="px-3 py-2 bg-purple-600/10 hover:bg-purple-600/20 text-purple-400 border border-purple-600/20 rounded-lg text-sm font-medium transition-all" title="Bulk import from JSON">
                    {'{ }'}
                </button>
            </div>
        </div>
    );
};

const Problems = () => {
    const { currentUser } = useAuth(); // Import useAuth
    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('list'); // list, edit
    const [editingId, setEditingId] = useState(null);
    const [filterTopic, setFilterTopic] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [quickEditTopic, setQuickEditTopic] = useState(null);
    const [adminTheoryApproach, setAdminTheoryApproach] = useState('brute');
    const [showJsonImportProblem, setShowJsonImportProblem] = useState(false);
    const [jsonImportProblemText, setJsonImportProblemText] = useState('');
    const [jsonImportProblemError, setJsonImportProblemError] = useState('');

    const [showJsonImportTheory, setShowJsonImportTheory] = useState(false);
    const [jsonImportTheoryText, setJsonImportTheoryText] = useState('');
    const [jsonImportTheoryError, setJsonImportTheoryError] = useState('');

    const handleImportTheoryJson = () => {
        setJsonImportTheoryError('');
        try {
            const parsed = JSON.parse(jsonImportTheoryText.trim());
            const emptyApproach = () => ({ explanation: '', timeComplexity: { value: '', explanation: '' }, spaceComplexity: { value: '', explanation: '' }, solutionCode: { javascript: '', python: '', java: '', cpp: '' } });
            
            let bruteData = parsed.bruteForce || parsed.brute || parsed.theory?.bruteForce || parsed.theory?.brute || null;
            let optimalData = parsed.optimal || parsed.theory?.optimal || null;
            
            if (!bruteData && !optimalData && (parsed.explanation || parsed.solutionCode)) {
                optimalData = parsed;
            }

            setFormData(prev => ({
                ...prev,
                theory: {
                    ...prev.theory,
                    bruteForce: bruteData || emptyApproach(),
                    optimal: optimalData || emptyApproach()
                }
            }));

            if (optimalData && !bruteData) {
                setAdminTheoryApproach('optimal');
            }

            setShowJsonImportTheory(false);
            setJsonImportTheoryText('');
            toast.success('Successfully imported Explanation JSON');
        } catch (e) {
            setJsonImportTheoryError('Invalid JSON: ' + e.message);
        }
    };

    const handleImportFullJson = () => {
        setJsonImportProblemError('');
        try {
            const p = JSON.parse(jsonImportProblemText.trim());
            if (typeof p !== 'object' || Array.isArray(p)) throw new Error('Must be a single problem JSON object');
            const emptyApproach = () => ({ explanation: '', timeComplexity: { value: '', explanation: '' }, spaceComplexity: { value: '', explanation: '' }, solutionCode: { javascript: '', python: '', java: '', cpp: '' } });
            // Helper: an approach is considered "filled" if it has any explanation text
            const approachFilled = (ap) => !!(ap?.explanation?.trim() || ap?.solutionCode?.javascript?.trim() || ap?.solutionCode?.python?.trim());
            setFormData(prev => {
                // Preserve existing approaches — only fall back to JSON values when current slot is blank
                const prevBrute = prev.theory?.bruteForce;
                const prevOptimal = prev.theory?.optimal;
                const mergedBrute = approachFilled(prevBrute) ? prevBrute : (p.theory?.bruteForce || prevBrute || emptyApproach());
                const mergedOptimal = approachFilled(prevOptimal) ? prevOptimal : (p.theory?.optimal || prevOptimal || emptyApproach());

                // Merge hidden test cases: append JSON's hidden to existing (deduplicated by JSON string)
                const existingHidden = prev.testCases?.hidden || [];
                const incomingHidden = p.testCases?.hidden || [];
                const existingHiddenSet = new Set(existingHidden.map(tc => JSON.stringify(tc)));
                const newHidden = [
                    ...existingHidden,
                    ...incomingHidden.filter(tc => !existingHiddenSet.has(JSON.stringify(tc)))
                ];

                return {
                    ...prev,
                    // Overlay scalar/top-level fields from JSON but don't blindly spread subdocs
                    ...(p.title !== undefined && { title: p.title }),
                    ...(p.slug !== undefined && { slug: p.slug }),
                    ...(p.topic !== undefined && { topic: p.topic }),
                    ...(p.difficulty !== undefined && { difficulty: p.difficulty }),
                    ...(p.category !== undefined && { category: p.category }),
                    ...(p.description !== undefined && { description: p.description }),
                    ...(p.visibility !== undefined && { visibility: p.visibility }),
                    ...(p.order !== undefined && { order: p.order }),
                    tags: Array.isArray(p.tags) ? p.tags.join(', ') : (p.tags ?? prev.tags ?? ''),
                    companies: Array.isArray(p.companies) ? p.companies.join(', ') : (p.companies ?? prev.companies ?? ''),
                    starterCode: p.starterCode
                        ? { ...prev.starterCode, ...p.starterCode }
                        : prev.starterCode,
                    testCases: {
                        visible: p.testCases?.visible ?? prev.testCases?.visible ?? [],
                        hidden: newHidden,
                    },
                    theory: {
                        videoTitle: p.theory?.videoTitle ?? prev.theory?.videoTitle ?? '',
                        videoUrl: p.theory?.videoUrl ?? prev.theory?.videoUrl ?? '',
                        explanation: p.theory?.explanation ?? prev.theory?.explanation ?? '',
                        timeComplexity: p.theory?.timeComplexity ?? prev.theory?.timeComplexity ?? { value: '', explanation: '' },
                        spaceComplexity: p.theory?.spaceComplexity ?? prev.theory?.spaceComplexity ?? { value: '', explanation: '' },
                        solutionCode: p.theory?.solutionCode
                            ? { ...(prev.theory?.solutionCode || {}), ...p.theory.solutionCode }
                            : (prev.theory?.solutionCode || { javascript: '', python: '', java: '', cpp: '' }),
                        bruteForce: mergedBrute,
                        optimal: mergedOptimal,
                    }
                };
            });
            if (p.examples || p.constraints) {
                setJsonEditorContent({
                    examples: JSON.stringify(p.examples || [], null, 2),
                    constraints: JSON.stringify(p.constraints || [], null, 2)
                });
            }
            setShowJsonImportProblem(false);
            setJsonImportProblemText('');
            toast.success(`Imported: ${p.title || 'problem'} — review and save`);
        } catch (e) {
            setJsonImportProblemError(e.message);
        }
    };

    const VALID_TOPIC_IDS = TOPICS.map(t => t.id);
    const isValidTopic = (t) => VALID_TOPIC_IDS.includes(t);

    const handleQuickTopicSave = async (problemId, newTopic) => {
        try {
            const res = await fetch(`${API_URL}/api/problems/${problemId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'x-user-uid': currentUser?.uid },
                body: JSON.stringify({ topic: newTopic })
            });
            if (!res.ok) throw new Error('Failed');
            toast.success('Topic updated');
            setProblems(prev => prev.map(p => p.id === problemId ? { ...p, topic: newTopic } : p));
            setQuickEditTopic(null);
        } catch {
            toast.error('Failed to update topic');
        }
    };

    // Initial State for a new problem
    const initialFormState = {
        order: 1,
        title: '',
        slug: '',
        topic: '',
        difficulty: 'Easy',
        category: '',
        tags: [],
        companies: [],
        visibility: 'public',
        description: '',
        starterCode: {
            javascript: "// Write your code here",
            python: "# Write your code here",
            cpp: "// Write your code here",
            java: "// Write your code here"
        },
        testCases: {
            visible: [],
            hidden: []
        },
        examples: [],
        constraints: [],
        theory: {
            videoTitle: '',
            videoUrl: '',
            explanation: '',
            timeComplexity: { value: '', explanation: '' },
            spaceComplexity: { value: '', explanation: '' },
            solutionCode: {
                javascript: '',
                python: '',
                java: '',
                cpp: ''
            },
            bruteForce: {
                explanation: '',
                timeComplexity: { value: '', explanation: '' },
                spaceComplexity: { value: '', explanation: '' },
                solutionCode: { javascript: '', python: '', java: '', cpp: '' }
            },
            optimal: {
                explanation: '',
                timeComplexity: { value: '', explanation: '' },
                spaceComplexity: { value: '', explanation: '' },
                solutionCode: { javascript: '', python: '', java: '', cpp: '' }
            }
        }
    };

    const [formData, setFormData] = useState(initialFormState);
    // Keep JSON editors for specific fields if needed, but testCases is now managed in formData directly
    const [jsonEditorContent, setJsonEditorContent] = useState({
        examples: JSON.stringify([], null, 2),
        constraints: JSON.stringify([], null, 2)
    });

    useEffect(() => {
        if (view === 'list') {
            fetchProblems();
        }
    }, [view]);

    const fetchProblems = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/problems`); // Public endpoint serves list
            const data = await res.json();
            // Data might not include order if backend sort default is different but we added sort({order:1})
            // Map _id to id
            setProblems(data.map(p => ({ id: p._id, ...p })));
        } catch (error) {
            console.error("Error fetching problems:", error);
            // toast.error("Failed to fetch problems");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            // Parse JSON fields
            const payload = {
                ...formData,
                // testCases is already an object in formData
                examples: JSON.parse(jsonEditorContent.examples),
                constraints: JSON.parse(jsonEditorContent.constraints),
                // Split tags if it's a string, or ensure it's array
                tags: Array.isArray(formData.tags) ? formData.tags : formData.tags.split(',').map(t => t.trim()).filter(Boolean),
                companies: Array.isArray(formData.companies) ? formData.companies : formData.companies.split(',').map(c => c.trim()).filter(Boolean)
            };

            const method = editingId ? 'PUT' : 'POST';
            const url = editingId ? `${API_URL}/api/problems/${editingId}` : `${API_URL}/api/problems`;

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-uid': currentUser?.uid // Admin check
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || "Failed to save");
            }

            toast.success(editingId ? "Problem updated" : "Problem created");
            setView('list');
            setEditingId(null);
            setFormData(initialFormState);
        } catch (error) {
            console.error("Error saving problem:", error);
            toast.error(error.message || "Failed to save. Check JSON validity.");
        }
    };

    const handleEdit = async (problemSummary) => {
        // Step 1: get the _id via public endpoint (list already has it, but use slug to confirm)
        // Step 2: fetch FULL unsanitized data via admin endpoint using _id
        try {
            // Get basic info (slug → _id) — use the list item which has _id
            const id = problemSummary._id;
            if (!id) throw new Error("Problem ID missing");

            // Fetch full problem (no cache, no theory sanitization)
            const res = await fetch(`${API_URL}/api/problems/admin-edit/${id}`);
            if (!res.ok) throw new Error("Failed to fetch problem details");
            const problem = await res.json();

            const emptyApproach = () => ({
                explanation: '',
                timeComplexity: { value: '', explanation: '' },
                spaceComplexity: { value: '', explanation: '' },
                solutionCode: { javascript: '', python: '', java: '', cpp: '' }
            });

            setEditingId(problem._id);
            setFormData({
                ...problem,
                tags: Array.isArray(problem.tags) ? problem.tags.join(', ') : problem.tags,
                companies: Array.isArray(problem.companies) ? problem.companies.join(', ') : (problem.companies || ''),
                starterCode: problem.starterCode || { javascript: '', python: '', cpp: '', java: '' },
                testCases: problem.testCases || { visible: [], hidden: [] },
                theory: {
                    videoTitle: problem.theory?.videoTitle || '',
                    videoUrl: problem.theory?.videoUrl || '',
                    explanation: problem.theory?.explanation || '',
                    timeComplexity: problem.theory?.timeComplexity || { value: '', explanation: '' },
                    spaceComplexity: problem.theory?.spaceComplexity || { value: '', explanation: '' },
                    solutionCode: problem.theory?.solutionCode || { javascript: '', python: '', java: '', cpp: '' },
                    bruteForce: problem.theory?.bruteForce || emptyApproach(),
                    optimal: problem.theory?.optimal || emptyApproach(),
                }
            });
            setJsonEditorContent({
                examples: JSON.stringify(problem.examples || [], null, 2),
                constraints: JSON.stringify(problem.constraints || [], null, 2)
            });
            setView('edit');
        } catch (error) {
            console.error(error);
            toast.error("Error loading problem details");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this problem?")) return;
        try {
            const res = await fetch(`${API_URL}/api/problems/${id}`, {
                method: 'DELETE',
                headers: { 'x-user-uid': currentUser?.uid }
            });
            if (!res.ok) throw new Error("Delete failed");

            toast.success("Problem deleted");
            fetchProblems();
        } catch (error) {
            console.error("Error deleting problem:", error);
            toast.error("Failed to delete problem");
        }
    };

    if (view === 'edit') {
        return (
            <div className="space-y-6">
                {/* JSON Import Problem Modal */}
                {showJsonImportProblem && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                        <div className="bg-[#111] border border-gray-700 rounded-2xl p-6 w-full max-w-2xl space-y-4 shadow-2xl">
                            <h2 className="text-lg font-bold text-white">Import Full Problem JSON</h2>
                            <p className="text-xs text-gray-400">Paste the complete problem JSON object. All fields (title, slug, starterCode, testCases, theory, etc.) will be populated automatically.</p>
                            <textarea
                                className="w-full h-72 bg-[#0a0a0a] border border-gray-700 rounded-lg p-3 text-xs font-mono text-zinc-300 outline-none focus:border-blue-500/50"
                                placeholder='{"title": "...", "testCases": {"hidden": [...]}, ...}'
                                value={jsonImportProblemText}
                                onChange={e => { setJsonImportProblemText(e.target.value); setJsonImportProblemError(''); }}
                                autoFocus
                            />
                            {jsonImportProblemError && <p className="text-xs text-red-400">{jsonImportProblemError}</p>}
                            <div className="flex gap-3">
                                <button onClick={handleImportFullJson} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg font-medium transition-colors">Import & Populate</button>
                                <button onClick={() => { setShowJsonImportProblem(false); setJsonImportProblemText(''); setJsonImportProblemError(''); }} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg font-medium transition-colors">Cancel</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* JSON Import Theory Modal */}
                {showJsonImportTheory && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                        <div className="bg-[#111] border border-gray-700 rounded-2xl p-6 w-full max-w-2xl space-y-4 shadow-2xl">
                            <div className="flex justify-between items-center">
                                <h2 className="text-lg font-bold text-white">Import Explanation JSON</h2>
                                <button onClick={() => { setShowJsonImportTheory(false); setJsonImportTheoryText(''); setJsonImportTheoryError(''); }} className="text-gray-500 hover:text-white transition"><X size={20} /></button>
                            </div>
                            <p className="text-xs text-gray-400">Paste the JSON containing <code>optimal</code> (and optionally <code>bruteForce</code>). If you only want to show the optimal approach, only include the <code>optimal</code> key.</p>
                            <textarea
                                className="w-full h-72 bg-[#0a0a0a] border border-gray-700 rounded-lg p-3 text-xs font-mono text-zinc-300 outline-none focus:border-blue-500/50"
                                placeholder='{&#10;  "optimal": {&#10;    "explanation": "...",&#10;    "timeComplexity": {"value": "O(N)"},&#10;    "solutionCode": {"javascript": "..."}&#10;  }&#10;}'
                                value={jsonImportTheoryText}
                                onChange={e => { setJsonImportTheoryText(e.target.value); setJsonImportTheoryError(''); }}
                                autoFocus
                            />
                            {jsonImportTheoryError && <p className="text-xs text-red-400">{jsonImportTheoryError}</p>}
                            <div className="flex gap-3">
                                <button onClick={handleImportTheoryJson} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg font-medium transition-colors border border-purple-500/30">Import & Replace Approaches</button>
                                <button onClick={() => { setShowJsonImportTheory(false); setJsonImportTheoryText(''); setJsonImportTheoryError(''); }} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded-lg font-medium transition-colors border border-gray-700">Cancel</button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-white">
                        {editingId ? 'Edit Problem' : 'New Problem'}
                    </h1>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowJsonImportProblem(true)}
                            className="px-4 py-2 bg-purple-600/20 text-purple-400 border border-purple-600/30 rounded-lg hover:bg-purple-600/30 transition text-sm font-medium"
                        >
                            Import JSON
                        </button>
                        <button
                            onClick={() => setView('list')}
                            className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                        >
                            <Save className="w-4 h-4" /> Save Problem
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-200px)] overflow-y-auto pr-2 custom-scrollbar">
                    {/* Left Column: Meta Data */}
                    <div className="space-y-4">
                        <div className="bg-[#111] p-6 rounded-xl border border-gray-800 space-y-4">
                            <h3 className="text-lg font-bold text-white border-b border-gray-800 pb-2">Basic Info</h3>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm text-gray-400 block mb-1">Title</label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                                        className="w-full bg-[#1a1a1a] border border-gray-800 rounded p-2 text-white"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-gray-400 block mb-1">Slug</label>
                                    <input
                                        type="text"
                                        value={formData.slug}
                                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                        className="w-full bg-[#1a1a1a] border border-gray-800 rounded p-2 text-white"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-gray-400 block mb-1">Order</label>
                                    <input
                                        type="number"
                                        value={formData.order}
                                        onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                                        className="w-full bg-[#1a1a1a] border border-gray-800 rounded p-2 text-white"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-gray-400 block mb-1">Difficulty</label>
                                    <select
                                        value={formData.difficulty}
                                        onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                                        className="w-full bg-[#1a1a1a] border border-gray-800 rounded p-2 text-white"
                                    >
                                        <option>Easy</option>
                                        <option>Medium</option>
                                        <option>Hard</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-400 block mb-1">Category</label>
                                    <input
                                        type="text"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full bg-[#1a1a1a] border border-gray-800 rounded p-2 text-white"
                                        placeholder="e.g. Arrays"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-gray-400 block mb-1">Topic</label>
                                    <select
                                        value={formData.topic}
                                        onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                                        className="w-full bg-[#1a1a1a] border border-gray-800 rounded p-2 text-white"
                                    >
                                        <option value="">-- Select Topic --</option>
                                        {TOPICS.map((t) => (
                                            <option key={t.id} value={t.id}>{t.label}</option>
                                        ))}
                                    </select>
                                    <p className="text-xs text-gray-600 mt-1">This must match the DSA sidebar category exactly.</p>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm text-gray-400 block mb-1">Tags (comma separated)</label>
                                <input
                                    type="text"
                                    value={formData.tags}
                                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                    className="w-full bg-[#1a1a1a] border border-gray-800 rounded p-2 text-white"
                                    placeholder="e.g. Arrays, Traversal"
                                />
                            </div>

                            <div>
                                <label className="text-sm text-gray-400 block mb-1">Companies (comma separated)</label>
                                <input
                                    type="text"
                                    value={formData.companies}
                                    onChange={(e) => setFormData({ ...formData, companies: e.target.value })}
                                    className="w-full bg-[#1a1a1a] border border-gray-800 rounded p-2 text-white"
                                    placeholder="e.g. Amazon, Google, Microsoft"
                                />
                            </div>

                            <div>
                                <label className="text-sm text-gray-400 block mb-1">Description (Markdown)</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full h-32 bg-[#1a1a1a] border border-gray-800 rounded p-2 text-white font-mono text-sm"
                                />
                            </div>
                        </div>

                        <div className="bg-[#111] p-6 rounded-xl border border-gray-800 space-y-4">
                            <h3 className="text-lg font-bold text-white border-b border-gray-800 pb-2">Starter Code</h3>
                            <div className="space-y-2">
                                <label className="text-sm text-gray-400">JavaScript</label>
                                <div className="h-32 border border-gray-800 rounded overflow-hidden">
                                    <Editor
                                        height="100%"
                                        defaultLanguage="javascript"
                                        theme="vs-dark"
                                        value={formData.starterCode.javascript}
                                        onChange={(val) => setFormData({
                                            ...formData,
                                            starterCode: { ...formData.starterCode, javascript: val }
                                        })}
                                        options={{ minimap: { enabled: false }, fontSize: 12 }}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm text-gray-400">Python</label>
                                <div className="h-32 border border-gray-800 rounded overflow-hidden">
                                    <Editor
                                        height="100%"
                                        defaultLanguage="python"
                                        theme="vs-dark"
                                        value={formData.starterCode.python}
                                        onChange={(val) => setFormData({
                                            ...formData,
                                            starterCode: { ...formData.starterCode, python: val }
                                        })}
                                        options={{ minimap: { enabled: false }, fontSize: 12 }}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm text-gray-400">C++</label>
                                <div className="h-32 border border-gray-800 rounded overflow-hidden">
                                    <Editor
                                        height="100%"
                                        defaultLanguage="cpp"
                                        theme="vs-dark"
                                        value={formData.starterCode.cpp}
                                        onChange={(val) => setFormData({
                                            ...formData,
                                            starterCode: { ...formData.starterCode, cpp: val }
                                        })}
                                        options={{ minimap: { enabled: false }, fontSize: 12 }}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm text-gray-400">Java</label>
                                <div className="h-32 border border-gray-800 rounded overflow-hidden">
                                    <Editor
                                        height="100%"
                                        defaultLanguage="java"
                                        theme="vs-dark"
                                        value={formData.starterCode.java}
                                        onChange={(val) => setFormData({
                                            ...formData,
                                            starterCode: { ...formData.starterCode, java: val }
                                        })}
                                        options={{ minimap: { enabled: false }, fontSize: 12 }}
                                    />
                                </div>
                            </div>
                        </div>

                            {/* Brute Force / Optimal Approach Sections */}
                            <div className="bg-[#111] p-6 rounded-xl border border-gray-800 space-y-4">
                                <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                        <span>⚡ Approach Solutions</span>
                                        <button 
                                            type="button"
                                            onClick={() => setShowJsonImportTheory(true)}
                                            className="ml-2 px-2 py-0.5 bg-purple-600/20 text-purple-400 border border-purple-600/30 rounded text-xs font-bold transition-colors hover:bg-purple-600/30 flex items-center gap-1"
                                        >
                                            {'{ }'} Import JSON
                                        </button>
                                    </h3>
                                    <div className="flex items-center gap-1 bg-[#0d0d0d] border border-gray-800 rounded-lg p-0.5">
                                        {['brute', 'optimal'].map(ap => (
                                            <button
                                                key={ap}
                                                type="button"
                                                onClick={() => setAdminTheoryApproach(ap)}
                                                className={`px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${
                                                    adminTheoryApproach === ap
                                                        ? 'bg-gray-700 text-white'
                                                        : 'text-gray-500 hover:text-gray-300'
                                                }`}
                                            >
                                                {ap === 'brute' ? 'Brute Force' : 'Optimal'}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Video — shared for the whole editorial */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm text-gray-400 block mb-1">Video Title</label>
                                        <input
                                            type="text"
                                            value={formData.theory?.videoTitle || ''}
                                            onChange={(e) => setFormData({ ...formData, theory: { ...formData.theory, videoTitle: e.target.value } })}
                                            className="w-full bg-[#1a1a1a] border border-gray-800 rounded p-2 text-white text-sm"
                                            placeholder="e.g. Two Sum - Complete Explanation"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-400 block mb-1">YouTube Video URL</label>
                                        <input
                                            type="url"
                                            value={formData.theory?.videoUrl || ''}
                                            onChange={(e) => setFormData({ ...formData, theory: { ...formData.theory, videoUrl: e.target.value } })}
                                            className="w-full bg-[#1a1a1a] border border-gray-800 rounded p-2 text-white text-sm"
                                            placeholder="https://youtube.com/watch?v=..."
                                        />
                                    </div>
                                </div>

                                {['brute', 'optimal'].map(ap => {
                                    const theoryKey = ap === 'brute' ? 'bruteForce' : 'optimal';
                                    const apData = formData.theory?.[theoryKey] || {};
                                    const updateAp = (patch) => setFormData(fd => ({
                                        ...fd,
                                        theory: { ...fd.theory, [theoryKey]: { ...(fd.theory?.[theoryKey] || {}), ...patch } }
                                    }));
                                    return (
                                        // Keep both mounted — only toggle visibility — so Monaco editors don't lose state on tab switch
                                        <div key={ap} style={{ display: adminTheoryApproach === ap ? 'block' : 'none' }} className="space-y-4">
                                            <div>
                                                <label className="text-sm text-gray-400 block mb-1">
                                                    {ap === 'brute' ? 'Brute Force' : 'Optimal'} Explanation
                                                </label>
                                                <textarea
                                                    value={apData.explanation || ''}
                                                    onChange={e => updateAp({ explanation: e.target.value })}
                                                    className="w-full h-32 bg-[#1a1a1a] border border-gray-800 rounded p-2 text-white font-mono text-sm"
                                                    placeholder={`Describe the ${ap === 'brute' ? 'brute force' : 'optimal'} approach...`}
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-sm text-gray-400">Time Complexity</label>
                                                    <input
                                                        type="text"
                                                        value={apData.timeComplexity?.value || ''}
                                                        onChange={e => updateAp({ timeComplexity: { ...(apData.timeComplexity || {}), value: e.target.value } })}
                                                        className="w-full bg-[#1a1a1a] border border-gray-800 rounded p-2 text-white font-mono text-sm"
                                                        placeholder="e.g. O(n²)"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={apData.timeComplexity?.explanation || ''}
                                                        onChange={e => updateAp({ timeComplexity: { ...(apData.timeComplexity || {}), explanation: e.target.value } })}
                                                        className="w-full bg-[#1a1a1a] border border-gray-800 rounded p-2 text-white text-sm"
                                                        placeholder="Why this time complexity?"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm text-gray-400">Space Complexity</label>
                                                    <input
                                                        type="text"
                                                        value={apData.spaceComplexity?.value || ''}
                                                        onChange={e => updateAp({ spaceComplexity: { ...(apData.spaceComplexity || {}), value: e.target.value } })}
                                                        className="w-full bg-[#1a1a1a] border border-gray-800 rounded p-2 text-white font-mono text-sm"
                                                        placeholder="e.g. O(1)"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={apData.spaceComplexity?.explanation || ''}
                                                        onChange={e => updateAp({ spaceComplexity: { ...(apData.spaceComplexity || {}), explanation: e.target.value } })}
                                                        className="w-full bg-[#1a1a1a] border border-gray-800 rounded p-2 text-white text-sm"
                                                        placeholder="Why this space complexity?"
                                                    />
                                                </div>
                                            </div>
                                            <label className="text-sm text-gray-400 block">Solution Code</label>
                                            {['javascript', 'python', 'java', 'cpp'].map(lang => (
                                                <div key={lang} className="space-y-1">
                                                    <label className="text-xs text-gray-500 capitalize">{lang === 'cpp' ? 'C++' : lang === 'javascript' ? 'JavaScript' : lang.charAt(0).toUpperCase() + lang.slice(1)}</label>
                                                    <div className="h-28 border border-gray-800 rounded overflow-hidden">
                                                        <Editor
                                                            height="100%"
                                                            language={lang === 'cpp' ? 'cpp' : lang}
                                                            theme="vs-dark"
                                                            value={apData.solutionCode?.[lang] || ''}
                                                            onChange={val => updateAp({ solutionCode: { ...(apData.solutionCode || {}), [lang]: val ?? '' } })}
                                                            options={{ minimap: { enabled: false }, fontSize: 12 }}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    );
                                })}
                            </div>
                    </div>

                    {/* Right Column: Dynamic Test Cases & JSON Config */}
                    <div className="space-y-4 flex flex-col h-full">
                        {/* Dynamic Test Case Manager */}
                        <div className="flex-1 min-h-[500px]">
                            <label className="text-sm text-gray-400 mb-2 block font-semibold">Test Cases (Interactive)</label>
                            <DynamicTestCaseManager
                                testCases={formData.testCases}
                                setTestCases={(newTestCases) => setFormData({ ...formData, testCases: newTestCases })}
                            />
                        </div>

                        <div className="bg-[#111] p-6 rounded-xl border border-gray-800 space-y-4">
                            <h3 className="text-lg font-bold text-white border-b border-gray-800 pb-2">Additional Config</h3>

                            <div className="h-48 flex flex-col">
                                <label className="text-sm text-gray-400 mb-1">Examples JSON (For Description)</label>
                                <div className="flex-1 border border-gray-800 rounded overflow-hidden">
                                    <Editor
                                        height="100%"
                                        defaultLanguage="json"
                                        theme="vs-dark"
                                        value={jsonEditorContent.examples}
                                        onChange={(val) => setJsonEditorContent({ ...jsonEditorContent, examples: val })}
                                        options={{ minimap: { enabled: false }, fontSize: 12 }}
                                    />
                                </div>
                            </div>

                            <div className="h-48 flex flex-col">
                                <label className="text-sm text-gray-400 mb-1">Constraints JSON</label>
                                <div className="flex-1 border border-gray-800 rounded overflow-hidden">
                                    <Editor
                                        height="100%"
                                        defaultLanguage="json"
                                        theme="vs-dark"
                                        value={jsonEditorContent.constraints}
                                        onChange={(val) => setJsonEditorContent({ ...jsonEditorContent, constraints: val })}
                                        options={{ minimap: { enabled: false }, fontSize: 12 }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white">Problems Management</h1>
                <button
                    onClick={() => {
                        setEditingId(null);
                        setFormData(initialFormState);
                        setJsonEditorContent({
                            examples: JSON.stringify([], null, 2),
                            constraints: JSON.stringify([], null, 2)
                        });
                        setView('edit');
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
                >
                    <Plus className="w-4 h-4" /> Add Problem
                </button>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap gap-3 items-center">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search by title..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#1a1a1a] border border-gray-800 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-600"
                    />
                </div>
                <select
                    value={filterTopic}
                    onChange={(e) => setFilterTopic(e.target.value)}
                    className="bg-[#1a1a1a] border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-600"
                >
                    <option value="">All Topics ({problems.length})</option>
                    <option value="__invalid__">⚠ Broken topics ({problems.filter(p => !isValidTopic(p.topic)).length})</option>
                    {TOPICS.map((t) => {
                        const count = problems.filter(p => p.topic === t.id).length;
                        return (
                            <option key={t.id} value={t.id}>
                                {t.label} ({count})
                            </option>
                        );
                    })}
                </select>
                {(filterTopic || searchQuery) && (
                    <button
                        onClick={() => { setFilterTopic(''); setSearchQuery(''); }}
                        className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-400 hover:text-white bg-[#1a1a1a] border border-gray-800 rounded-lg transition"
                    >
                        <X className="w-3.5 h-3.5" /> Clear
                    </button>
                )}
            </div>

            {/* Stats pills per topic when no filter active */}
            {!filterTopic && !searchQuery && (
                <div className="flex flex-wrap gap-2">
                    {(() => {
                        const brokenCount = problems.filter(p => !isValidTopic(p.topic)).length;
                        return brokenCount > 0 ? (
                            <button
                                onClick={() => setFilterTopic('__invalid__')}
                                className="px-3 py-1 rounded-full text-xs font-medium bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition"
                            >
                                ⚠ Broken topics <span className="ml-1">{brokenCount}</span>
                            </button>
                        ) : null;
                    })()}
                    {TOPICS.map((t) => {
                        const count = problems.filter(p => p.topic === t.id).length;
                        if (count === 0) return null;
                        return (
                            <button
                                key={t.id}
                                onClick={() => setFilterTopic(t.id)}
                                className="px-3 py-1 rounded-full text-xs font-medium bg-[#1a1a1a] border border-gray-800 text-gray-400 hover:border-blue-600 hover:text-white transition"
                            >
                                {t.label} <span className="ml-1 text-gray-600">{count}</span>
                            </button>
                        );
                    })}
                </div>
            )}

            <div className="bg-[#111] border border-gray-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-[#1a1a1a] border-b border-gray-800">
                            <tr>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-400 uppercase">Order</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-400 uppercase">Title</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-400 uppercase">Difficulty</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-400 uppercase">Topic</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-400 uppercase">Category</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-400 uppercase text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {loading ? (
                                <tr><td colSpan="6" className="text-center py-4 text-gray-500">Loading...</td></tr>
                            ) : (() => {
                                const filtered = problems.filter(p => {
                                    const matchTopic = !filterTopic
                                        ? true
                                        : filterTopic === '__invalid__'
                                            ? !isValidTopic(p.topic)
                                            : p.topic === filterTopic;
                                    const matchSearch = !searchQuery || p.title?.toLowerCase().includes(searchQuery.toLowerCase());
                                    return matchTopic && matchSearch;
                                });
                                if (filtered.length === 0) {
                                    return <tr><td colSpan="6" className="text-center py-8 text-gray-500">No problems match the filter.</td></tr>;
                                }
                                return filtered.map(problem => (
                                    <tr key={problem.id} className="hover:bg-[#1a1a1a]/50">
                                        <td className="px-6 py-4 text-gray-400">#{problem.order}</td>
                                        <td className="px-6 py-4 text-white font-medium">{problem.title}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${problem.difficulty === 'Hard' ? 'bg-red-500/10 text-red-400' :
                                                problem.difficulty === 'Medium' ? 'bg-yellow-500/10 text-yellow-400' :
                                                    'bg-green-500/10 text-green-400'
                                                }`}>
                                                {problem.difficulty}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {quickEditTopic?.id === problem.id ? (
                                                <div className="flex items-center gap-2">
                                                    <select
                                                        autoFocus
                                                        value={quickEditTopic.value}
                                                        onChange={(e) => setQuickEditTopic({ id: problem.id, value: e.target.value })}
                                                        className="bg-[#0a0a0a] border border-blue-600 rounded px-2 py-1 text-xs text-white focus:outline-none"
                                                    >
                                                        <option value="">-- select --</option>
                                                        {TOPICS.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                                                    </select>
                                                    <button
                                                        onClick={() => handleQuickTopicSave(problem.id, quickEditTopic.value)}
                                                        className="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition"
                                                    >Save</button>
                                                    <button
                                                        onClick={() => setQuickEditTopic(null)}
                                                        className="p-1 text-gray-500 hover:text-white"
                                                    ><X size={12} /></button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => setQuickEditTopic({ id: problem.id, value: problem.topic || '' })}
                                                    className={`group flex items-center gap-1.5 px-2 py-1 rounded-full text-xs border transition ${
                                                        isValidTopic(problem.topic)
                                                            ? 'bg-[#1a1a1a] border-gray-700 text-gray-300 hover:border-blue-600'
                                                            : 'bg-red-500/10 border-red-500/40 text-red-400 hover:border-red-400'
                                                    }`}
                                                >
                                                    {isValidTopic(problem.topic)
                                                        ? TOPICS.find(t => t.id === problem.topic)?.label
                                                        : `⚠ ${problem.topic || 'unset'}`
                                                    }
                                                    <Edit2 size={10} className="opacity-0 group-hover:opacity-60 transition-opacity" />
                                                </button>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-gray-400 text-sm">{problem.category}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(problem)}
                                                    className="p-2 text-gray-400 hover:text-blue-400 transition"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(problem.id)}
                                                    className="p-2 text-gray-400 hover:text-red-400 transition"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ));
                            })()}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Problems;
