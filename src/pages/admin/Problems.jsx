import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Save, X, Eye, EyeOff, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Editor from '@monaco-editor/react';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../config';

const DynamicTestCaseManager = ({ testCases, setTestCases }) => {
    // Ensure we always have valid arrays to work with
    const safeTestCases = {
        visible: testCases?.visible || [],
        hidden: testCases?.hidden || []
    };

    const [activeTab, setActiveTab] = useState('visible'); // visible, hidden

    const addTestCase = () => {
        const currentCases = safeTestCases[activeTab];
        const newCase = activeTab === 'visible'
            ? { input: '', output: '', explanation: '' }
            : { input: '', output: '' };

        setTestCases({
            ...safeTestCases,
            [activeTab]: [...currentCases, newCase]
        });
    };

    const updateTestCase = (index, field, value) => {
        const currentCases = safeTestCases[activeTab];
        const updated = [...currentCases];
        updated[index] = { ...updated[index], [field]: value };
        setTestCases({
            ...safeTestCases,
            [activeTab]: updated
        });
    };

    const removeTestCase = (index) => {
        const currentCases = safeTestCases[activeTab];
        const updated = currentCases.filter((_, i) => i !== index);
        setTestCases({
            ...safeTestCases,
            [activeTab]: updated
        });
    };

    return (
        <div className="flex flex-col h-full border border-gray-800 rounded-xl overflow-hidden bg-[#161616]">
            {/* Header Tabs */}
            <div className="flex border-b border-gray-800 bg-[#1a1a1a]">
                <button
                    onClick={() => setActiveTab('visible')}
                    className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'visible' ? 'text-white bg-[#222]' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    Visible Cases ({safeTestCases.visible.length})
                </button>
                <button
                    onClick={() => setActiveTab('hidden')}
                    className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'hidden' ? 'text-white bg-[#222]' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    Hidden Cases ({safeTestCases.hidden.length})
                </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {safeTestCases[activeTab].map((tc, idx) => (
                    <div key={idx} className="bg-[#0a0a0a] rounded-lg border border-gray-800 p-4 relative group">
                        <button
                            onClick={() => removeTestCase(idx)}
                            className="absolute top-2 right-2 p-1.5 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Trash2 size={14} />
                        </button>

                        <div className="space-y-3">
                            <div>
                                <label className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1 block">Input</label>
                                <textarea
                                    value={tc.input}
                                    onChange={(e) => updateTestCase(idx, 'input', e.target.value)}
                                    className="w-full bg-[#161616] border border-gray-800 rounded p-2 text-sm font-mono text-zinc-300 focus:border-blue-500/50 outline-none transition-colors"
                                    rows={2}
                                    placeholder="e.g. nums = [2,7,11,15], target = 9"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1 block">Output</label>
                                <textarea
                                    value={tc.output}
                                    onChange={(e) => updateTestCase(idx, 'output', e.target.value)}
                                    className="w-full bg-[#161616] border border-gray-800 rounded p-2 text-sm font-mono text-emerald-400/90 focus:border-emerald-500/30 outline-none transition-colors"
                                    rows={1}
                                    placeholder="e.g. [0,1]"
                                />
                            </div>
                            {activeTab === 'visible' && (
                                <div>
                                    <label className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1 block">Explanation (Optional)</label>
                                    <input
                                        type="text"
                                        value={tc.explanation || ''}
                                        onChange={(e) => updateTestCase(idx, 'explanation', e.target.value)}
                                        className="w-full bg-[#161616] border border-gray-800 rounded p-2 text-sm text-zinc-400 focus:border-blue-500/50 outline-none transition-colors"
                                        placeholder="Explanation for the user..."
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {safeTestCases[activeTab].length === 0 && (
                    <div className="text-center py-8 text-zinc-600 text-sm">
                        No {activeTab} test cases added yet.
                    </div>
                )}
            </div>

            {/* Footer Action */}
            <div className="p-3 border-t border-gray-800 bg-[#1a1a1a]">
                <button
                    onClick={addTestCase}
                    className="w-full py-2 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-600/20 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
                >
                    <Plus size={16} />
                    Add {activeTab === 'visible' ? 'Visible' : 'Hidden'} Case
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

    // Initial State for a new problem
    const initialFormState = {
        order: 1,
        title: '',
        slug: '',
        topic: '',
        difficulty: 'Easy',
        category: '',
        tags: [],
        visibility: 'public',
        description: '',
        starterCode: {
            javascript: "// Write your code here",
            python: "# Write your code here"
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
                tags: Array.isArray(formData.tags) ? formData.tags : formData.tags.split(',').map(t => t.trim())
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
        // Fetch full details
        try {
            const res = await fetch(`${API_URL}/api/problems/${problemSummary.slug}`);
            if (!res.ok) throw new Error("Failed to fetch problem details");
            const problem = await res.json();

            setEditingId(problem._id);
            setFormData({
                ...problem,
                tags: Array.isArray(problem.tags) ? problem.tags.join(', ') : problem.tags,
                starterCode: problem.starterCode || { javascript: '', python: '' },
                testCases: problem.testCases || { visible: [], hidden: [] }, // Ensure structure
                theory: problem.theory || { videoTitle: '', videoUrl: '', explanation: '', timeComplexity: { value: '', explanation: '' }, spaceComplexity: { value: '', explanation: '' }, solutionCode: { javascript: '', python: '', java: '', cpp: '' } }
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
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-white">
                        {editingId ? 'Edit Problem' : 'New Problem'}
                    </h1>
                    <div className="flex gap-2">
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
                                    <input
                                        type="text"
                                        value={formData.topic}
                                        onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                                        className="w-full bg-[#1a1a1a] border border-gray-800 rounded p-2 text-white"
                                        placeholder="e.g. Sliding Window"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-sm text-gray-400 block mb-1">Tags (comma separated)</label>
                                <input
                                    type="text"
                                    value={formData.tags}
                                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                    className="w-full bg-[#1a1a1a] border border-gray-800 rounded p-2 text-white"
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
                        </div>

                        {/* Theory / Editorial Section */}
                        <div className="bg-[#111] p-6 rounded-xl border border-gray-800 space-y-4">
                            <h3 className="text-lg font-bold text-white border-b border-gray-800 pb-2 flex items-center gap-2">
                                <span className="text-yellow-400">📖</span> Theory / Editorial
                            </h3>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm text-gray-400 block mb-1">Video Title</label>
                                    <input
                                        type="text"
                                        value={formData.theory?.videoTitle || ''}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            theory: { ...formData.theory, videoTitle: e.target.value }
                                        })}
                                        className="w-full bg-[#1a1a1a] border border-gray-800 rounded p-2 text-white"
                                        placeholder="e.g. Two Sum - Complete Explanation"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-gray-400 block mb-1">YouTube Video URL</label>
                                    <input
                                        type="url"
                                        value={formData.theory?.videoUrl || ''}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            theory: { ...formData.theory, videoUrl: e.target.value }
                                        })}
                                        className="w-full bg-[#1a1a1a] border border-gray-800 rounded p-2 text-white"
                                        placeholder="https://youtube.com/watch?v=..."
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-sm text-gray-400 block mb-1">Explanation (supports line breaks)</label>
                                <textarea
                                    value={formData.theory?.explanation || ''}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        theory: { ...formData.theory, explanation: e.target.value }
                                    })}
                                    className="w-full h-40 bg-[#1a1a1a] border border-gray-800 rounded p-2 text-white font-mono text-sm"
                                    placeholder="Write a detailed explanation of the approach, time/space complexity, and key insights..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400 block mb-1">Time Complexity</label>
                                    <input
                                        type="text"
                                        value={formData.theory?.timeComplexity?.value || ''}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            theory: { ...formData.theory, timeComplexity: { ...formData.theory?.timeComplexity, value: e.target.value } }
                                        })}
                                        className="w-full bg-[#1a1a1a] border border-gray-800 rounded p-2 text-white font-mono"
                                        placeholder="e.g. O(n)"
                                    />
                                    <textarea
                                        value={formData.theory?.timeComplexity?.explanation || ''}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            theory: { ...formData.theory, timeComplexity: { ...formData.theory?.timeComplexity, explanation: e.target.value } }
                                        })}
                                        className="w-full h-16 bg-[#1a1a1a] border border-gray-800 rounded p-2 text-white text-sm"
                                        placeholder="Why this time complexity?"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400 block mb-1">Space Complexity</label>
                                    <input
                                        type="text"
                                        value={formData.theory?.spaceComplexity?.value || ''}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            theory: { ...formData.theory, spaceComplexity: { ...formData.theory?.spaceComplexity, value: e.target.value } }
                                        })}
                                        className="w-full bg-[#1a1a1a] border border-gray-800 rounded p-2 text-white font-mono"
                                        placeholder="e.g. O(1)"
                                    />
                                    <textarea
                                        value={formData.theory?.spaceComplexity?.explanation || ''}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            theory: { ...formData.theory, spaceComplexity: { ...formData.theory?.spaceComplexity, explanation: e.target.value } }
                                        })}
                                        className="w-full h-16 bg-[#1a1a1a] border border-gray-800 rounded p-2 text-white text-sm"
                                        placeholder="Why this space complexity?"
                                    />
                                </div>
                            </div>

                            <h4 className="text-sm font-semibold text-gray-300 pt-2 border-t border-gray-800">Solution Code</h4>

                            <div className="space-y-3">
                                <div className="space-y-1">
                                    <label className="text-sm text-gray-400">JavaScript Solution</label>
                                    <div className="h-36 border border-gray-800 rounded overflow-hidden">
                                        <Editor
                                            height="100%"
                                            defaultLanguage="javascript"
                                            theme="vs-dark"
                                            value={formData.theory?.solutionCode?.javascript || ''}
                                            onChange={(val) => setFormData({
                                                ...formData,
                                                theory: {
                                                    ...formData.theory,
                                                    solutionCode: { ...formData.theory?.solutionCode, javascript: val }
                                                }
                                            })}
                                            options={{ minimap: { enabled: false }, fontSize: 12 }}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm text-gray-400">Python Solution</label>
                                    <div className="h-36 border border-gray-800 rounded overflow-hidden">
                                        <Editor
                                            height="100%"
                                            defaultLanguage="python"
                                            theme="vs-dark"
                                            value={formData.theory?.solutionCode?.python || ''}
                                            onChange={(val) => setFormData({
                                                ...formData,
                                                theory: {
                                                    ...formData.theory,
                                                    solutionCode: { ...formData.theory?.solutionCode, python: val }
                                                }
                                            })}
                                            options={{ minimap: { enabled: false }, fontSize: 12 }}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm text-gray-400">Java Solution</label>
                                    <div className="h-36 border border-gray-800 rounded overflow-hidden">
                                        <Editor
                                            height="100%"
                                            defaultLanguage="java"
                                            theme="vs-dark"
                                            value={formData.theory?.solutionCode?.java || ''}
                                            onChange={(val) => setFormData({
                                                ...formData,
                                                theory: {
                                                    ...formData.theory,
                                                    solutionCode: { ...formData.theory?.solutionCode, java: val }
                                                }
                                            })}
                                            options={{ minimap: { enabled: false }, fontSize: 12 }}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm text-gray-400">C++ Solution</label>
                                    <div className="h-36 border border-gray-800 rounded overflow-hidden">
                                        <Editor
                                            height="100%"
                                            defaultLanguage="cpp"
                                            theme="vs-dark"
                                            value={formData.theory?.solutionCode?.cpp || ''}
                                            onChange={(val) => setFormData({
                                                ...formData,
                                                theory: {
                                                    ...formData.theory,
                                                    solutionCode: { ...formData.theory?.solutionCode, cpp: val }
                                                }
                                            })}
                                            options={{ minimap: { enabled: false }, fontSize: 12 }}
                                        />
                                    </div>
                                </div>
                            </div>
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
                            ) : problems.length === 0 ? (
                                <tr><td colSpan="6" className="text-center py-4 text-gray-500">No problems found</td></tr>
                            ) : (
                                problems.map(problem => (
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
                                        <td className="px-6 py-4 text-gray-400 text-sm">{problem.topic}</td>
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
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Problems;
