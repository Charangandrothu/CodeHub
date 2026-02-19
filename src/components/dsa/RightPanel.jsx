import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Flame, Rocket, Star, Zap, Brain, Map, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function RightPanel() {
    const { userData } = useAuth();
    const navigate = useNavigate();

    // Calculate daily progress
    const dailyGoal = userData?.preferences?.dailyTarget || 3;
    const today = new Date().toDateString();

    const dailySolved = userData?.submissionHistory?.filter(sub =>
        new Date(sub.submittedAt).toDateString() === today && sub.verdict === 'Accepted'
    ).length || 0;

    const progressPercentage = Math.min((dailySolved / dailyGoal) * 100, 100);

    const hasRoadmap = userData?.dsaRoadmap?.isLocked;

    return (
        <div className="hidden xl:flex w-80 flex-shrink-0 flex-col gap-6 sticky top-6 h-[calc(100vh-24px)] overflow-y-auto custom-scrollbar pb-10">

            {/* Dynamic Roadmap Progress / Setup CTA */}
            {hasRoadmap ? (
                <div
                    className="relative p-6 rounded-3xl overflow-hidden border border-white/10 group flex-shrink-0 cursor-pointer transition-all duration-500 hover:border-emerald-500/40 hover:shadow-[0_0_40px_-10px_rgba(16,185,129,0.3)] hover:-translate-y-1"
                    onClick={() => navigate('/roadmap/dsa')}
                >
                    {/* Background Gradients */}
                    <div className="absolute inset-0 bg-[#0a0a0a] z-0" />
                    <div className="absolute inset-0 bg-grid-white/[0.02] bg-[length:16px_16px] z-0" />
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/10 blur-[80px] rounded-full group-hover:bg-emerald-500/20 transition-colors duration-500" />
                    <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-cyan-500/10 blur-[80px] rounded-full group-hover:bg-cyan-500/20 transition-colors duration-500" />

                    {/* Animated Border Gradient */}
                    <div className="absolute inset-0 rounded-3xl p-[1px] bg-gradient-to-br from-white/10 to-white/0 mask-linear-gradient z-[1]" />

                    <div className="relative z-10 flex flex-col h-full justify-between gap-4">
                        <div>
                            {(() => {
                                const sections = userData?.dsaRoadmap?.sections || [];
                                const totalProblems = sections.reduce((acc, sec) => acc + (sec.totalProblems || 0), 0);
                                const completedProblems = sections.reduce((acc, sec) => acc + (sec.completed || 0), 0);
                                const percent = totalProblems > 0 ? Math.round((completedProblems / totalProblems) * 100) : 0;

                                // Calculate Current Day dynamically based on TIME, not progress
                                const startDate = userData?.dsaRoadmap?.startDate;
                                let currentDay = 1;
                                let isCompleted = false;

                                if (startDate) {
                                    const start = new Date(startDate);
                                    start.setHours(0, 0, 0, 0);
                                    const today = new Date();
                                    today.setHours(0, 0, 0, 0);
                                    const diffTime = today - start;
                                    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                                    currentDay = Math.max(1, diffDays + 1);
                                } else {
                                    // Fallback to progress-based if no start date (old roadmaps)
                                    const allDays = sections.flatMap(section => section.tasks || []);
                                    if (allDays.length > 0) {
                                        allDays.sort((a, b) => a.day - b.day);
                                        const activeDayObj = allDays.find(day => day.items.some(item => !item.completed));
                                        if (activeDayObj) {
                                            currentDay = activeDayObj.day;
                                        } else {
                                            isCompleted = true;
                                            currentDay = allDays[allDays.length - 1].day;
                                        }
                                    }
                                }

                                return (
                                    <>
                                        <div className="flex justify-between items-start mb-2 relative">
                                            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-2">
                                                <Rocket size={18} />
                                            </div>
                                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold border transition-colors ${isCompleted
                                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                                : 'bg-white/5 border-white/5 text-slate-400 group-hover:text-white'}`}>
                                                {isCompleted ? 'Completed' : `Day ${currentDay}`}
                                            </span>
                                        </div>

                                        <h3 className="text-base font-bold text-white mb-1 group-hover:text-emerald-200 transition-colors">
                                            {userData?.dsaRoadmap?.daysSelected || 120} Day Plan
                                        </h3>

                                        <div className="space-y-2 mt-2">
                                            <div className="flex justify-between text-xs font-medium text-slate-400">
                                                <span>Progress</span>
                                                <span className="text-white">{percent}%</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-1000"
                                                    style={{ width: `${percent}%` }}
                                                />
                                            </div>
                                            <p className="text-[10px] text-slate-500 mt-1">
                                                {completedProblems} of {totalProblems} problems solved
                                            </p>
                                        </div>
                                    </>
                                );
                            })()}
                        </div>

                        <button className="relative w-full py-3 rounded-xl overflow-hidden group/btn bg-white text-black font-bold text-xs uppercase tracking-wider hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2">
                            Visit Roadmap
                            <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            ) : (
                <div
                    className="relative p-6 rounded-3xl overflow-hidden border border-white/10 group flex-shrink-0 cursor-pointer transition-all duration-500 hover:border-white/20 hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.1)] hover:-translate-y-1"
                    onClick={() => navigate('/roadmap/dsa')}
                >
                    {/* Background Gradients */}
                    <div className="absolute inset-0 bg-[#0a0a0a] z-0" />
                    <div className="absolute inset-0 bg-grid-white/[0.02] bg-[length:16px_16px] z-0" />
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500/10 blur-[80px] rounded-full group-hover:bg-purple-500/20 transition-colors duration-500" />
                    <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500/10 blur-[80px] rounded-full group-hover:bg-blue-500/20 transition-colors duration-500" />

                    {/* Animated Border Gradient */}
                    <div className="absolute inset-0 rounded-3xl p-[1px] bg-gradient-to-br from-white/10 to-white/0 mask-linear-gradient z-[1]" />

                    <div className="relative z-10 flex flex-col h-full justify-between gap-4">
                        <div>
                            <div className="flex justify-between items-start mb-2">
                                <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-white mb-2">
                                    <Map size={18} />
                                </div>
                                <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-white/5 border border-white/5 text-slate-400 group-hover:text-white transition-colors">
                                    Recommended
                                </span>
                            </div>

                            <h3 className="text-base font-bold text-white mb-1 group-hover:text-white transition-colors">
                                Setup Study Plan
                            </h3>
                            <p className="text-xs text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
                                Get a personalized day-by-day roadmap to master DSA efficiently.
                            </p>
                        </div>

                        <button className="relative w-full py-3 rounded-xl overflow-hidden group/btn bg-white text-black font-bold text-xs uppercase tracking-wider hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2">
                            Start Now
                            <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            )}

            {/* Premium Daily Goal Card */}
            <div className="relative p-6 rounded-3xl overflow-hidden border border-white/10 group flex-shrink-0">
                {/* Background Gradients */}
                <div className="absolute inset-0 bg-[#0a0a0a]/80 backdrop-blur-xl z-0" />
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-500/20 blur-[60px] rounded-full" />
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-500/20 blur-[60px] rounded-full" />

                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-1">Daily Goal</h3>
                            <p className="text-xs text-gray-500 font-medium">Solve {dailyGoal} problems today</p>
                        </div>
                        <div className="p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-500">
                            <Flame size={20} className={dailySolved >= dailyGoal ? "animate-pulse" : ""} />
                        </div>
                    </div>

                    <div className="flex items-end gap-2 mb-3 whitespace-nowrap">
                        <span className="text-3xl font-extrabold text-white tracking-tight">{dailySolved}</span>
                        <span className="text-sm text-gray-500 mb-1.5 font-medium">/ {dailyGoal} Solved</span>
                    </div>

                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden mb-4 border border-white/5">
                        <div
                            className="h-full bg-gradient-to-r from-orange-500 to-red-500 shadow-[0_0_12px_rgba(249,115,22,0.4)] transition-all duration-1000 ease-out"
                            style={{ width: `${progressPercentage}%` }}
                        />
                    </div>

                    <div className="flex items-center gap-2 text-xs font-medium text-gray-400 whitespace-nowrap">
                        <Zap size={14} className="text-yellow-500" />
                        <span>Current Streak: <span className="text-white ml-1">{userData?.stats?.streak || 0} Days</span></span>
                    </div>
                </div>
            </div>

            {/* Problem Sheets / Stats Cards */}
            <div className="grid gap-3">
                <div className="group cursor-pointer p-4 rounded-2xl bg-[#0a0a0a]/40 border border-white/10 hover:border-green-500/30 hover:bg-green-500/5 transition-all duration-300 backdrop-blur-md">
                    <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-green-500/10 text-green-500">
                                <Rocket size={18} />
                            </div>
                            <span className="font-semibold text-gray-200 group-hover:text-green-400 transition-colors">Beginner Friendly</span>
                        </div>
                        <span className="text-xs font-mono font-bold text-gray-500 bg-white/5 px-2 py-1 rounded-md">350</span>
                    </div>
                </div>

                <div className="group cursor-pointer p-4 rounded-2xl bg-[#0a0a0a]/40 border border-white/10 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all duration-300 backdrop-blur-md">
                    <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                                <Brain size={18} />
                            </div>
                            <span className="font-semibold text-gray-200 group-hover:text-blue-400 transition-colors">Intermediate</span>
                        </div>
                        <span className="text-xs font-mono font-bold text-gray-500 bg-white/5 px-2 py-1 rounded-md">250</span>
                    </div>
                </div>

                <div className="group cursor-pointer p-4 rounded-2xl bg-[#0a0a0a]/40 border border-white/10 hover:border-purple-500/30 hover:bg-purple-500/5 transition-all duration-300 backdrop-blur-md">
                    <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
                                <Star size={18} />
                            </div>
                            <span className="font-semibold text-gray-200 group-hover:text-purple-400 transition-colors">Advanced</span>
                        </div>
                        <span className="text-xs font-mono font-bold text-gray-500 bg-white/5 px-2 py-1 rounded-md">100</span>
                    </div>
                </div>
            </div>

            {/* Beginner Progress - Static List for now but styled better */}
            {/* <div className="p-5 rounded-3xl bg-[#0a0a0a]/60 backdrop-blur-xl border border-white/10">
                <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-white text-sm">Suggested</h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/10 text-white">Next Up</span>
                </div>

                <div className="space-y-1">
                    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors group">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-lg shadow-green-500/50" />
                            <span className="text-sm text-gray-400 group-hover:text-white truncate">Two Sum</span>
                        </div>
                        <CheckCircle2 size={14} className="text-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors group">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-lg shadow-green-500/50" />
                            <span className="text-sm text-gray-400 group-hover:text-white truncate">Valid Anagram</span>
                        </div>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors group">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-lg shadow-green-500/50" />
                            <span className="text-sm text-gray-400 group-hover:text-white truncate">Contains Duplicate</span>
                        </div>
                    </div>
                </div>
            </div> */}

        </div>
    );
}
