import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import Sidebar from '../components/dsa/Sidebar';
import ContentArea from '../components/dsa/ContentArea';
import RightPanel from '../components/dsa/RightPanel';

export default function DSA() {
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[#0a0a0a]">
            <div className="lg:hidden fixed top-24 left-4 z-[55]">
                <button
                    onClick={() => setMobileSidebarOpen((prev) => !prev)}
                    className="h-10 w-10 inline-flex items-center justify-center rounded-xl border border-white/15 bg-[#0a0a0a]/90 backdrop-blur text-white"
                    aria-label={mobileSidebarOpen ? 'Close topics menu' : 'Open topics menu'}
                >
                    {mobileSidebarOpen ? <X size={18} /> : <Menu size={18} />}
                </button>
            </div>

            <Sidebar isMobileOpen={mobileSidebarOpen} onCloseMobile={() => setMobileSidebarOpen(false)} />
            <div className="lg:ml-72 p-6 lg:p-8 flex gap-8 max-w-[1920px] max-lg:flex-col max-lg:gap-4 max-lg:p-4 sm:max-lg:p-6">
                <ContentArea />
                <RightPanel />
            </div>
        </div>
    );
}
