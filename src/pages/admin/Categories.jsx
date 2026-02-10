import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, GripVertical, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../config';

const Categories = () => {
    const { currentUser } = useAuth();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({ name: '', slug: '', order: 0 });

    useEffect(() => {
        if (currentUser) fetchCategories();
    }, [currentUser]);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/admin/categories`, {
                headers: { 'x-user-uid': currentUser?.uid }
            });
            const data = await res.json();
            setCategories(data);
        } catch (error) {
            console.error("Error fetching categories:", error);
            // toast.error("Failed to fetch categories");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!formData.name || !formData.slug) {
            toast.error("Name and Slug are required");
            return;
        }

        try {
            if (editingId) {
                // Update
                const res = await fetch(`${API_URL}/api/admin/categories/${editingId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', 'x-user-uid': currentUser?.uid },
                    body: JSON.stringify(formData)
                });
                if (!res.ok) throw new Error("Update failed");
                const updated = await res.json();
                setCategories(categories.map(c => c._id === editingId ? updated : c));
                toast.success("Category updated");
            } else {
                // Create
                const res = await fetch(`${API_URL}/api/admin/categories`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'x-user-uid': currentUser?.uid },
                    body: JSON.stringify(formData)
                });
                if (!res.ok) throw new Error("Create failed");
                const created = await res.json();
                setCategories([...categories, created]);
                toast.success("Category created");
            }
            resetForm();
        } catch (error) {
            console.error(error);
            toast.error("Failed to save category");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this category?")) return;
        try {
            const res = await fetch(`${API_URL}/api/admin/categories/${id}`, {
                method: 'DELETE',
                headers: { 'x-user-uid': currentUser?.uid }
            });
            if (!res.ok) throw new Error("Delete failed");
            setCategories(categories.filter(c => c._id !== id));
            toast.success("Category deleted");
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete category");
        }
    };

    const startEdit = (cat) => {
        setEditingId(cat._id);
        setFormData({ name: cat.name, slug: cat.slug, order: cat.order });
        setIsAdding(true);
    };

    const resetForm = () => {
        setIsAdding(false);
        setEditingId(null);
        setFormData({ name: '', slug: '', order: 0 });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white">Categories / Topics</h1>
                <div className="flex gap-2">
                    <button
                        onClick={async () => {
                            if (!window.confirm("This will add default topics to the database. Continue?")) return;
                            try {
                                const defaults = [
                                    { name: 'Patterns', slug: 'patterns', order: 1 },
                                    { name: 'Sorting', slug: 'sorting', order: 2 },
                                    { name: 'Beginner', slug: 'beginner', order: 3 },
                                    { name: 'Arrays', slug: 'arrays', order: 4 },
                                    { name: 'Strings', slug: 'strings', order: 5 },
                                    { name: 'Binary Search', slug: 'binary-search', order: 6 },
                                    { name: 'Recursion', slug: 'recursion-backtracking', order: 7 },
                                    { name: 'Linked Lists', slug: 'linked-lists', order: 8 },
                                    { name: 'Stacks & Queues', slug: 'stacks-queues', order: 9 },
                                    { name: 'Hashing', slug: 'hashing', order: 10 },
                                    { name: 'Trees & Graphs', slug: 'trees', order: 11 },
                                    { name: 'Dynamic Programming', slug: 'dp', order: 12 },
                                ];

                                let addedCount = 0;
                                for (const cat of defaults) {
                                    // Check if exists
                                    const exists = categories.some(c => c.slug === cat.slug);
                                    if (!exists) {
                                        await fetch(`${API_URL}/api/admin/categories`, {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json', 'x-user-uid': currentUser?.uid },
                                            body: JSON.stringify(cat)
                                        });
                                        addedCount++;
                                    }
                                }
                                toast.success(`Added ${addedCount} default categories`);
                                fetchCategories();
                            } catch (error) {
                                console.error(error);
                                toast.error("Failed to seed defaults");
                            }
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition"
                    >
                        Seed Defaults
                    </button>
                    <button
                        onClick={() => { resetForm(); setIsAdding(true); }}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        <Plus className="w-4 h-4" /> Add Category
                    </button>
                </div>
            </div>

            {/* Form */}
            <AnimatePresence>
                {isAdding && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-6 overflow-hidden"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Name</label>
                                <input
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-[#111] border border-gray-800 rounded px-3 py-2 text-white"
                                    placeholder="e.g. Arrays & Hashing"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Slug</label>
                                <input
                                    value={formData.slug}
                                    onChange={e => setFormData({ ...formData, slug: e.target.value })}
                                    className="w-full bg-[#111] border border-gray-800 rounded px-3 py-2 text-white"
                                    placeholder="e.g. arrays-hashing"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Order</label>
                                <input
                                    type="number"
                                    value={formData.order}
                                    onChange={e => setFormData({ ...formData, order: parseInt(e.target.value) })}
                                    className="w-full bg-[#111] border border-gray-800 rounded px-3 py-2 text-white"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2">
                            <button onClick={resetForm} className="px-4 py-2 text-gray-400 hover:text-white">Cancel</button>
                            <button onClick={handleSave} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2">
                                <Save className="w-4 h-4" /> Save
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* List */}
            <div className="grid gap-4">
                {categories.map((cat) => (
                    <div key={cat._id} className="bg-[#111] border border-gray-800 p-4 rounded-lg flex items-center justify-between group hover:border-gray-700 transition">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-[#1a1a1a] rounded text-gray-500 cursor-move">
                                <GripVertical className="w-4 h-4" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-white">{cat.name}</h3>
                                <div className="flex items-center gap-3 text-sm text-gray-500">
                                    <span className="font-mono bg-[#1a1a1a] px-1.5 rounded text-xs">{cat.slug}</span>
                                    <span>•</span>
                                    <span>Order: {cat.order}</span>
                                    <span>•</span>
                                    <span>{cat.totalProblems || 0} Problems</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                            <button onClick={() => startEdit(cat)} className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded">
                                <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(cat._id)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}

                {!loading && categories.length === 0 && (
                    <div className="text-center py-12 text-gray-500 bg-[#111] rounded-xl border border-gray-800 border-dashed">
                        No categories found. Create one to get started.
                    </div>
                )}
            </div>
        </div>
    );
};

export default Categories;
