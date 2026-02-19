import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User,
    Bell,
    Monitor,
    CreditCard,
    Camera,
    ChevronRight, // Ensure this import is maintained
    Save,
    Moon,
    Sun,
    Check,
    Zap,
    Lock,
    Trash
} from 'lucide-react'; // Added Trash
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { API_URL } from '../config';
import {
    updateProfile,
    deleteUser,
    EmailAuthProvider,
    reauthenticateWithCredential,
    GoogleAuthProvider,
    GithubAuthProvider,
    signInWithPopup
} from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
    const { currentUser, userData, refreshUserData, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('account');
    const [saving, setSaving] = useState(false);
    const navigate = useNavigate();

    // Delete Account State
    // Delete Account State
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');
    const [deleteError, setDeleteError] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    // Default Preferences State
    const [formData, setFormData] = useState({
        displayName: currentUser?.displayName || userData?.displayName || "",
        goal: "Placements",
        difficulty: "Medium",
        topics: ["DSA", "Aptitude"],
        dailyTarget: 3,
        notifications: {
            dailyReminder: true,
            weeklyReport: true,
            newProblems: true,
            marketing: false
        },
        theme: "dark",
        language: "English (United States)"
    });

    // Populate state from userData on load
    useEffect(() => {
        if (userData) {
            setFormData(prev => ({
                ...prev,
                ...(userData.preferences || {}),
                displayName: currentUser?.displayName || userData.displayName || prev.displayName,
                // Ensure notifications are merged correctly if partial
                notifications: { ...prev.notifications, ...(userData.preferences?.notifications || {}) }
            }));
        }
    }, [userData, currentUser]);

    // Apply Theme Effect
    useEffect(() => {
        const theme = formData.theme;
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
            document.documentElement.classList.remove('light');
        } else if (theme === 'light') {
            document.documentElement.classList.remove('dark');
            document.documentElement.classList.add('light');
        } else {
            // System: check media query
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        }
    }, [formData.theme]);


    const handleSave = async () => {
        setSaving(true);
        try {
            // 1. Update Firebase Profile (DisplayName)
            if (currentUser && formData.displayName !== currentUser.displayName) {
                await updateProfile(currentUser, {
                    displayName: formData.displayName
                });
            }

            // 2. Update Backend User Profile (DisplayName, etc.)
            await fetch(`${API_URL}/api/users/${currentUser.uid}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    displayName: formData.displayName,
                    // Add other profile fields if editable here
                })
            });

            // 3. Update Backend Preferences
            await fetch(`${API_URL}/api/users/preferences/${currentUser.uid}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    preferences: {
                        goal: formData.goal,
                        difficulty: formData.difficulty,
                        topics: formData.topics,
                        dailyTarget: formData.dailyTarget,
                        notifications: formData.notifications,
                        theme: formData.theme,
                        language: formData.language
                    }
                })
            });

            await refreshUserData();
            // Optional/Toast success here
        } catch (error) {
            console.error("Failed to save settings:", error);
            alert("Failed to save settings. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteClick = () => {
        setShowDeleteConfirm(true);
        setDeleteError('');
        setDeletePassword('');
    };

    const confirmDeleteAccount = async () => {
        setDeleteError('');
        setIsDeleting(true);
        try {
            // Re-authenticate user
            const providerId = currentUser.providerData[0]?.providerId;

            if (providerId === 'password') {
                const credential = EmailAuthProvider.credential(currentUser.email, deletePassword);
                await reauthenticateWithCredential(currentUser, credential);
            } else if (providerId === 'google.com') {
                const provider = new GoogleAuthProvider();
                await signInWithPopup(auth, provider);
            } else if (providerId === 'github.com') {
                const provider = new GithubAuthProvider();
                await signInWithPopup(auth, provider);
            }

            // 1. Delete from Backend
            await fetch(`${API_URL}/api/users/${currentUser.uid}`, {
                method: 'DELETE'
            });

            // 2. Delete from Firebase
            await deleteUser(currentUser);

            // 3. Cleanup
            navigate('/');
        } catch (error) {
            console.error("Failed to delete account:", error);
            if (error.code === 'auth/wrong-password') {
                setDeleteError("Incorrect password. Please try again.");
            } else if (error.code === 'auth/requires-recent-login') {
                setDeleteError("For security, please log out and log in again before deleting your account.");
            } else {
                setDeleteError(error.message || "Failed to delete account. Please try again.");
            }
        } finally {
            setIsDeleting(false);
        }
    };

    const toggleTopic = (topic) => {
        setFormData(prev => {
            const currentTopics = prev.topics || [];
            if (currentTopics.includes(topic)) {
                return { ...prev, topics: currentTopics.filter(t => t !== topic) };
            } else {
                return { ...prev, topics: [...currentTopics, topic] };
            }
        });
    };

    const toggleNotification = (key) => {
        setFormData(prev => ({
            ...prev,
            notifications: {
                ...prev.notifications,
                [key]: !prev.notifications?.[key]
            }
        }));
    };

    const sidebarItems = [
        { id: 'account', label: 'Account', icon: User, desc: 'Personal information' },
        { id: 'preferences', label: 'Preferences', icon: Zap, desc: 'Learning goals' },
        { id: 'notifications', label: 'Notifications', icon: Bell, desc: 'Email & alerts' },
        { id: 'subscription', label: 'Subscription', icon: CreditCard, desc: 'Plan & billing' },
        { id: 'general', label: 'General', icon: Monitor, desc: 'Display settings' },
    ];

    return (
        <div className="min-h-screen bg-[#0a0a0a] pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-[#0a0a0a] to-[#0a0a0a]">
            {/* Header */}
            <div className="max-w-6xl mx-auto mb-8">
                <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Settings</h1>
                <p className="text-gray-400">Manage your account preferences and settings</p>
            </div>

            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar Navigation */}
                <div className="space-y-4">
                    {/* User Mini Profile */}
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4 mb-6">
                        <div className="relative">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-[2px]">
                                <img
                                    src={currentUser?.photoURL || `https://api.dicebear.com/9.x/adventurer/svg?seed=${currentUser?.displayName || 'User'}`}
                                    alt="Profile"
                                    className="w-full h-full rounded-full object-cover border-2 border-[#1a1a1a]"
                                />
                            </div>
                            <button className="absolute bottom-0 right-0 p-1 rounded-full bg-white text-black hover:bg-gray-200 transition-colors" onClick={() => window.location.href = '/profile'}>
                                <Camera size={10} />
                            </button>
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-semibold text-white truncate">{formData.displayName || currentUser?.displayName || 'User'}</h3>
                            <p className="text-xs text-gray-400 truncate">{currentUser?.email}</p>
                        </div>
                    </div>

                    {/* Navigation Menu */}
                    <nav className="space-y-1">
                        {sidebarItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden ${activeTab === item.id
                                    ? 'bg-blue-600/10 text-white border border-blue-500/20'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                                    }`}
                            >
                                {activeTab === item.id && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.3 }}
                                    />
                                )}
                                <item.icon size={18} className={`shrink-0 ${activeTab === item.id ? 'text-blue-400' : 'text-gray-500 group-hover:text-gray-300'}`} />
                                <div className="text-left">
                                    <p className="text-sm font-medium">{item.label}</p>
                                    <p className="text-[10px] opacity-60 hidden md:block">{item.desc}</p>
                                </div>
                                {activeTab === item.id && <ChevronRight size={14} className="ml-auto text-blue-400 opacity-50" />}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Main Content Panel */}
                <div className="lg:col-span-3">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="bg-[#111] rounded-3xl border border-white/10 p-6 md:p-8 relative overflow-hidden"
                    >
                        {/* Background Glow */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-900/10 blur-[100px] pointer-events-none" />

                        {activeTab === 'account' && (
                            <div className="space-y-8 relative z-10">
                                <div className="flex items-center justify-between pb-6 border-b border-white/5">
                                    <div>
                                        <h2 className="text-xl font-bold text-white mb-1">Personal Information</h2>
                                        <p className="text-sm text-gray-400">Update your personal details here.</p>
                                    </div>
                                    <Button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="bg-white text-black hover:bg-gray-200 border-none"
                                    >
                                        <Save size={16} className="mr-2" />
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Display Name</label>
                                        <div className="relative group">
                                            <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                                            <input
                                                type="text"
                                                value={formData.displayName}
                                                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500/50 focus:bg-blue-900/10 transition-all placeholder:text-gray-600"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Email Address</label>
                                        <div className="relative group">
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">@</div>
                                            <input
                                                type="email"
                                                value={currentUser?.email || ""}
                                                disabled
                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-gray-400 cursor-not-allowed opacity-70"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-white/5">
                                    <h3 className="text-lg font-bold text-white mb-4">Security</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                                            <div className="flex items-center gap-4">
                                                <div className="p-2.5 rounded-lg bg-yellow-500/10 text-yellow-500">
                                                    <Lock size={18} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-white">Password</p>
                                                    <p className="text-xs text-gray-500">Managed via Authentication Provider</p>
                                                </div>
                                            </div>
                                            {/* Password change usually requires re-auth flow which is complex, hiding button for now or redirecting */}
                                            {/* <Button variant="outline" size="sm" className="text-xs">Change</Button> */}
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-white/5">
                                    <h3 className="text-lg font-bold text-red-500 mb-4">Danger Zone</h3>
                                    <div className="rounded-xl border border-red-500/20 bg-red-500/5 overflow-hidden transition-all duration-300">
                                        <div className="p-4 flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-white">Delete Account</p>
                                                <p className="text-xs text-gray-400 mt-1">Permanently remove your account and all data.</p>
                                            </div>
                                            {!showDeleteConfirm && (
                                                <button
                                                    onClick={handleDeleteClick}
                                                    className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-xs font-semibold rounded-lg border border-red-500/20 transition-all flex items-center gap-2"
                                                >
                                                    <Trash size={14} /> Delete Account
                                                </button>
                                            )}
                                        </div>

                                        <AnimatePresence>
                                            {showDeleteConfirm && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="px-4 pb-4"
                                                >
                                                    <div className="pt-4 border-t border-red-500/20 space-y-4">
                                                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                                                            <p className="text-xs text-red-200">
                                                                <strong className="block mb-1">Are you absolutely sure?</strong>
                                                                This action cannot be undone. This will permanently delete your account and remove your data from our servers.
                                                            </p>
                                                        </div>

                                                        {currentUser?.providerData[0]?.providerId === 'password' ? (
                                                            <div className="space-y-2">
                                                                <label className="text-xs font-medium text-red-300 ml-1">Confirm Password</label>
                                                                <div className="relative group">
                                                                    <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-red-400" />
                                                                    <input
                                                                        type="password"
                                                                        value={deletePassword}
                                                                        onChange={(e) => setDeletePassword(e.target.value)}
                                                                        className="w-full bg-red-950/20 border border-red-500/30 rounded-xl py-2.5 pl-9 pr-4 text-white placeholder:text-red-300/50 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 text-sm transition-all"
                                                                        placeholder="Enter your password to confirm"
                                                                        autoFocus
                                                                    />
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-start gap-3">
                                                                <div className="text-amber-500 mt-0.5"><Lock size={14} /></div>
                                                                <p className="text-amber-200/90 text-xs">
                                                                    You will need to sign in with your provider <strong>({currentUser?.providerData[0]?.providerId})</strong> to verify your identity.
                                                                </p>
                                                            </div>
                                                        )}

                                                        {deleteError && (
                                                            <p className="text-xs text-red-400 font-medium">{deleteError}</p>
                                                        )}

                                                        <div className="flex items-center justify-end gap-3 pt-2">
                                                            <button
                                                                onClick={() => setShowDeleteConfirm(false)}
                                                                className="px-3 py-1.5 text-xs font-medium text-gray-400 hover:text-white transition-colors"
                                                                disabled={isDeleting}
                                                            >
                                                                Cancel
                                                            </button>
                                                            <button
                                                                onClick={confirmDeleteAccount}
                                                                disabled={isDeleting || (currentUser?.providerData[0]?.providerId === 'password' && !deletePassword)}
                                                                className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-500/20"
                                                            >
                                                                {isDeleting ? 'Deleting...' : 'Confirm Deletion'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'preferences' && (
                            <div className="space-y-8 relative z-10">
                                <div className="flex items-center justify-between pb-6 border-b border-white/5">
                                    <div>
                                        <h2 className="text-xl font-bold text-white mb-1">Learning Preferences</h2>
                                        <p className="text-sm text-gray-400">Customize your daily goals and topic focus.</p>
                                    </div>
                                    <Button onClick={handleSave} disabled={saving} className="bg-white text-black hover:bg-gray-200 border-none">
                                        <Save size={16} className="mr-2" /> {saving ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <label className="text-sm font-medium text-white block">Primary Goal</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {['Placements', 'Internship', 'GATE', 'Competitive'].map((goal) => (
                                                <div
                                                    key={goal}
                                                    onClick={() => setFormData({ ...formData, goal })}
                                                    className={`relative cursor-pointer p-3 rounded-xl border transition-all ${formData.goal === goal ? 'bg-blue-600/20 border-blue-500 text-white' : 'bg-white/5 border-white/10 hover:border-white/20 text-gray-400'}`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs font-medium">{goal}</span>
                                                        {formData.goal === goal && <Check size={14} className="text-blue-400" />}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-sm font-medium text-white block">Difficulty Preference</label>
                                        <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                                            {['Easy', 'Medium', 'Hard'].map((diff) => (
                                                <button
                                                    key={diff}
                                                    onClick={() => setFormData({ ...formData, difficulty: diff })}
                                                    className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${formData.difficulty === diff ? 'bg-white/10 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                                                >
                                                    {diff}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-sm font-medium text-white block">Focus Topics</label>
                                    <div className="flex flex-wrap gap-2">
                                        {['DSA', 'Aptitude', 'Core Subjects', 'System Design', 'Interview Prep', 'Mock Tests'].map((topic) => (
                                            <button
                                                key={topic}
                                                onClick={() => toggleTopic(topic)}
                                                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${formData.topics?.includes(topic) ? 'bg-purple-500/20 border-purple-500/50 text-purple-200' : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'}`}
                                            >
                                                {topic}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="p-4 rounded-xl border border-orange-500/20 bg-orange-500/5 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2.5 rounded-lg bg-orange-500/10 text-orange-500">
                                            <Zap size={18} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-white">Daily Target</p>
                                            <p className="text-xs text-gray-500">Problems to solve per day</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 bg-black/40 rounded-lg p-1 border border-white/10">
                                        <button
                                            onClick={() => setFormData(p => ({ ...p, dailyTarget: Math.max(1, p.dailyTarget - 1) }))}
                                            className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white/10 text-gray-400"
                                        >-</button>
                                        <span className="text-sm font-bold text-white w-4 text-center">{formData.dailyTarget}</span>
                                        <button
                                            onClick={() => setFormData(p => ({ ...p, dailyTarget: Math.min(10, p.dailyTarget + 1) }))}
                                            className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white/10 text-white"
                                        >+</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'notifications' && (
                            <div className="space-y-6 relative z-10">
                                <div className="flex items-center justify-between pb-6 border-b border-white/5">
                                    <div>
                                        <h2 className="text-xl font-bold text-white mb-1">Notifications</h2>
                                        <p className="text-sm text-gray-400">Choose what you want to be notified about.</p>
                                    </div>
                                    <Button onClick={handleSave} disabled={saving} className="bg-white text-black hover:bg-gray-200 border-none">
                                        <Save size={16} className="mr-2" /> {saving ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                </div>

                                {[
                                    { id: 'dailyReminder', title: 'Daily Reminder', desc: 'Get reminded to maintain your streak at 8 PM' },
                                    { id: 'weeklyReport', title: 'Weekly Progress Report', desc: 'Summary of your performance every Sunday' },
                                    { id: 'newProblems', title: 'New Problems', desc: 'Notify when new problems are added' },
                                    { id: 'marketing', title: 'Marketing Emails', desc: 'Tips, offers, and platform updates' }
                                ].map((item) => (
                                    <div key={item.id} className="flex items-center justify-between py-2">
                                        <div>
                                            <p className="text-sm font-medium text-white">{item.title}</p>
                                            <p className="text-xs text-gray-500">{item.desc}</p>
                                        </div>
                                        <div
                                            onClick={() => toggleNotification(item.id)}
                                            className={`w-10 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${formData.notifications?.[item.id] ? 'bg-green-500' : 'bg-gray-700'}`}
                                        >
                                            <div className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ${formData.notifications?.[item.id] ? 'translate-x-4' : ''}`} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'general' && (
                            <div className="space-y-8 relative z-10">
                                <div className="flex items-center justify-between pb-6 border-b border-white/5">
                                    <div>
                                        <h2 className="text-xl font-bold text-white mb-1">General Settings</h2>
                                        <p className="text-sm text-gray-400">Configure appearance and language.</p>
                                    </div>
                                    <Button onClick={handleSave} disabled={saving} className="bg-white text-black hover:bg-gray-200 border-none">
                                        <Save size={16} className="mr-2" /> {saving ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-sm font-medium text-white block">Appearance</label>
                                    <div className="grid grid-cols-3 gap-4">
                                        {[
                                            { name: 'dark', label: 'Dark', icon: Moon },
                                            { name: 'light', label: 'Light', icon: Sun },
                                            { name: 'system', label: 'System', icon: Monitor }
                                        ].map((t) => (
                                            <button
                                                key={t.name}
                                                onClick={() => setFormData({ ...formData, theme: t.name })}
                                                className={`flex flex-col items-center gap-3 p-4 rounded-xl border transition-all ${formData.theme === t.name ? 'bg-blue-600/10 border-blue-500 text-white' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}
                                            >
                                                <t.icon size={20} />
                                                <span className="text-xs font-medium">{t.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between py-4 border-t border-white/5">
                                    <div>
                                        <p className="text-sm font-medium text-white">Animations</p>
                                        <p className="text-xs text-gray-500">Enable smooth transitions and effects</p>
                                    </div>
                                    <div className="w-10 h-6 flex items-center rounded-full p-1 cursor-pointer bg-blue-500">
                                        <div className="bg-white w-4 h-4 rounded-full shadow-md transform translate-x-4 duration-300" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-white block">Language</label>
                                    <select
                                        value={formData.language}
                                        onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-blue-500/50 cursor-pointer"
                                    >
                                        <option>English (United States)</option>
                                        <option>Hindi</option>
                                        <option>Spanish</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        {activeTab === 'subscription' && (
                            <div className="space-y-8 relative z-10">
                                <div className="border-b border-white/5 pb-6">
                                    <h2 className="text-xl font-bold text-white mb-1">Subscription</h2>
                                    <p className="text-sm text-gray-400">Manage your billing and plan details.</p>
                                </div>

                                {/* Dynamic Subscription Card */}
                                <div className={`p-6 rounded-2xl border relative overflow-hidden ${userData?.isPro ? 'bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/20' : 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20'}`}>
                                    <div className="absolute top-0 right-0 p-4 opacity-10">
                                        <CreditCard size={120} className={userData?.isPro ? "text-amber-500" : "text-blue-500"} />
                                    </div>
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${userData?.isPro ? 'bg-amber-500 text-black' : 'bg-blue-500 text-white'}`}>
                                                Current Plan
                                            </span>
                                        </div>
                                        <h3 className="text-2xl font-bold text-white mb-2">{userData?.isPro ? "CodeHub Pro" : "CodeHub Free"}</h3>
                                        <p className={`${userData?.isPro ? "text-amber-200/70" : "text-blue-200/70"} text-sm mb-6 max-w-sm`}>
                                            {userData?.isPro
                                                ? "You have full access to all premium features, unlimited submissions, and advanced analytics."
                                                : "Upgrade to Pro to unlock unlimited submissions, advanced analytics, and premium solutions."
                                            }
                                        </p>

                                        <div className="flex items-center gap-4">
                                            <button className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors shadow-lg ${userData?.isPro ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-amber-500/20' : 'bg-blue-500 hover:bg-blue-400 text-white shadow-blue-500/20'}`} onClick={() => navigate('/pricing')}>
                                                {userData?.isPro ? "Manage Billing" : "Upgrade Now"}
                                            </button>
                                            {userData?.isPro && (
                                                <button className="px-4 py-2 bg-transparent hover:bg-white/5 text-amber-500 border border-amber-500/30 text-sm font-semibold rounded-lg transition-colors">
                                                    Cancel Subscription
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-sm font-medium text-white mb-4">Billing History</h4>
                                    <div className="rounded-xl border border-white/10 overflow-hidden">
                                        {userData?.billingHistory && userData.billingHistory.length > 0 ? (
                                            userData.billingHistory.map((invoice, i) => (
                                                <div key={i} className="flex items-center justify-between p-4 border-b border-white/5 last:border-0 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                                                    <div className="flex items-center gap-4">
                                                        <div className="p-2 rounded-lg bg-green-500/10 text-green-500">
                                                            <Check size={16} />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-white">{invoice.plan}</p>
                                                            <p className="text-xs text-gray-500">{new Date(invoice.date).toLocaleDateString()}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm font-bold text-white">{invoice.amount}</p>
                                                        <p className="text-xs text-blue-400 cursor-pointer hover:underline">Download</p>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-6 text-center text-gray-500 text-sm">
                                                No billing history available.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Settings;

