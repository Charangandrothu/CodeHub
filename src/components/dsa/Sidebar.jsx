import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Rocket, Box, GitMerge, Search, Layers, Database, Hash, Code, Puzzle, Filter, Code2, LogOut, User, Settings, Sparkles, Crown, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import logo_img from '../../assets/logo_img.png';
import { API_URL } from '../../config';

export const TOPICS = [
    { id: 'patterns', label: 'Patterns', icon: Puzzle, color: '#a855f7' },
    { id: 'sorting', label: 'Sorting', icon: Filter, color: '#f97316' },
    { id: 'beginner', label: 'Beginner', icon: Rocket, color: '#22c55e' },
    { id: 'arrays', label: 'Arrays', icon: Box, color: '#3b82f6' },
    { id: 'strings', label: 'Strings', icon: Box, color: '#ec4899' },
    { id: 'binary-search', label: 'Binary Search', icon: Search, color: '#06b6d4' },
    { id: 'recursion-backtracking', label: 'Recursion', icon: GitMerge, color: '#ef4444' },
    { id: 'linked-lists', label: 'Linked Lists', icon: Layers, color: '#14b8a6' },
    { id: 'stacks-queues', label: 'Stacks & Queues', icon: Database, color: '#6366f1' },
    { id: 'hashing', label: 'Hashing', icon: Hash, color: '#eab308' },
    { id: 'trees', label: 'Trees & Graphs', icon: GitMerge, color: '#10b981' },
    { id: 'dp', label: 'Dynamic Programming', icon: Code, color: '#f43f5e' },
];

