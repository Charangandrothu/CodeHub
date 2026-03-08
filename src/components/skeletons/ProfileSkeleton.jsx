import React from 'react';
import { Skeleton } from '../ui/Skeleton';

const ProfileSkeleton = () => {
    return (
        <div className="min-h-screen bg-[#0a0a0a] pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-[#0a0a0a] to-[#0a0a0a] overflow-x-hidden">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Left Sidebar Column - Profile Card */}
                <div className="lg:col-span-4 xl:col-span-3 lg:sticky lg:top-10 h-fit">
                    <aside className="relative w-full max-w-[320px] overflow-hidden rounded-3xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]">
                        <div className="relative z-10 flex flex-col p-6 space-y-6">

                            {/* Top Section */}
                            <div className="flex flex-col items-center justify-center">
                                <Skeleton className="w-24 h-24 rounded-full mb-4" />
                                <Skeleton className="w-32 h-6 rounded-md mb-2" />
                                <Skeleton className="w-24 h-4 rounded-md mb-3" />
                                <Skeleton className="w-28 h-6 rounded-full" />
                            </div>

                            {/* Info List */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <Skeleton className="w-9 h-9 rounded-lg" />
                                    <Skeleton className="w-40 h-4 rounded-md" />
                                </div>
                            </div>

                            {/* Social Links Row */}
                            <div className="flex items-center justify-center gap-3 py-2">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <Skeleton key={i} className="w-10 h-10 rounded-xl" />
                                ))}
                            </div>

                            {/* Skills Tags */}
                            <div className="pt-2 border-t border-white/10 w-full">
                                <Skeleton className="w-16 h-4 rounded-md mb-3" />
                                <div className="flex flex-wrap gap-2">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <Skeleton key={i} className="w-16 h-6 rounded-md" />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>

                {/* Right Content Column */}
                <div className="lg:col-span-8 xl:col-span-9 space-y-6">

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-xl flex items-center gap-4">
                                <Skeleton className="w-12 h-12 rounded-xl" />
                                <div className="space-y-2">
                                    <Skeleton className="w-24 h-3 rounded-md" />
                                    <Skeleton className="w-16 h-6 rounded-md" />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Submission Heatmap Section */}
                    <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
                        <div className="flex items-center justify-between mb-6">
                            <Skeleton className="w-48 h-6 rounded-md" />
                            <Skeleton className="w-32 h-4 rounded-md" />
                        </div>
                        <Skeleton className="w-full h-32 rounded-xl" />
                    </div>

                    {/* Recent Activity / Solved Problems */}
                    <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
                        <div className="flex items-center gap-3 mb-6">
                            <Skeleton className="w-10 h-10 rounded-lg" />
                            <Skeleton className="w-40 h-6 rounded-md" />
                        </div>

                        <div className="space-y-4">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/5">
                                    <div className="flex items-center gap-4 w-full">
                                        <Skeleton className="w-10 h-10 rounded-full" />
                                        <div className="space-y-2 w-full">
                                            <Skeleton className="w-64 h-4 rounded-md" />
                                            <div className="flex gap-2">
                                                <Skeleton className="w-16 h-4 rounded-full" />
                                                <Skeleton className="w-24 h-4 rounded-full" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ProfileSkeleton;
