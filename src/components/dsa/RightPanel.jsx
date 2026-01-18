import { dsaTopics } from '../../data/dsaMockData';
import { CheckCircle2, Trophy, Flame } from 'lucide-react';

export default function RightPanel() {
    // Static for now as requested - specifically duplication of Beginner/Progress
    const topic = dsaTopics[0]; // Beginner

    return (
        <div className="hidden xl:flex w-80 flex-shrink-0 flex-col gap-6 sticky top-24 h-[calc(100vh-100px)]">

            {/* Daily Goal Card */}
            <div className="p-5 rounded-2xl bg-[#0a0a0a]/60 backdrop-blur-xl border border-white/10 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 opacity-10">
                    <Flame size={80} />
                </div>
                <div className="relative z-10">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Daily Goal</h3>
                    <div className="flex items-baseline gap-1 mb-2">
                        <span className="text-3xl font-bold text-white">2</span>
                        <span className="text-gray-500">/ 3 solved</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mb-3">
                        <div className="w-2/3 h-full bg-gradient-to-r from-orange-500 to-red-500 shadow-[0_0_8px_#f97316]" />
                    </div>
                    <p className="text-xs text-gray-400">Keep up the streak! 🔥 12 days</p>
                </div>
            </div>

            {/* Mini Progress Card (The "Duplicate" requested) */}
            <div className="p-5 rounded-2xl bg-[#0a0a0a]/60 backdrop-blur-xl border border-white/10 shadow-lg flex flex-col gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                        <topic.icon size={20} className="text-blue-400" />
                    </div>
                    <div>
                        <h4 className="font-bold text-white text-sm">{topic.label}</h4>
                        <span className="text-xs text-gray-400">{topic.solved} / {topic.total} Solved</span>
                    </div>
                </div>

                {/* Compact List */}
                <div className="space-y-3">
                    {topic.questions.slice(0, 3).map(q => (
                        <div key={q.id} className="flex items-center justify-between text-sm group cursor-pointer">
                            <span className="text-gray-400 group-hover:text-gray-200 transition-colors truncate max-w-[180px]">
                                {q.title}
                            </span>
                            {q.solved ? (
                                <CheckCircle2 size={14} className="text-green-500 flex-shrink-0" />
                            ) : (
                                <div className="w-3.5 h-3.5 rounded-full border border-gray-600" />
                            )}
                        </div>
                    ))}
                </div>

                <button className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-xs font-medium text-gray-300 transition-all">
                    View Detailed Stats
                </button>
            </div>

            {/* Leaderboard Snippet */}
            <div className="bg-[#0a0a0a]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-5 overflow-hidden">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Top Solvers</h3>
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-3">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${i === 1 ? 'bg-yellow-500 text-black shadow-yellow-500/50' :
                                    i === 2 ? 'bg-gray-300 text-black' : 'bg-amber-700 text-white'
                                }`}>
                                {i}
                            </div>
                            <div className="w-6 h-6 rounded-full bg-gray-700" />
                            <span className="text-xs text-gray-300">User_{9000 + i}</span>
                            <span className="ml-auto text-xs font-mono text-blue-400">{1500 - (i * 50)} XP</span>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
}