export default function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const { currentUser, userData, logout } = useAuth();
    const [topicStats, setTopicStats] = useState({});

    const isActive = (id) => location.pathname.includes(id) || (location.pathname === '/dsa' && id === 'beginner');

    useEffect(() => {
        const fetchStats = async () => {
            if (currentUser) {
                try {
                    const res = await fetch(`${API_URL}/api/users/topic-progress/${currentUser.uid}`);
                    if (res.ok) {
                        const data = await res.json();
                        setTopicStats(data);
                    }
                } catch (err) {
                    console.error("Failed to fetch topic stats:", err);
                }
            }
        };
        fetchStats();
    }, [currentUser]);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Failed to log out', error);
        }
    };

    return (
        <motion.aside
            initial={{ x: -280, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-72 h-screen fixed top-0 left-0 flex flex-col bg-[#0a0a0a] border-r border-white/5 z-50 p-6"
        >
            {/* Logo Section */}
            <div
                className="flex items-center gap-3 mb-10 px-2 shrink-0 cursor-pointer group"
                onClick={() => navigate('/dashboard')}
            >
                <img
                    src={logo_img}
                    alt="CodeHubx Logo"
                    className="w-9 h-9 rounded-xl shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300 object-cover"
                />
                <div>
                    <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-400 tracking-tight">
                        CodeHubx
                    </h1>
                    <p className="text-[10px] text-gray-500 font-medium tracking-wider uppercase group-hover:text-blue-400 transition-colors">Pro </p>
                </div>
            </div>

            {/* Upgrade & Daily Goal Section */}
            {userData && !userData.isPro && (
                <div className="px-2 mb-6 shrink-0 space-y-4">
                    {/* Upgrade Badge */}
                    <motion.button
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate('/pricing')}
                        className="relative w-full flex items-center justify-center gap-2 px-3 py-2 rounded-full bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-amber-500/10 border border-amber-500/30 shadow-[0_0_15px_-3px_rgba(245,158,11,0.2)] group overflow-hidden cursor-pointer"
                    >
                        <motion.div
                            animate={{ x: ['-200%', '200%'] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear", repeatDelay: 2 }}
                            className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-amber-400/20 to-transparent skew-x-12 blur-sm"
                        />
                        <Sparkles size={14} className="text-amber-400" />
                        <span className="text-xs font-semibold bg-gradient-to-r from-amber-200 to-yellow-400 bg-clip-text text-transparent group-hover:text-yellow-300 transition-colors">
                            Upgrade to Pro
                        </span>
                        <Crown size={14} className="text-amber-400 fill-amber-400/20" />
                    </motion.button>


                </div>
            )}

            {/* Navigation Topics */}
            <div className="flex-1 overflow-y-auto custom-scrollbar -mx-2 px-2 space-y-1">
                <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-4 px-2">
                    Topics
                </h3>
                {TOPICS.map((topic) => {
                    const active = isActive(topic.id);
                    const Icon = topic.icon;
                    // Dynamic Active Style
                    const activeStyle = active ? {
                        color: topic.color || '#3b82f6',
                        borderColor: `${topic.color || '#3b82f6'}40`,
                    } : {};

                    return (
                        <button
                            key={topic.id}
                            onClick={() => navigate(`/dsa/${topic.id}`)}
                            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-300 group relative overflow-hidden ${active
                                ? 'text-white border' // Border color handled by style
                                : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                                }`}
                            style={activeStyle}
                        >
                            {active && (
                                <motion.div
                                    layoutId="active-bg"
                                    className="absolute inset-0 rounded-xl"
                                    initial={false}
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                    style={{ backgroundColor: `${topic.color || '#3b82f6'}15` }}
                                />
                            )}
                            <Icon
                                size={18}
                                className={`relative z-10 transition-colors duration-300`}
                                style={{ color: active ? (topic.color || '#3b82f6') : undefined }}
                            />
                            <span className="relative z-10 truncate flex-1 text-left">{topic.label}</span>

                            {/* Stats Badge */}
                            {topicStats[topic.id] && (
                                <span
                                    className={`relative z-10 text-[10px] font-medium px-1.5 py-0.5 rounded border transition-colors ${!active ? 'text-gray-600 bg-white/5 border-white/5 group-hover:text-gray-400 group-hover:border-white/10' : ''
                                        }`}
                                    style={active ? {
                                        color: topic.color || '#3b82f6',
                                        backgroundColor: `${topic.color || '#3b82f6'}15`,
                                        borderColor: `${topic.color || '#3b82f6'}30`
                                    } : {}}
                                >
                                    {topicStats[topic.id].solved}/{topicStats[topic.id].total}
                                </span>
                            )}

                            {active && (
                                <div
                                    className="ml-2 w-1.5 h-1.5 rounded-full relative z-10 shadow-[0_0_8px]"
                                    style={{
                                        backgroundColor: topic.color || '#3b82f6',
                                        boxShadow: `0 0 8px ${topic.color || '#3b82f6'}`
                                    }}
                                />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* User Profile Footer */}
            <div className="mt-6 pt-6 border-t border-white/10 shrink-0">
                <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group">
                    <img
                        src={userData?.photoURL || currentUser?.photoURL || `https://api.dicebear.com/9.x/adventurer/svg?seed=${userData?.username || currentUser?.email?.split('@')[0] || 'User'}`}
                        alt="Profile"
                        className="w-10 h-10 rounded-full border-2 border-white/10 group-hover:border-blue-500/50 transition-colors object-cover"
                        onClick={() => {
                            if (!userData?.profileCompleted) {
                                navigate('/complete-profile');
                            } else {
                                navigate(`/${userData?.username}`);
                            }
                        }}
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `https://api.dicebear.com/9.x/adventurer/svg?seed=${userData?.username || currentUser?.email?.split('@')[0] || 'User'}`;
                        }}
                    />
                    <div className="flex-1 min-w-0" onClick={() => {
                        if (!userData?.profileCompleted) {
                            navigate('/complete-profile');
                        } else {
                            navigate(`/${userData?.username}`);
                        }
                    }}>
                        <h4 className="text-sm font-semibold text-white truncate group-hover:text-blue-400 transition-colors">
                            {userData?.displayName || currentUser?.displayName || 'User'}
                        </h4>
                        <p className="text-xs text-gray-500 truncate">@{userData?.username || 'user'}</p>
                    </div>
                    {userData?.role === 'admin' && (
                        <button
                            onClick={() => navigate('/admin')}
                            className="p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg transition-all cursor-pointer"
                            title="Admin Dashboard"
                        >
                            <Shield size={18} />
                        </button>
                    )}
                    <button
                        onClick={() => navigate('/settings')}
                        className="p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg transition-all cursor-pointer"
                        title="Settings"
                    >
                        <Settings size={18} />
                    </button>
                </div>
            </div>
        </motion.aside>
    );
}
