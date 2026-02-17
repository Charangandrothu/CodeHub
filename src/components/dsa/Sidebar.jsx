import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Rocket, Box, GitMerge, Search, Layers, Database, Hash, Code, Puzzle, Filter, Settings, Sparkles, Crown, Shield } from 'lucide-react';
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
  const { currentUser, userData } = useAuth();
  const [topicStats, setTopicStats] = useState({});

  const isActive = (id) => location.pathname.includes(id) || (location.pathname === '/dsa' && id === 'beginner');

  useEffect(() => {
    const fetchStats = async () => {
      if (!currentUser) return;
      try {
        const res = await fetch(`${API_URL}/api/users/topic-progress/${currentUser.uid}`);
        if (res.ok) setTopicStats(await res.json());
      } catch (err) {
        console.error('Failed to fetch topic stats:', err);
      }
    };
    fetchStats();
  }, [currentUser]);

  return (
    <motion.aside
      initial={{ x: -36, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.35 }}
      className="fixed left-0 top-0 z-50 flex h-screen w-72 flex-col border-r border-app-border bg-app-panel p-5 backdrop-blur-xl"
    >
      <button className="mb-6 flex items-center gap-3 rounded-2xl border border-app-border bg-app-panel-strong p-3 text-left" onClick={() => navigate('/dashboard')}>
        <img src={logo_img} alt="CodeHubx Logo" className="h-10 w-10 rounded-xl object-cover" />
        <div>
          <h1 className="text-lg font-bold text-app-text">CodeHubx</h1>
          <p className="text-[11px] uppercase tracking-[0.2em] text-app-muted">DSA Workspace</p>
        </div>
      </button>

      {userData && !userData.isPro && (
        <button onClick={() => navigate('/pricing')} className="mb-4 w-full rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 px-3 py-2 text-sm font-semibold text-amber-500 flex items-center justify-center gap-2">
          <Sparkles size={14} /> Upgrade to Pro <Crown size={14} />
        </button>
      )}

      <div className="custom-scrollbar flex-1 space-y-1 overflow-y-auto pr-1">
        {TOPICS.map((topic, index) => {
          const Icon = topic.icon;
          const active = isActive(topic.id);
          return (
            <motion.button
              key={topic.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              onClick={() => navigate(`/dsa/${topic.id}`)}
              className={`relative w-full rounded-2xl border px-3 py-3 text-left text-sm font-medium transition-all ${active ? 'border-transparent text-white' : 'border-app-border text-app-muted hover:bg-app-primary-soft hover:text-app-text'}`}
              style={active ? { background: `linear-gradient(90deg, ${topic.color}, #4f46e5)` } : {}}
            >
              <div className="flex items-center gap-3">
                <Icon size={16} />
                <span className="flex-1 truncate">{topic.label}</span>
                {topicStats[topic.id] && (
                  <span className={`rounded-lg px-2 py-0.5 text-[11px] ${active ? 'bg-white/20' : 'bg-app-primary-soft text-app-muted'}`}>
                    {topicStats[topic.id].solved}/{topicStats[topic.id].total}
                  </span>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      <div className="mt-4 border-t border-app-border pt-4 flex items-center justify-between">
        <button onClick={() => navigate('/settings')} className="rounded-xl border border-app-border p-2 text-app-muted hover:bg-app-primary-soft hover:text-app-text"><Settings size={16} /></button>
        {userData?.role === 'admin' && <button onClick={() => navigate('/admin')} className="rounded-xl border border-app-border p-2 text-app-muted hover:bg-app-primary-soft hover:text-app-text"><Shield size={16} /></button>}
      </div>
    </motion.aside>
  );
}
