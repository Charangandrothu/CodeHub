import React from 'react';
import { MonitorOff } from 'lucide-react';

const Maintenance = () => {
    return (
        <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-4 text-center">
            {/* Background Glow */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 max-w-md w-full bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl shadow-2xl">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-6 animate-pulse">
                    <MonitorOff className="text-amber-500" size={32} />
                </div>

                <h1 className="text-3xl font-bold text-white mb-2">Under Maintenance</h1>
                <p className="text-gray-400 mb-8">
                    We are currently performing scheduled maintenance to improve our services.
                    <br />Please check back soon.
                </p>

                <div className="flex items-center justify-center gap-2 text-xs text-amber-500/60 font-mono border border-amber-500/10 bg-amber-500/5 px-3 py-1.5 rounded-full">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500/60 animate-pulse" />
                    System Status: Maintenance Mode
                </div>
            </div>

            <p className="mt-8 text-xs text-gray-600">
                &copy; {new Date().getFullYear()} CodeHubX. All rights reserved.
            </p>
        </div>
    );
};

export default Maintenance;
