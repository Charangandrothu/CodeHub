import React, { useEffect, useState } from 'react';
import { Search, UserCheck, UserX, Shield, Trash2, Crown } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../config';

const UsersManagement = () => {
    const { currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all'); // all, admin, pro, user

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
            // Transform data if needed
            const usersList = data.map(u => ({
                id: u.uid, // Map uid to id for frontend consistency
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

    const handleRoleUpdate = async (userId, newRole) => {
        try {
            const res = await fetch(`${API_URL}/api/admin/users/${userId}/role`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-uid': currentUser?.uid
                },
                body: JSON.stringify({ role: newRole })
            });

            if (!res.ok) throw new Error("Failed to update");

            setUsers(users.map(user =>
                user.id === userId ? { ...user, role: newRole } : user
            ));
            toast.success(`User role updated to ${newRole}`);
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
                                                : user.role === 'pro' || user.isPro
                                                    ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                                    : 'bg-gray-800 text-gray-400 border-gray-700'
                                                }`}>
                                                {user.role === 'admin' && <Shield className="w-3 h-3 mr-1" />}
                                                {(user.role === 'pro' || user.isPro) && <Crown className="w-3 h-3 mr-1" />}
                                                {user.role || 'user'}
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
                                                {user.role !== 'admin' ? (
                                                    <button
                                                        onClick={() => handleRoleUpdate(user.id, 'admin')}
                                                        className="p-2 text-gray-400 hover:text-purple-400 hover:bg-purple-500/10 rounded transition-colors"
                                                        title="Promote to Admin"
                                                    >
                                                        <Shield className="w-4 h-4" />
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleRoleUpdate(user.id, 'user')}
                                                        className="p-2 text-purple-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                                                        title="Remove Admin"
                                                    >
                                                        <UserX className="w-4 h-4" />
                                                    </button>
                                                )}

                                                {user.role !== 'pro' && !user.isPro && user.role !== 'admin' && (
                                                    <button
                                                        onClick={() => handleRoleUpdate(user.id, 'pro')}
                                                        className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded transition-colors"
                                                        title="Make Pro"
                                                    >
                                                        <Crown className="w-4 h-4" />
                                                    </button>
                                                )}

                                                {(user.role === 'pro' || user.isPro) && (
                                                    <button
                                                        onClick={() => handleRoleUpdate(user.id, 'user')}
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

                {/* Pagination could go here */}
            </div>
        </div>
    );
};

export default UsersManagement;
