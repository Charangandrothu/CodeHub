import React, { useEffect, useState } from 'react';
import { Search, UserCheck, UserX, Shield, Trash2, Crown, X, Lock, KeyRound } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../config';

const UsersManagement = () => {
    const { currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');

    // Promotion Modal State
    const [promotionModal, setPromotionModal] = useState({
        open: false,
        userId: null,
        targetRole: null,
        code: '',
        verifying: false
    });

    useEffect(() => {
        if (currentUser) fetchUsers();
    }, [currentUser]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/admin/users`, {
                headers: { 'x-user-uid': currentUser?.uid }
            });
            const data = await res.json();
            const usersList = data.map(u => ({
                id: u.uid,
                ...u
            }));
            setUsers(usersList);
        } catch (error) {
            console.error("Error fetching users:", error);
            toast.error("Failed to fetch users");
        } finally {
            setLoading(false);
        }
    };

    // Open promotion code modal
    const openPromotionModal = (userId, targetRole) => {
        setPromotionModal({
            open: true,
            userId,
            targetRole,
            code: '',
            verifying: false
        });
    };

    // Submit promotion with code
    const handlePromotionSubmit = async () => {
        const { userId, targetRole, code } = promotionModal;

        if (!code.trim()) {
            toast.error("Please enter the promotion code.");
            return;
        }

        setPromotionModal(prev => ({ ...prev, verifying: true }));

        try {
            const res = await fetch(`${API_URL}/api/admin/users/${userId}/role`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-uid': currentUser?.uid
                },
                body: JSON.stringify({ role: targetRole, promotionCode: code })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to update");
            }

            // Update local state
            setUsers(users.map(user =>
                user.id === userId
                    ? { ...user, role: targetRole, isPro: targetRole === 'pro' ? true : (targetRole === 'user' ? false : user.isPro) }
                    : user
            ));

            toast.success(`User promoted to ${targetRole === 'admin' ? 'Admin' : 'Pro'} successfully!`);
            setPromotionModal({ open: false, userId: null, targetRole: null, code: '', verifying: false });
        } catch (error) {
            console.error("Promotion error:", error);
            toast.error(error.message || "Invalid promotion code.");
            setPromotionModal(prev => ({ ...prev, verifying: false }));
        }
    };

    // Demote (no code needed)
    const handleDemote = async (userId) => {
        if (!window.confirm("Are you sure you want to demote this user?")) return;

        try {
            const res = await fetch(`${API_URL}/api/admin/users/${userId}/role`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-uid': currentUser?.uid
                },
                body: JSON.stringify({ role: 'user' })
            });

            if (!res.ok) throw new Error("Failed to update");

            setUsers(users.map(user =>
                user.id === userId ? { ...user, role: 'user', isPro: false } : user
            ));
            toast.success("User demoted to regular user.");
        } catch (error) {
            console.error("Error updating user:", error);
            toast.error("Failed to update user");
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm("Are you sure you want to delete this user? This cannot be undone.")) return;

        try {
            const res = await fetch(`${API_URL}/api/admin/users/${userId}`, {
                method: 'DELETE',
                headers: { 'x-user-uid': currentUser?.uid }
            });

            if (!res.ok) throw new Error("Failed to delete");

            setUsers(users.filter(user => user.id !== userId));
            toast.success("User deleted successfully");
        } catch (error) {
            console.error("Error deleting user:", error);
            toast.error("Failed to delete user");
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = (user.displayName || user.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filter === 'all' || user.role === filter || (filter === 'pro' && user.isPro);
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-white">Users Management</h1>

                <div className="flex gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-[#1a1a1a] border border-gray-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500 w-64"
                        />
                    </div>
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="bg-[#1a1a1a] border border-gray-800 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                    >
                        <option value="all">All Users</option>
                        <option value="admin">Admins</option>
                        <option value="pro">Pro Users</option>
                        <option value="user">Normal Users</option>
                    </select>
                </div>
            </div>

            <div className="bg-[#111] border border-gray-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-[#1a1a1a] border-b border-gray-800">
                            <tr>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-400 uppercase">Name</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-400 uppercase">Email</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-400 uppercase">Role</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-400 uppercase">Status</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-400 uppercase text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">Loading users...</td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">No users found</td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-[#1a1a1a]/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-white">{user.displayName || user.name || 'N/A'}</div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-400 font-mono text-sm">{user.email}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${user.role === 'admin'
                                                ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                                : user.isPro
                                                    ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                                    : 'bg-gray-800 text-gray-400 border-gray-700'
                                                }`}>
                                                {user.role === 'admin' && <Shield className="w-3 h-3 mr-1" />}
                                                {user.isPro && user.role !== 'admin' && <Crown className="w-3 h-3 mr-1" />}
                                                {user.role === 'admin' ? 'Admin' : user.isPro ? 'Pro' : user.role || 'user'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1.5">
                                                <span className="relative flex h-2 w-2">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                                </span>
                                                <span className="text-sm text-gray-400">Active</span>
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {/* Promote to Admin (with code confirmation) */}
                                                {user.role !== 'admin' && (
                                                    <button
                                                        onClick={() => openPromotionModal(user.id, 'admin')}
                                                        className="p-2 text-gray-400 hover:text-purple-400 hover:bg-purple-500/10 rounded transition-colors"
                                                        title="Promote to Admin"
                                                    >
                                                        <Shield className="w-4 h-4" />
                                                    </button>
                                                )}

                                                {/* Demote Admin */}
                                                {user.role === 'admin' && (
                                                    <button
                                                        onClick={() => handleDemote(user.id)}
                                                        className="p-2 text-purple-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                                                        title="Remove Admin"
                                                    >
                                                        <UserX className="w-4 h-4" />
                                                    </button>
                                                )}

                                                {/* Promote to Pro (with code confirmation) */}
                                                {!user.isPro && user.role !== 'admin' && (
                                                    <button
                                                        onClick={() => openPromotionModal(user.id, 'pro')}
                                                        className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded transition-colors"
                                                        title="Make Pro"
                                                    >
                                                        <Crown className="w-4 h-4" />
                                                    </button>
                                                )}

                                                {/* Remove Pro */}
                                                {user.isPro && user.role !== 'admin' && (
                                                    <button
                                                        onClick={() => handleDemote(user.id)}
                                                        className="p-2 text-blue-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                                                        title="Remove Pro"
                                                    >
                                                        <UserX className="w-4 h-4" />
                                                    </button>
                                                )}

                                                <button
                                                    onClick={() => handleDeleteUser(user.id)}
                                                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                                                    title="Delete User"
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

            {/* Promotion Code Modal */}
            {promotionModal.open && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#111] border border-gray-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
                        {/* Close Button */}
                        <button
                            onClick={() => setPromotionModal({ open: false, userId: null, targetRole: null, code: '', verifying: false })}
                            className="absolute top-4 right-4 p-1 text-gray-500 hover:text-gray-300 transition-colors"
                        >
                            <X size={18} />
                        </button>

                        {/* Header */}
                        <div className="flex items-center gap-3 mb-6">
                            <div className={`p-3 rounded-xl ${promotionModal.targetRole === 'admin'
                                ? 'bg-purple-500/10 text-purple-400'
                                : 'bg-blue-500/10 text-blue-400'
                                }`}>
                                {promotionModal.targetRole === 'admin'
                                    ? <Shield size={24} />
                                    : <Crown size={24} />
                                }
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">
                                    Promote to {promotionModal.targetRole === 'admin' ? 'Admin' : 'Pro'}
                                </h3>
                                <p className="text-sm text-gray-400">Enter the secret promotion code to continue</p>
                            </div>
                        </div>

                        {/* Code Input */}
                        <div className="relative mb-6">
                            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                            <input
                                type="password"
                                value={promotionModal.code}
                                onChange={(e) => setPromotionModal(prev => ({ ...prev, code: e.target.value }))}
                                onKeyDown={(e) => e.key === 'Enter' && handlePromotionSubmit()}
                                placeholder="Enter promotion code..."
                                autoFocus
                                className="w-full bg-[#0a0a0a] border border-gray-700 focus:border-blue-500 rounded-xl pl-11 pr-4 py-3 text-white text-sm font-mono focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-gray-600"
                            />
                        </div>

                        {/* Warning */}
                        <div className="flex items-start gap-2 mb-6 p-3 bg-amber-500/5 border border-amber-500/10 rounded-lg">
                            <Lock size={14} className="text-amber-500 mt-0.5 shrink-0" />
                            <p className="text-xs text-amber-500/80">
                                This action requires a valid promotion code. The code is verified server-side and cannot be bypassed.
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => setPromotionModal({ open: false, userId: null, targetRole: null, code: '', verifying: false })}
                                className="flex-1 px-4 py-2.5 bg-[#1a1a1a] text-gray-300 rounded-xl border border-gray-700 hover:bg-[#222] transition-colors text-sm font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handlePromotionSubmit}
                                disabled={promotionModal.verifying || !promotionModal.code.trim()}
                                className={`flex-1 px-4 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${promotionModal.targetRole === 'admin'
                                    ? 'bg-purple-600 hover:bg-purple-700 text-white disabled:bg-purple-600/50'
                                    : 'bg-blue-600 hover:bg-blue-700 text-white disabled:bg-blue-600/50'
                                    } disabled:cursor-not-allowed`}
                            >
                                {promotionModal.verifying ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Verifying...
                                    </>
                                ) : (
                                    'Confirm Promotion'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UsersManagement;
