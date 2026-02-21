import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../config';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit2, CheckCircle, AlertTriangle, Calendar, Users, Type, X, Megaphone } from 'lucide-react';

const Announcements = () => {
    const { currentUser } = useAuth();
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        message: '',
        type: 'offer',
        audience: 'all',
        bgStyle: 'blue',
        ctaText: '',
        ctaLink: '',
        startAt: '',
        endAt: '',
        isActive: true,
        priority: 1
    });

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        try {
            const res = await fetch(`${API_URL}/api/announcements/all`, {
                headers: {
                    'x-user-uid': currentUser?.uid
                }
            });
            if (res.ok) {
                const data = await res.json();
                setAnnouncements(data);
            }
        } catch (err) {
            console.error("Failed to fetch announcements", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const method = formData._id ? 'PUT' : 'POST';
            const url = formData._id
                ? `${API_URL}/api/announcements/${formData._id}`
                : `${API_URL}/api/announcements/create`;

            // Ensure dates are parsed correctly if needed, but backend expects Date string which input type="datetime-local" provides? 
            // Input uses "YYYY-MM-DDThh:mm", Date constructor handles it.

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-uid': currentUser?.uid
                },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                fetchAnnouncements();
                setShowForm(false);
                resetForm();
            } else {
                alert("Failed to save announcement");
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure?")) return;
        try {
            await fetch(`${API_URL}/api/announcements/${id}`, {
                method: 'DELETE',
                headers: { 'x-user-uid': currentUser?.uid }
            });
            fetchAnnouncements();
        } catch (err) {
            console.error(err);
        }
    };

    const resetForm = () => {
        setFormData({
            message: '',
            type: 'offer',
            audience: 'all',
            bgStyle: 'blue',
            ctaText: '',
            ctaLink: '',
            startAt: '',
            endAt: '',
            isActive: true,
            priority: 1
        });
    };

    const handleEdit = (ann) => {
        // Format dates for input type="datetime-local"
        const formatForInput = (dateStr) => {
            if (!dateStr) return '';
            const d = new Date(dateStr);
            d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
            return d.toISOString().slice(0, 16);
        };

        setFormData({
            ...ann,
            startAt: formatForInput(ann.startAt),
            endAt: formatForInput(ann.endAt)
        });
        setShowForm(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Megaphone className="text-blue-500" /> Announcements
                </h1>
                <button
                    onClick={() => { resetForm(); setShowForm(true); }}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                    <Plus size={18} /> Create New
                </button>
            </div>

            {/* List */}
            <div className="grid gap-4">
                {announcements.map((ann) => (
                    <div key={ann._id} className={`bg-[#12141a] border border-white/5 p-4 rounded-xl flex flex-col md:flex-row justify-between md:items-center gap-4 ${!ann.isActive ? 'opacity-50' : ''}`}>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${ann.isActive ? 'bg-green-500' : 'bg-gray-500'}`} />
                                <h3 className="font-semibold text-white">{ann.message}</h3>
                                <span className={`text-[10px] px-2 py-0.5 rounded border ${ann.type === 'offer' ? 'border-yellow-500/30 text-yellow-500 bg-yellow-500/10' :
                                        ann.type === 'maintenance' ? 'border-red-500/30 text-red-500 bg-red-500/10' :
                                            ann.type === 'feature' ? 'border-purple-500/30 text-purple-500 bg-purple-500/10' :
                                                'border-blue-500/30 text-blue-500 bg-blue-500/10'
                                    }`}>{ann.type?.toUpperCase()}</span>
                            </div>
                            <div className="text-xs text-gray-400 flex flex-wrap gap-4">
                                <span className="flex items-center gap-1"><Users size={12} /> {ann.audience.toUpperCase()}</span>
                                <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(ann.startAt).toLocaleDateString()} - {new Date(ann.endAt).toLocaleDateString()}</span>
                                {ann.ctaText && <span className="text-white/60">CTA: {ann.ctaText}</span>}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => handleEdit(ann)} className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors">
                                <Edit2 size={16} />
                            </button>
                            <button onClick={() => handleDelete(ann._id)} className="p-2 hover:bg-red-500/10 rounded-lg text-red-500 transition-colors">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}
                {announcements.length === 0 && !loading && (
                    <div className="text-center py-10 text-gray-500">No announcements found.</div>
                )}
            </div>

            {/* Modal Form */}
            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.95 }}
                            className="bg-[#1a1d26] w-full max-w-lg rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
                        >
                            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#15171e]">
                                <h2 className="text-lg font-bold text-white">
                                    {formData._id ? 'Edit Announcement' : 'New Announcement'}
                                </h2>
                                <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                                <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-1">Message</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:border-blue-500 focus:outline-none"
                                        value={formData.message}
                                        onChange={e => setFormData({ ...formData, message: e.target.value })}
                                        placeholder="Enter announcement text..."
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-400 mb-1">Type</label>
                                        <select
                                            className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:border-blue-500 focus:outline-none"
                                            value={formData.type}
                                            onChange={e => setFormData({ ...formData, type: e.target.value })}
                                        >
                                            <option value="offer">Offer</option>
                                            <option value="maintenance">Maintenance</option>
                                            <option value="feature">Feature</option>
                                            <option value="alert">Alert</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-400 mb-1">Target Audience</label>
                                        <select
                                            className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:border-blue-500 focus:outline-none"
                                            value={formData.audience}
                                            onChange={e => setFormData({ ...formData, audience: e.target.value })}
                                        >
                                            <option value="all">All Users</option>
                                            <option value="free">Free Users Only</option>
                                            <option value="pro">Pro Users Only</option>
                                            <option value="elite">Elite Users Only</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-400 mb-1">Background Style</label>
                                        <select
                                            className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:border-blue-500 focus:outline-none"
                                            value={formData.bgStyle}
                                            onChange={e => setFormData({ ...formData, bgStyle: e.target.value })}
                                        >
                                            <option value="blue">Blue Gradient</option>
                                            <option value="purple">Purple Premium</option>
                                            <option value="green">Green Success</option>
                                            <option value="red">Red Alert</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-400 mb-1">Priority (Higher = Top)</label>
                                        <input
                                            type="number"
                                            className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:border-blue-500 focus:outline-none"
                                            value={formData.priority}
                                            onChange={e => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-400 mb-1">Start Time</label>
                                        <input
                                            type="datetime-local"
                                            className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:border-blue-500 focus:outline-none"
                                            value={formData.startAt}
                                            onChange={e => setFormData({ ...formData, startAt: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-400 mb-1">End Time</label>
                                        <input
                                            type="datetime-local"
                                            className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:border-blue-500 focus:outline-none"
                                            value={formData.endAt}
                                            required
                                            onChange={e => setFormData({ ...formData, endAt: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-400 mb-1">CTA Text (Optional)</label>
                                        <input
                                            type="text"
                                            className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:border-blue-500 focus:outline-none"
                                            value={formData.ctaText}
                                            onChange={e => setFormData({ ...formData, ctaText: e.target.value })}
                                            placeholder="e.g. Upgrade Now"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-400 mb-1">CTA Link (Optional)</label>
                                        <input
                                            type="text"
                                            className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:border-blue-500 focus:outline-none"
                                            value={formData.ctaLink}
                                            onChange={e => setFormData({ ...formData, ctaLink: e.target.value })}
                                            placeholder="/pricing"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 pt-2">
                                    <input
                                        type="checkbox"
                                        id="isActive"
                                        checked={formData.isActive}
                                        onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                                        className="w-4 h-4 rounded border-gray-600 text-blue-600 focus:ring-blue-500"
                                    />
                                    <label htmlFor="isActive" className="text-sm text-gray-300">Set Active Immediately</label>
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t border-white/5 mt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowForm(false)}
                                        className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2 rounded-lg text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/20 transition-all"
                                    >
                                        Save Announcement
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Announcements;
