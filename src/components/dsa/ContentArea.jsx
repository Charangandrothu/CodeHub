import { useParams } from 'react-router-dom';
import { dsaTopics } from '../../data/dsaMockData';
import { CheckCircle2, ChevronRight, Trophy } from 'lucide-react';

export default function ContentArea() {
    const { topicId } = useParams();
    const currentId = topicId || 'beginner';
    const topic = dsaTopics.find(t => t.id === currentId) || dsaTopics[0];

    const questions = topic.questions && topic.questions.length > 0 ? topic.questions : [
        // Fallback for empty topics so UI doesn't look broken during demo
        { id: 101, title: 'Demo Question 1', tags: ['Demo'], difficulty: 'Medium', solved: false },
        { id: 102, title: 'Demo Question 2', tags: ['Demo'], difficulty: 'Easy', solved: false },
    ];

    return (
        <div className="flex-1 min-w-0 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Data Structures & Algorithms</h1>
                <p className="text-gray-400">Practice DSA topics from beginner to advanced level</p>
            </div>

            {/* Main Progress Card */}
            <div className="relative p-6 rounded-2xl bg-[#0a0a0a]/60 backdrop-blur-xl border border-white/10 shadow-lg overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <topic.icon size={120} />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row gap-6 items-center">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center border border-white/10 shadow-[0_0_15px_rgba(168,85,247,0.15)]">
                        <topic.icon size={32} className="text-purple-400" />
                    </div>

                    <div className="flex-1 w-full">
                        <div className="flex justify-between items-end mb-2">
                            <h2 className="text-xl font-bold text-white">{topic.label}</h2>
                            <span className="text-sm font-medium text-purple-400">{topic.solved} / {topic.total} Solved</span>
                        </div>

                        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-[0_0_10px_#c084fc]"
                                style={{ width: `${(topic.solved / topic.total) * 100}%` }}
                            />
                        </div>

                        <div className="flex gap-4 mt-3">
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_5px_#22c55e]" />
                                <span className="text-xs text-gray-400">Easy ({topic.solved})</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-yellow-500/30" />
                                <span className="text-xs text-gray-500">Medium</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-red-500/30" />
                                <span className="text-xs text-gray-500">Hard</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Question List */}
            <div className="rounded-2xl bg-[#0a0a0a]/60 backdrop-blur-xl border border-white/10 shadow-lg overflow-hidden">
                <div className="p-4 border-b border-white/5 flex justify-between items-center">
                    <h3 className="font-semibold text-white">Recommended Problems</h3>
                    <button className="text-xs text-purple-400 hover:text-purple-300 font-medium bg-purple-500/10 px-3 py-1.5 rounded-lg transition-colors border border-purple-500/20">
                        View All
                    </button>
                </div>

                <div className="divide-y divide-white/5">
                    {questions.map((q) => (
                        <div
                            key={q.id}
                            className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors group cursor-pointer"
                        >
                            <div className="space-y-1">
                                <h4 className="font-medium text-gray-200 group-hover:text-purple-400 transition-colors">
                                    {q.title}
                                </h4>
                                <div className="flex gap-2">
                                    {q.tags.map(tag => (
                                        <span key={tag} className="text-[10px] uppercase tracking-wider text-gray-500 border border-white/5 px-1.5 py-0.5 rounded bg-white/5">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <span className={`px-2 py-1 rounded text-xs font-medium border ${q.difficulty === 'Easy' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                    q.difficulty === 'Medium' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                                        'bg-red-500/10 text-red-400 border-red-500/20'
                                    }`}>
                                    {q.difficulty}
                                </span>
                                {q.solved && (
                                    <CheckCircle2 size={18} className="text-green-500" />
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-3 border-t border-white/5 bg-white/[0.02]">
                    <button className="w-full py-2 flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
                        View All {topic.label} Problems
                        <ChevronRight size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
}
