import { useNavigate, useLocation } from 'react-router-dom';
import { dsaTopics } from '../../data/dsaMockData';

export default function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (id) => location.pathname.includes(id) || (location.pathname === '/dsa' && id === 'beginner');

    return (
        <div className="w-64 flex-shrink-0 flex flex-col gap-2 h-[calc(100vh-100px)] sticky top-24">
            <div className="p-4 rounded-2xl bg-[#0a0a0a]/60 backdrop-blur-xl border border-white/10 shadow-xl overflow-y-auto custom-scrollbar">
                <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-4 px-2">
                    Topics
                </h3>
                <div className="space-y-1">
                    {dsaTopics.map((topic) => {
                        const active = isActive(topic.id);
                        const Icon = topic.icon;

                        return (
                            <button
                                key={topic.id}
                                onClick={() => navigate(`/dsa/${topic.id}`)}
                                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-300 group ${active
                                    ? 'bg-purple-600/10 text-white border border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                                    }`}
                            >
                                <Icon
                                    size={18}
                                    className={`transition-colors duration-300 ${active ? 'text-purple-400' : 'text-gray-500 group-hover:text-gray-300'
                                        }`}
                                />
                                <span className="truncate">{topic.label}</span>
                                {active && (
                                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_8px_#c084fc]" />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
