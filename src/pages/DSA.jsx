import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { motion } from 'framer-motion';
import Sidebar from '../components/dsa/Sidebar';
import ContentArea from '../components/dsa/ContentArea';
import RightPanel from '../components/dsa/RightPanel';

export default function DSA() {
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[#0a0a0a]">
            <div className="md:hidden fixed top-6 left-4 z-[55]">
                <button
                    onClick={() => setMobileSidebarOpen((prev) => !prev)}
                    className="h-10 w-10 inline-flex items-center justify-center rounded-xl border border-white/15 bg-[#0a0a0a]/90 backdrop-blur text-white"
                    aria-label={mobileSidebarOpen ? 'Close topics menu' : 'Open topics menu'}
                >
                    {mobileSidebarOpen ? <X size={18} /> : <Menu size={18} />}
                </button>
            </div>

            <Sidebar isMobileOpen={mobileSidebarOpen} onCloseMobile={() => setMobileSidebarOpen(false)} />
            <div className="md:ml-72 p-6 lg:p-8 flex gap-8 max-w-[1920px] max-md:flex-col max-md:gap-4 max-md:p-4 sm:max-md:p-6">
                <motion.div
                    className="flex-1 min-w-0"
                    initial={{ opacity: 0, x: 32 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.12 }}
                >
                    <ContentArea />
                </motion.div>
                <motion.div
                    className="hidden xl:block"
                    initial={{ opacity: 0, x: 48 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.22 }}
                >
                    <RightPanel />
                </motion.div>
            </div>
        </div>
    );
}
