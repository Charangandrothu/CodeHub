import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Rocket, Box, GitMerge, Search, Layers, Database, Hash, Code, Puzzle, Filter, Code2, LogOut, User, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import logo_img from '../../assets/logo_img.png';
import { API_URL } from '../../config';

const TOPICS = [
    { id: 'patterns', label: 'Patterns', icon: Puzzle },
    { id: 'sorting', label: 'Sorting', icon: Filter },
    { id: 'beginner', label: 'Beginner', icon: Rocket },
    { id: 'arrays', label: 'Arrays', icon: Box },
    { id: 'strings', label: 'Strings', icon: Box },
    { id: 'binary-search', label: 'Binary Search', icon: Search },
    { id: 'recursion-backtracking', label: 'Recursion', icon: GitMerge },
    { id: 'linked-lists', label: 'Linked Lists', icon: Layers },
    { id: 'stacks-queues', label: 'Stacks & Queues', icon: Database },
    { id: 'hashing', label: 'Hashing', icon: Hash },
    { id: 'trees', label: 'Trees & Graphs', icon: GitMerge },
    { id: 'dp', label: 'Dynamic Programming', icon: Code },
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
        <aside className="w-72 h-screen fixed top-0 left-0 flex flex-col bg-[#0a0a0a] border-r border-white/5 z-50 p-6">
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

            {/* Navigation Topics */}
            <div className="flex-1 overflow-y-auto custom-scrollbar -mx-2 px-2 space-y-1">
                <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-4 px-2">
                    Topics
                </h3>
                {TOPICS.map((topic) => {
                    const active = isActive(topic.id);
                    const Icon = topic.icon;

                    return (
                        <button
                            key={topic.id}
                            onClick={() => navigate(`/dsa/${topic.id}`)}
                            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-300 group relative overflow-hidden ${active
                                ? 'bg-blue-600/10 text-white border border-blue-500/30'
                                : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                                }`}
                        >
                            {active && (
                                <motion.div
                                    layoutId="active-bg"
                                    className="absolute inset-0 bg-blue-600/10 rounded-xl"
                                    initial={false}
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                />
                            )}
                            <Icon
                                size={18}
                                className={`relative z-10 transition-colors duration-300 ${active ? 'text-blue-400' : 'text-gray-500 group-hover:text-gray-300'}`}
                            />
                            <span className="relative z-10 truncate flex-1 text-left">{topic.label}</span>

                            {/* Stats Badge */}
                            {topicStats[topic.id] && (
                                <span className={`relative z-10 text-[10px] font-medium px-1.5 py-0.5 rounded border transition-colors ${active
                                    ? 'text-blue-300 bg-blue-500/20 border-blue-500/30'
                                    : 'text-gray-600 bg-white/5 border-white/5 group-hover:text-gray-400 group-hover:border-white/10'
                                    }`}>
                                    {topicStats[topic.id].solved}/{topicStats[topic.id].total}
                                </span>
                            )}

                            {active && (
                                <div className="ml-2 w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_#60a5fa] relative z-10" />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* User Profile Footer */}
            <div className="mt-6 pt-6 border-t border-white/10 shrink-0">
                <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group">
                    <img
                        src={userData?.photoURL || currentUser?.photoURL || `https://ui-avatars.com/api/?name=${userData?.displayName || 'User'}&background=random`}
                        alt="Profile"
                        className="w-10 h-10 rounded-full border-2 border-white/10 group-hover:border-blue-500/50 transition-colors"
                        onClick={() => navigate(`/${userData?.username}`)}
                    />
                    <div className="flex-1 min-w-0" onClick={() => navigate(`/${userData?.username}`)}>
                        <h4 className="text-sm font-semibold text-white truncate group-hover:text-blue-400 transition-colors">
                            {userData?.displayName || currentUser?.displayName || 'User'}
                        </h4>
                        <p className="text-xs text-gray-500 truncate">@{userData?.username || 'user'}</p>
                    </div>
                    <button
                        onClick={() => navigate('/settings')}
                        className="p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg transition-all cursor-pointer"
                        title="Settings"
                    >
                        <Settings size={18} />
                    </button>
                </div>
            </div>
        </aside>
    );
}
